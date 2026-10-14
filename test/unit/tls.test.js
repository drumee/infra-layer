"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const F = require("../../lib/filesystem-safety");
const { createFilesystemSecretStore } = require("../../capabilities/secrets");
const tls = require("../../capabilities/tls");
function fixture(t, hostname = "drumee.lan") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "infra-tls-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const store = createFilesystemSecretStore(path.join(root, "secrets"), "local");
  const refs = Object.fromEntries(["ca", "leaf", "account"].map((key) => [key, { resource: "tls", key }]));
  for (const key of Object.keys(refs)) store.ensure({ ref: refs[key], type: key === "ca" ? "tls-ca-key" : key === "leaf" ? "tls-leaf-key" : "acme-account-key", consumers: key === "leaf" ? ["tls-issuer", "gateway"] : ["tls-issuer"] }, { authorized: true });
  return { root, store, config: { owner: "local", directory: path.join(root, "tls"), hostname, ca_key_ref: refs.ca, private_key_ref: refs.leaf, leaf_days: 30, renew_before_days: 10 }, refs };
}
test("local CA/leaf have correct SAN, separate keys, persistent trust and no activation", (t) => {
  const { root, store, config, refs } = fixture(t);
  assert.throws(() => tls.prepareLocalCertificate(config, store), { code: "TLS_OPERATION_NOT_AUTHORIZED" });
  const first = tls.prepareLocalCertificate(config, store, { authorized: true, create_ca: true });
  const cert = new crypto.X509Certificate(fs.readFileSync(first.file)); assert.equal(cert.subjectAltName, "DNS:drumee.lan"); assert.equal(cert.ca, false); assert.equal(first.active, false); assert.equal(first.activation_required, true);
  assert.equal(new crypto.X509Certificate(first.ca_certificate_pem).ca, true); const key = path.join(root, "keys/leaf"); store.materialize(refs.leaf, "gateway", key);
  assert.equal(tls.validateCertificate({ certificate: first.file, key, hostname: config.hostname, ca_bundle: path.join(config.directory, "ca.pem") }).valid, true);
  const repeated = tls.prepareLocalCertificate(config, store, { authorized: true }); assert.equal(repeated.fingerprint, first.fingerprint); assert.equal(repeated.ca_fingerprint, first.ca_fingerprint);
  const key_fp = store.inspect(refs.leaf).fingerprint; const renewed = tls.prepareLocalCertificate(config, store, { authorized: true, renew: true });
  assert.notEqual(renewed.fingerprint, first.fingerprint); assert.equal(renewed.ca_fingerprint, first.ca_fingerprint); assert.equal(store.inspect(refs.leaf).fingerprint, key_fp); assert.equal(store.inspect(refs.ca).consumers.includes("gateway"), false);
});
test("provided certificates reject wrong SAN, mismatched key, expired validity, broken chain and unsafe key mode", (t) => {
  const { root, store, config, refs } = fixture(t); const first = tls.prepareLocalCertificate(config, store, { authorized: true, create_ca: true });
  const key = path.join(root, "keys/leaf"); store.materialize(refs.leaf, "gateway", key); const options = { certificate: first.file, key, hostname: config.hostname, ca_bundle: path.join(config.directory, "ca.pem") };
  assert.throws(() => tls.validateCertificate({ ...options, hostname: "other.lan" }), { code: "TLS_SAN_MISMATCH" });
  assert.throws(() => tls.validateCertificate({ ...options, now: Date.now() + 40 * 86400000 }), { code: "TLS_CERTIFICATE_EXPIRED" });
  const wrong = path.join(root, "keys/wrong"); F.atomic(wrong, store.read(refs.ca, "tls-issuer")); assert.throws(() => tls.validateCertificate({ ...options, key: wrong }), { code: "TLS_KEY_MISMATCH" });
  assert.throws(() => tls.validateCertificate({ ...options, ca_bundle: first.file }), { code: "TLS_CHAIN_INVALID" }); fs.chmodSync(key, 0o644); assert.throws(() => tls.validateCertificate(options), { code: "RESOURCE_PERMISSIONS_UNSAFE" });
});
test("corrupt issuer state never recreates CA; failed renewal preserves the prepared certificate", (t) => {
  const { store, config } = fixture(t); const first = tls.prepareLocalCertificate(config, store, { authorized: true, create_ca: true }); const manifest = fs.readFileSync(path.join(config.directory, "leaf.json"));
  const original = fs.renameSync; fs.renameSync = (...args) => { if (args[1] === path.join(config.directory, "leaf.json")) throw new Error("TEST_RENEWAL_FAILURE"); return original(...args); };
  try { assert.throws(() => tls.prepareLocalCertificate(config, store, { authorized: true, renew: true }), /TEST_RENEWAL_FAILURE/); } finally { fs.renameSync = original; }
  assert.deepEqual(fs.readFileSync(path.join(config.directory, "leaf.json")), manifest); assert.equal(tls.prepareLocalCertificate(config, store, { authorized: true }).fingerprint, first.fingerprint);
  fs.writeFileSync(path.join(config.directory, "issuer.json"), "broken"); assert.throws(() => tls.prepareLocalCertificate(config, store, { authorized: true, create_ca: true }), { code: "TLS_ISSUER_STATE_CORRUPTED" }); assert.equal(new crypto.X509Certificate(fs.readFileSync(path.join(config.directory, "ca.pem"))).fingerprint256, first.ca_fingerprint);
});
test("ACME refuses private hostnames, unauthorized operations and failed issuance without mutation", async (t) => {
  const { store, config, refs } = fixture(t); const acme = { ...config, account_key_ref: refs.account, email: "owner@example.com", acme_directory: "https://acme-staging-v02.api.letsencrypt.org/directory" };
  const operation = { authorized: true, authorize_public_dns: true, accept_terms: true };
  for (const hostname of ["drumee.lan", "localhost", "private.local", "127.0.0.1"]) await assert.rejects(() => tls.prepareAcmeCertificate({ ...acme, hostname }, store, operation), { code: "ACME_HOSTNAME_INVALID" });
  await assert.rejects(() => tls.prepareAcmeCertificate(acme, store), { code: "ACME_OPERATION_NOT_AUTHORIZED" });
  await assert.rejects(() => tls.prepareAcmeCertificate({ ...acme, hostname: "example.com" }, store, operation, { issue: async () => { throw new Error("SECRET_API_FAILURE"); } }), { code: "ACME_ISSUANCE_FAILED" });
  assert.equal(fs.existsSync(path.join(config.directory, "leaf.json")), false);
});
test("ACME issuer-boundary success validates actual certificate/key/chain; failed renewal preserves keys and leaf", async (t) => {
  const { root, store, config, refs } = fixture(t, "example.com"); const local = tls.prepareLocalCertificate(config, store, { authorized: true, create_ca: true });
  const acme = { ...config, directory: path.join(root, "acme"), account_key_ref: refs.account, email: "owner@example.com", acme_directory: "https://acme-staging-v02.api.letsencrypt.org/directory", ca_bundle: path.join(config.directory, "ca.pem") };
  const operation = { authorized: true, authorize_public_dns: true, accept_terms: true };
  const issued = await tls.prepareAcmeCertificate(acme, store, operation, { issue: async () => fs.readFileSync(local.file, "utf8") }); assert.equal(issued.active, false); assert.equal(issued.fingerprint, local.fingerprint);
  const account_fp = store.inspect(refs.account).fingerprint;
  await assert.rejects(() => tls.prepareAcmeCertificate(acme, store, { ...operation, renew: true }, { issue: async () => { throw new Error("FAILED_RENEWAL"); } }), { code: "ACME_ISSUANCE_FAILED" });
  assert.equal(store.inspect(refs.account).fingerprint, account_fp); const preserved = await tls.prepareAcmeCertificate(acme, store, operation, { issue: async () => { throw new Error("MUST_NOT_REISSUE"); } }); assert.equal(preserved.fingerprint, issued.fingerprint);
});
