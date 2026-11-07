"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const S = require("../../lib/spec");
const P = require("../../lifecycle/preparation");
const { checkObserved } = require("../../lifecycle/activation");
const { composeDeployment } = require("../../lifecycle/composition");
const { applicationInputs } = require("../support/application-inputs");

test("ordinal comparator preserves historical string ordering and duplicates", () => {
  const values = ["2", "10", "a", "Z", "é", "a", "😀", "\uffff", "prefix-1", "prefix"];
  assert.deepEqual(values.toSorted(S.lexical), values.toSorted());
  assert.deepEqual(values.toReversed().toSorted(S.lexical), values.toSorted());
});

test("preparation accepts reordered exact registry keys and refuses extra, missing and duplicate records", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qg02-registry-"));
  try {
    const input = applicationInputs();
    const composition = composeDeployment(input.plan(), input.distribution);
    const context = { root, authorized: true, create_resources: true, driver: { checkImages() { return {}; }, inventory() { return []; }, prepareOwnership() {} } };
    P.contextRoot(composition, context, true);
    const record = { source: root + "/durable/sample", owner: composition.instance_id, id: "sample" };
    const write = records => fs.writeFileSync(path.join(root, "resources.json"), JSON.stringify(records), { mode: 0o600 });
    write([record]);
    await P.prepareDeployment(composition, context);
    write([{ id: record.id, source: record.source, owner: record.owner }]);
    await P.prepareDeployment(composition, context);
    for (const records of [[{ ...record, extra: "refuse" }], [{ id: record.id, owner: record.owner }], [record, record]]) {
      write(records);
      await assert.rejects(() => P.prepareDeployment(composition, context), { code: "RESOURCE_OWNERSHIP_MISMATCH" });
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("observed exposure comparison preserves order independence and binding multiplicity", () => {
  const image = "sha256:" + "a".repeat(64);
  const binding = { target: 3101, protocol: "tcp", host_ip: "127.0.0.1", published: 30001 };
  const second = { ...binding, target: 3102, published: 30002 };
  const service = { image, ports: [binding, second], volumes: [] };
  const prepared = { project: "probe", revision: "r", compose: { services: { application: service } } };
  const observed = { service: "application", owner: "probe", project: "probe", image, image_id: image, revision: "r", ports: { "3102/tcp": [{ HostIp: "127.0.0.1", HostPort: "30002" }], "3101/tcp": [{ HostIp: "127.0.0.1", HostPort: "30001" }] } };
  const check = () => checkObserved(prepared, observed, { [image]: image });
  check(); service.ports.reverse(); check();
  observed.ports["3101/tcp"].push({ ...observed.ports["3101/tcp"][0] });
  assert.throws(check, { code: "UNEXPECTED_SERVICE_EXPOSURE" });
  service.ports.push(binding); check();
  observed.ports["3101/tcp"].pop();
  assert.throws(check, { code: "UNEXPECTED_SERVICE_EXPOSURE" });
  service.ports.pop();
  observed.ports["3101/tcp"][0].HostIp = "0.0.0.0";
  assert.throws(check, { code: "UNEXPECTED_SERVICE_EXPOSURE" });
});

const fields = [
  ["command", (app, value) => { app.command = ["node", value]; }, "INVALID_DISTRIBUTION_SERVICE"],
  ["entrypoint", (app, value) => { app.entrypoint = [value]; }, "INVALID_DISTRIBUTION_SERVICE"],
  ["readiness", (app, value) => { app.healthcheck.test = ["CMD", "node", value]; }, "KERNEL_READINESS_CONTRACT_REQUIRED"],
  ["environment", (app, value) => { app.environment = { BANNER: value }; }, "SECRET_VALUE_FORBIDDEN"]
];
for (const [name, assign, code] of fields) {
  for (const [control, value] of [["NUL", "\0"], ["CR", "\r"], ["LF", "\n"]]) {
    test(`${name} rejects ${control} with its existing diagnostic`, () => {
      const input = applicationInputs(); assign(input.distribution.application, "before" + value + "after");
      assert.throws(() => composeDeployment(input.plan(), input.distribution), { code });
    });
  }
  test(`${name} retains accepted empty strings and other control characters`, () => {
    for (const value of ["", "tab\tvalue", "other\x01\v\fvalue", "unicode-é😀"]) {
      const input = applicationInputs(); assign(input.distribution.application, value);
      assert.doesNotThrow(() => composeDeployment(input.plan(), input.distribution));
    }
  });
}
