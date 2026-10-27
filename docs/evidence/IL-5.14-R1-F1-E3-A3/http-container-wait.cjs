"use strict";
const fs = require("node:fs"), deadline = performance.now() + 8500;
function poll() { const s = JSON.parse(fs.readFileSync("/state/state.json")); if (s.connections[0]?.closed) { console.log(JSON.stringify(s.connections[0])); return; } if (performance.now() > deadline) { console.error("IDLE_CLOSE_NOT_OBSERVED"); process.exitCode = 1; return; } setTimeout(poll, 20); }
poll();
