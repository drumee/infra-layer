"use strict";
const fs = require("node:fs");
const path = require("node:path");
const S = require("../lib/spec");
const F = require("../lib/filesystem-safety");
const C = require("./composition");
const J = require("./journal");
const D = require("./docker");
const secrets = require("../capabilities/secrets");
function contextRoot(composition, context, create = false) {
  if (context?.authorized !== true || !S.resourcePath(context.root)) F.fail("LIFECYCLE_OPERATION_NOT_AUTHORIZED");
  F.privateDirectory(context.root, create);
  const file = path.join(context.root, "deployment-owner.json");
  const expected = { contract_version: "1", project: composition.project, instance_id: composition.instance_id, uid: process.getuid() };
  if (fs.existsSync(file)) { let owner; try { owner = JSON.parse(F.read(file)); } catch (_) { F.fail("DEPLOYMENT_OWNERSHIP_MISMATCH"); } if (S.serialize(owner) !== S.serialize(expected)) F.fail("DEPLOYMENT_OWNERSHIP_MISMATCH"); }
  else { if (!create || context.create_resources !== true || fs.readdirSync(context.root).length) F.fail("UNOWNED_DEPLOYMENT_DIRECTORY"); F.atomic(file, JSON.stringify(expected), 0o600, true); }
  return context.root;
}
function resources(composition, root, context) {
  const file = path.join(root, "resources.json"); let existing = [];
  if (fs.existsSync(file)) { try { existing = JSON.parse(F.read(file)); } catch (_) { F.fail("RESOURCE_OWNERSHIP_MISMATCH"); } if (!S.plainTree(existing) || !Array.isArray(existing)) F.fail("RESOURCE_OWNERSHIP_MISMATCH"); }
  for (const resource of composition.resources) {
    if (!S.contains(root, resource.source) || resource.source === root || !S.contains(path.join(root, "durable"), resource.source)) F.fail("RESOURCE_OUTSIDE_DEPLOYMENT_ROOT");
    const record = existing.find((value) => value.id === resource.id);
    if (record && record.source !== resource.source) F.fail("PERSISTENT_RESOURCE_MOVE_FORBIDDEN");
    F.directory(path.dirname(resource.source), context.create_resources === true);
    const stat = fs.lstatSync(resource.source, { throwIfNoEntry: false });
    if (stat && (!stat.isDirectory() || stat.isSymbolicLink())) F.fail("UNSAFE_RESOURCE_PATH");
    if (stat && !record && fs.readdirSync(resource.source).length) F.fail("UNOWNED_PERSISTENT_RESOURCE");
    if (!record && context.create_resources !== true) F.fail("PERSISTENT_RESOURCE_MISSING");
    if (!stat) { if (context.create_resources !== true) F.fail("PERSISTENT_RESOURCE_MISSING"); fs.mkdirSync(resource.source, { mode: 0o700 }); }
    if (!record) existing.push({ id: resource.id, source: resource.source, owner: composition.instance_id });
  }
  F.atomic(file, JSON.stringify(existing)); return existing;
}
function projectionRecords(composition) {
  const records = [...composition.projections]; const input = composition.plan.inputs.adapter_input;
  for (const [service_name, service] of Object.entries(composition.compose.services)) for (const mount of service.volumes || []) {
    const declared = input.resource_sources.find((entry) => entry.source === mount.source) || input.gateway?.tls_views?.find((entry) => entry.source === mount.source);
    if (!declared) continue;
    const uid = Number(service.user.split(":")[0]); const gid = Number(service.user.split(":")[1]);
    const descriptor = composition.plan.required_secrets.find((entry) => S.serialize(entry.ref) === S.serialize(declared.ref));
    const type = descriptor?.type || "public-certificate";
    const path = `secrets/${service_name}-${S.digest({ ref: declared.ref, target: mount.target }).slice(0, 24)}.value`;
    records.push({ ref: declared.ref, consumer: service_name, target: mount.target, format: "raw", uid, gid, path, service: service_name, type, original_source: mount.source });
  }
  const database = composition.plan.inputs.spec.database;
  if (database?.mode === "managed") records.push({ ref: database.service_secret_ref, consumer: "database-client", target: "/run/secrets/database-service", format: "raw", uid: 0, gid: 0, path: "secrets/database-service.value", service: "database" });
  return records;
}
function materializedCompose(composition, revision) {
  const compose = S.clone(composition.compose);
  for (const projection of projectionRecords(composition)) {
    let mount = compose.services[projection.service].volumes.find((value) => value.target === projection.target);
    if (!mount) { mount = { type: "bind", target: projection.target, read_only: true, bind: { create_host_path: false } }; compose.services[projection.service].volumes.push(mount); }
    mount.source = "./" + projection.path;
  }
  for (const service of Object.values(compose.services)) service.labels["org.drumee.infra.revision"] = revision;
  return compose;
}
async function prepareDeployment(composition, context) {
  composition = C.verifyComposition(composition); const root = contextRoot(composition, context, true); const driver = context.driver || D;
  return F.lockAsync(root, async () => {
    J.readJournal(root); driver.checkImages(composition); resources(composition, root, context);
    for (const resource of composition.resources) {
      const service = Object.entries(composition.plan.inputs.adapter_input.services).find(([, value]) => value.data_source === resource.source);
      const uid = service ? service[0] === "database" ? 999 : service[1].uid : resource.uid; const gid = service ? service[0] === "database" ? 999 : service[1].gid : resource.gid;
      driver.helper(composition, resource.source, "const fs=require('fs');const s=fs.lstatSync('/work');if(!s.isDirectory()||s.isSymbolicLink())throw Error('unsafe');if(s.uid!==Number(process.argv[1])||s.gid!==Number(process.argv[2]))fs.chownSync('/work',Number(process.argv[1]),Number(process.argv[2]));", [String(uid), String(gid)], true);
    }
    const store = secrets.createFilesystemSecretStore(path.join(root, "secrets"), composition.instance_id);
    for (const descriptor of composition.plan.required_secrets) {
      let present = false; try { store.inspect(descriptor.ref); present = true; } catch (error) { if (error.code !== "SECRET_MISSING") throw error; }
      if (present) { store.ensure(descriptor); continue; }
      let imported = (context.imports || []).find((value) => S.serialize(value.ref) === S.serialize(descriptor.ref));
      const tls = composition.plan.inputs.spec.tls;
      if (tls?.provider === "provided" && S.serialize(tls.private_key_ref) === S.serialize(descriptor.ref)) imported = { file: composition.plan.inputs.adapter_input.resource_sources.find((value) => S.serialize(value.ref) === S.serialize(descriptor.ref))?.source };
      if (imported) store.import(descriptor, F.read(imported.file), { authorized: context.create_resources === true });
      else store.ensure(descriptor, { authorized: context.create_resources === true });
    }
    const original = composition; let tls_material;
    const spec = S.clone(composition.plan.inputs.spec);
    if (spec.mail?.dkim) { spec.mail.dkim.public_key = require("../capabilities/mail").dkimRecord(spec.mail.dkim.domain, spec.mail.dkim.selector, store, spec.mail.dkim.key_ref).public_key; const plan = require("../lib/plan").planInfrastructure(spec, composition.plan.inputs.requirements, composition.plan.inputs.adapter_input); composition = C.composeDeployment(plan, composition.distribution); }
    if (spec.tls) {
      if (spec.tls.provider === "local") tls_material = require("../capabilities/tls").prepareLocalCertificate({ owner: composition.instance_id, directory: path.join(root, "tls"), hostname: composition.plan.effective_domain, ca_key_ref: spec.tls.ca_key_ref, private_key_ref: spec.tls.private_key_ref, leaf_days: spec.tls.leaf_days, renew_before_days: spec.tls.renew_before_days }, store, { authorized: true, create_ca: context.create_resources === true, renew: context.renew_certificate === true });
      else if (spec.tls.provider === "provided") {
        const source = (ref) => composition.plan.inputs.adapter_input.resource_sources.find((value) => S.serialize(value.ref) === S.serialize(ref))?.source;
        const checked = require("../capabilities/tls").validateCertificate({ certificate: source(spec.tls.certificate_ref), key: source(spec.tls.private_key_ref), hostname: composition.plan.effective_domain, ca_bundle: source(spec.tls.ca_bundle_ref) }); tls_material = { ...checked, file: source(spec.tls.certificate_ref), ca_certificate_pem: F.read(source(spec.tls.ca_bundle_ref), false).toString() };
      } else F.fail("ACME_PREPARED_MATERIAL_REQUIRED");
    }
    let zone;
    if (spec.dns.mode === "local") zone = require("../capabilities/dns").prepareZone(composition.plan.effective_domain, spec.dns, spec.mail?.dkim, path.join(root, "dns-state"), { authorized: true, owner: composition.instance_id });
    const fingerprints = composition.plan.required_secrets.map((value) => store.inspect(value.ref));
    const revision = S.digest({ composition: composition.revision, fingerprints, certificate: tls_material?.fingerprint || null, zone: zone?.zone_digest || null });
    const candidate = path.join(root, "candidates", revision); F.privateDirectory(path.dirname(candidate), true);
    const manifest_file = path.join(candidate, "prepared.json");
    if (fs.existsSync(candidate)) { if (!fs.existsSync(manifest_file)) F.fail("PREPARATION_INCOMPLETE"); const saved = JSON.parse(F.read(manifest_file)); verifyPrepared(saved, context, driver); return saved; }
    F.privateDirectory(candidate, true); const projections = projectionRecords(composition); F.privateDirectory(path.join(candidate, "secrets"), true);
    require("../lib/rendering").renderPlan(composition.plan, candidate);
    if (tls_material) F.atomic(path.join(candidate, "ca-public.pem"), tls_material.ca_certificate_pem, 0o644);
    const compose = materializedCompose(composition, revision); const ownership = [];
    for (const projection of projections) {
      const destination = path.join(candidate, projection.path);
      const descriptor = composition.plan.required_secrets.find((value) => S.serialize(value.ref) === S.serialize(projection.ref));
      if (descriptor) {
        if (projection.format === "redis-client-config") {
          const directory = path.join(candidate, ".redis-client-" + S.digest(projection).slice(0, 16)); require("../capabilities/redis").materializeClientConfiguration(store, projection.ref, spec.redis.endpoint, directory, { authorized: true, owner: composition.instance_id }); F.atomic(destination, F.read(path.join(directory, "redis-config.json"))); fs.rmSync(directory, { recursive: true });
        } else { if (!descriptor.consumers.includes(projection.consumer)) F.fail("SECRET_CONSUMER_FORBIDDEN"); store.materialize(projection.ref, projection.consumer, destination); }
      } else if (spec.tls && S.serialize(projection.ref) === S.serialize(spec.tls.certificate_ref)) F.atomic(destination, F.read(tls_material.file, false));
      else if (spec.tls && S.serialize(projection.ref) === S.serialize(spec.tls.ca_bundle_ref)) F.atomic(destination, tls_material.ca_certificate_pem);
      else F.fail("UNRESOLVED_RESOURCE_REFERENCE");
      ownership.push({ path: projection.path, uid: projection.uid, gid: projection.gid, mode: descriptor ? 0o600 : 0o644 });
    }
    for (const service of Object.values(compose.services)) service.labels["org.drumee.infra.revision"] = revision;
    if (zone) {
      const target = composition.plan.inputs.adapter_input.services.dns.data_source; const content = F.read(path.join(root, "dns-state", zone.file));
      const adapter = composition.plan.inputs.adapter_input.services.dns;
      driver.helper(composition, target, "const fs=require('fs');const p='/work/'+process.argv[1];if(fs.existsSync(p)){if(!fs.readFileSync(p).equals(Buffer.from(process.argv[2],'base64')))throw Error('zone');}else fs.writeFileSync(p,Buffer.from(process.argv[2],'base64'),{mode:0o600});fs.chownSync(p,Number(process.argv[3]),Number(process.argv[4]));", [zone.file, content.toString("base64"), String(adapter.uid), String(adapter.gid)], true);
    }
    const compose_file = path.join(candidate, "deployment.compose.json"); F.atomic(compose_file, JSON.stringify(S.canonical(compose), null, 2) + "\n");
    const pre_inventory = driver.inventory(composition, candidate); driver.prepareOwnership(composition, ownership, candidate);
    const file_records = driver.inventory(composition, candidate); if (pre_inventory.filter((value) => value.type === "file").some((value) => file_records.find((entry) => entry.path === value.path)?.digest !== value.digest)) F.fail("PREPARATION_CONTENT_CHANGED");
    const prepared = { contract_version: "1", project: composition.project, instance_id: composition.instance_id, root, revision, desired_revision: original.plan_revision, composition, compose, compose_file, candidate, files: file_records, fingerprints, ...(tls_material ? { certificate: { fingerprint: tls_material.fingerprint, ca_fingerprint: tls_material.ca_fingerprint || null, expires_at: tls_material.expires_at, activation_required: true } } : {}), ...(zone ? { zone } : {}), prepared: true, activated: false };
    F.atomic(manifest_file, JSON.stringify(prepared)); J.append(root, "prepared", revision); return prepared;
  });
}
function verifyPrepared(prepared, context, driver = context.driver || D) {
  if (!S.plainTree(prepared) || prepared?.contract_version !== "1" || !/^[a-f0-9]{64}$/.test(prepared.revision || "") || !prepared.composition) F.fail("INVALID_PREPARED_DEPLOYMENT");
  const composition = C.verifyComposition(prepared.composition); const root = contextRoot(composition, context);
  if (root !== prepared.root || prepared.candidate !== path.join(root, "candidates", prepared.revision) || prepared.compose_file !== path.join(prepared.candidate, "deployment.compose.json")) F.fail("INVALID_PREPARED_DEPLOYMENT");
  const saved = JSON.parse(F.read(path.join(prepared.candidate, "prepared.json"))); if (S.serialize(saved) !== S.serialize(prepared)) F.fail("PREPARED_DEPLOYMENT_TAMPERED");
  if (S.digest({ composition: composition.revision, fingerprints: prepared.fingerprints, certificate: prepared.certificate?.fingerprint || null, zone: prepared.zone?.zone_digest || null }) !== prepared.revision || S.serialize(materializedCompose(composition, prepared.revision)) !== S.serialize(prepared.compose)) F.fail("PREPARED_DEPLOYMENT_TAMPERED");
  const text = JSON.stringify(S.canonical(prepared.compose), null, 2) + "\n";
  if (F.read(prepared.compose_file).toString() !== text) F.fail("PREPARED_DEPLOYMENT_TAMPERED");
  const current = driver.inventory(composition, prepared.candidate).filter((value) => value.path !== "prepared.json");
  if (S.serialize(current) !== S.serialize(prepared.files)) F.fail("PREPARED_CONFIGURATION_CHANGED");
  return prepared;
}
module.exports = { prepareDeployment, verifyPrepared, contextRoot, projectionRecords, materializedCompose };
