"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const { resolveTrustedExecutable, systemEnvironment } = require("../../internal/system-tools");
const S = require("../../lib/spec");
const F = require("../../lib/filesystem-safety");
const { validRef } = require("../secrets");
function openssl(args, input) { try { return execFileSync(resolveTrustedExecutable("openssl"), args, { input, stdio: ["pipe", "pipe", "pipe"], timeout: 30000, env: systemEnvironment("openssl") }); } catch { F.fail("TLS_CERTIFICATE_INVALID"); } }
function validateCertificate({ certificate, key, hostname, ca_bundle, now = Date.now() }) {
  if (!S.hostname(hostname) || !Number.isFinite(now)) F.fail("INVALID_TLS_CONFIGURATION");
  const pem = F.read(certificate, false); const key_pem = F.read(key); const trust = F.read(ca_bundle, false);
  let leaf, private_key;
  try { leaf = new crypto.X509Certificate(pem); private_key = crypto.createPrivateKey(key_pem); } catch { F.fail("TLS_CERTIFICATE_INVALID"); }
  if (!leaf.subjectAltName || !leaf.checkHost(hostname, { subject: "never" })) F.fail("TLS_SAN_MISMATCH");
  if (!leaf.publicKey.export({ type: "spki", format: "der" }).equals(crypto.createPublicKey(private_key).export({ type: "spki", format: "der" }))) F.fail("TLS_KEY_MISMATCH");
  if (Date.parse(leaf.validFrom) > now || Date.parse(leaf.validTo) <= now) F.fail("TLS_CERTIFICATE_EXPIRED");
  try { if (!new crypto.X509Certificate(trust).ca) F.fail("TLS_CHAIN_INVALID"); } catch { F.fail("TLS_CHAIN_INVALID"); }
  try { execFileSync(resolveTrustedExecutable("openssl"), ["verify", "-purpose", "sslserver", "-verify_hostname", hostname, "-attime", String(Math.floor(now / 1000)), "-CAfile", ca_bundle, "-untrusted", certificate, certificate], { stdio: "pipe", timeout: 10000, env: systemEnvironment("openssl") }); } catch { F.fail("TLS_CHAIN_INVALID"); }
  return { hostname, fingerprint: leaf.fingerprint256, expires_at: new Date(leaf.validTo).toISOString(), valid: true, active: false, activation_required: true };
}
function configuration(value) {
  if (!S.plainTree(value) || !S.record(value) || !S.hostname(value.hostname) || !validRef(value.private_key_ref) || !S.identifier(value.owner)
    || !Number.isInteger(value.leaf_days) || value.leaf_days < 1 || value.leaf_days > 365 || !Number.isInteger(value.renew_before_days) || value.renew_before_days < 1 || value.renew_before_days >= value.leaf_days) F.fail("INVALID_TLS_CONFIGURATION");
  F.privateDirectory(value.directory, true);
}
function storedLeaf(config, store, now = Date.now()) {
  const manifest_file = path.join(config.directory, "leaf.json");
  if (!fs.existsSync(manifest_file)) { if (fs.readdirSync(config.directory).some((name) => name.startsWith("leaf-") || name.startsWith(".tls-stage-"))) F.fail("TLS_STATE_CORRUPTED"); return null; }
  let state; try { state = JSON.parse(F.read(manifest_file)); } catch { F.fail("TLS_STATE_CORRUPTED"); }
  if (!S.plainTree(state) || state.owner !== config.owner || state.hostname !== config.hostname || !/^leaf-[a-f0-9]{32}\.pem$/.test(state.file) || state.key_fingerprint !== store.inspect(config.private_key_ref).fingerprint) F.fail("TLS_STATE_CORRUPTED");
  const file = path.join(config.directory, state.file); const pem = F.read(file, false);
  if (S.digest(pem.toString()) !== state.digest) F.fail("TLS_STATE_CORRUPTED");
  const leaf = new crypto.X509Certificate(pem);
  return { file, fingerprint: leaf.fingerprint256, expires_at: new Date(leaf.validTo).toISOString(), renewal_required: Date.parse(leaf.validTo) - now <= config.renew_before_days * 86400000, active: false, activation_required: true };
}
function commitLeaf(config, store, certificate) {
  const file = `leaf-${crypto.randomBytes(16).toString("hex")}.pem`; const target = path.join(config.directory, file);
  F.atomic(target, certificate);
  try { F.atomic(path.join(config.directory, "leaf.json"), `${S.serialize({ owner: config.owner, hostname: config.hostname, file, digest: S.digest(certificate.toString()), key_fingerprint: store.inspect(config.private_key_ref).fingerprint })}\n`); }
  catch (error) { fs.unlinkSync(target); throw error; }
  return storedLeaf(config, store);
}
function prepareLocalCertificate(config, store, operation = {}) {
  if (operation.authorized !== true) F.fail("TLS_OPERATION_NOT_AUTHORIZED"); configuration(config);
  if (!validRef(config.ca_key_ref) || S.serialize(config.ca_key_ref) === S.serialize(config.private_key_ref)) F.fail("INVALID_TLS_CONFIGURATION");
  return F.lock(config.directory, () => {
    const ca_file = path.join(config.directory, "ca.pem"); const issuer_file = path.join(config.directory, "issuer.json");
    const ca_key = store.read(config.ca_key_ref, "tls-issuer"); const leaf_key = store.read(config.private_key_ref, "tls-issuer");
    const existing = storedLeaf(config, store, operation.now);
    const temporary = fs.mkdtempSync(path.join(config.directory, ".tls-stage-"));
    try {
      const ca_key_file = path.join(temporary, "ca.key"); const leaf_key_file = path.join(temporary, "leaf.key"); F.atomic(ca_key_file, ca_key); F.atomic(leaf_key_file, leaf_key);
      if (!fs.existsSync(issuer_file)) {
        if (fs.existsSync(ca_file) || operation.create_ca !== true) F.fail("TLS_ISSUER_STATE_CORRUPTED");
        openssl(["req", "-x509", "-new", "-key", ca_key_file, "-out", path.join(temporary, "ca.pem"), "-days", "3650", "-sha256", "-subj", `/CN=Drumee ${config.owner} local CA`, "-addext", "basicConstraints=critical,CA:TRUE,pathlen:0", "-addext", "keyUsage=critical,keyCertSign,cRLSign"]);
        const pem = F.read(path.join(temporary, "ca.pem"), false); F.atomic(ca_file, pem);
        F.atomic(issuer_file, `${S.serialize({ owner: config.owner, key_fingerprint: store.inspect(config.ca_key_ref).fingerprint, certificate_digest: S.digest(pem.toString()) })}\n`);
      }
      let issuer; try { issuer = JSON.parse(F.read(issuer_file)); } catch { F.fail("TLS_ISSUER_STATE_CORRUPTED"); }
      const ca_pem = F.read(ca_file); let ca;
      try { ca = new crypto.X509Certificate(ca_pem); } catch { F.fail("TLS_ISSUER_STATE_CORRUPTED"); }
      if (issuer.owner !== config.owner || issuer.key_fingerprint !== store.inspect(config.ca_key_ref).fingerprint || issuer.certificate_digest !== S.digest(ca_pem.toString()) || !ca.ca || !ca.verify(ca.publicKey) || !ca.publicKey.export({ type: "spki", format: "der" }).equals(crypto.createPublicKey(ca_key).export({ type: "spki", format: "der" }))) F.fail("TLS_ISSUER_STATE_CORRUPTED");
      if (existing && operation.renew !== true) {
        validateCertificate({ certificate: existing.file, key: leaf_key_file, hostname: config.hostname, ca_bundle: ca_file, now: operation.now });
        return { ...existing, ca_fingerprint: ca.fingerprint256, ca_certificate_pem: ca_pem.toString() };
      }
      openssl(["req", "-new", "-key", leaf_key_file, "-out", path.join(temporary, "leaf.csr"), "-subj", `/CN=${config.hostname}`]);
      F.atomic(path.join(temporary, "extensions"), `basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:${config.hostname}\n`);
      openssl(["x509", "-req", "-in", path.join(temporary, "leaf.csr"), "-CA", ca_file, "-CAkey", ca_key_file, "-set_serial", `0x${crypto.randomBytes(16).toString("hex")}`, "-days", String(config.leaf_days), "-sha256", "-extfile", path.join(temporary, "extensions"), "-out", path.join(temporary, "leaf.pem")]);
      validateCertificate({ certificate: path.join(temporary, "leaf.pem"), key: leaf_key_file, hostname: config.hostname, ca_bundle: ca_file });
      const result = commitLeaf(config, store, F.read(path.join(temporary, "leaf.pem"), false));
      return { ...result, ca_fingerprint: ca.fingerprint256, ca_certificate_pem: ca_pem.toString() };
    } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
  });
}
function publicAcmeHostname(hostname) { return S.hostname(hostname) && hostname.includes(".") && !/(?:^|\.)(?:localhost|lan|local|test|internal|invalid)$/.test(hostname) && !require("node:net").isIP(hostname); }
async function prepareAcmeCertificate(config, store, operation = {}, issuer) {
  if (operation.authorized !== true || operation.authorize_public_dns !== true || operation.accept_terms !== true) F.fail("ACME_OPERATION_NOT_AUTHORIZED");
  configuration(config);
  if (!publicAcmeHostname(config.hostname)) F.fail("ACME_HOSTNAME_INVALID");
  if (!["https://acme-v02.api.letsencrypt.org/directory", "https://acme-staging-v02.api.letsencrypt.org/directory"].includes(config.acme_directory) || !validRef(config.account_key_ref) || S.serialize(config.account_key_ref) === S.serialize(config.private_key_ref) || typeof config.email !== "string" || !/^[a-zA-Z0-9_.+-]+@[a-z0-9.-]+\.[a-z]+$/.test(config.email)) F.fail("INVALID_ACME_CONFIGURATION");
  return F.lockAsync(config.directory, async () => {
    const existing = storedLeaf(config, store, operation.now);
    const account_key = store.read(config.account_key_ref, "tls-issuer"); const leaf_key = store.read(config.private_key_ref, "tls-issuer");
    const account_file = path.join(config.directory, "account.json");
    if (existing && !fs.existsSync(account_file)) F.fail("ACME_STATE_CORRUPTED");
    if (fs.existsSync(account_file)) { let state; try { state = JSON.parse(F.read(account_file)); } catch { F.fail("ACME_STATE_CORRUPTED"); } if (state.owner !== config.owner || state.directory !== config.acme_directory || state.account_fingerprint !== store.inspect(config.account_key_ref).fingerprint) F.fail("ACME_STATE_CORRUPTED"); }
    const client = issuer || require("./acme").createLegoIssuer(config); let certificate;
    if (existing && operation.renew !== true) {
      if (client.verifyAccount) client.verifyAccount(config, store);
      const stage = fs.mkdtempSync(path.join(config.directory, ".tls-stage-"));
      try { F.atomic(path.join(stage, "leaf.key"), leaf_key); validateCertificate({ certificate: existing.file, key: path.join(stage, "leaf.key"), hostname: config.hostname, ca_bundle: config.ca_bundle, now: operation.now }); } finally { fs.rmSync(stage, { recursive: true, force: true }); }
      return existing;
    }
    try {
      certificate = await client.issue({ config, account_key, leaf_key, store, renew: operation.renew === true, operation });
      const stage = fs.mkdtempSync(path.join(config.directory, ".tls-stage-"));
      try { F.atomic(path.join(stage, "leaf.key"), leaf_key); F.atomic(path.join(stage, "fullchain.pem"), certificate); validateCertificate({ certificate: path.join(stage, "fullchain.pem"), key: path.join(stage, "leaf.key"), hostname: config.hostname, ca_bundle: config.ca_bundle }); } finally { fs.rmSync(stage, { recursive: true, force: true }); }
      F.atomic(account_file, `${S.serialize({ owner: config.owner, directory: config.acme_directory, account_fingerprint: store.inspect(config.account_key_ref).fingerprint })}\n`);
      return commitLeaf(config, store, Buffer.from(certificate));
    } catch (error) { if (["ACME_STATE_CORRUPTED", "TLS_SAN_MISMATCH", "TLS_KEY_MISMATCH", "TLS_CHAIN_INVALID", "TLS_CERTIFICATE_EXPIRED"].includes(error.code)) throw error; F.fail("ACME_ISSUANCE_FAILED"); }
  });
}
module.exports = { prepareLocalCertificate, validateCertificate, prepareAcmeCertificate, publicAcmeHostname };
