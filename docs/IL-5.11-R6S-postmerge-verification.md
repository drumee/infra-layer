# IL-5.11-R6S final integrated verification

**MERGED_AND_RELEASE_CANDIDATE_VERIFIED** for canonical main `09170b9e435b5f9bf564237b9fcae080b56fc932`. This status qualifies the maintenance integration and unchanged experimental alpha.3 candidate. It does not authorize npm publication, release tags, image publication or production deployment.

## Canonical revisions and integration

| Reference | Exact revision |
|---|---|
| PR #17 reviewed HEAD | 029e719feecc6053e6e2251adb6e9b4e4757e008 |
| PR #17 merge | 75ac104ddce8700b406ba839cfe1b8bfe6d6f477 |
| PR #16 reviewed HEAD | 4777137b12cef25a1b4db6f7be265f327b830650 |
| PR #16 merge / final canonical main | 09170b9e435b5f9bf564237b9fcae080b56fc932 |
| Final Git tree | 53be7ab7a57d12188dd604893eb60166d94104e3 |

GitHub confirmed both PRs merged through the normal merge endpoint with an exact expected HEAD. The final merge parents are75ac104ddce8700b406ba839cfe1b8bfe6d6f477 and4777137b12cef25a1b4db6f7be265f327b830650. Its tree equals the reviewed PR #16 tree. GitHub reports valid merge-commit verification. The permanent repository-wide English documentation policy is present in root AGENTS.md. No public contract, npm member, production dependency or external canonical repository was modified.

Before the PR #16 merge, main remained75ac104, the PR was conflict-free, branch metadata reported protected=false with required checks off, applicable rulesets were empty, and normal merge commits were enabled. The GitHub connector reported repository push/admin capability, but its detailed classic protection read remained HTTP403 (integration permission limit). No bypass option, administrative rule change or alternative merge strategy was used. The normal merge succeeded and was read back from GitHub.

## Preserved failure and corrective replay

The earlier fea6e0f hosted run failed one newly introduced generic stdout test because it assumed /usr/bin/node. That failure is preserved below and in the original raw evidence. Owner-authorized e8ac692dd70160736d35cbe227cab37378a55477 changes only three generic probes to the active Python interpreter. It changes no helper execution policy, timeout, security assertion, application behavior or distributed member. The following local and hosted passes are new observations; they do not rewrite the earlier failure.

## Newly executed post-merge qualification

A new clean clone `/tmp/il511-final-main` selected the exact final commit. Host operator UID/GID1000:1000; Debian/Linux, Python3, Node22.22, npm11.18, rootful Docker29.2, pinned nonprivileged fixture image. The runner receipts include dates, exact argument arrays, source, UID/GID/groups, elapsed time, exit code and complete local journal SHA256. Private output roots were unique and exclusive; no historical directory was reused as output.

| Execution | Command / result | Date UTC | Complete journal SHA256 |
|---|---|---|---|
| Negative and maintenance tests | python3 -B -m unittest discover -s test/security -p '*_test.py' -v;25methods PASS, zero failures/skips | 2026-10-22T11:49:29.284613+00:00 | 632a0d52664ca26788a478ab38426469af709c4ba98f711bd49edf282c67258d |
| Complete verifier | python3 -B docs/evidence/IL-5.11-release-review/verify.py --source /tmp/il511-final-main; nine commands and canonical artifact helper PASS | 2026-10-22T11:59:53.394693+00:00 | 20d2ec15626629ec19af6afd4926539215a1b6af32bce88d987f31e29112c1d9 |
| Source archive | python3 -B docs/evidence/IL-5.11-release-review/source-archive.py --source /tmp/il511-final-main; HTTP200, all642Git blobs verified | 2026-10-22T11:59:56.053313+00:00 | 2793961c36684822de78bd2e48db655275896c869e980c6488e0978fffbfab1e |

Each command above was wrapped by the committed run-proof.py with the explicit clean source and a distinct run name; exact command argument arrays are in the receipts. The verifier requires and validates IL5_TSC and IL5_APP_IMAGE inputs, but the historical wrapper receipt does not record their environment values. Its command, source, timing, result and log hash are preserved; it is not a complete environment snapshot. It newly executed npm ci, npm test (176/176), test:contracts (24/24 included in176), test:system-tools (12scenarios), test:package, lint (zero errors,29historical warnings), both audits (zero known vulnerabilities) and the installed consumer (8+37assertions and strict types). All returned zero. Fresh package builds and source/archive hashes are independent measurements.

The25Python methods comprise the original11scenarios/86explicit assertions, five maintenance methods and nine PR16-specific methods. The86are not a count of the full extended suite. Tests cover actual writers, symlinks, preexisting roots, excessive modes, FIFO, concurrent creation/substitution boundaries, retained cleanup, real Git archive content/types/paths and unchanged sentinels. Foreign UID65532 was established with a direct fixture mount and only CAP_CHOWN; stat/list/read preconditions succeeded and the helper itself returned UNTRUSTED_OWNER. No privileged container, mock ownership refusal or kernel EACCES was counted as D4 success.

Gateway17/17, Services17/17 plus the predefined3x17/17campaign, Lifecycle16/16 and application87assertions were **not newly rerun** by this maintenance verifier. Their earlier D2 evidence is reused after independent comparison: all41distributed members, package metadata/lockfile and affected application/services/lifecycle/gateway harness inputs are unchanged since dbc0be5c20029374c68bdf510dfadd7da079fcf6. Original SMTP uncertainty remains accepted, not causally resolved.

## npm and source identities

Two newly built tarballs at final main are byte-identical:41regular members,101778compressedbytes. Every member equals selected source bytes and the qualified D2 member map. Exports, public typings, lockfile, publication metadata/scripts and production dependencies are unchanged; there are no production dependencies or prepublication hooks. Independent archive inspection found no private-key or known npm/GitHub-token signatures. This bounded check and exact reviewed member allowlist do not prove absence of arbitrary unknown secrets.

- npm SHA256: c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e.
- npm SRI: sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==.
- Separate GitHub source archive: 996226bytes,642Git blobs; SHA256 db9067052f1f92ecb2dc059c27d00683f865f689c10a78adfe209d2edab5cb73.
- Separate source SRI: sha512-IIU5Qzlp7UFUmCbheScLl5VE/dkonJTBz/cuyfiDIN3ldO64ZnT7+NwAH1jifdSvdbzPqOzRBQ1jslxPhlWRBw==.

The source archive is downloaded from the exact commit URL, verified against all selected Git blobs byte for byte without filesystem extraction, and retained privately. Its bytes differ from the PR HEAD archive even though the Git trees match. Git commit, Git tree, source archive, npm archive and distributed file identities remain separate.

## Exact-source GitHub results and limitations

[PR #16 Quality39764624430](https://github.com/drumee/infra-layer/actions/runs/39764624430) passed all five jobs at4777137. Its packaging log confirms25Python methods, the original86assertions, real foreign UID65532 and zero skips. CodeQL39764617680 JS/TS, Python, Actions and PR result passed. SonarCloud remained FAILURE with ten individually reviewed annotations.

At the actual integrated commit, [Quality39768113212](https://github.com/drumee/infra-layer/actions/runs/39768113212) passes all five jobs. Packaging again executes25Python methods successfully on hosted UID1001 with fixtureUID65532. [CodeQL39768112702](https://github.com/drumee/infra-layer/actions/runs/39768112702) succeeds for JS/TS, Python and Actions. Logs confirm94/94JavaScript,2/2TypeScript,16/16Python and1/1Actions files scanned; SARIF uploads succeeded and processing completed. These observations establish analysis execution/publication, not an empty global alert inventory. A separate PR-style aggregate result is not invented for main where no such check is listed.

SonarCloud main analysis b236fb75-17ce-48af-bc40-24953f2881fa explicitly identifies final commit09170b9e. Its actual check is FAILURE;246OPEN/CONFIRMED/REOPENED findings are returned. The ten findings on PR16-relevant paths have individual main-key dispositions in the exported matrix: seven public source fingerprints independently recalculated, one Git-format SHA1 context with separate exact-content verification, and two style observations. The eight inherited prior-head findings and two new receipt copies were all reviewed before merging. No administrative closure or global acceptance of246findings is claimed; earlier R6S dispositions remain separate.

Fresh GitHub CLI reads identify somanos and return HTTP403 Resource not accessible by personal access token for Code Scanning, Dependabot and Secret Scanning inventories. The connector independently rejects those endpoint families with400allowlist errors. CI output and scoped source review are accessible, but global inventories remain unavailable and must not be described as empty. No permission or scanning policy was changed.

## Publication access and residual boundaries

At2026-10-22T12:04UTC, fresh read-only npm checks succeed: account somanos, package read-write capability and account2FA auth-and-writes verified. alpha.3 remains absent, next=alpha.2 and latest=alpha.1. Earlier HTTP401 results are retained as historical observations; no login/token/ACL change was performed by this mission, and no reason for the session change is invented. Local OIDC is unavailable; no registry provenance attestation is claimed. Actual publication still requires a distinct owner decision, refreshed permissions and2FA at publication time.

SMTP residual uncertainty remains accepted only for experimental alpha.3. Unknown original cause, no Internet delivery guarantee, no spool restoration and SMTP_RECOVERY_UNQUALIFIED remain. Evidence guarantees exclude root, compromised same UID/tools and hostile filesystems. Debian remains locked at aa9057f224f4ae5cf80d777e3cb2fad092193fb1; Runtime/Oxy-form unchanged and D0 not started.

[Complete exported evidence manifest](evidence/IL-5.11-R6S-Review-Final/manifest-final.json), [individual main Sonar dispositions](evidence/IL-5.11-R6S-Review-Final/sonar-main-individual-dispositions.json), [current npm access summary](evidence/IL-5.11-R6S-Review-Final/npm-access-summary.json), and [publication handoff](IL-5.11-alpha3-publication-handoff.md) provide source/commands/dates/results/fingerprints and limits. Large CodeQL logs and binary archives are retained in identified private roots, with hashes and public job URLs instead of unnecessary duplication.

This final report is delivered on the existing separate documentation branch, converged by merging the final integrated main without rewriting history. It is not pushed directly to main, and its documentation PR is not automatically merged.

---

## Historical stop snapshot — superseded by the final verification above

The following text is the preserved pre-correction report. Its present-tense status statements describe that earlier stop, not the current canonical state.

# IL-5.11-R6S integration verification and qualification stop

**FAILED_QUALIFICATION.** PR #17 is merged and verified. PR #16 is not merged because its hosted qualification failed. The target MERGED_AND_RELEASE_CANDIDATE_VERIFIED is not achieved. This documentation-only branch is based on the actual integrated main; it does not change main or retry the failing utility test.

## Canonical source and completed integration

Canonical main remains `75ac104ddce8700b406ba839cfe1b8bfe6d6f477`, tree `6b376a079337f1bc5f43cf4a6562b86bc34ea9a2`, parents `a02b76e4c421e96e63406d7b10edc2b76a6056c1` and `029e719feecc6053e6e2251adb6e9b4e4757e008`. GitHub confirmed PR #17 merged using the normal merge endpoint with the expected head; no policy or bypass option was changed. The integrated tree contains the R6S output controls, repository-local utility imports and permanent root AGENTS.md language policy.

Review additionally corrected machine-specific diagnostic imports and added five focused maintenance regressions. The integrated main passed16methods, including the original11scenarios/86explicitassertions. Two new tarballs built at the actual merge SHA matched41members/101778compressedbytes and the unchanged candidate SHA256/SRI. Quality39746297796 passed all five jobs at that exact source. Native JS/TS and Actions analyses passed; an additional dynamic CodeQL39746318757 scanned12Pythonfiles and succeeded. No scanning configuration was changed by this mission. Successful analyses do not imply an empty global alert inventory.

## PR #16 convergence and local evidence

PR #16's original documentation branch merged the new main without conflicts or rewriting history. It now contains explicit private outputs, shared R6S input/output controls, independent regression tests, the complete verifier and streamed source-archive validation with exact Git-content comparison. Historical JSON/logs were preserved; affected reports distinguish old status labels from current results. New technical content and the publication handoff are English.

Sources3740b38 and4da3bf3 passed25local test methods without skips: the original11/86, five maintenance methods and nine PR16-specific methods. The complete verifier executed nine real commands; unit176, contracts24, PATH/tool scenarios12, package audit, lint, both dependency audits and installed consumer8+37/strict types passed. These local successes are retained and do not override the subsequent hosted failure. Heavy application/Gateway/Services/Lifecycle runs were not newly executed by this verifier; earlier acceptance was reused only under unchanged executable inputs.

At pushed PR #16 head `fea6e0f461c1969addfe504feb12f33fdd0701b4`, two new packages again matched the reference. Its own GitHub source archive was downloaded and verified against611Git blobs. The receipt records source SHA256 `ae3d9e6ca8f57d7387bc217f98ec068013eb30af02acfd4c8472a64d453a783c` and source SRI `sha512-7EXLBs/cC8zRhrb4/sHDN0LIVA31HbGx0toBMdu/M9odXP8glEQkuZ4AOA7nKl142414O0riQXYIs2pFvcIVEw==`. This is not canonical main and is not npm SRI.

## Hosted qualification failure

[Quality39753661585, packaging job119740147424](https://github.com/drumee/infra-layer/actions/runs/39753661585/job/119740147424) evaluated the exact headfea6e0f. npm run test:package itself passed and reported the expected41members/SRI. The following Python test step ran25methods:24passed, one ERROR, zero skips.

The failure is `test_verifier_records_real_command_results_and_original_log_hashes`, test/security/release_utilities_test.py:188–189. Its generic stdout probe explicitly invokes `/usr/bin/node`. The hosted runner has no file at that path; its configured Node toolchain is under `/opt/hostedtoolcache/node/22.22.0/x64`. subprocess raises **FileNotFoundError [Errno2]** before launching the probe or asserting its result/log hash. The job's earlier prepare-hosted-node output identifies the actual hosted toolchain. D4 and the new foreign-UID checks passed on the same runner with UID1001 versus fixtureUID65532, so this is not a repeat of the earlier D4 ownership-preparation failure.

This is a portability defect in the newly added test. It is not counted as a passing refusal, suppressed, skipped or retried. No code fix or workflow rerun was performed after the stop. A narrow future correction is to use the selected Python interpreter for this language-independent stdout probe, or an explicitly validated approved Node path if the test is meant to depend on Node. Keep production/system-tool security contracts intact. Then qualify the25methods locally and on the hosted runner, refresh package identity, and resume PR #16 integration only after all gates pass.

[Exact decoded job log, SHA256 and normalized failure metadata](evidence/IL-5.11-R6S-Review-Stop/packaging-failure/failure.json) and [raw retained text](evidence/IL-5.11-R6S-Review-Stop/packaging-failure/packaging-job.txt) are preserved. Source/environment/command/outcome and private-output export hashes are recorded in [the stop receipt](evidence/IL-5.11-R6S-Review-Stop/stop.json). No foreign resource was deleted or sentinel modification reported.

## Scanner and publication state

PR #16's other four Quality jobs and CodeQL JS/TS, Python, Actions and result checks passed. **Packaging remains FAILURE**. **SonarCloud remains FAILURE**, eight annotations on this head; its final individual review was not completed after the mandatory qualification stop. Earlier29/20-issue dispositions must not be presented as a review of these eight. No alert was closed and no rule/check weakened. Global Security inventory HTTP403 limitations remain; inaccessible inventories are not empty.

Read-only npm checks on2026-10-22 still show alpha.3 absent, next=alpha.2 and latest=alpha.1. Authenticated whoami/ACL/profile checks now returnHTTP401. Current publisher identity, write permission and2FA cannot be verified; the older somanos/read-write/auth-and-writes observation is historical. Publication is separately **BLOCKED_RELEASE_PERMISSIONS**, and no login, token/ACL change, OTP collection or npm write was attempted.

The npm candidate remains41files/101778bytes, SHA256 `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`, SRI `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`, independently measured before the stop. Exports, typings, lockfile, metadata and production dependencies remain unchanged. No final verification of both integrated PRs is claimed because PR #16 remains open.

SMTP uncertainty remains explicitly accepted for experimental alpha.3 only, with unknown original cause, Internet delivery unqualified and SMTP_RECOVERY_UNQUALIFIED. No npm publication, release tag, image publication, production operation, Debian/Runtime/Oxy-form change or OxymotionD0 occurred. Debian remains locked to aa9057f224f4ae5cf80d777e3cb2fad092193fb1.
