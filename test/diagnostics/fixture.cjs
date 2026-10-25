"use strict";
const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), child = require("node:child_process");
const { createDiagnostics } = require("../support/qualification-diagnostic.cjs");
const [mode, directory] = process.argv.slice(2), diagnostic = createDiagnostics({ directory, scenario: "diagnostic-" + mode });
const secret = "il514-fixture-sensitive-material"; diagnostic.secret(secret); diagnostic.step("controlled-" + mode);
if (mode === "passthrough") {
  const output = Buffer.from("same bytes"), failure = Object.assign(Error("same exception"), { status: 37, signal: "SIGTERM", stderr: "controlled failure" });
  const args = ["--host", "unix:///var/run/docker.sock", "test"], options = { input: Buffer.from(secret), env: { DO_NOT_RECORD: secret }, timeout: 1234, uid: process.getuid(), gid: process.getgid(), shell: false, stdio: "pipe" }, receiver = {};
  let calls = 0;
  child.execFileSync = function(...values) { calls++; assert.strictEqual(this, receiver); assert.strictEqual(values[1], args); assert.strictEqual(values[2], options); if (calls === 2) throw failure; return output; };
  diagnostic.observeDocker();
  diagnostic.run(async () => { assert.strictEqual(child.execFileSync.call(receiver, "/usr/bin/docker", args, options), output); assert.throws(() => child.execFileSync.call(receiver, "/usr/bin/docker", args, options), error => error === failure); assert.equal(calls, 2); });
} else {
  diagnostic.observeDocker();
  diagnostic.run(async () => {
    if (mode === "success") { assert.equal(2 + 2, 4); return; }
    if (mode === "assertion") assert.deepEqual({ answer: 41 }, { answer: 42 }, "controlled assertion mismatch");
    if (mode === "async") { await Promise.resolve(); assert.equal(3, 4, "controlled asynchronous mismatch"); }
    if (mode === "cause") {
      try { assert.equal(5, 6, "controlled nested assertion"); } catch (cause) { throw new Error("outer context", { cause }); }
    }
    if (mode === "child") {
      const nested = path.join(directory, "child"); fs.mkdirSync(nested, { mode: 0o700 });
      const result = child.spawnSync(process.execPath, [__filename, "assertion", nested], { encoding: "utf8" });
      const report = JSON.parse(fs.readFileSync(path.join(nested, "failure.json")));
      throw Object.assign(new Error("qualification child failed", { cause: report.error }), { code: "CHILD_PROCESS_FAILED", exitCode: result.status, command: [process.execPath, __filename, "assertion"], stdout: result.stdout, stderr: result.stderr });
    }
    if (mode === "docker") require("../../lifecycle/docker").docker(["container", "inspect", "drumee-il514-d1-absent-" + crypto.randomBytes(8).toString("hex")]);
    if (mode === "sensitive") {
      diagnostic.event("inspection-context", { environment: { TOKEN: secret }, dockerConfig: { auths: secret }, public: "retained context" });
      const cause = Error("secret=" + secret);
      const error = new assert.AssertionError({ actual: { password: secret, token: secret, privateKey: "-----BEGIN PRIVATE KEY-----\nfixture-key-material\n-----END PRIVATE KEY-----", public: 17 }, expected: { public: 18 }, operator: "deepStrictEqual", message: "sensitive value " + secret });
      error.cause = cause; error.command = ["fixture", "--token", secret]; error.stdout = "password=" + secret; error.stderr = "Bearer " + secret; throw error;
    }
    if (mode === "complex") {
      const actual = { integer: 9n, symbol: Symbol("fixture"), bytes: Buffer.from(secret), map: new Map([["item", 3]]), values: new Set([1, 2]), notANumber: NaN, absent: undefined }; actual.self = actual;
      throw new assert.AssertionError({ actual, expected: "expected", operator: "deepStrictEqual", message: "complex values" });
    }
    if (mode === "large") throw new assert.AssertionError({ actual: Array.from({ length: 5000 }, () => "X".repeat(10000)), expected: { value: "different" }, operator: "deepStrictEqual", message: "M".repeat(100000) });
  });
}
