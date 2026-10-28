"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), os = require("node:os"), crypto = require("node:crypto");
const { execFileSync, fork } = require("node:child_process");
const { launch } = require("../services-capture/observer-control.cjs");
const p1 = require("../postfix-http/observe.cjs");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "drumee-observer-docker-")); fs.chmodSync(output, 0o700); console.log("F1_DOCKER_PROBE_OUTPUT " + output);
const command = args => execFileSync("/usr/bin/docker", args, { encoding: "utf8", timeout: 15000 }).trim();
function collecting(child) {
  return new Promise((resolve, reject) => {
    child.on("message", message => { if (message.type === "collecting") resolve(message); }); child.once("error", reject); child.once("exit", code => { if (code !== 0) reject(new Error("PROBE_OBSERVER_EARLY_EXIT")); });
  });
}
test("F1 direct Docker CLI requested SIGTERM actually reports143 and qualifies", { timeout: 30000 }, async () => {
  const project = "drumee-il2-test-" + crypto.randomBytes(4).toString("hex"), attempt = "F1-DOCKER-" + crypto.randomUUID(), failures = [];
  assert.equal(command(["ps", "-aq", "--filter", "label=com.docker.compose.project=" + project]), "");
  let resolveClosed;
  const closed = new Promise(resolve => { resolveClosed = resolve; });
  const logFile = path.join(output, "controller.jsonl"), originalLog = p1.logger(attempt, "probe-controller", logFile);
  const log = (event, fields) => { originalLog(event, fields); if (event === "collector.closed") resolveClosed(fields.result); };
  const observer = launch({ project, started: new Date().toISOString(), file: path.join(output, "docker.jsonl"), attempt, log, fail: code => failures.push(code) });
  observer.child.ref(); observer.child.channel.ref(); observer.child.stdout.ref?.(); observer.child.stderr.ref?.();
  const ready = collecting(observer.child);
  let id, removed = false;
  try {
    await ready;
    id = command(["create", "--name", project + "-observer-probe", "--network", "none", "--label", "com.docker.compose.project=" + project, "--label", "org.drumee.infra.owner=" + project, "node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392", "node", "-e", "process.exit(0)"]);
    assert.match(id, /^[a-f0-9]{64}$/); command(["start", "--attach", id]); command(["rm", id]); removed = true;
    observer.request({ type: "complete", window_complete: true, services_terminal: true, required: { ids: [id], min_creates: 1 } });
    const result = await closed;
    assert.equal(result.accepted, true); assert.equal(result.code, 143); assert.equal(result.signal, null); assert.equal(result.signal_sent, true); assert.deepEqual(failures, []);
    assert.equal(command(["ps", "-aq", "--filter", "label=com.docker.compose.project=" + project]), "");
    fs.writeFileSync(path.join(output, "result.json"), JSON.stringify({ project, attempt, producer: id, result, failures, cleanup: "PASS" }, null, 2) + "\n", { mode: 0o600 });
  } finally {
    if (id && !removed) { const owner = command(["inspect", "--format", '{{index .Config.Labels "org.drumee.infra.owner"}}', id]); assert.equal(owner, project); command(["rm", id]); }
    if (!observer.closed && observer.child.connected) { observer.child.send({ type: "abort", attempt, token: observer.token, observer_pid: observer.pid }); await closed; }
  }
});
test("F1 actual Docker stderr/collection failure remains fatal and redacted", { timeout: 30000 }, async () => {
  const project = "drumee-il2-test-" + crypto.randomBytes(4).toString("hex"), token = crypto.randomUUID(), attempt = "F1-STDERR-" + crypto.randomUUID();
  const child = fork(path.join(__dirname, "../services-capture/docker-events.cjs"), [project, "INVALID_TIME_BOUND", path.join(output, "stderr-control.jsonl"), attempt, token], { stdio: ["ignore", "pipe", "pipe", "ipc"], env: {} });
  let message, stdoutBytes = 0, stderrBytes = 0;
  child.stdout.on("data", bytes => { stdoutBytes += bytes.length; }); child.stderr.on("data", bytes => { stderrBytes += bytes.length; });
  child.on("message", value => { if (value.type === "completed") message = value; });
  const result = await new Promise((resolve, reject) => { child.once("error", reject); child.once("close", (code, signal) => resolve({ code, signal })); });
  assert.equal(result.code, 1); assert.equal(result.signal, null); assert.equal(message?.result.accepted, false); assert.equal(message.result.reason, "OBSERVER_STDERR"); assert.equal(stdoutBytes, 0); assert.equal(stderrBytes, 0);
  const rows = fs.readFileSync(path.join(output, "stderr-control.jsonl"), "utf8").trim().split("\n").map(line => JSON.parse(line));
  assert.ok(rows.some(row => row.event === "collector.completed" && row.stderr_bytes > 0));
  assert.equal(command(["ps", "-aq", "--filter", "label=com.docker.compose.project=" + project]), "");
});
