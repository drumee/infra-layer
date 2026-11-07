"use strict";
const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), os = require("node:os"), crypto = require("node:crypto");
const { spawn } = require("node:child_process"), D = require("../../lifecycle/docker"), T = require("../../internal/system-tools");
const image = require("../support/service-inputs").serviceInputs().adapter_input.services.redis.image;
const records = [], runs = []; let assertions = 0;
const check = (actual, expected) => { assertions++; assert.deepEqual(actual, expected); };
function docker(args) {
  const start = Date.now();
  try { const result = D.docker(args); records.push({ args, exit_status: 0, duration_ms: Date.now() - start }); return result.trim(); }
  catch (error) { records.push({ args, exit_status: error.exit_status, code: error.code }); throw error; }
}
const inspect = id => JSON.parse(docker(["container", "inspect", "--format", '{{json .}}', id]));
const network = name => JSON.parse(docker(["network", "inspect", "--format", '{{json .}}', name]));
const wait = async predicate => { const deadline = performance.now() + 10000; for (;;) { if (predicate()) return; if (performance.now() >= deadline) throw Error("NETWORK_TEST_READINESS_TIMEOUT"); await new Promise(resolve => setTimeout(resolve, 25)); } };
async function validate(composition, pending) {
  await wait(() => {
    try { D.checkNetworks(composition, { require_existing: true }); return true; }
    catch (error) { if (error.code !== "NETWORK_ATTACHMENT_UNSETTLED") throw error; pending.push(error.attachments); return false; }
  });
}
async function start(id) {
  const result = await new Promise((resolve, reject) => {
    const child = spawn(T.resolveTrustedExecutable("docker"), ["--host", "unix:///var/run/docker.sock", "start", id], { env: T.systemEnvironment("docker"), stdio: ["ignore", "pipe", "pipe"] });
    let stderr = ""; child.stdout.resume(); child.stderr.on("data", bytes => { stderr += bytes; }); child.on("error", reject); child.on("exit", (status, signal) => resolve({ status, signal, stderr }));
  });
  records.push({ args: ["start", id], exit_status: result.status, signal: result.signal }); assert.equal(result.status, 0, result.stderr); assert.equal(result.signal, null);
}
(async () => {
  const versions = JSON.parse(docker(["version", "--format", "{{json .}}"]));
  for (let cycle = 1; cycle <= 2; cycle++) {
    const project = "drumee-il514-net-" + crypto.randomBytes(4).toString("hex"), netname = project + "-kernel", directory = fs.mkdtempSync(path.join(os.tmpdir(), project + "-")); fs.chmodSync(directory, 0o700);
    const marker = "org.drumee.qualification", containers = [], pending = [], labels = ["--label", marker + "=" + project, "--label", "org.drumee.infra.owner=" + project, "--label", "com.docker.compose.project=" + project];
    const composition = { project, compose: { services: { redis: { networks: ["kernel"] } }, networks: { kernel: { name: netname } } } };
    const report = { cycle, project, pending, source_revision: require("node:child_process").execFileSync("/usr/bin/git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim() }; let created = false;
    try {
      check(docker(["ps", "-aq", "--filter", "label=" + marker + "=" + project]), "");
      check(docker(["network", "ls", "-q", "--filter", "name=^" + netname + "$"]), "");
      const nid = docker(["network", "create", ...labels, netname]); created = true;
      const password = crypto.randomBytes(32).toString("hex"), data = path.join(directory, "data"); fs.mkdirSync(data, { mode: 0o700 });
      fs.writeFileSync(path.join(directory, "redis.conf"), 'bind 0.0.0.0\nport 6379\nprotected-mode yes\nrequirepass ' + password + '\nappendonly yes\nappendfsync always\ndir /data\n', { mode: 0o600 });
      const auth = 'export REDISCLI_AUTH="$(sed -n \'s/^requirepass //p\' /config/redis.conf)"; exec redis-cli "$@"';
      const health = 'export REDISCLI_AUTH="$(sed -n \'s/^requirepass //p\' /config/redis.conf)"; test "$(redis-cli ping)" = PONG';
      const id = docker(["create", "--name", project + "-redis-1", ...labels, "--label", "com.docker.compose.service=redis", "--user", process.getuid() + ":" + process.getgid(), "--network", netname, "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true", "--pids-limit", "64", "--memory", "128m", "--mount", "type=bind,source=" + directory + "/redis.conf,target=/config/redis.conf,readonly", "--mount", "type=bind,source=" + data + ",target=/data", "--health-cmd", health, "--health-interval", "1s", "--health-timeout", "1s", "--health-retries", "10", image, "redis-server", "/config/redis.conf"]); containers.push(id);
      await start(id); await validate(composition, pending); await wait(() => inspect(id).State.Health.Status === "healthy");
      const redis = args => docker(["exec", id, "/bin/sh", "-c", auth, "redis-cli", ...args]);
      check(redis(["PING"]), "PONG"); check(redis(["SET", "qualification-key", "persisted"]), "OK");
      const initial = network(netname); report.network_id = nid; report.container_id = id; report.initial_attachments = initial.Containers;
      check(inspect(id).NetworkSettings.Networks[netname].NetworkID, nid); check(initial.Containers[id].EndpointID, inspect(id).NetworkSettings.Networks[netname].EndpointID);
      docker(["kill", "--signal", "KILL", id]); await wait(() => inspect(id).State.Running === false);
      await start(id); await validate(composition, pending); await wait(() => inspect(id).State.Health.Status === "healthy"); check(redis(["GET", "qualification-key"]), "persisted");
      report.redis_recovery = "PASS"; report.recovered_attachments = network(netname).Containers;
      assertions++; assert.notEqual(report.recovered_attachments[id].EndpointID, initial.Containers[id].EndpointID);
      docker(["restart", id]); await validate(composition, pending); await wait(() => inspect(id).State.Health.Status === "healthy"); check(redis(["GET", "qualification-key"]), "persisted");
      docker(["network", "disconnect", netname, id]); await validate(composition, pending); check(network(netname).Containers[id], undefined);
      docker(["network", "connect", netname, id]); await validate(composition, pending);
      const foreign = docker(["run", "-d", "--name", project + "-intruder-1", "--label", marker + "=" + project, "--label", "org.drumee.infra.owner=unauthorized-fixture", "--label", "com.docker.compose.project=" + project, "--label", "com.docker.compose.service=redis", "--user", process.getuid() + ":" + process.getgid(), "--network", netname, "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true", "--entrypoint", "/bin/sh", image, "-c", "sleep 600"]); containers.push(foreign);
      assertions++; assert.throws(() => D.checkNetworks(composition), { code: "NETWORK_OWNERSHIP_MISMATCH" }); check(inspect(foreign).State.Running, true);
      docker(["stop", foreign]); docker(["rm", foreign]); containers.pop(); await validate(composition, pending);
      const missing = structuredClone(composition); missing.compose.networks.kernel.name += "-missing";
      assertions++; assert.throws(() => D.checkNetworks(missing, { require_existing: true }), { code: "REQUIRED_NETWORK_MISSING" }); check(D.checkNetworks(missing), undefined);
      docker(["stop", id]); await validate(composition, pending); report.stopped_attachments = network(netname).Containers; report.status = "PASS";
    } finally {
      for (const id of containers.reverse()) {
        const value = inspect(id); check(value.Config.Labels[marker], project);
        if (value.State.Running) docker(["stop", id]); docker(["rm", id]);
      }
      if (created) { check(network(netname).Labels[marker], project); docker(["network", "rm", netname]); }
      fs.rmSync(directory, { recursive: true, force: true });
      check(docker(["ps", "-aq", "--filter", "label=" + marker + "=" + project]), ""); check(docker(["network", "ls", "-q", "--filter", "name=^" + netname + "$"]), "");
      report.cleanup = "PASS";
    }
    assertions++; assert.throws(() => D.docker(["container", "inspect", report.container_id]), error => error.code === "DOCKER_LIFECYCLE_COMMAND_FAILED" && error.exit_status === 1 && error.object_missing === true);
    report.actual_missing_object_exit = 1; runs.push(report);
  }
  check(new Set(runs.map(r => r.network_id)).size, 2); check(new Set(runs.map(r => r.container_id)).size, 2);
  console.log(JSON.stringify({ status: "PASS", versions, image, assertions, runs, commands: records, note: "Sandbox-less timing is daemon-dependent; deterministic typed metadata/refusal/deadline cases are separately covered by actual-code fixtures. No failed lifecycle operation is retried." }, null, 2));
})().catch(error => { console.error(error.code || error.message); process.exitCode = 1; });
