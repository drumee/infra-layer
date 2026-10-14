"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const api = require("../../lib");
const dns = require("../../capabilities/dns");
const { inputs } = require("../support/inputs");
const { serviceInputs } = require("../support/service-inputs");
function plan(value = serviceInputs(), observation) { return api.planInfrastructure(value.spec, value.requirements, value.adapter_input, observation); }
test("contract v2 integrates independently composable services; validation/planning deterministic, redacted and pure", () => {
  const value = serviceInputs(); const original = JSON.stringify(value); assert.equal(api.validateSpec(value.spec, value.requirements).valid, true);
  const first = plan(value); assert.equal(first.applicable, true, JSON.stringify(first.diagnostics)); assert.equal(first.contract_version, "2"); assert.equal(first.effective_domain, "drumee.lan"); assert.deepEqual(first, plan(value)); assert.equal(JSON.stringify(value), original);
  assert.equal(first.capabilities.length, 5); assert.ok(first.resources.some((value) => value.backup_required)); assert.doesNotMatch(JSON.stringify(first), /BEGIN PRIVATE KEY|requirepass "[a-zA-Z0-9]{16}/);
  for (const artifact of first.artifacts.filter((value) => value.path.endsWith(".compose.json"))) { const fragment = JSON.parse(artifact.content); for (const service of Object.values(fragment.services)) { assert.equal(service.privileged, undefined); assert.equal(service.network_mode, undefined); assert.equal(service.labels["org.drumee.infra.revision"], first.revision); assert.ok(service.volumes.filter((value) => value.target.startsWith("/run/secrets")).every((value) => value.read_only)); } }
});
test("v1 retains exact behavior; version combinations/new fields cannot be silently dropped", () => {
  const legacy = inputs(); assert.equal(api.planInfrastructure(legacy.spec, legacy.requirements, legacy.adapter_input).applicable, true);
  legacy.spec.database = serviceInputs().spec.database; assert.equal(api.validateSpec(legacy.spec, legacy.requirements).valid, false);
  const value = serviceInputs(); value.requirements.contract_version = "1"; assert.equal(plan(value).applicable, false);
});
for (const [mode, supplied, effective] of [["none", "example.com", "example.com"], ["none", null, undefined], ["local", "example.com", "example.com"], ["local", null, "drumee.lan"], ["localhost", "example.com", "localhost"], ["localhost", null, "localhost"]]) test(`v2 DNS ${mode} supplied ${supplied}`, () => {
  const value = serviceInputs(); delete value.spec.tls; delete value.spec.mail; delete value.adapter_input.services.mail; delete value.adapter_input.services.dkim; value.requirements.capabilities = ["database", "redis"];
  if (supplied) value.spec.instance.domain = supplied; else delete value.spec.instance.domain;
  if (mode === "local") { value.spec.dns.split_horizon = true; } else { value.spec.dns = { mode }; delete value.adapter_input.services.dns; }
  const result = plan(value); assert.equal(result.applicable, true, JSON.stringify(result.diagnostics)); assert.equal(result.effective_domain, effective); assert.equal(result.artifacts.some((entry) => entry.path === "dns.compose.json"), mode === "local");
  if (mode !== "local") assert.ok(result.required_secrets.every((entry) => entry.type !== "dns-tsig"));
});
test("malformed v2 nested values and duplicate durable ownership yield diagnostics without throwing", () => {
  for (const bad of [null, [], {}, "malformed", 1]) for (const mutate of [(value) => { value.spec.dns.clients = bad; value.spec.dns.recursion = true; value.spec.dns.forwarders = ["1.1.1.1"]; }, (value) => { value.adapter_input.services.dns.bindings = bad; }, (value) => { value.adapter_input.resource_sources = bad; }, (value) => { value.spec.secrets.resources = bad; }, (value) => { value.spec.tls = bad; }]) { const value = serviceInputs(); mutate(value); assert.equal(plan(value).applicable, false); }
  const value = serviceInputs(); value.spec.database.state_resource = value.spec.dns.state_resource; assert.ok(plan(value).diagnostics.some((entry) => entry.code === "DUPLICATE_RESOURCE_OWNERSHIP"));
});
test("v2 planning never invokes filesystem mutation, lifecycle execution, current time or randomness", () => {
  const value = serviceInputs(); plan(value); const cp = require("node:child_process"); const crypto = require("node:crypto"); const originals = [];
  for (const [object, names] of [[fs, ["writeFileSync", "mkdirSync", "renameSync", "unlinkSync"]], [cp, ["execFileSync", "spawnSync", "execFile"]], [crypto, ["randomBytes", "randomUUID"]], [Date, ["now"]]]) for (const name of names) { originals.push([object, name, object[name]]); object[name] = () => { throw new Error("PLANNING_SIDE_EFFECT"); }; }
  try { assert.equal(api.validateSpec(value.spec, value.requirements).valid, true); assert.equal(plan(value).applicable, true); } finally { for (const [object, name, original] of originals) object[name] = original; }
});
test("Nginx plus DB does not pull DNS, Redis, SMTP or ACME and preserves canonical v1 Nginx bytes", () => {
  const value = serviceInputs(); const legacy = inputs(); value.spec.dns = { mode: "none" }; value.spec.instance.domain = legacy.spec.instance.domain; value.spec.http = legacy.spec.http;
  delete value.spec.tls; delete value.spec.redis; delete value.spec.mail; value.requirements = { contract_version: "2", capabilities: ["http-gateway", "database"], http: legacy.requirements.http }; value.adapter_input.services = { database: value.adapter_input.services.database }; value.adapter_input.gateway = legacy.adapter_input;
  value.adapter_input.gateway.project = value.adapter_input.project; value.adapter_input.gateway.network = value.adapter_input.network;
  const result = plan(value); assert.equal(result.applicable, true, JSON.stringify(result.diagnostics)); assert.equal(result.artifacts.find((entry) => entry.path === "nginx.conf").content, api.planInfrastructure(legacy.spec, legacy.requirements, legacy.adapter_input).artifacts[0].content); assert.equal(result.capabilities.length, 2);
});
test("external database/cache generate endpoint prerequisites, never managed containers or init jobs", () => {
  const value = serviceInputs(); value.spec.dns = { mode: "none" }; delete value.spec.tls; delete value.spec.mail; value.requirements.capabilities = ["database", "redis"]; value.adapter_input.services = {};
  value.spec.database.mode = "external"; for (const field of ["admin_secret_ref", "state_resource", "initialize"]) delete value.spec.database[field]; value.spec.redis.mode = "external"; value.spec.redis.persistence = "ephemeral"; delete value.spec.redis.state_resource;
  const result = plan(value); assert.equal(result.applicable, true, JSON.stringify(result.diagnostics)); assert.equal(result.artifacts.length, 0); assert.ok(result.prerequisites.some((value) => value.code.startsWith("EXTERNAL_DATABASE")));
});
test("unsupported/open/injected/exposed resources and secret-consumer violations fail closed", () => {
  for (const mutate of [
    (value) => { value.spec.dns.mode = "auto"; }, (value) => { value.spec.dns.recursion = true; value.spec.dns.clients = ["0.0.0.0/0"]; value.spec.dns.forwarders = ["1.1.1.1"]; },
    (value) => { value.spec.dns.ipv6 = "2001:db8::1"; }, (value) => { value.spec.mail.clients = ["0.0.0.0/0"]; }, (value) => { value.spec.mail.relay_endpoint.host = "external.example"; },
    (value) => { value.spec.database.service_user = "root'; DROP"; }, (value) => { value.adapter_input.services.redis.bindings = [{ host_address: "0.0.0.0", host_port: 6379, protocol: "tcp" }]; },
    (value) => { value.adapter_input.services.dns.data_source = value.adapter_input.services.database.data_source; }, (value) => { value.spec.secrets.resources.find((entry) => entry.type === "tls-leaf-key").consumers = ["tls-issuer"]; },
    (value) => { value.spec.database.password = "DO-NOT-ECHO"; }, (value) => { value.adapter_input.resource_sources[0].source = "/tmp/../../etc/shadow"; }
  ]) { const value = serviceInputs(); mutate(value); const result = plan(value); assert.equal(result.applicable, false); assert.ok(result.diagnostics.length); assert.ok(!JSON.stringify(result).includes("DO-NOT-ECHO")); }
});
test("DNS port observations and serial preparation prevent conflict/implicit overwrite", (t) => {
  const value = serviceInputs(); const conflict = plan(value, { ports: [{ address: "127.0.0.1", port: 15353, protocol: "udp" }] }); assert.equal(conflict.applicable, false); assert.equal(conflict.conflicts[0].code, "CONFLICTING_PORT_BINDING");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "infra-zone-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const first = dns.prepareZone("drumee.lan", value.spec.dns, null, root, { authorized: true, owner: "instance" }); const repeated = dns.prepareZone("drumee.lan", value.spec.dns, null, root, { authorized: true, owner: "instance" }); assert.deepEqual(first, repeated);
  value.spec.dns.ipv4 = "192.168.50.11"; assert.throws(() => dns.prepareZone("drumee.lan", value.spec.dns, null, root, { authorized: true, owner: "instance" }), { code: "DNS_SERIAL_NOT_ADVANCED" }); value.spec.dns.serial++;
  const next = dns.prepareZone("drumee.lan", value.spec.dns, null, root, { authorized: true, owner: "instance" }); assert.notEqual(next.zone_digest, first.zone_digest); assert.equal(next.active, false);
  fs.writeFileSync(path.join(root, "infra-zone.json"), "corrupt"); assert.throws(() => dns.prepareZone("drumee.lan", value.spec.dns, null, root, { authorized: true, owner: "instance" }), { code: "DNS_STATE_CORRUPTED" });
});
test("v2 rendering is safe/idempotent and never creates secrets or starts services", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "infra-render-services-")); t.after(() => fs.rmSync(root, { recursive: true, force: true })); const result = plan(); assert.equal(result.applicable, true);
  assert.equal(api.renderPlan(result, root).activated, false); assert.deepEqual(api.renderPlan(result, root).revision, result.revision); assert.equal(fs.existsSync(path.join(root, "secrets")), false);
});
