"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
let sequence = 0;
test("P2 hook first case", () => { assert.equal(sequence++, 0); });
test("P2 hook second case", () => { assert.equal(sequence++, 1); });
