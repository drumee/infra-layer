"use strict";
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const T = require("../../internal/system-tools");
const image = "node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392";
const root = fs.realpathSync(path.join(__dirname, "../.."));
const project = "drumee-il511r-tools-" + crypto.randomBytes(6).toString("hex");
const output = execFileSync(T.resolveTrustedExecutable("docker"), ["--host", "unix:///var/run/docker.sock", "run", "--rm", "--name", project, "--label", "org.drumee.infra.owner=" + project, "--network", "none", "--read-only", "--cap-drop", "ALL", "--cap-add", "CHOWN", "--security-opt", "no-new-privileges:true", "--pids-limit", "32", "--memory", "128m", "--tmpfs", "/owned:rw,exec,nosuid,nodev,mode=0755,size=16777216", "--tmpfs", "/usr/bin:rw,exec,nosuid,nodev,mode=0755,size=1048576", "--tmpfs", "/etc/docker:rw,nosuid,nodev,mode=0755,size=1048576", "--mount", "type=bind,source=" + root + ",target=/source,readonly", "--entrypoint", "/usr/local/bin/node", image, "/source/test/security/system-tools-container.cjs"], { encoding: "utf8", env: T.systemEnvironment("docker"), timeout: 120000, maxBuffer: 65536 });
console.log(output.trim());
