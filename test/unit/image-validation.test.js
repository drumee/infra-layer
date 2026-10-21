"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const api = require("../../lib");
const { inputs } = require("../support/inputs");
const digest = "a".repeat(64);
function plan(image) {
  const value = inputs(); value.adapter_input.image = image;
  return api.planInfrastructure(value.spec, value.requirements, value.adapter_input);
}
test("pinned image validation preserves the supported reference and numeric suffix grammar", () => {
  for (const name of ["nginx", "registry.example/a-b_c.d", "registry:5000/a/b", "nginx:123", "r:1tag", "-", "a/", "_a"])
    assert.equal(plan(name + "@sha256:" + digest).applicable, true, name);
  for (const name of ["nginx:stable", "registry:5000/nginx:123", ":123", "a:", "a:x", "a::1", "a:1:2", "a b", "a@b", "a;echo", "a\\b", "é"])
    assert.ok(plan(name + "@sha256:" + digest).diagnostics.some(x => x.code === "INCOMPATIBLE_ADAPTER_CONFIGURATION" && x.field === "adapter.image"), name);
});
test("pinned images require the exact SHA256 digest and refuse control characters", () => {
  for (const image of [null, 42, "nginx:latest", "nginx@sha512:" + digest, "@sha256:" + digest,
    "nginx@sha256:" + "a".repeat(63), "nginx@sha256:" + "a".repeat(65), "nginx@sha256:" + "A".repeat(64),
    ...["\n", "\r", "\r\n", "\u2028", "\u2029", "\0", " "].map(end => "nginx@sha256:" + digest + end)]) {
    const result = plan(image);
    assert.equal(result.applicable, false);
    assert.equal(result.artifacts.length, 0);
    assert.ok(result.diagnostics.some(x => x.code === "INCOMPATIBLE_ADAPTER_CONFIGURATION" && x.field === "adapter.image"));
  }
});
test("malformed long image references cannot consume unbounded backtracking time", () => {
  // Isolate the public API call so a regression has a hard process timeout.
  const script = `const assert=require('node:assert/strict'),api=require('./lib'),{inputs}=require('./test/support/inputs');
    const v=inputs();for(const prefix of ['-'+'0'.repeat(1000000),'r:'+'0'.repeat(1000000)]){
      v.adapter_input.image=prefix+'@sha256:'+'f'.repeat(63)+'!';
      const p=api.planInfrastructure(v.spec,v.requirements,v.adapter_input);
      assert.equal(p.applicable,false);assert.ok(p.diagnostics.some(x=>x.field==='adapter.image'&&x.code==='INCOMPATIBLE_ADAPTER_CONFIGURATION'));
    }`;
  const result = spawnSync(process.execPath, ["--max-old-space-size=64", "-e", script], {
    cwd: require("node:path").resolve(__dirname, "../.."), env: { PATH: "/usr/bin:/bin", LANG: "C", LC_ALL: "C" }, timeout: 3000, encoding: "utf8"
  });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr);
});
test("long valid image references remain accepted without adding a new size contract", () => {
  assert.equal(plan("a".repeat(100000) + "@sha256:" + digest).applicable, true);
});
