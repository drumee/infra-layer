# MAIL-02 requalification record

**MAIL-02_BLOCKED.** The forged Authentication-Results defect is corrected and
verified on delivered, DKIM-valid messages. The repeated native transport suite
passes. Two implementation failures still prohibit qualification: concurrent
Dovecot count quota permits an overflow, and the private host endpoint is not
reachable from an authorized independent client network in the qualified VM.
Additional incomplete controls are explicitly BLOCKED below. No failed gate is
waived and public activation remains refused.

## References and integrity

The continuation preserves the requested Infra `490525d6bc330e2a63a42555cc192c1bf35ccef1`
and Debian `b5a9c70369be9bbf0deaffbb21e1c794eb598059` as ancestors. Remote heads were
fetched and compared before work and again before pushing: no remote-only commits
were discarded. The later checkpoints `e837811fb05aa33c1f530156e34332891f92258a`
and `e29df56df1a253dc14c814e65918707764526a0b` are preserved.

| Item | Exact reference |
| --- | --- |
| Immutable producer/package source | `4a73f8984fc1c0f884a8735d741551d8721d31d9` |
| Producer test checkpoint | `168498d130a35ea7e2fccef46987cf2a9f5b4b71` (same 50 packed bytes) |
| Debian consumer/runtime/test checkpoint | `47634b1c4c1b882f3c9fc11e997cde7cfd8e2bec` |
| Package | `@drumee/infra-layer@0.1.0-alpha.7-mail02.4`, unpublished local archive |
| Archive SHA256 | `3332f762399dc9a482447ca1e021ba197c733ff83502ce9f99eb1ea4c8fea1a8` |
| Archive SRI | `sha512-3aWhxwC7wi6VHlVs/9b6EzvbETzlEIIUqPq6eJLY+UVmZ+KhnQ1uezrGGp7rxZs0qQHbMLQEbSLwt8IjCzb0OQ==` |
| Package inventory | [50 exact member hashes](evidence/requalification-2026-11-12/archive.json), zero production dependencies |
| Native engine OCI config ID | `sha256:f3fe9dc4eeb6cb8b1ba3efd61c6743159ba8313e2901983e9300ca6e4a5d733b` |
| Native base OCI config ID | `sha256:a02cc47d0ebca12a55759edb00757b3a8cdd00112ad4afe9a4ff7b5337ffe843` |
| Historical base manifest | `sha256:c9d6b4d5a69d7c53272ff13a4b90679422d61428a6f868a0463e3bdcfbe58236` |
| Python client/MX helper config ID | `sha256:36afa984f1187ff7fef17356fa7ead13af9a756681ac4a0c234a58fdc38f47e8` |
| Node helper manifest | `node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392` |
| Same Node helper config ID | `sha256:d0a16be756b6ec6658aecb8b7bcf87fa6c7d0d7fcc6ca53ad14bb49a4c90bdd7` |
| Native binaries | Postfix 3.10.13, Dovecot 2.4.1-4, OpenDKIM 2.11.0; [version/package/UID receipt](evidence/native-versions.log) |
| Numeric identities | Postfix 102:103, postdrop group 104; Dovecot auth 103:106; mail workers 5000:5000; mailbox directories 0700 |
| Workstation | Node 22.22.0, Docker 29.2, Compose 5.0.2 |
| Dedicated guest | Debian 13, kernel `6.12.116+deb13-amd64`, Docker `26.1.5+dfsg1`, Compose 5.0.2, Node 22.22.0; operator 1000:1001 |
| QEMU helper config ID | `sha256:a594e38e7304ac6553154ac2228f9b2e2c8e60fc96066cfb6f97c6546d798d8f` |
| Retained Debian guest base SHA512 | `ec8c175e39d59e711798c3a2f22ba11b9aee9bca1887c7e505a800aeffd5d7616099bd0e9fad869efba96100fe09d2c8b49d6d7001d501f0056c556bdc25b605` |
| Frozen image export SHA256 | `e0832f1b65935328eef05360887c47dacbb52e7ef65775deb5b3e2ff4905f7f3` |

These local image identities are OCI config IDs, not invented registry manifest
digests. A published acquisition/manifest attestation path is still unqualified.
No package or image was published. Documentation-only commits do not change the
frozen archive. The Debian lock, packed member hashes and
[Debian file hashes](evidence/requalification-2026-11-12/debian-member-hashes.json)
allow independent comparison with the final PR tips.

MAIL-01 references remain Infra PR [#36](https://github.com/drumee/infra-layer/pull/36)
`2328b28b126355e40f18815e74c20e203ca6388f` and Debian PR
[#12](https://github.com/drumee/debian/pull/12)
`3c91036f95528e3f9baa04cb78b2b74ae96f63a1`; Debian distribution base is
`ff6e6b399128e6332c984fc2e8e60f660bd5f881`. The unavailable historical `74f72c9`
is not attributed to this implementation. Alpha.6 recovery PR
[#37](https://github.com/drumee/infra-layer/pull/37) source
`6cc3483991b95d0f0c68e46ef9d62d1ca917c5f5` covers its own artifacts only.

## Measured results

Evidence links in this section refer to
[`evidence/requalification-2026-11-12`](evidence/requalification-2026-11-12/).
Each native report records argv, exit statuses and stdout/stderr hashes; no
password, verifier, key or message body is included.

| Scenario | Status | Native evidence / reproduction driver |
| --- | --- | --- |
| Original 42 checks plus three header/policy checks, workstation | PASS 45 | `native-workstation.json`; Infra `test/mail-service/run.py` |
| Same installed package and native images, isolated VM | PASS 45 | `vm-native.json`; repeat of the same checks, not 90 distinct requirements |
| Delivered Authentication-Results filtering and DKIM | PASS | Three local assertions removed, including repeated/folded/quoted service identities; two external assertions retained as untrusted metadata. Receiver message verifies with `opendkim-testmsg`. Policy stopped after DATA354 returns 4xx before final acceptance. Included in both 45-check reports. |
| Native alternate MX, NXDOMAIN, Null MX, partial recipients, domain-strict TLS, forced expiry | PASS 6 | `mx.json`; Infra `mx-check.py`. DSN recipient disposition and durable receiver witness checked. Expiry uses `postsuper -e` on a specific synthetic queue ID, not a five-day wall-clock run. |
| Separate synthetic Ghost/Oxymotion client lifecycles | PASS 8 | `application-lifecycles.json`; Infra `life-check.py`. Core IDs, start times, complete mount multisets and networks unchanged during stop/update/failed-start/rollback of either client. |
| Independent Debian profile lifecycle | PASS 5 | `debian-profile.json`, `vm-profile.json`; Debian `native-lifecycle.py`. Repeat install, runtime extra-network refusal and retained storage. |
| TLS staging, bad material, all five native listener fingerprints and rollback | PASS 5 | `tls.json`; Debian `tls-native.py`. Wrong SAN, mismatched key and same-ref sealed-input replacement refused. New verified fingerprints on25/587/465/1587/993; existing SMTP TLS session retains its negotiated certificate, native Dovecot SIGHUP retires IMAP sessions after its shutdown interval. Deliberately killed Dovecot during reload leaves admission closed until explicit successful reconciliation. Queue and old mailbox content survive. |
| Image/config/listener/mount/owner/marker/secret-projection drift | PASS 16 | `identity.json`; Debian `identity-controls.py`. Each guarded start refuses before any core is running; full data/metadata snapshot unchanged; source and pre-existing replacement-target sentinel retained. Includes numeric mailbox owner, closed config inventory, TLS file mode, copied spool marker on wrong inode, foreign pointer, changed verifier, wrong image/user/env/port/mount/restart/network. |
| SMTP/IMAP/TLS negatives and control-network isolation | PASS 25 | `protocol.json`; Debian `protocol-native.py`. Each authentication negative gets a fresh source IP so native Dovecot penalties remain active. Includes loopback relay denial, authzid impersonation, both SMTP-only accounts, alias and human SMTP-disabled login, shared/path/LIST denial, TLS1.1 server alerts, no143, inaccessible10001–10003/8891. |
| Independent registry flags, alias retirement, grants and retained delivery | PASS 8 | `registry.json`; Debian `registry-native.py`. Receive disable rejects primary/alias while IMAP/app SMTP continue; IMAP disable preserves receive/app SMTP; optional human SMTP restricted; raw UUID removal refuses; grants require credential-generation bump; quota changes/alerts; message accepted before receive-disable completes to retained UUID after quota increase. |
| Bounded per-account submission attempts | PASS | `rate.json`; Debian `rate-native.py`: 60 MAIL attempts then451, other account250; policy restart preserves temporary refusal. No DATA/message emitted. |
| Bounded disk pressure and recovery | PASS | `vm-bounded-disk.json`, `vm-disk-observation.json`; Debian `disk-native.py`: dedicated 256MiB loop ext4, 50,330,624 bytes available; SMTP MAIL452, pending queue unchanged, disk/queue-age alerts; deleting only synthetic allocation file recovers old mail and exactly one observed held-message delivery. |
| Signer unavailable and operational alias routes | PASS | `signing.json`; Debian `signing-native.py`. Postfix454 before acceptance, unchanged queue; postmaster/abuse each read once in second UUID via IMAP. |
| Whole-service guarded guest reboot with nonempty queue | PASS | `vm-guarded-reboot.json`; Debian `boot-native.py`. Mail-owned unit has mount requirements, preflight and guarded start. Changed guest boot ID, pending local message delivered once, prior content retained and runtime/registry/secrets preflight pass. No physical host reboot. |
| Concurrent LMTP + IMAP APPEND, zero grace | **FAIL** | `vm-concurrent-quota.json` and independent physical-file witness `vm-quota-independent.json`; Infra `quota-race.py`. Both accepted, RFC822 total1,150,509 > quota1,048,576. Three physical message files total1,150,492 bytes. No message removed. |
| Private authorized/forbidden independent client networks, recreated and after reboot | **FAIL** | `vm-private-after-reboot.json`; Debian `private-network.py`. Authorized source `10.243.48.10` cannot reach gateway `10.243.47.1:1587` (ECONNREFUSED); forbidden49 source also blocked. All sources being blocked is not a successful source-filter qualification. |

The TLS private-port fingerprint test reaches the native listener from its own
mail edge. It does **not** demonstrate the separate host-gateway access path.
The [native runtime inspection](evidence/requalification-2026-11-12/vm-private-runtime.json) confirms the guest Docker26 recorded HostConfig port1587 binding but runtime Ports was
empty; no host listener/NAT rule was present for the internal edge network.
An initial client fixture used an internal client network without a gateway
route (`vm-private-without-route.json`); the corrected, separately routed client
fixture still failed with connection refused before and after recreation/reboot.
The VM's outer network was disconnected throughout, including for that routed
client fixture. No host firewall exception, host networking or foreign application
backend attachment was introduced to conceal the failure.

## Complete MAIL-01 matrix disposition

A PASS below applies to this isolated lot and named checks only. The unchanged
[MAIL-01 matrix](../mail-01/qualification.md) remains authoritative. A row stays
BLOCKED if any required MAIL-02 observation is missing.

| ID | Status | Evidence and precise residual gate |
| --- | --- | --- |
| RX-01 | PASS | Native primary/alias LMTP and IMAP, exact UUID and foreign-box isolation in45-check reports. |
| RX-02 | PASS | Unknown/retired RCPT550, missing registry temporary refusal; retirement in registry.json. |
| RX-03 | PASS | Native edge and explicit loopback external relay5xx; AUTH absent before/after TLS on25; private networks confer no relay grant. Public Internet replay remains MAIL06. |
| RX-04 | BLOCKED | Independent flags and prior accepted delivery after receive disable pass. Combined `all` disable and retained administrative deletion projection need an explicit native scenario; raw removal is deliberately refused. MAIL03 must supply retained tombstones. |
| AUTH-01 | FAIL | Verified587/465 and missing/wrong/authzid negatives pass; authorized independent private endpoint is unreachable. |
| AUTH-02 | PASS | Implicit465/993, plaintext negatives and native TLS1.1 refusal on587/465/993. |
| AUTH-03 | BLOCKED | Envelope/From/Sender/Resent/duplicate checks, bounded parser tests, stale generation and grant-bump requirement pass. Grant-only change with an already authenticated SMTP session still needs a dedicated native acceptance-boundary proof. |
| AUTH-04 | PASS | Correct app passwords fail IMAP for both accounts; alias has no login; mailbox submission=false refuses and optional true is restricted. |
| TLS-01 | BLOCKED | Wrong CA/name and verified native endpoints pass. Expired chain and missing-STARTTLS client refusal are not yet exercised; private host-gateway hostname verification is blocked by access failure. |
| TLS-02 | PASS | tls.json five cases; all native listener fingerprints and existing sessions accounted, failed reload retains barrier/alert until reconciliation. Separate private routing failure remains AUTH-01/NET-01. |
| OUT-01 | PASS | Real native MX routing, alternate421 fallback, NXDOMAIN/Null MX; no relayhost/outgoing SASL. |
| OUT-02 | PASS | DNS SERVFAIL/MX451 and permanent DSN in45 checks; strict global/domain no-clear fallback, opportunistic clear witness and partial recipient dispositions; forced native expiry in mx.json. Natural five-day timer is not claimed. |
| SIGN-01 | PASS | Delivered local-assertion stripping plus external metadata retention, both accounts' DKIM, incoming unsigned; before-queue policy and signer outages temporarily refuse. Live alignment remains MAIL06. |
| IMAP-01 | PASS | Two UUID principals, content/LIST/shared/path denial, numeric ownership, optional human SMTP independent. |
| QUOTA-01 | **FAIL** | Proven simultaneous LMTP/APPEND overflow. Sequential full-quota defer/retry, quota changes and bounded disk pass, but APPEND/COPY across folders, crash/reboot accounting and no-overflow contract cannot be declared qualified. |
| ROT-01 | BLOCKED | Password old/new and pre-existing SMTP/IMAP invalidation pass in45 checks; unrelated IMAP survives. In-flight acceptance-boundary fault proof remains. Real Oxy projection/ledger is MAIL04. |
| LIFE-01 | PASS | Eight two-client lifecycle controls; real client-version integration remains MAIL04. |
| LIFE-02 | BLOCKED | New guarded unit + actual reboot/queue/content pass; spool replacement and identity negatives pass. Missing/replaced cases for every durable resource and a missing actual mount at boot require exhaustive replay. No restoration claim. |
| NET-01 | **FAIL** | Exact role image/mount/port/network guards and control isolation pass; positive independent-network endpoint fails. Foreign pre-existing edge/control ownership/IPAM and Unix-volume ownership need dedicated activation negatives. |
| OBS-01 | BLOCKED | Queue age/count, bounded disk, quota high/limit, actual auth failures, seven-day certificate warning, incomplete generation, failed TLS rotation and per-account rate alerts pass. Fourteen/thirty-day certificate windows and leaf/chain-expiry refusal need native coverage; external operator notification remains later-lot work. Operational postmaster/abuse routes are tested locally. |

CLI-01/02 and TX-01 remain MAIL03; APP-01 MAIL04; BK-01/02 MAIL05;
MIG-01 and authorized public/DNS/PTR work remain later lots. They are not silently
counted as transport PASS.

## Regression suites and hosted checks

MAIL-01 `2328b28…` unit baseline was reproduced twice in the same environment:
405/405 PASS. Historical executable/TLS failures did not reproduce in that exact
command; this does not waive separate integration scripts. Final local producer:
408/408 unit PASS, contracts24/24 PASS, package `PACKED_CONSUMER_OK` with identical
archive SRI/50 members/zero production dependencies, strict TypeScript5.9.3
installed-consumer compile PASS, lint0 errors/0 new findings/23 existing warnings.
Debian general suite331 PASS, locked profile3/3 PASS, zero skipped in those
reported suites. Their complete sanitized logs and type consumer are in evidence.

[Hosted receipts](evidence/requalification-2026-11-12/ci.json): Infra checkpoint
[run43258242213](https://github.com/drumee/infra-layer/actions/runs/43258242213)
passes unit/contracts/eslint/packaging/dependencies. Debian checkpoint
[run43258259894](https://github.com/drumee/debian/actions/runs/43258259894)
passes suite and minimal-application-contract but **fails** ShellCheck and
packaging. Compared with requested Debian b5a9c70 baseline
[run43230189927](https://github.com/drumee/debian/actions/runs/43230189927), all91
ShellCheck diagnostic lines and15 selected packaging diagnostic lines are
unchanged, with zero added/removed lines. This is repository debt, not a runner
waiver. Packaging includes this profile's `FROM ${MAIL_TOOLS_IMAGE}` without a
manifest digest, plus legacy Dockerfiles/global npm installations. The builder's
local config-ID precheck does not make that static gate pass. Fix the acquisition
recipe and replay it without weakening the check; publication is outside this lot.
Final documentation commits must retain these observations and do not imply green
Debian CI.

## Required corrections and next qualification

1. Replace/review the quota mechanism. The native count backend's check/update is
   not atomic across LMTP and IMAP workers. `lmtp_user_concurrency_limit=1` does not
   serialize IMAP; disabling APPEND/COPY, reducing nominal quotas or allowing grace
   would weaken the contract. Implement an atomic per-UUID reservation/enforcement
   path covering LMTP, APPEND, COPY/MOVE, rollback and crash reconciliation, or
   qualify a reviewed alternative backend. Rerun concurrent multi-folder writes,
   quota increase/decrease, queue retry, other-user isolation and reboot accounting.
2. Resolve private ingress with explicit service-owned network/interface semantics
   supported by the selected Docker engine. Preserve source enforcement, TLS,
   mandatory auth, sender policy and independent project ownership. Requalify both
   positive and negative sources, recreated projects and reboot. Do not add a
   foreign backend, wildcard bind, host networking or firewall bypass as a test fix.
3. Execute each BLOCKED row's residual native tests above, including storage/network
   identity failures, in-flight grants/rotation, all-disable/retained deletion,
   expired/missing TLS and complete expiry alerts. Stop on failed assertions.
4. Resolve or explicitly retain the failing hosted Debian gates, freeze new
   package/profile/image identities for any behavioral change, and replay all
   MAIL-02 controls. Syntax/render tests cannot replace these paths.

Earlier reports under `evidence/` retain the original .0 header failure; they are
historical, not the current result. A first registry test attempted to reuse the
number of a failed immutable staged generation and correctly hit
`MAIL_REGISTRY_GENERATION_CONFLICT` (`registry-first-attempt.json`). The corrected
test advances beyond every staged generation; no guard or failed evidence was
removed. A first signer-outage probe expected to reach DATA, but native Postfix refused STARTTLS454 because its signing milter was unavailable (`signer-first-attempt.log`). The corrected assertion accepts an explicit4xx at this earlier boundary and still requires an unchanged queue; it does not permit message acceptance. Initial network-collision attempts preserved foreign networks and moved
only the owned lab. Native auth delays were retained, with distinct IPs used to
avoid one negative test penalizing another.

## Recovery and MAIL-03 handoff

**SMTP_RECOVERY_UNQUALIFIED** remains for coordinated Oxy-form restoration and for
the new profile's queue/registry/Maildir/IMAP/secret/key restoration. A nonempty
same-storage reboot proves restart persistence only. Alpha.6 cold restore does not
cover this profile. Preserve each instance's accepted queue, Oxy ledger and
deduplication key; `accepted` is not recipient receipt and there is no exactly-once
claim. No queue purge or real-recipient SMTP occurred.

[MAIL-03 handoff](mail-03-handoff.md) records the APIs and guards to preserve. The
CLI administrative verbs remain unimplemented in MAIL02. Both PRs remain drafts;
no merge, release, deployment, DNS/PTR or production port/firewall change is
included.

**MAIL-02_BLOCKED**
