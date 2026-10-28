"use strict";
const http = require("node:http");
const observe = require("./observe.cjs");
const config = require("./attempt.json");
const log = observe.logger(config.attempt, "capture", "/capture/.p1-http.jsonl");
observe.processEvents(log);
const original = http.createServer;
// Fixed capture entry point creates exactly one HTTP server with a sync handler.
http.createServer = function(callback) {
  http.createServer = original;
  return observe.serverEvents(original(observe.handler(log, callback)), log);
};
// Capture already handles SIGTERM. Observing it must not introduce a handler.
const emit = process.emit;
process.emit = function(event, ...args) { if (event === "SIGTERM") log("process.sigterm"); return emit.call(this, event, ...args); };
