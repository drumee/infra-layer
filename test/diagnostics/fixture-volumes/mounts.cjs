"use strict";
const compareOrdinal = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const assert = require("node:assert/strict"), { digest } = require("./ownership.cjs");
const legacyFields = ["type", "name", "destination"];
const fields = [...legacyFields, "source_hash", "driver", "rw", "mode", "propagation"];
function invalid() { throw Object.assign(new Error("INVALID_MOUNT_EVIDENCE"), { code: "INVALID_MOUNT_EVIDENCE" }); }
function validate(m, schema) {
  if (!m || typeof m !== "object" || Array.isArray(m) || Object.keys(m).sort(compareOrdinal).join() !== schema.slice().sort(compareOrdinal).join()) invalid();
  if (typeof m.type !== "string" || !m.type || typeof m.destination !== "string" || !m.destination.startsWith("/")) invalid();
  if (m.type === "volume" ? typeof m.name !== "string" || !m.name : m.name !== null) invalid();
  if (schema === fields && (typeof m.source_hash !== "string" || !/^[a-f0-9]{64}$/.test(m.source_hash) || typeof m.rw !== "boolean" || typeof m.mode !== "string" || typeof m.propagation !== "string" || (m.type === "volume" ? typeof m.driver !== "string" || !m.driver : m.driver !== null))) invalid();
}
function projectMount(m) {
  if (!m || typeof m !== "object" || typeof m.Source !== "string" || ((m.Type === "volume" || m.Type === "bind") && !m.Source)) invalid();
  const record = { type: m.Type, name: m.Type === "volume" ? m.Name : null, destination: m.Destination,
    source_hash: digest(m.Source), driver: m.Type === "volume" ? m.Driver : null, rw: m.RW, mode: m.Mode, propagation: m.Propagation };
  validate(record, fields); return record;
}
function keys(mounts, schema) {
  if (!Array.isArray(mounts)) invalid();
  return Array.from(mounts, m => { validate(m, schema); return JSON.stringify(schema.map(k => m[k])); });
}
function compare(expected, observed, schema) {
  const want = keys(expected, schema), got = keys(observed, schema);
  const counts = list => { const map = new Map(); for (const k of list) map.set(k, (map.get(k) || 0) + 1); return map; };
  const a = counts(want), b = counts(got), missing = [], additional = [];
  for (const k of [...new Set([...a.keys(), ...b.keys()])].sort(compareOrdinal)) {
    const expectedCount = a.get(k) || 0, observedCount = b.get(k) || 0;
    const entry = { mount_hash: digest(k), expected_count: expectedCount, observed_count: observedCount };
    if (expectedCount > observedCount) missing.push(entry);
    if (observedCount > expectedCount) additional.push(entry);
  }
  if (missing.length || additional.length) {
    // Values (including host paths) stay out of bounded diagnostics. Complete
    // records remain in the caller's evidence in their original observed order.
    const changed = new Set();
    if (missing.length === 1 && additional.length === 1) {
      const left = [...a.keys()].filter(k => (a.get(k) || 0) > (b.get(k) || 0));
      const right = [...b.keys()].filter(k => (b.get(k) || 0) > (a.get(k) || 0));
      const x = JSON.parse(left[0]), y = JSON.parse(right[0]);
      schema.forEach((field, j) => { if (x[j] !== y[j]) changed.add(field); });
    }
    const details = { missing: missing.slice(0, 8), additional: additional.slice(0, 8), missing_identities: missing.length, additional_identities: additional.length, changed_fields: [...changed].sort(compareOrdinal) };
    throw Object.assign(new Error("MOUNT_MULTISET_MISMATCH " + JSON.stringify(details)), { code: "MOUNT_MULTISET_MISMATCH", details });
  }
}
function assertMountsEqual(expected, observed) { compare(expected, observed, fields); }
function inventory(expected, observed, schema) {
  if (!expected || !observed || !Array.isArray(expected.containers) || !Array.isArray(observed.containers)) invalid();
  const withoutMounts = value => ({ ...value, containers: value.containers.map(c => ({ ...c, mounts: [] })) });
  assert.deepEqual(withoutMounts(observed), withoutMounts(expected));
  expected.containers.forEach((c, i) => compare(c.mounts, observed.containers[i].mounts, schema));
}
function assertInventoryEqual(expected, observed) { inventory(expected, observed, fields); }
// Explicit replay only: historical evidence never contained current access or
// source fields. The campaign cannot implicitly downgrade incomplete records.
function assertHistoricalInventoryEqual(expected, observed) { inventory(expected, observed, legacyFields); }
module.exports = { projectMount, assertMountsEqual, assertInventoryEqual, assertHistoricalInventoryEqual };
