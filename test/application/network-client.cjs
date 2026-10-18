"use strict";
// Fixed qualification program: data arrives over stdin, never as source code.
const http = require("node:http"), net = require("node:net");
async function main() {
  let text = "";
  for await (const bytes of process.stdin) {
    text += bytes;
    if (text.length > 4096) throw new Error("NETWORK_INPUT_TOO_LARGE");
  }
  const input = JSON.parse(text), port = value => Number.isInteger(value) && value >= 1024 && value <= 65535;
  if (!net.isIPv4(input.lan) || !port(input.control_port) || !port(input.application_port) || !/^[a-f0-9]{32}$/.test(input.nonce)) throw new Error("INVALID_NETWORK_INPUT");
  const control = await new Promise((resolve, reject) => {
    const request = http.get({ hostname: input.lan, port: input.control_port }, response => {
      let body = "";
      response.on("data", bytes => { body += bytes; if (body.length > 64) request.destroy(new Error("INVALID_CONTROL_RESPONSE")); });
      response.on("error", reject); response.on("end", () => resolve(body));
    });
    request.setTimeout(4000, () => request.destroy(new Error("CONTROL_TIMEOUT"))); request.on("error", reject);
  });
  if (control !== input.nonce) throw new Error("CONTROL_ROUTE_FAILED");
  const result = await new Promise((resolve, reject) => {
    const socket = net.connect({ host: input.lan, port: input.application_port });
    socket.setTimeout(3000, () => { socket.destroy(); resolve("timeout"); });
    socket.on("connect", () => { socket.destroy(); reject(new Error("PUBLIC_APPLICATION_EXPOSURE")); });
    socket.on("error", error => ["ECONNREFUSED", "ETIMEDOUT", "EHOSTUNREACH"].includes(error.code) ? resolve(error.code) : reject(error));
  });
  console.log(JSON.stringify({ control_route: true, application_non_loopback: result }));
}
main().catch(() => { process.exitCode = 1; });
