"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const {spawnSync} = require("node:child_process");
test("artifact retention previews and deletes only eligible synthetic runs", () => {
  const result = spawnSync("python3", ["test/artifacts/retention_test.py"], {encoding: "utf8", timeout: 30000});
  assert.equal(result.status, 0, result.stderr);
});
