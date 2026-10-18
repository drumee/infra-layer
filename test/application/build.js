"use strict";
const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const { execFileSync } = require("node:child_process");
function build(project) {
  if (!/^drumee-il5-[a-f0-9]{8}$/.test(project)) throw new Error("OWNED_APPLICATION_BUILD_REQUIRED");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), project + "-build-")), image = "drumee-il5-application:" + project;
  try {
    for (const name of ["package.json", "package-lock.json", "host.js", "health.js", "Dockerfile"]) fs.copyFileSync(path.join(__dirname, name), path.join(root, name));
    fs.cpSync(path.join(__dirname, "plugins"), path.join(root, "plugins"), { recursive: true });
    execFileSync(trustedExecutable("npm"), ["ci", "--ignore-scripts", "--omit=dev", "--no-audit", "--no-fund"], { cwd: root, stdio: "pipe", env: trustedEnvironment() });
    execFileSync(trustedExecutable("docker"), ["build", "--label", "org.drumee.infra.owner=" + project, "-t", image, root], { stdio: "inherit", env: trustedEnvironment() });
    return { tag: image, image: execFileSync(trustedExecutable("docker"), ["image", "inspect", image, "--format", "{{.Id}}"], { encoding: "utf8", env: trustedEnvironment() }).trim() };
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
module.exports = { build };
