"use strict";
// Internal Debian system-tool boundary. Deliberately absent from package exports.
const fs = require("node:fs");
const path = require("node:path");
const tools = Object.freeze({ docker: "/usr/bin/docker", ss: "/usr/bin/ss", openssl: "/usr/bin/openssl" });
function refuse() { throw Object.assign(new Error("UNTRUSTED_SYSTEM_EXECUTABLE"), { code: "UNTRUSTED_SYSTEM_EXECUTABLE" }); }
function rootOwned(stat, link = false) {
  if (stat.uid !== 0 || (!link && (stat.mode & 0o022))) refuse();
}
function absolutePath(file, links) {
  if (typeof file !== "string" || !path.isAbsolute(file) || path.normalize(file) !== file || links > 16) refuse();
}
function trustedStat(file, optional, links) {
  let stat;
  try { stat = fs.lstatSync(file); }
  catch (error) {
    if (optional && !links && error.code === "ENOENT") return null;
    throw error;
  }
  rootOwned(stat, stat.isSymbolicLink());
  return stat;
}
function verifyKind(file, stat, kind) {
  if (kind === "directory" ? !stat.isDirectory() : !stat.isFile()) refuse();
  if (kind === "executable") {
    if (!(stat.mode & 0o111)) refuse();
    fs.accessSync(file, fs.constants.X_OK);
  }
}
function verifyPath(file, kind = "executable", optional = false, links = 0) {
  absolutePath(file, links);
  rootOwned(fs.lstatSync("/"));
  const parts = file.split("/").filter(Boolean);
  if (!parts.length && kind !== "directory") refuse();
  let current = "/";
  for (let index = 0; index < parts.length; index++) {
    current = path.join(current, parts[index]);
    const stat = trustedStat(current, optional, links);
    if (!stat) return null;
    if (stat.isSymbolicLink()) {
      const target = path.resolve(path.dirname(current), fs.readlinkSync(current), ...parts.slice(index + 1));
      return verifyPath(target, kind, false, links + 1);
    }
    if (index < parts.length - 1 && !stat.isDirectory()) refuse();
    if (index === parts.length - 1) verifyKind(current, stat, kind);
  }
  return current;
}
function verifyDockerConfiguration() {
  const root = "/etc/docker";
  verifyPath(root, "directory", true);
  const configuration = verifyPath(root + "/config.json", "file", true);
  let extra = [];
  if (configuration) {
    if (fs.statSync(configuration).size > 65536) refuse();
    const config = JSON.parse(fs.readFileSync(configuration, "utf8"));
    extra = config.cliPluginsExtraDirs || [];
    if (!Array.isArray(extra) || extra.some(value => typeof value !== "string")) refuse();
  }
  const directories = [...extra, root + "/cli-plugins", "/usr/local/lib/docker/cli-plugins", "/usr/local/libexec/docker/cli-plugins", "/usr/lib/docker/cli-plugins", "/usr/libexec/docker/cli-plugins"];
  for (const directory of directories) {
    if (!verifyPath(directory, "directory", true)) continue;
    for (const name of ["docker-compose", "docker-buildx"]) verifyPath(path.join(directory, name), "executable", true);
  }
}
function resolveTrustedExecutable(tool) {
  if (!Object.hasOwn(tools, tool)) refuse();
  const executable = verifyPath(tools[tool]);
  if (tool === "docker") verifyDockerConfiguration();
  return executable;
}
function systemEnvironment(tool) {
  const environment = { PATH: "/usr/bin:/bin", LANG: "C", LC_ALL: "C" };
  if (tool === "docker") Object.assign(environment, { HOME: "/", DOCKER_CONFIG: "/etc/docker" });
  return environment;
}
module.exports = { resolveTrustedExecutable, systemEnvironment, verifyPath };
