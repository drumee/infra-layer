import sys
sys.dont_write_bytecode=True
sys.path.insert(0,'/tmp/il511-r6s/docs/evidence/IL-5.11-D2')
from secure_evidence import EvidenceDirectory
import subprocess,os,json,datetime,hashlib,time
from pathlib import Path
name,cwd,*command=sys.argv[1:]
with EvidenceDirectory.create() as out:
 print('EVIDENCE_ROOT='+str(out.path),flush=True)
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();start=time.monotonic()
 with out.open_new(name+'.txt') as log:
  p=subprocess.run(command,cwd=cwd,stdout=log,stderr=subprocess.STDOUT,timeout=2400)
 raw=out.read_bytes(name+'.txt')
 out.write_json(name+'.json',{'name':name,'source':subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=cwd,text=True).strip(),'clean_tree':not subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','--untracked-files=all'],cwd=cwd,text=True).strip(),'command':command,'cwd':cwd,'date':started,'elapsed_s':time.monotonic()-start,'exit_code':p.returncode,'uid':os.geteuid(),'gid':os.getegid(),'groups':os.getgroups(),'log_sha256':hashlib.sha256(raw).hexdigest(),'runner_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'output':str(out.path)})
 print(raw.decode(errors='replace')[-14000:],flush=True)
 print('EXIT='+str(p.returncode),flush=True)
 sys.exit(p.returncode)
