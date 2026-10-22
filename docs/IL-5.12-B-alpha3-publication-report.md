# IL-5.12-B alpha.3 publication report

**Current status: ALPHA3_PUBLISHED_AND_VERIFIED.** The official npm registry confirms publication of `@drumee/infra-layer@0.1.0-alpha.3` by `somanos` at **2026-10-22T16:01:12.742Z**. The owner reported completing publication after the authentication stop below. The agent did not issue another publication command. Registry delivery, exact artifact identity, distribution tags and an isolated installed consumer have now been independently verified.

## Final publication and verification record

| Property | Verified result |
|---|---|
| Authorized source | `c218811effc83da25cf71a914e27accc96101329` |
| Registry | `https://registry.npmjs.org/` |
| Package/version | `@drumee/infra-layer@0.1.0-alpha.3` |
| Registry publication UTC | `2026-10-22T16:01:12.742Z` |
| Registry publisher | `somanos` |
| Archive | [Registry-provided tarball](https://registry.npmjs.org/@drumee/infra-layer/-/infra-layer-0.1.0-alpha.3.tgz) |
| Download verification UTC | `2026-10-22T16:16:32.207249+00:00` |
| Isolated consumer completion UTC | `2026-10-22T16:25:52.118013+00:00` |
| Members / compressed bytes | **41 / 101778** |
| SHA256, independently measured from registry download | `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e` |
| SHA512 SRI, independently measured from registry download | `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==` |
| Archive comparison | Byte-identical to the qualified local archive; every member matches canonical source bytes |
| Consumer | **8 baseline + 37 additional assertions PASS**, strict TypeScript NodeNext PASS |
| Cleanup | Owned isolated consumer workspace removed; source checkout remains clean |

| Dist-tag | Before publication | After publication |
|---|---|---|
| `latest` | `0.1.0-alpha.1` | `0.1.0-alpha.1` — unchanged |
| `next` | `0.1.0-alpha.2` | `0.1.0-alpha.3` |

All observed dist-tags were compared, and only `next` advanced. Exact-version and package endpoints returned HTTP 200. The published metadata matches the canonical manifest for name, version, exports, typings, production dependencies, license and publication configuration. These are registry results, not an inference from local packaging.

### B6 — Actual registry archive and isolated consumer

[Registry receipt](evidence/IL-5.12-B-postpublication/registry/B6-registry-artifact.json) records exact URLs, HTTP responses, retrieval times, response hashes, publisher, publication time, metadata comparison and measured archive fingerprints. [Per-member receipt](evidence/IL-5.12-B-postpublication/registry-members.json) records all 41 member names, sizes and SHA256 values, independently compared with the selected clean source. No source-archive fingerprint is substituted for npm SRI.

The consumer uses the **downloaded registry archive**, not a newly packed local directory. A temporary driver derives from `test/application/package-consumer.js` at the authorized commit. Its local `npm pack` step is replaced by copying the previously verified registry tarball; canonical input/refusal fixtures remain unchanged. The private output location, explicit empty npm configuration files and command diagnostics are also recorded in [driver provenance](evidence/IL-5.12-B-postpublication/sandbox-setup/driver-provenance.json). The original and derived driver hashes and exact substitutions make this adaptation reproducible. No repository helper or package member was changed.

Commands, UTC timestamps, exit codes and durations are in the [consumer log](evidence/IL-5.12-B-postpublication/consumer/consumer.log), whose SHA256 is `15cd27c724b1adca8ecb25b9ee7d61ecd9549a12dce32e9ba16551e79b34d545`. The driver invokes an offline, script-disabled npm installation from the registry tarball, TypeScript `--strict --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 check.ts`, and `node check.js`. The [consumer receipt](evidence/IL-5.12-B-postpublication/consumer/B6-consumer.json) records source, full driver command, Linux 6.1.0-41-amd64, UID/GID 1000:1000, Node 22.22.0, TypeScript 5.9.3 and exit 0.

The 8 baseline assertions cover public API, validation, planning, composition, real nonactivated preparation and idempotence. The 37 additional assertions cover installed public-export resolution, plugin selection and refusal contracts, forbidden network bindings, unsafe paths, foreign resources, sentinel integrity and absence of production dependencies. Public package imports resolve inside the isolated consumer's `node_modules`; no neighboring checkout is required. The canonical factory is used only outside the installed consumer to serialize JSON inputs. No activation, container launch, deployment or renewed SMTP acceptance campaign occurred.

An initial setup attempt stopped **before installation or application assertions** because the filesystem sandbox exposed `/usr` as UID 65534, causing `UNSAFE_QUALIFICATION_EXECUTABLE`. Its [receipt and log](evidence/IL-5.12-B-postpublication/sandbox-setup/B6-consumer.json) are preserved as a setup failure, not counted as passing assertions. The identical driver then ran outside that sandbox with `/usr` UID 0 and passed. No trusted-executable, ownership or application check was weakened. The derived driver SHA256 is `1abf916ecf98b3d2a98694bb24bfac20072b3f4e5acd8cc3fe3a5d554570d856` in both runs.

### Publication attribution, authentication and provenance

The sole agent publication invocation returned EOTP at 14:39 UTC; alpha.3 remained absent at the subsequent 15:01 UTC read. Those original records remain intact below and in the original evidence directory. The later successful owner-side terminal/authentication session was not observed by the agent, so its terminal output or exact interactive command is not claimed. Publication is independently established by the registry version, publisher and timestamp, followed by actual delivered-byte verification.

Pre-publication read-only checks verified `somanos`, package write access and account 2FA `auth-and-writes`. No credential, OTP or authentication challenge URL is stored here. Source provenance is the authorized Git commit and exact member identity. The registry advertises signing signatures but **no npm provenance attestation** (`dist.attestations` is absent); signature presence is not presented as an OIDC attestation or as a separate cryptographic signature-verification result.

### Qualification references and continuing limitations

The earlier exact-source [Quality run 39788182851](https://github.com/drumee/infra-layer/actions/runs/39788182851) has five successful jobs, including 25 Python test methods. [CodeQL run 39788194649](https://github.com/drumee/infra-layer/actions/runs/39788194649) has successful JavaScript/TypeScript, Python and Actions analyses and result upload/processing. These are reused exact-source results, not newly executed publication tests. Fresh registry delivery and consumer checks above are separately dated.

SonarCloud remains **FAILURE on canonical main, with 250 recorded findings**; no scanner success, alert closure or global risk acceptance is implied. Global GitHub Security inventory HTTP 403 limitations remain. The owner-accepted historical SMTP uncertainty applies only to experimental alpha.3; its original root cause remains unknown and the decision covers no future regression, message loss, TLS defect or open relay. Internet mail delivery remains unqualified and **SMTP_RECOVERY_UNQUALIFIED** remains applicable.

The existing documentation reporting branch is reused without a new PR or direct main commit. [Final result](evidence/IL-5.12-B-postpublication/B7-publication-result.json) and [new hashed manifest](evidence/IL-5.12-B-postpublication/manifest.json) reference all new proof records separately from the preserved pre-publication evidence. The registry tarball is retained privately rather than duplicated in Git. Canonical `main` remains the authorized source; no Git tag, GitHub release, image publication, production operation or downstream repository change was performed. Debian, Server Runtime, Oxy-form and Oxymotion D0 remain outside this mission.

## Historical pre-publication authentication stop

The following record describes the earlier stop and is superseded only as the current publication status by the independently verified completion above. Its raw evidence files and original manifest are unchanged.

<details>
<summary>Preserved EOTP stop report and pre-publication qualification</summary>

**Status: PUBLICATION_REQUIRES_OWNER_AUTHENTICATION.** The release gate passed and one authorized publication command returned **EOTP**. The registry subsequently confirms **no alpha.3 version and unchanged dist-tags**. No publication is claimed, and no second publication command was attempted.

## Authorization and exact selection

The owner explicitly authorized publication of @drumee/infra-layer@0.1.0-alpha.3 to the public npm registry under next, conditional on the exact qualified source/package identity and preflight controls. This new IL-5.12-B mandate supersedes historical NOT_AUTHORIZED labels only within that limited publication scope. It authorizes no downstream repository, production, image or release-tag operation and accepts no new significant defect.

Selected canonical source: **c218811effc83da25cf71a914e27accc96101329**, tree **a67e5fc553db4d22b8ef55f9ed45fe556ac2f1e9**. Fresh remote references still identify that main commit. A new detached clone `/tmp/il512-b-source` is clean before/after packaging; version and AGENTS.md policy match the qualified source. The separate final-source report at32f31292f9e3911a9974dd24830fd554a5e27996 was read as reporting evidence, not substituted as the executable source. All newly authored documentation is English.

Environment: Linux 6.1.0-41-amd64, Python 3.11, Node 22.22, npm 11.18; operator UID/GID 1000:1000. The installed npm code was inspected for tarball publication, explicit tag selection, disabled lifecycle scripts, authentication challenge handling and registry attestation behavior. No credentials or npm authentication configuration were copied or changed.

## B1–B4 — Pre-publication gate

| Control | Result | Evidence |
|---|---|---|
| B1 Canonical source | PASS | Exact selected commit, clean detached checkout, expected package/version and permanent language policy. |
| B2 Artifact | PASS | Two real offline, script-disabled npm builds; every member and source byte compared; fingerprints independently calculated. |
| B3 Registry/account | PASS | Official endpoint, alpha.3 absent, exact before-tags, somanos/write rights/account2FA verified read-only. |
| B4 Release gate | PUBLICATION_GATE_PASS | Exact tarball, hashes, 41 members, 101778 bytes, actor, tags, CI and residuals recorded before publication. |
| B5 Publication | AUTHENTICATION_REQUIRED | One command, exit 1 / EOTP; no interactive credential/OTP supplied. |
| B6 Registry delivery/consumer | NOT_RUN | Exact version remains404; no registry alpha.3 tarball exists to download/install. |
| B7 Report | COMPLETE FOR THIS STOP | Evidence and precise next intervention recorded without claiming successful publication. |

The packaging commands are recorded as exact argument arrays in [the new measured artifact summary](evidence/IL-5.12-B/B2-artifact-summary.json), including separate pack destinations. Both use `/usr/bin/npm pack --offline --ignore-scripts --json --pack-destination <fresh-private-directory>` from the clean selected source. Packaging is offline with a fresh private cache and scripts disabled; no unintended network action is required or triggered. No package member was edited to obtain a match.

| Artifact property | Newly measured value |
|---|---|
| Package/version | @drumee/infra-layer@0.1.0-alpha.3 |
| Members | 41 regular files, exact qualified map and contents |
| Compressed bytes | 101778 |
| Reproducibility | Both archives byte-identical |
| SHA256 | c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e |
| npm SRI | sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA== |

Metadata, exports, public typings, lockfile and publication scripts are unchanged. No production dependencies or publication lifecycle hooks exist. A bounded known-key/token signature scan has no matches; exact member/source equality supports the review but is not a universal secret detector. The selected tarball is retained at **/tmp/il511-evidence-8c96ce1e572eeba71c7122ee9828da52/pack-1/drumee-infra-layer-0.1.0-alpha.3.tgz**, mode 0400 under private owned directories, with type/ownership/link-count/hash rechecked immediately before the attempt. No GitHub source-archive fingerprint is substituted for npm SRI.

Registry preflight at 2026-10-22T14:23:53.254691+00:00uses **https://registry.npmjs.org/** explicitly; no different @drumee-scoped registry is configured. alpha.3 is absent, account **somanos** is authenticated and both target-package ACL reads show **read-write**. Account 2FA is **auth-and-writes**, configured authentication type is web, and package access is public. No token/profile extras or unrelated collaborators are retained. All dist-tags were read and then rechecked unchanged before the gate. The prepared operation targets only next; no latest/dist-tag modification command exists in this run.

The gate at 2026-10-22T14:33:59.533906+00:00records all conditions, CI references, the exact command and expected tags. The isolated-consumer prerequisites were checked read-only: trusted TypeScript 5.9.3 and the pinned already-qualified application image are available; no activation/deployment is required. Those checks prepare verification, not a claim that an installed registry consumer passed.

## B5 — Single controlled publication attempt

- Attempt start UTC: **2026-10-22T14:39:56.773910+00:00**.
- Attempt completion UTC: **2026-10-22T14:39:58.896943+00:00**.
- Publication date/time: **N/A — publication not accepted**.
- Publisher identity from preflight: **somanos**, without credentials.
- Registry: **https://registry.npmjs.org/**.
- CLI result: **exit 1, EOTP**; no successful npm publication response.
- Publication command invocations: **1**; no retry.

[Exact credential-free command and gate](evidence/IL-5.12-B/publication/B4-publication-gate.json), [exclusive attempt-start marker](evidence/IL-5.12-B/publication/B5-attempt-start.json), and [safe result receipt](evidence/IL-5.12-B/publication/B5-publication-result.json) retain source, UTC dates, actor, parameters and outcome. The command publishes the verified tarball with explicit next/public/official-registry flags, scripts disabled, workspaces disabled, no provenance request, fetch retries 0 and debug logs disabled. It does not publish a working directory or bump a version, Git tag or release.

The existing configured credentials support authenticated read/ACL checks, but the actual registry write requires an additional 2FA challenge. The tool-run process has no owner-controlled interactive terminal; npm therefore returns EOTP instead of completing browser/classic OTP flow. No password/token/OTP was requested in the conversation, typed, printed, stored or committed. Raw challenge output and potential authentication URLs are deliberately not retained; the safe error code is preserved. No authentication downgrade, new token, ACL change or bypass was attempted.

## Registry state after EOTP

Read-only official-registry verification at **2026-10-22T15:01:06.502287+00:00** returns 200 for the package packument and 404 for the exact version endpoint. alpha.3 is absent and every dist-tag equals its preflight value.

| Dist-tag | Before attempt | After attempt |
|---|---|---|
| latest | 0.1.0-alpha.1 | 0.1.0-alpha.1 |
| next | 0.1.0-alpha.2 | 0.1.0-alpha.2 |

[Exact URLs, HTTP results and UTC dates](evidence/IL-5.12-B/registry-after/B5-registry-state-after-auth-challenge.json). There is no ambiguous accepted version to verify, no registry-provided alpha.3 tarball URL, no registry download and no installed registry consumer result. Local packaging proofs are not presented as registry delivery verification. Registry tarball SHA256/SRI/member results are **NOT AVAILABLE**; only the freshly qualified local archive has the identities above.

## Authentication intervention and stop boundary

**Owner-controlled interactive npm authentication is required.** The supported npm terminal/browser 2FA flow must be used without sending any credential or OTP to the conversation, source code or report. No terminal input containing a secret can be collected through the agent transcript. This run stops rather than trying another publication command or authentication workaround. Its single controlled command allowance has been used; there is no automatic retry queue.

The exact read-only qualified tarball, credential-free command and gate remain available for a controlled interactive continuation. Before any later invocation, re-read the registry version and all tags, verify selected bytes/source and authentication state, and establish the continuation's scope. Do not overwrite an existing immutable version. Never use unpublish, move latest, or modify an unrelated tag to remediate this stop.

If a later authorized interactive publication succeeds, B6 must still query exact version/tags, download the actual registry tarball, compare bytes/SHA256/SRI/all 41 members and run the isolated installed consumer with strict types, public exports, idempotent preparation and contract refusals outside the source checkout. Until those checks pass, ALPHA3_PUBLISHED_AND_VERIFIED is not available. This report claims neither successful publication nor post-publication consumer verification.

## Qualification, provenance and retained residual risks

At exact source c218811e, [Quality39788182851](https://github.com/drumee/infra-layer/actions/runs/39788182851) has five successful jobs, including 25 Python methods, and [CodeQL39788194649](https://github.com/drumee/infra-layer/actions/runs/39788194649) JavaScript/TypeScript, Python and Actions pass with confirmed result upload/processing. These are identified earlier exact-source qualification runs, not invented executions during publication. SonarCloud **FAILURE on main with 250 recorded findings** remains visible; no rule or finding was disabled or closed. No publication hook or repository publishing workflow makes that failed check an enforced registry-write condition; the owner explicitly acknowledged it for this limited release authorization.

Global GitHub Code Scanning/Dependabot/Secret Scanning inventory HTTP 403 visibility limits remain, and inaccessible alerts are not assumed absent. The owner's historical **SMTP_RESIDUAL_UNCERTAINTY_ACCEPTED_FOR_ALPHA3** remains limited to experimental alpha.3: original cause unknown, no acceptance of future regressions, message loss, TLS defects or open relay. Internet mail deliverability and SMTP spool recovery remain unqualified; **SMTP_RECOVERY_UNQUALIFIED** still applies. No new significant defect or regression is accepted through this authentication stop.

Source provenance is the exact selected Git commit/tree and verified member map. No registry OIDC provenance attestation was requested or produced; local OIDC is unavailable. If an attestation is required for a later publishing environment, qualify that mechanism separately rather than claiming one from a local interactive flow.

The canonical repository and package remain unchanged. Debian retains aa9057f224f4ae5cf80d777e3cb2fad092193fb1; Runtime and Oxy-form are untouched, no image/Git tag/GitHub release/production deployment occurred, and Oxymotion D0 was not started. [Hashed evidence manifest](evidence/IL-5.12-B/manifest.json) preserves the new records on the existing authorized reporting branch, without another documentation PR or direct main commit.

</details>
