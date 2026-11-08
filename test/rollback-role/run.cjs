"use strict";
// Real Docker qualification against an explicitly installed unpublished archive.
// Frozen consumer code is copied into an owned fixture; no consumer lock is edited.
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), crypto = require("node:crypto"), net = require("node:net"), http = require("node:http"), assert = require("node:assert/strict"), { createRequire } = require("node:module"), { execFileSync } = require("node:child_process");
const DEBIAN = "175e6fd1c1500a05192ad367dca95ebd1fcecdbb", OXY = "9f558e505fef5e16bcc3246fbef93f0e513264da";
const command = (program, args, options = {}) => execFileSync(program, args, { encoding: "utf8", stdio: "pipe", timeout: 300000, ...options });
async function freePort() { const server = net.createServer(); await new Promise(resolve => server.listen(0, "127.0.0.1", resolve)); const port = server.address().port; await new Promise(resolve => server.close(resolve)); return port; }
function post(port, fields) { return new Promise((resolve, reject) => { const req = http.request({ host: "127.0.0.1", port, path: "/-/svc/oxyform.submit", method: "POST", headers: { "content-type": "application/json" }, agent: false }, res => { let body = ""; res.on("data", b => { body += b; }); res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(body) })); }); req.on("error", reject); req.setTimeout(12000, () => req.destroy()); req.end(JSON.stringify(fields)); }); }
async function main() {
  const input = JSON.parse(fs.readFileSync(process.argv[2])), data = fs.readFileSync(input.archive), integrity = "sha512-" + crypto.createHash("sha512").update(data).digest("base64"), sha256 = crypto.createHash("sha256").update(data).digest("hex");
  if (!["blocked", "ready"].includes(input.expect) || !path.isAbsolute(input.output)) throw Error("EXPLICIT_QUALIFICATION_INPUT_REQUIRED");
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "infra-role-real-")), consumer = base + "/consumer", oxy = base + "/oxy", project = "infra-role-real-" + crypto.randomBytes(5).toString("hex"), root = base + "/deployment", extraNetwork = project + "-unexpected";
  fs.mkdirSync(consumer); fs.mkdirSync(oxy);
  function extract(repository, revision, files, destination) { const tar = execFileSync("git", ["archive", "--format=tar", revision, ...files], { cwd: repository, maxBuffer: 8 * 1024 * 1024 }); execFileSync("tar", ["-x", "-C", destination], { input: tar }); }
  extract(input.debian_repository, DEBIAN, ["bin/drumee-ctl", "config/render.mjs", "config/drumee.schema.json", "profiles/minimal-application/operator.js", "profiles/minimal-application/lib"], consumer);
  extract(input.oxy_repository, OXY, ["scripts/configure.cjs", "scripts/distribution.cjs", "server/validation.js"], oxy);
  const profile = consumer + "/profiles/minimal-application";
  fs.writeFileSync(profile + "/package.json", JSON.stringify({ name: "rollback-candidate-qualification", version: "0.0.0", private: true, dependencies: { "@drumee/infra-layer": "file:" + path.resolve(input.archive) } }), { mode: 0o600 });
  command("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: profile });
  const requireCandidate = createRequire(profile + "/package.json"), resolved = requireCandidate.resolve("@drumee/infra-layer");
  assert.ok(fs.realpathSync(resolved).startsWith(profile + "/node_modules/@drumee/infra-layer/"));
  const metadata = JSON.parse(fs.readFileSync(profile + "/node_modules/@drumee/infra-layer/package.json")), lock = JSON.parse(fs.readFileSync(profile + "/package-lock.json"));
  assert.equal(metadata.version, input.version); assert.equal(lock.packages["node_modules/@drumee/infra-layer"].integrity, integrity);
  const L = requireCandidate("@drumee/infra-layer/lifecycle"), D = require(profile + "/node_modules/@drumee/infra-layer/lifecycle/docker"), A = require(profile + "/node_modules/@drumee/infra-layer/lifecycle/activation"), { compose } = require(profile + "/lib/config"), { configuration } = require(oxy + "/scripts/configure.cjs");
  const images = JSON.parse(fs.readFileSync(input.images)); assert.equal(images.plugins[0].id, "oxyform"); assert.equal(images.revision, DEBIAN);
  const password = crypto.randomBytes(32).toString("base64url"), submission = base + "/submission"; fs.writeFileSync(submission, password, { mode: 0o600 });
  const cfg = configuration({ directory: consumer, profile }, { root, project, uid: process.getuid(), gid: process.getgid(), host_port: await freePort(), mail_hostname: "forms.example.invalid", recipient: "operator@example.invalid", sender: "forms@example.invalid", submission_file: submission, upstream: { host: "capture", port: 2525 }, qualification: true, enabled: true }, images);
  const report = { producer_source: input.producer_source, installed_version: metadata.version, archive: { sha256, integrity, bytes: data.length }, consumer_kind: "owned explicit candidate dependency with frozen CLI/configuration sources; not the released Debian dependency graph", debian_code: DEBIAN, oxy_code: OXY, image: images.image, tools_image: images.tools.image, plugin: images.plugins[0], expected: input.expect, groups: [], assertions: 0, external_smtp: false, real_mailbox: false, published_alpha4_requalified: false };
  const check = (value, expected) => { assert.deepEqual(value, expected); report.assertions++; };
  const step = async (name, fn) => { report.current_group = name; await fn(); report.groups.push(name); delete report.current_group; console.log("ROLLBACK_ROLE_OK " + name); };
  function write(value, name) { const file = base + "/" + name + ".json"; fs.writeFileSync(file, JSON.stringify(value), { mode: 0o600 }); return file; }
  const file = write(cfg, "initial"), port = cfg.manifest.external_gateway.host_port;
  function cli(operation, config = file, args = [], ok = true) {
    try { const result = JSON.parse(command(consumer + "/bin/drumee-ctl", ["--profile", "minimal-application", operation, "--config", config, ...args])); if (!ok) throw Error("EXPECTED_REFUSAL_MISSING"); return result; }
    catch (error) { let code; try { code = JSON.parse(String(error.stderr)).code; } catch { code = "OPERATOR_COMMAND_FAILED"; } if (ok) throw Object.assign(Error(code), { code, operation }); return { code }; }
  }
  function observed() { return D.inspectProject(project, ["application", "mail", "dkim"]); }
  function owns() { const owner = JSON.parse(fs.readFileSync(root + "/deployment-owner.json")); check(owner.project, project); check(owner.uid, process.getuid()); const values = observed(); for (const value of values) { check(value.owner, project); check(value.project, project); } return values; }
  function queue() { return command("docker", ["exec", owns().find(x => x.service === "mail").id, "postqueue", "-j"]).trim().split("\n").filter(Boolean).map(x => JSON.parse(x).queue_id).sort(); }
  function fingerprints() { return L.prepareDeployment(compose(cfg), { root, authorized: true, imports: cfg.imports }).then(p => p.fingerprints); }
  function identities() {
    return owns().map(value => {
      const candidate = JSON.parse(fs.readFileSync(root + "/candidates/" + value.revision + "/prepared.json")), service = candidate.compose.services[value.service], checkedImages = D.checkImages(candidate.composition);
      A.checkObserved(candidate, { ...value, ports: value.configured_ports }, checkedImages);
      check(value.name, `/${project}-${value.service}-1`);
      return { service: value.service, observed_role: value.role, declared_role_present: Object.hasOwn(service.labels, "org.drumee.infra.role"), ...(Object.hasOwn(service.labels, "org.drumee.infra.role") ? { declared_role: service.labels["org.drumee.infra.role"] } : {}), other_runtime_identity_checks_pass: true };
    });
  }
  const fields = { name: "Canonical rollback qualification", email: "visitor@example.invalid", company: "Synthetic owned fixture", message: "SMTP queue and durable state must survive the failed-start rollback." };
  let initial, initialQueue, secretFingerprints, ledgerDigest, extraCreated = false;
  try {
    await step("initial-real-application-mail-dkim-and-captured-message", async () => {
      const refused = cli("install", file, [], false); report.initial_authorization_code = refused.code; check(refused.code, "APPLICATION_EXECUTION_AUTHORIZATION_REQUIRED");
      const state = cli("install", file, ["--execute"]); report.initial_activation = { ready: state.ready, codes: state.diagnostic_codes, active_revision: state.active_revision }; check(state.ready, true); initial = state.active_revision;
      const sent = await post(port, fields); check(sent.status, 200); check(sent.body.data.status, "accepted_by_relay"); initialQueue = queue(); check(initialQueue.length, 1);
      const encoded = command("docker", ["exec", owns().find(x => x.service === "mail").id, "postcat", "-b", "-q", initialQueue[0]]), body = Buffer.from(encoded.replace(/=\r?\n/g, "").replace(/=([A-F0-9]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))), "binary").toString(); for (const text of Object.values(fields)) check(body.includes(text), true);
      secretFingerprints = await fingerprints(); ledgerDigest = crypto.createHash("sha256").update(fs.readFileSync(root + "/durable/forms-state/ledger.json")).digest("hex");
      report.initial_roles = identities();
    });
    await step("ordinary-configuration-rollback-stays-operational", async () => {
      const disabled = structuredClone(cfg), intent = JSON.parse(disabled.manifest.application.environment.OXY_FORM_CONFIG); intent.enabled = false; disabled.manifest.application.environment.OXY_FORM_CONFIG = JSON.stringify(intent);
      check(cli("install", write(disabled, "disabled"), ["--execute"]).ready, true); check((await post(port, fields)).status, 403);
      check(cli("rollback", file, ["--execute", "--revision", initial]).ready, true); check((await post(port, fields)).body.data.duplicate, true); check(queue(), initialQueue);
    });
    await step("controlled-plugin-provenance-failure-requires-recovery", async () => {
      const broken = structuredClone(cfg); broken.manifest.application.plugins[0].revision = "e".repeat(40);
      check(cli("install", write(broken, "broken"), ["--execute"], false).code, "DOCKER_LIFECYCLE_COMMAND_FAILED"); check(cli("status").ready, false);
      const events = fs.readdirSync(root + "/journal").filter(x => /^\d{8}\.json$/.test(x)).sort().map(x => JSON.parse(fs.readFileSync(root + "/journal/" + x))), pending = events.filter(x => x.phase === "recovery-required").at(-1);
      check(pending.details.service, "application"); report.failed_candidate_roles = identities();
      check(report.failed_candidate_roles.filter(x => !x.declared_role_present).map(x => [x.service, x.observed_role]).sort(), [["dkim", input.expect === "blocked" ? null : ""], ["mail", input.expect === "blocked" ? null : ""]]);
      check(cli("rollback", file, ["--revision", initial], false).code, "APPLICATION_EXECUTION_AUTHORIZATION_REQUIRED");
      await assert.rejects(L.rollbackDeployment(root, initial, { root, authorized: false }), { code: "ROLLBACK_OPERATION_NOT_AUTHORIZED" }); report.assertions++;
    });
    if (input.expect === "blocked") {
      await step("published-alpha4-defect-reproduced-with-real-adapter", async () => { check(cli("rollback", file, ["--execute", "--revision", initial], false).code, "RUNTIME_IDENTITY_MISMATCH"); check(cli("status").ready, false); });
      report.status = "baseline-defect-reproduced-not-qualified";
    } else {
      await step("candidate-authorized-recovery-is-actually-ready-and-functional", async () => {
        let state; try { state = await L.rollbackDeployment(root, initial, { root, authorized: true, imports: cfg.imports || [] }); } catch (error) { report.rollback_failure_frames = String(error.stack).split("\n").slice(1, 7).map(line => line.replaceAll(base, "<owned-fixture>")); throw error; } check(state.ready, true); check(state.active_revision, initial);
        check((await post(port, fields)).body.data.duplicate, true); check(queue(), initialQueue); check(await fingerprints(), secretFingerprints);
        check(crypto.createHash("sha256").update(fs.readFileSync(root + "/durable/forms-state/ledger.json")).digest("hex"), ledgerDigest);
        report.recovered_roles = identities(); report.data_queue_and_secret_generations_preserved = true;
      });
      await step("real-extra-network-still-refuses-without-recreation", async () => {
        command("docker", ["network", "create", "--label", "org.drumee.qualification=" + project, extraNetwork]); extraCreated = true;
        const app = owns().find(x => x.service === "application"), before = owns().map(x => x.id).sort(); command("docker", ["network", "connect", extraNetwork, app.id]);
        check(cli("rollback", file, ["--execute", "--revision", initial], false).code, "NETWORK_ATTACHMENT_MISMATCH"); check(owns().map(x => x.id).sort(), before);
        command("docker", ["network", "disconnect", extraNetwork, app.id]); check(cli("status").ready, true); check(queue(), initialQueue);
      });
      await step("smtp-recovery-policy-and-secret-redaction-unchanged", async () => {
        fs.mkdirSync(cfg.storage.backup_location, { mode: 0o700 }); check(cli("backup", file, ["--execute", "--backup", cfg.storage.backup_location + "/refused"], false).code, "SMTP_RECOVERY_UNQUALIFIED");
        const wrong = structuredClone(cfg); wrong.deployment.owner_uid++; wrong.manifest.persistent_resources.find(x => x.id === "operator-state").uid++; check(cli("stop", write(wrong, "wrong-owner"), ["--execute"], false).code, "APPLICATION_OWNER_MISMATCH");
        // Docker logs has distinct stdout/stderr streams; both are inspected.
        const spawnSync = require("node:child_process").spawnSync;
        for (const value of owns()) { const result = spawnSync("docker", ["logs", value.id], { encoding: "utf8", timeout: 30000 }); check(result.status, 0); const logs = result.stdout + result.stderr; check(logs.includes(password), false); for (const text of Object.values(fields)) check(logs.includes(text), false); check(/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/.test(logs), false); }
      });
      report.status = "candidate-recovery-qualified";
    }
  } catch (error) { report.status = "failed"; report.failure = { code: /^[A-Z][A-Z0-9_]+$/.test(error.code || "") ? error.code : "QUALIFICATION_FAILED", operation: error.operation }; process.exitCode = 1; console.error(JSON.stringify(report.failure)); }
  finally {
    if (fs.existsSync(root + "/deployment-owner.json")) {
      for (const resource of owns()) command("docker", ["rm", "-f", resource.id]);
      for (const value of Object.values(compose(cfg).compose.networks)) { const id = command("docker", ["network", "ls", "--filter", "name=^" + value.name + "$", "-q"]).trim(); if (id) { const n = JSON.parse(command("docker", ["network", "inspect", id]))[0]; check(n.Labels["org.drumee.infra.owner"], project); check(Object.keys(n.Containers).length, 0); command("docker", ["network", "rm", id]); } }
    }
    if (extraCreated) { const n = JSON.parse(command("docker", ["network", "inspect", extraNetwork]))[0]; check(n.Labels["org.drumee.qualification"], project); check(Object.keys(n.Containers).length, 0); command("docker", ["network", "rm", extraNetwork]); }
    check(fs.lstatSync(base).uid, process.getuid()); command("docker", ["run", "--rm", "--network", "none", "--user", "0:0", "--mount", "type=bind,source=" + base + ",target=/work", cfg.manifest.helper_image, "node", "-e", "const f=require('fs');for(const x of f.readdirSync('/work'))f.rmSync('/work/'+x,{recursive:true,force:true})"]); fs.rmdirSync(base);
    fs.writeFileSync(input.output, JSON.stringify(report, null, 2), { mode: 0o600 }); console.log("ROLLBACK_ROLE_REPORT_WRITTEN");
  }
}
main().catch(() => { console.error("ROLLBACK_ROLE_QUALIFICATION_FAILED"); process.exitCode = 1; });
