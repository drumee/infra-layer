"use strict";
const child = require("node:child_process"), { mock } = require("node:test"), path = require("node:path"), fs = require("node:fs"), assert = require("node:assert/strict");
const root = "/home/somanos/github/infra-layer", expected = path.join(root, "test/services/services.test.js"), original = child.spawnSync, record = { attempt: "A3-POSTFIX-FOCUSED-DIAGNOSTIC-1", source: child.execFileSync("/usr/bin/git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(), tests: ["SMTP STARTTLS/authenticated submission", "OpenDKIM signs captured bytes", "Postfix queue survives capture outage"], assertionsChanged: false, dockerCommandsChanged: false, retry: false };
let observed = false;
const substitution = mock.method(child, "spawnSync", function(program, args, options) {
 if (args[0] === "--test" && args[1] === expected) {
  assert.equal(observed, false); observed = true;
  const selected = ["--require", path.join(__dirname, "services-observer.cjs"), "--test", "--test-name-pattern=SMTP STARTTLS/authenticated|OpenDKIM signs|Postfix queue survives", expected];
  const result = original.call(this, program, selected, options); record.testCommand = [program, ...selected]; record.exit = result.status; record.signal = result.signal; fs.writeFileSync(path.join(__dirname, "services-diagnostic.json"), JSON.stringify(record, null, 2) + "\n", { mode: 0o600 }); return result;
 }
 return original.call(this, program, args, options);
});
try { require(root + "/test/services/run.js"); } finally { substitution.mock.restore(); }
