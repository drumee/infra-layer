# J1 final local decision

**FAILED_QUALIFICATION — J1 Gate I / parent A4-C Gate K, J1-PKG-001.** The single lint correction is completed and parent Gate J now passes. Complete local F1 convergence is not qualified: canonical package audit fails with Unexpected package member. Qualification stopped immediately; no package-policy correction, unchanged failed-test rerun or subsequent qualification occurred.

Source/test-harness candidate: **0dd9a17d2fe63b98ba3fd6ef56c5252b595a60ec**, `test: remove unused observer matrix import`. Production/package source remains byte-identical to **fd708aaf914accc93aa42fcd705740db390721d5**; qualified R5 remains **72f4c67254561ca5c4c47a6a65e9620e57da7841**. Parent checkpoint d44e51877151f2ab7f0397bfc3e2835767159de2 remains preserved. The only executable-input change is removal of drain from one CommonJS destructuring declaration; module initialization, helper implementations, all assertions, observer and runtime contracts remain unchanged. [Candidate diff](evidence/IL-5.14-R1-F1-E3-A4-C-J1/candidate.json), [final freeze](evidence/IL-5.14-R1-F1-E3-A4-C-J1/final-freeze.json).

The final documentation checkpoint is the commit introducing this decision; exact SHA is recorded in the final owner handoff and `/tmp/drumee-a4-c-j1-03gugcyl/checkpoint-readback.json`. That later commit changes only reports/evidence; no source is altered after qualification. No actual package archive was created: **package SHA256 NOT_CREATED**, consumers/types NOT_EXECUTED. A dry-run inventory is not an archive qualification.

Fresh results: observer matrix30/30, original regression+protocol9/9, assertion guards54/54, unit354/354, contracts24/24, filesystem25/25 PASS. Canonical lint0 errors/28 historical warnings/0 new findings, exit0. Fresh production/development/private application-fixture audits each exit0 with0 vulnerabilities. Full unit includes the guard subset; totals are not summed to inflate coverage. Before-edit lint exit1/29 warnings/1 new drain warning remains preserved as the deliberately expected baseline reproduction, never called a lint PASS. All successful controls have0 skips/cancellations/failures.

Then `npm run test:package` exits1 at test/package-audit.js:27, `AssertionError [ERR_ASSERTION]: Unexpected package member`. A single separate read-only dry-run inventory, justified because the first failure omitted its member name, identifies **internal/rollback-authorization.js** as the only rejected path among43 candidate members. The package manifest includes internal/, while the unchanged audit's exact internal allowlist omits this required R5 runtime helper. lifecycle/activation.js:169 imports it. This mismatch predates the J1 import correction and was discovered at the resumed gate. Severity MINOR/audit inventory correctness, mandatory qualification blocker; no production isolation defect is demonstrated. No helper removal or audit expansion is performed. [Package failure report](IL-5.14-R1-F1-E3-A4-C-J1-package-qualification.md), [original output](evidence/IL-5.14-R1-F1-E3-A4-C-J1/package-audit.log), [finding](evidence/IL-5.14-R1-F1-E3-A4-C-J1/finding.json).

Attempt A4-C-J1-drumee-a4-c-j1-03gugcyl, Node22.22.0/Undici6.23.0/npm11.18.0/ESLint10.13.0, Docker29.2.0, Linux amd64, UID/GID1000. [Ledger](evidence/IL-5.14-R1-F1-E3-A4-C-J1/execution.jsonl) records13 commands, actual versus expected exits, exact argv/cwd/UTC, log hashes and unchanged protected Docker/frozen source snapshots. The only unexpected command failure is package-audit. Post-stop dry-run attribution has its own receipt and is not qualification. Seven historical manifests reverify299 entries. Focused diagnostic artifacts and original failure logs are archived; private originals are intentionally retained.

| J1 gate | Status | Source/evidence, actual result and limitation |
|---|---|---|
| A | PASS |d44e518 baseline reproduced canonical lint1,0 errors/29 warnings/1 new; safe binding-only boundary established |
| B | PASS |0dd9a17 one-line import correction; no assertion/helper/policy/runtime changes |
| C | PASS |0dd9a17 observer30, protocol/regression9, guard54, all exit0 |
| D | PASS |0dd9a17 canonical full lint0,28 historical warnings/0 new |
| E | PASS |0dd9a17 complete parent Gate J: lint plus three current audits0 and exact mail graph |
| F | PASS |Exact source/harness comparisons and299 history entries; reuse decisions documented, not blanket transferred |
| G | PASS |0dd9a17 fresh unit354/contracts24, exits0 |
| H | BLOCKED |Remaining parent qualification cannot complete after mandatory package failure; no missing integration/security gate omitted |
| I | FAIL |0dd9a17 npm run test:package1; helper rejected before archive construction/consumer checks |
| J | NOT_EXECUTED |Final independent local security review ineligible after stop; no self-certification or R1 closure |
| K | NOT_EXECUTED |Partial hosted inventory only; failed local package/no archive prevents final readiness package |
| L | PASS |Failure consolidation/source freeze; reporting completeness, not overall qualification success |

| Parent A4-C gate | Current status | Candidate/evidence disposition |
|---|---|---|
| A | PASS |New0dd9a17 test freeze and fd708aa production equivalence verified |
| B | PASS |Owner Option B remains explicitly limited to historical Postfix uncertainty, decision IL-5.14-A4-POSTFIX-RISK-B |
| C | PASS |Parent inventory retained with J1 applicability and newly discovered package obligation |
| D | PASS |Fresh unit354/contracts24 plus focused assertion54 on0dd9a17 |
| E | NOT_EXECUTED |R5 preserved by exact source, prior55 focused/38 actual Docker assertions and independent closure retained; planned fresh complete network acceptance not reached |
| F | NOT_EXECUTED |Fresh Gateway acceptance still required; earlier A2 result not silently certified |
| G | PASS |P2-F1 Services17/17 and whole campaign0 retained, exact operational source/capture/observer inputs unchanged; no new run |
| H | NOT_EXECUTED |Full lifecycle/lifecycle-gateway/application acceptance still required after earlier A2 failure; R5 alone insufficient |
| I | NOT_EXECUTED |Fresh filesystem25 and unit security controls pass; complete trusted-tool/installed-consumer/current security obligations not completed |
| J | PASS |New lint restoration and production/development/private audits at0dd9a17; original C failure remains historically failed |
| K | FAIL |J1-PKG-001; actual archive/consumer/type qualification not reached |
| L | NOT_EXECUTED |No final independent local review; original R1 MAJOR remains open locally |
| M | NOT_EXECUTED |HOSTED_CI_NOT_EXECUTED_NO_PUSH_AUTHORIZATION; partial requirements inventory only |
| N | PASS |Evidence-based failure handoff; target local qualification not achieved |

For every new execution, the actual source, environment/tool versions, exact command/exits/counts/evidence path are given by the ledger and corresponding focused/lint/audit/unit/package reports. No observer collection/termination intent or integration Docker campaign was active in the package failure; those fields are NOT_APPLICABLE. No fresh R5/Services observer intent or signal data is invented: their exact controlled collection/streams/signals/cleanup remain in their original linked qualified receipts. For unexecuted gates counts, exits, fresh Docker attempts, package identity and independent disposition are NOT_EXECUTED rather than success placeholders.

| Mandatory qualification category | Final disposition |
|---|---|
| Unit tests / contracts |Fresh354/24 PASS |
| Assertion preservation |Fresh54 PASS, also included in full354; sole authorized historical replacement unchanged |
| Docker network isolation |Unit coverage PASS; fresh complete Docker/security acceptance and final R1 review not reached |
| Recovery R5 |R5_QUALIFIED_EXECUTABLE_PRESERVED; original55/38, actual recreation/final strict readiness/cleanup/FINDING_CLOSED retained |
| Gateway |NOT_EXECUTED in J1 |
| Services |Qualified P2-F1 source-equivalent17/17/campaign0 retained; no new run |
| Lifecycle / application |NOT_EXECUTED in J1; earlier incomplete/failed acceptance not erased |
| Observer shutdown |Fresh30+9 PASS; operational contract unchanged; prior independent FINDING_CLOSED retained |
| Trusted executable security |Mitigation source unchanged; full standalone actual-tool campaign NOT_EXECUTED |
| Filesystem safety |Fresh25/25 PASS, scoped Docker --rm fixture/ownership restoration logs retained |
| Dependency audits |All three fresh audits0 findings; pins/locks unchanged |
| ESLint |PASS,0 errors/28 historical warnings/0 new findings |
| Package construction |FAIL at preconstruction audit; only dry-run43-member inventory observed; archive SHA256 NOT_CREATED |
| Consumer compatibility |NOT_EXECUTED |
| Independent final local security review |NOT_EXECUTED; no original R1 local closure |
| Historical Postfix risk |ROOT_CAUSE_UNDETERMINED — OWNER_ACCEPTED; no functional Postfix correction claimed |
| Hosted CI |HOSTED_CI_NOT_EXECUTED_NO_PUSH_AUTHORIZATION |
| PR push / merge / publication |Not authorized; current local qualification is also incomplete |

Separate finding dispositions: C-LINT-001 is locally corrected and lint-verified; no independent final J1 review is claimed. A1 assertion-reachability, R5 recovery and P2-F1 observer prior independent closures remain applicable through unchanged relevant behavior. Original R1 remains pending final independent closure. J1-PKG-001 remains OPEN. Historical Postfix is ROOT_CAUSE_UNDETERMINED — OWNER_ACCEPTED, never FINDING_CLOSED.

Cleanup: no network/Gateway/Services/lifecycle/application deployment campaign began. Only canonical filesystem security fixtures used Docker, with owned temporary mounts, explicit --rm and successful recorded UID restoration/cleanup. No foreign Docker resource or protected configuration was modified; no cleanup failure was observed. Diagnostic/evidence directories are deliberately retained. Source hashes and all raw log hashes remain verified. No further qualification followed STOP.json.

Next required action is the [separately scoped package follow-up](IL-5.14-R1-F1-E3-A4-C-J1-package-follow-up.md), preserving qualified R5 and the strict package-member security boundary. No unreviewed package policy correction is authorized by this report. Parent handoff: **FAILED_QUALIFICATION — A4-C-K / J1-I / J1-PKG-001**, with J1's minimal correction and parent Gate J qualification preserved. No unchanged failed campaign is repeated merely to obtain PASS.

POSTFIX_HISTORICAL_ROOT_CAUSE_UNDETERMINED. POSTFIX_HISTORICAL_UNCERTAINTY_ACCEPTED_BY_OWNER. SMTP_RECOVERY_UNQUALIFIED. H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED. Prior Debian H3 remains a historical failure. Option B does not cover this package failure or any current/future failure. No Internet SMTP deliverability/spool recovery/queue persistence/general SMTP tolerance/downstream Debian acceptance/unrelated lifecycle closure is claimed. No push, PR edit, merge, npm/image publication, release tag, deployment or Debian/Server Runtime/Oxy-form modification occurred.
