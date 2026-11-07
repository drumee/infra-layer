"use strict";
const assert = require("node:assert/strict"), { load } = require("./load.cjs");
const scenarios = Object.freeze({ extra: "NETWORK_ATTACHMENT_MISMATCH", missing: "NETWORK_ATTACHMENT_MISMATCH", identity: "NETWORK_ATTACHMENT_MISMATCH", malformed: "INVALID_NETWORK_ATTACHMENT", foreign: "NETWORK_OWNERSHIP_MISMATCH", command: "DOCKER_LIFECYCLE_COMMAND_FAILED" });
function exercise(scenario, mode) {
  if (!Object.hasOwn(scenarios, scenario) || !["actual", "success", "unrelated"].includes(mode)) throw Error("FIXED_EFFECTIVENESS_CASE_REQUIRED");
  const project = "drumee-a2-effectiveness", cid = "c".repeat(64), eid = "b".repeat(64), nid = "a".repeat(64), name = project + "-kernel", calls = [];
  const composition = { project, compose: { services: { redis: { networks: ["kernel"] } }, networks: { kernel: { name } } } };
  const network = { id: nid, name, owner: project, project, driver: "bridge", internal: false, containers: { [cid]: { Name: project + "-redis-1", EndpointID: eid, MacAddress: "02:42:ac:12:00:02", IPv4Address: "172.18.0.2/16", IPv6Address: "" } } };
  const resource = { id: cid, name: "/" + project + "-redis-1", owner: project, project, service: "redis", running: true, networks: { [name]: { NetworkID: nid, EndpointID: eid } } };
  if (scenario === "extra") resource.networks.extra = { NetworkID: "d".repeat(64), EndpointID: "e".repeat(64) };
  if (scenario === "missing") { resource.networks = {}; network.containers = {}; }
  if (scenario === "identity") resource.networks[name].NetworkID = "d".repeat(64);
  if (scenario === "malformed") network.containers[cid].IPv4Address = null;
  if (scenario === "foreign") resource.owner = "foreign";
  const D = load((program, args) => {
    assert.equal(program, "/usr/bin/docker"); const command = args.slice(2); calls.push(command);
    if (command[0] === "network" && command[1] === "ls") return name;
    if (command[0] === "network") {
      if (scenario === "command") throw Object.assign(Error("controlled Docker failure"), { status: 125 });
      return JSON.stringify(network);
    }
    if (command[0] === "ps") return cid;
    if (command[0] === "container") return JSON.stringify(resource);
    throw Error("UNEXPECTED_EFFECTIVENESS_COMMAND");
  });
  let invocations = 0, observedError = null;
  const report = () => ({ scenario, mode, expectedError: scenarios[scenario], observedError, validatorInvocations: invocations, fixtureDockerCalls: calls.length });
  try {
    assert.throws(() => {
      invocations++;
      if (mode === "success") return;
      if (mode === "unrelated") throw Object.assign(Error("unrelated fixture exception"), { code: "UNRELATED_FAILURE" });
      try { return D.checkNetworks(composition, { require_existing: true }); }
      catch (error) { observedError = error.code; throw error; }
    }, error => {
      observedError = error.code;
      return error.code === scenarios[scenario] && (scenario !== "command" || error.exit_status === 125);
    });
    assert.equal(invocations, 1); assert.ok(calls.length > 0);
    return { ...report(), status: "PASS" };
  } catch (error) { error.effectiveness = report(); throw error; }
}
if (require.main === module) {
  try {
    if (process.argv.length !== 4) throw Error("FIXED_EFFECTIVENESS_CASE_REQUIRED");
    console.log(JSON.stringify(exercise(process.argv[2], process.argv[3])));
  } catch (error) {
    console.log(JSON.stringify({ status: "FAIL", code: error.code || error.message, ...error.effectiveness })); process.exitCode = 1;
  }
}
module.exports = { scenarios, exercise };
