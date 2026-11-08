"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const P = require("../../lifecycle/preparation"), A = require("../../lifecycle/activation"), { authorizeRollback } = require("../../internal/rollback-authorization");
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rollback-role-")), project = "role-fixture", revision = "a".repeat(64), failed = "b".repeat(64), image = "sha256:" + "c".repeat(64);
  const services = { application: { image, ports: [{ target: 3101, published: 30001, host_ip: "127.0.0.1", protocol: "tcp" }], volumes: [{ source: root + "/state", target: "/app/state", read_only: false }], labels: { "org.drumee.infra.role": "application" } }, mail: { image, ports: [], volumes: [], labels: {} }, dkim: { image, ports: [], volumes: [], labels: {} } };
  const source = { root, project, instance_id: project, revision, composition: {}, compose: { services } };
  for (const id of [revision, failed]) { fs.mkdirSync(path.join(root, "candidates", id), { recursive: true, mode: 0o700 }); fs.writeFileSync(path.join(root, "candidates", id, "prepared.json"), JSON.stringify({ ...source, revision: id }), { mode: 0o600 }); }
  const observed = ["application", "mail", "dkim"].map((service, i) => ({ id: String(i + 1).repeat(64), name: `/${project}-${service}-1`, owner: project, project, service, image, image_id: image, role: service === "application" ? "application" : "", revision: failed, configured_ports: service === "application" ? { "3101/tcp": [{ HostIp: "127.0.0.1", HostPort: "30001" }] } : {}, ports: {}, mounts: service === "application" ? [{ Source: root + "/state", Destination: "/app/state", RW: true }] : [] }));
  const replacement = test.mock.method(P, "verifyPrepared", value => value); let admitted = 0;
  const driver = { checkImages: () => ({ [image]: image }), authorizeRecoveryNetworks: () => { admitted++; } };
  const run = (context = { authorized: true }) => authorizeRollback(source, observed, { revision }, { phase: "recovery-required", revision: failed, details: { service: "application" } }, context, driver, A.checkObserved);
  return { root, source, observed, run, admitted: () => admitted, cleanup() { replacement.mock.restore(); fs.rmSync(root, { recursive: true, force: true }); } };
}
function run(fn) { const f = fixture(); try { fn(f); } finally { f.cleanup(); } }
test("real-adapter empty infrastructure roles coexist with a required application role", () => run(f => { assert.deepEqual(f.run(), { service: "application" }); assert.equal(f.admitted(), 1); }));
test("only the empty string maps to the already absent role", () => run(f => {
  f.observed[1].role = undefined; f.run();
  for (const role of [null, false, 0, "mail", "application", "unexpected"]) { f.observed[1].role = role; assert.throws(f.run, { code: "RUNTIME_IDENTITY_MISMATCH" }); }
  assert.equal(f.admitted(), 1);
}));
test("a required application role cannot be omitted, emptied or changed", () => run(f => {
  for (const role of [undefined, "", null, false, 0, "mail", "other"]) { f.observed[0].role = role; assert.throws(f.run, { code: "RUNTIME_IDENTITY_MISMATCH" }); }
  assert.equal(f.admitted(), 0);
}));
test("authorization is mandatory before any role equivalence is considered", () => run(f => { for (const context of [null, {}, { authorized: false }, { authorized: 1 }]) assert.throws(() => f.run(context), { code: "ROLLBACK_OPERATION_NOT_AUTHORIZED" }); assert.equal(f.admitted(), 0); }));
for (const service of ["application", "mail", "dkim"]) {
  test(`${service}: owner/project/name/image/image-ID/revision/service differences still refuse`, () => run(f => {
    const resource = f.observed.find(x => x.service === service);
    for (const key of ["owner", "project", "name", "image", "image_id", "revision", "service"]) { const old = resource[key]; resource[key] = "foreign"; assert.throws(f.run, { code: "RUNTIME_IDENTITY_MISMATCH" }); resource[key] = old; }
    assert.equal(f.admitted(), 0);
  }));
}
test("configured and live extra exposure remain refused", () => run(f => {
  const app = f.observed[0]; app.configured_ports["3101/tcp"][0].HostIp = "0.0.0.0";
  assert.throws(f.run, { code: "UNEXPECTED_SERVICE_EXPOSURE" }); app.configured_ports["3101/tcp"][0].HostIp = "127.0.0.1";
  app.ports = { "3101/tcp": [{ HostIp: "0.0.0.0", HostPort: "30001" }] }; assert.throws(f.run, { code: "UNEXPECTED_SERVICE_EXPOSURE" }); assert.equal(f.admitted(), 0);
}));
test("declared mount source and write-permission differences still refuse", () => run(f => {
  const mount = f.observed[0].mounts[0]; mount.Source = "/foreign"; assert.throws(f.run, { code: "RUNTIME_MOUNT_MISMATCH" }); mount.Source = f.root + "/state";
  mount.RW = false; assert.throws(f.run, { code: "RUNTIME_MOUNT_MISMATCH" }); assert.equal(f.admitted(), 0);
}));
