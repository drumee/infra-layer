"use strict";
const child = require("node:child_process"), path = require("node:path"), fs = require("node:fs"), http = require("node:http"), assert = require("node:assert/strict");
async function main() {
 const server = child.fork(path.join(__dirname, "health-server.cjs"), [], { stdio: ["ignore", "ignore", "inherit", "ipc"] }), report = { attempt: "A3-HTTP-DIAGNOSTIC-1", node: process.version, clientPid: process.pid, retry: false };
 try {
  report.server = await new Promise((resolve, reject) => { server.once("message", resolve); server.once("error", reject); });
  const url = "http://127.0.0.1:" + report.server.port; report.endpoint = { url, method: "GET", protocol: "HTTP control JSON, not SMTP" };
  const first = await fetch(url); report.first = { status: first.status, connection: first.headers.get("connection"), keepAlive: first.headers.get("keep-alive"), body: await first.json() };
  const start = performance.now(); report.remoteClose = JSON.parse(child.execFileSync(process.execPath, [path.join(__dirname, "wait-close.cjs")], { encoding: "utf8", timeout: 10000 })); report.clientEventLoopBlockedMs = performance.now() - start;
  try { const response = await fetch(url); report.second = { result: "SUCCESS", body: await response.json() }; }
  catch (error) { report.second = { result: "FAILURE", name: error.name, message: error.message, causeCode: error.cause?.code, socket: error.cause?.socket, stack: error.stack }; }
  assert.equal(report.second.causeCode, "UND_ERR_SOCKET");
  report.freshConnection = await new Promise((resolve, reject) => { const request = http.get(url, { agent: false }, response => { let body = ""; response.on("data", b => body += b); response.on("error", reject); response.on("end", () => resolve({ status: response.statusCode, body: JSON.parse(body) })); }); request.on("error", reject); request.setTimeout(5000, () => request.destroy(Error("CONTROL_TIMEOUT"))); });
  assert.equal(report.freshConnection.status, 200); report.serverState = JSON.parse(fs.readFileSync(path.join(__dirname, "http-server-state.json"))); report.diagnostic = "POOLED_SOCKET_REMOTE_IDLE_CLOSE_DURING_BLOCKED_CLIENT_LOOP";
 } finally {
  const exited = new Promise(resolve => server.once("exit", resolve)); server.kill("SIGTERM"); await exited; report.cleanup = "HTTP_CHILD_STOPPED";
  fs.writeFileSync(path.join(__dirname, "http-diagnostic.json"), JSON.stringify(report, null, 2) + "\n", { mode: 0o600 });
 }
 console.log(JSON.stringify(report));
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
