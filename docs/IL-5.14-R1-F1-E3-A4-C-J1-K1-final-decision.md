# K1 final local convergence decision

**FAILED_QUALIFICATION — parent A4-C Gate H / K1 Gate K: complete application acceptance.** Partial result: **PACKAGE_QUALIFIED**; the original package blocker J1-PKG-001 is independently FINDING_CLOSED. The required local F1 target is not reached. Final local security review is **BLOCKED_EVIDENCE**, with original R1 final local closure withheld. No current failure is waived.

Mandatory first failure: canonical application command exits1 with **NETWORK_ATTACHMENT_MISMATCH**, six completed groups /36 reported assertions, on source **20c8a2931dc95f6beca1eb7ac2c0fbe5282194ee**. Project drumee-il5-35341a09, attempt K1-drumee-k1-l0h17j68, UTC2026-10-29T08:15:56.280418–08:16:23.432845. The first incomplete group by source order is failed-startup-does-not-reset-owned-application-state; the preserved report does not identify the first failing API, internal refusal branch or exact attachment state. No causal mechanism is inferred solely from the code or similarity to A2. [Original output](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/application.log), [original report](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/application-report.json), [STOP receipt](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/STOP.json), [finding](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/application-finding.json). No repeat or runtime correction follows.

Additional cleanup evidence gap **K1-CLEAN-001**: original cleanup readbacks cover deployment containers/networks/images/listener/temp directories, not every fixture volume. One explicitly attributed anonymous Health-fixture /data volume survived container removal. After exact report/metadata/reference proof it was safely removed, with zero references and absent readback. No foreign/unproven resource was touched. Full fixture-volume attribution is unavailable because there was no volume baseline and traces omitted mounts. Full cleanup is therefore NOT_QUALIFIED. The initial overly broad root readback flag is corrected explicitly, preserving its original snapshot; canonical raw test outputs are not rewritten. [Cleanup evidence](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/volume-cleanup-finding.json), [scope correction](IL-5.14-R1-F1-E3-A4-C-J1-K1-cleanup-finding.md). This is not a demonstrated cause of the application failure.

Source/test harness: **20c8a2931dc95f6beca1eb7ac2c0fbe5282194ee**, commit test: admit required rollback helper with strict package closure checks. Production/package bytes remain equivalent to **fd708aaf914accc93aa42fcd705740db390721d5**, R5 runtime/reference **72f4c67254561ca5c4c47a6a65e9620e57da7841**. Only canonical package audit and its shared test-only validator/15 regressions changed after J1. Original source checkpoints6b9027b/0dd9a17 and all earlier commits remain preserved. Final documentation checkpoint is the commit introducing this decision; exact SHA is recorded in the owner handoff and `/tmp/drumee-k1-l0h17j68/checkpoint-readback.json`. A report-only commit does not alter tested executable inputs. [Frozen hashes](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/candidate-inputs.json), [final readback](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/final-freeze.json).

Actual retained package: @drumee/infra-layer@0.1.0-alpha.3, drumee-infra-layer-0.1.0-alpha.3.tgz, **43 members /105706 bytes**, SHA256 **004f018288018f678ed044c56ee4b9de520ab9ec9bc0e7deb3b6d59c172f99e1**, npm integrity **sha512-lOz13ust70N4xnXD4LRDujRebtZerW0OjXvtYXUf35OU3Wj3w0YPg+w+P6stDPSLXGZygDHW6/eOKExLEmoj6g==**. Every member matches source and dry-run/real npm/tar inventory; required helper and full relative/finite computed dependency closure are present. Artifact retained at `/tmp/drumee-k1-l0h17j68/candidate/drumee-infra-layer-0.1.0-alpha.3.tgz`. [Complete identity](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/package-identity.json). Published alpha.3 is not replaced. Old S2's42-member hash is not this candidate.

Environment: host Node22.22.0/Undici6.23.0/npm11.18.0/ESLint10.13.0, Docker29.2.0, Linux amd64, UID/GID1000; strict compiler5.9.3; authorized network client testbox Node22.23.2 and trusted host nginx1.22.1. Qualification spans October28–29 after a technical interruption. Resume verified source/archive/exits before continuing, without repeated tests. The final reviewer separately resumed its interrupted session and did not duplicate prior independent commands. [Baseline](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/baseline.json), [resume](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/resume-verification.json), [preflight](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/application-preflight.json).

The implementing [ledger](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1/execution.jsonl) has22 qualification commands:21 successful and the final application exit1. Every entry preserves exact argv/cwd/UTC/source/exits/log SHA256, unchanged frozen inputs and unchanged protected Docker configuration. Post-stop operations only preserve evidence, inspect cleanup/source identity and remove the one proven owned unused volume; no new qualification or source correction occurs. Independent package7 commands all0; independent final13-probe and150-test commands0 are separate review evidence, not added to implementing totals.

| K1 gate | Status | Actual evidence, source and limitation |
|---|---|---|
| A | PASS |6b9027b exact failure/current audit/manifests reconstructed; raw J1 failure preserved |
| B | PASS |Required lifecycle rollback helper and complete literal/finite computed closure established |
| C | PASS |Closed three-name internal enumeration, completeness and preserved security predicates defined |
| D | PASS |20c8a29 changes only3 test/audit paths, no runtime/export/dependency/policy change |
| E | PASS |15/15 closed-world positive/negative regressions, exit0; reasons/fatal child propagation verified |
| F | PASS |Canonical audit, dry inventory, actual archive and integrity/source verifier0;43/105706/SHA004f… |
| G | PASS |Actual offline installed consumer10, strict canonical NodeNext types and installed-security4; missing-helper negative detected |
| H | PASS |369 unit/24 contracts, lint0 errors/28 historical warnings/0 new,3 audits0; guard54 subset included |
| I | BLOCKED |PRODUCTION_EXECUTABLE_PRESERVED by exact comparison; full Docker cleanup applicability now blocked by K1-CLEAN-001 |
| J | PASS |Independent focused package FINDING_CLOSED,7 commands0, fresh/negative actual archives and isolated consumers |
| K | FAIL |Parent application exits1 after6 groups/36 reported assertions; no new full F1 convergence |
| L | BLOCKED |Independent BLOCKED_EVIDENCE; final R1 closure withheld; cleanup gap also confirmed |
| M | PASS |Readiness documentation only:10 successful old-remote checks recorded; local hosted CI NOT_EXECUTED |
| N | PASS |Complete coherent failure/package-partial decision, source freeze and limitations; not overall qualification success |

K1 I was initially assessed favorably for unchanged production and scoped evidence before parent continuation; it is reassessed BLOCKED after discovery of the missing all-resource cleanup guarantee. Original gate/test observations remain preserved; no retroactive claim that the gap was known before execution is made.

| Parent A4-C gate | Status | Current candidate evidence/disposition |
|---|---|---|
| A | PASS |20c8a29 test freeze; production fd708aa-equivalent; all local commits preserved |
| B | PASS |Explicit owner Option B under IL-5.14-A4-POSTFIX-RISK-B remains narrowly scoped |
| C | PASS |Full inventory/reuse rules and newly discovered failure/cleanup obligations recorded |
| D | PASS |Fresh369/24; existing assertion guard54 included; no historical assertion replacement added |
| E | BLOCKED |Actual membership21/Redis42/Health15 assertions pass; scoped R5 55/38 preserved; complete fixture-volume cleanup not established |
| F | PASS |Retained A2 Gateway17/17 with exact exercised source/harness/lock closure and prior cleanup, independently verified; not rerun |
| G | PASS |Retained fd708aa Services17/17/whole campaign0 and exact operational observer/capture source; not rerun |
| H | FAIL |Fresh lifecycle16/16 and HTTPS/jobs4 pass; complete application fails6 groups/36 reported assertions |
| I | BLOCKED |Trusted tools12/installed security4/current unit controls pass and J1 filesystem25 retained; cleanup evidence gap and final review prevent complete assurance |
| J | PASS |Current canonical ESLint0/28/0 and production/development/private audits0; pins unchanged |
| K | PASS |Strict package15, actual43-member archive, real installed/public/runtime/strict consumer, canonical preparation8+refusal37 and focused independent closure |
| L | BLOCKED |Independent final review BLOCKED_EVIDENCE, no original R1 final local closure |
| M | PASS |Future hosted requirements/old-head actual checks accurately documented; no local hosted PASS |
| N | PASS |Failure consolidation only; requested LOCAL_F1_QUALIFIED target not met |

Every executed row uses exact source20c8a29 and recorded host/tool versions; commands/exits/counts/paths are in the ledger and linked scope reports. Retained rows use their explicit historic source/harness and relevant-byte equivalence: R5 72f4c67, P2-F1 Services/observer fd708aa, Gateway A2 04a4fc9, filesystem/observer J1 0dd9a17. No source-incompatible evidence is combined into a single successful candidate. Unexecuted later application groups, future hosted CI and final favorable R1/security approval have no successful exit/count assigned. Original canonical error has no observer intent/signal/window because it is not an observer campaign failure; those fields are NOT_APPLICABLE. Recorded observer/transport state belongs only to its linked original qualified campaign.

| Required category | Final local result |
|---|---|
| J1 ESLint correction |Retained; current lint0 errors/28 historical warnings/0 new |
| Package allowlist/completeness |PASS, exact required helper only; no broad internal wildcard |
| Package negatives |15/15, includes unknown/nested/test/credential/import/missing dependency/fatality cases |
| Actual archive/integrity |43 members,105706 bytes, exact SHA256 and npm SHA512 above |
| Isolated installation/CommonJS |10 retained-archive controls PASS; no source fallback; helper omission detected |
| Strict types |Canonical public program passes strict NodeNext compiler5.9.3; also broader canonical consumer passes |
| Unit/contracts/assertions |369/24 PASS;54 guard subset included, not double-counted |
| Filesystem safety |J1 25/25 retained by exact relevant source/harness; no new filesystem run claimed |
| Audits |Three current required audits0 vulnerabilities; manifests/locks/versions unchanged |
| Network isolation |Actual21/42/15 and independent13+150 favorable; full cleanup assurance and final R1 closure withheld |
| R5 recovery |Exact55 focused/38 real Docker boundary evidence/FINDING_CLOSED retained; does not qualify failing complete application |
| Gateway |Retained17/17, source-equivalent exercised closure, independent applicability verification |
| Services |Retained17/17 plus complete campaign0, source-equivalent; no new HTTP capture run |
| Lifecycle |Fresh16/16 PASS with canonical project cleanup marker; full anonymous-volume accounting not inferred |
| HTTPS/jobs |Fresh4 scenarios PASS, owned deployment cleanup confirmed within readback scope |
| Application |FAIL — NETWORK_ATTACHMENT_MISMATCH,6 completed groups/36 reported assertions |
| Observer |Unchanged operational contract, prior independently closed30+9 scope preserved; no unconditional143 acceptance |
| Trusted executable security |Fresh12 standalone and4 installed security controls PASS |
| Independent package review |FINDING_CLOSED — J1-PKG-001 |
| Independent final review |BLOCKED_EVIDENCE; original R1 closure not granted |
| Historical Postfix |ROOT_CAUSE_UNDETERMINED — OWNER_ACCEPTED; no technical fix asserted |
| Hosted CI |HOSTED_CI_NOT_EXECUTED_NO_PUSH_AUTHORIZATION |
| Push/merge/publication |Not authorized; current local qualification also fails |

Separate current findings: **K1-APP-001**, MAJOR operational acceptance blocker, mechanism undetermined; **K1-CLEAN-001**, full fixture-volume cleanup assurance gap, one proven orphan safely removed. No production isolation weakening is inferred from these facts alone. The original R1 remains withheld for final local closure; A1/R5/observer prior independent closures remain applicable only to their exact qualified scope. Package J1-PKG-001 is independently closed. All original failures remain failures.

Required follow-ups: [bounded application causal investigation](IL-5.14-R1-F1-E3-A4-C-J1-K1-application-follow-up.md) and [strict fixture volume accounting/cleanup qualification](IL-5.14-R1-F1-E3-A4-C-J1-K1-cleanup-finding.md). No production rollback/network correction, test expectation weakening, generic retry/sleep, full campaign rerun or new risk acceptance is applied here. Preserve the qualified package and current successful evidence while separately establishing the missing mechanisms/controls. Parent handoff: **FAILED_QUALIFICATION — A4-C-H / K1-K, with K1-CLEAN-001 also blocking complete Docker/security cleanup assurance**.

POSTFIX_HISTORICAL_ROOT_CAUSE_UNDETERMINED. POSTFIX_HISTORICAL_UNCERTAINTY_ACCEPTED_BY_OWNER. SMTP_RECOVERY_UNQUALIFIED. H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED. Prior Debian H3 remains a historical failure. Option B does not waive this application failure, cleanup gap, future transport failure, mandatory security requirement, independent review or hosted check. No Internet SMTP deliverability/spool recovery/queue persistence/general SMTP fault tolerance/downstream Debian acceptance/unrelated lifecycle closure is claimed. No push, PR edit, workflow dispatch, merge, npm/image publication, release tag, deployment or Debian/Server Runtime/Oxy-form modification occurred.
