# IL-5.14-R1 — Independent integration review

## 1. Executive decision

**CHANGES_REQUESTED** for PR20 at **cd9b8322bd7eef3b4094710ec4ea26be94f08922**. One independently reproduced **MAJOR** network-isolation finding remains. I do not recommend authorizing the merge until R1-001 is corrected or explicitly technically dispositioned by the project owner. No source/test/manifest/lock/qualified-branch change, merge, publication, tag, deployment or downstream action was performed.

The original endpoint-identity correction, safe optional Health handling, secure loader and Promise remediation are substantively supported. The successful217-test rerun, fresh audits, exact package reproduction and green hosted checks are real positive evidence. They do not cover the undeclared-network counterexample below.

## 2. Exact PR/base/head identity

Repository drumee/infra-layer, existing PR https://github.com/drumee/infra-layer/pull/20, open and non-draft. Target main at c218811effc83da25cf71a914e27accc96101329; branch fix/il514-c1-network-attachment-identity at cd9b8322bd7eef3b4094710ec4ea26be94f08922. True merge base is c218811effc83da25cf71a914e27accc96101329. Qualified executable/package revision f54a6ea3c1d170ee543ef98a890b38f0dd449a55 is an ancestor. The two subsequent commits9564b52 and cd9b832 change only reports/data/text evidence; runtime/test/CI/package input paths have no later diff. Every packaged byte independently matches both f54a6ea and the reviewed head.

GitHub reports28 commits,232 changed files,44256 additions/27 deletions, mergeable=true and mergeable_state=clean. There are0 submitted formal reviews and no requested reviewer/team in the inspected metadata. These facts are not authorization to merge. Branch-protection API remains HTTP403: **BRANCH_PROTECTION_UNVERIFIED**, not protection absent. See [identity](pr-identity.json), [policy response](branch-protection-readback.json), [existing reviews](existing-reviews.json).

## 3. Complete diff and scope

The complete3,301,197-byte Git patch is retained as [complete-pr.patch](complete-pr.patch), with [its hash](complete-diff-identity.json). All232 paths exactly match the fully paginated GitHub changed-file list; no GitHub patch truncation is used as a substitute for the Git diff. There are25 non-documentation paths: runtime/internal code,4 dependency manifests/locks, regression/integration/security fixtures, diagnostics and1 CI workflow. Public declarations are unchanged. Four byte-identical historical Python evidence runners were also inspected: caller-UID command recording with exclusive logs/config snapshots, not a shipped or privileged service.

The large evidence volume is separated from implementation. Six SHA256 manifests and171 referenced artifacts validate without discrepancy. Data copies of manifests/locks and helper text are qualification evidence, not active workspaces, package exports or silently installed toolchains. The file-by-file [JSON matrix](scope-matrix.json) and [CSV matrix](scope-matrix.csv) give category,purpose,security effect,coverage,disposition and blob identity for every changed path. No unexplained unrelated modification was found.

## 4. Source and package identity

Fresh `npm pack --json --pack-destination /tmp/drumee-il514-r1-review` independently reproduces42 members,103349 compressed bytes, SHA256 **3f6bdc655180ffa8b2a2f0746583b02b377fcbf3da2fc473761d3cbeae56e54b**, SRI **sha512-sQF88I/AJUt2kHEoEQawYlLj9okhwvT/tmOMecB6Jfsvv5icxSsFUQxovw1Wue59SBuGJrcufst5LRU0mqM7IQ==**. Every extracted member exactly matches the reviewed and qualified Git blobs. The extra member is internal/network-readiness.js. No test-only loader,fixture,credential or development dependency is shipped. See [member verification](package-and-lock-verification.json).

Published alpha.3 remains the distinct41-member101778-byte artifact with SHA256 c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e, supported by the preserved registry readback. This review did not publish or replace it. Candidate development version metadata is not an authorized release version.

## 5. Docker network security review

The corrected implementation properly separates network/container/endpoint identity. A synthetic ep-key must equal its EndpointID, retain typed metadata and match a declared namespace before becoming a bounded unsettled refusal. It is never inspected as a container or authorized by name alone. Ordinary64-hex containers require correct owner/project/service,matching name and actual selected NetworkID/EndpointID. Missing required referenced objects and genuine Docker nonzero results remain failures. The [pinned Moby producer](https://github.com/moby/moby/blob/9c623849a9e6ce2add344fa1453c454dce75340f/daemon/network.go) independently supports the distinction between container-backed and sandbox-less attachments.

However, lifecycle/docker.js:111–112 checks only the membership selected by the currently declared network. It does not reject other keys in the owned container's actual NetworkSettings.Networks. This is the independently demonstrated R1-001 and prevents a complete fail-closed isolation conclusion.

## 6. Lifecycle and ownership review

The private readiness factory retains monotonic time,5s reconciliation budget,50ms delay and immediate propagation of any non-unsettled error. No Docker failure,missing object or ownership refusal becomes a retry. Normal Docker command timeout remains180s; the5s value is a polling/reconciliation budget, not an independent total wall-clock bound on synchronous Docker reads. Cleanup never deletes unexpected objects from this validator.

Safe `index .State "Health"` preserves unknown when absent; activation still requires healthy for required running services and ownership checks are reached for no-health negative fixtures. Port,mount,image,attestation and secret-generation checks remain. inspectDeployment:120 and pre/post-activation checks call the same one-direction network validator; subsequent checkObserved validates ports/mounts, not an exact network set. Full composite ready=true after extra attachment was not independently reproduced; the false-success of the network guard itself is proven.

## 7. Test harness security review

load.cjs requires a fixed literal current CommonJS module and restores the temporarily mocked builtin/cache in finally. Arbitrary source/path arguments are rejected; isolated instances capture their own executor. Historical source and fixture hashes are fixed before AST inspection; no historical JS or general interpreter is executed. The old invalid command is derived as data and sent through the actual adapter with a controlled failure. Real Docker evidence complements these actual-source fixture tests.

The diagnostic helper preserves non-enumerable Error/AssertionError fields,expected/actual and causes,redacts registered and named sensitive values,omits unsafe getters/Buffers and bounds JSON records/trace. Leaf destinations are owned mode0700 and artifacts exclusive0600; actual qualification paths use owned private roots. Primary failures survive secondary cleanup/write/close failures. run rejects with explicit terminal catch/nonzero status; the actual child-process failure paths are included in the independent217-test rerun. Trace saturation at512 records is disclosed; I do not treat it as an unlimited command audit.

## 8. Dependency and supply chain

Only the intended mail graph changes: exact dev Nodemailer10.1.7,smtp-server3.19.24 and newly nested Nodemailer10.1.4; the private application fixture consistently pins10.1.7. Lock differences are the root selection plus those3 package records. Registry HTTPS/integrity fields and the unchanged remaining graph were reviewed. Root lock SHA256 is29656a3b8e09e4cf640c9b5f5519d47b95bc960abbe5ce33639a93b3a7cd23f3. Both fresh R1 full-development and production audits exit0 with0 findings; the empty runtime graph is not substituted for the development audit.

Clean/cached/offline integrity evidence uses isolated prefixes/caches and ignored installation scripts, with explicit negative-integrity refusal. CI adds only documented full-history access; actions remain pinned,permissions readonly,persist-credentials false,with no pull_request_target,secret interpolation,continue-on-error or scanner relaxation. Existing hosted toolchain hardening is not executed against the review host. No unqualified dependency/toolchain change was found.

## 9. Public/package compatibility

Root exports,subpaths,both declaration files,CommonJS mode,Node>=22 engine and license are unchanged. The added private helper is used by real activation and explicitly allowlisted; it is not a privileged test loader. Qualified offline consumers install the local tarball,resolve exports inside their own node_modules and pass8+37 assertions plus strict NodeNext compilation; installed trusted-tool/port/TLS refusal tests add4 cases. Source/member equality and the fresh exact tar hash independently confirm no fallback to published alpha.3.

## 10. Independent qualification evidence

The23 S2 command receipts all record successful expected exits,matching log hashes and unchanged protected Docker snapshots. Source revisions are c2320fd and f54a6ea as appropriate; code is frozen through the long integration executions. Raw logs substantiate unit217,contracts24,network13,loader6,diagnostics17,real Docker2 cycles,health15,gateway17,services17,lifecycle16,HTTPS/jobs4,application87,tools12,filesystem25,installed-security4,consumer8+37 and audits0. Original earlier failures remain failures and are not relabeled. [Ledger review](qualification-ledger-review.json), [manifest review](evidence-manifest-verification.json).

R1 independently executed `npm test` (217 passed,0 failures/skips), fresh development/production audits (0 findings), fresh pack/member checks and one defined real Docker negative probe. No stability campaign or failed-run retry was performed. [Independent command results](independent-command-results.json). Full integration suites were reviewed as existing raw evidence rather than unnecessarily rerun; further positive qualification stopped when R1-001 required disposition.

## 11. Exact-head hosted verification

Fresh GitHub check runs and the SonarCloud PR API both identify cd9b8322bd7eef3b4094710ec4ea26be94f08922. All10 required checks are successful:

| Check | Result | URL |
|---|---|---|
| SonarCloud Code Analysis | SUCCESS | [actual check](https://sonarcloud.io/dashboard?id=drumee_infra-layer&pullRequest=20) |
| CodeQL | SUCCESS | [actual check](https://github.com/drumee/infra-layer/runs/121646543466) |
| dependencies | SUCCESS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40344122590/job/121646373499) |
| contracts | SUCCESS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40344122590/job/121646373482) |
| packaging | SUCCESS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40344122590/job/121646373445) |
| eslint | SUCCESS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40344122590/job/121646373381) |
| unit | SUCCESS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40344122590/job/121646372996) |
| Analyze (actions) | SUCCESS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40344105236/job/121646321175) |
| Analyze (python) | SUCCESS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40344105236/job/121646321041) |
| Analyze (javascript-typescript) | SUCCESS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40344105236/job/121646320596) |

Sonar actual conditions are security A,reliability A,maintainability A,duplication0.6% within3%,hotspots reviewed100%,gate OK and ignoredConditions=false. All6 original issues are FIXED; current0 BUG/0 VULNERABILITY and49 CODE_SMELL are distinct categories. The numeric gate does not disprove R1-001. See [fresh hosted API evidence](independent-hosted-verification.json). Branch-protection requirements remain unverified after403 and must be checked by an authorized maintainer before any merge decision.

## 12. Findings

### R1-001 — MAJOR — undeclared additional network accepted

Location: lifecycle/docker.js:111–112; affected caller lifecycle/activation.js:120. The membership predicate validates the selected declared role but ignores all other runtime network keys. The ordinary container is still accepted if it also joins an undeclared differently owned network.

Defined one-shot hypothesis: nominal declared membership should succeed; adding an undeclared network should cause an isolation refusal or require an explicit documented exception. A fresh mission-owned namespace `drumee-r1-net-e54dab72db99` created two bridge networks and one non-root read-only/capability-dropped sleep container from the pinned Redis image. Both networks and the container had independent qualification ownership markers. The second network was created for the negative case with owner label external-network-fixture; no actual foreign object was modified.

Declared network: `drumee-r1-net-e54dab72db99-kernel`. Actual networks after the negative connection:

- `drumee-r1-net-e54dab72db99-external`
- `drumee-r1-net-e54dab72db99-kernel`

Observed: nominal ACCEPTED; extra-network case **ACCEPTED**, with no error from actual checkNetworks/readiness. All expected declared-network/owner/endpoint facts remained valid. Probe exit0 denotes completed measurement, not a passing security condition. `unexpectedAcceptance:true` records the failed negative criterion. Cleanup verified ownership before stopping/removing only created resources, and completed successfully. [Probe source](network-exposure-probe.cjs), [actual commands/state/cleanup](network-exposure-probe.json).

Impact: an unintended extra network path is invisible to this isolation guard. I did not attempt unauthenticated service access,exfiltration,or an exploit; the test process was a sleeping fixture. I do not claim that this gap was introduced by the ep-key correction: baseline source is already permissive. It is nevertheless an unresolved material limitation in the touched network-security assurance and must be corrected or explicitly dispositioned before merge authorization. It is not evidence about H1's cause.

Required disposition: validate the actual allowed network set for each declared service,with explicit lifecycle-aware handling for legitimate transitions/oneoffs; reject undeclared extra attachments without modifying foreign resources. Add corresponding fixture and real Docker negative coverage and requalify affected code/hosted head. Alternatively obtain an explicit documented security-contract disposition from the owner; R1 does not grant an exception. Existing tests exercise foreign containers inside owned networks,but not owned containers connected outside the declared network set.

Informational observations: (1) this is pre-existing permissiveness,not a proven regression; (2) the5s budget does not override per-command timeout; (3)28 legacy lint warnings/49 code smells remain under unchanged passing gates; (4) BRANCH_PROTECTION_UNVERIFIED and0 formal reviews mean green checks/clean mergeability are not merge authorization.

## 13. Residual limitations

SMTP_RECOVERY_UNQUALIFIED remains; Internet delivery/spool restoration are not qualified. H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED remains. The prior Debian H3 campaign remains failed. No downstream Debian realignment or new five-run campaign is complete. The independent network finding is not retroactively attributed to H1 or H3. A separately authorized release must use a new version and immutable artifact; alpha.3 must not be replaced.

## 14. Merge prerequisites

Do not merge under this review result. Resolve or explicitly technically disposition MAJOR R1-001. Any source correction requires a separate authorized implementation step and appropriate impact-based local/package/hosted requalification on its exact new head. Obtain the project owner's merge decision and verify actual branch protections/review requirements. Do not transfer this review to a changed head automatically. Publication,tags,images,production and Debian work require their separate authorizations.

## 15. Recommendation to the owner

Return **CHANGES_REQUESTED**. The reviewed patch has substantial verified strengths and all recorded hosted gates are green, but the independently demonstrated network-policy gap prevents recommending READY_FOR_MERGE_DECISION without correction or explicit technical disposition. The repository and PR head are left untouched; all review reports/evidence are outside the repository. [Machine-readable decision](IL-5.14-R1-decision.json).

Final source-freeze readback: head/base still match, PR remains open, working tree clean, and all review-created containers/networks are absent. No GitHub review or PR metadata update was submitted. [Final verification](final-source-freeze.json).
