"use strict";
// One complete canonical Services diagnostic. No case selection or order change.
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const child = require("node:child_process"), { mock } = require("node:test");
const observe = require("./observe.cjs");
const root = path.resolve(__dirname, "../../.."), output = process.argv[2];
assert.ok(path.isAbsolute(output));
const stat = fs.lstatSync(output); assert.ok(stat.isDirectory() && !stat.isSymbolicLink() && stat.uid === process.getuid() && (stat.mode & 0o077) === 0);
const attempt = "P2-SERVICES-" + crypto.randomUUID();
const started = new Date().toISOString();
const config = { attempt, output };
fs.writeFileSync(path.join(output, "attempt.json"), JSON.stringify(config) + "\n", { flag: "wx", mode: 0o600 });
fs.copyFileSync(path.join(__dirname, "../postfix-http/observe.cjs"), path.join(output, "observe.cjs"));
for (const name of ["client-preload.cjs", "state.cjs", "cases.json"]) fs.copyFileSync(path.join(__dirname, name), path.join(output, name));
const log = observe.logger(attempt, "orchestrator", path.join(output, "orchestrator.jsonl"));
observe.processEvents(log);
const original = child.spawnSync;
let project, fixtures, built = false, selected = false;
const collectors = [];
function startCollectors(value) {
  assert.match(value, /^drumee-il2-test-[0-9a-f]{8}$/);
  project = value;
  for (const owned of [project, project + "-ephemeral"]) {
    const file = path.join(output, owned.endsWith("-ephemeral") ? "docker-ephemeral.jsonl" : "docker-main.jsonl");
    const observer = child.spawn(process.execPath, [path.join(__dirname, "docker-events.cjs"), owned, started, file, attempt], { stdio: "ignore" });
    observer.unref();
    collectors.push(observer);
    log("collector.spawned", { project: owned, child_pid: observer.pid });
    observer.on("error", error => { log("collector.spawn.error", { error: observe.errorValue(error) }); process.exitCode = 1; });
    observer.on("exit", (code, signal) => { log("collector.exit", { project: owned, code, signal }); if (code !== 0) process.exitCode = 1; });
  }
}
function invoke(program, args, options) { return original.call(child, program, args, options); }
function snapshot(stage) {
  const result = invoke("/usr/bin/docker", ["ps", "-aq", "--filter", `label=com.docker.compose.project=${project}`], { encoding: "utf8", timeout: 15000 });
  assert.equal(result.status, 0);
  const ids = result.stdout.trim().split("\n").filter(Boolean);
  for (const id of ids) {
    const inspected = invoke("/usr/bin/docker", ["inspect", "--format", '{{json .}}', id], { encoding: "utf8", timeout: 15000 }); assert.equal(inspected.status, 0);
    const v = JSON.parse(inspected.stdout), labels = v.Config.Labels;
    assert.equal(labels["com.docker.compose.project"], project);
    log("docker.state", { stage, project, id: v.Id, service: labels["com.docker.compose.service"], status: v.State.Status, running: v.State.Running, restarting: v.State.Restarting, exit: v.State.ExitCode, oom: v.State.OOMKilled, restarts: v.RestartCount, health: v.State.Health?.Status, networks: Object.keys(v.NetworkSettings.Networks), published: v.NetworkSettings.Ports?.["8025/tcp"] });
  }
  return ids;
}
function captureLogs(stage) {
  const lines = fs.readFileSync(path.join(fixtures, "capture/.p1-http.jsonl"), "utf8").trim().split("\n").map(line => JSON.parse(line));
  assert.ok(lines.length > 0 && lines.length < 16384);
  fs.writeFileSync(path.join(output, `server-${stage}.jsonl`), lines.map(line => JSON.stringify(line)).join("\n") + "\n", { flag: "wx", mode: 0o600 });
}
const substitution = mock.method(child, "spawnSync", function(program, args, options) {
  if (program === "/usr/bin/docker" && args[0] === "compose" && !project) startCollectors(args[2]);
  if (args[0] === "--test" && args[1] === path.join(root, "test/services/services.test.js")) {
    assert.equal(selected, false); assert.equal(built, true); selected = true;
    const metadata = JSON.parse(fs.readFileSync(options.env.IL2_METADATA)); project = metadata.project; fixtures = metadata.fixtures;
    log("fixture.ready", { project, capture_port: metadata.ports.capture }); snapshot("before-test");
    const command = ["--require", path.join(output, "client-preload.cjs"), "--test", args[1]];
    log("test.start", { command });
    const result = invoke(program, command, options);
    log("test.exit", { code: result.status, signal: result.signal });
    snapshot("after-test"); captureLogs("after-test");
    fs.writeFileSync(path.join(output, "test-result.json"), JSON.stringify({ ...config, command: [program, ...command], code: result.status, signal: result.signal }, null, 2) + "\n", { flag: "wx", mode: 0o600 });
    return result;
  }
  if (program === "/usr/bin/docker" && args[0] === "build" && path.basename(args.at(-1)) === "capture-build") {
    assert.equal(built, false); built = true;
    const context = args.at(-1), dockerfile = path.join(context, "Dockerfile");
    assert.equal(fs.readFileSync(dockerfile, "utf8"), fs.readFileSync(path.join(root, "test/services/Dockerfile.capture"), "utf8"));
    for (const name of ["observe.cjs", "server-preload.cjs"]) fs.copyFileSync(path.join(__dirname, "../postfix-http", name), path.join(context, name));
    fs.writeFileSync(path.join(context, "attempt.json"), JSON.stringify(config));
    const before = fs.readFileSync(dockerfile, "utf8"), entry = 'ENTRYPOINT ["node", "/fixture/capture.js"]'; assert.ok(before.includes(entry));
    fs.writeFileSync(dockerfile, before.replace(entry, 'COPY observe.cjs server-preload.cjs attempt.json /fixture/\nENTRYPOINT ["node", "--require", "/fixture/server-preload.cjs", "/fixture/capture.js"]'));
    log("fixture.instrumented", { scope: "owned capture build only", capture_source_sha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(context, "capture.js"))).digest("hex") });
  }
  const down = program === "/usr/bin/docker" && args[0] === "compose" && args.includes("down");
  if (down) log("cleanup.requested", { project });
  const result = invoke(program, args, options);
  if (down) {
    log("cleanup.compose.completed", { code: result.status, signal: result.signal }); assert.equal(snapshot("after-cleanup").length, 0);
    if (selected) captureLogs("after-cleanup");
    for (const observer of collectors) { observer.ref(); observer.kill("SIGTERM"); }
  }
  return result;
});
process.on("exit", () => { substitution.mock.restore(); });
// On an early setup failure canonical cleanup may have no test child; no observer persists.
process.on("beforeExit", () => { for (const observer of collectors) if (observer.exitCode === null && !observer.killed) { observer.ref(); observer.kill("SIGTERM"); } });
require("../../../test/services/run.js");
