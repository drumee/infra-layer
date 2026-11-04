"use strict";
const assert = require("node:assert/strict"), { test } = require("node:test"), fs = require("node:fs"), path = require("node:path"), cp = require("node:child_process"), os = require("node:os");
const M = require("./mounts.cjs"), O = require("./ownership.cjs");
const raw = (name = "one") => ({ Type: "volume", Name: name, Source: "/var/lib/docker/volumes/" + name + "/_data", Destination: "/" + name, Driver: "local", RW: false, Mode: "", Propagation: "" });
const a = M.projectMount(raw()), b = M.projectMount(raw("two")), c = M.projectMount(raw("three"));
const mismatch = (expected, observed) => assert.throws(() => M.assertMountsEqual(expected, observed), { code: "MOUNT_MULTISET_MISMATCH" });
const invalid = (expected, observed) => assert.throws(() => M.assertMountsEqual(expected, observed), { code: "INVALID_MOUNT_EVIDENCE" });
test("D1 identical arrays", () => M.assertMountsEqual([a, b], [a, b]));
test("D2 reverse order", () => M.assertMountsEqual([a, b], [b, a]));
test("D3 arbitrary permutation", () => M.assertMountsEqual([a, b, c], [c, a, b]));
test("D4 duplicate-preserving permutation", () => M.assertMountsEqual([a, a, b], [b, a, a]));
test("D5 empty collections", () => M.assertMountsEqual([], []));
const oldRoot = path.resolve(__dirname, "../../../docs/evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/campaign-1");
const before = JSON.parse(fs.readFileSync(path.join(oldRoot, "before.json"))), after = JSON.parse(fs.readFileSync(path.join(oldRoot, "after.json")));
test("D6 exact historical F1 failure: ordered assertion fails; explicit projected multiset replay passes", () => {
  assert.throws(() => assert.deepEqual(after, before), { code: "ERR_ASSERTION" });
  M.assertHistoricalInventoryEqual(before, after);
  // Missing current access evidence is never implicitly accepted as legacy.
  assert.throws(() => M.assertInventoryEqual(before, after), { code: "INVALID_MOUNT_EVIDENCE" });
});
test("D7 additional mount", () => mismatch([a], [a, b]));
test("D8 missing mount", () => mismatch([a, b], [a]));
test("D9 extra duplicate", () => mismatch([a, b], [a, a, b]));
test("D10 missing duplicate", () => mismatch([a, a, b], [a, b]));
test("D11 different source", () => mismatch([a], [{ ...a, source_hash: O.digest("other-source") }]));
test("D12 different destination", () => mismatch([a], [{ ...a, destination: "/other" }]));
test("D13 different mount type", () => mismatch([a], [{ ...a, type: "bind", name: null, driver: null }]));
test("D14 read-only versus read-write", () => mismatch([a], [{ ...a, rw: true }]));
test("D15 different access mode", () => mismatch([a], [{ ...a, mode: "ro,z" }]));
test("D16 different propagation", () => mismatch([a], [{ ...a, propagation: "rshared" }]));
test("D17 different volume identity", () => mismatch([a], [{ ...a, name: "another-volume" }]));
test("D18 unknown additional mount", () => mismatch([a, b], [a, b, c]));
test("D19 incomplete and malformed current records fail even when both sides match", () => {
  for (const key of Object.keys(a)) { const bad = { ...a }; delete bad[key]; invalid([bad], [bad]); }
  for (const bad of [{ ...a, name: "" }, { ...a, destination: "relative" }, { ...a, source_hash: "bad" }, { ...a, rw: "false" }, { ...a, mode: null }, { ...a, propagation: null }, { ...a, driver: "" }, { ...a, extra: "unknown" }]) invalid([bad], [bad]);
});
test("D20 invalid collections, entries and sparse arrays", () => {
  for (const bad of [null, {}, "mount", [null], ["mount"], new Array(1)]) invalid(bad, bad);
});
function freeze(value) { if (value && typeof value === "object") { Object.freeze(value); Object.values(value).forEach(freeze); } return value; }
test("D21 frozen inputs and original order survive success and mismatch", () => {
  const x = freeze(structuredClone([a, b, a])), y = freeze(structuredClone([b, a, a]));
  const initial = JSON.stringify([x, y]); M.assertMountsEqual(x, y); mismatch(x, [a]); assert.equal(JSON.stringify([x, y]), initial);
});
test("D22 equal count unequal contents", () => mismatch([a, b], [a, c]));
test("D23 bounded diagnostic fidelity with hashes, counts and changed attributes", () => {
  assert.throws(() => M.assertMountsEqual([a], [{ ...a, rw: true }]), e => {
    assert.equal(e.code, "MOUNT_MULTISET_MISMATCH"); assert.deepEqual(e.details.changed_fields, ["rw"]);
    assert.equal(e.details.missing[0].expected_count, 1); assert.equal(e.details.missing[0].observed_count, 0);
    assert.equal(e.details.additional[0].observed_count, 1); assert.equal(e.message.includes(a.destination), false); return true;
  });
  assert.throws(() => M.assertMountsEqual([a], [a, a]), e => e.details.additional[0].expected_count === 1 && e.details.additional[0].observed_count === 2);
  assert.throws(() => M.assertMountsEqual([], Array.from({ length: 30 }, (_, i) => ({ ...a, name: "v" + i }))), e => e.details.additional.length === 8 && e.details.additional_identities === 30 && e.message.length < 3000);
});
test("D24 genuine mismatch throws through caller and preserves prior failure independently", () => {
  const main = { code: "FIRST_FAILURE" }; let cleanupError;
  try { M.assertMountsEqual([a], [b]); } catch (error) { cleanupError = error; }
  assert.equal(cleanupError.code, "MOUNT_MULTISET_MISMATCH");
  const result = O.outcome(main, [cleanupError], [], []);
  assert.equal(result.primary_error, "FIRST_FAILURE"); assert.deepEqual(result.cleanup_errors, ["MOUNT_MULTISET_MISMATCH"]); assert.equal(result.campaign, "FAIL");
});
const inventory = mounts => ({ daemon: { id: "engine", context: "default", endpoint: "unix:///var/run/docker.sock" }, volumes: [{ name: "v", metadata_hash: "volume" }], containers: [{ id: "id", name: "/c", ownership_hash: "owner", networks_hash: "network", mounts }], networks: [{ id: "n", metadata_hash: "network" }] });
test("current inventory path permits only mount permutation and does not mutate", () => {
  const x = freeze(inventory([a, b])), y = freeze(inventory([b, a])); M.assertInventoryEqual(x, y);
  assert.deepEqual(x.containers[0].mounts, [a, b]);
});
for (const [label, change] of [
  ["container identity", v => { v.containers[0].id = "other"; }],
  ["container ownership", v => { v.containers[0].ownership_hash = "other"; }],
  ["container network", v => { v.containers[0].networks_hash = "other"; }],
  ["volume metadata", v => { v.volumes[0].metadata_hash = "other"; }],
  ["network metadata", v => { v.networks[0].metadata_hash = "other"; }],
  ["daemon", v => { v.daemon.id = "other"; }],
  ["context", v => { v.daemon.context = "other"; }],
  ["endpoint", v => { v.daemon.endpoint = "other"; }],
  ["missing container", v => { v.containers.pop(); }],
  ["extra container", v => { v.containers.push(structuredClone(v.containers[0])); }]
]) test("inventory rejects " + label, () => { const x = inventory([a, b]), y = structuredClone(x); change(y); assert.throws(() => M.assertInventoryEqual(x, y), { code: "ERR_ASSERTION" }); });
test("inventory mismatch and malformed mounts propagate through actual helper", () => {
  assert.throws(() => M.assertInventoryEqual(inventory([a]), inventory([b])), { code: "MOUNT_MULTISET_MISMATCH" });
  assert.throws(() => M.assertInventoryEqual(inventory([{}]), inventory([{}])), { code: "INVALID_MOUNT_EVIDENCE" });
});
test("raw Docker projection preserves required fields and rejects absent evidence", () => {
  assert.equal(a.source_hash, O.digest(raw().Source)); assert.equal(a.rw, false);
  for (const field of ["Source", "Type", "Name", "Destination", "Driver", "RW", "Mode", "Propagation"]) {
    const bad = raw(); delete bad[field]; assert.throws(() => M.projectMount(bad), { code: "INVALID_MOUNT_EVIDENCE" });
  }
  const bind = M.projectMount({ ...raw(), Type: "bind" }); assert.equal(bind.name, null); assert.equal(bind.driver, null);
  const tmpfs = M.projectMount({ ...raw(), Type: "tmpfs", Source: "" }); assert.equal(tmpfs.source_hash, O.digest(""));
});
test("actual adapter inventory captures full mounts in raw order using deterministic Docker double", () => {
  const { createDocker } = require("./docker.cjs"), directory = fs.mkdtempSync(path.join(os.tmpdir(), "v1-f2-adapter-"));
  const original = cp.execFileSync;
  const mounts = [raw("two"), raw()];
  cp.execFileSync = (executable, args) => {
    assert.ok(path.isAbsolute(executable)); const command = args.slice(2);
    const key = command.slice(0, 2).join(" ");
    if (key === "context show") return "default\n";
    if (key === "info --format") return '"engine"\n';
    if (key === "context inspect") return '"unix:///var/run/docker.sock"\n';
    if (key === "volume ls" || key === "network ls") return "";
    if (key === "ps -aq") return "container\n";
    assert.equal(key, "container inspect");
    return JSON.stringify({ Id: "container", Name: "/c", Config: { Labels: {} }, Mounts: mounts, NetworkSettings: { Networks: {} } }) + "\n";
  };
  try {
    const actual = createDocker(directory).inventory();
    assert.deepEqual(actual.containers[0].mounts, mounts.map(M.projectMount));
    M.assertInventoryEqual(actual, { ...actual, containers: [{ ...actual.containers[0], mounts: actual.containers[0].mounts.slice().reverse() }] });
    assert.equal(actual.containers[0].mounts[0].name, "two");
  } finally { cp.execFileSync = original; fs.rmSync(directory, { recursive: true }); }
});
test("existing program-fingerprint infrastructure seals active campaign comparison paths and rejects bypasses", () => {
  const guard = require("../../support/harness-preservation.cjs");
  const source = fs.readFileSync(path.join(__dirname, "campaign.cjs"), "utf8");
  const approved = "c109f34526bd257c3088b362f028ae40402a938dedb4be47673eb1931c22f758";
  const verify = text => assert.equal(guard.programFingerprint(text), approved);
  verify(source);
  for (const call of ["assertMountsEqual(expectedMounts, observedMounts);", "assertMountsEqual(expectedMounts, observedMounts.slice().reverse());", "assertInventoryEqual(before, after);"]) {
    assert.ok(source.includes(call));
    for (const replacement of ["false && " + call, "true || " + call, "function uncalled() { " + call + " }", "try { " + call + " } catch (error) { console.log(error.code); }", "void 0;"]) {
      assert.throws(() => verify(source.replace(call, replacement)), { code: "ERR_ASSERTION" });
    }
  }
});
