# Unit and contract qualification — Gate D PASS

Frozen executable `fd708aaf914accc93aa42fcd705740db390721d5`; actual checkout `8452b9be9cab7851ea058abd8b9bf90a4dd77f4e`, all later paths documentation/evidence only. Node22.22.0/Undici6.23.0/npm11.18.0, UID/GID1000, Linux amd64; Docker29.2.0 is available but no Docker acceptance ran in this gate. Exact commands, UTC intervals, exits, SHA256 logs and protected configuration snapshots are in [execution ledger](evidence/IL-5.14-R1-F1-E3-A4-C/execution.jsonl).

| Command | Actual result | Exit | Evidence |
|---|---|---|---|
| `python3 docs/evidence/IL-5.14-R1-F1-E3-A4-C/run.py full-unit npm test` |354/354 PASS,0 failed/skipped/cancelled |0 | [full unit](evidence/IL-5.14-R1-F1-E3-A4-C/full-unit.log) |
| `python3 docs/evidence/IL-5.14-R1-F1-E3-A4-C/run.py contracts npm run test:contracts` |24/24 PASS,0 failed/skipped/cancelled |0 | [contracts](evidence/IL-5.14-R1-F1-E3-A4-C/contracts.log) |

The full unit suite executes the existing assertion-preservation/reachability/refusal-effectiveness controls, historical authorization, secure loader, diagnostic/error propagation, taxonomy/runtime identity, network membership and recovery authorization tests. Their subset results are included in354; no separate fresh54-test command is claimed or added to the total. No assertion, baseline, expectation or source was changed. The sole existing owner-authorized historical replacement remains the only one. Full unit success does not execute the separately located observer30-case matrix or replace real Docker/security/integration acceptance.

Every receipt confirms unchanged frozen inputs and protected Docker configuration. Independent final local security review was not reached because the next executed gate, lint, failed. No current unit/contract failure was waived under the Postfix decision.
