from pathlib import Path
import os,subprocess,json,hashlib,base64,tarfile,datetime,time,sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(exist_ok=True)
source=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();assert not subprocess.check_output(['git','status','--porcelain=v1','--untracked-files=all'],cwd=root,text=True).strip()
reference='dbc0be5c20029374c68bdf510dfadd7da079fcf6'
changed=subprocess.check_output(['git','diff','--name-only',reference,source,'--','.',':!docs'],cwd=root,text=True).splitlines();assert not changed,changed
prior=json.loads((root/'docs/evidence/IL-5.11-D2/D2-artifact-receipt.json').read_text())
assert all(hashlib.sha256((root/n).read_bytes()).hexdigest()==v for n,v in prior['files'].items())
env=dict(os.environ,npm_config_cache='/tmp/drumee-il511r-npm-cache',IL5_TSC='/tmp/drumee-il510-types/node_modules/typescript/bin/tsc',IL5_APP_IMAGE='sha256:d44327e37d37c612257822684a870d05d7f90fdae649b2dcbfb8e9f0566e7955')
steps=[('install',['npm','ci','--ignore-scripts','--no-audit','--no-fund','--offline']),('unit',['npm','test']),('contracts',['npm','run','test:contracts']),('system-tools',['npm','run','test:system-tools']),('package',['npm','run','test:package']),('lint',['npm','run','lint']),('audit-production',['npm','audit','--omit=dev','--json']),('audit-development',['npm','audit','--include=dev','--json']),('consumer',['node','test/application/package-consumer.js'])]
results=[]
for name,args in steps:
 start=time.monotonic();log=out/(name+'.txt')
 with log.open('w') as f:p=subprocess.run(args,cwd=root,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=180)
 result={'name':name,'command':args,'exit_code':p.returncode,'seconds':time.monotonic()-start,'sha256':hashlib.sha256(log.read_bytes()).hexdigest()};results.append(result);print(json.dumps(result),flush=True)
 (out/'steps.json').write_text(json.dumps(results,indent=2)+'\n')
 if p.returncode:sys.exit(p.returncode)
packs=[]
for n in [1,2]:
 dest=out/('pack-'+str(n));dest.mkdir(exist_ok=True);meta=json.loads(subprocess.check_output(['npm','pack','--ignore-scripts','--json','--pack-destination',str(dest)],cwd=root,env=env,text=True))[0];packs.append(dest/meta['filename'])
assert packs[0].read_bytes()==packs[1].read_bytes();data=packs[0].read_bytes();files={}
with tarfile.open(packs[0]) as archive:
 for member in archive.getmembers():
  assert member.isfile() and member.name.startswith('package/');name=member.name[8:];content=archive.extractfile(member).read();assert content==(root/name).read_bytes();files[name]=hashlib.sha256(content).hexdigest()
sha=hashlib.sha256(data).hexdigest();sri='sha512-'+base64.b64encode(hashlib.sha512(data).digest()).decode();assert files==prior['files'] and sha==prior['sha256'] and sri==prior['integrity']
assert not subprocess.check_output(['git','status','--porcelain=v1','--untracked-files=all'],cwd=root,text=True).strip()
receipt={'date_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':source,'tree':subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=root,text=True).strip(),'D2_source':reference,'non_documentary_changes_since_D2':changed,'clean_tree_before_after':True,'members':len(files),'packed_bytes':len(data),'sha256':sha,'integrity':sri,'two_packs_identical':True,'identical_to_D2':True,'files':files,'package_lock_sha256':hashlib.sha256((root/'package-lock.json').read_bytes()).hexdigest(),'public_types_sha256':{n:files[n] for n in ['index.d.ts','lifecycle/index.d.ts']},'exports':json.loads((root/'package.json').read_text())['exports'],'production_dependencies':json.loads((root/'package.json').read_text()).get('dependencies',{}),'heavy_tests_reused_by_identity':['gateway 17/17','services 17/17 + campaign 3 x17/17','lifecycle 16/16','application 87 assertions'],'steps':results}
(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items() if k not in ['files','steps','exports','public_types_sha256']},indent=2))
