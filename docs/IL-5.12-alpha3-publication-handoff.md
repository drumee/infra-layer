# IL-5.12 alpha.3 publication handoff

## Final PR #19 integration — 2026-10-22

Status: **FINAL_DOCUMENTATION_MERGED_AND_RELEASE_CANDIDATE_VERIFIED**. Selected canonical main is **c218811effc83da25cf71a914e27accc96101329**, tree **a67e5fc553db4d22b8ef55f9ed45fe556ac2f1e9**. PR #19 merged from reviewed HEAD 023a0f7011d1f16a2d4bf6599227725b22e99755. The 41 npm members and 101778-byte archive are unchanged; new builds independently recalculate npm SHA256: c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e and SRI: sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==.

The **new separate source archive** is 1146163 bytes with 757 Git blobs; SHA256: 6870e1219ed09680dab7d065b9c0ab3e939986a81ff90cc1e05f17c9bbadac95 and SRI: sha512-UNEKi14isLPyqZXF4TxNccQiMxLSfOvePIxB1wIRe7YCv3hs+izcc4Ija0K9bt6AJl/+YIcAhR5WLkMbY6WRyA==. The previous efc8ca26archive below remains historical, not the final-source fingerprint.

At the new exact SHA, Quality39788182851 passes all five jobs, including25 Python methods; CodeQL39788194649 JS/TS, Python and Actions pass with confirmed result upload/processing. PR SonarCloud SUCCESS and main SonarCloud FAILURE are separate observed scopes; main's 250 finding keys are unchanged. Security inventories remain HTTP 403-limited. Fresh npm reads at2026-10-22T13:36:29.686100+00:00verify somanos/read-write/account 2FA auth-and-writes; alpha.3 absent, next=alpha.2, latest=alpha.1. SMTP uncertainty acceptance, unknown root cause, Internet-delivery limits and SMTP_RECOVERY_UNQUALIFIED are unchanged.

**Publication: NOT_AUTHORIZED.** Existing separate-authorization, 2FA, next/latest, provenance, post-publication verification and stop requirements below continue to apply. [Final verification/readiness report](IL-5.12-A-final-verification.md) supplies new commands, dates, environment, results, fingerprints and limitations. This addendum is on a separate final-record branch; no new PR is opened just to repeat the unchanged procedure.

## Earlier IL-5.12-A dossier — source-specific historical scope

## Decision and source selection

Documentation consolidation status: **DOCUMENTATION_MERGED_RELEASE_CANDIDATE_VERIFIED**. PR #18 is merged and GitHub confirms canonical main **efc8ca2639f31793124459f28b9979235e28b023**, tree **82014b917003d36159b59524233bc4e22c971529**. Its parents are the previously qualified main09170b9e435b5f9bf564237b9fcae080b56fc932 and reviewed documentation HEADde084c82d21c8149db1e3d6affe7084e4aa2cfca. The merge tree equals the reviewed HEAD tree and commit verification is valid.

**This mission does not authorize npm publication. No publication has occurred as part of this mission.** Release tags, image publication, production deployment and moving latest are also unauthorized. This handoff supports a separate, explicit owner decision for the exact package below.

The canonical source changed only in documentation and evidence. All41distributed npm members remain byte-identical to the qualified D2 content at dbc0be5c20029374c68bdf510dfadd7da079fcf6 and the selected executable correction at d19e62ba682dc2d781f5f941c7ba4b37e3a65053. Root AGENTS.md permanently requires English documentation unless the owner explicitly requests a language exception. Historical logs and machine evidence retain their original contents and source attribution.

## Artifact identities

| Property | Newly verified identity at final main |
|---|---|
| Package | @drumee/infra-layer@0.1.0-alpha.3 |
| npm members | 41 regular members, identical contents and allowlist |
| npm archive size | 101778 compressed bytes |
| Reproducibility | Two newly built npm archives are byte-identical |
| npm SHA256 | c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e |
| npm SRI | sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA== |
| Separate source archive | 1106734 bytes; all715Git blobs verified without extraction |
| Source archive SHA256 | 1a579353e64a091c0a2249d328343de540b1022d0dc43cfb3544a160e61cb045 |
| Source archive SRI | sha512-TnZCJdG/LMhhk4a+ZSQcng4j23CdV27DaankmD/xQtT7wcs2Mn6lgXblDDXCK+Hq/KxQZWjFiVtbJ1jsf9ecJQ== |

Git commit, Git tree, GitHub source archive, npm archive and individual members are distinct identities. Never substitute source SRI for npm SRI. The exact member map is [the qualified map](evidence/IL-5.11-D2/D2-artifact-receipt.json), independently checked against every new npm member and selected source byte. [New artifact summary](evidence/IL-5.12-A-postmerge/artifact-postmerge.json), [source receipt](evidence/IL-5.12-A-postmerge/source/source-archive-receipt.json) and [full command/date/journal receipt](evidence/IL-5.12-A-postmerge/postmerge-build/il512-a7-artifact.json) establish the current measurements.

Exports, public type declarations, lockfile, scripts and publication metadata are unchanged. There are no production dependencies or prepublication hooks. License is AGPL-3.0-only, repository drumee/infra-layer and package access public. Exact content equality and a bounded scan found no private-key or known npm/GitHub-token signatures; this is not proof against arbitrary unknown secrets. Binary archives and complete raw member receipts remain in identified private roots with fingerprints, avoiding unnecessary duplication.

## Qualification and workflow evidence

At reviewed PR HEADde084c82, [Quality39781724439](https://github.com/drumee/infra-layer/actions/runs/39781724439) passes all five jobs; [CodeQL39781718077](https://github.com/drumee/infra-layer/actions/runs/39781718077) passes JavaScript/TypeScript, Python, Actions and the PR result. SonarCloud remains failed; its four public SHA256 findings are individually technically confirmed, with administrative states unchanged.

At actual canonical merge efc8ca2639f31793124459f28b9979235e28b023:

- [Quality39782283280](https://github.com/drumee/infra-layer/actions/runs/39782283280) passes eslint, dependencies, unit, contracts and packaging. The packaging log confirms **25 passing Python methods**, zero skips/failures, real foreign UID65532 and helper-level ownership refusal. The original11scenarios retain86explicit assertions;86is not a count of the entire extended suite.
- [CodeQL39782284104](https://github.com/drumee/infra-layer/actions/runs/39782284104) passes JavaScript/TypeScript, Python and Actions, with confirmed scans, SARIF uploads and completed processing. This proves execution/publication, not an empty global alert inventory.
- Two local npm builds and exact715blob GitHub source verification newly succeed at the merge SHA. The documented supplementary inspection setup/diagnostic errors remain recorded separately and are not counted as successful qualification commands.

Earlier176unit tests including24contracts, Gateway17/17, Services17/17 and the predefined3x17/17campaign, Lifecycle16/16, application87assertions, isolated consumer8+37assertions and strict types remain attributed to their actual earlier source-specific evidence. They are reused only under demonstrated unchanged distributed content and relevant executable/test inputs. Actual hosted checks on the new source are reported separately; no fresh heavy SMTP/application campaign is invented by this documentation mission.

## SonarCloud and Security visibility

**SonarCloud is FAILURE**, including the post-merge check at efc8ca2639f31793124459f28b9979235e28b023. The accessible main inventory returns250open/confirmed/reopened findings. Compared with the stored prior246finding snapshot, exactly four are newly added public source fingerprints in preserved receipts. Each exact field was matched to recalculated SHA256 of public capabilities/secrets/index.js and classified FALSE_POSITIVE_TECHNICALLY_CONFIRMED. Prior scoped dispositions remain separate; no global acceptance of250findings, rule suppression or administrative closure is claimed.

Fresh GitHub CLI identity somanos receives **HTTP403 Resource not accessible by personal access token** on Code Scanning, Dependabot and Secret Scanning inventory reads. Detailed classic protection access through the connector is also403-limited. Accessible workflow output, scoped code/evidence review and exact-source artifact checks support the consolidation; unavailable inventories are not empty inventories. No branch protection or scanner policy was changed or bypassed.

## SMTP owner decision and environment limits

**SMTP_RESIDUAL_UNCERTAINTY_ACCEPTED_FOR_ALPHA3** remains the owner's limited decision for experimental alpha.3. The historical timeout before the SMTP greeting and following capture failure have **unknown root cause**. Successful campaigns reduce uncertainty but do not establish permanent disappearance. The acceptance does not cover future regressions, message loss, TLS defects, open relay or production availability. A new significant failure requires independent investigation and a new owner decision when necessary.

Internet mail delivery, public DNS/reception/deliverability and spool restoration remain unqualified. **SMTP_RECOVERY_UNQUALIFIED** remains applicable. Evidence-helper guarantees exclude root, compromised same UID/tools and hostile filesystems. These limitations are not broadened or silently accepted by documentation integration.

## npm account, rights, 2FA and provenance

Read-only checks at **2026-10-22T12:56:04UTC** verify:

| Check | Observed result |
|---|---|
| npm publisher identity | somanos |
| Target-package server-side rights | read-write |
| Account 2FA | auth-and-writes |
| alpha.3 version | Absent |
| Current next | 0.1.0-alpha.2 |
| Current latest | 0.1.0-alpha.1 |
| Package access | public |

[Current access summary](evidence/IL-5.12-A-postmerge/npm-access-summary.json) retains exact read-only commands, source, dates and outcomes; unrelated collaborators are omitted from the export while the original raw response remains private with its fingerprint. No login, ACL/token change, OTP collection or publishing attempt was made. Earlier HTTP401 observations remain historical and are not replaced with fabricated success.

These are dated account/right observations, not a guarantee that a future session or token will satisfy publication policy. Require a refreshed valid authorized session, target-package write capability and approved interactive2FA immediately before publishing. Never put OTPs/tokens in reports, scripts or shell history. Stop if the actual publication authentication/2FA policy cannot be satisfied; do not try publication to test rights.

Local OIDC is unavailable and no npm registry provenance attestation exists from this mission. Source provenance is established by the exact commit/tree, exact source archive contents and reproducible npm/member identities. If OIDC registry provenance is required, separately qualify that publishing environment before authorizing the release; do not claim or enable an unverified attestation mechanism.

## Separate publication prerequisites and prepared procedure

1. Obtain explicit owner authorization for publication of the exact source/package identities above. Refresh main, required checks, relevant dispositions, npm versions and tags. Stop if alpha.3 already exists or selected source/package identity changed.
2. Refresh authenticated publisher identity, server-side target-package rights, account/package publication policy and2FA. Confirm the actual registry/provenance mechanism. No login or authentication-policy change is authorized by this maintenance handoff.
3. Rebuild twice from the selected clean source using private exclusive outputs. Compare all41members, compressed size, SHA256 and npm SRI with the authorized receipt. Select the exact verified tarball by explicit path; do not publish an unreviewed rebuild or source archive.
4. Only after separate authorization, use the prepared next-channel command:

   ```sh
   npm publish "$QUALIFIED_TARBALL" --access public --tag next --ignore-scripts
   ```

   This command was **not executed**. QUALIFIED_TARBALL must identify the already verified archive. Use the approved interactive2FA mechanism. Add provenance options only after that environment/mechanism is actually qualified. Preserve latest; create no release tag or image publication under this dossier.
5. Read back the published version and next tag; verify latest remains0.1.0-alpha.1 unless a separately authorized intervening release changed the baseline. Verify package/source metadata and any actual provenance attestation without inventing one.
6. Download the registry tarball into a newly created private root, recompute SHA256/SRI and compare every member to the authorized map. Install that exact downloaded archive outside the checkout with scripts disabled; verify exports, strict types, idempotent preparation, plugin selection, contract errors, forbidden network exposure and untrusted-path refusals. Record dates, source/registry metadata, commands, results and journal hashes.

Stop on changed package bytes/members/metadata, preexisting alpha.3, unexpected tags, required-check failure, significant unresolved new findings, insufficient Security visibility for a changed risk, missing source provenance, unavailable rights/2FA, changed SMTP risk scope or any out-of-scope operation. Do not weaken a control or move latest to obtain success.

## Consumer boundaries and handoff references

Debian remains locked at **aa9057f224f4ae5cf80d777e3cb2fad092193fb1**. Realignment requires a separate task, new image qualification and affected integrated acceptance. Server Runtime and Oxy-form remain unchanged. OF-01R depends on selection and qualification of the distribution. OxymotionD0 is not started.

[Pre-merge review](IL-5.12-A-review.md), [post-merge verification](IL-5.12-A-postmerge-verification.md) and [hashed evidence manifest](evidence/IL-5.12-A-postmerge/manifest.json) establish the source, commands, environment, dates, results and limits. This final handoff is delivered on a separate documentation branch based on canonical main, without a direct main commit or automatic merge of the follow-up PR. Availability of this dossier is not publication authorization.
