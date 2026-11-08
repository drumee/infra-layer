"use strict";
// Owned host-side synthetic upstream, outside the protected deployment networks.
// No owner credential, external provider, host DNS or system trust is accessed.
const fs = require("node:fs"), crypto = require("node:crypto"), { execFileSync } = require("node:child_process"), { SMTPServer } = require("smtp-server");
const command = (name, args) => execFileSync(name, args, { encoding: "utf8", stdio: "pipe", timeout: 30000 });
module.exports = async function externalFixture(base, project) {
  const network = project + "-synthetic-upstream";
  command("docker", ["network", "create", "--label", "org.drumee.qualification=" + project, network]);
  const address = JSON.parse(command("docker", ["network", "inspect", network]))[0].IPAM.Config[0].Gateway;
  const openssl = args => execFileSync("openssl", args, { stdio: "ignore" });
  for (const name of ["relay", "provider"]) openssl(["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1", "-subj", "/CN=synthetic-" + name, "-addext", "basicConstraints=critical,CA:TRUE", "-keyout", base + "/" + name + "-ca.key", "-out", base + "/" + name + "-ca.pem"]);
  function leaf(name, host) {
    openssl(["req", "-newkey", "rsa:2048", "-nodes", "-subj", "/CN=" + host, "-keyout", base + "/" + name + ".key", "-out", base + "/" + name + ".csr"]);
    fs.writeFileSync(base + "/" + name + ".ext", "subjectAltName=DNS:" + host + (name === "provider" ? ",IP:" + host : "") + "\nbasicConstraints=critical,CA:FALSE\n");
    openssl(["x509", "-req", "-in", base + "/" + name + ".csr", "-CA", base + "/" + name + "-ca.pem", "-CAkey", base + "/" + name + "-ca.key", "-set_serial", "1", "-days", "1", "-extfile", base + "/" + name + ".ext", "-out", base + "/" + name + ".pem"]);
  }
  leaf("relay", "forms.example.invalid"); leaf("provider", address);
  fs.writeFileSync(base + "/combined-trust.pem", Buffer.concat([fs.readFileSync(base + "/relay-ca.pem"), fs.readFileSync(base + "/provider-ca.pem")]), { mode: 0o644 });
  const user = "recovery-fixture@example.invalid", password = "Synthetic!" + crypto.randomBytes(20).toString("base64url") + ":$()'\\end";
  fs.writeFileSync(base + "/upstream-secret", password, { mode: 0o600 });
  let allow = false;
  const proof = { connections: 0, authentications: 0, account_exact: true, password_exact: true, authentication_only_after_tls: true, sink_messages: 0 };
  const server = new SMTPServer({ key: fs.readFileSync(base + "/provider.key"), cert: fs.readFileSync(base + "/provider.pem"), logger: false,
    onConnect(s, done) { proof.connections++; done(); },
    onAuth(auth, session, done) { proof.authentications++; proof.account_exact &&= auth.username === user; proof.password_exact &&= auth.password === password; proof.authentication_only_after_tls &&= session.secure === true; done(auth.username === user && auth.password === password && session.secure ? null : Object.assign(Error("Synthetic refusal"), { responseCode: 535 }), { user: "synthetic" }); },
    onRcptTo(address, session, done) { done(allow ? null : Object.assign(Error("Synthetic controlled deferral"), { responseCode: 451 })); },
    onData(stream, session, done) { stream.resume(); stream.on("end", () => { proof.sink_messages++; done(); }); }
  });
  server.on("error", () => {}); await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, address, resolve); });
  return {
    settings: { qualification: false, upstream: { host: address, port: server.server.address().port, user, password_file: base + "/upstream-secret" }, tls: { certificate_file: base + "/relay.pem", private_key_file: base + "/relay.key", ca_file: base + "/combined-trust.pem" } },
    sensitive: [user, password], allowDelivery() { allow = true; }, proof,
    async close() { await new Promise(resolve => server.close(resolve)); const n = JSON.parse(command("docker", ["network", "inspect", network]))[0]; if (n.Labels["org.drumee.qualification"] !== project || Object.keys(n.Containers).length) throw Error("QUALIFICATION_NETWORK_OWNERSHIP_MISMATCH"); command("docker", ["network", "rm", network]); }
  };
};
