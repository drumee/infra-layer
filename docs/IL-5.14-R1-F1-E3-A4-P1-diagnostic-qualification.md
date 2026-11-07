# P1 diagnostic qualification

Gate E PASS. Gate D PASS after E validates the observer mechanisms. Diagnostic source `5954bc121b3790d405aa48bf724a624c259f30a2`, Node22.22.0/built-in Undici6.23.0, UID/GID1000, Linux local loopback fixtures. Exact command: `python3 test/diagnostics/postfix-http/record.py diagnostic-fixtures node --test test/diagnostics/postfix-http/diagnostic.test.cjs`. Exit0;9/9 tests, no skips/cancellations. Every fixture uses a unique attempt UUID and private0700 directory; child processes are reaped. The unavailable endpoint fixture creates no child. Each scenario issues exactly one request and asserts the relevant successful or rejected outcome. Intentional child exit23 and uncaught handler exit1 are expected negative controls, not ignored process exits.

| Scenario | Observed result |
|---|---|
| E1 successful capture | Listening, connection, handler, headers/finish, client headers/body completion; assertions precede cleanup |
| E2 server closes before response | Explicit close request and socket interruption precede client transport rejection |
| E3 process termination | Fault exit marker/process.exit23, parent child.exit23, client failure; no complete response |
| E4 synchronous handler exception | Handler throw, uncaughtExceptionMonitor and process.exit1, original transport rejection |
| E5 reset | Controlled socket.resetAndDestroy marker, client request error with transport code, no body completion |
| E6 unavailable endpoint | Connection refused/ECONNREFUSED, not SMTP; no response |
| E7 premature cleanup | Cleanup requested and server close before fetch rejection |
| E8 normal cleanup | Application assertions complete before cleanup, normal response, no fetch error |
| E9 persistent transport failure | One request only; rejection and original cause remain fatal; no successful response/retry |

[Original TAP output](evidence/IL-5.14-R1-F1-E3-A4-P1/diagnostic-fixtures.log), [per-scenario event streams](evidence/IL-5.14-R1-F1-E3-A4-P1/fixtures/E1.jsonl), [exact command/source/hashes/exits/protected-config ledger](evidence/IL-5.14-R1-F1-E3-A4-P1/execution.jsonl). E1–E9 files are adjacent. Authorization sentinel and controlled exception message do not appear in diagnostic output. No HTTP/SMTP payload or header values are logged.

These controlled causes are deliberately injected in isolated fixtures. They establish diagnostic signatures and do not prove which cause occurred in A2. The fixed real-capture preload installation is exercised by the subsequent targeted attempt, not claimed as tested by the helper-only fixtures. Diagnostic timing remains intrusive; no timing-based historical exclusion is inferred.

Separately, A2 preservation/reachability and refusal-effectiveness regressions pass54/54 at the same source, exit0. Command: `python3 test/diagnostics/postfix-http/record.py invariant-guards node --test test/unit/harness-preservation.test.js test/unit/harness-reachability.test.js test/unit/refusal-effectiveness.test.js`. [Output](evidence/IL-5.14-R1-F1-E3-A4-P1/invariant-guards.log). This is preservation evidence, not full P1 unit/contract or corrected Postfix qualification.
