# F1 affected qualification

Gate I PASS at executable `fd708aaf914accc93aa42fcd705740db390721d5`. Host Node22.22.0/Undici6.23.0, UID/GID1000. Exact commands/source hashes/UTC/exit/log receipts: [ledger](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/execution.jsonl).

| Scope | Actual new result |
|---|---|
| Original actual-module143 regression |1/1 PASS; defective child1 expected and preserved |
| Observer lifecycle/mutation |30/30 PASS |
| Ordering/stream/result/ready/redaction |8/8 PASS |
| Actual Docker observer positive/negative |2/2 PASS |
| Complete canonical HTTP/case diagnostic preflight |18/18 PASS |
| Assertion preservation/reachability/refusal |54/54 PASS |
| One corrected canonical Services campaign |17/17 PASS; whole campaign0; no rerun |
| Full npm test |354/354 PASS, exit0, no skips/cancellations |
| npm run test:contracts |24/24 PASS, exit0, no skips/cancellations |

Full unit command: `python3 test/diagnostics/observer-shutdown/record.py full-unit npm test`,2026-10-28T15:00:00.691846Z–15:00:04.357467Z. Contract command: `python3 test/diagnostics/observer-shutdown/record.py contracts npm run test:contracts`,15:00:14.375848Z–15:00:14.681966Z. [Unit output](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/full-unit.log), [contract output](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/contracts.log). Counts are actual new runs, even though they equal R5's historical totals. Diagnostic tests outside test/unit are reported separately rather than added to the354 or double-counted with guard subsets. Independent reviewer counts are separate.

The full unit suite covers relevant existing recovery/network ownership, lifecycle, diagnostics, guard and assertion mutation regressions. No historical expected outcome/replacement authorization, A2 guard or source reachability rule changes. No hidden mandatory failure, skipped Postfix case, new retry or suppression. Current local qualification does not replace final-head R1 independent review or the remaining parent F1 campaign.
