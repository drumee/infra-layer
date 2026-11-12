"""Isolated alpha.6 queue recovery qualification. No production mutation or SMTP egress."""
import base64
import collections
import datetime
import hashlib
import io
import json
import os
import pathlib
import re
import subprocess
import sys
import tarfile
import tempfile
import time
import uuid

HERE = pathlib.Path(__file__).resolve().parent
IMAGE = 'sha256:a02cc47d0ebca12a55759edb00757b3a8cdd00112ad4afe9a4ff7b5337ffe843'
HELPER = 'sha256:36afa984f1187ff7fef17356fa7ead13af9a756681ac4a0c234a58fdc38f47e8'
NODE = 'node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392'
SOURCE = '09b7f28bce99ba3744e31a0ee5b2dde868a9a86a'
consumer = str(pathlib.Path(sys.argv[1]).resolve())
out = pathlib.Path(sys.argv[2]).resolve()
base = pathlib.Path(tempfile.mkdtemp(prefix='postfix-restore-'))
project = 'pqr-' + uuid.uuid4().hex[:10]
ledger = []
checks = []
containers = []
networks = []
volumes = []
report = {'project':project,'retained_private_root':str(base),'source':SOURCE,'postfix_image_config_digest':IMAGE,'helper_image':HELPER,
          'production_mutations':False,'real_smtp_messages':0,'checks':checks}
frozen_sources={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in HERE.iterdir() if p.is_file()}


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def command(argv, ok=True, **kwargs):
    start = now()
    result = subprocess.run(argv,capture_output=True,timeout=120,**kwargs)
    ledger.append({'argv':list(map(str,argv)),'started_at':start,'ended_at':now(),'exit':result.returncode,
                   'stdout_sha256':sha(result.stdout),'stderr_sha256':sha(result.stderr)})
    if ok and result.returncode:
        raise RuntimeError('COMMAND_FAILED '+str(argv[:3])+' '+result.stderr.decode()[-1800:])
    return result


def docker(*args, **kwargs):
    return command(['docker',*args],**kwargs)


def check(name, value, detail=None):
    if not value:
        raise AssertionError(name)
    checks.append({'name':name,'pass':True,**({'detail':detail} if detail is not None else {})})
    print('PASS '+name,flush=True)


def wait(fn, seconds=35):
    end = time.monotonic()+seconds
    while time.monotonic()<end:
        value = fn()
        if value:
            return value
        time.sleep(.2)
    raise TimeoutError('ISOLATED_OBSERVATION_TIMEOUT')


def write(path, value, mode=0o600):
    path.write_text(json.dumps(value,indent=2)+'\n' if not isinstance(value,str) else value)
    path.chmod(mode)


def info(name):
    return json.loads(docker('inspect',name).stdout)[0]


def queue(name):
    raw = docker('exec',name,'postqueue','-c','/run/infra-mail/config','-j').stdout
    return [json.loads(line) for line in raw.splitlines()]


def correlation_map(name,messages):
    mapping=[]
    for row in queue(name):
        content=docker('exec',name,'postcat','-c','/run/infra-mail/config','-q',row['queue_id']).stdout
        match=[item for item in messages if item['message_id'].encode() in content]
        assert len(match)==1
        mapping.append({'message_id':match[0]['message_id'],'source_queue_id':match[0]['queue_id'],'restored_queue_id':row['queue_id']})
    check(name+'-one-to-one-correlation-map',len(mapping)==len(messages) and len({x['message_id'] for x in mapping})==len(messages))
    return mapping


def witness():
    return [json.loads(p.read_text()) for p in sorted((base/'witness').glob('event-*.json'))]


def accepted():
    return [row for row in witness() if row['durable_acceptance']]


def storage(cfg, volume=None, ok=True):
    request = base/('request-'+uuid.uuid4().hex+'.json')
    write(request,cfg)
    args = ['run','--rm','--network','none','--read-only','--cap-drop','ALL','--cap-add','CHOWN','--cap-add','DAC_OVERRIDE','--cap-add','FOWNER',
            '--mount',f'type=bind,source={base},target=/work','--mount',f'type=bind,source={HERE},target=/lab,readonly']
    if volume:
        args += ['--mount',f'type=volume,source={volume},target=/replacement']
    args += ['--entrypoint','python3',HELPER,'/lab/storage.py','/work/'+request.name]
    r = docker(*args,ok=ok)
    return json.loads(r.stdout),r.returncode


def inventory(source,volume=None):
    return storage({'operation':'inventory','source':source},volume)[0]


def compose_up(file,service):
    docker('compose','-p',project,'-f',str(file),'up','-d','--no-deps',service)
    name = project+'-'+service+'-1'
    containers.append(name)
    wait(lambda: info(name)['State'].get('Health',{}).get('Status')=='healthy')
    return name


def stop_mail(name,spool_source):
    docker('update','--restart=no',name)
    # Detached control avoids Docker killing the exec transport when PID1 exits.
    docker('exec','-d',name,'postfix','-c','/run/infra-mail/config','stop')
    wait(lambda: not info(name)['State']['Running'])
    current = info(name)
    check(name+'-clean-stop-no-processes',current['State']['Pid']==0 and current['State']['ExitCode']==0)
    running = docker('ps','-q').stdout.decode().split()
    writers = []
    for cid in running:
        c = info(cid)
        for mount in c['Mounts']:
            source=mount['Source'].rstrip('/')
            if mount['RW'] and (source==spool_source or spool_source.startswith(source+'/') or source.startswith(spool_source+'/')):
                writers.append(cid)
    check(name+'-no-running-writable-spool-mount',not writers)
    report.setdefault('quiescence',[]).append({'container':name,'pid':0,'running':False,'exit':current['State']['ExitCode'],
                                            'restart_policy':current['HostConfig']['RestartPolicy']['Name'],'running_writers':writers})


def fresh_volume(label):
    name = project+'-'+label
    docker('volume','create','--label','org.drumee.queue-restore.owner='+project,name)
    volumes.append(name)
    return name


def make_fixture(prepared):
    fixture = json.loads(json.dumps(prepared['compose']))
    for service in fixture['services'].values():
        for mount in service.get('volumes',[]):
            if mount['source'].startswith('./'):
                mount['source']=str(pathlib.Path(prepared['candidate'])/mount['source'][2:])
        service['restart']='no'
    for net in fixture['networks'].values():
        net.pop('external',None)
        net['external']=True
    primary = next(k for k in fixture['networks'] if k!='mail-control')
    fixture['services']['receiver']={'image':HELPER,'user':'1000:1000','entrypoint':['python3','/lab/receiver.py'],
        'read_only':True,'cap_drop':['ALL'],'networks':{primary:{'aliases':['receiver']}},'restart':'no',
        'volumes':[{'type':'bind','source':str(HERE),'target':'/lab','read_only':True},
                   {'type':'bind','source':str(base/'keys'),'target':'/keys','read_only':True},
                   {'type':'bind','source':str(base/'control'),'target':'/control','read_only':True},
                   {'type':'bind','source':str(base/'witness'),'target':'/witness','read_only':False}],
        'labels':{'org.drumee.queue-restore.owner':project}}
    return fixture,primary


def offline(fixture,volume,argv,read_only=True):
    args=['run','--rm','--network','none','--read-only','--cap-drop','ALL','--cap-add','DAC_OVERRIDE']
    if not read_only:
        args+=['--cap-add','CHOWN','--cap-add','SETUID','--cap-add','SETGID','--cap-add','FOWNER']
    for m in fixture['services']['mail']['volumes']:
        if m['target']=='/var/spool/postfix':
            args+=['--mount',f'type=volume,source={volume},target=/replacement'+(',readonly' if read_only else '')]
            # Docker volume subpath requires daemon support; use the verified physical volume path instead.
            source=json.loads(docker('volume','inspect',volume).stdout)[0]['Mountpoint']+'/spool'
            args+=['--mount',f'type=bind,source={source},target=/var/spool/postfix'+(',readonly' if read_only else '')]
        else:
            args+=['--mount',f'type=bind,source={m["source"]},target={m["target"]},readonly']
    return docker(*args,'--entrypoint',argv[0],IMAGE,*argv[1:])


def restored_service(fixture,volume,role):
    service=json.loads(json.dumps(fixture['services']['mail']))
    source=json.loads(docker('volume','inspect',volume).stdout)[0]['Mountpoint']+'/spool'
    for m in service['volumes']:
        if m['target']=='/var/spool/postfix':
            m['source']=source
    f=json.loads(json.dumps(fixture));f['services'].pop('mail');f['services'][role]=service
    file=base/(role+'.compose.json');write(file,f)
    return compose_up(file,role),source


def submit(network,*names):
    args=['run','--rm','--network',network,'--user','1000:1000','--read-only','--cap-drop','ALL',
          '--mount',f'type=bind,source={HERE},target=/lab,readonly','--mount',f'type=bind,source={base/"keys"},target=/keys,readonly',
          '--entrypoint','python3',HELPER,'/lab/submit.py',*names]
    return json.loads(docker(*args).stdout)


try:
    for sub in ['keys','control','witness']:
        (base/sub).mkdir(mode=0o700)
    keys=base/'keys'
    for name in ['relay','receiver']:
        command(['openssl','req','-x509','-newkey','rsa:2048','-nodes','-days','2','-subj','/CN='+name+'-synthetic-ca',
                 '-addext','basicConstraints=critical,CA:TRUE','-addext','keyUsage=critical,keyCertSign,cRLSign',
                 '-keyout',str(keys/(name+'-ca.key')),'-out',str(keys/(name+'-ca.pem'))])
        host='relay.fixture.invalid' if name=='relay' else 'receiver'
        command(['openssl','req','-newkey','rsa:2048','-nodes','-subj','/CN='+host,'-keyout',str(keys/(name+'.key')),'-out',str(keys/(name+'.csr'))])
        write(keys/(name+'.ext'),'subjectAltName=DNS:'+host+'\nbasicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n')
        command(['openssl','x509','-req','-in',str(keys/(name+'.csr')),'-CA',str(keys/(name+'-ca.pem')),'-CAkey',str(keys/(name+'-ca.key')),
                 '-set_serial','1','-days','2','-extfile',str(keys/(name+'.ext')),'-out',str(keys/(name+'.pem'))])
    (keys/'trust.pem').write_bytes((keys/'relay-ca.pem').read_bytes()+(keys/'receiver-ca.pem').read_bytes())
    submission='SyntheticSubmission'+uuid.uuid4().hex
    upstream='SyntheticUpstream'+uuid.uuid4().hex
    write(keys/'submission',submission);write(keys/'upstream',upstream)
    write(keys/'client.json',{'password':submission});write(keys/'receiver.json',{'user':'synthetic-upstream','password':upstream})
    write(base/'control/mode','defer')
    request={'consumer':consumer,'root':str(base/'source'),'keys':str(keys),'project':project,'image':IMAGE,'node_image':NODE,'source':SOURCE,'output':str(base/'prepared.json')}
    write(base/'prepare-input.json',request)
    command(['node',str(HERE/'prepare.cjs'),str(base/'prepare-input.json')])
    prepared=json.loads((base/'prepared.json').read_text());fixture,primary=make_fixture(prepared)
    report['prepared_revision']=prepared['revision']
    report['generated_config_sha256']={name:sha((pathlib.Path(prepared['candidate'])/name).read_bytes()) for name in
        ['postfix-main.cf','postfix-master.cf','postfix-sasl.conf','mail-entrypoint.sh','smtp-relay-auth.pl','opendkim.conf']}
    write(base/'fixture.compose.json',fixture)
    for net in fixture['networks'].values():
        docker('network','create','--internal','--label','org.drumee.queue-restore.owner='+project,net['name'])
        networks.append(net['name'])
        check(net['name']+'-internal',json.loads(docker('network','inspect',net['name']).stdout)[0]['Internal'])
    primarynet=fixture['networks'][primary]['name']
    docker('compose','-p',project,'-f',str(base/'fixture.compose.json'),'up','-d','receiver','dkim')
    containers += [project+'-receiver-1',project+'-dkim-1']
    mail=compose_up(base/'fixture.compose.json','mail')
    check('no-published-ports',all(not info(n)['HostConfig']['PortBindings'] for n in containers))
    report['native_versions']=docker('exec',mail,'sh','-c','postconf mail_version; id postfix; getent group postdrop; id infra').stdout.decode().splitlines()
    messages=submit(primarynet,'definite-1','definite-2','definite-3');report['submissions']=messages
    check('normal-starttls-auth-submission-accepted',len(messages)==3 and len({x['queue_id'] for x in messages})==3)
    q=wait(lambda: (lambda rows:rows if len(rows)==3 and all(r['queue_name']=='deferred' and r['recipients'][0].get('delay_reason','').find('451')>=0 for r in rows) else None)(queue(mail)))
    check('all-three-deferred-after-receiver-451',True,q)
    check('independent-witness-no-durable-delivery-before-capture',len(accepted())==0 and len(witness())>=3)
    owner={'owner':project,'resource':'mail-queue'}
    spool=str(base/'source/durable/mail')
    stop_mail(mail,spool)
    before=inventory('/work/source/durable/mail');report['source_inventory_sha256']=before['sha256']
    config_digest=sha((base/'prepared.json').read_bytes())
    saved,_=storage({'operation':'snapshot','source':'/work/source/durable/mail','archive':'/work/spool.tar','receipt':'/work/spool.receipt.json',
                     'owner':owner,'image':IMAGE,'config_sha256':config_digest,'quiescence_verified':True,
                     'operator_uid':os.getuid(),'operator_gid':os.getgid()})
    report['snapshot']=saved
    # Independently check every archive member digest in the protected receipt before restoring.
    receipt=json.loads((base/'spool.receipt.json').read_text())
    check('archive-sha256-verified-before-restore',sha((base/'spool.tar').read_bytes())==receipt['archive_sha256'])
    replacement=fresh_volume('replacement')
    restore={'operation':'restore','archive':'/work/spool.tar','receipt':'/work/spool.receipt.json','target':'/replacement/spool',
             'owner':owner,'image':IMAGE,'config_sha256':config_digest,'expected_receipt_sha256':saved['receipt_sha256']}
    result,_=storage(restore,replacement);report['restore']=result
    check('restored-to-distinct-volume-inode',result['metadata_exact'] and result['target_identity']!=saved['source_identity'])
    check('source-unchanged-after-restoration',inventory('/work/source/durable/mail')['sha256']==before['sha256'])
    for item in messages:
        parsed=offline(fixture,replacement,['postcat','-c','/config','-q',item['queue_id']]).stdout
        check('offline-postcat-'+item['queue_id'],item['message_id'].encode() in parsed)
    check('replacement-numeric-metadata-and-file-hashes-exact',inventory('/replacement/spool',replacement)['sha256']==before['sha256'])
    # Pre-start hold is a native queue operation while the container has no network.
    offline(fixture,replacement,['postsuper','-c','/config','-h','ALL'],False)
    restored,restoredsource=restored_service(fixture,replacement,'restored')
    check('single-running-queue-instance',not info(mail)['State']['Running'] and info(restored)['State']['Running'])
    check('restored-started-with-all-messages-held',len(queue(restored))==3 and all(r['queue_name']=='hold' for r in queue(restored)))
    mapping=correlation_map(restored,messages);report['restored_queue_id_map']=mapping
    check('no-delivery-before-explicit-resume',not accepted())
    write(base/'control/mode','accept')
    for item in mapping:
        docker('exec',restored,'postsuper','-c','/run/infra-mail/config','-H',item['restored_queue_id'])
        docker('exec',restored,'postqueue','-c','/run/infra-mail/config','-i',item['restored_queue_id'])
    wait(lambda:len(accepted())==3 and not queue(restored))
    counts=collections.Counter(r['message_id'] for r in accepted())
    check('definite-nondeliveries-restored-once-each',counts=={m['message_id']:1 for m in messages},dict(counts))
    # Receiver durable commit, then deliberate loss of the final SMTP acknowledgement.
    write(base/'control/mode','uncertain')
    uncertain=submit(primarynet,'uncertain-1')[0];report['uncertain_submission']=uncertain
    wait(lambda:any(r['message_id']==uncertain['message_id'] for r in accepted()))
    uq=wait(lambda:next((r for r in queue(restored) if r['queue_id']==uncertain['queue_id'] and r['queue_name']=='deferred'),None))
    docker('exec',restored,'postsuper','-c','/run/infra-mail/config','-h',uncertain['queue_id'])
    check('uncertain-durable-receipt-plus-deferred-queue',True,uq)
    # Cover the canonical 30s maximum backoff plus 10s scan interval and margin.
    count_before=len(accepted());time.sleep(45)
    check('uncertain-queue-held-for-operator-review',len(accepted())==count_before and queue(restored)[0]['queue_name']=='hold',{'observed_seconds':45})
    write(base/'control/mode','accept')
    docker('exec',restored,'postsuper','-c','/run/infra-mail/config','-H',uncertain['queue_id'])
    docker('exec',restored,'postqueue','-c','/run/infra-mail/config','-i',uncertain['queue_id'])
    wait(lambda:len([r for r in accepted() if r['message_id']==uncertain['message_id']])==2 and not queue(restored))
    duplicates=[r for r in accepted() if r['message_id']==uncertain['message_id']]
    check('lost-final-ack-retry-observed-duplicate',len(duplicates)==2 and len({r['sha256'] for r in duplicates})==1,duplicates)
    stop_mail(restored,restoredsource)
    # Reusing the old checkpoint can reintroduce definitely completed messages.
    stale=fresh_volume('stale-checkpoint')
    storage(restore,stale)
    offline(fixture,stale,['postsuper','-c','/config','-h','ALL'],False)
    old,oldsource=restored_service(fixture,stale,'stale')
    stale_map=correlation_map(old,messages);report['stale_queue_id_map']=stale_map
    oldcount=len(accepted());time.sleep(1)
    check('old-checkpoint-starts-held-not-auto-replayed',len(accepted())==oldcount)
    stale_one=next(x['restored_queue_id'] for x in stale_map if x['message_id']==messages[0]['message_id'])
    docker('exec',old,'postsuper','-c','/run/infra-mail/config','-H',stale_one)
    docker('exec',old,'postqueue','-c','/run/infra-mail/config','-i',stale_one)
    wait(lambda:len([r for r in accepted() if r['message_id']==messages[0]['message_id']])==2)
    check('old-checkpoint-can-reintroduce-completed-message',True)
    stop_mail(old,oldsource)
    # Negative restores never touch the stopped source or an already occupied destination.
    bad=bytearray((base/'spool.tar').read_bytes());bad[len(bad)//2]^=1;(base/'altered.tar').write_bytes(bad)
    cases=[('altered-archive',{**restore,'archive':'/work/altered.tar','target':'/replacement/altered'},'ARCHIVE_INTEGRITY_FAILURE'),
           ('occupied-target',restore,'TARGET_EXISTS'),
           ('wrong-owner',{**restore,'owner':{'owner':'wrong-owner','resource':'mail-queue'},'target':'/replacement/wrong-owner'},'OWNER_MARKER_MISMATCH'),
           ('wrong-image',{**restore,'image':'sha256:'+'0'*64,'target':'/replacement/wrong-image'},'COMPATIBILITY_MISMATCH')]
    cases.append(('source-as-target',{**restore,'target':'/work/source/durable/mail/replacement'},'TARGET_SCOPE_INVALID'))
    # An internally incomplete tar with a matching outer checksum still fails member coverage.
    with tarfile.open(base/'spool.tar') as src, tarfile.open(base/'incomplete.tar','w') as dst:
        drop=next(r['path'] for r in receipt['entries'] if r['kind']=='file' and r['path']!='.infra-owner')
        for member in src.getmembers():
            if member.name!=drop:
                dst.addfile(member,src.extractfile(member) if member.isfile() else None)
    incomplete={**receipt,'archive_sha256':sha((base/'incomplete.tar').read_bytes())};write(base/'incomplete.receipt.json',incomplete)
    cases.append(('incomplete-archive',{**restore,'archive':'/work/incomplete.tar','receipt':'/work/incomplete.receipt.json',
                  'expected_receipt_sha256':sha((base/'incomplete.receipt.json').read_bytes()),'target':'/replacement/incomplete'},'ARCHIVE_COVERAGE_FAILURE'))
    wrong_marker=json.dumps({'owner':'bad-'+project[4:],'resource':'mail-queue'},separators=(',',':')).encode()
    wrong_receipt=json.loads(json.dumps(receipt))
    with tarfile.open(base/'spool.tar') as src,tarfile.open(base/'wrong-marker.tar','w') as dst:
        for member in src.getmembers():
            if member.name=='.infra-owner':
                member.size=len(wrong_marker)
                dst.addfile(member,io.BytesIO(wrong_marker))
                row=next(r for r in wrong_receipt['entries'] if r['path']=='.infra-owner')
                row.update(size=len(wrong_marker),sha256=sha(wrong_marker))
            else:
                dst.addfile(member,src.extractfile(member) if member.isfile() else None)
    wrong_receipt['archive_sha256']=sha((base/'wrong-marker.tar').read_bytes());write(base/'wrong-marker.receipt.json',wrong_receipt)
    cases.append(('wrong-payload-marker',{**restore,'archive':'/work/wrong-marker.tar','receipt':'/work/wrong-marker.receipt.json',
                  'expected_receipt_sha256':sha((base/'wrong-marker.receipt.json').read_bytes()),'target':'/replacement/bad-marker'},'OWNER_MARKER_MISMATCH'))
    targetbefore=inventory('/replacement/spool',replacement)['sha256']
    for name,cfg,code in cases:
        result,status=storage(cfg,replacement,False)
        check(name+'-refused-before-activation',status==78 and result.get('code')==code,result)
        check(name+'-source-and-existing-target-preserved',inventory('/work/source/durable/mail')['sha256']==before['sha256'] and inventory('/replacement/spool',replacement)['sha256']==targetbefore)
    report['receiver_events']=witness()
    report['source_queue_ids']=[x['queue_id'] for x in messages]
    report['retained_volumes']=volumes
    report['scope']='Cold spool only, exact alpha.6 relay/image; no coordinated Oxy-form state or autonomous Maildir restoration'
    report['verdict']='POSTFIX_QUEUE_RESTORE_QUALIFIED'
except Exception as error:
    report['verdict']='SMTP_RECOVERY_UNQUALIFIED';report['failure']=str(error)
    print('FAIL '+str(error),flush=True)
finally:
    # No queue/data purge: retain source, archives, witness and replacement volumes.
    cleanup=[]
    for name in reversed(containers):
        try:
            c=info(name)
            if c['State']['Running']:
                docker('stop','--time','20',name)
            check(name+'-stopped-before-removal',not info(name)['State']['Running'])
            docker('rm',name)
            cleanup.append({'container':name,'removed':True})
        except Exception as error:
            cleanup.append({'container':name,'error':str(error)})
    for name in reversed(networks):
        try:
            n=json.loads(docker('network','inspect',name).stdout)[0]
            assert n['Labels'].get('org.drumee.queue-restore.owner')==project and not n['Containers']
            docker('network','rm',name)
        except Exception as error:
            cleanup.append({'network':name,'error':str(error)})
    report['cleanup']=cleanup;report['finished_at']=now();report['command_ledger']=ledger
    report['test_source_sha256']={p.name:sha(p.read_bytes()) for p in HERE.iterdir() if p.is_file()}
    if report['test_source_sha256']!=frozen_sources:
        report['verdict']='SMTP_RECOVERY_UNQUALIFIED';report['failure']='TEST_SOURCE_CHANGED_DURING_EXECUTION'
    write(out,report);print('REPORT '+str(out),flush=True)
sys.exit(0 if report['verdict']=='POSTFIX_QUEUE_RESTORE_QUALIFIED' and not any('error' in x for x in report['cleanup']) else 1)
