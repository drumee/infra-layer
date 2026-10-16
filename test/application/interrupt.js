"use strict";
// Real process interruption after the real Docker operation. No protocol,
// network, session or resource observation is substituted.
const fs = require("node:fs"), L = require("node:module").createRequire(require("node:path").join(__dirname, "../../package.json"))("@drumee/infra-layer/lifecycle"), D = require("../../lifecycle/docker");
const prepared = JSON.parse(fs.readFileSync(process.argv[2]));
const driver = { ...D, compose(value, args, options) { const result = D.compose(value, args, options); if (args[0] === "up" && args.at(-1) === value.composition.distribution.application.id) process.kill(process.pid, "SIGKILL"); return result; } };
L.activateDeployment(prepared, { root: prepared.root, authorized: true, recover: true, driver }).catch(error => { console.error(error.code || "INTERRUPTION_CHILD_FAILED"); process.exitCode = 1; });
