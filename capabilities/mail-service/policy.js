"use strict";
// Bounded private native Postfix socketmap / access policy / before-queue Milter.
// No passwords, message bodies, arbitrary commands or external network calls.
const net = require("node:net"), fs = require("node:fs");
// Parse CFWS and quoted strings before comparing an authentication service ID.
// External Authentication-Results are retained as untrusted transit metadata.
function withoutComments(value) {
  const unfolded = value.replace(/\r?\n[ \t]+/g, " ");
  if (/[\r\n\0]/.test(unfolded) || unfolded.length > 8192) return null;
  let out = "", depth = 0, quoted = false, escaped = false;
  for (const c of unfolded) {
    if (escaped) { if (!depth) out += c; escaped = false; continue; }
    if (c === "\\") { if (!depth) out += c; escaped = true; continue; }
    if (!depth && c === '"') { quoted = !quoted; out += c; continue; }
    if (!quoted && c === "(") { if (++depth > 8) return null; continue; }
    if (!quoted && c === ")") { if (!depth) return null; if (!--depth) out += " "; continue; }
    if (!depth) out += c;
  }
  return depth || quoted || escaped ? null : out.trim();
}
function authenticationService(headerValue) {
  const clean = withoutComments(headerValue);
  if (clean === null) return null;
  let value = "", position = 0;
  if (clean[0] === '"') {
    position = 1; let closed = false;
    while (position < clean.length) {
      let c = clean[position++];
      if (c === '"') { closed = true; break; }
      if (c === "\\") { if (position === clean.length) return null; c = clean[position++]; }
      value += c;
    }
    if (!closed) return null;
  } else {
    while (position < clean.length && !/[\s;]/.test(clean[position])) value += clean[position++];
    if (!/^[!#$%&'*+\-.^_`|~a-z0-9]+$/i.test(value)) return null;
  }
  if (!value || !/^(?:\s+[0-9]+)?\s*;/.test(clean.slice(position))) return null;
  return value.toLowerCase().replace(/\.$/, "");
}
function authorMailbox(value) {
  const clean = withoutComments(value);
  if (clean === null) return null;
  let quoted = false, escaped = false, left = -1, right = -1;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (escaped) { escaped = false; continue; }
    if (c === "\\" && quoted) { escaped = true; continue; }
    if (c === '"') { quoted = !quoted; continue; }
    if (quoted) continue;
    if (c === "," || c === ":" || c === ";") return null;
    if (c === "<") { if (left !== -1) return null; left = i; }
    if (c === ">") { if (left === -1 || right !== -1) return null; right = i; }
  }
  if (quoted || escaped || (left === -1) !== (right === -1) || right !== -1 && clean.slice(right + 1).trim()) return null;
  const address = (left === -1 ? clean : clean.slice(left + 1, right)).trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._-]{0,63}@[a-z0-9.-]+$/.test(address) && !address.includes("..") ? address : null;
}
function startPolicy(directory, ports = [10001, 10002, 10003], host = "0.0.0.0", stateDirectory = null) {
  let counters = { accounts: {}, rate_limited: 0 };
  if (stateDirectory && fs.existsSync(stateDirectory + "/counters.json")) counters = JSON.parse(fs.readFileSync(stateDirectory + "/counters.json"));
  function admit() {
    if (!stateDirectory) return;
    for (const name of ["spool", "mailboxes"]) {
      const stat = fs.statfsSync("/storage/" + name);
      if (stat.bavail * stat.bsize < 67108864 || stat.bavail / stat.blocks < 0.1) throw Error("disk pressure");
    }
  }
  function accountRate(token) {
    token = token.replace(/-g[0-9]+$/, "");
    const now = Date.now();
    for (const key of Object.keys(counters.accounts)) if (!counters.accounts[key].some(at => at > now - 60000)) delete counters.accounts[key];
    const attempts = (counters.accounts[token] || []).filter(at => at > now - 60000), permitted = attempts.length < 60;
    if (permitted) attempts.push(now); else counters.rate_limited++;
    counters.accounts[token] = attempts;
    if (stateDirectory) {
      fs.writeFileSync(stateDirectory + "/.counters-new", JSON.stringify(counters), { mode: 0o600 });
      fs.renameSync(stateDirectory + "/.counters-new", stateDirectory + "/counters.json");
    }
    return permitted;
  }
  function registry() {
    admit();
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
          if (cmd === "O") { const opts = Buffer.alloc(12); opts.writeUInt32BE(6); if (!(data.readUInt32BE(4) & 0x10)) { socket.destroy(); continue; } opts.writeUInt32BE(0x10, 4); reply("O", opts); continue; }
          if (cmd === "Q") { socket.end(); continue; }
          if (cmd === "A") { envelope = ""; headers = []; headerSize = 0; continue; }
          if (cmd === "M") { envelope = data.toString().split("\0")[0].replace(/^<|>$/g, "").toLowerCase(); headers = []; headerSize = 0; const a = current(); if (!a) { reject("421 4.7.0 Credential generation revoked"); continue; } if (!envelope || !a.envelope.includes(envelope)) { reject("550 5.7.1 Envelope sender unauthorized"); continue; } if (!accountRate(a.token)) { reject("451 4.7.0 Account submission rate exceeded"); continue; } }
          if (cmd === "L") { const [name, value] = data.toString().split("\0"); headerSize += data.length; if (headerSize > 65536 || headers.length >= 128) { reject("550 5.6.0 Header limit"); continue; } headers.push([name.toLowerCase(), value]); }
          if (["T", "N", "E"].includes(cmd) && !current()) { reject("421 4.7.0 Credential generation revoked"); continue; }
          if (cmd === "E") {
            const a = current(), from = headers.filter(x => x[0] === "from"), sender = headers.filter(x => x[0] === "sender");
            if (from.length !== 1 || !a.header.includes(authorMailbox(from[0][1])) || sender.length > 1 || sender.length && authorMailbox(sender[0][1]) !== authorMailbox(from[0][1]) || headers.some(x => x[0].startsWith("resent-"))) { reject("550 5.7.1 Author header unauthorized"); continue; }
            const identity = registry().service_hostname;
            if (!identity) throw Error("missing service identity");
            let ordinal = 0; const remove = [];
            for (const [name, value] of headers) if (name === "authentication-results") {
              ordinal++;
              const asserted = authenticationService(value);
              if (asserted === null) { reject("550 5.7.1 Malformed authentication result"); return; }
              if (asserted === identity) remove.push(ordinal);
            }
            for (const index of remove.reverse()) {
              const prefix = Buffer.alloc(4); prefix.writeUInt32BE(index);
              reply("m", Buffer.concat([prefix, Buffer.from("Authentication-Results\0\0")]));
            }
          }
          reply("c");
        } catch { reject("451 4.3.0 Submission policy unavailable"); }
      }
    }); socket.on("error", () => {});
  });
  const servers = [socketmap, access, milter]; servers.forEach((server, i) => { server.maxConnections = 64; server.listen(ports[i], host); }); return servers;
}
if (require.main === module) startPolicy("/registry", [10001, 10002, 10003], "0.0.0.0", "/state");
module.exports = { startPolicy, authenticationService, authorMailbox };
