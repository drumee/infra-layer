"use strict";
// Copied into the isolated installed consumer. Imports only npm public exports
// and Node built-ins, with all filesystem fixtures below that consumer's cwd.
const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const api = require("@drumee/infra-layer"), L = require("@drumee/infra-layer/lifecycle");
module.exports = async function refusals(input) {
  let assertions = 0;
  const checked = (fn) => { fn(); assertions++; };
  const compose = value => L.composeDeployment(api.planInfrastructure(value.spec, value.requirements, value.adapter_input), value.distribution);
  const mutate = change => { const value = structuredClone(input); change(value); return value; };
  for (const name of Object.keys(require("@drumee/infra-layer/package.json").exports).filter(name => !name.includes("*"))) {
    const specifier = name === "." ? "@drumee/infra-layer" : "@drumee/infra-layer" + name.slice(1);
    checked(() => assert.ok(require.resolve(specifier).startsWith(path.join(process.cwd(), "node_modules", "@drumee", "infra-layer") + path.sep)));
    checked(() => assert.ok(require(specifier)));
  }
  const selected = compose(input);
  checked(() => assert.deepEqual(selected.distribution.application.plugins, input.distribution.application.plugins));
  for (const address of ["0.0.0.0", "::", "192.168.5.201", "127.0.0.2"]) {
    checked(() => assert.throws(() => compose(mutate(v => { v.distribution.external_gateway.host_address = address; })), { code: "PRIVATE_APPLICATION_BINDING_REQUIRED" }));
  }
  for (const change of [v => { v.distribution.application.plugins[0].root = "/app/../etc"; }, v => { v.distribution.application.plugins[0].revision = "main"; }, v => { v.distribution.application.plugins.push(v.distribution.application.plugins[0]); }]) {
    checked(() => assert.throws(() => compose(mutate(change)), { code: "INVALID_APPLICATION_PLUGINS" }));
  }
  checked(() => assert.throws(() => compose(mutate(v => { v.distribution.application.secret_mounts[0].consumer = "foreign"; })), { code: "INVALID_SECRET_REFERENCE" }));
  const base = fs.mkdtempSync(path.join(process.cwd(), "refusal-fixtures-"));
  try {
    const target = path.join(base, "target"), link = path.join(base, "link"), foreign = path.join(base, "foreign");
    fs.mkdirSync(target, { mode: 0o700 }); fs.symlinkSync(target, link);
    await assert.rejects(L.prepareDeployment(selected, { root: link, authorized: true, create_resources: true }), { code: "UNSAFE_RESOURCE_PATH" }); assertions++;
    checked(() => assert.deepEqual(fs.readdirSync(target), []));
    fs.mkdirSync(foreign, { mode: 0o700 }); fs.writeFileSync(path.join(foreign, "keep"), "owned-by-fixture", { mode: 0o600 });
    await assert.rejects(L.prepareDeployment(selected, { root: foreign, authorized: true, create_resources: true }), { code: "UNOWNED_DEPLOYMENT_DIRECTORY" }); assertions++;
    checked(() => assert.equal(fs.readFileSync(path.join(foreign, "keep"), "utf8"), "owned-by-fixture"));
    checked(() => assert.equal(Object.keys(require("@drumee/infra-layer/package.json").dependencies || {}).length, 0));
    checked(() => assert.deepEqual(fs.readdirSync(path.join(process.cwd(), "node_modules", "@drumee")), ["infra-layer"]));
    console.log(JSON.stringify({ additional_consumer_assertions: assertions, exports_resolve_inside_consumer: true, plugins_checked: true, network_refusals: true, untrusted_paths_and_foreign_resources_refused: true, production_dependencies: [] }));
  } finally { fs.rmSync(base, { recursive: true, force: true }); }
};
