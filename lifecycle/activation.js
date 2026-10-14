"use strict";
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const crypto = require("node:crypto");
const S = require("../lib/spec");
const F = require("../lib/filesystem-safety");
const P = require("./preparation");
const D = require("./docker");
const J = require("./journal");
function readActive(root) {
  const file = path.join(root, "active.json"); if (!fs.existsSync(file)) return null;
  let active; try { active = JSON.parse(F.read(file)); } catch (_) { F.fail("ACTIVE_STATE_CORRUPTED"); }
  if (!S.plainTree(active) || !/^[a-f0-9]{64}$/.test(active.revision || "") || active.attestation_digest !== S.digest(active.attestation)) F.fail("ACTIVE_STATE_CORRUPTED");
  const event = J.readJournal(root).find((value) => value.sequence === active.journal_sequence);
  if (!event || event.phase !== "active" || event.revision !== active.revision || event.details.attestation_digest !== active.attestation_digest) F.fail("ACTIVE_STATE_UNATTESTED"); return active;
}
function nativeCheck(prepared, name, driver) {
  const run = (...args) => driver.compose(prepared, ["run", "--rm", "--no-deps", ...args]);
  if (name === "dns") { run("dns", "named-checkconf", "/config/bind9.conf"); run("dns", "named-checkzone", prepared.composition.plan.effective_domain, "/var/cache/bind/" + prepared.zone.file); }
  if (name === "database") run("--entrypoint", "mariadbd", "database", "--defaults-extra-file=/config/mariadb.cnf", "--verbose", "--help");
  if (name === "redis") run("--entrypoint", "/bin/sh", "redis", "-c", 'set -eu; umask 077; infra_password="$(cat /run/secrets/redis-auth)"; printf \'requirepass "%s"\\n\' "$infra_password" >/tmp/redis-auth.conf; redis-server /config/redis.conf --port 0 --unixsocket /tmp/redis-check.sock --dir /tmp --appendonly no --save "" --daemonize yes --pidfile /tmp/redis-check.pid --logfile /tmp/redis-check.log; REDISCLI_AUTH="$infra_password" redis-cli -s /tmp/redis-check.sock shutdown nosave');
  if (name === "dkim") run("dkim", "-n", "-x", "/config/opendkim.conf");
  if (name === "mail") run("--entrypoint", "postconf", "mail", "-c", "/config", "-n");
  if (name === "gateway") run("gateway", "-t");
}
function exec(prepared, name, driver, ...args) { return driver.compose(prepared, ["exec", "-T", name, ...args]); }
function provisionAccount(prepared, driver) {
  const config = prepared.composition.plan.inputs.spec.database; if (config?.mode !== "managed") return;
  const query = (sql) => exec(prepared, "database", driver, "/bin/sh", "-c", 'MYSQL_PWD="$(cat /run/secrets/database-admin)" exec mariadb --protocol=socket -uroot --batch --skip-column-names -e "$1"', "infra-account", sql);
  if (!/^11\.4\./.test(query("SELECT VERSION()").trim())) F.fail("DATABASE_ENGINE_INCOMPATIBLE");
  // The password stays inside the owned container, never in command arguments.
  exec(prepared, "database", driver, "/bin/sh", "-c", `set -eu; infra_password="$(cat /run/secrets/database-service)"; case "$infra_password" in *[!A-Za-z0-9_+=.:/@-]*|"") exit 78;; esac; export MYSQL_PWD="$(cat /run/secrets/database-admin)"; if [ "$(mariadb --protocol=socket -uroot --batch --skip-column-names -e "SELECT COUNT(*) FROM mysql.user WHERE User='${config.service_user}' AND Host='%'")" = 0 ]; then printf "CREATE USER '${config.service_user}'@'%%' IDENTIFIED BY '%s';\\n" "$infra_password" | mariadb --protocol=socket -uroot --batch; fi`);
  const response = exec(prepared, "database", driver, "/bin/sh", "-c", `MYSQL_PWD="$(cat /run/secrets/database-service)" exec mariadb -h127.0.0.1 -u${config.service_user} --batch --skip-column-names -e 'SELECT 1'`);
  if (response.trim() !== "1") F.fail("DATABASE_SERVICE_AUTHENTICATION_FAILED");
}
function protocolCheck(prepared, name, driver) {
  const spec = prepared.composition.plan.inputs.spec;
  if (name === "dns") {
    const port = String(prepared.composition.plan.inputs.adapter_input.services.dns.listen_port);
    const address = exec(prepared, name, driver, "dig", "@127.0.0.1", "-p", port, prepared.composition.plan.effective_domain, "A", "+short").trim();
    const soa = exec(prepared, name, driver, "dig", "@127.0.0.1", "-p", port, "+tcp", prepared.composition.plan.effective_domain, "SOA", "+short").trim().split(/\s+/);
    if (address !== spec.dns.ipv4 || soa[2] !== String(spec.dns.serial)) F.fail("DNS_PROTOCOL_FAILED");
  } else if (name === "database") {
    const version = exec(prepared, name, driver, "/bin/sh", "-c", 'MYSQL_PWD="$(cat /run/secrets/database-admin)" exec mariadb --protocol=socket -uroot --batch --skip-column-names -e "SELECT VERSION()"').trim(); if (!version.startsWith("11.4.")) F.fail("DATABASE_ENGINE_INCOMPATIBLE");
  } else if (name === "redis") { if (exec(prepared, name, driver, "/bin/sh", "-c", `REDISCLI_AUTH="$(cat /run/secrets/redis-auth)" redis-cli -h 127.0.0.1 -p ${spec.redis.endpoint.port} ping`).trim() !== "PONG") F.fail("REDIS_PROTOCOL_FAILED");
  } else if (name === "gateway") exec(prepared, name, driver, "wget", "-q", "-O", "/dev/null", `http://127.0.0.1:${prepared.composition.plan.inputs.adapter_input.gateway.health_port}/__infra_ready`);
  else if (name === "dkim") exec(prepared, name, driver, "opendkim", "-n", "-x", "/config/opendkim.conf");
  else if (name === "mail") { exec(prepared, name, driver, "postfix", "-c", "/run/infra-mail/config", "check");
    const authentication = spec.mail.submission_secret_ref ? `infra_auth="$(printf '\\0${spec.mail.submission_user}\\0%s' "$(cat /run/secrets/mail-submission)" | openssl base64 -A)"; printf 'EHLO infrastructure\\r\\nAUTH PLAIN %s\\r\\nQUIT\\r\\n' "$infra_auth"` : "printf 'EHLO infrastructure\\r\\nQUIT\\r\\n'";
    const response = exec(prepared, name, driver, "/bin/sh", "-c", `{ ${authentication}; } | openssl s_client -starttls smtp -connect 127.0.0.1:${spec.mail.endpoint.port} -servername ${spec.mail.hostname} -CAfile /run/secrets/mail-ca -verify_return_error -quiet`);
    if (spec.mail.submission_secret_ref ? !/(?:^|\n)235 /.test(response) : !/(?:^|\n)250/.test(response)) F.fail("SMTP_PROTOCOL_FAILED");
  } else if (prepared.composition.distribution.kernel?.id === name) {
    const health = prepared.composition.distribution.kernel.healthcheck.test.slice(1); exec(prepared, name, driver, ...health);
  }
}
async function httpsCheck(prepared) {
  const spec = prepared.composition.plan.inputs.spec; if (!spec.http.https) return { applicable: false };
  const binding = prepared.composition.plan.inputs.adapter_input.gateway.bindings[0]; if (!binding) F.fail("HTTPS_BINDING_REQUIRED");
  const ca = F.read(path.join(prepared.candidate, "ca-public.pem"), false);
  const address = ["0.0.0.0", "::"].includes(binding.host_address) ? binding.host_address === "::" ? "::1" : "127.0.0.1" : binding.host_address;
  return new Promise((resolve, reject) => {
    let request; const timeout = setTimeout(() => { request?.destroy(); reject(Object.assign(new Error("HTTPS_PROTOCOL_FAILED"), { code: "HTTPS_PROTOCOL_FAILED" })); }, 5000);
    request = https.get({ hostname: address, port: binding.host_port, path: "/__infra_ready", servername: prepared.composition.plan.effective_domain, ca, rejectUnauthorized: true, headers: { Host: `${prepared.composition.plan.effective_domain}:${binding.host_port}` } }, (response) => {
      const certificate = response.socket.getPeerCertificate(); let bytes = 0; response.on("data", (data) => { bytes += data.length; if (bytes > 4096) request.destroy(); });
      response.on("end", () => { clearTimeout(timeout); if (response.statusCode !== 200 || certificate.fingerprint256 !== prepared.certificate.fingerprint) reject(Object.assign(new Error("HTTPS_PROTOCOL_FAILED"), { code: "HTTPS_PROTOCOL_FAILED" })); else resolve({ verified: true, fingerprint: certificate.fingerprint256 }); });
    }); request.on("error", () => { clearTimeout(timeout); reject(Object.assign(new Error("HTTPS_PROTOCOL_FAILED"), { code: "HTTPS_PROTOCOL_FAILED" })); });
  });
}
function classifyChanges(active, prepared) {
  if (!active) return { categories: ["fresh-install"], compatible: true };
  const prior = active.prepared;
  if (prior.revision === prepared.revision) return { categories: ["no-op"], compatible: true };
  const categories = ["container-recreation"];
  const a = prior.composition, b = prepared.composition;
  if (a.instance_id !== b.instance_id || a.plan.effective_domain !== b.plan.effective_domain || S.serialize(a.resources) !== S.serialize(b.resources)) return { categories: ["persistent-volume-change", "incompatible-destructive-change"], compatible: false };
  if (S.serialize(a.distribution.schema_versions) !== S.serialize(b.distribution.schema_versions)) return { categories: ["kernel-schema-prerequisite"], compatible: false };
  if (Object.entries(b.compose.services).some(([name, value]) => a.compose.services[name]?.image !== value.image)) categories.push("image-upgrade");
  if (S.serialize(prior.fingerprints) !== S.serialize(prepared.fingerprints)) return { categories: ["secret-rotation"], compatible: false };
  if (prior.certificate?.fingerprint !== prepared.certificate?.fingerprint) categories.push("certificate-renewal");
  if (prior.zone?.zone_digest !== prepared.zone?.zone_digest) categories.push("dns-zone-update");
  if (categories.length === 1) categories.push("configuration-only"); return { categories, compatible: true };
}
function checkObserved(prepared, observed, images) {
  const service = prepared.compose.services[observed.service];
  if (!service || observed.owner !== prepared.project || observed.project !== prepared.project || observed.image !== service.image || observed.image_id !== images[service.image] || observed.revision !== prepared.revision) F.fail("RUNTIME_IDENTITY_MISMATCH");
  const actual = Object.entries(observed.ports || {}).flatMap(([target, ports]) => (ports || []).map((value) => `${target}:${value.HostIp}:${value.HostPort}`)).sort();
  const expected = (service.ports || []).map((value) => `${value.target}/${value.protocol}:${value.host_ip}:${value.published}`).sort(); if (S.serialize(actual) !== S.serialize(expected)) F.fail("UNEXPECTED_SERVICE_EXPOSURE");
  for (const mount of service.volumes || []) { const source = mount.source.startsWith("./") ? path.join(prepared.candidate, mount.source.slice(2)) : mount.source; const actual_mount = observed.mounts?.find((value) => value.Destination === mount.target); if (!actual_mount || actual_mount.Source !== source || actual_mount.RW !== !mount.read_only) F.fail("RUNTIME_MOUNT_MISMATCH"); }
}
async function inspectDeployment(root, context) {
  const driver = context.driver || D; const active = readActive(root);
  if (!active) return { contract_version: "1", root, active_revision: null, ready: false, diagnostic_codes: ["DEPLOYMENT_NOT_ACTIVE"] };
  try {
    const prepared = P.verifyPrepared(active.prepared, { ...context, root }, driver); const images = driver.checkImages(prepared.composition); const observed = driver.inspectProject(prepared.project, Object.keys(prepared.compose.services));
    const pending = J.readJournal(root).filter((value) => ["activation-intent", "active", "activation-failed", "recovery-required", "stopped"].includes(value.phase)).at(-1);
    if (!pending || pending.phase !== "active" || pending.revision !== active.revision) F.fail("ACTIVATION_RECOVERY_REQUIRED");
    for (const evidence of active.attestation.services) { const resource = observed.find((value) => value.service === evidence.service); if (!resource) F.fail("ACTIVE_RESOURCE_MISSING"); checkObserved(prepared, resource, images); if (resource.id !== evidence.container_id || resource.started_at !== evidence.started_at || !resource.running || resource.health !== "healthy") F.fail("RUNTIME_ATTESTATION_INVALIDATED"); protocolCheck(prepared, evidence.service, driver); }
    const https = context.verify_https || httpsCheck; if (prepared.composition.plan.inputs.spec.http.https) await https(prepared);
    const tls_pending = prepared.certificate && !prepared.composition.plan.inputs.spec.http.https;
    const required_tls_pending = tls_pending && prepared.composition.plan.inputs.requirements.capabilities.includes("tls");
    return { contract_version: "1", root, project: prepared.project, desired_revision: prepared.desired_revision, active_revision: active.revision, ready: !required_tls_pending, assurance: "controlled-recreation-and-protocol-verification", in_memory_config_measured: false, acceptance: prepared.composition.acceptance, certificate: prepared.certificate ? { ...prepared.certificate, activation_required: !!tls_pending, readiness: tls_pending ? "prepared-pending-activation" : "https-verified" } : undefined, diagnostic_codes: [...(active.optional_diagnostics || []).map((value) => value.code), ...(required_tls_pending ? ["TLS_ACTIVATION_PREREQUISITE_OUTSTANDING"] : [])], services: active.attestation.services.map((value) => ({ service: value.service, container_id: value.container_id, protocol_functional: true })), schema_versions: prepared.composition.distribution.schema_versions };
  } catch (error) { return { contract_version: "1", root, active_revision: active.revision, ready: false, diagnostic_codes: [safeCode(error)] }; }
}
function safeCode(error) { return /^[A-Z][A-Z0-9_]{1,79}$/.test(error?.code || "") ? error.code : "LIFECYCLE_OBSERVATION_FAILED"; }
async function activateDeployment(prepared, context) {
  const driver = context.driver || D; P.verifyPrepared(prepared, context, driver);
  return F.lockAsync(prepared.root, async () => {
    const entries = J.readJournal(prepared.root); const pending = entries.filter((value) => ["activation-intent", "active", "activation-failed", "recovery-required"].includes(value.phase)).at(-1);
    if (pending?.phase === "activation-intent" && context.recover !== true) F.fail("ACTIVATION_RECOVERY_REQUIRED");
    const prior = readActive(prepared.root); const change = classifyChanges(prior, prepared);
    if (!change.compatible) F.fail("INCOMPATIBLE_DEPLOYMENT_CHANGE");
    const observed = driver.inspectProject(prepared.project, Object.keys(prepared.compose.services)); driver.checkPorts(prepared.composition, observed); driver.checkNetworks(prepared.composition); const images = driver.checkImages(prepared.composition);
    if (change.categories.includes("image-upgrade") && !context.backup_evidence) F.fail("VERIFIED_BACKUP_REQUIRED");
    if (prior?.revision === prepared.revision) { const state = await inspectDeployment(prepared.root, context); if (state.ready) return { ...state, effect: "no-op" }; }
    J.append(prepared.root, "activation-intent", prepared.revision, prior ? { prior_revision: prior.revision } : {});
    const evidence = []; const optional_diagnostics = [];
    try {
      driver.compose(prepared, ["config", "-q"]);
      for (const name of prepared.composition.activation_order) {
        const job = prepared.composition.distribution.init_jobs.find((value) => value.id === name);
        if (job) {
          driver.compose(prepared, ["run", "--rm", "--no-deps", name]); driver.compose(prepared, ["run", "--rm", "--no-deps", "--entrypoint", job.validation_command[0], name, ...job.validation_command.slice(1)]); J.append(prepared.root, "job-completed", prepared.revision, { service: name }); continue;
        }
        const optional_mail = ["mail", "dkim"].includes(name) && !prepared.composition.plan.inputs.requirements.capabilities.includes("smtp");
        try {
          nativeCheck(prepared, name, driver); J.append(prepared.root, "native-valid", prepared.revision, { service: name });
          driver.compose(prepared, ["up", "-d", "--no-deps", "--force-recreate", "--wait", "--wait-timeout", "90", name]);
          const resource = driver.inspectProject(prepared.project, Object.keys(prepared.compose.services)).find((value) => value.service === name); if (!resource || !resource.running || resource.health !== "healthy") F.fail("SERVICE_STARTUP_FAILED"); checkObserved(prepared, resource, images);
          J.append(prepared.root, "service-started", prepared.revision, { service: name }); if (name === "database") provisionAccount(prepared, driver);
          protocolCheck(prepared, name, driver); J.append(prepared.root, "functional-verified", prepared.revision, { service: name }); evidence.push({ service: name, container_id: resource.id, image_id: resource.image_id, started_at: resource.started_at, revision: prepared.revision, native_validation: "candidate-and-process-sequence", protocol_functional: true });
        } catch (error) { if (!optional_mail) throw error; optional_diagnostics.push({ service: name, code: safeCode(error) }); }
      }
      if (prepared.composition.plan.inputs.spec.http.https) await (context.verify_https || httpsCheck)(prepared);
      const attestation = { revision: prepared.revision, composition_revision: prepared.composition.revision, configuration_digest: S.digest(prepared.files), services: evidence, assurance: "controlled-recreation-and-protocol-verification", in_memory_config_measured: false };
      const digest = S.digest(attestation); const event = J.append(prepared.root, "active", prepared.revision, { attestation_digest: digest });
      const active = { revision: prepared.revision, prepared, attestation, attestation_digest: digest, journal_sequence: event.sequence, prior_revision: prior?.revision || null, optional_diagnostics };
      F.atomic(path.join(prepared.root, "active.json"), JSON.stringify(active));
      if (prepared.certificate) F.atomic(path.join(prepared.root, "renewal.json"), JSON.stringify({ revision: prepared.revision, fingerprint: prepared.certificate.fingerprint, expires_at: prepared.certificate.expires_at, renew_before_days: prepared.composition.plan.inputs.spec.tls.renew_before_days || 14, scheduler: "distribution-trigger-required" }));
      return { ...(await inspectDeployment(prepared.root, context)), effect: prior ? "controlled-update" : "fresh-activation", change };
    } catch (error) {
      const code = safeCode(error); J.append(prepared.root, "activation-failed", prepared.revision, { code, ...(prior ? { prior_revision: prior.revision } : {}) });
      // Never claim old containers still match after a partial update. Recovery
      // is explicit, with preserved immutable candidates, journal and data.
      J.append(prepared.root, "recovery-required", prepared.revision, { code }); F.fail(code);
    }
  });
}
function diagnoseDeployment(state) { return { ready: state?.ready === true, diagnostic_codes: Array.isArray(state?.diagnostic_codes) ? state.diagnostic_codes : ["INVALID_DEPLOYMENT_STATE"], acceptance: state?.acceptance || "unverified" }; }
module.exports = { activateDeployment, inspectDeployment, diagnoseDeployment, classifyChanges, readActive, nativeCheck, protocolCheck, safeCode, httpsCheck, checkObserved };
