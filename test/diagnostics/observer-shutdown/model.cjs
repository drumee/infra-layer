"use strict";
const assert = require("node:assert/strict");
const { ObserverContract } = require("../services-capture/observer-contract.cjs");
function model(log) {
  const child = { pid: 101, spawnfile: "/usr/bin/docker", spawnargs: ["/usr/bin/docker", "events"], kills: [], kill(signal) { this.kills.push(signal); return true; } };
  const contract = new ObserverContract(log); contract.start(child); assert.equal(contract.spawned(child), true);
  return { child, contract };
}
function complete(contract) { assert.equal(contract.complete({ windowComplete: true, evidenceComplete: true, servicesTerminal: true }), true); }
function drain(contract) { for (const stream of ["stdout", "stderr"]) { contract.stream(stream, "ended"); contract.stream(stream, "closed"); } }
function terminal(contract, child, code = 143, signal = null) { contract.exit(child, code, signal); drain(contract); return contract.close(child, code, signal); }
module.exports = { model, complete, drain, terminal };
