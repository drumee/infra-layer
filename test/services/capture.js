"use strict";
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { SMTPServer } = require("smtp-server");
const root = "/capture";
function trace(event, session) { console.log("IL2_CAPTURE_TRACE " + JSON.stringify({ event, session: session?.id, utc: new Date().toISOString(), mono_ns: process.hrtime.bigint().toString() })); }
let sequence = fs.readdirSync(root).filter((name) => name.endsWith(".eml")).length;
const smtp = new SMTPServer({ secure: false, key: fs.readFileSync("/keys/leaf"), cert: fs.readFileSync("/keys/certificate"), size: 1048576,
  authOptional: process.env.CAPTURE_REQUIRE_AUTH !== "1", disabledCommands: [], logger: false,
  onConnect(session, callback) { trace("connect", session); callback(); },
  onSecure(socket, session, callback) { trace("tls.established", session); callback(); },
  onClose(session) { trace("close", session); },
  onAuth(auth, session, callback) { const password = fs.readFileSync("/keys/relay-auth", "utf8").trim(); if (auth.username !== "capture" || auth.password !== password) { trace("auth.rejected", session); return callback(new Error("Authentication rejected")); } trace("auth.accepted", session); callback(null, { user: "capture" }); },
  onData(stream, session, callback) { const chunks = []; let size = 0; stream.on("data", (chunk) => { size += chunk.length; if (size <= 1048576) chunks.push(chunk); }); stream.on("end", () => { if (size > 1048576) return callback(new Error("Message exceeds fixture limit")); fs.writeFileSync(path.join(root, `${++sequence}.eml`), Buffer.concat(chunks), { mode: 0o600 }); trace("message.captured", session); callback(null, "Captured locally"); }); }
});
smtp.listen(2525, "0.0.0.0", () => trace("smtp.listening"));
const health = http.createServer((request, response) => { response.writeHead(200, { "content-type": "application/json" }); response.end(JSON.stringify({ count: sequence, tls: true, authentication_required: process.env.CAPTURE_REQUIRE_AUTH === "1" })); }); health.listen(8025, "0.0.0.0", () => trace("http.listening"));
process.on("SIGTERM", () => { trace("shutdown.begin"); smtp.close(() => { health.close(() => process.exit(0)); }); });
