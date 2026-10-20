"use strict";
// Paired successor of the four IL-5.11 reproductions. Import installed public
// subpaths only; do not import the checkout's private resolver or mock processes.
const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), os = require("node:os"), net = require("node:net");
const { createRequire } = require("node:module");
const consumer = process.argv[2];
assert.ok(consumer && path.isAbsolute(consumer));
const load = createRequire(path.join(consumer, "package.json"));
const moduleFile = load.resolve("@drumee/infra-layer/package.json");
assert.ok(moduleFile.startsWith(path.join(consumer, "node_modules", "@drumee", "infra-layer") + path.sep));
const D = load("@drumee/infra-layer/lifecycle/docker"), tls = load("@drumee/infra-layer/capabilities/tls"), secrets = load("@drumee/infra-layer/capabilities/secrets");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "infra-installed-tools-")), oldPath = process.env.PATH;
fs.chmodSync(root, 0o700);
const marker = path.join(root, "substitute"), records = [];
for (const tool of ["docker", "ss", "openssl"]) fs.writeFileSync(path.join(root, tool), '#!/bin/sh\n: > "' + marker + '"\nexit 0\n', { mode: 0o700 });
function certificate(id) {
  const store = secrets.createFilesystemSecretStore(path.join(root, id, "secrets"), "review");
  const ca = { resource: "tls", key: "ca" }, leaf = { resource: "tls", key: "leaf" };
  for (const [ref, type] of [[ca, "tls-ca-key"], [leaf, "tls-leaf-key"]]) store.ensure({ ref, type, consumers: ["tls-issuer"] }, { authorized: true });
  const directory = path.join(root, id, "tls");
  const prepared = tls.prepareLocalCertificate({ owner: "review", directory, hostname: "review.invalid", ca_key_ref: ca, private_key_ref: leaf, leaf_days: 2, renew_before_days: 1 }, store, { authorized: true, create_ca: true });
  const key = path.join(root, id, "leaf.key"); store.materialize(leaf, "tls-issuer", key);
  return { certificate: prepared.file, key, ca_bundle: path.join(directory, "ca.pem"), hostname: "review.invalid" };
}
(async () => {
  process.env.PATH = root + ":/usr/bin:/bin";
  assert.match(D.docker(["version"]), /Client:/); assert.equal(fs.existsSync(marker), false);
  records.push("Docker default driver uses actual approved client and local daemon");
  const listener = net.createServer();
  await new Promise((resolve, reject) => { listener.once("error", reject); listener.listen(0, "127.0.0.1", resolve); });
  try {
    assert.throws(() => D.checkPorts({ compose: { services: { application: { ports: [{ protocol: "tcp", host_ip: "127.0.0.1", published: listener.address().port }] } } } }), { code: "CONFLICTING_PORT_BINDING" });
    assert.equal(fs.existsSync(marker), false);
    records.push("real ss detects live owned listener despite empty-output substitute");
  } finally { await new Promise(resolve => listener.close(resolve)); }
  const a = certificate("a"), b = certificate("b");
  assert.equal(tls.validateCertificate(a).valid, true); assert.equal(fs.existsSync(marker), false);
  records.push("authorized TLS issuance and valid chain use genuine OpenSSL");
  assert.throws(() => tls.validateCertificate({ ...a, ca_bundle: b.ca_bundle }), { code: "TLS_CHAIN_INVALID" });
  assert.equal(fs.existsSync(marker), false);
  records.push("same unrelated-CA attack remains denied with substitute OpenSSL returning zero");
  console.log(JSON.stringify({ installed_package: moduleFile, scenarios: records.length, records, substitutes_executed: false }));
})().catch(error => { console.error(error.code || error.message); process.exitCode = 1; }).finally(() => {
  if (oldPath === undefined) delete process.env.PATH; else process.env.PATH = oldPath;
  fs.rmSync(root, { recursive: true, force: true });
});
