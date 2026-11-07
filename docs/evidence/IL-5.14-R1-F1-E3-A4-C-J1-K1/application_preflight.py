"""Read-only prerequisites for the unchanged canonical application acceptance."""
from pathlib import Path
import hashlib
import json
import subprocess

evidence = Path(__file__).resolve().parent
root = evidence.parents[2]
proxy = "/tmp/drumee-il513-c1-nginx/root/usr/sbin/nginx"
program = 'const T=require("./test/support/trusted-process"),os=require("node:os");console.log(JSON.stringify({node:process.version,undici:process.versions.undici,uid:process.getuid(),gid:process.getgid(),lanPresent:Object.values(os.networkInterfaces()).flat().some(x=>x.address==="192.168.5.201"&&!x.internal),ssh:T.trustedExecutable("ssh"),proxy:T.trustedExecutable(process.argv[1]),env:T.trustedEnvironment()}))'
data = json.loads(subprocess.check_output(["/usr/bin/node", "-e", program, proxy], cwd=root, text=True))
assert data["lanPresent"]
assert data["node"] == "v22.22.0"
ssh_command = [data["ssh"], "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", "testbox", "node", "--version"]
remote = subprocess.run(ssh_command, env=data["env"], text=True, capture_output=True, timeout=15)
assert remote.returncode == 0, "EXPLICIT_TEST_CLIENT_UNAVAILABLE"
assert remote.stdout.strip().startswith("v22.")
version = subprocess.run([data["proxy"], "-v"], env=data["env"], text=True, capture_output=True, timeout=10)
assert version.returncode == 0
record = {k: data[k] for k in ["node", "undici", "uid", "gid", "lanPresent", "ssh", "proxy"]}
record.update(client="testbox", lan="192.168.5.201", ssh_command=ssh_command,
              client_node=remote.stdout.strip(), proxy_version=(version.stdout + version.stderr).strip(),
              proxy_sha256=hashlib.sha256(Path(proxy).read_bytes()).hexdigest(),
              preflight="PASS", read_only=True, new_authorization_inferred=False)
(evidence / "application-preflight.json").write_text(json.dumps(record, indent=2) + "\n")
print(json.dumps(record))
