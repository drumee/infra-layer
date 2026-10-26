# First focused regression execution

**FAIL — mandatory stop, no retry.**

Command: `node --test test/unit/network-membership.test.js test/unit/network-attachments.test.js test/unit/network-loader.test.js`. Exit1;35 tests,34 PASS,1 FAIL,0 skipped/cancelled. All16 new F1 cases passed, existing network cases12/13 passed, loader cases6/6 passed. Whole focused gate D FAIL. Syntax checks for `lifecycle/docker.js` and new unit file exited0 before execution.

Failing subtest: `network object identity, isolation and actual membership cannot be substituted`, source `test/unit/network-attachments.test.js:69`, assertion at77. Actual code `INVALID_NETWORK_ATTACHMENT`, expected `NETWORK_ATTACHMENT_MISMATCH`; stack originates `serviceNetworks` at `lifecycle/docker.js:87`. Mutation selects service role `other` not declared by the composition. This is a deterministic error-semantics incompatibility, not an intermittent Docker incident.

Full original TAP, stack, expected/actual and receipt are preserved in [log](evidence/IL-5.14-R1-F1/focused-network.log) and [execution ledger](evidence/IL-5.14-R1-F1/execution.jsonl). Source revision is baseline plus identified working-tree edits, not qualified baseline source. No later code change or second execution occurred. The Node runner completed its already scheduled suite; no subsequent qualification command was started after observing its failure.

Corrected real Docker security acceptance, full unit/contracts/integration/application checks, lint, audits, package consumers and hosted checks: NOT_EXECUTED for F1. Historical passes do not qualify this modified runtime.
