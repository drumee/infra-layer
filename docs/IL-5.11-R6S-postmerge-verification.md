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
