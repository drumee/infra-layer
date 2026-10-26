"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const { load } = require("../network-attachments/load.cjs");
function fixture() {
  const input = structuredClone(require("../network-attachments/fixture.json")), cid = "c".repeat(64), eid = "d".repeat(64), calls = [];
  input.composition.compose.services.redis.networks = ["kernel"]; input.composition.compose.services.provisioner.networks = ["kernel"];
  const resource = { id: cid, name: "/" + input.network.containers[cid].Name, owner: input.composition.project, project: input.composition.project, service: "redis", networks: { [input.network.name]: { NetworkID: input.network.id, EndpointID: eid } } };
  const state = { ...input, listed: [input.network.name], resources: { [cid]: resource }, calls, cid, ep: "ep-" + "b".repeat(64) };
  const D = load((program, args) => {
    assert.equal(program, "/usr/bin/docker"); assert.deepEqual(Array.from(args.slice(0, 2)), ["--host", "unix:///var/run/docker.sock"]);
    const selected = Array.from(args.slice(2)); calls.push(selected);
    if (state.failure && selected[0] === "network" && selected[1] === "inspect") throw state.failure;
    if (selected[0] === "network" && selected[1] === "ls") return state.listed.join("\n");
    if (selected[0] === "network" && selected[1] === "inspect") return JSON.stringify(state.network);
    if (selected[0] === "container" && selected[1] === "inspect") {
      assert.match(selected.at(-1), /^[a-f0-9]{64}$/);
      if (!state.resources[selected.at(-1)]) throw Object.assign(Error("absent"), { status: 1, stderr: "Error: No such container: " + selected.at(-1) });
      return JSON.stringify(state.resources[selected.at(-1)]);
    }
    throw Error("UNEXPECTED_DOCKER_FIXTURE_COMMAND");
  });
  return { ...state, state, D, normal() { delete state.network.containers[state.ep]; } };
}
test("E1 normal attachment uses actual container ID and verifies endpoint/network relationship", () => {
  const f = fixture(); f.normal(); assert.equal(f.D.checkNetworks(f.composition, { require_existing: true }), undefined);
  assert.equal(f.calls.filter(c => c[0] === "container" && c[1] === "inspect").length, 1);
  assert.equal(f.calls.some(c => c[0] === "inspect"), false);
});
test("E2 sandbox-less metadata is preserved as unsettled and never inspected as a container", () => {
  const f = fixture(); assert.throws(() => f.D.checkNetworks(f.composition), error => {
    assert.equal(error.code, "NETWORK_ATTACHMENT_UNSETTLED"); assert.equal(error.attachments[0].key, f.ep);
    assert.equal(error.attachments[0].EndpointID, f.network.containers[f.ep].EndpointID); assert.equal(error.attachments[0].IPv4Address, "172.18.0.3/16"); return true;
  });
  assert.equal(f.calls.some(c => c[0] === "container" && c.at(-1) === f.ep), false);
});
test("E3 missing referenced container remains a failure with original nonzero status", () => {
  const f = fixture(); f.normal(); delete f.resources[f.cid];
  assert.throws(() => f.D.checkNetworks(f.composition), error => error.code === "REQUIRED_CONTAINER_MISSING" && error.exit_status === 1);
  assert.equal(f.calls.filter(c => c[0] === "container").length, 1);
});
test("E4 endpoint outside the declared namespace is explicitly unexpected", () => {
  const f = fixture(); f.network.containers[f.ep].Name = "another-project-redis-1";
  assert.throws(() => f.D.checkNetworks(f.composition), { code: "UNEXPECTED_NETWORK_ATTACHMENT" });
});
test("E5 unsettled endpoint cannot mask a foreign container or network", () => {
  const f = fixture(), endpoint = f.network.containers[f.ep], ordinary = f.network.containers[f.cid];
  f.network.containers = { [f.ep]: endpoint, [f.cid]: ordinary }; f.resources[f.cid].owner = "foreign";
  assert.throws(() => f.D.checkNetworks(f.composition), { code: "NETWORK_OWNERSHIP_MISMATCH" });
  f.resources[f.cid].owner = f.composition.project; f.network.owner = "foreign";
  assert.throws(() => f.D.checkNetworks(f.composition), { code: "NETWORK_OWNERSHIP_MISMATCH" });
  assert.ok(f.calls.every(c => ["network", "container"].includes(c[0])));
});
test("E6 malformed endpoint metadata and inconsistent keys fail explicitly", () => {
  for (const mutate of [f => { f.network.containers[f.ep].EndpointID = "a".repeat(64); }, f => { f.network.containers[f.ep].Name = "bad\nname"; }, f => { f.network.containers[f.ep].IPv4Address = null; }, f => { f.network.containers = []; }]) {
    const f = fixture(); mutate(f); assert.throws(() => f.D.checkNetworks(f.composition), { code: "INVALID_NETWORK_ATTACHMENT" });
  }
});
test("E7 genuine Docker failure escapes once without exposing raw diagnostics", () => {
  const f = fixture(); f.state.failure = Object.assign(Error("do-not-log"), { status: 125, signal: null, stderr: "sensitive-provider-output" });
  assert.throws(() => f.D.checkNetworks(f.composition), error => { assert.equal(error.code, "DOCKER_LIFECYCLE_COMMAND_FAILED"); assert.equal(error.exit_status, 125); assert.equal(JSON.stringify(error).includes("sensitive"), false); return true; });
  assert.equal(f.calls.filter(c => c[1] === "inspect").length, 1);
});
test("E8/E11 required network absence fails; explicit creation/cleanup absence is permitted", () => {
  const f = fixture(); f.state.listed = [];
  assert.throws(() => f.D.checkNetworks(f.composition, { require_existing: true }), { code: "REQUIRED_NETWORK_MISSING" });
  assert.equal(f.D.checkNetworks(f.composition), undefined);
});
test("network object identity, isolation and actual membership cannot be substituted", () => {
  for (const [mutate, code] of [
    [f => { f.network.name = "wrong-network"; }, "INVALID_NETWORK_ATTACHMENT"],
    [f => { f.network.internal = true; }, "NETWORK_OWNERSHIP_MISMATCH"],
    [f => { f.network.driver = "host"; }, "NETWORK_OWNERSHIP_MISMATCH"],
    [f => { f.resources[f.cid].networks[f.network.name].NetworkID = "f".repeat(64); }, "NETWORK_ATTACHMENT_MISMATCH"],
    [f => { f.resources[f.cid].networks[f.network.name].EndpointID = "f".repeat(64); }, "NETWORK_ATTACHMENT_MISMATCH"],
    [f => { f.composition.compose.services.redis.networks = ["other"]; }, "NETWORK_ATTACHMENT_MISMATCH"]
  ]) { const f = fixture(); f.normal(); mutate(f); assert.throws(() => f.D.checkNetworks(f.composition), { code }); }
});
test("E12 stale container identity and invalid object keys are rejected without fallback", () => {
  const f = fixture(); f.normal(); f.resources[f.cid].id = "e".repeat(64);
  assert.throws(() => f.D.checkNetworks(f.composition), { code: "INVALID_NETWORK_ATTACHMENT" });
  f.network.containers = { invalid: f.network.containers[f.cid] };
  assert.throws(() => f.D.checkNetworks(f.composition), { code: "INVALID_DOCKER_OBJECT_IDENTITY" });
});
function readiness() {
  let elapsed = 0;
  return require("../../internal/network-readiness").createNetworkReadiness({ now: () => elapsed, delay: async milliseconds => { elapsed += milliseconds; } });
}
test("E9/E10 bounded readiness re-observes only unsettled metadata then validates resolution", async () => {
  const run = readiness(), f = fixture(); let calls = 0;
  await run(f.composition, { checkNetworks(composition, options) { calls++; assert.equal(options.require_existing, true); if (calls === 3) f.normal(); return f.D.checkNetworks(composition, options); } }, true);
  assert.equal(calls, 3); assert.equal(f.calls.some(c => c[0] === "container" && c.at(-1) === f.ep), false);
});
test("unsettled deadline refuses permanently unresolved attachment and retains metadata", async () => {
  const run = readiness(), error = Object.assign(Error("unsettled"), { code: "NETWORK_ATTACHMENT_UNSETTLED", attachments: [{ key: "preserved" }] }); let calls = 0;
  await assert.rejects(run({}, { checkNetworks() { calls++; throw error; } }, true), actual => actual === error);
  assert.equal(calls, 101);
});
test("readiness never retries command failures, missing objects or ownership refusals", async () => {
  for (const code of ["DOCKER_LIFECYCLE_COMMAND_FAILED", "REQUIRED_CONTAINER_MISSING", "REQUIRED_NETWORK_MISSING", "NETWORK_OWNERSHIP_MISMATCH", "INVALID_NETWORK_ATTACHMENT", "UNEXPECTED_NETWORK_ATTACHMENT"]) {
    let calls = 0; const error = Object.assign(Error(code), { code });
    await assert.rejects(readiness()({}, { checkNetworks() { calls++; throw error; } }, true), actual => actual === error); assert.equal(calls, 1);
  }
});
