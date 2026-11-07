"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const { load } = require("../network-attachments/load.cjs");
function fixture() {
  const project = "drumee-recovery", id = "a".repeat(64), nid = "b".repeat(64), eid = "c".repeat(64);
  const composition = { project, compose: { services: { application: { networks: ["kernel"] } }, networks: { kernel: { name: project + "-kernel" } } } };
  const network = { id: nid, name: project + "-kernel", owner: project, project, driver: "bridge", internal: false, containers: {} };
  const resource = { id, name: "/" + project + "-application-1", service: "application", owner: project, project, revision: "d".repeat(64), image: "sha256:" + "e".repeat(64), image_id: "sha256:" + "e".repeat(64), running: true, restarting: true, networks: { [network.name]: { NetworkID: nid, EndpointID: "" } } };
  const state = { composition, network, resource, targets: [{ ...structuredClone(resource), recovery_endpoint: true }], error: false, inventory: [id] };
  state.D = load((_program, argv) => {
    const a = argv.slice(2);
    if (state.error) throw Object.assign(Error("fixture Docker failure"), { status: 125 });
    if (a[0] === "ps") return state.inventory.join("\n");
    if (a[0] === "network" && a[1] === "ls") return network.name;
    if (a[0] === "network") return JSON.stringify(network);
    if (a[0] === "container") return JSON.stringify(resource);
    throw Error("UNEXPECTED_FIXTURE_COMMAND");
  });
  state.authorize = () => state.D.authorizeRecoveryNetworks(composition, state.targets);
  state.ready = () => state.D.checkNetworks(composition, { require_existing: true });
  state.attach = () => { resource.restarting = false; resource.networks[network.name].EndpointID = eid; network.containers[id] = { Name: resource.name.slice(1), EndpointID: eid, MacAddress: "", IPv4Address: "", IPv6Address: "" }; };
  return state;
}
test("R4-01 valid operational attachment remains accepted", () => { const f = fixture(); f.attach(); assert.equal(f.ready(), undefined); });
test("R4-02 exact restarting target admits only pre-recreation authorization", () => { const f = fixture(); assert.equal(f.authorize(), undefined); });
test("R4-03 authorized restarting target is never operationally ready", () => { const f = fixture(); f.authorize(); assert.throws(f.ready, { code: "NETWORK_ATTACHMENT_MISMATCH" }); });
test("R4-04 complete replacement is operationally valid", () => { const f = fixture(); f.authorize(); f.attach(); assert.equal(f.ready(), undefined); });
test("R4-05 undeclared extra network is never authorized for recovery", () => { const f = fixture(); f.resource.networks.extra = { NetworkID: "f".repeat(64), EndpointID: "" }; assert.throws(f.authorize, { code: "NETWORK_ATTACHMENT_MISMATCH" }); });
test("R4-06 foreign owner is refused", () => { const f = fixture(); f.resource.owner = "foreign"; assert.throws(f.authorize, { code: "NETWORK_OWNERSHIP_MISMATCH" }); });
test("R4-07 exact snapshot rejects substituted ID/name/revision/image/state", () => {
  for (const key of ["id", "name", "revision", "image", "image_id", "restarting"]) { const f = fixture(); f.targets[0][key] = "wrong"; assert.throws(f.authorize, { code: "RUNTIME_IDENTITY_MISMATCH" }); }
});
test("R4-08 wrong service is refused", () => { const f = fixture(); f.resource.service = "other"; assert.throws(f.authorize, { code: "NETWORK_OWNERSHIP_MISMATCH" }); });
test("R4-09 wrong project is refused", () => { const f = fixture(); f.resource.project = "other"; assert.throws(f.authorize, { code: "NETWORK_OWNERSHIP_MISMATCH" }); });
test("R4-10 Docker command failure is fatal", () => { const f = fixture(); f.error = true; assert.throws(f.authorize, e => e.code === "DOCKER_LIFECYCLE_COMMAND_FAILED" && e.exit_status === 125); });
test("R4-11 disappearance/substitution and duplicate authorization fail", () => { const f = fixture(); f.inventory = []; assert.throws(f.authorize, { code: "RUNTIME_IDENTITY_MISMATCH" }); f.targets.push(f.targets[0]); assert.throws(f.authorize, { code: "RUNTIME_IDENTITY_MISMATCH" }); });
test("R4-12 final missing required membership refuses readiness and authorization", () => { const f = fixture(); f.resource.networks = {}; assert.throws(f.ready, { code: "NETWORK_ATTACHMENT_MISMATCH" }); assert.throws(f.authorize, { code: "NETWORK_ATTACHMENT_MISMATCH" }); });
test("R4-13 final extra membership refuses readiness", () => { const f = fixture(); f.attach(); f.resource.networks.extra = {}; assert.throws(f.ready, { code: "NETWORK_ATTACHMENT_MISMATCH" }); });
test("R4-14 duplicate role resolving to same network is not multihoming", () => { const f = fixture(); f.composition.compose.services.application.networks.push("front"); f.composition.compose.networks.front = { name: f.network.name }; assert.throws(f.authorize, { code: "INVALID_NETWORK_ATTACHMENT" }); });
test("R4-15 recovery cannot select a one-off job or omit an inventoried resource", () => { const f = fixture(); f.resource.name = "/drumee-recovery-application-run-" + "a".repeat(12); f.targets[0].name = f.resource.name; assert.throws(f.authorize, { code: "RUNTIME_IDENTITY_MISMATCH" }); });
test("R4-16 ordinary pre-creation behavior remains compatible", () => { const f = fixture(); f.inventory = []; assert.equal(f.ready(), undefined); });
test("R4 restart exemption cannot accept non-restarting or nonempty invalid endpoint", () => {
  const f = fixture(); f.resource.restarting = false; f.targets[0].restarting = false; assert.throws(f.authorize, { code: "NETWORK_ATTACHMENT_MISMATCH" });
  f.resource.restarting = true; f.targets[0].restarting = true; f.resource.networks[f.network.name].EndpointID = "f".repeat(64); assert.throws(f.authorize, { code: "NETWORK_ATTACHMENT_MISMATCH" });
});
test("R4 rollback authorization requires verified failed/active candidate identity before network admission", () => {
  const P = require("../../lifecycle/preparation"), A = require("../../lifecycle/activation"), { authorizeRollback } = require("../../internal/rollback-authorization");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "il514-rollback-unit-")), revision = "a".repeat(64), project = "drumee-recovery";
  const source = { root, revision, project, instance_id: project, compose: { services: { application: { image: "sha256:fixture", volumes: [] } } }, composition: {} };
  fs.mkdirSync(path.join(root, "candidates", revision), { recursive: true, mode: 0o700 }); fs.writeFileSync(path.join(root, "candidates", revision, "prepared.json"), JSON.stringify(source), { mode: 0o600 });
  const resource = { id: "b".repeat(64), name: "/" + project + "-application-1", owner: project, project, service: "application", revision, image: "sha256:fixture", image_id: "sha256:fixture", ports: {}, configured_ports: {}, mounts: [], running: true, restarting: true };
  const verification = test.mock.method(P, "verifyPrepared", () => source); let admitted = 0;
  const driver = { checkImages: () => ({ "sha256:fixture": "sha256:fixture" }), authorizeRecoveryNetworks: () => { admitted++; } };
  const run = (r = resource, c = { authorized: true }) => authorizeRollback(source, [r], { revision }, { phase: "recovery-required", revision, details: { service: "application" } }, c, driver, A.checkObserved);
  try {
    run(); assert.equal(admitted, 1); assert.equal(verification.mock.calls.length, 1);
    assert.throws(() => run(resource, { authorized: false }), { code: "ROLLBACK_OPERATION_NOT_AUTHORIZED" });
    for (const key of ["owner", "image", "image_id", "revision", "service", "project"]) { assert.throws(() => run({ ...resource, [key]: "foreign" }), { code: "RUNTIME_IDENTITY_MISMATCH" }); }
    assert.equal(admitted, 1);
  } finally { verification.mock.restore(); fs.rmSync(root, { recursive: true, force: true }); }
});
