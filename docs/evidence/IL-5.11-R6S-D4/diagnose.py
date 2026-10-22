import sys
sys.dont_write_bytecode=True
from pathlib import Path
REPOSITORY = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPOSITORY / 'docs/evidence/IL-5.11-D2'))
from secure_evidence import EvidenceDirectory
import os,subprocess,json,datetime,stat,hashlib
from pathlib import Path

def stamp():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def main():
 with EvidenceDirectory.create() as out:
  print('EVIDENCE_ROOT='+str(out.path),flush=True)
  source=subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=REPOSITORY,text=True).strip()
  records=[]
  def run(name,args):
   start=stamp();p=subprocess.run(args,capture_output=True,text=True,timeout=90)
   for kind,data in [('stdout',p.stdout),('stderr',p.stderr)]:
    with out.open_new(name+'.'+kind+'.txt') as f:f.write(data)
   item={'name':name,'command':args,'date':start,'finished':stamp(),'exit_code':p.returncode,'stdout_sha256':hashlib.sha256(p.stdout.encode()).hexdigest(),'stderr_sha256':hashlib.sha256(p.stderr.encode()).hexdigest()};records.append(item)
   print(json.dumps({'name':name,'exit_code':p.returncode,'stdout':p.stdout[:6000],'stderr':p.stderr[:6000]}),flush=True)
   return p
  run('docker-version',['/usr/bin/docker','version','--format','{{json .}}'])
  run('compose-version',['/usr/bin/docker','compose','version'])
  run('docker-security',['/usr/bin/docker','info','--format','{{json .SecurityOptions}} {{json .DriverStatus}} {{.DockerRootDir}}'])
  run('filesystem',['/usr/bin/stat','-f','-c','%T %t',str(out.path)])
  with out.child('fixture') as fixture:
   os.mkdir('foreign',mode=0o755,dir_fd=fixture.fd)
   parent=fixture.path/'foreign'
   image='node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392'
   base=['/usr/bin/docker','run','--rm','--network','none','--read-only','--cap-drop=ALL','--cap-add=CHOWN','--user','0:0','--mount','type=bind,source='+str(fixture.path)+',target=/fixture']
   cidfile=str(out.path/'original.cid')
   original=run('historical-chown',base+['--cidfile',cidfile,image,'/usr/local/bin/node','-e','require("node:fs").chownSync(process.argv[1],+process.argv[2],+process.argv[3])','/fixture/foreign','65532','65532'])
   cid=out.read_bytes('original.cid').decode().strip() if (out.path/'original.cid').exists() else None
   if cid:run('historical-container-state',['/usr/bin/docker','inspect',cid])
   run('access-diagnostic',base+[image,'/usr/local/bin/node','-e',r'''const fs=require('node:fs');console.log(JSON.stringify({uid:process.getuid(),gid:process.getgid(),groups:process.getgroups(),namespace:fs.readFileSync('/proc/self/uid_map','utf8'),status:fs.readFileSync('/proc/self/status','utf8').split('\n').filter(x=>/^(Cap|Seccomp|NoNewPrivs)/.test(x)),root:{uid:fs.statSync('/fixture').uid,gid:fs.statSync('/fixture').gid,mode:(fs.statSync('/fixture').mode&511).toString(8)}}));try{fs.statSync('/fixture/foreign')}catch(e){console.error(JSON.stringify({phase:'access-to-child',code:e.code,syscall:e.syscall,path:e.path}));process.exitCode=1}'''])
   after=os.stat(parent,follow_symlinks=False)
   out.write_json('diagnostic.json',{'source':source,'date':stamp(),'operator':{'uid':os.geteuid(),'gid':os.getegid(),'groups':os.getgroups()},'environment':{k:os.environ.get(k) for k in ['PATH','DOCKER_HOST','DOCKER_CONTEXT']},'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'fixture':{'path':str(fixture.path),'uid':os.stat(fixture.path).st_uid,'gid':os.stat(fixture.path).st_gid,'mode':oct(stat.S_IMODE(os.stat(fixture.path).st_mode))},'foreign_after_failed_setup':{'uid':after.st_uid,'gid':after.st_gid,'mode':oct(stat.S_IMODE(after.st_mode)),'entries':os.listdir(parent)},'container_id':cid,'commands':records})
  print('DONE='+str(out.path),flush=True)

if __name__ == '__main__':
 main()
