"use strict";
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), { mock } = require("node:test");
const A = require("../../lifecycle/activation"), R = require("../../lifecycle/recovery"), P = require("../../lifecycle/preparation"), J = require("../../lifecycle/journal"), S = require("../../lib/spec"), F = require("../../lib/filesystem-safety"), G = require("../../lifecycle/external-gateway");
const { load } = require("../network-attachments/load.cjs");
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "il514-boundary-")), project = "drumee-boundary", revision = "a".repeat(64), failed = "b".repeat(64), id = "c".repeat(64), networkID = "d".repeat(64), endpointID = "e".repeat(64), image = "sha256:" + "f".repeat(64), calls = [];
  const service = { image, ports: [{ target: 3101, protocol: "tcp", host_ip: "127.0.0.1", published: 30001 }], volumes: [], labels: { "org.drumee.infra.role": "application" }, networks: ["kernel"] };
  const composition = { project, instance_id: project, resources: [], revision, acceptance: "fixture", activation_order: ["application"], plan: { effective_domain: "fixture.test", inputs: { spec: { http: { https: false } }, requirements: { capabilities: [] } } }, distribution: { profile: "application", init_jobs: [], schema_versions: {}, application: { id: "application", healthcheck: { test: ["CMD", "node", "health.js"] } } }, compose: { services: { application: service }, networks: { kernel: { name: project + "-network" } } } };
  const prepared = { root, project, instance_id: project, revision, composition, compose: composition.compose, candidate: path.join(root, "candidates", revision), fingerprints: [], files: [] };
  const broken = structuredClone(prepared); broken.revision = failed; broken.candidate = path.join(root, "candidates", failed);
  for (const value of [prepared, broken]) { fs.mkdirSync(value.candidate, { recursive: true, mode: 0o700 }); F.atomic(path.join(value.candidate, "prepared.json"), JSON.stringify(value)); }
  const resource = { id, name: "/" + project + "-application-1", owner: project, project, service: "application", revision: failed, image, image_id: image, role: "application", running: true, restarting: true, health: "unhealthy", started_at: "before", ports: {}, configured_ports: { "3101/tcp": [{ HostIp: "127.0.0.1", HostPort: "30001" }] }, mounts: [], networks: { [composition.compose.networks.kernel.name]: { NetworkID: networkID, EndpointID: "" } } };
  const network = { id: networkID, name: composition.compose.networks.kernel.name, owner: project, project, driver: "bridge", internal: false, containers: {} };
  const attestation = { services: [], revision }, digest = S.digest(attestation), event = J.append(root, "active", revision, { attestation_digest: digest });
  F.atomic(path.join(root, "active.json"), JSON.stringify({ revision, prepared, attestation, attestation_digest: digest, journal_sequence: event.sequence }));
  J.append(root, "recovery-required", failed, { code: "DOCKER_LIFECYCLE_COMMAND_FAILED", service: "application" });
  const state = { root, project, prepared, broken, resource, network, calls, final: null, inventory: [id], volatileSnapshot: true, commandFailure: false };
  const realD = load((_program, argv) => {
    const a = argv.slice(2); calls.push({ operation: "docker-observation", args: a });
    if (a[0] === "network" && a[1] === "ls") return network.name;
    if (a[0] === "network") return JSON.stringify(network);
    if (a[0] === "ps") return state.inventory.join("\n");
    if (a[0] === "container") return JSON.stringify(resource);
    throw Error("UNEXPECTED_BOUNDARY_FIXTURE_COMMAND");
  });
  const replacements = [mock.method(P, "verifyPrepared", value => { calls.push({ operation: "verifyPrepared", revision: value.revision }); return value; }), mock.method(G, "probe", async () => ({ applicable: false }))];
  const driver = {
    ...realD,
    checkImages() { calls.push({ operation: "checkImages" }); return { [image]: image }; },
    inspectProject() { calls.push({ operation: "inspectProject", id: resource.id, restarting: state.volatileSnapshot ? false : resource.restarting }); return [{ ...structuredClone(resource), restarting: state.volatileSnapshot ? false : resource.restarting }]; },
    checkPorts() { calls.push({ operation: "checkPorts" }); },
    checkNetworks(c, options) { calls.push({ operation: "strict-network", options }); return realD.checkNetworks(c, options); },
    authorizeRecoveryNetworks(c, targets) { calls.push({ operation: "recovery-network", targets: structuredClone(targets) }); return realD.authorizeRecoveryNetworks(c, targets); },
    compose(_value, args) {
      calls.push({ operation: "compose", args });
      if (args[0] === "up") {
        if (state.commandFailure) throw Object.assign(Error("DOCKER_LIFECYCLE_COMMAND_FAILED"), { code: "DOCKER_LIFECYCLE_COMMAND_FAILED" });
        resource.id = "1".repeat(64); state.inventory = [resource.id]; resource.revision = revision; resource.restarting = false; state.volatileSnapshot = false; resource.health = "healthy"; resource.started_at = "after"; resource.ports = structuredClone(resource.configured_ports);
        resource.networks[network.name].EndpointID = endpointID; network.containers = { [resource.id]: { Name: resource.name.slice(1), EndpointID: endpointID, MacAddress: "", IPv4Address: "", IPv6Address: "" } };
        if (state.final) state.final(state);
      }
      return "";
    }
  };
  state.context = { root, authorized: true, recover: true, driver }; state.driver = driver;
  state.run = () => R.rollbackDeployment(root, prepared.revision, state.context);
  state.normal = () => A.activateDeployment(prepared, state.context);
  state.cleanup = () => { for (const replacement of replacements.reverse()) replacement.mock.restore(); fs.rmSync(root, { recursive: true, force: true }); };
  return state;
}
module.exports = { fixture };
