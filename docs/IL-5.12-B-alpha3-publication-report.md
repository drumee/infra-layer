# IL-5.12-B alpha.3 publication report

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
