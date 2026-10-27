# A1 final decision

**CHANGES_REQUESTED** — independently demonstrated MAJOR A1-IR-001 prevents qualification or push.

Implementation/qualification source: `8bf02d5407ee9dbb06c4c7f86d04d3fc533ac4d7`, descended from all prior checkpoints including9cead06. PR20 remains open on remote `cd9b8322bd7eef3b4094710ec4ea26be94f08922`, main. Subsequent changes in this mission are only reports/evidence; no post-finding source fix or test retry occurred. No merge, publication, tag, deployment or downstream action occurred.

The owner-authorized historical success-to-NETWORK_ATTACHMENT_MISMATCH replacement was implemented as one exact subtree transformation over hash-pinned historical703b637 source. The detachment addition is separately inventoried. Designed tests22, original preservation case1, diagnostics17, full unit267 and contracts24 pass. However, independent review shows those tests are insufficient: actual guard accepts `false &&` wrapped historical PING check, the one authorized replacement and the approved detachment addition. All3 calls would be disabled at execution despite unchanged exact text/count/order/phase. No mutation was executed; only AST parsing and guard invocation occurred.

Root cause is missing LogicalExpression/evaluation-parent context in extraction/identity. This defeats the required preservation guarantee. The canonical harness itself was not found to contain such suppression; the material defect is a false-negative regression guard. Required correction scope is to preserve execution context and add nonexecuting suppression negatives without broadening historical replacement permissions. Mandatory stop applies; no corrective implementation was attempted afterward.

| Gate | Status | Evidence/disposition |
|---|---|---|
| A | PASS | Exact authorized existing-container missing-membership replacement verified. |
| B | PASS | One replacement subtree plus one explicit detachment addition inventoried; no other historical change authorized. |
| C | FAIL | Independent A1-IR-001: evaluation context incomplete; false&& can disable protected assertions. |
| D | FAIL | Designed22 cases pass, but independent3 suppression cases are falsely accepted; guard guarantee not established. |
| E | PASS | Original case1, diagnostics17, full unit267,contracts24 pass with zero mandatory skips. |
| F | PASS | DOCKER_E2_EVIDENCE_PRESERVED: unchanged runtime/harness bytes, historical21/42/15 acceptance; no redundant rerun. |
| G | BLOCKED | Audits/lint/tools/fs checks pass; integration cancelled by independent stop, remaining application/lifecycle-gateway not executed. |
| H | FAIL | 42-member package/strict consumer checks pass, but security qualification blocked by MAJOR preservation defect. |
| I | NOT_EXECUTED | No push/PR update/new hosted checks. |
| J | FAIL | Separately scoped reviewer returns CHANGES_REQUESTED at local source8bf02d5; R1 remains open. |
| K | PASS | Precise source-specific decision, independent proof and cancellation/cleanup evidence preserved. |

Tool versions: Node22.22.0, npm11.18.0, isolated TypeScript5.9.3; execution UID/GID1000. Exact commands, timestamps, return codes, source commits, log hashes and protected Docker snapshots: [ledger](evidence/IL-5.14-R1-F1-E3-A1/execution.jsonl). All completed protected snapshots agree. First focused tests were run on9cead06 plus edits subsequently committed unchanged at8bf02d5; later full checks use that exact source.

Independent reviewer report: [A1-IR-001](evidence/IL-5.14-R1-F1-E3-A1/independent-review/independent-review.md); [three exact counterexamples](evidence/IL-5.14-R1-F1-E3-A1/independent-review/guard-short-circuit-probe.json); [source hashes](evidence/IL-5.14-R1-F1-E3-A1/independent-review/source-and-probe-identity.json). A separately scoped agent performed this read-only review independently of implementation. It did not close R1 or verify a new hosted head/package after the stop. Original R1 MAJOR remains OPEN and a new local preservation MAJOR remains unresolved.

Audits (development/production/application) have0 findings; ESLint0 errors/0 new findings/28 historical warnings; filesystem25 and trusted tools12 pass. Installed security consumer4 scenarios and strict NodeNext packed consumer8 preparation+37 refusal assertions pass. Isolated tooling installation does not alter dependency locks.

Package candidate42 members,104123 bytes, SHA256 `e17068d0abbf98ecd143075fe916264df2c066110744af5831a9aa2c20065d6a`, SRI `sha512-4QahcHIO6t04bnC4W1LNclBffwSSakVq+d+bMDfN/78dPAxRYp6kCH5aTXkupakSDptD18S5R1pyxhap3ztQ4A==`. Every member equals E2 source2ec85bc; no test-only helper is distributed. It remains an unpublished local candidate, not a replacement alpha.3. Package-specific positives do not override security failure.

The already-running integration aggregate completed gateway17/services17; after the finding, its parent was suspended to block next-suite launch. The active lifecycle test was cancelled, its owning runner performed finally cleanup, and aggregate exit143 was preserved as controlled cancellation. No lifecycle aggregate/application PASS is claimed. All four started fixture namespaces and consumer image are verified removed in [cleanup readback](evidence/IL-5.14-R1-F1-E3-A1/final-cleanup-readback.json). No foreign resources were changed.

Existing E2 real Docker21 membership/42 Redis/15 Health results remain DOCKER_E2_EVIDENCE_PRESERVED because runtime/readiness/actual harness/diagnostics bytes are unchanged, not because new runs occurred. Earlier F1/E1/E2/E3 failures remain historical. Remaining full integrations, real application and hosted checks are unexecuted; no new PR head was pushed.

Residual limitations: SMTP_RECOVERY_UNQUALIFIED; H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED; failed Debian H3 history; downstream Debian acceptance not qualified.
