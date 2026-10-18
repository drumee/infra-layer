# IL-5 release and integration handoff

Status: **READY_FOR_TECHNICAL_REVIEW**. No merge or publication authorization is
implied. The selected evidence is in [qualification](IL-5-qualification.md).

## Review branches and integration order

1. Review Infra Layer `feat/il5-external-gateway` against `main`. It owns additive
   application/external-gateway contracts, consumer-selected secrets and public
   CA projection, composition/observation/recovery policy, types and tests.
2. Review Debian `feat/il5-minimal-application` against
   `feat/container-distribution`, the audited IL-4 baseline. It owns the explicit
   operator profile, shared selector/JSON reader/schema extension, immutable
   Runtime/plugin images, public API operator and acceptance/runbooks.
3. Integrate the canonical Infra change first. Debian already uses immutable
   source `c6ef6e9b8d33921ffa39c289490067adfc63a8b0` plus archive SRI, so it requires
   neither a sibling checkout nor unpublished npm resolution. A future approved
   registry release can replace that source pin through a distinct lock/provenance
   change and installed-consumer/cleanroom validation. Published alpha.2 cannot
   substitute for the IL-5 contract.
4. Integrate Debian only after both reviews and dependency agreement. Do not
   merge either PR automatically. The feature branches retain ordinary additive
   commits; no history rewrite or release tag is created.

[Infra Layer PR #2](https://github.com/drumee/infra-layer/pull/2) and
[Debian PR #7](https://github.com/drumee/debian/pull/7) are open and mutually linked.
The PR commits tabs and final execution report identify exact review HEADs; the immutable implementation/artifact pins
below do not change when evidence-only commits are appended.

## Checkpoint commits

Infra Layer:

- Audit: `d0b53e8fd170864544b4723f8c933e4d9cf69bcb`.
- Public contract: `11cd32c4f456a17d80818b98be4ea7d908bec677`.
- Real lifecycle/SMTP: `cf4ac5735f7ec0d48e48a9a752951f77f7284c74`.
- Source-aware acceptance: `d4a883a847bae84e560f1385c0775bd12c18379a`.
- Installed consumer: `f0f48aace5331919448a65e91800a3120637261d`.
- Candidate metadata/provenance: `c6ef6e9b8d33921ffa39c289490067adfc63a8b0`.

Debian:

- Audit: `5f727f784971ae9511a8749dbb861bd460932ec2`.
- Operator/image/profile: `9ffb273ba428cea88134740bb99d241e8da5b4a5`.
- Actual operator acceptance: `d3d85a51a50964950e6a685675b7a36a260e5065`.
- Final immutable Infra alignment: `cfb993dd3979122e4ff7915b8627ff669ef90a96`.

Server Runtime remains read-only at
`f961f6214432c2e6dbbcde2b926544c076935950`, published alpha.4. Oxy-form remains
read-only at `7f368473d4f350a88e844b841f97a175b53921b8`. The original Infra sibling
checkout remains clean on alpha.2; IL-5 is in its separately cloned feature
branch. Debian's two pre-existing changelog edits and untracked AGENTS.md remain
untouched and uncommitted by this work.

## Candidate package and provenance

Local-only `@drumee/infra-layer@0.1.0-alpha.3` tarball:

- Filename: `drumee-infra-layer-0.1.0-alpha.3.tgz`.
- Size: 98,007 bytes; unpacked 351,221 bytes; 40 allowlisted files.
- SRI: `sha512-+voNVLiQa+Cb9k0M/frJIkejFRqAJPa/d7Z42iqG+waU1oupgDL/r4FrvK09ADhW4pjKfYNlm7FNdc0ixvf5Eg==`.
- SHA1: `a039a39ae9bb77bf2a9b7a5b89e7e771388ba491`.
- Source: `c6ef6e9b8d33921ffa39c289490067adfc63a8b0`.
- Empty production dependency set; AGPL-3.0-only and historical attribution retained.
- Root public API unchanged; lifecycle exports/types include the opt-in addition.
- Installed offline consumer: strict NodeNext type checks and real idempotent
  preparation without activation, no checkout imports.

The source archive has a distinct SRI from `npm pack`, because GitHub and npm
contain different allowlisted metadata/layout. Debian locks the source archive
SRI in its new profile lock. The Runtime version/SRI remains explicit and is
validated before image assembly. Plugin inputs use immutable archive SHA512,
ID/source revision and a generated image inventory; dependencies must be bundled.
No mutable tag, historical factory database or hidden development checkout is
needed. Actual image IDs and selected source are in the cleanroom evidence.

## Delivered operator behavior

Select `drumee-ctl --profile minimal-application` explicitly. Team remains the
default; minimal-kernel source/locks are unchanged. The profile provides plan,
validate, install, status, doctor, stop, start, restart, proxy-config, cold backup,
isolated restore and compatible rollback through public Infra APIs. Mutations
require explicit execution and owner-bound identity/resource policy. Unknown
installations are never adopted, and unrelated Docker resources are never
removed. Protected snapshots preserve revision-bound non-secret configuration.

The reference image composes the published native Runtime registry, dispatcher,
service server and authorizer. Default anonymous public RPC works; protected RPC
is denied without its canonical adapters. Plugin inventory must agree with the
immutable image. There is no second authentication/password/session/ACL system.
The default profile installs no Hub/MFS/Finder/SQL/Redis/DNS/container gateway.

The external proxy uses an explicitly private 127.0.0.1 TCP publication with
preserved `/-/` and `/-/svc/` routes. HTTPS/certificates/renewal remain its owner's
responsibility. Infra readiness proves native private ingress, not external TLS;
actual host Nginx/CA/SAN and independent LAN denial were separately qualified.

Optional SMTP/DKIM composes the existing native stack. Application trust contains
only public CA and authorized submission secret. Queue and key ownership survive
backend failure; optional/required mail readiness is explicit. No-SMTP cold
backup/isolated restore is qualified. SMTP spool backup/restore fails closed with
`SMTP_RECOVERY_UNQUALIFIED`, with no invented preservation claim.

## Review reservation: existing global packaging CI debt

`scripts/check-packaging.sh` returns 10 passes and 2 failures on both the final
IL-5 tree and isolated baseline `3fb32d8`, with identical findings: legacy Team
image FROM entries without digests and global PM2 installation. IL-5 does not
introduce either failure or weaken that gate. The new profile has pinned images.
This technical feature review does not claim that repository-wide packaging CI
is fully green; the existing debt requires its owning distribution follow-up.

## Decisions still separate from technical review

- npm publication, release tagging, container registry publication and PR merges
  require their separate authorized release operation; none is performed here.
- Production proxy configuration, production credentials, target host binding
  verification and permanent deployment remain operator/consumer decisions.
- Oxy-form may resume OF-01R only through its own approved work, selecting the
  reviewed artifact/source and providing actual application plugins/config and
  controlled SMTP upstream credentials/recipient acceptance. Internet delivery,
  SPF/DKIM/DMARC deployment and bounce behavior are not IL-5 proof.
- SMTP spool restoration remains unsupported. No automatic secret reset,
  resource adoption, pruning, image/schema/engine downgrade is authorized.
- IPv6 publication is unsupported; actual isolation evidence is Docker 29.2 on
  the documented host topology and must be repeated on another target.
- Oxymotion D0 is neither started nor qualified. This application distribution
  does not replace Hub/MFS/Finder/crawling/agentic distribution acceptance.

## GitHub submission and environment observations

Both feature branches and evidence commits were pushed without rewriting history.
CLI creation initially returned `Resource not accessible by personal access token
(createPullRequest)`; the already-authorized GitHub connector created both PRs.
No credential was changed or additional user permission required. Neither PR is
merged. Existing CI reservations above remain visible.

Final resource inspection shows no IL-5-owned container or network remaining.
Testbox still has only the three previously observed stopped historical
initialization containers; no IL-5 service/resource was installed there. Build
images and the local npm archive are retained as explicitly identified review
artifacts. The cleanroom worktree remains clean.

## IL-5.8 security-review handoff (latest, 2026-10-18)

Latest status: **READY_FOR_SECURITY_REVIEW**. The earlier technical-review
handoff and old artifact receipts above are retained as history. The
[IL-5.8 disposition](IL-5.8-sonar-disposition.md) now governs the security reserve:
all initial findings examined; five shipped corrections preserve public behavior;
21 initial findings FIX_COMPLETED, five contextual false-positive proposals.
Four remain OPEN, including SMTP mandatory-STARTTLS proof. Reliability A/Security B
still means the Sonar gate fails. No automatic issue closure or owner acceptance.

Correction commit 744f995; final package/source f91253c1d034270af3c7815f514b1e8c91f78020.
A new unpublished alpha.3 local package has 40 files/98,736 bytes and SRI
`sha512-mwbKb02dvTHS7lthOXg+suJ7llUi88sT5e+GssHzqsZk4ajAE5P61YhrNg8kO+C/C8Q6F8t0vvoSSo5gLjW4Dg==`.
Use its [complete member inventory](evidence/IL-5.8/artifact.json), not the old npm
SRI. Declarations, exports and dependency locks are unchanged. npm pack/audit,
strict offline installed consumer and all mandatory regression suites pass.

Debian still selects c6ef6e9 with its original source-archive SRI: those bytes do
not contain IL-5.8 corrections. No Debian/Oxy-form/Runtime file was modified.
Owner-approved follow-up must select the exact new canonical source/archive
integrity or a separately authorized future npm release, preserve immutable
images/runtime pins and repeat new-selection consumer/cleanroom acceptance.
Do not substitute npm SRI for a GitHub source-archive SRI. Infra #2 still precedes
Debian #7; no merge-base change, merge, npm/image/tag publication, production
operation, OF-02 or Oxymotion D0 occurs here. Internet SMTP and spool restoration
remain unqualified and require their own controlled acceptance.

## IL-5.9 owner decision and blocked application (2026-10-18)

The owner explicitly approved the four remaining contextual false positives
(S8431, S5332, S7780, S9382). This supersedes the earlier pending-owner-decision
statement only; historical source/qualification evidence is preserved.
Application of those decisions is **BLOCKED_SONAR_PERMISSIONS**: the approved
S8431 transition returned HTTP 401 Authentication is required. All four issues
remain OPEN on independent readback, Security B/Reliability A, quality gate ERROR.
No comment, disposition, severity/rule/protection change or passing gate is claimed.

[IL-5.9 closure attempt](IL-5.9-sonar-closure.md) retains exact IDs, justifications,
response/readback evidence and the four remaining individual operations. The
mission's access stop rule prevents starting Debian realignment/requalification;
Debian still selects historical c6ef6e9 and has not received the IL-5.8 fixes.
Resume with an authorized Sonar interface or individually verified owner actions,
then verify/re-lock f91253c and execute the required new-selection qualification.
No merge, publication, production/Oxy-form operation or D0 is authorized/performed.

## IL-5.9-A — GitHub security migration (latest)

Native GitHub CodeQL default setup is retained and actually runs on PR #2, with
successful result upload/processing. The versioned read-only Quality workflow
passes unit/contract/lint/dependency/package jobs after a pure snapshot UID/GID
portability correction. ESLint has zero errors/new findings and 65 visible
reviewed warnings; npm production/development audits report zero advisories.
Weekly Dependabot proposals and QUALITY_POLICY.md are configured, without
required-check/protection changes, automerge, publication or deployment.

Full alert inventory/setup reads remain HTTP 403 for the available PAT. Latest
review status is **BLOCKED_GITHUB_PERMISSIONS** for security-result review and
**SECURITY_MIGRATION_INCOMPLETE** for decommissioning. Do not equate a successful
scanner job with zero alerts. Sonar remains externally active with the historical
owner-approved cases retained: three are still OPEN; S8431 is now externally
reported CLOSED/FIXED despite unchanged Dockerfile, not an extra agent correction
or an applied False Positive disposition. Its earlier history is preserved.
Owner access/review is needed before authorizing external Sonar cleanup.

[Audit](IL-5.9-A-security-tooling-audit.md),
[migration and coverage](IL-5.9-A-sonar-migration.md),
[qualification](IL-5.9-A-qualification.md) and [quality policy](QUALITY_POLICY.md)
record exact evidence, limits and follow-up. The package implementation/types/
exports remain identical to f91253c, but changed package.json dev-tool metadata
has new npm SRI `sha512-ZZIxqtHsFA0tCwAR6vcGa3iOttFYTkHCS4rKN4UtPApLPDkq41FJ0xJWKfWLEWVUlvM3JZldb1aGrhyKMiM9Pw==`.
No old integrity is reused, and Debian's locks/code/PR are not modified. Infra
still precedes Debian; no consumer realignment, Oxy-form unblock or D0 is claimed.
