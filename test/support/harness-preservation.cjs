"use strict";
const crypto = require("node:crypto"), espree = require("espree");
const reference = "703b637425487286632e741045a1b96591e90c62";
const sourceSHA256 = "67672bb516d08281f8dbdba8e8fe1b1a8f9f15d86667a3b7f74f2229cc9d107c";
const replacement = Object.freeze({
  authorization: "IL514_R1_F1_APPROVED_NETWORK_MEMBERSHIP_REFUSAL",
  historical: "check(D.checkNetworks(missing), undefined)",
  current: 'assert.throws(() => D.checkNetworks(missing), { code: "NETWORK_ATTACHMENT_MISMATCH" })',
  phase: "missing-network-refusal", category: "APPROVED_REPLACEMENT"
});
const addition = Object.freeze({
  anchor: 'docker(["network", "disconnect", netname, id]);',
  expression: 'assert.throws(() => D.checkNetworks(composition, { require_existing: true }), { code: "NETWORK_ATTACHMENT_MISMATCH" })',
  phase: "network-detachment", category: "APPROVED_ADDITION"
});
const hash = value => crypto.createHash("sha256").update(value).digest("hex");
function fail(code, index = null) { throw Object.assign(Error(code), { code, expressionIndex: index }); }
function pinned(source) { if (typeof source !== "string" || hash(source) !== sourceSHA256) fail("UNAPPROVED_HISTORICAL_SOURCE"); }
function once(source, from, to) {
  const index = source.indexOf(from);
  if (index < 0 || source.indexOf(from, index + from.length) >= 0) fail("AUTHORIZATION_COUNTERPART_MISSING");
  return source.slice(0, index) + to + source.slice(index + from.length);
}
function authorizedSource(before, mode = "candidate") {
  pinned(before);
  if (!["historical", "additions", "candidate"].includes(mode)) fail("INVALID_PRESERVATION_MODE");
  if (mode === "historical") return before;
  let expected = once(before, addition.anchor, 'diagnostic.step("' + addition.phase + '"); ' + addition.anchor + " " + addition.expression + ";");
  if (mode === "candidate") expected = once(expected, replacement.historical, 'diagnostic.step("' + replacement.phase + '"); ' + replacement.current);
  return expected;
}
function calleeName(node) {
  if (node.type === "Identifier") return node.name;
  if (node.type === "MemberExpression") return calleeName(node.object) + "." + (node.computed ? "[computed]" : node.property.name);
  if (node.type === "CallExpression") return calleeName(node.callee) + "()";
  return node.type;
}
function expressions(source) {
  const ast = espree.parse(source, { ecmaVersion: 2022, sourceType: "script", range: true }), found = [];
  function visit(node, context = [], phase = "initialization", parent = null, key = "") {
    if (!node || typeof node !== "object" || !node.type) return;
    let next = context;
    if (["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"].includes(node.type)) {
      // Only the already-qualified top-level IIFE -> diagnostic.run wrapper is
      // equivalent. Moving an operation to any other callback changes context.
      const main = context.length === 0 && parent?.type === "CallExpression" && (key === "callee" || calleeName(parent.callee) === "diagnostic.run");
      const name = main ? "acceptance-main" : node.id?.name || (parent?.type === "VariableDeclarator" ? parent.id.name : parent?.type === "CallExpression" ? "callback:" + calleeName(parent.callee) + ":" + parent.arguments.indexOf(node) : "anonymous:" + parent?.type);
      next = [...context, "function:" + name + "(" + node.params.map(p => source.slice(...p.range)).join(",") + ")"];
    }
    if (["IfStatement", "ForStatement", "ForOfStatement", "WhileStatement"].includes(node.type)) {
      next = [...next, node.type + ":" + [node.init, node.test, node.update, node.left, node.right].filter(Boolean).map(n => source.slice(...n.range)).join(";")];
    }
    if (node.type === "BlockStatement" && ["TryStatement", "CatchClause", "IfStatement"].includes(parent?.type)) next = [...next, parent.type + ":" + key];
    if (node.type === "CallExpression") {
      const callee = node.callee, root = callee.type === "MemberExpression" && callee.object.name;
      if (["check", "docker", "spawn"].includes(callee.name) || ["assert", "D"].includes(root)) found.push({ text: source.slice(...node.range), context: next, phase, nodeType: node.type, range: node.range });
    }
    for (const [childKey, value] of Object.entries(node)) {
      if (childKey === "range") continue;
      if (Array.isArray(value)) {
        let current = phase;
        for (const child of value) {
          const call = child?.type === "ExpressionStatement" && child.expression;
          if (call?.type === "CallExpression" && calleeName(call.callee) === "diagnostic.step" && typeof call.arguments[0]?.value === "string") current = call.arguments[0].value;
          visit(child, next, current, node, childKey);
        }
      } else if (value && typeof value === "object") visit(value, next, phase, node, childKey);
    }
  }
  visit(ast); return found;
}
const identity = value => JSON.stringify([value.text, value.context]);
function multiset(values) { return JSON.stringify(values.slice().sort()); }
function verify(before, after, { mode = "candidate" } = {}) {
  const expected = expressions(authorizedSource(before, mode)), actual = expressions(after);
  const count = text => actual.filter(x => x.text === text);
  if (mode === "candidate") {
    const uses = count(replacement.current);
    if (uses.length > 1) fail("DUPLICATE_AUTHORIZATION_USE");
    if (!uses.length) fail(count(replacement.historical).length ? "APPROVED_REPLACEMENT_MISSING" : "UNAUTHORIZED_REPLACEMENT");
    if (uses[0].phase !== replacement.phase) fail("EXPRESSION_CONTEXT_MISMATCH");
  }
  if (mode !== "historical") {
    const uses = count(addition.expression);
    if (uses.length !== 1) fail("UNAPPROVED_ADDITION");
    if (uses[0].phase !== addition.phase) fail("EXPRESSION_CONTEXT_MISMATCH");
  }
  const want = expected.map(identity), got = actual.map(identity), index = want.findIndex((x, i) => x !== got[i]);
  if (index === -1 && want.length === got.length) return { historicalExpressions: expressions(before).length, currentExpressions: actual.length, replacements: mode === "candidate" ? 1 : 0, additions: mode === "historical" ? 0 : 1 };
  if (got.length < want.length) fail("HISTORICAL_EXPRESSION_REMOVED", index);
  if (got.length > want.length) fail("UNAPPROVED_ADDITION", index);
  if (multiset(want) === multiset(got)) fail("HISTORICAL_EXPRESSION_REORDERED", index);
  if (multiset(expected.map(x => x.text)) === multiset(actual.map(x => x.text))) fail("EXPRESSION_CONTEXT_MISMATCH", index);
  fail("HISTORICAL_EXPRESSION_MODIFIED", index);
}
module.exports = { reference, sourceSHA256, replacement, addition, authorizedSource, expressions, verify };
