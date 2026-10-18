"use strict";
const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), net = require("node:net"), http = require("node:http"), https = require("node:https"), crypto = require("node:crypto");
const strict = require("node:assert/strict"), { execFileSync, spawn, spawnSync } = require("node:child_process");
const publicRequire = require("node:module").createRequire(path.join(__dirname, "../../package.json"));
const L = publicRequire("@drumee/infra-layer/lifecycle"), D = require("../../lifecycle/docker");
const api = publicRequire("@drumee/infra-layer"), { applicationInputs, helper } = require("../support/application-inputs"), { serviceInputs } = require("../support/service-inputs");
let assertions = 0; const assert = new Proxy(strict, { get(target, key) { const value = target[key]; return typeof value === "function" ? (...args) => { assertions++; return value(...args); } : value; } });
const command = (file, args, options = {}) => execFileSync(trustedExecutable(file), args, { encoding: "utf8", stdio: "pipe", timeout: 300000, ...options, env: trustedEnvironment(options.env) });
const freePort = () => new Promise((resolve, reject) => { const s = net.createServer(); s.on("error", reject); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => resolve(p)); }); });
function request(port, service, input, tls) { return new Promise((resolve, reject) => { const req = (tls ? https : http).request({ hostname: "127.0.0.1", port, path: "/-/svc/" + service, method: "POST", agent: false, ...(tls ? { ca: tls, servername: "application.test", rejectUnauthorized: true } : {}), headers: { "content-type": "application/json" } }, res => { const chunks = []; res.on("data", x => chunks.push(x)); res.on("error", reject); res.on("end", () => { let body; try { body = JSON.parse(Buffer.concat(chunks)); } catch (_) {} resolve({ status: res.statusCode, body }); }); }); req.setTimeout(10000, () => req.destroy()); req.on("error", reject); req.end(JSON.stringify(input ?? {})); }); }
function resources(value, root) {
  value.distribution.application.healthcheck.test = ["CMD", "node", "health.js"];
  value.distribution.persistent_resources = [{ id: "application-state", source: path.join(root, "durable/application-state"), uid: process.getuid(), gid: process.getgid(), backup_required: true }];
  value.distribution.application.mounts = [{ resource: "application-state", target: "/app/state", read_only: false }];
  const ref = { resource: "application", key: "signing" };
  value.spec.secrets.resources.push({ ref, type: "application-secret", consumers: ["application"] }); value.requirements.secret_refs = [ref];
  value.distribution.application.secret_mounts = [{ ref, consumer: "application", target: "/run/secrets/signing", format: "raw" }];
  value.distribution.provenance.acceptance = "real-application";
  return value;
}
function compose(value) { const plan = value.plan(); assert.equal(plan.applicable, true, JSON.stringify(plan.diagnostics)); return L.composeDeployment(plan, value.distribution); }
function owned(prepared) { return D.inspectProject(prepared.project, Object.keys(prepared.compose.services)); }
function clean(prepared) {
  const owner = JSON.parse(fs.readFileSync(path.join(prepared.root, "deployment-owner.json"))); assert.equal(owner.project, prepared.project); assert.equal(owner.uid, process.getuid());
  for (const value of owned(prepared)) command("docker", ["rm", "-f", value.id]);
  D.checkNetworks(prepared.composition);
  for (const network of Object.values(prepared.compose.networks)) {
    const listed = command("docker", ["network", "ls", "--format", "{{.Name}}"] ).trim().split("\n");
    if (listed.includes(network.name)) command("docker", ["network", "rm", network.name]);
  }
  D.helper(prepared.composition, prepared.root, "const fs=require('node:fs');for(const name of fs.readdirSync('/work'))fs.rmSync('/work/'+name,{recursive:true,force:true});", [], true); fs.rmdirSync(prepared.root);
}
async function externalNetwork(prepared, lan, client) {
  assert.ok(Object.values(os.networkInterfaces()).flat().some(x => x.address === lan && !x.internal));
  const nonce = crypto.randomBytes(16).toString("hex"), control = http.createServer((req, res) => res.end(nonce));
  await new Promise((resolve, reject) => { control.once("error", reject); control.listen(0, lan, resolve); });
  const port = prepared.composition.distribution.external_gateway.host_port;
  const script = `const http=require('node:http'),net=require('node:net');(async()=>{const control=await new Promise((resolve,reject)=>{const q=http.get({hostname:${JSON.stringify(lan)},port:${control.address().port}},r=>{let s='';r.on('data',x=>s+=x);r.on('end',()=>resolve(s))});q.setTimeout(4000,()=>q.destroy());q.on('error',reject)});if(control!==${JSON.stringify(nonce)})throw new Error('CONTROL_ROUTE_FAILED');const result=await new Promise((resolve,reject)=>{const s=net.connect({host:${JSON.stringify(lan)},port:${port}});s.setTimeout(3000,()=>{s.destroy();resolve('timeout')});s.on('connect',()=>{s.destroy();reject(new Error('PUBLIC_APPLICATION_EXPOSURE'))});s.on('error',e=>['ECONNREFUSED','ETIMEDOUT','EHOSTUNREACH'].includes(e.code)?resolve(e.code):reject(e));});console.log(JSON.stringify({control_route:true,application_non_loopback:result}));})().catch(()=>process.exit(1));`;
  try {
    const response = await new Promise((resolve, reject) => { const child = spawn(trustedExecutable("ssh"), ["-o", "BatchMode=yes", "-o", "ConnectTimeout=10", client, "node -e '" + script.replaceAll("'", "'\\''") + "'"], { stdio: ["ignore", "pipe", "pipe"], env: trustedEnvironment() }); let output = ""; child.stdout.on("data", b => output += b); child.stderr.resume(); child.on("error", reject); child.on("exit", code => code === 0 ? resolve(JSON.parse(output)) : reject(new Error("EXTERNAL_NETWORK_QUALIFICATION_FAILED"))); });
    assert.equal(response.control_route, true); assert.ok(response.application_non_loopback); return response;
  } finally { await new Promise(resolve => control.close(resolve)); }
}
async function main() {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(process.env.IL5_NETWORK_CLIENT || "") || !net.isIPv4(process.env.IL5_LAN_ADDRESS || "") || !process.env.IL5_HOST_NGINX) throw new Error("EXPLICIT_NETWORK_AND_HOST_PROXY_REQUIRED");
  process.env.PATH = trustedEnvironment().PATH;
  const project = "drumee-il5-" + crypto.randomBytes(4).toString("hex"), base = fs.mkdtempSync(path.join(os.tmpdir(), project + "-")); fs.chmodSync(base, 0o700);
  const root = path.join(base, "deployment"), port = await freePort(), values = resources(applicationInputs(root, project, undefined, port), root);
  const source_revision = command("git", ["rev-parse", "HEAD"], { cwd: path.resolve(__dirname, "../..") }).trim();
  values.distribution.provenance.revision = source_revision;
  for (const plugin of values.distribution.application.plugins) plugin.revision = source_revision;
  const report = { project, source_revision, groups: [], assertions: 0, smtp_recovery: "explicitly-unsupported", internet_delivery: "not-tested", runtime_version: "0.1.0-alpha.4" };
  const step = async (name, fn) => { await fn(); report.groups.push(name); console.log("IL5_APPLICATION_OK " + name); };
  let image, tools, proxy, prepared, restored, smtp_prepared; const context = { root, authorized: true, create_resources: true };
  try {
    image = require("./build").build(project); values.distribution.application.image = image.image;
    const composition = compose(values);
    await step("prepare-is-persistent-private-and-does-not-start-application", async () => { prepared = await L.prepareDeployment(composition, context); assert.equal(prepared.activated, false); assert.equal(owned(prepared).length, 0); assert.equal((await L.prepareDeployment(composition, context)).revision, prepared.revision); });
    if (!prepared) throw new Error("PREPARATION_MUST_RETURN_A_DEPLOYMENT");
    const initial = prepared;
    await step("real-runtime-public-rpc-and-canonical-authorization-denial", async () => { assert.equal((await L.activateDeployment(prepared, context)).ready, true); assert.equal((await request(port, "qualification.ping")).body.data.message, "native-rpc"); assert.equal((await request(port, "qualification.denied")).status, 403); assert.equal((await request(port, "qualification.write")).body.data.count, 1); });
    await step("actual-loopback-publication-and-separate-lan-client-denial", async () => { const observed = owned(prepared); assert.equal(observed.length, 1); assert.deepEqual(observed[0].ports["3101/tcp"], [{ HostIp: "127.0.0.1", HostPort: String(port) }]); const sockets = command("ss", ["-H", "-ltn", "sport = :" + port]); assert.equal(sockets.includes("0.0.0.0:" + port) || sockets.includes("[::]:" + port), false); report.network = await externalNetwork(prepared, process.env.IL5_LAN_ADDRESS, process.env.IL5_NETWORK_CLIENT); assert.equal((await L.inspectDeployment(root, context)).application.binding_address, "127.0.0.1"); report.socket_observation = sockets.trim(); });
    const proxy_port = await freePort(), ca_file = path.join(base, "proxy-ca.pem"), key_file = path.join(base, "proxy.key");
    await step("external-host-nginx-https-and-unchanged-native-rpc-prefix", async () => {
      command("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "2", "-subj", "/CN=application.test", "-addext", "subjectAltName=DNS:application.test", "-keyout", key_file, "-out", ca_file]); fs.chmodSync(key_file, 0o600);
      const config = `worker_processes 1; pid ${base}/nginx.pid; error_log ${base}/nginx-error.log warn; events { worker_connections 128; } http { access_log off; client_body_temp_path ${base}/client-temp; proxy_temp_path ${base}/proxy-temp; fastcgi_temp_path ${base}/fastcgi-temp; uwsgi_temp_path ${base}/uwsgi-temp; scgi_temp_path ${base}/scgi-temp; server { listen 127.0.0.1:${proxy_port} ssl; server_name application.test; ssl_certificate ${ca_file}; ssl_certificate_key ${key_file}; location /-/ { proxy_pass http://127.0.0.1:${port}; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; proxy_set_header X-Forwarded-For $remote_addr; } location / { return 404; } } }`;
      fs.writeFileSync(path.join(base, "nginx.conf"), config); command(process.env.IL5_HOST_NGINX, ["-p", base, "-c", path.join(base, "nginx.conf"), "-t"]);
      proxy = spawn(trustedExecutable(process.env.IL5_HOST_NGINX), ["-p", base, "-c", path.join(base, "nginx.conf"), "-g", "daemon off;"], { stdio: "ignore", env: trustedEnvironment() });
      let result; for (let i = 0; i < 100; i++) { try { result = await request(proxy_port, "qualification.ping", {}, fs.readFileSync(ca_file)); break; } catch (error) {
        // Nginx starts asynchronously. Retry only refusal, never certificate/auth failures.
        if (error.code !== "ECONNREFUSED") throw error;
        await new Promise(r => setTimeout(r, 50));
      } }
      assert.ok(result, "HOST_PROXY_READINESS_TIMEOUT"); assert.equal(result.status, 200); assert.equal(result.body.data.request_path, "/-/svc/qualification.ping"); assert.equal((await request(proxy_port, "qualification.denied", {}, fs.readFileSync(ca_file))).status, 403);
      report.host_proxy = { version: String(spawnSync(trustedExecutable(process.env.IL5_HOST_NGINX), ["-v"], { encoding: "utf8" }).stderr).trim(), tls: "actual-CA-SAN-verified", containerized: false };
    });
    await step("stop-start-preserves-resource-and-secret-generations", async () => { assert.equal((await L.stopDeployment(prepared, context)).data_preserved, true); assert.equal((await L.inspectDeployment(root, context)).ready, false); assert.equal((await L.activateDeployment(prepared, context)).ready, true); assert.equal((await request(port, "qualification.write")).body.data.count, 2); assert.deepEqual(prepared.fingerprints, initial.fingerprints); });
    await step("controlled-configuration-update-and-canonical-rollback", async () => { values.distribution.application.environment = { APP_BANNER: "second" }; const next = await L.prepareDeployment(compose(values), context); assert.equal((await L.activateDeployment(next, context)).ready, true); assert.equal((await request(port, "qualification.ping")).body.data.banner, "second"); assert.equal((await L.rollbackDeployment(root, initial.revision, context)).ready, true); assert.equal((await request(port, "qualification.ping")).body.data.banner, "first"); delete values.distribution.application.environment; });
    await step("failed-startup-does-not-reset-owned-application-state", async () => { values.distribution.application.environment = { APP_CRASH: "1" }; const broken = await L.prepareDeployment(compose(values), context); await assert.rejects(L.activateDeployment(broken, context)); assert.equal((await L.inspectDeployment(root, context)).ready, false); assert.equal(fs.readFileSync(path.join(root, "durable/application-state/preserved"), "utf8"), "2"); assert.equal((await L.rollbackDeployment(root, initial.revision, context)).ready, true); delete values.distribution.application.environment; });
    await step("real-process-interruption-requires-explicit-recovery", async () => {
      await L.stopDeployment(prepared, context); const file = path.join(base, "interrupt-prepared.json"); fs.writeFileSync(file, JSON.stringify(prepared), { mode: 0o600 });
      const killed = spawnSync(process.execPath, [path.join(__dirname, "interrupt.js"), file], { encoding: "utf8", timeout: 300000 }); assert.equal(killed.signal, "SIGKILL");
      assert.equal((await L.inspectDeployment(root, context)).ready, false);
      const lock = path.join(root, ".infra-lifecycle-lock"), stat = fs.lstatSync(lock); assert.equal(stat.uid, process.getuid()); assert.equal(stat.isDirectory() && !stat.isSymbolicLink(), true); assert.deepEqual(fs.readdirSync(lock), []); fs.rmdirSync(lock);
      await assert.rejects(L.activateDeployment(prepared, context), { code: "ACTIVATION_RECOVERY_REQUIRED" }); assert.equal((await L.activateDeployment(prepared, { ...context, recover: true })).ready, true); assert.equal(fs.readFileSync(path.join(root, "durable/application-state/preserved"), "utf8"), "2");
    });
    await step("unknown-resource-and-prepared-tampering-are-refused", async () => { const other = path.join(base, "unknown"); fs.mkdirSync(other, { mode: 0o700 }); fs.writeFileSync(path.join(other, "keep"), "external"); await assert.rejects(L.prepareDeployment(compose(values), { ...context, root: other }), { code: "UNOWNED_DEPLOYMENT_DIRECTORY" }); assert.equal(fs.readFileSync(path.join(other, "keep"), "utf8"), "external"); const tampered = structuredClone(prepared); tampered.compose.services.application.ports[0].host_ip = "0.0.0.0"; await assert.rejects(L.activateDeployment(tampered, context)); assert.equal((await L.inspectDeployment(root, context)).ready, true); });
    const backup = path.join(base, "backup");
    await step("complete-no-smtp-backup-and-isolated-restore", async () => {
      const receipt = await L.backupDeployment(root, backup, { ...context, quiescence: "stop-owned-writers", resume_after_backup: true }); assert.equal(receipt.protected, true);
      const restored_root = path.join(base, "restored"), restored_port = await freePort(); const next = resources(applicationInputs(restored_root, project + "-restored", image.image, restored_port), restored_root); next.spec.instance.id = project; next.distribution.provenance.revision = source_revision; for (const plugin of next.distribution.application.plugins) plugin.revision = source_revision;
      const recovered = await L.restoreDeployment(backup, compose(next), { root: restored_root, authorized: true, create_resources: true }); restored = recovered.prepared; assert.equal(recovered.activated, false); assert.equal(recovered.kernel_recovery_verified, false); assert.equal(owned(restored).length, 0); assert.deepEqual(restored.fingerprints, initial.fingerprints); assert.equal((await L.activateDeployment(restored, { root: restored_root, authorized: true })).ready, true); assert.equal((await request(restored_port, "qualification.write")).body.data.count, 3);
      const changed = structuredClone(values.distribution); changed.application.image = helper; const candidate = await L.prepareDeployment(L.composeDeployment(values.plan(), changed), context);
      await assert.rejects(L.activateDeployment(candidate, { ...context, backup_evidence: { directory: backup, manifest_digest: receipt.manifest_digest } }), { code: "IMAGE_UPGRADE_COMPATIBILITY_UNVERIFIED" }); assert.equal((await request(port, "qualification.ping")).status, 200);
    });
    await step("smtp-dkim-composition-starttls-and-actual-relay-denial", async () => {
      const tag = "drumee-il5-services:" + project; command("docker", ["build", "--label", "org.drumee.infra.owner=" + project, "-t", tag, "-f", "capabilities/docker/Dockerfile.services", "."], { cwd: path.resolve(__dirname, "../.."), stdio: "inherit" }); tools = { tag, image: command("docker", ["image", "inspect", tag, "--format", "{{.Id}}"]).trim() };
      const smtp_root = path.join(base, "smtp"), smtp_project = project + "-smtp", smtp_port = await freePort(); const value = resources(applicationInputs(smtp_root, smtp_project, image.image, smtp_port), smtp_root), supplied = serviceInputs(path.join(smtp_root, "durable"), smtp_project, tools.image);
      value.distribution.provenance.revision = source_revision; for (const plugin of value.distribution.application.plugins) plugin.revision = source_revision;
      value.spec.instance.domain = "drumee.lan"; value.spec.tls = supplied.spec.tls; value.spec.mail = supplied.spec.mail; value.spec.mail.clients = ["127.0.0.1/32"]; value.spec.secrets.resources.push(...supplied.spec.secrets.resources);
      value.adapter_input.services = { mail: supplied.adapter_input.services.mail, dkim: supplied.adapter_input.services.dkim }; value.adapter_input.resource_sources = supplied.adapter_input.resource_sources;
      value.distribution.application.secret_mounts.push({ ref: supplied.keys.smtp, consumer: "application", target: "/run/secrets/submission", format: "raw" }, { ref: supplied.keys.ca_bundle, consumer: "application", target: "/run/secrets/mail-ca", format: "tls-ca-bundle" });
      value.spec.secrets.resources.find(x => x.type === "smtp-relay-credential").consumers.push("application");
      const imported = path.join(base, "submission-import"); fs.writeFileSync(imported, crypto.randomBytes(32).toString("base64url"), { mode: 0o600 });
      value.distribution.application.environment = { APP_SMTP_CONFIG: JSON.stringify({ host: "mail", port: value.spec.mail.endpoint.port, user: value.spec.mail.submission_user, servername: "drumee.lan", ca_file: "/run/secrets/mail-ca", password_file: "/run/secrets/submission" }) };
      const smtp_context = { root: smtp_root, authorized: true, create_resources: true, imports: [{ ref: supplied.keys.smtp, file: imported }] };
      smtp_prepared = await L.prepareDeployment(compose(value), smtp_context); assert.equal((await L.activateDeployment(smtp_prepared, smtp_context)).ready, true);
      const observed = owned(smtp_prepared); assert.deepEqual(observed.find(x => x.service === "dkim").ports, {}); assert.deepEqual(observed.find(x => x.service === "mail").ports, {}); assert.equal((await request(smtp_port, "qualification.smtp_probe")).body.data.starttls_authenticated, true); assert.equal((await request(smtp_port, "qualification.smtp_probe", { bad_auth: true })).body.code, "EAUTH"); assert.equal((await request(smtp_port, "qualification.smtp_probe", { unauthenticated: true })).body.code, "EENVELOPE");
      const queueMarker = () => D.helper(smtp_prepared.composition, path.join(smtp_root, "durable/mail"), "process.stdout.write(require('node:fs').readFileSync('/work/.infra-owner'))");
      const marker = queueMarker(), fingerprints = smtp_prepared.fingerprints;
      command("docker", ["stop", observed.find(x => x.service === "mail").id]); const optional = await L.inspectDeployment(smtp_root, smtp_context); assert.equal(optional.ready, true); assert.equal(optional.application.protocol_functional, true); assert.ok(optional.diagnostic_codes.length); assert.equal((await request(smtp_port, "qualification.ping")).status, 200);
      const backend = owned(smtp_prepared).find(x => x.service === "application"); command("docker", ["kill", backend.id]); assert.equal((await L.inspectDeployment(smtp_root, smtp_context)).ready, false); assert.equal(queueMarker(), marker); assert.equal((await L.activateDeployment(smtp_prepared, smtp_context)).ready, true); assert.deepEqual(smtp_prepared.fingerprints, fingerprints);
      value.requirements.capabilities = ["smtp"]; value.distribution.application.requires = ["mail"]; smtp_prepared = await L.prepareDeployment(compose(value), smtp_context); assert.equal((await L.activateDeployment(smtp_prepared, smtp_context)).ready, true); command("docker", ["stop", owned(smtp_prepared).find(x => x.service === "mail").id]); assert.equal((await L.inspectDeployment(smtp_root, smtp_context)).ready, false); assert.equal((await request(smtp_port, "qualification.ping")).status, 200); assert.equal((await L.activateDeployment(smtp_prepared, smtp_context)).ready, true);
      await assert.rejects(L.backupDeployment(smtp_root, path.join(base, "smtp-backup"), { ...smtp_context, quiescence: "stop-owned-writers" }), { code: "SMTP_RECOVERY_UNQUALIFIED" }); assert.equal((await request(smtp_port, "qualification.ping")).status, 200); report.smtp = { starttls_auth: true, no_open_relay: true, optional_failure_isolated: true, mandatory_failure_diagnosed: true, backend_failure_preserves_queue_and_keys: true, recovery_refused: true, internet_delivery: false };
    });
    report.assertions = assertions; report.status = "passed";
  } catch (error) { report.status = "failed"; report.failure = { code: error.code || "IL5_APPLICATION_ACCEPTANCE_FAILED", assertion: error.code === "ERR_ASSERTION" ? error.message.slice(0, 250) : undefined, command_status: error.status, native_proxy_diagnostic: error.path?.endsWith("/nginx") ? String(error.stderr || "").slice(-1500) : undefined }; console.error(JSON.stringify(report.failure)); throw error; }
  finally {
    proxy?.kill("SIGTERM"); if (proxy?.exitCode === null) await new Promise(resolve => proxy.once("exit", resolve));
    for (const value of [smtp_prepared, restored, prepared].filter(Boolean)) clean(value);
    for (const value of [tools, image].filter(Boolean)) { assert.equal(command("docker", ["image", "inspect", value.tag, "--format", '{{index .Config.Labels "org.drumee.infra.owner"}}']).trim(), project); command("docker", ["image", "rm", value.tag]); }
    report.assertions = assertions; const report_file = path.join(os.tmpdir(), project + "-report.json"); fs.writeFileSync(report_file, JSON.stringify(report, null, 2), { mode: 0o600 }); console.log("IL5_APPLICATION_REPORT " + report_file);
    // Rootful native resources/backups live only in this exclusively owned base.
    if (fs.existsSync(path.join(base, "backup"))) { const composition = prepared.composition; D.helper(composition, path.join(base, "backup"), "const fs=require('node:fs');for(const name of fs.readdirSync('/work'))fs.rmSync('/work/'+name,{recursive:true,force:true});", [], true); }
    fs.rmSync(base, { recursive: true, force: true }); console.log("IL5_OWNED_RESOURCES_CLEANED " + project);
  }
}
main().catch(() => { process.exitCode = 1; });
