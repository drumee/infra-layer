"use strict";
const api = require("../../lib");
const helper = "node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392";
function applicationInputs(root = "/tmp/infra-application", project = "infra-application", image = "sha256:" + "a".repeat(64), port = 28971) {
  const spec = { contract_version: "2", instance: { id: project }, http: { enabled: false, https: false }, dns: { mode: "none" }, secrets: { store_resource: "application-secrets", resources: [] } };
  const requirements = { contract_version: "2", capabilities: [] };
  const adapter_input = { kind: "docker-services", project, network: project + "-application", services: {}, resource_sources: [] };
  const distribution = { contract_version: "1", id: "minimal-application", profile: "application", helper_image: helper, init_jobs: [], persistent_resources: [], schema_versions: {}, external_writers: "none", provenance: { repository: "https://github.com/drumee/infra-layer", revision: "bef9a379754bcf9a46fed8bcb6f88fe1f775c739", path: "test/application", acceptance: "infrastructure" }, application: { id: "application", image, uid: 1000, gid: 1000, command: ["node", "host.js"], mounts: [], secret_mounts: [], requires: [], listener_ports: [3101], plugins: [{ id: "qualification", root: "/app/plugins/qualification", revision: "b".repeat(40) }], healthcheck: { test: ["CMD", "node", "health.js"], retries: 10, interval: "2s", timeout: "2s" } }, external_gateway: { kind: "host-loopback", protocol: "http", host_address: "127.0.0.1", host_port: port, container_port: 3101, route_prefix: "/-/", rpc_prefix: "/-/svc/", tls_termination: "external", readiness_path: "/-/svc/health.ready" } };
  return { spec, requirements, adapter_input, distribution, plan() { return api.planInfrastructure(spec, requirements, adapter_input); } };
}
module.exports = { applicationInputs, helper };
