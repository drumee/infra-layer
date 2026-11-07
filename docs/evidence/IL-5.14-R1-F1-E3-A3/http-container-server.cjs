"use strict";
const http = require("node:http"), fs = require("node:fs");
const state = { connections: [], requests: [] }; let sequence = 0;
const save = () => fs.writeFileSync("/state/state.json", JSON.stringify(state, null, 2) + "\n", { mode: 0o600 });
const server = http.createServer((req, res) => { state.requests.push({ time: Date.now(), socket: req.socket.diagnosticId, method: req.method }); res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ count: 1 })); save(); });
server.on("connection", socket => { const row = { id: ++sequence, opened: Date.now(), local: socket.localAddress, localPort: socket.localPort, remote: socket.remoteAddress, remotePort: socket.remotePort, closed: false }; socket.diagnosticId = row.id; state.connections.push(row); save(); socket.on("close", () => { row.closed = true; row.closedAt = Date.now(); row.bytesRead = socket.bytesRead; row.bytesWritten = socket.bytesWritten; save(); }); });
server.listen(8025, "0.0.0.0", () => { state.server = { pid: process.pid, node: process.version, keepAliveTimeout: server.keepAliveTimeout, keepAliveTimeoutBuffer: server.keepAliveTimeoutBuffer }; save(); });
process.on("SIGTERM", () => server.close(() => process.exit(0)));
