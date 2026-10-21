"use strict";
const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
// A tarball consumer with no imports from the source checkout. Its only runtime
// inputs are JSON and an explicitly identified, already built immutable image.
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const source = path.resolve(__dirname, "../.."), base = fs.mkdtempSync(path.join(os.tmpdir(), "drumee-il5-packed-consumer-"));
const command = (file, args, options = {}) => execFileSync(trustedExecutable(file), args, { encoding: "utf8", stdio: "pipe", ...options, env: trustedEnvironment(options.env) });
try {
  if (!/^sha256:[a-f0-9]{64}$/.test(process.env.IL5_APP_IMAGE || "") || !process.env.IL5_TSC) throw new Error("EXPLICIT_IMAGE_AND_TYPESCRIPT_REQUIRED");
  const packed = JSON.parse(command("npm", ["pack", "--json", "--pack-destination", base], { cwd: source }))[0];
  const consumer = path.join(base, "consumer"), root = path.join(base, "deployment"), project = "drumee-il5-consumer-" + crypto.randomBytes(4).toString("hex"); fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, "package.json"), JSON.stringify({ name: "isolated-il5-consumer", version: "1.0.0", private: true }));
  command("npm", ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", path.join(base, packed.filename)], { cwd: consumer });
  const value = require("../support/application-inputs").applicationInputs(root, project, process.env.IL5_APP_IMAGE);
  const ref = { resource: "application", key: "signing" }; value.spec.secrets.resources.push({ ref, type: "application-secret", consumers: ["application"] }); value.requirements.secret_refs = [ref];
  value.distribution.application.secret_mounts = [{ ref, consumer: "application", target: "/run/secrets/signing", format: "raw" }];
  value.distribution.persistent_resources = [{ id: "application-state", source: root + "/durable/application-state", uid: process.getuid(), gid: process.getgid(), backup_required: true }];
  value.distribution.provenance.revision = command("git", ["rev-parse", "HEAD"], { cwd: source }).trim(); value.distribution.provenance.acceptance = "real-application";
  fs.writeFileSync(path.join(consumer, "inputs.json"), JSON.stringify(value));
  fs.copyFileSync(path.join(__dirname, "consumer-refusals.cjs"), path.join(consumer, "consumer-refusals.cjs"));
  fs.writeFileSync(path.join(consumer, "check.js"), `"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs'),api=require('@drumee/infra-layer'),L=require('@drumee/infra-layer/lifecycle'),input=require('./inputs.json');
(async()=>{assert.deepEqual(Object.keys(api).sort(),['diagnoseInfrastructure','inspectInfrastructure','planInfrastructure','renderPlan','validateSpec']);assert.equal(api.validateSpec(input.spec,input.requirements).valid,true);const plan=api.planInfrastructure(input.spec,input.requirements,input.adapter_input);assert.equal(plan.applicable,true);assert.equal(plan.required_secrets.length,1);const composition=L.composeDeployment(plan,input.distribution);assert.deepEqual(Object.keys(composition.compose.services),['application']);const context={root:${JSON.stringify(root)},authorized:true,create_resources:true};const prepared=await L.prepareDeployment(composition,context);assert.equal(prepared.activated,false);assert.equal(prepared.fingerprints.length,1);assert.equal((await L.prepareDeployment(composition,context)).revision,prepared.revision);await require("./consumer-refusals.cjs")(input);console.log(JSON.stringify({status:'passed',assertions:8,real_preparation:true,activated:false,revision:prepared.revision}));})().catch(e=>{console.error(e.code||e.message);process.exitCode=1});`);
  fs.writeFileSync(path.join(consumer, "check.ts"), `import {planInfrastructure, KernelInfrastructureRequirementsV2, SecretRef} from '@drumee/infra-layer';
import {SuppliedApplication, ExternalGateway, Distribution, prepareDeployment, composeDeployment, inspectDeployment, backupDeployment, restoreDeployment, rollbackDeployment} from '@drumee/infra-layer/lifecycle';
const ref: SecretRef={resource:'application',key:'signing'};
const app: SuppliedApplication={id:'application',image:'sha256:'+'a'.repeat(64),uid:1000,gid:1000,command:['node','host.js'],plugins:[{id:'qualification',root:'/app/plugins/qualification',revision:'b'.repeat(40)}],requires:[],mounts:[],secret_mounts:[{ref,consumer:'application',target:'/run/secrets/key',format:'raw'},{ref,consumer:'application',target:'/run/secrets/ca',format:'tls-ca-bundle'}],listener_ports:[3101],healthcheck:{test:['CMD','node','health.js'],retries:3}};
const gateway: ExternalGateway={kind:'host-loopback',protocol:'http',host_address:'127.0.0.1',host_port:28971,container_port:3101,route_prefix:'/-/',rpc_prefix:'/-/svc/',tls_termination:'external',readiness_path:'/-/svc/health.ready'};
const requirements: KernelInfrastructureRequirementsV2={contract_version:'2',capabilities:[],secret_refs:[ref]};
const profile: Distribution['profile']='application'; void [app,gateway,requirements,profile,planInfrastructure,prepareDeployment,composeDeployment,inspectDeployment,backupDeployment,restoreDeployment,rollbackDeployment];
// @ts-expect-error public bindings are forbidden by the public literal type
const unsafe: ExternalGateway['host_address']='0.0.0.0'; void unsafe;
`);
  command(process.execPath, [process.env.IL5_TSC, "--strict", "--noEmit", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--target", "ES2022", "check.ts"], { cwd: consumer });
  const output = command(process.execPath, ["check.js"], { cwd: consumer }).trim().split("\n");
  console.log(output.slice(0, -1).join("\n"));
  const result = JSON.parse(output.at(-1)); assert.equal(result.real_preparation, true);
  console.log(JSON.stringify({ ...result, package: packed.name, version: packed.version, integrity: packed.integrity, files: packed.files.length, production_dependencies: [], types: "strict-NodeNext-passed", source_revision: value.distribution.provenance.revision }));
} finally { fs.rmSync(base, { recursive: true, force: true }); }
