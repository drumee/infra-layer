"use strict";
const assert = require("node:assert/strict"), { execFileSync } = require("node:child_process");
const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
const { load } = require("./load.cjs"), fixture = require("./fixture.json");
const calls = [], reference = "c218811effc83da25cf71a914e27accc96101329";
const source = execFileSync(trustedExecutable("git"), ["show", reference + ":lifecycle/docker.js"], { encoding: "utf8", env: trustedEnvironment() });
const D = load((program, args) => {
  calls.push({ program, args }); const selected = args.slice(2);
  if (selected[0] === "network" && selected[1] === "ls") return fixture.network.name + "\n";
  if (selected[0] === "network" && selected[1] === "inspect") return JSON.stringify(fixture.network);
  if (selected[0] === "inspect" && selected.at(-1) === "c".repeat(64)) return JSON.stringify({ id: "c".repeat(64), owner: fixture.composition.project, project: fixture.composition.project, service: "redis" });
  if (selected[0] === "inspect" && selected.at(-1) === "ep-" + "b".repeat(64)) throw Object.assign(Error("no such object"), { status: 1, stdout: "\n", stderr: "error: no such object: " + selected.at(-1) });
  throw Error("UNEXPECTED_FIXTURE_COMMAND");
}, source);
assert.throws(() => D.checkNetworks(fixture.composition), { code: "DOCKER_LIFECYCLE_COMMAND_FAILED" });
assert.equal(calls.at(-1).args.at(-1), "ep-" + fixture.network.containers["ep-" + "b".repeat(64)].EndpointID);
console.log(JSON.stringify({ reference, fixture_provenance: fixture.provenance, original_command: calls.at(-1), expected_type: "container", actual_type: "sandbox-less endpoint-map key", simulated_docker_status: 1, simulated_docker_stderr: "error: no such object", propagated_code: "DOCKER_LIFECYCLE_COMMAND_FAILED", reproduced: true }, null, 2));
