"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), { ESLint } = require("eslint");
const { regressions } = require("../../tooling/lint.cjs");
test("lint debt never permits a new, moved or duplicate diagnostic", () => {
  const finding = { file: "lib/example.js", line: 2, rule: "no-unused-vars", message: "unused" };
  assert.deepEqual(regressions([finding], [finding]), []);
  assert.equal(regressions([finding, finding], [finding]).length, 1);
  assert.equal(regressions([{ ...finding, line: 3 }], [finding]).length, 1);
  assert.equal(regressions([{ ...finding, file: "test/example.js" }], [finding]).length, 1);
  assert.deepEqual(regressions([], [finding]), []);
});
test("lint catches undefined identifiers, unreachable flow and unsafe finally", async () => {
  const engine = new ESLint();
  for (const [text, rule] of [["unknownIdentifier();", "no-undef"], ["function sample(){return 1;throw new Error();} sample();", "no-unreachable"], ["function sample(){try{return 1;}finally{return 2;}} sample();", "no-unsafe-finally"]]) {
    const [result] = await engine.lintText(text, { filePath: "tooling/isolated-check.cjs" });
    assert.ok(result.messages.some(message => message.ruleId === rule && message.severity === 2));
  }
});
test("lint includes tests and treats newly unused variables as regressions", async () => {
  const engine = new ESLint(), [result] = await engine.lintText("const newlyUnused = 1;", { filePath: "test/unit/isolated-check.js" });
  assert.equal(result.messages[0].ruleId, "no-unused-vars");
  assert.equal(regressions([{ file: "test/unit/isolated-check.js", ...result.messages[0] }], []).length, 1);
});
test("quality workflow is valid, read-only, explicit and fail-closed", () => {
  const fs = require("node:fs"), { parseDocument } = require("yaml");
  const text = fs.readFileSync(".github/workflows/quality.yml", "utf8"), doc = parseDocument(text, { uniqueKeys: true });
  assert.deepEqual(doc.errors, []); const workflow = doc.toJSON();
  assert.deepEqual(workflow.permissions, { contents: "read" });
  assert.deepEqual(workflow.on.pull_request.branches, ["main"]);
  assert.deepEqual(workflow.on.push.branches, ["main", "feat/**"]);
  assert.ok(workflow.on.schedule.length); assert.ok("workflow_dispatch" in workflow.on);
  assert.equal(workflow.on.pull_request_target, undefined);
  assert.deepEqual(workflow.jobs.check.strategy.matrix.check, ["unit", "contracts", "eslint", "dependencies", "packaging"]);
  assert.equal(workflow.jobs.check.strategy['fail-fast'], false);
  for (const step of workflow.jobs.check.steps) {
    if (step.uses) assert.match(step.uses, /@[a-f0-9]{40}$/);
    assert.equal(step['continue-on-error'], undefined);
  }
  assert.equal(text.includes("secrets."), false); assert.doesNotMatch(text, /npm publish|docker push|gh pr merge/);
  assert.equal(workflow.jobs.check.steps[0].with['persist-credentials'], false);
});
test("Dependabot is scoped, periodic and never configures automatic merge", () => {
  const fs = require("node:fs"), { parseDocument } = require("yaml");
  const text = fs.readFileSync(".github/dependabot.yml", "utf8"), doc = parseDocument(text, { uniqueKeys: true });
  assert.deepEqual(doc.errors, []); const config = doc.toJSON(); assert.equal(config.version, 2);
  assert.deepEqual(config.updates.map(value => [value['package-ecosystem'], value.directory]), [["npm", "/"], ["npm", "/test/application"], ["github-actions", "/"]]);
  for (const value of config.updates) { assert.equal(value.schedule.interval, "weekly"); assert.ok(value['open-pull-requests-limit'] <= 5); }
  assert.doesNotMatch(text, /automerge|auto-merge/);
});
