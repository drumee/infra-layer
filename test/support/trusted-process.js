"use strict";
// Qualification-only tools. Never search an inherited PATH or invoke a shell.
const fs = require("node:fs"), path = require("node:path");
const tools = Object.freeze({ npm: "/usr/bin/npm", docker: "/usr/bin/docker", git: "/usr/bin/git", ssh: "/usr/bin/ssh", openssl: "/usr/bin/openssl", ss: "/usr/bin/ss" });
function trustedExecutable(file) {
  const selected = tools[file] || file;
  if (!path.isAbsolute(selected)) throw new Error("EXPLICIT_TRUSTED_EXECUTABLE_REQUIRED");
  const real = fs.realpathSync(selected);
  const info = fs.statSync(real);
  if (!info.isFile() || !(info.mode & 0o111)) throw new Error("UNSAFE_QUALIFICATION_EXECUTABLE");
  for (let current = real;; current = path.dirname(current)) {
    const stat = fs.lstatSync(current);
    const stickyRoot = stat.isDirectory() && stat.uid === 0 && (stat.mode & 0o1000);
    if (![0, process.getuid()].includes(stat.uid) || (stat.mode & 0o022) && !stickyRoot) throw new Error("UNSAFE_QUALIFICATION_EXECUTABLE");
    if (current === path.dirname(current)) break;
  }
  return real;
}
function trustedEnvironment(extra = {}) {
  // npm's node shebang and child tools see only the fixed system tool directories.
  return { ...process.env, ...extra, PATH: "/usr/bin:/bin" };
}
module.exports = { trustedExecutable, trustedEnvironment };
