"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const api = require("../../lib");
const { serviceInputs } = require("../support/service-inputs");
function fixture() { const value = serviceInputs(); const plan = api.planInfrastructure(value.spec, value.requirements, value.adapter_input); return { value, plan, deployment: { contract_version: "2", id: "fixture", desired_revision: plan.revision, plan } }; }
function evidence(plan) { return plan.capabilities.map(({ name }) => ({ name, observed_revision: plan.revision, resource_present: true, configuration_valid: true, loaded_configuration: { revision: plan.revision, evidence: "runtime-configuration-attestation" }, running: true, health: "healthy", protocol_functional: true, dependencies_satisfied: true, engine_compatible: true, protected_delivery_verified: true })); }
test("v2 explicit observer reports ready only with each mandatory evidence", async () => {
  const { value, plan, deployment } = fixture(); const state = await api.inspectInfrastructure(deployment, { observe: async () => ({ capabilities: evidence(plan) }) }); assert.equal(api.diagnoseInfrastructure(state, value.requirements).ready, true);
  assert.ok(state.capabilities.every((value) => value.observed_revision === plan.revision && value.loaded_configuration === "verified")); assert.equal(state.capabilities.find((value) => value.name === "database").schema_prerequisites, "kernel-module-owner");
});
for (const [field, replacement, code] of [["observed_revision", "0".repeat(64), "CAPABILITY_REVISION_MISMATCH"], ["resource_present", false, "CAPABILITY_RESOURCE_MISSING"], ["configuration_valid", false, "CAPABILITY_CONFIGURATION_NOT_CONFIRMED"], ["loaded_configuration", "verified", "CAPABILITY_LOADED_CONFIGURATION_UNVERIFIED"], ["running", false, "CAPABILITY_PROCESS_NOT_CONFIRMED"], ["protocol_functional", false, "CAPABILITY_PROTOCOL_NOT_CONFIRMED"], ["dependencies_satisfied", false, "CAPABILITY_DEPENDENCIES_OUTSTANDING"], ["pending_activation", true, "CAPABILITY_ACTIVATION_PENDING"]]) test(`v2 missing ${field} evidence fails readiness`, async () => {
  const { value, plan, deployment } = fixture(); const records = evidence(plan); records.find((value) => value.name === "dns")[field] = replacement;
  const state = await api.inspectInfrastructure(deployment, { observe: async () => ({ capabilities: records }) }); assert.equal(api.diagnoseInfrastructure(state, value.requirements).ready, false); assert.ok(state.capabilities.find((value) => value.name === "dns").diagnostic_codes.includes(code));
});
test("v2 diagnostics redact observer exceptions and arbitrary metadata", async () => {
  const { plan, deployment } = fixture(); const failed = await api.inspectInfrastructure(deployment, { observe: async () => { throw new Error("PRIVATE-CREDENTIAL"); } }); assert.ok(!JSON.stringify(failed).includes("PRIVATE-CREDENTIAL"));
  const records = evidence(plan); records[0].environment = "PRIVATE-CREDENTIAL"; records[0].diagnostic_codes = ["PRIVATE-CREDENTIAL"];
  const state = await api.inspectInfrastructure(deployment, { observe: async () => ({ capabilities: records, mounts: "PRIVATE-CREDENTIAL" }) }); assert.ok(!JSON.stringify(state).includes("PRIVATE-CREDENTIAL")); assert.ok(state.capabilities[0].diagnostic_codes.includes("CAPABILITY_OBSERVATION_FAILED"));
});
test("v2 invalid plan cannot invoke observer", async () => { const { deployment } = fixture(); deployment.desired_revision = "0".repeat(64); let called = false; await assert.rejects(() => api.inspectInfrastructure(deployment, { observe: async () => { called = true; } }), { code: "INVALID_DEPLOYMENT_DESCRIPTOR" }); assert.equal(called, false); });
