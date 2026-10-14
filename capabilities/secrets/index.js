"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const S = require("../../lib/spec");
const F = require("../../lib/filesystem-safety");
const types = ["database-admin", "database-service", "redis-auth", "tls-ca-key", "tls-leaf-key", "acme-account-key", "acme-dns-credential", "dkim-key", "smtp-relay-credential", "dns-tsig"];
function validRef(ref) { return S.record(ref) && Object.keys(ref).length === 2 && S.identifier(ref.resource) && S.identifier(ref.key); }
function descriptor(value) {
  return S.plainTree(value) && S.record(value) && Object.keys(value).every((key) => ["ref", "type", "consumers"].includes(key)) && validRef(value.ref) && types.includes(value.type) && Array.isArray(value.consumers) && value.consumers.length > 0 && value.consumers.every(S.identifier) && new Set(value.consumers).size === value.consumers.length;
}
function fingerprint(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function validateValue(type, value) {
  if (!Buffer.isBuffer(value) || value.length === 0 || value.length > 65536) F.fail("SECRET_CORRUPTED");
  const text = value.toString("utf8");
  if (["tls-ca-key", "tls-leaf-key", "acme-account-key", "dkim-key"].includes(type)) {
    try { const key = crypto.createPrivateKey(value); if (key.asymmetricKeyType !== "rsa" && key.asymmetricKeyType !== "ec") F.fail("SECRET_CORRUPTED"); } catch (_) { F.fail("SECRET_CORRUPTED"); }
  } else if (/\s|[\x00-\x1f\x7f]/.test(text) || !/^[a-zA-Z0-9_+=.:/@-]+$/.test(text) || (type === "dns-tsig" && !/^[a-zA-Z0-9+/]{43}=$/.test(text))) F.fail("SECRET_CORRUPTED");
}
function generate(type) {
  if (["acme-dns-credential", "smtp-relay-credential"].includes(type)) F.fail("SECRET_IMPORT_REQUIRED");
  if (["tls-ca-key", "tls-leaf-key", "acme-account-key", "dkim-key"].includes(type)) return Buffer.from(crypto.generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } }).privateKey);
  return Buffer.from(crypto.randomBytes(32).toString(type === "dns-tsig" ? "base64" : "base64url"));
}
function createFilesystemSecretStore(root, owner) {
  if (!S.identifier(owner)) F.fail("SECRET_OWNERSHIP_MISMATCH");
  const location = (ref) => { if (!validRef(ref)) F.fail("INVALID_SECRET_REFERENCE"); return path.join(root, ref.resource, ref.key); };
  function entry(ref) {
    const directory = location(ref); if (!fs.existsSync(root) || !fs.existsSync(directory)) F.fail("SECRET_MISSING");
    F.privateDirectory(root); F.privateDirectory(directory);
    let state; try { state = JSON.parse(F.read(path.join(directory, "current.json"))); } catch (error) { if (error.code === "RESOURCE_MISSING") F.fail("SECRET_MISSING"); if (["UNSAFE_RESOURCE_PATH", "RESOURCE_PERMISSIONS_UNSAFE"].includes(error.code)) throw error; F.fail("SECRET_CORRUPTED"); }
    if (!S.plainTree(state) || state.owner !== owner || S.serialize(state.ref) !== S.serialize(ref) || !descriptor(state.descriptor) || !/^[a-f0-9]{32}$/.test(state.generation) || !/^[a-f0-9]{64}$/.test(state.fingerprint)) F.fail("SECRET_OWNERSHIP_MISMATCH");
    const value = F.read(path.join(directory, `${state.generation}.secret`)); validateValue(state.descriptor.type, value);
    if (fingerprint(value) !== state.fingerprint) F.fail("SECRET_CORRUPTED");
    return { state, value };
  }
  function inspect(ref) { const { state } = entry(ref); return { ref: S.clone(ref), owner, type: state.descriptor.type, consumers: [...state.descriptor.consumers], fingerprint: state.fingerprint }; }
  function write(value_descriptor, value, operation, rotate = false) {
    if (!descriptor(value_descriptor) || !S.plainTree(operation) || operation?.authorized !== true) F.fail("SECRET_OPERATION_NOT_AUTHORIZED");
    F.privateDirectory(root, true); const directory = location(value_descriptor.ref); F.privateDirectory(directory, true);
    return F.lock(directory, () => {
      const current = fs.existsSync(path.join(directory, "current.json"));
      const files = fs.readdirSync(directory).filter((name) => name !== ".infra-lifecycle-lock");
      if (!current && files.length) F.fail("SECRET_STATE_INCOMPLETE");
      if (current) {
        const existing = entry(value_descriptor.ref);
        if (S.serialize(existing.state.descriptor) !== S.serialize(value_descriptor)) F.fail("SECRET_OWNERSHIP_MISMATCH");
        if (!rotate) return inspect(value_descriptor.ref);
        if (!/^[a-f0-9]{64}$/.test(operation.expected_fingerprint || "") || operation.expected_fingerprint !== existing.state.fingerprint || !S.identifier(operation.consumer_transition)) F.fail("SECRET_ROTATION_NOT_AUTHORIZED");
      } else if (rotate) F.fail("SECRET_MISSING");
      const bytes = value || generate(value_descriptor.type); validateValue(value_descriptor.type, bytes);
      const generation = crypto.randomBytes(16).toString("hex"); const file = path.join(directory, `${generation}.secret`);
      F.atomic(file, bytes);
      try { F.atomic(path.join(directory, "current.json"), `${S.serialize({ owner, ref: value_descriptor.ref, descriptor: value_descriptor, generation, fingerprint: fingerprint(bytes) })}\n`); }
      catch (error) { fs.unlinkSync(file); throw error; }
      return inspect(value_descriptor.ref);
    });
  }
  return {
    inspect,
    ensure(value_descriptor, operation = {}) { if (fs.existsSync(path.join(location(value_descriptor?.ref), "current.json"))) { const existing = entry(value_descriptor.ref); if (S.serialize(existing.state.descriptor) !== S.serialize(value_descriptor)) F.fail("SECRET_OWNERSHIP_MISMATCH"); return inspect(value_descriptor.ref); } return write(value_descriptor, null, operation); },
    import(value_descriptor, bytes, operation) { return write(value_descriptor, bytes, operation); },
    rotate(value_descriptor, operation, bytes = null) { return write(value_descriptor, bytes, operation, true); },
    read(ref, consumer) { const found = entry(ref); if (!S.identifier(consumer) || !found.state.descriptor.consumers.includes(consumer)) F.fail("SECRET_CONSUMER_FORBIDDEN"); return Buffer.from(found.value); },
    materialize(ref, consumer, destination, ownership = {}) {
      if ((ownership.uid !== undefined || ownership.gid !== undefined) && (!Number.isInteger(ownership.uid) || ownership.uid < 0 || !Number.isInteger(ownership.gid) || ownership.gid < 0)) F.fail("SECRET_OWNERSHIP_MISMATCH");
      const value = this.read(ref, consumer); F.privateDirectory(path.dirname(destination), true);
      if (fs.lstatSync(destination, { throwIfNoEntry: false })) F.fail("SECRET_DESTINATION_OCCUPIED");
      F.atomic(destination, value, 0o600);
      if (ownership.uid !== undefined || ownership.gid !== undefined) { try { fs.chownSync(destination, ownership.uid, ownership.gid); } catch (_) { fs.unlinkSync(destination); F.fail("SECRET_MATERIALIZATION_FAILED"); } }
      return { ref: S.clone(ref), consumer, fingerprint: fingerprint(value), mode: 0o600 };
    }
  };
}
module.exports = { createFilesystemSecretStore, descriptor, validRef, types };
