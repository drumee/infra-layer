# IL-5.14-CQ-02 baseline and corrective scope

Recorded 2026-11-04. Resume checkpoint and **CQ02_FINAL_CANDIDATE_SHA: `5df139e952ce9ce6d8cedfc86367c9c24dd9b402`**. No executable, fixture, manifest or lockfile correction is made: no supported compatible dependency fix or isolated campaign boundary has been established. Later reporting commits do not change this candidate's package inputs.

## Verified starting point

Branch `fix/il514-c1-network-attachment-identity`; initial working tree clean; checkpoint ancestry verified. The current open [PR #20](https://github.com/drumee/infra-layer/pull/20) head also equals this checkpoint, base `main` at `c218811effc83da25cf71a914e27accc96101329`. Compared with CQ-01's remote readback, the remote has advanced from `5bb733b…` to the CQ-01 reporting checkpoint; CQ-02 performs no push. [PR metadata](evidence/IL-5.14-CQ-02/pr-start.json).

The three CQ-01 reports were read. All 191 non-documentation source hashes still match CQ-01's executable `5bb733b7f709547f928f87edf9a37fd7f31fe4be`. [Source identity](evidence/IL-5.14-CQ-02/source-identity.json) records the full inventory and 128 installed package versions checked against the canonical lock.

| Input | SHA256 |
|---|---|
| `package.json` | `3c38023367e7189a9dbf380ef9ae7488e3b92266327362b64eca0dd6708d26dd` |
| `package-lock.json` | `29656a3b8e09e4cf640c9b5f5519d47b95bc960abbe5ce33639a93b3a7cd23f3` |

Potential corrective scope was limited to these manifest/lock inputs, foreign-UID setup in `test/security/evidence_helpers_test.py`, and campaign configuration if an isolated environment became available. No verified production defect supports a production edit. No test or acceptance criterion is changed.

## Dependency diagnosis and correction decision

**DEPENDENCY_REMEDIATION_BLOCKED_COMPATIBILITY.** Current [registry metadata](evidence/IL-5.14-CQ-02/registry-metadata.json), freshly installed graph and audit agree: minimatch 10.2.6 is the installed version and newest published major-10 release. Installed ESLint 10.13.0 requires `^10.2.5`; installed/latest `@eslint/config-array` 0.23.5 requires `^10.2.4`. Current latest stable ESLint 10.14.0 still requires `^10.2.6`, so that compatible parent update does not remediate the finding. The parent ranges exclude major 11; lock resolution within those ranges cannot select its patch.

[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) covers versions below 11.0.1 and identifies aggressive glob preprocessing at optimization level 2 or greater as the vulnerable condition. Current latest minimatch is 11.0.4. The first patched release, 11.0.1, supports CommonJS, but that alone does not establish compatibility with both parents' required matching behavior. Their current releases do not declare support for major 11.

The repository's lint parents construct matchers with ordinary options and do not enable aggressive preprocessing. A bounded observation of the actual lint invocation saw 19 preprocessing calls, all at level 1, and zero first-phase calls. This is exposure evidence for that invocation, not proof about every caller or an audit waiver. The public npm artifact has no production dependencies and no minimatch files.

Correction paths considered in order: compatible upstream update (latest ESLint still affected); compatible transitive update (no patched major-10 release); maintained parent release (latest config-array still constrains major 10); narrow dependency adjustment (cross-major substitution lacks established parent compatibility). No speculative override, downgrade, vendored dependency or audit-policy change is implemented. The smallest supported upstream remedies would be a maintained security backport in major 10 or parent releases explicitly adopting a patched major with compatibility validation. Availability of either is not assumed. The required development audit remains failed; no residual risk is accepted.

## Environment prerequisites

The local default daemon remains shared: host `asohka`, daemon `f8cee57d-3923-46b6-8d55-6cd6490ec1db`, 35 containers, 21 networks and 682 volumes. No local campaign is run.

The owner subsequently identified `debian@oxymot.fr` as nonproduction and authorized access. Read-only SSH inspection succeeds. Its distinct daemon `b9c382a6-6e0e-458c-8690-4e4797190106` on `vps-c5f4cd75` runs Docker 29.9.2 / Compose 5.6.1. However, it contains two active unrelated `oxymot-blog` containers (Ghost/MySQL), five networks and twelve volumes. Direct debian Docker access is denied; passwordless sudo permits inspection. Socket ownership/mode remains `root:docker 0660`, unchanged. [Remote summary](evidence/IL-5.14-CQ-02/remote-environment-summary.json), [raw inventory](evidence/IL-5.14-CQ-02/remote-sudo-inventory.stdout).

**DOCKER_ISOLATION_NOT_ESTABLISHED.** Nonproduction status and separation from the local historical daemon are established; an enforceable boundary protecting the remote unrelated application is not. No shared daemon mutation, socket permission change, source upload, fixture creation or infrastructure reconfiguration occurs. In response to the isolation clarification, the owner explicitly protects the dedicated blog container and states its intended future use of Infra Layer as an SMTP relay. No dedicated qualification daemon or existing isolation mechanism is identified. The blog, its database and associated resources remain protected; its future relay use does not qualify present SMTP behavior or waive the mission's isolation requirement.

**APPLICATION_ENVIRONMENT_NOT_READY.** No explicit network client/LAN configuration is supplied. The three application variables are absent locally and remotely. The VPS does have `/usr/sbin/nginx` 1.26.3; availability of that binary does not prove the independent-client route or full application prerequisites. Existing nginx configuration is not read or modified. Historical `testbox`/LAN values in [canonical qualification documentation](IL-5-qualification.md) are examples, not current readiness proof.

## Impact-based qualification scope

Fresh CQ-02 checks cover clean canonical installation, installed graph/lock consistency, both audits, lint, unit/contracts, package closure, retained archive and installed consumer. CQ-01's unchanged 63 comparator/ownership tests and fatal negative control remain supporting evidence; no unnecessary rerun or TAP investigation is performed. R5 recovery evidence retains its unchanged implementation scope.

Filesystem security, the real Docker campaign and canonical application acceptance require Gate C. Their current status is **NOT_EXECUTED**, not passing and not a newly observed functional failure. Historical CQ-01's 22 passing tests and three setup errors remain preserved. Live mount reconciliation has not been demonstrated; `V1-F1-REC-001_OPEN` remains.

The [evidence](IL-5.14-CQ-02-evidence.md) and [final decision](IL-5.14-CQ-02-final-decision.md) separate failed audits, unexecuted gates and applicable historical support. H01–H04, historical application mismatch, Postfix incident-specific uncertainty, SMTP recovery, H1 causality and Debian H3 limitations remain unchanged.
