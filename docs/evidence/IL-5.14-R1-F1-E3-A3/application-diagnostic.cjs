"use strict";
const fs = require("node:fs"), cp = require("node:child_process"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const root = "/home/somanos/github/infra-layer", D = require(root + "/lifecycle/docker"), L = require(root + "/lifecycle");
const project = "drumee-il5-" + crypto.randomBytes(4).toString("hex"), name = project + "-application", marker = "org.drumee.qualification", commands = [];
const report = { attempt: "A3-APP-DIAGNOSTIC-1", project, source: cp.execFileSync("/usr/bin/git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(), commands };
function docker(args) { try { const text = D.docker(args).trim(); commands.push({ args, exit: 0 }); return text; } catch (e) { commands.push({ args, exit: e.exit_status, code: e.code }); throw e; } }
const inspect = id => JSON.parse(docker(["container", "inspect", "--format", '{{json .}}', id]));
async function main() {
 let built, net, id;
 try {
  assert.equal(docker(["ps", "-aq", "--filter", "label=" + marker + "=" + project]), "");
  built = require(root + "/test/application/build").build(project);
  const values = require(root + "/test/support/application-inputs").applicationInputs("/unused", project, built.image); values.distribution.application.environment = { APP_CRASH: "1" };
  const composition = L.composeDeployment(values.plan(), values.distribution); report.canonicalNetworks = composition.compose.networks; report.canonicalService = { networks: composition.compose.services.application.networks, restart: composition.compose.services.application.restart, environment: { APP_CRASH: "1" } };
  net = docker(["network", "create", "--label", marker + "=" + project, "--label", "org.drumee.infra.owner=" + project, "--label", "com.docker.compose.project=" + project, name]);
  id = docker(["run", "-d", "--name", project + "-application-1", "--network", name, "--restart", composition.compose.services.application.restart, "--label", marker + "=" + project, "--label", "org.drumee.infra.owner=" + project, "--label", "com.docker.compose.project=" + project, "--label", "com.docker.compose.service=application", "--env", "APP_CRASH=1", "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true", "--pids-limit", "64", "--memory", "128m", built.image]);
  const deadline = performance.now() + 8000; let value;
  for (;;) { value = inspect(id); if (value.State.Restarting) break; if (performance.now() > deadline) throw Error("RESTART_STATE_NOT_OBSERVED"); await new Promise(resolve => setTimeout(resolve, 25)); }
  report.observation = { id, name: value.Name, labels: value.Config.Labels, state: value.State, observedNetworks: value.NetworkSettings.Networks, expectedNetworkID: net, require_existing: true };
  try { D.checkNetworks(composition, { require_existing: true }); report.validation = { result: "ACCEPTED" }; }
  catch (error) { report.validation = { result: "REFUSED", code: error.code, stack: error.stack }; }
  assert.equal(report.validation.code, "NETWORK_ATTACHMENT_MISMATCH"); report.diagnostic = "REPRODUCED_WITH_CANONICAL_CRASH_AND_RESTART_POLICY";
 } finally {
  if (id) { assert.equal(inspect(id).Config.Labels[marker], project); docker(["stop", "--time", "2", id]); docker(["rm", id]); }
  if (net) { const v = JSON.parse(docker(["network", "inspect", "--format", "{{json .}}", net])); assert.equal(v.Labels[marker], project); docker(["network", "rm", net]); }
  if (built) { assert.equal(docker(["image", "inspect", built.tag, "--format", '{{index .Config.Labels "org.drumee.infra.owner"}}']), project); docker(["image", "rm", built.tag]); }
  report.cleanup = "PASS"; fs.writeFileSync(__dirname + "/application-diagnostic.json", JSON.stringify(report, null, 2) + "\n", { mode: 0o600 });
 }
 console.log(JSON.stringify({ diagnostic: report.diagnostic, state: report.observation.state, networks: report.observation.observedNetworks, validation: report.validation, cleanup: report.cleanup }));
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
