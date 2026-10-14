"use strict";
const S = require("./spec");
const { validateSpecV2, cidr } = require("./contracts-v2");
function planV2(spec, requirements, adapter_input, observation = {}) {
  const checked = validateSpecV2(spec, requirements);
  const plan = { contract_version: "2", applicable: false, diagnostics: [...checked.diagnostics], conflicts: [], artifacts: [], resources: [], prerequisites: [], compatibility: [], capabilities: [] };
  if (!checked.valid) return plan;
  const error = (code, field) => plan.diagnostics.push({ code, field, severity: "error" });
  const keys = (value, allowed, field) => { if (!S.record(value)) { error("INCOMPATIBLE_ADAPTER_CONFIGURATION", field); return false; } for (const key of Object.keys(value)) if (!allowed.includes(key)) error("INCOMPATIBLE_ADAPTER_CONFIGURATION", field); return true; };
  if (!S.plainTree(adapter_input) || !keys(adapter_input, ["kind", "project", "network", "services", "resource_sources", "gateway"], "adapter") || adapter_input.kind !== "docker-services" || !S.identifier(adapter_input.project) || !S.identifier(adapter_input.network)) { error("INCOMPATIBLE_ADAPTER_CONFIGURATION", "adapter"); return plan; }
  if (!keys(adapter_input.services, ["dns", "database", "redis", "mail", "dkim"], "adapter.services") || !Array.isArray(adapter_input.resource_sources)) { error("INCOMPATIBLE_ADAPTER_CONFIGURATION", "adapter.resource_sources"); return plan; }
  const sources = adapter_input.resource_sources;
  for (const source of sources) if (!keys(source, ["ref", "source"], "adapter.resource_sources") || !require("../capabilities/secrets").validRef(source.ref) || !S.resourcePath(source.source)) error("UNSAFE_RESOURCE_PATH", "adapter.resource_sources");
  if (new Set(sources.map((value) => S.serialize(value?.ref))).size !== sources.length) error("DUPLICATE_RESOURCE_OWNERSHIP", "adapter.resource_sources");
  const planned = [];
  if (checked.spec.dns.mode === "local") planned.push("dns");
  for (const name of ["database", "redis"]) if (checked.spec[name]?.mode === "managed") planned.push(name);
  if (checked.spec.mail) { planned.push("mail"); if (checked.spec.mail.dkim) planned.push("dkim"); }
  for (const name of Object.keys(adapter_input.services)) if (!planned.includes(name)) error("UNDECLARED_SERVICE_RESOURCE", `adapter.services.${name}`);
  const bindings = []; const data_sources = [];
  for (const name of planned) {
    const service = adapter_input.services[name];
    if (!keys(service, ["image", "uid", "gid", "data_source", "listen_port", "bindings"], `adapter.services.${name}`)) continue;
    if (typeof service.image !== "string" || !/^(?:[a-zA-Z0-9._/:/-]+@)?sha256:[a-f0-9]{64}$/.test(service.image) || !Number.isInteger(service.uid) || service.uid < 0 || !Number.isInteger(service.gid) || service.gid < 0) error("INCOMPATIBLE_ADAPTER_CONFIGURATION", `adapter.services.${name}`);
    if (["mail", "database"].includes(name) ? service.uid !== 0 : service.uid === 0) error("SERVICE_PRIVILEGE_INCOMPATIBLE", `adapter.services.${name}.uid`);
    if (!S.port(service.listen_port) || service.listen_port < 1024 || !Array.isArray(service.bindings)) error("INVALID_ENDPOINT", `adapter.services.${name}`);
    if (name !== "dns" && service.bindings?.length) error("PUBLIC_SERVICE_EXPOSURE_FORBIDDEN", `adapter.services.${name}.bindings`);
    if (name === "dns") {
      if (service.bindings?.length !== 2 || !service.bindings.some((entry) => entry?.protocol === "tcp") || !service.bindings.some((entry) => entry?.protocol === "udp")) error("DNS_TCP_UDP_REQUIRED", "adapter.services.dns.bindings");
      for (const binding of service.bindings || []) {
        if (!keys(binding, ["host_address", "host_port", "protocol"], "adapter.bindings") || !require("node:net").isIP(binding.host_address) || !S.port(binding.host_port) || !["tcp", "udp"].includes(binding.protocol)) error("INVALID_ENDPOINT", "adapter.bindings"); else bindings.push(binding);
      }
    }
    const persistent = name === "dns" || name === "database" || name === "mail" || (name === "redis" && checked.spec.redis.persistence === "aof");
    if (persistent) { if (!S.resourcePath(service.data_source)) error("UNSAFE_RESOURCE_PATH", `adapter.services.${name}.data_source`); else data_sources.push(service.data_source); }
    else if (service.data_source !== undefined) error("UNSUPPORTED_PERSISTENCE_CONFIGURATION", `adapter.services.${name}.data_source`);
    if (name === "database" || name === "redis" || name === "mail") if (service.listen_port !== checked.spec[name === "mail" ? "mail" : name].endpoint.port) error("INCOMPATIBLE_ADAPTER_CONFIGURATION", `adapter.services.${name}.listen_port`);
  }
  if (data_sources.some((source, index) => data_sources.slice(0, index).some((other) => S.contains(source, other) || S.contains(other, source))) || sources.some((entry) => typeof entry?.source === "string" && data_sources.some((directory) => S.contains(directory, entry.source) || S.contains(entry.source, directory)))) error("DUPLICATE_RESOURCE_OWNERSHIP", "adapter.sources");
  const needed = [];
  if (checked.spec.database?.mode === "managed") needed.push(checked.spec.database.admin_secret_ref);
  if (checked.spec.redis?.mode === "managed") needed.push(checked.spec.redis.auth_secret_ref);
  if (checked.spec.dns.tsig_ref) needed.push(checked.spec.dns.tsig_ref);
  if (checked.spec.mail) { needed.push(checked.spec.tls.certificate_ref, checked.spec.tls.private_key_ref, checked.spec.tls.ca_bundle_ref); if (checked.spec.mail.submission_secret_ref) needed.push(checked.spec.mail.submission_secret_ref); if (checked.spec.mail.relay_secret_ref) needed.push(checked.spec.mail.relay_secret_ref); if (checked.spec.mail.dkim) needed.push(checked.spec.mail.dkim.key_ref); }
  for (const ref of needed) if (!sources.some((entry) => S.serialize(entry?.ref) === S.serialize(ref))) error("MISSING_RESOURCE_REFERENCE", "adapter.resource_sources");
  for (const [ref, consumer] of [[checked.spec.database?.admin_secret_ref, "database"], [checked.spec.redis?.auth_secret_ref, "redis"], [checked.spec.dns.tsig_ref, "dns"], [checked.spec.mail && checked.spec.tls?.private_key_ref, "mail"], [checked.spec.mail?.dkim?.key_ref, "dkim"], [checked.spec.http.https && checked.spec.tls?.private_key_ref, "gateway"]]) if (ref) { const secret = checked.spec.secrets.resources.find((entry) => S.serialize(entry.ref) === S.serialize(ref)); if (!secret?.consumers.includes(consumer)) error("SECRET_CONSUMER_FORBIDDEN", "adapter.resource_sources"); }
  if (!S.plainTree(observation) || !keys(observation, ["ports"], "observation") || (observation.ports !== undefined && (!Array.isArray(observation.ports) || observation.ports.some((value) => !S.record(value) || !require("node:net").isIP(value.address) || !S.port(value.port) || !["tcp", "udp"].includes(value.protocol))))) error("INVALID_OBSERVATION", "observation");
  if (plan.diagnostics.some((value) => value.severity === "error")) return plan;
  for (const binding of bindings) if ((observation.ports || []).some((value) => value.port === binding.host_port && value.protocol === binding.protocol && (value.address === binding.host_address || ["0.0.0.0", "::"].includes(value.address) || ["0.0.0.0", "::"].includes(binding.host_address)))) plan.conflicts.push({ code: "CONFLICTING_PORT_BINDING", field: "observation.ports", severity: "error" });
  if (plan.diagnostics.some((value) => value.severity === "error")) return plan;
  const inputs = { spec: checked.spec, requirements: checked.requirements, adapter_input: S.clone(adapter_input) };
  inputs.adapter_input.resource_sources.sort((a, b) => S.lexical(S.serialize(a.ref), S.serialize(b.ref))); for (const service of Object.values(inputs.adapter_input.services)) service.bindings.sort((a, b) => S.lexical(S.serialize(a), S.serialize(b)));
  const fragments = {}; const artifact = (file, content, mode = 0o644) => plan.artifacts.push({ path: file, content, mode, digest: S.digest(content) });
  for (const name of planned) {
    let capability; try { capability = require(`../capabilities/${name === "dkim" ? "mail" : name}`); } catch (_) { error("CAPABILITY_IMPLEMENTATION_PENDING", `capability.${name}`); continue; }
    if (typeof capability.plan !== "function") { error("CAPABILITY_IMPLEMENTATION_PENDING", `capability.${name}`); continue; }
    const output = capability.plan(inputs, checked.effective_domain, name); fragments[name] = output.compose;
    for (const item of output.artifacts || []) artifact(item.path, item.content, item.mode);
    plan.resources.push(...(output.resources || [])); plan.prerequisites.push(...(output.prerequisites || []));
  }
  if (checked.spec.http.enabled) {
    if (inputs.adapter_input.gateway?.project !== adapter_input.project || inputs.adapter_input.gateway?.network !== adapter_input.network) error("INCOMPATIBLE_ADAPTER_CONFIGURATION", "adapter.gateway.ownership");
    const gateway_spec = { contract_version: "1", instance: checked.spec.instance, dns: { mode: checked.spec.dns.mode }, http: checked.spec.http, ...(checked.spec.http.https ? { tls: { provider: "provided", certificate_ref: checked.spec.tls.certificate_ref, private_key_ref: checked.spec.tls.private_key_ref } } : {}) };
    const gateway = require("./plan").planInfrastructure(gateway_spec, { contract_version: "1", http: checked.requirements.http }, inputs.adapter_input.gateway, observation);
    if (!gateway.applicable) plan.diagnostics.push(...gateway.diagnostics, ...gateway.conflicts); else { for (const value of gateway.artifacts) if (value.path === "nginx.conf") artifact(value.path, value.content); fragments.gateway = JSON.parse(gateway.artifacts.find((value) => value.path === "gateway.compose.json").content); plan.resources.push(...gateway.resources); }
  } else if (adapter_input.gateway !== undefined) error("UNDECLARED_SERVICE_RESOURCE", "adapter.gateway");
  for (const name of ["tls", "database", "redis", "dns", "smtp", "http-gateway"]) if (name === "http-gateway" ? checked.spec.http.enabled : name === "dns" ? checked.spec.dns.mode === "local" : checked.spec[name === "smtp" ? "mail" : name]) plan.capabilities.push({ name, required: checked.requirements.capabilities.includes(name) });
  const selected_refs = [checked.spec.database?.mode === "managed" && checked.spec.database.admin_secret_ref, checked.spec.database?.service_secret_ref, checked.spec.redis?.auth_secret_ref, checked.spec.dns.mode === "local" && checked.spec.dns.tsig_ref, checked.spec.tls?.private_key_ref, checked.spec.tls?.ca_key_ref, checked.spec.tls?.account_key_ref, checked.spec.tls?.challenge_secret_ref, checked.spec.mail?.submission_secret_ref, checked.spec.mail?.relay_secret_ref, checked.spec.mail?.dkim?.key_ref].filter(Boolean);
  plan.required_secrets = checked.spec.secrets.resources.filter((value) => selected_refs.some((ref) => S.serialize(ref) === S.serialize(value.ref)));
  plan.resources.push({ id: checked.spec.secrets.store_resource, kind: "secret-store", persistent: true, backup_required: true, owner: checked.spec.instance.id, references: plan.required_secrets.map((value) => value.ref) });
  if (checked.spec.tls) { plan.resources.push({ id: checked.spec.tls.state_resource || "provided-tls", kind: "certificate-state", persistent: true, backup_required: true, owner: checked.spec.instance.id, provider: checked.spec.tls.provider }); plan.prerequisites.push({ owner: "operator", code: "TLS_MATERIAL_VALIDATION_REQUIRED" }, { owner: "IL-3", code: "TLS_GATEWAY_ACTIVATION_REQUIRED" }); }
  if (checked.spec.tls?.provider === "acme") plan.prerequisites.push({ owner: "operator", code: "PINNED_LEGO_5_5_2_AND_EXPLICIT_DNS_AUTHORIZATION_REQUIRED" });
  for (const name of ["database", "redis"]) if (checked.spec[name]?.mode === "external") plan.prerequisites.push({ owner: "operator", code: `EXTERNAL_${name.toUpperCase()}_AUTH_PROTOCOL_OBSERVATION_REQUIRED` });
  plan.prerequisites.push({ owner: "operator", code: "EXPLICIT_SECRET_MATERIALIZATION_REQUIRED" }, { owner: "IL-3", code: "CAPABILITY_ASSEMBLY_ACTIVATION_AND_RECOVERY_REQUIRED" });
  const revision = S.digest({ inputs, artifacts: plan.artifacts, fragments, resources: plan.resources });
  for (const [name, fragment] of Object.entries(fragments)) { for (const service of Object.values(fragment.services || {})) service.labels = { ...(service.labels || {}), "org.drumee.infra.owner": adapter_input.project, "org.drumee.infra.revision": revision }; artifact(`${name}.compose.json`, `${JSON.stringify(S.canonical(fragment), null, 2)}\n`); }
  Object.assign(plan, { revision, inputs, ...(checked.effective_domain ? { effective_domain: checked.effective_domain } : {}), applicable: !plan.conflicts.length && !plan.diagnostics.some((value) => value.severity === "error") });
  plan.artifacts.sort((a, b) => S.lexical(a.path, b.path));
  return plan;
}
module.exports = { planV2 };
