"""Native integration laboratory. All networks internal; no host publications."""
import datetime
import hashlib
import json
import os
import pathlib
import subprocess
import tempfile
import time
import uuid
import concurrent.futures

HERE=pathlib.Path(__file__).resolve().parent
IMAGE='sha256:f3fe9dc4eeb6cb8b1ba3efd61c6743159ba8313e2901983e9300ca6e4a5d733b'
CLIENT_IMAGE='sha256:36afa984f1187ff7fef17356fa7ead13af9a756681ac4a0c234a58fdc38f47e8'
NODE='sha256:4a'  # Resolved from an immutable available Node image below.
NODE_REF='node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392'
base=pathlib.Path(tempfile.mkdtemp(prefix='mail02-native-'));project='mail02-'+uuid.uuid4().hex[:8]
consumer=pathlib.Path(os.environ['MAIL02_CONSUMER']).resolve()
frozen_sources={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in HERE.iterdir() if p.is_file()}
report={'project':project,'private_root':str(base),'checks':[],'commands':[], 'package_receipt':json.loads((consumer/'mail02-receipt.json').read_text())};file=base/'compose.json'


def run(argv,input=None,ok=True):
    start=datetime.datetime.now(datetime.timezone.utc).isoformat()
    r=subprocess.run(argv,input=input,capture_output=True,timeout=120)
    report['commands'].append({'argv':argv,'at':start,'exit':r.returncode,'stdout_sha256':hashlib.sha256(r.stdout).hexdigest(),'stderr_sha256':hashlib.sha256(r.stderr).hexdigest()})
    if ok and r.returncode:raise RuntimeError(str(argv[:3])+r.stderr.decode()[-2000:])
    return r


def d(*args,**kwargs):return run(['docker',*args],**kwargs)


def check(name,condition,detail=None):
    assert condition,name
    report['checks'].append({'name':name,'pass':True,'detail':detail});print('PASS '+name,flush=True)


def write(p,v):p.write_text(json.dumps(v) if not isinstance(v,str) else v);p.chmod(0o600)


def client(*args):
    r=d('run','--rm','--network',project+'-edge','--user','1000:1000','--mount',f'type=bind,source={HERE},target=/lab,readonly','--mount',f'type=bind,source={base}/keys,target=/keys,readonly','--mount',f'type=bind,source={base}/control,target=/control','--entrypoint','python3',CLIENT_IMAGE,'/lab/client.py',*args)
    return json.loads(r.stdout)


def queue():return [json.loads(x) for x in d('compose','-p',project,'-f',str(file),'exec','-T','postfix','postqueue','-c','/config','-j').stdout.splitlines()]


def wait(fn):
    for _ in range(80):
        if value:=fn():return value
        time.sleep(.25)
    raise TimeoutError('native observation timeout')


try:
    for directory in ['keys','control','witness']:(base/directory).mkdir(mode=0o700)
    keys=base/'keys'
    run(['openssl','req','-x509','-newkey','rsa:2048','-nodes','-days','2','-subj','/CN=MAIL02 lab CA','-addext','basicConstraints=critical,CA:TRUE','-addext','keyUsage=critical,keyCertSign,cRLSign','-keyout',str(keys/'ca.key'),'-out',str(keys/'ca.pem')])
    for name,hostname in [('mail','mail.oxymot.fr'),('receiver','mx.dest.invalid')]:
        run(['openssl','req','-newkey','rsa:2048','-nodes','-subj','/CN='+hostname,'-keyout',str(keys/(name+'.key')),'-out',str(keys/(name+'.csr'))])
        write(keys/(name+'.ext'),'subjectAltName=DNS:'+hostname+'\nbasicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n')
        run(['openssl','x509','-req','-in',str(keys/(name+'.csr')),'-CA',str(keys/'ca.pem'),'-CAkey',str(keys/'ca.key'),'-set_serial','1' if name=='mail' else '2','-days','2','-extfile',str(keys/(name+'.ext')),'-out',str(keys/(name+'.pem'))])
    (keys/'certificate.pem').write_bytes((keys/'mail.pem').read_bytes());(keys/'key.pem').write_bytes((keys/'mail.key').read_bytes())
    run(['openssl','genpkey','-algorithm','RSA','-pkeyopt','rsa_keygen_bits:2048','-out',str(keys/'dkim.pem')])
    public=run(['openssl','pkey','-in',str(keys/'dkim.pem'),'-pubout','-outform','DER']).stdout
    import base64
    write(base/'control/dkim-txt','v=DKIM1; k=rsa; p='+base64.b64encode(public).decode())
    write(base/'control/mode','accept');write(base/'control/dns-mode','healthy')
    password={k:'Synthetic-'+uuid.uuid4().hex for k in ['ghost','oxymotion','contact','second']};write(keys/'client.json',password);write(keys/'receiver.json',{'user':'unused','password':'unused'})
    verifiers={}
    for who,pw in password.items():
        hashed=d('run','--rm','-i','--network','none','--entrypoint','doveadm',IMAGE,'pw','-s','ARGON2ID',input=(pw+'\n'+pw+'\n').encode()).stdout.decode().strip()
        ident={'contact':'11111111-1111-4111-8111-111111111111','second':'22222222-2222-4222-8222-222222222222'}.get(who,who);verifiers[ident]=hashed
    for p in keys.iterdir():p.chmod(0o600)
    NODE=d('image','inspect',NODE_REF,'--format','{{.Id}}').stdout.decode().strip()
    write(base/'input.json',{'root':str(base/'service'),'project':project,'keys':str(keys),'image':IMAGE,'node_image':NODE,'verifiers':verifiers,'output':str(base/'prepared.json')})
    run(['node',str(HERE/'prepare.cjs'),str(base/'input.json')])
    saved=json.loads((base/'prepared.json').read_text());compose=saved['prepared']['compose']
    compose['services']['dns']={'image':NODE,'entrypoint':['node','/lab/dns.cjs'],'volumes':[str(HERE)+':/lab:ro',str(base/'control')+':/control:ro'],'networks':{'edge':{'ipv4_address':'10.243.47.53'}},'read_only':True}
    compose['services']['mx']={'image':CLIENT_IMAGE,'user':'1000:1000','entrypoint':['python3','/lab/mx.py'],'volumes':[str(HERE)+':/lab:ro',str(keys)+':/keys:ro',str(base/'control')+':/control:ro',str(base/'witness')+':/witness'],'networks':{'edge':{'ipv4_address':'10.243.47.54'}},'read_only':True}
    compose['services']['postfix']['dns']=['10.243.47.53']
    for service in compose['services'].values():service['restart']='no'
    write(file,compose)
    d('compose','-p',project,'-f',str(file),'up','-d')
    wait(lambda:json.loads(d('inspect',project+'-postfix-1').stdout)[0]['State'].get('Health',{}).get('Status')=='healthy')
    check('internal-networks-no-host-publications',all(json.loads(d('network','inspect',project+'-'+n).stdout)[0]['Internal'] for n in ['edge','control']) and all(not x.get('ports') for x in compose['services'].values()))
    # First real submission must traverse Postfix, policy, OpenDKIM, DNS MX and SMTP25.
    client('send','ghost','contact@oxymot.fr','sink@dest.invalid','ghost-transaction','587')
    wait(lambda:len(list((base/'witness').glob('message-*.eml')))>=1)
    client('send','oxymotion','second@oxymot.fr','sink@dest.invalid','motion-transaction','465')
    wait(lambda:len(list((base/'witness').glob('message-*.eml')))>=2)
    check('both-app-accounts-deliver-via-mx25',not queue())
    for message in sorted((base/'witness').glob('message-*.eml')):
        verification=d('run','--rm','-i','--network',project+'-edge','--dns','10.243.47.53','--entrypoint','opendkim-testmsg',IMAGE,input=message.read_bytes(),ok=False)
        check('native-dkim-verifies-'+message.name,verification.returncode==0,verification.stderr.decode())
    client('send','-','external@dest.invalid','contact@oxymot.fr','inbound-primary','25')
    client('send','-','external@dest.invalid','hello@oxymot.fr','inbound-alias','25')
    wait(lambda:len(client('imap','contact@oxymot.fr','inbound-primary')['matches'])==1)
    primary=client('imap','contact@oxymot.fr','inbound-primary');alias=client('imap','contact@oxymot.fr','inbound-alias')
    check('primary-and-alias-read-in-contact',len(primary['matches'])==len(alias['matches'])==1)
    check('inbound-not-locally-signed',not primary['matches'][0]['local_dkim'] and not alias['matches'][0]['local_dkim'])
    check('other-mailbox-isolated',not client('imap','second@oxymot.fr','inbound-primary')['matches'])
    for name in client('checks')['checks']:check(name,True)
    for name in client('tls-checks')['checks']:check(name,True)
    # Neither registry failure nor policy failure is allowed to become a permit.
    public=base/'service/durable/registry/public/current.json'
    original=public.read_bytes();public.rename(public.with_suffix('.saved'))
    check('registry-unavailable-tempfails-rcpt',400<=client('local-rcpt')['code']<500)
    public.write_bytes(original);public.chmod(0o600);public.with_suffix('.saved').unlink()
    d('compose','-p',project,'-f',str(file),'stop','policy')
    failed=client('policy-failure')
    check('policy-process-failure-tempfails',400<=failed['temporary_code']<500)
    d('compose','-p',project,'-f',str(file),'start','policy')
    # Retry scheduling is forced only within the isolated lab; production defaults remain.
    write(base/'control/dns-mode','failure');time.sleep(3)
    client('send','ghost','contact@oxymot.fr','sink@dest.invalid','dns-unavailable','587')
    delayed=wait(lambda:next((r for r in queue() if r['queue_name']=='deferred'),None))
    check('dns-servfail-retains-deferred-message',True,delayed)
    write(base/'control/dns-mode','healthy')
    d('compose','-p',project,'-f',str(file),'exec','-T','postfix','postqueue','-c','/config','-f')
    wait(lambda:not queue())
    check('dns-recovery-drains-controlled-message',True)
    write(base/'control/mode','defer')
    client('send','ghost','contact@oxymot.fr','sink@dest.invalid','mx-temporary-refusal','587')
    delayed=wait(lambda:next((r for r in queue() if r['queue_name']=='deferred' and '451' in r['recipients'][0].get('delay_reason','')),None))
    check('mx-451-retains-deferred-message',True,delayed)
    write(base/'control/mode','accept');d('compose','-p',project,'-f',str(file),'exec','-T','postfix','postqueue','-c','/config','-f');wait(lambda:not queue())
    client('send','ghost','contact@oxymot.fr','blocked@dest.invalid','permanent-recipient-refusal','587')
    wait(lambda:bool(client('imap','contact@oxymot.fr','permanent-recipient-refusal')['matches']))
    check('mx-550-produces-local-dsn-not-endless-retry',not queue())
    write(base/'control/mode','plain')
    d('compose','-p',project,'-f',str(file),'exec','-T','postfix','postconf','-c','/config','-e','smtp_tls_security_level=verify')
    d('compose','-p',project,'-f',str(file),'exec','-T','postfix','postfix','-c','/config','reload');time.sleep(3)
    witness_before=len(list((base/'witness').glob('message-*.eml')))
    client('send','ghost','contact@oxymot.fr','sink@dest.invalid','strict-no-clear-fallback','587')
    delayed=wait(lambda:next((r for r in queue() if r['queue_name']=='deferred' and 'TLS' in r['recipients'][0].get('delay_reason','')),None))
    check('strict-outbound-no-plaintext-fallback',len(list((base/'witness').glob('message-*.eml')))==witness_before,delayed)
    d('compose','-p',project,'-f',str(file),'exec','-T','postfix','postconf','-c','/config','-e','smtp_tls_security_level=may')
    d('compose','-p',project,'-f',str(file),'exec','-T','postfix','postfix','-c','/config','reload')
    d('compose','-p',project,'-f',str(file),'exec','-T','postfix','postqueue','-c','/config','-f');wait(lambda:not queue())
    check('opportunistic-mode-delivers-without-starttls',len(list((base/'witness').glob('message-*.eml')))==witness_before+1)
    write(base/'control/mode','accept')
    check('imap-append-quota-hard-limit',client('fill-quota')['imap_overquota_refused'])
    check('full-mailbox-smtp-acceptance',client('large-local')['accepted_by_postfix'])
    delayed=wait(lambda:next((r for r in queue() if r['queue_name']=='deferred' and 'quota' in r['recipients'][0].get('delay_reason','').lower()),None))
    check('lmtp-full-quota-tempfails-and-queue-persists',True,delayed)
    before_ids={r['queue_id'] for r in queue()}
    d('compose','-p',project,'-f',str(file),'stop','postfix','dovecot')
    d('compose','-p',project,'-f',str(file),'start','dovecot','postfix')
    wait(lambda:json.loads(d('inspect',project+'-postfix-1').stdout)[0]['State'].get('Health',{}).get('Status')=='healthy')
    check('ordinary-stop-start-preserves-queued-quota-message',before_ids=={r['queue_id'] for r in queue()})
    before_processes={name:json.loads(d('inspect',project+'-'+name+'-1').stdout)[0]['State']['StartedAt'] for name in ['postfix','dovecot','policy','opendkim']}
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        pending=pool.submit(client,'rotation-sessions')
        wait(lambda:(base/'control/sessions-ready').exists())
        for who in ['ghost','contact']:
            password[who]='Rotated-'+uuid.uuid4().hex
            hashed=d('run','--rm','-i','--network','none','--entrypoint','doveadm',IMAGE,'pw','-s','ARGON2ID',input=(password[who]+'\n'+password[who]+'\n').encode()).stdout.decode().strip()
            verifiers['11111111-1111-4111-8111-111111111111' if who=='contact' else who]=hashed
        write(base/'rotate-input.json',{'previous':str(base/'prepared.json'),'verifiers':verifiers,'output':str(base/'rotated.json')})
        rotation=run(['node',str(HERE/'rotate.cjs'),str(base/'rotate-input.json')])
        check('registry-generation-activated',json.loads(rotation.stdout)['generation']==2)
        write(keys/'client.json',password);write(base/'control/rotated','done')
        for name in pending.result()['checks']:check(name,True)
    check('credential-rotation-does-not-restart-mail-engines',all(json.loads(d('inspect',project+'-'+name+'-1').stdout)[0]['State']['StartedAt']==stamp for name,stamp in before_processes.items()))
    report['status']='PASS_IMPLEMENTED_SUBSET'
except Exception as e:
    report['status']='FAIL';report['failure']=str(e);print('FAIL '+str(e),flush=True)
finally:
    if file.exists():
        for name in ['postfix','dovecot','opendkim','policy','mx','dns']:
            output=d('compose','-p',project,'-f',str(file),'logs','--no-color',name,ok=False)
            (base/(name+'.log')).write_bytes(output.stdout+output.stderr)
        d('compose','-p',project,'-f',str(file),'down',ok=False)
    report['source_sha256']=frozen_sources
    report['sources_unchanged']=frozen_sources=={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in HERE.iterdir() if p.is_file()}
    if not report['sources_unchanged']:report['status']='FAIL';report['failure']='lab sources changed during execution'
    write(base/'report.json',report);print('REPORT '+str(base/'report.json'),flush=True)
if report['status']=='FAIL':raise SystemExit(1)
