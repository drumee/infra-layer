"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), { execFileSync } = require("node:child_process");
const guard = require("../support/harness-preservation.cjs");
const before = execFileSync("/usr/bin/git", ["show", guard.reference + ":test/network-attachments/real-docker.cjs"], { cwd: path.resolve(__dirname, "../.."), encoding: "utf8" });
const candidate = guard.authorizedSource(before), canonical = fs.readFileSync(path.join(__dirname, "../network-attachments/real-docker.cjs"), "utf8");
function replace(source, from, to) { assert.ok(source.includes(from), "mutation target must exist"); return source.replace(from, to); }
function rejected(source, code) { assert.throws(() => guard.verify(before, source), error => error.code === code && error.message === code); }
const ping = 'check(redis(["PING"]), "PONG")', get = 'check(redis(["GET", "qualification-key"]), "persisted")';
test("A1-D1 pinned unchanged historical comparison accepts", () => { assert.equal(guard.verify(before, before, { mode: "historical" }).replacements, 0); });
test("A1-D2 historical plus precisely approved additions accepts", () => { assert.equal(guard.verify(before, guard.authorizedSource(before, "additions"), { mode: "additions" }).additions, 1); });
test("A1-D3 single approved replacement subtree and additions accept", () => { assert.equal(guard.verify(before, candidate).replacements, 1); });
test("A1-D4 actual canonical Docker acceptance source passes the guard", () => { assert.equal(guard.verify(before, canonical).currentExpressions, 54); });
test("A1-D5 removed historical assertion is refused", () => { rejected(replace(candidate, ping + ";", ""), "HISTORICAL_EXPRESSION_REMOVED"); });
test("A1-D6 unauthorized expected-value change is refused", () => { rejected(replace(candidate, ping, 'check(redis(["PING"]), "WRONG")'), "HISTORICAL_EXPRESSION_MODIFIED"); });
test("A1-D7 reordered historical operations are refused", () => { const set = 'check(redis(["SET", "qualification-key", "persisted"]), "OK")'; rejected(candidate.replace(ping, "MUTATION_SENTINEL").replace(set, ping).replace("MUTATION_SENTINEL", set), "HISTORICAL_EXPRESSION_REORDERED"); });
test("A1-D8 removed historical Docker invocation is refused", () => { rejected(replace(candidate, 'docker(["restart", id]);', ""), "HISTORICAL_EXPRESSION_REMOVED"); });
test("A1-D9 modified historical Docker arguments are refused", () => { rejected(replace(candidate, 'docker(["restart", id])', 'docker(["restart", "foreign"])'), "HISTORICAL_EXPRESSION_MODIFIED"); });
test("A1-D10 unapproved assertion insertion is refused", () => { rejected(candidate + "\nassert.ok(true);", "UNAPPROVED_ADDITION"); });
test("A1-D11 unapproved Docker insertion is refused", () => { rejected(candidate + '\ndocker(["ps"]);', "UNAPPROVED_ADDITION"); });
test("A1-D12 wrong replacement error code is refused", () => { rejected(replace(candidate, guard.replacement.current, guard.replacement.current.replace("NETWORK_ATTACHMENT_MISMATCH", "INVALID_NETWORK_ATTACHMENT")), "UNAUTHORIZED_REPLACEMENT"); });
test("A1-D13 replacement in another phase is refused", () => { rejected(replace(candidate, 'diagnostic.step("missing-network-refusal")', 'diagnostic.step("another-scenario")'), "EXPRESSION_CONTEXT_MISMATCH"); });
test("A1-D14 second historical assertion replacement is refused", () => { rejected(replace(candidate, ping, 'assert.throws(() => redis(["PING"]), { code: "OTHER" })'), "HISTORICAL_EXPRESSION_MODIFIED"); });
test("A1-D15 missing authorized replacement is refused for final candidate", () => { rejected(replace(candidate, guard.replacement.current, guard.replacement.historical), "APPROVED_REPLACEMENT_MISSING"); });
test("A1-D16 duplicate use of replacement authorization is refused", () => { rejected(replace(candidate, guard.replacement.current, guard.replacement.current + "; " + guard.replacement.current), "DUPLICATE_AUTHORIZATION_USE"); });
test("A1-D17 approved addition cannot compensate for historical deletion", () => { const changed = replace(candidate, get + ";", ""); rejected(changed + "\n" + guard.addition.expression + ";", "UNAPPROVED_ADDITION"); });
test("A1-D18 unexpected nested protected call changes are refused", () => { rejected(replace(candidate, guard.replacement.current, guard.replacement.current.replace("D.checkNetworks(missing)", 'D.docker(["ps"])')), "UNAUTHORIZED_REPLACEMENT"); });
test("A1-D19 removing one duplicate historical occurrence is refused", () => { assert.equal(guard.expressions(before).filter(x => x.text === get).length, 2); rejected(replace(candidate, get + ";", ""), "HISTORICAL_EXPRESSION_REMOVED"); });
test("A1-D20 moving historical assertion to unrelated function is refused", () => { rejected(replace(candidate, ping + ";", "") + "\nfunction unrelated() { " + ping + "; }", "EXPRESSION_CONTEXT_MISMATCH"); });
test("additional historical spawn-removal and assertion-operator mutations are refused", () => {
  const source = guard.expressions(candidate).find(x => x.text.startsWith("spawn(")); assert.ok(source);
  rejected(replace(candidate, source.text, "null"), "HISTORICAL_EXPRESSION_REMOVED");
  rejected(replace(candidate, "assert.notEqual(report.recovered_attachments[id].EndpointID, initial.Containers[id].EndpointID)", "assert.equal(report.recovered_attachments[id].EndpointID, initial.Containers[id].EndpointID)"), "HISTORICAL_EXPRESSION_MODIFIED");
});
test("historical bytes cannot be replaced and diagnostics stay bounded", () => { assert.throws(() => guard.verify(before + "\n", candidate), { code: "UNAPPROVED_HISTORICAL_SOURCE" }); try { guard.verify(before, candidate + "\nassert.ok(true);"); } catch (e) { assert.ok(JSON.stringify(e).length < 256); assert.equal(e.code, "UNAPPROVED_ADDITION"); } });
