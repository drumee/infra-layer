"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), http = require("node:http"), net = require("node:net"), path = require("node:path");
const { spawn } = require("node:child_process");
function run(input) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.resolve(__dirname, "../application/network-client.cjs")], { stdio: ["pipe", "pipe", "pipe"] });
    let output = ""; child.stdout.on("data", bytes => output += bytes); child.stderr.resume(); child.on("error", reject); child.on("exit", code => resolve({ code, output })); child.stdin.on("error", reject); child.stdin.end(JSON.stringify(input));
  });
}
async function listen(server) { await new Promise(resolve => server.listen(0, "127.0.0.1", resolve)); return server.address().port; }
async function close(server) { await new Promise(resolve => server.close(resolve)); }
test("fixed network program treats malformed or code-shaped stdin as data", async () => {
  for (const input of [{ lan: "127.0.0.1;process.exit(0)", control_port: 1234, application_port: 2345, nonce: "a".repeat(32) }, { lan: "127.0.0.1", control_port: 1234, application_port: "process.exit(0)", nonce: "a".repeat(32) }]) assert.equal((await run(input)).code, 1);
});
test("fixed network program requires a positive control and rejects accessible application", async () => {
  const nonce = "a".repeat(32), control = http.createServer((request, response) => response.end(nonce));
  const control_port = await listen(control), application = net.createServer(socket => socket.end()), application_port = await listen(application);
  const input = { lan: "127.0.0.1", control_port, application_port, nonce };
  try {
    assert.equal((await run(input)).code, 1);
    await close(application);
    const refused = await run(input); assert.equal(refused.code, 0); assert.deepEqual(JSON.parse(refused.output), { control_route: true, application_non_loopback: "ECONNREFUSED" });
    assert.equal((await run({ ...input, nonce: "b".repeat(32) })).code, 1);
  } finally { if (application.listening) await close(application); await close(control); }
});
