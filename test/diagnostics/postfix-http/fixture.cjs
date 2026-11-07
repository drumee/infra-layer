"use strict";
const http = require("node:http");
const observe = require("./observe.cjs");
const [mode, attempt, file] = process.argv.slice(2);
const log = observe.logger(attempt, "fixture-server", file);
observe.processEvents(log);
const server = observe.serverEvents(http.createServer(observe.handler(log, (request, response) => {
  if (mode === "E2" || mode === "E7" || mode === "E9") {
    log(mode === "E7" ? "cleanup.requested" : "fault.close.before.response");
    server.close(); server.closeAllConnections();
  } else if (mode === "E3") { log("fault.process.exit"); process.exit(23); }
  else if (mode === "E4") { const error = new Error("CONTROLLED_HANDLER_FAILURE"); error.code = "P1_HANDLER_FAILURE"; throw error; }
  else if (mode === "E5") { log("fault.socket.reset"); request.socket.resetAndDestroy(); }
  else { response.writeHead(200, { "content-type": "application/json" }); response.end('{"count":1}'); }
})), log);
server.listen(0, "127.0.0.1", () => process.send({ port: server.address().port }));
process.on("message", message => {
  if (message === "cleanup") {
    log("cleanup.requested");
    const complete = () => { log("cleanup.completed"); process.disconnect(); };
    if (server.listening) server.close(complete); else complete();
  }
});
