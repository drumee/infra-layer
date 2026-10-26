"use strict";
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), { execFileSync } = require("node:child_process"), assert = require("node:assert/strict");
const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
const reference = "c218811effc83da25cf71a914e27accc96101329";
const sourceSHA256 = "c2e56482823bb6f69754ebd48fa4cdc609c609f0db58e6537bf9ef6b3e86d445";
const fixtureSHA256 = "c7313101fa16e8027b6b880585316fadf51a41f29915a49e0b67b68e9179baa0";
const digest = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
function verifyHistorical(source, fixture, identity) {
  if (identity !== reference || !Buffer.isBuffer(source) || !Buffer.isBuffer(fixture) || digest(source) !== sourceSHA256 || digest(fixture) !== fixtureSHA256) throw new Error("UNAPPROVED_HISTORICAL_FIXTURE");
  return true;
}
function historical() {
  if (arguments.length) throw new Error("FIXED_HISTORICAL_SOURCE_REQUIRED");
  const source = execFileSync(trustedExecutable("git"), ["show", reference + ":lifecycle/docker.js"], { env: trustedEnvironment() });
  const fixtureBytes = fs.readFileSync(path.join(__dirname, "fixture.json"));
  verifyHistorical(source, fixtureBytes, reference);
  const ast = require("espree").parse(source.toString("utf8"), { ecmaVersion: 2022, range: true });
  const target = ast.body.find(node => node.type === "FunctionDeclaration" && node.id.name === "checkNetworks");
  const outer = target.body.body.find(node => node.type === "ForOfStatement");
  const loop = outer.body.consequent.body.find(node => node.type === "ForOfStatement");
  assert.equal(source.toString().slice(...loop.right.range), "Object.keys(observed.containers || {})");
  assert.equal(loop.left.declarations[0].id.name, "id");
  const declaration = loop.body.body[0].declarations[0];
  assert.equal(declaration.id.name, "resource");
  assert.equal(source.toString().slice(...declaration.init.range), 'JSON.parse(docker(["inspect", "--format", format, id]))');
  const format = ast.body.flatMap(node => node.declarations || []).find(node => node.id.name === "format").init.value;
  const fixture = JSON.parse(fixtureBytes);
  return { reference, sourceSHA256, fixtureSHA256, fixture, commands: Object.keys(fixture.network.containers).map(id => ["inspect", "--format", format, id]), sourceExecuted: false };
}
module.exports = { historical, verifyHistorical, reference, sourceSHA256, fixtureSHA256 };
