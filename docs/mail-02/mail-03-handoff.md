# MAIL-03 handoff after MAIL-02 requalification

**MAIL-02_BLOCKED.** Review can proceed, but do not present this as a completed
transport prerequisite. The [qualification matrix](qualification.md) identifies
native quota overflow, failed private ingress and the exact remaining controls.
Do not weaken those guarantees to enable the administrative interface.

The package/producer freeze is `4a73f8984fc1c0f884a8735d741551d8721d31d9`,
unpublished `0.1.0-alpha.7-mail02.4`; Debian's locked consumer and runtime checkpoint
is `47634b1c4c1b882f3c9fc11e997cde7cfd8e2bec`. Final dossier commits add tests/docs;
archive50-member and Debian file hashes are in evidence. Capture/relay remain
unchanged. The new service API is additive CommonJS with strict installed types.

## Administrative boundary

Implement `drumee-ctl mail mailbox`, `alias` and `account` against the authoritative
MAIL-01 registry model, not by editing Postfix/Dovecot files or mutating the JSON
projection directly. The current dispatcher reserves the namespace with
`MAIL_ADMINISTRATION_RESERVED_FOR_MAIL03`. There are no premature mailbox/password
administrative verbs in MAIL02.

Preserve MAIL-01 semantics: contact@oxymot.fr is an example, mailbox UUID is stable,
rename retains Maildir/IMAP metadata and explicitly chooses old alias/rejection,
aliases have no credentials, receive/IMAP/submission flags are independent, default
delete retains messages, and purge is a separate explicit guarded operation.
A retained disabled local-delivery identity must remain resolvable for an already
accepted UUID recipient. The current raw mailbox-removal API refuses
`MAIL_RETAINED_DELIVERY_IDENTITY_REQUIRED`; do not bypass it to implement delete.

Implement masked twice-confirmed TTY input and protected FD input, with cancel/TTY
restoration and bounded validation. Passwords and Argon2id verifiers must never
appear in arguments, environment, journal payloads, stdout/stderr or tracing.
The package takes protected verifier projections; native qualification hashing
used stdin and logged output hashes only. Never turn the test-only `api.cjs` into
an unreviewed administrative command.

## Transaction and generation protocol

The current `activateMailRegistry` offers an apply boundary: lock, expected-generation
CAS, admission barrier, durable intent, immutable private projection, atomic current
symlink, auth cache flush, native generation/userdb verification, targeted affected
IMAP kick and public generation publication before barrier removal. It is not the
authoritative database/request-id journal or complete crash-recovery implementation.

The authority must retain monotonically increasing generation allocation even for
failed staged generations; they cannot be overwritten/reused. Persist request ID,
payload digest, expected revision, committed desired state, apply intent/result
and deletion retention identity. Define duplicate/no-op/conflict responses and kill
at each staged/committed/applied boundary. Reexecution must reconcile the committed
state rather than guessing whether a partial apply succeeded. Never remove an
admission barrier blindly. Native failures preserve it for investigation.

Keep credential-generation high-water marks after SMTP account deletion. Grant,
password and enable-state changes require a new generation; re-creation cannot
reuse an old authentication token. Rotation switches projections without SIGHUP:
Dovecot2.4 reload retires unrelated IMAP workers, so it is not the password-change
path. Target only affected users for password/enable/rename/quota changes. Existing
SMTP sessions are revalidated before acceptance; final in-flight/grant-only fault
coverage is still a MAIL02 residual, not an established exactly-once guarantee.

## Lifecycle, storage and TLS boundaries

Mail is its own project and owns spool, UUID Maildirs, registry, operator state,
policy counters, TLS generations, DKIM material, networks and socket volume.
Ghost/Oxy/Oxymotion do not own these resources. Preserve exact-image/entrypoint,
network/port/mount and numeric-owner checks, closed candidate inventory, marker
plus device/inode pinning, protected projections and same-ref sealing. Do not
recreate a missing durable directory on start. The whole-service preflight runs
before any mail process. Core restart=no is deliberate; the generated mail-owned
systemd unit performs mount requirements, preflight and guarded start at boot.

TLS renewal uses `rotateMailTLS` with protected material files, immutable generations,
SAN/key/chain/time checks, native syntax/reload and verified fingerprint probes on
all active native endpoints. On failure, retain a still-valid previous generation
or fail closed; explicit `reconcileMailTLS` must successfully probe every endpoint
before unblocking. Do not reprepare over sealed key files to rotate secrets.
Existing SMTP TLS sessions keep their negotiated certificate; Dovecot SIGHUP closes
IMAP sessions after its native interval. The private host gateway remains broken
in the qualified Docker26 topology despite the native1587 listener working.

`observeMailService`/doctor return bounded nonsecret queue/disk/quota/auth/certificate,
route/generation/TLS/rate alerts. Per-account60 MAIL/minute and disk thresholds64MiB
or10% free are measured. Do not log raw mail, credentials or unbounded native logs
into administrative output. Fourteen/thirty-day and expiry-refusal coverage remains
open. Local postmaster/abuse destinations were read via IMAP; external notification
and actual owner routing are later-lot work.

## Failures to resolve, recovery and integration

The native count quota accepts concurrent LMTP+APPEND beyond the declared quota.
Do not call sequential quota tests a solution. A reviewed atomic mechanism must
cover LMTP/APPEND/COPY/MOVE plus rollback/crash reconciliation and be requalified.
Private source filtering needs a working authorized independent-client access
path on the supported engine, with both positive/negative sources after recreation
and reboot. Do not adopt app backend networks or waive TLS/auth/source policy.

`SMTP_RECOVERY_UNQUALIFIED` remains for the new profile and coordinated Oxy-form
recovery. Same-storage reboot does not qualify restore onto replacement storage.
MAIL05 must coordinate spool, address/UUID registry, Maildir/index metadata,
credential/key/cert generations and ownership, with uncertain deliveries preserved.
Keep Oxy ledger and deduplication key; an `accepted` entry is not recipient receipt.
Alpha.6 PR37's cold-queue verdict is scoped to alpha.6 and its tested native image.

Actual Ghost transaction clients and future Oxymotion are MAIL04; bulk Ghost mail
is outside scope. Owner-performed DNS/PTR, authorized Internet25 and production
activation are MAIL06. Neither draft PR is approval to publish, deploy or merge.
