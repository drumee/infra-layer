"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const api = require("../../lib");
const { composeDeployment } = require("../../lifecycle");
const { serviceInputs } = require("../support/service-inputs");
const helper_image = "node@sha256:" + "b".repeat(64);
function fixture() { const value = serviceInputs(); delete value.spec.mail; delete value.adapter_input.services.mail; delete value.adapter_input.services.dkim; value.requirements.capabilities = ["tls", "dns", "database", "redis"]; const plan = api.planInfrastructure(value.spec, value.requirements, value.adapter_input); return { plan, distribution: { contract_version: "1", id: "test-distribution", profile: "infrastructure", init_jobs: [], persistent_resources: [], schema_versions: {}, external_writers: "none", helper_image, provenance: { repository: "https://github.com/drumee/infra-layer", revision: "0f5fb92cccae1441ba45c288acf7fc06b57ba6eb", path: "test/services", acceptance: "infrastructure" } } }; }
test("composition is pure/deterministic, preserves private networks and orders persistent services", () => {
  const { plan, distribution } = fixture(); const original = JSON.stringify({ plan, distribution }); const value = composeDeployment(plan, distribution); assert.deepEqual(value, composeDeployment(plan, distribution)); assert.equal(JSON.stringify({ plan, distribution }), original);
  assert.deepEqual(value.activation_order, ["dns", "database", "redis"]); assert.deepEqual(value.shutdown_order, ["redis", "database", "dns"]); assert.equal(value.compose.networks.kernel.external, undefined);
  for (const name of ["database", "redis"]) assert.equal(value.compose.services[name].ports.length, 0);
});
test("tampered plans, unsupported contracts and missing kernel composition fail closed", () => {
  const { plan, distribution } = fixture(); assert.throws(() => composeDeployment({ ...plan, revision: "0".repeat(64) }, distribution), { code: "DEPLOYMENT_PLAN_TAMPERED" });
  for (const change of [(value) => { value.contract_version = "2"; }, (value) => { value.profile = "kernel"; }, (value) => { value.helper_image = "node:latest"; }, (value) => { value.external_writers = "unknown"; }]) { const value = structuredClone(distribution); change(value); assert.throws(() => composeDeployment(plan, value)); }
});
test("duplicate durable resources and arbitrary mounts are rejected", () => {
  const { plan, distribution } = fixture(); distribution.persistent_resources = [{ id: "duplicate", source: plan.resources.find((value) => value.kind === "filesystem-state").source, uid: 1000, gid: 1000, backup_required: true }]; assert.throws(() => composeDeployment(plan, distribution), { code: "DUPLICATE_VOLUME_OWNERSHIP" });
});
test("untrusted distribution fields/credentials and accessor input cannot execute", () => {
  const { plan, distribution } = fixture(); distribution.password = "DO-NOT-ECHO"; assert.throws(() => composeDeployment(plan, distribution), (error) => error.code === "INVALID_DISTRIBUTION_CONTRACT" && !error.message.includes("DO-NOT-ECHO"));
  let accessed = false; const input = { get contract_version() { accessed = true; } }; assert.throws(() => composeDeployment(plan, input), { code: "INVALID_DISTRIBUTION_CONTRACT" }); assert.equal(accessed, false);
});
module.exports = { fixture };
