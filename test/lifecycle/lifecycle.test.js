"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const api = require("../../lib");
const lifecycle = require("../../lifecycle");
const driver = require("../../lifecycle/docker");
const journal = require("../../lifecycle/journal");
if (!process.env.IL3_METADATA) throw new Error("ISOLATED_LIFECYCLE_HARNESS_REQUIRED");
const metadata = JSON.parse(fs.readFileSync(process.env.IL3_METADATA)); const context = { root: metadata.root, authorized: true, create_resources: true };
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
