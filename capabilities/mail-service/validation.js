"use strict";
const net = require("node:net"), path = require("node:path"), crypto = require("node:crypto");
const schema = require("./schema.json");
const fail = (code) => { throw Object.assign(new Error(code), { code }); };
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
const digest = value => crypto.createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
function hostname(value) { return typeof value === "string" && value.length <= 253 && value.includes(".") && value.split(".").every(x => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(x)); }
function address(value) { if (typeof value !== "string" || value.length > 254) return false; const [user, domain, extra] = value.split("@"); return !extra && hostname(domain) && /^[a-z0-9][a-z0-9._-]{0,63}$/.test(user) && !user.includes("..") && !user.endsWith("."); }
function cidr(value) {
  if (typeof value !== "string") return null;
  const [ip, bits, extra] = value.split("/"); if (extra || net.isIP(ip) !== 4 || !/^(?:[1-9]|[12][0-9]|3[0-2])$/.test(bits || "")) return null;
  const n = ip.split(".").reduce((a, x) => a * 256 + Number(x), 0), size = 2 ** (32 - Number(bits));
  return n % size === 0 ? [n, n + size - 1] : null;
}
const privateIP = ip => net.isIP(ip) === 4 && (ip.startsWith("10.") || ip.startsWith("192.168.") || /^172\.(?:1[6-9]|2\d|3[01])\./.test(ip));
function validateMailService(input) {
  const diagnostics = [];
  const error = (code, field) => diagnostics.push({ code, path: field, severity: "error" });
  let normalized;
  try { normalized = JSON.parse(JSON.stringify(input)); } catch { return { valid: false, diagnostics: [{ code: "MAIL_CONFIGURATION_INVALID", path: "", severity: "error" }] }; }
  function visit(value, shape, field) {
    if (shape.const !== undefined && value !== shape.const) error("MAIL_CONSTANT_INVALID", field);
    if (shape.enum && !shape.enum.includes(value)) error("MAIL_ENUM_INVALID", field);
    if (shape.type === "object") {
      if (!value || typeof value !== "object" || Array.isArray(value)) { error("MAIL_OBJECT_REQUIRED", field); return; }
      for (const key of Object.keys(value)) if (!Object.hasOwn(shape.properties, key)) error("MAIL_UNKNOWN_FIELD", field + "." + key);
      for (const [key, child] of Object.entries(shape.properties)) {
        if (value[key] === undefined && child.default !== undefined) value[key] = structuredClone(child.default);
        if (value[key] !== undefined) visit(value[key], child, field + "." + key);
      }
      for (const key of shape.required || []) if (value[key] === undefined) error("MAIL_FIELD_REQUIRED", field + "." + key);
    } else if (shape.type === "array") {
      if (!Array.isArray(value)) { error("MAIL_ARRAY_REQUIRED", field); return; }
      if (value.length < (shape.minItems || 0) || shape.uniqueItems && new Set(value.map(x => JSON.stringify(canonical(x)))).size !== value.length) error("MAIL_ARRAY_INVALID", field);
      value.forEach((v, i) => visit(v, shape.items, field + "." + i));
    } else if (shape.type === "string") {
      if (typeof value !== "string" || shape.pattern && !new RegExp(shape.pattern).test(value) || shape.format === "ipv4" && net.isIP(value) !== 4) error("MAIL_STRING_INVALID", field);
    } else if (shape.type === "integer" && (!Number.isSafeInteger(value) || value < shape.minimum || value > shape.maximum)) error("MAIL_INTEGER_INVALID", field);
    else if (shape.type === "boolean" && typeof value !== "boolean") error("MAIL_BOOLEAN_INVALID", field);
  }
  visit(normalized, schema, "");
  if (diagnostics.length) return { valid: false, diagnostics };
  const s = normalized, d = s.deployment, subnet = cidr(s.networks.edge_subnet);
  if (![s.hostname, ...s.domains].every(hostname)) error("MAIL_DOMAIN_INVALID", "domains");
  const root = x => path.isAbsolute(x) && path.normalize(x) === x && x.split("/").length >= 3;
  if (![d.root, d.backup_root].every(root) || d.root === d.backup_root || d.root.startsWith(d.backup_root + "/") || d.backup_root.startsWith(d.root + "/")) error("MAIL_STORAGE_OVERLAP", "deployment");
  const gateway = s.networks.edge_gateway.split(".").reduce((a, x) => a * 256 + Number(x), 0);
  if (!subnet || gateway <= subnet[0] || gateway >= subnet[1] || !privateIP(s.networks.edge_gateway) || s.networks.private_submission.address !== s.networks.edge_gateway) error("MAIL_NETWORK_INVALID", "networks");
  for (const source of s.networks.private_submission.allowed_sources) if (!cidr(source) || !privateIP(source.split("/")[0])) error("MAIL_SOURCE_INVALID", "networks.private_submission.allowed_sources");
  if (s.outbound.minimal_backoff_seconds > s.outbound.maximal_backoff_seconds || s.outbound.queue_run_delay_seconds > s.outbound.maximal_backoff_seconds) error("MAIL_BACKOFF_INVALID", "outbound");
  if (s.delivery.message_size_bytes > s.delivery.default_quota_bytes) error("MAIL_QUOTA_INVALID", "delivery");
  if (s.dkim.length !== s.domains.length || s.domains.some(domain => s.dkim.filter(x => x.domain === domain).length !== 1)) error("MAIL_DKIM_COVERAGE", "dkim");
  s.domains.sort(); s.dkim.sort((a, b) => a.domain.localeCompare(b.domain)); s.outbound.require_verify_domains.sort();
  if (!s.outbound.require_verify_domains.every(hostname)) error("MAIL_DOMAIN_INVALID", "outbound.require_verify_domains");
  return diagnostics.length ? { valid: false, diagnostics } : { valid: true, normalized: s, diagnostics };
}
function validateRegistry(registry, spec) {
  const keys = (value, allowed) => value && typeof value === "object" && !Object.keys(value).some(k => !allowed.includes(k));
  if (!registry || registry.contract !== "drumee.mail-registry/1" || !Number.isSafeInteger(registry.generation) || registry.generation < 1 || !Array.isArray(registry.mailboxes) || !Array.isArray(registry.aliases) || !Array.isArray(registry.accounts)) fail("MAIL_REGISTRY_INVALID");
  if (!keys(registry, ["contract", "generation", "mailboxes", "aliases", "accounts", "domains"])) fail("MAIL_REGISTRY_INVALID");
  const ids = new Set(), addresses = new Set(), accounts = new Set();
  const local = value => address(value) && spec.domains.includes(value.split("@")[1]);
  for (const b of registry.mailboxes) {
    if (!keys(b, ["id", "address", "quota_bytes", "receive_enabled", "imap_enabled", "submission_enabled"]) || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(b.id) || ids.has(b.id) || !local(b.address) || addresses.has(b.address) || !Number.isSafeInteger(b.quota_bytes) || b.quota_bytes < 1048576 || b.quota_bytes > 1099511627776 || [b.receive_enabled, b.imap_enabled, b.submission_enabled].some(x => typeof x !== "boolean")) fail("MAIL_MAILBOX_INVALID");
    ids.add(b.id); addresses.add(b.address);
  }
  for (const a of registry.aliases) {
    if (!keys(a, ["address", "mailbox_id", "receive_enabled"]) || !local(a.address) || addresses.has(a.address) || !ids.has(a.mailbox_id) || typeof a.receive_enabled !== "boolean") fail("MAIL_ALIAS_INVALID");
    addresses.add(a.address);
  }
  for (const a of registry.accounts) {
    if (!keys(a, ["id", "enabled", "credential_generation", "envelope_from", "header_from"]) || !/^[a-z][a-z0-9-]{0,62}$/.test(a.id) || accounts.has(a.id) || !Number.isSafeInteger(a.credential_generation) || a.credential_generation < 1 || typeof a.enabled !== "boolean" || ![a.envelope_from, a.header_from].every(x => Array.isArray(x) && x.length && x.every(local)) || a.envelope_from.some(x => !addresses.has(x))) fail("MAIL_ACCOUNT_INVALID");
    accounts.add(a.id);
  }
  return structuredClone(registry);
}
module.exports = { validateMailService, validateRegistry, hostname, address, digest, canonical, fail };
