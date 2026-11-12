"use strict";
const dgram = require("node:dgram"), fs = require("node:fs");
const name = value => Buffer.concat(value.split(".").filter(Boolean).map(x => Buffer.concat([Buffer.from([x.length]), Buffer.from(x)])).concat([Buffer.from([0])]));
const server = dgram.createSocket("udp4");
server.on("message", (query, peer) => {
  let offset = 12; const labels = [];
  while (query[offset]) { const length = query[offset++]; labels.push(query.subarray(offset, offset + length).toString()); offset += length; }
  offset++; const type = query.readUInt16BE(offset), question = query.subarray(12, offset + 4), domain = labels.join("."); let records = [], flags = 0x8580;
  const mode = fs.readFileSync("/control/dns-mode", "utf8").trim();
  if (mode === "failure") flags = 0x8582;
  else if (type === 15 && domain === "dest.invalid") { const pref = Buffer.alloc(2); pref.writeUInt16BE(10); records = [Buffer.concat([pref, name("mx.dest.invalid")])]; }
  else if (type === 1 && domain === "mx.dest.invalid") records = [Buffer.from([10, 243, 47, 54])];
  else if (type === 16 && domain === "mail2026a._domainkey.oxymot.fr") {
    const key = fs.readFileSync("/control/dkim-txt", "utf8").trim(), parts = [];
    for (let i = 0; i < key.length; i += 200) { const part = Buffer.from(key.slice(i, i + 200)); parts.push(Buffer.concat([Buffer.from([part.length]), part])); }
    records = [Buffer.concat(parts)];
  }
  const header = Buffer.alloc(12); query.copy(header, 0, 0, 2); header.writeUInt16BE(flags, 2); header.writeUInt16BE(1, 4); header.writeUInt16BE(records.length, 6);
  const answers = records.map(data => { const h = Buffer.alloc(12); h.writeUInt16BE(0xc00c); h.writeUInt16BE(type, 2); h.writeUInt16BE(1, 4); h.writeUInt32BE(0, 6); h.writeUInt16BE(data.length, 10); return Buffer.concat([h, data]); });
  server.send(Buffer.concat([header, question, ...answers]), peer.port, peer.address);
});
server.bind(53, "0.0.0.0");
