"use strict";
const fs = require("node:fs");
function readReady(expected) {
  if (!fs.existsSync(expected.file)) return false;
  const stat = fs.lstatSync(expected.file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== process.getuid() || (stat.mode & 0o077) || stat.size > 4096) throw new Error("UNSAFE_OBSERVER_RECEIPT");
  const value = JSON.parse(fs.readFileSync(expected.file, "utf8"));
  if (value.state !== "COLLECTING" || value.token !== expected.token || value.attempt !== expected.attempt || value.observer_pid !== expected.pid || !Number.isInteger(value.cli_pid) || value.cli_pid <= 0) throw new Error("OBSERVER_RECEIPT_IDENTITY");
  return value;
}
function waitReady(directory, expected) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const watcher = fs.watch(directory, check), timer = setTimeout(() => finish(new Error("OBSERVER_READY_TIMEOUT")), 15000);
    watcher.on("error", finish);
    function finish(error, values) { if (settled) return; settled = true; clearTimeout(timer); watcher.close(); if (error) reject(error); else resolve(values); }
    function check() { try { const values = expected.map(readReady); if (values.every(Boolean)) finish(null, values); } catch (error) { finish(error); } }
    check();
  });
}
if (require.main === module) {
  const file = process.argv[2], expected = JSON.parse(fs.readFileSync(file));
  waitReady(require("node:path").dirname(file), expected).then(values => { process.stdout.write(JSON.stringify(values)); }, () => { process.stderr.write("OBSERVER_READY_FAILED\n"); process.exitCode = 1; });
}
module.exports = { readReady, waitReady };
