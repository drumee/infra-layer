"use strict";
const fs = require("node:fs"), dc = require("node:diagnostics_channel"), path = require("node:path");
const metadata = JSON.parse(fs.readFileSync(process.env.IL2_METADATA)), file = path.join(__dirname, "services-socket-observation.jsonl"), sockets = new WeakSet();
const log = (event, values) => fs.appendFileSync(file, JSON.stringify({ timestamp: new Date().toISOString(), event, project: metadata.project, capturePort: metadata.ports.capture, ...values }) + "\n", { mode: 0o600 });
const selected = request => { try { return new URL(String(request.origin)).port === String(metadata.ports.capture); } catch { return false; } };
function socketValue(socket) { return socket && { localAddress: socket.localAddress, localPort: socket.localPort, remoteAddress: socket.remoteAddress, remotePort: socket.remotePort, bytesRead: socket.bytesRead, bytesWritten: socket.bytesWritten, destroyed: socket.destroyed }; }
log("observer.begin", { node: process.version, pid: process.pid, target: "http://127.0.0.1:" + metadata.ports.capture, method: "GET", integrationQualification: false });
dc.subscribe("undici:request:create", ({ request }) => { if (selected(request)) log("request.create", { method: request.method, path: request.path }); });
dc.subscribe("undici:client:sendHeaders", ({ request, socket }) => { if (!selected(request)) return; log("request.socket", { socket: socketValue(socket) }); if (!sockets.has(socket)) { sockets.add(socket); socket.on("close", hadError => log("socket.close", { hadError, socket: socketValue(socket) })); socket.on("end", () => log("socket.end", { socket: socketValue(socket) })); } });
dc.subscribe("undici:request:headers", ({ request, response }) => { if (selected(request)) log("response.headers", { statusCode: response.statusCode }); });
dc.subscribe("undici:request:error", ({ request, error }) => { if (selected(request)) log("request.error", { code: error.code, causeCode: error.cause?.code, message: error.message, socket: socketValue(error.socket || error.cause?.socket) }); });
process.on("exit", code => log("observer.exit", { code }));
