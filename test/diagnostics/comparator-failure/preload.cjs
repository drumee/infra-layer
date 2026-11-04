"use strict";
const Module = require("node:module"), path = require("node:path");
const C = require("./capture.cjs"), target = path.resolve(process.env.D1_TARGET_FILE);
C.mark("process-start", { node: process.version, test_context: process.env.NODE_TEST_CONTEXT || null, argv: process.argv });
const compile = Module.prototype._compile;
Module.prototype._compile = function observedCompile(content, filename) {
  if (path.resolve(filename) !== target) return Reflect.apply(compile, this, arguments);
  C.mark("target-load-start", { file: filename });
  try { const result = Reflect.apply(compile, this, arguments); C.mark("target-load-complete", { file: filename }); return result; }
  catch (cause) { C.observeError("target-load-error", cause); throw cause; }
};
// Observe emission without adding rejection handlers: default fatal behavior and
// Node's own test-runner handlers retain the same listeners and return value.
const emit = process.emit;
process.emit = function observedEmit(kind, ...args) {
  if (kind === "unhandledRejection") C.observeError("unhandled-rejection", args[0]);
  return Reflect.apply(emit, this, [kind, ...args]);
};
process.on("uncaughtExceptionMonitor", cause => C.observeError("uncaught-exception-monitor", cause));
process.on("exit", code => C.mark("process-exit", { code }));
