"use strict";
const net = require("node:net");
const S = require("./spec");
const { descriptor, validRef } = require("../capabilities/secrets");
function validateSpecV2(spec, requirements) {
  const diagnostics = []; const error = (code, field) => diagnostics.push({ code, field, severity: "error" });
  if (!S.plainTree(spec) || !S.plainTree(requirements)) return { valid: false, diagnostics: [{ code: "INVALID_CONFIGURATION", field: "input", severity: "error" }] };
  function keys(value, allowed, field) { if (!S.record(value)) { error("INVALID_CONFIGURATION", field); return false; } for (const key of Object.keys(value)) if (!allowed.includes(key)) error(/password|token|secret_value|credential_value/i.test(key) ? "SECRET_VALUE_FORBIDDEN" : "UNSUPPORTED_CAPABILITY_REQUIREMENT", field); return true; }
  const endpoint = (value, field) => { if (!keys(value, ["host", "port", "transport"], field) || !S.endpoint(value)) error("INVALID_ENDPOINT", field); };
  const ref = (value, field) => { if (!validRef(value)) error("INVALID_SECRET_REFERENCE", field); };
  const id = (value, field) => { if (!S.identifier(value)) error("INVALID_RESOURCE_ID", field); };
  if (!keys(spec, ["contract_version", "instance", "dns", "http", "tls", "secrets", "database", "redis", "mail"], "spec") || !keys(requirements, ["contract_version", "capabilities", "http"], "requirements")) return { valid: false, diagnostics };
  if (spec?.contract_version !== "2" || requirements?.contract_version !== "2") error("INVALID_CONTRACT_VERSION", "contract_version");
  if (keys(spec?.instance, ["id", "domain"], "instance")) { id(spec.instance.id, "instance.id"); if (spec.instance.domain !== undefined && !S.hostname(spec.instance.domain)) error("INVALID_HOSTNAME", "instance.domain"); }
  if (keys(spec?.http, ["enabled", "https", "accepted_hosts"], "http") && (typeof spec.http.enabled !== "boolean" || typeof spec.http.https !== "boolean")) error("INVALID_CONFIGURATION", "http");
  if (spec.http?.accepted_hosts !== undefined && (!Array.isArray(spec.http.accepted_hosts) || spec.http.accepted_hosts.some((value) => !S.hostname(value)))) error("INVALID_HOSTNAME", "http.accepted_hosts");
  const dns = spec?.dns;
  if (keys(dns, ["mode", "ipv4", "ipv6", "ipv6_reachable", "serial", "clients", "listen", "recursion", "forwarders", "tsig_ref", "split_horizon", "state_resource"], "dns")) {
    if (!["none", "local", "localhost"].includes(dns.mode)) error("INVALID_DNS_MODE", "dns.mode");
    if (dns.mode !== "local" && Object.keys(dns).some((key) => key !== "mode")) error("DNS_RESOURCES_FORBIDDEN", "dns");
    if (dns.mode === "local") {
      if (net.isIP(dns.ipv4) !== 4 || /^(?:0\.|127\.|169\.254\.|22[4-9]\.|23\d\.)/.test(dns.ipv4)) error("INVALID_INSTANCE_LAN_ADDRESS", "dns.ipv4");
      if (dns.ipv6 !== undefined && (net.isIP(dns.ipv6) !== 6 || dns.ipv6_reachable !== true || ["::", "::1"].includes(dns.ipv6))) error("IPV6_REACHABILITY_REQUIRED", "dns.ipv6");
      if (!Number.isSafeInteger(dns.serial) || dns.serial < 1 || dns.serial > 4294967295) error("INVALID_DNS_SERIAL", "dns.serial");
      if (!Array.isArray(dns.clients) || !dns.clients.length || dns.clients.some((value) => !cidr(value))) error("INVALID_NETWORK_ALLOWLIST", "dns.clients");
      if (!Array.isArray(dns.listen) || !dns.listen.length || dns.listen.some((value) => !net.isIP(value))) error("INVALID_ENDPOINT", "dns.listen");
      if (typeof dns.recursion !== "boolean") error("INVALID_CONFIGURATION", "dns.recursion");
      if (dns.recursion && (!Array.isArray(dns.clients) || !Array.isArray(dns.forwarders) || !dns.forwarders.length || dns.forwarders.some((value) => !net.isIP(value)) || dns.clients.includes("0.0.0.0/0") || dns.clients.includes("::/0"))) error("OPEN_RESOLVER_FORBIDDEN", "dns.recursion");
      if (!dns.recursion && dns.forwarders !== undefined) error("UNSUPPORTED_CAPABILITY_REQUIREMENT", "dns.forwarders");
      if (dns.tsig_ref !== undefined) ref(dns.tsig_ref, "dns.tsig_ref"); id(dns.state_resource, "dns.state_resource");
      if (spec.instance?.domain && !spec.instance.domain.endsWith(".lan") && dns.split_horizon !== true) error("SPLIT_HORIZON_ACKNOWLEDGEMENT_REQUIRED", "dns.split_horizon");
    }
  }
  if (keys(spec?.secrets, ["store_resource", "resources"], "secrets")) {
    id(spec.secrets.store_resource, "secrets.store_resource");
    if (!Array.isArray(spec.secrets.resources) || spec.secrets.resources.some((value) => !descriptor(value))) error("INVALID_SECRET_DESCRIPTOR", "secrets.resources");
    else if (new Set(spec.secrets.resources.map((value) => S.serialize(value.ref))).size !== spec.secrets.resources.length) error("DUPLICATE_RESOURCE_OWNERSHIP", "secrets.resources");
  }
  if (diagnostics.length) return { valid: false, diagnostics };
  const needed_secret = (value, type, consumer, field) => { ref(value, field); const found = spec.secrets?.resources?.find?.((entry) => S.record(entry) && S.serialize(entry.ref) === S.serialize(value)); if (!found || found.type !== type || !Array.isArray(found.consumers) || !found.consumers.includes(consumer)) error("SECRET_CONSUMER_FORBIDDEN", field); };
  if (spec.tls !== undefined && keys(spec.tls, ["provider", "certificate_ref", "private_key_ref", "ca_key_ref", "account_key_ref", "challenge_secret_ref", "state_resource", "leaf_days", "renew_before_days", "acme_directory", "dns_provider", "email", "ca_bundle_ref"], "tls")) {
    const value = spec.tls; if (!["local", "provided", "acme"].includes(value.provider)) error("UNSUPPORTED_TLS_PROVIDER", "tls.provider");
    ref(value.certificate_ref, "tls.certificate_ref"); needed_secret(value.private_key_ref, "tls-leaf-key", "tls-issuer", "tls.private_key_ref"); ref(value.ca_bundle_ref, "tls.ca_bundle_ref");
    if (value.provider !== "provided") { id(value.state_resource, "tls.state_resource"); if (!Number.isInteger(value.leaf_days) || value.leaf_days < 2 || value.leaf_days > 365 || !Number.isInteger(value.renew_before_days) || value.renew_before_days < 1 || value.renew_before_days >= value.leaf_days) error("INVALID_TLS_CONFIGURATION", "tls.renewal"); }
    if (value.provider === "local") needed_secret(value.ca_key_ref, "tls-ca-key", "tls-issuer", "tls.ca_key_ref");
    if (value.provider === "acme") {
      needed_secret(value.account_key_ref, "acme-account-key", "tls-issuer", "tls.account_key_ref"); needed_secret(value.challenge_secret_ref, "acme-dns-credential", "tls-issuer", "tls.challenge_secret_ref");
      if (!require("../capabilities/tls").publicAcmeHostname(S.resolveDomain(spec))) error("ACME_HOSTNAME_INVALID", "instance.domain");
      if (!["https://acme-v02.api.letsencrypt.org/directory", "https://acme-staging-v02.api.letsencrypt.org/directory"].includes(value.acme_directory) || value.dns_provider !== "cloudflare" || typeof value.email !== "string" || !/^[a-zA-Z0-9_.+-]+@[a-z0-9.-]+\.[a-z]+$/.test(value.email)) error("INVALID_ACME_CONFIGURATION", "tls.acme");
    }
    for (const field of value.provider === "provided" ? ["ca_key_ref", "account_key_ref", "challenge_secret_ref", "state_resource", "leaf_days", "renew_before_days", "acme_directory", "dns_provider", "email"] : value.provider === "local" ? ["account_key_ref", "challenge_secret_ref", "acme_directory", "dns_provider", "email"] : ["ca_key_ref"]) if (value[field] !== undefined) error("UNSUPPORTED_PROVIDER_COMBINATION", `tls.${field}`);
  }
  if (spec.database !== undefined && keys(spec.database, ["mode", "endpoint", "engine_series", "admin_secret_ref", "service_secret_ref", "service_user", "state_resource", "initialize", "accounts"], "database")) {
    const value = spec.database; endpoint(value.endpoint, "database.endpoint"); if (!["managed", "external"].includes(value.mode) || value.engine_series !== "11.4") error("UNSUPPORTED_DATABASE_ENGINE", "database");
    needed_secret(value.service_secret_ref, "database-service", "database-client", "database.service_secret_ref"); if (typeof value.service_user !== "string" || !/^[a-z][a-z0-9_]{0,31}$/.test(value.service_user)) error("INVALID_DATABASE_ACCOUNT", "database.service_user");
    if (value.mode === "managed") { needed_secret(value.admin_secret_ref, "database-admin", "database", "database.admin_secret_ref"); id(value.state_resource, "database.state_resource"); if (typeof value.initialize !== "boolean") error("INVALID_CONFIGURATION", "database.initialize"); }
    else if (["admin_secret_ref", "state_resource", "initialize"].some((key) => value[key] !== undefined)) error("EXTERNAL_RESOURCE_MANAGEMENT_FORBIDDEN", "database");
    if (value.accounts !== undefined) {
      if (value.mode !== "managed" || !Array.isArray(value.accounts) || value.accounts.length > 16) error("INVALID_DATABASE_ACCOUNT", "database.accounts");
      else {
        const users = new Set([value.service_user, "root", "mariadb.sys", "mysql"]), refs = new Set([S.serialize(value.service_secret_ref)]);
        for (const account of value.accounts) {
          if (!keys(account, ["user", "secret_ref"], "database.accounts") || !/^[a-z][a-z0-9_]{0,31}$/.test(account.user || "") || users.has(account.user) || refs.has(S.serialize(account.secret_ref))) { error("INVALID_DATABASE_ACCOUNT", "database.accounts"); continue; }
          users.add(account.user); refs.add(S.serialize(account.secret_ref));
          needed_secret(account.secret_ref, "database-service", "database-account", "database.accounts.secret_ref");
        }
      }
    }
  }
  if (spec.redis !== undefined && keys(spec.redis, ["mode", "endpoint", "auth_secret_ref", "persistence", "state_resource"], "redis")) {
    const value = spec.redis; endpoint(value.endpoint, "redis.endpoint"); if (!["managed", "external"].includes(value.mode) || !["ephemeral", "aof"].includes(value.persistence)) error("INVALID_REDIS_CONFIGURATION", "redis"); needed_secret(value.auth_secret_ref, "redis-auth", "redis", "redis.auth_secret_ref");
    if (value.mode === "managed" && value.persistence === "aof") id(value.state_resource, "redis.state_resource"); else if (value.state_resource !== undefined) error("UNSUPPORTED_PERSISTENCE_CONFIGURATION", "redis.state_resource");
  }
  if (spec.mail !== undefined && keys(spec.mail, ["mode", "endpoint", "hostname", "relay_endpoint", "relay_tls", "relay_user", "relay_secret_ref", "submission_user", "submission_secret_ref", "clients", "queue_resource", "initialize", "dkim"], "mail")) {
    const value = spec.mail; endpoint(value.endpoint, "mail.endpoint"); endpoint(value.relay_endpoint, "mail.relay_endpoint");
    if (!["capture", "relay"].includes(value.mode) || !S.hostname(value.hostname) || !["none", "required"].includes(value.relay_tls) || typeof value.initialize !== "boolean") error("INVALID_SMTP_CONFIGURATION", "mail");
    if (value.mode === "capture" && (typeof value.relay_endpoint?.host !== "string" || value.relay_endpoint.host.includes(".") || net.isIP(value.relay_endpoint.host))) error("EXTERNAL_CAPTURE_DESTINATION_FORBIDDEN", "mail.relay_endpoint");
    if (value.mode === "relay" && value.relay_tls !== "required") error("SMTP_RELAY_TLS_REQUIRED", "mail.relay_tls");
    if (!Array.isArray(value.clients) || !value.clients.length || value.clients.some((entry) => !cidr(entry)) || value.clients.includes("0.0.0.0/0") || value.clients.includes("::/0")) error("OPEN_RELAY_FORBIDDEN", "mail.clients");
    id(value.queue_resource, "mail.queue_resource"); if (value.submission_secret_ref !== undefined || value.submission_user !== undefined) { needed_secret(value.submission_secret_ref, "smtp-relay-credential", "mail", "mail.submission_secret_ref"); if (!S.identifier(value.submission_user)) error("INVALID_SMTP_CONFIGURATION", "mail.submission_user"); }
    if (!spec.tls || value.hostname !== S.resolveDomain(spec)) error("SMTP_TLS_RESOURCE_REQUIRED", "mail.hostname");
    if (value.relay_secret_ref !== undefined) { needed_secret(value.relay_secret_ref, "smtp-relay-credential", "mail", "mail.relay_secret_ref"); if (!S.identifier(value.relay_user)) error("INVALID_SMTP_CONFIGURATION", "mail.relay_user"); }
    if (value.relay_user !== undefined && value.relay_secret_ref === undefined) error("INVALID_SMTP_CONFIGURATION", "mail.relay_user");
    if (value.dkim !== undefined && keys(value.dkim, ["domain", "selector", "key_ref", "public_key"], "mail.dkim")) {
      if (!S.hostname(value.dkim.domain) || !/^[a-z][a-z0-9-]{0,62}$/.test(value.dkim.selector || "") || (value.dkim.public_key !== undefined && (typeof value.dkim.public_key !== "string" || !/^[a-zA-Z0-9+/=]{100,1024}$/.test(value.dkim.public_key)))) error("INVALID_DKIM_CONFIGURATION", "mail.dkim"); needed_secret(value.dkim.key_ref, "dkim-key", "dkim", "mail.dkim.key_ref");
    }
  }
  if (dns?.tsig_ref !== undefined) needed_secret(dns.tsig_ref, "dns-tsig", "dns", "dns.tsig_ref");
  const effective_domain = spec.instance && ["none", "local", "localhost"].includes(dns?.mode) ? S.resolveDomain(spec) : undefined;
  if ((spec.http?.enabled || spec.tls) && !effective_domain) error("MISSING_REQUIRED_HOSTNAME", "instance.domain");
  if (spec.http?.https && !spec.tls) error("MISSING_TLS_REFERENCE", "tls");
  if (spec.http?.enabled && requirements.http) {
    const legacy = { contract_version: "1", instance: spec.instance, dns: { mode: dns.mode }, http: spec.http, ...(spec.http.https && spec.tls ? { tls: { provider: "provided", certificate_ref: spec.tls.certificate_ref, private_key_ref: spec.tls.private_key_ref } } : {}) };
    const checked = require("./validation").validateSpec(legacy, { contract_version: "1", http: requirements.http }); diagnostics.push(...checked.diagnostics);
  } else if (spec.http?.enabled || requirements.http !== undefined) error("INCOMPATIBLE_GATEWAY_REQUIREMENTS", "requirements.http");
  if (!Array.isArray(requirements.capabilities) || requirements.capabilities.some((value) => !["http-gateway", "tls", "dns", "database", "redis", "smtp"].includes(value))) error("UNSUPPORTED_CAPABILITY_REQUIREMENT", "requirements.capabilities");
  else for (const capability of requirements.capabilities) if (!(capability === "http-gateway" ? spec.http?.enabled : capability === "dns" ? dns?.mode === "local" : spec[capability === "smtp" ? "mail" : capability])) error("MISSING_REQUIRED_CAPABILITY", `requirements.${capability}`);
  if (diagnostics.some((entry) => entry.severity === "error")) return { valid: false, diagnostics };
  const normalized = S.clone(spec); if (dns.mode === "localhost") delete normalized.instance.domain;
  if (normalized.database?.accounts) normalized.database.accounts.sort((a, b) => S.lexical(a.user, b.user));
  normalized.secrets.resources.sort((a, b) => S.lexical(S.serialize(a.ref), S.serialize(b.ref))); for (const entry of normalized.secrets.resources) entry.consumers.sort();
  for (const field of ["clients", "listen", "forwarders"]) if (normalized.dns[field]) normalized.dns[field] = [...new Set(normalized.dns[field])].sort();
  if (normalized.http.accepted_hosts) normalized.http.accepted_hosts = [...new Set(normalized.http.accepted_hosts)].sort(); if (normalized.mail) normalized.mail.clients = [...new Set(normalized.mail.clients)].sort();
  const normalized_requirements = S.clone(requirements); normalized_requirements.capabilities = [...new Set(requirements.capabilities)].sort();
  return { valid: true, diagnostics, spec: normalized, requirements: normalized_requirements, ...(effective_domain ? { effective_domain } : {}) };
}
function cidr(value) { if (typeof value !== "string") return false; const [address, mask, extra] = value.split("/"); const family = net.isIP(address); return !extra && family && /^\d+$/.test(mask || "") && Number(mask) <= (family === 4 ? 32 : 128); }
module.exports = { validateSpecV2, cidr };
