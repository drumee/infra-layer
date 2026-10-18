"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), crypto = require("node:crypto");
const api = require("../../lib"), L = require("../../lifecycle");
const { cases } = require("../support/composition-review-cases");
const expected = require("../support/il58-composition-expected.json");
test("IL-5.8 preserves exact composition bytes and diagnostic precedence from de4b34e", () => {
  const actual = cases().map(({ name, value }) => {
    try {
      const result = L.composeDeployment(api.planInfrastructure(value.spec, value.requirements, value.adapter_input), value.distribution);
      return { name, digest: crypto.createHash("sha256").update(JSON.stringify(result)).digest("hex") };
    } catch (error) { return { name, error: error.code || error.message }; }
  });
  assert.deepEqual(actual, expected);
});
