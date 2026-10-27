"use strict";
const fs = require("node:fs"), cp = require("node:child_process"), crypto = require("node:crypto");
const repo = "/home/somanos/github/infra-layer", espree = require(repo + "/node_modules/espree");
const reference = cp.execFileSync("/usr/bin/git", ["rev-parse", "703b637"], { cwd: repo, encoding: "utf8" }).trim();
const before = cp.execFileSync("/usr/bin/git", ["show", reference + ":test/network-attachments/real-docker.cjs"], { cwd: repo, encoding: "utf8" });
const after = fs.readFileSync(repo + "/test/network-attachments/real-docker.cjs", "utf8");
const digest = value => crypto.createHash("sha256").update(value).digest("hex");
function extract(source) {
 const ast = espree.parse(source, { ecmaVersion: 2022, sourceType: "script", range: true, loc: true }), found = [];
 function visit(node, parents = [], phase = "initialization") {
  if (!node || typeof node !== "object" || !node.type) return;
  if (node.type === "CallExpression") {
   const c = node.callee, root = c.type === "MemberExpression" && c.object.name;
   if (["check", "docker", "spawn"].includes(c.name) || ["assert", "D"].includes(root)) {
    const functions = parents.filter(p => /Function/.test(p.type)).map(p => ({ type: p.type, name: p.id?.name || "anonymous", line: p.loc.start.line }));
    const calleeIdentity = callee => {
     if (["ArrowFunctionExpression", "FunctionExpression"].includes(callee.type)) return "IIFE";
     if (callee.type === "Identifier") return callee.name;
     if (callee.type === "MemberExpression") return (callee.object.type === "Identifier" ? callee.object.name : "<call>") + "." + callee.property.name;
     return callee.type;
    };
    const enclosingCalls = parents.filter(p => p.type === "CallExpression").map(p => calleeIdentity(p.callee));
    const context = { functions, enclosingCalls, blocks: parents.filter(p => ["TryStatement", "CatchClause", "ForStatement", "ForOfStatement", "IfStatement"].includes(p.type)).map(p => p.type), phase };
    found.push({ index: found.length, text: source.slice(...node.range), sha256: digest(source.slice(...node.range)), nodeType: node.type, range: node.range, start: node.loc.start, end: node.loc.end, context });
   }
  }
  let currentPhase = phase;
  for (const [key,value] of Object.entries(node)) {
   if (["range","loc"].includes(key)) continue;
   if (Array.isArray(value)) {
    for (const child of value) {
     const expression = child?.type === "ExpressionStatement" && child.expression;
     if (expression?.type === "CallExpression" && source.slice(...expression.callee.range) === "diagnostic.step" && expression.arguments[0]?.type === "Literal") currentPhase = expression.arguments[0].value;
     visit(child, [...parents,node], currentPhase);
    }
   } else if (value && typeof value === "object") visit(value,[...parents,node],phase);
  }
 }
 visit(ast);
 const totals = new Map();for (const x of found) totals.set(x.text,(totals.get(x.text)||0)+1);
 const occurrences = new Map();for(const x of found) {const n=(occurrences.get(x.text)||0)+1;occurrences.set(x.text,n);x.duplicateTotal=totals.get(x.text);x.occurrence=n;}
 return found;
}
const historical = extract(before), current = extract(after), a = historical, b = current;
const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)dp[i][j]=a[i].text===b[j].text?1+dp[i+1][j+1]:Math.max(dp[i+1][j],dp[i][j+1]);
let i=0,j=0;const matches=[],missing=[],added=[];
while(i<a.length||j<b.length){if(i<a.length&&j<b.length&&a[i].text===b[j].text){matches.push({historical:i,current:j,classification:"UNCHANGED_HISTORICAL",note:"Exact-text alignment only; enclosing context independently recorded, not normalized"});i++;j++;}else if(j<b.length&&(i===a.length||dp[i][j+1]>=dp[i+1][j]))added.push(j++);else missing.push(i++);}
const first = matches.find((m,index)=>m.historical!==index||m.current!==index);
const result={historicalReference:reference,historicalSHA256:digest(before),currentSHA256:digest(after),counts:{historical:a.length,current:b.length,exactTextOrderedMatches:matches.length,unmatchedHistorical:missing.length,unmatchedCurrent:added.length},historical,current,exactTextAlignment:matches,unmatchedHistorical:missing.map(n=>a[n]),unmatchedCurrent:added.map(n=>b[n]),firstAlignmentDivergence:first};
fs.writeFileSync(__dirname+"/expression-inventory.json",JSON.stringify(result,null,2)+"\n");fs.writeFileSync(__dirname+"/historical-real-docker.cjs.txt",before);fs.writeFileSync(__dirname+"/current-real-docker.cjs.txt",after);
console.log(JSON.stringify({counts:result.counts,missing:result.unmatchedHistorical.map(x=>({index:x.index,text:x.text,phase:x.context.phase})),added:result.unmatchedCurrent.map(x=>({index:x.index,text:x.text,phase:x.context.phase})),firstAlignmentDivergence:first},null,2));
