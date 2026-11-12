"use strict";
const fs = require("node:fs"), path = require("node:path"), { spawnSync } = require("node:child_process");
const V = require("./validation"), R = require("./render"), F = require("../../lib/filesystem-safety");
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
  const implementation = V.digest({ artifacts, policy: fs.readFileSync(__dirname + "/policy.js", "utf8") });
  const body = { implementation, contract: "drumee.mail-plan/1", spec: normalized, registry, secret_sources: resources.secret_sources || [] };
  return { ...body, revision: V.digest(body), applicable: true, diagnostics: [], artifacts };
}
function checkedPlan(plan) {
  if (!plan || !plan.applicable) V.fail("MAIL_PLAN_REQUIRED");
  const expected = planMailService(plan.spec, { registry: plan.registry, secret_sources: plan.secret_sources });
  if (V.digest(expected) !== V.digest(plan)) V.fail("MAIL_PLAN_TAMPERED");
}
function composeMailService(plan, distribution = {}) {
  checkedPlan(plan);
  if (Object.keys(distribution).some(k => !["acceptance"].includes(k))) V.fail("MAIL_DISTRIBUTION_INVALID");
  const s = plan.spec, root = s.deployment.root, candidate = root + "/candidates/" + plan.revision, images = s.deployment.images;
  const bind = (source, target, read_only = true) => ({ type: "bind", source, target, read_only, bind: { create_host_path: false } });
  const service = (role, networks) => ({ image: images[role === "policy" ? "helper" : role].split("@").at(-1), read_only: true, cap_drop: ["ALL"], security_opt: ["no-new-privileges:true"], networks, restart: "unless-stopped", labels: { "org.drumee.mail.owner": s.deployment.id, "org.drumee.mail.revision": plan.revision, "org.drumee.mail.role": role }, tmpfs: ["/run:rw,nosuid,size=64m", "/tmp:rw,noexec,nosuid,size=32m"], volumes: [] });
  const postfix = service("postfix", ["edge", "control"]), dovecot = service("dovecot", ["edge"]), opendkim = service("opendkim", ["control"]), policy = service("policy", ["control"]);
  for (const value of [postfix, dovecot]) value.cap_add = ["CHOWN", "SETUID", "SETGID", "DAC_OVERRIDE", "FOWNER", "KILL", "NET_BIND_SERVICE"];
  dovecot.cap_add.push("SYS_CHROOT");
  postfix.tmpfs.push("/config:rw,noexec,nosuid,size=16777216");
  postfix.volumes = [bind(candidate + "/config", "/source"), bind(candidate + "/keys/tls", "/keys"), bind(root + "/durable/spool", "/var/spool/postfix", false), "sockets:/run/mail-sockets"];
  postfix.entrypoint = ["/bin/sh", "/source/postfix-entrypoint.sh"];
  postfix.healthcheck = { test: ["CMD", "postfix", "-c", "/config", "status"], interval: "2s", timeout: "3s", retries: 20 };
  dovecot.volumes = [bind(candidate + "/config", "/config"), bind(candidate + "/keys/tls", "/keys"), bind(root + "/durable/registry/private", "/registry"), bind(root + "/durable/mailboxes", "/mailboxes", false), "sockets:/run/mail-sockets"];
  dovecot.entrypoint = ["/bin/sh", "/config/dovecot-entrypoint.sh"];
  opendkim.user = `${s.deployment.owner_uid}:${s.deployment.owner_gid}`;
  opendkim.volumes = [bind(candidate + "/config", "/config"), bind(candidate + "/keys/dkim", "/keys")]; opendkim.entrypoint = ["opendkim", "-f", "-x", "/config/opendkim.conf"];
  policy.user = `${s.deployment.owner_uid}:${s.deployment.owner_gid}`;
  policy.volumes = [bind(candidate + "/policy.js", "/app/policy.js"), bind(root + "/durable/registry/public", "/registry")]; policy.entrypoint = ["node", "/app/policy.js"];
  if (!distribution.acceptance) {
    const ports = { smtp25: [postfix, 25], submission587: [postfix, 587], submissions465: [postfix, 465], imaps993: [dovecot, 993] };
    for (const [name, [value, port]] of Object.entries(ports)) if (s.listeners[name].enabled) (value.ports ||= []).push({ target: port, published: port, host_ip: s.listeners[name].address });
    (postfix.ports ||= []).push({ target: s.networks.private_submission.port, published: s.networks.private_submission.port, host_ip: s.networks.private_submission.address });
  }
  return { name: s.deployment.project, services: { postfix, dovecot, opendkim, policy }, networks: { edge: { name: s.deployment.project + "-edge", internal: distribution.acceptance === true, ipam: { config: [{ subnet: s.networks.edge_subnet, gateway: s.networks.edge_gateway }] }, labels: { "org.drumee.mail.owner": s.deployment.id } }, control: { name: s.deployment.project + "-control", internal: true, labels: { "org.drumee.mail.owner": s.deployment.id } } }, volumes: { sockets: { name: s.deployment.project + "-sockets", driver_opts: { type: "tmpfs", device: "tmpfs", o: "size=16777216,mode=0755" }, labels: { "org.drumee.mail.owner": s.deployment.id } } } };
}
function docker(args) {
  const result = spawnSync(resolveTrustedExecutable("docker"), ["--host", "unix:///var/run/docker.sock", ...args], { env: systemEnvironment("docker"), encoding: "utf8", timeout: 120000, maxBuffer: 1048576 });
  if (result.error || result.status !== 0) V.fail("MAIL_NATIVE_OPERATION_FAILED"); return result.stdout;
}
function prepareMailService(plan, context) {
  checkedPlan(plan);
  if (context?.authorized !== true || process.getuid() !== plan.spec.deployment.owner_uid) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  for (const image of Object.values(plan.spec.deployment.images)) if (/sha256:0{64}$/.test(image)) V.fail("MAIL_PLACEHOLDER_IMAGE");
  for (const image of new Set(Object.values(plan.spec.deployment.images))) {
    const expected = image.split("@").at(-1), current = JSON.parse(docker(["image", "inspect", expected]))[0];
    if (current.Id !== expected) V.fail("MAIL_IMAGE_IDENTITY_MISMATCH");
  }
  const root = plan.spec.deployment.root, owner = { contract: "drumee.mail-owner/1", id: plan.spec.deployment.id, project: plan.spec.deployment.project, uid: process.getuid() };
  F.privateDirectory(root, true);
  const marker = root + "/owner.json";
  const initializing = !fs.existsSync(marker);
  if (fs.existsSync(marker)) { if (fs.readFileSync(marker, "utf8") !== JSON.stringify(owner)) V.fail("MAIL_RESOURCE_IDENTITY_MISMATCH"); }
  else { if (fs.readdirSync(root).length) V.fail("MAIL_RESOURCE_IDENTITY_MISMATCH"); F.atomic(marker, JSON.stringify(owner)); }
  if (!initializing) {
    for (const name of ["spool", "mailboxes", "registry", "operator-state"]) if (!fs.existsSync(root + "/durable/" + name)) V.fail("MAIL_STORAGE_GUARD_FAILED");
    for (const name of ["spool", "mailboxes"]) {
      const expected = JSON.stringify({ owner: plan.spec.deployment.id, resource: name === "spool" ? "mail-queue" : "mailboxes" });
      if (!fs.existsSync(root + "/durable/" + name + "/.infra-owner") || fs.readFileSync(root + "/durable/" + name + "/.infra-owner", "utf8") !== expected) V.fail("MAIL_STORAGE_GUARD_FAILED");
    }
  }
  const candidate = root + "/candidates/" + plan.revision;
  for (const dir of [root + "/candidates", candidate, candidate + "/config", candidate + "/keys", root + "/durable", root + "/durable/operator-state", root + "/durable/registry", root + "/durable/registry/private", root + "/durable/registry/public", root + "/durable/registry/private/generation-" + plan.registry.generation]) F.privateDirectory(dir, true);
  F.directory(root + "/durable/spool", true);
  F.directory(root + "/durable/mailboxes", true);
  for (const kind of ["tls", "dkim"]) F.privateDirectory(candidate + "/keys/" + kind, true);
  const secret = ref => { const sources = plan.secret_sources.filter(x => x.ref === ref); if (sources.length !== 1) V.fail("MAIL_SECRET_SOURCE_MISSING"); return F.read(sources[0].file, true); };
  const keys = { "certificate.pem": secret(plan.spec.tls.certificate_ref), "key.pem": secret(plan.spec.tls.key_ref), "ca.pem": secret(plan.spec.tls.client_ca_ref) };
  plan.spec.dkim.forEach((d, i) => { keys[`dkim-${i}.pem`] = secret(d.key_ref); });
  const crypto = require("node:crypto"), certificate = new crypto.X509Certificate(keys["certificate.pem"]);
  if (!certificate.checkHost(plan.spec.hostname) || Date.parse(certificate.validFrom) > Date.now() || Date.parse(certificate.validTo) <= Date.now() || !certificate.checkPrivateKey(crypto.createPrivateKey(keys["key.pem"]))) V.fail("MAIL_CERTIFICATE_INVALID");
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
    if (V.digest(seal.private_files) !== V.digest(Object.fromEntries(Object.entries(passwd).map(([name, data]) => [name, V.digest(data)]))) || V.digest(seal.compose) !== V.digest(composeMailService(plan, { acceptance: context.acceptance === true }))) V.fail("MAIL_SEALED_INPUT_CONFLICT");
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
  const compose = composeMailService(plan, { acceptance: context.acceptance === true });
  // Initialize only the new empty, marker-owned mailbox tree with fixed image IDs.
  docker(["run", "--rm", "--network", "none", "--user", "0:0", "--mount", `type=bind,source=${root}/durable/mailboxes,target=/mailboxes`, "--entrypoint", "node", plan.spec.deployment.images.helper.split("@").at(-1), "-e", 'const f=require("node:fs"),ids=JSON.parse(process.argv[1]);f.chmodSync("/mailboxes",493);for(const id of ids){const p="/mailboxes/"+id;if(!f.existsSync(p)){f.mkdirSync(p,{mode:448});f.chownSync(p,5000,5000);}const h=p+"/home";if(!f.existsSync(h)){f.mkdirSync(h,{mode:448});f.chownSync(h,5000,5000);}}', JSON.stringify(plan.registry.mailboxes.map(b => b.id))]);
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
  const prepared = { contract: "drumee.mail-prepared/1", revision: plan.revision, root, project: plan.spec.deployment.project, compose, compose_file: candidate + "/compose.json", certificate_fingerprint: certificate.fingerprint256, storage: Object.fromEntries(["spool", "mailboxes", "registry", "registry/private", "registry/public", "operator-state"].map(name => { const stat = fs.lstatSync(root + "/durable/" + name); return [name, { dev: stat.dev, ino: stat.ino }]; })), private_files: Object.fromEntries(Object.entries(passwd).map(([name, content]) => [name, V.digest(content)])), registry_generation: plan.registry.generation, transport_digest: V.digest(plan.spec), files };
  F.atomic(prepared.compose_file, JSON.stringify(compose, null, 2));
  const publicRegistry = root + "/durable/registry/public";
  if (!fs.existsSync(publicRegistry + "/current.json")) F.atomic(publicRegistry + "/current.json", JSON.stringify(plan.registry));
  if (!fs.existsSync(root + "/durable/operator-state/transport-digest")) F.atomic(root + "/durable/operator-state/transport-digest", prepared.transport_digest);
  F.atomic(candidate + "/prepared.json", JSON.stringify(prepared));
  return prepared;
}
function verifyPrepared(prepared) {
  if (!prepared || prepared.contract !== "drumee.mail-prepared/1" || typeof prepared.root !== "string" || prepared.compose_file !== prepared.root + "/candidates/" + prepared.revision + "/compose.json") V.fail("MAIL_PREPARED_TAMPERED");
  const directory = path.dirname(prepared.compose_file), stored = JSON.parse(F.read(directory + "/prepared.json"));
  if (V.digest(JSON.parse(F.read(prepared.compose_file))) !== V.digest(prepared.compose)) V.fail("MAIL_PREPARED_TAMPERED");
  if (V.digest(stored) !== V.digest(prepared)) V.fail("MAIL_PREPARED_TAMPERED");
  for (const [file, digest] of Object.entries(prepared.private_files)) if (V.digest(F.read(prepared.root + "/durable/registry/private/generation-" + prepared.registry_generation + "/" + file).toString()) !== digest) V.fail("MAIL_PREPARED_TAMPERED");
  for (const [file, digest] of Object.entries(prepared.files)) {
    const full = directory + "/" + file, stat = fs.lstatSync(full), secret = file.startsWith("keys/");
    if (stat.mode & (secret ? 0o077 : 0o022) || V.digest(F.read(full, secret).toString()) !== digest) V.fail("MAIL_PREPARED_TAMPERED");
  }
}
function activateMailRegistry(prepared, context) {
  if (context?.authorized !== true) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  verifyPrepared(prepared);
  const root = prepared.root, pub = root + "/durable/registry/public", priv = root + "/durable/registry/private", state = root + "/durable/operator-state";
  if (F.read(state + "/transport-digest").toString() !== prepared.transport_digest) V.fail("MAIL_REGISTRY_TRANSPORT_MISMATCH");
  return F.lock(root, () => {
    const previous = JSON.parse(F.read(pub + "/current.json")), next = JSON.parse(F.read(path.dirname(prepared.compose_file) + "/registry.json"));
    if (previous.generation === next.generation && V.digest(previous) === V.digest(next) && !fs.existsSync(pub + "/admission-closed")) return { applied: true, changed: false, generation: next.generation };
    if (previous.generation !== context.expected_generation || next.generation <= previous.generation) V.fail("MAIL_REGISTRY_REVISION_CONFLICT");
    const ids = docker(["ps", "-q", "--filter", "label=com.docker.compose.project=" + prepared.project, "--filter", "label=com.docker.compose.service=dovecot"]).trim().split("\n").filter(Boolean);
    if (ids.length !== 1) V.fail("MAIL_RUNTIME_IDENTITY_MISMATCH");
    const current = JSON.parse(docker(["inspect", ids[0]]))[0], owner = JSON.parse(F.read(root + "/owner.json"));
    if (current.Config.Labels["org.drumee.mail.owner"] !== owner.id) V.fail("MAIL_RUNTIME_IDENTITY_MISMATCH");
    F.atomic(pub + "/admission-closed", JSON.stringify({ from: previous.generation, to: next.generation }));
    F.atomic(state + "/registry-intent.json", JSON.stringify({ from: previous.generation, to: next.generation, revision: prepared.revision, phase: "applying" }));
    try {
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
      const oldPasswd = F.read(priv + "/generation-" + previous.generation + "/imap.passwd").toString().split("\n");
      const newPasswd = F.read(priv + "/generation-" + next.generation + "/imap.passwd").toString().split("\n");
      for (const box of previous.mailboxes) {
        const successor = next.mailboxes.find(x => x.id === box.id);
        const oldVerifier = oldPasswd.find(x => x.startsWith(box.address + ":"));
        const newVerifier = newPasswd.find(x => x.startsWith(box.address + ":"));
        if (!successor || !successor.imap_enabled || successor.address !== box.address || successor.quota_bytes !== box.quota_bytes || oldVerifier !== newVerifier) docker(["exec", ids[0], "doveadm", "-c", "/registry/active.conf", "kick", box.address]);
      }
      F.atomic(pub + "/current.json", JSON.stringify(next));
      F.atomic(state + "/registry-intent.json", JSON.stringify({ from: previous.generation, to: next.generation, revision: prepared.revision, phase: "applied" }));
      fs.unlinkSync(pub + "/admission-closed");
      const directory = fs.openSync(pub, fs.constants.O_RDONLY); try { fs.fsyncSync(directory); } finally { fs.closeSync(directory); }
      return { applied: true, changed: true, generation: next.generation, smtp_revocation: "next-MAIL-DATA", imap_affected_sessions_kicked: true };
    } catch { V.fail("MAIL_APPLY_INCOMPLETE"); }
  });
}
function verifyStorage(prepared) {
  const owner = JSON.parse(F.read(prepared.root + "/owner.json"));
  if (owner.project !== prepared.project || owner.uid !== process.getuid()) V.fail("MAIL_RESOURCE_IDENTITY_MISMATCH");
  for (const [name, identity] of Object.entries(prepared.storage)) {
    const file = prepared.root + "/durable/" + name;
    F.directory(file);
    const stat = fs.lstatSync(file);
    if (stat.dev !== identity.dev || stat.ino !== identity.ino || stat.mode & 0o022) V.fail("MAIL_STORAGE_GUARD_FAILED");
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
  return owner;
}
function verifyRuntimeRole(prepared, role, actual) {
  const expected = prepared.compose.services[role], owner = JSON.parse(F.read(prepared.root + "/owner.json"));
  if (!expected || actual.Config.Labels["org.drumee.mail.owner"] !== owner.id || actual.Config.Labels["org.drumee.mail.revision"] !== prepared.revision || actual.Config.Labels["org.drumee.mail.role"] !== role) V.fail("MAIL_RUNTIME_IDENTITY_MISMATCH");
  if (actual.Image !== expected.image) V.fail("MAIL_RUNTIME_IMAGE_MISMATCH");
  const equal = (a, b) => V.digest(a) === V.digest(b), sorted = a => [...(a || [])].sort();
  if (!equal(actual.Config.Entrypoint, expected.entrypoint) || !equal(actual.Config.Cmd || [], expected.command || []) || actual.Config.User !== (expected.user || "") || !actual.HostConfig.ReadonlyRootfs || actual.HostConfig.Privileged || actual.HostConfig.PidMode || actual.HostConfig.Devices?.length || actual.HostConfig.DeviceRequests?.length) V.fail("MAIL_RUNTIME_EXECUTION_MISMATCH");
  const caps = a => sorted((a || []).map(x => x.replace(/^CAP_/, "").toUpperCase()));
  if (!equal(caps(actual.HostConfig.CapDrop), caps(expected.cap_drop)) || !equal(caps(actual.HostConfig.CapAdd), caps(expected.cap_add)) || !equal(sorted(actual.HostConfig.SecurityOpt), sorted(expected.security_opt))) V.fail("MAIL_RUNTIME_EXECUTION_MISMATCH");
  const networks = Object.keys(actual.NetworkSettings.Networks).sort(), expectedNetworks = expected.networks.map(name => prepared.compose.networks[name].name).sort();
  if (!equal(networks, expectedNetworks)) V.fail("MAIL_RUNTIME_NETWORK_MISMATCH");
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
function operateMailService(prepared, operation, context) {
  if (context?.authorized !== true || !["start", "stop", "restart", "status"].includes(operation)) V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
  verifyPrepared(prepared);
  verifyRuntime(prepared);
  if (operation !== "status" && context.acceptance !== true) V.fail("MAIL_TARGET_QUALIFICATION_REQUIRED");
  // Full generation barriers/session coordination is deliberately not claimed by
  // this initial activation primitive. Never clear an incomplete security barrier.
  if (["start", "restart"].includes(operation) && fs.existsSync(prepared.root + "/durable/registry/public/admission-closed")) V.fail("MAIL_GENERATION_ACTIVATION_UNQUALIFIED");
  const args = operation === "start" ? ["up", "-d"] : operation === "status" ? ["ps", "--format", "json"] : [operation];
  return { revision: prepared.revision, operation, native_output: docker(["compose", "-p", prepared.project, "-f", prepared.compose_file, ...args]) };
}
module.exports = { validateMailService: V.validateMailService, validateRegistry: V.validateRegistry, planMailService, composeMailService, prepareMailService, activateMailRegistry, operateMailService };
