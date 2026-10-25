"use strict";
// Test-only evidence. Never changes command arguments, exceptions or assertions.
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), child = require("node:child_process");
const { trustedExecutable, trustedEnvironment } = require("./trusted-process");
const stackGetter = Object.getOwnPropertyDescriptor(new Error(), "stack").get;
const MAX_BYTES = 32768, MAX_STRING = 2048;
function property(value, key) {
  try {
    for (let object = value, depth = 0; object && depth < 8; object = Object.getPrototypeOf(object), depth++) {
      const descriptor = Object.getOwnPropertyDescriptor(object, key);
      if (!descriptor) continue;
      if (Object.hasOwn(descriptor, "value")) return descriptor.value;
      if (key === "stack" && descriptor.get === stackGetter) return descriptor.get.call(value);
      return "[Accessor omitted]";
    }
  } catch { return "[Unavailable]"; }
}
function createDiagnostics({ directory = process.env.IL514_DIAGNOSTIC_DIR, scenario = "qualification" } = {}) {
  directory ||= fs.mkdtempSync(path.join(os.tmpdir(), "infra-il514-diagnostic-"));
  const stat = fs.lstatSync(directory);
  if (!path.isAbsolute(directory) || fs.realpathSync(directory) !== directory || !stat.isDirectory() || stat.isSymbolicLink() || stat.uid !== process.getuid() || (stat.mode & 0o077)) throw Error("UNSAFE_DIAGNOSTIC_DIRECTORY");
  const sourceRevision = child.execFileSync(trustedExecutable("git"), ["rev-parse", "HEAD"], { cwd: path.resolve(__dirname, "../.."), encoding: "utf8", env: trustedEnvironment() }).trim();
  const secrets = new Set(), recent = []; let step = "initialization", identity = scenario, primary, traceCount = 0, serial = 0;
  const trace = fs.openSync(path.join(directory, "trace.jsonl"), "wx", 0o600);
  function text(input) {
    let value;
    try { value = String(input).slice(0, 65536); } catch { return "[Unprintable]"; }
    for (const secret of secrets) value = value.split(secret).join("[REDACTED]");
    value = value.replace(/-----BEGIN [^-\r\n]*PRIVATE KEY-----[\s\S]*?(?:-----END [^-\r\n]*PRIVATE KEY-----|$)/g, "[REDACTED PRIVATE KEY]")
      .replace(/\b(password|passwd|passphrase|token|secret|credential|authorization)["']?\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, "$1=[REDACTED]")
      .replace(/:\/\/[^\s/@:]+:[^\s/@]+@/g, "://[REDACTED]@")
      .replace(/\bBearer\s+[^\s,;]+/gi, "Bearer [REDACTED]");
    return value.length > MAX_STRING ? value.slice(0, MAX_STRING) + "[Truncated]" : value;
  }
  function safe(input) {
    const seen = new WeakSet(); let nodes = 0;
    function visit(value, depth = 0, key = "") {
      if (/(?:password|passwd|passphrase|token|secret|credential|authorization|private.?key|^(?:env|environment|auth|dockerconfig)$)/i.test(key)) return "[REDACTED]";
      if (++nodes > 128) return "[Node budget]";
      if (value === undefined) return "[Undefined]";
      if (value === null || typeof value === "boolean") return value;
      if (typeof value === "number") return Number.isFinite(value) ? value : "[" + value + "]";
      if (typeof value === "string") return text(value);
      if (typeof value === "bigint") return { type: "bigint", value: text(value) };
      if (typeof value === "symbol") return { type: "symbol", value: text(value) };
      if (typeof value === "function") return "[Function omitted]";
      if (depth >= 6) return "[Depth limit]";
      if (seen.has(value)) return "[Circular]"; seen.add(value);
      if (Buffer.isBuffer(value)) return { type: "Buffer", length: value.length, contents: "[Omitted]" };
      if (value instanceof Date) return { type: "Date", value: Number.isFinite(value.getTime()) ? value.toISOString() : "Invalid" };
      if (value instanceof Map) return { type: "Map", entries: Array.from(value).slice(0, 24).map(pair => visit(pair, depth + 1)) };
      if (value instanceof Set) return { type: "Set", values: Array.from(value).slice(0, 24).map(item => visit(item, depth + 1)) };
      if (Array.isArray(value)) { const items = value.slice(0, 24).map(item => visit(item, depth + 1)); if (value.length > 24) items.push({ omitted_items: value.length - 24 }); return items; }
      const names = value instanceof Error ? ["name", "code", "message", "operator", "stack", "exitCode", "exit_status", "signal", "actual", "expected", "cause", "command", "stdout", "stderr"] : Object.keys(value).slice(0, 24);
      const result = {};
      for (const name of names) { const item = property(value, name); if (item !== undefined || Object.hasOwn(value, name)) result[text(name)] = visit(item, depth + 1, name); }
      return result;
    }
    try { return visit(input); } catch { return "[Unserializable]"; }
  }
  function encode(value) {
    let result = safe(value), encoded = JSON.stringify(result);
    if (Buffer.byteLength(encoded) >= MAX_BYTES) {
      const error = result.error;
      result = { ...result, truncated: true, context: "[Output bound]", recentCommands: "[Output bound]" };
      if (error && typeof error === "object") {
        result.error = { ...error, actual: text(JSON.stringify(error.actual)), expected: text(JSON.stringify(error.expected)) };
        if (Object.hasOwn(error, "cause")) result.error.cause = text(JSON.stringify(error.cause));
      }
      encoded = JSON.stringify(result);
      if (Buffer.byteLength(encoded) >= MAX_BYTES) encoded = JSON.stringify({ timestamp: value.timestamp, scenario: text(identity), step: text(step), sourceRevision, truncated: true, error: { name: text(property(value.error, "name")), code: text(property(value.error, "code")), message: text(property(value.error, "message")), stack: text(property(value.error, "stack")), actual: "[Output bound]", expected: "[Output bound]" } });
    }
    return encoded + "\n";
  }
  function write(name, value) {
    const file = path.join(directory, name), descriptor = fs.openSync(file, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
    try { fs.writeSync(descriptor, encode(value)); } finally { fs.closeSync(descriptor); }
    return file;
  }
  function event(kind, context = {}) {
    const value = { timestamp: new Date().toISOString(), scenario: identity, step, kind, ...context };
    recent.push(safe(value)); if (recent.length > 12) recent.shift();
    if (traceCount++ < 512) fs.writeSync(trace, encode(value));
  }
  function command(args) {
    let omit = false;
    return args.slice(0, 64).map(arg => { if (omit) { omit = false; return "[Payload omitted]"; } if (["-e", "-c", "--env", "--password", "--token"].includes(String(arg))) omit = true; return text(arg); });
  }
  function output(programArgs, raw) {
    const selected = programArgs.slice(2);
    if (selected[0] === "inspect" || selected[0] === "container" && selected[1] === "inspect" || selected[0] === "network" && selected[1] === "inspect") {
      try {
        const parsed = JSON.parse(String(raw));
        function filter(value) {
          if (Array.isArray(value)) return value.slice(0, 24).map(filter);
          if (!value || typeof value !== "object") return "[Inspection scalar omitted]";
          const result = {};
          for (const key of ["id", "name", "image_id", "image", "running", "exit_code", "health", "owner", "project", "service", "revision", "started_at", "networks", "driver", "internal", "containers", "Id", "Name", "Driver", "Internal", "Containers"]) if (Object.hasOwn(value, key)) result[key] = value[key];
          if (value.State) result.State = { Status: value.State.Status, Running: value.State.Running, ExitCode: value.State.ExitCode, Restarting: value.State.Restarting, Health: value.State.Health?.Status };
          if (value.Config) result.Labels = Object.fromEntries(["org.drumee.infra.owner", "org.drumee.qualification", "com.docker.compose.project", "com.docker.compose.service"].map(key => [key, value.Config.Labels?.[key]]));
          if (value.NetworkSettings) result.Networks = value.NetworkSettings.Networks;
          return result;
        }
        return filter(parsed);
      } catch { return "[Unparseable inspection omitted]"; }
    }
    return text(raw);
  }
  function observeDocker() {
    const original = child.execFileSync;
    child.execFileSync = function observed(program, args, options) {
      if (program !== "/usr/bin/docker") return Reflect.apply(original, this, arguments);
      const id = ++serial, started = Date.now(), argv = command(args);
      event("docker-start", { id, command: [program, ...argv], uid: options?.uid ?? process.getuid(), gid: options?.gid ?? process.getgid() });
      try { const result = Reflect.apply(original, this, arguments); event("docker-success", { id, command: argv, exitCode: 0, elapsed_ms: Date.now() - started, stdout: output(args, result) }); return result; }
      catch (error) { event("docker-failure", { id, command: argv, exitCode: error.status, signal: error.signal, stdout: text(error.stdout || ""), stderr: text(error.stderr || "") }); throw error; }
    };
    return () => { child.execFileSync = original; };
  }
  function capture(error, context = {}) {
    if (primary) return;
    primary = { error, scenario: identity, step };
    const stack = property(error, "stack");
    primary.assertion = typeof stack === "string" ? stack.split("\n").find(line => /^\s*at /.test(line) && !line.includes("node:internal")) : undefined;
    const report = { timestamp: new Date().toISOString(), scenario: identity, step, assertion: primary.assertion, sourceRevision, execution: { cwd: process.cwd(), uid: process.getuid(), gid: process.getgid(), node: process.version }, name: property(error, "name"), code: property(error, "code"), error, recentCommands: [...recent].reverse(), context, traceRecords: Math.min(traceCount, 512), traceTruncated: traceCount > 512 };
    if (report.code === undefined) delete report.code;
    try { primary.file = write("failure.json", report); }
    catch (diagnosticError) { primary.artifactError = text(property(diagnosticError, "code") || property(diagnosticError, "message")); }
  }
  async function run(task) {
    try { await task(); }
    catch (error) {
      capture(error);
      const original = primary.error;
      console.error("QUALIFICATION_FAILED " + text(JSON.stringify({ scenario: text(primary.scenario), step: text(primary.step), code: text(property(original, "code")), message: text(property(original, "message")).slice(0, 240), assertion: text(primary.assertion), artifact: primary.file, artifactError: primary.artifactError })));
      if (error !== original) event("secondary-failure", { error });
      process.exitCode = 1;
    } finally { fs.closeSync(trace); }
  }
  return { directory, run, capture, observeDocker, event, step(name) { step = name; }, scenario(name) { identity = name; }, secret(value) { if (typeof value !== "string" || value.length < 8) throw Error("DIAGNOSTIC_SECRET_INVALID"); secrets.add(value); } };
}
module.exports = { createDiagnostics, MAX_BYTES };
