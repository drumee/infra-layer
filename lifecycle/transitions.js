"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const S = require("../lib/spec");
const F = require("../lib/filesystem-safety");
const P = require("./preparation");
const J = require("./journal");
const secrets = require("../capabilities/secrets");
function ledger(root, id) {
  if (!/^[a-f0-9]{32}$/.test(id || "")) F.fail("INVALID_ROTATION_ID");
  let value; try { value = JSON.parse(F.read(path.join(root, "rotations", id, "rotation.json"))); } catch (_) { F.fail("SECRET_ROTATION_STATE_CORRUPTED"); }
  if (!S.plainTree(value) || value.id !== id || !secrets.validRef(value.ref) || !/^[a-f0-9]{64}$/.test(value.previous_fingerprint || "") || !/^[a-f0-9]{64}$/.test(value.candidate_fingerprint || "")) F.fail("SECRET_ROTATION_STATE_CORRUPTED"); return value;
}
function pending(root) { const file = path.join(root, "pending-rotation.json"); if (!fs.existsSync(file)) return null; let value; try { value = JSON.parse(F.read(file)); } catch (_) { F.fail("SECRET_ROTATION_STATE_CORRUPTED"); } return ledger(root, value.id); }
function clonePrivateStore(source, destination) {
  F.privateDirectory(source); F.privateDirectory(destination, true);
  for (const name of fs.readdirSync(source)) {
    const src = path.join(source, name), dst = path.join(destination, name), stat = fs.lstatSync(src);
    if (stat.isDirectory() && !stat.isSymbolicLink()) clonePrivateStore(src, dst);
    else F.atomic(dst, F.read(src), 0o600, true);
  }
}
function allowTransition(active, prepared, context) {
  const record = pending(prepared.root); if (!record || context.rotation_id !== record.id || record.project !== prepared.project || !["redis-auth"].includes(record.type)) F.fail("SECRET_TRANSITION_NOT_AUTHORIZED");
  if (![record.previous_revision, record.candidate_revision].includes(prepared.revision) || active && ![record.previous_revision, record.candidate_revision].includes(active.revision)) F.fail("SECRET_TRANSITION_NOT_AUTHORIZED");
  const expected = record.candidate_revision === prepared.revision ? record.candidate_fingerprint : record.previous_fingerprint;
  if (prepared.fingerprints.find((value) => S.serialize(value.ref) === S.serialize(record.ref))?.fingerprint !== expected) F.fail("SECRET_TRANSITION_NOT_AUTHORIZED"); return record;
}
async function rotateSecret(root, operation, context) {
  const A = require("./activation"); const active = A.readActive(root);
  if (!active || context?.authorized !== true || operation?.authorized !== true || !secrets.validRef(operation.ref) || !/^[a-f0-9]{64}$/.test(operation.expected_fingerprint || "") || !S.identifier(operation.consumer_transition)) F.fail("SECRET_ROTATION_NOT_AUTHORIZED");
  const source = active.prepared; const composition = source.composition; let record;
  await F.lockAsync(root, async () => {
    P.verifyPrepared(source, context); if (pending(root)) F.fail("SECRET_ROTATION_RECOVERY_REQUIRED");
    const state = await A.inspectDeployment(root, context); if (!state.ready) F.fail("VERIFIED_ACTIVE_DEPLOYMENT_REQUIRED");
    const descriptor = composition.plan.required_secrets.find((value) => S.serialize(value.ref) === S.serialize(operation.ref));
    if (!descriptor || descriptor.type !== "redis-auth") F.fail("SECRET_ROTATION_PROVIDER_UNSUPPORTED");
    const consumers = P.projectionRecords(composition).filter((value) => S.serialize(value.ref) === S.serialize(operation.ref));
    if (descriptor.consumers.some((consumer) => !consumers.some((value) => value.consumer === consumer))) F.fail("SECRET_CONSUMER_TRANSITION_UNDEFINED");
    const store = secrets.createFilesystemSecretStore(path.join(root, "secrets"), composition.instance_id); if (store.inspect(operation.ref).fingerprint !== operation.expected_fingerprint) F.fail("SECRET_ROTATION_NOT_AUTHORIZED");
    const id = crypto.randomBytes(16).toString("hex"); const directory = path.join(root, "rotations", id); F.privateDirectory(directory, true);
    clonePrivateStore(path.join(root, "secrets"), path.join(directory, "secrets"));
    const staged = secrets.createFilesystemSecretStore(path.join(directory, "secrets"), composition.instance_id); const generated = staged.rotate(descriptor, { authorized: true, expected_fingerprint: operation.expected_fingerprint, consumer_transition: operation.consumer_transition });
    record = { id, ref: operation.ref, type: descriptor.type, project: source.project, previous_revision: source.revision, previous_fingerprint: operation.expected_fingerprint, candidate_fingerprint: generated.fingerprint, consumers: [...new Set(consumers.map((value) => value.service))], transitioned: [], status: "prepared", active_generation: "previous", pending_cleanup: true };
    F.atomic(path.join(directory, "rotation.json"), JSON.stringify(record)); F.atomic(path.join(root, "pending-rotation.json"), JSON.stringify({ id }), 0o600, true); J.append(root, "rotation-intent", source.revision, { resource: descriptor.ref.resource, consumers: record.consumers });
  });
  const next_context = { ...context, rotation_id: record.id, secret_store: path.join(root, "rotations", record.id, "secrets") };
  try {
    const candidate = await P.prepareDeployment(composition, next_context); record.candidate_revision = candidate.revision; record.status = "transitioning"; F.atomic(path.join(root, "rotations", record.id, "rotation.json"), JSON.stringify(record));
    await A.activateDeployment(candidate, next_context); return await finishRotation(root, record.id, next_context);
  } catch (error) {
    record.status = "failed"; record.code = A.safeCode(error); F.atomic(path.join(root, "rotations", record.id, "rotation.json"), JSON.stringify(record)); J.append(root, "rotation-failed", source.revision, { code: record.code });
    try { await A.activateDeployment(source, { ...context, rotation_id: record.id, recover: true }); fs.unlinkSync(path.join(root, "pending-rotation.json")); } catch (_) { F.fail("SECRET_ROTATION_RECOVERY_REQUIRED"); }
    F.fail("SECRET_ROTATION_FAILED_PREVIOUS_GENERATION_RESTORED");
  }
}
async function finishRotation(root, id, context) {
  const A = require("./activation"); const record = ledger(root, id); const active = A.readActive(root);
  if (context?.authorized !== true || context.rotation_id !== id || !active || active.revision !== record.candidate_revision) F.fail("SECRET_ROTATION_RECOVERY_REQUIRED");
  return F.lockAsync(root, async () => {
    const state = await A.inspectDeployment(root, { ...context, allow_pending_rotation: true }); if (!state.ready) F.fail("SECRET_ROTATION_RECOVERY_REQUIRED");
    const canonical = path.join(root, "secrets", record.ref.resource, record.ref.key); const staged = path.join(root, "rotations", id, "secrets", record.ref.resource, record.ref.key);
    const current = JSON.parse(F.read(path.join(staged, "current.json"))); const source_file = path.join(staged, current.generation + ".secret"); const destination = path.join(canonical, current.generation + ".secret");
    const observed = secrets.createFilesystemSecretStore(path.join(root, "secrets"), active.prepared.instance_id).inspect(record.ref).fingerprint;
    if (![record.previous_fingerprint, record.candidate_fingerprint].includes(observed)) F.fail("CONCURRENT_SECRET_ROTATION_DETECTED");
    if (!fs.existsSync(destination)) F.atomic(destination, F.read(source_file), 0o600, true);
    F.atomic(path.join(canonical, "current.json"), F.read(path.join(staged, "current.json")));
    record.status = "committed"; record.active_generation = "candidate"; record.transitioned = [...record.consumers]; F.atomic(path.join(root, "rotations", id, "rotation.json"), JSON.stringify(record));
    fs.unlinkSync(path.join(root, "pending-rotation.json")); J.append(root, "rotation-active", active.revision, { resource: record.ref.resource, consumers: record.consumers }); return { id, status: record.status, active_fingerprint: record.candidate_fingerprint, previous_fingerprint: record.previous_fingerprint, consumers: record.consumers, transitioned: record.transitioned, pending_cleanup: true };
  });
}
async function renewDeployment(root, context) {
  const A = require("./activation"); const active = A.readActive(root); if (!active || context?.authorized !== true || active.prepared.composition.plan.inputs.spec.tls?.provider !== "local") F.fail("RENEWAL_OPERATION_NOT_AUTHORIZED");
  const candidate = await P.prepareDeployment(active.prepared.composition, { ...context, renew_certificate: true });
  if (candidate.certificate.ca_fingerprint !== active.prepared.certificate.ca_fingerprint) F.fail("TLS_TRUST_ANCHOR_CHANGED");
  try { return await A.activateDeployment(candidate, context); } catch (_) { await A.activateDeployment(active.prepared, { ...context, recover: true }); F.fail("RENEWAL_FAILED_PREVIOUS_CERTIFICATE_RETAINED"); }
}
function renewalTrigger(root, context, now = Date.now()) {
  if (context?.authorized !== true || !Number.isFinite(now)) F.fail("RENEWAL_OPERATION_NOT_AUTHORIZED");
  const file = path.join(root, "renewal.json"); if (!fs.existsSync(file)) return { applicable: false, automatic: false };
  let schedule; try { schedule = JSON.parse(F.read(file)); } catch (_) { F.fail("RENEWAL_STATE_CORRUPTED"); }
  if (!S.plainTree(schedule) || !/^[a-f0-9]{64}$/.test(schedule.revision || "") || !/^[A-F0-9:]{95}$/.test(schedule.fingerprint || "") || !Number.isFinite(Date.parse(schedule.expires_at)) || !Number.isInteger(schedule.renew_before_days) || schedule.renew_before_days < 1 || schedule.renew_before_days > 365 || schedule.scheduler !== "distribution-trigger-required") F.fail("RENEWAL_STATE_CORRUPTED");
  const due = Date.parse(schedule.expires_at) - now <= schedule.renew_before_days * 86400000;
  if (due) J.append(root, "renewal-due", schedule.revision, { code: "CERTIFICATE_RENEWAL_REQUIRED" });
  return { applicable: true, due, expired: Date.parse(schedule.expires_at) <= now, automatic: false, scheduler: "distribution-trigger-required", fingerprint: schedule.fingerprint };
}
async function resumeSecretRotation(root, id, context) {
  const A = require("./activation"); const record = ledger(root, id); if (context?.authorized !== true || pending(root)?.id !== id) F.fail("SECRET_ROTATION_RECOVERY_REQUIRED");
  const source = JSON.parse(F.read(path.join(root, "candidates", record.previous_revision, "prepared.json")));
  const selected = { ...context, rotation_id: id, secret_store: path.join(root, "rotations", id, "secrets"), recover: true };
  const candidate = record.candidate_revision ? JSON.parse(F.read(path.join(root, "candidates", record.candidate_revision, "prepared.json"))) : await P.prepareDeployment(source.composition, selected);
  record.candidate_revision = candidate.revision; record.status = "transitioning"; F.atomic(path.join(root, "rotations", id, "rotation.json"), JSON.stringify(record));
  await A.activateDeployment(candidate, selected); return finishRotation(root, id, selected);
}
module.exports = { rotateSecret, finishRotation, resumeSecretRotation, renewDeployment, renewalTrigger, allowTransition, pending };
