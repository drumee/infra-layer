"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), net = require("node:net");
const { execFileSync } = require("node:child_process");
const T = require("../../internal/system-tools");
const D = require("../../lifecycle/docker");
const tls = require("../../capabilities/tls");
const secrets = require("../../capabilities/secrets");
const Q = require("../support/trusted-process");
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "infra-trusted-tools-"));
  fs.chmodSync(root, 0o700);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
function hostile(t, root) {
  const old = process.env.PATH, marker = path.join(root, "substitute-executed");
  for (const name of ["docker", "ss", "openssl"]) fs.writeFileSync(path.join(root, name), '#!/bin/sh\n: > "' + marker + '"\nexit 0\n', { mode: 0o700 });
  process.env.PATH = root + ":/usr/bin:/bin";
  t.after(() => { if (old === undefined) delete process.env.PATH; else process.env.PATH = old; });
  return marker;
}
function certificate(root, id) {
  const store = secrets.createFilesystemSecretStore(path.join(root, id, "secrets"), "review");
  const ca = { resource: "tls", key: "ca" }, leaf = { resource: "tls", key: "leaf" };
  for (const [ref, type] of [[ca, "tls-ca-key"], [leaf, "tls-leaf-key"]]) store.ensure({ ref, type, consumers: ["tls-issuer"] }, { authorized: true });
  const directory = path.join(root, id, "tls");
  const prepared = tls.prepareLocalCertificate({ owner: "review", directory, hostname: "review.invalid", ca_key_ref: ca, private_key_ref: leaf, leaf_days: 2, renew_before_days: 1 }, store, { authorized: true, create_ca: true });
  const key = path.join(root, id, "leaf.key"); store.materialize(leaf, "tls-issuer", key);
  return { certificate: prepared.file, key, hostname: "review.invalid", ca_bundle: path.join(directory, "ca.pem") };
}
test("D1/D6 fixed Docker selection ignores hostile caller PATH and options.env", t => {
  const root = fixture(t), marker = hostile(t, root);
  assert.equal(T.resolveTrustedExecutable("docker"), "/usr/bin/docker");
  assert.match(D.docker(["--version"], { env: { PATH: root, DOCKER_CONFIG: root }, shell: true }), /^Docker version /);
  assert.equal(fs.existsSync(marker), false);
  assert.throws(() => T.resolveTrustedExecutable("unlisted"), { code: "UNTRUSTED_SYSTEM_EXECUTABLE" });
});
test("D5 substituted OpenSSL cannot approve the previously reproduced unrelated CA", t => {
  const root = fixture(t), a = certificate(root, "a"), b = certificate(root, "b");
  const marker = hostile(t, root);
  assert.throws(() => tls.validateCertificate({ ...a, ca_bundle: b.ca_bundle }), { code: "TLS_CHAIN_INVALID" });
  assert.equal(tls.validateCertificate(a).valid, true);
  assert.throws(() => tls.validateCertificate({ ...a, hostname: "other.invalid" }), { code: "TLS_SAN_MISMATCH" });
  assert.equal(fs.existsSync(marker), false);
});
test("D1 issuer uses genuine OpenSSL while an earlier PATH substitute would fail", t => {
  const root = fixture(t), marker = hostile(t, root);
  const material = certificate(root, "issuer");
  assert.equal(tls.validateCertificate(material).valid, true);
  assert.equal(fs.existsSync(marker), false);
});
test("D7 real ss observes a live socket without executing its PATH substitute", async t => {
  const root = fixture(t), marker = hostile(t, root), server = net.createServer();
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  try {
    const port = server.address().port;
    const output = execFileSync(T.resolveTrustedExecutable("ss"), ["-H", "-ltn", "sport = :" + port], { encoding: "utf8", env: T.systemEnvironment("ss") });
    assert.ok(output.includes("127.0.0.1:" + port));
    assert.equal(fs.existsSync(marker), false);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
test("D8 child environment drops arbitrary secrets, loaders and caller Docker/SSL settings", t => {
  const names = ["OPENSSL_CONF", "NODE_OPTIONS", "LD_PRELOAD", "DOCKER_CONFIG", "REVIEW_PRIVATE_VALUE"];
  const before = Object.fromEntries(names.map(name => [name, process.env[name]]));
  for (const name of names) process.env[name] = "caller-controlled-not-a-real-secret";
  t.after(() => { for (const name of names) { if (before[name] === undefined) delete process.env[name]; else process.env[name] = before[name]; } });
  const plain = T.systemEnvironment("openssl");
  assert.deepEqual(plain, { PATH: "/usr/bin:/bin", LANG: "C", LC_ALL: "C" });
  const child = JSON.parse(execFileSync(process.execPath, ["-e", "console.log(JSON.stringify(process.env))"], { encoding: "utf8", env: plain }));
  assert.deepEqual(child, plain);
  assert.deepEqual(T.systemEnvironment("docker"), { ...plain, HOME: "/", DOCKER_CONFIG: "/etc/docker" });
  const qualification = Q.trustedEnvironment({ PATH: "/untrusted", REVIEW_PRIVATE_VALUE: "not-forwarded", IL1_PORT: "12345" });
  assert.equal(qualification.IL1_PORT, "12345"); assert.equal(qualification.PATH, "/usr/bin:/bin");
  for (const name of names) assert.equal(qualification[name], undefined);
});
test("qualification rejects writable symlink entry ancestors even with a safe target", t => {
  const root = fixture(t), link = path.join(root, "alias");
  fs.symlinkSync("/usr/bin/git", link);
  assert.equal(Q.trustedExecutable(link), fs.realpathSync("/usr/bin/git"));
  fs.chmodSync(root, 0o777);
  assert.throws(() => Q.trustedExecutable(link), /UNSAFE_QUALIFICATION_EXECUTABLE/);
});
test("internal resolver has no public package subpath export", () => {
  assert.throws(() => require("@drumee/infra-layer/internal/system-tools"), { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" });
});
