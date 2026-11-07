"use strict";
const assert = require("node:assert/strict"), fs = require("node:fs"), api = require("@drumee/infra-layer"), L = require("@drumee/infra-layer/lifecycle"), input = require("./inputs.json");
const plan = api.planInfrastructure(input.spec, input.requirements, input.adapter_input), cases = [];
for (const [name, mutate] of [
  ["public-binding", x => x.external_gateway.host_address = "0.0.0.0"],
  ["IPv6-binding", x => x.external_gateway.host_address = "::1"],
  ["altered-RPC-prefix", x => x.external_gateway.rpc_prefix = "/-/rpc/"],
  ["mutable-image", x => x.application.image = "node:latest"],
  ["undeclared-dependency", x => x.application.requires = ["redis"]],
  ["unauthorized-secret", x => x.application.secret_mounts = [{ ref: { resource: "undeclared", key: "credential" }, consumer: "application", target: "/run/secrets/unapproved", format: "raw" }]]
]) {
  const value = structuredClone(input.distribution); mutate(value); let code;
  assert.throws(() => L.composeDeployment(plan, value), error => { code = error.code; return typeof code === "string" && /^[A-Z_]+$/.test(code); }); cases.push({ name, refused: true, code });
}
assert.ok(require.resolve("@drumee/infra-layer").startsWith(__dirname + "/node_modules/@drumee/infra-layer/"));
const pkg = require("@drumee/infra-layer/package.json"); assert.deepEqual(pkg.dependencies || {}, {});
assert.equal(fs.existsSync(require("node:path").join(__dirname, "node_modules/eslint")), false); assert.equal(fs.existsSync(require("node:path").join(__dirname, "node_modules/@drumee/server-runtime")), false);
console.log(JSON.stringify({ status: "passed", negative_contract_assertions: cases.length, cases, isolated_dependencies: Object.keys(require("./package.json").dependencies), undeclared_production_dependencies: [], development_tools_installed: false }));
