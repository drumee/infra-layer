"use strict";
// Only the fixed direct Docker CLI may use numeric143 after verified collection/intent.
const { spawn } = require("node:child_process"), fs = require("node:fs"), crypto = require("node:crypto");
const p1 = require("../postfix-http/observe.cjs");
const { ObserverContract } = require("./observer-contract.cjs");
const { eventValue, Collection } = require("./observer-events.cjs");
const [project, started, file, attempt, token] = process.argv.slice(2);
if (!/^drumee-il2-test-[0-9a-f]{8}(?:-ephemeral)?$/.test(project) || !token || !process.send) throw new Error("OBSERVER_PRIVATE_CONTROLLER_REQUIRED");
const log = p1.logger(attempt, "docker-observer", file), collection = new Collection();
const cli = spawn("/usr/bin/docker", ["events", "--since", started, "--filter", `label=com.docker.compose.project=${project}`, "--format", "{{json .}}"], { stdio: ["ignore", "pipe", "pipe"], env: { PATH: "/usr/bin:/bin", HOME: require("node:os").userInfo().homedir } });
const contract = new ObserverContract(log); contract.start(cli);
let buffer = "", completion, finalSent = false, cliClosed = false, abortSent = false, stderrBytes = 0;
const stderrHash = crypto.createHash("sha256");
let deadline = setTimeout(expired, 15000);
function send(message, callback) {
  if (!process.connected) { contract.fail("CONTROLLER_DISCONNECTED"); abort(); return; }
  process.send({ ...message, attempt, token, observer_pid: process.pid, cli_pid: cli.pid }, error => { if (error) { contract.fail("IPC_SEND_FAILED"); abort(); } else callback?.(); });
}
function abort() {
  process.exitCode = 1;
  if (!abortSent && !cliClosed) { abortSent = true; log("observer.abort.intent", { pid: cli.pid, signal: "SIGTERM" }); let delivered = false; try { delivered = cli.kill("SIGTERM"); } catch { contract.fail("SIGNAL_DELIVERY_FAILED"); } log("observer.abort.signal", { pid: cli.pid, success: delivered }); }
}
function expired() { contract.deadline(); abort(); finish(); }
function fail(code) { contract.fail(code); abort(); }
function finish() {
  const result = contract.finalize();
  if (!cliClosed || !result || finalSent) return;
  finalSent = true; clearTimeout(deadline);
  log("collector.completed", { ...result, event_rows: collection.rows, partial_line: buffer.length !== 0, stderr_bytes: stderrBytes, stderr_sha256: stderrHash.digest("hex") });
  if (!result.accepted) process.exitCode = 1;
  send({ type: "completed", result }, () => { if (process.connected) process.disconnect(); });
}
function tryComplete() {
  if (!completion || contract.firstError || contract.state !== "COLLECTING" || !collection.complete(completion.required)) return;
  if (contract.complete({ windowComplete: completion.window_complete === true, servicesTerminal: completion.services_terminal === true, evidenceComplete: true })) contract.stop(cli);
  if (contract.firstError) abort();
}
cli.on("spawn", () => {
  if (!contract.spawned(cli)) { abort(); return; }
  clearTimeout(deadline);
  const receipt = { state: contract.state, attempt, token, observer_pid: process.pid, cli_pid: cli.pid, project };
  const ready = file + ".ready.json", temporary = ready + ".tmp";
  fs.writeFileSync(temporary, JSON.stringify(receipt) + "\n", { flag: "wx", mode: 0o600 }); fs.renameSync(temporary, ready);
  send({ type: "collecting", state: contract.state });
});
cli.stdout.setEncoding("utf8");
cli.stdout.on("data", data => {
  if (contract.firstError) return; // Already fatal: drain further bytes without exposing payloads.
  buffer += data;
  if (buffer.length > 131072) { fail("EVENT_BUFFER_LIMIT"); return; }
  for (;;) {
    const index = buffer.indexOf("\n"); if (index < 0) break;
    const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
    try { const value = eventValue(line, project); collection.add(value); log("docker.event", value); }
    catch { fail("EVENT_PARSE_FAILED"); return; }
  }
  tryComplete();
});
cli.stderr.on("data", bytes => { stderrBytes += bytes.length; stderrHash.update(bytes); fail(stderrBytes > 8192 ? "STDERR_LIMIT" : "OBSERVER_STDERR"); });
for (const which of ["stdout", "stderr"]) {
  cli[which].on("error", () => fail("STREAM_ERROR"));
  cli[which].on("end", () => { if (which === "stdout" && buffer.length) contract.fail("PARTIAL_EVENT"); contract.stream(which, "ended"); finish(); });
  cli[which].on("close", () => { contract.stream(which, "closed"); finish(); });
}
cli.on("error", () => { fail("SPAWN_ERROR"); });
cli.on("exit", (code, signal) => { contract.exit(cli, code, signal); });
cli.on("close", (code, signal) => { cliClosed = true; contract.close(cli, code, signal); finish(); });
process.on("message", message => {
  if (!message || message.attempt !== attempt || message.token !== token || message.observer_pid !== process.pid) { fail("CONTROLLER_IDENTITY"); return; }
  if (message.type === "abort") { fail("CONTROLLER_ABORT"); return; }
  if (message.type !== "complete" || completion || !message.window_complete || !message.services_terminal) { fail("COLLECTION_PROTOCOL"); return; }
  completion = message;
  log("collector.window.complete.request", { required_ids: message.required?.ids, min_creates: message.required?.min_creates });
  deadline = setTimeout(expired, 15000); tryComplete();
});
process.on("disconnect", () => { if (!finalSent) fail("CONTROLLER_DISCONNECTED"); });
process.on("SIGTERM", () => fail("UNSOLICITED_OBSERVER_SIGNAL"));
process.on("exit", () => { if (!cliClosed && !cli.killed) cli.kill("SIGTERM"); });
