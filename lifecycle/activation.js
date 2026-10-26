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
const networksReady = require("../internal/network-readiness").createNetworkReadiness();
function readActive(root) {
  const file = path.join(root, "active.json"); if (!fs.existsSync(file)) return null;
  let active; try { active = JSON.parse(F.read(file)); } catch { F.fail("ACTIVE_STATE_CORRUPTED"); }
  if (!S.plainTree(active) || !/^[a-f0-9]{64}$/.test(active.revision || "") || active.attestation_digest !== S.digest(active.attestation)) F.fail("ACTIVE_STATE_CORRUPTED");
  const event = J.readJournal(root).find((value) => value.sequence === active.journal_sequence);
  if (!event || event.phase !== "active" || event.revision !== active.revision || event.details.attestation_digest !== active.attestation_digest) F.fail("ACTIVE_STATE_UNATTESTED"); return active;
}
function nativeCheck(prepared, name, driver) {
  const run = (...args) => driver.compose(prepared, ["run", "--rm", "--no-deps", ...args]);
  if (name === "dns") { run("dns", "named-checkconf", "/config/bind9.conf"); run("dns", "named-checkzone", prepared.composition.plan.effective_domain, "/var/cache/bind/" + prepared.zone.file); }
  if (name === "database") run("--entrypoint", "mariadbd", "database", "--defaults-extra-file=/config/mariadb.cnf", "--verbose", "--help");
  // Daemonization returns before the socket necessarily accepts connections.
  // Bound authenticated readiness before shutdown; invalid config still fails.
  if (name === "redis") run("--entrypoint", "/bin/sh", "redis", "-c", 'set -eu; umask 077; infra_password="$(cat /run/secrets/redis-auth)"; printf \'requirepass "%s"\\n\' "$infra_password" >/tmp/redis-auth.conf; redis-server /config/redis.conf --port 0 --unixsocket /tmp/redis-check.sock --dir /tmp --appendonly no --save "" --daemonize yes --pidfile /tmp/redis-check.pid --logfile /tmp/redis-check.log; infra_attempt=0; until REDISCLI_AUTH="$infra_password" redis-cli -s /tmp/redis-check.sock ping >/dev/null 2>&1; do infra_attempt=$((infra_attempt+1)); [ "$infra_attempt" -lt 100 ] || exit 78; sleep 0.05; done; REDISCLI_AUTH="$infra_password" redis-cli -s /tmp/redis-check.sock shutdown nosave');
  if (name === "dkim") run("dkim", "-n", "-x", "/config/opendkim.conf");
  if (name === "mail") run("--entrypoint", "postconf", "mail", "-c", "/config", "-n");
  if (name === "gateway") run("gateway", "-t");
}
function exec(prepared, name, driver, ...args) { return driver.compose(prepared, ["exec", "-T", name, ...args]); }
function provisionAccount(prepared, driver) {
  const config = prepared.composition.plan.inputs.spec.database; if (config?.mode !== "managed") return;
  const query = (sql) => exec(prepared, "database", driver, "/bin/sh", "-c", 'MYSQL_PWD="$(cat /run/secrets/database-admin)" exec mariadb --protocol=socket -uroot --batch --skip-column-names -e "$1"', "infra-account", sql);
  if (!/^11\.4\./.test(query("SELECT VERSION()").trim())) F.fail("DATABASE_ENGINE_INCOMPATIBLE");
  if (query("SELECT @@general_log, @@log_bin").trim() !== "0\t0") F.fail("DATABASE_CREDENTIAL_LOGGING_UNSAFE");
  // No grants here: SQL authorization belongs to the distribution's schema jobs.
  // Passwords stay inside the owned database container, never in arguments.
  const accounts = [{ user: config.service_user, file: "/run/secrets/database-service" }, ...(config.accounts || []).map(value => ({ user: value.user, file: "/run/secrets/database-account-" + value.user }))];
  for (const account of accounts) {
    exec(prepared, "database", driver, "/bin/sh", "-c", `set -eu; infra_password="$(cat ${account.file})"; case "$infra_password" in *[!A-Za-z0-9_+=.:/@-]*|"") exit 78;; esac; export MYSQL_PWD="$(cat /run/secrets/database-admin)"; if [ "$(mariadb --protocol=socket -uroot --batch --skip-column-names -e "SELECT COUNT(*) FROM mysql.user WHERE User='${account.user}' AND Host='%'")" = 0 ]; then printf "CREATE USER '${account.user}'@'%%' IDENTIFIED BY '%s';\\n" "$infra_password" | mariadb --protocol=socket -uroot --batch; fi`);
    const response = exec(prepared, "database", driver, "/bin/sh", "-c", `MYSQL_PWD="$(cat ${account.file})" exec mariadb -h127.0.0.1 -u${account.user} --batch --skip-column-names -e 'SELECT 1'`);
    if (response.trim() !== "1") F.fail("DATABASE_SERVICE_AUTHENTICATION_FAILED");
  }
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
  } else {
    const service = [prepared.composition.distribution.kernel, prepared.composition.distribution.application, ...(prepared.composition.distribution.services || [])].find(value => value?.id === name);
    if (!service) F.fail("FUNCTIONAL_READINESS_FAILED");
    exec(prepared, name, driver, ...service.healthcheck.test.slice(1));
  }
}
async function httpsCheck(prepared) {
  const spec = prepared.composition.plan.inputs.spec; if (!spec.http.https) return { applicable: false };
  const binding = prepared.composition.plan.inputs.adapter_input.gateway.bindings[0]; if (!binding) F.fail("HTTPS_BINDING_REQUIRED");
  const ca = F.read(path.join(prepared.candidate, "ca-public.pem"), false);
  const address = ["0.0.0.0", "::"].includes(binding.host_address) ? binding.host_address === "::" ? "::1" : "127.0.0.1" : binding.host_address;
  return new Promise((resolve, reject) => {
    let request; const timeout = setTimeout(() => { request?.destroy(); reject(Object.assign(new Error("HTTPS_PROTOCOL_FAILED"), { code: "HTTPS_PROTOCOL_FAILED" })); }, 5000);
    request = https.get({ agent: false, hostname: address, port: binding.host_port, path: "/__infra_ready", servername: prepared.composition.plan.effective_domain, ca, rejectUnauthorized: true, headers: { Host: `${prepared.composition.plan.effective_domain}:${binding.host_port}` } }, (response) => {
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
function verifyImageUpgrade(prior, candidate, driver) {
  // Initial support is an image rebuild with unchanged daemon version. Major,
  // minor and patch engine transitions need a distribution recovery contract.
  const checks = { database: ["mariadbd", "--version"], redis: ["redis-server", "--version"], dns: ["named", "-v"], mail: ["postconf", "-h", "mail_version"], dkim: ["opendkim", "-V"] };
  for (const [name, service] of Object.entries(candidate.compose.services)) {
    if (prior.compose.services[name]?.image === service.image) continue;
    const command = checks[name]; if (!command) F.fail("IMAGE_UPGRADE_COMPATIBILITY_UNVERIFIED");
    const before = driver.compose(prior, ["exec", "-T", name, ...command]).trim();
    const after = driver.compose(candidate, ["run", "--rm", "--no-deps", "--entrypoint", command[0], name, ...command.slice(1)]).trim();
    if (!before || before !== after) F.fail("ENGINE_VERSION_UPGRADE_REVIEW_REQUIRED");
  }
}
async function inspectDeployment(root, context) {
  const driver = context.driver || D; const active = readActive(root);
  if (!active) return { contract_version: "1", root, active_revision: null, ready: false, diagnostic_codes: ["DEPLOYMENT_NOT_ACTIVE"] };
  try {
    const prepared = P.verifyPrepared(active.prepared, { ...context, root }, driver); const images = driver.checkImages(prepared.composition); const observed = driver.inspectProject(prepared.project, Object.keys(prepared.compose.services));
    const pending = J.readJournal(root).filter((value) => ["activation-intent", "active", "activation-failed", "recovery-required", "stopped"].includes(value.phase)).at(-1);
    if (!pending || pending.phase !== "active" || pending.revision !== active.revision) F.fail("ACTIVATION_RECOVERY_REQUIRED");
    driver.checkNetworks(prepared.composition, { require_existing: true });
    const verified_services = [], optional_observations = [];
    for (const evidence of active.attestation.services) {
      try {
        const resource = observed.find(value => value.service === evidence.service);
        if (!resource) F.fail("ACTIVE_RESOURCE_MISSING");
        checkObserved(prepared, resource, images);
        if (resource.id !== evidence.container_id || resource.started_at !== evidence.started_at || !resource.running || resource.health !== "healthy") F.fail("RUNTIME_ATTESTATION_INVALIDATED");
        protocolCheck(prepared, evidence.service, driver); verified_services.push(evidence);
      } catch (error) {
        const optional_mail = prepared.composition.distribution.profile === "application" && ["mail", "dkim"].includes(evidence.service) && !prepared.composition.plan.inputs.requirements.capabilities.includes("smtp");
        if (!optional_mail) throw error;
        // Ownership, image, ports and mounts remain mandatory even for an
        // optional unavailable daemon; only functional/process failure is soft.
        if (!["ACTIVE_RESOURCE_MISSING", "RUNTIME_ATTESTATION_INVALIDATED", "DOCKER_LIFECYCLE_COMMAND_FAILED", "SMTP_PROTOCOL_FAILED"].includes(error.code)) throw error;
        optional_observations.push({ service: evidence.service, code: safeCode(error) });
      }
    }
    if (prepared.composition.plan.inputs.spec.http.https) await httpsCheck(prepared);
    const application = await require("./external-gateway").probe(prepared);
    const transition = require("./transitions").pending(root);
    const store = require("../capabilities/secrets").createFilesystemSecretStore(path.join(root, "secrets"), prepared.instance_id);
    for (const expected of prepared.fingerprints) {
      const current = store.inspect(expected.ref);
      if (current.fingerprint !== expected.fingerprint && !(context.allow_pending_rotation === true && transition && S.serialize(transition.ref) === S.serialize(expected.ref) && current.fingerprint === transition.previous_fingerprint && expected.fingerprint === transition.candidate_fingerprint)) F.fail("SECRET_GENERATION_AGREEMENT_UNVERIFIED");
    }
    const tls_pending = prepared.certificate && !prepared.composition.plan.inputs.spec.http.https;
    const required_tls_pending = tls_pending && prepared.composition.plan.inputs.requirements.capabilities.includes("tls");
    const rotation_pending = require("./transitions").pending(root) && context.allow_pending_rotation !== true;
    return { contract_version: "1", root, project: prepared.project, desired_revision: prepared.desired_revision, active_revision: active.revision, ready: !required_tls_pending && !rotation_pending, assurance: "controlled-recreation-and-protocol-verification", in_memory_config_measured: false, acceptance: prepared.composition.acceptance, ...(application.applicable === false ? {} : { application }), certificate: prepared.certificate ? { ...prepared.certificate, activation_required: !!tls_pending, readiness: tls_pending ? "prepared-pending-activation" : "https-verified" } : undefined, diagnostic_codes: [...[...(active.optional_diagnostics || []), ...optional_observations].map(value => value.code), ...(required_tls_pending ? ["TLS_ACTIVATION_PREREQUISITE_OUTSTANDING"] : []), ...(rotation_pending ? ["SECRET_TRANSITION_PENDING"] : [])], services: verified_services.map((value) => ({ service: value.service, container_id: value.container_id, protocol_functional: true })), schema_versions: prepared.composition.distribution.schema_versions };
  } catch (error) { return { contract_version: "1", root, active_revision: active.revision, ready: false, diagnostic_codes: [safeCode(error)] }; }
}
const diagnostic_codes = new Set(["INVALID_DOCKER_OBJECT_IDENTITY", "INVALID_NETWORK_ATTACHMENT", "NETWORK_ATTACHMENT_MISMATCH", "NETWORK_ATTACHMENT_UNSETTLED", "REQUIRED_CONTAINER_MISSING", "REQUIRED_NETWORK_MISSING", "UNEXPECTED_NETWORK_ATTACHMENT", "APPLICATION_PROTOCOL_FAILED", "SMTP_RECOVERY_UNQUALIFIED", "DOCKER_LIFECYCLE_COMMAND_FAILED", "DEPLOYMENT_OWNERSHIP_MISMATCH", "NETWORK_OWNERSHIP_MISMATCH", "DUPLICATE_SERVICE_IDENTITY", "REFERENCED_IMAGE_UNAVAILABLE", "IMAGE_DIGEST_MISMATCH", "CONFLICTING_PORT_BINDING", "PORT_OBSERVATION_UNAVAILABLE", "PREPARED_CONFIGURATION_CHANGED", "PREPARED_DEPLOYMENT_TAMPERED", "RUNTIME_IDENTITY_MISMATCH", "UNEXPECTED_SERVICE_EXPOSURE", "RUNTIME_MOUNT_MISMATCH", "ACTIVE_RESOURCE_MISSING", "RUNTIME_ATTESTATION_INVALIDATED", "ACTIVATION_RECOVERY_REQUIRED", "SECRET_ROTATION_RECOVERY_REQUIRED", "SECRET_GENERATION_AGREEMENT_UNVERIFIED", "SECRET_TRANSITION_NOT_AUTHORIZED", "NATIVE_VALIDATION_FAILED", "SERVICE_STARTUP_FAILED", "FUNCTIONAL_READINESS_FAILED", "DNS_PROTOCOL_FAILED", "DATABASE_ENGINE_INCOMPATIBLE", "DATABASE_CREDENTIAL_LOGGING_UNSAFE", "DATABASE_SERVICE_AUTHENTICATION_FAILED", "REDIS_PROTOCOL_FAILED", "SMTP_PROTOCOL_FAILED", "HTTPS_PROTOCOL_FAILED", "INCOMPATIBLE_DEPLOYMENT_CHANGE", "VERIFIED_BACKUP_REQUIRED", "IMAGE_UPGRADE_COMPATIBILITY_UNVERIFIED", "ENGINE_VERSION_UPGRADE_REVIEW_REQUIRED", "LIFECYCLE_JOURNAL_CORRUPTED", "ACTIVE_STATE_CORRUPTED", "ACTIVE_STATE_UNATTESTED", "UNSAFE_RESOURCE_PATH", "RESOURCE_PERMISSIONS_UNSAFE", "RESOURCE_OWNERSHIP_MISMATCH", "RESOURCE_MISSING", "BACKUP_CHECKSUM_MISMATCH", "BACKUP_RESOURCE_MISSING", "BACKUP_MANIFEST_CORRUPTED", "BACKUP_QUIESCENCE_NOT_OBSERVED", "DATABASE_EVENT_QUIESCENCE_REQUIRED", "CONSISTENT_DATABASE_DUMP_FAILED", "TLS_CERTIFICATE_EXPIRED", "TLS_CHAIN_INVALID", "TLS_KEY_MISMATCH", "TLS_SAN_MISMATCH", "TLS_CERTIFICATE_INVALID"]);
function safeCode(error) { return diagnostic_codes.has(error?.code) ? error.code : "LIFECYCLE_OBSERVATION_FAILED"; }
async function activateDeployment(prepared, context) {
  const driver = context.driver || D; P.verifyPrepared(prepared, context, driver);
  return F.lockAsync(prepared.root, async () => {
    const entries = J.readJournal(prepared.root); const pending = entries.filter((value) => ["activation-intent", "active", "activation-failed", "recovery-required"].includes(value.phase)).at(-1);
    const rotation = require("./transitions").pending(prepared.root); if (rotation && context.rotation_id !== rotation.id) F.fail("SECRET_ROTATION_RECOVERY_REQUIRED");
    if (pending?.phase === "activation-intent" && context.recover !== true) F.fail("ACTIVATION_RECOVERY_REQUIRED");
    const prior = readActive(prepared.root); const change = classifyChanges(prior, prepared);
    if (!change.compatible) { if (change.categories.length === 1 && change.categories[0] === "secret-rotation") require("./transitions").allowTransition(prior, prepared, context); else F.fail("INCOMPATIBLE_DEPLOYMENT_CHANGE"); }
    const observed = driver.inspectProject(prepared.project, Object.keys(prepared.compose.services)); driver.checkPorts(prepared.composition, observed); await networksReady(prepared.composition, driver, observed.length > 0); const images = driver.checkImages(prepared.composition);
    if (change.categories.includes("image-upgrade")) { require("./recovery").validateBackupEvidence(context.backup_evidence, prior, context); verifyImageUpgrade(prior.prepared, prepared, driver); }
    if (prior?.revision === prepared.revision) { const state = await inspectDeployment(prepared.root, context); if (state.ready) return { ...state, effect: "no-op" }; }
    J.append(prepared.root, "activation-intent", prepared.revision, prior ? { prior_revision: prior.revision } : {});
    const evidence = []; const optional_diagnostics = [];
    try {
      driver.compose(prepared, ["config", "-q"]);
      for (const name of prepared.composition.activation_order) {
        const job = prepared.composition.distribution.init_jobs.find((value) => value.id === name);
        if (job) {
          const artifact_digest = S.digest(job); const completed = J.readJournal(prepared.root).some((event) => event.phase === "job-completed" && event.details.service === name && event.details.artifact_digest === artifact_digest);
          if (!completed) driver.compose(prepared, ["run", "--rm", "--no-deps", name]);
          driver.compose(prepared, ["run", "--rm", "--no-deps", "--entrypoint", job.validation_command[0], name, ...job.validation_command.slice(1)]);
          if (!completed) J.append(prepared.root, "job-completed", prepared.revision, { service: name, artifact_digest }); continue;
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
      if (prepared.composition.plan.inputs.spec.http.https) await httpsCheck(prepared);
      await require("./external-gateway").probe(prepared);
      await networksReady(prepared.composition, driver, true);
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
