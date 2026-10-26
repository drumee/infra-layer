# IL-5.14-C1-S2 Promise ownership qualification

Gate D: PASS locally at f54a6ea3c1d170ee543ef98a890b38f0dd449a55. diagnostic.run now awaits the task, captures the primary failure, finalizes its trace, sets exitCode1 and rejects that original error. All four reported call sites use explicit .catch(diagnostic.fail); an additional controlled ownership case verifies rejection identity. The terminal owner emits one bounded/redacted summary and nonzero status after cleanup. It is neither an empty catch nor a void-only discard, and run does not resolve a failed task as successful.

If a task already captured its assertion and cleanup later rejects, the original assertion remains primary. A separate exclusive secondary-failure artifact preserves the cleanup error, including when the bounded trace cannot retain additional records. Evidence-write refusal is reported without overwriting the existing artifact; the original process still fails. A trace-close failure is captured as a failed owned rejection. No retry, early process.exit, assertion removal or changed Docker invocation occurs. Individual task/substep output is not an independent qualification: the process exit and terminal diagnostic determine the overall outcome.

`node --test test/unit/qualification-diagnostic.test.js`, 2026-10-26T14:22:58.573639–14:22:59.810677 UTC, exit0:17 tests passed, no skips. They are included in the final217-test suite. The existing13 tests continue to verify synchronous/asynchronous assertions, nested causes, child-process propagation, genuine Docker nonzero1, secrets, complex/bounded serialization, successful outcome, exact command delegation, unchanged original real assertions and protected evidence destinations.

Four added actual-entry-point regressions prove:

1. The caller receives the identical rejected Error with its original cause, child exit1, exactly one failure summary and no unhandled rejection.
2. Asynchronous cleanup completes its controlled step, rejects with a secondary error, and retains the original AssertionError/actual/expected as the final failure; child exit1 and secondary artifact preserved.
3. Existing protected failure.json causes EEXIST during diagnostic writing; sentinel JSON is unchanged, original message remains in the terminal report, exit1/no false PASS.
4. A controlled failure while closing trace state is captured with its code, exit1 and explicit terminal handling rather than an unhandled rejection.

The real Docker scenario and optional-health fixture now use the same explicit owner. Their complete successful real executions and ownership cleanup pass against f54a6ea. Failure controls are isolated child fixtures and do not disrupt a foreign service. Canonical lint remains0 errors/0 new findings, with28 historical warnings and the unchanged65-entry baseline. Hosted S9383 resolution still requires exact-head analysis rather than inference from line moves.

[Machine receipts and full logs](evidence/IL-5.14-C1-S2/execution.jsonl), [original hosted issue records](evidence/IL-5.14-C1-S2/issues-baseline.json).
