# MAIL-02 through MAIL-06 acceptance contract

Pass requires exact source/artifact/image/config identities, actual commands,
exit codes and no unexplained skips, protected evidence with content/credentials
excluded, and negative controls that fail if the assertion is removed. Lab
hypothesis PASS is not an implementation or production PASS. Freeze the matrix
before execution; preserve failed attempts and bounded rerun reasons.

## Lot gates

| Lot | Deliverable / exit gate |
| --- | --- |
| MAIL-02 | Infra new transport/rendering/lifecycle + Debian independent profile in isolated fixtures; exact Postfix/Dovecot/OpenDKIM binaries; all transport/security/local-storage cases below pass; no CLI implementation hidden in design |
| MAIL-03 | Existing drumee-ctl extension, authoritative registry/generation protocol, protected password input and every administrative semantic/error/idempotency/concurrency case |
| MAIL-04 | Qualified client dependency; Oxy and Ghost transactional integration; private routing from independent projects; retained old queue/fallback ownership; synthetic compatibility first, actual target work only with separate authorization |
| MAIL-05 | Maildir/registry/secret/key backups and queue-specific isolated restoration incl. uncertainty. Ghost restore evidence reused only for Ghost. Lift SMTP refusal solely for tested standalone recovery protocol. |
| MAIL-06 | Authorized target networking/DNS/PTR/certificates, controlled Internet reception/delivery, owner-performed MX migration, dual-arrival reconciliation and exercised rollback; production activation receipt |

## Acceptance matrix

| ID | Lot | Scenario and required observable result |
| --- | --- | --- |
| RX-01 | 02,06 | Port25 mail to primary and alias reaches exact UUID Maildir via LMTP; final SMTP/LMTP acceptance and IMAP content/flags correlated, unrelated mailbox unchanged |
| RX-02 | 02,03,06 | Unknown primary/alias and retired address return 550 at RCPT **before DATA/queue**; registry unavailable returns 451, no catch-all/backscatter |
| RX-03 | 02,06 | Anonymous external relay attempt from Internet, app bridge and loopback returns 5xx; no queue/sink message; AUTH absent on25 |
| RX-04 | 02,03 | Receive/IMAP/submission disable tested independently and `all`; prior accepted local message completes to preserved UUID after disable/delete; new RCPT rejected |
| AUTH-01 | 02,04 | 587 refuses plaintext auth/MAIL, valid verified STARTTLS + auth works; wrong/missing credentials refuse; private endpoint has same rules, no CIDR bypass |
| AUTH-02 | 02,04 | 465 TLS from first byte, plaintext/STARTTLS client fails; TLS<1.2 refuses; 993 only implicit TLS |
| AUTH-03 | 02,03,04 | Oxy cannot use Ghost/contact envelope or From/Sender/Resent/duplicate-header tricks; grants enforced before final DATA250; wrong grant change invalidates existing SMTP sessions |
| AUTH-04 | 02,03,04 | SMTP-only Oxy/Ghost cannot IMAP with correct password; mailbox SMTP flag false refuses SASL submission; alias has no login |
| TLS-01 | 02,04 | Wrong CA, hostname, expired cert, missing STARTTLS: no AUTH/no accepted message; hostname checked on private IP endpoint |
| TLS-02 | 02,06 | Renewal changes public certificate fingerprints on all endpoints, preserves messages/keys, old sessions accounted; bad key/SAN/reload fails closed or retains still-valid old generation with alert |
| OUT-01 | 02,06 | Real native DNS/MX routing, alternate MX, NXDOMAIN/nullMX and no relayhost/SASL map; synthetic MX first, actual Internet only MAIL06 authorized |
| OUT-02 | 02,06 | Opportunistic clear fallback explicitly observed; strict global/domain verification never downgrades; 4xx/DNS outage queues/retries, 5xx per-recipient DSN, expiry, multi-recipient partial success |
| SIGN-01 | 02,06 | Originating DKIM verifies against exact public key/body; incoming mail never signed locally; milter/policy failure4xx; live SPF/DKIM/DMARC alignment separately verified with full controlled recipient headers |
| IMAP-01 | 02,03 | Two mailbox identities: login/read/list/path traversal/shared namespace denial, no foreign contents; Maildir ownership and stable IDs; human SMTP optional flags independent |
| QUOTA-01 | 02,03 | Concurrent LMTP/IMAP APPEND/COPY across folders, quota increase/decrease, reboot reconciliation; full mailbox4xx retained in queue, disk-pressure refusal, no deletion/overflow or cross-user accounting |
| CLI-01 | 03 | Every mailbox/alias/account verb and error code, default retained deletion, explicit guarded purge, primary rename retains UUID/Maildir/IMAP metadata, old alias/reject choice and sender grants |
| CLI-02 | 03 | TTY masked twice/cancel restoration; FD exact bytes, unsafe FD/ownership/oversize/control refusals; argv/env/log/error/output/trace free of passwords and verifiers |
| ROT-01 | 02,03,04 | Password generation rotation: new accepts/old refuses; pre-existing IMAP/SMTP session invalidated, in-flight acceptance boundary accounted; Oxy projection switch preserves pending/uncertain ledger and dedup key |
| TX-01 | 03,05 | Concurrent changes/if-revision conflict, duplicate request IDs, changed-payload conflict, no-op reexecution; kill at every staged/committed/applied boundary and reboot; no mixed policy generation or unintended deletion |
| LIFE-01 | 02,04 | Stop/update/failed-start/rollback Oxy while Ghost submits and MX receives synthetic traffic; mail service PID/queue/keys/Maildirs/network identity unchanged; repeat Ghost lifecycle with Oxy continuing |
| LIFE-02 | 02,05,06 | Real isolated VM reboot: storage guard before Docker/mail, no empty fallback directory on missing/wrong disk, sockets recreated, queue/Maildir/registry/verifiers/DKIM persist, clients reconnect; target reboot later separately authorized |
| NET-01 | 02,04 | Exact declared networks/mounts/ports; independent-network positive control and refused mail/milter/auth/LMTP access; no Ghost backend-network adoption, no arbitrary extra attachments after restart |
| APP-01 | 04 | Real Oxy plugin/ledger statuses with external service, no HTTP retry on uncertain send, no duplicate queue on repeated request; Ghost actual transactional reset/invitation TLS/auth/failure, no bulk sending |
| BK-01 | 05 | Restore Maildir+metadata to isolated root preserves folder/UIDVALIDITY/UID/flags/subscriptions, address UUID mapping, quotas; credential/key/cert generation consistency, incompatible schema refuses |
| BK-02 | 05 | Native quiesced spool checkpoint/restoration with pending/deferred/partially delivered mail, LMTP/DATA acknowledgement loss and crash; every recipient disposition accounted; no concurrent copied queue, duplicate risk disclosed |
| MIG-01 | 04,06 | Each old/new queue drains its own accepted mail, old upstream fallback usable; MX propagation sends to both providers, delta ledger imports late deliveries and exercises reverse migration without mail loss/loops |
| OBS-01 | 02–06 | Queue age/count/disk/quota/auth failures/cert expiry/incomplete generation alerts, monitored postmaster/abuse/DSNs; no credentials or message bodies in evidence |

## Open decisions

| Decision / owner | Deadline | Default or consequence |
| --- | --- | --- |
| Exact release version/image digests/package pins, Debian branch/PR base | MAIL02 | Base implementation on `feat/container-distribution` lineage, never stale Debian main; new immutable producer release later. Lab uses pinned tools image + Debian snapshot, not production approval. |
| Private subnet/gateway/source scopes, numeric service UIDs and host bind allocation | Before MAIL04 target install | Proposed example allocations only; collision/routing failure blocks integration, not synthetic transport work |
| Port25 egress/inbound provider permission, IP/PTR/reputation and existing AAAA disposition | Before MAIL06 | Default IPv4 only; any blocked25 or unresolved mail AAAA blocks MX/direct-delivery activation; no provider fallback hidden in direct mode |
| Actual human mailbox/alias inventory, sender grants, monitored postmaster/abuse/DSN destination | Before MAIL04/06 | Examples are proposals. Missing destination prevents enabling an account or accepting local domains |
| Ghost provider fallback identity/config | Before promising outbound rollback | Current Ghost has no SMTP; prior config restores that state, not functional provider delivery. Qualify dedicated fallback or explicitly accept temporary transactional unavailability. |
| Direct MX TLS risk acceptance | Before MAIL06 | v1 default opportunistic with explicit weaker Internet transport guarantees; choose strict verification if confidentiality requires it, accepting deferred/undeliverable destinations; no silent downgrade |
| DNS/PTR/certificate issuance and renewal operator | Before MAIL06 | Owner handles DNS/reverse; supplied chain/export hook must be tested. Current mail A/AAAA is not readiness evidence. |
| DMARC authoritative value/report endpoint/provider selector and SPF dual-provider authorization | Before MAIL06 | Reconcile contradictory historical observations; don't replace an existing stronger policy blindly; no fabricated selector or TXT key |
| Offsite backup destination/key custody, RPO/RTO/retention approval | Before accepting production mail | Proposed daily/24h/4h targets need proof; queue-specific recovery remains refused until MAIL05. No zero-loss/HA promise |
| Anti-abuse operational capacity / rate limits | MAIL02 implementation, MAIL06 operation | Set tested bounded per-account/connection limits and disk high-water admission threshold; full spam filtering/forwarding/bulk mail remain outside v1 |

No unresolved choice changes the transport interfaces or prevents MAIL-02 from
building isolated Postfix/OpenDKIM/Dovecot service composition. If an implementation
cannot enforce sender header grants, service-specific authentication, generation
barriers or session revocation, it must stop at its failed gate and amend this
contract through review rather than weakening the guarantees.

**MAIL-01_READY_FOR_MAIL-02**
