"use strict";
// Test-only closed package contract, also called by the canonical package audit.
const assert = require("node:assert/strict"), path = require("node:path");
const allowed = [
  /^internal\/(?:system-tools|network-readiness|rollback-authorization)\.js$/,
  /^lib\/[a-z0-9-]+\.js$/,
  /^lifecycle\/[a-z-]+\.js$/,
  /^lifecycle\/index\.d\.ts$/,
  /^capabilities\/http\/nginx\/[a-z]+\.js$/,
  /^capabilities\/(?:secrets|tls|dns|database|redis|mail)\/[a-z-]+\.js$/,
  /^capabilities\/docker\/Dockerfile\.services$/,
  /^adapters\/docker\/[a-z-]+\.js$/,
  /^index\.d\.ts$/,
  /^README\.md$/,
  /^CHANGELOG\.md$/,
  /^PROVENANCE\.md$/,
  /^LICENSE$/,
  /^package\.json$/,
];

function validatePackageInventory(files, read) {
  const names = new Set(files.map(entry => entry.path)), edges = [];
  assert.ok(names.has("lib/smtp-auth.js"), "Required package member missing: lib/smtp-auth.js");
  assert.ok(names.has("internal/rollback-authorization.js"), "Required package member missing: internal/rollback-authorization.js");
  for (const entry of files) {
    assert.ok(allowed.some(pattern => pattern.test(entry.path)), "Unexpected package member");
    const contents = read(entry.path);
    assert.doesNotMatch(contents, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|isolated-fixture-password|\/home\/[^\s"']+|"file:/);
    if (!entry.path.endsWith(".js")) continue;
    for (const match of contents.matchAll(/require\(["']([^"']+)["']\)/g)) {
      assert.ok(match[1].startsWith(".") || match[1].startsWith("node:"), "Undeclared production import");
      if (match[1].startsWith(".")) {
        const base = path.posix.normalize(path.posix.join(path.posix.dirname(entry.path), match[1]));
        const target = [base, base + ".js", base + "/index.js", base + ".json", base + "/index.json"].find(name => names.has(name));
        assert.ok(target, "Required package dependency missing: " + entry.path + " -> " + match[1]);
        edges.push({ from: entry.path, request: match[1], to: target });
      }
    }
    // The sole computed require is the bounded capability dispatch in plan-v2.
    for (const match of contents.matchAll(/\brequire\(([^)]*)\)/g)) {
      if (/^["'][^"']+["']$/.test(match[1])) continue;
      assert.ok(entry.path === "lib/plan-v2.js" && match[1] === '`../capabilities/${name === "dkim" ? "mail" : name}`', "Unreviewed computed production import");
      for (const name of ["dns", "database", "redis", "mail"]) {
        const target = "capabilities/" + name + "/index.js";
        assert.ok(names.has(target), "Required computed package dependency missing: " + target);
        edges.push({ from: entry.path, request: "bounded capability dispatch", to: target });
      }
    }
  }
  return edges;
}
module.exports = { validatePackageInventory };
