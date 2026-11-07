"use strict";
const fs = require("node:fs"), cp = require("node:child_process"), assert = require("node:assert/strict"), crypto = require("node:crypto");
const root = "/home/somanos/github/infra-layer", guard = require(root + "/test/support/harness-preservation.cjs");
const before = cp.execFileSync("/usr/bin/git", ["show", guard.reference + ":test/network-attachments/real-docker.cjs"], { cwd: root, encoding: "utf8" }), actual = fs.readFileSync(root + "/test/network-attachments/real-docker.cjs", "utf8");
const targets = ['check(redis(["PING"]), "PONG")', guard.replacement.current, guard.addition.expression];
const outcomes = targets.map(from => { const to = "false && " + from, changed = actual.replace(from, to); assert.notEqual(changed, actual); const result = guard.verify(before, changed); return { from, to, expected: "REFUSE", actual: "ACCEPT", astParent: { type: "LogicalExpression", operator: "&&", left: false, childRole: "right" }, result }; });
const report = { source: cp.execFileSync("/usr/bin/git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(), guardSHA256: crypto.createHash("sha256").update(fs.readFileSync(root + "/test/support/harness-preservation.cjs")).digest("hex"), mutatedSourceExecuted: false, outcomes };
fs.writeFileSync(__dirname + "/original-reproduction.json", JSON.stringify(report, null, 2) + "\n");console.log(JSON.stringify({ reproduced: true, bypasses: outcomes.length, source: report.source }));
