"use strict";
const fs = require("node:fs"), path = require("node:path"), { spawnSync } = require("node:child_process");
const V = require("./validation"), R = require("./render"), F = require("../../lib/filesystem-safety");
const mailLock = require("./lock"), Purge = require("./purge");
const { resolveTrustedExecutable, systemEnvironment } = require("../../internal/system-tools");
function planMailService(spec, resources = {}) {
  if (!resources || Object.keys(resources).some(k => !["registry", "secret_sources"].includes(k))) V.fail("MAIL_RESOURCES_INVALID");
  const checked = V.validateMailService(spec); if (!checked.valid) return { applicable: false, diagnostics: checked.diagnostics };
  const normalized = checked.normalized;
  const registry = V.validateRegistry(resources.registry || { contract: "drumee.mail-registry/1", generation: 1, mailboxes: [], aliases: [], accounts: [] }, normalized);
  registry.domains = normalized.domains;
  registry.service_hostname = normalized.hostname;
  if (resources.secret_sources !== undefined && (!Array.isArray(resources.secret_sources) || resources.secret_sources.some(x => !x || Object.keys(x).sort().join(",") !== "file,ref" || !/^secret:[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test(x.ref) || typeof x.file !== "string" || !path.isAbsolute(x.file) || path.normalize(x.file) !== x.file) || new Set(resources.secret_sources.map(x => x.ref)).size !== resources.secret_sources.length)) V.fail("MAIL_SECRET_SOURCES_INVALID");
  const artifacts = R.render(normalized, registry);
  const implementation = V.digest({ artifacts, policy: fs.readFileSync(__dirname + "/policy.js", "utf8"), api: fs.readFileSync(__filename, "utf8"), lock: fs.readFileSync(__dirname + "/lock.js", "utf8"), purge: fs.readFileSync(__dirname + "/purge.js", "utf8"), rendering: fs.readFileSync(__dirname + "/render.js", "utf8"), validation: fs.readFileSync(__dirname + "/validation.js", "utf8"), schema: fs.readFileSync(__dirname + "/schema.json", "utf8"), version: require("../../package.json").version });
  const private_endpoint = { address: V.privateServiceAddress(normalized), hostname: normalized.hostname, port: normalized.networks.private_submission.port, network: normalized.deployment.project + "-edge" };
  const body = { private_endpoint, implementation, contract: "drumee.mail-plan/1", spec: normalized, registry, secret_sources: resources.secret_sources || [] };
  return { ...body, revision: V.digest(body), applicable: true, diagnostics: [], artifacts };
}
function checkedPlan(plan) {
  if (!plan || !plan.applicable) V.fail("MAIL_PLAN_REQUIRED");
  const expected = planMailService(plan.spec, { registry: plan.registry, secret_sources: plan.secret_sources });
  if (V.digest(expected) !== V.digest(plan)) V.fail("MAIL_PLAN_TAMPERED");
}
function composeMailService(plan, distribution = {}) {
  checkedPlan(plan);
  if (Object.keys(distribution).some(k => !["acceptance", "private_bind"].includes(k))) V.fail("MAIL_DISTRIBUTION_INVALID");
  if (distribution.private_bind && distribution.acceptance !== true) V.fail("MAIL_DISTRIBUTION_INVALID");
  const s = plan.spec, root = s.deployment.root, candidate = root + "/candidates/" + plan.revision, images = s.deployment.images;
  const bind = (source, target, read_only = true) => ({ type: "bind", source, target, read_only, bind: { create_host_path: false } });
  const service = (role, networks) => ({ image: images[role === "policy" ? "helper" : role].split("@").at(-1), read_only: true, cap_drop: ["ALL"], security_opt: ["no-new-privileges:true"], networks, restart: "no", labels: { "org.drumee.mail.owner": s.deployment.id, "org.drumee.mail.revision": plan.revision, "org.drumee.mail.role": role }, tmpfs: ["/run:rw,nosuid,size=64m", "/tmp:rw,noexec,nosuid,size=32m"], volumes: [] });
  const postfix = service("postfix", ["edge", "control"]), dovecot = service("dovecot", ["edge", "control"]), opendkim = service("opendkim", ["control"]), policy = service("policy", ["control"]);
  for (const value of [postfix, dovecot]) value.cap_add = ["CHOWN", "SETUID", "SETGID", "DAC_OVERRIDE", "FOWNER", "KILL", "NET_BIND_SERVICE"];
  if (s.networks.dns_servers) postfix.dns = s.networks.dns_servers;
  postfix.networks = { edge: { ipv4_address: plan.private_endpoint.address, aliases: [s.hostname] }, control: {} };
  dovecot.cap_add.push("SYS_CHROOT");
  postfix.cap_add.push("NET_ADMIN", "SETPCAP"); // fixed namespace-only rule install; dropped before exec
  postfix.tmpfs.push("/config:rw,noexec,nosuid,size=16777216");
  postfix.volumes = [bind(candidate + "/config", "/source"), bind(root + "/durable/tls", "/keys"), bind(root + "/durable/spool", "/var/spool/postfix", false), "sockets:/run/mail-sockets"];
  postfix.entrypoint = ["/bin/sh", "/source/postfix-entrypoint.sh"];
  postfix.healthcheck = { test: ["CMD", "postfix", "-c", "/config", "status"], interval: "2s", timeout: "3s", retries: 20 };
  dovecot.volumes = [bind(candidate + "/config", "/config"), bind(root + "/durable/tls", "/keys"), bind(root + "/durable/registry/private", "/registry"), bind(root + "/durable/mailboxes", "/mailboxes", false), "sockets:/run/mail-sockets"];
  dovecot.entrypoint = ["/bin/sh", "/config/dovecot-entrypoint.sh"];
  opendkim.user = `${s.deployment.owner_uid}:${s.deployment.owner_gid}`;
  opendkim.volumes = [bind(candidate + "/config", "/config"), bind(candidate + "/keys/dkim", "/keys")]; opendkim.entrypoint = ["opendkim", "-f", "-x", "/config/opendkim.conf"];
  policy.user = `${s.deployment.owner_uid}:${s.deployment.owner_gid}`;
  policy.volumes = [bind(candidate + "/policy.js", "/app/policy.js"), bind(root + "/durable/registry/public", "/registry"), bind(root + "/durable/policy-state", "/state", false), bind(root + "/durable/spool/.infra-owner", "/storage/spool"), bind(root + "/durable/mailboxes/.infra-owner", "/storage/mailboxes")]; policy.entrypoint = ["node", "/app/policy.js"];
  if (distribution.private_bind) postfix.ports = [{ target: s.networks.private_submission.port, published: s.networks.private_submission.port, host_ip: s.networks.private_submission.address }];
  if (!distribution.acceptance) {
    const ports = { smtp25: [postfix, 25], submission587: [postfix, 587], submissions465: [postfix, 465], imaps993: [dovecot, 993] };
    for (const [name, [value, port]] of Object.entries(ports)) if (s.listeners[name].enabled) (value.ports ||= []).push({ target: port, published: port, host_ip: s.listeners[name].address });
    (postfix.ports ||= []).push({ target: s.networks.private_submission.port, published: s.networks.private_submission.port, host_ip: s.networks.private_submission.address });
  }
  return { name: s.deployment.project, services: { postfix, dovecot, opendkim, policy }, networks: { edge: { name: s.deployment.project + "-edge", internal: distribution.acceptance === true && !distribution.private_bind, ipam: { config: [{ subnet: s.networks.edge_subnet, gateway: s.networks.edge_gateway }] }, labels: { "org.drumee.mail.owner": s.deployment.id } }, control: { name: s.deployment.project + "-control", internal: true, labels: { "org.drumee.mail.owner": s.deployment.id } } }, volumes: { sockets: { name: s.deployment.project + "-sockets", driver_opts: { type: "tmpfs", device: "tmpfs", o: "size=16777216,mode=0755" }, labels: { "org.drumee.mail.owner": s.deployment.id } } } };
}
function docker(args, combine = false) {
  const result = spawnSync(resolveTrustedExecutable("docker"), ["--host", "unix:///var/run/docker.sock", ...args], { env: systemEnvironment("docker"), encoding: "utf8", timeout: 120000, maxBuffer: 1048576 });
  if (result.error || result.status !== 0) V.fail("MAIL_NATIVE_OPERATION_FAILED"); return combine ? result.stdout + result.stderr : result.stdout;
}
// Serialized into a fixed, image-locked metadata helper. It never reads messages.
function maildirMetadata(ids, required, create) {
  const fs = require("node:fs"), paths = ["", "/home", "/Maildir", "/Maildir/cur", "/Maildir/new", "/Maildir/tmp"];
  const safe = file => { const s = fs.lstatSync(file); return s.isDirectory() && !s.isSymbolicLink() && s.uid === 5000 && s.gid === 5000 && (s.mode & 0o7777) === 0o700; };
  // Validate every existing object before creating any new directory.
  for (const id of ids) for (const suffix of paths) {
    const file = "/mailboxes/" + id + suffix;
    if (fs.lstatSync(file, { throwIfNoEntry: false }) ? !safe(file) : required.includes(id)) { console.log(JSON.stringify({ valid: false })); return; }
  }
  if (create) for (const id of ids) for (const suffix of paths) {
    const file = "/mailboxes/" + id + suffix;
    if (!fs.existsSync(file)) { fs.mkdirSync(file, { mode: 0o700 }); fs.chownSync(file, 5000, 5000); }
  }
  const identities = {};
  for (const id of ids) {
    identities[id] = {};
    for (const suffix of paths) { const s = fs.lstatSync("/mailboxes/" + id + suffix); identities[id][suffix] = { dev: s.dev, ino: s.ino }; }
  }
  console.log(JSON.stringify({ valid: true, identities }));
}
function inspectMaildirs(root, image, ids, required, create = false) {
  const args = ["run", "--rm", "--network", "none", "--read-only", "--user", "0:0", "--security-opt", "no-new-privileges:true", "--cap-drop", "ALL", "--cap-add", "DAC_OVERRIDE"];
  if (create) args.push("--cap-add", "CHOWN", "--cap-add", "FOWNER");
  args.push("--mount", `type=bind,source=${root}/durable/mailboxes,target=/mailboxes${create ? "" : ",readonly"}`, "--entrypoint", "node", image, "-e", `(${maildirMetadata.toString()})(JSON.parse(process.argv[1]), JSON.parse(process.argv[2]), process.argv[3] === "true")`, JSON.stringify(ids), JSON.stringify(required), String(create));
  const result = JSON.parse(docker(args));
  if (!result.valid) V.fail("MAIL_MAILBOX_IDENTITY_MISMATCH");
  return result.identities;
}
function prepareMailService(plan, context) {
  checkedPlan(plan);
  if (context?.authorized !== true || process.getuid() !== plan.spec.deployment.owner_uid || process.getgid() !== plan.spec.deployment.owner_gid) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  for (const image of Object.values(plan.spec.deployment.images)) if (/sha256:0{64}$/.test(image)) V.fail("MAIL_PLACEHOLDER_IMAGE");
  for (const image of new Set(Object.values(plan.spec.deployment.images))) {
    const expected = image.split("@").at(-1), current = JSON.parse(docker(["image", "inspect", expected]))[0];
    if (current.Id !== expected) V.fail("MAIL_IMAGE_IDENTITY_MISMATCH");
  }
  const root = plan.spec.deployment.root, owner = { contract: "drumee.mail-owner/1", id: plan.spec.deployment.id, project: plan.spec.deployment.project, uid: process.getuid(), gid: process.getgid() };
  F.privateDirectory(root, true);
  const marker = root + "/owner.json";
  const initializing = !fs.existsSync(marker);
  if (fs.existsSync(marker)) { if (fs.readFileSync(marker, "utf8") !== JSON.stringify(owner)) V.fail("MAIL_RESOURCE_IDENTITY_MISMATCH"); }
  else { if (fs.readdirSync(root).length) V.fail("MAIL_RESOURCE_IDENTITY_MISMATCH"); F.atomic(marker, JSON.stringify(owner)); }
  if (!initializing) {
    for (const name of ["spool", "mailboxes", "registry", "operator-state", "policy-state", "tls"]) if (!fs.existsSync(root + "/durable/" + name)) V.fail("MAIL_STORAGE_GUARD_FAILED");
    for (const name of ["spool", "mailboxes"]) {
      const expected = JSON.stringify({ owner: plan.spec.deployment.id, resource: name === "spool" ? "mail-queue" : "mailboxes" });
      if (!fs.existsSync(root + "/durable/" + name + "/.infra-owner") || fs.readFileSync(root + "/durable/" + name + "/.infra-owner", "utf8") !== expected) V.fail("MAIL_STORAGE_GUARD_FAILED");
    }
  }
  const candidate = root + "/candidates/" + plan.revision;
  for (const dir of [root + "/candidates", candidate, candidate + "/config", candidate + "/keys", root + "/durable", root + "/durable/operator-state", root + "/durable/policy-state", root + "/durable/tls", root + "/durable/registry", root + "/durable/registry/private", root + "/durable/registry/public", root + "/durable/registry/private/generation-" + plan.registry.generation]) F.privateDirectory(dir, true);
  F.directory(root + "/durable/spool", true);
  F.directory(root + "/durable/mailboxes", true);
  for (const kind of ["tls", "dkim"]) F.privateDirectory(candidate + "/keys/" + kind, true);
  const secret = ref => { const sources = plan.secret_sources.filter(x => x.ref === ref); if (sources.length !== 1) V.fail("MAIL_SECRET_SOURCE_MISSING"); return F.read(sources[0].file, true); };
  const keys = { "certificate.pem": secret(plan.spec.tls.certificate_ref), "key.pem": secret(plan.spec.tls.key_ref), "ca.pem": secret(plan.spec.tls.client_ca_ref) };
  plan.spec.dkim.forEach((d, i) => { keys[`dkim-${i}.pem`] = secret(d.key_ref); });
  const crypto = require("node:crypto"), certificate = new crypto.X509Certificate(keys["certificate.pem"]);
  if (!certificate.checkHost(plan.spec.hostname, { subject: "never" }) || Date.parse(certificate.validFrom) > Date.now() || Date.parse(certificate.validTo) <= Date.now() || !certificate.checkPrivateKey(crypto.createPrivateKey(keys["key.pem"]))) V.fail("MAIL_CERTIFICATE_INVALID");
  const passwd = R.credentials(plan.registry, context.verifiers || {});
  // A prepared candidate is immutable. Validate every supplied input before
  // returning its seal; never rewrite live key material behind unchanged refs.
  const sealFile = candidate + "/prepared.json";
  if (fs.existsSync(sealFile)) {
    const seal = JSON.parse(F.read(sealFile)); verifyPrepared(seal);
    for (const [name, data] of Object.entries(keys)) {
      const file = "keys/" + (name.startsWith("dkim-") ? "dkim/" : "tls/") + name;
      if (seal.files[file] !== V.digest(data.toString())) V.fail("MAIL_SEALED_INPUT_CONFLICT");
    }
    if (V.digest(seal.private_files) !== V.digest(Object.fromEntries(Object.entries(passwd).map(([name, data]) => [name, V.digest(data)]))) || V.digest(seal.compose) !== V.digest(composeMailService(plan, { acceptance: context.acceptance === true, private_bind: context.private_bind === true }))) V.fail("MAIL_SEALED_INPUT_CONFLICT");
    return seal;
  }
  for (const [name, content] of Object.entries(passwd)) {
    const file = root + "/durable/registry/private/generation-" + plan.registry.generation + "/" + name;
    if (fs.existsSync(file) && F.read(file).toString() !== content) V.fail("MAIL_REGISTRY_GENERATION_CONFLICT");
  }
  // Native verification uses the same existing, root-owned OpenSSL boundary.
  for (const [name, data] of Object.entries(keys)) {
    if (name.startsWith("dkim-")) { const key = crypto.createPrivateKey(data); if (key.asymmetricKeyType !== "rsa" || key.asymmetricKeyDetails.modulusLength < 2048) V.fail("MAIL_DKIM_KEY_INVALID"); }
    F.atomic(candidate + "/keys/" + (name.startsWith("dkim-") ? "dkim/" : "tls/") + name, data);
  }
  const verified = spawnSync(resolveTrustedExecutable("openssl"), ["verify", "-purpose", "sslserver", "-verify_hostname", plan.spec.hostname, "-CAfile", candidate + "/keys/tls/ca.pem", candidate + "/keys/tls/certificate.pem"], { env: systemEnvironment("openssl"), stdio: "pipe" });
  if (verified.status !== 0) V.fail("MAIL_CERTIFICATE_INVALID");
  for (const [name, content] of Object.entries(plan.artifacts)) F.atomic(candidate + "/config/" + name, content, 0o644);
  F.atomic(candidate + "/policy.js", fs.readFileSync(__dirname + "/policy.js"), 0o644);
  for (const [name, content] of Object.entries(passwd)) {
    const file = root + "/durable/registry/private/generation-" + plan.registry.generation + "/" + name;
    if (fs.existsSync(file) && fs.readFileSync(file, "utf8") !== content) V.fail("MAIL_REGISTRY_GENERATION_CONFLICT");
    if (!fs.existsSync(file)) F.atomic(file, content);
  }
  if (!fs.existsSync(root + "/durable/registry/private/current")) fs.symlinkSync("generation-" + plan.registry.generation, root + "/durable/registry/private/current");
  if (!fs.existsSync(root + "/durable/registry/private/active.conf")) F.atomic(root + "/durable/registry/private/active.conf", plan.artifacts["dovecot.conf"]);
  F.atomic(candidate + "/registry.json", JSON.stringify(plan.registry));
  const tls = stageTLS(root, plan.spec.hostname, Object.fromEntries(Object.entries(keys).filter(([name]) => !name.startsWith("dkim-"))));
  if (!fs.existsSync(root + "/durable/tls/current")) switchTLS(root, tls.target);
  const compose = composeMailService(plan, { acceptance: context.acceptance === true, private_bind: context.private_bind === true });
  // Initialize only the new empty, marker-owned mailbox tree with fixed image IDs.
  if (initializing) fs.chmodSync(root + "/durable/mailboxes", 0o755);
  const required = initializing ? [] : JSON.parse(F.read(root + "/durable/registry/public/current.json")).mailboxes.map(x => x.id);
  const mailboxIdentities = inspectMaildirs(root, plan.spec.deployment.images.helper.split("@").at(-1), plan.registry.mailboxes.map(b => b.id), required, true);
  if (initializing) {
    const queueMarker = JSON.stringify({ owner: plan.spec.deployment.id, resource: "mail-queue" });
    docker(["run", "--rm", "--network", "none", "--user", "0:0", "--mount", `type=bind,source=${root}/durable/spool,target=/queue`, "--entrypoint", "/bin/sh", plan.spec.deployment.images.postfix.split("@").at(-1), "-ec", 'test -z "$(ls -A /queue)"; cp -a /opt/infra/postfix-queue/. /queue/; printf %s "$1" > /queue/.infra-owner', "mail-init", queueMarker]);
    F.atomic(root + "/durable/mailboxes/.infra-owner", JSON.stringify({ owner: plan.spec.deployment.id, resource: "mailboxes" }), 0o644);
  }
  const files = {};
  for (const name of Object.keys(plan.artifacts)) files["config/" + name] = V.digest(fs.readFileSync(candidate + "/config/" + name).toString());
  files["policy.js"] = V.digest(fs.readFileSync(candidate + "/policy.js").toString());
  files["registry.json"] = V.digest(JSON.stringify(plan.registry));
  for (const name of Object.keys(keys)) { const file = "keys/" + (name.startsWith("dkim-") ? "dkim/" : "tls/") + name; files[file] = V.digest(fs.readFileSync(candidate + "/" + file).toString()); }
  const prepared = { contract: "drumee.mail-prepared/1", revision: plan.revision, root, hostname: plan.spec.hostname, private_port: plan.spec.networks.private_submission.port, project: plan.spec.deployment.project, compose, compose_file: candidate + "/compose.json", certificate_fingerprint: certificate.fingerprint256, mailbox_identities: mailboxIdentities, storage: Object.fromEntries(["spool", "mailboxes", "registry", "registry/private", "registry/public", "operator-state", "policy-state", "tls"].map(name => { const stat = fs.lstatSync(root + "/durable/" + name); return [name, { dev: stat.dev, ino: stat.ino, uid: stat.uid, gid: stat.gid, mode: stat.mode & 0o7777 }]; })), private_files: Object.fromEntries(Object.entries(passwd).map(([name, content]) => [name, V.digest(content)])), registry_generation: plan.registry.generation, transport_digest: V.digest(plan.spec), files };
  F.atomic(prepared.compose_file, JSON.stringify(compose, null, 2));
  const publicRegistry = root + "/durable/registry/public";
  if (!fs.existsSync(publicRegistry + "/current.json")) F.atomic(publicRegistry + "/current.json", JSON.stringify(plan.registry));
  if (!fs.existsSync(root + "/durable/operator-state/transport-digest")) F.atomic(root + "/durable/operator-state/transport-digest", prepared.transport_digest);
  if (!fs.existsSync(root + "/durable/operator-state/account-generations.json")) F.atomic(root + "/durable/operator-state/account-generations.json", JSON.stringify(Object.fromEntries(plan.registry.accounts.map(a => [a.id, a.credential_generation]))));
  F.atomic(candidate + "/prepared.json", JSON.stringify(prepared));
  if (!fs.existsSync(root + "/durable/operator-state/runtime-revision")) F.atomic(root + "/durable/operator-state/runtime-revision", prepared.revision);
  return prepared;
}
function verifyPrepared(prepared) {
  if (!prepared || prepared.contract !== "drumee.mail-prepared/1" || typeof prepared.root !== "string" || prepared.compose_file !== prepared.root + "/candidates/" + prepared.revision + "/compose.json") V.fail("MAIL_PREPARED_TAMPERED");
  const directory = path.dirname(prepared.compose_file), stored = JSON.parse(F.read(directory + "/prepared.json"));
  if (V.digest(JSON.parse(F.read(prepared.compose_file))) !== V.digest(prepared.compose)) V.fail("MAIL_PREPARED_TAMPERED");
  if (V.digest(stored) !== V.digest(prepared)) V.fail("MAIL_PREPARED_TAMPERED");
  const found = [];
  function walk(folder, prefix = "") {
    for (const name of fs.readdirSync(folder)) {
      const file = folder + "/" + name, stat = fs.lstatSync(file), relative = prefix + name;
      if (stat.isSymbolicLink()) V.fail("MAIL_PREPARED_TAMPERED");
      if (stat.isDirectory()) { F.privateDirectory(file); walk(file, relative + "/"); }
      else found.push(relative);
    }
  }
  walk(directory);
  if (V.digest(found.sort()) !== V.digest([...Object.keys(prepared.files), "compose.json", "prepared.json"].sort())) V.fail("MAIL_PREPARED_TAMPERED");
  for (const [file, digest] of Object.entries(prepared.private_files)) if (V.digest(F.read(prepared.root + "/durable/registry/private/generation-" + prepared.registry_generation + "/" + file).toString()) !== digest) V.fail("MAIL_PREPARED_TAMPERED");
  for (const [file, digest] of Object.entries(prepared.files)) {
    const full = directory + "/" + file, stat = fs.lstatSync(full), secret = file.startsWith("keys/");
    if (stat.mode & (secret ? 0o077 : 0o022) || V.digest(F.read(full, secret).toString()) !== digest) V.fail("MAIL_PREPARED_TAMPERED");
  }
}
function postfixWorkers(id) {
  const command = 'for f in /proc/[0-9]*/comm; do read -r name < "$f" 2>/dev/null || continue; case "$name" in qmgr|lmtp) printf "%s %s\\n" "$f" "$name";; esac; done; exit 0';
  const lines = docker(["exec", id, "/bin/sh", "-c", command]).trim().split("\n").filter(Boolean);
  const result = { qmgr: [], lmtp: [] };
  for (const line of lines) { const match = line.match(/^\/proc\/([0-9]+)\/comm (qmgr|lmtp)$/); if (!match) V.fail("MAIL_RUNTIME_EXECUTION_MISMATCH"); result[match[2]].push(match[1]); }
  return result;
}
function quotaLockProbe(prepared, ids) {
  const code = `const fs=require('node:fs'),cp=require('node:child_process');const fd=fs.openSync('/quota-home/.drumee-quota.lock',fs.constants.O_RDWR|fs.constants.O_CREAT|fs.constants.O_NOFOLLOW,0o600);try{const s=fs.fstatSync(fd);if(!s.isFile()||s.uid!==5000||s.gid!==5000||s.nlink!==1||(s.mode&0o7777)!==0o600||s.size!==0)process.exit(1);const r=cp.spawnSync('/usr/bin/flock',['--exclusive','--nonblock','3'],{stdio:['ignore','ignore','ignore',fd]});if(r.status!==0)process.exit(1);}finally{fs.closeSync(fd);}console.log('locked');`;
  for (const id of ids) if (docker(["run", "--rm", "--network", "none", "--read-only", "--user", "5000:5000", "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true", "--memory", "67108864", "--cpus", "1", "--pids-limit", "32", "--mount", `type=bind,source=${prepared.root}/durable/mailboxes/${id}/home,target=/quota-home`, "--entrypoint", "node", prepared.compose.services.policy.image, "-e", code]).trim() !== "locked") V.fail("MAIL_APPLY_INCOMPLETE");
}
function quotaDrain(prepared, previous, next, dovecot) {
  const boxes = previous.mailboxes.filter(old => next.mailboxes.some(b => b.id === old.id && b.quota_bytes !== old.quota_bytes));
  if (!boxes.length) return null;
  const values = docker(["ps", "-q", "--filter", "label=com.docker.compose.project=" + prepared.project, "--filter", "label=com.docker.compose.service=postfix"]).trim().split("\n").filter(Boolean);
  if (values.length !== 1) V.fail("MAIL_RUNTIME_IDENTITY_MISMATCH");
  const postfix = values[0], file = prepared.root + "/durable/operator-state/quota-drain.json", old = fs.existsSync(file) ? JSON.parse(F.read(file)) : null;
  if (old && (old.contract !== "drumee.mail-quota-drain/1" || !["draining", "waiting", "restoring", "released"].includes(old.phase) || !/^[a-f0-9]{64}$/.test(old.revision) || !Array.isArray(old.mailbox_ids) || !Array.isArray(old.previous_qmgr))) V.fail("MAIL_INTEGRITY_FAILURE");
  const active = old && ["draining", "waiting", "restoring"].includes(old.phase), setting = docker(["exec", postfix, "postconf", "-c", "/config", "-h", "defer_transports"]).trim();
  if (active && old.revision !== prepared.revision || setting !== "" && !(setting === "lmtp" && active && old.revision === prepared.revision)) V.fail("MAIL_RECOVERY_REQUIRED");
  const before = postfixWorkers(postfix); if (before.qmgr.length !== 1) V.fail("MAIL_DEPENDENCY_UNAVAILABLE");
  const record = { contract: "drumee.mail-quota-drain/1", revision: prepared.revision, from: previous.generation, to: next.generation, mailbox_ids: boxes.map(b => b.id), previous_qmgr: before.qmgr, phase: "draining" };
  F.atomic(file, JSON.stringify(record));
  // Stop new local delivery dispatch; reload retires existing Postfix agents
  // gracefully. Never stop/reload Dovecot or kill an active LMTP writer.
  docker(["exec", postfix, "postconf", "-c", "/config", "-e", "defer_transports=lmtp"]);
  docker(["exec", postfix, "postfix", "-c", "/config", "reload"]);
  for (const box of boxes) docker(["exec", dovecot, "doveadm", "-c", "/registry/active.conf", "kick", box.address]);
  F.atomic(file, JSON.stringify({ ...record, phase: "waiting" }));
  let ready = false; const deadline = Date.now() + 10000;
  while (Date.now() < deadline && !ready) {
    const workers = postfixWorkers(postfix), services = JSON.parse(docker(["exec", dovecot, "doveadm", "-c", "/registry/active.conf", "-f", "json", "service", "status", "lmtp"]));
    const people = JSON.parse(docker(["exec", dovecot, "doveadm", "-c", "/registry/active.conf", "-f", "json", "who"]));
    const affected = Array.isArray(people) && people.some(row => boxes.some(box => Object.values(row).includes(box.address)));
    ready = Array.isArray(people) && !affected && workers.qmgr.length === 1 && !before.qmgr.includes(workers.qmgr[0]) && !workers.lmtp.length && Array.isArray(services) && services.length === 1 && services[0].name === "lmtp" && services[0].client_limit === "1" && services[0].process_count === services[0].process_avail && services[0].listen_pending === "n";
    if (!ready) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
  }
  if (!ready) V.fail("MAIL_APPLY_INCOMPLETE");
  // No old recipient context or affected IMAP session remains; new auth is
  // barred and qmgr defers LMTP. Verify native per-UUID writer locks are free.
  quotaLockProbe(prepared, record.mailbox_ids);
  return { file, record, postfix };
}
function quotaResume(drain) {
  if (!drain) return;
  F.atomic(drain.file, JSON.stringify({ ...drain.record, phase: "restoring" }));
  const before = postfixWorkers(drain.postfix); if (before.qmgr.length !== 1) V.fail("MAIL_DEPENDENCY_UNAVAILABLE");
  docker(["exec", drain.postfix, "postconf", "-c", "/config", "-X", "defer_transports"]);
  docker(["exec", drain.postfix, "postfix", "-c", "/config", "reload"]);
  let ready = false; const deadline = Date.now() + 10000;
  while (Date.now() < deadline && !ready) {
    const workers = postfixWorkers(drain.postfix); ready = workers.qmgr.length === 1 && !before.qmgr.includes(workers.qmgr[0]);
    if (!ready) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
  }
  if (!ready || docker(["exec", drain.postfix, "postconf", "-c", "/config", "-h", "defer_transports"]).trim() !== "") V.fail("MAIL_APPLY_INCOMPLETE");
  F.atomic(drain.file, JSON.stringify({ ...drain.record, phase: "released" }));
}
function activateMailRegistry(prepared, context) {
  if (context?.authorized !== true) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  verifyPrepared(prepared);
  const root = prepared.root, pub = root + "/durable/registry/public", priv = root + "/durable/registry/private", state = root + "/durable/operator-state";
  if (F.read(state + "/transport-digest").toString() !== prepared.transport_digest) V.fail("MAIL_REGISTRY_TRANSPORT_MISMATCH");
  return mailLock(root, () => {
    const currentPublic = JSON.parse(F.read(pub + "/current.json")), next = JSON.parse(F.read(path.dirname(prepared.compose_file) + "/registry.json"));
    const intentFile = state + "/registry-intent.json";
    const intent = fs.existsSync(intentFile) ? JSON.parse(F.read(intentFile)) : null;
    const resume = fs.existsSync(pub + "/admission-closed") && intent && intent.revision === prepared.revision && intent.to === next.generation && ["applying", "applied"].includes(intent.phase) && intent.previous_registry;
    if (fs.existsSync(pub + "/admission-closed") && !resume) V.fail("MAIL_RECOVERY_REQUIRED");
    const previous = resume ? intent.previous_registry : currentPublic;
    if (resume && (previous.generation !== intent.from || ![V.digest(previous), V.digest(next)].includes(V.digest(currentPublic)))) V.fail("MAIL_REGISTRY_REVISION_CONFLICT");
    if (previous.generation === next.generation && V.digest(previous) === V.digest(next) && !fs.existsSync(pub + "/admission-closed")) return { applied: true, changed: false, generation: next.generation };
    if (previous.generation !== context.expected_generation || next.generation <= previous.generation) V.fail("MAIL_REGISTRY_REVISION_CONFLICT");
    if (previous.mailboxes.some(box => !next.mailboxes.some(x => x.id === box.id))) V.fail("MAIL_RETAINED_DELIVERY_IDENTITY_REQUIRED");
    const accountFile = state + "/account-generations.json", generations = JSON.parse(F.read(accountFile));
    const oldSMTP = F.read(priv + "/generation-" + previous.generation + "/smtp.passwd").toString().split("\n"), newSMTP = F.read(priv + "/generation-" + next.generation + "/smtp.passwd").toString().split("\n");
    for (const account of next.accounts) {
      const old = previous.accounts.find(a => a.id === account.id);
      const changed = old && (V.digest([old.enabled, old.envelope_from, old.header_from, old.dsn_mailbox_id]) !== V.digest([account.enabled, account.envelope_from, account.header_from, account.dsn_mailbox_id]) || oldSMTP.find(x => x.startsWith(account.id + ":")) !== newSMTP.find(x => x.startsWith(account.id + ":")));
      if (old && account.credential_generation < old.credential_generation || changed && account.credential_generation <= old.credential_generation || !old && !resume && account.credential_generation <= (generations[account.id] || 0)) V.fail("MAIL_CREDENTIAL_GENERATION_REQUIRED");
      generations[account.id] = Math.max(generations[account.id] || 0, account.credential_generation);
    }
    for (const box of next.mailboxes.filter(b => b.credential_generation !== undefined)) {
      const old = previous.mailboxes.find(b => b.id === box.id);
      if (!old) continue;
      const generation = old.credential_generation || previous.generation;
      const oldIMAP = F.read(priv + "/generation-" + previous.generation + "/imap.passwd").toString().split("\n").find(x => x.startsWith(old.address + ":"));
      const newIMAP = F.read(priv + "/generation-" + next.generation + "/imap.passwd").toString().split("\n").find(x => x.startsWith(box.address + ":"));
      const changed = old.address !== box.address || old.imap_enabled !== box.imap_enabled || old.submission_enabled !== box.submission_enabled || oldIMAP !== newIMAP;
      if (box.credential_generation < generation || changed && box.credential_generation <= generation) V.fail("MAIL_CREDENTIAL_GENERATION_REQUIRED");
    }
    const ids = docker(["ps", "-q", "--filter", "label=com.docker.compose.project=" + prepared.project, "--filter", "label=com.docker.compose.service=dovecot"]).trim().split("\n").filter(Boolean);
    if (ids.length !== 1) V.fail("MAIL_RUNTIME_IDENTITY_MISMATCH");
    const current = JSON.parse(docker(["inspect", ids[0]]))[0], owner = JSON.parse(F.read(root + "/owner.json"));
    if (current.Config.Labels["org.drumee.mail.owner"] !== owner.id) V.fail("MAIL_RUNTIME_IDENTITY_MISMATCH");
    const runtimeRevision = F.read(state + "/runtime-revision").toString();
    if (!/^[a-f0-9]{64}$/.test(runtimeRevision)) V.fail("MAIL_RUNTIME_IDENTITY_MISMATCH");
    const runtimePrepared = JSON.parse(F.read(root + "/candidates/" + runtimeRevision + "/prepared.json"));
    verifyPrepared(runtimePrepared); verifyRuntime(runtimePrepared); verifyRuntimeRole(runtimePrepared, "dovecot", current);
    const mailboxIds = Object.keys(prepared.mailbox_identities);
    if (V.digest(inspectMaildirs(root, prepared.compose.services.policy.image, mailboxIds, mailboxIds)) !== V.digest(prepared.mailbox_identities)) V.fail("MAIL_MAILBOX_IDENTITY_MISMATCH");
    const runtimeFiles = value => Object.fromEntries(Object.entries(value.files).filter(([file]) => file === "policy.js" || file.startsWith("config/")));
    if (V.digest(runtimeFiles(prepared)) !== V.digest(runtimeFiles(runtimePrepared))) V.fail("MAIL_RUNTIME_UPGRADE_REQUIRED");
    F.atomic(state + "/registry-intent.json", JSON.stringify({ from: previous.generation, to: next.generation, revision: prepared.revision, previous_registry: previous, phase: "applying" }));
    F.atomic(pub + "/admission-closed", JSON.stringify({ from: previous.generation, to: next.generation }));
    if (context.barrier_only) return { barrier: true, generation: next.generation };
    try {
      const drain = quotaDrain(prepared, previous, next, ids[0]);
      // Dovecot passwd-file caches by whole-second mtime + size, not inode.
      // Distinguish equal-size rapid generations before publishing their pointer.
      // Content remains sealed; only this native cache-invalidation metadata changes.
      const names = Object.keys(prepared.private_files);
      const generationPath = generation => priv + "/generation-" + generation + "/";
      const previousStamp = Math.max(...names.map(name => Math.floor(fs.statSync(generationPath(previous.generation) + name).mtimeMs / 1000)));
      const stamp = Math.max(Math.floor(Date.now() / 1000), previousStamp + 1);
      for (const name of names) {
        const file = generationPath(next.generation) + name;
        F.read(file, true);
        const fd = fs.openSync(file, fs.constants.O_RDWR | fs.constants.O_NOFOLLOW);
        try {
          fs.futimesSync(fd, stamp, stamp); fs.fsyncSync(fd);
          if (Math.floor(fs.fstatSync(fd).mtimeMs / 1000) !== stamp) V.fail("MAIL_REGISTRY_TIMESTAMP_UNSUPPORTED");
        } finally { fs.closeSync(fd); }
      }
      // Switch the complete immutable credential/userdb projection at once.
      // Do not SIGHUP Dovecot 2.4.1: it also retires unrelated IMAP workers.
      const pending = priv + "/.current-" + require("node:crypto").randomUUID();
      fs.symlinkSync("generation-" + next.generation, pending);
      fs.renameSync(pending, priv + "/current");
      const fd = fs.openSync(priv, fs.constants.O_RDONLY); try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
      docker(["exec", ids[0], "doveadm", "-c", "/registry/active.conf", "auth", "cache", "flush"]);
      // Verify native passwd-file observation before lifting admission.
      // Auth lookup output contains private verifiers: inspect only in memory,
      // never return it or forward it to stdout/stderr/command diagnostics.
      for (const account of next.accounts.filter(x => x.enabled)) {
        let observed = false;
        for (let retry = 0; retry < 20 && !observed; retry++) {
          const lookup = docker(["exec", ids[0], "doveadm", "-c", "/registry/active.conf", "auth", "lookup", "-x", "service=smtp", account.id]);
          observed = lookup.includes("acct-" + account.id + "-g" + account.credential_generation);
          if (!observed) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
        }
        if (!observed) V.fail("MAIL_REGISTRY_AUTH_GENERATION_MISMATCH");
      }
      for (const box of next.mailboxes) {
        let observed = false;
        for (let retry = 0; retry < 20 && !observed; retry++) {
          observed = [box.address, "mbx-" + box.id + "@local.invalid"].every(login => docker(["exec", ids[0], "doveadm", "-c", "/registry/active.conf", "user", "-f", "quota/Mailbox/storage_size", login]).trim() === box.quota_bytes + "B");
          if (!observed) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
        }
        if (!observed) V.fail("MAIL_REGISTRY_USERDB_GENERATION_MISMATCH");
      }
      const oldPasswd = F.read(priv + "/generation-" + previous.generation + "/imap.passwd").toString().split("\n");
      const newPasswd = F.read(priv + "/generation-" + next.generation + "/imap.passwd").toString().split("\n");
      for (const box of previous.mailboxes) {
        const successor = next.mailboxes.find(x => x.id === box.id);
        const oldVerifier = oldPasswd.find(x => x.startsWith(box.address + ":"));
        const newVerifier = newPasswd.find(x => x.startsWith(box.address + ":"));
        if (!successor || !successor.imap_enabled || successor.address !== box.address || successor.quota_bytes !== box.quota_bytes || oldVerifier !== newVerifier) docker(["exec", ids[0], "doveadm", "-c", "/registry/active.conf", "kick", box.address]);
      }
      F.atomic(accountFile, JSON.stringify(generations));
      F.atomic(pub + "/current.json", JSON.stringify(next));
      quotaResume(drain);
      F.atomic(state + "/registry-intent.json", JSON.stringify({ from: previous.generation, to: next.generation, revision: prepared.revision, previous_registry: previous, phase: "applied" }));
      if (!context.keep_barrier) fs.unlinkSync(pub + "/admission-closed");
      const directory = fs.openSync(pub, fs.constants.O_RDONLY); try { fs.fsyncSync(directory); } finally { fs.closeSync(directory); }
      return { applied: true, changed: true, generation: next.generation, smtp_revocation: "next-MAIL-DATA", imap_affected_sessions_kicked: true };
    } catch { V.fail("MAIL_APPLY_INCOMPLETE"); }
  });
}
function stageMailRegistryBarrier(prepared, context) { return activateMailRegistry(prepared, { ...context, barrier_only: true }); }
function verifyStorage(prepared) {
  const owner = JSON.parse(F.read(prepared.root + "/owner.json"));
  if (owner.contract !== "drumee.mail-owner/1" || owner.project !== prepared.project || owner.uid !== process.getuid() || owner.gid !== process.getgid() || owner.id !== prepared.compose.services.postfix.labels["org.drumee.mail.owner"]) V.fail("MAIL_RESOURCE_IDENTITY_MISMATCH");
  for (const [name, identity] of Object.entries(prepared.storage)) {
    const file = prepared.root + "/durable/" + name;
    F.directory(file);
    const stat = fs.lstatSync(file);
    if (stat.dev !== identity.dev || stat.ino !== identity.ino || stat.uid !== identity.uid || stat.gid !== identity.gid || (stat.mode & 0o7777) !== identity.mode || stat.mode & 0o022) V.fail("MAIL_STORAGE_GUARD_FAILED");
  }
  for (const [name, resource] of [["spool", "mail-queue"], ["mailboxes", "mailboxes"]]) {
    const file = prepared.root + "/durable/" + name + "/.infra-owner", stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || ![0, owner.uid].includes(stat.uid) || stat.mode & 0o022 || fs.readFileSync(file, "utf8") !== JSON.stringify({ owner: owner.id, resource })) V.fail("MAIL_STORAGE_GUARD_FAILED");
  }
  const privateRoot = prepared.root + "/durable/registry/private";
  const pointer = fs.lstatSync(privateRoot + "/current");
  if (!pointer.isSymbolicLink() || pointer.uid !== owner.uid || !/^generation-[1-9][0-9]*$/.test(fs.readlinkSync(privateRoot + "/current"))) V.fail("MAIL_SECRET_PROJECTION_MISMATCH");
  F.privateDirectory(privateRoot + "/" + fs.readlinkSync(privateRoot + "/current"));
  for (const file of Object.keys(prepared.private_files)) F.read(privateRoot + "/" + fs.readlinkSync(privateRoot + "/current") + "/" + file);
  const barrier = prepared.root + "/durable/registry/public/admission-closed", current = JSON.parse(F.read(prepared.root + "/durable/registry/public/current.json"));
  if (current.service_hostname !== prepared.hostname || !fs.existsSync(barrier) && fs.readlinkSync(privateRoot + "/current") !== "generation-" + current.generation) V.fail("MAIL_SECRET_PROJECTION_MISMATCH");
  let expectedMailboxes = prepared.mailbox_identities;
  const intentFile = prepared.root + "/durable/operator-state/registry-intent.json";
  if (!fs.existsSync(barrier) && fs.existsSync(intentFile)) {
    const intent = JSON.parse(F.read(intentFile));
    if (intent.phase !== "applied" || intent.to !== current.generation || !/^[a-f0-9]{64}$/.test(intent.revision)) V.fail("MAIL_SECRET_PROJECTION_MISMATCH");
    const active = JSON.parse(F.read(prepared.root + "/candidates/" + intent.revision + "/prepared.json")); verifyPrepared(active); expectedMailboxes = active.mailbox_identities;
  }
  const observed = inspectMaildirs(prepared.root, prepared.compose.services.policy.image, Object.keys(expectedMailboxes), Object.keys(expectedMailboxes));
  if (V.digest(observed) !== V.digest(expectedMailboxes)) V.fail("MAIL_MAILBOX_IDENTITY_MISMATCH");
  readTLS(prepared.root);
  return owner;
}
function verifyRuntimeRole(prepared, role, actual) {
  const expected = prepared.compose.services[role], owner = JSON.parse(F.read(prepared.root + "/owner.json"));
  if (!expected || actual.Config.Labels["org.drumee.mail.owner"] !== owner.id || actual.Config.Labels["org.drumee.mail.revision"] !== prepared.revision || actual.Config.Labels["org.drumee.mail.role"] !== role) V.fail("MAIL_RUNTIME_IDENTITY_MISMATCH");
  if (actual.Image !== expected.image) V.fail("MAIL_RUNTIME_IMAGE_MISMATCH");
  const imageConfig = JSON.parse(docker(["image", "inspect", expected.image]))[0].Config;
  if (V.digest([...(actual.Config.Env || [])].sort()) !== V.digest([...(imageConfig.Env || [])].sort())) V.fail("MAIL_RUNTIME_EXECUTION_MISMATCH");
  if (actual.HostConfig.RestartPolicy.Name !== expected.restart) V.fail("MAIL_RUNTIME_EXECUTION_MISMATCH");
  const equal = (a, b) => V.digest(a) === V.digest(b), sorted = a => [...(a || [])].sort();
  if (!equal(actual.HostConfig.Dns || [], expected.dns || []) || !equal(actual.HostConfig.DnsOptions || [], expected.dns_opt || []) || !equal(actual.HostConfig.DnsSearch || [], expected.dns_search || []) || actual.HostConfig.ExtraHosts?.length || actual.HostConfig.GroupAdd?.length || Object.keys(actual.HostConfig.Sysctls || {}).length) V.fail("MAIL_RUNTIME_NETWORK_MISMATCH");
  if (!equal(actual.Config.Entrypoint, expected.entrypoint) || !equal(actual.Config.Cmd || [], expected.command || []) || actual.Config.User !== (expected.user ?? imageConfig.User ?? "") || !actual.HostConfig.ReadonlyRootfs || actual.HostConfig.Privileged || actual.HostConfig.PidMode || actual.HostConfig.Devices?.length || actual.HostConfig.DeviceRequests?.length) V.fail("MAIL_RUNTIME_EXECUTION_MISMATCH");
  const caps = a => sorted((a || []).map(x => x.replace(/^CAP_/, "").toUpperCase()));
  if (!equal(caps(actual.HostConfig.CapDrop), caps(expected.cap_drop)) || !equal(caps(actual.HostConfig.CapAdd), caps(expected.cap_add)) || !equal(sorted(actual.HostConfig.SecurityOpt), sorted(expected.security_opt))) V.fail("MAIL_RUNTIME_EXECUTION_MISMATCH");
  const networks = Object.keys(actual.NetworkSettings.Networks).sort(), expectedNetworks = (Array.isArray(expected.networks) ? expected.networks : Object.keys(expected.networks)).map(name => prepared.compose.networks[name].name).sort();
  if (!equal(networks, expectedNetworks)) V.fail("MAIL_RUNTIME_NETWORK_MISMATCH");
  if (!Array.isArray(expected.networks)) for (const [name, endpoint] of Object.entries(expected.networks)) {
    const observed=actual.NetworkSettings.Networks[prepared.compose.networks[name].name];
    const aliases=observed.Aliases || [], allowedAliases=[role,actual.Name.slice(1),...(endpoint.aliases || [])];
    if ((endpoint.aliases || []).some(name=>!aliases.includes(name)) || aliases.some(name=>!allowedAliases.includes(name))) V.fail("MAIL_RUNTIME_NETWORK_MISMATCH");
    if ((observed.IPAMConfig?.IPv4Address || null) !== (endpoint.ipv4_address || null)) V.fail("MAIL_RUNTIME_NETWORK_MISMATCH");
    if (actual.State.Running && endpoint.ipv4_address && observed.IPAddress !== endpoint.ipv4_address) V.fail("MAIL_RUNTIME_NETWORK_MISMATCH");
  }
  const ports = {};
  for (const p of expected.ports || []) (ports[p.target + "/tcp"] ||= []).push({ HostIp: p.host_ip, HostPort: String(p.published) });
  if (!equal(actual.HostConfig.PortBindings || {}, ports)) V.fail("MAIL_RUNTIME_LISTENER_MISMATCH");
  const mounts = expected.volumes.map(v => typeof v === "string" ? { type: "volume", name: prepared.compose.volumes[v.split(":")[0]].name, target: v.split(":")[1], rw: true } : { type: "bind", source: v.source, target: v.target, rw: !v.read_only });
  if (mounts.length !== actual.Mounts.length || mounts.some(e => !actual.Mounts.some(a => a.Type === e.type && a.Destination === e.target && a.RW === e.rw && (e.type === "bind" ? a.Source === e.source && a.Propagation === "rprivate" : a.Name === e.name)))) V.fail("MAIL_RUNTIME_MOUNT_MISMATCH");
  if (!equal(actual.HostConfig.Tmpfs, Object.fromEntries(expected.tmpfs.map(x => { const i = x.indexOf(":"); return [x.slice(0, i), x.slice(i + 1)]; })))) V.fail("MAIL_RUNTIME_MOUNT_MISMATCH");
}
function verifyRuntime(prepared) {
  const owner = verifyStorage(prepared);
  for (const network of Object.values(prepared.compose.networks)) {
    const found = docker(["network", "ls", "-q", "--filter", "name=^" + network.name + "$"]).trim();
    if (!found) continue;
    const actual = JSON.parse(docker(["network", "inspect", found]))[0];
    if (actual.Name !== network.name || actual.Driver !== "bridge" || actual.Internal !== network.internal || actual.Labels?.["org.drumee.mail.owner"] !== owner.id || actual.EnableIPv6 || network.ipam && V.digest(actual.IPAM.Config) !== V.digest(network.ipam.config.map(x => ({ Subnet: x.subnet, Gateway: x.gateway })))) V.fail("MAIL_RUNTIME_NETWORK_MISMATCH");
  }
  for (const volume of Object.values(prepared.compose.volumes)) {
    const found = docker(["volume", "ls", "-q", "--filter", "name=^" + volume.name + "$"]).trim();
    if (!found) continue;
    const actual = JSON.parse(docker(["volume", "inspect", found]))[0];
    if (actual.Name !== volume.name || actual.Labels?.["org.drumee.mail.owner"] !== owner.id || actual.Driver !== "local" || V.digest(actual.Options) !== V.digest(volume.driver_opts)) V.fail("MAIL_RUNTIME_STORAGE_MISMATCH");
  }
  const ids = docker(["ps", "-aq", "--filter", "label=com.docker.compose.project=" + prepared.project]).trim().split("\n").filter(Boolean), roles = new Set();
  for (const id of ids) {
    const current = JSON.parse(docker(["inspect", id]))[0], role = current.Config.Labels["com.docker.compose.service"];
    if (roles.has(role)) V.fail("MAIL_RUNTIME_IDENTITY_MISMATCH"); roles.add(role);
    verifyRuntimeRole(prepared, role, current);
  }
}
function readTLS(root) {
  const directory = root + "/durable/tls", link = fs.lstatSync(directory + "/current"), target = fs.readlinkSync(directory + "/current");
  if (!link.isSymbolicLink() || link.uid !== process.getuid() || !/^generation-[a-f0-9]{64}$/.test(target)) V.fail("MAIL_TLS_PROJECTION_MISMATCH");
  const seal = JSON.parse(F.read(directory + "/" + target + "/seal.json"));
  if (Object.keys(seal.files).sort().join(",") !== "ca.pem,certificate.pem,key.pem") V.fail("MAIL_TLS_PROJECTION_MISMATCH");
  for (const [name, hash] of Object.entries(seal.files)) if (V.digest(F.read(directory + "/" + target + "/" + name).toString()) !== hash) V.fail("MAIL_TLS_PROJECTION_MISMATCH");
  return { target, seal, directory: directory + "/" + target };
}
function stageTLS(root, hostname, keys) {
  const crypto = require("node:crypto"), leaf = new crypto.X509Certificate(keys["certificate.pem"]);
  if (!leaf.checkHost(hostname, { subject: "never" }) || Date.parse(leaf.validFrom) > Date.now() || Date.parse(leaf.validTo) <= Date.now() || !leaf.checkPrivateKey(crypto.createPrivateKey(keys["key.pem"]))) V.fail("MAIL_CERTIFICATE_INVALID");
  const target = "generation-" + V.digest(Object.fromEntries(Object.entries(keys).map(([name, data]) => [name, data.toString()]))), directory = root + "/durable/tls/" + target;
  F.privateDirectory(directory, true);
  for (const [name, data] of Object.entries(keys)) {
    if (fs.existsSync(directory + "/" + name) && !F.read(directory + "/" + name).equals(data)) V.fail("MAIL_SEALED_INPUT_CONFLICT");
    if (!fs.existsSync(directory + "/" + name)) F.atomic(directory + "/" + name, data);
  }
  const result = spawnSync(resolveTrustedExecutable("openssl"), ["verify", "-purpose", "sslserver", "-verify_hostname", hostname, "-CAfile", directory + "/ca.pem", directory + "/certificate.pem"], { env: systemEnvironment("openssl"), stdio: "pipe" });
  if (result.status !== 0) V.fail("MAIL_CERTIFICATE_INVALID");
  const seal = { fingerprint: leaf.fingerprint256, expires_at: leaf.validTo, files: Object.fromEntries(Object.entries(keys).map(([name, data]) => [name, V.digest(data.toString())])) };
  if (!fs.existsSync(directory + "/seal.json")) F.atomic(directory + "/seal.json", JSON.stringify(seal));
  else if (V.digest(JSON.parse(F.read(directory + "/seal.json"))) !== V.digest(seal)) V.fail("MAIL_TLS_PROJECTION_MISMATCH");
  return { target, seal };
}
function switchTLS(root, target) {
  const directory = root + "/durable/tls", temporary = directory + "/.current-" + require("node:crypto").randomUUID();
  fs.symlinkSync(target, temporary); fs.renameSync(temporary, directory + "/current");
  const fd = fs.openSync(directory, fs.constants.O_RDONLY); try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}
function reloadTLS(prepared) {
  docker(["compose", "-p", prepared.project, "-f", prepared.compose_file, "exec", "-T", "postfix", "postfix", "-c", "/config", "reload"]);
  docker(["compose", "-p", prepared.project, "-f", prepared.compose_file, "exec", "-T", "dovecot", "doveadm", "-c", "/registry/active.conf", "reload"]);
}
function probeTLS(prepared, fingerprint) {
  const id = docker(["ps", "-q", "--filter", "label=com.docker.compose.project=" + prepared.project, "--filter", "label=com.docker.compose.service=postfix"]).trim();
  const address = JSON.parse(docker(["inspect", id]))[0].NetworkSettings.Networks[prepared.compose.networks.edge.name].IPAddress;
  const observations = [];
  for (const [host, port, starttls] of [["127.0.0.1", 25, true], ["127.0.0.1", 587, true], ["127.0.0.1", 465, false], [address, prepared.private_port, true], ["dovecot", 993, false]]) {
    let observed = false;
    for (let retry = 0; retry < 20 && !observed; retry++) {
      const args = ["compose", "-p", prepared.project, "-f", prepared.compose_file, "exec", "-T", "postfix", "openssl", "s_client", "-connect", host + ":" + port, "-servername", prepared.hostname, "-verify_hostname", prepared.hostname, "-verify_return_error", "-CAfile", "/keys/current/ca.pem", "-showcerts"];
      if (starttls) args.push("-starttls", "smtp");
      try {
        const output = docker(args), certificate = /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/.exec(output);
        observed = certificate && new (require("node:crypto").X509Certificate)(certificate[0]).fingerprint256 === fingerprint;
      } catch { /* A reload may briefly refuse a new connection; never accept a wrong fingerprint. */ }
      if (!observed) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
    if (!observed) V.fail("MAIL_TLS_ENDPOINT_MISMATCH");
    observations.push({ host, port, fingerprint });
  }
  return observations;
}
function rotateMailTLS(prepared, sources, context) {
  if (context?.authorized !== true || !sources || Object.keys(sources).sort().join(",") !== "ca_file,certificate_file,key_file") V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  verifyPrepared(prepared); verifyRuntime(prepared);
  return mailLock(prepared.root, () => {
    const root = prepared.root, state = root + "/durable/operator-state/tls-intent.json", barrier = root + "/durable/registry/public/admission-closed";
    if (fs.existsSync(barrier)) V.fail("MAIL_GENERATION_ACTIVATION_UNQUALIFIED");
    const previous = readTLS(root), next = stageTLS(root, prepared.hostname, { "certificate.pem": F.read(sources.certificate_file), "key.pem": F.read(sources.key_file), "ca.pem": F.read(sources.ca_file) });
    if (previous.target === next.target) return { changed: false, fingerprint: next.seal.fingerprint };
    probeTLS(prepared, previous.seal.fingerprint);
    const intent = { phase: "applying", previous: previous.target, next: next.target, old_fingerprint: previous.seal.fingerprint, new_fingerprint: next.seal.fingerprint };
    F.atomic(barrier, JSON.stringify({ reason: "tls-rotation" })); F.atomic(state, JSON.stringify(intent));
    try {
      switchTLS(root, next.target);
      docker(["compose", "-p", prepared.project, "-f", prepared.compose_file, "exec", "-T", "postfix", "postfix", "-c", "/config", "check"]);
      docker(["compose", "-p", prepared.project, "-f", prepared.compose_file, "exec", "-T", "dovecot", "doveconf", "-c", "/registry/active.conf", "-n"]);
      reloadTLS(prepared); const endpoints = probeTLS(prepared, next.seal.fingerprint);
      F.atomic(state, JSON.stringify({ ...intent, phase: "applied" })); fs.unlinkSync(barrier);
      return { changed: true, fingerprint: next.seal.fingerprint, endpoints };
    } catch {
      switchTLS(root, previous.target);
      try {
        reloadTLS(prepared); probeTLS(prepared, previous.seal.fingerprint);
        F.atomic(state, JSON.stringify({ ...intent, phase: "rolled-back" })); fs.unlinkSync(barrier);
      } catch { F.atomic(state, JSON.stringify({ ...intent, phase: "rollback-incomplete" })); }
      V.fail("MAIL_TLS_ROTATION_FAILED");
    }
  });
}
function reconcileMailTLS(prepared, context) {
  if (context?.authorized !== true) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  verifyPrepared(prepared); verifyRuntime(prepared);
  return mailLock(prepared.root, () => {
    const state = prepared.root + "/durable/operator-state/tls-intent.json", intent = JSON.parse(F.read(state));
    if (intent.phase !== "rollback-incomplete" || readTLS(prepared.root).target !== intent.previous) V.fail("MAIL_TLS_RECONCILIATION_REFUSED");
    reloadTLS(prepared); const endpoints = probeTLS(prepared, intent.old_fingerprint);
    F.atomic(state, JSON.stringify({ ...intent, phase: "rolled-back" }));
    fs.unlinkSync(prepared.root + "/durable/registry/public/admission-closed");
    return { reconciled: true, fingerprint: intent.old_fingerprint, endpoints };
  });
}
function observeMailService(prepared, context) {
  if (context?.authorized !== true) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  const queueLimit = context.queue_age_seconds ?? 3600, authLimit = context.auth_failures ?? 5;
  if (!Number.isSafeInteger(queueLimit) || queueLimit < 1 || queueLimit > 604800 || !Number.isSafeInteger(authLimit) || authLimit < 1 || authLimit > 10000) V.fail("MAIL_MONITORING_INVALID");
  verifyPrepared(prepared); verifyStorage(prepared);
  const registry = JSON.parse(F.read(prepared.root + "/durable/registry/public/current.json"));
  const roles = {}, running = {}, alerts = [];
  for (const prefix of ["postmaster", "abuse"]) for (const domain of registry.domains) {
    const address = prefix + "@" + domain, box = registry.mailboxes.find(x => x.address === address) || registry.mailboxes.find(x => x.id === registry.aliases.find(a => a.address === address && a.receive_enabled)?.mailbox_id);
    if (!box?.receive_enabled) alerts.push({ code: "MAIL_" + prefix.toUpperCase() + "_ROUTE_MISSING" });
  }
  for (const role of ["postfix", "dovecot"]) {
    const ids = docker(["ps", "-aq", "--filter", "label=com.docker.compose.project=" + prepared.project, "--filter", "label=com.docker.compose.service=" + role]).trim().split("\n").filter(Boolean);
    if (ids.length !== 1) V.fail("MAIL_RUNTIME_IDENTITY_MISMATCH"); roles[role] = ids[0];
    const actual = JSON.parse(docker(["inspect", ids[0]]))[0]; verifyRuntimeRole(prepared, role, actual);
    running[role] = actual.State.Running;
    if (!running[role]) alerts.push({ code: "MAIL_SERVICE_UNAVAILABLE", resource: role });
  }
  const queue = running.postfix ? docker(["exec", roles.postfix, "postqueue", "-c", "/config", "-j"]).trim().split("\n").filter(Boolean).map(x => JSON.parse(x)) : [];
  const oldest = queue.length ? Math.max(...queue.map(x => Math.max(0, Date.now() / 1000 - x.arrival_time))) : 0;
  const disks = {};
  for (const name of ["spool", "mailboxes"]) {
    const s = fs.statfsSync(prepared.root + "/durable/" + name);
    disks[name] = { available_bytes: s.bavail * s.bsize, total_bytes: s.blocks * s.bsize };
    if (s.bavail * s.bsize < 67108864 || s.bavail / s.blocks < 0.1) alerts.push({ code: "MAIL_DISK_PRESSURE", resource: name });
  }
  const certificate = new (require("node:crypto").X509Certificate)(F.read(readTLS(prepared.root).directory + "/certificate.pem"));
  const expires = (Date.parse(certificate.validTo) - Date.now()) / 86400000;
  const window = expires <= 7 ? 7 : expires <= 14 ? 14 : expires <= 30 ? 30 : null;
  if (window) alerts.push({ code: "MAIL_CERTIFICATE_EXPIRES_" + window + "_DAYS" });
  const tlsIntent = prepared.root + "/durable/operator-state/tls-intent.json";
  if (fs.existsSync(tlsIntent) && ["rolled-back", "rollback-incomplete"].includes(JSON.parse(F.read(tlsIntent)).phase)) alerts.push({ code: "MAIL_TLS_ROTATION_FAILED" });
  if (oldest >= queueLimit) alerts.push({ code: "MAIL_QUEUE_AGE" });
  if (fs.existsSync(prepared.root + "/durable/registry/public/admission-closed")) alerts.push({ code: "MAIL_GENERATION_INCOMPLETE" });
  let failures = 0;
  for (const role of Object.values(roles)) failures += (docker(["logs", "--since", "10m", role], true).match(/SASL [^\n]*authentication failed|auth failed|Authentication failed/gi) || []).length;
  if (failures >= authLimit) alerts.push({ code: "MAIL_AUTH_FAILURES" });
  const quotas = [];
  for (const mailbox of running.dovecot ? registry.mailboxes : []) {
    const rows = JSON.parse(docker(["exec", roles.dovecot, "doveadm", "-c", "/registry/active.conf", "-f", "json", "quota", "get", "-u", mailbox.address]));
    for (const row of rows) {
      const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]));
      if (String(normalized.type).toUpperCase() !== "STORAGE") continue;
      const used = Number(normalized.value) * 1024, limit = Number(normalized.limit) * 1024;
      quotas.push({ id: mailbox.id, used_bytes: used, limit_bytes: limit });
      if (limit > 0 && used >= limit * 0.75) alerts.push({ code: "MAIL_QUOTA_HIGH", mailbox_id: mailbox.id });
      if (limit > 0 && used >= limit) alerts.push({ code: "MAIL_QUOTA_AT_LIMIT", mailbox_id: mailbox.id });
    }
  }
  const stateFile = prepared.root + "/durable/policy-state/counters.json";
  const state = fs.existsSync(stateFile) ? JSON.parse(F.read(stateFile)) : { rate_limited: 0 };
  if (state.rate_limited) alerts.push({ code: "MAIL_ACCOUNT_RATE_LIMIT" });
  return { contract: "drumee.mail-observation/1", healthy: !alerts.length, queue: { count: running.postfix ? queue.length : null, oldest_age_seconds: running.postfix ? oldest : null }, disks, quotas, authentication_failures_10m: failures, certificate_expires_at: certificate.validTo, alerts };
}
function purgeMailMailbox(prepared, input, context) {
  return Purge.control(prepared, input, context, { verifyPrepared, verifyRuntime, mailLock, docker });
}
function releaseMailRegistry(prepared, context) {
  if (context?.authorized !== true) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  verifyPrepared(prepared);
  return mailLock(prepared.root, () => {
    const root = prepared.root, state = root + "/durable/operator-state", pub = root + "/durable/registry/public";
    const runtime = JSON.parse(F.read(root + "/candidates/" + F.read(state + "/runtime-revision").toString() + "/prepared.json"));
    verifyRuntime(runtime);
    const intent = JSON.parse(F.read(state + "/registry-intent.json")), registry = JSON.parse(F.read(pub + "/current.json")), target = JSON.parse(F.read(path.dirname(prepared.compose_file) + "/registry.json"));
    if (intent.phase !== "applied" || intent.revision !== prepared.revision || V.digest(registry) !== V.digest(target) || fs.readlinkSync(root + "/durable/registry/private/current") !== "generation-" + registry.generation) V.fail("MAIL_RECOVERY_REQUIRED");
    const drainFile = state + "/quota-drain.json";
    if (fs.existsSync(drainFile) && JSON.parse(F.read(drainFile)).phase !== "released") V.fail("MAIL_RECOVERY_REQUIRED");
    if (fs.existsSync(pub + "/admission-closed")) {
      const mailboxIds = Object.keys(prepared.mailbox_identities);
      if (V.digest(inspectMaildirs(root, prepared.compose.services.policy.image, mailboxIds, mailboxIds)) !== V.digest(prepared.mailbox_identities)) V.fail("MAIL_MAILBOX_IDENTITY_MISMATCH");
      let ready = false;
      for (let retry = 0; retry < 40 && !ready; retry++) {
        const ids = docker(["ps", "-q", "--filter", "label=com.docker.compose.project=" + prepared.project]).trim().split("\n").filter(Boolean);
        if (ids.length === 4) ready = JSON.parse(docker(["inspect", ...ids])).every(c => c.State.Running && !c.State.Paused && (!c.State.Health || c.State.Health.Status === "healthy"));
        if (!ready) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
      }
      if (!ready) V.fail("MAIL_DEPENDENCY_UNAVAILABLE");
      fs.unlinkSync(pub + "/admission-closed");
    }
    const fd = fs.openSync(pub, "r"); try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    return { released: true, generation: registry.generation };
  });
}
function finishMailPurge(prepared, operationId, context) {
  if (context?.authorized !== true || context.acceptance !== true || !/^[a-f0-9-]{36}$/.test(operationId)) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  verifyPrepared(prepared);
  return mailLock(prepared.root, () => {
    const root = prepared.root, state = root + "/durable/operator-state", pub = root + "/durable/registry/public";
    const file = state + "/purge-" + operationId + ".json", receipt = JSON.parse(F.read(file)), intent = JSON.parse(F.read(state + "/registry-intent.json")), registry = JSON.parse(F.read(pub + "/current.json"));
    if (!["erased", "applied"].includes(receipt.phase) || receipt.identity.target !== prepared.revision || intent.phase !== "applied" || intent.revision !== prepared.revision || registry.generation !== prepared.registry_generation || fs.readlinkSync(root + "/durable/registry/private/current") !== "generation-" + registry.generation) V.fail("MAIL_RECOVERY_REQUIRED");
    if (receipt.phase === "applied" && !fs.existsSync(pub + "/admission-closed")) return { purged: true, retained_identity: true, backup_id: receipt.identity.backup_id };
    const runtime = JSON.parse(F.read(root + "/candidates/" + F.read(state + "/runtime-revision").toString() + "/prepared.json")); verifyRuntime(runtime);
    docker(["compose", "-p", runtime.project, "-f", runtime.compose_file, "stop"]);
    if (docker(["ps", "-q", "--filter", "label=com.docker.compose.project=" + prepared.project]).trim()) V.fail("MAIL_PURGE_REFERENCED");
    F.atomic(file, JSON.stringify({ ...receipt, phase: "applied" }));
    fs.unlinkSync(pub + "/admission-closed"); const fd = fs.openSync(pub, "r"); try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    return { purged: true, retained_identity: true, backup_id: receipt.identity.backup_id };
  });
}
function verifyMailCredentials(prepared, verifiers, context) {
  if (context?.authorized !== true) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  verifyPrepared(prepared); verifyRuntime(prepared);
  const root = prepared.root + "/durable/registry", registry = JSON.parse(F.read(root + "/public/current.json"));
  const files = R.credentials(registry, verifiers);
  for (const [file, content] of Object.entries(files)) if (F.read(root + "/private/generation-" + registry.generation + "/" + file).toString() !== content) V.fail("MAIL_CREDENTIAL_SNAPSHOT_MISMATCH");
  return { verified: true, generation: registry.generation };
}
function observeMailMailbox(prepared, id, context) {
  if (context?.authorized !== true) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  verifyPrepared(prepared); verifyRuntime(prepared);
  const registry = JSON.parse(F.read(prepared.root + "/durable/registry/public/current.json"));
  const box = registry.mailboxes.find(b => b.id === id);
  if (!box) V.fail("MAIL_NOT_FOUND");
  const ids = docker(["ps", "-q", "--filter", "label=com.docker.compose.project=" + prepared.project, "--filter", "label=com.docker.compose.service=dovecot"]).trim().split("\n").filter(Boolean);
  if (ids.length !== 1) V.fail("MAIL_DEPENDENCY_UNAVAILABLE");
  const rows = JSON.parse(docker(["exec", ids[0], "doveadm", "-c", "/registry/active.conf", "-f", "json", "mailbox", "status", "-u", "mbx-" + id + "@local.invalid", "messages vsize", "*"]));
  const values = rows.map(row => ({ messages: Number(row.messages), bytes: Number(row.vsize) }));
  if (values.some(row => !Number.isSafeInteger(row.messages) || row.messages < 0 || !Number.isSafeInteger(row.bytes) || row.bytes < 0)) V.fail("MAIL_NATIVE_OPERATION_FAILED");
  const used_bytes = values.reduce((sum, row) => sum + row.bytes, 0), messages = values.reduce((sum, row) => sum + row.messages, 0);
  return { id, used_bytes, messages, quota_bytes: box.quota_bytes, over_quota: used_bytes > box.quota_bytes, observed_at: new Date().toISOString(), advisory: true };
}
function operateMailService(prepared, operation, context) {
  if (context?.authorized !== true || !["start", "stop", "restart", "status", "preflight"].includes(operation)) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  verifyPrepared(prepared);
  verifyRuntime(prepared);
  if (operation === "preflight") return { revision: prepared.revision, operation, native_output: "MAIL_PREFLIGHT_OK" };
  if (operation !== "status" && context.acceptance !== true) V.fail("MAIL_TARGET_QUALIFICATION_REQUIRED");
  // Full generation barriers/session coordination is deliberately not claimed by
  // this initial activation primitive. Never clear an incomplete security barrier.
  if (["start", "restart"].includes(operation) && fs.existsSync(prepared.root + "/durable/registry/public/admission-closed")) {
    const target = context.recovery_target;
    if (!target) V.fail("MAIL_GENERATION_ACTIVATION_UNQUALIFIED");
    verifyPrepared(target);
    const intent = JSON.parse(F.read(prepared.root + "/durable/operator-state/registry-intent.json"));
    if (target.root !== prepared.root || target.project !== prepared.project || target.transport_digest !== prepared.transport_digest || intent.revision !== target.revision || intent.to !== target.registry_generation || !["applying", "applied"].includes(intent.phase)) V.fail("MAIL_RECOVERY_REQUIRED");
    // Existing-storage restart only. Both SMTP and native auth gates remain closed.
    // No projection, queue, resource or identity guard is bypassed or cleared here.
  }
  const args = operation === "start" ? ["up", "-d"] : operation === "status" ? ["ps", "--format", "json"] : [operation];
  return { revision: prepared.revision, operation, native_output: docker(["compose", "-p", prepared.project, "-f", prepared.compose_file, ...args]) };
}
module.exports = { validateMailService: V.validateMailService, validateRegistry: V.validateRegistry, planMailService, composeMailService, prepareMailService, activateMailRegistry, stageMailRegistryBarrier, purgeMailMailbox, finishMailPurge, releaseMailRegistry, verifyMailCredentials, observeMailMailbox, observeMailService, rotateMailTLS, reconcileMailTLS, operateMailService };
