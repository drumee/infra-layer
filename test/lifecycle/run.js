"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const net = require("node:net");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const api = require("../../lib");
const lifecycle = require("../../lifecycle");
const driver = require("../../lifecycle/docker");
const { serviceInputs } = require("../support/service-inputs");
const image_node = "node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392";
function command(args, options = {}) { const result = spawnSync(args[0], args.slice(1), { encoding: "utf8", stdio: "pipe", timeout: 300000, ...options }); if (result.status !== 0) throw new Error("IL3_TEST_COMMAND_FAILED"); return result.stdout; }
const freePort = () => new Promise((resolve) => { const server = net.createServer(); server.listen(0, "127.0.0.1", () => { const port = server.address().port; server.close(() => resolve(port)); }); });
async function main() {
  const project = "drumee-il3-test-" + crypto.randomBytes(4).toString("hex"); const root = fs.mkdtempSync(path.join(os.tmpdir(), project + "-")); const image = "drumee-il3-services:" + project; const repository = path.resolve(__dirname, "../..");
  let prepared;
  try {
    assert.equal(command(["docker", "ps", "-a", "--filter", `label=com.docker.compose.project=${project}`, "--format", "{{.ID}}"] ).trim(), "");
    command(["docker", "build", "--label", "org.drumee.infra.owner=" + project, "-t", image, "-f", path.join(repository, "capabilities/docker/Dockerfile.services"), repository], { stdio: "inherit" });
    const image_id = command(["docker", "image", "inspect", image, "--format", "{{.Id}}"] ).trim();
    const inputs = serviceInputs(path.join(root, "durable"), project, image_id); delete inputs.spec.mail; delete inputs.adapter_input.services.mail; delete inputs.adapter_input.services.dkim; inputs.requirements.capabilities = ["dns", "database", "redis"];
    const address = process.env.IL3_LAN_ADDRESS || "127.0.0.1"; const port = process.env.IL3_DNS_PORT ? Number(process.env.IL3_DNS_PORT) : await freePort();
    if (net.isIP(address) !== 4 || !Number.isInteger(port) || port < 1 || port > 65535) throw Error("INVALID_ISOLATED_TEST_BINDING");
    if (address !== "127.0.0.1") { inputs.spec.dns.ipv4 = address; inputs.spec.dns.clients.push(address.split(".").slice(0,3).join(".") + ".0/24"); }
    inputs.adapter_input.services.dns.bindings.forEach((value) => { value.host_port = port; value.host_address = address; });
    const plan = api.planInfrastructure(inputs.spec, inputs.requirements, inputs.adapter_input); assert.equal(plan.applicable, true, JSON.stringify(plan.diagnostics));
    const distribution = { contract_version: "1", id: "il3-infrastructure-test", profile: "infrastructure", init_jobs: [], persistent_resources: [{ id: "content-fixture", source: path.join(root, "durable/content-fixture"), uid: process.getuid(), gid: process.getgid(), backup_required: true }], schema_versions: {}, external_writers: "none", helper_image: image_node, provenance: { repository: "https://github.com/drumee/infra-layer", revision: "0f5fb92cccae1441ba45c288acf7fc06b57ba6eb", path: "test/services", acceptance: "infrastructure" } };
    const composition = lifecycle.composeDeployment(plan, distribution); const context = { root, authorized: true, create_resources: true, driver: { ...driver, compose(prepared, args, options) {
      try { return driver.compose(prepared, args, options); } catch (error) { let message = error.diagnostic || ""; const store = require("../../capabilities/secrets").createFilesystemSecretStore(path.join(root, "secrets"), project); for (const ref of prepared.fingerprints) { const secret = store.read(ref.ref, ref.consumers[0]).toString(); message = message.split(secret).join("[redacted]"); } console.error("IL3 test " + args[0] + ": " + message.slice(-3000)); throw error; }
    } } };
    console.log("IL3 preparation begin"); prepared = await lifecycle.prepareDeployment(composition, context); console.log("IL3 prepared " + prepared.revision); assert.equal(prepared.activated, false); assert.equal(driver.inspectProject(project, Object.keys(prepared.compose.services)).length, 0);
    assert.equal((await lifecycle.prepareDeployment(composition, context)).revision, prepared.revision);
    console.log("IL3 activation begin " + JSON.stringify({project,address,port})); const active = await lifecycle.activateDeployment(prepared, context); assert.equal(active.ready, true, JSON.stringify(active));
    const no_op = await lifecycle.activateDeployment(prepared, context); assert.equal(no_op.effect, "no-op"); assert.deepEqual(no_op.services, active.services);
    const metadata = { root, project, prepared, distribution, inputs, port }; const file = path.join(root, "test-metadata.json"); fs.writeFileSync(file, JSON.stringify(metadata), { mode: 0o600 });
    const result = spawnSync(process.execPath, ["--test", path.join(__dirname, "lifecycle.test.js")], { stdio: "inherit", env: { ...process.env, IL3_METADATA: file }, timeout: 600000 }); if (result.status !== 0) throw new Error("IL3_TESTS_FAILED");
  } catch (error) {
    let diagnostic = error.diagnostic || "";
    if (prepared) { try { diagnostic += driver.compose(prepared, ["logs", "--no-color"]); } catch (_) {} }
    const store_root = path.join(root, "secrets"); if (fs.existsSync(store_root)) { const store = require("../../capabilities/secrets").createFilesystemSecretStore(store_root, project); for (const ref of prepared?.fingerprints || []) { try { const secret = store.read(ref.ref, ref.consumers[0]).toString(); diagnostic = diagnostic.split(secret).join("[redacted]"); } catch (_) {} } }
    if (diagnostic.includes("PRIVATE KEY")) diagnostic = "PRIVATE_MATERIAL_DIAGNOSTIC_SUPPRESSED";
    console.error((error.operation || "IL3") + ": " + diagnostic.slice(-7000)); throw error;
  } finally {
    if (prepared) { driver.inspectProject(project, Object.keys(prepared.compose.services)); driver.compose(prepared, ["down"]); }
    assert.equal(command(["docker", "ps", "-a", "--filter", `label=com.docker.compose.project=${project}`, "--format", "{{.ID}}"] ).trim(), "");
    command(["docker", "run", "--rm", "--network", "none", "--label", "org.drumee.infra.owner=" + project, "--mount", `type=bind,source=${root},target=/cleanup`, image_node, "node", "-e", "const fs=require('fs');for(const name of fs.readdirSync('/cleanup'))fs.rmSync('/cleanup/'+name,{recursive:true,force:true});"]);
    command(["docker", "image", "rm", image]); fs.rmdirSync(root); console.log("IL3 cleanup confirmed: " + project);
  }
}
main().catch((error) => { console.error(error.code || error.message); process.exitCode = 1; });
