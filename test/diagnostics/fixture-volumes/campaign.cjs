"use strict";
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const { createDocker } = require("./docker.cjs"), O = require("./ownership.cjs");
const { projectMount, assertMountsEqual, assertInventoryEqual } = require("./mounts.cjs");
const evidence = path.resolve(__dirname, "../../../docs/evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2");
const baseline = JSON.parse(fs.readFileSync(path.join(evidence, "baseline.json")));
const approval = JSON.parse(fs.readFileSync(path.join(evidence, "preflight-approved.json")));
assert.equal(approval.attempt, baseline.attempt); assert.equal(approval.status, "PASS");
for (const [file, sha] of Object.entries(approval.harness_sha256)) assert.equal(crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"), sha);
const directory = path.join(baseline.private_directory, "campaign"); fs.mkdirSync(directory, { mode: 0o700 });
const D = createDocker(directory), write = (name, value) => fs.writeFileSync(path.join(directory, name + ".json"), JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
const started = new Date().toISOString(), attempt = baseline.attempt, nonce = crypto.randomBytes(24).toString("hex");
const project = "drumee-v1-" + crypto.randomBytes(12).toString("hex"), volumeName = project + "-data", containerName = project + "-consumer";
const result = { attempt, project, started, expected_refusals: [], volume_deletions: [], historical_volume_deletions: 0, errors: [] };
fs.writeFileSync(path.join(evidence, "campaign-start.json"), JSON.stringify({ attempt, project, started, volumeName, containerName }) + "\n", { flag: "wx", mode: 0o600 });
const before = D.inventory(); write("before", before); assert.deepEqual(before.daemon, approval.daemon);
assert.equal(before.volumes.some(v => v.name === volumeName), false); assert.equal(before.containers.some(c => c.name === "/" + containerName), false);
const manifest = { version: 1, type: "V1_CURRENT_ATTEMPT", attempt, started, daemon: before.daemon, volumes: [], containers: [] };
const removals = [], cleanupErrors = []; let primary, containerRemoved = false;
const labels = ["--label", "org.drumee.qualification=" + attempt, "--label", "org.drumee.infra.owner=" + attempt, "--label", "org.drumee.volume.nonce=" + nonce, "--label", "com.docker.compose.project=" + project];
function verifyContainer(entry) {
  assert.deepEqual(D.daemon(), manifest.daemon);
  const raw = JSON.parse(D.run(["container", "inspect", "--format", "{{json .}}", entry.id]));
  assert.equal(raw.Id, entry.id); assert.equal(raw.Name, "/" + containerName);
  assert.equal(raw.Config.Labels["org.drumee.qualification"], attempt); assert.equal(raw.Config.Labels["org.drumee.infra.owner"], attempt); assert.equal(raw.Config.Labels["org.drumee.volume.nonce"], nonce);
  assert.equal(raw.Config.Labels["com.docker.compose.project"], project); assert.equal(raw.Image, approval.image.id);
  assert.equal(raw.Mounts.length, 1); assert.equal(raw.Mounts[0].Name, volumeName); assert.equal(raw.Mounts[0].Type, "volume"); assert.equal(raw.Mounts[0].Destination, "/fixture");
  const expectedMounts = [{ type: "volume", name: volumeName, destination: "/fixture", source_hash: manifest.volumes[0].identity.mountpoint_hash, driver: "local", rw: false, mode: "", propagation: "" }];
  const observedMounts = raw.Mounts.map(projectMount);
  write("mount-observation-" + D.commandCount(), { container: entry.id, expected: expectedMounts, observed: observedMounts });
  assertMountsEqual(expectedMounts, observedMounts);
  return raw;
}
function cleanupContainer() {
  if (!manifest.containers.length || containerRemoved) return;
  const entry = manifest.containers[0], raw = verifyContainer(entry);
  if (raw.State.Running) { D.run(["stop", "--time", "2", entry.id]); assert.equal(verifyContainer(entry).State.Running, false); }
  D.run(["rm", entry.id]); containerRemoved = true;
  assert.equal(D.run(["ps", "-aq", "--no-trunc"]).split("\n").includes(entry.id), false);
}
try {
  const createStarted = new Date().toISOString();
  assert.deepEqual(D.daemon(), manifest.daemon);
  assert.equal(D.run(["volume", "create", "--driver", "local", ...labels, volumeName]), volumeName);
  const createEnded = new Date().toISOString(), creationSequence = D.commandCount(), volume = D.volume(volumeName);
  assert.ok(volume); assert.equal(volume.driver, "local");
  manifest.volumes.push({ type: "volume", name: volumeName, attempt, nonce, disposition: "disposable", fingerprint: O.digest(volume), identity: volume, creation: { operation: "volume.create", name: volumeName, attempt, nonce, daemon: manifest.daemon, started: createStarted, ended: createEnded, exit_code: 0, command_seq: creationSequence } });
  write("manifest", manifest);
  const request = { type: "volume", action: "remove-exact", name: volumeName };
  assert.equal(O.assess(manifest, request, D.observe(volumeName)).disposition, "ELIGIBLE");
  const id = D.run(["create", "--name", containerName, ...labels, "--network", "none", "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true", "--pids-limit", "32", "--memory", "64m", "--user", process.getuid() + ":" + process.getgid(), "--interactive", "--mount", "type=volume,source=" + volumeName + ",target=/fixture,readonly", approval.image.reference, "node", "-e", "process.on('SIGTERM',()=>process.exit(0)); process.stdin.resume();"]);
  assert.match(id, /^[a-f0-9]{64}$/); manifest.containers.push({ id, name: containerName, attempt, creation_command_seq: D.commandCount() }); write("manifest", manifest);
  function refusal(phase) {
    const snapshot = D.observe(volumeName); assert.equal(snapshot.consumers.length, 1); assert.equal(snapshot.consumers[0].id, id);
    assert.throws(() => O.cleanup(manifest, request, D, removals), { code: "VOLUME_IN_USE" });
    result.expected_refusals.push({ phase, code: "VOLUME_IN_USE", snapshot }); write("progress", result);
  }
  verifyContainer(manifest.containers[0]); refusal("created-not-started");
  D.run(["start", id]); assert.equal(verifyContainer(manifest.containers[0]).State.Running, true); refusal("running");
  D.run(["stop", "--time", "2", id]); assert.equal(verifyContainer(manifest.containers[0]).State.Running, false); refusal("stopped");
  cleanupContainer();
  const free = D.observe(volumeName); assert.deepEqual(free.consumers, []); write("unreferenced", free);
  // Controlled failure is injected before any removal call, on the actual owned
  // snapshot. It must preserve the original exception and leave the volume intact.
  const injected = Object.assign(new Error("CONTROLLED_REMOVE_FAILURE"), { code: "CONTROLLED_REMOVE_FAILURE" });
  assert.throws(() => O.cleanup(manifest, request, { observe: D.observe, removeExact() { throw injected; } }, removals), error => error === injected);
  assert.ok(D.volume(volumeName)); assert.deepEqual(removals, []);
  result.failure_injection = { code: injected.code, visible: true, docker_remove_issued: false };
} catch (error) { primary = error; }
finally {
  try { cleanupContainer(); } catch (error) { cleanupErrors.push(error); }
  for (const entry of manifest.volumes) {
    try { const disposition = O.cleanup(manifest, { type: "volume", action: "remove-exact", name: entry.name }, D, removals); result.volume_deletions.push({ name: entry.name, disposition }); }
    catch (error) { cleanupErrors.push(error); }
  }
  write("removals", removals);
  try {
    const after = D.inventory(); write("after", after); assertInventoryEqual(before, after);
    result.inventory_reconciliation = "EXACT_METADATA_MOUNT_MULTISET_MATCH";
  } catch (error) { cleanupErrors.push(error); }
  Object.assign(result, O.outcome(primary, cleanupErrors, manifest.volumes.map(v => v.name), removals));
  if (!manifest.volumes.length || !manifest.containers.length) result.campaign = "FAIL";
  result.container_removed = containerRemoved; result.finished = new Date().toISOString(); result.commands = D.commandCount();
  result.errors = [primary, ...cleanupErrors].filter(Boolean).map(e => ({ code: e.code || e.name, frames: String(e.stack || "").split("\n").slice(1, 6) }));
  write("result", result); console.log(JSON.stringify(result, null, 2));
}
if (primary || cleanupErrors.length || result.campaign !== "PASS") process.exitCode = 1;
