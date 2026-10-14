"use strict";
const S = require("./spec");
const F = require("./filesystem-safety");
const codes = new Set(["INVALID_DEPLOYMENT_DESCRIPTOR", "CAPABILITY_OBSERVATION_FAILED", "CAPABILITY_RESOURCE_MISSING", "CAPABILITY_OWNERSHIP_MISMATCH", "CAPABILITY_REVISION_MISMATCH", "UNEXPECTED_SERVICE_EXPOSURE", "TLS_MATERIAL_NOT_CONFIRMED", "EXTERNAL_PROTOCOL_OBSERVER_REQUIRED", "CAPABILITY_PROTOCOL_FAILED", "CAPABILITY_PROTOCOL_NOT_CONFIRMED", "CAPABILITY_PROCESS_NOT_CONFIRMED", "CAPABILITY_CONFIGURATION_NOT_CONFIRMED", "CAPABILITY_LOADED_CONFIGURATION_UNVERIFIED", "CAPABILITY_DEPENDENCIES_OUTSTANDING", "CAPABILITY_ENGINE_INCOMPATIBLE", "CAPABILITY_ACTIVATION_PENDING", "SMTP_RELAY_AND_DKIM_PROTOCOL_ATTESTATION_OUTSTANDING", "PROTECTED_DELIVERY_NOT_VERIFIED"]);
async function inspectV2(deployment, adapter) {
  if (!S.plainTree(deployment) || deployment?.contract_version !== "2" || !S.identifier(deployment.id) || !/^[a-f0-9]{64}$/.test(deployment.desired_revision || "") || deployment.plan?.contract_version !== "2" || !adapter || typeof adapter.observe !== "function") F.fail("INVALID_DEPLOYMENT_DESCRIPTOR");
  const checked = require("./plan").planInfrastructure(deployment.plan.inputs?.spec, deployment.plan.inputs?.requirements, deployment.plan.inputs?.adapter_input);
  if (!checked.applicable || checked.revision !== deployment.desired_revision || S.serialize(checked.artifacts) !== S.serialize(deployment.plan.artifacts)) F.fail("INVALID_DEPLOYMENT_DESCRIPTOR");
  let observed; try { observed = await adapter.observe(deployment); } catch (error) { observed = { error: codes.has(error?.code) ? error.code : "CAPABILITY_OBSERVATION_FAILED" }; }
  if (!S.plainTree(observed) || !S.record(observed)) observed = { error: "CAPABILITY_OBSERVATION_FAILED" };
  const capabilities = checked.capabilities.map((declared) => {
    const record = Array.isArray(observed.capabilities) ? observed.capabilities.find((value) => S.record(value) && value.name === declared.name) || {} : {};
    const diagnostics = [...(observed.error ? [codes.has(observed.error) ? observed.error : "CAPABILITY_OBSERVATION_FAILED"] : []), ...(Array.isArray(record.diagnostic_codes) ? record.diagnostic_codes.map((value) => codes.has(value) ? value : "CAPABILITY_OBSERVATION_FAILED") : [])];
    const loaded_verified = S.record(record.loaded_configuration) && record.loaded_configuration.revision === checked.revision && record.loaded_configuration.evidence === "runtime-configuration-attestation";
    if (record.observed_revision !== checked.revision) diagnostics.push("CAPABILITY_REVISION_MISMATCH");
    if (record.resource_present !== true) diagnostics.push("CAPABILITY_RESOURCE_MISSING");
    if (record.configuration_valid !== true) diagnostics.push("CAPABILITY_CONFIGURATION_NOT_CONFIRMED");
    if (!loaded_verified) diagnostics.push("CAPABILITY_LOADED_CONFIGURATION_UNVERIFIED");
    if (record.pending_activation === true) diagnostics.push("CAPABILITY_ACTIVATION_PENDING");
    if (declared.name !== "tls" && (record.running !== true || record.health !== "healthy")) diagnostics.push("CAPABILITY_PROCESS_NOT_CONFIRMED");
    if (record.protocol_functional !== true) diagnostics.push("CAPABILITY_PROTOCOL_NOT_CONFIRMED");
    if (declared.name === "http-gateway" && record.protected_delivery_verified !== true) diagnostics.push("PROTECTED_DELIVERY_NOT_VERIFIED");
    if (record.dependencies_satisfied !== true) diagnostics.push("CAPABILITY_DEPENDENCIES_OUTSTANDING");
    if (declared.name === "database" && record.engine_compatible !== true) diagnostics.push("CAPABILITY_ENGINE_INCOMPATIBLE");
    const capability = { name: declared.name, required: declared.required, readiness: diagnostics.length ? record.running === true || record.resource_present === true ? "degraded" : "unknown" : "ready", diagnostic_codes: [...new Set(diagnostics)],
      configuration_valid: record.configuration_valid === true ? "valid" : "unverified", resource_present: record.resource_present === true, process_healthy: record.running === true && record.health === "healthy", protocol_functional: record.protocol_functional === true,
      loaded_configuration: loaded_verified ? "verified" : "unverified", dependencies_satisfied: record.dependencies_satisfied === true, pending_activation: record.pending_activation === true };
    if (/^[a-f0-9]{64}$/.test(record.observed_revision || "")) capability.observed_revision = record.observed_revision;
    if (/^[0-9][0-9a-zA-Z.+_-]{1,60}$/.test(record.version || "")) capability.version = record.version;
    if (/^[A-F0-9:]{95}$/.test(record.certificate_fingerprint || "")) capability.certificate_fingerprint = record.certificate_fingerprint;
    if (typeof record.expires_at === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(record.expires_at)) capability.expires_at = record.expires_at;
    if (declared.name === "database") { capability.schema_prerequisites = "kernel-module-owner"; capability.engine_compatible = record.engine_compatible === true ? "compatible" : record.engine_compatible === false ? "incompatible" : "unverified"; }
    return capability;
  });
  return { contract_version: "2", deployment: deployment.id, desired_revision: deployment.desired_revision, capabilities, metadata: { adapter: S.identifier(adapter.kind) ? adapter.kind : "explicit-observer" } };
}
function diagnoseV2(state, requirements) {
  if (!S.plainTree(state) || state?.contract_version !== "2" || !Array.isArray(state.capabilities) || !S.plainTree(requirements) || requirements?.contract_version !== "2" || !Array.isArray(requirements.capabilities)) return { ready: false, diagnostics: [{ code: "INVALID_OBSERVATION" }] };
  const diagnostics = [];
  for (const name of requirements.capabilities) { const value = state.capabilities.find((entry) => entry?.name === name); if (!value) diagnostics.push({ code: "CAPABILITY_RESOURCE_MISSING", capability: name }); else for (const code of value.diagnostic_codes || []) diagnostics.push({ code: codes.has(code) ? code : "CAPABILITY_OBSERVATION_FAILED", capability: name }); }
  return { ready: requirements.capabilities.every((name) => state.capabilities.some((value) => value.name === name && value.readiness === "ready")) && diagnostics.length === 0, diagnostics };
}
module.exports = { inspectV2, diagnoseV2 };
