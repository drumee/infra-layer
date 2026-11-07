"use strict";
// One fixed three-case actual-source diagnostic, never a Services acceptance run.
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const child = require("node:child_process"), { mock } = require("node:test");
const observe = require("./observe.cjs");
const root = path.resolve(__dirname, "../../.."), output = process.argv[2];
assert.ok(path.isAbsolute(output));
const stat = fs.lstatSync(output); assert.ok(stat.isDirectory() && !stat.isSymbolicLink() && stat.uid === process.getuid() && (stat.mode & 0o077) === 0);
const attempt = "P1-POSTFIX-" + crypto.randomUUID();
const started = new Date().toISOString();
const config = { attempt, output };
fs.writeFileSync(path.join(output, "attempt.json"), JSON.stringify(config) + "\n", { flag: "wx", mode: 0o600 });
for (const name of ["observe.cjs", "client-preload.cjs"]) fs.copyFileSync(path.join(__dirname, name), path.join(output, name));
const log = observe.logger(attempt, "orchestrator", path.join(output, "orchestrator.jsonl"));
observe.processEvents(log);
const original = child.spawnSync;
let project, fixtures, built = false, selected = false;
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
  if (args[0] === "--test" && args[1] === path.join(root, "test/services/services.test.js")) {
    assert.equal(selected, false); assert.equal(built, true); selected = true;
    const metadata = JSON.parse(fs.readFileSync(options.env.IL2_METADATA)); project = metadata.project; fixtures = metadata.fixtures;
    log("fixture.ready", { project, capture_port: metadata.ports.capture }); snapshot("before-test");
    const command = ["--require", path.join(output, "client-preload.cjs"), "--test", "--test-name-pattern=SMTP STARTTLS/authenticated|OpenDKIM signs|Postfix queue survives", args[1]];
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
    for (const name of ["observe.cjs", "server-preload.cjs"]) fs.copyFileSync(path.join(__dirname, name), path.join(context, name));
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
    const events = invoke("/usr/bin/docker", ["events", "--since", started, "--until", new Date().toISOString(), "--filter", `label=com.docker.compose.project=${project}`, "--format", "{{json .}}"], { encoding: "utf8", timeout: 15000, maxBuffer: 2 * 1024 * 1024 }); assert.equal(events.status, 0);
    const values = events.stdout.trim().split("\n").filter(Boolean).map(line => { const v = JSON.parse(line); return { action: v.Action, type: v.Type, id: v.Actor.ID, service: v.Actor.Attributes?.["com.docker.compose.service"], timeNano: String(v.timeNano) }; });
    assert.ok(values.length > 0 && values.length < 4096);
    fs.writeFileSync(path.join(output, "docker-events.json"), JSON.stringify(values, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  }
  return result;
});
process.on("exit", () => { substitution.mock.restore(); });
require("../../../test/services/run.js");
