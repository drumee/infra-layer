"use strict";
// Passive diagnostic output only. No comparator/test inputs or outcomes change.
const fs = require("node:fs"), path = require("node:path");
const LIMIT = 131072, STRING = 8192;
function text(value) {
  const source = String(value);
  const result = source.slice(0, STRING).replace(/\b(password|token|secret|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]");
  return source.length > STRING ? result + "[TRUNCATED original_chars=" + source.length + "]" : result;
}
function error(value, depth = 0) {
  if (!value || depth > 3) return value ? "[Cause bound]" : null;
  return { name: text(value.name), code: value.code === undefined ? null : text(value.code), message: text(value.message), stack: value.stack === undefined ? null : text(value.stack), cause: value.cause ? error(value.cause, depth + 1) : null, exitCode: value.exitCode ?? null, signal: value.signal ?? null, failureType: value.failureType ?? null };
}
let descriptor, bytes = 0, sequence = 0, bounded = false;
function mark(kind, details = {}) {
  const directory = process.env.D1_CAPTURE_DIR;
  if (!directory) throw new Error("D1_CAPTURE_DIR_REQUIRED");
  if (descriptor === undefined) descriptor = fs.openSync(path.join(directory, "process-" + process.pid + ".jsonl"), "wx", 0o600);
  const record = JSON.stringify({ seq: ++sequence, pid: process.pid, ppid: process.ppid, kind, ...details }) + "\n";
  if (bytes + Buffer.byteLength(record) > LIMIT) {
    if (!bounded) fs.writeSync(descriptor, JSON.stringify({ pid: process.pid, kind: "CAPTURE_BOUND_REACHED" }) + "\n");
    bounded = true; return;
  }
  bytes += fs.writeSync(descriptor, record);
}
function observeError(kind, cause) {
  try { mark(kind, { error: error(cause) }); }
  catch (collectionError) {
    process.exitCode = 1;
    // The original error remains primary even when its sidechannel fails.
    // A fallback failure aborts with that same error; missing evidence cannot
    // be treated as successful collection by the recorder/reviewer.
    try { fs.writeSync(2, "D1_COLLECTION_ERROR " + JSON.stringify({ original: error(cause), collection: error(collectionError) }) + "\n"); }
    catch { throw cause; }
  }
}
module.exports = { mark, observeError, error, text, LIMIT, STRING };
