"use strict";
const fs = require("node:fs");
const path = require("node:path");
const S = require("../lib/spec");
const F = require("../lib/filesystem-safety");
const phases = new Set(["prepared", "activation-intent", "native-valid", "service-started", "job-completed", "functional-verified", "active", "activation-failed", "recovery-required", "stopped", "backup-intent", "backup-completed", "backup-failed", "restore-prepared", "rotation-intent", "rotation-active", "rotation-failed", "renewal-due"]);
function readJournal(root) {
  const directory = path.join(root, "journal"); if (!fs.existsSync(directory)) return [];
  F.privateDirectory(directory); const files = fs.readdirSync(directory).sort(); const entries = []; let previous = "0".repeat(64);
  for (let index = 0; index < files.length; index++) {
    if (files[index] !== String(index + 1).padStart(8, "0") + ".json") F.fail("LIFECYCLE_JOURNAL_CORRUPTED");
    let entry; try { entry = JSON.parse(F.read(path.join(directory, files[index]))); } catch (_) { F.fail("LIFECYCLE_JOURNAL_CORRUPTED"); }
    const { digest, ...body } = entry;
    if (!S.plainTree(entry) || digest !== S.digest(body) || entry.previous !== previous || entry.sequence !== index + 1 || !phases.has(entry.phase)) F.fail("LIFECYCLE_JOURNAL_CORRUPTED");
    entries.push(entry); previous = digest;
  }
  return entries;
}
function append(root, phase, revision, details = {}) {
  if (!phases.has(phase) || !/^[a-f0-9]{64}$/.test(revision || "") || !S.plainTree(details) || Object.keys(details).some((key) => !["service", "code", "prior_revision", "attestation_digest", "backup_id", "resource", "consumers"].includes(key))) F.fail("INVALID_JOURNAL_EVENT");
  if (Object.entries(details).some(([key, value]) => key === "consumers" ? !Array.isArray(value) || value.some((item) => !S.identifier(item)) : typeof value !== "string" || !/^[a-zA-Z0-9_.-]{1,128}$/.test(value))) F.fail("INVALID_JOURNAL_EVENT");
  const entries = readJournal(root); const directory = path.join(root, "journal"); F.privateDirectory(directory, true);
  const body = { sequence: entries.length + 1, previous: entries.at(-1)?.digest || "0".repeat(64), phase, revision, timestamp: new Date().toISOString(), details };
  const entry = { ...body, digest: S.digest(body) }; F.atomic(path.join(directory, String(body.sequence).padStart(8, "0") + ".json"), JSON.stringify(entry), 0o600, true); return entry;
}
module.exports = { readJournal, append };
