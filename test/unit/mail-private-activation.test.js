"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), crypto = require("node:crypto");
const M = require("../../capabilities/mail-service"), P = require("../../capabilities/mail-service/private"), V = require("../../capabilities/mail-service/validation");
const example = require("../../docs/mail-01/examples/service.valid.json");
function fixture(change = () => {}) {
  const spec = structuredClone(example);
  spec.networks.private_submission.allowed_sources = ["172.30.250.10/32", "172.30.250.11/32"];
  change(spec);
  const normalized = M.validateMailService(spec).normalized;
  const approval = { contract: "drumee.mail-private-activation/1", mode: "private", approval_id: crypto.randomUUID(), target_hostname: "mail06-qualification", machine_id: "a".repeat(32), docker_version: "29.9.2", transport_digest: V.digest(normalized), ca_sha256: "b".repeat(64), storage: { root: normalized.deployment.root, uuid: crypto.randomUUID(), root_dev: 1, root_ino: 2, filesystem: "ext4" }, smtp_destinations: ["10.245.47.54"] };
  return { spec: normalized, approval, plan: M.planMailService(spec) };
}
test("private activation binds the declared configuration and publishes no public listener", () => {
  const f = fixture(), compose = M.composeMailService(f.plan, { activation: f.approval });
  assert.deepEqual(compose.services.postfix.ports.map(p => p.target), [1587]);
  assert.equal(compose.services.dovecot.ports, undefined);
  assert.equal(compose.networks.control.internal, true);
  assert.throws(() => M.composeMailService(f.plan, { activation: f.approval, acceptance: true }), /PRIVATE_APPROVAL_MISMATCH/);
  assert.throws(() => P.specApproval(f.spec, { ...f.approval, transport_digest: "0".repeat(64) }), /PRIVATE_CONFIGURATION_MISMATCH/);
});
test("private activation refuses public listeners, broad client grants and public egress destinations", () => {
  for (const name of ["smtp25", "submission587", "submissions465", "imaps993"]) {
    const f = fixture(spec => { spec.listeners[name].enabled = true; });
    assert.throws(() => M.composeMailService(f.plan, { activation: f.approval }), /PRIVATE_PUBLIC_LISTENER_FORBIDDEN/);
  }
  const broad = fixture(spec => { spec.networks.private_submission.allowed_sources = ["172.30.250.0/24"]; });
  assert.throws(() => M.composeMailService(broad.plan, { activation: broad.approval }), /PRIVATE_ALLOCATION_INVALID/);
  const f = fixture();
  assert.throws(() => P.specApproval(f.spec, { ...f.approval, smtp_destinations: ["8.8.8.8"] }), /PRIVATE_DESTINATION_INVALID/);
  assert.throws(() => P.specApproval(f.spec, { ...f.approval, docker_version: "26.1.5" }), /PRIVATE_DOCKER_UNQUALIFIED/);
});
test("private egress filter is sealed into the entrypoint and never permits external SMTP", () => {
  const f = fixture(), artifacts = P.artifacts(f.plan.artifacts, f.approval);
  assert.match(artifacts["postfix-entrypoint.sh"], /nft -f \/source\/private-egress\.nft/);
  assert.match(artifacts["private-egress.nft"], /10\.245\.47\.54/);
  assert.match(artifacts["private-egress.nft"], /tcp dport \{ 25, 465, 587 \} counter drop/);
  assert.throws(() => P.trust(f.approval, Buffer.from("wrong CA")), /PRIVATE_TRUST_MISMATCH/);
});
