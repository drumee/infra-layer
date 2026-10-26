import pathlib,datetime,json,subprocess,sys,hashlib,os
out=pathlib.Path(__file__).parent
name,cwd,*command=sys.argv[1:]
def snapshot(root):
 root=pathlib.Path(root);entries=[]
 def visit(p):
  s=p.lstat();row=dict(path=str(p.relative_to(root)),uid=s.st_uid,gid=s.st_gid,mode=s.st_mode)
  if p.is_symlink():row['link']=os.readlink(p)
  elif p.is_file():row['sha256']=hashlib.sha256(p.read_bytes()).hexdigest()
  entries.append(row)
  if p.is_dir() and not p.is_symlink():
   for child in sorted(p.iterdir()):visit(child)
 if root.exists():visit(root)
 return entries
before=snapshot('/etc/docker');start=datetime.datetime.now(datetime.timezone.utc).isoformat()
with (out/(name+'.log')).open('xb') as log:
 result=subprocess.run(command,cwd=cwd,stdout=log,stderr=subprocess.STDOUT)
record=dict(name=name,cwd=cwd,command=command,source_commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd='/home/somanos/github/infra-layer',text=True).strip(),uid=os.getuid(),gid=os.getgid(),started_at=start,ended_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),exit_code=result.returncode,protected_before=before,protected_after=snapshot('/etc/docker'),log_sha256=hashlib.sha256((out/(name+'.log')).read_bytes()).hexdigest())
record['protected_unchanged']=record['protected_before']==record['protected_after']
with (out/'execution.jsonl').open('a') as f:f.write(json.dumps(record)+'\n')
print(json.dumps({k:v for k,v in record.items() if not k.startswith('protected_')}|dict(protected_unchanged=record['protected_unchanged'])))
sys.exit(result.returncode if record['protected_unchanged'] else 99)
