"use strict";
const path = require("node:path");
function findings(results, root) {
  return results.flatMap(result => result.messages.map(message => ({
    file: path.relative(root, result.filePath).split(path.sep).join("/"),
    line: message.line, column: message.column, rule: message.ruleId,
    severity: message.severity, message: message.message
  })));
}
function regressions(current, baseline) {
  const available = new Map();
  for (const item of baseline) { const key = JSON.stringify(item); available.set(key, (available.get(key) || 0) + 1); }
  return current.filter(item => {
    const key = JSON.stringify(item), count = available.get(key) || 0;
    if (count) { available.set(key, count - 1); return false; }
    return true;
  });
}
async function main() {
  const root = path.resolve(__dirname, ".."), { ESLint } = require("eslint");
  const engine = new ESLint({ cwd: root }), results = await engine.lintFiles(["."]);
  const current = findings(results, root), baseline = require("./eslint-baseline.json");
  console.log((await engine.loadFormatter("stylish")).format(results));
  const errors = current.filter(item => item.severity === 2), added = regressions(current, baseline.findings);
  console.log(JSON.stringify({ errors: errors.length, visible_warnings: current.length - errors.length, baseline_entries: baseline.findings.length, new_findings: added.length }));
  if (errors.length || added.length) process.exitCode = 1;
}
if (require.main === module) main().catch(() => { console.error("LINT_EXECUTION_FAILED"); process.exitCode = 1; });
module.exports = { findings, regressions };
