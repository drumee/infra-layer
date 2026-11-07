"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), child = require("node:child_process");
const { load } = require("../network-attachments/load.cjs"), H = require("../network-attachments/historical.cjs");
test("secure loader loads only the actual canonical module and restores builtin/cache state", () => {
  const filename = require.resolve("../../lifecycle/docker"), actual = require(filename), execute = child.execFileSync; let calls = 0;
  const fixture = load((program, args, options) => { calls++; assert.equal(program, "/usr/bin/docker"); assert.deepEqual(args, ["--host", "unix:///var/run/docker.sock", "version"]); assert.equal(options.shell, false); assert.equal(options.env.DOCKER_CONFIG, "/etc/docker"); return "controlled-fixture"; });
  assert.notEqual(fixture, actual); assert.deepEqual(Object.keys(fixture), Object.keys(actual)); assert.equal(require.cache[filename].exports, actual); assert.equal(child.execFileSync, execute);
  assert.equal(fixture.docker(["version"]), "controlled-fixture"); assert.equal(calls, 1); assert.equal(child.execFileSync, execute);
});
test("source strings, filenames, alternate source and invalid executors fail before substitution", () => {
  const original = child.execFileSync;
  for (const input of ["process.exit(0)", "/tmp/unapproved.js", {}, null, undefined]) assert.throws(() => load(input), /FIXED_CANONICAL_MODULE_REQUIRED/);
  assert.throws(() => load(() => "unused", "arbitrary source"), /FIXED_CANONICAL_MODULE_REQUIRED/);
  assert.equal(child.execFileSync, original);
});
test("separate module instances retain only their own command fixture and never fall back", () => {
  const original = child.execFileSync; let first = 0, second = 0;
  const a = load(() => { first++; return "first"; }), b = load(() => { second++; return "second"; });
  assert.equal(a.docker(["version"]), "first"); assert.equal(b.docker(["version"]), "second"); assert.equal(first, 1); assert.equal(second, 1);
  const failed = load(() => { throw Object.assign(new Error("fixture refusal"), { status: 37, stderr: "controlled" }); });
  assert.throws(() => failed.docker(["version"]), error => error.code === "DOCKER_LIFECYCLE_COMMAND_FAILED" && error.exit_status === 37);
  assert.equal(child.execFileSync, original);
});
test("historical regression pins real alpha.3 source and fixture without executing either", () => {
  const result = H.historical(); assert.equal(result.reference, H.reference); assert.equal(result.sourceSHA256, H.sourceSHA256); assert.equal(result.fixtureSHA256, H.fixtureSHA256); assert.equal(result.sourceExecuted, false);
  assert.equal(result.commands.at(-1).at(-1), "ep-" + "b".repeat(64)); assert.equal(result.commands[0][0], "inspect");
});
test("historical source/fixture bytes and metadata reject substitution before parsing", () => {
  const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
  const source = child.execFileSync(trustedExecutable("git"), ["show", H.reference + ":lifecycle/docker.js"], { env: trustedEnvironment() }), fixture = fs.readFileSync(path.join(__dirname, "../network-attachments/fixture.json"));
  assert.equal(H.verifyHistorical(source, fixture, H.reference), true);
  for (const values of [[Buffer.from("unapproved source"), fixture, H.reference], [source, Buffer.from("{}"), H.reference], [source, fixture, "main"], [source.toString(), fixture, H.reference]]) assert.throws(() => H.verifyHistorical(...values), /UNAPPROVED_HISTORICAL_FIXTURE/);
  assert.throws(() => H.historical("unapproved source"), /FIXED_HISTORICAL_SOURCE_REQUIRED/);
});
test("historical CLI preserves the invalid-object negative proof and rejects extra input nonzero", () => {
  const file = path.join(__dirname, "../network-attachments/reproduce-alpha3.cjs");
  const good = child.spawnSync(process.execPath, [file], { encoding: "utf8" }); assert.equal(good.status, 0, good.stderr);
  const result = JSON.parse(good.stdout); assert.equal(result.reproduced, true); assert.equal(result.sourceExecuted, false); assert.equal(result.simulated_docker_status, 1); assert.equal(result.propagated_code, "DOCKER_LIFECYCLE_COMMAND_FAILED");
  const refused = child.spawnSync(process.execPath, [file, "unapproved-source.js"], { encoding: "utf8" }); assert.equal(refused.status, 1); assert.match(refused.stderr, /FIXED_HISTORICAL_SOURCE_REQUIRED/); assert.equal(refused.stdout, "");
});
