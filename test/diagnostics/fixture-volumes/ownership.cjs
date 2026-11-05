"use strict";
const compareOrdinal = (a, b) => a < b ? -1 : a > b ? 1 : 0;
// Test-only contract. The manifest and receipts are trusted attempt-local evidence,
// not labels supplied by an arbitrary resource or a defence against Docker admins.
const crypto = require("node:crypto");
function fail(code) { throw Object.assign(new Error(code), { code }); }
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort(compareOrdinal).map(k => [k, canonical(value[k])]));
  return value;
}
function digest(value) { return crypto.createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex"); }
function volumeIdentity(v) {
  return { name: v.Name, driver: v.Driver, scope: v.Scope, created: v.CreatedAt,
    labels: v.Labels || {}, options_hash: digest(v.Options || {}), mountpoint_hash: digest(v.Mountpoint) };
}
function timestamp(value) { return typeof value === "string" && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value; }
function assess(manifest, request, observation, removals = []) {
  if (!request || request.type !== "volume" || request.action !== "remove-exact" || typeof request.name !== "string") fail("UNAPPROVED_RESOURCE_ACTION");
  if (!manifest || manifest.version !== 1 || manifest.type !== "V1_CURRENT_ATTEMPT" || !manifest.attempt || !timestamp(manifest.started) || !Array.isArray(manifest.volumes)) fail("INVALID_MANIFEST");
  const entries = manifest.volumes.filter(v => v.name === request.name);
  if (entries.length !== 1) fail(entries.length ? "AMBIGUOUS_IDENTITY" : "NOT_IN_CURRENT_MANIFEST");
  const entry = entries[0], receipt = entry.creation;
  if (entry.type !== "volume" || entry.attempt !== manifest.attempt || !receipt || receipt.operation !== "volume.create" || receipt.exit_code !== 0 || receipt.name !== entry.name || receipt.attempt !== manifest.attempt || !receipt.nonce || receipt.nonce !== entry.nonce || !timestamp(receipt.started) || !timestamp(receipt.ended) || receipt.started < manifest.started || receipt.ended < receipt.started || !entry.fingerprint) fail("CREATION_EVIDENCE_MISMATCH");
  if (!manifest.daemon || !manifest.daemon.id || manifest.daemon.context !== "default" || manifest.daemon.endpoint !== "unix:///var/run/docker.sock" || digest(receipt.daemon) !== digest(manifest.daemon)) fail("CREATION_DAEMON_MISMATCH");
  if (!observation || observation.error) fail("INSPECTION_FAILED");
  if (digest(observation.daemon) !== digest(manifest.daemon)) fail("DAEMON_CONTEXT_MISMATCH");
  if (!Array.isArray(observation.consumers)) fail("CONSUMER_EVIDENCE_MISSING");
  if (!observation.volume) {
    if (observation.consumers.length) fail("INCONSISTENT_ABSENT_VOLUME");
    if (removals.some(r => r.name === entry.name && r.fingerprint === entry.fingerprint && r.attempt === manifest.attempt && r.verified_absent === true)) return { disposition: "ALREADY_REMOVED", entry };
    fail("ABSENT_WITHOUT_DELETION_EVIDENCE");
  }
  const v = observation.volume, labels = v.labels;
  if (!labels || labels["org.drumee.qualification"] !== manifest.attempt || labels["org.drumee.infra.owner"] !== manifest.attempt || labels["org.drumee.volume.nonce"] !== entry.nonce) fail("OWNERSHIP_LABEL_MISMATCH");
  if (v.name !== entry.name || digest(v) !== entry.fingerprint) fail("VOLUME_IDENTITY_MISMATCH");
  if (entry.disposition === "retain") return { disposition: "RETAIN", entry };
  if (entry.disposition !== "disposable") fail("RETENTION_UNDETERMINED");
  if (observation.consumers.length) fail("VOLUME_IN_USE");
  return { disposition: "ELIGIBLE", entry };
}
function cleanup(manifest, request, io, removals) {
  // Both reads include daemon identity, exact volume metadata and all containers.
  const initial = assess(manifest, request, io.observe(request.name), removals);
  if (initial.disposition !== "ELIGIBLE") return initial.disposition;
  const fresh = assess(manifest, request, io.observe(request.name), removals);
  if (fresh.disposition !== "ELIGIBLE") fail("STATE_CHANGED_BEFORE_REMOVE");
  // Non-force, exact-name Docker removal is also required to refuse a racing mount.
  if (io.removeExact(request.name) !== request.name) fail("REMOVAL_RESULT_MISMATCH");
  const after = io.observe(request.name);
  if (after.error || digest(after.daemon) !== digest(manifest.daemon) || after.volume || !Array.isArray(after.consumers) || after.consumers.length) fail("REMOVAL_NOT_VERIFIED");
  removals.push({ name: request.name, attempt: manifest.attempt, fingerprint: initial.entry.fingerprint, verified_absent: true });
  return "REMOVED";
}
function outcome(primary, cleanupErrors, required, removals) {
  return { primary_error: primary ? primary.code || primary.message : null,
    cleanup_errors: cleanupErrors.map(e => e.code || e.message),
    cleanup: cleanupErrors.length || required.some(name => !removals.some(r => r.name === name && r.verified_absent)) ? "INCOMPLETE" : "PASS",
    campaign: primary || cleanupErrors.length || required.some(name => !removals.some(r => r.name === name && r.verified_absent)) ? "FAIL" : "PASS" };
}
module.exports = { assess, cleanup, outcome, digest, volumeIdentity };
