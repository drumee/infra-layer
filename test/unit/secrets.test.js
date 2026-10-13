"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { createFilesystemSecretStore, types } = require("../../capabilities/secrets");
function fixture(t) { const root = fs.mkdtempSync(path.join(os.tmpdir(), "infra-secret-")); t.after(() => fs.rmSync(root, { recursive: true, force: true })); return { root, store: createFilesystemSecretStore(path.join(root, "store"), "instance-a"), descriptor: { ref: { resource: "database", key: "admin" }, type: "database-admin", consumers: ["database"] } }; }
test("secrets require explicit first-install authorization; repeated execution preserves bytes/fingerprint", (t) => {
  const { root, store, descriptor } = fixture(t); assert.throws(() => store.ensure(descriptor), { code: "SECRET_OPERATION_NOT_AUTHORIZED" }); assert.equal(fs.existsSync(path.join(root, "store")), false);
  const initial = store.ensure(descriptor, { authorized: true }); assert.equal(store.read(descriptor.ref, "database").length, 43);
  assert.deepEqual(store.ensure(descriptor), initial); assert.deepEqual(createFilesystemSecretStore(path.join(root, "store"), "instance-a").inspect(descriptor.ref), initial);
  assert.equal(JSON.stringify(initial).includes(store.read(descriptor.ref, "database").toString()), false);
});
test("corrupt/missing existing data fails closed and is never regenerated", (t) => {
  const { root, store, descriptor } = fixture(t); store.ensure(descriptor, { authorized: true }); const directory = path.join(root, "store/database/admin");
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, "current.json"))); fs.writeFileSync(path.join(directory, manifest.generation + ".secret"), "corrupt");
  assert.throws(() => store.ensure(descriptor, { authorized: true }), { code: "SECRET_CORRUPTED" }); fs.unlinkSync(path.join(directory, manifest.generation + ".secret")); assert.throws(() => store.inspect(descriptor.ref), { code: "RESOURCE_MISSING" });
});
test("world-readable secret or store permissions and unrelated ownership are rejected", (t) => {
  const { root, store, descriptor } = fixture(t); store.ensure(descriptor, { authorized: true }); const directory = path.join(root, "store/database/admin");
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, "current.json"))); const file = path.join(directory, manifest.generation + ".secret"); fs.chmodSync(file, 0o644);
  assert.throws(() => store.inspect(descriptor.ref), { code: "RESOURCE_PERMISSIONS_UNSAFE" }); fs.chmodSync(file, 0o600); fs.chmodSync(path.join(root, "store"), 0o755); assert.throws(() => store.inspect(descriptor.ref), { code: "RESOURCE_PERMISSIONS_UNSAFE" }); fs.chmodSync(path.join(root, "store"), 0o700);
  assert.throws(() => createFilesystemSecretStore(path.join(root, "store"), "instance-b").inspect(descriptor.ref), { code: "SECRET_OWNERSHIP_MISMATCH" });
});
test("concurrent/interrupted secret creation cannot take over or generate replacement credentials", (t) => {
  const { root, store, descriptor } = fixture(t); const directory = path.join(root, "store/database/admin"); fs.mkdirSync(directory, { recursive: true, mode: 0o700 }); fs.mkdirSync(path.join(directory, ".infra-lifecycle-lock"));
  assert.throws(() => store.ensure(descriptor, { authorized: true }), { code: "RESOURCE_LOCKED" }); fs.rmdirSync(path.join(directory, ".infra-lifecycle-lock")); fs.writeFileSync(path.join(directory, "abandoned.secret"), "temporary", { mode: 0o600 }); assert.throws(() => store.ensure(descriptor, { authorized: true }), { code: "SECRET_STATE_INCOMPLETE" });
});
test("explicit rotation requires fingerprint CAS and consumer transition; failed rotation retains old state", (t) => {
  const { store, descriptor } = fixture(t); const initial = store.ensure(descriptor, { authorized: true });
  assert.throws(() => store.rotate(descriptor, { authorized: true }), { code: "SECRET_ROTATION_NOT_AUTHORIZED" });
  assert.throws(() => store.rotate(descriptor, { authorized: true, expected_fingerprint: initial.fingerprint, consumer_transition: "scheduled" }, Buffer.from("bad value\n")), { code: "SECRET_CORRUPTED" }); assert.deepEqual(store.inspect(descriptor.ref), initial);
  const next = store.rotate(descriptor, { authorized: true, expected_fingerprint: initial.fingerprint, consumer_transition: "dual-credentials" }); assert.notEqual(next.fingerprint, initial.fingerprint); assert.throws(() => store.rotate(descriptor, { authorized: true, expected_fingerprint: initial.fingerprint, consumer_transition: "stale" }), { code: "SECRET_ROTATION_NOT_AUTHORIZED" });
});
test("consumer projections are narrow, exclusive and private; path/symlink/hardlink escape fails", (t) => {
  const { root, store, descriptor } = fixture(t); store.ensure(descriptor, { authorized: true });
  assert.throws(() => store.read(descriptor.ref, "gateway"), { code: "SECRET_CONSUMER_FORBIDDEN" }); assert.throws(() => store.inspect({ resource: "../escape", key: "x" }), { code: "INVALID_SECRET_REFERENCE" });
  const destination = path.join(root, "projection/admin"); const result = store.materialize(descriptor.ref, "database", destination); assert.equal(result.mode, 0o600); assert.equal(fs.statSync(destination).mode & 0o077, 0); assert.throws(() => store.materialize(descriptor.ref, "database", destination), { code: "SECRET_DESTINATION_OCCUPIED" });
  fs.symlinkSync(path.join(root, "store"), path.join(root, "symlink")); assert.throws(() => createFilesystemSecretStore(path.join(root, "symlink"), "instance-a").inspect(descriptor.ref), { code: "UNSAFE_RESOURCE_PATH" });
  const directory = path.join(root, "store/database/admin"); const state = JSON.parse(fs.readFileSync(path.join(directory, "current.json"))); fs.linkSync(path.join(directory, state.generation + ".secret"), path.join(root, "hardlink")); assert.throws(() => store.inspect(descriptor.ref), { code: "UNSAFE_RESOURCE_PATH" });
});
test("all declared secret types validate; imported relay/DNS credentials are never invented", (t) => {
  const { store } = fixture(t);
  for (const type of types) { const descriptor = { ref: { resource: "types", key: type }, type, consumers: ["service"] };
    if (["acme-dns-credential", "smtp-relay-credential"].includes(type)) { assert.throws(() => store.ensure(descriptor, { authorized: true }), { code: "SECRET_IMPORT_REQUIRED" }); store.import(descriptor, Buffer.from("operator-provided-credential"), { authorized: true }); }
    else store.ensure(descriptor, { authorized: true });
    assert.equal(store.inspect(descriptor.ref).type, type);
  }
});
