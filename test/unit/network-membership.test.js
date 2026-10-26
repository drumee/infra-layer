"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const { load } = require("../network-attachments/load.cjs");
function fixture() {
  const project = "drumee-membership", cid = "c".repeat(64), endpoint = "d".repeat(64);
  const composition = { project, compose: { services: { redis: { networks: ["kernel"] }, gateway: { networks: ["front"] } }, networks: { kernel: { name: project + "-kernel" }, front: { name: project + "-front" } } } };
  const networks = {}, calls = [];
  for (const [index, role] of ["kernel", "front"].entries()) networks[role] = { id: String(index + 1).repeat(64), name: composition.compose.networks[role].name, owner: project, project, driver: "bridge", internal: false, containers: {} };
  const resource = { id: cid, name: "/" + project + "-redis-1", owner: project, project, service: "redis", running: true, networks: {} };
  const state = { inventory: [cid], resource, networks, calls, composition, cid, fail: null };
  function attach(role) { const n = networks[role]; n.containers[cid] = { Name: resource.name.slice(1), EndpointID: endpoint, MacAddress: "02:42:ac:12:00:02", IPv4Address: "172.18.0.2/16", IPv6Address: "" }; resource.networks[n.name] = { NetworkID: n.id, EndpointID: endpoint }; }
  attach("kernel");
  state.D = load((program, arguments_) => {
    assert.equal(program, "/usr/bin/docker"); const args = arguments_.slice(2); calls.push(args);
    if (state.fail && args[0] === "container") throw Object.assign(Error("fixture-command-failure"), { status: 125 });
    if (args[0] === "ps") { assert.ok(args.includes("-a")); assert.ok(args.includes("--no-trunc")); assert.ok(args.includes("label=com.docker.compose.project=" + project)); return state.inventory.join("\n"); }
    if (args[0] === "network" && args[1] === "ls") return Object.values(networks).map(n => n.name).join("\n");
    if (args[0] === "network") return JSON.stringify(Object.values(networks).find(n => n.name === args.at(-1)));
    if (args[0] === "container") { assert.equal(args.at(-1), cid); return JSON.stringify(resource); }
    throw Error("UNEXPECTED_FIXTURE_COMMAND");
  });
  state.attach = attach; state.check = () => state.D.checkNetworks(composition, { require_existing: true });
  return state;
}
const mismatch = f => assert.throws(f.check, { code: "NETWORK_ATTACHMENT_MISMATCH" });
test("F1-D1 exact single-network membership passes actual checkNetworks", () => { const f = fixture(); assert.equal(f.check(), undefined); });
test("F1-D2 extra undeclared network is a fatal non-transient mismatch", () => { const f = fixture(); f.resource.networks.extra = { NetworkID: "a".repeat(64), EndpointID: "b".repeat(64) }; mismatch(f); });
test("F1-D3 matching owner cannot authorize an extra network", () => { const f = fixture(); f.resource.networks.extra = { NetworkID: f.networks.front.id, EndpointID: "b".repeat(64), owner: f.composition.project }; mismatch(f); });
test("F1-D4 array and object declarations preserve legitimate multihoming", () => { for (const networks of [["kernel", "front"], { kernel: { aliases: ["redis"] }, front: {} }]) { const f = fixture(); f.composition.compose.services.redis.networks = networks; f.attach("front"); assert.equal(f.check(), undefined); } });
test("F1-D5 incomplete declared multihoming is rejected", () => { const f = fixture(); f.composition.compose.services.redis.networks.push("front"); mismatch(f); });
test("F1-D6 project inventory detects entirely disconnected running and stopped containers", () => { for (const running of [true, false]) { const f = fixture(); f.resource.running = running; f.resource.networks = {}; f.networks.kernel.containers = {}; mismatch(f); assert.ok(f.calls.some(c => c[0] === "container")); } });
test("F1-D7 not-yet-created service and empty preparation preserve absence contract", () => { const f = fixture(); f.inventory = []; f.networks.kernel.containers = {}; f.resource.networks = {}; assert.equal(f.check(), undefined); f.composition.compose.networks.kernel.name += "-missing"; assert.equal(f.D.checkNetworks(f.composition), undefined); });
test("F1-D8 network names cannot substitute a different ID", () => { const f = fixture(); f.resource.networks[f.networks.kernel.name].NetworkID = f.networks.front.id; mismatch(f); });
test("F1-D9 endpoint ID mismatch is rejected", () => { const f = fixture(); f.resource.networks[f.networks.kernel.name].EndpointID = "e".repeat(64); mismatch(f); });
test("F1-D10 inventoried foreign ownership and service/name substitution are refused", () => { for (const field of ["owner", "project", "service"]) { const f = fixture(); f.resource[field] = "foreign"; assert.throws(f.check, { code: "NETWORK_OWNERSHIP_MISMATCH" }); } const f = fixture(); f.resource.name = "/foreign-redis-1"; assert.throws(f.check, { code: "INVALID_NETWORK_ATTACHMENT" }); });
test("F1-D11 sandbox-less endpoint cannot mask extra connectivity", () => { const f = fixture(), e = "e".repeat(64); f.networks.kernel.containers["ep-" + e] = { ...f.networks.kernel.containers[f.cid], Name: f.composition.project + "-redis-2", EndpointID: e }; f.resource.networks.extra = {}; mismatch(f); delete f.resource.networks.extra; assert.throws(f.check, { code: "NETWORK_ATTACHMENT_UNSETTLED" }); });
test("F1-D12 Docker inventory/inspection errors remain fatal", () => { const f = fixture(); f.fail = true; assert.throws(f.check, error => error.code === "DOCKER_LIFECYCLE_COMMAND_FAILED" && error.exit_status === 125); });
test("F1-D13 stopped configured membership and Redis-style fresh endpoint recovery pass", () => { const f = fixture(); f.resource.running = false; f.resource.networks[f.networks.kernel.name].EndpointID = ""; f.networks.kernel.containers = {}; assert.equal(f.check(), undefined); f.resource.running = true; f.attach("kernel"); assert.equal(f.check(), undefined); });
test("F1-D14 disconnect is invalid and reconnection restores exact membership", () => { const f = fixture(); f.resource.networks = {}; f.networks.kernel.containers = {}; mismatch(f); f.attach("kernel"); assert.equal(f.check(), undefined); });
test("F1-D15 service-specific declarations cannot use the project-wide union", () => { const f = fixture(); f.attach("front"); mismatch(f); });
test("F1-D16 aliases, duplicate identities and inconsistent reverse attachments fail closed", () => { const f = fixture(); f.resource.networks.alias = f.resource.networks[f.networks.kernel.name]; mismatch(f); delete f.resource.networks.alias; f.networks.front.containers[f.cid] = f.networks.kernel.containers[f.cid]; mismatch(f); delete f.networks.front.containers[f.cid]; f.networks.front.id = f.networks.kernel.id; assert.throws(f.check, { code: "INVALID_NETWORK_ATTACHMENT" }); });
