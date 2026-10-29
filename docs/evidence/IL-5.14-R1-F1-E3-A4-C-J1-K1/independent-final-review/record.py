"""Independent final-review command receipts; no shell or Docker mutations."""
from pathlib import Path
import subprocess, json, hashlib, datetime, os, sys, shutil
E=Path(__file__).resolve().parent
R=E.parents[3]
b=json.loads((E/"baseline.json").read_text());P=Path(b["private_directory"])
name,*cmd=sys.argv[1:]
assert name.replace("-","").isalnum() and cmd
assert not (E/"STOP.json").exists()
assert all(hashlib.sha256((R/p).read_bytes()).hexdigest()==h for p,h in b["input_hashes"].items())
def protected():
 out=[]
 for p in [Path("/etc/docker"),*sorted(Path("/etc/docker").rglob("*"))]:
  s=p.lstat();out.append(dict(path=str(p),uid=s.st_uid,gid=s.st_gid,mode=s.st_mode,sha256=hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None))
 return out
before=protected();started=datetime.datetime.now(datetime.timezone.utc).isoformat();log=P/(name+".log")
with log.open("xb") as f:
 os.chmod(log,0o600);result=subprocess.run(cmd,cwd=R,stdout=f,stderr=subprocess.STDOUT)
after=protected();same=all(hashlib.sha256((R/p).read_bytes()).hexdigest()==h for p,h in b["input_hashes"].items());code=result.returncode if same and before==after else 99
shutil.copyfile(log,E/log.name)
entry=dict(name=name,command=cmd,source=subprocess.check_output(["git","rev-parse","HEAD"],cwd=R,text=True).strip(),cwd=str(R),started=started,ended=datetime.datetime.now(datetime.timezone.utc).isoformat(),exit_code=code,source_unchanged=same,protected_before=before,protected_after=after,log=log.name,log_sha256=hashlib.sha256(log.read_bytes()).hexdigest())
with (E/"execution.jsonl").open("a") as f:f.write(json.dumps(entry)+"\n")
if code:(E/"STOP.json").write_text(json.dumps(entry,indent=2)+"\n")
print(json.dumps(entry));print("\n".join(log.read_text(errors="replace").splitlines()[-15:]))
sys.exit(code)
