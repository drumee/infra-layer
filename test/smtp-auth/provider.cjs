"use strict";
// Synthetic isolated upstream. Values are compared in memory and never logged.
const fs = require("node:fs"), http = require("node:http"), crypto = require("node:crypto"), { SMTPServer } = require("smtp-server");
const cfg = JSON.parse(fs.readFileSync("/keys/provider.json"));
const state = { connections: 0, authentications: 0, account_exact: true, password_exact: true, authentication_only_after_tls: true, messages: 0, envelope_exact: true, body_exact: true };
const server = new SMTPServer({ key: fs.readFileSync("/keys/provider.key"), cert: fs.readFileSync("/keys/provider.pem"), logger: false, ...(cfg.mode === "no-starttls" ? { disabledCommands: ["STARTTLS"], allowInsecureAuth: true } : {}),
  onConnect(session, done) { state.connections++; done(); },
  onAuth(auth, session, done) {
    state.authentications++; state.account_exact &&= auth.username === cfg.user; state.password_exact &&= auth.password === cfg.password; state.authentication_only_after_tls &&= session.secure === true;
    done(auth.username === cfg.user && auth.password === cfg.password && session.secure ? null : Object.assign(Error("Synthetic authentication refused"), { responseCode: 535 }), { user: "synthetic-account" });
  },
  onData(stream, session, done) { let data = ""; stream.on("data", b => data += b); stream.on("end", () => { state.messages++; state.envelope_exact &&= session.envelope.mailFrom.address === "sender@fixture.invalid" && session.envelope.rcptTo.length === 1 && session.envelope.rcptTo[0].address === "sink@fixture.invalid"; state.body_exact &&= data.includes(cfg.nonce); state.message_digest = crypto.createHash("sha256").update(data).digest("hex"); done(); }); }
});
server.on("error", () => {}); server.listen(2525, "0.0.0.0");
http.createServer((req, res) => { res.setHeader("content-type", "application/json"); res.end(JSON.stringify(state)); }).listen(8025, "0.0.0.0");
