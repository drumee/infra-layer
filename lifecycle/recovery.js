"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const S = require("../lib/spec");
const F = require("../lib/filesystem-safety");
const P = require("./preparation");
const A = require("./activation");
const D = require("./docker");
const J = require("./journal");
const prefixes = ["durable", "secrets", "tls", "dns-state", "candidates", "rotations", "journal"];
const top_files = ["deployment-owner.json", "resources.json", "active.json", "renewal.json"];
const copy_script = `const fs=require('node:fs'),path=require('node:path');const configuration=JSON.parse(process.argv[1]);function copy(src,dst){const stat=fs.lstatSync(src);if(stat.isSymbolicLink()||(!stat.isDirectory()&&!stat.isFile())||stat.isFile()&&stat.nlink!==1)throw Error('unsafe');if(stat.isDirectory()){fs.mkdirSync(dst,{mode:stat.mode&4095});for(const name of fs.readdirSync(src).sort())copy(path.join(src,name),path.join(dst,name));}else{const a=fs.openSync(src,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW),b=fs.openSync(dst,'wx',stat.mode&4095),buffer=Buffer.alloc(65536);let n;try{while(n=fs.readSync(a,buffer,0,buffer.length,null)){let offset=0;while(offset<n)offset+=fs.writeSync(b,buffer,offset,n-offset);}fs.fsyncSync(b);}finally{fs.closeSync(a);fs.closeSync(b);}}fs.chownSync(dst,stat.uid,stat.gid);fs.chmodSync(dst,stat.mode&4095);}for(const name of configuration.names){if(!/^[a-zA-Z0-9_.-]+$/.test(name))throw Error('path');const src=path.join('/source',name),dst=path.join('/destination',name);if(fs.existsSync(src)){if(fs.existsSync(dst))throw Error('occupied');copy(src,dst);}}`;
function copyState(composition, source, destination, names) {
  F.directory(path.dirname(source)); F.privateDirectory(destination);
  D.docker(["run", "--rm", "--network", "none", "--read-only", "--cap-drop", "ALL", "--cap-add", "DAC_OVERRIDE", "--cap-add", "CHOWN", "--cap-add", "FOWNER", "--security-opt", "no-new-privileges:true", "--pids-limit", "32", "--memory", "128m", "--label", "org.drumee.infra.owner=" + composition.project, "--label", "org.drumee.infra.role=lifecycle-recovery", "--mount", `type=bind,source=${source},target=/source,readonly`, "--mount", `type=bind,source=${destination},target=/destination`, composition.distribution.helper_image, "node", "-e", copy_script, JSON.stringify({ names })]);
}
function dumpDatabase(prepared, file) {
  const fd = fs.openSync(file, "wx", 0o600);
  try {
    const result = spawnSync("docker", ["--host", "unix:///var/run/docker.sock", "compose", "-p", prepared.project, "-f", prepared.compose_file, "exec", "-T", "database", "/bin/sh", "-c", 'MYSQL_PWD="$(cat /run/secrets/database-admin)" exec mariadb-dump --protocol=socket -uroot --all-databases --lock-all-tables --routines --events --triggers --hex-blob --skip-comments'], { stdio: ["ignore", fd, "pipe"], timeout: 600000, maxBuffer: 65536 });
    if (result.status !== 0) F.fail("CONSISTENT_DATABASE_DUMP_FAILED"); fs.fsyncSync(fd);
  } finally { fs.closeSync(fd); }
}
function fileDigest(file) {
  F.privateDirectory(path.dirname(file)); const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || stat.uid !== process.getuid() || (stat.mode & 0o077)) F.fail("UNSAFE_BACKUP_PATH");
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW), hash = crypto.createHash("sha256"), buffer = Buffer.alloc(65536);
  try { const opened = fs.fstatSync(fd); if (opened.ino !== stat.ino || opened.dev !== stat.dev) F.fail("UNSAFE_BACKUP_PATH"); let count; while ((count = fs.readSync(fd, buffer, 0, buffer.length, null))) hash.update(buffer.subarray(0, count)); return hash.digest("hex"); } finally { fs.closeSync(fd); }
}
async function stopDeployment(prepared, context) {
  const driver = context.driver || D; P.verifyPrepared(prepared, context, driver);
  return F.lockAsync(prepared.root, async () => { driver.inspectProject(prepared.project, Object.keys(prepared.compose.services)); for (const name of prepared.composition.shutdown_order) driver.compose(prepared, ["stop", name]); J.append(prepared.root, "stopped", prepared.revision); return { revision: prepared.revision, stopped: true, data_preserved: true }; });
}
async function backupDeployment(root, directory, context) {
  const active = A.readActive(root); if (!active || context?.authorized !== true || context.quiescence !== "stop-owned-writers") F.fail("BACKUP_QUIESCENCE_CONTRACT_REQUIRED");
  const prepared = active.prepared; const driver = context.driver || D; P.verifyPrepared(prepared, { ...context, root }, driver);
  if (S.contains(root, directory) || S.contains(directory, root)) F.fail("UNSAFE_BACKUP_PATH"); F.privateDirectory(directory, true); if (fs.readdirSync(directory).length) F.fail("BACKUP_DESTINATION_OCCUPIED");
  let stopped = false; let result;
  try {
    result = await F.lockAsync(root, async () => {
      const state = await A.inspectDeployment(root, context); if (!state.ready) F.fail("VERIFIED_ACTIVE_DEPLOYMENT_REQUIRED");
      if ([prepared.composition.plan.inputs.spec.database?.mode, prepared.composition.plan.inputs.spec.redis?.mode].includes("external")) F.fail("COLD_BACKUP_EXTERNAL_RESOURCE_UNSUPPORTED");
      const id = crypto.randomBytes(16).toString("hex"); J.append(root, "backup-intent", prepared.revision, { backup_id: id });
      stopped = true;
      for (const name of prepared.composition.shutdown_order.filter((name) => !["database", "redis", "dns"].includes(name))) driver.compose(prepared, ["stop", name]);
      if (prepared.compose.services.database) {
        const events = driver.compose(prepared, ["exec", "-T", "database", "/bin/sh", "-c", 'MYSQL_PWD="$(cat /run/secrets/database-admin)" exec mariadb --protocol=socket -uroot --batch --skip-column-names -e "SELECT COUNT(*) FROM information_schema.EVENTS WHERE STATUS=\'ENABLED\'"']);
        if (events.trim() !== "0") F.fail("DATABASE_EVENT_QUIESCENCE_REQUIRED"); dumpDatabase(prepared, path.join(directory, "database.sql"));
      }
      stopped = true;
      for (const name of prepared.composition.shutdown_order.filter((name) => ["database", "redis", "dns"].includes(name))) driver.compose(prepared, ["stop", name]);
      const observed = driver.inspectProject(prepared.project, Object.keys(prepared.compose.services)); if (observed.some((value) => value.running)) F.fail("BACKUP_QUIESCENCE_NOT_OBSERVED"); J.append(root, "stopped", prepared.revision);
      const payload = path.join(directory, "payload"); F.privateDirectory(payload, true); copyState(prepared.composition, root, payload, [...prefixes, ...top_files]);
      const inventory = driver.inventory(prepared.composition, payload);
      const included = [...prefixes, ...top_files]; const source_inventory = driver.inventory(prepared.composition, root).filter((value) => included.includes(value.path.split("/")[0]));
      if (S.serialize(source_inventory) !== S.serialize(inventory)) F.fail("BACKUP_CHECKSUM_MISMATCH");
      const body = { contract_version: "1", id, owner: prepared.instance_id, project: prepared.project, source_root: root, source_revision: prepared.revision, timestamp: new Date().toISOString(), host_uid: process.getuid(), consistency: { method: "cold-owned-deployment", logical_database: prepared.compose.services.database ? "locked-all-tables-before-engine-stop" : "not-applicable", external_writers: "declared-none", all_owned_processes_stopped: true }, resources: prepared.composition.resources, schema_versions: prepared.composition.distribution.schema_versions, composition: prepared.composition, fingerprints: prepared.fingerprints, certificate: prepared.certificate || null, zone: prepared.zone || null, inventory, database_dump_digest: fs.existsSync(path.join(directory, "database.sql")) ? fileDigest(path.join(directory, "database.sql")) : null, recovery_prerequisites: ["MATCH_SCHEMA_VERSIONS", "NEW_OWNED_ROOT", "ISOLATED_PORTS", "NATIVE_ENGINE_AND_KERNEL_RECOVERY_VALIDATION"] };
      const manifest = { ...body, digest: S.digest(body) }; F.atomic(path.join(directory, "backup.json"), JSON.stringify(manifest)); J.append(root, "backup-completed", prepared.revision, { backup_id: id }); return { id, directory, source_revision: prepared.revision, manifest_digest: manifest.digest, protected: true, resources: body.resources.map((value) => value.id) };
    });
  } catch (error) { J.append(root, "backup-failed", prepared.revision, { code: A.safeCode(error) }); throw error; }
  finally { if (stopped && context.resume_after_backup === true) await A.activateDeployment(prepared, { ...context, recover: true }); }
  return result;
}
function validateBackup(directory, expected_schema_versions, context) {
  if (context?.authorized !== true) F.fail("BACKUP_OPERATION_NOT_AUTHORIZED"); F.privateDirectory(directory);
  let manifest; try { manifest = JSON.parse(F.read(path.join(directory, "backup.json"))); } catch (_) { F.fail("BACKUP_MANIFEST_CORRUPTED"); }
  const { digest, ...body } = manifest;
  if (!S.plainTree(manifest) || manifest.contract_version !== "1" || digest !== S.digest(body) || !/^[a-f0-9]{32}$/.test(manifest.id || "") || !Array.isArray(manifest.inventory) || !manifest.composition) F.fail("BACKUP_MANIFEST_CORRUPTED");
  const composition = require("./composition").verifyComposition(manifest.composition);
  if (manifest.owner !== composition.instance_id || manifest.host_uid !== process.getuid() || !S.resourcePath(manifest.source_root)) F.fail("BACKUP_OWNERSHIP_MISMATCH");
  if (S.serialize(manifest.resources) !== S.serialize(composition.resources)) F.fail("BACKUP_RESOURCE_MISSING");
  if (S.serialize(manifest.schema_versions) !== S.serialize(expected_schema_versions)) F.fail("INCOMPATIBLE_SCHEMA_RESTORE");
  if (S.serialize((context.driver || D).inventory(composition, path.join(directory, "payload"))) !== S.serialize(manifest.inventory)) F.fail("BACKUP_CHECKSUM_MISMATCH");
  if (manifest.database_dump_digest && (!fs.existsSync(path.join(directory, "database.sql")) || fileDigest(path.join(directory, "database.sql")) !== manifest.database_dump_digest)) F.fail("BACKUP_CHECKSUM_MISMATCH");
  for (const resource of manifest.resources) { const relative = path.relative(manifest.source_root, resource.source); if (relative.startsWith("..") || !manifest.inventory.some((value) => value.path === relative && value.type === "directory")) F.fail("BACKUP_RESOURCE_MISSING"); }
  const required = ["deployment-owner.json", "resources.json", "active.json", ...manifest.fingerprints.map((value) => `secrets/${value.ref.resource}/${value.ref.key}/current.json`), ...(composition.plan.inputs.spec.tls?.provider === "local" ? ["tls/ca.pem", "tls/issuer.json", "tls/leaf.json"] : []), ...(composition.plan.inputs.spec.dns.mode === "local" ? ["dns-state/infra-zone.json"] : [])];
  if (required.some((file) => !manifest.inventory.some((value) => value.path === file && value.type === "file"))) F.fail("BACKUP_RESOURCE_MISSING");
  return manifest;
}
async function restoreDeployment(directory, composition, context) {
  composition = require("./composition").verifyComposition(composition);
  if (context?.authorized !== true || context.create_resources !== true || !S.resourcePath(context.root)) F.fail("RESTORE_OPERATION_NOT_AUTHORIZED");
  const manifest = validateBackup(directory, composition.distribution.schema_versions, context);
  if (composition.instance_id !== manifest.owner || composition.project === manifest.project || composition.plan.effective_domain !== manifest.composition.plan.effective_domain) F.fail("RESTORE_IDENTITY_MISMATCH");
  for (const name of ["database", "redis", "dns", "mail", "dkim"]) if (composition.compose.services[name]?.image !== manifest.composition.compose.services[name]?.image) F.fail("RESTORE_ENGINE_IMAGE_MISMATCH");
  if (S.contains(manifest.source_root, context.root) || S.contains(context.root, manifest.source_root)) F.fail("RESTORE_ISOLATION_REQUIRED");
  if (Object.values(composition.compose.services).some((value) => (value.ports || []).some((binding) => !["127.0.0.1", "::1"].includes(binding.host_ip) || Number(binding.published) < 1024))) F.fail("RESTORE_ISOLATION_REQUIRED");
  if (fs.existsSync(context.root) && fs.readdirSync(context.root).length) F.fail("RESTORE_DESTINATION_OCCUPIED");
  const source_ids = manifest.resources.map((value) => value.id).sort(); if (S.serialize(source_ids) !== S.serialize(composition.resources.map((value) => value.id).sort())) F.fail("RESTORE_RESOURCE_MISMATCH");
  if (composition.resources.some((value) => path.relative(context.root, value.source) !== path.relative(manifest.source_root, manifest.resources.find((entry) => entry.id === value.id).source))) F.fail("RESTORE_STORAGE_MAPPING_UNSUPPORTED");
  P.contextRoot(composition, context, true);
  const payload = path.join(directory, "payload"); copyState(composition, payload, context.root, prefixes.filter((name) => !["candidates", "journal"].includes(name)));
  const records = composition.resources.map((value) => ({ id: value.id, source: value.source, owner: composition.instance_id })); F.atomic(path.join(context.root, "resources.json"), JSON.stringify(records));
  F.atomic(path.join(context.root, "restored-from.json"), JSON.stringify({ backup_id: manifest.id, manifest_digest: manifest.digest, source_revision: manifest.source_revision, schema_versions: manifest.schema_versions }));
  const prepared = await P.prepareDeployment(composition, context);
  if (S.serialize(prepared.fingerprints) !== S.serialize(manifest.fingerprints) || (manifest.certificate?.ca_fingerprint && prepared.certificate?.ca_fingerprint !== manifest.certificate.ca_fingerprint) || prepared.zone?.zone_digest !== manifest.zone?.zone_digest) F.fail("RESTORED_IDENTITY_MISMATCH");
  J.append(context.root, "restore-prepared", prepared.revision, { backup_id: manifest.id }); return { prepared, restored: true, activated: false, kernel_recovery_verified: false, source_revision: manifest.source_revision };
}
async function rollbackDeployment(root, revision, context) {
  const current = A.readActive(root); if (!current || !/^[a-f0-9]{64}$/.test(revision || "") || context?.authorized !== true) F.fail("ROLLBACK_OPERATION_NOT_AUTHORIZED");
  const prior = JSON.parse(F.read(path.join(root, "candidates", revision, "prepared.json")));
  const change = A.classifyChanges(current, prior); if (!change.compatible || change.categories.includes("image-upgrade")) F.fail("INCOMPATIBLE_ROLLBACK");
  // Schema equality and matching secret generations are mandatory. This API
  // never pretends an image/config switch rolls back a migrated database.
  return A.activateDeployment(prior, { ...context, recover: true });
}
function validateBackupEvidence(evidence, active, context) {
  if (!S.plainTree(evidence) || !S.record(evidence) || Object.keys(evidence).some((key) => !["directory", "manifest_digest"].includes(key)) || !S.resourcePath(evidence.directory)) F.fail("VERIFIED_BACKUP_REQUIRED");
  const manifest = validateBackup(evidence.directory, active.prepared.composition.distribution.schema_versions, context);
  if (manifest.digest !== evidence.manifest_digest || manifest.source_revision !== active.revision || manifest.owner !== active.prepared.instance_id) F.fail("VERIFIED_BACKUP_REQUIRED"); return manifest;
}
module.exports = { stopDeployment, backupDeployment, validateBackup, validateBackupEvidence, restoreDeployment, rollbackDeployment, copyState };
