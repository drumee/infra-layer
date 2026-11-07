"use strict";
function evidenceWindow(client, server, services, downCode) {
  const result = { valid: false, reason: "WINDOW_INCOMPLETE", cases: 0, operations: 0 };
  if (!Number.isInteger(services?.status) || downCode !== 0) return result;
  const expected = JSON.stringify(Array.from({ length: 17 }, (_, index) => index + 1));
  for (const event of ["case.start", "case.completed"]) if (JSON.stringify(client.filter(row => row.event === event).map(row => row.current_case)) !== expected) return { ...result, reason: "CASE_EVIDENCE_INCOMPLETE" };
  result.cases = 17;
  const starts = client.filter(row => row.event === "operation.start").map(row => row.operation_id);
  const terminal = client.filter(row => ["operation.completed", "operation.error", "operation.body.error"].includes(row.event)).map(row => row.operation_id);
  result.operations = starts.length;
  if (!starts.length || new Set(starts).size !== starts.length || terminal.length !== starts.length || starts.some(id => terminal.filter(value => value === id).length !== 1)) return { ...result, reason: "REQUEST_EVIDENCE_INCOMPLETE" };
  if (client.some(row => (["case.start", "case.completed", "intentional.shutdown", "suite.pending.at.exit"].includes(row.event) && row.pending_application?.length) || row.cross_case)) return { ...result, reason: "UNRESOLVED_OPERATION" };
  const instances = [...new Set(server.filter(row => row.event === "process.start").map(row => row.process_instance))];
  if (!instances.length || server.some(row => ["process.uncaught", "server.handler.throw", "server.error"].includes(row.event))) return { ...result, reason: "SERVER_EVIDENCE_INCOMPLETE" };
  for (const instance of instances) {
    const rows = server.filter(row => row.process_instance === instance);
    if (!rows.some(row => row.event === "server.listening") || !rows.some(row => row.event === "process.exit" && row.code === 0)) return { ...result, reason: "SERVER_EVIDENCE_INCOMPLETE" };
    const entered = rows.filter(row => row.event === "server.handler.enter").map(row => row.request_id);
    if (entered.some(id => !rows.some(row => row.event === "server.handler.return" && row.request_id === id) || !rows.some(row => row.event === "server.response.finish" && row.request_id === id))) return { ...result, reason: "SERVER_EVIDENCE_INCOMPLETE" };
  }
  return { ...result, valid: true, reason: "REQUIRED_WINDOW_COMPLETE" };
}
module.exports = { evidenceWindow };
