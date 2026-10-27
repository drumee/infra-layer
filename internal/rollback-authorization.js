"use strict";
const path = require("node:path");
const F = require("../lib/filesystem-safety");
const P = require("../lifecycle/preparation");
function authorizeRollback(prepared, observed, prior, pending, context, driver, checkObserved) {
  if (context.authorized !== true || !prior || pending?.phase !== "recovery-required" || !/^[a-f0-9]{64}$/.test(pending.revision || "") || !observed.length) F.fail("ROLLBACK_OPERATION_NOT_AUTHORIZED");
  const candidates = new Map();
  for (const revision of new Set([prior.revision, pending.revision])) {
    const source = JSON.parse(F.read(path.join(prepared.root, "candidates", revision, "prepared.json")));
    P.verifyPrepared(source, context, driver);
    if (source.revision !== revision || source.root !== prepared.root || source.project !== prepared.project || source.instance_id !== prepared.instance_id) F.fail("RUNTIME_IDENTITY_MISMATCH");
    candidates.set(revision, { source, images: driver.checkImages(source.composition) });
  }
  if (new Set(observed.map(value => value.service)).size !== observed.length) F.fail("DUPLICATE_SERVICE_IDENTITY");
  for (const resource of observed) {
    const candidate = candidates.get(resource.revision);
    if (!candidate || resource.name !== `/${prepared.project}-${resource.service}-1` || !Object.hasOwn(prepared.compose.services, resource.service)) F.fail("RUNTIME_IDENTITY_MISMATCH");
    if (resource.role !== candidate.source.compose.services[resource.service]?.labels?.["org.drumee.infra.role"]) F.fail("RUNTIME_IDENTITY_MISMATCH");
    checkObserved(candidate.source, resource, candidate.images);
  }
  // The adapter rechecks the exact ID/state snapshot and complete network set.
  driver.authorizeRecoveryNetworks(prepared.composition, observed);
}
module.exports = { authorizeRollback };
