"""Independent synthetic client projects; no deployed Ghost/Oxy application claim."""
import hashlib,json,pathlib,subprocess,sys,time,uuid
r=json.loads(pathlib.Path(sys.argv[1]).read_text());base=pathlib.Path(r['private_root']);project=r['project'];here=pathlib.Path(__file__).resolve().parent
image='sha256:36afa984f1187ff7fef17356fa7ead13af9a756681ac4a0c234a58fdc38f47e8';events=[]
def run(args,ok=True):
 p=subprocess.run(args,capture_output=True,timeout=60)
 events.append({'argv':args,'exit':p.returncode,'stdout_sha256':hashlib.sha256(p.stdout).hexdigest(),'stderr_sha256':hashlib.sha256(p.stderr).hexdigest()})
 if ok and p.returncode:raise RuntimeError('client lifecycle command failed')
 return p
def docker(*args,**kw):return run(['docker',*args],**kw)
def identity():
 result={}
 for name in ['postfix','dovecot','policy','opendkim']:
  observed=json.loads(docker('inspect',project+'-'+name+'-1').stdout)[0]
  value={k:v for k,v in observed.items() if k in ['Id','Mounts','NetworkSettings','Image']}
  # Docker does not promise ordering for inspect.Mounts. Compare the complete
  # multiset, retaining every field and duplicate; never project only sources.
  value['Mounts']=sorted(value['Mounts'],key=lambda x:json.dumps(x,sort_keys=True))
  value['started']=observed['State']['StartedAt'];result[name]=value
 return result
before=identity();apps={};checks=[];run_id=uuid.uuid4().hex[:8]
def fixture(who,command):
 p=project+'-'+who+'fixture';file=base/(who+'-fixture.json')
 spec={'services':{'client':{'image':image,'user':'1000:1000','entrypoint':['python3'],'command':command,'volumes':[str(here)+':/lab:ro',str(base/'keys')+':/keys:ro'],'networks':['backend','mail']}},'networks':{'backend':{'internal':True},'mail':{'external':True,'name':project+'-edge'}}}
 file.write_text(json.dumps(spec));file.chmod(0o600);apps[who]=(p,file)
 return ['compose','-p',p,'-f',str(file)]
def send(who,tag):
 tag=run_id+'-'+tag
 p,_=apps[who];cid=docker('ps','-q','--filter','label=com.docker.compose.project='+p).stdout.decode().strip();assert cid
 sender='contact@oxymot.fr' if who=='ghost' else 'second@oxymot.fr'
 docker('exec',cid,'python3','/lab/client.py','send',who,sender,'sink@dest.invalid',tag,'587')
 docker('exec',cid,'python3','/lab/client.py','send','-','outside@dest.invalid','second@oxymot.fr','rx-'+tag,'25')
 for _ in range(50):
  if any(tag.encode() in p.read_bytes() for p in (base/'witness').glob('message-*.eml')):break
  time.sleep(.1)
 else:raise AssertionError('controlled MX did not observe '+tag)
 after=identity()
 if after!=before:
  (base/'life-identity-diff.json').write_text(json.dumps({'before':before,'after':after},indent=2))
  raise AssertionError('mail runtime identity changed; inspect life-identity-diff.json')
try:
 for who in ['ghost','oxymotion']:docker(*fixture(who,['-c','import time; time.sleep(3600)']),'up','-d')
 for target,other in [('oxymotion','ghost'),('ghost','oxymotion')]:
  p,file=apps[target];cmd=['compose','-p',p,'-f',str(file)]
  docker(*cmd,'stop');send(other,target+'-stopped');checks.append(target+'-stop-does-not-interrupt-peer-or-mx')
  docker(*fixture(target,['-c','import time; time.sleep(7200)']),'up','-d');send(other,target+'-updated');checks.append(target+'-update-independent')
  docker(*fixture(target,['-c','raise SystemExit(42)']),'up','-d');time.sleep(1)
  ids=docker('ps','-aq','--filter','label=com.docker.compose.project='+p).stdout.decode().strip();assert json.loads(docker('inspect',ids).stdout)[0]['State']['ExitCode']==42
  send(other,target+'-failed-start');checks.append(target+'-failed-start-independent')
  docker(*fixture(target,['-c','import time; time.sleep(3600)']),'up','-d');send(target,target+'-rollback');checks.append(target+'-rollback-independent')
  assert all(p+'-backend' not in v['NetworkSettings']['Networks'] for v in before.values())
 result={'status':'PASS_SYNTHETIC_APPLICATION_LIFECYCLES','checks':checks,'commands':events,'mail_runtime_identity_unchanged':True,'application_backend_not_adopted':True}
 (base/'life-result.json').write_text(json.dumps(result,indent=2));print(json.dumps({'status':result['status'],'checks':checks}))
finally:
 for p,file in apps.values():docker('compose','-p',p,'-f',str(file),'down',ok=False)
