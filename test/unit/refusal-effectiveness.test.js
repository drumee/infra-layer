"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), path = require("node:path"), { spawnSync } = require("node:child_process");
const { scenarios } = require("../network-attachments/refusal-effectiveness.cjs");
const fixture = path.join(__dirname, "../network-attachments/refusal-effectiveness.cjs");
for (const [scenario, expected] of Object.entries(scenarios)) {
  test("A2 effectiveness " + scenario + ": actual refusal passes; unsafe success and unrelated failure fail the process", () => {
    const good = spawnSync(process.execPath, [fixture, scenario, "actual"], { encoding: "utf8", timeout: 10000 });
    assert.equal(good.status, 0, good.stderr); const result = JSON.parse(good.stdout); assert.equal(result.status, "PASS"); assert.equal(result.expectedError, expected); assert.equal(result.observedError, expected); assert.equal(result.validatorInvocations, 1); assert.ok(result.fixtureDockerCalls > 0);
    for (const mode of ["success", "unrelated"]) {
      const bad = spawnSync(process.execPath, [fixture, scenario, mode], { encoding: "utf8", timeout: 10000 });
      assert.equal(bad.status, 1, bad.stderr); const failure = JSON.parse(bad.stdout); assert.equal(failure.status, "FAIL"); assert.equal(failure.code, "ERR_ASSERTION"); assert.equal(failure.validatorInvocations, 1); assert.equal(failure.fixtureDockerCalls, 0);
      assert.equal(failure.observedError, mode === "success" ? null : "UNRELATED_FAILURE");
    }
  });
}
