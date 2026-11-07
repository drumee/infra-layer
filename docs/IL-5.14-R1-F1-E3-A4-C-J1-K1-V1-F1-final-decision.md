# V1-F1 final decision

**V1_FAILED_QUALIFICATION — Gates F/G, mandatory real-campaign inventory reconciliation.** Independent result: **CHANGES_REQUESTED**, finding **V1-F1-REC-001**, MODERATE test-only comparator defect. The original ESLint blocker is corrected and independently closed, but the cleanup mechanism is **NOT_QUALIFIED**. No source correction, test rerun or second campaign follows the new failure.

Source resume checkpoint **af888a0bb51d837e40479bd69d7aec797dbf6767** was clean. Test candidate **a5c61911c62dd2e48f4c87330f1d84990c1069e3** contains exactly two source-line changes: remove redundant `stdout` initialization; bind the fixed campaign evidence destination to V1-F1. Ownership/model/test bodies/cleanup commands/bounds and all 177 previously frozen original files are unchanged. Production/package source remains **20c8a2931dc95f6beca1eb7ac2c0fbe5282194ee**, runtime fd708aa-equivalent and R5 72f4c67-equivalent. Final documentation checkpoint is the commit introducing this decision; its exact SHA is recorded in the owner handoff and private `/tmp/drumee-v1-f1-_g1ljncz/checkpoint-readback.json`. Report-only changes after a5c61911 do not change executed inputs.

The actual retained K1 archive is unchanged: **43 members/105706 bytes**, SHA256 **004f018288018f678ed044c56ee4b9de520ab9ec9bc0e7deb3b6d59c172f99e1**. No archive rebuild, new package identity or publication occurs. Original K1/A1/V1 evidence manifests remain intact. Historical unit369/contracts24/lifecycle16/HTTPS-jobs4, scoped R5 55/38, package/Services/observer qualification remain retained only through relevant source/harness equivalence, not new executions or complete volume/application assurance.

## Actual execution and first failure

The original `npm run lint` failure was reproduced **before** correction: expected exit1, one no-useless-assignment error at docker.cjs:11:9, 28 historical warnings. This baseline reproduction remains distinct from the corrected candidate. On exact a5c61911, **seven static commands exit0**: two syntax checks, focused lint0/0, canonical lint **0 errors/28 historical warnings/0 new findings**, ownership matrix **24/24**, preservation/reachability **48/48**, refusal-effectiveness **6/6**. The guard scope is 48+6=54, not an invented single 54-test invocation. No skip, historical assertion replacement, policy/suppression change or test-body weakening occurs.

After recorded independent preflight approval, exactly one real campaign runs: **V1-F1-3fc8b481-011a-4fba-b735-f764ab3f1ece**, project **drumee-v1-7ce5916aa16dcb4d7797241b**, UTC **2026-10-30T19:15:33.504Z–19:15:35.893Z**. Command `node test/diagnostics/fixture-volumes/campaign.cjs`, through V1-F1 run.py. Root exit **1**; protected Docker configuration and all frozen source remain unchanged. [Execution ledger](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/execution.jsonl), [STOP](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/STOP.json), [actual result](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/campaign-1/result.json).

Owned volume **drumee-v1-7ce5916aa16dcb4d7797241b-data** and owned container **af9b62076545488e6c08a52eb3f4a97fef245e43854a88dc4da72484098cc134** have corroborated exact manifest/creation/nonce/labels/metadata/daemon proof. All **131 Docker commands exit0**; six mutations target only those new exact objects: volume create13, container create22, start41, stop60, container rm83 and exact non-force volume rm117. Three **harness-level VOLUME_IN_USE** refusals occur while created/running/stopped before volume rm. Original-error removal injection is test-double-only, issues no Docker rm and leaves the volume intact until legitimate disposal.

Owned container and volume are actually removed and verified absent; no consumer remains. Seven read-only post-failure commands preserve daemon/absence/reference/events evidence. Six owned-container events include signal15, die **exitCode0**, destroy. No volume prune, force/broad removal, historical adoption, image pull/build, foreign-container manipulation or network mutation command exists. No remaining V1-F1 owned resource is unaccounted for. Those scoped successes **do not erase the failed mandatory global comparison**.

The first failed control is `assert.deepEqual(after,before)` at **campaign.cjs:73**. Raw outcome remains **primary_error=null, cleanup_errors=[ERR_ASSERTION], cleanup=INCOMPLETE, campaign=FAIL**. The adapter at **docker.cjs:49** preserves Mounts array response order. Ten unchanged unrelated containers return identical projected mount objects in different permutations. Raw snapshots contain the same **682 volumes/35 containers/21 networks**; all other projected fields match. Sorting only copied complete mount objects, retaining duplicate multiplicity, makes the snapshots identical. This offline causal analysis proves the comparator's ordering sensitivity; it is **not a source fix, test rerun or successful reconciliation qualification**. Original raw evidence/results remain unchanged. [Order analysis](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/inventory-order-analysis.json), [scope analysis](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/command-scope-analysis.json), [owned-resource readback](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/post-failure-readback.json).

## Separate conclusions

| Dimension | Supported conclusion |
|---|---|
| ESLint correction | PASS; exact initializer issue independently FINDING_CLOSED |
| Static ownership/assertion controls | PASS; matrix24 and guards48+6, all actual counts |
| Real Docker cleanup mechanism | FAIL / NOT_QUALIFIED; mandatory final reconciliation exits1 |
| Current resource accounting | Exact own objects removed/absent, no residual consumer; full program cleanup status remains INCOMPLETE |
| Foreign-resource evidence | All mutating targets own; projected sets/fields unchanged except Mounts permutations; no unauthorized modification evidenced; no claim of full unprojected-state equivalence |
| Historical H01–H04 | RESOURCE_IDENTITY_UNRESOLVED / HISTORICAL_EVIDENCE_INSUFFICIENT; zero historical deletion |
| Qualified production/package | PRESERVED; original177/four harness/source/archive hashes verified |
| Application | FAILED NETWORK_ATTACHMENT_MISMATCH, historical cause unknown; no application run |
| Original R1 | FINAL_CLOSURE_PENDING; no new final local closure |

Selected shared daemon **f8cee57d-3923-46b6-8d55-6cd6490ec1db**, context **default**, explicit **unix:///var/run/docker.sock**, Docker29.2.0/Node22.22.0. Nineteen preflight read-only commands precede the campaign; seven read-only post-failure commands preserve evidence. The 131 campaign commands contain six mutations and 125 reads. Exact command argv/exits/hashes are separate from root test counts. Current inventory is not an ownership grant or proof of continuity with the historical daemon, whose engine ID was not captured. The immutable pinned Node image has no implicit volume and no host network/port exposure. No Docker content of unknown volumes is mounted/read; unrelated Env/option/label data is not retained/disclosed in evidence.

H01–H04 are investigation records, not four identified surviving volumes. Their prior creator IDs and creation contexts are known; physical volume Names, original Mounts and deletion receipts are missing. Eight current exact-label queries are empty and old creator IDs absent, which does not establish historical cleanup. The separate already-removed Health volume retains its actual prior mount/reference/rm0/absent proof and is not deleted again. No exact historical deletion decision can be prepared without positive identity/ownership/consumer evidence; no blanket authority is requested or accepted.

Independent reviewer `/root/v1_cleanup_review` inspects actual artifacts and source, runs **zero tests/Docker commands**, and returns **CHANGES_REQUESTED** for MODERATE **V1-F1-REC-001**. It confirms the ordering-only cause, exact current disposal/termination, safe mutation scope, unchanged production/archive and unresolved history. No new MAJOR/BLOCKER deletion bypass or foreign mutation is demonstrated. The existing LOW partial-creation ledger auditability limitation was not the failure here. Preflight approval is retained as an actual earlier readiness result, not rewritten into success of the campaign. [Independent decision](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/independent-review/decision.json).

| Gate | Status | Evidence / limitation |
|---|---|---|
| A | PASS | Exact baseline/source and authorized expected original lint reproduction |
| B | PASS | Two-line behavior-preserving correction; no resource-selector change |
| C | PASS | Seven static commands0, lint0/28/0, matrix24, guards48+6 |
| D | PASS | Ownership/refusal/failure contract unchanged and tested |
| E | PASS | Exact daemon/image/attempt/plan, independent preflight approval |
| F | FAIL | Sole real campaign exits1 on mandatory ordered inventory comparison |
| G | FAIL | Raw full cleanup INCOMPLETE; own resources removed, ordering-only causal analysis not a qualified fix |
| H | PASS | Accurate four-entry unresolved historical ledger, no cleanup upgrade |
| I | PASS | Original production/package inputs and retained qualification scope preserved |
| J | BLOCKED | Actual independent CHANGES_REQUESTED, mechanism not qualified |
| K | PASS | Accurate stopped-stage/A2 handoff; no application or historical cleanup authority |
| L | PASS | Coherent failure evidence consolidation, not overall successful qualification |

The [structured gate matrix](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/final-gates.json) records common environment/source/harness/attempt and per-gate command/exits/counts, resource/consumer proof, cleanup/historical/review disposition, evidence paths and limitations. Source/evidence readbacks are in final-freeze.json/sha256.json. No unexecuted full unit/contracts/Docker/application/package/hosted gate is marked PASS. The current attempt is consumed; post-failure work is artifact analysis/read-only cleanup verification/documentation, not further qualification.

Required follow-up is the separately proposed **V1-F2** test-only Mounts comparator correction, with failing-before/passing-after and negative multiset/field/identity/missing/extra/duplicate regressions, requalified static controls, independent preflight and at most one new separately authorized campaign justified by that verified change. Do not sort all arrays globally, filter resource differences, deduplicate or weaken ownership. No fix occurs here. [Proposed scope](IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2-scope.md), [A2 handoff](IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1-A2-handoff.md). No A2 execution or future historical deletion is implicitly authorized.

Preserve **F1_FAILED_QUALIFICATION_APPLICATION_ACCEPTANCE**, **APPLICATION_ACCEPTANCE_FAILED_NETWORK_ATTACHMENT_MISMATCH**, **APPLICATION_HISTORICAL_ROOT_CAUSE_UNDETERMINED**, **FIXTURE_VOLUME_CLEANUP_UNQUALIFIED**, **R1_FINAL_CLOSURE_PENDING**, **POSTFIX_HISTORICAL_ROOT_CAUSE_UNDETERMINED**, **POSTFIX_HISTORICAL_UNCERTAINTY_ACCEPTED_BY_OWNER**, **SMTP_RECOVERY_UNQUALIFIED**, **H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED**, and prior Debian H3 failure. Owner Option B is only historical Postfix uncertainty; no new application/volume/comparator risk is accepted. No SMTP delivery/spool/queue/general recovery/downstream Debian acceptance is claimed.

PR20 remains open/main at **cd9b8322bd7eef3b4094710ec4ea26be94f08922**, read-only verified. **HOSTED_CI_NOT_EXECUTED_NO_PUSH_AUTHORIZATION**. No push, PR edit, workflow trigger, merge, package/image publication, release tag, deployment, production access or Debian/Server Runtime/Oxy-form modification occurs. This is a failed local qualification with a demonstrated bounded test-harness follow-up, not local F1/release readiness.
