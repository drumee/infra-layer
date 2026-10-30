"use strict";
const fs = require("node:fs"), path = require("node:path"), cp = require("node:child_process");
const T = require("../../../internal/system-tools"), { digest, volumeIdentity } = require("./ownership.cjs");
const endpoint = "unix:///var/run/docker.sock";
function createDocker(directory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const executable = T.resolveTrustedExecutable("docker"), environment = T.systemEnvironment("docker");
  let sequence = 0;
  function run(args) {
    const started = new Date().toISOString(), argv = ["--host", endpoint, ...args];
    let stdout = "", error;
    try { stdout = cp.execFileSync(executable, argv, { env: environment, encoding: "utf8", timeout: 30000, maxBuffer: 8 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }); }
    catch (cause) { error = cause; stdout = String(cause.stdout || ""); }
    const record = { seq: ++sequence, executable, argv, started, ended: new Date().toISOString(), exit_code: error ? error.status : 0, signal: error ? error.signal : null, stdout_hash: digest(stdout), stderr_hash: digest(error ? String(error.stderr || "") : "") };
    fs.appendFileSync(path.join(directory, "commands.jsonl"), JSON.stringify(record) + "\n", { mode: 0o600 });
    if (error) throw error;
    return stdout.trim();
  }
  const lines = s => s ? s.split("\n").filter(Boolean) : [];
  function daemon() {
    const context = run(["context", "show"]), id = JSON.parse(run(["info", "--format", "{{json .ID}}"]));
    const contextEndpoint = JSON.parse(run(["context", "inspect", context, "--format", "{{json .Endpoints.docker.Host}}"]));
    if (!id || context !== "default" || contextEndpoint !== endpoint) throw Object.assign(new Error("UNSUITABLE_DOCKER_CONTEXT"), { code: "UNSUITABLE_DOCKER_CONTEXT" });
    return { id, context, endpoint };
  }
  function volume(name) {
    const names = lines(run(["volume", "ls", "--format", "{{.Name}}"]));
    if (!names.includes(name)) return null;
    return volumeIdentity(JSON.parse(run(["volume", "inspect", "--format", "{{json .}}", name])));
  }
  function consumers(name) {
    // ps -a includes created, stopped and running consumers. Inspect verifies Mounts.
    const ids = lines(run(["ps", "-aq", "--no-trunc", "--filter", "volume=" + name]));
    return ids.map(id => {
      const c = JSON.parse(run(["container", "inspect", "--format", "{{json .}}", id]));
      if (!c.Mounts.some(m => m.Type === "volume" && m.Name === name)) throw Object.assign(new Error("MOUNT_REFERENCE_DIVERGENCE"), { code: "MOUNT_REFERENCE_DIVERGENCE" });
      return { id: c.Id, name: c.Name, state: c.State.Status, running: c.State.Running, volume: name, owner: (c.Config.Labels || {})["org.drumee.infra.owner"] || null };
    });
  }
  function observe(name) { return { daemon: daemon(), volume: volume(name), consumers: consumers(name) }; }
  function inventory() {
    const identity = daemon();
    const names = lines(run(["volume", "ls", "--format", "{{.Name}}"])).sort();
    const volumes = names.length ? lines(run(["volume", "inspect", "--format", "{{json .}}", ...names])).map(s => {
      const v = JSON.parse(s); return { name: v.Name, driver: v.Driver, scope: v.Scope, created: v.CreatedAt, metadata_hash: digest(volumeIdentity(v)) };
    }) : [];
    const ids = lines(run(["ps", "-aq", "--no-trunc"])).sort();
    const containers = ids.length ? lines(run(["container", "inspect", "--format", "{{json .}}", ...ids])).map(s => {
      const c = JSON.parse(s); return { id: c.Id, name: c.Name, ownership_hash: digest(c.Config.Labels || {}), mounts: c.Mounts.map(m => ({ type: m.Type, name: m.Name || null, destination: m.Destination })), networks_hash: digest(c.NetworkSettings.Networks || {}) };
    }) : [];
    const nets = lines(run(["network", "ls", "-q", "--no-trunc"])).sort();
    const networks = nets.length ? lines(run(["network", "inspect", "--format", "{{json .}}", ...nets])).map(s => {
      const n = JSON.parse(s); return { id: n.Id, name: n.Name, metadata_hash: digest({ labels: n.Labels, options: n.Options, containers: n.Containers, ipam: n.IPAM, driver: n.Driver }) };
    }) : [];
    return { daemon: identity, volumes, containers, networks };
  }
  return { run, daemon, volume, consumers, observe, inventory, removeExact: name => run(["volume", "rm", name]), commandCount: () => sequence };
}
module.exports = { createDocker };
