"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const api = require("../../lib");
const F = require("../../lib/filesystem-safety");
const { createFilesystemSecretStore } = require("../../capabilities/secrets");
const tls = require("../../capabilities/tls");
const dns = require("../../capabilities/dns");
const { dkimRecord } = require("../../capabilities/mail");
const { serviceInputs } = require("../support/service-inputs");
const root = path.resolve(__dirname, "../..");
function command(args, options = {}) { const result = spawnSync(args[0], args.slice(1), { encoding: "utf8", timeout: 300000, maxBuffer: 8 * 1024 * 1024, ...options }); if (result.status !== 0) throw Object.assign(new Error(`IL2_COMMAND_FAILED: ${args[0]} ${args[1]} status ${result.status}`), { code: "IL2_COMMAND_FAILED", detail: result.stderr || result.stdout }); return result.stdout; }
const freePort = () => new Promise((resolve) => { const listener = net.createServer(); listener.listen(0, "127.0.0.1", () => { const port = listener.address().port; listener.close(() => resolve(port)); }); });
async function main() {
  command(["docker", "version", "--format", "{{.Server.Version}}"]);
  const project = `drumee-il2-test-${crypto.randomBytes(4).toString("hex")}`;
  assert.equal(command(["docker", "ps", "-a", "--filter", `label=com.docker.compose.project=${project}`, "--format", "{{.ID}}"] ).trim(), "");
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), project + "-")); fs.chmodSync(directory, 0o755);
  const image = `drumee-il2-services:${project}`; const capture_image = `drumee-il2-capture:${project}`;
  const compose_file = path.join(directory, "rendered/test.compose.json"); const images = [];
  const redactions = [];
  let started = false;
  try {
    for (const tag of [image, capture_image]) if (spawnSync("docker", ["image", "inspect", tag], { stdio: "ignore" }).status === 0) throw new Error("TEST_IMAGE_COLLISION");
    command(["docker", "build", "--label", `org.drumee.infra.owner=${project}`, "-f", path.join(root, "capabilities/docker/Dockerfile.services"), "-t", image, root], { stdio: "inherit" }); images.push(image);
    const image_id = command(["docker", "image", "inspect", image, "--format", "{{.Id}}"] ).trim();
    const fixtures = path.join(directory, "fixtures"); fs.mkdirSync(fixtures);
    const ports = { dns: await freePort(), database: await freePort(), redis: await freePort(), mail: await freePort(), capture: await freePort() };
    const value = serviceInputs(fixtures, project, image_id); value.adapter_input.services.dns.bindings.forEach((entry) => { entry.host_port = ports.dns; });
    const relay_ref = { resource: "mail", key: "relay" }; value.spec.secrets.resources.push({ ref: relay_ref, type: "smtp-relay-credential", consumers: ["capture", "mail"] });
    const store = createFilesystemSecretStore(path.join(fixtures, "secrets"), project);
    for (const descriptor of value.spec.secrets.resources) { if (descriptor.type === "smtp-relay-credential") store.import(descriptor, Buffer.from("fixture-" + crypto.randomBytes(24).toString("hex")), { authorized: true }); else store.ensure(descriptor, { authorized: true }); }
    for (const descriptor of value.spec.secrets.resources) redactions.push(store.read(descriptor.ref, descriptor.consumers[0]).toString());
    const prepared = tls.prepareLocalCertificate({ owner: project, directory: path.join(fixtures, "tls"), hostname: "drumee.lan", ca_key_ref: value.keys.ca, private_key_ref: value.keys.leaf, leaf_days: 30, renew_before_days: 10 }, store, { authorized: true, create_ca: true });
    const projections = path.join(fixtures, "projections"); fs.mkdirSync(projections, { mode: 0o700 });
    for (const [name, consumer] of [["admin", "database"], ["redis", "redis"], ["leaf", "mail"], ["smtp", "mail"], ["dkim", "dkim"], ["tsig", "dns"]]) store.materialize(value.keys[name], consumer, path.join(projections, name));
    F.atomic(path.join(projections, "certificate"), fs.readFileSync(prepared.file)); F.atomic(path.join(projections, "ca_bundle"), prepared.ca_certificate_pem);
    store.materialize(relay_ref, "capture", path.join(projections, "relay"));
    for (const name of ["dns", "database", "redis", "mail", "capture"]) fs.mkdirSync(path.join(fixtures, name), { mode: 0o700 });
    value.spec.mail.dkim.public_key = dkimRecord("drumee.lan", "infra", store, value.keys.dkim).public_key;
    dns.prepareZone("drumee.lan", value.spec.dns, value.spec.mail.dkim, path.join(fixtures, "dns"), { authorized: true, owner: project });
    const plan = api.planInfrastructure(value.spec, value.requirements, value.adapter_input); assert.equal(plan.applicable, true, JSON.stringify(plan.diagnostics));
    const rendered = path.join(directory, "rendered"); api.renderPlan(plan, rendered);
    const compose = { services: {}, networks: {} };
    for (const artifact of plan.artifacts.filter((entry) => entry.path.endsWith(".compose.json"))) { const fragment = JSON.parse(artifact.content); Object.assign(compose.services, fragment.services); Object.assign(compose.networks, fragment.networks); }
    for (const [id, network] of Object.entries(compose.networks)) { if (spawnSync("docker", ["network", "inspect", network.name], { stdio: "ignore" }).status === 0) throw new Error("TEST_NETWORK_COLLISION"); compose.networks[id] = { name: network.name, ...(id === "mail-control" ? { internal: true } : {}) }; }
    // Test-only loopback publication; production fragments publish DB/Redis/mail none.
    for (const name of ["database", "redis", "mail"]) compose.services[name].ports = [{ target: value.spec[name === "mail" ? "mail" : name].endpoint.port, published: String(ports[name]), host_ip: "127.0.0.1", protocol: "tcp" }];
    const context = path.join(directory, "capture-build"); fs.mkdirSync(context); fs.copyFileSync(path.join(__dirname, "Dockerfile.capture"), path.join(context, "Dockerfile")); fs.copyFileSync(path.join(__dirname, "capture.js"), path.join(context, "capture.js")); fs.cpSync(path.join(root, "node_modules"), path.join(context, "node_modules"), { recursive: true });
    command(["docker", "build", "--label", `org.drumee.infra.owner=${project}`, "-t", capture_image, context], { stdio: "inherit" }); images.push(capture_image);
    compose.services.capture = { image: capture_image, user: `${process.getuid()}:${process.getgid()}`, read_only: true, cap_drop: ["ALL"], security_opt: ["no-new-privileges:true"], networks: ["kernel"], tmpfs: ["/tmp:rw,nosuid,size=16777216"], volumes: [
      { type: "bind", source: path.join(fixtures, "capture"), target: "/capture" },
      ...[["certificate", "/keys/certificate"], ["leaf", "/keys/leaf"], ["relay", "/keys/relay-auth"]].map(([name, target]) => ({ type: "bind", source: path.join(projections, name), target, read_only: true }))
    ], ports: [{ target: 8025, published: String(ports.capture), host_ip: "127.0.0.1", protocol: "tcp" }], labels: { "org.drumee.infra.owner": project },
      healthcheck: { test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:8025').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"], interval: "2s", timeout: "2s", retries: 15 } };
    fs.writeFileSync(compose_file, JSON.stringify(compose)); const plan_file = path.join(directory, "plan.json"); fs.writeFileSync(plan_file, JSON.stringify(plan));
    // Acquire only the exact declared source revision for the real Redis client.
    const dependency = require("../integration/kernel-dependencies.json"); const source = path.join(directory, "redis-source"); fs.mkdirSync(source);
    command(["git", "init", "-q", source]); command(["git", "-C", source, "fetch", "--quiet", "--depth=1", "--filter=blob:none", dependency.repository, dependency.revision]);
    const runtime_redis = path.join(source, "redis-store.js"); fs.writeFileSync(runtime_redis, command(["git", "-C", source, "show", `${dependency.revision}:sources/server-essentials/lib/redis-store.js`])); fs.cpSync(path.join(root, "node_modules"), path.join(source, "node_modules"), { recursive: true });
    const metadata = { project, directory, fixtures, rendered, ports, revision: plan.revision, compose_file, plan_file, keys: value.keys, relay_ref, runtime_redis };
    const metadata_file = path.join(directory, "metadata.json"); fs.writeFileSync(metadata_file, JSON.stringify(metadata)); console.log(JSON.stringify({ project, ports, revision: plan.revision, image_id }));
    const docker = (...args) => command(["docker", "compose", "-p", project, "-f", compose_file, ...args]);
    docker("config", "-q");
    started = true;
    docker("run", "--rm", "--no-deps", "dns", "named-checkconf", "/config/bind9.conf");
    docker("run", "--rm", "--no-deps", "dns", "named-checkzone", "drumee.lan", `/var/cache/bind/${dns.zoneFile("drumee.lan", value.spec.dns, value.spec.mail.dkim).file}`);
    docker("run", "--rm", "--no-deps", "dkim", "-n", "-x", "/config/opendkim.conf");
    docker("up", "-d", "--wait", "--wait-timeout", "90");
    const tested = spawnSync(process.execPath, ["--test", path.join(__dirname, "services.test.js")], { stdio: "inherit", timeout: 300000, env: { ...process.env, IL2_METADATA: metadata_file } }); if (tested.status !== 0) throw new Error("IL2_SERVICE_TESTS_FAILED");
    const logs = docker("logs", "--no-color"); for (const descriptor of value.spec.secrets.resources) { const bytes = store.read(descriptor.ref, descriptor.consumers[0]).toString(); assert.equal(logs.includes(bytes), false); } assert.doesNotMatch(logs, /BEGIN (?:RSA )?PRIVATE KEY/);
  } catch (error) {
    let diagnostic = String(error.detail || "");
    if (started) diagnostic += spawnSync("docker", ["inspect", "--format", "{{json .State.Health}}", `${project}-dns-1`], { encoding: "utf8", timeout: 15000 }).stdout || "";
    if (started) diagnostic += spawnSync("docker", ["compose", "-p", project, "-f", compose_file, "logs", "--no-color"], { encoding: "utf8", timeout: 15000, maxBuffer: 1000000 }).stdout || "";
    for (const value of redactions) diagnostic = diagnostic.split(value).join("[redacted]");
    console.error(diagnostic.slice(-10000)); throw error;
  } finally {
    if (started) command(["docker", "compose", "-p", project, "-f", compose_file, "down"]);
    assert.equal(command(["docker", "ps", "-a", "--filter", `label=com.docker.compose.project=${project}`, "--format", "{{.ID}}"] ).trim(), "");
    for (const image of images.reverse()) command(["docker", "image", "rm", image]);
    // Rootful native service initialization changes only this test's owned dirs.
    command(["docker", "run", "--rm", "--network", "none", "--label", `org.drumee.infra.owner=${project}`, "--mount", `type=bind,source=${directory},target=/cleanup`, "node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392", "node", "-e", "require('fs').rmSync('/cleanup/fixtures',{recursive:true,force:true})"]);
    fs.rmSync(directory, { recursive: true, force: true }); console.log(`IL2 owned resources cleaned: ${project}`);
  }
}
main().catch((error) => { console.error(error.code || error.message); process.exitCode = 1; });
