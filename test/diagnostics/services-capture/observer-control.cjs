"use strict";
const { fork } = require("node:child_process"), path = require("node:path"), crypto = require("node:crypto");
const { trustedEnvironment } = require("../../support/trusted-process");
function unref(child) { child.unref(); child.channel?.unref(); child.stdout?.unref?.(); child.stderr?.unref?.(); }
function launch({ project, started, file, attempt, log, fail }) {
  const token = crypto.randomUUID();
  const child = fork(path.join(__dirname, "docker-events.cjs"), [project, started, file, attempt, token], { stdio: ["ignore", "pipe", "pipe", "ipc"], env: trustedEnvironment() });
  const record = { child, pid: child.pid, token, attempt, file: file + ".ready.json", project, result: null, requested: false, closed: false, streams: { stdout: {}, stderr: {} } };
  unref(child);
  const reject = code => { record.failure ||= code; fail(code); };
  log("collector.spawned", { project, observer_pid: record.pid, token });
  child.on("error", () => reject("OBSERVER_SPAWN_ERROR"));
  for (const which of ["stdout", "stderr"]) {
    child[which].on("data", bytes => { record[which + "_bytes"] = (record[which + "_bytes"] || 0) + bytes.length; reject("OBSERVER_WRAPPER_OUTPUT"); });
    child[which].on("error", () => reject("OBSERVER_WRAPPER_STREAM_ERROR"));
    child[which].on("end", () => { record.streams[which].ended = true; finalize(); });
    child[which].on("close", () => { record.streams[which].closed = true; finalize(); });
  }
  child.on("message", message => {
    if (!message || message.attempt !== attempt || message.token !== token || message.observer_pid !== record.pid || !Number.isInteger(message.cli_pid) || message.cli_pid <= 0 || (record.cliPid && record.cliPid !== message.cli_pid)) { reject("OBSERVER_MESSAGE_IDENTITY"); return; }
    record.cliPid = message.cli_pid;
    if (message.type === "collecting") { record.collecting = true; log("collector.collecting", { project, observer_pid: record.pid, cli_pid: record.cliPid }); }
    else if (message.type === "completed") { if (!record.requested || record.completion) reject("OBSERVER_UNSOLICITED_COMPLETION"); record.completion = message.result; log("collector.result", { project, observer_pid: record.pid, cli_pid: record.cliPid, result: message.result }); }
    else reject("OBSERVER_MESSAGE_SCHEMA");
  });
  child.on("exit", (code, signal) => { record.exit = { code, signal }; log("collector.exit", { project, observer_pid: record.pid, code, signal }); if (code !== 0 || signal !== null) reject("OBSERVER_WRAPPER_EXIT"); });
  child.on("close", (code, signal) => { record.close = { code, signal }; finalize(); });
  function finalize() {
    if (!record.close || !Object.values(record.streams).every(value => value.ended && value.closed) || record.closed) return;
    record.closed = true; clearTimeout(record.timer);
    const value = record.completion;
    if (!record.exit || record.exit.code !== record.close.code || record.exit.signal !== record.close.signal || record.close.code !== 0 || record.close.signal !== null) reject("OBSERVER_WRAPPER_CLOSE");
    if (!record.collecting || !value?.accepted || !value.controlled || !value.signal_sent || !value.collection_complete || value.pid !== record.cliPid || !["stdout", "stderr"].every(which => value.streams?.[which]?.ended && value.streams[which].closed)) reject("OBSERVER_EVIDENCE_INCOMPLETE");
    record.result = { ...value, accepted: !record.failure, failure: record.failure, observer_pid: record.pid, wrapper_exit: record.exit, wrapper_close: record.close, wrapper_streams: record.streams };
    log("collector.closed", { project, result: record.result });
  }
  record.request = message => {
    if (record.child !== child || record.pid !== child.pid || record.requested || record.closed) { reject("OBSERVER_CONTROLLER_IDENTITY"); return; }
    record.requested = true; child.ref(); child.channel?.ref(); child.stdout?.ref?.(); child.stderr?.ref?.();
    log("collector.controller.intent", { project, observer_pid: record.pid, type: message.type, token });
    child.send({ ...message, attempt, token, observer_pid: record.pid }, error => { log("collector.controller.sent", { project, observer_pid: record.pid, success: !error }); if (error) reject("OBSERVER_CONTROLLER_SEND"); });
    record.timer = setTimeout(() => {
      reject("OBSERVER_WRAPPER_TIMEOUT"); record.result = { accepted: false, failure: record.failure, observer_pid: record.pid };
      // No SIGKILL escalation. An unclosed owned observer makes cleanup fail, never PASS.
      if (child.connected) child.send({ type: "abort", attempt, token, observer_pid: record.pid }, error => { if (error) reject("OBSERVER_ABORT_SEND"); });
      unref(child);
    }, 15000);
  };
  unref(child); return record;
}
module.exports = { launch };
