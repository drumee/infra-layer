"""Advanced native MX and per-recipient qualification on a retained isolated run."""
import datetime,hashlib,json,pathlib,subprocess,sys,time,uuid
base=pathlib.Path(sys.argv[1]);saved=json.loads((base/'report.json').read_text());project=saved['project'];here=pathlib.Path(__file__).resolve().parent;file=base/'compose.json';commands=[];checks=[];runid=uuid.uuid4().hex[:8]
image='sha256:f3fe9dc4eeb6cb8b1ba3efd61c6743159ba8313e2901983e9300ca6e4a5d733b';clientimage='sha256:36afa984f1187ff7fef17356fa7ead13af9a756681ac4a0c234a58fdc38f47e8'
def d(*args,input=None,ok=True):
 p=subprocess.run(['docker',*args],input=input,capture_output=True,timeout=90);commands.append({'argv':['docker',*args],'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exit':p.returncode,'stdout_sha256':hashlib.sha256(p.stdout).hexdigest(),'stderr_sha256':hashlib.sha256(p.stderr).hexdigest()})
 if ok and p.returncode:raise RuntimeError('native lab command failed: '+str(args[:3]))
 return p
def compose(*args,**kw):return d('compose','-p',project,'-f',str(file),*args,**kw)
def client(*args):
 return json.loads(d('run','--rm','--network',project+'-edge','--user','1000:1000','--mount',f'type=bind,source={here},target=/lab,readonly','--mount',f'type=bind,source={base}/keys,target=/keys,readonly','--entrypoint','python3',clientimage,'/lab/client.py',*args).stdout)
def queue():return [json.loads(x) for x in compose('exec','-T','postfix','postqueue','-c','/config','-j').stdout.splitlines()]
def wait(fn):
 for _ in range(120):
  value=fn()
  if value:return value
  time.sleep(.25)
 raise TimeoutError('MX observation timeout')
def events(tag):return [json.loads(p.read_text()) for p in (base/'witness').glob('event-*.json') if tag in p.read_text() and json.loads(p.read_text())['durable_acceptance']]
def send(domain,tag):return client('send','ghost','contact@oxymot.fr','sink@'+domain,tag,'587')
def case(name,fn):
 try:detail=fn();checks.append({'name':name,'status':'PASS','observation':detail});print('PASS '+name,flush=True)
 except Exception as e:checks.append({'name':name,'status':'FAIL','reason':str(e)});print('FAIL '+name+': '+str(e),flush=True)
config=json.loads(file.read_text());original=config.copy();down=dict(config['services']['mx']);down['environment']={'LAB_GREETING_TEMPFAIL':'1'};down['networks']={'edge':{'ipv4_address':'10.243.47.55'}};config['services']['mxdown']=down;file.write_text(json.dumps(config));file.chmod(0o600)
try:
 compose('up','-d','dns','mx','mxdown');compose('restart','dns','mx');time.sleep(1)
 tag=runid+'-alternate'
 def alternate():
  send('alternate.invalid',tag);e=wait(lambda:events(tag));assert e[0]['recipients']==['sink@alternate.invalid'];return e
 case('alternate-mx-after-primary-421',alternate)
 for domain in ['missing.invalid','null.invalid']:
  tag=runid+'-'+domain
  def permanent(domain=domain,tag=tag):
   send(domain,tag);result=wait(lambda:client('dsn',tag)['dispositions']);assert all(x['status'].startswith('5.') for x in result);assert not events(tag);return result
  case('permanent-route-'+domain,permanent)
 tag=runid+'-multi';(base/'control/recipient-mode').write_text('defer')
 def partial():
  client('multi-send','sink@multi.invalid,later@multi.invalid,blocked@multi.invalid',tag)
  e=wait(lambda:events(tag));q=wait(lambda:next((x for x in queue() if any(y['address']=='later@multi.invalid' for y in x['recipients'])),None))
  assert e[0]['recipients']==['sink@multi.invalid'];assert [x['address'] for x in q['recipients']]==['later@multi.invalid']
  dispositions=wait(lambda:client('dsn',tag)['dispositions']);assert any('blocked@multi.invalid' in x['recipient'] and x['status'].startswith('5.') for x in dispositions)
  (base/'control/recipient-mode').write_text('accept');compose('exec','-T','postfix','postqueue','-c','/config','-f');e=wait(lambda:events(tag) if len(events(tag))==2 else None)
  assert sorted(x['recipients'] for x in e)==[['later@multi.invalid'],['sink@multi.invalid']];return {'events':e,'dsn':dispositions,'initial_pending_queue_id':q['queue_id']}
 case('multi-recipient-success-defer-permanent-failure',partial)
 # Domain-only verification must not silently inherit opportunistic fallback.
 tag=runid+'-strict-domain'
 def strict():
  (base/'control/mode').write_text('plain');compose('exec','-T','postfix','/bin/sh','-ec','printf "%s\\n" "strict.invalid verify" > /config/tls-policy');compose('exec','-T','postfix','postfix','-c','/config','reload');time.sleep(1)
  send('strict.invalid',tag);q=wait(lambda:next((x for x in queue() if any(y['address']=='sink@strict.invalid' and 'TLS' in y.get('delay_reason','') for y in x['recipients'])),None));assert not events(tag)
  (base/'control/mode').write_text('accept');compose('exec','-T','postfix','postqueue','-c','/config','-f');e=wait(lambda:events(tag));assert e[0]['tls'];return {'deferred_queue_id':q['queue_id'],'delivery':e}
 case('domain-strict-no-plaintext-fallback-and-verified-recovery',strict)
 tag=runid+'-expiry'
 def expiry():
  (base/'control/mode').write_text('defer');before={x['queue_id'] for x in queue()};send('expire.invalid',tag)
  q=wait(lambda:next((x for x in queue() if x['queue_id'] not in before and x['queue_name']=='deferred'),None));compose('exec','-T','postfix','postsuper','-c','/config','-e',q['queue_id']);compose('exec','-T','postfix','postqueue','-c','/config','-f')
  result=wait(lambda:client('dsn',tag)['dispositions']);assert all(x['action']=='failed' for x in result);return {'expired_queue_id':q['queue_id'],'dsn':result}
 case('native-forced-expiry-produces-local-dsn',expiry)
finally:
 (base/'control/mode').write_text('accept');compose('exec','-T','postfix','/bin/sh','-ec',': > /config/tls-policy',ok=False);compose('exec','-T','postfix','postfix','-c','/config','reload',ok=False)
 result={'status':'PASS_ADVANCED_MX' if all(x['status']=='PASS' for x in checks) else 'FAIL_ADVANCED_MX','checks':checks,'commands':commands,'source_sha256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest()};(base/'mx-result.json').write_text(json.dumps(result,indent=2));print('REPORT '+str(base/'mx-result.json'))
