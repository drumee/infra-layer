"use strict";
// Copied beside a hash-pinned literal historical module by regression.test.cjs.
const { EventEmitter } = require("node:events"), { PassThrough } = require("node:stream"), child = require("node:child_process"), { mock } = require("node:test"), assert = require("node:assert/strict"), path = require("node:path");
const cli = new EventEmitter(); cli.stdout = new PassThrough(); cli.killed = false;
cli.kill = signal => { assert.equal(signal, "SIGTERM"); cli.killed = true; queueMicrotask(() => { cli.stdout.end(); cli.emit("close", 143, null); }); return true; };
mock.method(child, "spawn", (program, args) => { assert.equal(program, "/usr/bin/docker"); assert.equal(args[0], "events"); return cli; });
process.argv = [process.execPath, __filename, "drumee-il2-test-aabbccdd", new Date().toISOString(), path.join(__dirname, "historical.jsonl"), "F1-HISTORICAL-143"];
require("./historical/services-capture/docker-events.cjs");
process.emit("SIGTERM");
