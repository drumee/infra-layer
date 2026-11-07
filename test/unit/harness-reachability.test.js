"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), { execFileSync } = require("node:child_process");
const guard = require("../support/harness-preservation.cjs");
const before = execFileSync("/usr/bin/git", ["show", guard.reference + ":test/network-attachments/real-docker.cjs"], { cwd: path.resolve(__dirname, "../.."), encoding: "utf8" });
const actual = fs.readFileSync(path.join(__dirname, "../network-attachments/real-docker.cjs"), "utf8"), ping = 'check(redis(["PING"]), "PONG")';
function change(from, to) { assert.ok(actual.includes(from), "mutation target required"); return actual.replace(from, to); }
function refuse(source, code) { assert.throws(() => guard.verify(before, source), error => error.code === code && error.message === code); }
test("A2 exact independent short-circuit mutations are rejected for all three assertion categories", () => {
  for (const expression of [ping, guard.replacement.current, guard.addition.expression]) refuse(change(expression, "false && " + expression), "EXECUTION_CONTEXT_CHANGED");
});
test("A2-D1 unchanged historical source is accepted in explicit historical mode", () => { assert.equal(guard.verify(before, before, { mode: "historical" }).replacements, 0); });
test("A2-D2 closed addition-only source is accepted in its mode", () => { assert.equal(guard.verify(before, guard.authorizedSource(before, "additions"), { mode: "additions" }).additions, 1); });
test("A2-D3 exact authorized A1 replacement is accepted once", () => { assert.equal(guard.verify(before, actual).replacements, 1); });
test("A2-D4 false-and suppression is rejected", () => { refuse(change(ping, "false && " + ping), "EXECUTION_CONTEXT_CHANGED"); });
test("A2-D5 true-or suppression is rejected", () => { refuse(change(ping, "true || " + ping), "EXECUTION_CONTEXT_CHANGED"); });
test("A2-D6 dead conditional block is rejected", () => { refuse(change(ping + ";", "if (false) { " + ping + "; }"), "EXPRESSION_CONTEXT_MISMATCH"); });
test("A2-D7 unexecuted ternary branch is rejected", () => { refuse(change(ping, "true ? undefined : " + ping), "EXECUTION_CONTEXT_CHANGED"); });
test("A2-D8 early return before protected operation is rejected", () => { refuse(change(ping + ";", "return; " + ping + ";"), "EXECUTION_CONTEXT_CHANGED"); });
test("A2-D9 early throw before protected operation is rejected", () => { refuse(change(ping + ";", 'throw Error("suppressed"); ' + ping + ";"), "EXECUTION_CONTEXT_CHANGED"); });
test("A2-D10 protected operation moved into unused helper is rejected", () => { refuse(change(ping + ";", "function unused() { " + ping + "; }"), "EXPRESSION_CONTEXT_MISMATCH"); });
test("A2-D11 protected operation moved into unused callback is rejected", () => { refuse(change(ping + ";", "const unused = () => { " + ping + "; };"), "EXPRESSION_CONTEXT_MISMATCH"); });
test("A2-D12 discarded asynchronous invocation is rejected", () => { refuse(change("await start(id);", "void start(id);"), "EXECUTION_CONTEXT_CHANGED"); });
test("A2-D13 historical assertion deletion is rejected", () => { refuse(change(ping + ";", ""), "HISTORICAL_EXPRESSION_REMOVED"); });
test("A2-D14 unauthorized expected value change is rejected", () => { refuse(change(ping, 'check(redis(["PING"]), "WRONG")'), "HISTORICAL_EXPRESSION_MODIFIED"); });
test("A2-D15 reordered historical operations are rejected", () => { const other = 'check(redis(["SET", "qualification-key", "persisted"]), "OK")'; refuse(actual.replace(ping, "SENTINEL").replace(other, ping).replace("SENTINEL", other), "HISTORICAL_EXPRESSION_REORDERED"); });
test("A2-D16 unauthorized replacement is rejected", () => { refuse(change(guard.replacement.current, guard.replacement.current.replace("NETWORK_ATTACHMENT_MISMATCH", "OTHER")), "UNAUTHORIZED_REPLACEMENT"); });
test("A2-D17 unapproved assertion is rejected", () => { refuse(actual + "\nassert.ok(true);", "UNAPPROVED_ADDITION"); });
test("A2-D18 unapproved Docker command is rejected", () => { refuse(actual + '\ndocker(["ps"]);', "UNAPPROVED_ADDITION"); });
test("A2-D19 duplicate elsewhere cannot compensate for removed occurrence", () => { const expression = 'check(redis(["GET", "qualification-key"]), "persisted")'; const modified = actual.replace(expression + ";", "") + "\nfunction unrelated() { " + expression + "; }"; refuse(modified, "EXPRESSION_CONTEXT_MISMATCH"); });
test("A2-D20 changed enclosing conditional is rejected", () => { refuse(change("if (value.State.Running)", "if (false)"), "EXPRESSION_CONTEXT_MISMATCH"); });
test("A2-D21 removing an invoked helper call is rejected", () => { refuse(change("await start(id);", "const uncalled = start;"), "EXECUTION_CONTEXT_CHANGED"); });
test("A2-D22 approved addition relocated to unrelated context is rejected", () => { refuse(change(guard.addition.expression + ";", "function unused() { " + guard.addition.expression + "; }"), "EXPRESSION_CONTEXT_MISMATCH"); });
test("A2-D23 benign formatting outside protected calls preserves approved AST", () => { assert.equal(guard.verify(before, actual.replace("const versions =", "\n\n  const   versions =")).currentExpressions, 54); });
test("A2-D24 actual unchanged canonical harness passes both barriers", () => { assert.equal(guard.verify(before, actual).currentExpressions, 54); });
test("A2 fail-closed frame rejects changes to imports and function invocation ownership", () => {
  refuse(change('require("node:assert/strict")', 'require("node:assert")'), "EXECUTION_CONTEXT_CHANGED");
  refuse(change("diagnostic.run(async () => {", "const ignored = diagnostic.run(async () => {"), "EXECUTION_CONTEXT_CHANGED");
});
