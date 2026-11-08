"use strict";
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), crypto = require("node:crypto"), http = require("node:http"), assert = require("node:assert/strict"), { createRequire } = require("node:module"), { execFileSync } = require("node:child_process");
const { serviceInputs } = require("../support/service-inputs");
const command = (program, args, options = {}) => execFileSync(program, args, { encoding: "utf8", stdio: "pipe", timeout: 300000, ...options });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function freePort() { const s = require("node:net").createServer(); await new Promise(resolve => s.listen(0, "127.0.0.1", resolve)); const p = s.address().port; await new Promise(resolve => s.close(resolve)); return p; }
function status(port) { return new Promise((resolve, reject) => { http.get({ host: "127.0.0.1", port, path: "/", agent: false }, res => { let data = ""; res.on("data", x => data += x); res.on("end", () => { try { resolve(JSON.parse(data)); } catch { reject(Error("INVALID_FIXTURE_STATUS")); } }); }).on("error", reject); }); }
async function main() {
  const input = JSON.parse(fs.readFileSync(process.argv[2])), base = fs.mkdtempSync(path.join(os.tmpdir(), "infra-smtp-auth-")), consumer = base + "/consumer"; fs.mkdirSync(consumer);
  fs.writeFileSync(consumer + "/package.json", JSON.stringify({ private: true, dependencies: { "@drumee/infra-layer": "file:" + path.resolve(input.archive) } }), { mode: 0o600 });
  command("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: consumer });
  const req = createRequire(consumer + "/package.json"), directory = consumer + "/node_modules/@drumee/infra-layer", api = req("@drumee/infra-layer"), L = req("@drumee/infra-layer/lifecycle"), D = require(directory + "/lifecycle/docker");
  assert.ok(fs.realpathSync(req.resolve("@drumee/infra-layer")).startsWith(directory + "/"));
  const report = { source: input.source, version: req("@drumee/infra-layer/package.json").version, archive_sha256: crypto.createHash("sha256").update(fs.readFileSync(input.archive)).digest("hex"), tools_image: input.tools_image, cases: [], assertions: 0, external_network: false, real_owner_credentials_read: false };
  const check = (x, y) => { assert.deepEqual(x, y); report.assertions++; };
  const context = base + "/provider-build"; fs.mkdirSync(context); fs.cpSync(path.resolve(__dirname, "../../node_modules"), context + "/node_modules", { recursive: true }); fs.copyFileSync(__dirname + "/provider.cjs", context + "/provider.cjs");
  fs.writeFileSync(context + "/Dockerfile", 'FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392\nCOPY node_modules /fixture/node_modules\nCOPY provider.cjs /fixture/provider.cjs\nUSER 1000:1000\nENTRYPOINT ["node", "/fixture/provider.cjs"]\n');
  const suffix = crypto.randomBytes(5).toString("hex"), providerTag = "infra-smtp-auth-provider:" + suffix;
  command("docker", ["build", "--label", "org.drumee.qualification=" + suffix, "-t", providerTag, context]);
  const providerImage = command("docker", ["image", "inspect", providerTag, "--format", "{{.Id}}"] ).trim(); report.provider_image = providerImage;
  const cases = [
    { name: "simple", user: "alpha6-simple-account", password: "synthetic:allowed/+=._-@" },
    { name: "address-and-shell-punctuation", user: "qa-alpha6@example.invalid", password: ' !#$%&*()[]{};:,?`"\\=+/@ $(touch /tmp/SMTP_CODE_EXECUTED) END' },
    { name: "opaque-and-unicode", user: 'Opaque +/$`" name-é', password: " leading\tspa:ces-café-🔒" },
    { name: "unicode-not-normalized", user: "User\u00a0e\u0301", password: "soft\u00adhyphen-nbsp\u00a0e\u0301END" },
    { name: "255-byte-boundary", user: "u".repeat(255), password: "p".repeat(255) },
    { name: "wrong-password", user: "qa-alpha6@example.invalid", password: "synthetic!bad-auth", mode: "wrong-password" },
    { name: "untrusted-ca", user: "qa-alpha6@example.invalid", password: "synthetic!ca", mode: "untrusted-ca" },
    { name: "wrong-hostname", user: "qa-alpha6@example.invalid", password: "synthetic!name", mode: "wrong-hostname" },
    { name: "no-starttls", user: "qa-alpha6@example.invalid", password: "synthetic!tls", mode: "no-starttls" }
  ];
  try {
    report.serializer = require("./serializer.cjs")({ installed: directory, tools: input.tools_image, directory: base + "/serializer-checks", check });
    for (let index = 0; index < cases.length; index++) {
      const c = cases[index], project = "smtp-auth-" + suffix + "-" + index, owned = base + "/case-" + index, root = owned + "/deployment", keys = owned + "/keys"; fs.mkdirSync(owned); fs.mkdirSync(keys);
      const openssl = args => command("openssl", args, { stdio: "ignore" });
      for (const name of ["relay", "provider"]) openssl(["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1", "-subj", "/CN=synthetic-" + name, "-addext", "basicConstraints=critical,CA:TRUE", "-keyout", keys + "/" + name + "-ca.key", "-out", keys + "/" + name + "-ca.pem"]);
      function leaf(name, hostname) { openssl(["req", "-newkey", "rsa:2048", "-nodes", "-subj", "/CN=" + hostname, "-keyout", keys + "/" + name + ".key", "-out", keys + "/" + name + ".csr"]); fs.writeFileSync(keys + "/" + name + ".ext", "subjectAltName=DNS:" + hostname + "\nbasicConstraints=critical,CA:FALSE\n"); openssl(["x509", "-req", "-in", keys + "/" + name + ".csr", "-CA", keys + "/" + name + "-ca.pem", "-CAkey", keys + "/" + name + "-ca.key", "-set_serial", "1", "-days", "1", "-extfile", keys + "/" + name + ".ext", "-out", keys + "/" + name + ".pem"]); }
      leaf("relay", "relay.fixture.invalid"); leaf("provider", c.mode === "wrong-hostname" ? "wrong.fixture.invalid" : "provider");
      const bundle = Buffer.concat([fs.readFileSync(keys + "/relay-ca.pem"), ...(c.mode === "untrusted-ca" ? [] : [fs.readFileSync(keys + "/provider-ca.pem")])]); fs.writeFileSync(keys + "/trust.pem", bundle, { mode: 0o644 });
      const nonce = "synthetic-body-" + crypto.randomBytes(8).toString("hex"), submission = "synthetic-private-submission";
      fs.writeFileSync(keys + "/submission", submission, { mode: 0o600 }); fs.writeFileSync(keys + "/external", c.password, { mode: 0o600 });
      fs.writeFileSync(keys + "/provider.json", JSON.stringify({ user: c.user, password: c.mode === "wrong-password" ? "different-synthetic-password" : c.password, mode: c.mode, nonce }), { mode: 0o600 });
      const x = serviceInputs(root + "/durable", project, input.tools_image);
      delete x.spec.database; delete x.spec.redis; x.spec.dns = { mode: "none" }; x.spec.instance.domain = "relay.fixture.invalid"; x.spec.secrets.resources = x.spec.secrets.resources.filter(d => ["tls-leaf-key", "smtp-relay-credential", "dkim-key"].includes(d.type));
      const external = { resource: "mail", key: "external" }; x.spec.secrets.resources.push({ ref: external, type: "smtp-external-credential", consumers: ["mail"] });
      x.spec.tls = { provider: "provided", certificate_ref: x.keys.certificate, private_key_ref: x.keys.leaf, ca_bundle_ref: x.keys.ca_bundle };
      Object.assign(x.spec.mail, { hostname: "relay.fixture.invalid", mode: "relay", relay_endpoint: { host: "provider", port: 2525, transport: "tcp" }, relay_tls: "required", relay_user: c.user, relay_secret_ref: external, dkim: { domain: "relay.fixture.invalid", selector: "fixture", key_ref: x.keys.dkim } });
      x.requirements.capabilities = ["smtp"]; x.adapter_input.services = { mail: x.adapter_input.services.mail, dkim: x.adapter_input.services.dkim };
      x.adapter_input.resource_sources = [{ ref: x.keys.leaf, source: keys + "/relay.key" }, { ref: x.keys.certificate, source: keys + "/relay.pem" }, { ref: x.keys.ca_bundle, source: keys + "/trust.pem" }, { ref: x.keys.smtp, source: root + "/durable/projections/submission" }, { ref: external, source: root + "/durable/projections/external" }, { ref: x.keys.dkim, source: root + "/durable/projections/dkim" }];
      const plan = api.planInfrastructure(x.spec, x.requirements, x.adapter_input); check(plan.applicable, true);
      const distribution = { contract_version: "1", id: "smtp-auth-qualification", profile: "infrastructure", init_jobs: [], persistent_resources: [], schema_versions: {}, external_writers: "none", helper_image: "node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392", provenance: { repository: "https://github.com/drumee/infra-layer", revision: input.source, path: "test/smtp-auth", acceptance: "infrastructure" } };
      const composition = L.composeDeployment(plan, distribution); let prepared;
      const file = owned + "/qualification-compose.json";
      try {
        prepared = await L.prepareDeployment(composition, { root, authorized: true, create_resources: true, imports: [{ ref: x.keys.leaf, file: keys + "/relay.key" }, { ref: x.keys.smtp, file: keys + "/submission" }, { ref: external, file: keys + "/external" }] });
        const fixture = structuredClone(prepared.compose), primary = Object.keys(fixture.networks).find(k => k !== "mail-control"), service = fixture.services.mail;
        // Separate test orchestration adds only the isolated TLS sink and a
        // loopback submission port. Prepared production files are unchanged.
        for (const volume of Object.values(fixture.services).flatMap(v => v.volumes || [])) if (volume.source.startsWith("./")) volume.source = path.resolve(prepared.candidate, volume.source);
        const inbound = await freePort(), control = await freePort(); service.ports = [{ target: 2525, published: inbound, host_ip: "127.0.0.1", protocol: "tcp" }];
        for (const [role, net] of Object.entries(fixture.networks)) { delete net.external; net.labels = { "org.drumee.infra.owner": project }; net.internal = role === "mail-control"; }
        fixture.services.provider = { image: providerImage, user: process.getuid() + ":" + process.getgid(), read_only: true, cap_drop: ["ALL"], security_opt: ["no-new-privileges:true"], networks: { [primary]: { aliases: ["provider"] } }, volumes: ["provider.key", "provider.pem", "provider.json"].map(name => ({ type: "bind", source: keys + "/" + name, target: "/keys/" + name, read_only: true })), ports: [{ target: 8025, published: control, host_ip: "127.0.0.1", protocol: "tcp" }], labels: { "org.drumee.infra.owner": project } };
        fs.writeFileSync(file, JSON.stringify(fixture), { mode: 0o600 });
        command("docker", ["compose", "-p", project, "-f", file, "up", "-d", "--wait", "--wait-timeout", "45"]);
        const mail = D.inspectProject(project, ["mail", "dkim", "provider"]).find(v => v.service === "mail");
        const expected = Buffer.from(c.user + ":" + c.password + "\n");
        const result = command("docker", ["exec", mail.id, "postmap", "-q", "[provider]:2525", "hash:/run/infra-mail/auth/sasl_passwd"], { encoding: null }); check(result.equals(expected), true);
        const rows = command("docker", ["exec", mail.id, "postmap", "-s", "hash:/run/infra-mail/auth/sasl_passwd"], { encoding: null }); check(rows.toString().split("\n").filter(Boolean).length, 1);
        check(command("docker", ["exec", mail.id, "stat", "-c", "%a %u", "/run/infra-mail/auth"]).trim(), "700 0"); check(command("docker", ["exec", mail.id, "stat", "-c", "%a %u", "/run/infra-mail/auth/sasl_passwd.db"]).trim(), "600 0");
        const client = require("nodemailer").createTransport({ host: "127.0.0.1", port: inbound, requireTLS: true, auth: { user: "fixture", pass: submission }, tls: { ca: fs.readFileSync(keys + "/relay-ca.pem"), servername: "relay.fixture.invalid", rejectUnauthorized: true }, logger: false });
        try { const sent = await client.sendMail({ from: "sender@fixture.invalid", to: "sink@fixture.invalid", subject: "Synthetic SMTP auth qualification", text: nonce }); check(sent.accepted.length, 1); } finally { client.close(); }
        let upstream; for (let i = 0; i < 100; i++) { upstream = await status(control); if (c.mode ? upstream.connections > 0 : upstream.messages > 0) break; await sleep(100); }
        if (!c.mode) { check(upstream.messages, 1); check(upstream.authentications > 0, true); check(upstream.account_exact, true); check(upstream.password_exact, true); check(upstream.envelope_exact, true); check(upstream.body_exact, true); }
        else if (c.mode === "wrong-password") { for (let i = 0; i < 50 && upstream.authentications === 0; i++) { await sleep(100); upstream = await status(control); } check(upstream.authentications > 0, true); check(upstream.messages, 0); }
        else { await sleep(1200); upstream = await status(control); check(upstream.authentications, 0); check(upstream.messages, 0); check(upstream.connections > 0, true); }
        check(upstream.authentication_only_after_tls, true);
        const logs = command("docker", ["logs", mail.id]); check(logs.includes(c.user), false); check(logs.includes(c.password), false);
        check(command("docker", ["exec", mail.id, "test", "!", "-e", "/tmp/SMTP_CODE_EXECUTED"]), "");
        report.cases.push({ name: c.name, passed: true, table_exact: true, entries: 1, private_permissions: true, relay_accepted: true, sink_received: upstream.messages === 1, auth_attempts: upstream.authentications, no_plaintext_auth: upstream.authentication_only_after_tls });
        console.log("SMTP_AUTH_OK " + c.name);
      } finally {
        const ids = command("docker", ["ps", "-aq", "--filter", "label=com.docker.compose.project=" + project]).trim().split("\n").filter(Boolean);
        for (const id of ids) { const o = JSON.parse(command("docker", ["inspect", id]))[0]; check(o.Config.Labels["org.drumee.infra.owner"], project); command("docker", ["rm", "-f", id]); }
        for (const name of Object.values(composition.compose.networks).map(n => n.name)) { const found = command("docker", ["network", "ls", "--filter", "name=^" + name + "$", "-q"]).trim(); if (found) { const n = JSON.parse(command("docker", ["network", "inspect", found]))[0]; check(n.Labels["org.drumee.infra.owner"], project); check(Object.keys(n.Containers).length, 0); command("docker", ["network", "rm", found]); } }
      }
    }
    report.status = "passed";
  } catch (error) { report.status = "failed"; report.failure = { code: /^[A-Z_]+$/.test(error.code || "") ? error.code : "SMTP_AUTH_QUALIFICATION_FAILED", completed_cases: report.cases.length }; process.exitCode = 1; console.error(JSON.stringify(report.failure)); }
  finally {
    check(fs.lstatSync(base).uid, process.getuid());
    command("docker", ["run", "--rm", "--network", "none", "--user", "0:0", "--mount", "type=bind,source=" + base + ",target=/work", "node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392", "node", "-e", "const f=require('fs');for(const x of f.readdirSync('/work'))f.rmSync('/work/'+x,{recursive:true,force:true})"]); fs.rmdirSync(base);
    fs.writeFileSync(input.output, JSON.stringify(report, null, 2), { mode: 0o600 }); console.log("SMTP_AUTH_REPORT_WRITTEN");
  }
}
main().catch(() => { console.error("SMTP_AUTH_QUALIFICATION_FAILED"); process.exitCode = 1; });
