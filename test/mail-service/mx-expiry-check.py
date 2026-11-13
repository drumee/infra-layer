"""Native Postfix strict TLS must defer an expired laboratory MX certificate."""
import hashlib,json,pathlib,shutil,subprocess,sys,time,uuid
from certificate_fixture import issue_expired
base=pathlib.Path(sys.argv[1]);scripts=pathlib.Path(__file__).resolve().parent;p=json.loads((base/'report.json').read_text());project=p['project'];file=base/'compose.json';original=file.read_bytes();spec=json.loads(original);fixture=base/('expired-mx-'+uuid.uuid4().hex);fixture.mkdir(mode=0o700);commands=[];tag='expired-mx-'+uuid.uuid4().hex;image=spec['services']['mx']['image']
def run(args,ok=True):
 r=subprocess.run(args,capture_output=True,timeout=120);commands.append({'argv':args,'exit':r.returncode,'stdout_sha256':hashlib.sha256(r.stdout).hexdigest(),'stderr_sha256':hashlib.sha256(r.stderr).hexdigest()});
 if ok and r.returncode:raise RuntimeError('expired MX command failed '+str(args[:3]))
 return r
def comp(*args):return run(['docker','compose','-p',project,'-f',str(file),*args])
def queue():return [json.loads(x) for x in comp('exec','-T','postfix','postqueue','-c','/config','-j').stdout.splitlines()]
def events():return [json.loads(x.read_text()) for x in (base/'witness').glob('event-*.json') if tag in x.read_text() and json.loads(x.read_text())['durable_acceptance']]
for name in ['receiver.key','receiver.json']:shutil.copyfile(base/'keys'/name,fixture/name);(fixture/name).chmod(0o600)
run(['openssl','req','-new','-key',str(fixture/'receiver.key'),'-subj','/CN=mx.dest.invalid','-out',str(fixture/'receiver.csr')]);(fixture/'leaf.ext').write_text('subjectAltName=DNS:mx.dest.invalid\nbasicConstraints=critical,CA:FALSE\nextendedKeyUsage=serverAuth\n')
issue_expired(run,fixture,fixture/'receiver.csr',fixture/'receiver.key',base/'keys/ca.pem',base/'keys/ca.key',fixture/'leaf.ext',fixture/'receiver.pem');(fixture/'receiver.pem').chmod(0o600)
verify=run(['openssl','verify','-CAfile',str(base/'keys/ca.pem'),str(fixture/'receiver.pem')],False);assert verify.returncode and b'expired' in verify.stderr.lower()
spec['services']['mx']['volumes']=[str(fixture)+':/keys:ro' if ': /keys' in x or x.endswith(':/keys:ro') else x for x in spec['services']['mx']['volumes']]
try:
 file.write_text(json.dumps(spec));file.chmod(0o600);comp('up','-d','--force-recreate','mx');comp('exec','-T','postfix','postconf','-c','/config','-e','smtp_tls_security_level=verify');comp('exec','-T','postfix','postfix','-c','/config','reload');time.sleep(2)
 run(['docker','run','--rm','--network',project+'-edge','--user','1000:1000','--mount',f'type=bind,source={scripts},target=/lab,readonly','--mount',f'type=bind,source={base}/keys,target=/keys,readonly','--entrypoint','python3',image,'/lab/client.py','send','ghost','contact@oxymot.fr','sink@dest.invalid',tag,'587'])
 for _ in range(80):
  pending=next((x for x in queue() if any(y['address']=='sink@dest.invalid' and 'certificate' in y.get('delay_reason','').lower() for y in x['recipients'])),None)
  if pending:break
  time.sleep(.25)
 assert pending and pending['queue_name']=='deferred' and not events()
 file.write_bytes(original);comp('up','-d','--force-recreate','mx');comp('exec','-T','postfix','postqueue','-c','/config','-f')
 for _ in range(80):
  delivered=events()
  if delivered:break
  time.sleep(.25)
 assert len(delivered)==1 and delivered[0]['tls'] and not any(x['queue_id']==pending['queue_id'] for x in queue())
 result={'status':'PASS_NATIVE_STRICT_EXPIRED_MX','checks':[{'name':'expired-chain-no-plaintext-fallback','status':'PASS','deferred':pending},{'name':'valid-MX-recovery-once-with-TLS','status':'PASS','receiver':delivered[0]}],'certificate_sha256':hashlib.sha256((fixture/'receiver.pem').read_bytes()).hexdigest(),'commands':commands};(base/'mx-expiry-result.json').write_text(json.dumps(result,indent=2));print(json.dumps({'status':result['status'],'queue_id':pending['queue_id']}))
finally:
 file.write_bytes(original);comp('up','-d','--force-recreate','mx');comp('exec','-T','postfix','postconf','-c','/config','-e','smtp_tls_security_level=may');comp('exec','-T','postfix','postfix','-c','/config','reload')
