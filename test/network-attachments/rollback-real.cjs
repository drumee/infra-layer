"use strict";
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), crypto = require("node:crypto"), assert = require("node:assert/strict"), net = require("node:net");
const D = require("../../lifecycle/docker"), L = require("../../lifecycle"), diagnostic = require("../support/qualification-diagnostic.cjs").createDiagnostics({ scenario: "rollback-restart-authorization" });
diagnostic.observeDocker();
const project = "drumee-il5-" + crypto.randomBytes(4).toString("hex"), base = fs.mkdtempSync(path.join(os.tmpdir(), project + "-a4-")); fs.chmodSync(base, 0o700);
const root = path.join(base, "deployment"), context = { root, authorized: true, create_resources: true }, report = { project, steps: [], assertions: 0 };
let built, prepared, extra;
function equal(actual, expected) { report.assertions++; assert.deepEqual(actual, expected); }
function refuse(fn, code) { report.assertions++; assert.throws(fn, { code }); }
const inspect = id => JSON.parse(D.docker(["container", "inspect", "--format", "{{json .}}", id]));
const owned = () => D.inspectProject(project, ["application"]);
async function freePort() { const s = net.createServer(); await new Promise((resolve, reject) => { s.once("error", reject); s.listen(0, "127.0.0.1", resolve); }); const p = s.address().port; await new Promise(resolve => s.close(resolve)); return p; }
diagnostic.run(async () => {
  diagnostic.scenario(project);
  try {
    built = require("../application/build").build(project);
    const values = require("../support/application-inputs").applicationInputs(root, project, built.image, await freePort());
    const composition = () => L.composeDeployment(values.plan(), values.distribution);
    prepared = await L.prepareDeployment(composition(), context);
    equal(owned().length, 0); equal((await L.activateDeployment(prepared, context)).ready, true);
    const initial = owned()[0]; report.initial = initial; report.steps.push("initial-operational");
    const targets = owned();
    for (const key of ["id", "service", "name", "role"]) { const wrong = structuredClone(targets); wrong[0][key] = key === "id" ? "a".repeat(64) : "foreign"; refuse(() => D.authorizeRecoveryNetworks(prepared.composition, wrong), "RUNTIME_IDENTITY_MISMATCH"); }
    extra = D.docker(["network", "create", "--internal", "--label", "org.drumee.infra.owner=" + project, "--label", "com.docker.compose.project=" + project, project + "-extra"]).trim();
    D.docker(["network", "connect", extra, initial.id]); refuse(() => D.authorizeRecoveryNetworks(prepared.composition, targets), "NETWORK_ATTACHMENT_MISMATCH");
    equal(inspect(initial.id).Id, initial.id); D.docker(["network", "disconnect", extra, initial.id]);
    D.docker(["network", "disconnect", Object.values(prepared.compose.networks)[0].name, initial.id]); refuse(() => D.checkNetworks(prepared.composition, { require_existing: true }), "NETWORK_ATTACHMENT_MISMATCH");
    D.docker(["network", "connect", Object.values(prepared.compose.networks)[0].name, initial.id]); D.checkNetworks(prepared.composition, { require_existing: true });
    values.distribution.application.environment = { APP_CRASH: "1" };
    const broken = await L.prepareDeployment(composition(), context);
    report.assertions++; await assert.rejects(() => L.activateDeployment(broken, context), { code: "DOCKER_LIFECYCLE_COMMAND_FAILED" });
    equal((await L.inspectDeployment(root, context)).ready, false);
    const deadline = performance.now() + 10000; let degraded;
    for (;;) { const resources = owned(); degraded = resources[0]; if (degraded?.running && degraded.restarting) break; if (performance.now() >= deadline) throw Error("RESTART_STATE_NOT_OBSERVED"); await new Promise(resolve => setTimeout(resolve, 25)); }
    report.degraded = { observed: degraded, state: inspect(degraded.id).State, networks: inspect(degraded.id).NetworkSettings.Networks };
    refuse(() => D.checkNetworks(broken.composition, { require_existing: true }), "NETWORK_ATTACHMENT_MISMATCH");
    equal((await L.rollbackDeployment(root, prepared.revision, context)).ready, true);
    const replaced = owned()[0]; report.replaced = replaced; report.assertions++; assert.notEqual(replaced.id, degraded.id); equal(replaced.restarting, false);
    D.checkNetworks(prepared.composition, { require_existing: true }); report.steps.push("actual-restarting-rollback-final-ready");
    // Genuine recreation errors stay fatal and cannot produce a ready attestation.
    await L.stopDeployment(prepared, context);
    const failure = Object.assign(Error("DOCKER_LIFECYCLE_COMMAND_FAILED"), { code: "DOCKER_LIFECYCLE_COMMAND_FAILED", exit_status: 125 });
    const driver = { ...D, compose(value, args, options) { if (args[0] === "up") throw failure; return D.compose(value, args, options); } };
    report.assertions++; await assert.rejects(() => L.rollbackDeployment(root, prepared.revision, { ...context, driver }), { code: "DOCKER_LIFECYCLE_COMMAND_FAILED" });
    equal((await L.inspectDeployment(root, context)).ready, false); report.steps.push("failed-recreation-never-ready");
    report.status = "PASS";
  } catch (error) { diagnostic.capture(error, { report }); throw error; }
  finally {
    diagnostic.step("owned-cleanup");
    if (prepared) {
      const owner = JSON.parse(fs.readFileSync(path.join(root, "deployment-owner.json"))); equal(owner.project, project); equal(owner.uid, process.getuid());
      for (const resource of owned()) { equal(resource.owner, project); D.docker(["rm", "-f", resource.id]); }
      for (const network of [...Object.values(prepared.compose.networks).map(value => value.name), ...(extra ? [extra] : [])]) {
        const observed = JSON.parse(D.docker(["network", "inspect", "--format", "{{json .}}", network])); equal(observed.Labels["org.drumee.infra.owner"], project); D.docker(["network", "rm", network]);
      }
      D.helper(prepared.composition, root, "const fs=require('node:fs');for(const name of fs.readdirSync('/work'))fs.rmSync('/work/'+name,{recursive:true,force:true});", [], true);
    }
    if (built) { equal(D.docker(["image", "inspect", built.tag, "--format", '{{index .Config.Labels "org.drumee.infra.owner"}}']).trim(), project); D.docker(["image", "rm", built.tag]); }
    equal(owned().length, 0); equal(D.docker(["network", "ls", "-q", "--filter", "label=com.docker.compose.project=" + project]).trim(), "");
    fs.rmSync(base, { recursive: true, force: true }); report.cleanup = "PASS"; diagnostic.event("cleanup-complete", { project });
    fs.writeFileSync(path.join(process.env.IL514_DIAGNOSTIC_DIR, "result.json"), JSON.stringify(report, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  }
  console.log(JSON.stringify(report, null, 2));
}).catch(diagnostic.fail);
