"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), os = require("node:os"), crypto = require("node:crypto"), net = require("node:net");
const { fork } = require("node:child_process");
const { once } = require("node:events");
const observe = require("./observe.cjs");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "drumee-p1-fixtures-")); fs.chmodSync(output, 0o700);
console.log("P1_FIXTURE_OUTPUT " + output);
const rows = file => fs.existsSync(file) ? fs.readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map(line => JSON.parse(line)) : [];
function before(events, first, last) {
  const a = events.findIndex(row => row.event === first), b = events.findIndex(row => row.event === last);
  assert.ok(a >= 0 && b > a, `${first} must precede ${last}`);
}
for (const mode of ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9"]) test(mode + " bounded transport observability", { timeout: 10000 }, async () => {
  const attempt = `P1-${mode}-${crypto.randomUUID()}`, file = path.join(output, mode + ".jsonl");
  const log = observe.logger(attempt, "fixture-client", file);
  let child, exit, childResult, port, restore;
  try {
    log("fixture.start");
    if (mode === "E6") {
      const listener = net.createServer(); listener.listen(0, "127.0.0.1"); await once(listener, "listening"); port = listener.address().port;
      await new Promise(resolve => listener.close(resolve)); log("endpoint.unavailable", { port });
    } else {
      child = fork(path.join(__dirname, "fixture.cjs"), [mode, attempt, file], { stdio: ["ignore", "ignore", "pipe", "ipc"], env: {} });
      // Capture no raw stderr; the monitor supplies bounded error name/code.
      child.stderr.resume();
      exit = new Promise((resolve, reject) => { child.once("error", reject); child.once("exit", (code, signal) => { childResult = { code, signal }; log("child.exit", { child_pid: child.pid, code, signal }); resolve(childResult); }); });
      const [ready] = await once(child, "message"); port = ready.port;
    }
    log("fixture.ready", { port, child_pid: child?.pid });
    restore = observe.clientEvents(port, log);
    const request = fetch(`http://127.0.0.1:${port}`, { headers: { authorization: "P1_SECRET_SENTINEL" } });
    if (mode === "E1" || mode === "E8") {
      assert.equal((await (await request).json()).count, 1);
      log("client.assertions.complete");
    } else {
      let original;
      await assert.rejects(request, error => { original = error; assert.equal(error.name, "TypeError"); assert.ok(error.cause?.code); log("client.expected.failure", { error: observe.errorValue(error) }); return true; });
      assert.ok(original.cause, "original cause remains attached");
      if (mode === "E6") assert.equal(original.cause.code, "ECONNREFUSED");
    }
    if (["E3", "E4"].includes(mode)) await exit;
    else if (child && !childResult) { child.send("cleanup"); await exit; }
    else if (exit) await exit;
    log("fixture.completed");
    const events = rows(file);
    before(events, "fixture.ready", "client.fetch.start");
    assert.equal(events.filter(row => row.event === "client.request.create").length, 1, "exactly one request; no retry");
    if (mode === "E1" || mode === "E8") {
      for (const event of ["server.listening", "server.connection", "server.request", "server.handler.enter", "server.handler.return", "server.response.finish", "client.connected", "client.response.headers", "client.response.body.complete", "server.close.completed", "cleanup.completed"]) assert.ok(events.some(row => row.event === event), event);
      before(events, "client.assertions.complete", "cleanup.requested");
      assert.equal(events.some(row => row.event === "client.fetch.error"), false);
    } else {
      before(events, "client.request.create", "client.fetch.error");
      assert.equal(events.some(row => row.event === "client.response.body.complete"), false);
      const signature = { E2: "fault.close.before.response", E3: "fault.process.exit", E4: "server.handler.throw", E5: "fault.socket.reset", E6: "endpoint.unavailable", E7: "cleanup.requested", E9: "fault.close.before.response" }[mode];
      before(events, signature, "client.fetch.error");
      if (["E2", "E7", "E9"].includes(mode)) before(events, "server.close.requested", "client.fetch.error");
      if (mode === "E3") { assert.equal(childResult.code, 23); assert.ok(events.some(row => row.event === "process.exit" && row.code === 23)); }
      if (mode === "E4") { assert.equal(childResult.code, 1); before(events, "server.handler.throw", "process.uncaught"); }
      if (mode === "E5") assert.ok(events.some(row => row.event === "client.request.error" && row.error.code));
    }
    // Marker-bearing authorization and payload inputs never enter this logger.
    assert.doesNotMatch(fs.readFileSync(file, "utf8"), /P1_SECRET_SENTINEL|CONTROLLED_HANDLER_FAILURE|authorization|password|BEGIN .*PRIVATE KEY/);
  } finally {
    restore?.();
    if (child && !childResult) { child.kill("SIGKILL"); await exit; }
    assert.ok(!child || childResult, "child reaped");
  }
});
