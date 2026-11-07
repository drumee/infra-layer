# V1-F2 final decision

**V1_FAILED_QUALIFICATION — Gates D/E, mandatory comparator test command exit1.** Independent review: **BLOCKED_EVIDENCE**. Comparator finding **V1-F1-REC-001 remains OPEN**, cleanup mechanism **NOT_QUALIFIED**. The expected partial-success status is not supported.

Candidate `5699ab0ca9bed36aa00fa9b3692c4e64b7119ee6`; resume `987a3bba377fa7f6153b8ce10f4fca231fff0790`; attempt `V1-F2-830ab96f-f97f-4403-94ac-de1f9c12673e`. Harness SHA256 values: [baseline](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2/baseline.json). No Docker daemon/context was inspected in V1-F2. Planned endpoint is unix:///var/run/docker.sock/default, not a current verified daemon identity. No live Docker commands, fixtures, cleanup or campaign occurred.

Resume checkpoint was verified clean on the existing branch. Local candidate commit contains only four test-harness paths; no existing source or evidence was discarded. Final report-only checkpoint is the commit introducing this decision and is given in the owner handoff. No implementation correction, test rerun or Docker command follows the mandatory failure.

The first mandatory test command `node --test test/diagnostics/fixture-volumes/mounts.test.cjs` exited **1** at 2026-11-02T15:56:08Z. TAP reports **1 file-level test, 0 PASS, 1 FAIL**, no skips/cancellations; ERR_TEST_FAILURE, testCodeFailure, child exit1, no signal. No individual D-case outcomes or actionable causal exception were emitted. Cause is **UNDETERMINED_FROM_PRESERVED_OUTPUT**. This proves a failed qualification command, not a specific unequal-mount acceptance, source defect or environment diagnosis. No source change or rerun followed. [Output](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2/comparator-regressions.log), [STOP](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2/STOP.json), [ledger](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2/execution.jsonl).

## Separate conclusions

| Dimension | Evidence-supported outcome |
|---|---|
| Original comparator finding | Historical ten ordering-only differences verified; FINDING_CLOSED withheld |
| Comparator regressions | FAIL at file level; no D1–D24 PASS claims |
| Syntax | Six commands exit0 |
| ESLint | NOT_EXECUTED; old0/28/0 not borrowed |
| Ownership matrix | NOT_EXECUTED; old24/24 only historical |
| Assertion guards | NOT_EXECUTED; old48/48 only historical; new guard defined but unqualified |
| Refusal tests | NOT_EXECUTED; old6/6 only historical |
| Real Docker / current reconciliation | NOT_EXECUTED / NOT_QUALIFIED; no current fixtures or mutations |
| Historical volume ownership | H01–H04 unresolved, no new readback or deletion |
| Independent review | BLOCKED_EVIDENCE; no tests/Docker by reviewer |
| Production executable | PRESERVED; original177 inputs verified equal to20c8a29 |
| Package evidence | Prior qualification source-applicable; recorded hash retained; archive unavailable, not rehashed |
| Application | FAILED NETWORK_ATTACHMENT_MISMATCH, historical cause unknown |
| Original R1 | FINAL_CLOSURE_PENDING |
| PR push | NOT_AUTHORIZED; none performed |

The new design compares complete current mount tuples as count maps without mutation and with strict source/access fields, while legacy replay cannot downgrade current evidence. All original ownership/consumer/exact non-force cleanup/failure-preservation commands remain. Those static observations support the bounded patch review only, not comparator security qualification. The 177 original hashes, six current harness hashes and K1/A1/V1/V1-F1 evidence manifests were verified intact after failure. Package archive SHA256 `004f018288018f678ed044c56ee4b9de520ab9ec9bc0e7deb3b6d59c172f99e1` is historical only; no physical archive was available for a new check. Prior scoped runtime/package/network/Services/observer results do not waive current test or application failures.

The copied initial baseline contained inherited F1 metadata. After independent review, verified F2 checkpoint/timestamp/initial harness metadata was clarified without changing executed inputs. Exact original executed baseline remains baseline-at-static-start.json; baseline-metadata-correction.json records both hashes and correction scope. No test log, source or failed outcome was rewritten.

| Gate | Status | Reason |
|---|---|---|
| A | PASS | Raw original ordering-only finding reconstructed; checkpoint verified |
| B | BLOCKED | Design documented; required dynamic strictness qualification missing |
| C | PASS | Narrow test-only patch/ownership commands preserved; not functional qualification |
| D | FAIL | Mandatory comparator command exit1; no per-case outcomes |
| E | FAIL | Static preflight stopped at first test failure |
| F | BLOCKED | Independent BLOCKED_EVIDENCE; original finding remains OPEN |
| G | NOT_EXECUTED | No Docker preflight after failed prerequisites |
| H | NOT_EXECUTED | No campaign or resource creation |
| I | NOT_EXECUTED | No live cleanup/inventory; no vacuous PASS |
| J | PASS | Four accurate unresolved records; not cleanup completion |
| K | PASS | Original177/package-relevant source unchanged; archive not rehashed |
| L | BLOCKED | Independent BLOCKED_EVIDENCE; mechanism not qualified |
| M | PASS | Accurate stopped-stage application handoff only |
| N | PASS | Coherent preserved failure conclusion, not successful qualification |

[Structured matrix](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2/final-gates.json) contains exact source/harness, attempt, commands/exits/totals, absent daemon/manifest/cleanup evidence, unresolved ledger, independent decision and limitations. [Independent review](IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2-independent-review.md), [source impact](IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2-source-impact.md), [A2 handoff](IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2-A2-handoff.md). A2 is prepared but not executed. A separate first-error diagnostic scope is needed before further implementation or requalification; no root cause or corrective action is invented from generic ERR_TEST_FAILURE.

Preserve F1_FAILED_QUALIFICATION_APPLICATION_ACCEPTANCE; APPLICATION_ACCEPTANCE_FAILED_NETWORK_ATTACHMENT_MISMATCH; APPLICATION_HISTORICAL_ROOT_CAUSE_UNDETERMINED; R1_FINAL_CLOSURE_PENDING; FIXTURE_VOLUME_CLEANUP_UNQUALIFIED; POSTFIX_HISTORICAL_ROOT_CAUSE_UNDETERMINED; POSTFIX_HISTORICAL_UNCERTAINTY_ACCEPTED_BY_OWNER; SMTP_RECOVERY_UNQUALIFIED; H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED. Historical Debian H3 stability failure remains unchanged. Owner Option B covers only the historical Postfix HTTP capture uncertainty. No new residual risk is accepted.

PR20 read-only verification: open/main, remote head cd9b8322bd7eef3b4094710ec4ea26be94f08922. HOSTED_CI_NOT_EXECUTED_NO_PUSH_AUTHORIZATION. No PR edit/push/merge, package/image publication, tag, deployment, production access or Debian/Server Runtime/Oxy-form modification occurs. No application, historical volume or additional risk acceptance is inferred.
