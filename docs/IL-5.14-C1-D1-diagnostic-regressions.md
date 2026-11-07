# IL-5.14-C1-D1 diagnostic regression qualification

Gate D: PASS at executable source `62fbaec7e4a60a1f55ce5a61989e67fb79e1bcd6`. The same 13 tests also pass within the final 206-test unit suite at `d4be9edadc60cb70ea8d4236297dedd5052ccb0d`. Environment: Debian 12 amd64, UID/GID 1000:1000, Node 22.22.0, npm 11.18.0, Docker client/server 29.2.0, socket unix:///var/run/docker.sock.

Command: `node --test test/unit/qualification-diagnostic.test.js`. Final focused execution: 2026-10-25T23:01:44.014997–23:01:45.711760 UTC, exit 0, 13 passed, no failures/skips. [Exact command receipts and log hashes](evidence/IL-5.14-C1-D1/execution.jsonl), [focused log](evidence/IL-5.14-C1-D1/diagnostic-regressions-final.log).

| Required case | Actual reporting-path assertion |
|---|---|
| D1 AssertionError | Child artifact retains name, ERR_ASSERTION, message, operator, expected/actual, stack and source |
| D2 nonzero outcome | Child exit 1, concise failure summary, artifact mode 0600 |
| D3 nested cause | Wrapped assertion retains original code, values and stack |
| D4 child boundary | Parent identifies child exit 1 and assertion cause |
| D5 asynchronous rejection | Rejected async assertion fails rather than disappearing |
| D6 Docker failure | Real inspect of unique nonexistent qualification identity retains Docker failure, exit 1 and stderr; no object is created |
| D7 secrets | Known credentials, protected environment/config fields and private-key fixtures are absent from artifact, trace and stderr; useful public context remains |
| D8 complex values | Circular, bigint, symbol, Buffer, Map, Set, NaN and explicit undefined serialize safely |
| D9 bounds | Oversized diagnostic remains valid JSON, at most 32768 bytes, with truncation disclosure |
| D10 success | Exit 0, no failure artifact and no artificial stderr |
| Additional command semantics | Observer delegates the identical receiver, argv, options, stdin, timeout, return object and thrown exception exactly once |
| Additional unchanged assertions | AST comparison with 703b637 preserves all original assertion and Docker/spawn expressions in order |
| Additional evidence safety | Unsafe directory mode and existing trace are rejected; sentinel content remains intact |

The first development regression run had 12 passes and one failure: an explicit undefined value was omitted. Commit 91a38eb preserves that own field without fabricating absent error codes. The first failed log is retained; it is not counted as a successful execution. This diagnostic correction preceded the single instrumented functional reproduction. [Original diagnostic-test failure](evidence/IL-5.14-C1-D1/diagnostic-regressions.log).

No failed Docker lifecycle was retried by the observer. No global environment, Docker configuration or foreign resource was modified. Serialization bounds remain an evidence limitation: the successful two-cycle trace reaches its 512-record cap during cycle 2; the success stdout independently retains all 240 explicit harness command records and both cleanup results. This is not claimed to be a complete unbounded command audit. The failing reproduction's 279-record trace and causal regression's 29-record trace are complete.
