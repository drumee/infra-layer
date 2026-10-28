# P2 performed regression checks and stop

Frozen diagnostic source `7b5edbd9e9731a51d558a9e11c7def2cfa6c6acb`. Exact commands, hashes, times, UID/GID1000, protected configuration snapshots and original exits: [ledger](evidence/IL-5.14-R1-F1-E3-A4-P2/execution.jsonl).

| Executed scope | Actual outcome |
|---|---|
| Unchanged P1 controls plus P2 HTTP/case lifecycle preflight |18/18 PASS, exit0; includes expected fatal child/transport controls; no skips |
| Assertion preservation, reachability mutations and refusal-effectiveness |54/54 PASS, exit0; no skips; all historical expectations unchanged |
| One complete canonical Services child |17/17 PASS, exit0, original assertions; native observation retained only |
| Instrumented campaign as a whole |FAIL, exit1; DIAGNOSTIC_CAMPAIGN_INVALID because both new observers reject requested-stop CLI143 |

Gate L NOT_EXECUTED beyond preflight preservation checks: full unit suite, contracts, broader affected lifecycle/network/transport and corrective regressions stop after the mandatory diagnostic campaign failure. R5's354/24 remain historical; no new totals are borrowed. No diagnostic shutdown correction or regression was run after failure. No second Services run occurred.

The18 controls did not test Docker collector controlled-exit143 semantics; this missing coverage is explicit and requires a narrow follow-up. Original expected outcomes are not changed, and neither campaign1 nor observer1 is reclassified as PASS. [Detailed invalid campaign](IL-5.14-R1-F1-E3-A4-P2-canonical-services-campaign.md).
