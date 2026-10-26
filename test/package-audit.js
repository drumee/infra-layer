"use strict";
const { trustedExecutable, trustedEnvironment } = require("./support/trusted-process");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const packed = JSON.parse(execFileSync(trustedExecutable("npm"), ["pack", "--dry-run", "--json"], { cwd: root, encoding: "utf8" , env: trustedEnvironment()}))[0];
const allowed = [
  /^internal\/(?:system-tools|network-readiness)\.js$/,
  /^lib\/[a-z0-9-]+\.js$/,
  /^lifecycle\/[a-z-]+\.js$/,
  /^lifecycle\/index\.d\.ts$/,
  /^capabilities\/http\/nginx\/[a-z]+\.js$/,
  /^capabilities\/(?:secrets|tls|dns|database|redis|mail)\/[a-z-]+\.js$/,
  /^capabilities\/docker\/Dockerfile\.services$/,
  /^adapters\/docker\/[a-z-]+\.js$/,
  /^index\.d\.ts$/,
  /^README\.md$/,
  /^CHANGELOG\.md$/,
  /^PROVENANCE\.md$/,
  /^LICENSE$/,
  /^package\.json$/,
];
for (const entry of packed.files) {
  assert.ok(allowed.some(pattern => pattern.test(entry.path)), "Unexpected package member");
  const contents = fs.readFileSync(path.join(root, entry.path), "utf8");
  assert.doesNotMatch(contents, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|isolated-fixture-password|\/home\/[^\s"']+|"file:/);
  if (entry.path.endsWith(".js")) for (const match of contents.matchAll(/require\(["']([^"']+)["']\)/g)) assert.ok(match[1].startsWith(".") || match[1].startsWith("node:"), "Undeclared production import");
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json")));
assert.equal(manifest.name, "@drumee/infra-layer"); assert.equal(manifest.license, "AGPL-3.0-only");
assert.equal(Object.keys(manifest.dependencies || {}).length, 0);
console.log(JSON.stringify({ files: packed.files.map((entry) => entry.path), production_dependencies: [], integrity: packed.integrity }));
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "infra-package-consumer-"));
try {
  const archive = JSON.parse(execFileSync(trustedExecutable("npm"), ["pack", "--json", "--pack-destination", directory], { cwd: root, encoding: "utf8" , env: trustedEnvironment()}))[0];
  assert.equal(archive.integrity, packed.integrity);
  const consumer = path.join(directory, "consumer"); fs.mkdirSync(consumer); fs.writeFileSync(path.join(consumer, "package.json"), '{"name":"isolated-infra-consumer","version":"1.0.0","private":true}');
  execFileSync(trustedExecutable("npm"), ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", path.join(directory, archive.filename)], { cwd: consumer, stdio: "pipe", env: trustedEnvironment() });
  const script = `const assert=require("node:assert/strict");const api=require("@drumee/infra-layer");assert.deepEqual(Object.keys(api).sort(),["diagnoseInfrastructure","inspectInfrastructure","planInfrastructure","renderPlan","validateSpec"]);const input=require("./inputs.json");const checked=api.validateSpec(input.spec,input.requirements);assert.equal(checked.valid,true);const plan=api.planInfrastructure(input.spec,input.requirements,input.adapter_input);assert.equal(plan.applicable,true);assert.equal(plan.effective_domain,"drumee.lan");assert.equal(plan.contract_version,"2");assert.equal(typeof require("@drumee/infra-layer/capabilities/secrets").createFilesystemSecretStore,"function");assert.equal(typeof require("@drumee/infra-layer/lifecycle").composeDeployment,"function");assert.equal(typeof require("@drumee/infra-layer/lifecycle").backupDeployment,"function");console.log("PACKED_CONSUMER_OK");`;
  fs.writeFileSync(path.join(consumer, "inputs.json"), JSON.stringify(require("./support/service-inputs").serviceInputs())); fs.writeFileSync(path.join(consumer, "check.js"), script);
  console.log(execFileSync(process.execPath, ["check.js"], { cwd: consumer, encoding: "utf8" , env: trustedEnvironment()}).trim());
} finally { fs.rmSync(directory, { recursive: true, force: true }); }
