"""Shared command recording; scenario paths remain owned by each entry point."""
import datetime
import hashlib
import json
import os
import pathlib
import subprocess

def protected():
    result = []
    for entry in [pathlib.Path("/etc/docker"), *sorted(pathlib.Path("/etc/docker").rglob("*"))]:
        info = entry.lstat()
        result.append(dict(path=str(entry), mode=info.st_mode, uid=info.st_uid, gid=info.st_gid,
                           sha256=hashlib.sha256(entry.read_bytes()).hexdigest() if entry.is_file() else None,
                           link=os.readlink(entry) if entry.is_symlink() else None))
    return result


def record_command(root, evidence, diagnostic_directories, argv):
    output = pathlib.Path(json.loads((evidence / "baseline.json").read_text())["private_directory"])
    name, *command = argv
    assert name.replace("-", "").isalnum() and command

    before = protected()
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with (output / (name + ".log")).open("xb") as log:
        os.chmod(log.name, 0o600)
        result = subprocess.run(command, cwd=root, stdout=log, stderr=subprocess.STDOUT)
    after = protected()
    record = dict(name=name, command=command, cwd=str(root),
                  source=subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip(),
                  diagnostic_hashes={str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
                                     for p in sorted(p for directory in diagnostic_directories for p in directory.glob("*.cjs"))},
                  started=started, ended=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  uid=os.getuid(), gid=os.getgid(), exit=result.returncode,
                  log=str(output / (name + ".log")),
                  log_sha256=hashlib.sha256((output / (name + ".log")).read_bytes()).hexdigest(),
                  protected_before=before, protected_after=after, protected_unchanged=before == after)
    with (evidence / "execution.jsonl").open("a") as log:
        log.write(json.dumps(record) + "\n")
    print(json.dumps(record))
    return result.returncode if before == after else 99
