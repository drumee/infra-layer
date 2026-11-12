"use strict";
// Bounded private native Postfix socketmap / access policy / before-queue Milter.
// No passwords, message bodies, arbitrary commands or external network calls.
const net = require("node:net"), fs = require("node:fs");
function startPolicy(directory, ports = [10001, 10002, 10003], host = "0.0.0.0") {
  function registry() {
    if (fs.existsSync(directory + "/admission-closed")) throw Error("barrier");
    const r = JSON.parse(fs.readFileSync(directory + "/current.json"));
    if (r.contract !== "drumee.mail-registry/1" || !Number.isSafeInteger(r.generation)) throw Error("registry");
    return r;
  }
  const mailbox = (r, value) => r.mailboxes.find(b => b.address === value) || r.mailboxes.find(b => b.id === r.aliases.find(a => a.address === value && a.receive_enabled)?.mailbox_id);
  function principals(r) {
    return [...r.accounts.filter(a => a.enabled).map(a => ({ token: `acct-${a.id}-g${a.credential_generation}`, envelope: a.envelope_from, header: a.header_from })), ...r.mailboxes.filter(b => b.submission_enabled).map(b => ({ token: `mbx-${b.id}-g${r.generation}`, envelope: [b.address], header: [b.address] }))];
  }
  const socketmap = net.createServer(socket => {
    let buffer = Buffer.alloc(0); socket.setTimeout(10000, () => socket.destroy());
    socket.on("data", chunk => {
      buffer = Buffer.concat([buffer, chunk]); if (buffer.length > 65536) return socket.destroy();
      for (;;) {
        const colon = buffer.indexOf(58); if (colon < 0) break;
        const length = Number(buffer.subarray(0, colon).toString()); if (!Number.isInteger(length) || length > 8192) return socket.destroy();
        if (buffer.length < colon + length + 2) break;
        const query = buffer.subarray(colon + 1, colon + 1 + length).toString(); buffer = buffer.subarray(colon + length + 2);
        const split = query.indexOf(" "), map = query.slice(0, split), key = query.slice(split + 1).toLowerCase(); let answer = "NOTFOUND ";
        try {
          const r = registry(), b = mailbox(r, key);
          if (map === "domains" && (r.domains.includes(key) || key === "local.invalid")) answer = "OK 1";
          if (map === "aliases" && b && b.receive_enabled) answer = `OK mbx-${b.id}@local.invalid`;
          if (map === "mailboxes" && r.mailboxes.some(x => `mbx-${x.id}@local.invalid` === key)) answer = "OK 1";
          if (map === "senders") { const owners = principals(r).filter(x => x.envelope.includes(key)).map(x => x.token); if (owners.length) answer = "OK " + owners.join(","); }
        } catch { answer = "TEMP Registry unavailable"; }
        socket.write(Buffer.byteLength(answer) + ":" + answer + ",");
      }
    }); socket.on("error", () => {});
  });
  const access = net.createServer(socket => {
    let buffer = ""; socket.setTimeout(10000, () => socket.destroy());
    socket.on("data", chunk => {
      buffer += chunk; if (buffer.length > 16384) return socket.destroy();
      while (buffer.includes("\n\n")) {
        const end = buffer.indexOf("\n\n"), fields = Object.fromEntries(buffer.slice(0, end).split("\n").map(x => { const i = x.indexOf("="); return [x.slice(0, i), x.slice(i + 1)]; })); buffer = buffer.slice(end + 2);
        let action = "DUNNO";
        try {
          const r = registry(), to = (fields.recipient || "").toLowerCase();
          if (r.domains.includes(to.split("@")[1]) || to.endsWith("@local.invalid")) { const b = mailbox(r, to); if (!b) action = "550 5.1.1 Unknown recipient"; else if (!b.receive_enabled) action = "550 5.2.1 Receipt disabled"; }
        } catch { action = "451 4.3.0 Registry unavailable"; }
        socket.write("action=" + action + "\n\n");
      }
    }); socket.on("error", () => {});
  });
  const milter = net.createServer(socket => {
    let buffer = Buffer.alloc(0), macros = {}, envelope = "", headers = [], headerSize = 0;
    const reply = (command, data = Buffer.alloc(0)) => { const b = Buffer.concat([Buffer.from(command), data]), n = Buffer.alloc(4); n.writeUInt32BE(b.length); socket.write(Buffer.concat([n, b])); };
    const reject = text => reply("y", Buffer.from(text + "\0"));
    const current = () => principals(registry()).find(x => x.token === (macros["{auth_authen}"] || macros.auth_authen));
    socket.setTimeout(300000, () => socket.destroy());
    socket.on("data", chunk => {
      buffer = Buffer.concat([buffer, chunk]); if (buffer.length > 1048576) return socket.destroy();
      while (buffer.length >= 4) {
        const length = buffer.readUInt32BE(0); if (length < 1 || length > 1048576) return socket.destroy(); if (buffer.length < length + 4) break;
        const cmd = String.fromCharCode(buffer[4]), data = buffer.subarray(5, length + 4); buffer = buffer.subarray(length + 4);
        try {
          if (cmd === "D") { const fields = data.subarray(1).toString().split("\0"); for (let i = 0; i < fields.length - 1; i += 2) macros[fields[i]] = fields[i + 1]; continue; }
          if (cmd === "O") { const opts = Buffer.alloc(12); opts.writeUInt32BE(6); reply("O", opts); continue; }
          if (cmd === "Q") { socket.end(); continue; }
          if (cmd === "A") { envelope = ""; headers = []; headerSize = 0; continue; }
          if (cmd === "M") { envelope = data.toString().split("\0")[0].replace(/^<|>$/g, "").toLowerCase(); headers = []; headerSize = 0; const a = current(); if (!a) { reject("421 4.7.0 Credential generation revoked"); continue; } if (!envelope || !a.envelope.includes(envelope)) { reject("550 5.7.1 Envelope sender unauthorized"); continue; } }
          if (cmd === "L") { const [name, value] = data.toString().split("\0"); headerSize += data.length; if (headerSize > 65536 || headers.length >= 128) { reject("550 5.6.0 Header limit"); continue; } headers.push([name.toLowerCase(), value]); }
          if (["T", "N", "E"].includes(cmd) && !current()) { reject("421 4.7.0 Credential generation revoked"); continue; }
          if (cmd === "E") {
            const a = current(), from = headers.filter(x => x[0] === "from"), sender = headers.filter(x => x[0] === "sender");
            const parse = value => { if (/[\r\n,]/.test(value)) return null; const m = /^(?:[^<>]*<([^<>]+)>|([^<>\s]+))$/.exec(value.trim()); return m ? (m[1] || m[2]).toLowerCase() : null; };
            if (from.length !== 1 || !a.header.includes(parse(from[0][1])) || sender.length > 1 || sender.length && parse(sender[0][1]) !== parse(from[0][1]) || headers.some(x => x[0].startsWith("resent-"))) { reject("550 5.7.1 Author header unauthorized"); continue; }
          }
          reply("c");
        } catch { reject("451 4.3.0 Submission policy unavailable"); }
      }
    }); socket.on("error", () => {});
  });
  const servers = [socketmap, access, milter]; servers.forEach((server, i) => server.listen(ports[i], host)); return servers;
}
if (require.main === module) startPolicy("/registry");
module.exports = { startPolicy };
