"""Install the retained tarball; run public/runtime closure and canonical types."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess

evidence = Path(__file__).resolve().parent
root = evidence.parents[2]
identity = json.loads((evidence / "package-identity.json").read_text())
base = Path(json.loads((evidence / "baseline.json").read_text())["private_directory"])
consumer = base / "consumer"
consumer.mkdir(mode=0o700)
(consumer / "package.json").write_text('{"name":"isolated-k1-consumer","version":"1.0.0","private":true}')
tools = json.loads(subprocess.check_output(["/usr/bin/node", "-e", 'const T=require("./test/support/trusted-process");console.log(JSON.stringify({node:T.trustedExecutable(process.execPath),npm:T.trustedExecutable("npm"),env:T.trustedEnvironment()}))'], cwd=root, text=True))
assert hashlib.sha256(Path(identity["archive"]).read_bytes()).hexdigest() == identity["sha256"]
subprocess.run([tools["node"], tools["npm"], "install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", identity["archive"]], cwd=consumer, env=tools["env"], check=True)
program = r'''"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),{createRequire}=require("node:module");
const expected=path.join(process.cwd(),"node_modules/@drumee/infra-layer"), controls=[];
assert.equal(fs.realpathSync(expected),expected);controls.push("installed archive, no source symlink");
const api=require("@drumee/infra-layer"),L=require("@drumee/infra-layer/lifecycle");
assert.deepEqual(Object.keys(api).sort(),["diagnoseInfrastructure","inspectInfrastructure","planInfrastructure","renderPlan","validateSpec"]);controls.push("CommonJS root API");
assert.equal(typeof L.rollbackDeployment,"function");assert.equal(typeof L.activateDeployment,"function");controls.push("public lifecycle rollback API");
for(const name of Object.keys(require("@drumee/infra-layer/package.json").exports).filter(name=>!name.includes("*"))){const specifier=name==="."?"@drumee/infra-layer":"@drumee/infra-layer"+name.slice(1);assert.ok(require.resolve(specifier).startsWith(expected+path.sep));require(specifier);}controls.push("public exports resolve inside installed package");
const activation=require.resolve("@drumee/infra-layer/lifecycle/activation"),local=createRequire(activation);
const helper=local("../internal/rollback-authorization");assert.equal(typeof helper.authorizeRollback,"function");controls.push("helper loads through actual activation module context");
assert.throws(()=>helper.authorizeRollback({},[],null,null,{authorized:false}),{code:"ROLLBACK_OPERATION_NOT_AUTHORIZED"});controls.push("loaded helper preserves non-destructive refusal");
assert.deepEqual(Object.keys(require("@drumee/infra-layer/package.json").dependencies||{}),[]);controls.push("empty production dependency graph");
for(const file of Object.keys(require.cache).filter(file=>file.includes("infra-layer")))assert.ok(file.startsWith(expected+path.sep));controls.push("no source-tree module fallback");
const broken=path.join(process.cwd(),"broken"),brokenPackage=path.join(broken,"node_modules/@drumee/infra-layer");
fs.mkdirSync(path.dirname(brokenPackage),{recursive:true});fs.cpSync(expected,brokenPackage,{recursive:true});fs.unlinkSync(path.join(brokenPackage,"internal/rollback-authorization.js"));
const brokenContext=createRequire(path.join(brokenPackage,"lifecycle/activation.js"));assert.throws(()=>brokenContext("../internal/rollback-authorization"),error=>error.code==="MODULE_NOT_FOUND"&&error.message.includes("rollback-authorization"));controls.push("missing-helper negative dependency control");
fs.rmSync(broken,{recursive:true,force:true});controls.push("negative fixture cleanup");
console.log(JSON.stringify({controls:controls.length,records:controls,installed_package:expected,activation}));
'''
(consumer / "check.cjs").write_text(program)
(evidence / "consumer-program.txt").write_text(program)
subprocess.run([tools["node"], "check.cjs"], cwd=consumer, env=tools["env"], check=True)
# Reuse the exact canonical public strict-consumer TypeScript program, on this archive.
canonical = (root / "test/application/package-consumer.js").read_text()
typescript = canonical.split('fs.writeFileSync(path.join(consumer, "check.ts"), `', 1)[1].split('`);', 1)[0]
assert "${" not in typescript
(consumer / "check.ts").write_text(typescript)
compiler_root = Path("/tmp/drumee-il514-r1-f1-e3-a2-nceslj52/typescript-tool")
compiler = compiler_root / "node_modules/typescript/lib/tsc.js"
version = json.loads((compiler_root / "node_modules/typescript/package.json").read_text())["version"]
assert version == "5.9.3"
subprocess.run([tools["node"], str(compiler), "--strict", "--noEmit", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--target", "ES2022", "check.ts"], cwd=consumer, env=tools["env"], check=True)
record = dict(package_sha256=identity["sha256"], consumer=str(consumer), commonjs_controls=10,
              canonical_types="strict-NodeNext-passed", typescript=version,
              compiler_sha256=hashlib.sha256(compiler.read_bytes()).hexdigest(),
              typescript_program_sha256=hashlib.sha256(typescript.encode()).hexdigest(),
              program_sha256=hashlib.sha256(program.encode()).hexdigest(),
              verifier_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              broken_fixture_removed=True, consumer_retained_for_independent_review=True)
(evidence / "consumer-identity.json").write_text(json.dumps(record, indent=2) + "\n")
print(json.dumps(record))
