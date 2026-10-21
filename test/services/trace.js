"use strict";
const os = require("node:os");
function trace(project, event, fields = {}) {
  console.log("IL2_TRACE " + JSON.stringify({ project, event, utc: new Date().toISOString(), mono_ns: process.hrtime.bigint().toString(), ...fields }));
}
function runner(project, event) {
  trace(project, event, { load: os.loadavg(), free_bytes: os.freemem(), total_bytes: os.totalmem() });
}
module.exports = { trace, runner };
