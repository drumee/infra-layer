# IL-5.14-CQ-01 qualification baseline

Recorded on 2026-11-04. **CQ01_CANDIDATE_SHA = `5bb733b7f709547f928f87edf9a37fd7f31fe4be`.** No executable correction is made by CQ-01. Subsequent local reporting commits do not replace this candidate identity.

## Source and remote identity

Branch: `fix/il514-c1-network-attachment-identity`. Initial working tree: clean. Local HEAD and the current open [PR #20](https://github.com/drumee/infra-layer/pull/20) head both equal the candidate, matching the mission's last verified remote SHA. Base `main`: `c218811effc83da25cf71a914e27accc96101329`. Read-only connector metadata is preserved in [pr-start.json](evidence/IL-5.14-CQ-01/pr-start.json). The PR description still summarizes an older qualification and is not evidence of current acceptance.

[Source inventory](evidence/IL-5.14-CQ-01/source-inventory.json) records SHA256 for all 191 tracked non-documentation files, the complete PR path classification, and comparisons with applicable historical revisions. [Package inventory](evidence/IL-5.14-CQ-01/package-identity.json) separately records every packed member's source hash. Historical files remain unchanged.

| Comparison | Production/package changes |
|---|---|
| Earlier qualified executable `f54a6ea3c1d170ee543ef98a890b38f0dd449a55` | `internal/rollback-authorization.js`, `lifecycle/activation.js`, `lifecycle/docker.js`, `lifecycle/recovery.js` |
| Qualified R5 executable `72f4c67254561ca5c4c47a6a65e9620e57da7841` | None |
| Observer executable `fd708aaf914accc93aa42fcd705740db390721d5` | None |
| K1 package/test correction `20c8a2931dc95f6beca1eb7ac2c0fbe5282194ee` | None |

Since R5, test changes include observer/capture support, package closure checks, fixture-volume ownership and mount comparison, and historical diagnostics. Documentation/evidence changes are listed separately in the inventory. R5's unchanged implementation/dependencies make its [recovery qualification](IL-5.14-R1-F1-E3-A4-R5-F1-E1-final-decision.md) applicable supporting evidence; fresh CQ-01 unit tests still run against the candidate. That historical local qualification is not complete application acceptance.

## PR delivery scope

The actual PR has 65 commits and 1,352 changed files, with 173,983 additions and 58 deletions at baseline. Path classification: seven production/package inputs, 75 test files, one workflow file, 289 documentation files and 980 historical raw-evidence files. Documentation classification is by location; supporting runtime documentation can also be an npm package member.

The necessary production changes are complete network membership and network/endpoint identity checks, bounded unsettled-metadata readiness, safe optional health inspection, explicitly authorized rollback admission and preserved failure classification. The dependency manifest/lock updates concern development SMTP security fixes. Public type/export declarations are unchanged from the base. Necessary tests exercise positive behavior, unauthorized/foreign-resource refusal, error propagation and package closure. The workflow requires full Git history for pinned historical-source tests.

The three CQ-01 reports, exact candidate inventory, relevant raw results and exact archive identity are the current qualification record. Earlier diagnostic narratives, TAP experiments, generated logs and overlapping administrative reports are historical records, not additional mandatory gates. Nothing is deleted or rewritten. A future owner-directed delivery should present a small implementation/test review and this consolidated qualification index, with the existing historical evidence linked as an appendix or retained archive. This is a recommendation; CQ-01 does not restructure or update PR #20.

## Current risk register

| Finding | Classification | Observation and release impact |
|---|---|---|
| Old network key/container confusion and unauthorized extra membership | `CLOSED_WITH_EVIDENCE` for deterministic implementation scope | Actual-code positive/negative tests pass on this candidate. Current real-Docker acceptance remains a separate required gate. |
| R5 rollback authorization and error precedence | `CLOSED_WITH_EVIDENCE` for R5 scope | Source-equivalent historical real-Docker evidence plus fresh authorization/boundary/error regressions. No current bypass reproduced. |
| V1-F1-REC-001, mount-array order | `TEST_HARNESS_DEFECT`; closure remains a `QUALIFICATION_BLOCKER` | Existing multiset correction passes deterministic tests and a fatal negative control. Real mount reconciliation is still required before resolving the original finding. |
| E1/D1/B1 native result-channel anomalies | `HISTORICAL_UNREPRODUCED` | Original evidence preserved. Current host runs expose individual named results and failures; no historic root cause is asserted. No new test-observation framework is needed. |
| Historical application `NETWORK_ATTACHMENT_MISMATCH` | `HISTORICAL_UNREPRODUCED` plus current application `QUALIFICATION_BLOCKER` | Original failure remains recorded. The narrower A1 success did not fix or qualify it. Only a new complete canonical campaign can establish current acceptance. No new campaign has run here. |
| Current Docker isolation | `QUALIFICATION_BLOCKER` | Shared default daemon contains unrelated projects and historical resources; no current isolated nonproduction environment established. Resource campaigns are withheld. |
| New development dependency advisory GHSA-g3hv-75wg-m249 | `QUALIFICATION_BLOCKER` | Current required audit exits 1: five moderate dependency entries rooted in locked minimatch 10.2.6. Production dependency audit is clean. Runtime exploitability is not established; no risk acceptance is inferred. |
| Current sandbox process/tool restrictions | `TEST_HARNESS_DEFECT` in execution environment | EPERM and remapped tool ownership invalidate initial checks. Trusted host reruns pass unit/contracts/mount/package checks. These observations do not explain old incidents. |
| Filesystem evidence security suite | `QUALIFICATION_BLOCKER` for its complete result | 22 tests pass; three foreign-UID setup cases fail at Docker socket authorization. No successful fixture creation. Complete suite remains failed, not excluded or waived. |
| Four historical volume identities H01–H04 | `QUALIFICATION_BLOCKER` for historical cleanup only | Separate unresolved cleanup obligations; no identities guessed and no resources deleted. They need not block a genuinely isolated new campaign. |
| Known historical Health volume removal | `CLOSED_WITH_EVIDENCE` historically | Retain prior exact removal receipts; no current deletion or new readback claimed. |
| Postfix HTTP capture uncertainty | `HISTORICAL_UNREPRODUCED` | Prior owner acceptance is limited to that incident; it does not waive current failures. |
| SMTP recovery, H1 Docker lifecycle cause, Debian H3 | `QUALIFICATION_BLOCKER` for their original scopes | Unsupported/unqualified SMTP recovery, unresolved H1 cause and historical downstream stability failure remain documented. No downstream qualification is claimed. |

No new active production `ACTIVE_SECURITY_DEFECT` or `ACTIVE_FUNCTIONAL_DEFECT` is demonstrated by executed CQ-01 checks. Missing integration evidence prevents a claim that all required security/functional properties are qualified.

## Required acceptance

Qualification requires exact source and artifact identity; passing declared network/endpoint and complete attachment-set invariants; ownership and authorization before recovery; bounded recovery with preserved original/cleanup failures; unit/contracts/static/security and dependency checks; one isolated real Docker campaign with fully attributed cleanup; complete canonical application acceptance; exact-archive consumer/package integrity; and one independent review with no active MAJOR/BLOCKER.

Real Docker scenarios must cover expected/unexpected attachment, network/endpoint identity, supported multihoming, recreation and authorized/unauthorized recovery, fatal command failures, unordered mount reconciliation and safe ownership checks. A campaign plan must establish environment isolation, exact names/IDs/types/markers, creation receipts, lifecycle checks and absence of unauthorized references before deletion. Historical resources stay outside that plan. Unique names alone do not establish environment isolation.

The global decision cannot pass while any required gate is failed or unexecuted. See the [evidence](IL-5.14-CQ-01-evidence.md) and [final decision](IL-5.14-CQ-01-final-decision.md).
