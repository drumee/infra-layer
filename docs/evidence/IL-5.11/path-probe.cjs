"use strict";
// Security-review fixture only; absent from the npm allowlist. No Docker daemon
// is contacted. Substitutes only write private markers and return static data.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createRequire } = require("node:module");
const consumer = process.argv[2];
assert.ok(consumer && path.isAbsolute(consumer), "absolute installed consumer required");
const load = createRequire(path.join(consumer, "package.json"));
const modulePath = load.resolve("@drumee/infra-layer/package.json");
assert.ok(modulePath.startsWith(path.join(consumer, "node_modules", "@drumee", "infra-layer") + path.sep));
const docker = load("@drumee/infra-layer/lifecycle/docker");
const tls = load("@drumee/infra-layer/capabilities/tls");
const secrets = load("@drumee/infra-layer/capabilities/secrets");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "drumee-il511-path-"));
fs.chmodSync(root, 0o700);
const savedPath = process.env.PATH;
const records = [];
function substitute(name, body) {
  const bin = path.join(root, "bin"); fs.mkdirSync(bin, { recursive: true, mode: 0o700 });
  const target = path.join(bin, name);
  fs.writeFileSync(target, "#!/bin/sh\n" + body + "\n", { mode: 0o700 });
  process.env.PATH = bin + ":/usr/bin:/bin";
}
function marker(name) { return path.join(root, name); }
function fixture(id) {
  const store = secrets.createFilesystemSecretStore(path.join(root, id, "secrets"), "review");
  const ca = { resource: "tls", key: "ca" }, leaf = { resource: "tls", key: "leaf" };
  for (const [ref, type] of [[ca, "tls-ca-key"], [leaf, "tls-leaf-key"]]) {
    store.ensure({ ref, type, consumers: ["tls-issuer"] }, { authorized: true });
  }
  return { store, config: { owner: "review", directory: path.join(root, id, "tls"), hostname: "review.invalid", ca_key_ref: ca, private_key_ref: leaf, leaf_days: 2, renew_before_days: 1 }, leaf };
}
try {
  substitute("docker", ': > "' + marker("docker-selected") + '"\nprintf substituted');
  assert.equal(docker.docker(["version"]), "substituted");
  assert.ok(fs.existsSync(marker("docker-selected")));
  records.push({ site: "lifecycle/docker.js:8", observed: "PATH substitute executed; no Docker daemon contacted" });

  substitute("ss", ': > "' + marker("ss-selected") + '"');
  substitute("docker", "exit 0");
  docker.checkPorts({ compose: { services: {} } });
  assert.ok(fs.existsSync(marker("ss-selected")));
  records.push({ site: "lifecycle/docker.js:49", observed: "PATH ss substitute executed in exported driver port observation" });

  const first = fixture("issue");
  substitute("openssl", ': > "' + marker("openssl-issue-selected") + '"\nexit 1');
  assert.throws(() => tls.prepareLocalCertificate(first.config, first.store, { authorized: true, create_ca: true }), { code: "TLS_CERTIFICATE_INVALID" });
  assert.ok(fs.existsSync(marker("openssl-issue-selected")));
  records.push({ site: "capabilities/tls/index.js:9", observed: "authorized issuer executes PATH substitute; failure then reported" });

  process.env.PATH = "/usr/bin:/bin";
  const a = fixture("a"), b = fixture("b");
  const certA = tls.prepareLocalCertificate(a.config, a.store, { authorized: true, create_ca: true });
  tls.prepareLocalCertificate(b.config, b.store, { authorized: true, create_ca: true });
  const key = path.join(root, "a", "leaf.key");
  a.store.materialize(a.leaf, "tls-issuer", key);
  const options = { certificate: certA.file, key, hostname: a.config.hostname, ca_bundle: path.join(b.config.directory, "ca.pem") };
  assert.throws(() => tls.validateCertificate(options), { code: "TLS_CHAIN_INVALID" });
  substitute("openssl", ': > "' + marker("openssl-verify-selected") + '"\nexit 0');
  assert.equal(tls.validateCertificate(options).valid, true);
  assert.ok(fs.existsSync(marker("openssl-verify-selected")));
  records.push({ site: "capabilities/tls/index.js:19", observed: "unrelated CA rejected with system OpenSSL; same input accepted with PATH substitute" });
  console.log(JSON.stringify({ source: "9e4166618ca519e5d9b9e58f5191d37c5fd56462", installed_package: modulePath, scenarios: records.length, records, precondition: "reviewer deliberately controls caller PATH; no remote-to-PATH input or cross-UID escalation demonstrated", production_secrets: false, real_docker: false }, null, 2));
} finally {
  if (savedPath === undefined) delete process.env.PATH; else process.env.PATH = savedPath;
  fs.rmSync(root, { recursive: true, force: true });
}
