# MAIL-03 handoff from the isolated transport qualification

**MAIL-02_BLOCKED globally by the retained Debian lint/packaging checks.**
All native transport rows pass and both initial defects are closed. Do not present
this as an unconditionally completed prerequisite while those gates fail.

Read the [qualification verdict/matrix](qualification.md) and
[reproduction procedure](reproduction.md). The frozen transport package is
unpublished `@drumee/infra-layer@0.1.0-alpha.7-mail02.15`, producer
`de5ea272fe40c77dded529d03ef3ce1f174472ab`, with its exact50-member receipt in
evidence. The qualified image must include the pinned native quota patch; stock
count quota is a known failing implementation. Draft PRs remain unmerged and do
not authorize deployment, publication, public ports or DNS/PTR changes.

## Administrative interface and authority

Implement the reserved `drumee-ctl mail mailbox`, `alias` and `account` namespace
against the MAIL01 authoritative registry and request journal. MAIL02's dispatcher
still returns `MAIL_ADMINISTRATION_RESERVED_FOR_MAIL03`; the qualification-only
`tests/mail/api.cjs` is not an operator administration implementation. Do not edit
Postfix/Dovecot files or managed JSON projections as the authoritative database.

Preserve the stable UUID for `contact@oxymot.fr` through rename, quota changes,
disable and retained deletion. Alias objects have no passwords. Receive, IMAP and
human submission flags are independent. Rename explicitly chooses the fate of the
old address and does not move/recreate Maildir/IMAP metadata. Default deletion
retains messages and a resolvable disabled delivery UUID; tombstone metadata lives
in the administrative authority. The transport projection keeps the disabled UUID
record for messages already accepted by Postfix. Raw removal refuses with
`MAIL_RETAINED_DELIVERY_IDENTITY_REQUIRED`. A future purge is a separate explicit
operation with ownership, queue-reference and preservation checks, never delete's
implicit side effect.

Masked TTY input needs confirmation and safe terminal restoration/cancellation.
Automation uses a protected FD; passwords and Argon2id verifiers stay out of argv,
environment, logs, stdout/stderr and journal payloads. The native qualification
hashes via stdin and stores only protected verifier projections. Never weaken
native authentication penalties to simplify CLI tests.

## Generation, concurrency and recovery protocol

The transport apply API supplies expected-generation CAS, a per-service apply
lock, an admission barrier, durable intent, immutable private content, atomic
projection pointer replacement, native auth/userdb verification, targeted affected
IMAP kicks and public publication before lifting admission. This is not the
complete administrative SQLite/request-id journal or its crash-recovery proof.

MAIL03 must serialize desired-state commit and generation allocation, retain
failed staged generation numbers, record request ID/payload digest/expected
revision/committed state/apply intent/applied revision, and define no-op/retry/
conflict results. The current prepare seal detects incompatible reuse; it is not
a replacement for administrative concurrency control. Exercise process death at
every prepare/commit/apply boundary. Reexecution reconciles the committed authority
rather than guessing that a partial apply succeeded. Complete/reconcile the
recorded sealed pending target before advancing another generation; the test
helper's next-generation convenience is not a recovery protocol. Failure-injection
coverage must include the public/pending-private pointer and native cache metadata
together. Never clear an admission barrier or stale lock solely to make an operation
succeed.

Dovecot2.4.1 passwd-file caches whole-second mtime plus size. The transport apply
path now assigns/fsyncs distinct increasing whole-second mtimes under its lock
before publishing a new generation, keeping sealed content unchanged. Preserve
that cache-invalidation step and native verification. Rapid equal-size quota
changes are tested; a previous collision correctly kept the barrier closed.

Keep SMTP account credential-generation high-water marks after deletion. Password,
grants and enable-state changes require a new generation; re-creation cannot reuse
an old authentication token. Do not use Dovecot SIGHUP for registry/password
changes: its native reload retires unrelated IMAP sessions. Affected users are
kicked explicitly; unrelated sessions survive the tested rotation path.

Before final SMTP250, grant/password changes are revalidated and the native DATA
transaction is refused temporarily, with no new queue entry. After final250 the
owning instance retains responsibility; disabling the account/mailbox cannot recall
an accepted message. Combined all-disable/retained-delete projection rejects new
primary/alias reception, new IMAP and human submission, revokes active tested
sessions, preserves old Maildir data and permits already accepted UUID delivery.
An operation committed before a revocation boundary is not silently erased.
There is no globally atomic recall or exactly-once delivery promise.

## Native quota, filesystem and network invariants

Logical quota is virtual RFC822 bytes over every selectable folder, including
Trash/Sent. Preserve zero grace and the fixed Maildir/private-namespace constraints.
The custom native module serializes growth and folder structure with a stable
UUID-home kernel lock through storage commit/rollback, performs native synchronized
counts without list/count caches, and refuses on count/lock/write failure. Lock
wait is bounded; LMTP temporary refusal retains the Postfix message. Process death
releases the lock, not the lock inode. Restart reconciliation compares per-folder
IMAP sizes/messages against native quota counters (rounded upward in KiB).

COPY requires new capacity. MOVE reserves destination staging capacity before
crediting an actual source expunge; it can be refused without temporary headroom,
while positive MOVE preserves net usage. Quota reduction below use retains data
and reports over-quota. Temporary/index filesystem use has a separate disk guard.
Do not add external writers, shared namespaces, dsync, replication, Sieve or storage
plugins without auditing every writer path and requalifying the exact module/image.
See Debian `profiles/mail/native/DESIGN.md` and its15-file source lock.

Mail owns its project, spool, UUID Maildirs, registry/operator/policy/TLS state,
DKIM references, Unix socket volume and networks. Preserve exact image/entrypoint/
user/capabilities, ports, static frontal address/aliases, complete mounts/network
sets, closed candidate inventory, numeric UID/GID/mode (including special bits),
marker and device/inode checks, and protected secret projections. Start must not
recreate missing durable resources. Bind the sealed operator state to the supplied
config/root/project. A valid state from another profile must not redirect control.

The mail-owned systemd unit requires actual durable mounts and preflight before
starting any core. Core restart=no is intentional. A missing backing mount refuses
before exposure and preserves the underlying sentinel and retained filesystem.
Normal reboot is tested with accepted pending mail on existing storage.

Docker clients use `plan.private_endpoint` on the mail-owned external frontal
bridge, retaining independent backends and their own SMTP credentials plus public
CA only. They do not use the masqueraded gateway as the canonical client route.
Unknown frontal sources and gateway-masqueraded sources are dropped inside the
Postfix namespace before SMTP; startup network capabilities are removed before
Postfix executes. TLS hostname verification, AUTH and sender policy remain
mandatory. Do not add a host firewall bypass or adopt application backend networks.
The amendment and both positive/negative reboot/recreation proofs are in evidence.

## TLS, observations and later lots

TLS renewal uses protected files, immutable generations, SAN/key/validity/chain
validation, native reload and fingerprint probes on all activated listeners.
A failed reload leaves a barrier/intent until explicit successful reconciliation.
Existing SMTP TLS sessions retain their negotiated certificate; Dovecot SIGHUP
retires IMAP sessions after its native interval. Wrong SAN/key, expired leaf and
issuer, missing mandatory STARTTLS, strict outbound expired-MX refusal and expiry
alert transitions are exercised. Do not treat a client timeout as a temporary SMTP
response: the signer fault test requires explicit native4xx and no acceptance.

`doctor`/observations return bounded nonsecret queue/disk/quota/auth/certificate,
rate and incomplete-generation information. Keep the measured64MiB-or10% disk
refusal,60 MAIL attempts/account/minute and7/14/30-day expiry transitions. Future
operator notification plumbing and actual application compatibility remain later
lots. Debian ShellCheck/packaging CI debt is unchanged from the initial baseline;
release acquisition remains a separate failing static gate, not waived here.

**SMTP_RECOVERY_UNQUALIFIED** applies independently to coordinated Oxy-form
restoration and the new profile's queue/registry/Maildir/IMAP/secrets/keys restore.
A normal reboot is not replacement-storage restoration. Alpha.6 cold queue restore
covers only its own tested artifacts. Preserve each instance's accepted queue,
Oxy ledger and deduplication key; `accepted` is not recipient receipt. Replacement
storage, old-backup replay and uncertain final acknowledgments need dedicated
qualification and operator reconciliation. Do not reset application state or
silently replay accepted work to manufacture a clean test result.
