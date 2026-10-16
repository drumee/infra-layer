"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const { planInfrastructure } = require("../../lib");
const { serviceInputs } = require("../support/service-inputs");
function inputs() {
  const value = serviceInputs();
  const ref = { resource: "database", key: "runtime" };
  value.spec.database.accounts = [{ user: "kernel_runtime", secret_ref: ref }];
  value.spec.secrets.resources.push({ ref, type: "database-service", consumers: ["database-account", "kernel-runtime"] });
  return value;
}
test("distribution SQL accounts use independent infrastructure-owned secret references", () => {
  const value = inputs();
  const plan = planInfrastructure(value.spec, value.requirements, value.adapter_input);
  assert.equal(plan.applicable, true, JSON.stringify(plan.diagnostics));
  assert.ok(plan.required_secrets.some(value => value.ref.key === "runtime"));
  const { projectionRecords } = require("../../lifecycle/preparation");
  const composition = { plan, projections: [], compose: { services: {} } };
  const account = projectionRecords(composition).find(value => value.target === "/run/secrets/database-account-kernel_runtime");
  assert.equal(account.consumer, "database-account"); assert.equal(account.service, "database");
});
test("database account identities, references, secret types and duplicate ownership fail closed", () => {
  for (const mutate of [
    value => { value.spec.database.accounts[0].user = "root"; },
    value => { value.spec.database.accounts.push(value.spec.database.accounts[0]); },
    value => { value.spec.database.accounts[0].secret_ref = value.spec.database.service_secret_ref; },
    value => { value.spec.secrets.resources.at(-1).type = "redis-auth"; },
    value => { value.spec.database.accounts[0].password = "forbidden"; }
  ]) { const value = inputs(); mutate(value); assert.equal(planInfrastructure(value.spec, value.requirements, value.adapter_input).applicable, false); }
});
