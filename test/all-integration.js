"use strict";
const { spawnSync } = require("node:child_process");
const path = require("node:path");
for (const file of ["integration/run.js", "services/run.js"]) {
  const result = spawnSync(process.execPath, [path.join(__dirname, file)], { stdio: "inherit" });
  if (result.status !== 0) { process.exitCode = 1; break; }
}
