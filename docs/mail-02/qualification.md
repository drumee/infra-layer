# MAIL-02 final isolated qualification

**MAIL-02_QUALIFIED for the isolated transport configuration.**
The Debian ShellCheck and packaging gates are corrected without relaxing either
control. The rebuilt native image is independently requalified on the workstation
and Docker26 guest. All20 transport matrix rows and both45-control native replays
pass. Read the [CI closure addendum](ci-closure.md) for the exact base comparison,
new image, diagnostic inventory, green hosted jobs and impact analysis. Current
machine evidence is in [ci-closure-2026-11-13](evidence/ci-closure-2026-11-13/).

The remainder records the previous native checkpoint and its mechanisms; older
image/checkpoint identities and evidence remain historical. The current image is
`sha256:ab41ba434fa20afd54f71f43fc31ad2aaa94260193a4e9b56cc0e5c971fb1a56`;
the quota module and frozen package remain byte-identical. Both PRs remain drafts:
[Infra38](https://github.com/drumee/infra-layer/pull/38) and
[Debian13](https://github.com/drumee/debian/pull/13). Deployment and restoration
qualification are separate decisions.

## Audited and tested identities

Remote branches were fetched before work and before non-force pushes. Requested
Infra `4a9a77d451f254721404c19af86c118305023be1` and Debian
`0fc183eabc8e6634a355689d9c129b8fbbd4ac38`, plus the earlier `490525d…`/`b5a9c70…`
checkpoints, remain ancestors. No remote changes were discarded. MAIL01 remains
Infra PR36 `2328b28b126355e40f18815e74c20e203ca6388f` and Debian PR12
`3c91036f95528e3f9baa04cb78b2b74ae96f63a1`. The distribution base is
`ff6e6b399128e6332c984fc2e8e60f660bd5f881`, on the container-distribution lineage.
Historical `74f72c9` remains unavailable; no new provenance is invented for it.

| Input | Exact identity |
| --- | --- |
| Infra runtime/test checkpoint | `0c8d0edb69183e9b87725e127ab8b15f4cf1e8cd` |
| Debian runtime/test checkpoint | `2497f4da4cafe645598fdf0cda1aaa2c15d7aff4` |
| Supplemental expunge/retry driver | Debian `54773065d6d9c348e601e2f2366b3fb614235297` |
| Frozen producer | `de5ea272fe40c77dded529d03ef3ce1f174472ab` |
| Package | `@drumee/infra-layer@0.1.0-alpha.7-mail02.15`, unpublished local archive |
| Archive SHA256 | `03a1402e447015e20b41900b05edfda00ea0ea01ae3b5e7b358b7d88d071aa99` |
| Archive SRI | `sha512-8c1USs/xiRNZPk34jX+xt/HVQ36saPgY5HXOBiM19iuF0lbTlUntslkcw0rwlWDHDSy9L+H3A0HEMgDlZdXiSQ==` |
| Native engine OCI config ID | `sha256:f2b46de95f1fc1abf4d1d9b9acd8512ab6caa0d448b084690dd1d19988a6af2f` |
| Native quota module SHA256 | `01fec4a55d42add0d62b939216bec57869513b2dab6b55c83ae51c93dd22f4c5` |
| Quota patch SHA256 | `fe15d849056a10a8337c5cfd2af8ba694fcc7a2109ab2a657882908466b6ff31` |
| Transaction-lock source SHA256 | `a41004a2292f2dc229f015facf30e0c8ad0a405fab5ec86e0f9e6a7ae2f88c36` |
| Dovecot upstream | `7d8c0e57599636cff365373ca1ce34e92aac0e25` (2.4.1) |
| Native base config ID | `sha256:a02cc47d0ebca12a55759edb00757b3a8cdd00112ad4afe9a4ff7b5337ffe843` |
| Python client/MX helper config ID | `sha256:36afa984f1187ff7fef17356fa7ead13af9a756681ac4a0c234a58fdc38f47e8` |
| Node helper manifest | `node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392` |
| Same Node config ID | `sha256:d0a16be756b6ec6658aecb8b7bcf87fa6c7d0d7fcc6ca53ad14bb49a4c90bdd7` |
| Native image export SHA256 | `dcb62319e078eda329c0ac9d0aac30c5165227846ceffc95abe8fa12282afb7c` |

These are local image config identities, **not registry manifest attestations**.
No package/image was published. [Archive inventory](evidence/requalification-2026-11-13/archive.json)
contains all50 member hashes and zero production dependencies. Capture/relay bytes
are unchanged. [Native receipt](evidence/requalification-2026-11-13/native-image.json),
[version receipt](evidence/requalification-2026-11-13/native-versions.json), and
[source audit](evidence/requalification-2026-11-13/native-source-audit.json) identify
the compiler inputs and module. All15 locked quota sources equal the Debian
source archive; Debian's patch set changes none of them.

Native versions: Postfix3.10.13, Dovecot2.4.1-4 (`1:2.4.1+dfsg1-6+deb13u7`),
OpenDKIM2.11.0. Postfix102:103/postdrop104, auth103:106, mail workers5000:5000.
Workstation: Docker29.2, Compose5.0.2, Node22.22.0. Dedicated Debian13 guest:
Docker26.1.5+dfsg1, kernel6.12.116+deb13-amd64, Compose5.0.2, Node22.22.0,
operator1000:1001. Qualification is linux/amd64 only. Its outer QEMU container has no network attachment or host
publication. All SMTP destinations are controlled `.invalid` laboratory peers.
Production was not mutated.

## Corrections and invariants

### Capacity across LMTP and IMAP

The stock `.4` baseline accepts1,150,509 virtual RFC822 bytes against1,048,576:
independent quota transactions snapshot the same capacity before storage commit.
Zero Dovecot grace does not serialize admission. The baseline was reproduced in
the Docker26 guest before edits; retained messages were not deleted.

The pinned replacement native module holds a stable-UUID-home `flock` from the
first capacity check through native storage commit/rollback. Every LMTP save and
IMAP APPEND/COPY/MOVE uses that boundary. Folder creation/deletion/rename and native
quota recount/recalculation use the same lock. Nested read guards may borrow it;
a second independent growth transaction in one process cannot borrow another
transaction's budget. Waits are bounded to approximately5seconds and fail
**temporarily**, never fail open.

Before admission, native Dovecot synchronizes each mailbox with FULL_READ and
counts virtual RFC822 bytes across all selectable folders. Mailbox-list indexing
and the process-local count cache are disabled. Expunge only reduces usage;
flag/recent renames use native index synchronization. An early raw-directory-scan
prototype was rejected during source audit because reader renames can evade a
`new/`/`cur/` iterator. Its image `ad3b3419…` is not qualified.

The invariant is committed logical message bytes <= the current limit, except
when an explicit administrative reduction retains already stored data above the
new limit. Such a reduction never deletes mail and refuses growth. `tmp/` staging
and index bytes are covered by filesystem pressure, not the logical message quota.
COPY needs destination capacity; MOVE does not receive credit for a speculative
source expunge and can require temporary staging headroom. Positive MOVE preserves
net quota use. A failed write rolls back without leaking a reservation. Process
death releases the kernel lock; its inode is never unlinked. Next admission
reconciles native Maildir/index state before counting. A crash after a storage
commit may leave a delivered-but-unacknowledged message; quota recovery does not
provide exactly-once delivery.

This invariant covers the fixed one-private-namespace Maildir profile. Do not add
external filesystem writers, shared/public namespaces, replication, dsync, Sieve,
other storage backends or plugins without a new writer-path audit and qualification.
See the [native design](https://github.com/drumee/debian/blob/feat/mail-02-profile/profiles/mail/native/DESIGN.md).

### Docker26 private ingress

The baseline acceptance edge was internal: Docker26 recorded a1587 binding in
HostConfig but created no effective publication/listener. Making it routed exposed
a second problem: independent bridges were masqueraded to the gateway, so allowing
that gateway admitted forbidden clients too. A no-masquerade-only experiment then
hit Docker inter-bridge isolation. Neither experiment is claimed as qualified.

The [amendment B](https://github.com/drumee/debian/blob/feat/mail-02-profile/profiles/mail/native/NETWORK-AMENDMENT.md)
was documented before adoption. Each client keeps its separate backend and attaches
to the mail-owned external frontal bridge at an explicit address. Postfix has the
computed stable `plan.private_endpoint` (`10.243.47.254:1587` in this lab), with
`mail.oxymot.fr` as verified TLS identity/owned network alias. Clients connect to
that private address; no public DNS fallback or application backend adoption.

Before Postfix starts, a native namespace nftables rule drops the gateway source,
accepts its own health-probe address and declared frontal CIDRs, and drops other
private1587 traffic. NET_ADMIN/SETPCAP exist only during the fixed startup and are
removed from the daemon capability bounding set. AUTH and sender grants remain
mandatory after verified STARTTLS. No host firewall/daemon NAT exception is used.

### Rapid registry changes and test observations

The final acceptance-boundary replay exposed a third defect: Dovecot passwd-file
caches whole-second mtime plus size, not inode. Equal-size userdb generations
published in one second could retain the old quota. The failed activation kept its
admission barrier and accepted queue; it was not waived. Under the apply lock,
activation now fsyncs distinct increasing whole-second timestamps on the sealed
private file contents before switching the generation pointer. Native auth/userdb
verification still precedes barrier removal. Eleven rapid native changes exercise
this correction. Failed projections are not silently treated as applied.

OpenSSL3.5 rejects `-days -1` as an inverted validity interval. The expired-leaf and
expired-issuer fixtures now use a valid interval entirely in the past, via explicit
CA start/end dates. This fixes the fixture, without weakening TLS validation. A separate signer probe
initially timed out at8seconds while Docker resolved the withdrawn alias. The
corrected observer waits for an explicit native4xx (about16seconds in the guest),
requires an unchanged queue, and still treats a disconnect/timeout as failure.
Native milter-connect/command/content timeout settings are unchanged. A namespace
churn fixture initially renamed a selected folder, causing the native IMAP session
to invalidate; the final probe performs reader flag changes in another populated
folder while a different populated folder is renamed. Both classes overlap the
LMTP/IMAP admissions and remain counted, without assuming a renamed selection
stays usable. The failed fixtures and reports are retained separately.

## Native results and reproduction commands

Evidence is under [requalification-2026-11-13](evidence/requalification-2026-11-13/).
Reports retain argv, exit codes and output hashes, but no passwords, verifiers,
private keys or mail bodies. `RUN`, `PROFILE`, `SOURCE` and fixture roots are private
paths recorded in the reports; see [reproduction.md](reproduction.md) for setup.
A report's PASS must be checked: not every diagnostic driver exits nonzero on FAIL.

| Scenario | Status | Evidence / exact driver |
| --- | --- | --- |
| Original45 native SMTP/LMTP/IMAP/header/DKIM controls | PASS host + guest | `host-final-45.json`, `vm-final-45.json`; Infra `python3 test/mail-service/run.py` |
| Original quota regression,20 rounds each | PASS host + guest | `*-original-race-result.json`; `quota-race.py` via the owned LMTP socket/edge |
| Atomic high/fitting APPEND, COPY/MOVE,12 flag/namespace races, kernel-lock contention, worker death, other UUID, deferred retry, restart count | PASS host + guest | `*-atomic-quota-result.json`,8 controls; Debian `quota-native.py PROFILE SOURCE SCRIPTS` |
| Independent IMAP totals and native quota counters after guarded restart/guest reboot | PASS host + guest | `*-quota-reconciliation-result.json`,2 UUIDs; `quota-reconcile-native.py`; logical bytes/messages and upward KiB rounding match |
| Quota-full deferred delivery after actual space release | PASS host, fresh dedicated profile | `host-quota-release-result.json`: unchanged1MiB limit, SMTP250 then native LMTP452, only the owned800KiB synthetic IMAP seed expunged, queue flushed, one observed delivery and reconciled counters |
| Rapid equal-size registry generations | PASS host + guest | `*-registry-cache-result.json`,11 changes; `registry-cache-native.py PROFILE` |
| MX alternatives, NXDOMAIN, Null MX, partial recipient disposition, strict-domain TLS, forced native expiry | PASS host + guest | `*-mx-result.json`,6 controls; Infra `mx-check.py RUN` |
| Strict outgoing TLS to an expired MX | PASS host | `host-mx-expiry-result.json`; Infra `mx-expiry-check.py RUN`: deferred certificate failure, no plaintext witness, then exactly one observed TLS delivery after replacing the peer certificate |
| Client lifecycle independence | PASS host + guest | `*-life-result.json`,8 controls; Infra `life-check.py RUN/report.json` |
| Independent four-service profile lifecycle | PASS host + guest | `*-result.json`,5 controls; Debian `native-lifecycle.py SOURCE` |
| Bad SAN/key/sealed inputs, renewed fingerprints on25/587/465/1587/993, active sessions, failed reload/reconciliation | PASS host + guest | `*-tls-result.json`,5 controls; `tls-native.py` |
| Expired leaf/issuer, missing mandatory STARTTLS,31/20/10/6-day alert transitions | PASS host + guest | `*-expiry-result.json`,6 controls; `tls-extra.py`, `tls-chain-native.py` |
| SMTP/IMAP/TLS/control-network isolation negatives | PASS host + guest | `*-protocol-result.json`,25 controls; `protocol-native.py` |
| Independent flags, alias retirement, sender/credential generations, quota changes, accepted UUID retention | PASS host + guest | `*-registry-result.json`,8 controls; `registry-native.py` |
| Grant/password changes during DATA, final250 before revocation, active human sessions, all-disabled retained-delivery projection | PASS host + guest | `*-session-result.json`,5 controls; `session-native.py`; before-final-acceptance421/no new queue, after-final250 remains owned/queued and later read once |
| Write failure and rollback | PASS host + guest | `*-write-failure-result.json`; `write-failure.py`: nonwritable owned Maildir/tmp refuses APPEND, LMTP defers; restored permissions permit queued retry and new APPEND |
| Missing/replaced resources, modes/setgid/GID, markers, images/listeners/mounts/networks/aliases/secrets/foreign prepared state | PASS host + guest | `*-identity-result.json`,63 controls; `identity-controls.py`; each refuses before core exposure and preserves full data/metadata snapshots and replacement sentinels |
| Pre-existing foreign edge/control/socket volume | PASS host + guest | `*-foreign-resource-result.json`,7 controls; `foreign-resources.py`; foreign target/data preserved |
| Signer outage, postmaster/abuse local routes, account rate and alerts | PASS host + guest | `*-signing-result.json`, `*-rate-result.json`; `signing-native.py`, `rate-native.py` |
| Private clients, recreated projects, backend-only NAT path | PASS before + after guest reboot | `private-network.py`; separate Ghost/Oxymotion backends, denied frontal source and unattached masqueraded backend, TLS/auth and receiver checks |
| Bounded disk pressure, queue/disk alerts and recovery | PASS guest | Guest `disk-native.py` on a NEW256MiB loop ext4 |
| Missing actual mount before exposure | PASS guest | Guest `mount-native.py refuse MANIFEST PROFILE` |
| Normal guarded guest reboot with nonempty queue and private filtering | PASS guest | Guest `boot-native.py … stage/verify`, followed by private-network replay; no same-storage reboot is called a restore |

The final native45 replay includes every final Infra fixture file, with unchanged
sources during both executions. The [source attestation](evidence/requalification-2026-11-13/source-byte-attestation.json)
binds the remaining runtime/tests and all50 packed members to the final dossier.

The detailed MAIL01 dispositions map RX01–04 to native/registry/session,
AUTH01–04 to native/protocol/private/session, TLS01–02 to TLS/expiry/private,
OUT01–02 to native/MX/expired-MX, SIGN01 to delivered header/DKIM and signer outage,
IMAP01 to native/protocol/identity, QUOTA01 to quota/write-failure/reboot,
ROT01 to native/session/cache, LIFE01–02 to lifecycle/identity/mount/reboot,
NET01 to private/identity/foreign resources, OBS01 to native observations and the
quota/auth/disk/certificate/incomplete-generation/rate cases. The detailed ID disposition and driver/evidence mapping are also in
[matrix.json](evidence/requalification-2026-11-13/matrix.json). No later-lot
restoration, administrative UI or public-network check is counted as transport PASS.

## Suites, hosted checks and limits

Final local producer:409 unit,24 contracts, package closed-inventory/installed
consumer with50 members and no production dependencies, strict TypeScript5.9.3
consumer, lint0 errors/0 new findings/23 inherited warnings. Debian:331 general
checks and5 locked-profile tests, no skips. The exact archive receipt is separate
from npm's package-audit archive metadata; compare all50 member hashes as well as
the frozen archive used for native tests.

The earlier hosted checkpoint and failures remain in historical
[ci.json](evidence/requalification-2026-11-13/ci.json). Their replacement is the
[closure checkpoint](evidence/ci-closure-2026-11-13/ci-code-checkpoint.json):
Debian [43489578609](https://github.com/drumee/debian/actions/runs/43489578609),
code `5d7afefb459b74a8569635ec05183925f0480f66`, passes lint, packaging, suite and
minimal-application-contract. The separately reviewable inherited-debt PR14 is
also green. Final documentation-tip checks and exact final SHAs are linked in
[PR13 checks](https://github.com/drumee/debian/pull/13/checks) and
[PR38 checks](https://github.com/drumee/infra-layer/pull/38/checks), and recorded in
the PR delivery descriptions. No failing required gate is waived.

The closure replays409 Infra unit tests,24 contracts, package installed-consumer
checks and lint (zero errors/new findings;23 existing warnings); Debian333 suite
checks,5 mail profile tests,6 OCI/FROM guards,8 maintenance regressions,10 minimal
application tests and8 plugin-artifact tests pass. A supplemental Infra
`npm run test:integration` still fails four old services scenarios (three BIND9
query/restart cases and one controlled relay setup). The same four fail on the
starting Infra SHA a8661a8 in this environment with unchanged sources, as shown
by the closure's full logs and comparison. This command is not a required hosted
quality job. No general integration-suite PASS or runner-cause diagnosis is
claimed; the autonomous native matrix uses its own controlled DNS/SMTP peers.

CLI administration remains MAIL03; real Ghost/application integration remains
MAIL04. All public ports, Internet recipients, DNS/PTR, publication, deployment
and merge remain outside this lot. Requalify any changed image/module/Dovecot
ABI, writer path, quota unit, network/engine semantics, mount/lifecycle guard,
secret projection or TLS policy. The final packed/member and runtime/test source
attestation permits comparison with the final PR tips without self-referential
archive hashes.

**SMTP_RECOVERY_UNQUALIFIED** remains for coordinated Oxy-form restoration and the
new profile's queue/registry/Maildir/IMAP/secrets/keys restoration. Alpha.6 PR37
`6cc3483991b95d0f0c68e46ef9d62d1ca917c5f5` covers its own tested artifacts only.
Preserve each accepted queue, Oxy ledger and deduplication key. An `accepted` entry
is not recipient receipt. Old-backup replay and lost final SMTP/LMTP acknowledgments
can duplicate delivery; there is no exactly-once claim.

## Closure and remaining scope

No MAIL-02 transport criterion or required hosted gate remains open. The corrected
base comparison includes one PR-introduced mail FROM failure and91 inherited
ShellCheck diagnostics; [ci-closure.md](ci-closure.md) documents their resolution.
The current20-row machine matrix contains no FAIL/BLOCKED transport row.
Supplemental historical service-suite failures remain explicitly recorded above.

[MAIL03 handoff](mail-03-handoff.md). **MAIL-02_QUALIFIED**
