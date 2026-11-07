"""V1-F2 test-only command recorder: no retries or shell; frozen source enforced."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

evidence = Path(__file__).resolve().parent
root = evidence.parents[2]
baseline = json.loads((evidence / "baseline.json").read_text())
private = Path(baseline["private_directory"])
name, *command = sys.argv[1:]
assert name.replace("-", "").isalnum() and command
cwd = Path(os.environ.get("CONVERGENCE_COMMAND_CWD", root)).resolve()

def frozen():
    return all(hashlib.sha256((root / p).read_bytes()).hexdigest() == h
               for p, h in {**baseline["frozen_inputs"], **baseline["harness_sha256"]}.items())

def protected():
    records = []
    for p in [Path("/etc/docker"), *sorted(Path("/etc/docker").rglob("*"))]:
        s = p.lstat()
        records.append(dict(path=str(p), uid=s.st_uid, gid=s.st_gid, mode=s.st_mode,
                            link=os.readlink(p) if p.is_symlink() else None,
                            sha256=hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None))
    return records

assert frozen(), "QUALIFICATION_INPUT_CHANGED"
assert not (evidence / "STOP.json").exists(), "MANDATORY_FAILURE_ALREADY_RECORDED"
before = protected()
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
logfile = private / (name + ".log")
with logfile.open("xb") as log:
    os.chmod(logfile, 0o600)
    result = subprocess.run(command, cwd=cwd, stdout=log, stderr=subprocess.STDOUT)
after = protected()
unchanged = frozen()
exit_code = result.returncode if before == after and unchanged else 99
shutil.copyfile(logfile, evidence / logfile.name)
os.chmod(evidence / logfile.name, 0o600)
record = dict(name=name, command=command, cwd=str(cwd), source=subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip(),
              qualified_reference=baseline["qualified_source"], attempt=baseline["attempt"],
              uid=os.getuid(), gid=os.getgid(), started=started,
              ended=datetime.datetime.now(datetime.timezone.utc).isoformat(),
              exit_code=exit_code, process_returncode=result.returncode,
              protected_before=before, protected_after=after,
              protected_unchanged=before == after, frozen_inputs_unchanged=unchanged,
              log=logfile.name, log_sha256=hashlib.sha256(logfile.read_bytes()).hexdigest())
with (evidence / "execution.jsonl").open("a") as ledger:
    ledger.write(json.dumps(record) + "\n")
if exit_code:
    (evidence / "STOP.json").write_text(json.dumps(record, indent=2) + "\n")
print(json.dumps({k: record[k] for k in ["name", "exit_code", "protected_unchanged", "frozen_inputs_unchanged", "log"]}))
print("\n".join(logfile.read_text(errors="replace").splitlines()[-18:]))
sys.exit(exit_code)
