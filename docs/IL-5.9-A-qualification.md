# IL-5.9-A qualification

Status: **BLOCKED_GITHUB_PERMISSIONS** for security-result inventory review;
**SECURITY_MIGRATION_INCOMPLETE** for Sonar decommissioning. New local/Actions
controls pass. This is not a claim that GitHub's inaccessible alert inventory is
empty, nor an authorization to disable Sonar, merge or publish.

## Source and changes

Initial source 33869fe0f63e0bf47e4eb1e6290de0311a6aa2da. Qualified implementation/
workflow revision a9decbab4c6314538995f1005eefd5804fcbe709:

- d6b6675: audit and initial/reviewed diagnostics.
- 233b2c8: native CodeQL contract, without duplicate advanced workflow.
- df82db1: exact ESLint/YAML dev pins, flat CommonJS config, visible baseline,
  lint gate, npm scripts and meaningful tooling tests.
- 1fde1a3: weekly npm/application-fixture/Actions Dependabot proposals.
- b6dc1b3: read-only Quality workflow and explicit owner quality policy.
- a9decba: pure golden-fixture runner UID/GID portability, with unchanged expected
  digests and a distinct-owner regression.

No shipped JavaScript, declaration, export, native runtime host, application
fixture lock, qualified image or production dependency changes. All existing
root lockfile package entries match 33869fe exactly. New tools are dev-only.
The only changed npm member is package.json (dev tools/scripts); fresh package
integrity is required despite unchanged runtime implementation. Debian, Runtime
and Oxy-form code/locks/PRs are untouched in this mission.

## Fresh local validation

| Command | Actual result |
| --- | --- |
| npm ci --ignore-scripts --no-audit --no-fund in fresh GitHub clone | Passed, integrity-bearing root lock; no sibling imports |
| npm test | 159 TAP passed, zero failures/skips; original 153 plus six tooling/portability cases |
| npm run test:contracts | 24 TAP passed; overlaps npm test, not added to its count |
| npm run lint | 0 errors; 65 reviewed warnings printed; 0 new findings |
| npm audit --omit=dev | Zero advisories; production dependency set empty |
| npm audit --include=dev | Zero advisories at qualification time; not a permanent security guarantee |
| npm run test:package | 40-file allowlist, secret/import/dependency guard and isolated offline package exports pass |
| npm pack from clean GitHub clone | Same SRI as installed-consumer artifact; old implementation/types compared byte-for-byte with f91253c |
| IL5_APP_IMAGE=sha256:b98ae69b0a39ce4edb26fefa2a60ba28620ab12fe6ccd28d2f6daade4be6901d IL5_TSC=/tmp/drumee-il4-typescript/node_modules/typescript/bin/tsc node test/application/package-consumer.js | Eight functional assertions; strict NodeNext types; actual private idempotent preparation; no activation |
| Workflow YAML / lint rule failure tests | Included in 159 TAP; validated events, read-only token, SHA actions, no secret/publication/failure override and diagnostics on unsafe flow/undefined names |

The clean clone was installed at b6dc1b3 and fast-forwarded without unrelated
changes to a9decba for the 159-test replay; package bytes remain identical after
the test-only correction. Its source and archive hashes are in artifact.json.

Heavy gateway 17, services 17, lifecycle 16 TAP, application 87 assertions,
HTTPS/jobs four scenarios and the one included gateway Chromium case remain
**retained IL-5.8 evidence, not freshly executed in this mission**. Each owning
implementation, real application/lifecycle fixture, Runtime pin and existing
lock entry is unchanged. The only pre-existing test modification affects a pure
snapshot input used solely by unit equivalence tests. It neither changes the real
owner-bound fixtures nor touches network/TLS/permissions/secrets or recovery.
The identity checks and new unit/installed-consumer evidence justify reuse under
the mission's explicit heavy-test exception. No fresh browser or LAN success is
invented. Existing per-host Docker topology/requalification limits still apply.

## Actual GitHub Actions, not simulated checks

Quality workflow: pull_request to main; pushes to main/feat/**; weekly schedule;
manual trigger. Only contents:read, ubuntu-24.04, Node 22.22.0. checkout v6 is
pinned d23441a48e516b6c34aea4fa41551a30e30af803; setup-node v6 is pinned
249970729cb0ef3589644e2896645e5dc5ba9c38. No persisted checkout credentials,
production secrets, pull_request_target, publication, deployment or automerge.
Any command error fails its job; no continue-on-error or forced-success wrapper.

On a9decbab:

- [Quality PR run 39130991341](https://github.com/drumee/infra-layer/actions/runs/39130991341):
  unit, contracts, eslint, dependencies and packaging all SUCCESS.
- [Quality push run 39130987758](https://github.com/drumee/infra-layer/actions/runs/39130987758):
  SUCCESS; repetition is not added to test counts.
- [Native CodeQL PR run 39130988786](https://github.com/drumee/infra-layer/actions/runs/39130988786):
  SUCCESS; actual JavaScript/TypeScript extraction/query execution, successful
  upload and completed GitHub server processing. Scanner/query inventory is
  retained in codeql-pr-summary.json.

Native setup supplies separate scan permissions, including security-events:write,
and its own managed action/runtime versions. There is no repository CodeQL YAML
claiming to configure those inaccessible native settings. Relevant JS source and
test scripts are not globally excluded. The documented query inventory supports
coverage assessment, not equivalence to every Sonar rule or to dynamic ACL/TLS/
Docker isolation. Raw diagnostic-count zero is not treated as zero security alerts.

Fork PRs do not receive extra permissions from Quality. This mission observes
same-repository push/PR runs, not a fabricated fork or post-merge/main Quality
execution. Dependabot configuration is validated here; scheduled proposals start
from its eventual default-branch integration. No actual Dependabot alert-enabled
state is claimed from an unreadable endpoint.

## Initial failure retained

[First Quality PR run 39130724308](https://github.com/drumee/infra-layer/actions/runs/39130724308)
failed unit 157/158 on b6dc1b3; the other four jobs passed. Its push run had the
same failure. The pure SMTP composition snapshot inherited process UID/GID from
serviceInputs: local owner 1000, GitHub owner 1001. The expected digest was not
portable. Pinning only that pure snapshot's DKIM input to 1000:1000 preserves the
original expected bytes. A mocked 1001/1002 owner regression verifies all 32
outputs/error codes, with no golden regeneration, test removal, skip, CI UID
workaround or runtime permission relaxation. Final 159-test CI passes on GitHub's
actual owner. The failed attempt is excluded from success counts and its log hash
is retained. CodeQL was already successful at the earlier revision.

## Candidate and provenance

Unpublished @drumee/infra-layer@0.1.0-alpha.3 remains a local-only candidate.
New npm SRI:
`sha512-ZZIxqtHsFA0tCwAR6vcGa3iOttFYTkHCS4rKN4UtPApLPDkq41FJ0xJWKfWLEWVUlvM3JZldb1aGrhyKMiM9Pw==`.
The complete pack list, sizes, SHA256, selected clean source, unchanged-member
checks and installed-consumer result are under docs/evidence/IL-5.9-A/. The
previous mwbK... npm SRI identifies IL-5.8 metadata, not these new package bytes.
All npm dependencies remain development-only; neither ESLint nor YAML is a
production import/dependency. No lock/source selection in Debian is changed.

## Missing permissions and final decision

Actions execution and Code Scanning publication are proven; full Security alert
reading is not. CLI GET code-scanning/alerts, code-scanning/analyses,
code-scanning/default-setup and dependabot/alerts return HTTP 403. Successful
CodeQL execution cannot establish zero significant alerts or disposition them.
The accessible main check annotation is only an Ubuntu runner migration notice,
not a security result inventory. No scanner finding state is modified.

Owner must provide an authorized review/snapshot or a connection with Code
scanning alerts:read and Dependabot alerts:read; verify native setup/suite and
Dependabot enablement in repository Security settings. Alert administration and
branch-protection changes are separate, not inferred from repo admin metadata.
Until review is possible, do not pronounce the security migration complete or
disable the external Sonar check. No new runtime defect is demonstrated by these
permission failures, and all independent implementation/qualification work is
complete. No merge, release, production action, Oxy-form resumption or D0 occurs.
