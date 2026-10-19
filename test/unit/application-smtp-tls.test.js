"use strict";
// Real loopback SMTP sockets exercise the actual qualification plugin client.
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const { execFileSync } = require("node:child_process"), { SMTPServer } = require("smtp-server");
const Worker = require("../application/plugins/qualification/worker");
const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
test("application SMTP client enforces STARTTLS, CA and server identity before SASL", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "infra-il58-tls-")); fs.chmodSync(root, 0o700); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const key = path.join(root, "key"), cert = path.join(root, "cert"), password = path.join(root, "password");
  fs.writeFileSync(password, require("node:crypto").randomBytes(32).toString("base64url"), { mode: 0o600 });
  execFileSync(trustedExecutable("openssl"), ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1", "-subj", "/CN=smtp.test", "-addext", "subjectAltName=DNS:smtp.test", "-keyout", key, "-out", cert], { stdio: "pipe", env: trustedEnvironment() }); fs.chmodSync(key, 0o600);
  const original = process.env.APP_SMTP_CONFIG; t.after(() => { if (original === undefined) delete process.env.APP_SMTP_CONFIG; else process.env.APP_SMTP_CONFIG = original; });
  const worker = new Worker({ session: {} });
  for (const scenario of ["verified-starttls", "no-starttls", "untrusted-ca", "wrong-name"]) {
    let authentications = 0;
    const server = new SMTPServer({ secure: false, key: fs.readFileSync(key), cert: fs.readFileSync(cert), ...(scenario === "no-starttls" ? { disabledCommands: ["STARTTLS"], allowInsecureAuth: true } : {}), onAuth(auth, session, callback) { authentications++; assert.equal(session.secure, true); callback(null, { user: auth.username }); }, logger: false });
    server.on("error", () => { /* TLS handshake refusals are asserted by the client below. */ });
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    try {
      process.env.APP_SMTP_CONFIG = JSON.stringify({ host: "127.0.0.1", port: server.server.address().port, user: "qualification", password_file: password, ca_file: scenario === "untrusted-ca" ? "/etc/ssl/certs/ca-certificates.crt" : cert, servername: scenario === "wrong-name" ? "other.test" : "smtp.test" });
      if (scenario === "verified-starttls") { assert.deepEqual(await worker.smtp_probe(), { starttls_authenticated: true }); assert.equal(authentications, 1); }
      else { await assert.rejects(worker.smtp_probe()); assert.equal(authentications, 0, "credentials must not be submitted before verified TLS"); }
    } finally { await new Promise(resolve => server.close(resolve)); }
  }
});
