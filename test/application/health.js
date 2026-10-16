"use strict";
module.exports = class Health { ready() { return { ready: true }; } };
if (require.main === module) {
  const http = require("node:http");
  const req = http.get("http://127.0.0.1:3101/-/svc/health.ready", res => { res.resume(); res.on("end", () => process.exit(res.statusCode === 200 ? 0 : 1)); });
  req.setTimeout(2000, () => req.destroy()); req.on("error", () => process.exit(1));
}
