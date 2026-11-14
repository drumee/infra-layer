# MAIL-03 engine amendments

Qualified parents: PR38 `465d4e91553edd204b1e3b5ace9ad64791235403` and
Debian PR13 `ad1c7be3c0a6860fb1cfa58918d79cd026828a95`. Incremental drafts
[Infra39](https://github.com/drumee/infra-layer/pull/39) and
[Debian15](https://github.com/drumee/debian/pull/15) target those unmerged branches.
The downstream source lock records the committed producer, archive SHA256/SRI
and closed package inventory. Production npm dependencies remain empty.

## Registry and ownership

Debian owns SQLite/WAL, revision CAS, public request journals, protected FD/TTY
input and the sole public bin/drumee-ctl dispatcher. Infra owns native validation,
rendering, seals, guards and activation. Read the paired
[CLI reference](https://github.com/drumee/debian/blob/feat/mail-03-admin/docs/mail-03/cli.md)
and [recovery protocol](https://github.com/drumee/debian/blob/feat/mail-03-admin/docs/mail-03/recovery.md).

Additive drumee.mail-registry/1 fields:

* Optional mailbox credential_generation is a positive monotonic integer. Change
  it for password/login/authentication-right changes. Unrelated principals retain
  their generation. Missing retains MAIL-02's global registry generation behavior;
  changed native credentials with unchanged/backward generations refuse.
* Optional account dsn_mailbox_id names a retained UUID. New submissions require
  a receiving monitored DSN destination and healthy envelope routes. Missing
  retains the inferred-route behavior. Accepted queue responsibility is unchanged.
* Optional networks.dns_servers is one to three distinct unicast IPv4 resolvers;
  absent retains Docker's resolver behavior. It is sealed in the transport digest.
  The lab declares its resolver before preparation. DNS/MX fixtures belong to a
  distinct project, never to the guarded four-service mail ownership boundary.

Capture/relay, native image and quota module bytes are unchanged. The engine
implementation digest now includes render, lock and purge sources. Registry-only
activation compares policy/config hashes against the actual runtime and refuses
MAIL_RUNTIME_UPGRADE_REQUIRED instead of claiming new templates over old services.

## Admission and interruption

Mail/TLS use Linux flock on a live inherited open-file description. A helper's
exit preserves its parent's lock; final-holder death releases it. Never unlink a
lock or guess staleness from a PID. Non-mail lifecycle locking is unchanged.

stageMailRegistryBarrier verifies full runtime/storage identity, writes a sealed
intent **before** closing admission and permits exact-target resume.
activateMailRegistry with keep_barrier:true publishes/probes native generations
and revokes sessions while leaving admission closed. Debian durably records its
applied SQLite snapshot and receipt, then releaseMailRegistry verifies sealed
projections, UUID inodes and four running/unpaused/healthy services before opening
admission. The engine cannot independently attest that a caller committed SQLite;
the Debian ordering and interruption matrix establish that responsibility.

Guarded existing-storage startup requires the matching recovery target/intent
and preserves closed admission. It neither adopts replacement storage nor bypasses
owner checks. verifyMailCredentials privately compares bootstrap verifiers with
native projections once at adoption. observeMailMailbox obtains exact native
messages/vsize; observations are not capacity reservations. Legacy monitoring is
unchanged. Retained UUIDs continue receiving already accepted queued messages.

## Authentication network amendment

Dovecot additionally joins the existing mail-owned **control bridge** to consume
bounded HTTP10004 in the existing policy container. There is no new container,
host port, client backend or secret mount. Dovecot gains no routing privilege.
Request attributes are empty: no login/password/hash/verifier is transmitted.
Barrier/registry failure returns503; native authentication rejects policy failure.
Header/body/time limits bound the gate. Existing SMTP policy still checks current
SASL generations at MAIL/DATA and returns421 on revoked identities.

This closes new-authentication admission during projection changes using the
[Dovecot2.4.1 interface](https://doc.dovecot.org/2.4.1/core/config/auth/policy.html).
Native isolation/outage/session tests are required; rendering alone is insufficient.
Private submission retains MAIL-02 network amendment B, source drops, verified TLS,
mandatory AUTH and independent client projects, including Docker26 reboot.

## Explicit guarded content purge

purgeMailMailbox requires a stopped tombstoned UUID, empty queue, no unresolved
delivery references or foreign writers and an independent retained backup. It
hashes both copies with numeric owners/modes/nanosecond timestamps and internal
hardlink groups; symlinks, special files, external hardlinks and identity changes
refuse. A durable receipt precedes erasure. Partial resume permits only a verified
remaining subset; unexpected data refuse. The six canonical UUID/home/Maildir
directory inodes and original empty quota-lock inode remain. finishMailPurge
verifies the applied generation behind closed admission and leaves services
stopped. Backup, tombstone, audit and address reservations remain. No queue/bulk
purge or automatic deletion exists. See the paired operator recovery procedure
for catalog construction and exact preconditions.

## Evidence boundary

The paired Debian MAIL-03 dossier records final references, acquisition, runtime
versions, native observations and hosted jobs. Image config ID remains
sha256:ab41ba434fa20afd54f71f43fc31ad2aaa94260193a4e9b56cc0e5c971fb1a56;
quota module SHA256 remains
01fec4a55d42add0d62b939216bec57869513b2dab6b55c83ae51c93dd22f4c5.
Changes to engines/projections, image/module bytes, SQLite/filesystem, topology,
credential schemes or recovery ordering require relevant native replay.
`SMTP_RECOVERY_UNQUALIFIED` remains for autonomous replacement-storage and
coordinated Oxy-form restoration. No exactly-once delivery claim, publication,
merge, deployment or production exposure is implied.
