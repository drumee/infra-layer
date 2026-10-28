"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), os = require("node:os"), crypto = require("node:crypto"), { spawnSync, execFileSync } = require("node:child_process");
const { model, complete, terminal } = require("./model.cjs");
test("F1 original actual-module exit143 regression: defective exits1, corrected controlled lifecycle accepts", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "drumee-observer-regression-")); fs.chmodSync(directory, 0o700);
  const old = execFileSync("/usr/bin/git", ["show", "7b5edbd9e9731a51d558a9e11c7def2cfa6c6acb:test/diagnostics/services-capture/docker-events.cjs"]);
  assert.equal(crypto.createHash("sha256").update(old).digest("hex"), "d257d1c246e877473f78bbc4fcf33ad4f0b0e0dbaa8cb1cece13a4203afde78b");
  fs.mkdirSync(path.join(directory, "historical/services-capture"), { recursive: true }); fs.mkdirSync(path.join(directory, "historical/postfix-http"));
  fs.writeFileSync(path.join(directory, "historical/services-capture/docker-events.cjs"), old);
  fs.copyFileSync(path.join(__dirname, "../postfix-http/observe.cjs"), path.join(directory, "historical/postfix-http/observe.cjs"));
  fs.copyFileSync(path.join(__dirname, "historical-replay.cjs"), path.join(directory, "replay.cjs"));
  const defective = spawnSync(process.execPath, [path.join(directory, "replay.cjs")], { encoding: "utf8", timeout: 10000, env: {} });
  fs.writeFileSync(path.join(directory, "defective.log"), defective.stdout + defective.stderr, { mode: 0o600 });
  assert.equal(defective.status, 1); assert.equal(defective.signal, null);
  const rows = fs.readFileSync(path.join(directory, "historical.jsonl"), "utf8").trim().split("\n").map(line => JSON.parse(line));
  assert.ok(rows.some(row => row.event === "collector.completed" && row.code === 143 && row.signal === null && row.stopping === true && row.partial_line === false));
  const { child, contract } = model(); complete(contract); assert.equal(contract.stop(child), true); assert.equal(terminal(contract, child).accepted, true);
  console.log("F1_REGRESSION_EVIDENCE " + directory);
});
