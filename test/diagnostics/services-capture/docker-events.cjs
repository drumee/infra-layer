"use strict";
// Dedicated observer stays responsive while the canonical runner uses spawnSync.
const { spawn } = require("node:child_process");
const p1 = require("../postfix-http/observe.cjs");
const [project, started, file, attempt] = process.argv.slice(2);
if (!/^drumee-il2-test-[0-9a-f]{8}(?:-ephemeral)?$/.test(project)) throw new Error("P2_INVALID_PROJECT");
const log = p1.logger(attempt, "docker-observer", file);
let stopping = false, buffer = "";
log("collector.start", { project });
const cli = spawn("/usr/bin/docker", ["events", "--since", started, "--filter", `label=com.docker.compose.project=${project}`, "--format", "{{json .}}"], { stdio: ["ignore", "pipe", "ignore"], env: { PATH: "/usr/bin:/bin", HOME: require("node:os").userInfo().homedir } });
cli.stdout.setEncoding("utf8");
cli.stdout.on("data", data => {
  buffer += data;
  if (buffer.length > 131072) throw new Error("P2_EVENT_BUFFER_LIMIT");
  for (;;) {
    const index = buffer.indexOf("\n"); if (index < 0) break;
    const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
    const value = JSON.parse(line), attributes = value.Actor?.Attributes || {};
    if (attributes["com.docker.compose.project"] && attributes["com.docker.compose.project"] !== project) throw new Error("P2_EVENT_OWNER_MISMATCH");
    const [action, detail] = String(value.Action).split(": ");
    log("docker.event", { project, action, type: value.Type, id: value.Actor.ID, service: attributes["com.docker.compose.service"], time_nano: /"timeNano":\s*(\d+)/.exec(line)?.[1], health: action === "health_status" && ["starting", "healthy", "unhealthy"].includes(detail) ? detail : undefined, exit_code: action === "die" ? attributes.exitCode : undefined });
  }
});
cli.on("error", error => { log("collector.error", { error: p1.errorValue(error) }); process.exitCode = 1; });
cli.on("close", (code, signal) => { log("collector.completed", { code, signal, stopping, partial_line: buffer.length !== 0 }); if (!stopping || buffer.length || (code !== 0 && signal !== "SIGTERM")) process.exitCode = 1; });
process.on("SIGTERM", () => { stopping = true; log("collector.stop.requested"); cli.kill("SIGTERM"); });
process.on("exit", () => { if (cli.exitCode === null && !cli.killed) cli.kill("SIGTERM"); });
