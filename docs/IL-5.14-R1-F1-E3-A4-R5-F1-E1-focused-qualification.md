# Focused and affected regression qualification

Gates D/E/F PASS. Execution receipts record exact argv, source, UTC timestamps, UID/GID1000, exits, log hashes and unchanged protected Docker configuration. Node22.22.0. Commands ran once in the required progression:

| Command | Result | Exit |
|---|---|---|
| node --test --test-name-pattern=R4\ rollback\ authorization\ requires test/unit/rollback-authorization.test.js |1 selected historical test PASS; expectation unchanged |0 |
| node --test test/unit/recovery-error-contract.test.js test/unit/rollback-authorization.test.js |29/29 PASS |0 |
| node --test test/unit/rollback-authorization.test.js test/unit/rollback-boundary.test.js test/unit/recovery-error-contract.test.js |55/55 PASS |0 |
| npm test |354/354 PASS |0 |
| npm run test:contracts |24/24 PASS |0 |

No failed/cancelled/skipped cases in complete suites. Selective first run verifies exactly the old failure; it is not claimed as a complete file run. Full unit includes the preservation/reachability/mutation, behavioral refusal, network membership/error taxonomy and lifecycle-safety regressions. The single A1 replacement and A2 source-integrity guard are unchanged.

Coverage mapping: D1/D2/D16/D24 new error-contract cases verify caller/journal precedence and zero state/runtime observation for unauthorized public requests, including corrupt active state and mismatched target. D3/D23 unchanged historical assertions plus new revision case; D4/D5/D6 deterministic recovery ordering and strict readiness negative; D7–D15 inherited boundary negatives for owner/project/service/ID/duplicates/labels/network ID/endpoint/candidate; D17/D22 normal recover:true cannot acquire private rollback marker; D18 actual adapter catches injected exec inspection status125; D19 recreation failure propagates; D20 final missing/extra membership fails; D21 ordinary healthy activation/no-op remains strict. These tests exercise real orchestration and canonical validator with explicitly scoped preparation/probe/command fixtures, not mocks that simply manufacture the desired admission error.

The unit/focused commands ran at1e859f6 plus exactly the implementation/test bytes subsequently committed at72f4c67. Only the separate real-Docker runner was extended after unit qualification; no unit dependency changed. Byte correspondence is recorded in source-identity.json. No unrelated Postfix/services/package/hosted campaign.

[Command ledger](evidence/IL-5.14-R1-F1-E3-A4-R5-F1-E1/execution.jsonl), [55-test raw output](evidence/IL-5.14-R1-F1-E3-A4-R5-F1-E1/complete-focused.log).
