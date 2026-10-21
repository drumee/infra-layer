"use strict";
const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const dnsNode = require("node:dns/promises");
const { createClient } = require("redis");
const mariadb = require("mariadb");
const nodemailer = require("nodemailer");
const api = require("../../lib");
const { trace } = require("./trace");
const dns = require("../../capabilities/dns");
const db = require("../../capabilities/database");
const { createFilesystemSecretStore } = require("../../capabilities/secrets");
if (!process.env.IL2_METADATA) throw new Error("ISOLATED_SERVICE_HARNESS_REQUIRED");
const metadata = JSON.parse(fs.readFileSync(process.env.IL2_METADATA));
let plan = JSON.parse(fs.readFileSync(metadata.plan_file));
const store = createFilesystemSecretStore(path.join(metadata.fixtures, "secrets"), metadata.project);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function command(args, options = {}) { const result = spawnSync(trustedExecutable(args[0]), args.slice(1), { encoding: "utf8", timeout: 120000, maxBuffer: 4 * 1024 * 1024, ...options, env: trustedEnvironment(options.env) }); if (result.status !== 0) throw new Error(`TEST_COMMAND_FAILED ${args[0]} ${args[1]} ${result.status}`); return result.stdout; }
function compose(...args) { const start = process.hrtime.bigint(); trace(metadata.project, "test.compose.begin", { operation: args[0], services: args.filter(value => ["mail", "dkim", "capture"].includes(value)) }); try { return command(["docker", "compose", "-p", metadata.project, "-f", metadata.compose_file, ...args]); } finally { trace(metadata.project, "test.compose.end", { operation: args[0], duration_ms: Number(process.hrtime.bigint() - start) / 1e6 }); } }
function id(name) { return compose("ps", "-q", name).trim(); }
function execute(name, ...args) { return command(["docker", "exec", id(name), ...args]); }
async function wait(check) { for (let attempt = 0; attempt < 80; attempt++) { try { const result = await check(); if (result) return result; } catch { /* Keep the owning test failure; optional cleanup or diagnostic data may be unavailable. */ } await delay(200); } throw new Error("PROTOCOL_READINESS_TIMEOUT"); }
function resolver() { const result = new dnsNode.Resolver({ timeout: 1000, tries: 1 }); result.setServers([`127.0.0.1:${metadata.ports.dns}`]); return result; }
function rootSQL(sql) { return command(["docker", "exec", "-i", id("database"), "/bin/sh", "-c", 'MYSQL_PWD="$(cat /run/secrets/database-admin)" exec mariadb --protocol=socket -uroot --batch --skip-column-names'], { input: sql }); }
const database_client = { async query(sql, params = []) {
  let index = 0; const rendered = sql.replace(/\?/g, () => { const value = String(params[index++]); if (!/^[a-zA-Z0-9_+=.:/@-]+$/.test(value)) throw new Error("INVALID_FIXTURE_SQL_PARAMETER"); return `'${value}'`; });
  const output = rootSQL(rendered + ";\n").trim(); if (sql.startsWith("SELECT VERSION")) return [{ version: output }]; if (sql.startsWith("SELECT User")) return output ? output.split("\n").map((User) => ({ User })) : []; return [];
} };
async function redisClient(password = store.read(metadata.keys.redis, "redis").toString()) { const client = createClient({ url: `redis://:${encodeURIComponent(password)}@127.0.0.1:${metadata.ports.redis}`, socket: { reconnectStrategy: false } }); client.on("error", () => {}); try { await client.connect(); } catch (cause) { if (client.isOpen) await client.disconnect(); throw new Error("REDIS_AUTH_REJECTED", { cause }); } return client; }
let connectionSequence = 0;
function mailClient(auth = true, password) {
  const connection = ++connectionSequence;
  const logger = Object.fromEntries(["trace", "debug", "info", "warn", "error", "fatal"].map(level => [level, (data, format) => {
    const fields = { connection };
    if (data.tnx === "client" && typeof format === "string") { const verb = format.split(" ", 1)[0]; if (["EHLO", "HELO", "STARTTLS", "AUTH", "MAIL", "RCPT", "DATA", "QUIT"].includes(verb)) trace(metadata.project, "smtp.command", { ...fields, verb }); }
    else if (data.tnx === "server" && typeof format === "string" && /^[0-9]{3}/.test(format)) trace(metadata.project, "smtp.response", { ...fields, response_code: Number(format.slice(0, 3)) });
    else if (data.tnx === "network") trace(metadata.project, format === "Connection closed" ? "smtp.closed" : "smtp.network", fields);
    else if (["authenticated", "authfail"].includes(data.action)) trace(metadata.project, "smtp." + data.action, fields);
    else if (format === "Connection upgraded with STARTTLS") trace(metadata.project, "smtp.tls.established", fields);
    else if (data.err) trace(metadata.project, "smtp.error", { ...fields, code: data.err.code, command: data.err.command?.split(" ", 1)[0] });
  }]));
  trace(metadata.project, "smtp.client.created", { connection, auth_requested: auth });
  return nodemailer.createTransport({ logger, debug: true, host: "127.0.0.1", port: metadata.ports.mail, secure: false, requireTLS: true, connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000, name: "il2-fixture.example", ...(auth ? { auth: { user: "fixture", pass: password || store.read(metadata.keys.smtp, "mail").toString() } } : {}), tls: { servername: "drumee.lan", ca: fs.readFileSync(path.join(metadata.fixtures, "projections/ca_bundle")), rejectUnauthorized: true } }); }
const message = (subject) => ({ from: "sender@drumee.lan", to: "recipient@fixture.invalid", subject, text: "Isolated IL-2 protocol fixture. No external delivery." });
async function capturedCount() { try { const count = (await (await fetch(`http://127.0.0.1:${metadata.ports.capture}`)).json()).count; trace(metadata.project, "capture.count", { count }); return count; } catch (error) { trace(metadata.project, "capture.read.error", { code: error.cause?.code || "FETCH_FAILED" }); throw error; } }
test("managed descriptors parse native configs, publish only test loopback ports and mount no secret-store root", () => {
  for (const name of ["dns", "database", "redis", "mail", "dkim"]) { const inspected = JSON.parse(command(["docker", "inspect", id(name)]))[0]; assert.equal(inspected.HostConfig.Privileged, false); assert.equal(inspected.HostConfig.NetworkMode === "host", false); assert.equal(inspected.HostConfig.ReadonlyRootfs, true); assert.ok(Object.values(inspected.HostConfig.PortBindings || {}).flat().every((binding) => binding.HostIp === "127.0.0.1")); assert.ok(inspected.Mounts.every((mount) => mount.Source !== path.join(metadata.fixtures, "secrets"))); }
  execute("dns", "named-checkconf", "/config/bind9.conf"); execute("mail", "postfix", "-c", "/run/infra-mail/config", "check"); execute("dkim", "opendkim", "-n", "-x", "/config/opendkim.conf");
  const networks = JSON.parse(command(["docker", "inspect", "--format", "{{json .NetworkSettings.Networks}}", id("dkim")])); assert.equal(Object.keys(networks).length, 1); assert.ok(Object.keys(networks)[0].endsWith("-mail-control"));
});
test("real BIND9 serves declared A/SOA/TXT over UDP and TCP, NXDOMAIN and no unintended recursion", async () => {
  assert.deepEqual(await resolver().resolve4("drumee.lan"), ["192.168.50.10"]); assert.equal((await resolver().resolveSoa("drumee.lan")).serial, 1);
  assert.ok((await resolver().resolveTxt("infra._domainkey.drumee.lan"))[0].join("").startsWith("v=DKIM1; k=rsa; p="));
  assert.match(execute("dns", "dig", "@127.0.0.1", "-p", "1053", "+tcp", "drumee.lan", "A", "+short"), /192\.168\.50\.10/);
  await assert.rejects(() => resolver().resolve4("absent.drumee.lan"));
  const outside = execute("dns", "dig", "@127.0.0.1", "-p", "1053", "external.example", "A"); assert.match(outside, /status: REFUSED/); assert.doesNotMatch(outside, /flags:.*\bra\b/);
});
test("real service observer separates protocol success, Docker revision labels and unverified loaded configuration", async () => {
  const containers = Object.fromEntries(["dns", "database", "redis", "mail", "dkim"].map((name) => [name, id(name)]));
  const deployment = { contract_version: "2", id: metadata.project, desired_revision: plan.revision, plan, containers };
  const state = await api.inspectInfrastructure(deployment, require("../../adapters/docker/services"));
  const dns_state = state.capabilities.find((value) => value.name === "dns"); assert.equal(dns_state.protocol_functional, true); assert.equal(dns_state.observed_revision, plan.revision); assert.equal(dns_state.loaded_configuration, "unverified"); assert.equal(dns_state.readiness, "degraded");
  const db_state = state.capabilities.find((value) => value.name === "database"); assert.ok(db_state.diagnostic_codes.includes("UNEXPECTED_SERVICE_EXPOSURE")); // test-only publication is deliberately outside the production descriptor.
  const tls_state = state.capabilities.find((value) => value.name === "tls"); assert.equal(tls_state.pending_activation, true); assert.equal(api.diagnoseInfrastructure(state, plan.inputs.requirements).ready, false);
  const wrong = await api.inspectInfrastructure({ ...deployment, containers: { ...containers, dns: containers.redis } }, require("../../adapters/docker/services")); assert.ok(wrong.capabilities.find((value) => value.name === "dns").diagnostic_codes.includes("CAPABILITY_OWNERSHIP_MISMATCH"));
});
test("BIND9 restart and recreation preserve zone serial and TSIG fingerprint", async () => {
  const before = store.inspect(metadata.keys.tsig).fingerprint; const zone = fs.readFileSync(path.join(metadata.fixtures, "dns/infra-zone.json"));
  compose("restart", "dns"); await wait(async () => (await resolver().resolve4("drumee.lan"))[0] === "192.168.50.10");
  compose("up", "-d", "--no-deps", "--force-recreate", "dns"); await wait(async () => (await resolver().resolveSoa("drumee.lan")).serial === 1);
  assert.equal(store.inspect(metadata.keys.tsig).fingerprint, before); assert.deepEqual(fs.readFileSync(path.join(metadata.fixtures, "dns/infra-zone.json")), zone);
});
test("DNS port conflict and corrupt native configuration are rejected", () => {
  const result = spawnSync(trustedExecutable("docker"), ["run", "--rm", "--label", `org.drumee.infra.owner=${metadata.project}`, "-p", `127.0.0.1:${metadata.ports.dns}:1053`, plan.inputs.adapter_input.services.dns.image, "true"], { encoding: "utf8", timeout: 15000, env: trustedEnvironment() }); assert.notEqual(result.status, 0);
  const file = path.join(metadata.rendered, "bind9.conf"); const before = fs.readFileSync(file); fs.appendFileSync(file, "invalid_statement;\n");
  try { const invalid = spawnSync(trustedExecutable("docker"), ["compose", "-p", metadata.project, "-f", metadata.compose_file, "run", "--rm", "--no-deps", "dns", "named-checkconf", "/config/bind9.conf"], { encoding: "utf8", timeout: 15000, env: trustedEnvironment() }); assert.notEqual(invalid.status, 0); } finally { fs.writeFileSync(file, before); }
});
test("MariaDB fresh initialization creates no kernel/application schema and rejects incompatible engines", async () => {
  const schemas = rootSQL("SHOW DATABASES;\n").trim().split("\n"); assert.ok(schemas.every((value) => ["information_schema", "mysql", "performance_schema", "sys"].includes(value)));
  assert.match(rootSQL("SELECT VERSION();\n"), /^11\.4\./); const provisioned = await db.createServiceAccount(plan.inputs.spec.database, store, database_client, { authorized: true }); assert.equal(provisioned.created, true);
  await assert.rejects(() => db.createServiceAccount(plan.inputs.spec.database, store, { query: async () => [{ version: "10.6.1" }] }, { authorized: true }), { code: "DATABASE_VERSION_INCOMPATIBLE" });
  const file = path.join(metadata.rendered, "mariadb.cnf"); const before = fs.readFileSync(file); fs.appendFileSync(file, "invalid_il2_option=1\n");
  try { const checked = spawnSync(trustedExecutable("docker"), ["compose", "-p", metadata.project, "-f", metadata.compose_file, "run", "--rm", "--no-deps", "--entrypoint", "mariadbd", "database", "--defaults-extra-file=/config/mariadb.cnf", "--verbose", "--help"], { encoding: "utf8", timeout: 20000, env: trustedEnvironment() }); assert.notEqual(checked.status, 0); } finally { fs.writeFileSync(file, before); }
});
test("MariaDB service account connects over TCP, rejects wrong credentials and owns no schema grants", async () => {
  const options = { host: "127.0.0.1", port: metadata.ports.database, user: plan.inputs.spec.database.service_user, password: store.read(metadata.keys.database, "database-client").toString(), connectTimeout: 5000 };
  const client = await mariadb.createConnection(options); try { assert.match((await client.query("SELECT VERSION() AS version"))[0].version, /^11\.4\./); const grants = await client.query("SHOW GRANTS"); assert.ok(JSON.stringify(grants).includes("USAGE")); } finally { await client.end(); }
  await assert.rejects(() => mariadb.createConnection({ ...options, password: "invalid-fixture-credential" }));
});
test("MariaDB existing-volume restart/recreation preserve data and credentials; repeated account provision does not rotate", async () => {
  const before = store.inspect(metadata.keys.admin).fingerprint; rootSQL("CREATE DATABASE infra_probe; CREATE TABLE infra_probe.durable(value INT); INSERT INTO infra_probe.durable VALUES (7);\n");
  compose("restart", "database"); await wait(() => rootSQL("SELECT value FROM infra_probe.durable;\n").trim() === "7");
  compose("up", "-d", "--no-deps", "--force-recreate", "database"); await wait(() => rootSQL("SELECT value FROM infra_probe.durable;\n").trim() === "7"); assert.equal(store.inspect(metadata.keys.admin).fingerprint, before);
  assert.equal((await db.createServiceAccount(plan.inputs.spec.database, store, database_client, { authorized: true })).created, false);
});
test("Redis authenticated connection and pub/sub work, unauthenticated/wrong clients reject", async () => {
  const client = await redisClient(); const subscriber = client.duplicate(); subscriber.on("error", () => {}); await subscriber.connect();
  try { assert.equal(await client.ping(), "PONG"); let received; await subscriber.subscribe("il2-fixture", (value) => { received = value; }); await client.publish("il2-fixture", "fixture-event"); await wait(() => received === "fixture-event"); await subscriber.unsubscribe("il2-fixture"); }
  finally { await subscriber.quit(); await client.quit(); }
  await assert.rejects(() => redisClient("wrong-fixture-password"));
  const anonymous = createClient({ socket: { host: "127.0.0.1", port: metadata.ports.redis, reconnectStrategy: false } }); anonymous.on("error", () => {}); await anonymous.connect(); try { await assert.rejects(() => anonymous.ping()); } finally { await anonymous.quit(); }
});
test("Redis AOF survives recreation with the same secret fingerprint and authenticated reconnection", async () => {
  const before = store.inspect(metadata.keys.redis).fingerprint; let client = await redisClient(); await client.set("il2-durable", "retained"); await client.quit();
  compose("restart", "redis"); await wait(async () => { const connection = await redisClient(); try { return (await connection.get("il2-durable")) === "retained"; } finally { await connection.quit(); } });
  compose("up", "-d", "--no-deps", "--force-recreate", "redis"); await wait(async () => { const connection = await redisClient(); try { return (await connection.get("il2-durable")) === "retained"; } finally { await connection.quit(); } }); assert.equal(store.inspect(metadata.keys.redis).fingerprint, before);
});
test("revision-pinned Essentials RedisStore authenticates via redisUrl including duplicate pub/sub clients", () => {
  const directory = path.join(metadata.fixtures, "runtime-redis"); require("../../capabilities/redis").materializeClientConfiguration(store, metadata.keys.redis, { host: "127.0.0.1", port: metadata.ports.redis, transport: "tcp" }, directory, { authorized: true, owner: metadata.project });
  const output = command([process.execPath, path.join(__dirname, "runtime-redis.js")], { env: { ...process.env, credential_dir: directory, instance_name: "", IL2_REDIS_STORE_SOURCE: metadata.runtime_redis }, timeout: 15000 }); assert.match(output, /PINNED_RUNTIME_REDIS_AUTH_PUBSUB_OK/);
});
test("Redis ephemeral descriptor loses reconstructible state on recreation and rejects malformed configuration", () => {
  const inputs = JSON.parse(JSON.stringify(plan.inputs)); inputs.spec.dns = { mode: "none" }; delete inputs.spec.database; delete inputs.spec.mail; delete inputs.spec.tls;
  inputs.spec.redis.persistence = "ephemeral"; delete inputs.spec.redis.state_resource; inputs.requirements.capabilities = ["redis"];
  inputs.adapter_input.project = metadata.project + "-ephemeral"; inputs.adapter_input.services = { redis: inputs.adapter_input.services.redis }; delete inputs.adapter_input.services.redis.data_source;
  const generated = api.planInfrastructure(inputs.spec, inputs.requirements, inputs.adapter_input); assert.equal(generated.applicable, true);
  const directory = path.join(metadata.directory, "ephemeral"); api.renderPlan(generated, directory); const file = path.join(directory, "redis.compose.json");
  const run = (...args) => command(["docker", "compose", "-p", inputs.adapter_input.project, "-f", file, ...args]);
  const cli = (container, action) => command(["docker", "exec", container, "/bin/sh", "-c", 'REDISCLI_AUTH="$(cat /run/secrets/redis-auth)" redis-cli ' + action]);
  try {
    run("up", "-d", "--wait"); let container = run("ps", "-q", "redis").trim(); assert.equal(cli(container, "SET reconstructible fixture").trim(), "OK");
    run("up", "-d", "--force-recreate", "--wait"); container = run("ps", "-q", "redis").trim(); assert.equal(cli(container, "GET reconstructible").trim(), "");
    fs.appendFileSync(path.join(directory, "redis.conf"), "invalid_il2_option yes\n"); const result = spawnSync(trustedExecutable("docker"), ["compose", "-p", inputs.adapter_input.project, "-f", file, "run", "--rm", "--no-deps", "redis"], { encoding: "utf8", timeout: 15000, env: trustedEnvironment() }); assert.notEqual(result.status, 0);
  } finally { run("down"); }
});
test("SMTP STARTTLS/authenticated submission reaches only the local capture sink; unauthorized relay fails", async () => {
  const client = mailClient(); try { const result = await client.sendMail(message("authorized local capture")); assert.ok(result.accepted.includes("recipient@fixture.invalid")); } finally { client.close(); }
  await wait(async () => (await capturedCount()) >= 1);
  for (const client of [mailClient(false), mailClient(true, "invalid-fixture-password")]) { try { await assert.rejects(() => client.sendMail(message("must be rejected"))); } finally { client.close(); } }
  const captured = fs.readdirSync(path.join(metadata.fixtures, "capture")).filter((name) => name.endsWith(".eml")); assert.equal(captured.length, 1);
});
function verifyDkim(raw, public_key) {
  const message = raw.toString().replace(/\r?\n/g, "\r\n"); const separator = message.indexOf("\r\n\r\n"); const header_lines = message.slice(0, separator).split(/\r\n(?![ \t])/); const dkim_header = header_lines.find((value) => /^dkim-signature:/i.test(value)); assert.ok(dkim_header);
  const parameters = Object.fromEntries(dkim_header.slice(dkim_header.indexOf(":") + 1).replace(/\r\n[ \t]+/g, " ").split(";").map((value) => value.trim()).filter(Boolean).map((value) => [value.slice(0, value.indexOf("=")), value.slice(value.indexOf("=") + 1).replace(/\s/g, "")]));
  assert.equal(parameters.d, "drumee.lan"); assert.equal(parameters.s, "infra"); const body = message.slice(separator + 4).split("\r\n").map((value) => value.replace(/[ \t]+/g, " ").replace(/[ \t]+$/, "")).join("\r\n").replace(/(?:\r\n)*$/, "\r\n"); assert.equal(crypto.createHash("sha256").update(body).digest("base64"), parameters.bh);
  const canonical = (value) => { const index = value.indexOf(":"); return value.slice(0, index).toLowerCase() + ":" + value.slice(index + 1).replace(/\r\n[ \t]+/g, " ").replace(/[ \t]+/g, " ").trim(); };
  const remaining = [...header_lines]; const selected = [];
  for (const name of parameters.h.split(":")) { for (let index = remaining.length - 1; index >= 0; index--) if (remaining[index].slice(0, remaining[index].indexOf(":")).toLowerCase() === name.toLowerCase()) { selected.push(canonical(remaining[index]) + "\r\n"); remaining.splice(index, 1); break; } }
  selected.push(canonical(dkim_header.replace(/\bb\s*=[^;]*/, "b=")));
  assert.equal(crypto.verify("RSA-SHA256", Buffer.from(selected.join("")), { key: Buffer.from(public_key, "base64"), type: "spki", format: "der" }, Buffer.from(parameters.b, "base64")), true);
}
test("OpenDKIM signs captured bytes with the persistent key and valid public TXT material", () => {
  const name = fs.readdirSync(path.join(metadata.fixtures, "capture")).find((name) => name.endsWith(".eml")); verifyDkim(fs.readFileSync(path.join(metadata.fixtures, "capture", name)), plan.inputs.spec.mail.dkim.public_key);
  const before = store.inspect(metadata.keys.dkim).fingerprint; compose("restart", "dkim"); assert.equal(store.inspect(metadata.keys.dkim).fingerprint, before);
});
test("Postfix queue survives capture outage and mail container recreation, then retries locally without key regeneration", async () => {
  const before = store.inspect(metadata.keys.smtp).fingerprint; const count = await capturedCount(); compose("stop", "capture"); const client = mailClient(); try { assert.ok((await client.sendMail(message("queued during capture outage"))).accepted.length); } finally { client.close(); }
  await wait(() => execute("mail", "postqueue", "-c", "/run/infra-mail/config", "-j").trim().length > 0);
  compose("up", "-d", "--no-deps", "--force-recreate", "mail"); await wait(() => { execute("mail", "postfix", "-c", "/run/infra-mail/config", "status"); return true; }); assert.ok(execute("mail", "postqueue", "-c", "/run/infra-mail/config", "-j").trim().length > 0);
  compose("start", "capture"); await wait(async () => { execute("mail", "postqueue", "-c", "/run/infra-mail/config", "-f"); return (await capturedCount()) > count; }); assert.equal(store.inspect(metadata.keys.smtp).fingerprint, before);
});
test("controlled relay verifies STARTTLS trust and authenticates outbound to an isolated capture alias", async () => {
  const next = JSON.parse(JSON.stringify(plan.inputs)); next.spec.mail.mode = "relay"; next.spec.mail.relay_tls = "required"; next.spec.mail.relay_endpoint.host = "drumee.lan"; next.spec.mail.relay_user = "capture"; next.spec.mail.relay_secret_ref = metadata.relay_ref;
  next.adapter_input.resource_sources.push({ ref: metadata.relay_ref, source: path.join(metadata.fixtures, "projections/relay") });
  const generated = api.planInfrastructure(next.spec, next.requirements, next.adapter_input); assert.equal(generated.applicable, true); api.renderPlan(generated, metadata.rendered);
  const compose_value = JSON.parse(fs.readFileSync(metadata.compose_file)); const ports = compose_value.services.mail.ports;
  compose_value.services.mail = JSON.parse(generated.artifacts.find((value) => value.path === "mail.compose.json").content).services.mail; compose_value.services.mail.ports = ports;
  compose_value.services.capture.networks = { kernel: { aliases: ["drumee.lan"] } }; compose_value.services.capture.environment = { CAPTURE_REQUIRE_AUTH: "1" };
  fs.writeFileSync(metadata.compose_file, JSON.stringify(compose_value)); const before = await capturedCount();
  compose("up", "-d", "--no-deps", "--force-recreate", "--wait", "capture", "mail");
  const client = mailClient(); try { await client.sendMail(message("verified local TLS relay")); } finally { client.close(); }
  await wait(async () => (await capturedCount()) > before); assert.equal((await (await fetch(`http://127.0.0.1:${metadata.ports.capture}`)).json()).authentication_required, true);
  assert.equal(execute("mail", "postconf", "-c", "/run/infra-mail/config", "-h", "smtp_tls_security_level").trim(), "verify");
  assert.equal(execute("mail", "postconf", "-c", "/run/infra-mail/config", "-h", "smtp_sasl_auth_enable").trim(), "yes");
  plan = generated;
});
test("BIND9 zone change explicitly advances serial and serves declared AAAA records without selecting container addresses", async () => {
  const next = JSON.parse(JSON.stringify(plan.inputs)); next.spec.dns.ipv4 = "192.168.50.11"; next.spec.dns.ipv6 = "2001:db8::10"; next.spec.dns.ipv6_reachable = true; next.spec.dns.serial = 2;
  dns.prepareZone("drumee.lan", next.spec.dns, next.spec.mail.dkim, path.join(metadata.fixtures, "dns"), { authorized: true, owner: metadata.project });
  const generated = api.planInfrastructure(next.spec, next.requirements, next.adapter_input); api.renderPlan(generated, metadata.rendered);
  const compose_value = JSON.parse(fs.readFileSync(metadata.compose_file)); compose_value.services.dns = JSON.parse(generated.artifacts.find((value) => value.path === "dns.compose.json").content).services.dns; fs.writeFileSync(metadata.compose_file, JSON.stringify(compose_value));
  compose("up", "-d", "--no-deps", "--force-recreate", "dns"); await wait(async () => (await resolver().resolveSoa("drumee.lan")).serial === 2);
  assert.deepEqual(await resolver().resolve4("drumee.lan"), ["192.168.50.11"]); assert.deepEqual(await resolver().resolve6("drumee.lan"), ["2001:db8::10"]);
  // This validates record transport over IPv4; LAN/IPv6 reachability is not claimed.
});
