"""Independent K1 package verification; source and production are read-only."""
from pathlib import Path
import base64
import datetime
import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import tarfile

evidence = Path(__file__).resolve().parent
root = evidence.parents[3]
directory = Path(json.loads((evidence / "location.json").read_text())["review_directory"])
source = "20c8a2931dc95f6beca1eb7ac2c0fbe5282194ee"
assert subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip() == source
tools = json.loads(subprocess.check_output(["/usr/bin/node", "-e", 'const T=require("./test/support/trusted-process");console.log(JSON.stringify({node:T.trustedExecutable(process.execPath),npm:T.trustedExecutable("npm"),env:T.trustedEnvironment()}))'], cwd=root, text=True))
receipts = []

def protected():
    return [dict(path=str(p), uid=p.lstat().st_uid, gid=p.lstat().st_gid,
                 mode=p.lstat().st_mode,
                 sha256=hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None)
            for p in [Path("/etc/docker"), *sorted(Path("/etc/docker").rglob("*"))]]

def run(name, command, cwd=root):
    before = protected()
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    path = evidence / (name + ".log")
    with path.open("xb") as output:
        os.chmod(path, 0o600)
        result = subprocess.run(command, cwd=cwd, env=tools["env"], stdout=output, stderr=subprocess.STDOUT)
    after = protected()
    record = dict(name=name, command=command, cwd=str(cwd), source=source,
                  uid=os.getuid(), gid=os.getgid(), started=started,
                  ended=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  exit_code=result.returncode, protected_unchanged=before == after,
                  protected_before=before, protected_after=after,
                  log=path.name, log_sha256=hashlib.sha256(path.read_bytes()).hexdigest())
    receipts.append(record)
    (evidence / "execution.json").write_text(json.dumps(receipts, indent=2) + "\n")
    assert result.returncode == 0 and before == after, name

paths = ["test/package-audit.js", "test/support/package-inventory.cjs", "test/unit/package-inventory.test.js", "internal/rollback-authorization.js", "lifecycle/index.js", "lifecycle/recovery.js", "lifecycle/activation.js", "package.json", "package-lock.json", "test/application/package-consumer.js"]
hashes = {name: hashlib.sha256((root / name).read_bytes()).hexdigest() for name in paths}
assert not subprocess.check_output(["git", "diff", "--name-only", "fd708aa", "HEAD", "--", "internal", "lifecycle", "lib", "capabilities", "adapters", "package.json", "package-lock.json", "index.d.ts"], cwd=root, text=True).strip()
run("independent-inventory-regressions", [tools["node"], "--test", "test/unit/package-inventory.test.js"])
run("independent-canonical-package-audit", [tools["node"], "test/package-audit.js"])

archive = Path("/tmp/drumee-k1-l0h17j68/candidate/drumee-infra-layer-0.1.0-alpha.3.tgz")
data = archive.read_bytes()
digest = hashlib.sha256(data).hexdigest()
assert digest == "004f018288018f678ed044c56ee4b9de520ab9ec9bc0e7deb3b6d59c172f99e1"
with tarfile.open(archive, "r:gz") as tar:
    members = tar.getmembers()
    assert len(members) == 43 and all(m.isfile() and m.name.startswith("package/") for m in members)
    contents = {m.name.removeprefix("package/"): tar.extractfile(m).read() for m in members}
assert len(contents) == 43 and "internal/rollback-authorization.js" in contents
assert all(value == (root / name).read_bytes() for name, value in contents.items())
assert not any(name.startswith("test/") for name in contents)
assert {name for name in contents if name.startswith("internal/")} == {"internal/system-tools.js", "internal/network-readiness.js", "internal/rollback-authorization.js"}
identity = json.loads((evidence.parent / "package-identity.json").read_text())
assert set(contents) == set(identity["member_hashes"])
assert all(hashlib.sha256(value).hexdigest() == identity["member_hashes"][name] for name, value in contents.items())
assert identity["npm_integrity"] == "sha512-" + base64.b64encode(hashlib.sha512(data).digest()).decode()

consumer = directory / "valid-consumer"
consumer.mkdir(mode=0o700)
(consumer / "package.json").write_text('{"name":"independent-package-review","version":"1.0.0","private":true}')
run("independent-install", [tools["node"], tools["npm"], "install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", str(archive)], consumer)
program = r'''"use strict";
const assert=require("node:assert/strict"),path=require("node:path"),fs=require("node:fs"),{createRequire}=require("node:module");
const consumer=process.argv[2], mode=process.argv[3],load=createRequire(path.join(consumer,"package.json"));
const installed=path.join(consumer,"node_modules/@drumee/infra-layer");
assert.equal(fs.realpathSync(installed),installed);
const api=load("@drumee/infra-layer"),lifecycle=load("@drumee/infra-layer/lifecycle");
assert.deepEqual(Object.keys(api).sort(),["diagnoseInfrastructure","inspectInfrastructure","planInfrastructure","renderPlan","validateSpec"]);
assert.equal(typeof lifecycle.rollbackDeployment,"function");
for(const name of Object.keys(load("@drumee/infra-layer/package.json").exports).filter(name=>!name.includes("*"))){const specifier=name==="."?"@drumee/infra-layer":"@drumee/infra-layer"+name.slice(1);assert.ok(load.resolve(specifier).startsWith(installed+path.sep));load(specifier);}
const activation=load.resolve("@drumee/infra-layer/lifecycle/activation"),context=createRequire(activation);
if(mode==="missing"){
 assert.throws(()=>context("../internal/rollback-authorization"),error=>error.code==="MODULE_NOT_FOUND"&&error.message.includes("rollback-authorization"));
 console.log("CONTROLLED_MISSING_ARCHIVE_HELPER_DETECTED");
}else{
 const helper=context("../internal/rollback-authorization");assert.equal(typeof helper.authorizeRollback,"function");
 assert.throws(()=>helper.authorizeRollback({},[],null,null,{authorized:false}),{code:"ROLLBACK_OPERATION_NOT_AUTHORIZED"});
 for(const file of Object.keys(require.cache).filter(file=>file.includes("/infra-layer/")))assert.ok(file.startsWith(installed+path.sep));
 console.log("INDEPENDENT_INSTALLED_PUBLIC_API_AND_ROLLBACK_CLOSURE_PASS");
}
'''
(directory / "runtime-check.cjs").write_text(program)
(evidence / "runtime-check.txt").write_text(program)
run("independent-installed-runtime", [tools["node"], str(directory / "runtime-check.cjs"), str(consumer), "valid"], consumer)
canonical = (root / "test/application/package-consumer.js").read_text()
types = canonical.split('fs.writeFileSync(path.join(consumer, "check.ts"), `', 1)[1].split('`);', 1)[0]
assert "${" not in types
(consumer / "check.ts").write_text(types)
compiler = Path("/tmp/drumee-il514-r1-f1-e3-a2-nceslj52/typescript-tool/node_modules/typescript/lib/tsc.js")
run("independent-strict-types", [tools["node"], str(compiler), "--strict", "--noEmit", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--target", "ES2022", "check.ts"], consumer)

broken_archive = directory / "controlled-missing-helper.tgz"
with tarfile.open(broken_archive, "w:gz") as tar:
    for member in members:
        name = member.name.removeprefix("package/")
        if name != "internal/rollback-authorization.js":
            tar.addfile(member, io.BytesIO(contents[name]))
broken = directory / "broken-consumer"
broken.mkdir(mode=0o700)
(broken / "package.json").write_text('{"name":"independent-broken-package-review","version":"1.0.0","private":true}')
run("independent-controlled-broken-install", [tools["node"], tools["npm"], "install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", str(broken_archive)], broken)
run("independent-missing-helper-negative", [tools["node"], str(directory / "runtime-check.cjs"), str(broken), "missing"], broken)
shutil.rmtree(broken)
shutil.rmtree(consumer)
assert not broken.exists() and not consumer.exists()
assert hashes == {name: hashlib.sha256((root / name).read_bytes()).hexdigest() for name in paths}
record = dict(source=source, source_hashes=hashes, archive=str(archive), archive_sha256=digest,
              archive_size=len(data), member_count=len(contents), member_hashes=identity["member_hashes"],
              computed_dispatch="lib/plan-v2.js finite dns/database/redis/mail; dkim maps to mail",
              compiler_sha256=hashlib.sha256(compiler.read_bytes()).hexdigest(),
              typescript_program_sha256=hashlib.sha256(types.encode()).hexdigest(),
              controlled_missing_archive_sha256=hashlib.sha256(broken_archive.read_bytes()).hexdigest(),
              independent_consumer_directories_removed=True, no_Docker_campaign=True,
              review_script_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest())
(evidence / "inspection.json").write_text(json.dumps(record, indent=2) + "\n")
print(json.dumps(dict(source=source, archive_sha256=digest, commands=len(receipts), all_exits=0,
                      cleanup=True, focused_review="completed")))
