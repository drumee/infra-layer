"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { append, readJournal } = require("../../lifecycle/journal");
function root(t) { const value = fs.mkdtempSync(path.join(os.tmpdir(), "infra-journal-")); t.after(() => fs.rmSync(value, { recursive: true, force: true })); return value; }
test("durable journal chains phases and refuses sensitive arbitrary details", (t) => { const directory = root(t); const rev = "a".repeat(64); const a = append(directory, "prepared", rev); const b = append(directory, "activation-intent", rev); assert.equal(b.previous, a.digest); assert.equal(readJournal(directory).length, 2); assert.throws(() => append(directory, "active", rev, { password: "DO-NOT-ECHO" }), (error) => error.code === "INVALID_JOURNAL_EVENT" && !error.message.includes("DO-NOT-ECHO")); });
test("edited, missing or out-of-order journal entries fail closed", (t) => { const directory = root(t); append(directory, "prepared", "a".repeat(64)); const file = path.join(directory, "journal/00000001.json"); const original = fs.readFileSync(file); fs.writeFileSync(file, "corrupt"); assert.throws(() => readJournal(directory), { code: "LIFECYCLE_JOURNAL_CORRUPTED" }); fs.writeFileSync(file, original); fs.renameSync(file, path.join(directory, "journal/00000002.json")); assert.throws(() => readJournal(directory), { code: "LIFECYCLE_JOURNAL_CORRUPTED" }); });
