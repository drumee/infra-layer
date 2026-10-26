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
