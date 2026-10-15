"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const api = require("../../lib");
const { composeDeployment } = require("../../lifecycle");
const { verifyComposition } = require("../../lifecycle/composition");
const { serviceInputs } = require("../support/service-inputs");
const { inputs: gatewayInputs } = require("../support/inputs");
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
function kernelFixture() {
  const { plan, distribution } = fixture(); const value = structuredClone(plan.inputs); const gateway = gatewayInputs(); value.spec.http = gateway.spec.http; value.requirements.http = gateway.requirements.http; value.requirements.capabilities.push("http-gateway"); value.adapter_input.gateway = gateway.adapter_input; value.adapter_input.gateway.project = value.adapter_input.project; value.adapter_input.gateway.network = value.adapter_input.network;
  value.spec.secrets.resources.find((entry) => entry.type === "database-admin").consumers.push("bootstrap");
  const kernel_plan = api.planInfrastructure(value.spec, value.requirements, value.adapter_input); assert.equal(kernel_plan.applicable, true, JSON.stringify(kernel_plan.diagnostics));
  const base = { image: helper_image, uid: 1000, gid: 1000, mounts: [], secret_mounts: [], command: ["node", "distribution-owned-entrypoint.js"] };
  distribution.profile = "kernel"; distribution.provenance.acceptance = "contract-fixture";
  distribution.init_jobs = [{ ...base, id: "bootstrap", requires: ["database"], effect: "idempotent", artifact_revision: "c".repeat(40), validation_command: ["node", "distribution-owned-validation.js"], secret_mounts: [{ ref: value.spec.database.admin_secret_ref, consumer: "bootstrap", target: "/run/secrets/admin", format: "raw" }] }];
  distribution.kernel = { ...base, id: "kernel", requires: ["database", "redis", "bootstrap"], listener_ports: [3101, 3102], healthcheck: { test: ["CMD", "node", "distribution-owned-readiness.js"], interval: "2s", timeout: "2s", retries: 10 } };
  return { plan: kernel_plan, distribution };
}
test("full supplied kernel composition orders engine health, completed jobs, kernel readiness then gateway", () => {
  const { plan, distribution } = kernelFixture(); const value = composeDeployment(plan, distribution);
  assert.equal(value.compose.services.kernel.depends_on.bootstrap.condition, "service_completed_successfully"); assert.equal(value.compose.services.kernel.depends_on.database.condition, "service_healthy"); assert.equal(value.compose.services.gateway.depends_on.kernel.condition, "service_healthy"); assert.equal(value.compose.services.bootstrap.restart, "no"); assert.equal(value.projections[0].consumer, "bootstrap");
  assert.deepEqual(value.activation_order, ["dns", "database", "redis", "bootstrap", "kernel", "gateway"]);
});
test("duplicate service, invalid secret consumer, listener mismatch and missing dependency fail closed", () => {
  for (const mutate of [(value) => { value.kernel.id = "database"; }, (value) => { value.init_jobs[0].secret_mounts[0].consumer = "unrelated"; }, (value) => { value.kernel.listener_ports = [9000]; }, (value) => { value.kernel.requires = ["database"]; }, (value) => { value.init_jobs[0].requires = ["kernel"]; }, (value) => { value.kernel.environment = { PASSWORD: "DO-NOT-ECHO" }; }]) { const { plan, distribution } = kernelFixture(); mutate(distribution); assert.throws(() => composeDeployment(plan, distribution)); }
});
module.exports = { fixture };
test("resource input order cannot change composition identity or fail its own verification", () => {
  const { plan, distribution } = fixture();
  const resource = id => ({ id, source: "/tmp/distribution-" + id, uid: 1000, gid: 1000, backup_required: true });
  distribution.persistent_resources = [resource("zeta"), resource("alpha")];
  const before = JSON.stringify(distribution);
  const composition = composeDeployment(plan, distribution);
  assert.deepEqual(verifyComposition(composition), composition);
  assert.equal(JSON.stringify(distribution), before);
  distribution.persistent_resources.reverse();
  assert.deepEqual(composeDeployment(plan, distribution), composition);
  const modified = structuredClone(composition); modified.resources[0].owner = "unrelated";
  assert.throws(() => verifyComposition(modified), { code: "COMPOSITION_TAMPERED" });
});
