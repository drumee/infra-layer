# Independent V1-F1 campaign and cleanup review

**CHANGES_REQUESTED — V1-F1-REC-001 (MODERATE, test-only reconciliation correctness). Recommended mission status V1_FAILED_QUALIFICATION.** The single controlled campaign exits1 at its final global inventory assertion. The mechanism is not qualified. The actual failed result remains cleanup INCOMPLETE / campaign FAIL despite successful deletion of the exact new owned resources. No rerun, correction or qualification upgrade follows.

## Source and preflight

Exact executable/test candidate a5c61911c62dd2e48f4c87330f1d84990c1069e3 changes only the unused stdout initializer and fixed new evidence-root literal. Both original result/error branches still assign actual string output and preserve original exception propagation. The old specific ESLint finding is independently FINDING_CLOSED: focused lint and canonical lint pass, with 0 errors, 28 historical warnings and 0 new findings. Syntax checks, ownership matrix24 and guard48+6=54 pass on that candidate. Seven static receipts are successful. The original V1 failed lint and expected V1-F1 baseline reproduction remain separate evidence.

The independent preflight supported exactly one controlled owner-authorized attempt, not a guarantee that execution would succeed. Source/harness/plan/daemon/image hashes matched. Independent final recheck still verifies all177 original inputs, four frozen current harness files and archive SHA256 004f018288018f678ed044c56ee4b9de520ab9ec9bc0e7deb3b6d59c172f99e1. No production/package/network/recovery/observer/Postfix input changed.

## Actual owned lifecycle

Attempt V1-F1-3fc8b481-011a-4fba-b735-f764ab3f1ece creates only volume drumee-v1-7ce5916aa16dcb4d7797241b-data and container af9b62076545488e6c08a52eb3f4a97fef245e43854a88dc4da72484098cc134, with exact creation receipts, nonce/owner/attempt/project labels, daemon and image identity and actual Mounts association. The volume is explicitly local/disposable; no historical object is adopted.

All131 Docker command records are contiguous and exit0. Exactly six mutating calls exist: seq13 volume.create,22 container.create,41 start,60 stop,83 container rm and117 volume rm. All target only the exact fresh manifest resources; no force/prune/broad selector/network modification/foreign-resource operation occurs. Created, running and stopped consumers each cause the harness's expected VOLUME_IN_USE refusal before any real volume rm. The controlled remove-failure test double preserves original exception identity and issues no Docker removal. After exact non-force container removal, two fresh daemon/volume/all-state-reference checks precede exact non-force volume removal; its verified-absence receipt matches creation fingerprint and attempt.

Planned post-failure evidence consists of seven read-only commands, not another test/campaign. The investigator's readback, independently reviewed, records the same daemon, absent exact volume, zero references and absent exact container. Six retrospective exact-owned events show create/start/signal15/stop/die exitCode0/destroy. No process exit is inferred solely from a successful stop call. Events are auxiliary for the exact resource and do not establish sub-nanosecond cross-process ordering; no timestamp precision beyond the stored evidence is claimed.

## First failure and demonstrated cause

No primary functional error occurs; the original result records cleanup_errors=[ERR_ASSERTION]. After complete owned removal, campaign.cjs:73 calls assert.deepEqual(after,before). docker.cjs:49 projects container Mounts with map and preserves the returned array order. The full raw before/after snapshots show exactly ten container Mounts-array permutations. The same container IDs/names, ownership hashes, network hashes and complete projected mount tuples remain; tuple multiplicities are unchanged. All682 volume snapshots and all21 network snapshots are identical; all35 container identities remain.

Offline comparison sorting full canonical mount tuples, preserving duplicate multiplicity, establishes that array ordering alone explains this assertion. That analysis does not rewrite raw snapshots, weaken a test or retroactively convert the failed campaign to PASS. The original global reconciliation and cleanup result stay failed. No foreign modification is evidenced by command scope or the projected semantic metadata; this is not a claim about every unobserved property or actions by unrelated administrators.

**V1-F1-REC-001 is a MODERATE test-only qualification blocker**, not a demonstrated production or unsafe-deletion defect. A separate bounded follow-up may canonicalize only the order-insensitive Mounts collection, preserving every compared tuple field and duplicate count, with positive permutation and negative actual-change controls. Any later real campaign requires a corrected, freshly qualified candidate and distinct authorization/attempt; no unchanged retry is justified. No such correction is made here.

## Historical and parent boundaries

H01-H04 remain four unresolved physical identities, not four identified current volumes. No historical deletion is authorized or performed. The separate known already-removed Health volume retains its old exact proof. Current fixture absence does not reconcile historical cleanup. The LOW partial-creation structured-ledger auditability observation remains unchanged and was not the failure in this fully recorded attempt.

The original application NETWORK_ATTACHMENT_MISMATCH remains failed and causally undetermined; R1 final closure remains pending. Qualified package/R5/Services/lifecycle evidence remains only within its prior exact source-equivalent scope. Historical Postfix owner acceptance remains narrowly scoped and waives none of these failures. The reviewer performed no test, Docker command, implementation edit or cleanup; analysis used only preserved source/artifacts. No new MAJOR/BLOCKER security bypass is demonstrated. Mandatory failed qualification and the open MODERATE reconciliation defect prevent a favorable mechanism disposition.
