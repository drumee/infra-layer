import subprocess,pathlib,json,datetime,time,os,hashlib,sys
cwd=pathlib.Path('/tmp/il511-D2-clean');out=pathlib.Path('/tmp/il511-D2-results');env=dict(os.environ,npm_config_cache='/tmp/drumee-il511r-npm-cache',CHROME_BIN='/opt/google/chrome/chrome',IL5_HOST_NGINX='/tmp/drumee-il511r-nginx/extracted/usr/sbin/nginx',IL5_NETWORK_CLIENT='testbox',IL5_LAN_ADDRESS='192.168.5.201',IL5_TSC='/tmp/drumee-il510-types/node_modules/typescript/bin/tsc',IL5_APP_IMAGE='sha256:d44327e37d37c612257822684a870d05d7f90fdae649b2dcbfb8e9f0566e7955')
source=subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=cwd,text=True).strip()
assert not subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','--untracked-files=all'],cwd=cwd,text=True).strip()
steps=[('unit',['/usr/bin/npm','test']),('contracts',['/usr/bin/npm','run','test:contracts']),('gateway',['/usr/bin/npm','run','test:gateway']),('services',['/usr/bin/npm','run','test:services']),('lifecycle',['/usr/bin/npm','run','test:lifecycle']),('application',['/usr/bin/npm','run','test:application']),('package',['/usr/bin/npm','run','test:package']),('lint',['/usr/bin/npm','run','lint']),('audit-production',['/usr/bin/npm','audit','--omit=dev','--json']),('audit-development',['/usr/bin/npm','audit','--include=dev','--json']),('consumer',['/usr/bin/node','test/application/package-consumer.js'])]
receipts=[]
for name,command in steps:
 print('BEGIN '+name,flush=True);start=time.monotonic();date=datetime.datetime.now(datetime.timezone.utc).isoformat();log=out/(name+'.txt')
 with log.open('w') as f:
  result=subprocess.run(command,cwd=cwd,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=2200)
 receipt={'name':name,'command':command,'source':source,'started_utc':date,'elapsed_s':time.monotonic()-start,'exit_code':result.returncode,'log_sha256':hashlib.sha256(log.read_bytes()).hexdigest()};receipts.append(receipt)
 (out/'qualification-progress.json').write_text(json.dumps({'source':source,'steps':receipts,'complete':len(receipts)==len(steps),'stopped':result.returncode!=0},indent=2)+'\n')
 print(json.dumps(receipt),flush=True)
 if result.returncode:sys.exit(result.returncode)
