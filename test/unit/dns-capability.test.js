"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const dns = require("../../capabilities/dns");
test("DNS lifecycle rejects injected zone data before any filesystem change", () => {
  const root = path.join(os.tmpdir(), "dns-must-not-create-" + process.pid);
  assert.throws(() => dns.prepareZone("drumee.lan", { mode: "local", serial: 1, ipv4: "192.168.1.10\nmalicious" }, null, root, { authorized: true, owner: "fixture" }), { code: "INVALID_DNS_CONFIGURATION" }); assert.equal(fs.existsSync(root), false);
});
test("authoritative config maps wildcard addresses to BIND ACL any and never enables recursion implicitly", () => {
  const value = { mode: "local", serial: 1, ipv4: "192.168.1.10", listen: ["0.0.0.0", "::"], clients: ["127.0.0.0/8"], recursion: false };
  const config = dns.renderConfiguration("drumee.lan", value, 1053); assert.match(config, /listen-on port 1053 \{ any;/); assert.match(config, /listen-on-v6 port 1053 \{ any;/); assert.match(config, /allow-recursion \{ none;/); assert.match(config, /allow-update \{ none;/);
});
