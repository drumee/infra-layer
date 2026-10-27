# F1 final decision

**FAILED_QUALIFICATION** — stopped on the first mandatory focused-regression failure. This candidate is neither ready for merge decision nor qualified awaiting independent review.

Baseline: `cd9b8322bd7eef3b4094710ec4ea26be94f08922`, PR20/main; clean initial tree. Tested source is baseline plus working-tree correction, identified by [file hashes](evidence/IL-5.14-R1-F1/tested-source-identity.json). Documentation-only failure reports follow those tested bytes. No later executable modification occurred. Tool versions/environment are in that source identity and UID/GID/commands/timestamps/exit codes/protected configuration snapshots are in [ledger](evidence/IL-5.14-R1-F1/execution.jsonl).

| Gate | Status | Evidence/disposition |
|---|---|---|
| A | PASS | Original insecure extra-network acceptance reproduced with real owned Docker resources; cleanup verified. |
| B | PASS | Proposed complete-membership/lifecycle contract documented; real compatibility still requires qualification. |
| C | NOT_EXECUTED | Correction implemented, not qualified: error taxonomy incompatibility found by D. |
| D | FAIL | First focused execution exit1,34/35 pass; unknown service network role returns INVALID instead of MISMATCH. |
| E | NOT_EXECUTED | Stopped before corrected real Docker security acceptance. |
| F | NOT_EXECUTED | Full canonical regression stopped. |
| G | NOT_EXECUTED | Security/audit/package qualification stopped. |
| H | NOT_EXECUTED | No push; no new hosted head. |
| I | NOT_EXECUTED | Independent finding review not eligible; MAJOR remains unresolved. |
| J | PASS | Failure decision and original evidence preserved locally. |

Reproduction: nominal ACCEPTED and undeclared-network ACCEPTED against old source, verified owned cleanup. Focused correction result:35 tests,34 PASS,1 FAIL,0 skipped. Existing negative assertion expects `NETWORK_ATTACHMENT_MISMATCH` for an undeclared service role; implementation returns `INVALID_NETWORK_ATTACHMENT`. Error taxonomy must be reconciled without relaxing the security refusal. No retry, corrective post-failure source change, corrected Docker acceptance, full regression, lint, audit, package build, push or hosted rerun followed the stop.

The new unit cases are encouraging but are insufficient to establish real Docker correctness or independent finding closure. Local source/test edits are retained as an unqualified checkpoint. PR20 remains unchanged and the R1 MAJOR finding remains open. The proposed stopped/created-container contract and complete topology behavior still require real Docker acceptance. No new package SHA is claimed. Original independent reports, reproduction and failed TAP are preserved.

Next required work is a separately dispositioned continuation to preserve the established error code, followed by focused tests, complete real Docker scenarios, full regression/audit/package qualification, exact-head hosted checks and separate independent re-review. No merge/publication/tag/deployment was performed.

Residual limitations: `SMTP_RECOVERY_UNQUALIFIED`; `H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED`; historical Debian H3 remains failed; no downstream Debian qualification.


## E1 continuation — 2026-10-27

Historical F1 result above is unchanged. E1 restores error classification and passes47 focused tests but stops on a missing diagnostic-directory launch prerequisite before any Docker scenario. Current local status remains FAILED_QUALIFICATION. See [E1 decision](IL-5.14-R1-F1-E1-final-decision.md). No push or independent finding closure occurred.


## E2 continuation — 2026-10-27

Secure diagnostic preflight and new real Docker acceptance pass (21 membership,42 Redis over2 cycles,15 optional Health assertions). Mandatory full unit run fails244/245 due to pre-F1 exact-expression preservation test versus F1 stronger security refusals. Current status FAILED_QUALIFICATION; no retry, code correction, push or independent closure. Historical sections above remain unchanged. See [E2 decision](IL-5.14-R1-F1-E2-final-decision.md).


## E3 static disposition — 2026-10-27

CHANGES_REQUESTED. Exact inventory disproves the insertion-only hypothesis: one historical success assertion was replaced with a F1 membership refusal. E3 requires unchanged historical assertions and stops on replacement, so no guard or test source was modified and no qualification rerun occurred. E2 real Docker evidence remains applicable by exact byte comparison. Explicit narrow contract disposition is required; see [E3 final decision](IL-5.14-R1-F1-E3-final-decision.md). Earlier reports remain preserved.


## E3-A1 independent stop — 2026-10-27

CHANGES_REQUESTED. Owner-authorized exact replacement and designed22 guard cases/full267 unit tests pass, but independent reviewer demonstrates3 accepted false&& assertion-suppression mutations. MAJOR A1-IR-001 prevents preservation qualification. Integration was cancelled with owned cleanup after the finding; no push or independent R1 closure occurred. See [A1 final decision](IL-5.14-R1-F1-E3-A1-final-decision.md). Historical reports above remain unchanged.


## E3-A2 qualification stop — 2026-10-27

FAILED_QUALIFICATION. Guard hardening passes299 unit/24 contracts and favorable independent local review, but canonical application fails NETWORK_ATTACHMENT_MISMATCH (36 assertions,6 completed groups), and concurrent services has a fetch-failed case (16/17). No retries, post-failure source fix, push, hosted qualification or formal independent final-head closure occurred. Both owning cleanups are verified. See [A2 final decision](IL-5.14-R1-F1-E3-A2-final-decision.md). Prior historical failures remain unchanged.


## E3-A3 root-cause stop — 2026-10-27

BLOCKED_EVIDENCE. Application restart-backoff endpoint validation mechanism reproduced with actual canonical image/policy; Postfix HTTP cause remains unverified. Idle-close diagnostics do not reproduce UND_ERR_SOCKET and one focused actual-source3-case observation passes without a cause. No fix is inferred; production/canonical tests remain unchanged, no full qualification/push. See [A3 final decision](IL-5.14-R1-F1-E3-A3-final-decision.md). Original A2 failure evidence remains preserved.


## A4 preservation checkpoint

A4 FAILED_QUALIFICATION: one actual restarting-container rollback attempt failed NETWORK_ATTACHMENT_MISMATCH before recreation.317unit/24contracts/100focused passed; cleanup verified. Candidate remains unqualified locally. Workstream P and downstream gates NOT_EXECUTED, no retry or push. See [A4 final decision](IL-5.14-R1-F1-E3-A4-final-decision.md). Earlier failures and evidence remain unchanged.
