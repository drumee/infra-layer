"use strict";
const strict = require("node:assert/strict"), crypto = require("node:crypto"), { spawnSync, execFileSync } = require("node:child_process");
const diagnostic = require("../support/qualification-diagnostic.cjs").createDiagnostics({ scenario: "optional-container-health" }); diagnostic.observeDocker();
const D = require("../../lifecycle/docker"), T = require("../../internal/system-tools"), Q = require("../support/trusted-process");
let assertions = 0; const assert = new Proxy(strict, { get(target, key) { const value = target[key]; return typeof value === "function" ? (...args) => { assertions++; return value(...args); } : value; } });
diagnostic.run(async () => {
  const project = "drumee-il514-health-" + crypto.randomBytes(4).toString("hex"), marker = "org.drumee.qualification", ids = [];
  const image = require("../support/service-inputs").serviceInputs().adapter_input.services.redis.image;
  const reference = "703b637425487286632e741045a1b96591e90c62", historical = execFileSync(Q.trustedExecutable("git"), ["show", reference + ":lifecycle/docker.js"], { encoding: "utf8", env: Q.trustedEnvironment() });
  const ast = require("espree").parse(historical, { ecmaVersion: 2022 });
  const originalFormat = ast.body.flatMap(node => node.declarations || []).find(node => node.id.name === "format").init.value;
  const inspect = id => JSON.parse(D.docker(["container", "inspect", "--format", "{{json .}}", id]));
  const report = { project, image, original_reference: reference, original_format: originalFormat };
  diagnostic.scenario(project);
  try {
    diagnostic.step("initial-state"); assert.equal(D.docker(["ps", "-aq", "--filter", "label=" + marker + "=" + project]).trim(), "");
    diagnostic.step("owned-no-healthcheck-fixture");
    const owned = D.docker(["create", "--name", project + "-redis-1", "--label", marker + "=" + project, "--label", "org.drumee.infra.owner=" + project, "--label", "com.docker.compose.project=" + project, "--label", "com.docker.compose.service=redis", "--user", process.getuid() + ":" + process.getgid(), "--network", "none", "--no-healthcheck", "--read-only", "--cap-drop", "ALL", image, "true"]).trim(); ids.push(owned);
    const raw = inspect(owned); assert.equal(Object.hasOwn(raw.State, "Health"), false); report.state_keys = Object.keys(raw.State);
    diagnostic.step("historical-template-negative");
    const before = spawnSync(T.resolveTrustedExecutable("docker"), ["--host", "unix:///var/run/docker.sock", "container", "inspect", "--format", originalFormat, owned], { encoding: "utf8", env: T.systemEnvironment("docker") });
    assert.equal(before.status, 1); assert.equal(before.signal, null); assert.match(before.stderr, /map has no entry for key "Health"/);
    report.before = { exitCode: before.status, stdout: before.stdout, stderr: before.stderr };
    diagnostic.step("corrected-optional-field");
    const observed = D.inspectProject(project, ["redis"]); assert.equal(observed.length, 1); assert.equal(observed[0].id, owned); assert.equal(observed[0].health, "unknown"); assert.equal(observed[0].owner, project); assert.equal(observed[0].running, false); report.after = observed;
    diagnostic.step("unauthorized-no-healthcheck-fixture");
    const foreign = D.docker(["create", "--name", project + "-unauthorized-1", "--label", marker + "=" + project, "--label", "org.drumee.infra.owner=unauthorized-fixture", "--label", "com.docker.compose.project=" + project, "--label", "com.docker.compose.service=redis", "--user", process.getuid() + ":" + process.getgid(), "--network", "none", "--no-healthcheck", "--read-only", "--cap-drop", "ALL", image, "true"]).trim(); ids.push(foreign);
    assert.throws(() => D.inspectProject(project, ["redis"]), { code: "DEPLOYMENT_OWNERSHIP_MISMATCH" }); assert.equal(inspect(foreign).State.Running, false); report.refusal = "DEPLOYMENT_OWNERSHIP_MISMATCH";
  } catch (error) { diagnostic.capture(error, { report, ids }); throw error; }
  finally {
    diagnostic.step("owned-cleanup");
    for (const id of ids) { assert.equal(inspect(id).Config.Labels[marker], project); D.docker(["rm", id]); }
    assert.equal(D.docker(["ps", "-aq", "--filter", "label=" + marker + "=" + project]).trim(), "");
    report.cleanup = "PASS"; diagnostic.event("cleanup-complete", { project });
  }
  report.assertions = assertions; report.status = "PASS"; console.log(JSON.stringify(report, null, 2));
}).catch(diagnostic.fail);
