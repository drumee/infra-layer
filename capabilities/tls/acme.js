"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const S = require("../../lib/spec");
const F = require("../../lib/filesystem-safety");
const { validRef } = require("../secrets");
// Verified against lego v5.5.2 / 452dc82113609488fb680acf8fc72712b1794f8d.
function createLegoIssuer(config) {
  if (!S.plainTree(config) || !S.identifier(config.owner) || !require("./index").publicAcmeHostname(config.hostname) || !["https://acme-v02.api.letsencrypt.org/directory", "https://acme-staging-v02.api.letsencrypt.org/directory"].includes(config.acme_directory) || typeof config.email !== "string" || !/^[a-zA-Z0-9_.+-]+@[a-z0-9.-]+\.[a-z]+$/.test(config.email)) F.fail("INVALID_ACME_CONFIGURATION");
  if (typeof config.acme_binary !== "string" || !path.isAbsolute(config.acme_binary) || !/^[a-f0-9]{64}$/.test(config.acme_binary_sha256 || "") || config.dns_provider !== "cloudflare" || !validRef(config.challenge_secret_ref)) F.fail("INVALID_ACME_CONFIGURATION");
  F.directory(path.dirname(config.acme_binary)); const stat = fs.lstatSync(config.acme_binary);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || (stat.mode & 0o022) || ![0, process.getuid()].includes(stat.uid) || crypto.createHash("sha256").update(fs.readFileSync(config.acme_binary)).digest("hex") !== config.acme_binary_sha256) F.fail("ACME_CLIENT_UNVERIFIED");
  let version; try { version = execFileSync(config.acme_binary, ["--version"], { encoding: "utf8", stdio: "pipe", timeout: 10000 }); } catch (_) { F.fail("ACME_CLIENT_UNVERIFIED"); }
  if (!/^lego version 5\.5\.2 /.test(version)) F.fail("ACME_CLIENT_UNVERIFIED");
  const bound = S.serialize(config);
  return { register({ config, store, operation }) {
    if (S.serialize(config) !== bound) F.fail("INVALID_ACME_CONFIGURATION");
    if (operation?.authorized !== true || operation.accept_terms !== true) F.fail("ACME_OPERATION_NOT_AUTHORIZED");
    F.privateDirectory(config.directory, true);
    return F.lock(config.directory, () => {
    const root = path.join(config.directory, "lego-state");
    const owner_file = path.join(config.directory, "lego-owner.json");
    if (fs.existsSync(owner_file)) return store.inspect(config.account_key_ref);
    if (fs.existsSync(root)) F.fail("ACME_STATE_CORRUPTED");
    try { store.inspect(config.account_key_ref); F.fail("ACME_ACCOUNT_REGISTRATION_REQUIRED"); } catch (error) { if (error.code !== "SECRET_MISSING") throw error; }
    F.privateDirectory(root, true);
    try { execFileSync(config.acme_binary, ["--log.level", "error", "accounts", "register", "--path", root, "--server", config.acme_directory, "--account-id", config.owner, "--email", config.email, "--accept-tos", "--key-type", "RSA2048", "--http-timeout", "30"], { env: { PATH: "/usr/bin:/bin" }, stdio: "pipe", timeout: 60000, maxBuffer: 65536 }); } catch (_) { F.fail("ACME_ACCOUNT_REGISTRATION_FAILED"); }
    const key_file = path.join(root, "accounts", new URL(config.acme_directory).hostname, config.owner, `${config.owner}.key`);
    const metadata = store.import({ ref: config.account_key_ref, type: "acme-account-key", consumers: ["tls-issuer"] }, F.read(key_file), { authorized: true });
    F.atomic(owner_file, JSON.stringify({ owner: config.owner, directory: config.acme_directory, fingerprint: metadata.fingerprint }));
    return metadata;
    });
  }, async issue({ config, account_key, leaf_key, store, renew, operation }) {
    if (S.serialize(config) !== bound || operation?.authorized !== true || operation.authorize_public_dns !== true || operation.accept_terms !== true) F.fail("ACME_OPERATION_NOT_AUTHORIZED");
    const root = path.join(config.directory, "lego-state"); const owner_file = path.join(config.directory, "lego-owner.json");
    const host = new URL(config.acme_directory).hostname;
    const account_dir = path.join(root, "accounts", host, config.owner); const account_file = path.join(account_dir, "account.json"); const key_file = path.join(account_dir, `${config.owner}.key`);
    const fingerprint = store.inspect(config.account_key_ref).fingerprint;
    if (fs.existsSync(owner_file)) {
      let state; try { state = JSON.parse(F.read(owner_file)); } catch (_) { F.fail("ACME_STATE_CORRUPTED"); }
      if (state.owner !== config.owner || state.directory !== config.acme_directory || state.fingerprint !== fingerprint || !fs.existsSync(account_file) || !F.read(key_file).equals(account_key)) F.fail("ACME_STATE_CORRUPTED");
      let account; try { account = JSON.parse(F.read(account_file)); } catch (_) { F.fail("ACME_STATE_CORRUPTED"); }
      if (account.id !== config.owner || account.server !== config.acme_directory || account.email !== config.email) F.fail("ACME_STATE_CORRUPTED");
    } else {
      F.fail("ACME_ACCOUNT_REGISTRATION_REQUIRED");
    }
    const stage = fs.mkdtempSync(path.join(config.directory, ".acme-credentials-"));
    try {
      const leaf_file = path.join(stage, "leaf.key"); const credential = path.join(stage, "dns-token"); F.atomic(leaf_file, leaf_key); F.atomic(credential, store.read(config.challenge_secret_ref, "tls-issuer"));
      const args = ["--log.level", "error", "run", "--path", root, "--server", config.acme_directory, "--account-id", config.owner, "--email", config.email, "--accept-tos", "--domains", config.hostname, "--key-type", "RSA2048", "--private-key", leaf_file, "--dns", "cloudflare", "--http-timeout", "30", "--cert.timeout", "60"];
      if (renew) args.push("--renew-force", "--reuse-key");
      try { execFileSync(config.acme_binary, args, { env: { PATH: "/usr/bin:/bin", CF_DNS_API_TOKEN_FILE: credential, CF_ZONE_API_TOKEN_FILE: credential }, stdio: "pipe", timeout: 180000, maxBuffer: 65536 }); } catch (_) { F.fail("ACME_ISSUANCE_FAILED"); }
      // Refuse the maintained client's missing-key repair behavior on future runs.
      const observed_key = crypto.createPrivateKey(F.read(key_file)).export({ type: "pkcs8", format: "der" });
      if (!observed_key.equals(crypto.createPrivateKey(account_key).export({ type: "pkcs8", format: "der" }))) F.fail("ACME_STATE_CORRUPTED");
      return F.read(path.join(root, "certificates", `${config.hostname}.crt`), false).toString();
    } finally { fs.rmSync(stage, { recursive: true, force: true }); }
  } };
}
module.exports = { createLegoIssuer };
