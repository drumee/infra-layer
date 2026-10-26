"use strict";
const fs = require("node:fs"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const root = "/home/somanos/github/infra-layer", D = require(root + "/lifecycle/docker"), readiness = require(root + "/internal/network-readiness").createNetworkReadiness();
const project = "drumee-r1-net-" + crypto.randomBytes(6).toString("hex"), primary = project + "-kernel", additional = project + "-external", marker = "org.drumee.qualification";
const image = require(root + "/test/support/service-inputs").serviceInputs().adapter_input.services.redis.image;
const commands = [], resources = [], report = { hypothesis: "Network isolation should reject an undeclared additional network on an otherwise authorized container", project, image, expected: "nominal accepted; extra undeclared attachment refused", sourceRevision: "cd9b8322bd7eef3b4094710ec4ea26be94f08922" };
function docker(args) { const started = new Date().toISOString(); try { const value = D.docker(args).trim(); commands.push({ args, started, exitCode: 0 }); return value; } catch (error) { commands.push({ args, started, exitCode: error.exit_status, code: error.code }); throw error; } }
const inspect = id => JSON.parse(docker(["container", "inspect", "--format", "{{json .}}", id]));
async function main() {
 let container;
 try {
  assert.equal(docker(["ps", "-aq", "--filter", "name=^/" + project]), "");
  for (const [name, owner] of [[primary, project], [additional, "external-network-fixture"]]) {
   assert.equal(docker(["network", "ls", "-q", "--filter", "name=^" + name + "$"]), "");
   const id = docker(["network", "create", "--label", marker + "=" + project, "--label", "org.drumee.infra.owner=" + owner, "--label", "com.docker.compose.project=" + project, name]); resources.push({ id, name });
  }
  container = docker(["run", "-d", "--name", project + "-redis-1", "--label", marker + "=" + project, "--label", "org.drumee.infra.owner=" + project, "--label", "com.docker.compose.project=" + project, "--label", "com.docker.compose.service=redis", "--user", process.getuid() + ":" + process.getgid(), "--network", primary, "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true", "--pids-limit", "32", "--memory", "64m", "--entrypoint", "/bin/sh", image, "-c", "sleep 120"]);
  const composition = { project, compose: { services: { redis: { networks: ["kernel"] } }, networks: { kernel: { name: primary } } } };
  await readiness(composition, D, true); report.nominal = "ACCEPTED";
  docker(["network", "connect", additional, container]);
  const actual = inspect(container); report.container = { id: container, owner: actual.Config.Labels["org.drumee.infra.owner"], service: actual.Config.Labels["com.docker.compose.service"], actualNetworks: Object.keys(actual.NetworkSettings.Networks), declaredNetworks: [primary] };
  try { await readiness(composition, D, true); report.extraNetwork = "ACCEPTED"; report.unexpectedAcceptance = true; }
  catch (error) { report.extraNetwork = "REFUSED"; report.refusalCode = error.code; report.unexpectedAcceptance = false; }
 } finally {
  if (container) { assert.equal(inspect(container).Config.Labels[marker], project); docker(["stop", "--time", "2", container]); docker(["rm", container]); }
  for (const resource of resources.reverse()) { const value = JSON.parse(docker(["network", "inspect", "--format", "{{json .}}", resource.id])); assert.equal(value.Labels[marker], project); docker(["network", "rm", resource.id]); }
  assert.equal(docker(["ps", "-aq", "--filter", "name=^/" + project]), ""); report.cleanup = "OWNED_RESOURCES_REMOVED";
  report.commands = commands; fs.writeFileSync(__dirname + "/network-exposure-probe.json", JSON.stringify(report, null, 2) + "\n", { mode: 0o600 });
 }
 console.log(JSON.stringify({ nominal: report.nominal, extraNetwork: report.extraNetwork, unexpectedAcceptance: report.unexpectedAcceptance, cleanup: report.cleanup, project }));
}
main().catch(error => { console.error(error.code || error.message); process.exitCode = 1; });
