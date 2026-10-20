"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const { execFileSync } = require("node:child_process");
const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
const { readInterruptionInput } = require("../support/interruption-input");
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "drumee-il5-aabbccdd-"));
  fs.chmodSync(root, 0o700); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.join(root, "interrupt-prepared.json"), prepared = { root: path.join(root, "deployment"), project: "drumee-il5-aabbccdd" };
  fs.writeFileSync(file, JSON.stringify(prepared), { mode: 0o600 }); return { root, file, prepared };
}
test("qualification ignores a hostile inherited PATH and fixes the child PATH", t => {
  const { root } = fixture(t), marker = path.join(root, "executed");
  fs.writeFileSync(path.join(root, "git"), "#!/bin/sh\ntouch '" + marker + "'\n", { mode: 0o700 });
  const env = trustedEnvironment({ PATH: root });
  assert.equal(env.PATH, [...new Set([path.dirname(trustedExecutable(process.execPath)), "/usr/bin", "/bin"])].join(path.delimiter));
  assert.match(execFileSync(trustedExecutable("git"), ["--version"], { env, encoding: "utf8" }), /^git version /);
  assert.equal(fs.existsSync(marker), false); assert.throws(() => trustedExecutable("unlisted-command"));
});
test("qualification refuses an executable writable by another user", t => {
  const { root } = fixture(t), file = path.join(root, "tool"); fs.writeFileSync(file, "#!/bin/sh\nexit 0\n", { mode: 0o777 }); fs.chmodSync(file, 0o777);
  assert.throws(() => trustedExecutable(file), /UNSAFE_QUALIFICATION_EXECUTABLE/);
  fs.chmodSync(file, 0o700); assert.equal(trustedExecutable(file), file);
  fs.chmodSync(root, 0o777); assert.throws(() => trustedExecutable(file), /UNSAFE_QUALIFICATION_EXECUTABLE/);
});
test("interruption reads only the private input for its own deployment", t => {
  const { file, prepared } = fixture(t); assert.deepEqual(readInterruptionInput(file), prepared);
  for (const input of [undefined, "interrupt-prepared.json", path.dirname(file) + "/../interrupt-prepared.json", "/etc/passwd"]) assert.throws(() => readInterruptionInput(input));
});
test("interruption refuses symlink, hardlink, broad permissions and foreign root/project", t => {
  const { root, file, prepared } = fixture(t), other = path.join(root, "other"); fs.renameSync(file, other); fs.symlinkSync(other, file);
  assert.throws(() => readInterruptionInput(file)); fs.unlinkSync(file); fs.linkSync(other, file); assert.throws(() => readInterruptionInput(file)); fs.unlinkSync(other);
  fs.chmodSync(file, 0o644); assert.throws(() => readInterruptionInput(file)); fs.chmodSync(file, 0o600);
  for (const change of [{ root: root + "/external" }, { project: "foreign" }]) { fs.writeFileSync(file, JSON.stringify({ ...prepared, ...change })); assert.throws(() => readInterruptionInput(file)); }
  fs.writeFileSync(file, JSON.stringify(prepared)); fs.chmodSync(root, 0o755); assert.throws(() => readInterruptionInput(file));
});
test("interruption refuses a FIFO without blocking and oversized input", t => {
  const { file } = fixture(t); fs.unlinkSync(file);
  execFileSync("/usr/bin/mkfifo", ["-m", "600", file]); assert.throws(() => readInterruptionInput(file)); fs.unlinkSync(file);
  fs.writeFileSync(file, " ".repeat(4 * 1024 * 1024 + 1), { mode: 0o600 }); assert.throws(() => readInterruptionInput(file));
});
