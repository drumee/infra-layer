# IL-5.12-A final verification and publication readiness

**FINAL_DOCUMENTATION_MERGED_AND_RELEASE_CANDIDATE_VERIFIED** at canonical main **c218811effc83da25cf71a914e27accc96101329**. Publication status: **NOT_AUTHORIZED**.

## Integration and review outcome

PR #19 was independently reviewed at initial HEAD f8e738c5ca7d1ec3a5ece1cd61e97bb090884082 and final HEAD 023a0f7011d1f16a2d4bf6599227725b22e99755. The original 37 files and final 44 files contain documentation, qualification reports, logs and provenance data only. No runtime/API, qualified helper, test, CI/configuration, lockfile, dependency or npm member changed. Existing reports required no correction; only the English final review and new review evidence were added. Existing machine evidence, historical failures and auxiliary incident records remain byte-identical.

GitHub confirmed normal merge of PR #19 as c218811effc83da25cf71a914e27accc96101329. Parents are efc8ca2639f31793124459f28b9979235e28b023 and 023a0f7011d1f16a2d4bf6599227725b22e99755. Tree **a67e5fc553db4d22b8ef55f9ed45fe556ac2f1e9** equals the exact reviewed HEAD tree; GitHub reports valid commit verification. Root AGENTS.md and its permanent English documentation policy remain unchanged. No old helper replaced a qualified version.

Before merging, main and PR HEAD were refreshed, ordinary merge permission was verified, review submissions/threads showed no blocker, and required-check enforcement was not bypassed. Main metadata reported protected=false and required checks off; applicable parent-inclusive rulesets were empty. Detailed classic protection read remainedHTTP 403 for the integration; that limit was preserved and no administrative rule changed. Final-head [Quality39786729531](https://github.com/drumee/infra-layer/actions/runs/39786729531), [CodeQL39786724537](https://github.com/drumee/infra-layer/actions/runs/39786724537) and PR SonarCloud check all succeeded. The normal merge endpoint used exact expected HEAD 023a0f70and was read back as merged=true.

F1–F5 pass, F6 is confirmed merged, and F7/F8 pass as documented below. [Pre-merge final review](IL-5.12-A-final-review.md) retains its source-specific authoring scope; later measurements are not assigned to that earlier source.

## F7 — Actual canonical-source verification

A new clean clone `/tmp/il512-final-main` selected c218811effc83da25cf71a914e27accc96101329. Environment: Linux 6.1.0-41-amd64, Python 3.11.2, Node 22.22.0, npm 11.18.0, UID/GID 1000:1000. New inline reads use-B; the checkout is clean before and after verification. Existing secure helpers create unique private/exclusive output roots and retain evidence rather than cleaning foreign resources.

```sh
python3 -B docs/evidence/IL-5.11-R6S-D4/run-proof.py il512-final-f7-package /tmp/il512-final-main python3 -B docs/evidence/IL-5.11-D2/artifact.py --source /tmp/il512-final-main
python3 -B docs/evidence/IL-5.11-R6S-D4/run-proof.py il512-final-f7-source /tmp/il512-final-main python3 -B docs/evidence/IL-5.11-release-review/source-archive.py --source /tmp/il512-final-main
```

| Newly executed control | UTC start | Exit | Complete journal SHA256 |
|---|---|---:|---|
| Two npm builds | 2026-10-22T13:36:16.635189+00:00 | 0 | b7a30a1389792ef5f25e41cde49df58d388f75a59abe4fbe175e612592f1cef9 |
| GitHub source archive | 2026-10-22T13:36:19.499400+00:00 | 0 | f3ee16c6f84735082aebdf56b249d4a9370726a3488022d15b5a46707fde2e01 |

Both npm tarballs are byte-identical. Every regular member equals the selected source and previously qualified41member map. Metadata, exports, public declarations, lockfile and publication scripts are unchanged. Production dependencies and prepublication hooks remain empty. A separate read-only inspection repeats content/hash/tree checks and a bounded known private-key/npm/GitHub-token signature scan; no match is found. This does not prove absence of arbitrary unknown secrets. [Actual independent inspection](evidence/IL-5.12-A-final-verification/independent/final-integrity-inspection.json).

| Identity | Measured value |
|---|---|
| npm package/version | @drumee/infra-layer@0.1.0-alpha.3 |
| npm contents/size | 41 regular members;101778 compressed bytes |
| npm SHA256 | c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e |
| npm SRI | sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA== |
| Separate source archive | 1146163 bytes;757 Git blobs checked byte for byte, no filesystem extraction |
| Source archive SHA256 | 6870e1219ed09680dab7d065b9c0ab3e939986a81ff90cc1e05f17c9bbadac95 |
| Source archive SRI | sha512-UNEKi14isLPyqZXF4TxNccQiMxLSfOvePIxB1wIRe7YCv3hs+izcc4Ija0K9bt6AJl/+YIcAhR5WLkMbY6WRyA== |

These fingerprints are independently measured from new builds/downloads. Git commit/tree, GitHub source archive, npm archive and member identities are separate. The earlier efc8ca26source fingerprint is not reused for this merge. [Artifact summary](evidence/IL-5.12-A-final-verification/artifact-summary.json), [source receipt](evidence/IL-5.12-A-final-verification/source/source-archive-receipt.json) and [evidence manifest](evidence/IL-5.12-A-final-verification/manifest.json) identify complete raw receipts/private archives and per-file hashes without unnecessary duplication.

At this exact canonical SHA, [Quality39788182851](https://github.com/drumee/infra-layer/actions/runs/39788182851) completes all five jobs successfully. Packaging job119856803228 actually runs25 Python methods, zero failures/skips, real foreign UID 65532rejection and the original11 scenarios / 86 explicit assertions. The86 are not the full 25-method assertion total. [CodeQL39788194649](https://github.com/drumee/infra-layer/actions/runs/39788194649) completes JS/TS, Python and Actions successfully. Complete job logs confirm scanned files, SARIF upload and completed processing; their hashes and authenticated references are retained. Analysis success is not proof that the global alert inventory is empty. No separate main aggregate PR-result check is invented.

These hosted tests are new executions on c218811e. Earlier local full-verifier and heavy Gateway/Services/Lifecycle/application/SMTP campaign results remain attributed to their exact earlier commits and are reused only under demonstrated unchanged executable, helper and relevant test inputs. This documentation mission does not claim to have newly run heavy application or Internet-delivery acceptance.

The auxiliary incidents from the previous mission remain explicit. Their retained cache digest, sole disposable untracked file and empty tracked diff were rechecked. The failed optional inline import/diagnostic invocations are not counted as mandatory qualification successes. Required earlier package/source checks predated that cache and independent CI passed; no unqualified executable utility, source divergence or integrity defect was found. Their original incident JSON is preserved, not rewritten.

## F8 — Final readiness and unchanged residual limits

**Publication remains NOT_AUTHORIZED.** Fresh read-only npm checks at 2026-10-22T13:36:29.686100+00:00 verify somanos, target-package read-write rights and account 2FA auth-and-writes. alpha.3 remains absent, intended channel is **next**, current next is 0.1.0-alpha.2 and **latest must remain0.1.0-alpha.1** unless a separately authorized intervening release changes the baseline. No login, token/ACL change, OTP storage or publication attempt occurred. [Current read-only commands/results](evidence/IL-5.12-A-final-verification/npm-access-summary.json). Permissions/authentication/2FA must be refreshed immediately before a separately authorized release.

SonarCloud scope is explicit: PR #19's final-head check is SUCCESS with no PR findings, while actual canonical **main remains FAILURE**. Main analysis e361517e-c6ad-4b89-9c8d-9d935bbf3088 identifies c218811e and returns 250 open/confirmed/reopened findings. Compared with the prior 250-finding snapshot there are zero newly introduced keys and zero missing keys. Existing individual technical dispositions and administrative states are unchanged; no global risk acceptance, alert closure or scanner suppression is implied.

Fresh GitHub CLI reads at 13:39 UTC identify somanos and receive HTTP 403 Resource not accessible by personal access token for Code Scanning, Dependabot and Secret Scanning inventories. Exact commands/dates/responses are retained; unavailable inventories are not empty. This visibility limit is separate from successful accessible CI and scoped source/evidence qualification.

The owner's **SMTP_RESIDUAL_UNCERTAINTY_ACCEPTED_FOR_ALPHA3** applies only to the historical intermittent timeout/capture uncertainty in experimental alpha.3. Its root cause remains unknown. It excludes future regressions, message loss, TLS defects, open relay and production availability. Internet mail delivery/DNS/reception/deliverability and SMTP spool restoration remain outside qualification; **SMTP_RECOVERY_UNQUALIFIED** remains applicable. Evidence-helper guarantees still exclude root, compromised same UID/tools and hostile filesystems.

Publication prerequisites remain those in [the existing handoff](IL-5.12-alpha3-publication-handoff.md): distinct owner authorization of exact source/npm identities; fresh required checks, registry versions/tags, account/package write rights and approved interactive2FA; verified provenance mechanism; two fresh matching tarballs. Local OIDC remains unavailable and no registry provenance attestation is claimed. Never put tokens/OTPs in reports or history, and never test rights by publishing.

After a separately authorized publication, verify version/next and unchanged latest; download the registry tarball into a fresh private root; compare SHA256/SRI and every member; install that exact archive outside the source checkout with scripts disabled; verify exports, strict types, idempotent preparation and contract/security refusals; record actual registry/source/provenance metadata and journal hashes. Do not invent an attestation.

Stop on any changed member/hash/metadata, failed reproducibility or mandatory check, missing provenance, unresolved significant new finding, visibility insufficient for a changed risk, unavailable rights/2FA, preexisting alpha.3, unexpected tags, changed SMTP risk scope or required out-of-scope operation. No policy may be weakened to obtain success.

Debian retains aa9057f224f4ae5cf80d777e3cb2fad092193fb1; its future realignment requires separate image/integrated qualification. Runtime and Oxy-form remain unchanged, OF-01R depends on selecting a qualified distribution, and D0 is not started. No npm/image publication, release tag or production deployment occurred.

This final-source measurement record is committed on a separate branch based on canonical c218811e. No direct main report commit and no new PR merely repeating the unchanged handoff are created. The detailed earlier handoff remains preserved; its final-reference addendum points to these new measurements.
