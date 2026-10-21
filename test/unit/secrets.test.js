"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
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
test("weak imported keys and accessor references are rejected without executing getters", (t) => {
  const { store } = fixture(t); const descriptor = { ref: { resource: "tls", key: "weak" }, type: "tls-ca-key", consumers: ["tls-issuer"] };
  const weak = crypto.generateKeyPairSync("rsa", { modulusLength: 1024 }).privateKey.export({ type: "pkcs8", format: "pem" }); assert.throws(() => store.import(descriptor, Buffer.from(weak), { authorized: true }), { code: "SECRET_CORRUPTED" });
  let accessed = false; const reference = { key: "value", get resource() { accessed = true; return "tls"; } }; assert.throws(() => store.inspect(reference), { code: "INVALID_SECRET_REFERENCE" }); assert.equal(accessed, false);
});
test("secret projection cannot overwrite a competing destination created after validation", (t) => {
  const { root, store, descriptor } = fixture(t); store.ensure(descriptor, { authorized: true }); const destination = path.join(root, "projection/admin");
  const link = fs.linkSync; fs.linkSync = (source, target) => { if (target === destination) fs.writeFileSync(target, "unrelated", { mode: 0o600 }); return link(source, target); };
  try { assert.throws(() => store.materialize(descriptor.ref, "database", destination), { code: "SECRET_DESTINATION_OCCUPIED" }); } finally { fs.linkSync = link; } assert.equal(fs.readFileSync(destination, "utf8"), "unrelated");
});
test("weak RSA fixtures cannot enter any key type or replace an existing generation", (t) => {
  const { root, store } = fixture(t);
  const weak = Buffer.from(crypto.generateKeyPairSync("rsa", { modulusLength: 1024 }).privateKey.export({ type: "pkcs8", format: "pem" }));
  for (const type of ["tls-ca-key", "tls-leaf-key", "acme-account-key", "dkim-key"]) {
    const value = { ref: { resource: "keys", key: type }, type, consumers: ["service"] };
    assert.throws(() => store.import(value, weak, { authorized: true }), { code: "SECRET_CORRUPTED" });
    assert.deepEqual(fs.readdirSync(path.join(root, "store/keys", type)), []);
  }
  const value = { ref: { resource: "keys", key: "tls-ca-key" }, type: "tls-ca-key", consumers: ["service"] };
  const initial = store.ensure(value, { authorized: true });
  assert.throws(() => store.rotate(value, { authorized: true, expected_fingerprint: initial.fingerprint, consumer_transition: "test" }, weak), { code: "SECRET_CORRUPTED" });
  assert.deepEqual(store.inspect(value.ref), initial);
});
test("two independent secret creators preserve a single committed fingerprint", async (t) => {
  const { root, store, descriptor } = fixture(t); const module_file = require.resolve("../../capabilities/secrets");
  const script = `const fs=require("node:fs");const {createFilesystemSecretStore}=require(process.argv[1]);fs.writeFileSync(process.argv[2],"ready");const timer=setInterval(()=>{if(!fs.existsSync(process.argv[3]))return;clearInterval(timer);try{const result=createFilesystemSecretStore(process.argv[4],"instance-a").ensure(JSON.parse(process.argv[5]),{authorized:true});console.log(JSON.stringify({code:"OK",fingerprint:result.fingerprint}));}catch(error){console.log(JSON.stringify({code:error.code}));}},5);`;
  const children = [0, 1].map((number) => spawn(process.execPath, ["-e", script, module_file, path.join(root, "ready-" + number), path.join(root, "gate"), path.join(root, "store"), JSON.stringify(descriptor)], { stdio: ["ignore", "pipe", "pipe"] }));
  t.after(() => children.forEach((child) => { if (child.exitCode === null) child.kill(); }));
  const results = children.map((child) => new Promise((resolve, reject) => { let text = ""; child.stdout.on("data", (data) => { text += data; }); child.on("error", reject); child.on("exit", (code) => { if (code !== 0) reject(new Error("CHILD_SECRET_CREATION_FAILED")); else { try { resolve(JSON.parse(text)); } catch (error) { reject(error); } } }); }));
  for (let i = 0; i < 500 && ![0, 1].every((number) => fs.existsSync(path.join(root, "ready-" + number))); i++) await new Promise((resolve) => setTimeout(resolve, 5));
  assert.ok([0, 1].every((number) => fs.existsSync(path.join(root, "ready-" + number)))); fs.writeFileSync(path.join(root, "gate"), "go");
  const settled = await Promise.all(results); assert.ok(settled.some((value) => value.code === "OK")); assert.ok(settled.every((value) => ["OK", "RESOURCE_LOCKED"].includes(value.code))); const fingerprint = store.inspect(descriptor.ref).fingerprint; assert.ok(settled.filter((value) => value.code === "OK").every((value) => value.fingerprint === fingerprint));
});
