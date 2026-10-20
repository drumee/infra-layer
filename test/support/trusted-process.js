"use strict";
// Qualification-only tools. Never search an inherited PATH or invoke a shell.
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const tools = Object.freeze({ docker: "/usr/bin/docker", git: "/usr/bin/git", ssh: "/usr/bin/ssh", openssl: "/usr/bin/openssl", ss: "/usr/bin/ss", tar: "/usr/bin/tar", unzip: "/usr/bin/unzip" });
function safeMetadata(stat, file) {
  const stickyRoot = stat.isDirectory() && stat.uid === 0 && (stat.mode & 0o1000);
  if (![0, process.getuid()].includes(stat.uid) || (!stat.isSymbolicLink() && (stat.mode & 0o022) && !stickyRoot)) throw Object.assign(new Error("UNSAFE_QUALIFICATION_EXECUTABLE"), { path: file, owner_uid: stat.uid, mode: (stat.mode & 0o7777).toString(8) });
}
function trustedExecutable(file, links = 0) {
  // npm belongs to the same already-installed Node toolchain, not to caller PATH.
  const selected = file === "npm" ? path.join(path.dirname(trustedExecutable(process.execPath)), "npm") : tools[file] || file;
  if (!path.isAbsolute(selected) || path.normalize(selected) !== selected || links > 16) throw new Error("EXPLICIT_TRUSTED_EXECUTABLE_REQUIRED");
  // Check the spelling used to enter a symlink as well as the resolved target.
  let prefix = "/";
  for (const part of selected.split("/").filter(Boolean)) {
    prefix = path.join(prefix, part);
    const stat = fs.lstatSync(prefix), link = stat.isSymbolicLink();
    safeMetadata(stat, prefix);
    if (link) {
      const target = path.resolve(path.dirname(prefix), fs.readlinkSync(prefix), path.relative(prefix, selected));
      return trustedExecutable(target, links + 1);
    }
  }
  const real = fs.realpathSync(selected);
  const info = fs.statSync(real);
  if (!info.isFile() || !(info.mode & 0o111)) throw new Error("UNSAFE_QUALIFICATION_EXECUTABLE");
  for (let current = real;; current = path.dirname(current)) {
    const stat = fs.lstatSync(current);
    safeMetadata(stat, current);
    if (current === path.dirname(current)) break;
  }
  return real;
}
function trustedEnvironment(extra = {}) {
  // Explicit qualification inputs, never a copy of the caller's secret-bearing env.
  const allowed = ["SSH_AUTH_SOCK", "npm_config_cache", "CHROME_BIN", "IL1_FIXTURES", "IL1_GATEWAY_ID", "IL1_KEEP_OUTPUT", "IL1_KERNEL_ID", "IL1_PLAN", "IL1_PORT", "IL1_PROJECT", "IL1_REVISION", "IL2_METADATA", "IL2_REDIS_STORE_SOURCE", "IL3_DNS_PORT", "IL3_LAN_ADDRESS", "IL3_METADATA", "IL5_APP_IMAGE", "IL5_HOST_NGINX", "IL5_LAN_ADDRESS", "IL5_NETWORK_CLIENT", "IL5_TSC"];
  const environment = { HOME: os.userInfo().homedir, LANG: "C", LC_ALL: "C" };
  for (const key of allowed) {
    const value = extra[key] ?? process.env[key];
    if (typeof value === "string") environment[key] = value;
  }
  const nodeDirectory = path.dirname(trustedExecutable(process.execPath));
  if (nodeDirectory.includes(path.delimiter)) throw new Error("UNSAFE_QUALIFICATION_EXECUTABLE");
  return { ...environment, PATH: [...new Set([nodeDirectory, "/usr/bin", "/bin"])].join(path.delimiter) };
}
module.exports = { trustedExecutable, trustedEnvironment };
