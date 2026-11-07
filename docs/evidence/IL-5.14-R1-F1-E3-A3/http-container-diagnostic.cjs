"use strict";
const fs = require("node:fs"), path = require("node:path"), net = require("node:net"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const root = "/home/somanos/github/infra-layer", D = require(root + "/lifecycle/docker"), image = require(root + "/test/support/application-inputs").helper;
const project = "drumee-a3-http-" + crypto.randomBytes(4).toString("hex"), marker = "org.drumee.qualification", commands = [], report = { attempt: "A3-HTTP-DIAGNOSTIC-2-DOCKER-PUBLISHED", project, image, commands, integrationRerun: false };
const docker = args => { try { const out = D.docker(args).trim(); commands.push({ args, exit: 0 }); return out; } catch (e) { commands.push({ args, exit: e.exit_status, code: e.code }); throw e; } };
async function main() {
 let network, container;
 const stateDir = fs.mkdtempSync(path.join(__dirname, "docker-http-state-")); fs.chmodSync(stateDir, 0o700); report.stateDirectory = stateDir;
 try {
  const port = await new Promise(resolve => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => resolve(p)); }); });
  network = docker(["network", "create", "--label", marker + "=" + project, project]);
  container = docker(["run", "-d", "--name", project, "--label", marker + "=" + project, "--label", "org.drumee.infra.owner=" + project, "--network", project, "--user", process.getuid() + ":" + process.getgid(), "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true", "--pids-limit", "32", "--memory", "64m", "--publish", "127.0.0.1:" + port + ":8025", "--mount", "type=bind,source=" + path.join(__dirname, "http-container-server.cjs") + ",target=/server.cjs,readonly", "--mount", "type=bind,source=" + path.join(__dirname, "http-container-wait.cjs") + ",target=/wait.cjs,readonly", "--mount", "type=bind,source=" + stateDir + ",target=/state", image, "node", "/server.cjs"]);
  const file = path.join(stateDir, "state.json"), deadline = performance.now() + 5000;
  while (!fs.existsSync(file)) { if (performance.now() > deadline) throw Error("HTTP_SERVER_NOT_READY"); await new Promise(resolve => setTimeout(resolve, 25)); }
  const endpoint = "http://127.0.0.1:" + port; report.endpoint = { url: endpoint, method: "GET" }; report.container = container; report.first = await (await fetch(endpoint)).json();
  await new Promise(resolve => setTimeout(resolve, 200)); report.second = await (await fetch(endpoint)).json();
  const start = performance.now(); report.closedConnection = JSON.parse(docker(["exec", container, "node", "/wait.cjs"])); report.blockedClientMs = performance.now() - start;
  try { report.afterClose = { result: "SUCCESS", body: await (await fetch(endpoint)).json() }; }
  catch (error) { report.afterClose = { result: "FAILURE", message: error.message, causeCode: error.cause?.code, socket: error.cause?.socket, stack: error.stack }; }
  report.observedState = JSON.parse(fs.readFileSync(file)); report.hypothesisReproduced = report.afterClose.causeCode === "UND_ERR_SOCKET";
 } finally {
  if (container) { const labels = JSON.parse(docker(["inspect", "--format", "{{json .Config.Labels}}", container])); assert.equal(labels[marker], project); docker(["stop", "--time", "2", container]); docker(["rm", container]); }
  if (network) { const labels = JSON.parse(docker(["network", "inspect", "--format", "{{json .Labels}}", network])); assert.equal(labels[marker], project); docker(["network", "rm", network]); }
  report.cleanup = "PASS"; fs.writeFileSync(path.join(__dirname, "http-container-diagnostic.json"), JSON.stringify(report, null, 2) + "\n", { mode: 0o600 });
 }
 console.log(JSON.stringify({ hypothesisReproduced: report.hypothesisReproduced, afterClose: report.afterClose, server: report.observedState.server, connections: report.observedState.connections, cleanup: report.cleanup }));
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
