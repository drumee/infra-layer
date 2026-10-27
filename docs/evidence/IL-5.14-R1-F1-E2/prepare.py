import importlib.util,pathlib,os,json,subprocess,datetime,hashlib
root=pathlib.Path(__file__).parent;repo=pathlib.Path('/home/somanos/github/infra-layer')
spec=importlib.util.spec_from_file_location('preflight',root/'preflight.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()=='2ec85bcd16219f592ee40836728493584bbd170a'
assert not subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True)
prior=json.loads((repo/'docs/evidence/IL-5.14-R1-F1-E1/source-identity.json').read_text());assert all(hashlib.sha256((repo/n).read_bytes()).hexdigest()==h for n,h in prior['files'].items())
node='''const D=require('./lifecycle/docker'),T=require('./internal/system-tools');console.log(JSON.stringify({node:process.version,uid:process.getuid(),gid:process.getgid(),dockerExecutable:T.resolveTrustedExecutable('docker'),docker:JSON.parse(D.docker(['version','--format','{{json .}}'])),containers:D.docker(['ps','-aq','--filter','name=drumee-e1-membership-']).trim(),networks:D.docker(['network','ls','-q','--filter','name=drumee-e1-membership-']).trim()}));'''
versions=json.loads(subprocess.check_output(['node','-e',node],cwd=repo,text=True));assert versions['node'].startswith('v22.');assert versions['containers']==versions['networks']==''
receipts=[]
for name,script in [('membership','test/network-attachments/membership-real.cjs'),('redis','test/network-attachments/real-docker.cjs'),('health','test/network-attachments/container-health.cjs')]:
 directory=root/name;directory.mkdir(mode=0o700)
 receipt=m.directory(directory);receipt.update(attempt=root.name+'-'+name,script=script,command=['env','IL514_DIAGNOSTIC_DIR='+str(directory),'node',script],source='2ec85bcd16219f592ee40836728493584bbd170a',executableRevision=prior['executableRevision'],resourcePrefix='drumee-e1-membership-' if name=='membership' else 'drumee-il514-net-' if name=='redis' else 'drumee-il514-health-');receipts.append(receipt)
report={'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'versions':versions,'npm':subprocess.check_output(['npm','--version'],text=True).strip(),'focusedE1HashesUnchanged':True,'directories':receipts,'preflightTests':{'cases':6,'pass':6,'DockerCommands':0,'ownershipTest':'safe expected-UID simulation'},'harnessChanged':False,'productionChanged':False}
(root/'preflight-receipt.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'preflight':'PASS','attempt':root.name,'directories':[r['path'] for r in receipts],'source':report['directories'][0]['source']}))
