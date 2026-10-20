"use strict";
// Permission preparation for a dedicated disposable GitHub-hosted VM only.
// No runtime resolver exception, binary download or system service change.
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
function fail() { throw new Error("HOSTED_NODE_PREPARATION_REFUSED"); }
if (process.argv[2] !== "--execute" || process.env.GITHUB_ACTIONS !== "true" || process.env.RUNNER_ENVIRONMENT !== "github-hosted" || process.env.RUNNER_TOOL_CACHE !== "/opt/hostedtoolcache") fail();
const node = fs.realpathSync(process.execPath), root = path.dirname(path.dirname(node));
if (!root.startsWith("/opt/hostedtoolcache/node/") || path.basename(path.dirname(node)) !== "bin" || path.basename(node) !== "node") fail();
const owned = stat => { if (![0, process.getuid()].includes(stat.uid)) fail(); };
const ancestors = [];
for (let current = root; current !== "/"; current = path.dirname(current)) {
  const stat = fs.lstatSync(current); owned(stat);
  if (!stat.isDirectory() || stat.isSymbolicLink()) fail();
  ancestors.unshift(current);
}
if (fs.lstatSync("/").uid !== 0 || (fs.lstatSync("/").mode & 0o022)) fail();
for (const executable of ["/usr/bin/sudo", "/usr/bin/chmod"]) {
  for (let current = executable;; current = path.dirname(current)) {
    const stat = fs.lstatSync(current);
    if (stat.uid !== 0 || stat.isSymbolicLink() || (stat.mode & 0o022)) fail();
    if (current === "/") break;
  }
}
function inventory(directory, hash = crypto.createHash("sha256")) {
  for (const name of fs.readdirSync(directory).sort()) {
    const file = path.join(directory, name), stat = fs.lstatSync(file); owned(stat);
    hash.update(path.relative(root, file) + "\0");
    if (stat.isSymbolicLink()) {
      const target = fs.realpathSync(file);
      if (!target.startsWith(root + path.sep)) fail();
      hash.update(fs.readlinkSync(file));
    } else if (stat.isDirectory()) inventory(file, hash);
    else if (stat.isFile()) hash.update(fs.readFileSync(file));
    else fail();
  }
  return hash;
}
const before = inventory(root).digest("hex");
const metadata = ancestors.map(file => ({ path: file, uid: fs.lstatSync(file).uid, mode: (fs.lstatSync(file).mode & 0o7777).toString(8) }));
const environment = { PATH: "/usr/bin:/bin", LANG: "C", LC_ALL: "C" };
for (const directory of ancestors) {
  if (fs.lstatSync(directory).mode & 0o022) execFileSync("/usr/bin/sudo", ["-n", "/usr/bin/chmod", "go-w", "--", directory], { env: environment, stdio: "pipe", timeout: 30000 });
}
execFileSync("/usr/bin/sudo", ["-n", "/usr/bin/chmod", "-R", "go-w", "--", root], { env: environment, stdio: "pipe", timeout: 30000 });
const after = inventory(root).digest("hex");
if (before !== after) fail();
// Apply the actual unchanged qualification policy after permission preparation.
const { trustedExecutable, trustedEnvironment } = require("../test/support/trusted-process");
trustedExecutable(process.execPath); trustedExecutable("npm"); trustedEnvironment();
console.log(JSON.stringify({ prepared: true, node_root: root, ancestor_metadata_before: metadata, content_sha256_before: before, content_sha256_after: after, binary_bytes_changed: false }));
