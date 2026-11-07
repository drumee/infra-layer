# Deterministic safety controls — Gate E PASS (limited scope)

Command: `node --test test/diagnostics/fixture-volumes/safety.test.cjs`, through the frozen V1 evidence recorder. **24 tests PASS, 0 FAIL, 0 skipped, exit 0**. [Original TAP](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1/safety-matrix.log), [exact command/time/source/hash receipt](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1/execution.jsonl). No Docker command is executed by these tests.

| Controls | Actual assertion |
|---|---|
| E1–E4 | Exact manifest/receipt/labels authorize; completed consumers permit removal; retention preserves; prior verified absence is idempotent; absence alone and contradictory reference refuse |
| E5–E10 | Prefix collision, foreign/missing labels, forged creation, missing timestamps/changed identity, historical adoption and wrong attempt reject with their expected codes |
| E11–E14 | Running foreign, stopped foreign and remaining owned references reject; exact inspection exception propagates and no remove call occurs |
| E15–E18 | Original removal exception propagates; missing required removal is INCOMPLETE; primary/cleanup errors remain separate; duplicate calls cannot expand scope or remove twice |
| E19–E24 | Wrong daemon/context/endpoint, wrong type, a newly observed reference, ambiguous entries and broad selectors reject; successful cleanup cannot mask earlier main failure |

Negative checks use exact expected rejection codes or original exception identity, not fixture syntax failure. These controls cover the tested model paths, not every campaign setup failure. In particular they do not qualify the LOW severity partial-creation ledger gap identified by review. Existing 54 assertion guards and prior unit/contracts are unchanged historical evidence, not new executions in V1. The subsequent **canonical `npm run lint` exits 1**, with 1 new error and the same 28 historical warnings. [Lint output](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1/eslint.log), [STOP](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1/STOP.json). The matrix PASS does not authorize live execution through that failure.
