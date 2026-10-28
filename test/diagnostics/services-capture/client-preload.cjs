"use strict";
const fs = require("node:fs"), path = require("node:path"), child = require("node:child_process");
const { beforeEach, afterEach, mock } = require("node:test");
const p1 = require("./observe.cjs"), { install } = require("./state.cjs");
const config = require("./attempt.json"), names = require("./cases.json");
const metadata = JSON.parse(fs.readFileSync(process.env.IL2_METADATA));
const log = p1.logger(config.attempt, "suite-client", path.join(config.output, "client.jsonl"));
p1.processEvents(log);
const state = install(metadata.ports.capture, log);
state.event("fixture.ready", { project: metadata.project, ports: metadata.ports, test_count: names.length });
beforeEach(context => { state.begin(names.indexOf(context.name) + 1); });
afterEach(() => { state.end(); });
const original = child.spawnSync;
// Metadata only: never emit Docker exec argv, SQL, environment or credentials.
const substitution = mock.method(child, "spawnSync", function(program, args, options) {
  const docker = program === "/usr/bin/docker", compose = docker && args[0] === "compose";
  const operation = compose ? args[5] : docker ? args[0] : "child";
  const services = args.filter(value => ["dns", "database", "redis", "mail", "dkim", "capture"].includes(value));
  if (compose && (operation === "down" || (operation === "stop" && services.includes("capture")) || (operation === "up" && args.includes("--force-recreate") && services.includes("capture")))) state.shutdown(operation, services);
  state.event("command.start", { tool: docker ? "docker" : "node", operation, services, project: compose ? args[2] : undefined });
  const result = original.call(this, program, args, options);
  state.event("command.completed", { tool: docker ? "docker" : "node", operation, services, code: result.status, signal: result.signal });
  return result;
});
process.on("exit", () => { state.event("suite.pending.at.exit", { pending_application: state.pending() }); substitution.mock.restore(); });
