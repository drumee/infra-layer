"use strict";
const C = require("./capture.cjs"), assert = require("node:assert/strict");
const scenario = process.env.D1_FIXTURE;
if (scenario === "load") throw Object.assign(new Error("D1_LOAD_FAILURE", { cause: new Error("D1_INNER_CAUSE") }), { code: "D1_LOAD_FAILURE" });
const { test } = require("node:test");
C.mark("registration-start", { scenario });
if (scenario === "registration") throw Object.assign(new Error("D1_REGISTRATION_FAILURE"), { code: "D1_REGISTRATION_FAILURE" });
if (scenario === "worker") process.exit(7);
test("D1 fixture " + scenario, () => {
  if (scenario === "assertion" || scenario === "precedence") assert.equal(1, 2, "D1_ASSERTION_FAILURE");
  if (scenario === "rejection") setImmediate(() => Promise.reject(Object.assign(new Error("D1_REJECTION_FAILURE"), { code: "D1_REJECTION_FAILURE" })));
  if (scenario === "bounds") console.log("token=synthetic-value " + "x".repeat(300000));
});
C.mark("registration-complete");
