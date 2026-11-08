"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const auth = require("../../lib/smtp-auth"), S = require("../../lib/spec"), { createFilesystemSecretStore } = require("../../capabilities/secrets");
test("external accounts accept full addresses and opaque names without widening internal identifiers", () => {
  for (const user of ["simple", "name@example.invalid", "opaque +/\\$`'\"#name", "name with spaces", "nom-é", "x".repeat(255)]) assert.equal(auth.account(user), true);
  for (const user of ["", "x".repeat(256), "a:b", " leading", "\tleading", "bad\0name", "bad\rname", "bad\nname", "\uFEFFname", "bad\ud800"]) assert.equal(auth.account(user), false);
  assert.equal(S.identifier("name@example.invalid"), false);
});
test("external secret bytes preserve supported separators and reject unrepresentable bytes without normalization", () => {
  for (const value of ["!#$%&*()[]{};:,?`'\"\\=+/ @-", " leading", "in\tternal", "ends\\", "café-🔒", "x".repeat(255)]) assert.equal(auth.validSecret(Buffer.from(value)), true);
  for (const value of ["", "x".repeat(256), "bad\0value", "bad\rvalue", "bad\nvalue", "final\n", "final\r\n", "final ", "final\t", "final\v", "final\f", "\uFEFFvalue"]) assert.equal(auth.validSecret(Buffer.from(value)), false);
  assert.equal(auth.validSecret(Buffer.from([0xc0, 0x80])), false);
});
test("external-only import/projection preserves bytes, ACLs and private modes; legacy submission stays restricted", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "smtp-external-store-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const store = createFilesystemSecretStore(path.join(root, "store"), "instance-a"), descriptor = { ref: { resource: "mail", key: "external" }, type: "smtp-external-credential", consumers: ["mail"] };
  const bytes = Buffer.from(" literal $() !#:'\\\" @ / and-🔒");
  assert.throws(() => store.ensure(descriptor, { authorized: true }), { code: "SECRET_IMPORT_REQUIRED" });
  store.import(descriptor, bytes, { authorized: true }); assert.equal(store.read(descriptor.ref, "mail").equals(bytes), true);
  assert.throws(() => store.read(descriptor.ref, "application"), { code: "SECRET_CONSUMER_FORBIDDEN" });
  const destination = path.join(root, "projection/value"); store.materialize(descriptor.ref, "mail", destination); assert.equal(fs.readFileSync(destination).equals(bytes), true); assert.equal(fs.statSync(destination).mode & 0o777, 0o600);
  const legacy = { ...descriptor, type: "smtp-relay-credential", ref: { resource: "mail", key: "submission" } };
  assert.throws(() => store.import(legacy, bytes, { authorized: true }), { code: "SECRET_CORRUPTED" });
  for (const invalid of [Buffer.from("final\n"), Buffer.from("final "), Buffer.from([0xff])]) assert.throws(() => store.import({ ...descriptor, ref: { resource: "mail", key: "invalid" } }, invalid, { authorized: true }), { code: "SMTP_RELAY_CREDENTIAL_INVALID" });
});
test("legacy submission rejects every control byte and whitespace exactly as before", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "smtp-legacy-store-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const store = createFilesystemSecretStore(path.join(root, "store"), "instance-a");
  for (const n of [...Array(33).keys(), 127]) {
    const descriptor = { ref: { resource: "mail", key: "c" + n }, type: "smtp-relay-credential", consumers: ["mail"] };
    assert.throws(() => store.import(descriptor, Buffer.from("before" + String.fromCharCode(n) + "after"), { authorized: true }), { code: "SECRET_CORRUPTED" });
  }
});
test("external SMTP contract separates provider accounts, legacy submission and consumer authority", () => {
  const api = require("../../lib"), { serviceInputs } = require("../support/service-inputs");
  const fixture = () => { const x = serviceInputs(); const ref = { resource: "mail", key: "provider" }; x.spec.secrets.resources.push({ ref, type: "smtp-external-credential", consumers: ["mail"] }); Object.assign(x.spec.mail, { mode: "relay", relay_tls: "required", relay_user: "account@example.invalid", relay_secret_ref: ref }); return x; };
  for (const user of ["simple", "account@example.invalid", "opaque login +/\\"]) { const x = fixture(); x.spec.mail.relay_user = user; assert.equal(api.validateSpec(x.spec, x.requirements).valid, true); }
  for (const mutate of [x => x.spec.mail.submission_user = "internal@example.invalid", x => x.spec.mail.submission_secret_ref = x.spec.mail.relay_secret_ref, x => x.spec.secrets.resources.at(-1).consumers = ["application"], x => x.spec.mail.relay_tls = "none"]) { const x = fixture(); mutate(x); assert.equal(api.validateSpec(x.spec, x.requirements).valid, false); }
});
