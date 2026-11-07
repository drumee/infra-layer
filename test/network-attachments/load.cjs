"use strict";
const child = require("node:child_process"), { mock } = require("node:test");
const filename = require.resolve("../../lifecycle/docker");
function load(execute) {
  if (arguments.length !== 1 || typeof execute !== "function") throw new Error("FIXED_CANONICAL_MODULE_REQUIRED");
  const previous = require.cache[filename], substitute = mock.method(child, "execFileSync", execute);
  try {
    delete require.cache[filename];
    return require("../../lifecycle/docker");
  } finally {
    substitute.mock.restore();
    if (previous) require.cache[filename] = previous;
    else delete require.cache[filename];
  }
}
module.exports = { load };
