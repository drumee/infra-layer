"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const { eventValue } = require("../services-capture/observer-events.cjs");
const { evidenceWindow } = require("../services-capture/evidence-window.cjs");
const { readReady, waitReady } = require("../services-capture/observer-ready.cjs");
const { model, complete, terminal } = require("./model.cjs");
const p1 = require("../postfix-http/observe.cjs");
function window() {
  const client = Array.from({ length: 17 }, (_, i) => [{ event: "case.start", current_case: i + 1 }, { event: "case.completed", current_case: i + 1, pending_application: [] }]).flat();
  client.push({ event: "operation.start", operation_id: 1 }, { event: "operation.completed", operation_id: 1 });
  const server = ["process.start", "server.listening", "server.handler.enter", "server.handler.return", "server.response.finish", "process.exit"].map(event => ({ event, process_instance: "modeled-server", request_id: 1, code: 0 }));
  return { client, server, services: { status: 0, signal: null } };
}
test("F1 stream ordering includes bounded incomplete-stream refusal", () => { const { contract: c, child } = model(); complete(c); c.stop(child); c.exit(child, 143, null); c.close(child, 143, null); assert.equal(c.result, null); assert.equal(c.deadline().reason, "STREAM_COMPLETION_TIMEOUT"); assert.equal(c.result.accepted, false); });
test("F1 duplicate request after termination cannot manufacture success", () => { const { contract: c, child } = model(); complete(c); c.stop(child); assert.equal(terminal(c, child).accepted, true); assert.equal(c.stop(child), false); assert.equal(child.kills.length, 1); assert.equal(c.result.accepted, false); assert.equal(c.result.reason, "DUPLICATE_STOP"); });
test("F1 complete window requires17 cases and every terminal operation", () => { const w = window(); assert.equal(evidenceWindow(w.client, w.server, w.services, 0).valid, true); assert.equal(evidenceWindow(w.client.filter(r => r.event !== "operation.completed"), w.server, w.services, 0).reason, "REQUEST_EVIDENCE_INCOMPLETE"); assert.equal(evidenceWindow(w.client.filter(r => r.current_case !== 17), w.server, w.services, 0).reason, "CASE_EVIDENCE_INCOMPLETE"); });
test("F1 pending operations and incomplete server lifecycle invalidate evidence", () => { const w = window(); w.client[1].pending_application = [1]; assert.equal(evidenceWindow(w.client, w.server, w.services, 0).reason, "UNRESOLVED_OPERATION"); w.client[1].pending_application = []; assert.equal(evidenceWindow(w.client, w.server.filter(r => r.event !== "process.exit"), w.services, 0).reason, "SERVER_EVIDENCE_INCOMPLETE"); });
test("F1 Services failure remains terminal but never becomes Services success", () => { const w = window(); assert.equal(evidenceWindow(w.client, w.server, { status: 1, signal: null }, 0).valid, true); assert.equal(evidenceWindow(w.client, w.server, undefined, 0).valid, false); assert.equal(evidenceWindow(w.client, w.server, w.services, 1).valid, false); });
test("F1 event parser redacts command payload and preserves daemon timestamp digits", () => {
  const project = "drumee-il2-test-aabbccdd", id = "a".repeat(64);
  const line = '{"Action":"exec_create: SECRET_COMMAND_SENTINEL","Type":"container","Actor":{"ID":"' + id + '","Attributes":{"com.docker.compose.project":"' + project + '","com.docker.compose.service":"mail","secret":"SECRET_ATTRIBUTE_SENTINEL"}},"timeNano":1793194113435010219}';
  const value = eventValue(line, project); assert.equal(value.action, "exec_create"); assert.equal(value.time_nano, "1793194113435010219"); assert.doesNotMatch(JSON.stringify(value), /SECRET_/);
  assert.throws(() => eventValue(line, "drumee-il2-test-11223344"), /EVENT_OWNER_MISMATCH/);
});
test("F1 readiness is event-driven and rejects a stale PID receipt", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "drumee-observer-ready-")); fs.chmodSync(directory, 0o700);
  const expected = { file: path.join(directory, "ready.json"), token: "fixture-token", attempt: "fixture-attempt", pid: 101 };
  const ready = waitReady(directory, [expected]);
  fs.writeFileSync(expected.file, JSON.stringify({ state: "COLLECTING", token: expected.token, attempt: expected.attempt, observer_pid: 101, cli_pid: 102 }), { mode: 0o600 });
  assert.equal((await ready)[0].cli_pid, 102);
  assert.throws(() => readReady({ ...expected, pid: 103 }), /OBSERVER_RECEIPT_IDENTITY/);
});
test("F1 logging remains bounded and excludes stderr payload", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "drumee-observer-bound-")); fs.chmodSync(directory, 0o700);
  const file = path.join(directory, "events.jsonl"), log = p1.logger("F1-BOUND", "control", file);
  const { contract: c, child } = model(log); complete(c); c.stop(child); c.fail("OBSERVER_STDERR"); terminal(c, child);
  assert.equal(c.result.reason, "OBSERVER_STDERR"); assert.doesNotMatch(fs.readFileSync(file, "utf8"), /SECRET_STDERR_SENTINEL/);
  const bound = path.join(directory, "bound.jsonl"), bounded = p1.logger("F1-BOUND-LIMIT", "control", bound);
  for (let i = 0; i < 4096; i++) bounded("limit.control"); assert.throws(() => bounded("overflow"), /P1_DIAGNOSTIC_EVENT_LIMIT/); assert.equal(fs.readFileSync(bound, "utf8").trim().split("\n").length, 4096);
  console.log("F1_BOUND_OUTPUT " + directory);
});
