"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const api = require("../../lib");
const lifecycle = require("../../lifecycle");
const driver = require("./tracing-driver");
const journal = require("../../lifecycle/journal");
const recovery = require("../../lifecycle/recovery");
const os = require("node:os");
if (!process.env.IL3_METADATA) throw new Error("ISOLATED_LIFECYCLE_HARNESS_REQUIRED");
const metadata = JSON.parse(fs.readFileSync(process.env.IL3_METADATA)); const context = { root: metadata.root, authorized: true, create_resources: true, driver };
test("active configuration has controlled process/functional evidence separate from Docker labels", async () => {
  const state = await lifecycle.inspectDeployment(metadata.root, context); assert.equal(state.ready, true); assert.equal(state.assurance, "controlled-recreation-and-protocol-verification"); assert.equal(state.in_memory_config_measured, false);
  const events = journal.readJournal(metadata.root); assert.ok(events.some((value) => value.phase === "native-valid")); assert.ok(events.some((value) => value.phase === "functional-verified")); assert.ok(events.some((value) => value.phase === "active"));
});
test("container recreation invalidates attestation until controlled reactivation", async () => {
  driver.compose(metadata.prepared, ["restart", "redis"]); const state = await lifecycle.inspectDeployment(metadata.root, context); assert.equal(state.ready, false); assert.ok(state.diagnostic_codes.includes("RUNTIME_ATTESTATION_INVALIDATED"));
  assert.equal((await lifecycle.activateDeployment(metadata.prepared, context)).ready, true);
});
test("edited prepared config is rejected before activation with durable resources preserved", async () => {
  const file = path.join(metadata.prepared.candidate, "redis.conf"); const before = fs.readFileSync(file); fs.appendFileSync(file, "invalid_configuration yes\n");
  try { await assert.rejects(() => lifecycle.activateDeployment(metadata.prepared, context), { code: "PREPARED_CONFIGURATION_CHANGED" }); } finally { fs.writeFileSync(file, before); }
  assert.equal((await lifecycle.inspectDeployment(metadata.root, context)).ready, true);
});
test("new candidate preparation never activates; configuration update preserves persistent keys and CA", async () => {
  const before = metadata.prepared.fingerprints; const inputs = JSON.parse(JSON.stringify(metadata.inputs)); inputs.spec.dns.serial++;
  const plan = api.planInfrastructure(inputs.spec, inputs.requirements, inputs.adapter_input); const composition = lifecycle.composeDeployment(plan, metadata.distribution);
  const prepared = await lifecycle.prepareDeployment(composition, context); assert.notEqual(prepared.revision, metadata.prepared.revision); assert.deepEqual(prepared.fingerprints, before); assert.equal(prepared.certificate.ca_fingerprint, metadata.prepared.certificate.ca_fingerprint);
  const still_active = await lifecycle.inspectDeployment(metadata.root, context); assert.equal(still_active.active_revision, metadata.prepared.revision); assert.equal(still_active.ready, true);
  const updated = await lifecycle.activateDeployment(prepared, context); assert.equal(updated.ready, true); assert.ok(updated.change.categories.includes("dns-zone-update")); metadata.prepared = prepared; metadata.inputs = inputs;
});
test("cold backup includes SQL/data/files/keys/config; isolated restore preserves rows, bytes, CA and DNS state", async () => {
  const bytes = Buffer.from("isolated lifecycle persistent bytes"); fs.writeFileSync(path.join(metadata.root, "durable/content-fixture/probe.bytes"), bytes, { mode: 0o600 });
  driver.compose(metadata.prepared, ["exec", "-T", "database", "/bin/sh", "-c", 'MYSQL_PWD="$(cat /run/secrets/database-admin)" mariadb --protocol=socket -uroot -e "CREATE DATABASE il3_probe; CREATE TABLE il3_probe.records(value INT); INSERT INTO il3_probe.records VALUES(73)"']);
  const backup_directory = fs.mkdtempSync(path.join(os.tmpdir(), "il3-backup-")); const restored_root = fs.mkdtempSync(path.join(os.tmpdir(), "il3-restore-")); let restored;
  try {
    const backup = await recovery.backupDeployment(metadata.root, backup_directory, { ...context, quiescence: "stop-owned-writers", resume_after_backup: true }); assert.equal(backup.protected, true); assert.equal((await lifecycle.inspectDeployment(metadata.root, context)).ready, true);
    const manifest = recovery.validateBackup(backup_directory, {}, context); assert.ok(manifest.inventory.some((value) => value.path.endsWith("probe.bytes"))); assert.ok(fs.statSync(path.join(backup_directory, "database.sql")).size > 0); assert.equal(manifest.consistency.all_owned_processes_stopped, true);
    const inputs = JSON.parse(JSON.stringify(metadata.inputs)); const old_root = metadata.root;
    function rewrite(value) { if (typeof value === "string" && value.startsWith(old_root + "/")) return restored_root + value.slice(old_root.length); if (Array.isArray(value)) return value.map(rewrite); if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, rewrite(entry)])); return value; }
    const selected = rewrite(inputs); selected.adapter_input.project += "-restore"; selected.adapter_input.network = selected.adapter_input.project + "-kernel"; for (const binding of selected.adapter_input.services.dns.bindings) { binding.host_port = metadata.port >= 1024 ? metadata.port + 1 : 25354; binding.host_address = "127.0.0.1"; }
    const plan = api.planInfrastructure(selected.spec, selected.requirements, selected.adapter_input); const composition = lifecycle.composeDeployment(plan, rewrite(metadata.distribution));
    const restore_context = { root: restored_root, authorized: true, create_resources: true, driver }; restored = await recovery.restoreDeployment(backup_directory, composition, restore_context); assert.equal(restored.activated, false); assert.equal(restored.kernel_recovery_verified, false); assert.equal(restored.prepared.certificate.ca_fingerprint, metadata.prepared.certificate.ca_fingerprint);
    assert.equal((await lifecycle.activateDeployment(restored.prepared, restore_context)).ready, true);
    const records = driver.compose(restored.prepared, ["exec", "-T", "database", "/bin/sh", "-c", 'MYSQL_PWD="$(cat /run/secrets/database-admin)" mariadb --protocol=socket -uroot --batch --skip-column-names -e "SELECT value FROM il3_probe.records"']); assert.equal(records.trim(), "73"); assert.deepEqual(fs.readFileSync(path.join(restored_root, "durable/content-fixture/probe.bytes")), bytes);
    await assert.rejects(() => recovery.restoreDeployment(backup_directory, composition, restore_context), { code: "RESTORE_DESTINATION_OCCUPIED" });
    assert.throws(() => recovery.validateBackup(backup_directory, { kernel: "incompatible" }, context), { code: "INCOMPATIBLE_SCHEMA_RESTORE" });
    const file = path.join(backup_directory, "payload/tls/ca.pem"); const before = fs.readFileSync(file); fs.writeFileSync(file, "corrupt"); try { assert.throws(() => recovery.validateBackup(backup_directory, {}, context), { code: "BACKUP_CHECKSUM_MISMATCH" }); } finally { fs.writeFileSync(file, before); }
  } finally {
    if (restored) { driver.inspectProject(restored.prepared.project, Object.keys(restored.prepared.compose.services)); driver.compose(restored.prepared, ["down"]); }
    for (const directory of [backup_directory, restored_root]) { driver.helper(metadata.prepared.composition, directory, "const fs=require('fs');for(const name of fs.readdirSync('/work'))fs.rmSync('/work/'+name,{recursive:true,force:true});", [], true); fs.rmdirSync(directory); }
  }
});
const transitions = require("../../lifecycle/transitions");
const secret_api = require("../../capabilities/secrets");
for (const boundary of ["native", "startup", "protocol"]) test(`failed ${boundary} boundary preserves data and requires explicit reconciliation`, async () => {
  const inputs = JSON.parse(JSON.stringify(metadata.inputs)); inputs.spec.dns.serial++;
  const candidate = await lifecycle.prepareDeployment(lifecycle.composeDeployment(api.planInfrastructure(inputs.spec, inputs.requirements, inputs.adapter_input), metadata.distribution), context);
  let injected = false;
  const failing_driver = { ...driver, compose(prepared, args, options) {
    const match = boundary === "native" ? args[0] === "run" && args.includes("named-checkconf") : boundary === "startup" ? args[0] === "up" && args.at(-1) === "redis" : args[0] === "exec" && args[2] === "redis";
    if (!injected && match) { injected = true; throw Object.assign(new Error("sensitive raw provider failure"), { code: boundary === "native" ? "NATIVE_VALIDATION_FAILED" : boundary === "startup" ? "SERVICE_STARTUP_FAILED" : "FUNCTIONAL_READINESS_FAILED" }); }
    return driver.compose(prepared, args, options);
  } };
  await assert.rejects(() => lifecycle.activateDeployment(candidate, { ...context, driver: failing_driver })); assert.equal(injected, true);
  const state = await lifecycle.inspectDeployment(metadata.root, context); assert.equal(state.ready, false); assert.ok(!JSON.stringify(state).includes("sensitive"));
  assert.equal((await lifecycle.activateDeployment(metadata.prepared, { ...context, recover: true })).ready, true);
});
test("interrupted activation is explicit; corruption and raw observer errors fail closed", async () => {
  journal.append(metadata.root, "activation-intent", metadata.prepared.revision);
  await assert.rejects(() => lifecycle.activateDeployment(metadata.prepared, context), { code: "ACTIVATION_RECOVERY_REQUIRED" });
  assert.equal((await lifecycle.activateDeployment(metadata.prepared, { ...context, recover: true })).ready, true);
  const state = await lifecycle.inspectDeployment(metadata.root, { ...context, driver: { ...driver, inspectProject() { throw Object.assign(new Error("private"), { code: "SECRET_VALUE_LEAK" }); } } });
  assert.deepEqual(state.diagnostic_codes, ["LIFECYCLE_OBSERVATION_FAILED"]); assert.ok(!JSON.stringify(state).includes("private"));
});
test("Redis rotation transitions all declared consumers before committing; retains previous generation", async () => {
  const descriptor = metadata.prepared.composition.plan.required_secrets.find((value) => value.type === "redis-auth");
  const store = secret_api.createFilesystemSecretStore(path.join(metadata.root, "secrets"), metadata.prepared.instance_id); const before = store.inspect(descriptor.ref).fingerprint;
  const result = await transitions.rotateSecret(metadata.root, { authorized: true, ref: descriptor.ref, expected_fingerprint: before, consumer_transition: "il3-test-transition" }, context);
  assert.equal(result.status, "committed"); assert.notEqual(result.active_fingerprint, before); assert.deepEqual(result.transitioned, result.consumers); assert.equal(result.pending_cleanup, true);
  const state = await lifecycle.inspectDeployment(metadata.root, context); assert.equal(state.ready, true); metadata.prepared = require("../../lifecycle/activation").readActive(metadata.root).prepared;
  const generations = fs.readdirSync(path.join(metadata.root, "secrets", descriptor.ref.resource, descriptor.ref.key)).filter((value) => value.endsWith(".secret")); assert.ok(generations.length >= 2);
});
test("failed Redis rotation restores previous working consumer generation", async () => {
  const descriptor = metadata.prepared.composition.plan.required_secrets.find((value) => value.type === "redis-auth"); const before = metadata.prepared.fingerprints;
  let injected = false; const failing_driver = { ...driver, compose(prepared, args, options) { if (!injected && args[0] === "up" && args.at(-1) === "redis") { injected = true; throw Object.assign(new Error("failure"), { code: "SERVICE_STARTUP_FAILED" }); } return driver.compose(prepared, args, options); } };
  await assert.rejects(() => transitions.rotateSecret(metadata.root, { authorized: true, ref: descriptor.ref, expected_fingerprint: before.find((value) => JSON.stringify(value.ref) === JSON.stringify(descriptor.ref)).fingerprint, consumer_transition: "failed-transition" }, { ...context, driver: failing_driver }), { code: "SECRET_ROTATION_FAILED_PREVIOUS_GENERATION_RESTORED" });
  assert.equal(injected, true); assert.equal((await lifecycle.inspectDeployment(metadata.root, context)).ready, true); assert.deepEqual(require("../../lifecycle/activation").readActive(metadata.root).prepared.fingerprints, before);
});
test("local leaf renewal preserves CA, records scheduler prerequisite and never invents automatic activation", async () => {
  const before = metadata.prepared.certificate;
  const state = await transitions.renewDeployment(metadata.root, context); assert.equal(state.ready, true); metadata.prepared = require("../../lifecycle/activation").readActive(metadata.root).prepared;
  assert.equal(metadata.prepared.certificate.ca_fingerprint, before.ca_fingerprint); assert.notEqual(metadata.prepared.certificate.fingerprint, before.fingerprint);
  const scheduled = transitions.renewalTrigger(metadata.root, context, Date.parse(metadata.prepared.certificate.expires_at) - 86400000); assert.equal(scheduled.due, true); assert.equal(scheduled.automatic, false);
  assert.equal(state.certificate.readiness, "prepared-pending-activation");
});
test("an occupied published port is rejected without touching the listener", async () => {
  const net = require("node:net"); const server = net.createServer(); await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const inputs = JSON.parse(JSON.stringify(metadata.prepared.composition.plan.inputs)); for (const binding of inputs.adapter_input.services.dns.bindings) { binding.host_address = "127.0.0.1"; binding.host_port = server.address().port; }
    const candidate = await lifecycle.prepareDeployment(lifecycle.composeDeployment(api.planInfrastructure(inputs.spec, inputs.requirements, inputs.adapter_input), metadata.distribution), context);
    await assert.rejects(() => lifecycle.activateDeployment(candidate, context), { code: "CONFLICTING_PORT_BINDING" }); assert.equal(server.listening, true); assert.equal((await lifecycle.inspectDeployment(metadata.root, context)).ready, true);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
test("an existing unowned network is rejected; only the test-created foreign network is removed", async () => {
  const name = metadata.project + "-foreign"; driver.docker(["network", "create", "--label", "org.drumee.infra.owner=" + name, name]);
  try {
    const inputs = JSON.parse(JSON.stringify(metadata.prepared.composition.plan.inputs)); inputs.adapter_input.network = name;
    const candidate = await lifecycle.prepareDeployment(lifecycle.composeDeployment(api.planInfrastructure(inputs.spec, inputs.requirements, inputs.adapter_input), metadata.distribution), context);
    await assert.rejects(() => lifecycle.activateDeployment(candidate, context), { code: "NETWORK_OWNERSHIP_MISMATCH" }); assert.equal((await lifecycle.inspectDeployment(metadata.root, context)).ready, true);
  } finally {
    assert.equal(driver.docker(["network", "inspect", "--format", '{{index .Labels "org.drumee.infra.owner"}}', name]).trim(), name); driver.docker(["network", "rm", name]);
  }
});
test("compatible configuration rollback preserves data; schema and credential rollback fail closed", async () => {
  const prior = metadata.prepared; const inputs = JSON.parse(JSON.stringify(prior.composition.plan.inputs)); inputs.spec.dns.clients.push("192.0.2.0/24");
  const candidate = await lifecycle.prepareDeployment(lifecycle.composeDeployment(api.planInfrastructure(inputs.spec, inputs.requirements, inputs.adapter_input), metadata.distribution), context);
  assert.equal((await lifecycle.activateDeployment(candidate, context)).ready, true); assert.equal((await recovery.rollbackDeployment(metadata.root, prior.revision, context)).ready, true);
  assert.deepEqual(require("../../lifecycle/activation").readActive(metadata.root).prepared.fingerprints, prior.fingerprints);
  const earlier = JSON.parse(fs.readFileSync(process.env.IL3_METADATA)).prepared;
  await assert.rejects(() => recovery.rollbackDeployment(metadata.root, earlier.revision, context), { code: "INCOMPATIBLE_ROLLBACK" });
});
test("image rebuild requires verified backup and unchanged engine version; tag-only rollback is rejected", async () => {
  const { spawnSync } = require("node:child_process"); const repository = path.resolve(__dirname, "../.."); const image = "drumee-il3-upgrade:" + metadata.project;
  const backup_directory = fs.mkdtempSync(path.join(os.tmpdir(), "il3-upgrade-backup-"));
  try {
    const build = spawnSync("docker", ["build", "--label", "org.drumee.infra.owner=" + metadata.project, "--label", "org.drumee.infra.test.upgrade=1", "-t", image, "-f", path.join(repository, "capabilities/docker/Dockerfile.services"), repository], { stdio: "pipe", timeout: 300000 }); assert.equal(build.status, 0);
    fs.writeFileSync(path.join(metadata.root, "test-upgrade-image.json"), JSON.stringify({image}), {mode:0o600});
    const image_id = driver.docker(["image", "inspect", image, "--format", "{{.Id}}"] ).trim(); const inputs = JSON.parse(JSON.stringify(metadata.prepared.composition.plan.inputs)); inputs.adapter_input.services.dns.image = image_id;
    const candidate = await lifecycle.prepareDeployment(lifecycle.composeDeployment(api.planInfrastructure(inputs.spec, inputs.requirements, inputs.adapter_input), metadata.distribution), context);
    await assert.rejects(() => lifecycle.activateDeployment(candidate, context), { code: "VERIFIED_BACKUP_REQUIRED" });
    const backup = await recovery.backupDeployment(metadata.root, backup_directory, { ...context, quiescence: "stop-owned-writers", resume_after_backup: true });
    const state = await lifecycle.activateDeployment(candidate, { ...context, backup_evidence: { directory: backup_directory, manifest_digest: backup.manifest_digest } }); assert.equal(state.ready, true); assert.ok(state.change.categories.includes("image-upgrade"));
    await assert.rejects(() => recovery.rollbackDeployment(metadata.root, metadata.prepared.revision, context), { code: "INCOMPATIBLE_ROLLBACK" }); metadata.prepared = candidate;
  } finally {
    driver.helper(metadata.prepared.composition, backup_directory, "const fs=require('fs');for(const name of fs.readdirSync('/work'))fs.rmSync('/work/'+name,{recursive:true,force:true});", [], true); fs.rmdirSync(backup_directory);
    // Remove only this task-created tag after its container has been replaced
    // by the harness cleanup; an in-use image is retained until cleanup there.
    // The parent removes the owned tag after stopping its containers.
  }
});
