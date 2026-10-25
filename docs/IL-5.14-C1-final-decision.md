# IL-5.14-C1-D1 current canonical decision

**FAILED_QUALIFICATION. CANONICAL_FIX_READY_FOR_REVIEW is not reached.** Assertion diagnostics and the captured functional defect are corrected; focused real Docker qualification passes. The remaining mandatory parent qualification stops at the canonical lint gate. No branch push, PR, publication, tag, merge or deployment occurred.

## Source and environment

Preserved checkpoint: `703b637425487286632e741045a1b96591e90c62`. Branch: `fix/il514-c1-network-attachment-identity`. Diagnostic source for the single instrumented reproduction: `62fbaec7e4a60a1f55ce5a61989e67fb79e1bcd6`. Functional correction and successful real Docker source: `eefc58803ad02823927c229ed2d49f91a5fb726f`. Final executable source: `d4be9edadc60cb70ea8d4236297dedd5052ccb0d`; subsequent commits contain documentation/evidence only. No unrelated working-tree changes existed or were overwritten.

Debian 12 amd64, normal UID/GID 1000:1000, Node 22.22.0, npm 11.18.0, Docker client/server 29.2.0, fixed socket unix:///var/run/docker.sock. Every command receipt preserves /etc/docker snapshots unchanged. [Execution ledger with exact commands, UTC timestamps, exit codes and hashes](evidence/IL-5.14-C1-D1/execution.jsonl), [evidence manifest](evidence/IL-5.14-C1-D1/files-sha256.json).

## Verified correction and impact

The original terminal catch printed ERR_ASSERTION and discarded message, actual/expected and stack. The test-only reporter now captures the first error before cleanup, handles non-enumerable Error fields and nested causes, bounds output, redacts secrets and retains failed process status. Controlled tests exercise the actual reporting path, not only a formatter. [Diagnostic forensics](IL-5.14-C1-D1-error-propagation-diagnostic.md), [contract](IL-5.14-C1-D1-diagnostic-contract.md), [13-test qualification](IL-5.14-C1-D1-diagnostic-regressions.md).

The single authorized reproduction fails with complete diagnostics at the unchanged foreign-resource assertion: expected NETWORK_OWNERSHIP_MISMATCH, actual DOCKER_LIFECYCLE_COMMAND_FAILED. A container without HEALTHCHECK lacks State.Health; the shared Docker template's `.State.Health` guard itself fails before ownership labels are read. Docker's stderr identifies the exact missing map key. Commit eefc588 uses `index .State "Health"` as the optional-field guard, retaining the existing unknown result and all ownership/refusal assertions. A real before/after control proves the old template fails and the new template preserves unknown plus ownership refusal. [Causal evidence and successful acceptance](IL-5.14-C1-D1-docker-reproduction.md).

The common inspection template affects inspectProject and checkNetworks, so services/lifecycle/application requalification is mandatory. Successful focused network acceptance is not substituted for those suites. Commit d4be9ed removes the existing --no-sandbox flag from the canonical gateway browser test and removes one unused import in the supplemental regression. This does not alter the successful network scenario or production source; the changed gateway launch has not yet been exercised and remains unqualified. No production dependency, public export, declaration or published artifact changed in D1.

## Mandatory lint blocker

`npm run lint` at d4be9ed, 2026-10-25T23:12:37.739016–23:12:39.736585 UTC, exit 1. Exact scanner result: **0 errors, 29 visible warnings, 65 baseline entries, 1 new finding**. The diagnostic is `lifecycle/activation.js:26:65`, no-unused-vars: `'_' is defined but never used.`

The baseline already contains the same message/rule/column at line 13. The network correction inserted readiness code above this catch, moving it to line 26. The scanner compares file/line/column as well as rule/message, so this pre-existing warning is now an unmatched entry. This explains the gate failure; it does not authorize relabeling it PASS or weakening the scanner. The baseline, rule configuration, file scope and command remain unchanged. [Complete mandatory output](evidence/IL-5.14-C1-D1/final-lint.log), [current/baseline machine inventory](evidence/IL-5.14-C1-D1/lint-diagnostic-inventory.json).

Actionable next prerequisite: resolve the unused catch binding directly under its existing interpreter/behavior contract, then explicitly resume canonical lint and the unexecuted parent suites. Do not add an ignore, suppress the warning or merely remove it from the analyzed scope. No correction or retry was made after the mandatory stop.

## Qualification matrix

| Gate/area | Status | Source, actual command/results and evidence |
|---|---|---|
| S1 dependency security | PASS, historical | e914db67 / ea22f46; Nodemailer 10.1.7, smtp-server 3.19.24 with nested Nodemailer 10.1.4; original full/production/fixture audits zero findings; 180 unit, 17 services, 87 application assertions; [S1 decision](IL-5.14-C1-S1-final-decision.md) |
| C1 original identity diagnosis | PASS | c218811 / ad3fd8c; original endpoint-as-container defect reproduced; network contract and correction preserved |
| D1-A diagnostic forensics | PASS | 703b637 baseline, historical raw log SHA retained; code-only terminal reporting loss established |
| D1-B diagnostic contract | PASS | 939fc5b through 62fbaec; explicit bounded, secret-safe Error/AssertionError reporting |
| D1-C harness correction | PASS | 62fbaec; same assertions, commands/order, status, cleanup and timeouts; actual-source AST comparison passes |
| D1-D diagnostic regressions | PASS | 62fbaec, `node --test test/unit/qualification-diagnostic.test.js`, exit 0, 13 tests; also included in final 206 unit tests |
| D1-E single reproduction | PASS for causal evidence | 62fbaec, original real scenario exit 1 intentionally retained, assertion and Docker stderr captured; one uncorrected attempt only |
| D1-F causal correction | PASS for implementation/focused proof | eefc588, `node test/network-attachments/container-health.cjs`, exit 0, 15 assertions, historical-template failure plus corrected behavior and refusal |
| D1-G network regressions | PASS | eefc588, `node --test test/unit/network-attachments.test.js`, exit 0, all 13 tests, no skips |
| D1-G real Docker | PASS | eefc588, `node test/network-attachments/real-docker.cjs`, exit 0, 2 complete independent cycles, 40 counted assertions plus direct startup checks, Redis recovery/refusal/cleanup PASS; explicit command records 240 |
| D1-H unit | PASS | d4be9ed, `npm test`, exit 0, 206 passed, zero failed/skipped; [log](evidence/IL-5.14-C1-D1/final-unit.log) |
| D1-H contracts | PASS | d4be9ed, `npm run test:contracts`, exit 0, 24 passed, zero failed/skipped; [log](evidence/IL-5.14-C1-D1/final-contracts.log) |
| D1-H canonical lint | FAIL | d4be9ed, `npm run lint`, exit 1, 0 errors/29 warnings/1 exact-baseline mismatch |
| D1-H services/gateway/full lifecycle/application | NOT_EXECUTED against final source | Mandatory stop; S1 real service/application passes do not qualify modified production inspection code |
| D1-H trusted-tools/security/filesystem checks | NOT_EXECUTED against final source | Full security qualification remains open; focused ownership and genuine Docker error controls passed but do not replace these suites |
| D1-H final dependency audits | NOT_EXECUTED | Historical S1 zero-finding audits retained; no current-date audit PASS claimed |
| D1-H package/consumer/types/candidate | NOT_EXECUTED | No corrected archive built, no new version selected or published |
| D1-H overall parent qualification | FAIL | Mandatory local lint gate fails and other required suites remain unexecuted |
| D1-I final decision | FAIL | Review-readiness requirements unmet; this evidence-based stopped decision is complete |
| Hosted CI | NOT_EXECUTED | No push/PR; no hosted PASS claim |
| Reviewable PR | NOT_EXECUTED | All required local gates must pass first |

## Artifact identities and remaining limits

Published alpha.3 remains immutable: source `c218811effc83da25cf71a914e27accc96101329`, 41 members, 101778 bytes, SHA256 `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`, SRI `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`. No tarball replacement or publication occurred.

Root package-lock SHA256 remains `29656a3b8e09e4cf640c9b5f5519d47b95bc960abbe5ce33639a93b3a7cd23f3`; installed dependency readback matches the qualified S1 5209-entry identity. Real Redis image: `redis@sha256:ff02b58f971e7d7d156a1267e283fcbbeee91773b6aa36c49dac28ecfe28eadf`, actual linux/amd64 image ID `sha256:5509c0097c6064aa8a3b1df58f1d950e67090fffa6678ae8f3f1dc2385f12deb`. No packaging input changed.

The successful bounded diagnostic trace reaches its 512-record cap during cycle 2; complete success stdout separately retains both cycle outcomes, identities, cleanup and 240 explicit harness commands. No complete unbounded command trace is claimed. The failed reproduction trace and focused causal trace are complete. Sandbox-less timing remains daemon-dependent; the deterministic source fixtures exercise the typed endpoint refusal, and the real runs qualify ordinary lifecycle behavior.

[Final readback](evidence/IL-5.14-C1-D1/final-readback.json) finds no remaining D1 network/health resources and confirms protected Docker configuration unchanged. Cleanup only removes independently marked mission-owned fixtures. Debian, Server Runtime and Oxy-form remain untouched.

Historical C1 ERR_ASSERTION evidence and the permanently failed Debian H3 campaign are preserved. The D1 causal condition is not equated with the separate H1 incident. **H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED** and **SMTP_RECOVERY_UNQUALIFIED** remain. Internet mail delivery or spool recovery is not qualified.

---

## Previous C1/S1 decisions (preserved verbatim)

# IL-5.14-C1 resumed decision evidence

**Overall FAILED_QUALIFICATION. Intermediate NODEMAILER_SECURITY_QUALIFIED remains valid.** No CANONICAL_FIX_READY_FOR_REVIEW status, push or PR is claimed.

S1 selects exact Nodemailer 10.1.7, smtp-server 3.19.24 and nested Nodemailer 10.1.4. Root lock SHA256 29656a3b8e09e4cf640c9b5f5519d47b95bc960abbe5ce33639a93b3a7cd23f3 remains unchanged throughout the subsequent network work. Clean/cached installations have identical 5, 209 entries; integrity rejection and all S1 audits/real mail contracts pass. [S1 decision and complete evidence](IL-5.14-C1-S1-final-decision.md).

The parent resumes at ea22f46840c4a15745c73a73bee0798a11828409. Original reproduction reconfirms the alpha.3 defect with exit 0. Implementation ad3fd8c7ef765f3718e6e06154b9fdd44786ed22 distinguishes object/attachment identities, retains unsettled endpoint metadata without authorizing it, validates container/network/endpoint relationships and uses bounded activation reconciliation. It preserves explicit owner/refusal/nonzero behavior by design. Real security/lifecycle qualification is still required; design intent is not substituted for it.

The 13 focused unit cases pass at ad3fd8c. The first real network attempt at de5e260ed69fd875d12e7782e8a7335879f239b7 fails with ERR_ASSERTION. No complete real cycle receives PASS and no retry occurs. Read-only forensics establish mission cleanup but not the exact assertion. [Failure and diagnostic limits](IL-5.14-C1-real-docker-failure.md).

| Gate/area | Status | Exact evidence, command and limits |
|---|---|---|
| S1-A baseline |PASS |e13777f; original full audit reproduced1, two moderate entries/three advisories; root/fixture/transitive roles established |
| S1-B version |PASS |9e8eb7c; official10.1.7/3.19.24/10.1.4 metadata and bounded change review |
| S1-C locked installation/integrity |PASS |e914db67; root/fixture npm ci0, two clean prefixes and npm ls0, original archive installs0, bad expected integrity rejected EINTEGRITY1; exact identity in S1 ledger |
| S1-D audits |PASS |e914db67;`npm audit --include=dev --json --registry=https://registry.npmjs.org` and `--omit=dev`, plus independent fixture audit, all0/zero entries at 2026-10-25T15:58:06 UTC |
| S1-E mail |PASS |e914db67; 4 focused tests/180 unit tests/17 real services/11 application groups / 87 assertions, all0/no skips. Exact commands/env/UTC receipts in [S1 ledger](evidence/IL-5.14-C1-S1/execution.jsonl) |
| S1-F security unblock |PASS |ea22f46 report commit; dependency graph unchanged by network work; NODEMAILER_SECURITY_QUALIFIED |
| C1 baseline/reproduction |PASS |c218811 original/current alpha.3 type confusion established; reproduction reconfirmed at ea22f46 using historical source, exit 0 |
| C1 corrected contract |PASS for design |ad3fd8c; explicit object types, pending refusal, required-existence option, bounded metadata wait, error categories. [Contract](IL-5.14-C1-network-identity-contract.md) |
| C1 implementation qualification |BLOCKED |Local production correction exists at ad3fd8c, but required real acceptance fails; no qualified-completion claim |
| C1 focused unit regressions |PASS |ad3fd8c;`node --test test/unit/network-attachments.test.js`, exit 0, 13 tests, 0 skipped; unit-level only |
| C1 real Docker |FAIL |de5e260;`node test/network-attachments/real-docker.cjs`, 2026-10-25T16:10:52.652127–16:11:08.799625 UTC, exit 1/ERR_ASSERTION; total real assertion count NOT_RECORDED |
| C1 remaining real cases/repetition |NOT_EXECUTED to completion |First namespace reaches unauthorized-ownership fixture before failure; second cycle not started; no full lifecycle/refusal PASS |
| C1 full affected suites |NOT_EXECUTED after stop |No post-correction full unit/contracts/gateway/services/lifecycle/application/trusted-tools/package/lint PASS claimed; S1 results do not qualify altered network code |
| C1 package/consumer/types |NOT_EXECUTED |No unpublished corrected package/version selected, built or installed. [Disposition](IL-5.14-C1-package-candidate.md) |
| C1 final security/CI |NOT_EXECUTED after stop |Dependency graph retains S1 identity, but requested final audits and security/local CI review are not run after mandatory real failure |
| C1 review-ready decision |FAIL |Mandatory real acceptance unmet; remaining gates not executed, no reviewable PR |
| Hosted CI |NOT_EXECUTED |Branch not pushed; no PR or hosted result |

Environment:Debian 12 amd64, UID/GID 1000:1000, Node 22.22.0/npm 11.18.0, Docker 29.2.0. Redis image is pinned at redis@sha256:ff02b58f971e7d7d156a1267e283fcbbeee91773b6aa36c49dac28ecfe28eadf. Protected /etc/docker snapshots match. The failed namespace's containers, network and directory are absent in readback. No foreign resource or protected host configuration was modified; the intruder was a mission-owned negative fixture with an independent ownership marker.

Exact source-file hashes, failed/unmodified stderr, 75 daemon events, readback and command ledger are archived in [network evidence](evidence/IL-5.14-C1-network/files-sha256.json). The real harness failed to persist useful assertion details; this is disclosed rather than replaced with a guessed cause. A later read-only removed-container query is explicitly diagnostic, not a retry or PASS.

Published alpha.3 remains immutable:source c218811effc83da25cf71a914e27accc96101329, 41 members, 101778 bytes, SHA256 c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e, SRI sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==. No published tarball, Debian, Server Runtime or Oxy-form source is edited. Local source/manifests on this correction branch are an unpublished candidate only.

H3 remains permanently failed; no Debian H4 resumption or five-run campaign occurs. **H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED** and **SMTP_RECOVERY_UNQUALIFIED** remain. No Internet delivery or full SMTP recovery proof is claimed.

Required next prerequisite is preserved assertion/phase/state diagnostics for the real harness, followed by an explicitly resumed controlled qualification. Do not change the refusal assertion or restart until success. No publication, tag, merge, deployment, push or PR occurs in this stopped run.

---

## Original pre-S1 final decision (preserved verbatim)

# IL-5.14-C1 final decision

**BLOCKED_SECURITY. CANONICAL_FIX_READY_FOR_REVIEW is not reached.** The original network attachment defect is deterministically reproduced, but the repository's mandatory development-dependency audit exits1 before any production correction. The mission requires stopping on a mandatory security-check failure. No security exception, scanner change, dependency workaround or subsequent integration run is introduced.

## Source, reproduction and scope

The clean canonical checkout and fetched integration target origin/main are c218811effc83da25cf71a914e27accc96101329. Dedicated branch: fix/il514-c1-network-attachment-identity. Reproduction/evidence commit:3da56c9. Subsequent commits contain documentation/evidence only. Runtime environment:UID/GID 1000:1000, Node 22.22.0/npm 11.18.0. [Baseline](evidence/IL-5.14-C1/baseline.json), [command results, fixture hashes and evidence timestamps](evidence/IL-5.14-C1/execution.json).

The current and historical canonical lifecycle/docker.js SHA256 is c2e56482823bb6f69754ebd48fa4cdc609c609f0db58e6537bf9ef6b3e86d445. Its checkNetworks function blindly treats every network attachment key as a container identity. The fixture contains one container-backed and one sandbox-less endpoint attachment with realistic endpoint metadata derived from the pinned Moby producer. The original implementation attempts the invalid endpoint-key inspection and propagates the simulated Docker status 1 as DOCKER_LIFECYCLE_COMMAND_FAILED. This is an original-defect reproduction, not a successful fix or real lifecycle qualification.

## Mandatory security failure

The unmodified .github/workflows/quality.yml dependencies job runs both `npm audit --omit=dev` and `npm audit --include=dev`, with no severity reduction or allowed failure. This mission ran the latter with JSON output and the explicit official registry:

```sh
npm audit --include=dev --json --registry=https://registry.npmjs.org
```

Exit1; 2 moderate package entries, 0 high, 0 critical. Installed nodemailer 10.1.1 is affected by **three distinct advisories**; smtp-server 3.19.22 contributes the propagated dependency entry rather than a fourth underlying advisory. Both are direct development dependencies; the package has no declared production dependencies. [Complete original machine report](evidence/IL-5.14-C1/baseline-audit.json).

| Advisory | Severity and affected range | Finding |
|---|---|---|
| [GHSA-8c8m-p3m8-cjg8](https://github.com/advisories/GHSA-8c8m-p3m8-cjg8) |Moderate, CVSS 6.5; nodemailer>=3.0.0 <10.1.4 |Nested address comments can alter interpreted recipients |
| [GHSA-m943-m63m-w62w](https://github.com/advisories/GHSA-m943-m63m-w62w) |Moderate, CVSS 6.5; same range |A quoted/comment semicolon can alter address-group parsing |
| [GHSA-85x2-q946-cp5h](https://github.com/advisories/GHSA-85x2-q946-cp5h) |Moderate, CVSS 6.5; same range |An angle bracket inside a quoted local part can alter recipient interpretation |

Official advisory metadata reviewed 2026-10-25 identifies nodemailer 10.1.4 as patched. The raw npm report suggests smtp-server 3.21.1 as a resolution option. Neither is installed or qualified here; updating only a direct pin without checking the consuming graph would not demonstrate remediation. No audit fix --force, override, suppression or threshold change is used. The moderate severity and development scope are stated accurately; the blocker is failure of the existing mandatory CI policy, not an invented high/critical production exposure.

## Qualification matrix

| Gate | Status | Source, command, exit/count and evidence |
|---|---|---|
| A canonical baseline |PASS |Source c218811; current/default/integration main verified; function, callers, exports, declarations, security and actual suite commands inspected. [Baseline](IL-5.14-C1-source-baseline.md) |
| B original defect |PASS |Historical source c218811 plus hashed fixture;`node test/network-attachments/reproduce-alpha3.cjs`, exit 0, two assertions, controlled Docker status 1 expected. [Machine result](evidence/IL-5.14-C1/original-reproduction.json) |
| C corrective identity semantics |NOT_EXECUTED to qualification |Required distinctions documented, but no semantics selected/qualified after stop. [Contract disposition](IL-5.14-C1-network-identity-contract.md) |
| D implementation |NOT_EXECUTED |Production files, public API, exports, declarations and dependency locks unchanged |
| E focused corrective regressions |NOT_EXECUTED |All 12 categories remain required; original reproduction is not corrective coverage. [Disposition](IL-5.14-C1-regression-tests.md) |
| F real Docker lifecycle |NOT_EXECUTED |No resource creation, Redis/restart/detachment/cleanup or repeated lifecycle execution |
| G relevant Infra suites |NOT_EXECUTED |No full npm test/contracts/integration/application/security/lint suite after the mandatory failure |
| H package candidate |NOT_EXECUTED |No pack, consumer check, version selection, publication or tag. [Disposition](IL-5.14-C1-package-candidate.md) |
| I security/local CI |FAIL |`npm audit --include=dev --json --registry=https://registry.npmjs.org`, exit 1; 2 moderate package entries / 3 advisories, 0 high/critical; remaining checks NOT_EXECUTED |
| J final review decision |BLOCKED |This blocked report does not qualify an unimplemented correction or authorize a PR |
| Hosted CI |NOT_EXECUTED |No push/PR; no hosted result or PASS claim |

`npm ci --ignore-scripts --no-audit --no-fund` exits0 before the audit. The explicit installation flag does not disable the security gate:the separate canonical audit was executed and its failure preserved. No repeated audit is used to hide the result. Output-file UTC mtimes are retained as evidence timestamps; command start times are not fabricated.

## Immutable artifact and downstream reservation

Published **@drumee/infra-layer@0.1.0-alpha.3** remains immutable:source c218811effc83da25cf71a914e27accc96101329, 41 members, 101778 compressed bytes, SHA256 `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`, SRI `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`. No archive was overwritten and no new package candidate or production dependency was introduced.

Debian was not modified. Its H3 campaign remains permanently failed:run1 six paths/556 assertions PASS, run2 real invalid-object Docker inspection FAIL, runs3–5 NOT_EXECUTED. H2's diagnostic success is historical and is not a fix. **H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED** remains; this reproduction does not establish H1's lost underlying command. SMTP_RECOVERY_UNQUALIFIED remains a downstream limitation.

No Server Runtime, Oxy-form, foreign Docker resource, protected Docker configuration, ownership assertion, trusted executable rule or production host is modified. No source correction, PR, push, merge, npm/image publication, tag or deployment occurs.

Required continuation:resolve the failed development graph under the existing audit policy and qualify its compatibility, then resume the canonical network identity correction from the preserved reproduction. Real Docker/lifecycle, full regression, package/API/type/consumer and security qualification remain mandatory before any review-ready status. A corrected published artifact and Debian realignment/requalification require their separate later decisions; this mission does not start Debian H4.
