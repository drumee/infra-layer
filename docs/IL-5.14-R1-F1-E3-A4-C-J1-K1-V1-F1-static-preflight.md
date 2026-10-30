# Static preflight — Gate C PASS

Candidate **a5c6191**, exact frozen harness hashes in baseline.json. [Command ledger](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/execution.jsonl) records actual argv/cwd/source/times/exits, protected Docker configuration, frozen inputs and log hashes. All seven corrected static commands exit **0**, with no retries or subsequent source changes.

| Order | Command | Actual result |
|---|---|---|
| 1 | `node --check test/diagnostics/fixture-volumes/docker.cjs` and `node --check test/diagnostics/fixture-volumes/campaign.cjs` | Both exit 0 |
| 2 | `node node_modules/eslint/bin/eslint.js test/diagnostics/fixture-volumes/docker.cjs test/diagnostics/fixture-volumes/campaign.cjs` | 0 errors/warnings, exit 0 |
| 3 | `npm run lint` | 0 errors, 28 historical warnings, 0 new findings, exit 0 |
| 4 | `node --test test/diagnostics/fixture-volumes/safety.test.cjs` | 24/24 PASS, 0 fail/skip |
| 5 | `node --test test/unit/harness-preservation.test.js test/unit/harness-reachability.test.js` | 48/48 PASS |
| 6 | `node --test test/unit/refusal-effectiveness.test.js` | 6/6 PASS |

The two independent syntax checks may run together; dependent checks follow the required order. The 48 + 6 controls constitute the historical 54-test guard scope; they are reported as two executions, not a fabricated 54-test single command. The 24 model tests also cover fixture inspection/removal error identity, wrong/missing/ambiguous creation manifests, foreign and stopped references, retention, race-on-fresh-read, broad selectors, partial cleanup and first-failure precedence. They were not duplicated as another error-propagation run.

All 24 E1–E24 test bodies/assertions and ownership model are unchanged by exact hash; TAP demonstrates each case actually ran. Protected historical source guards reject inactive/unreachable/uncalled assertions, altered Docker/spawn expressions and unauthorized historical replacement. No skip, suppression, expectation change or new assertion authorization exists. No full unit/contracts/runtime/Docker result is inferred from these scoped counts.
