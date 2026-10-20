"use strict";
const { trustedExecutable, trustedEnvironment } = require("./support/trusted-process");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
for (const file of ["integration/run.js", "services/run.js", "lifecycle/run.js", "lifecycle/gateway-run.js"]) {
  const result = spawnSync(trustedExecutable(process.execPath), [path.join(__dirname, file)], { stdio: "inherit", env: trustedEnvironment() });
  if (result.status !== 0) { process.exitCode = 1; break; }
}
