# IL-4 distribution stabilization checkpoint

Status: **IL-4 — INTEGRATION_BLOCKED**. IL-3 remains approved for its documented
minimal disposable Docker profile. This report does not promote that fixture
to a production installation.

## Starting revisions and ownership

| Repository | Branch | Inspected starting revision |
|---|---|---|
| drumee/infra-layer | main | `6516c70349cc02bacffac565b5e103e660f970aa` |
| drumee/transient | refactor/mapping | `c5ee4591c87e7be2a7d91398cfcaa277787558e0` |
| drumee/debian | feat/container-distribution | `8a236e5d147a55cfd5580dcda0712cd6436ca93c` |
| drumee/debian | main, fetched/inspected | `b8b0ebe7082e1ad2366f3a7997712f5da5bba127` |

Infra Layer remains the only infrastructure lifecycle implementation. Debian
owns future operator dispatch, immutable host/frontend selection and supplied
initialization jobs. The minimal-kernel control plane owns identity and Hub
provisioning. No kernel or historical source was modified.

## Implemented correction

`lifecycle/composition.js` previously appended distribution resources in input
order, while returning a distribution record with sorted resources. Its own
`verifyComposition()` regenerated a different resource order and rejected valid
unsorted input as tampered. Normalize only the distribution resource iteration
before deriving the inventory. Preserve the original infrastructure resource
prefix, so existing sorted IL-3 descriptors retain their representation.

Implementation commits:

- `070224b9048541f82ed819d65a458cc075b96d1f`: composition normalization regression.
- `2d1f6aa6774f70f1d3cfc00f47a94ecf4133e314`: preserve legacy infrastructure order.
- `adf56e04961c3974e0bd0ad481b1700a15d99c09`: validate malformed records before
  sorting, preserving stable diagnostics instead of leaking a JavaScript TypeError.

The regression checks permutation equivalence, immutable input, self-verification,
historical prefix order and continued tamper rejection. No API/type/contract
version change; the five root functions and explicit lifecycle subpath remain
compatible. Planning/rendering do not gain side effects.

## Distribution inventory and SQL evidence

Debian checkpoint `4382c96d3362ed9eadce67cb59b18aaeb5e00ed9`,
`profiles/minimal-kernel/dependency-manifest.json`, inventories all 213 fixture
npm artifacts (53 production), seven private transitional modules and 71 acquired
source files. Immutable source revisions, SHA-512 archive integrities, Git blob
IDs, SHA-256 file digests, roles, owners and license metadata limitations are
explicit. This is an audited input inventory, not a new installation channel or
a claim that every tarball has been independently downloaded by the validator.

Transient checkpoint `96acf364841b7556e4bce34b96be592b6fc94a38`,
`tests/integration/infra-il4/sql-boundary.test.js`, proves on real disposable
MariaDB that runtime authentication/session resumption and MFS routines can use
a restricted account separately from schema/bootstrap/Hub provisioning.
Runtime CREATE DATABASE, unrelated-schema access, infrastructure user changes,
identity/privilege edits and Hub ACL deletion are denied. Anonymous Hub creation
fails through the actual kernel control plane. Test-only identity SQL is clearly
marked and never exposed as an installation API.

The tested grant set is a starting policy, not complete production qualification:
all actual runtime paths, dynamic per-Hub grants, credential rotation and SQL
DEFINER restoration still require whole-distribution acceptance.

## Exact integration blocker

At selected transient source `5469b48109dbb20eacbbc9314a6772264b388843`:

- `target/control-plane/bootstrap/lib/index.js::bootstrap()` provisions only
  organisation 1 and nobody/guest/system. Read-only validation confirms these
  invariants; it is not human enrollment.
- `target/control-plane/bootstrap/lib/store.js::createPrincipal()` is a system
  identity primitive: system area/status and empty fingerprint, no human
  credential policy or initial-operator authorization/idempotency contract.
- `target/control-plane/hub-lifecycle/lib/index.js::sessionPrincipal()` requires
  an authenticated human and rejects reserved platform identities.
- The real server-runtime session/schema owner authenticates existing
  credentials; its yp service exposes signin, not first-account provisioning.
- `target/distributions/minimal-kernel-il3/lib/initialize.js` inserts disposable
  owner/reader/outsider identities and SHA-512 fingerprints directly. Reusing
  that acceptance bypass as product initialization would cross the approved
  ownership boundary.

The real SQL probe confirms exactly three empty-fingerprint platform identities,
idempotent bootstrap and failed nonempty-password login for all three. This is
evidence of the missing enrollment contract, not a failure in Infra Layer TLS,
DNS or database availability.

Required owner decision: approve/provide a narrow canonical control-plane
first-operator operation (proposed location in transient:
`target/control-plane/operator-bootstrap`). It must own authorized enrollment,
human credential encoding/policy, canonical privilege assignment, stable
operation/identity ownership, conflict/interruption recovery and read-only
validation. Debian then invokes that operation as an explicit initialization
job using separate privileged SQL projections. No new public package release
or kernel change is silently authorized by this report.

The detailed contract proposal and migration analysis are in Debian
`docs/minimal-kernel-il4.md`. Product profile activation and release qualification
stop at this boundary; no permissive identity mock substitutes for it.

## Qualification performed

From a fresh standalone checkout of implementation `2d1f6aa…`:

```sh
npm ci
npm test
npm run test:integration
npm run test:package
```

The standard integration runner executed its four suites with normal pinned
GitHub acquisition, without a sibling-source transport override:

| Suite | Passed | Failed | Skipped |
|---|---:|---:|---:|
| Standalone unit/security contracts | 124 | 0 | 0 |
| Nginx/kernel/FileIo/WebSocket/upload/Chromium | 17 | 0 | 0 |
| Native BIND9/MariaDB/Redis/SMTP/DKIM | 17 | 0 | 0 |
| Lifecycle activation/persistence/recovery/rotation | 16 | 0 | 0 |
| HTTPS/renewal/failure retention/init jobs | 4 scenarios | 0 | 0 |
| Transient runtime/FileIo/MFS/transfer/media baseline | 68 | 0 | 0 |
| Current standalone Finder suite | 31 | 0 | 0 |
| Preserved IL-3 distribution unit tests | 4 | 0 | 0 |
| New SQL privilege/bootstrap boundary probe | 7 including parent | 0 | 0 |
| Debian inventory security tests | 8 | 0 | 0 |
| Existing Debian lightweight checks | 330 checks | 0 | no reported skips |

Finder's current npm test includes 31 tests; do not silently relabel the older
27-test core count as the current entire suite. Repeated unit/lifecycle runs
are not additional unique coverage. The first SQL probe failed on an incorrect
test query column (`expiry_time`); the probe now invokes the unchanged canonical
OTAK expiry method, and its complete rerun passes. Initial sandboxed Node tests
could not execute their intended subprocesses; the recorded counts come from
the successful normal-permission reruns.

Package audit: 38 allowlisted production/license/documentation files, zero
runtime npm dependencies, no private keys/credentials/local-path imports,
offline packed-consumer import and representative planning succeed. The
archive remains an **unpublished development artifact**, not qualified alpha.2.

The actual IL-3 distribution fixture was rerun in a fresh transient clone at
`96acf364841b7556e4bce34b96be592b6fc94a38` against a local npm pack of
`2d1f6aa6774f70f1d3cfc00f47a94ecf4133e314`, integrity
`sha512-epjbLJrHxjAT+7ayv1h0BDSlhU8p6KKuotsvgbQZxB+aOa1/sdn/VN1eSDLRA4zZVZQcplwH53Z0IOShLf2wIQ==`.
It was installed explicitly with `npm install --no-save --package-lock=false`
after npm ci, only in the disposable clone; it is not registry alpha.1.
All 25 grouped checks (9 fresh, 8 restart, 8 isolated restore), three Chromium
stages and actual interrupted Redis rotation recovery pass. Project
`drumee-il3-kernel-498823b7` used loopback HTTPS 46345 and DNS 38657; the restored
project used separate high ports. Both projects, images and temporary durable/
backup state were cleaned. The unchanged fixture still uses approved test-only
identity initialization, so these are compatibility results, not production
operator enrollment qualification.

## Release and operational limitations

Registry inspection on 2026-10-15 still lists `0.0.0-stage` and
`0.1.0-alpha.1`; both next/latest point at alpha.1. That published alpha.1 is
IL-1.1 and does not contain lifecycle APIs. A future candidate can use
`0.1.0-alpha.2`, subject to registry reinspection and complete qualification.
No version/tag/dist-tag was changed and no npm/image publication occurred.

IL-4.1 delivers an input inventory, not a release-usable artifact acquisition
and build channel. IL-4.2/3 provide the integration/SQL analysis and probe, not
the completed production profile or full least-privilege claim. IL-4.4–6 remain
unqualified: new operator commands, genuine first-admin clean install, complete
restricted-role browser acceptance, restore/rollback with those roles and the
IL-4 remote/LAN profile must follow the missing contract. The IL-3 remote/LAN
results are prior evidence and are not counted as new IL-4 acceptance.

SMTP remains outside the qualified full-recovery profile. Existing limitations
remain: same-engine-version compatible rebuilds, no schema downgrade by image
tag, cold coordinated owned-writer backups, no automatic trust/DHCP/resolver
changes, no installed automatic renewal scheduler, single process-local transfer
backend. No IL-4 testbox deployment or Oxymotion deployment was made.
