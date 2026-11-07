"use strict";
// Opt-in, process-local P1 observations. Never records headers, bodies or error messages.
const fs = require("node:fs");
const dc = require("node:diagnostics_channel");
const { errorMonitor } = require("node:events");
const { randomUUID } = require("node:crypto");
function errorValue(error, depth = 0) {
  if (!error || depth > 5) return undefined;
  return { name: error.name, code: error.code, cause: errorValue(error.cause, depth + 1), socket: socketValue(error.socket) };
}
function socketValue(socket) {
  if (!socket) return undefined;
  return Object.fromEntries(["localAddress", "localPort", "remoteAddress", "remotePort", "bytesRead", "bytesWritten", "destroyed"].map(key => [key, socket[key]]));
}
function logger(attempt, role, file) {
  let sequence = 0;
  const process_instance = randomUUID();
  return (event, fields = {}) => {
    if (++sequence > 4096) throw new Error("P1_DIAGNOSTIC_EVENT_LIMIT");
    const row = JSON.stringify({ attempt, role, pid: process.pid, process_instance, sequence, mono_ns: process.hrtime.bigint().toString(), utc: new Date().toISOString(), event, ...fields });
    if (file) fs.appendFileSync(file, row + "\n", { mode: 0o600 });
    else fs.writeSync(1, "P1_HTTP " + row + "\n");
  };
}
function processEvents(log) {
  log("process.start", { node: process.version, undici: process.versions.undici });
  // Monitor does not handle the exception or change the default fatal behavior.
  process.on("uncaughtExceptionMonitor", error => log("process.uncaught", { error: errorValue(error) }));
  process.on("exit", code => log("process.exit", { code }));
}
function handler(log, callback) {
  let next = 0;
  return function(request, response) {
    const request_id = ++next;
    const fields = () => ({ request_id, headers_sent: response.headersSent, ended: response.writableEnded, finished: response.writableFinished });
    log("server.request", { request_id, method: request.method, socket: socketValue(request.socket) });
    response.on("finish", () => log("server.response.finish", fields()));
    response.on("close", () => log("server.response.close", fields()));
    response.on(errorMonitor, error => log("server.response.error", { request_id, error: errorValue(error) }));
    request.on(errorMonitor, error => log("server.request.error", { request_id, error: errorValue(error) }));
    log("server.handler.enter", { request_id });
    try {
      // The actual capture handler is synchronous. Return its original value.
      const result = callback.call(this, request, response);
      log("server.handler.return", fields());
      return result;
    } catch (error) {
      log("server.handler.throw", { request_id, error: errorValue(error) });
      throw error;
    }
  };
}
function serverEvents(server, log) {
  let next = 0;
  server.on("listening", () => log("server.listening", { address: server.address(), requestTimeout: server.requestTimeout, headersTimeout: server.headersTimeout, timeout: server.timeout, keepAliveTimeout: server.keepAliveTimeout, keepAliveTimeoutBuffer: server.keepAliveTimeoutBuffer }));
  server.on("connection", socket => {
    const connection_id = ++next;
    log("server.connection", { connection_id, socket: socketValue(socket) });
    socket.on("end", () => log("server.socket.end", { connection_id, socket: socketValue(socket) }));
    socket.on("close", had_error => log("server.socket.close", { connection_id, had_error, socket: socketValue(socket) }));
    socket.on(errorMonitor, error => log("server.socket.error", { connection_id, error: errorValue(error) }));
  });
  server.on(errorMonitor, error => log("server.error", { error: errorValue(error) }));
  server.on("close", () => log("server.close.completed"));
  const close = server.close;
  server.close = function(...args) { log("server.close.requested"); return close.apply(this, args); };
  return server;
}
function clientEvents(port, log) {
  const subscriptions = [], requests = new WeakMap(), sockets = new WeakMap();
  let nextRequest = 0, nextSocket = 0, nextFetch = 0;
  const selected = request => request && String(request.origin) === `http://127.0.0.1:${port}`;
  const subscribe = (name, callback) => { dc.subscribe(name, callback); subscriptions.push([name, callback]); };
  const socketId = socket => {
    if (!sockets.has(socket)) {
      const connection_id = ++nextSocket; sockets.set(socket, connection_id);
      socket.on("end", () => log("client.socket.end", { connection_id, socket: socketValue(socket) }));
      socket.on("close", had_error => log("client.socket.close", { connection_id, had_error, socket: socketValue(socket) }));
      socket.on(errorMonitor, error => log("client.socket.error", { connection_id, error: errorValue(error) }));
    }
    return sockets.get(socket);
  };
  subscribe("undici:request:create", ({ request }) => { if (selected(request)) { requests.set(request, ++nextRequest); log("client.request.create", { request_id: nextRequest, method: request.method, host: "127.0.0.1", port }); } });
  subscribe("undici:client:sendHeaders", ({ request, socket }) => { if (selected(request)) log("client.request.socket", { request_id: requests.get(request), connection_id: socketId(socket), socket: socketValue(socket) }); });
  subscribe("undici:request:headers", ({ request, response }) => { if (selected(request)) log("client.response.headers", { request_id: requests.get(request), status: response.statusCode }); });
  subscribe("undici:request:trailers", ({ request }) => { if (selected(request)) log("client.response.body.complete", { request_id: requests.get(request) }); });
  subscribe("undici:request:error", ({ request, error }) => { if (selected(request)) log("client.request.error", { request_id: requests.get(request), error: errorValue(error) }); });
  for (const name of ["beforeConnect", "connected", "connectError"]) subscribe("undici:client:" + name, ({ connectParams, socket, error }) => {
    if (String(connectParams.port) === String(port) && connectParams.hostname === "127.0.0.1") log("client." + name, { connection_id: socket ? socketId(socket) : undefined, socket: socketValue(socket), error: errorValue(error) });
  });
  const original = globalThis.fetch;
  globalThis.fetch = function(input, options) {
    if (String(input) !== `http://127.0.0.1:${port}` && String(input) !== `http://127.0.0.1:${port}/`) return original.call(this, input, options);
    const fetch_id = ++nextFetch, signal = options?.signal;
    log("client.fetch.start", { fetch_id, host: "127.0.0.1", port, signal_present: !!signal, aborted: signal?.aborted || false });
    const aborted = () => log("client.fetch.abort", { fetch_id, aborted: true });
    signal?.addEventListener("abort", aborted, { once: true });
    return original.call(this, input, options).then(response => { log("client.fetch.headers", { fetch_id, status: response.status }); return response; }, error => { log("client.fetch.error", { fetch_id, error: errorValue(error), aborted: signal?.aborted || false }); throw error; }).finally(() => signal?.removeEventListener("abort", aborted));
  };
  return () => { globalThis.fetch = original; for (const [name, callback] of subscriptions) dc.unsubscribe(name, callback); };
}
module.exports = { logger, processEvents, handler, serverEvents, clientEvents, errorValue };
