import sys
sys.dont_write_bytecode=True
sys.path.insert(0,'/tmp/il511-r6s/docs/evidence/IL-5.11-D2')
from secure_evidence import EvidenceDirectory
from pathlib import Path
import os,hashlib,json,datetime
source=Path(sys.argv[1]);name=sys.argv[2]
parent=Path('/tmp/il511-r6s/docs/evidence/IL-5.11-R6S-D4')
with EvidenceDirectory(os.open(source,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW),source) as old:
 with EvidenceDirectory.create(parent,name) as out:
  hashes={}
  def copy_files(src,dest,prefix=''):
   for p in sorted(src.path.iterdir()):
    if p.name=='npm-cache':continue
    if p.is_dir():
     if p.name not in ('pack-1','pack-2'):continue
     with EvidenceDirectory(os.open(p,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW),p) as child:
      with dest.child(p.name) as newchild:copy_files(child,newchild,prefix+p.name+'/')
     continue
    if p.suffix=='.tgz':continue
    data=src.read_bytes(p.name)
    with dest.open_new(p.name) as f:f.write(data.decode('utf-8'))
    hashes[prefix+p.name]=hashlib.sha256(data).hexdigest()
  copy_files(old,out)
  out.write_json('export.json',{'source_private_root':str(source),'recorded_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'unchanged_bytes':True,'files_sha256':hashes,'omitted':['npm-cache','*.tgz'],'exporter_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()})
 print(out.path)
