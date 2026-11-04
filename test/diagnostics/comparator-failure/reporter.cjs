"use strict";
const C = require("./capture.cjs");
module.exports = async function* reporter(source) {
  C.mark("reporter-start");
  let count = 0;
  try {
    for await (const event of source) {
      if (++count > 512) throw new Error("D1_REPORTER_EVENT_BOUND");
      const d = event.data || {};
      const row = { type: event.type, name: d.name, file: d.file, line: d.line, nesting: d.nesting, testNumber: d.testNumber,
        message: d.message === undefined ? undefined : C.text(d.message), error: d.details?.error ? C.error(d.details.error) : undefined,
        passed: d.passed, tests: d.tests, failures: d.failures, success: d.success };
      C.mark("reporter-event", row);
      yield JSON.stringify(row) + "\n";
    }
    C.mark("reporter-complete", { count });
  } catch (cause) { C.observeError("reporter-error", cause); throw cause; }
};
