"use strict";
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const { createRequire } = require("node:module");
const filename = path.resolve(__dirname, "../../lifecycle/docker.js"), realRequire = createRequire(filename);
function load(execute, source = fs.readFileSync(filename, "utf8")) {
  const module = { exports: {} }; let elapsed = 0;
  const context = { module, exports: module.exports, Buffer, process, console, SharedArrayBuffer, Int32Array,
    Atomics: { wait() { elapsed += 1000; } },
    require(name) {
      if (name === "node:child_process") return { execFileSync: execute };
      if (name === "node:perf_hooks") return { performance: { now: () => elapsed } };
      return realRequire(name);
    }
  };
  vm.runInNewContext(source, context, { filename });
  return module.exports;
}
module.exports = { load };
