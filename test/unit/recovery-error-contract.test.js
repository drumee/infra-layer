"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const { fixture } = require("../support/rollback-boundary-fixture.cjs"), R = require("../../lifecycle/recovery"), A = require("../../lifecycle/activation"), J = require("../../lifecycle/journal");
const recreated = f => f.calls.some(call => call.operation === "compose" && call.args[0] === "up");
async function run(body) { const f = fixture(); try { await body(f); } finally { f.cleanup(); } }
test("E1 D1/D16 unauthorized caller gets no active-state or runtime-identity details", () => run(async f => {
  fs.writeFileSync(path.join(f.root, "active.json"), "private-invalid-active-state"); f.resource.owner = "foreign"; f.context.authorized = false;
  await assert.rejects(f.run, error => error.code === "ROLLBACK_OPERATION_NOT_AUTHORIZED" && error.message === "ROLLBACK_OPERATION_NOT_AUTHORIZED"); assert.deepEqual(f.calls, []); assert.equal(recreated(f), false);
}));
test("E1 D2 absent caller context is refused before state observation", () => run(async f => {
  fs.writeFileSync(path.join(f.root, "active.json"), "invalid-active-state");
  await assert.rejects(() => R.rollbackDeployment(f.root, f.prepared.revision), { code: "ROLLBACK_OPERATION_NOT_AUTHORIZED" }); assert.deepEqual(f.calls, []);
}));
test("E1 D3/D23 authorized unknown runtime revision is identity failure before eligibility", () => run(async f => {
  f.resource.revision = "foreign"; await assert.rejects(f.run, { code: "RUNTIME_IDENTITY_MISMATCH" }); assert.equal(recreated(f), false); assert.equal(f.calls.some(call => call.operation === "recovery-network"), false);
}));
test("E1 D8 authorized wrong runtime service retains identity refusal", () => run(async f => {
  f.resource.service = "foreign"; await assert.rejects(f.run, { code: "RUNTIME_IDENTITY_MISMATCH" }); assert.equal(recreated(f), false);
}));
test("E1 D24 missing journal scope precedes an identity defect", () => run(async f => {
  f.resource.owner = "foreign"; J.append(f.root, "recovery-required", f.broken.revision, { code: "DOCKER_LIFECYCLE_COMMAND_FAILED" });
  await assert.rejects(f.run, { code: "ROLLBACK_OPERATION_NOT_AUTHORIZED" }); assert.equal(recreated(f), false); assert.equal(f.calls.some(call => call.operation === "recovery-network"), false);
}));
test("E1 D24 unknown journal service refuses authority without runtime details", () => run(async f => {
  f.resource.revision = "foreign"; J.append(f.root, "recovery-required", f.broken.revision, { code: "DOCKER_LIFECYCLE_COMMAND_FAILED", service: "foreign" });
  await assert.rejects(f.run, { code: "ROLLBACK_OPERATION_NOT_AUTHORIZED" }); assert.equal(recreated(f), false);
}));
test("E1 D24 authorized valid identity without failed-target eligibility remains refused", () => run(async f => {
  f.resource.revision = f.prepared.revision; await assert.rejects(f.run, { code: "ROLLBACK_OPERATION_NOT_AUTHORIZED" }); assert.equal(recreated(f), false);
}));
test("E1 D4/D5 correct scoped identity still reaches recreation and final strict readiness", () => run(async f => {
  assert.equal((await f.run()).ready, true); assert.equal(recreated(f), true);
  const admission = f.calls.findIndex(call => call.operation === "recovery-network"), up = f.calls.findIndex(call => call.operation === "compose" && call.args[0] === "up");
  assert.ok(admission >= 0 && admission < up); assert.ok(f.calls.findIndex((call, index) => index > up && call.operation === "strict-network") > up);
}));
test("E1 D18 actual Docker adapter inspection failure is neither authority nor identity refusal", () => run(async f => {
  f.inspectionFailure = true; await assert.rejects(f.run, error => error.code === "DOCKER_LIFECYCLE_COMMAND_FAILED" && !error.message.includes("controlled")); assert.equal(recreated(f), false);
}));
test("E1 D21 healthy ordinary activation remains strict and can return no-op", () => run(async f => {
  await f.run(); f.calls.length = 0; const result = await A.activateDeployment(f.prepared, f.context);
  assert.equal(result.ready, true); assert.equal(result.effect, "no-op"); assert.equal(f.calls.some(call => call.operation === "recovery-network"), false); assert.equal(recreated(f), false);
}));
test("E1 D17/D22 ordinary recovery invocations cannot inherit rollback admission", () => run(async f => {
  await assert.rejects(f.normal, { code: "NETWORK_ATTACHMENT_MISMATCH" }); assert.equal(f.calls.some(call => call.operation === "recovery-network"), false); assert.equal(recreated(f), false);
}));
