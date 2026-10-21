from pathlib import Path
import subprocess,json,hashlib,base64,tarfile,os
r=Path('/tmp/il511-D2-clean');out=Path('/tmp/il511-D2-results');prior=json.loads((r/'docs/evidence/IL-5.11-resume/D-artifact-receipt.json').read_text());source=subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=r,text=True).strip()
assert not subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','--untracked-files=all'],cwd=r,text=True).strip()
env=dict(os.environ,npm_config_cache='/tmp/drumee-il511r-npm-cache');packs=[]
for n in [1,2]:
 dest=out/('pack-'+str(n));dest.mkdir(exist_ok=True)
 result=subprocess.check_output(['/usr/bin/npm','pack','--json','--ignore-scripts','--pack-destination',str(dest)],cwd=r,env=env,text=True);metadata=json.loads(result)[0];packs.append(dest/metadata['filename']);(dest/'pack.json').write_text(result)
assert packs[0].read_bytes()==packs[1].read_bytes();data=packs[0].read_bytes();files={}
with tarfile.open(packs[0]) as t:
 for member in t.getmembers():
  assert member.isfile() and member.name.startswith('package/')
  name=member.name[len('package/'):]; assert '..' not in Path(name).parts and not Path(name).is_absolute()
  content=t.extractfile(member).read();assert content==(r/name).read_bytes();files[name]=hashlib.sha256(content).hexdigest()
assert files==prior['files'];sha=hashlib.sha256(data).hexdigest();sri='sha512-'+base64.b64encode(hashlib.sha512(data).digest()).decode();assert sha==prior['sha256'] and sri==prior['integrity']
manifest=json.loads((r/'package.json').read_text());assert not manifest.get('dependencies',{})
receipt={'source':source,'prior_executable_source':prior['source'],'clean_tree':True,'two_packs_identical':True,'members':len(files),'packed_bytes':len(data),'sha256':sha,'integrity':sri,'identical_to_previous_D_candidate':True,'files':files,'version':manifest['version'],'production_dependencies':manifest.get('dependencies',{}),'exports':manifest['exports'],'prepublication_scripts':{k:v for k,v in manifest['scripts'].items() if k in ['prepare','prepack','prepublish','prepublishOnly','publish','postpublish']}}
(out/'artifact-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items() if k not in ['files','exports']},indent=2))
