"use strict";
const assert = require("node:assert/strict"), crypto = require("node:crypto");
const diagnostic = require("../support/qualification-diagnostic.cjs").createDiagnostics({ scenario: "complete-network-membership" });
diagnostic.observeDocker();
const D = require("../../lifecycle/docker"), ready = require("../../internal/network-readiness").createNetworkReadiness();
const image = require("../support/service-inputs").serviceInputs().adapter_input.services.redis.image;
let assertions = 0;
function equal(actual, expected) { assertions++; assert.deepEqual(actual, expected); }
function refuse(composition, code) { assertions++; assert.throws(() => D.checkNetworks(composition, { require_existing: true }), { code }); }
const docker = args => D.docker(args).trim();
const inspect = id => JSON.parse(docker(["container", "inspect", "--format", "{{json .}}", id]));
const network = id => JSON.parse(docker(["network", "inspect", "--format", "{{json .}}", id]));
diagnostic.run(async () => {
  const project = "drumee-e1-membership-" + crypto.randomBytes(6).toString("hex"), marker = "org.drumee.qualification", nets = [], containers = [];
  const report = { project, image, versions: JSON.parse(docker(["version", "--format", "{{json .}}"])), states: [] };
  const labels = ["--label", marker + "=" + project, "--label", "org.drumee.infra.owner=" + project, "--label", "com.docker.compose.project=" + project];
  diagnostic.scenario(project);
  try {
    diagnostic.step("initial-state"); equal(docker(["ps", "-aq", "--filter", "label=" + marker + "=" + project]), "");
    for (const role of ["kernel", "front", "extra"]) {
      const name = project + "-" + role;
      equal(docker(["network", "ls", "-q", "--filter", "name=^" + name + "$"]), "");
      const id = docker(["network", "create", ...labels, "--opt", "com.docker.network.bridge.enable_ip_masquerade=false", name]); nets.push({ role, name, id });
    }
    const composition = { project, compose: { services: { redis: { networks: ["kernel"] } }, networks: { kernel: { name: nets[0].name } } } };
    diagnostic.step("not-yet-created-service"); equal(D.checkNetworks(composition, { require_existing: true }), undefined);
    const id = docker(["run", "-d", "--name", project + "-redis-1", ...labels, "--label", "com.docker.compose.service=redis", "--user", process.getuid() + ":" + process.getgid(), "--network", nets[0].name, "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true", "--pids-limit", "32", "--memory", "64m", "--entrypoint", "/bin/sh", image, "-c", "sleep 600"]); containers.push(id);
    diagnostic.step("authorized-single-network"); await ready(composition, D, true); report.states.push({ step: "nominal", networks: inspect(id).NetworkSettings.Networks, result: "PASS" });
    diagnostic.step("same-owner-undeclared-network"); docker(["network", "connect", nets[2].id, id]);
    const before = inspect(id).NetworkSettings.Networks, beforeNets = nets.map(n => network(n.id).Containers);
    equal(Object.keys(before).sort(), [nets[0].name, nets[2].name].sort()); refuse(composition, "NETWORK_ATTACHMENT_MISMATCH");
    equal(inspect(id).NetworkSettings.Networks, before); equal(nets.map(n => network(n.id).Containers), beforeNets); report.states.push({ step: "undeclared", networks: before, result: "NETWORK_ATTACHMENT_MISMATCH", validatorModifiedResources: false });
    docker(["network", "disconnect", nets[2].id, id]); await ready(composition, D, true);
    diagnostic.step("declared-multihoming"); composition.compose.services.redis.networks = { kernel: { aliases: ["redis"] }, front: {} }; composition.compose.networks.front = { name: nets[1].name };
    docker(["network", "connect", nets[1].id, id]); await ready(composition, D, true); report.states.push({ step: "multihoming", networks: inspect(id).NetworkSettings.Networks, result: "PASS" });
    diagnostic.step("third-network-refusal"); docker(["network", "connect", nets[2].id, id]); refuse(composition, "NETWORK_ATTACHMENT_MISMATCH"); docker(["network", "disconnect", nets[2].id, id]);
    diagnostic.step("partial-multihoming-refusal"); docker(["network", "disconnect", nets[1].id, id]); refuse(composition, "NETWORK_ATTACHMENT_MISMATCH");
    diagnostic.step("entirely-disconnected-inventory"); docker(["network", "disconnect", nets[0].id, id]); equal(inspect(id).NetworkSettings.Networks, {}); refuse(composition, "NETWORK_ATTACHMENT_MISMATCH");
    report.states.push({ step: "disconnected", networks: inspect(id).NetworkSettings.Networks, result: "NETWORK_ATTACHMENT_MISMATCH" });
    docker(["network", "connect", nets[0].id, id]); docker(["network", "connect", nets[1].id, id]); await ready(composition, D, true);
    diagnostic.step("stopped-configured-memberships"); docker(["stop", "--time", "2", id]); await ready(composition, D, true); report.states.push({ step: "stopped", networks: inspect(id).NetworkSettings.Networks, result: "PASS" });
    diagnostic.step("missing-required-network"); const missing = structuredClone(composition); missing.compose.networks.kernel.name += "-missing"; refuse(missing, "REQUIRED_NETWORK_MISSING");
    report.status = "PASS";
  } catch (error) { diagnostic.capture(error, { report, assertions }); throw error; }
  finally {
    diagnostic.step("owned-cleanup");
    for (const id of containers) { const value = inspect(id); equal(value.Config.Labels[marker], project); if (value.State.Running) docker(["stop", "--time", "2", id]); docker(["rm", id]); }
    for (const n of nets.reverse()) { equal(network(n.id).Labels[marker], project); docker(["network", "rm", n.id]); }
    equal(docker(["ps", "-aq", "--filter", "label=" + marker + "=" + project]), ""); equal(docker(["network", "ls", "-q", "--filter", "label=" + marker + "=" + project]), ""); report.cleanup = "PASS";
  }
  diagnostic.step("real-command-failure"); assertions++; assert.throws(() => D.docker(["container", "inspect", containers[0]]), error => error.code === "DOCKER_LIFECYCLE_COMMAND_FAILED" && error.exit_status === 1);
  console.log(JSON.stringify({ ...report, assertions }, null, 2));
}).catch(diagnostic.fail);
