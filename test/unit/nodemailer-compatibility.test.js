"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), os = require("node:os"), path = require("node:path"), crypto = require("node:crypto"), net = require("node:net");
const { execFileSync } = require("node:child_process"), nodemailer = require("nodemailer"), { SMTPServer } = require("smtp-server");
const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
test("patched address parser preserves the intended recipient for all three advisories", () => {
  const parser = require("nodemailer/lib/addressparser"), addresses = list => list.flatMap(item => item.group ? addresses(item.group) : [item.address]);
  for (const [input, expected] of [
    ["Victim (x(y) <evil@evil.com>) <v@victim.com>", "v@victim.com"],
    ["G: (a; <evil@evil.com>) <v@victim.com>;", "v@victim.com"],
    ['<"a@evil.com>"@good.com>', '"a@evil.com>"@good.com']
  ]) assert.deepEqual(addresses(parser(input)), [expected]);
});
test("message generation retains MIME and DKIM signing without exposing the key", async () => {
  const { privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
  const client = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "windows", dkim: { domainName: "fixture.invalid", keySelector: "qualified", privateKey } });
  try {
    const result = await client.sendMail({ from: "Sender <sender@fixture.invalid>", to: "Recipient <recipient@fixture.invalid>", subject: "Qualified MIME é", text: "local compatibility fixture", attachments: [{ filename: "=?utf-8?Q?filename?=", content: Buffer.from("attachment bytes") }] });
    const message = result.message.toString(); assert.match(message, /DKIM-Signature:/); assert.match(message, /d=fixture\.invalid/); assert.match(message, /s=qualified/); assert.match(message, /multipart\/mixed/); assert.match(message, /Content-Disposition: attachment/); assert.ok(!message.includes(privateKey));
    assert.deepEqual(result.envelope, { from: "sender@fixture.invalid", to: ["recipient@fixture.invalid"] });
  } finally { client.close(); }
});
test("real STARTTLS, authentication, pooled reuse and recipient failures preserve results", { timeout: 20000 }, async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "infra-nodemailer-compat-")); fs.chmodSync(root, 0o700);
  const key = path.join(root, "key.pem"), cert = path.join(root, "cert.pem"), password = crypto.randomBytes(24).toString("hex");
  let server, client, bad;
  const messages = []; let connections = 0;
  try {
    execFileSync(trustedExecutable("openssl"), ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1", "-subj", "/CN=localhost", "-addext", "subjectAltName=DNS:localhost", "-keyout", key, "-out", cert], { stdio: "pipe", env: trustedEnvironment() }); fs.chmodSync(key, 0o600);
    server = new SMTPServer({ key: fs.readFileSync(key), cert: fs.readFileSync(cert), authMethods: ["PLAIN"],
      onConnect(session, callback) { connections++; callback(); },
      onAuth(auth, session, callback) { if (auth.username !== "fixture" || auth.password !== password) return callback(Object.assign(Error("authentication refused"), { responseCode: 535 })); callback(null, { user: "fixture" }); },
      onRcptTo(address, session, callback) { callback(address.address === "blocked@fixture.invalid" ? Object.assign(Error("recipient refused"), { responseCode: 550 }) : null); },
      onData(stream, session, callback) { stream.resume(); stream.on("end", () => { messages.push({ secure: session.secure, user: session.user }); callback(null, "locally queued"); }); }
    });
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    const options = { host: "127.0.0.1", port: server.server.address().port, secure: false, requireTLS: true, tls: { servername: "localhost", ca: fs.readFileSync(cert), rejectUnauthorized: true }, auth: { user: "fixture", pass: password }, connectionTimeout: 3000, greetingTimeout: 3000, socketTimeout: 5000 };
    client = nodemailer.createTransport({ ...options, pool: true, maxConnections: 1, maxMessages: 10 });
    const first = await client.sendMail({ from: "sender@fixture.invalid", to: ["recipient@fixture.invalid", "blocked@fixture.invalid"], text: "first" });
    assert.deepEqual(first.accepted, ["recipient@fixture.invalid"]); assert.deepEqual(first.rejected, ["blocked@fixture.invalid"]);
    const second = await client.sendMail({ from: "sender@fixture.invalid", to: "second@fixture.invalid", text: "second" });
    assert.deepEqual(second.accepted, ["second@fixture.invalid"]); assert.equal(connections, 1); assert.equal(messages.length, 2); assert.ok(messages.every(value => value.secure && value.user === "fixture"));
    await assert.rejects(client.sendMail({ from: "sender@fixture.invalid", to: "blocked@fixture.invalid", text: "refused" }), error => error.code === "EENVELOPE" && error.responseCode === 550);
    bad = nodemailer.createTransport({ ...options, auth: { user: "fixture", pass: "deliberately-invalid" } });
    await assert.rejects(bad.sendMail({ from: "sender@fixture.invalid", to: "recipient@fixture.invalid", text: "refused" }), error => error.code === "EAUTH" && error.responseCode === 535);
    assert.equal(messages.length, 2);
  } finally {
    client?.close(); bad?.close();
    if (server?.server.listening) await new Promise(resolve => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test("greeting timeout remains an explicit failure and closes connection state", { timeout: 5000 }, async () => {
  const sockets = new Set(), server = net.createServer(socket => { sockets.add(socket); socket.on("close", () => sockets.delete(socket)); });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const client = nodemailer.createTransport({ host: "127.0.0.1", port: server.address().port, secure: false, greetingTimeout: 150, connectionTimeout: 1000, socketTimeout: 1000 });
  try { await assert.rejects(client.sendMail({ from: "sender@fixture.invalid", to: "recipient@fixture.invalid", text: "never accepted" }), error => error.code === "ETIMEDOUT"); }
  finally { client.close(); for (const socket of sockets) socket.destroy(); await new Promise(resolve => server.close(resolve)); }
});
