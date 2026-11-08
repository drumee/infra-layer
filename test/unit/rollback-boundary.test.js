"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const { fixture } = require("../support/rollback-boundary-fixture.cjs"), A = require("../../lifecycle/activation"), J = require("../../lifecycle/journal");
const reached = f => f.calls.some(call => call.operation === "compose" && call.args[0] === "up");
async function run(body) { const f = fixture(); try { await body(f); } finally { f.cleanup(); } }
async function rejected(f, code, fn = f.run) { await assert.rejects(fn, { code }); assert.equal(reached(f), false); }
test("R5 E1-E4 authorized volatile-state rollback admits the exact target, recreates and finishes strict ready", () => run(async f => {
  const state = await f.run(); assert.equal(state.ready, true); assert.equal(reached(f), true);
  const operations = f.calls.map(call => call.operation), admission = operations.indexOf("recovery-network"), up = f.calls.findIndex(call => call.operation === "compose" && call.args[0] === "up");
  assert.ok(admission > operations.indexOf("verifyPrepared")); assert.ok(up > admission); assert.ok(operations.lastIndexOf("strict-network") > up);
  assert.equal(f.calls[admission].targets[0].recovery_endpoint, true); assert.equal(f.resource.restarting, false); assert.equal(f.resource.id, "1".repeat(64));
  const admitted = J.readJournal(f.root).find(event => event.details.code === "ROLLBACK_RECOVERY_ADMITTED"); assert.equal(admitted.details.service, "application");
}));
test("R5 E7 strict readiness still refuses the actual restart-backoff metadata", () => run(async f => { assert.throws(() => f.driver.checkNetworks(f.prepared.composition, { require_existing: true }), { code: "NETWORK_ATTACHMENT_MISMATCH" }); assert.equal(reached(f), false); }));
test("R5 E8 undeclared attachment refuses rollback before recreation", () => run(async f => { f.resource.networks.extra = { NetworkID: "f".repeat(64), EndpointID: "" }; await rejected(f, "NETWORK_ATTACHMENT_MISMATCH"); }));
test("R5 E9 foreign owner refuses rollback before recreation", () => run(async f => { f.resource.owner = "foreign"; await rejected(f, "RUNTIME_IDENTITY_MISMATCH"); }));
test("R5 E10 wrong project refuses rollback before recreation", () => run(async f => { f.resource.project = "foreign"; await rejected(f, "RUNTIME_IDENTITY_MISMATCH"); }));
test("R5 E11 authorized wrong-service identity cannot replace journal target", () => run(async f => { f.resource.service = "other"; await rejected(f, "RUNTIME_IDENTITY_MISMATCH"); }));
test("R5 E12 wrong network ID refuses before recreation", () => run(async f => { f.resource.networks[f.network.name].NetworkID = "f".repeat(64); await rejected(f, "NETWORK_ATTACHMENT_MISMATCH"); }));
test("R5 E12 incorrect container ID refuses before recreation", () => run(async f => { f.resource.id = "unknown"; await rejected(f, "RUNTIME_IDENTITY_MISMATCH"); }));
test("R5 E13 legitimate owner labels cannot authorize wrong canonical name", () => run(async f => { f.resource.name = "/foreign-application-1"; await rejected(f, "RUNTIME_IDENTITY_MISMATCH"); }));
test("R5 E14 duplicate plausible service targets fail closed", () => run(async f => { const inspect = f.driver.inspectProject; f.driver.inspectProject = () => { const values = inspect(); return [...values, { ...values[0], id: "9".repeat(64) }]; }; await rejected(f, "DUPLICATE_SERVICE_IDENTITY"); }));
test("R5 E15 an unverified candidate fails before recreation", () => run(async f => { const P = require("../../lifecycle/preparation"), replacement = test.mock.method(P, "verifyPrepared", () => { throw Object.assign(Error("PREPARED_DEPLOYMENT_TAMPERED"), { code: "PREPARED_DEPLOYMENT_TAMPERED" }); }); try { await rejected(f, "PREPARED_DEPLOYMENT_TAMPERED"); } finally { replacement.mock.restore(); } }));
test("R5 E16 unauthorized rollback cannot reach admission", () => run(async f => { f.context.authorized = false; await rejected(f, "ROLLBACK_OPERATION_NOT_AUTHORIZED"); }));
test("R5 E17 recover true alone retains the strict normal activation preflight", () => run(async f => { await rejected(f, "NETWORK_ATTACHMENT_MISMATCH", f.normal); assert.equal(f.calls.some(call => call.operation === "recovery-network"), false); }));
test("R5 failed-service evidence is mandatory rather than inferred from labels", () => run(async f => { J.append(f.root, "recovery-required", f.broken.revision, { code: "DOCKER_LIFECYCLE_COMMAND_FAILED" }); await rejected(f, "ROLLBACK_OPERATION_NOT_AUTHORIZED"); }));
test("R5 E19 recreation failure remains fatal and never writes a successful active event", () => run(async f => { f.commandFailure = true; await assert.rejects(f.run, { code: "DOCKER_LIFECYCLE_COMMAND_FAILED" }); assert.equal(reached(f), true); assert.equal(J.readJournal(f.root).at(-1).phase, "recovery-required"); assert.equal(J.readJournal(f.root).at(-1).details.service, "application"); }));
test("R5 E20 missing final membership fails after recreation", () => run(async f => { f.final = state => { state.resource.networks = {}; state.network.containers = {}; }; await assert.rejects(f.run, { code: "NETWORK_ATTACHMENT_MISMATCH" }); assert.equal(reached(f), true); assert.equal(J.readJournal(f.root).at(-1).phase, "recovery-required"); }));
test("R5 E21 extra final attachment fails after recreation", () => run(async f => { f.final = state => { state.resource.networks.extra = {}; }; await assert.rejects(f.run, { code: "NETWORK_ATTACHMENT_MISMATCH" }); assert.equal(reached(f), true); }));
test("R5 E22 unhealthy recreated service is refused", () => run(async f => { f.final = state => { state.resource.health = "unhealthy"; }; await assert.rejects(f.run, { code: "SERVICE_STARTUP_FAILED" }); assert.equal(reached(f), true); }));
test("R5 configured exposure stays exact when live restart ports are empty", () => run(async f => { f.resource.configured_ports["3101/tcp"][0].HostIp = "0.0.0.0"; await rejected(f, "UNEXPECTED_SERVICE_EXPOSURE"); }));
test("R5 live exposure cannot expand beyond configured bindings", () => run(async f => { f.resource.ports = { "3101/tcp": [{ HostIp: "0.0.0.0", HostPort: "30001" }] }; await rejected(f, "UNEXPECTED_SERVICE_EXPOSURE"); }));
test("R5 authoritative inspection, not initial snapshot, decides narrow restarting eligibility", () => run(async f => { f.resource.restarting = false; await rejected(f, "NETWORK_ATTACHMENT_MISMATCH"); }));
test("R5 endpoint conflict is not an empty-endpoint accommodation", () => run(async f => { f.resource.networks[f.network.name].EndpointID = "9".repeat(64); await rejected(f, "NETWORK_ATTACHMENT_MISMATCH"); }));
test("R5 direct internal rollback wrapper cannot evade compatibility checks", () => run(async f => { const changed = structuredClone(f.prepared); changed.revision = "9".repeat(64); changed.composition.resources = [{ id: "other" }]; await rejected(f, "INCOMPATIBLE_ROLLBACK", () => A.activateRollback(changed, f.context)); }));
test("R5 failed candidate revision cannot substitute another source identity", () => run(async f => { const file = path.join(f.root, "candidates", f.broken.revision, "prepared.json"), saved = JSON.parse(fs.readFileSync(file)); saved.project = "foreign"; fs.writeFileSync(file, JSON.stringify(saved)); await rejected(f, "RUNTIME_IDENTITY_MISMATCH"); }));
test("R5 E18 unrelated restarting service cannot inherit failed-service endpoint permission", () => run(async f => {
  const worker = { ...structuredClone(f.prepared.compose.services.application), ports: [] };
  f.prepared.compose.services.worker = worker; f.broken.compose.services.worker = structuredClone(worker);
  for (const value of [f.prepared, f.broken]) fs.writeFileSync(path.join(value.candidate, "prepared.json"), JSON.stringify(value));
  const activeFile = path.join(f.root, "active.json"), active = JSON.parse(fs.readFileSync(activeFile)); active.prepared = f.prepared; fs.writeFileSync(activeFile, JSON.stringify(active));
  f.secondary = { ...structuredClone(f.resource), id: "7".repeat(64), name: "/" + f.project + "-worker-1", service: "worker", configured_ports: {} }; f.inventory.push(f.secondary.id);
  await rejected(f, "NETWORK_ATTACHMENT_MISMATCH");
}));
test("R5 changed configured bindings or mounts at authoritative reinspection cannot be substituted", async () => {
  for (const mutate of [f => { f.resource.configured_ports["3101/tcp"][0].HostPort = "39999"; }, f => { f.resource.mounts.push({ Source: "/unexpected", Destination: "/extra", RW: true }); }]) await run(async f => {
    const authorize = f.driver.authorizeRecoveryNetworks;
    f.driver.authorizeRecoveryNetworks = (composition, targets) => { mutate(f); return authorize(composition, targets); };
    await rejected(f, "RUNTIME_IDENTITY_MISMATCH");
  });
});
