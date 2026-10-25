"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const { spawnSync, execFileSync } = require("node:child_process"), { MAX_BYTES } = require("../support/qualification-diagnostic.cjs");
function run(t, mode) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "infra-il514-d1-test-")); fs.chmodSync(directory, 0o700); t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [path.join(__dirname, "../diagnostics/fixture.cjs"), mode, directory], { encoding: "utf8", timeout: 20000 });
  const file = path.join(directory, "failure.json"), raw = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  return { directory, result, raw, report: raw ? JSON.parse(raw) : null, trace: fs.readFileSync(path.join(directory, "trace.jsonl"), "utf8") };
}
test("D1 assertion fields, non-enumerable message/stack and source survive the actual failed process", t => {
  const f = run(t, "assertion"); assert.equal(f.result.status, 1); assert.equal(f.report.error.code, "ERR_ASSERTION"); assert.equal(f.report.error.name, "AssertionError");
  assert.match(f.report.error.message, /controlled assertion mismatch/); assert.equal(f.report.error.operator, "deepStrictEqual"); assert.deepEqual(f.report.error.actual, { answer: 41 }); assert.deepEqual(f.report.error.expected, { answer: 42 });
  assert.match(f.report.error.stack, /fixture\.cjs:\d+/); assert.match(f.report.assertion, /fixture\.cjs:\d+/); assert.equal(f.report.step, "controlled-assertion"); assert.match(f.report.sourceRevision, /^[a-f0-9]{40}$/);
});
test("D2 failure remains nonzero with concise human summary and restrictive artifact mode", t => {
  const f = run(t, "assertion"); assert.equal(f.result.status, 1); assert.equal(f.result.signal, null); assert.match(f.result.stderr, /QUALIFICATION_FAILED/); assert.match(f.result.stderr, /controlled assertion mismatch/); assert.match(f.result.stderr, /failure\.json/); assert.equal(fs.statSync(path.join(f.directory, "failure.json")).mode & 0o777, 0o600);
});
test("D3 nested cause retains original assertion", t => {
  const f = run(t, "cause"); assert.equal(f.result.status, 1); assert.equal(f.report.error.cause.code, "ERR_ASSERTION"); assert.equal(f.report.error.cause.actual, 5); assert.equal(f.report.error.cause.expected, 6); assert.match(f.report.error.cause.stack, /fixture\.cjs/);
});
test("D4 child assertion remains identifiable through parent reporting", t => {
  const f = run(t, "child"); assert.equal(f.result.status, 1); assert.equal(f.report.error.code, "CHILD_PROCESS_FAILED"); assert.equal(f.report.error.exitCode, 1); assert.equal(f.report.error.cause.code, "ERR_ASSERTION"); assert.deepEqual(f.report.error.cause.actual, { answer: 41 });
});
test("D5 asynchronous assertion is captured rather than swallowed", t => {
  const f = run(t, "async"); assert.equal(f.result.status, 1); assert.equal(f.report.error.code, "ERR_ASSERTION"); assert.equal(f.report.error.actual, 3); assert.equal(f.report.error.expected, 4); assert.match(f.report.error.message, /asynchronous/);
});
test("D6 real trusted Docker failure remains distinct with command, nonzero status and stderr", t => {
  const f = run(t, "docker"); assert.equal(f.result.status, 1); assert.equal(f.report.error.code, "DOCKER_LIFECYCLE_COMMAND_FAILED"); assert.equal(f.report.error.exit_status, 1);
  const failed = f.report.recentCommands.find(x => x.kind === "docker-failure"); assert.ok(failed); assert.equal(failed.exitCode, 1); assert.match(failed.stderr, /no such (?:object|container)/i); assert.equal(failed.command[2], "container");
});
test("D7 redaction covers nested values, causes, stack, command/output and protected contexts", t => {
  const f = run(t, "sensitive"); assert.equal(f.result.status, 1);
  for (const output of [f.raw, f.trace, f.result.stderr]) { assert.ok(!output.includes("il514-fixture-sensitive-material")); assert.ok(!output.includes("fixture-key-material")); assert.ok(!output.includes("-----BEGIN PRIVATE KEY-----")); }
  assert.equal(f.report.error.actual.password, "[REDACTED]"); assert.equal(f.report.error.actual.public, 17); assert.equal(f.report.error.expected.public, 18); assert.match(f.raw, /retained context/);
});
test("D8 circular values, bigint, symbol, Buffer, Map, Set and undefined are safe", t => {
  const f = run(t, "complex"); assert.equal(f.result.status, 1); const actual = f.report.error.actual;
  assert.equal(actual.self, "[Circular]"); assert.equal(actual.integer.type, "bigint"); assert.equal(actual.symbol.type, "symbol"); assert.equal(actual.bytes.contents, "[Omitted]"); assert.equal(actual.map.type, "Map"); assert.equal(actual.values.type, "Set"); assert.equal(actual.absent, "[Undefined]");
});
test("D9 large diagnostics remain bounded valid JSON with explicit truncation", t => {
  const f = run(t, "large"); assert.equal(f.result.status, 1); assert.ok(Buffer.byteLength(f.raw) <= MAX_BYTES); assert.equal(f.report.error.code, "ERR_ASSERTION"); assert.match(f.raw, /Truncated|Output bound|Node budget/); assert.ok(f.result.stderr.length < 4096);
});
test("D10 successful execution creates no failure artifact or artificial error", t => {
  const f = run(t, "success"); assert.equal(f.result.status, 0); assert.equal(f.result.stderr, ""); assert.equal(f.report, null);
});
test("observer preserves original argv/options/receiver/stdin/timeout/return/error identity and executes once", t => {
  const f = run(t, "passthrough"); assert.equal(f.result.status, 0, f.result.stderr); assert.equal(f.report, null); assert.equal(f.trace.includes("DO_NOT_RECORD"), false); assert.equal(f.trace.includes("il514-fixture-sensitive-material"), false);
});
function expressions(source) {
  const ast = require("espree").parse(source, { ecmaVersion: 2022, sourceType: "script", range: true }), found = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === "CallExpression") {
      const callee = node.callee, root = callee.type === "MemberExpression" && callee.object.name;
      if (callee.name === "check" || callee.name === "docker" || callee.name === "spawn" || ["assert", "D"].includes(root)) found.push(source.slice(...node.range));
    }
    for (const [key, value] of Object.entries(node)) if (key !== "range") { if (Array.isArray(value)) value.forEach(visit); else if (value && typeof value === "object") visit(value); }
  }
  visit(ast); return found;
}
test("real harness preserves all original assertion and Docker/spawn expressions in order", () => {
  const before = execFileSync("/usr/bin/git", ["show", "703b637:test/network-attachments/real-docker.cjs"], { cwd: path.resolve(__dirname, "../.."), encoding: "utf8" });
  const after = fs.readFileSync(path.join(__dirname, "../network-attachments/real-docker.cjs"), "utf8"); assert.deepEqual(expressions(after), expressions(before));
});
test("artifact directory ownership/permissions and exclusive trace prevent unsafe reuse", t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "infra-il514-d1-owner-")); t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const { createDiagnostics } = require("../support/qualification-diagnostic.cjs");
  fs.chmodSync(directory, 0o755); assert.throws(() => createDiagnostics({ directory }), /UNSAFE_DIAGNOSTIC_DIRECTORY/);
  fs.chmodSync(directory, 0o700); fs.writeFileSync(path.join(directory, "trace.jsonl"), "owned sentinel");
  assert.throws(() => createDiagnostics({ directory }), { code: "EEXIST" }); assert.equal(fs.readFileSync(path.join(directory, "trace.jsonl"), "utf8"), "owned sentinel");
});
