# IL-5.9-A qualification

Status: **READY_FOR_GITHUB_SECURITY_REVIEW**. Decommission state:
**SONAR_EXTERNAL_CLEANUP_REQUIRED**. Analysis, publication and the accessible
published PR result check are qualified; broader Security REST inventory and
alert administration remain unavailable. Sonar is still active. This is not a
claim of zero repository-wide alerts or merge/publication authorization.

## Source and changes

Initial source 33869fe0f63e0bf47e4eb1e6290de0311a6aa2da. Qualified implementation/
workflow revision a9decbab4c6314538995f1005eefd5804fcbe709; final unshipped
security-harness revision d5b380b18448a55941748409ab28cf359d0cdd61:

- d6b6675: audit and initial/reviewed diagnostics.
- 233b2c8: native CodeQL contract, without duplicate advanced workflow.
- df82db1: exact ESLint/YAML dev pins, flat CommonJS config, visible baseline,
  lint gate, npm scripts and meaningful tooling tests.
- 1fde1a3: weekly npm/application-fixture/Actions Dependabot proposals.
- b6dc1b3: read-only Quality workflow and explicit owner quality policy.
- a9decba: pure golden-fixture runner UID/GID portability, with unchanged expected
  digests and a distinct-owner regression.
- d5b380b: fixed SSH client program with JSON data over stdin, instead of generated
  JavaScript; two actual-process/socket regressions and real LAN/application rerun.

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
| npm test | 161 TAP passed, zero failures/skips; original 153 plus eight tooling/portability/network cases |
| npm run test:contracts | 24 TAP passed; overlaps npm test, not added to its count |
| npm run lint | 0 errors; 65 reviewed warnings printed; 0 new findings |
| npm audit --omit=dev | Zero advisories; production dependency set empty |
| npm audit --include=dev | Zero advisories at qualification time; not a permanent security guarantee |
| npm run test:package | 40-file allowlist, secret/import/dependency guard and isolated offline package exports pass |
| npm pack from clean GitHub clone | Same SRI as installed-consumer artifact; old implementation/types compared byte-for-byte with f91253c |
| IL5_APP_IMAGE=sha256:b98ae69b0a39ce4edb26fefa2a60ba28620ab12fe6ccd28d2f6daade4be6901d IL5_TSC=/tmp/drumee-il4-typescript/node_modules/typescript/bin/tsc node test/application/package-consumer.js | Eight functional assertions; strict NodeNext types; actual private idempotent preparation; no activation |
| Workflow YAML / lint rule failure tests | Included in 161 TAP; validated events, read-only token, SHA actions, no secret/publication/failure override and diagnostics on unsafe flow/undefined names |

The clean clone was installed at b6dc1b3 and fast-forwarded without unrelated
changes to a9decba, then d5b380b for the final 161-test replay; package bytes remain
identical after both test-only corrections. Its source and archive hashes are in artifact.json.

Heavy gateway 17, services 17, lifecycle 16 TAP, HTTPS/jobs four scenarios
and the one gateway Chromium case remain **retained IL-5.8 evidence, not freshly
executed here**. Their owning implementation/fixtures, Runtime pin and old lock
entries are unchanged. The pure snapshot input correction is confined to unit
equivalence tests. The network-harness correction is separately requalified by
actual application acceptance, not hidden behind retained evidence.

Fresh command after d5b380b:
`IL5_NETWORK_CLIENT=testbox IL5_LAN_ADDRESS=192.168.5.201 IL5_HOST_NGINX=/tmp/drumee-il5-host-nginx/usr/sbin/nginx npm run test:application`.
Project drumee-il5-6249c0ab passes **87 assertions in 11 groups**, zero failures or
skips. Two remote assertions (positive nonce route plus application LAN refusal)
are included, not counted again. Docker/ss observe strict loopback; the independent
testbox client observes ECONNREFUSED. Real host Nginx CA/SAN, public RPC/403,
restart, interruption/recovery, rollback, owner/tamper refusal, isolated no-SMTP
restore, SMTP STARTTLS/SASL/relay refusal, private DKIM/no mail host ports and
SMTP_RECOVERY_UNQUALIFIED all pass. Queue/secret generations survive backend
failure. Owned projects are cleaned. No Internet delivery/spool restore or new
browser scenario is claimed. Application evidence records exact source d5b380b.

## Actual GitHub Actions, not simulated checks

Quality workflow: pull_request to main; pushes to main/feat/**; weekly schedule;
manual trigger. Only contents:read, ubuntu-24.04, Node 22.22.0. checkout v6 is
pinned d23441a48e516b6c34aea4fa41551a30e30af803; setup-node v6 is pinned
249970729cb0ef3589644e2896645e5dc5ba9c38. No persisted checkout credentials,
production secrets, pull_request_target, publication, deployment or automerge.
Any command error fails its job; no continue-on-error or forced-success wrapper.

Initial five-job qualification passed on a9decbab. Final security-corrected
source d5b380b has these fresh runs:

- [Quality PR run 39132936389](https://github.com/drumee/infra-layer/actions/runs/39132936389):
  unit, contracts, eslint, dependencies and packaging all SUCCESS.
- [Quality push run 39132933283](https://github.com/drumee/infra-layer/actions/runs/39132933283):
  SUCCESS; repetition is not added to test counts.
- [Native CodeQL PR run 39132934220](https://github.com/drumee/infra-layer/actions/runs/39132934220):
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
workaround or runtime permission relaxation. That intermediate 159-test CI passes on GitHub's
actual owner; the later network correction adds two tests for the final 161. The failed attempt is excluded from success counts and its log hash
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

## Actual CodeQL findings and correction

The final initial-documentation HEAD af695929 exposed a separate GitHub Advanced
Security **result check**, distinct from the analysis job. Check 117688886564
reported **three new medium alerts**, despite conclusion success. Authorized
Checks API reads and annotations were available even though the Security inventory
APIs returned 403. This narrowed the initial permission-only assessment: the PR's
actual diagnostics could be reviewed without changing credentials or permissions.

All three are `js/bad-code-sanitization` (security severity 6.1), at old
application/run.js:39 columns 166/355/496. JSON.stringify values were inserted into
a generated JavaScript SSH program. Current validated IPv4/integer/hex inputs
restricted exploitability, but the source/data construction class was removed
rather than waived or dismissed. No new false-positive approval is manufactured.

Correction d5b380b sends a fixed checked-in network-client.cjs program to remote
Node and sends its inputs as JSON **stdin data**. Input shape/size validation is
explicit. There is no input-dependent source construction. Tests prove that
code-shaped inputs are rejected as data, an accessible application fails the
negative test, a closed port is refused after a valid control route, and a wrong
nonce fails. Real independent-LAN acceptance and all application lifecycle checks
were rerun (87 assertions). No runtime/public contract or security rule changes.

CodeQL result check **117691792450** on d5b380b reports
**No new alerts in code changed by this pull request**, with zero annotations.
The query condition is removed by an actual data/control separation; resolution
is not inferred from line movement, job success or a hidden inventory. Earlier
three-annotation/check JSON and corrected result-check JSON are both retained.
The official rule context is https://codeql.github.com/codeql-query-help/javascript/js-bad-code-sanitization/.
This PR-scoped result is not a claim of zero existing/repository-wide alerts.

## Permissions, owner review and final decision

Execution, upload and PR result review via Checks are proven. Direct CLI GET
code-scanning/alerts, code-scanning/analyses, code-scanning/default-setup and
Dependabot inventory still return HTTP 403. Alert-state administration is not
attempted or inferred. The previous BLOCKED_GITHUB_PERMISSIONS assessment was
provisional until the authorized result-check surface exposed the actual three
diagnostics; its records are retained. No authentication workaround was used.

The chain is ready for GitHub security review based on observed runs, corrected
PR diagnostics and real acceptance. Owner still needs broader Security access
or an authorized review snapshot for the complete branch/repository inventory,
native setup/suite and Dependabot enablement. This is explicit review scope, not
an assertion that inaccessible alerts are absent. Check title/annotations must
always be reviewed: success alone previously coexisted with medium alerts.

After owner security review, repository-scoped external Sonar cleanup remains a
separate administrative operation. This mission leaves Sonar active and preserves
all historical evidence. No merge, release, production operation, Debian change,
Oxy-form resumption or D0 occurs.

## Closing observation

The documentation HEAD 869897df has all five Quality jobs and native CodeQL
analysis successful; separate result check **117693571717** reports no new alerts
in changed PR code. The closing evidence commit changes only reports/JSON; its
final SHA/check outcome is identified in the execution handoff.

Final Sonar readback still has three logical OPEN cases. S7780 is now
`AaFPQwg-CiUwZk3hfrD2` at run.js:42, replacing `AaFOFe0GZ2pN_ZCiPhed` after the
harness edit. This is **not a fixed logical finding** or a new owner acceptance.
S9382 remains `AaFOFe0GZ2pN_ZCiPhee` at line 74; S5332 remains
`AaFGj__57h-_7ZHL5nVs` in the SMTP plugin. Closing snapshots and mapping retain
the actual states; no Sonar disposition or shutdown was performed here.
