"use strict";
// P2 adds application completion and case ownership to the unchanged P1 observer.
const p1 = require("./observe.cjs");
function install(port, log) {
  let currentCase = null, dispatch = null, next = 0;
  const operations = new Map(), requests = new Map();
  const pending = () => [...operations.values()].filter(op => !["completed", "failed"].includes(op.state)).map(op => ({ operation_id: op.id, owner_case: op.owner, state: op.state, connection_id: op.connection }));
  const emit = (event, fields = {}) => log(event, { current_case: currentCase, ...fields });
  function transport(event, fields) {
    if (event === "client.request.create") requests.set(fields.request_id, { operation: dispatch, active: true });
    const request = requests.get(fields.request_id), operation = operations.get(request?.operation);
    if (event === "client.request.socket" && operation) { request.connection = fields.connection_id; operation.connection = fields.connection_id; }
    if (["client.response.body.complete", "client.request.error"].includes(event) && request) request.active = false;
    const active = fields.connection_id === undefined ? [] : [...requests.entries()].filter(([, value]) => value.connection === fields.connection_id && value.active).map(([id]) => id);
    emit(event, { ...fields, operation_id: request?.operation, owner_case: operation?.owner,
      ...(fields.connection_id === undefined ? {} : { connection_activity: active.length ? "active_request" : "idle_persistent_connection", active_requests: active }),
      ...(event.startsWith("client.socket.") ? { pending_application: pending() } : {}) });
  }
  const restoreP1 = p1.clientEvents(port, transport), original = globalThis.fetch;
  globalThis.fetch = function(input, options) {
    if (String(input) !== `http://127.0.0.1:${port}` && String(input) !== `http://127.0.0.1:${port}/`) return original.call(this, input, options);
    if (++next > 1024) throw new Error("P2_OPERATION_LIMIT");
    const op = { id: next, owner: currentCase, state: "request_started" }; operations.set(op.id, op);
    emit("operation.start", { operation_id: op.id, owner_case: op.owner, port });
    dispatch = op.id;
    let result;
    try { result = original.call(this, input, options); }
    catch (error) { op.state = "failed"; emit("operation.error", { operation_id: op.id, owner_case: op.owner, error: p1.errorValue(error) }); throw error; }
    finally { dispatch = null; }
    return result.then(response => {
      op.state = "headers_received";
      emit("operation.headers", { operation_id: op.id, owner_case: op.owner, status: response.status });
      const json = response.json;
      response.json = function(...args) {
        op.state = "body_processing";
        emit("operation.body.start", { operation_id: op.id, owner_case: op.owner });
        return json.apply(this, args).then(value => {
          op.state = "completed";
          emit("operation.completed", { operation_id: op.id, owner_case: op.owner, cross_case: currentCase !== op.owner });
          return value;
        }, error => { op.state = "failed"; emit("operation.body.error", { operation_id: op.id, owner_case: op.owner, error: p1.errorValue(error) }); throw error; });
      };
      return response;
    }, error => { op.state = "failed"; emit("operation.error", { operation_id: op.id, owner_case: op.owner, error: p1.errorValue(error) }); throw error; });
  };
  return {
    begin(id) { currentCase = id; emit("case.start", { pending_application: pending() }); },
    end() { emit("case.completed", { pending_application: pending() }); currentCase = null; },
    shutdown(operation, services) { emit("intentional.shutdown", { operation, services, pending_application: pending() }); },
    pending,
    event: emit,
    restore() { globalThis.fetch = original; restoreP1(); }
  };
}
module.exports = { install };
