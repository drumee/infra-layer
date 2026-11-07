# Full F1 convergence decision

**FAILED_QUALIFICATION — Gate J, C-LINT-001.** Qualification stopped at the first mandatory failure. No source fix, lint rerun, later qualification campaign, push or PR modification followed. The target LOCAL_F1_QUALIFIED_AWAITING_PR_PUSH_AUTHORIZATION was not reached. This is neither merge readiness nor release qualification.

Frozen executable: **fd708aaf914accc93aa42fcd705740db390721d5**. Tested documentation checkpoint: **8452b9be9cab7851ea058abd8b9bf90a4dd77f4e**. New local checkpoint is the documentation/evidence-only commit introducing this decision; its exact hash is recorded in the final owner handoff and `/tmp/drumee-il514-a4-c-axxwu3_x/checkpoint-readback.json`. No executable or test-harness change occurred. [Final source freeze](evidence/IL-5.14-R1-F1-E3-A4-C/final-freeze.json) records all current frozen inputs and exact remote/local input blob differences. Qualified R5 remains72f4c67254561ca5c4c47a6a65e9620e57da7841.

Fresh unit354/354 and contracts24/24 pass, exits0, no skips/cancellations. Canonical ESLint10.13.0 exits1:0 errors,29 visible warnings,1 new finding. The unchanged zero-new-findings policy rejects unused destructured `drain` at test/diagnostics/observer-shutdown/matrix.test.cjs:3:26, introduced in fd708aa. Severity MINOR/test-only maintainability; nevertheless a mandatory qualification failure. No runtime/security failure is inferred from that warning. [Original failure output](evidence/IL-5.14-R1-F1-E3-A4-C/lint.log), [finding](evidence/IL-5.14-R1-F1-E3-A4-C/finding.json), [stop receipt](evidence/IL-5.14-R1-F1-E3-A4-C/STOP.json).

All executed commands used Node22.22.0/Undici6.23.0/npm11.18.0, Linux amd64, UID/GID1000, Docker29.2.0 available. Exact argv/cwd/UTC/exit/log hashes/protected configuration before-and-after are in [execution.jsonl](evidence/IL-5.14-R1-F1-E3-A4-C/execution.jsonl). Attempt A4-C-drumee-il514-a4-c-axxwu3_x. No new Docker campaign, container or network was created; no mission-owned Docker teardown was required and no foreign resource was manipulated. Protected Docker configuration and installed lock remain unchanged. Historical288 manifest entries and all command log hashes reverify. Temporary evidence is deliberately retained in the secure private directory.

| Gate | Status | Actual command/evidence and result | Limitation |
|---|---|---|---|
| A | PASS | Git source/branch/PR identity, all frozen non-doc hashes; baseline.json | Sourcefd708aa, checkpoint8452b9b; only new reports follow |
| B | PASS | Owner decision IL-5.14-A4-POSTFIX-RISK-B, selected B; owner-risk-acceptance.md | Local qualification only; no current failure waived |
| C | PASS | Qualification inventory and source applicability in qualification-matrix.md | Prospective obligations are not success results |
| D | PASS | `npm test`354/354 exit0; `npm run test:contracts`24/24 exit0; recorded wrappers/logs | Guard/context/authorization/identity/error/Promise coverage included in354; no separate new54 run |
| E | NOT_EXECUTED | R5 relevant runtime/harness byte-equivalent; historical38 Docker/55 focused preserved | Fresh network acceptance planned but stopped; original R1 final local closure outstanding |
| F | NOT_EXECUTED | Planned `npm run test:gateway` | Earlier A2 gateway17 remains historical; no new C Gateway acceptance |
| G | PASS | Retained exact fd708aa Services17/17/campaign0, observer30/30, diagnostic18/18; independently valid/clean | No new Services execution; historical Postfix cause unknown |
| H | NOT_EXECUTED | Planned lifecycle, lifecycle-gateway and full application | Previous A2 application failure not erased; R5 alone insufficient |
| I | NOT_EXECUTED | Planned trusted-tool, filesystem, installed security and complete safety review | Unit controls passed but do not replace full security gate |
| J | FAIL | `npm run lint` exit1,0 errors/29 warnings/1 new finding, C-LINT-001 | Audits NOT_EXECUTED; no dependency changes or waiver |
| K | NOT_EXECUTED | New package/consumer/type qualification not started | No C archive, member count, size or SHA256 exists |
| L | NOT_EXECUTED | Final independent local security review not eligible after mandatory stop | Original R1 MAJOR remains open locally; no self-certification |
| M | NOT_EXECUTED | Partial read-only hosted inventory and PR final snapshot only | HOSTED_CI_NOT_EXECUTED_NO_PUSH_AUTHORIZATION; no new hosted PASS |
| N | PASS | Failure consolidation, evidence receipts and final source freeze | Reporting completeness only; overall qualification failed |

For unexecuted gates command exits, counts, observer states, collection/shutdown intent and fresh Docker attempts are **not applicable / NOT_EXECUTED**, rather than zero-success placeholders. Retained G has its own exact source, tool versions, command timestamps, process signals, collection/streams/intent, transport observations and cleanup in the linked original P2-F1 ledger/report. Retained R5 has its original analogous38-assertion Docker receipt and independent closure. Neither is claimed rerun. For new D/J observations there is no observer, HTTP transport attempt or Docker collection window. There is no independent C disposition or new package identity.

| Qualification category | Current disposition |
|---|---|
| Unit and contracts | Fresh354/24 PASS |
| Assertion preservation and execution context | Full unit PASS; unchanged guard/sole authorized replacement, no separate new subset run |
| Network isolation | Unit coverage PASS; planned fresh actual Docker security not reached; original R1 closure pending |
| R5 recovery | R5_QUALIFIED_EXECUTABLE_PRESERVED; historical55/38 and independent FINDING_CLOSED remain applicable |
| Gateway | NOT_EXECUTED in C |
| Services | Source-equivalent qualified P2-F1 evidence retained,17/17 and complete exit0 |
| Lifecycle and application | NOT_EXECUTED in C; incomplete parent acceptance remains an obligation |
| Diagnostic observer | Exact fd708aa30-case matrix and independent FINDING_CLOSED retained, no new execution |
| Trusted executable and filesystem safety | Existing mitigation unchanged; full fresh safety gate NOT_EXECUTED |
| Dependency audits | NOT_EXECUTED; no current audit finding invented |
| ESLint | FAIL — C-LINT-001 |
| Package and consumers | NOT_EXECUTED; no package SHA256 |
| Independent local security review | NOT_EXECUTED; no local R1 closure claimed |
| Historical Postfix risk | ROOT_CAUSE_UNDETERMINED — OWNER_ACCEPTED under explicit narrow decision |
| Hosted CI | NOT_EXECUTED for unpublished candidate; previous remote results do not qualify it |
| PR push | PENDING_OWNER_AUTHORIZATION; additionally local qualification is incomplete |
| Merge/publication/tag/deployment | Not authorized |

Independent prior findings remain separated: A1 assertion-reachability closure and R5/observer closures remain historical with unchanged relevant source; original R1 requires final local independent closure and is not closed by C. The historical Postfix failure remains unexplained, never relabeled FINDING_CLOSED. Owner acceptance does not cover this new lint failure or any current/future transport/security failure.

The narrow proposed follow-up is [C-LINT-001 correction scope](IL-5.14-R1-F1-E3-A4-C-corrective-follow-up.md): remove the unused import binding only under a separately dispositioned mission, preserve the implementation/assertions/policies, establish a new coherent harness freeze and resume the remaining gates after affected checks. No corrective source change was applied here. Parent handoff: **FAILED_QUALIFICATION — C-J / C-LINT-001**, with R5 and applicable Services evidence preserved; do not resume expensive qualification on this unchanged failed candidate merely to obtain PASS.

POSTFIX_HISTORICAL_ROOT_CAUSE_UNDETERMINED. POSTFIX_HISTORICAL_UNCERTAINTY_ACCEPTED_BY_OWNER. SMTP_RECOVERY_UNQUALIFIED. H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED. Previous Debian H3 remains a historical failure. No Internet SMTP delivery, spool recovery, queue persistence, general SMTP fault tolerance, downstream Debian acceptance or unrelated lifecycle closure is claimed. No push, merge, package/image publication, release tag, deployment or Debian change occurred.
