"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), { spawnSync } = require("node:child_process");
test("hosted toolchain preparation refuses non-hosted execution before any mutation", () => {
  const before = fs.lstatSync("/opt").mode;
  const result = spawnSync(process.execPath, [path.resolve(__dirname, "../../tooling/prepare-hosted-node.cjs"), "--execute"], { encoding: "utf8", env: { PATH: "/usr/bin:/bin" } });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /HOSTED_NODE_PREPARATION_REFUSED/);
  assert.equal(fs.lstatSync("/opt").mode, before);
});
