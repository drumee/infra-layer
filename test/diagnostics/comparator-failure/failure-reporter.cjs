"use strict";
const C = require("./capture.cjs"), reporter = require("./reporter.cjs");
module.exports = async function* failureReporter(source) {
  for await (const line of reporter(source)) {
    yield line;
    const row = JSON.parse(line);
    if (row.type === "test:pass" || row.type === "test:fail") {
      const cause = Object.assign(new Error("D1_REPORTER_FAILURE"), { code: "D1_REPORTER_FAILURE" });
      C.mark("injected-reporter-error", { error: C.error(cause) }); throw cause;
    }
  }
};
