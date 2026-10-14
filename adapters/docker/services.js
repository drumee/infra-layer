"use strict";
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const S = require("../../lib/spec");
const F = require("../../lib/filesystem-safety");
const execute = promisify(execFile);
async function docker(args) { return (await execute("docker", ["--host", "unix:///var/run/docker.sock", ...args], { timeout: 15000, maxBuffer: 65536 })).stdout; }
async function observe(deployment) {
  if (!S.plainTree(deployment) || !S.record(deployment) || Object.keys(deployment).some((key) => !["contract_version", "id", "desired_revision", "plan", "containers"].includes(key)) || deployment.contract_version !== "2" || !S.identifier(deployment.id) || !S.record(deployment.containers) || deployment.plan?.contract_version !== "2" || !deployment.plan.inputs) F.fail("INVALID_DEPLOYMENT_DESCRIPTOR");
  const expected = require("../../lib/plan").planInfrastructure(deployment.plan.inputs.spec, deployment.plan.inputs.requirements, deployment.plan.inputs.adapter_input);
  if (!deployment.plan.applicable || !expected.applicable || expected.revision !== deployment.desired_revision || expected.revision !== deployment.plan.revision || S.serialize(expected.artifacts) !== S.serialize(deployment.plan.artifacts)) F.fail("INVALID_DEPLOYMENT_DESCRIPTOR");
  const inputs = expected.inputs; const planned = {};
  for (const artifact of expected.artifacts.filter((value) => value.path.endsWith(".compose.json"))) Object.assign(planned, JSON.parse(artifact.content).services);
  for (const [name, id] of Object.entries(deployment.containers)) if (!planned[name] || !/^[a-f0-9]{64}$/.test(id || "")) F.fail("INVALID_DEPLOYMENT_DESCRIPTOR");
  const observations = [];
  for (const capability of expected.capabilities) {
    const name = capability.name; const service_name = name === "smtp" ? "mail" : name === "http-gateway" ? "gateway" : name;
    const result = { name, configuration_valid: "unverified", loaded_configuration: "unverified", protocol_functional: false, dependencies_satisfied: name !== "smtp", diagnostic_codes: [] };
    if (name === "tls") {
      const source = (ref) => inputs.adapter_input.resource_sources.find((value) => S.serialize(value.ref) === S.serialize(ref))?.source;
      try { const certificate = require("../../capabilities/tls").validateCertificate({ hostname: expected.effective_domain, certificate: source(inputs.spec.tls.certificate_ref), key: source(inputs.spec.tls.private_key_ref), ca_bundle: source(inputs.spec.tls.ca_bundle_ref) }); result.resource_present = true; result.protocol_functional = false; result.configuration_valid = true; result.certificate_valid = true; result.certificate_fingerprint = certificate.fingerprint; result.expires_at = certificate.expires_at; result.pending_activation = true; }
      catch (_) { result.diagnostic_codes.push("TLS_MATERIAL_NOT_CONFIRMED"); }
      observations.push(result); continue;
    }
    if (!planned[service_name]) { result.diagnostic_codes.push("EXTERNAL_PROTOCOL_OBSERVER_REQUIRED"); observations.push(result); continue; }
    const container_id = deployment.containers[service_name]; if (!container_id) { result.diagnostic_codes.push("CAPABILITY_RESOURCE_MISSING"); observations.push(result); continue; }
    const format = '{"id":{{json .Id}},"running":{{json .State.Running}},"health":{{if .State.Health}}{{json .State.Health.Status}}{{else}}"unknown"{{end}},"image":{{json .Config.Image}},"owner":{{json (index .Config.Labels "org.drumee.infra.owner")}},"project":{{json (index .Config.Labels "com.docker.compose.project")}},"service":{{json (index .Config.Labels "com.docker.compose.service")}},"revision":{{json (index .Config.Labels "org.drumee.infra.revision")}},"ports":{{json .NetworkSettings.Ports}}}';
    let observed; try { observed = JSON.parse(await docker(["inspect", "--format", format, container_id])); } catch (_) { result.diagnostic_codes.push("CAPABILITY_OBSERVATION_FAILED"); observations.push(result); continue; }
    result.running = observed.running === true; result.health = observed.health; result.resource_present = true;
    if (/^[a-f0-9]{64}$/.test(observed.revision || "")) result.observed_revision = observed.revision;
    if (observed.id !== container_id || observed.owner !== inputs.adapter_input.project || observed.project !== inputs.adapter_input.project || observed.service !== service_name || observed.image !== planned[service_name].image) result.diagnostic_codes.push("CAPABILITY_OWNERSHIP_MISMATCH");
    if (observed.revision !== expected.revision) result.diagnostic_codes.push("CAPABILITY_REVISION_MISMATCH");
    const actual_ports = Object.entries(S.record(observed.ports) ? observed.ports : {}).flatMap(([target, bindings]) => (bindings || []).map((binding) => `${target}:${binding.HostIp}:${binding.HostPort}`)).sort();
    const declared_ports = (planned[service_name].ports || []).map((binding) => `${binding.target}/${binding.protocol}:${binding.host_ip}:${binding.published}`).sort();
    if (S.serialize(actual_ports) !== S.serialize(declared_ports)) result.diagnostic_codes.push("UNEXPECTED_SERVICE_EXPOSURE");
    if (result.diagnostic_codes.length || !result.running) { observations.push(result); continue; }
    const run = (...args) => docker(["exec", container_id, ...args]);
    try {
      if (name === "dns") {
        await run("named-checkconf", "/config/bind9.conf"); result.configuration_valid = true;
        const address = await run("dig", "@127.0.0.1", "-p", String(inputs.adapter_input.services.dns.listen_port), expected.effective_domain, "A", "+short");
        const soa = await run("dig", "@127.0.0.1", "-p", String(inputs.adapter_input.services.dns.listen_port), "+tcp", expected.effective_domain, "SOA", "+short"); result.protocol_functional = address.trim() === inputs.spec.dns.ipv4 && soa.trim().split(/\s+/)[2] === String(inputs.spec.dns.serial);
      } else if (name === "database") {
        const version = await run("/bin/sh", "-c", 'MYSQL_PWD="$(cat /run/secrets/database-admin)" exec mariadb --protocol=socket -uroot --batch --skip-column-names -e "SELECT VERSION()"');
        result.authentication_functional = true; result.protocol_functional = true; result.engine_compatible = version.trim().startsWith("11.4."); if (/^[0-9][0-9a-zA-Z.+_-]{1,60}$/.test(version.trim())) result.version = version.trim(); result.schema_prerequisites = "kernel-module-owner";
      } else if (name === "redis") {
        const reply = await run("/bin/sh", "-c", `REDISCLI_AUTH="$(cat /run/secrets/redis-auth)" redis-cli -h 127.0.0.1 -p ${inputs.spec.redis.endpoint.port} ping`); result.protocol_functional = reply.trim() === "PONG"; result.authentication_functional = result.protocol_functional;
      } else if (name === "smtp") {
        const config = inputs.spec.mail;
        const auth = config.submission_secret_ref ? `infra_auth="$(printf '\\0${config.submission_user}\\0%s' "$(cat /run/secrets/mail-submission)" | openssl base64 -A)"; printf 'EHLO infrastructure\\r\\nAUTH PLAIN %s\\r\\nQUIT\\r\\n' "$infra_auth"` : "printf 'EHLO infrastructure\\r\\nQUIT\\r\\n'";
        const response = await run("/bin/sh", "-c", `{ ${auth}; } | openssl s_client -starttls smtp -connect 127.0.0.1:${config.endpoint.port} -servername ${config.hostname} -CAfile /run/secrets/mail-ca -verify_return_error -quiet`);
        result.protocol_functional = config.submission_secret_ref ? /(?:^|\n)235 /.test(response) : /(?:^|\n)250/.test(response); result.authentication_functional = config.submission_secret_ref && result.protocol_functional;
        result.diagnostic_codes.push("SMTP_RELAY_AND_DKIM_PROTOCOL_ATTESTATION_OUTSTANDING");
      } else if (name === "http-gateway") { const response = await run("wget", "-q", "-O", "/dev/null", `http://127.0.0.1:${inputs.adapter_input.gateway.health_port}/__infra_ready`); result.protocol_functional = typeof response === "string"; result.diagnostic_codes.push("PROTECTED_DELIVERY_NOT_VERIFIED"); }
    } catch (_) { result.diagnostic_codes.push("CAPABILITY_PROTOCOL_FAILED"); }
    observations.push(result);
  }
  return { capabilities: observations };
}
module.exports = { kind: "docker-services", observe };
