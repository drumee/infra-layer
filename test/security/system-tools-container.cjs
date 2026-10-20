"use strict";
// Real filesystem checks inside an owned disposable root container. /usr/bin is
// an empty container tmpfs, never a replaced or renamed host system executable.
const fs = require("node:fs"), assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const T = require("../../internal/system-tools");
const results = [];
function check(name, fn) { fn(); results.push(name); }
assert.equal(process.getuid(), 0);
fs.mkdirSync("/owned/good", { mode: 0o755 });
fs.writeFileSync("/owned/good/tool", "#!/usr/local/bin/node\nprocess.exit(0)\n", { mode: 0o755 });
check("root-owned regular executable accepted", () => assert.equal(T.verifyPath("/owned/good/tool"), "/owned/good/tool"));
check("D2 absent fixed tools refuse despite PATH substitutes", () => {
  fs.mkdirSync("/owned/bin", { mode: 0o755 });
  for (const tool of ["docker", "ss", "openssl"]) {
    fs.writeFileSync("/owned/bin/" + tool, "#!/usr/local/bin/node\nrequire('fs').writeFileSync('/owned/substitute','executed')\n", { mode: 0o755 });
    process.env.PATH = "/owned/bin";
    assert.throws(() => execFileSync(T.resolveTrustedExecutable(tool), ["--version"]), { code: "ENOENT" });
  }
  assert.equal(fs.existsSync("/owned/substitute"), false);
});
check("D3 writable parent rejected", () => {
  fs.mkdirSync("/owned/open", { mode: 0o755 }); fs.chmodSync("/owned/open", 0o777);
  fs.copyFileSync("/owned/good/tool", "/owned/open/tool"); fs.chmodSync("/owned/open/tool", 0o755);
  assert.throws(() => T.verifyPath("/owned/open/tool"), { code: "UNTRUSTED_SYSTEM_EXECUTABLE" });
});
check("D3 writable executable rejected", () => {
  fs.copyFileSync("/owned/good/tool", "/owned/good/writable"); fs.chmodSync("/owned/good/writable", 0o777);
  assert.throws(() => T.verifyPath("/owned/good/writable"), { code: "UNTRUSTED_SYSTEM_EXECUTABLE" });
});
check("foreign owner rejected", () => {
  fs.copyFileSync("/owned/good/tool", "/owned/good/foreign"); fs.chmodSync("/owned/good/foreign", 0o755); fs.chownSync("/owned/good/foreign", 65534, 65534);
  assert.throws(() => T.verifyPath("/owned/good/foreign"), { code: "UNTRUSTED_SYSTEM_EXECUTABLE" });
});
check("D4 safe symlink accepted and final target returned", () => {
  fs.symlinkSync("/owned/good/tool", "/owned/good/link");
  assert.equal(T.verifyPath("/owned/good/link"), "/owned/good/tool");
});
check("D4 symlink through unsafe entry parent rejected", () => {
  fs.symlinkSync("/owned/good/tool", "/owned/open/link");
  assert.throws(() => T.verifyPath("/owned/open/link"), { code: "UNTRUSTED_SYSTEM_EXECUTABLE" });
});
check("D4 unsafe symlink target rejected", () => {
  fs.symlinkSync("/owned/open/tool", "/owned/good/bad-link");
  assert.throws(() => T.verifyPath("/owned/good/bad-link"), { code: "UNTRUSTED_SYSTEM_EXECUTABLE" });
});
check("D4 dangling and cyclic links never fallback", () => {
  fs.symlinkSync("/owned/absent", "/owned/good/dangling");
  assert.throws(() => T.verifyPath("/owned/good/dangling"), { code: "ENOENT" });
  fs.symlinkSync("/owned/good/cycle", "/owned/good/cycle");
  assert.throws(() => T.verifyPath("/owned/good/cycle"), { code: "UNTRUSTED_SYSTEM_EXECUTABLE" });
});
check("non executable files and relative paths rejected", () => {
  fs.writeFileSync("/owned/good/data", "data", { mode: 0o644 });
  for (const file of ["/owned/good/data", "relative", "/"]) assert.throws(() => T.verifyPath(file), { code: "UNTRUSTED_SYSTEM_EXECUTABLE" });
});
check("Docker rejects a root config pointing to writable plugin directories", () => {
  fs.copyFileSync("/owned/good/tool", "/usr/bin/docker"); fs.chmodSync("/usr/bin/docker", 0o755);
  fs.writeFileSync("/etc/docker/config.json", JSON.stringify({ cliPluginsExtraDirs: ["/owned/open"] }), { mode: 0o600 });
  assert.throws(() => T.resolveTrustedExecutable("docker"), { code: "UNTRUSTED_SYSTEM_EXECUTABLE" });
});
check("Docker accepts a protected plugin and rejects writable CLI configuration", () => {
  fs.mkdirSync("/owned/plugins", { mode: 0o755 });
  fs.copyFileSync("/owned/good/tool", "/owned/plugins/docker-compose"); fs.chmodSync("/owned/plugins/docker-compose", 0o755);
  fs.writeFileSync("/etc/docker/config.json", JSON.stringify({ cliPluginsExtraDirs: ["/owned/plugins"] }));
  assert.equal(T.resolveTrustedExecutable("docker"), "/usr/bin/docker");
  fs.chmodSync("/etc/docker/config.json", 0o666);
  assert.throws(() => T.resolveTrustedExecutable("docker"), { code: "UNTRUSTED_SYSTEM_EXECUTABLE" });
});
console.log(JSON.stringify({ scenarios: results.length, results, real_filesystem: true, network: "none", host_binary_changes: false }));
