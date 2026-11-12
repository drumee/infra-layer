# Qualification result and applicability

2026-11-12. **POSTFIX_QUEUE_RESTORE_QUALIFIED** for the cold-spool procedure and
exact alpha.6 relay/image/configuration described in [reference](reference.md).
Final campaign: `pqr-fc78e3c123`, **49 passing checks / 202 recorded commands**,
exit0, no skipped case. [Full report](evidence/qualification.json),
[execution log](evidence/qualification.log), [45-entry checkpoint manifest](evidence/cold-spool-manifest.json).

Archive SHA256:
`5da705effedd5d7d252621d1d919700bb04e226bec8a25b5c406fdd5c2eab3f6`.
Trusted receipt SHA256:
`f2326e8749a872af64f358310dd5e6bc1684c708fcb005a38722d088087ac046`.
The protected message archive remains local, not committed. Checksums qualify
these exact synthetic artifacts, not any later production archive.

## Matrix of demonstrated results

| Case | Observed result |
| --- | --- |
| Immutable acquisition | Published alpha.6 archive SHA256/SRI and all44 member hashes equal the exact Debian consumer lock. Imported server image manifest/config/rootfs identities match. |
| Isolation | Two internal Docker networks, no published ports; offline storage/native checks use network none. No recipient route beyond the synthetic TLS/SASL witness. |
| Normal submission | Three EHLO/verified STARTTLS/authenticated SMTP submissions receive250 and distinct queue IDs through unchanged canonical Postfix/OpenDKIM. |
| Non-empty capture boundary | All three deferred after receiver451; independent receiver acceptance count zero. Source clean native stop, PID0, exit0, restart disabled, no running overlapping writable spool mount. |
| Complete cold archive | 45 persistent metadata/content entries; runtime socket nodes explicitly recorded and excluded. Full source inventory stable across capture. |
| Replacement | New labeled Docker volume, distinct spool inode; UID/GID/modes/mtime_ns/file digests and marker exactly equal before maintenance; original bind-backed source intact. |
| Offline/native validation | Every original queue file parsed with exact-image postcat before startup. Replacement placed on hold with no network; startup keeps all three held and performs expected native ID repair. |
| Exclusivity/gate | Original source remains stopped; one replacement processes the queue. No durable receiver acceptance until explicit review/release. |
| Primary restoration delivery | Three proven non-deliveries arrive once each during the primary resume phase; independent durable file proof and empty replacement queue. No loss or duplicate observed in that phase. |
| Uncertain final acknowledgement | Receiver durably commits a fourth message then drops before250; Postfix defers it. A 45-second hold observation stops retries during review; explicit retry causes two identical durable copies and queue completion. |
| Old-checkpoint replay | Restore initial archive again after definite completion; starts held. Deliberate release of one completed message produces another copy. Two other stale entries remain held, preserved. |
| Altered archive | Exit78 `ARCHIVE_INTEGRITY_FAILURE`, before extraction/activation; source and occupied replacement unchanged. |
| Incomplete archive, recomputed outer checksum | Exit78 `ARCHIVE_COVERAGE_FAILURE`; demonstrates member completeness independently of the outer checksum. Source/target preserved. |
| Wrong expected owner | Exit78 `OWNER_MARKER_MISMATCH`, no activation or overwrite. |
| Wrong marker inside an otherwise self-consistent archive/receipt | Exit78 `OWNER_MARKER_MISMATCH`; independent semantic owner check catches it. |
| Existing destination | Exit78 `TARGET_EXISTS`; no merge/overwrite, existing target's complete inventory unchanged. |
| Populated destination supplement | After the main campaign, replay restore against the retained stale volume with **two held messages**. Exit78 `TARGET_EXISTS`; both message files and all metadata/digests unchanged. [Supplemental proof](evidence/populated-target-refusal.json). |
| Source subtree as destination | Exit78 `TARGET_SCOPE_INVALID`; no writes into source. |
| Incompatible image | Exit78 `COMPATIBILITY_MISMATCH`, before extraction/activation. |
| Final independent witness verification | Six durable `.eml` files read after receiver shutdown and independently hashed against their event receipts; no message content exported. See [verification](evidence/witness-verification.json). |
| Cleanup/source preservation | Five final owned containers stopped/removed, owned empty networks removed. No volume/queue purge. Source, archives, keys and witness stay private; replacement and stale volumes retained. |

[Postflight](evidence/postflight.json) independently rechecks the original source
inventory after container cleanup and the two retained stale held messages.

The overall witness contains nine events: three temporary refusals, three primary
deliveries, uncertain acceptance, its intentional duplicate, and one intentional
old-checkpoint duplicate. The final aggregate therefore includes intentional
duplicates; the primary restoration assertion is explicitly phase-bounded.

## Per-message primary recovery mapping

| Synthetic Message-ID | Source queue ID | Replacement ID after native repair | Primary phase durable copies |
| --- | --- | --- | --- |
| `<definite-1@fixture.invalid>` | `AF4E21A06A93` | `AF4E24EAA70F` | 1 |
| `<definite-2@fixture.invalid>` | `BAA761A06A94` | `BAA764EAA710` | 1 |
| `<definite-3@fixture.invalid>` | `C652E1A06A96` | `C652E4EAA711` | 1 |

`<uncertain-1@fixture.invalid>` used queue ID `0456D4EAA747` on the live
replacement. The two controlled receiver copies have identical complete-message
SHA256 values, recorded in the full report. The first has no final250; the second
completes after explicit release. No exactly-once guarantee follows.

Short queue IDs contain inode-dependent information and can change when a cold
queue is restored. The failed first resume attempt exposed this: releasing old
IDs released zero messages even with command exit0. The corrected procedure
keeps the queue held and builds a one-to-one current-ID map before release. This
is documented [Postfix structure repair behavior](https://www.postfix.org/postsuper.1.html),
not a reason to disable native repair or change alpha.6 to long IDs during the
test. Message-ID alone is also insufficient outside these unique synthetic cases.

## Failed attempts and corrective scope

[attempts.json](evidence/attempts.json) retains every original verdict, failure,
count, cleanup outcome, timestamp and raw report/log hash. Sanitized original logs
are retained alongside the final log. Attempts1–7 remain failures:

1. The client inherited root with all capabilities dropped and could not read
   an operator-owned0600 file. Run that fixture client as the matching UID1000;
   do not weaken file permissions.
2. Python3.13 strict certificate verification refused a fixture CA without key
   usage. Generate proper CA/leaf extensions; do not relax verification.
3. Synchronous Docker exec lost its transport when native shutdown exited PID1.
   Use detached native stop and independently verify PID0/exit0/writer absence.
4. Root-created archive/receipt0600 files were unreadable by the operator. Set
   explicit operator numerical ownership on these new outputs, without changing
   source metadata.
5. Offline native postsuper required SETUID/SETGID capabilities. Supply the bounded
   offline native capabilities; the container remains network-none.
6. Restored Compose lacked the definition of its already-running DKIM dependency.
   Retain dependency definitions while starting only the restored mail role.
7. Old short queue IDs changed after native startup; releasing them produced zero
   progress. Correct correlation and current-ID release as described above.

No canonical production source, alpha.6 validator, recovery guard, image payload,
queue policy, TLS verifier or assertion was weakened. Final source hashes match
the exact scripts that executed. Attempt8 passed with a two-second held-queue observation. Final attempt9 extends
that observation to **45 seconds**, beyond maximum retry backoff plus scan interval.
All final success counts come only from attempt9;
the earlier partial proofs are not added to those counts.

## Explicitly unqualified scopes

- **Coordinated Oxy-form restoration: SMTP_RECOVERY_UNQUALIFIED.** No coordinated
  ledger/HMAC-key/spool checkpoint, RPC replay or actual Oxy-form restored deployment
  was exercised. Preserve its ledger/key and apply the distinct scenario in the
  operator procedure before claiming that capability. Its `accepted` means relay
  acceptance, never final receipt. The existing application API guard is unchanged.
- **Future standalone mail profile: SMTP_RECOVERY_UNQUALIFIED.** This is a relay-only
  baseline. Requalify its own released artifacts, registry/verifiers, Maildirs/IMAP
  metadata, LMTP boundaries and multi-engine consistency before lifting its guard.
- No exactly-once SMTP, physical disk loss/power failure, live/hot snapshot,
  high-volume performance, offsite restore/decryption, new OS/filesystem/architecture,
  postfix-version migration, multi-host failover, partial multi-recipient completion,
  DSN/expiry backlog recovery or arbitrary queue special-file support is established.
- The tested archive format handles ordinary POSIX files/directories and explicit
  runtime sockets only. ACL/xattrs, symlinks, hardlinks and other special nodes
  refuse rather than being silently stripped. Test a new preservation method for
  any such storage. Metadata equivalence excludes atime, ctime and inode number.
- Helpers assume a protected local administrative parent and serialized operations,
  with no hostile concurrent privileged writer. They are qualification utilities,
  not a hardened public backup-upload API or a new canonical deployment primitive.

## Conditions requiring requalification

Re-run the complete cold non-empty restore/negative/uncertainty/replay campaign
when any of the following changes: producer package or native image/binary/UID/GID;
queue format/hash-depth/long-ID settings; chroot layout; storage driver/filesystem,
ACLs or durability semantics; backup/extraction tool or encryption/offsite path;
source/target ownership model; startup/supervision/fencing behavior; milter/content
filter rewriting; relay/transport/TLS/auth configuration; or queue/secret snapshot
coordination. Retest all operationally claimed recipient/DSN/expiry states, not
only the three simple deferred recipients used here.

For the future standalone profile additionally require exact released profile
and helper artifacts; Postfix queue plus local LMTP delivery under crash/ack loss;
mailbox UUID/address/alias registry and credential generations; Dovecot Maildir/
UIDVALIDITY/UID/flags/quotas; DKIM/TLS/key consistency; a real isolated reboot and
storage guards; local/remote mixed-recipient partial success; restore to new owned
storage with no concurrent original; application independence; and authenticated
client reconnection. Retain its own refusal until those proofs pass. Ghost/MySQL's
existing qualified restoration remains separate and unchanged.
