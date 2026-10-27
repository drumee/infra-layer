"use strict";
const fs = require("node:fs"), path = require("node:path");
const file = path.join(__dirname, "http-server-state.json"), deadline = performance.now() + 8500;
function poll() {
 const state = JSON.parse(fs.readFileSync(file));
 if (state.connections[0]?.closed) { console.log(JSON.stringify({ firstConnectionClosed: true, server: state.server, connection: state.connections[0] })); return; }
 if (performance.now() > deadline) { console.error("REMOTE_CLOSE_NOT_OBSERVED"); process.exitCode = 1; return; }
 setTimeout(poll, 20);
}
poll();
