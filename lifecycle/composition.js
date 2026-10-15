"use strict";
const S = require("../lib/spec");
const F = require("../lib/filesystem-safety");
const { validRef } = require("../capabilities/secrets");
const image = (value) => typeof value === "string" && /^(?:[a-zA-Z0-9._/:/-]+@)?sha256:[a-f0-9]{64}$/.test(value);
function keys(value, allowed, code = "INVALID_DISTRIBUTION_CONTRACT") {
  if (!S.record(value) || Object.keys(value).some((key) => !allowed.includes(key))) F.fail(code);
}
function strings(value) { return Array.isArray(value) && value.length > 0 && value.every((entry) => typeof entry === "string" && entry.length <= 4096 && !/[\x00\r\n]/.test(entry)); }
function checkedPlan(plan) {
  if (!S.plainTree(plan) || plan?.contract_version !== "2" || !plan.applicable || !plan.inputs) F.fail("INAPPLICABLE_DEPLOYMENT_PLAN");
  const expected = require("../lib/plan").planInfrastructure(plan.inputs.spec, plan.inputs.requirements, plan.inputs.adapter_input);
  if (!expected.applicable || expected.revision !== plan.revision || S.serialize(expected) !== S.serialize(plan)) F.fail("DEPLOYMENT_PLAN_TAMPERED");
  return expected;
}
function composeDeployment(plan, distribution) {
  plan = checkedPlan(plan);
  if (!S.plainTree(distribution)) F.fail("INVALID_DISTRIBUTION_CONTRACT");
  keys(distribution, ["contract_version", "id", "profile", "kernel", "init_jobs", "persistent_resources", "schema_versions", "external_writers", "helper_image", "provenance"]);
  if (distribution.contract_version !== "1" || !S.identifier(distribution.id) || !["infrastructure", "kernel"].includes(distribution.profile) || !image(distribution.helper_image) || !S.record(distribution.schema_versions) || distribution.external_writers !== "none" || !Array.isArray(distribution.init_jobs) || !Array.isArray(distribution.persistent_resources)) F.fail("INVALID_DISTRIBUTION_CONTRACT");
  if (Object.entries(distribution.schema_versions).some(([name, version]) => !S.identifier(name) || !S.identifier(version))) F.fail("INVALID_SCHEMA_COMPATIBILITY");
  keys(distribution.provenance, ["repository", "revision", "path", "acceptance"]);
  if (typeof distribution.provenance.repository !== "string" || !/^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?$/.test(distribution.provenance.repository) || !/^[a-f0-9]{40}$/.test(distribution.provenance.revision || "") || !["infrastructure", "contract-fixture", "real-kernel"].includes(distribution.provenance.acceptance) || typeof distribution.provenance.path !== "string" || !/^[a-zA-Z0-9_./-]+$/.test(distribution.provenance.path) || distribution.provenance.path.split("/").includes("..")) F.fail("INVALID_SOURCE_PROVENANCE");
  const compose = { services: {}, networks: {} }; const project = plan.inputs.adapter_input.project;
  for (const artifact of plan.artifacts.filter((value) => value.path.endsWith(".compose.json"))) {
    const fragment = JSON.parse(artifact.content);
    for (const [name, service] of Object.entries(fragment.services)) {
      if (compose.services[name]) F.fail("DUPLICATE_SERVICE_IDENTITY");
      if (service.labels?.["org.drumee.infra.owner"] !== project || !image(service.image)) F.fail("DEPLOYMENT_OWNERSHIP_MISMATCH");
      compose.services[name] = service;
    }
    for (const [name, network] of Object.entries(fragment.networks)) {
      if (compose.networks[name] && S.serialize(compose.networks[name]) !== S.serialize(network)) F.fail("DUPLICATE_NETWORK_OWNERSHIP");
      compose.networks[name] = network;
    }
  }
  for (const [name, network] of Object.entries(compose.networks)) compose.networks[name] = { name: network.name, ...(name === "mail-control" ? { internal: true } : {}), labels: { "org.drumee.infra.owner": project } };
  if (!compose.networks.kernel) compose.networks.kernel = { name: plan.inputs.adapter_input.network, labels: { "org.drumee.infra.owner": project } };
  const resources = S.clone(plan.resources.filter((value) => value.kind === "filesystem-state"));
  // Validate before sorting so malformed records retain stable diagnostics.
  const distribution_resources = distribution.persistent_resources.map((resource) => {
    keys(resource, ["id", "source", "uid", "gid", "backup_required"]);
    if (!S.identifier(resource.id) || !S.resourcePath(resource.source) || !Number.isInteger(resource.uid) || resource.uid < 0 || !Number.isInteger(resource.gid) || resource.gid < 0 || resource.backup_required !== true) F.fail("INVALID_PERSISTENT_RESOURCE");
    return resource;
  }).sort((a, b) => S.lexical(a.id, b.id));
  // Preserve the historical infrastructure inventory prefix.
  for (const resource of distribution_resources) {
    if (resources.some((value) => value.id === resource.id || S.contains(value.source, resource.source) || S.contains(resource.source, value.source))) F.fail("DUPLICATE_VOLUME_OWNERSHIP");
    resources.push({ ...resource, owner: plan.inputs.spec.instance.id, persistent: true, kind: "distribution-state" });
  }
  const projections = [];
  function suppliedService(value, job) {
    keys(value, ["id", "image", "uid", "gid", "command", "entrypoint", "environment", "mounts", "secret_mounts", "healthcheck", "listener_ports", "requires", "validation_command", "effect", "artifact_revision"]);
    if (!S.identifier(value.id) || compose.services[value.id] || !image(value.image) || !Number.isInteger(value.uid) || value.uid <= 0 || !Number.isInteger(value.gid) || value.gid < 0 || !strings(value.command) || (value.entrypoint !== undefined && !strings(value.entrypoint)) || !Array.isArray(value.requires) || !Array.isArray(value.mounts) || !Array.isArray(value.secret_mounts)) F.fail(compose.services[value.id] ? "DUPLICATE_SERVICE_IDENTITY" : "INVALID_DISTRIBUTION_SERVICE");
    if (value.environment !== undefined && (!S.record(value.environment) || Object.entries(value.environment).some(([key, text]) => !/^[a-zA-Z_][a-zA-Z0-9_]{0,79}$/.test(key) || /password|secret|token|credential/i.test(key) || typeof text !== "string" || /[\x00\r\n]/.test(text)))) F.fail("SECRET_VALUE_FORBIDDEN");
    const volumes = [];
    for (const mount of value.mounts) {
      keys(mount, ["resource", "target", "read_only"]);
      const resource = resources.find((entry) => entry.id === mount.resource);
      if (!resource || !S.resourcePath(mount.target) || typeof mount.read_only !== "boolean" || ["/var/run/docker.sock", "/run/docker.sock"].includes(mount.target)) F.fail("UNDECLARED_RESOURCE_MOUNT");
      volumes.push({ type: "bind", source: resource.source, target: mount.target, read_only: mount.read_only, bind: { create_host_path: false } });
    }
    for (const mount of value.secret_mounts) {
      keys(mount, ["ref", "consumer", "target", "format"]);
      const descriptor = plan.required_secrets.find((entry) => S.serialize(entry.ref) === S.serialize(mount.ref));
      if (!validRef(mount.ref) || !descriptor?.consumers.includes(mount.consumer) || !S.resourcePath(mount.target) || !["raw", "redis-client-config"].includes(mount.format)) F.fail("INVALID_SECRET_REFERENCE");
      if (mount.format === "redis-client-config" && descriptor.type !== "redis-auth") F.fail("INVALID_SECRET_REFERENCE");
      const path = `secrets/${value.id}-${S.digest(mount).slice(0, 24)}.value`;
      projections.push({ ...mount, path, service: value.id, uid: value.uid, gid: value.gid }); volumes.push({ type: "bind", source: `./${path}`, target: mount.target, read_only: true, bind: { create_host_path: false } });
    }
    if (new Set(volumes.map((mount) => mount.target)).size !== volumes.length || volumes.some((mount, index) => volumes.slice(0, index).some((other) => S.contains(other.target, mount.target) || S.contains(mount.target, other.target)))) F.fail("UNSAFE_RESOURCE_MOUNT");
    const dependencies = {};
    for (const dependency of value.requires) { if (!S.identifier(dependency) || !compose.services[dependency]) F.fail("INVALID_DEPENDENCY_ORDERING"); dependencies[dependency] = { condition: distribution.init_jobs.some((entry) => entry.id === dependency) ? "service_completed_successfully" : "service_healthy" }; }
    if (job && (!strings(value.validation_command) || value.effect !== "idempotent" || !/^[a-f0-9]{40,64}$/.test(value.artifact_revision || ""))) F.fail("INITIALIZATION_CONTRACT_REQUIRED");
    if (!job && (!S.record(value.healthcheck) || !Array.isArray(value.healthcheck.test) || value.healthcheck.test[0] !== "CMD" || !strings(value.healthcheck.test) || !Array.isArray(value.listener_ports) || value.listener_ports.some((port) => !S.port(port) || port < 1024))) F.fail("KERNEL_READINESS_CONTRACT_REQUIRED");
    if (value.healthcheck) {
      keys(value.healthcheck, ["test", "interval", "timeout", "retries", "start_period"]);
      if (["interval", "timeout", "start_period"].some((field) => value.healthcheck[field] !== undefined && !/^[1-9][0-9]{0,3}(?:ms|s|m)$/.test(value.healthcheck[field])) || !Number.isInteger(value.healthcheck.retries) || value.healthcheck.retries < 1 || value.healthcheck.retries > 100) F.fail("KERNEL_READINESS_CONTRACT_REQUIRED");
    }
    return { image: value.image, user: `${value.uid}:${value.gid}`, command: value.command, ...(value.entrypoint ? { entrypoint: value.entrypoint } : {}), ...(value.environment ? { environment: value.environment } : {}), networks: ["kernel"], volumes, read_only: true, cap_drop: ["ALL"], security_opt: ["no-new-privileges:true"], tmpfs: [`/tmp:rw,noexec,nosuid,size=33554432,uid=${value.uid},gid=${value.gid},mode=0700`], mem_limit: "512m", pids_limit: 128, stop_grace_period: "30s", restart: job ? "no" : "unless-stopped", depends_on: dependencies, ...(job ? {} : { healthcheck: S.clone(value.healthcheck) }), labels: { "org.drumee.infra.owner": project, "org.drumee.infra.revision": plan.revision, "org.drumee.infra.role": job ? "initialization" : "kernel" } };
  }
  const infra_order = ["dns", "database", "redis"].filter((name) => compose.services[name]); const jobs = [];
  for (const value of distribution.init_jobs) { compose.services[value.id] = suppliedService(value, true); jobs.push(value.id); }
  if (distribution.profile === "kernel") {
    if (!distribution.kernel || !plan.inputs.spec.http.enabled) F.fail("KERNEL_COMPOSITION_REQUIRED");
    compose.services[distribution.kernel.id] = suppliedService(distribution.kernel, false);
    const kernel = distribution.kernel;
    for (const endpoint of [plan.inputs.requirements.http.service_endpoint, plan.inputs.requirements.http.page_endpoint, plan.inputs.requirements.http.websocket_endpoint]) if (endpoint.host !== kernel.id || !kernel.listener_ports.includes(endpoint.port)) F.fail("KERNEL_LISTENER_CONTRACT_MISMATCH");
    for (const name of [...infra_order.filter((name) => name !== "dns"), ...jobs]) if (!kernel.requires.includes(name)) F.fail("KERNEL_DEPENDENCY_REQUIRED");
    compose.services.gateway.depends_on = { [kernel.id]: { condition: "service_healthy" } };
  } else if (distribution.kernel !== undefined || distribution.init_jobs.length || plan.inputs.spec.http.enabled) F.fail("KERNEL_COMPOSITION_REQUIRED");
  if (compose.services.mail && compose.services.dkim) compose.services.mail.depends_on = { dkim: { condition: "service_healthy" } };
  const bindings = [];
  for (const [name, service] of Object.entries(compose.services)) {
    if (!service.restart) service.restart = "unless-stopped";
    for (const binding of service.ports || []) {
      if (bindings.some((other) => other.published === binding.published && other.protocol === binding.protocol && (other.host_ip === binding.host_ip || ["0.0.0.0", "::"].includes(other.host_ip) || ["0.0.0.0", "::"].includes(binding.host_ip)))) F.fail("CONFLICTING_PORT_BINDING");
      bindings.push(binding);
    }
    if (!image(service.image) || service.network_mode || service.privileged || !service.mem_limit || !service.pids_limit || !service.read_only) F.fail("UNSAFE_SERVICE_CONFIGURATION");
  }
  const activation_order = [...infra_order, ...jobs, ...(distribution.kernel ? [distribution.kernel.id, "gateway"] : []), ...["dkim", "mail"].filter((name) => compose.services[name])];
  const normalized = S.clone(distribution); normalized.persistent_resources.sort((a, b) => S.lexical(a.id, b.id));
  const revision = S.digest({ plan_revision: plan.revision, distribution: normalized, compose });
  return { contract_version: "1", revision, plan_revision: plan.revision, project, instance_id: plan.inputs.spec.instance.id, plan, distribution: normalized, compose: S.canonical(compose), resources, projections, activation_order, shutdown_order: [...activation_order].reverse(), applicability: "validated-composition", acceptance: distribution.provenance.acceptance };
}
function verifyComposition(value) {
  if (!S.plainTree(value) || !value?.plan || !value.distribution) F.fail("INVALID_COMPOSITION");
  const expected = composeDeployment(value.plan, value.distribution); if (S.serialize(expected) !== S.serialize(value)) F.fail("COMPOSITION_TAMPERED"); return expected;
}
module.exports = { composeDeployment, verifyComposition, checkedPlan, image };
