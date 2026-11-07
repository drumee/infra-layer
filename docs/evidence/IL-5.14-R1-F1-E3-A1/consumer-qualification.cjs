"use strict";
const path = require("node:path"), fs = require("node:fs"), crypto = require("node:crypto"), assert = require("node:assert/strict"), cp = require("node:child_process");
const root = "/home/somanos/github/infra-layer", Q = require(root + "/test/support/trusted-process");
const project = "drumee-il5-" + crypto.randomBytes(4).toString("hex"), tag = "drumee-il5-application:" + project;
const docker = args => cp.execFileSync(Q.trustedExecutable("docker"), args, { encoding: "utf8", env: Q.trustedEnvironment() }).trim();
assert.equal(docker(["image", "ls", "-q", tag]), "");
let built;
try {
  built = require(root + "/test/application/build").build(project);
  const before = docker(["image", "inspect", tag, "--format", "{{.Id}} {{index .Config.Labels \"org.drumee.infra.owner\"}}"]); assert.equal(before, built.image + " " + project);
  const output = cp.execFileSync(Q.trustedExecutable(process.execPath), [path.join(root, "test/application/package-consumer.js")], { cwd: root, encoding: "utf8", env: Q.trustedEnvironment({ IL5_APP_IMAGE: built.image, IL5_TSC: path.join(__dirname, "typescript-tool/node_modules/typescript/lib/tsc.js") }), maxBuffer: 1024 * 1024 });
  console.log(output.trim());
  fs.writeFileSync(path.join(__dirname, "consumer-image-receipt.json"), JSON.stringify({ project, image: built.image, tag, sourceRevision: cp.execFileSync(Q.trustedExecutable("git"), ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", env: Q.trustedEnvironment() }).trim(), typescript: require(path.join(__dirname, "typescript-tool/node_modules/typescript/package.json")).version, packageLock: JSON.parse(fs.readFileSync(path.join(__dirname, "typescript-tool/package-lock.json"))).packages["node_modules/typescript"] }, null, 2) + "\n");
} finally {
  if (built) { assert.equal(docker(["image", "inspect", tag, "--format", "{{.Id}} {{index .Config.Labels \"org.drumee.infra.owner\"}}"]), built.image + " " + project); docker(["image", "rm", tag]); }
  assert.equal(docker(["image", "ls", "-q", tag]), ""); console.log("OWNED_CONSUMER_IMAGE_CLEANED " + project);
}
