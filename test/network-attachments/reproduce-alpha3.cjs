"use strict";
const assert = require("node:assert/strict"), { load } = require("./load.cjs"), { historical } = require("./historical.cjs");
assert.equal(process.argv.length, 2, "FIXED_HISTORICAL_SOURCE_REQUIRED");
const original = historical(), fixture = original.fixture, calls = [];
const D = load((program, args) => {
  calls.push({ program, args }); const selected = args.slice(2);
  if (selected[0] === "inspect" && selected.at(-1) === "c".repeat(64)) return JSON.stringify({ id: "c".repeat(64), owner: fixture.composition.project, project: fixture.composition.project, service: "redis" });
  if (selected[0] === "inspect" && selected.at(-1) === "ep-" + "b".repeat(64)) throw Object.assign(new Error("no such object"), { status: 1, stdout: "\n", stderr: "error: no such object: " + selected.at(-1) });
  throw new Error("UNEXPECTED_FIXTURE_COMMAND");
});
// The pinned AST proves this old unguarded command sequence. Execute only the
// actual current command adapter with controlled failures, never historical JS.
assert.throws(() => { for (const args of original.commands) D.docker(args); }, { code: "DOCKER_LIFECYCLE_COMMAND_FAILED" });
assert.equal(calls.at(-1).args.at(-1), "ep-" + fixture.network.containers["ep-" + "b".repeat(64)].EndpointID);
console.log(JSON.stringify({ reference: original.reference, sourceSHA256: original.sourceSHA256, fixtureSHA256: original.fixtureSHA256, sourceExecuted: false, fixture_provenance: fixture.provenance, original_command: calls.at(-1), expected_type: "container", actual_type: "sandbox-less endpoint-map key", simulated_docker_status: 1, simulated_docker_stderr: "error: no such object", propagated_code: "DOCKER_LIFECYCLE_COMMAND_FAILED", reproduced: true }, null, 2));
