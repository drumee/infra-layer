"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), http = require("node:http"), { EventEmitter } = require("node:events");
const { probe } = require("../../lifecycle/external-gateway");
const prepared = { composition: { distribution: { external_gateway: { host_address: "127.0.0.1", host_port: 28971, container_port: 3101, readiness_path: "/-/svc/health.ready", route_prefix: "/-/", rpc_prefix: "/-/svc/", tls_termination: "external" } } } };
function response(t) {
  const req = new EventEmitter(), res = new EventEmitter(); res.statusCode = 200;
  req.destroy = () => req.emit("error", new Error("closed")); let callback;
  t.mock.method(http, "get", (options, fn) => { assert.equal(options.hostname, "127.0.0.1"); callback = fn; return req; });
  const pending = probe(prepared); callback(res); return { req, res, pending };
}
test("application probe accepts health once and ignores a late error", async t => {
  const { req, res, pending } = response(t); res.emit("data", Buffer.from('{"status":"ok"}')); res.emit("end"); req.emit("error", new Error("late"));
  assert.equal((await pending).protocol_functional, true);
});
test("application probe rejects malformed, oversized and failed HTTP health", async t => {
  for (const kind of ["malformed", "oversized", "status"]) {
    const { res, pending } = response(t); const rejected = assert.rejects(pending, { code: "APPLICATION_PROTOCOL_FAILED" });
    if (kind === "status") res.statusCode = 503;
    res.emit("data", Buffer.from(kind === "oversized" ? "x".repeat(4097) : kind === "malformed" ? "invalid" : '{"status":"ok"}'));
    res.emit("end"); await rejected; t.mock.restoreAll();
  }
});
test("application probe request/response errors stay failed after late success", async t => {
  for (const event of ["request", "response"]) {
    const { req, res, pending } = response(t); const rejected = assert.rejects(pending, { code: "APPLICATION_PROTOCOL_FAILED" });
    (event === "request" ? req : res).emit("error", new Error("failed")); res.emit("data", Buffer.from('{"status":"ok"}')); res.emit("end"); await rejected; t.mock.restoreAll();
  }
});
test("application probe timeout rejects once despite response and destroy errors", async t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { res, pending } = response(t), rejected = assert.rejects(pending, { code: "APPLICATION_PROTOCOL_FAILED" });
  t.mock.timers.tick(5000); res.emit("data", Buffer.from('{"status":"ok"}')); res.emit("end"); await rejected;
});
test("application probe is inapplicable without an external gateway", async () => {
  assert.deepEqual(await probe({ composition: { distribution: {} } }), { applicable: false });
});
