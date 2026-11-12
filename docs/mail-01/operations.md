# Managed registry and drumee-ctl specification (MAIL-03)

**Specification only.** No command below exists as a result of MAIL-01. Debian
MAIL-03 implements it in `profiles/mail/operator.js`, selected by early dispatch
in the existing `bin/drumee-ctl`; do not create a second operator executable or
enter legacy Team autodetection. Canonical invocation:

```text
drumee-ctl --profile mail mail <mailbox|alias|account> <operation> ...
  --config /etc/drumee/mail.json [--json]
```

The repeated `mail` is intentional: `--profile mail` selects the lifecycle owner;
`mail` selects its administrative namespace. The profile also exposes
`validate|plan|install|status|doctor|start|stop|restart|upgrade|rollback|backup|restore`
as top-level lifecycle operations with `--execute` on mutations. No implicit
selection from cwd. `mail ...` mutations require `--execute`, `--request-id UUID`
and `--if-revision N` in automation; interactive mode obtains revision under lock
after presenting the change. Default output is concise human text; `--json`
returns the stable envelope below without progress text on stdout.

## Registry schema drumee.mail-registry/1

SQLite is the authoritative local registry, single writer, WAL journal and
`synchronous=FULL` on a qualified local filesystem; use an SQLite consistent
backup plus a revision manifest, never copy live DB/WAL piecemeal. No application
SQL server dependency. MAIL-03 pins/tests its SQLite binding. Logical entities:

| Entity | Fields and invariants |
| --- | --- |
| Registry | schema ID, service UUID/owner marker, monotonic `desired_revision` and `applied_revision`, operation journal, integrity version |
| Mailbox | random immutable UUID, canonical primary address FK, created/modified times, `receive_enabled`, `imap_enabled`, `submission_enabled`, quota bytes, tombstone/retention metadata, auth principal FK; home derives from UUID |
| Address | globally unique canonical address, kind primary/alias, mailbox UUID FK, receive flag, retired/tombstone state; local domain FK; exactly one active primary per live mailbox |
| Mailbox principal | stable UUID/login primary address, salted Argon2id verifier ref/generation, no shell; permissions derived from mailbox flags; authorized senders primary plus explicitly granted aliases |
| Submission account | stable immutable ID (`oxyform`, `ghost`), distinct credential generation, enabled flag, exact envelope grant set and exact RFC5322.From grant set, local DSN destination; no mailbox/home or IMAP privilege |
| Operation | UUID, nonsecret normalized intent, actor UID, base/target revisions, phase, timestamps, result code/receipt, retained credential-generation reference; never raw password/body |
| Secret generation | protected local verifier, scheme/parameters/generation; imported app plaintext remains only in separate protected application-owned file; service stores verifiers |

Address grammar: lower-case ASCII local-part `[a-z0-9][a-z0-9._-]{0,63}`,
no consecutive dots or terminal dot; domain is an exact declared lower-case
ASCII FQDN. Total <=254 bytes. Reject quoted local parts, SMTPUTF8, address literals,
wildcards, whitespace, controls and implicit plus addressing. Canonicalization is
an explicit lower-case contract; case variants collide. Login aliases are not
accepted. Mailbox ID, account ID and alias address are different namespaces;
no account can impersonate a mailbox login by reusing its name. All foreign keys
restrict deletes; account/alias grants cannot silently point to tombstones.

Mailbox paths are `/mailboxes/<uuid>/Maildir` and `/mailboxes/<uuid>/home` for
Dovecot metadata. Preserve UIDVALIDITY, UIDs, subscriptions, keywords, flags and
index/control files with Maildir data. Read-only CLI never enumerates message
subjects/content. `show` can report bytes/messages/over-quota and state age;
counts are observations, not locking delivery.

## Mailbox commands

All object mutations select a UUID or exact primary address; outputs always
include stable UUID. Flags accept explicit `true|false` only, never toggle.

| Command after `mail mailbox` | Parameters / semantics |
| --- | --- |
| `list` | `--limit 1..1000` default 100, `--cursor TOKEN`, `--include-deleted`; stable UUID ordering and snapshot revision; expired cursor -> conflict |
| `show contact@oxymot.fr` | State, flags, primary/aliases, quota/use, credential generation number only; deleted object requires `--include-deleted` |
| `create contact@oxymot.fr` | Optional `--quota-bytes N` (default from plan); masked password input; receive/IMAP true, submission **false** by default; new UUID and owned empty Maildir staged before activation |
| `update contact@oxymot.fr` | Explicit `--receive true|false --imap true|false --submission true|false` (at least one); primary address/quota/password require their dedicated commands |
| `rename contact@oxymot.fr --to accueil@oxymot.fr` | Same UUID/Maildir/metadata/verifier/quota; default `--old-address alias`, alternative explicit `reject`; see below |
| `enable contact@oxymot.fr --scope receive|imap|submission|all` | Scope **required**, sets selected flags true; `all` explicitly opts in to all three |
| `disable contact@oxymot.fr --scope receive|imap|submission|all` | Scope required; details below; does not delete messages |
| `delete contact@oxymot.fr` | Disable all, invalidate sessions, retire primary/aliases/grants and tombstone; retain Maildir/home/verifier recovery material, no purge |
| `quota contact@oxymot.fr --bytes 1073741824` | Set hard per-mailbox quota; positive bounded integer; below current use returns success with `over_quota:true`, no deletion |
| `password contact@oxymot.fr` | Rotate verifier via masked input or `--password-fd N`; no password option/value or generated password output |
| `purge UUID --confirm-mailbox UUID --backup-id ID` | Explicit **separate** destructive operation on an already deleted mailbox; `--execute`, request/revision guards; require verified retained backup and zero unresolved LMTP/queue references; no broad/bulk purge |

Example: `mail mailbox create contact@oxymot.fr --quota-bytes 1073741824`
creates no alias or SMTP app account automatically. Reserved `postmaster`/`abuse`
addresses may be aliases to contact but are declared separately and cannot be
removed while public MX admission is enabled.

Receive disable rejects **new SMTP RCPT** to primary and all aliases (alias-level
disable may be narrower). It does not prevent completion of already accepted
queued delivery to that mailbox's immutable internal delivery ID. Preserve that
LMTP identity until queued responsibility is resolved, even after tombstoning.
Messages already in a Maildir stay accessible if IMAP is enabled. IMAP disable
blocks new authentication and terminates that mailbox's existing IMAP sessions.
Submission disable blocks new SMTP auth and MAIL/DATA under that principal,
revokes existing authenticated sessions at their next MAIL/DATA command;
receive/IMAP remain unchanged.
`all` applies all effects. Application accounts are unaffected by a mailbox flag
unless their monitored DSN destination becomes unusable, in which case reject
new account submissions with a health error until repaired; do not discard DSNs.

Rename default retains the old address as a receiving-only alias to the same
UUID, preserving its prior receive flag; SMTP sender rights for the old address
are removed unless explicitly regranted. `--old-address reject` retires it so new
RCPT returns 550; prior accepted messages still deliver. The new primary is the
only IMAP login, old login immediately stops working; active IMAP sessions are
disconnected to avoid stale login mappings, then reconnect using new address.
Alias collisions, other-domain absence and retired-address reservations refuse.
No filesystem move, copy, password reset or mailbox merge. Explicitly removed
addresses stay reserved while old queue references/retention remain; no silent
reassignment of another person's mail. Restore of a tombstone is a reviewed
recovery operation with the original UUID, not `create` reuse.

## Alias commands

```text
mail alias list [--mailbox UUID|ADDRESS] [--limit N --cursor TOKEN]
mail alias create hello@oxymot.fr --mailbox contact@oxymot.fr
mail alias update hello@oxymot.fr [--mailbox UUID|ADDRESS] [--receive true|false]
mail alias delete hello@oxymot.fr
```

Alias has no password, login, quota, Maildir or independent submission identity.
Target must be one live local mailbox; no alias-to-alias chain, wildcard, loop,
external forward or primary-address collision. Repoint affects new admissions;
already accepted messages retain their resolved delivery UUID. Alias deletion
rejects new RCPT and removes explicit sender grants referencing it atomically;
it never deletes messages. Listing/showing mailbox includes aliases and flags.
`update --mailbox` reports old/new UUID and requires explicit expected revision.
An alias being receive-enabled cannot override mailbox receive-disabled.

## Submission account commands

```text
mail account list [--limit N --cursor TOKEN]
mail account show oxyform
mail account create oxyform --envelope-from forms@oxymot.fr \
  --header-from forms@oxymot.fr --dsn-mailbox contact@oxymot.fr
mail account update oxyform --envelope-from forms@oxymot.fr \
  --header-from forms@oxymot.fr --dsn-mailbox contact@oxymot.fr
mail account enable oxyform
mail account disable oxyform
mail account password oxyform [--password-fd 3]
mail account delete oxyform
```

Create/update accept repeatable exact address flags; update replaces each supplied
set, never silently appends. Empty grant set, nonlocal/unroutable DSN destination,
wildcard, null reverse-path or unapproved alias fail. Each allowed envelope address
must receive DSNs via a live mailbox/alias. Account create requires password and
explicit complete grants; default disabled until `enable`. No mailbox command
can create an app account. IDs are immutable, delete tombstones; create another ID
to rename. Oxy and Ghost have different accounts/verifiers and grants. SMTP-only
account lifecycle never deletes delivered messages or already queued mail.

## Password entry and rotation

Interactive password commands require a TTY, disable echo, prompt twice and
compare exact input in memory; cancellation restores terminal settings. No
password in argv, environment, stdout, stderr, logs, tracing, exceptions or
shell history. No `--password`, `--password-file` or output-secret feature.
Automation uses `--password-fd N`, N>=3, already-open protected pipe or regular
0600 single-link owner-matched file, not TTY/socket/device/symlink; open/fstat and
no-follow identity checks apply. Read <=1024 bytes to EOF, reject NUL/CR/LF,
invalid UTF-8, BOM, empty or <16 bytes; no trim/normalization. Up to 1024 bytes,
spaces/punctuation accepted exactly. FD mode is one entry, no confirmation read.
An automation pipe must have a private writer; inherited descriptors close after
use. This new verifier-backed password grammar does not alter legacy alpha.6
external relay credential rules.

```sh
# The protected file was populated out of band; it has no final newline.
exec 3</protected/mail/oxyform-password
drumee-ctl --profile mail mail account password oxyform \
  --config /etc/drumee/mail.json --password-fd 3 --if-revision 17 \
  --request-id 9651d3d7-d35e-4cb9-8eaf-9512bbdd6336 --execute --json
exec 3<&-
```

Argon2id with random salts, minimum 64 MiB / 3 iterations / parallelism 1 is the
verifier baseline; qualify CPU/RAM/auth limits and pin exact format in MAIL-03.
Refuse weaker fallback. Dovecot auth cache is disabled. Debug/password logging
is disabled, including on mismatches. Mail server stores no reversible app
password; app/ Ghost operator holds its own private projection.

Rotation applies to new authentications immediately after successful generation
activation. **Default rotation disconnects existing sessions for that principal**:
IMAP via targeted Dovecot kick; SMTP via generation-aware before-queue authorization
check on each MAIL/DATA (no whole-server restart). Dovecot SMTP passdb returns a
canonical SASL identity containing immutable account/principal UUID and credential
generation, distinct from the login typed by the client. Postfix receives that
identity through the Dovecot auth protocol; sender-login maps and the originating
policy authorize only currently active identity generations. Thus even an old
AUTH followed by its first MAIL after rotation is stale and refuses. The policy
returns 421 and closes the session on its next MAIL/DATA; idle connections can
remain until the bounded 300-second submission idle timeout, with no sending
rights. This canonical identity is not an IMAP login or a client-chosen suffix.
An old already-authenticated SMTP connection must not send after commit. A
transaction that crossed durable final acceptance before the barrier remains
queued and must finish; a transaction without final 250 is potentially uncertain.
TLS session resumption never bypasses credential/generation checks. MAIL-02/03
must prove the exact native mechanism; otherwise rotation reports incomplete
activation, closes submission admission and cannot claim success.

App operators stage a new protected password, rotate server account, atomically
switch only that client's projection/config and restart/reload that client as
needed. Brief new-auth failures are expected between steps; hold new form
requests before Oxy rotation, preserve pending/uncertain ledger entries. Ghost
transactional requests can also fail during the gap; inspect outcomes before
retry. There is no automatic two-password grace window in v1. Do not roll back
the mail registry to restore an old leaked password; rotate again if needed.

## Concurrency, crash safety and idempotency

One lock covers config/lifecycle/registry mutation per service. Locks are held by
live file descriptors/OS locks, not stale PID guesses. Readers obtain a consistent
applied snapshot. Required `--if-revision` performs compare-and-swap; concurrent
winner commits, loser returns `MAIL_REVISION_CONFLICT` with current revision and
no partial change. No last-write-wins update, automatic retry or lock removal.

Operation phases: `validated -> staged -> committed -> applying -> applied`.
Stage a new private generation of all maps/passdb/userdb/grants/config, native
syntax-check and hash it; stage credentials and any new empty mailbox resource.
Each credential generation has a new immutable passdb path in the staged config;
explicitly reload Dovecot and probe the returned SASL generation. Disabling auth
cache alone is insufficient: passwd-file has its own file-change observation
behavior, as the MAIL-01 lab demonstrated. Do not release admission merely because
a credential file's contents changed.
Commit desired SQLite state and intent durably; enter admission barrier that
returns 451 on **new** SMTP/LMTP admissions and blocks new affected auth. Drain or
terminate in-flight transactions, retaining every accepted queue item. Atomically
switch the complete generation directory, reload engines, invalidate sessions
and probe effective generation; then record applied revision, release barrier.
IMAP reads unaffected by unrelated mailbox changes may continue. Userdb/maps
cannot independently activate different revisions. Restriction changes must not
leave stale authenticated connections privileged after success.

Failure before commit removes only owned staging and leaves old applied state.
Failure after commit returns `MAIL_APPLY_INCOMPLETE`, records desired/applied
revisions and operation ID, retains barrier and all state. Restart reconciliation
reads intent, verifies ownership/generation, finishes the same activation or
retains closed admission for operator repair; never guesses a new password,
deletes a Maildir or restores an older security grant. A reboot recreates sockets
and projections only from verified committed generations after storage guards.

Same request ID with same public intent returns the stored operation/result;
it does not create another UUID or rotate again. Password retries return that
operation receipt and do **not** reinterpret the FD as another rotation; use a new
request ID for any new password. Reusing ID with changed public intent conflicts.
Receipts persist through restart, including incomplete operations. Delete/disable
already in requested state with a new request ID is a successful no-op and returns
`changed:false`; create with an occupied/reserved address conflicts. Secret hashes
and password-derived intent digests are never returned. Logs contain actor,
operation, object ID, revisions/result only; address display is administrative
data and must not be treated as public telemetry.

## Machine output and errors

```json
{"contract":"drumee.mail-cli/1","ok":true,"code":"OK","operation_id":"9651d3d7-d35e-4cb9-8eaf-9512bbdd6336","changed":true,"desired_revision":18,"applied_revision":18,"data":{"id":"oxyform","credential_generation":3,"enabled":true}}
```

```json
{"contract":"drumee.mail-cli/1","ok":false,"code":"MAIL_APPLY_INCOMPLETE","operation_id":"9651d3d7-d35e-4cb9-8eaf-9512bbdd6336","desired_revision":18,"applied_revision":17,"retryable":true,"data":{"admission":"closed"}}
```

List `data` is `{items:[],next_cursor:null,snapshot_revision:N}`. Show includes
explicit flag/quota/address fields; no verifier, password, message body, internal
secret path or populated native map. JSON errors use stdout one object, stderr
optional sanitized operator hint; no stack trace/child stderr. No partial list
on failure. Lifecycle/status also reports storage guard, cert expiry, queue
count/oldest age, desired/applied generation and unresolved uncertainty.

| Exit | Stable codes / meaning | Retry rule |
| --- | --- | --- |
| 0 | `OK`, successful no-op | Inspect `changed` |
| 2 | `MAIL_USAGE`, `MAIL_VALIDATION`, `MAIL_PASSWORD_INVALID`, `MAIL_SECRET_INPUT_UNSAFE` | Correct input; no mutation |
| 3 | `MAIL_NOT_FOUND` | Re-read identity |
| 4 | `MAIL_ADDRESS_CONFLICT`, `MAIL_REVISION_CONFLICT`, `MAIL_REQUEST_CONFLICT`, `MAIL_DOMAIN_IN_USE`, `MAIL_PURGE_REFERENCED` | Read current state, do not blind retry |
| 5 | `MAIL_NOT_AUTHORIZED`, `MAIL_RESOURCE_IDENTITY_MISMATCH` | Repair ownership/authorization, no auto-adoption |
| 6 | `MAIL_LOCK_BUSY`, `MAIL_DEPENDENCY_UNAVAILABLE` | Bounded retry same request ID |
| 7 | `MAIL_APPLY_INCOMPLETE`, `MAIL_RECOVERY_REQUIRED` | Read operation/status, reconcile same intent |
| 8 | `MAIL_STORAGE_UNSAFE`, `MAIL_INTEGRITY_FAILURE`, `SMTP_RECOVERY_UNQUALIFIED` | Operator intervention; no destructive fallback |
| 130 | `MAIL_CANCELLED` | No precommit mutation; inspect receipt if interrupted after commit |

Unexpected native/IO failures map to sanitized `MAIL_RECOVERY_REQUIRED` after
commit, dependency/storage code before commit. Failure status does not imply a
message was never accepted. All commands support `--help` with no secret access.
