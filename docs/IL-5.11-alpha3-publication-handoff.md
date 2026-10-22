# Infra Layer alpha.3 publication handoff

## Authorization and current state

**No publication is authorized by this maintenance mission.** The package candidate is `@drumee/infra-layer@0.1.0-alpha.3`; publication, release tags, container image publication, production deployment and moving latest are prohibited. The intended prerelease channel is **next**.

PR #17 is integrated at `75ac104ddce8700b406ba839cfe1b8bfe6d6f477`. PR #16 convergence is locally qualified and awaiting current-head GitHub checks and controlled integration. The final canonical source SHA and its separate source-archive receipt must be recorded after both merges; do not treat the intermediate main as the final publication selection. Root AGENTS.md permanently requires English documentation unless the owner explicitly requests a language exception.

## npm artifact

The executable npm content is unchanged from the qualified alpha.3 candidate. Fresh PR #16 verification built two identical archives from clean source `3740b38cefe15666f266cda933f6e53134cfd958`:

- 41 regular package members; compressed size101778bytes.
- Recalculated npm SHA256: `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`.
- Recalculated npm SRI: `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`.
- No production dependencies or lifecycle publication hooks; exports, public types, package scripts, lockfile and metadata unchanged.
- License AGPL-3.0-only; repository drumee/infra-layer; package access public.

The exhaustive member list and per-file SHA256 values are in the qualified artifact receipts. Final integrated main must be rebuilt twice and compared before publication selection. A source GitHub archive has a different identity and must never replace npm SRI. The intermediate main75ac104 source archive was separately downloaded and verified against all513Git blobs; its historical receipt remains distinct from the final canonical source archive still to be measured.

## Qualification and scanners

The original11 scenarios/86 assertions and five maintenance regressions passed on integrated PR #17. PR #16 adds nine independent utility methods, including real foreign UID checks, both output writers, symlink/FIFO/permission/concurrency boundaries, real Git archive validation, sentinels and real subprocess result hashes. Twenty-five methods pass without skips. The complete PR #16 verifier separately executes nine real commands; unit176, contracts24, PATH/tool scenarios12, packaging, installed consumer8+37/type checking, lint and both audits pass. Heavy Gateway/Services/Lifecycle/application acceptances are reused only under demonstrated identical executable inputs; no new heavy run is invented.

Quality and CodeQL were successful on the reviewed PR #17 and its integrated main. Additional Python analysis is now observable on main as a successful dynamic CodeQL job; no scanner setting was changed by this work. Final PR #16 and post-merge runs must still be inspected. SonarCloud remains **FAILURE**; technical dispositions and administrative states are separate. Global Security inventories have HTTP403 visibility limits; unavailable alerts are not an empty inventory. No alert, rule or branch protection has been disabled or bypassed.

## Registry access and release permissions

Fresh read-only registry checks on2026-10-22 show alpha.3 absent, `next=0.1.0-alpha.2`, `latest=0.1.0-alpha.1`, and public package status. **Authenticated checks now fail HTTP401**: npm whoami, collaborator/package permissions and profile access cannot be verified with the current session. No login, token change, ACL change or publication attempt was made.

The2026-10-21 historical assessment observed publisher somanos, read-write permissions and account 2FA mode auth-and-writes. These are historical observations, **not current permission verification**. Current publication preparation is **BLOCKED_RELEASE_PERMISSIONS** until the owner supplies a valid authorized publishing session and permissions/2FA are revalidated. Do not test rights by attempting publication. No OTP, token or extra profile/ACL data is stored in the new evidence. Local OIDC is unavailable; no npm provenance attestation is claimed. If OIDC provenance is required, qualify that publishing environment separately.

## SMTP scope and residual limitations

The owner explicitly accepted the residual uncertainty of the original pre-greeting SMTP timeout and its following capture failure for experimental alpha.3 only. Its root cause remains unknown. Successful campaigns do not prove the intermittence has disappeared. The acceptance does not cover message loss, TLS/security defects, open relay, future regressions or production availability. Internet delivery, public DNS/reception/deliverability and SMTP spool restoration remain unqualified. **SMTP_RECOVERY_UNQUALIFIED** remains applicable.

Evidence output protections assume a trusted selected checkout, ordinary local filesystem, system/root-owned ancestors and an executing UID not already compromised. Root, same-UID attackers, hostile filesystems and compromised child tools remain outside the guarantee. Private outputs are retained; no foreign resource is recursively removed.

## Future publication procedure — requires a distinct owner decision

1. Select the final integrated source SHA, inspect current checks/dispositions, and independently verify its exact tarball twice in new private directories.
2. Refresh npm versions/dist-tags, authenticated account, server-side read-write rights and 2FA requirements. Stop if alpha.3 already exists, permissions remain unverified, or latest would change.
3. Revalidate the chosen provenance mechanism. Require approved interactive 2FA where applicable; never place OTPs or credentials in reports, scripts or command history.
4. Only after a separate publication authorization, designate the already qualified tarball by explicit path and use the public access/next channel with scripts disabled. This handoff deliberately executes no npm publish command.
5. Read back the published version, next and unchanged latest; download the registry tarball into a fresh private root, recompute SHA256/SRI and compare every member with the authorized receipt.
6. Install that registry tarball outside the checkout, with scripts disabled; verify exports, strict types, idempotent preparation and contract refusals. Record actual source commit, registry metadata and provenance evidence, without claiming an attestation that was not produced.

Stop publication preparation on package divergence, missing provenance, unresolved significant findings, failed checks, changed scope of SMTP risk, unavailable rights/2FA, a preexisting alpha.3, unexpected tags or any out-of-scope dependency.

## Consumer handoff boundaries

Debian remains locked at `aa9057f224f4ae5cf80d777e3cb2fad092193fb1`; realignment requires a separate task and new image/integration qualification. Server Runtime and Oxy-form are unchanged. OF-01R remains dependent on a selected qualified distribution. Oxymotion D0 is not started. No production operation is authorized by this document.
