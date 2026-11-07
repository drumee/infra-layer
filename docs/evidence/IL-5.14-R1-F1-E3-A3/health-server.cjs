"use strict";
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
const file = path.join(__dirname, "http-server-state.json"), state = { connections: [], requests: [] }; let sequence = 0;
const save = () => fs.writeFileSync(file, JSON.stringify(state, null, 2) + "\n", { mode: 0o600 });
const server = http.createServer((req, res) => { state.requests.push({ timestamp: new Date().toISOString(), method: req.method, path: req.url, socket: req.socket.diagnosticId }); res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ count: 1 })); save(); });
server.on("connection", socket => { const row = { id: ++sequence, localAddress: socket.localAddress, localPort: socket.localPort, remoteAddress: socket.remoteAddress, remotePort: socket.remotePort, opened: new Date().toISOString(), closed: false }; socket.diagnosticId = row.id; state.connections.push(row); save(); socket.on("close", () => { row.closed = true; row.closedAt = new Date().toISOString(); row.bytesRead = socket.bytesRead; row.bytesWritten = socket.bytesWritten; save(); }); });
server.listen(0, "127.0.0.1", () => { state.server = { pid: process.pid, node: process.version, port: server.address().port, keepAliveTimeout: server.keepAliveTimeout, keepAliveTimeoutBuffer: server.keepAliveTimeoutBuffer }; save(); process.send(state.server); });
process.on("SIGTERM", () => server.close(() => process.exit(0)));
