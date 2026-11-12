# MAIL-02 qualification record

**Verdict: MAIL-02_BLOCKED.** This candidate demonstrates functioning isolated
SMTP/DKIM/LMTP/IMAPS paths, but does not satisfy every MAIL-01 gate. In particular,
the controlled receiver proves that a forged locally authoritative
Authentication-Results header survives submission. Do not promote this candidate.
Public activation remains refused. Missing engineering work below is not an
owner DNS decision or an alleged runner failure.

## Frozen identities

| Item | Qualified reference |
| --- | --- |
| Producer code/package source | `c2552ac7b57771d72e61901582563112e2c3c26d` |
| Package | `@drumee/infra-layer@0.1.0-alpha.7-mail02.0`, local archive only, never published |
| Archive SHA256 | `635926f7a51c276cf3ce28c93954dcabfb07d3c1451c8e0991752240688f75c1` |
| Archive SRI | `sha512-Yk7hmTUzirnA4Im1HHpyxcpuCjGceWhkLd4SmDWJnFOW2SZD7ktp8AeCWeJINvpLhoHTFfoxp7WZnrGp+FolOA==` |
| Package inventory | 50 exact files, zero production dependencies; [complete member hashes](evidence/archive.json) |
| Native engine OCI config ID | `sha256:f3fe9dc4eeb6cb8b1ba3efd61c6743159ba8313e2901983e9300ca6e4a5d733b` |
| Native base config ID | `sha256:a02cc47d0ebca12a55759edb00757b3a8cdd00112ad4afe9a4ff7b5337ffe843` |
| Historical base distribution manifest | `sha256:c9d6b4d5a69d7c53272ff13a4b90679422d61428a6f868a0463e3bdcfbe58236` (distinct from config ID) |
| Node helper manifest | `node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392` |
| Same Node config ID | `sha256:d0a16be756b6ec6658aecb8b7bcf87fa6c7d0d7fcc6ca53ad14bb49a4c90bdd7` |
| Python client/MX witness helper config ID | `sha256:36afa984f1187ff7fef17356fa7ead13af9a756681ac4a0c234a58fdc38f47e8` |
| Engines | Postfix 3.10.13; Dovecot 2.4.1-4; OpenDKIM 2.11.0; [native version/package/UID receipt](evidence/native-versions.log) |
| Guest | Debian 13; kernel `6.12.116+deb13-amd64`; Docker `26.1.5+dfsg1`; Compose v5.0.2; Node v22.22.0 |
| QEMU helper config ID | `sha256:a594e38e7304ac6553154ac2228f9b2e2c8e60fc96066cfb6f97c6546d798d8f` |
| Guest base qcow2 SHA512 | `ec8c175e39d59e711798c3a2f22ba11b9aee9bca1887c7e505a800aeffd5d7616099bd0e9fad869efba96100fe09d2c8b49d6d7001d501f0056c556bdc25b605` |

The guest base was downloaded from Debian's `trixie/latest` directory on this run,
and matched that directory's SHA512SUMS. The retained file, not a future mutable
`latest` download, is the reproducibility input. The QEMU container exposes no
host port; SSH forwarding listens on its own loopback only. Its outer bridge was
disconnected before mail testing. Mail networks are internal, DNS has no forwarder,
and every SMTP destination is a controlled lab receiver.

Local image references above identify immutable OCI **config IDs**. They are not
fabricated registry manifest digests. The current preparer resolves this local-ID
qualification convention. Published-registry acquisition/manifest-to-config
attestation still needs a qualified release path before target installation.

The Debian profile locks the unpublished archive and verifies every installed
member, rejects extras/symlinks/corruption and has no sibling-source fallback.
Subsequent documentation/test-only commits do not replace the frozen producer
source. Exact fixture file hashes are embedded in each native report.

## Measured results

- Baseline `npm test` at MAIL-01 `2328b28…`: **405/405 PASS**, twice in the same
  workstation environment. Candidate: **407/407 PASS**, zero skips. The reported
  executable refusals and TLS failures did not reproduce in this command. This
  is not a claim that all separate historical Docker integration runners passed.
- Candidate contract regression suite: **24/24 PASS**; package audit:
  **PACKED_CONSUMER_OK**, closed 50-file inventory and no production dependencies.
  Lint: zero errors/new findings, 23 existing warnings. Installed CommonJS export
  and a strict TypeScript 5.9.3 Node16-resolution consumer compile pass.
- Debian general suite: **331 PASS, zero FAIL**. New locked-profile tests:
  **3/3 PASS**, including installed-member tamper/extra/symlink rejection and
  corrupt-archive refusal without replacing the consumer.
- [Frozen workstation native report](evidence/native-frozen.json): **42 checks
  PASS**, 98 recorded commands, installed package above, source fixtures unchanged.
- [Dedicated VM native report](evidence/vm-native.json): the same **42 checks
  PASS**, 95 commands. These are repeated checks, not 84 distinct requirements.
- [VM reboot and spool guards](evidence/vm-reboot.json): **PASS** for a nonempty
  deferred queue, 46 preserved registry/candidate/Maildir-body files, IMAP read,
  recreated Unix sockets, missing spool refusal and foreign-marker exit 78.
  Queue ID `DF4F444626` survives. Source storage is restored intact after each
  negative test. This does not claim a pre-Docker systemd mount guard or recovery
  from a backup archive.
- [Independent synthetic application lifecycles](evidence/application-lifecycles.json):
  **8 PASS**, 74 commands. Separate Ghost-account and Oxymotion-account projects
  undergo stop/update/failed-start/rollback while their peer submits and MX mail
  reaches the service. All four mail container IDs, start times, complete mount
  multisets and network records stay unchanged. Their backend networks are never
  attached to the mail service. This is not real Ghost/Oxy application integration.
- [Debian operator native report](evidence/debian-profile-native.json): **5 PASS**:
  validate, start/status of four owned services, repeated install retains container
  identities, undeclared network attachment refuses, stop retains owned storage.
- [Forged authentication header probe](evidence/header-negative.json): **FAIL**.
  The durable controlled receiver retains a client-supplied
  `Authentication-Results: mail.oxymot.fr; ...` after successful authenticated
  submission. No message body or credential is included in the evidence.

## MAIL-01 matrix disposition

PASS applies only to the stated isolated scenario. BLOCKED means the complete
MAIL-02 portion is not demonstrated. MAIL-03/04/05/06-specific work is not silently
counted as a MAIL-02 success or as a production readiness requirement.

| ID | Status | Observations and precise remaining MAIL-02 gate |
| --- | --- | --- |
| RX-01 | PASS | Primary and alias traverse native SMTP/LMTP to the intended UUID; IMAP reads both correlations; second mailbox remains separate. |
| RX-02 | BLOCKED | Unknown recipient RCPT denial and missing-registry temporary refusal pass. Retired/disabled address transitions and absence from queue/sink need a dedicated generation scenario. |
| RX-03 | BLOCKED | Anonymous relay refusal from the internal client network and AUTH absence on25 pass. Explicit loopback and independent private-network sources still need negative controls. |
| RX-04 | BLOCKED | Independent receive/IMAP/submission flag changes and completion of prior accepted local recipients after disable/delete are not exercised. MAIL-03 tombstones must retain UUID delivery lookup. |
| AUTH-01 | BLOCKED | Verified 587 auth, plaintext-auth denial and unauthenticated submission refusal pass. Private gateway endpoint and source policy, bad/missing-password matrix and authorization-identity impersonation remain. |
| AUTH-02 | BLOCKED | 465 implicit TLS, plaintext failure and IMAPS work. Native TLS<1.2 negative controls are not yet executed. |
| AUTH-03 | BLOCKED | Envelope/From/Sender/Resent/duplicate From denial and stale credential-generation refusal pass. Grant-only changes and complete bounded RFC5322 parser qualification remain. |
| AUTH-04 | BLOCKED | Ghost SMTP principal cannot IMAP. Exercise Oxymotion, mailbox SMTP-disabled credentials and alias login explicitly. |
| TLS-01 | BLOCKED | Wrong peer name and untrusted CA fail. Expired chain, missing STARTTLS and the actual private-IP endpoint are not yet exercised. |
| TLS-02 | BLOCKED | Certificate-generation activation/rollback is not implemented or qualified. No renewal fingerprint/session/bad-reload PASS is claimed. |
| OUT-01 | BLOCKED | Native DNS MX lookup/direct SMTP25 works, relayhost empty/SASL off. Alternate MX, NXDOMAIN and null MX remain. |
| OUT-02 | BLOCKED | DNS SERVFAIL, MX451 defer/retry, recipient550 local DSN, global strict no-clear fallback and opportunistic fallback pass. Domain-specific verify, certificate failure, expiry and multi-recipient partial success remain. |
| SIGN-01 | FAIL | Both originating accounts produce independently verified DKIM; incoming messages are not signed. Locally authoritative forged authentication headers survive. Separate DKIM-milter outage control also remains. Live SPF/DMARC is MAIL-06. |
| IMAP-01 | BLOCKED | Two principals, foreign path denial, UUID Maildir and SMTP-app separation pass. Full LIST/shared namespace and optional human-SMTP flag matrix remain. |
| QUOTA-01 | BLOCKED | Zero-grace APPEND limit and full-quota LMTP452 with queued message pass, including restart/reboot persistence. Concurrent LMTP/APPEND/COPY across folders, quota changes and disk-pressure admission remain. Existing-worker quota-change propagation is not guaranteed by the current kick predicate. |
| ROT-01 | BLOCKED | Old SMTP password fails, new password submits; stale SMTP session refuses, affected IMAP session is kicked and other IMAP session survives; engines are not restarted. In-flight acceptance-boundary reconciliation and mailbox/session edge cases remain. Actual Oxy ledger projection is MAIL-04. |
| LIFE-01 | PASS | Both separate synthetic application projects stop/update/fail/rollback without changing the mail runtime; peer SMTP and local reception continue. Actual client versions remain MAIL-04. |
| LIFE-02 | BLOCKED | Real guest reboot, pending queue, registry/verifiers/keys/body files, sockets and IMAP pass; missing/wrong spool refuses. Whole-service pre-Docker mount identity guard and all missing/wrong durable-resource cases remain. |
| NET-01 | FAIL | Internal networks/no host publication and extra runtime network refusal pass. Declared private `allowed_sources` is not enforced by a separate private listener. Full runtime image/mount/foreign-network ownership negative controls remain. |
| OBS-01 | FAIL | Raw native queue/status/log observations exist. Required bounded per-account abuse controls, disk high-water admission, queue/quota/certificate/incomplete-generation alerts and monitored postmaster signals are not implemented/qualified. |

CLI-01/02 and authoritative transaction recovery TX-01 remain MAIL-03; APP-01 is
MAIL-04; BK-01/02 is MAIL-05; MIG-01 and public Internet/DNS readiness are later
lots. None has been claimed as qualified by this candidate.

## Bounded failed attempts and corrections

Earlier private attempts are retained; representative machine reports are in
`evidence/`. The first subnet overlapped a foreign Docker network: the lab moved
to `10.243.47.0/24`, without changing the foreign resource. Native failures exposed
protected auth-file access, missing IMAP chroot capability, missing Date in the
synthetic DKIM fixture and an ineffective per-user quota override. Corrections
use root auth file access, the narrow SYS_CHROOT capability, a proper Date header
and `userdb_quota/Mailbox/storage_size`; no TLS/trust guard was removed.

A reload-based credential experiment accepted the old SMTP password despite a new
lookup generation; a subsequent service-stop/reload attempt failed with the
admission barrier retained. Neither was relabeled PASS. Dovecot 2.4.1 reload also
retires unrelated workers after its shutdown interval. The final tested mechanism
atomically switches the immutable credential directory without SIGHUP, flushes
auth cache, verifies generation and kicks only affected users; native old/new
password and existing-session tests then pass.

The first VM bootstrap had missing Compose support and a group-writable private
parent. It was repaired with the pinned local Compose binary, Node22 and protected
owner directories, retaining the safety checks. The first reboot verifier sampled
Docker during `unless-stopped` restart transition; the corrected verifier observes
exit78, stops the restart loop, then checks absence of a writer. A second real
reboot passes. A lifecycle test compared Docker Mounts array order; the diagnostic
proved identical complete mount multisets. Canonical sorting preserves all fields
and multiplicity, and the rerun passes. These are explicit test corrections, not
blanket runner waivers.

## Required continuation before MAIL-02 qualification

1. Remove untrusted locally authoritative authentication headers before signing
   (native cleanup rule or correctly negotiated Milter header-change action), and
   make `header-probe.py`/`header-check.py` pass while DKIM still verifies. Complete
   bounded author parsing and authorization-identity negative tests.
2. Add a distinct private submission service with its declared source CIDR policy,
   the same TLS/auth/grant rules and verified server name. Qualify independent
   application networks without adopting their backend networks. Add complete
   runtime image/mount/network/resource ownership checks before activation.
3. Add staged certificate generations with key/SAN/chain checks, native syntax
   checks, all-endpoint fingerprint probes and rollback/fail-closed handling.
   The current preparer must not be used to rotate material behind unchanged
   secret references: it can rewrite candidate key files before an operator-state
   conflict is reported. Seal-check existing candidate bytes before any write and
   include producer/artifact identity in revision selection. This is an inspected
   implementation gap, not a qualified rotation method.
   Account for Dovecot 2.4.1's actual reload effects separately from the proven
   password rotation path. Never overwrite an already sealed prepared generation.
4. Finish DNS/MX/TLS/per-recipient/expiry fault cases, disabled identity transitions,
   quotas under concurrent operations, dynamic quota changes and disk exhaustion.
   Quota changes must also update or revoke existing affected IMAP workers.
5. Implement bounded per-account limits, disk admission/alerts and structured
   nonsecret operational status. Add an explicit mount identity guard before the
   mail service's reboot activation, with all wrong/missing storage negative cases.
6. Freeze new source/archive/image/config identities and rerun the entire MAIL-02
   matrix. Current PASS evidence covers only the exact artifacts above.

No owner DNS/PTR/firewall change is needed to fix these lab gates. The IPv4-only
choice and real provider port25/DNS/certificate decisions remain later-lot work.

## Recovery and MAIL-03 handoff

The alpha.6 queue qualification is reused only as a method/reference. This lot
proves persistence over stop/start and guest reboot, not standalone backup/restore.
`SMTP_RECOVERY_UNQUALIFIED` remains mandatory for the new profile's coordinated
queue/registry/Maildir/IMAP/key restoration and for coordinated Oxy-form restoration.
Preserve the Oxy ledger and deduplication key; local `accepted` is not recipient
receipt. No queue purge, ledger reset, exactly-once or cross-artifact recovery claim
is introduced.

MAIL-03 retains its CLI/database/protected-password scope. Its authoritative state
must project retained disabled delivery identities, CAS generations, protected
verifiers and an idempotent crash-reconcilable apply protocol. The current JSON
projection and acceptance-only lifecycle are not a replacement for that database.
Do not merge/publish/deploy these drafts or infer MAIL-02 completion from the
transport subset or from the prior alpha.6 restore verdict.

**MAIL-02_BLOCKED**
