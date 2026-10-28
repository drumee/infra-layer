"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), os = require("node:os"), http = require("node:http");
const { once } = require("node:events"), { fork, spawnSync } = require("node:child_process");
const p1 = require("./observe.cjs"), { install } = require("./state.cjs");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "drumee-p2-preflight-")); fs.chmodSync(output, 0o700);
console.log("P2_PREFLIGHT_OUTPUT " + output);
const read = file => fs.readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map(line => JSON.parse(line));
function observed(name) { const file = path.join(output, name + ".jsonl"); return { file, log: p1.logger("P2-PREFLIGHT-" + name, "control", file) }; }
async function fixture(name, callback) {
  const { file, log: record } = observed(name), listeners = new Set();
  const log = (event, fields) => { record(event, fields); for (const listener of listeners) listener(event, fields); };
  const server = p1.serverEvents(http.createServer(callback), log);
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  const port = server.address().port, state = install(port, log);
  return { file, log, server, port, state, onEvent: listener => listeners.add(listener), request: () => fetch(`http://127.0.0.1:${port}`, { headers: { authorization: "P2_SECRET_SENTINEL" } }),
    async close() { state.restore(); server.closeAllConnections(); if (server.listening) await new Promise(resolve => server.close(resolve)); } };
}
const normal = (request, response) => { response.writeHead(200, { "content-type": "application/json" }); response.end('{"count":1}'); };
test("P2-F1 normal response is application-completed", { timeout: 10000 }, async () => {
  const f = await fixture("F1", normal);
  try { f.state.begin(1); assert.equal((await (await f.request()).json()).count, 1); f.state.end(); assert.deepEqual(f.state.pending(), []); assert.equal(read(f.file).filter(v => v.event === "operation.completed").length, 1); } finally { await f.close(); }
});
test("P2-F2 active request interruption stays fatal", { timeout: 10000 }, async () => {
  let state, server;
  const f = await fixture("F2", () => { state.shutdown("close-active", ["capture"]); server.closeAllConnections(); });
  ({ state, server } = f);
  try {
    state.begin(2); await assert.rejects(f.request(), error => error.name === "TypeError" && !!error.cause?.code); state.end();
    const values = read(f.file), shutdown = values.find(v => v.event === "intentional.shutdown"); assert.equal(shutdown.pending_application.length, 1);
    assert.ok(values.some(v => v.event === "client.request.error")); assert.ok(values.some(v => v.event === "operation.error")); assert.equal(values.some(v => v.event === "operation.completed"), false);
  } finally { await f.close(); }
});
test("P2-F3 intentional idle socket close is distinct", { timeout: 10000 }, async () => {
  const f = await fixture("F3", normal);
  try {
    f.state.begin(3); await (await f.request()).json(); f.state.end(); f.state.shutdown("close-idle", ["capture"]);
    // Keep the listener alive while the peer processes FIN; no timer or delay is used.
    const socketEnded = new Promise(resolve => f.onEvent(event => { if (event === "client.socket.end") resolve(); }));
    f.server.closeIdleConnections(); await socketEnded;
    const values = read(f.file); assert.ok(values.some(v => v.event === "client.socket.end" && v.connection_activity === "idle_persistent_connection" && v.pending_application.length === 0));
    assert.equal(values.some(v => v.event === "operation.error"), false);
  } finally { await f.close(); }
});
test("P2-F4 close follows completed response", { timeout: 10000 }, async () => {
  const f = await fixture("F4", normal);
  try {
    f.state.begin(4); await (await f.request()).json(); f.state.end(); f.state.shutdown("server.close", ["capture"]);
    await new Promise(resolve => f.server.close(resolve));
    const values = read(f.file); assert.ok(values.findIndex(v => v.event === "operation.completed") < values.findIndex(v => v.event === "server.close.requested"));
    assert.equal(values.some(v => v.event === "operation.error"), false);
  } finally { await f.close(); }
});
test("P2-F5 unresolved cross-case operation is detected", { timeout: 10000 }, async () => {
  let response;
  const f = await fixture("F5", (request, value) => { response = value; });
  try {
    f.state.begin(5); const received = once(f.server, "request"), detached = f.request(); await received;
    f.state.end(); assert.equal(f.state.pending().length, 1); f.state.begin(6);
    normal(null, response); await (await detached).json(); f.state.end();
    const values = read(f.file); assert.ok(values.some(v => v.event === "case.completed" && v.pending_application.length === 1));
    assert.ok(values.some(v => v.event === "operation.completed" && v.owner_case === 5 && v.current_case === 6 && v.cross_case));
  } finally { await f.close(); }
});
test("P2-F6 existing fatal handler fixture retains failure", { timeout: 10000 }, async () => {
  const { file, log } = observed("F6");
  const child = fork(path.join(__dirname, "../postfix-http/fixture.cjs"), ["E4", "P2-PREFLIGHT-F6", file], { stdio: ["ignore", "ignore", "ignore", "ipc"], env: {} });
  let result; const exit = new Promise((resolve, reject) => { child.once("error", reject); child.once("exit", code => { result = code; resolve(code); }); });
  let state;
  try { const [ready] = await once(child, "message"); state = install(ready.port, log); state.begin(6); await assert.rejects(fetch(`http://127.0.0.1:${ready.port}`), error => !!error.cause?.code); await exit; state.end(); assert.equal(result, 1); assert.ok(read(file).some(v => v.event === "server.handler.throw")); }
  finally { state?.restore(); if (result === undefined) { child.kill("SIGKILL"); await exit; } }
});
test("P2-F7 normal cleanup has no unresolved operation", { timeout: 10000 }, async () => {
  const f = await fixture("F7", normal);
  try { f.state.begin(7); await (await f.request()).json(); f.state.end(); f.state.shutdown("cleanup", ["capture"]); const values = read(f.file); assert.deepEqual(values.find(v => v.event === "intentional.shutdown").pending_application, []); assert.deepEqual(f.state.pending(), []); } finally { await f.close(); }
});
test("P2-F8 native hooks preserve case order and shared context", () => {
  const directory = path.join(output, "hooks"); fs.mkdirSync(directory, { mode: 0o700 });
  for (const name of ["client-preload.cjs", "state.cjs"]) fs.copyFileSync(path.join(__dirname, name), path.join(directory, name));
  fs.copyFileSync(path.join(__dirname, "../postfix-http/observe.cjs"), path.join(directory, "observe.cjs"));
  fs.writeFileSync(path.join(directory, "cases.json"), JSON.stringify(["P2 hook first case", "P2 hook second case"]));
  fs.writeFileSync(path.join(directory, "attempt.json"), JSON.stringify({ attempt: "P2-HOOK-CONTROL", output: directory }));
  const metadata = path.join(directory, "metadata.json"); fs.writeFileSync(metadata, JSON.stringify({ project: "P2-local-hooks", ports: { capture: 1 } }));
  const result = spawnSync(process.execPath, ["--require", path.join(directory, "client-preload.cjs"), "--test", path.join(__dirname, "hook-cases.test.cjs")], { encoding: "utf8", timeout: 10000, env: { IL2_METADATA: metadata } });
  fs.writeFileSync(path.join(directory, "tap.log"), result.stdout + result.stderr, { mode: 0o600 }); assert.equal(result.status, 0);
  const values = read(path.join(directory, "client.jsonl")); assert.deepEqual(values.filter(v => v.event === "case.start").map(v => v.current_case), [1, 2]); assert.deepEqual(values.filter(v => v.event === "case.completed").map(v => v.current_case), [1, 2]);
});
test("P2-F9 diagnostics bound output and omit sensitive data", { timeout: 10000 }, async () => {
  const f = await fixture("F9", (request, response) => { response.end('{"private":"P2_BODY_SENTINEL"}'); });
  try { f.state.begin(9); assert.equal((await (await f.request()).json()).private, "P2_BODY_SENTINEL"); f.state.end(); assert.doesNotMatch(fs.readFileSync(f.file, "utf8"), /P2_SECRET_SENTINEL|P2_BODY_SENTINEL|authorization/i); } finally { await f.close(); }
  const { file, log } = observed("bounded"); for (let i = 0; i < 4096; i++) log("bound.control"); assert.throws(() => log("overflow"), /P1_DIAGNOSTIC_EVENT_LIMIT/); assert.equal(read(file).length, 4096); assert.ok(fs.statSync(file).size < 2 * 1024 * 1024);
});
