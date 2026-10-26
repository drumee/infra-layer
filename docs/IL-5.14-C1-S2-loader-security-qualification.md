# IL-5.14-C1-S2 loader security qualification

Gate C: PASS locally. Implementation c2320fd9f8b69a166211ae40f400ab7b1d4522f0; final Promise/runtime source f54a6ea3c1d170ee543ef98a890b38f0dd449a55. The actual loader no longer imports VM or accepts executable source/filename arguments. It requires the fixed lifecycle/docker module and scopes Node mock.method substitution to its child_process.execFileSync capture, restoring the builtin and prior require.cache entry in finally. Each fixture instance captures only its own executor; there is no fallback to a privileged host operation.

`node --test test/unit/network-loader.test.js test/unit/network-attachments.test.js`, 2026-10-26T14:19:45.753121–14:19:45.979997 UTC, exit0,19 passed: all13 original network regressions plus6 new loader-security tests. They are also included in the final217-test unit run. Syntax validation passes for the loader, historical proof, extracted helper and modified network tests.

| Security control | Actual regression |
|---|---|
| Expected source | Fixed literal current-module require, unchanged exports and separate module identity |
| Source/path rejection | Strings, filenames, extra source arguments and invalid executor metadata fail before substitution |
| No host fallback | Controlled executor receives exactly the trusted Docker path/socket/arguments and shell:false/protected environment; global builtin/cache restored |
| Instance isolation | Two separately loaded actual modules retain distinct executors; nonzero37 propagates as the canonical failure |
| Historical identity | Exact c218811 source and metadata fixture hashes required; altered bytes,wrong identity/string type/extra historical arguments rejected |
| Historical negative/nonzero | Fixed CLI succeeds only for the pinned AST proof; extra source argument exits1; old unguarded endpoint inspect produces the expected failed-command diagnostic through the real current adapter |

The historical proof parses but does not execute JavaScript. It verifies the pinned unconditional Object.keys attachment loop and direct id argument to inspect, derives the old command vector from realistic pinned metadata, and exercises the actual command adapter with a controlled invalid-object failure. Old executed-source evidence is preserved. No claim is made that the old module was executed in S2. This removes a general execution capability while retaining the same before/after identity and failure evidence.

The private readiness helper extraction also removes the previous VM-based appended export. Tests directly exercise its actual factory with controlled monotonic time/delay: resolution after3 observations, exactly101 permanent-unsettled observations by the5s deadline, and immediate one-call propagation of Docker/ownership/missing/invalid errors. Production defaults retain performance.now,5s and50ms. Root/lifecycle public exports and declarations are unchanged. The legitimate helper adds one whitelisted production package member; full runtime/package qualification is required separately.

No eval/Function/replacement interpreter is introduced, no source is selected from CLI input, no test assertion or scanner rule is removed. Node22's existing stable builtin test tooling is used; no dependency or experimental module-mocking flag is added. Hosted S1523/S8704 resolution is not claimed from local results alone; the exact-head SonarCloud gate remains mandatory.

[Baseline/design](IL-5.14-C1-S2-loader-design.md), [command receipts](evidence/IL-5.14-C1-S2/execution.jsonl).
