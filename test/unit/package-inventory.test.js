"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
const { validatePackageInventory } = require("../support/package-inventory.cjs");
const root = path.resolve(__dirname, "../.."), helper = "internal/rollback-authorization.js";
const inventory = JSON.parse(execFileSync(trustedExecutable("npm"), ["pack", "--dry-run", "--json"], { cwd: root, encoding: "utf8", env: trustedEnvironment() }))[0].files;
function audit(files = inventory, overrides = {}) { return validatePackageInventory(files, name => Object.hasOwn(overrides, name) ? overrides[name] : fs.readFileSync(path.join(root, name), "utf8")); }
function refused(fn, reason) { assert.throws(fn, error => error.code === "ERR_ASSERTION" && reason.test(error.message)); }
test("K1 E1 required R5 helper has explicit authorization", () => { assert.deepEqual(audit([{ path: helper }, { path: "lib/smtp-auth.js" }], { [helper]: "module.exports = {};", "lib/smtp-auth.js": "" }), []); });
test("K1 E2 actual npm inventory contains required helper", () => { assert.ok(inventory.some(entry => entry.path === helper)); audit(); });
test("K1 E3 helper dependency closure includes filesystem and preparation", () => { const edges = audit(); for (const name of ["lib/filesystem-safety.js", "lifecycle/preparation.js"]) assert.ok(edges.some(edge => edge.from === helper && edge.to === name)); });
test("K1 E4 existing internal modules remain explicitly approved", () => { for (const name of ["internal/system-tools.js", "internal/network-readiness.js"]) audit([{ path: helper }, { path: name }, { path: "lib/smtp-auth.js" }], { [helper]: "", [name]: "", "lib/smtp-auth.js": "" }); });
test("K1 E5 full normal inventory and bounded computed closure pass", () => { const edges = audit(); for (const name of ["dns", "database", "redis", "mail"]) assert.ok(edges.some(edge => edge.request === "bounded capability dispatch" && edge.to === "capabilities/" + name + "/index.js")); });
test("K1 E6 unknown internal helper is refused", () => { refused(() => audit([...inventory, { path: "internal/unapproved-helper.js" }]), /Unexpected package member/); });
test("K1 E7 nested internal module is refused", () => { refused(() => audit([...inventory, { path: "internal/nested/helper.js" }]), /Unexpected package member/); });
test("K1 E8 missing required helper is refused", () => { refused(() => audit(inventory.filter(entry => entry.path !== helper)), /Required package member missing: internal\/rollback-authorization\.js/); });
test("K1 E9 missing transitive dependency is refused", () => { refused(() => audit(inventory.filter(entry => entry.path !== "lib/filesystem-safety.js")), /Required package dependency missing: .*filesystem-safety/); });
test("K1 E10 packaged test fixture is refused", () => { refused(() => audit([...inventory, { path: "test/fixture.js" }]), /Unexpected package member/); });
test("K1 E11 sensitive contents remain refused", () => { for (const value of ["-----BEGIN PRIVATE KEY-----", "isolated-fixture-password"]) assert.throws(() => audit(inventory, { [helper]: value }), { code: "ERR_ASSERTION", operator: "doesNotMatch" }); });
test("K1 E12 undeclared external import remains refused", () => { refused(() => audit(inventory, { [helper]: 'require("unapproved-runtime-package");' }), /Undeclared production import/); });
test("K1 E13 unexpected package path is refused", () => { refused(() => audit([...inventory, { path: "temporary-debug.txt" }]), /Unexpected package member/); });
test("K1 E14 filesystem presence cannot replace actual archive membership", () => { assert.ok(fs.existsSync(path.join(root, helper))); refused(() => audit(inventory.filter(entry => entry.path !== helper)), /Required package member missing/); });
test("K1 E15 failed package assertion is fatal in a child process", () => {
  const program = 'require(process.argv[1]).validatePackageInventory([{path:"internal/rollback-authorization.js"},{path:"lib/smtp-auth.js"},{path:"internal/unapproved-helper.js"}],()=>"");';
  const child = spawnSync(trustedExecutable(process.execPath), ["-e", program, path.join(root, "test/support/package-inventory.cjs")], { encoding: "utf8", env: trustedEnvironment() });
  assert.equal(child.status, 1); assert.equal(child.signal, null); assert.match(child.stderr, /Unexpected package member/);
});

test("SMTP serializer is a required actual archive member", () => { refused(() => audit(inventory.filter(entry => entry.path !== "lib/smtp-auth.js")), /Required package member missing: lib\/smtp-auth/); });
