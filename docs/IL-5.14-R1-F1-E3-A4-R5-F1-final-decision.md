# R5-F1 final local decision

**FAILED_QUALIFICATION** — first mandatory focused run43/44; historical identity refusal classified incorrectly. No retry, post-failure correction, Docker campaign, Postfix work or push.

Starting checkpoint c23c86110634d691d6c52d80bc792edda21dd197, initially clean. Tested candidate bytes are identified by source-identity.json; a later local checkpoint preserves precisely this unqualified implementation/tests and evidence. PR20 remains OPEN/main, remote head cd9b8322bd7eef3b4094710ec4ea26be94f08922.

| Gate | Status | Evidence/disposition |
|---|---|---|
| A | PASS | Parent failure and hash manifest verified; saved stack proves pre-recreation strict refusal, historical selector snapshot explicitly missing. |
| B | PASS | Complete call graph; controlled old strict-selector and live-port barriers reproduced with expected refusals. |
| C | PASS | Narrow private rollback admission design, single journal failed-service scope, strict final validation. |
| D | BLOCKED | Candidate implementation introduces identity error-precedence regression; not qualified. |
| E | FAIL |44 focused tests,43 pass/1 fail/0 skips, exit1. |
| F | BLOCKED | Deterministic corrected path reaches modeled recreation/final strict check, but mandatory prerequisite suite fails. |
| G | NOT_EXECUTED | No new real Docker R5 acceptance. |
| H | NOT_EXECUTED | No full affected unit/contracts/Docker/guard qualification. |
| I | BLOCKED | No final boundary verification; demonstrated classification defect unresolved. |
| J | NOT_EXECUTED | Independent preliminary baseline analysis only; no corrected-source sign-off. |
| K | PASS | Local failure handoff and original evidence preserved. |

The exact failing historical test is rollback-authorization.test.js:46, assertion:58. Revision substitution is supposed to return RUNTIME_IDENTITY_MISMATCH; new early failed-service/revision presence validation instead returns ROLLBACK_OPERATION_NOT_AUTHORIZED from internal/rollback-authorization.js:8. The assertion remains strict. No claim is made that43 passing tests qualify recovery. All26 new controlled boundary cases pass, but actual daemon recreation remains NOT_EXECUTED.

Evidence: [command receipt](evidence/IL-5.14-R1-F1-E3-A4-R5-F1/execution.jsonl), [raw result](evidence/IL-5.14-R1-F1-E3-A4-R5-F1/boundary-focused.log), [source bytes](evidence/IL-5.14-R1-F1-E3-A4-R5-F1/source-identity.json). Node22.22.0, UID/GID1000. No Docker resource was created. Private fixture directories and mocks were restored; protected Docker configuration unchanged in command receipt. No package identity, hosted result or independent closure exists for this candidate.

Parent A4 disposition: RECOVERY_NOT_QUALIFIED_POSTFIX_NOT_EXECUTED. Do not push or resume Postfix as if R5 had passed. Original R1 finding remains open. No merge/publication/tag/deployment/downstream action. SMTP_RECOVERY_UNQUALIFIED and H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED remain; historical Debian H3 failure is unchanged. No SMTP Internet delivery/spool recovery or Debian acceptance claim.
