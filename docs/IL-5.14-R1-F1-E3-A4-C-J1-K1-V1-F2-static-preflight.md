# V1-F2 static preflight — Gate E FAIL

Candidate `5699ab0ca9bed36aa00fa9b3692c4e64b7119ee6`; resume `987a3bba377fa7f6153b8ce10f4fca231fff0790`; attempt `V1-F2-830ab96f-f97f-4403-94ac-de1f9c12673e`. Harness SHA256 values: [baseline](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2/baseline.json). No Docker daemon/context was inspected in V1-F2. Planned endpoint is unix:///var/run/docker.sock/default, not a current verified daemon identity. No live Docker commands, fixtures, cleanup or campaign occurred.

Six CommonJS syntax commands exited0: campaign.cjs, docker.cjs, mounts.cjs, mounts.test.cjs, ownership.cjs, safety.test.cjs, each via node --check. Exact argv/timestamps/exits/log hashes and unchanged frozen source/protected Docker configuration accompany all seven executions in [ledger](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2/execution.jsonl).

The first mandatory test command `node --test test/diagnostics/fixture-volumes/mounts.test.cjs` exited **1** at 2026-11-02T15:56:08Z. TAP reports **1 file-level test, 0 PASS, 1 FAIL**, no skips/cancellations; ERR_TEST_FAILURE, testCodeFailure, child exit1, no signal. No individual D-case outcomes or actionable causal exception were emitted. Cause is **UNDETERMINED_FROM_PRESERVED_OUTPUT**. This proves a failed qualification command, not a specific unequal-mount acceptance, source defect or environment diagnosis. No source change or rerun followed. [Output](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2/comparator-regressions.log), [STOP](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2/STOP.json), [ledger](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2/execution.jsonl).

| Required control | Current V1-F2 result |
|---|---|
| Syntax | Six commands PASS, exit0 |
| Comparator | FAIL, exit1; no individual-case PASS evidence |
| Ownership matrix | NOT_EXECUTED; historical24/24 only |
| Refusal tests | NOT_EXECUTED; historical6/6 only |
| Assertion preservation/reachability | NOT_EXECUTED; historical48/48 only |
| New comparator invocation/mutation guards | Defined inside failed command; not qualified |
| Focused ESLint | NOT_EXECUTED |
| Canonical ESLint | NOT_EXECUTED; historical0 errors/28 warnings/0 new findings only |
| Diff/source boundaries | Four test-only paths; original177 unchanged |

No lint policy, ignore, dependency, production assertion or historical expected outcome changed. No eslint-disable appears in the patch. This static source inspection does not constitute a lint PASS. Full frozen hash comparison after failure confirms no implementation change. Initial local git-add sandbox denial was retried under the existing approved Git permission and local candidate commit succeeded; it was a Git operation, not a test retry. No approval rejection is inferred from the Node exit.
