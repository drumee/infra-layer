"use strict";
// Test-only direct-child lifecycle contract. No PID lookup or process-group signals.
class ObserverContract {
  constructor(log = () => {}) {
    this.log = log; this.state = "NOT_STARTED"; this.firstError = null; this.result = null;
    this.streams = { stdout: { ended: false, closed: false }, stderr: { ended: false, closed: false } };
  }
  transition(state) { this.state = state; this.log("observer.state", { state }); }
  fail(code) {
    if (!this.firstError) { this.firstError = code; this.log("observer.failure", { code, state: this.state }); }
    if (this.result?.accepted) this.result = { ...this.result, accepted: false, reason: this.firstError };
    this.transition("FAILED"); return false;
  }
  start(child) {
    if (this.state !== "NOT_STARTED") return this.fail("DUPLICATE_START");
    this.child = child; this.pid = child.pid; this.executable = child.spawnfile; this.args = [...(child.spawnargs || [])];
    this.transition("STARTING"); return true;
  }
  same(child) { return child === this.child && Number.isInteger(this.pid) && this.pid > 0 && child.pid === this.pid && child.spawnfile === this.executable && JSON.stringify(child.spawnargs) === JSON.stringify(this.args); }
  spawned(child) {
    if (this.state !== "STARTING" || !this.same(child)) return this.fail("OBSERVER_IDENTITY");
    this.started = true; this.transition("COLLECTING"); return true;
  }
  complete({ windowComplete, evidenceComplete, servicesTerminal }) {
    if (this.state !== "COLLECTING") return this.fail("COLLECTION_STATE");
    if (!windowComplete || !evidenceComplete || !servicesTerminal) return this.fail("COLLECTION_INCOMPLETE");
    this.collectionComplete = true; this.transition("COLLECTION_COMPLETE"); return true;
  }
  stop(child) {
    if (!this.same(child)) return this.fail("OBSERVER_IDENTITY");
    // A duplicate is rejected; it neither sends another signal nor replaces intent.
    if (this.intent) return this.fail("DUPLICATE_STOP");
    if (this.state !== "COLLECTION_COMPLETE") return this.fail("PREMATURE_STOP");
    this.intent = { pid: this.pid, signal: "SIGTERM" };
    this.transition("STOP_REQUESTED");
    this.log("observer.stop.intent", { pid: this.pid, signal: "SIGTERM", executable: this.executable });
    try { this.signalSent = child.kill("SIGTERM") === true; }
    catch { this.signalSent = false; }
    this.log("observer.signal.sent", { pid: this.pid, signal: "SIGTERM", success: this.signalSent });
    if (!this.signalSent) return this.fail("SIGNAL_DELIVERY_FAILED");
    return true;
  }
  exit(child, code, signal) {
    this.log("observer.exit", { pid: child.pid, code, signal });
    if (!this.same(child)) this.fail("OBSERVER_IDENTITY");
    if (this.exitSeen) this.fail("DUPLICATE_EXIT");
    this.exitSeen = { code, signal };
    if (!["STOP_REQUESTED", "COLLECTION_COMPLETE", "FAILED"].includes(this.state)) this.fail("PREMATURE_EXIT");
    else if (this.state === "COLLECTION_COMPLETE" && (code !== 0 || signal !== null)) this.fail("UNSOLICITED_TERMINATION");
  }
  stream(which, phase) {
    this.streams[which][phase] = true;
    this.log("observer.stream", { stream: which, phase }); return this.finalize();
  }
  close(child, code, signal) {
    this.log("observer.close", { pid: child.pid, code, signal });
    if (!this.same(child)) this.fail("OBSERVER_IDENTITY");
    if (!this.exitSeen || this.exitSeen.code !== code || this.exitSeen.signal !== signal) this.fail("EXIT_CLOSE_MISMATCH");
    this.closeSeen = { code, signal }; return this.finalize();
  }
  deadline() {
    this.fail(this.closeSeen ? "STREAM_COMPLETION_TIMEOUT" : this.collectionComplete ? "SHUTDOWN_TIMEOUT" : "COLLECTION_TIMEOUT");
    if (!this.result) this.result = { accepted: false, reason: this.firstError, streams: this.streams, close_seen: !!this.closeSeen };
    return this.result;
  }
  finalize() {
    if (this.result || !this.closeSeen || !Object.values(this.streams).every(value => value.ended && value.closed)) return this.result;
    const { code, signal } = this.closeSeen;
    const controlled = !!this.intent && this.signalSent === true;
    // Numeric143 is a supported representation only for the directly spawned Docker events CLI.
    const directDocker = this.executable === "/usr/bin/docker" && this.args[0] === "/usr/bin/docker" && this.args[1] === "events";
    const normal = code === 0 && signal === null;
    const expected = controlled && ((code === null && signal === "SIGTERM") || (code === 143 && signal === null && directDocker) || normal);
    if (!this.started || !this.collectionComplete) this.fail("COLLECTION_INCOMPLETE");
    if (!expected && !(normal && !this.intent)) this.fail("UNEXPECTED_TERMINATION");
    if (!this.firstError) this.transition("TERMINATED");
    this.result = { accepted: !this.firstError, reason: this.firstError || (controlled ? "CONTROLLED_SIGTERM_COMPLETE" : "NORMAL_COLLECTION_COMPLETE"), pid: this.pid, code, signal, controlled, signal_sent: this.signalSent === true, collection_complete: !!this.collectionComplete, streams: this.streams };
    this.log("observer.classification", this.result); return this.result;
  }
}
function campaignResult(expectedObservers = 2) {
  let firstFailure = null, services, cleanup = false;
  const fail = code => { if (!firstFailure) firstFailure = code; };
  return {
    fail,
    services(result) { services = result; if (!result || result.status !== 0 || result.signal) fail("SERVICES_FAILED"); },
    cleanup(value) { cleanup = value; if (!value) fail("CLEANUP_FAILED"); },
    finish(observers) {
      if (!services) fail("SERVICES_NOT_COMPLETE");
      if (!cleanup) fail("CLEANUP_NOT_COMPLETE");
      if (observers.length !== expectedObservers || observers.some(value => !value?.accepted)) fail("DIAGNOSTIC_INCOMPLETE");
      return { code: firstFailure ? 1 : 0, first_failure: firstFailure };
    }
  };
}
module.exports = { ObserverContract, campaignResult };
