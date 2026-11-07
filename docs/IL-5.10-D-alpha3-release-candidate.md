# IL-5.10-D — alpha.3 release candidate

Status: **RELEASE_CANDIDATE_QUALIFIED**, 2026-10-19. This is preparation for an
owner publication decision, not authorization or evidence of publication.
Stages A/B are PASS and the separate Debian convergence plan is documented.
[Canonical integration](IL-5.10-B-infra-integration.md) records the actual merge.

## Canonical source, metadata and lock

A fresh network clone of main is clean at
`9e4166618ca519e5d9b9e58f5191d37c5fd56462`. It is a merge of old main bef9a37
and qualified aa9057f, with the exact same root tree as aa9057f. No source,
package metadata, public contract or lockfile is changed during qualification.

Package: @drumee/infra-layer, version 0.1.0-alpha.3, CommonJS, AGPL-3.0-only,
Node >=22, public declarations and existing root/lifecycle/capability exports.
There are zero production dependencies. All declared development versions are
exact and agree with package-lock.json; clean npm ci succeeds. ESLint/YAML and
Runtime alpha.4 are development/test inputs, not production imports. The packed
40-member allowlist excludes tests/tooling/credentials/node_modules and retains
LICENSE, README, CHANGELOG and the historical provenance ledger. That ledger is
preserved as history; this report binds its exact bytes to the canonical merge.

## Exact artifacts

| Identity | Value |
| --- | --- |
| Canonical commit | `9e4166618ca519e5d9b9e58f5191d37c5fd56462` |
| Canonical source archive | `https://codeload.github.com/drumee/infra-layer/tar.gz/9e4166618ca519e5d9b9e58f5191d37c5fd56462` |
| Canonical source SHA256 | `8bacfbc856cbf49d3722b1a22e78d5c520fdb45215bf96831e6e3326f7513468` |
| Canonical source SRI | `sha512-avsnkxzQulvLzyG7JNtXvvDygm0HTTtxdsv82TTEjx9RrIfQfut7xLwFmX7XGQDMa4Ht7g02tc9ENpPWrGEgyw==` |
| npm candidate | `@drumee/infra-layer@0.1.0-alpha.3` |
| npm filename / packed size | `drumee-infra-layer-0.1.0-alpha.3.tgz`, 98,808 bytes |
| Unpacked / allowlist | 353,683 bytes / 40 ordinary files |
| npm SHA256 | `7385ee7acbc6582746b2f8d8713ce174f7136e7531e7e57221df06a15c906a75` |
| npm SHA1 | `26aaf59f95825710a16e854246e1c35e5450c0ba` |
| npm SRI | `sha512-ZZIxqtHsFA0tCwAR6vcGa3iOttFYTkHCS4rKN4UtPApLPDkq41FJ0xJWKfWLEWVUlvM3JZldb1aGrhyKMiM9Pw==` |

The fresh canonical source archive has 260 safe members; all 225 file bytes match
Git and the previously locked aa9057f source. Root names/archive metadata change
with the Git revision, so the two **source** SRIs differ. The npm candidate packs
normalized allowed members and remains byte-identical to the earlier qualified
candidate. The old npm SRI was verified again, not blindly reused for different
bytes. Two independent npm pack invocations in the clean checkout produce
byte-identical archives. Each allowed member also matches Debian's active
per-file source receipt. The full file/size inventory and source relation are in
[evidence](evidence/IL-5.10/D-release-candidate.json).

## Executed qualification

From the clean canonical clone (Node 22.22.0/npm 11.18.0):

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run test:contracts
npm run lint
npm run test:package
npm audit --omit=dev --json
npm audit --include=dev --json
npm pack --ignore-scripts --json --pack-destination /tmp/drumee-il510-evidence
# Save the tarball, repeat pack, and compare bytes/SHA256/SRI/member hashes.
```

| Control | Actual result |
| --- | --- |
| Unit TAP | 161 passed, 0 failed/skipped |
| Public-contract TAP | 24 passed, overlapping subset of the 161; not added to that total |
| ESLint | 0 errors, 65 visible reviewed historical warnings, 0 new diagnostics |
| Package audit | 40-member allowlist, secret/import/dependency checks and offline installed-consumer guard passed |
| Production / development npm audit | 0 reported vulnerabilities in both scopes |
| Canonical installed consumer | 8 functional assertions and strict TypeScript 5.9.3 NodeNext passed |
| Additional installed-contract negatives | 6 refusals passed; development tools/Runtime absent from that consumer |
| npm pack replay | Byte-identical tarballs, exact qualified integrity |

Quality run [39254718852](https://github.com/drumee/infra-layer/actions/runs/39254718852)
on the canonical merge has all five jobs SUCCESS. Native CodeQL
[main execution 39254717741](https://github.com/drumee/infra-layer/actions/runs/39254717741)
succeeds and publishes its analysis. Dependabot config and three ecosystem
update jobs succeed. Their visible notices concern the ubuntu-latest runner-image
migration, not a new security finding. Scoped PR result aa9057f has no new alerts;
full Code Scanning/Dependabot inventory APIs are still HTTP 403. Do not turn
successful execution into a zero-global-alert claim. The broader legacy Sonar
inventory and failed gate remain reservations detailed in the B report.

The canonical installed-consumer command is:

```sh
IL5_APP_IMAGE=sha256:d44327e37d37c612257822684a870d05d7f90fdae649b2dcbfb8e9f0566e7955 \
IL5_TSC=/tmp/drumee-il510-types/node_modules/typescript/bin/tsc \
node test/application/package-consumer.js
```

It packs the canonical source, installs that exact tarball in a private temporary
project and compiles/imports only its public package. JSON inputs are supplied;
there is no sibling-checkout module import. Preparation creates real private
owned resources/secrets and repeats idempotently, without application activation.
The identified Debian acceptance image was actually present and inspected; no
made-up image ID or fallback application is substituted.

A second offline consumer installs the exact tarball with no production graph
beyond Infra. Six runtime contract negatives cover public binding, IPv6,
wrong RPC prefix, mutable image, undeclared dependency and unauthorized secret
mount. It verifies package resolution inside its own node_modules and absence
of development tools. The [driver](evidence/IL-5.10/D-negative-consumer.cjs)
expects its inputs.json from the canonical pure application fixture.

An initial **extra harness** check mistakenly resolved fs.existsSync against the
source checkout's working directory, where ESLint is correctly present as a dev
tool. That assertion failed; it is preserved in the evidence/log history. The
check was corrected to anchor its filesystem and package resolution assertions
to the isolated consumer directory, then all negatives and absence checks passed.
No production dependency, package source, validation or baseline was modified to
make it pass. All mandatory canonical quality commands passed on their first D
run. No skip or failed canonical suite is hidden.

## Reused heavy evidence and limits

No new LAN/HTTPS/SMTP/browser/application-activation or complete lifecycle run is
claimed in D. Existing Infra 87 real assertions and Debian 126 clean-clone
assertions remain their original source/image/input-bound evidence. All 225
canonical source files equal the aa9057f input tree, all 40 npm members equal the
consumer receipt, and Debian's Runtime, source lock and execution path are
unchanged. Its exact integrated tree was independently audited in A. This is why
those existing integration proofs remain applicable; repeated unit/contract
runs are not inflated into additional heavy scenarios.

SMTP queue persistence is not qualified spool recovery or Internet delivery.
The refusal SMTP_RECOVERY_UNQUALIFIED remains active. Security/protection/tool
administration is unchanged. The complete legacy Sonar inventory is not covered
by the four accepted logical false positives; broader owner triage and the
limited Security/Dependabot visibility remain explicit publication-review inputs.

## Debian relation and future registry migration

Debian integrated merge 1ff957f/delivery 490c4b0 still selects aa9057f, source SRI
`sha512-faoNlMWBO05FM+ozsuGu9tqFgq/IYc9WJwb4KCyZcZiTlEIrgJ9QLqLxslTADdipaItg02r2f6qFG07HDxhVqA==`.
That source is reachable through the canonical merge ancestry and still available
by exact commit. Its archive integrity must not be replaced by the new canonical
archive SRI or the npm tarball SRI. Neither Debian profile's lock is changed.

Registry verification on 2026-10-19 lists stage/alpha.1/alpha.2 only; next remains
alpha.2 and latest alpha.1. Alpha.3 is not published by anyone in the observed
registry inventory and is not published by this mission. Future owner-approved
publication must recheck version availability, canonical source mapping, exact
allowlist/SRI, publisher access and security/debt decisions. Do not overwrite an
existing version, silently promote latest or publish tags/images alongside it.
If any shipped bytes change before publication, pack and qualify a fresh receipt.

Only after actual publication and registry download/SRI/source verification may
a separate Debian change choose exact npm alpha.3, regenerate its lock/provenance
checks and repeat installed-consumer/build/network/security/lifecycle acceptance
for the new acquisition path. Keep Runtime alpha.4 explicit and minimal-kernel
pins untouched. Integration into Infra main does not itself require that migration.

The local candidate is retained at
/tmp/drumee-il510-evidence/drumee-infra-layer-0.1.0-alpha.3.tgz. It is not committed
or uploaded as a release artifact. Recreate it from the exact canonical commit
if the disposable environment expires. No npm/image/tag release occurs here.


## Documentary closing checks

[Evidence PR #10](https://github.com/drumee/infra-layer/pull/10), at
da42c0f3e1ce46419ec4895815a540f592e6b4d8, has all five Quality jobs and CodeQL
SUCCESS, with no new changed-code alert. Its Sonar check also passes because
that PR has only documentation/evidence changes; this does **not** clear the
canonical main gate or close its 227 historical records. A post-documentation
local lint still reports 0 errors/65 visible baseline warnings/0 new findings,
and pack retains the exact candidate SRI. The new closing ledger/evidence does
not change shipped files. [Check snapshot](evidence/IL-5.10/closing-documentary-ci.json).
