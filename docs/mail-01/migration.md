# Migration, rollback and recovery plan

Every phase records source SHA, artifact digest, config/registry generation,
storage identity, queue count/oldest age, timestamp and responsible operator.
MAIL-01 authorizes only design, read-only inventory and synthetic local probes.
MAIL-04/06 production actions below require their own authorization.

## Persistent resource and backup inventory

| State | Writer / owner | Backup and restore dependencies |
| --- | --- | --- |
| Maildir + Dovecot home/control/index data | Dovecot only; mail service, stable mailbox UUID | Consistent quiesced snapshot of messages **and** UIDVALIDITY/UID lists/subscriptions/flags/keywords/indexes; preserve IDs/UID/GID. Rebuildable caches identified separately, never assume all metadata disposable. Restore registry UUID mapping before enabling LMTP/IMAP. |
| Postfix queue and engine data | Postfix only; owning instance | Requires native quiescence, exact spool structure, queue IDs, per-recipient completion state and compatible engine. Live tar/copy is not qualified. `SMTP_RECOVERY_UNQUALIFIED` stays enforced until MAIL-05 proves it. Never merge two spools or start two copies of one queue. |
| Address/account registry | Administrative operator/SQLite only | Consistent SQLite backup, generation manifest and operation journal; includes tombstones/receiving flags/sender grants/quota/secret-generation refs. Restore to compatible schema and same service identity before generating maps. |
| Credential verifiers and app plaintext projections | Mail owns verifiers; each app owns its own protected plaintext | Encrypted backup with distinct recovery key/access. Registry and verifier generations restored as one checkpoint; never regenerate or reset to defaults. Reconcile restored older passwords with clients and revoke potentially compromised credentials before exposure. |
| DKIM private keys | OpenDKIM projection, operator store | Encrypted key backups with selector/domain/public fingerprint, preserve active and retired selectors while queued mail can need them; public DNS must match. Restore before sending. |
| TLS private keys/chains/trust and renewal integration | Mail operator + external issuer | Protected encrypted backup/reference; check expiry/SAN/key match at restore, reissue if necessary before listeners. Issuer account/DNS access is a separate recovery dependency. |
| Config/software provenance/operator journal | Mail operator | Exact schema/package/member inventory/image digests and applied revision; restore without replaying destructive intents. Reconcile incomplete operations before admitting mail. |
| Oxy ledger + 32-byte HMAC key | Oxy only, `/durable/forms-state` | Preserve same files/mount/key and pending/uncertain records across endpoint change/rollback; their backup alone does not qualify SMTP recovery. Never synthesize a new key against an existing ledger. |
| Ghost SQL/content/config | Ghost owner | Existing isolated restore qualification retained. SMTP config/credential becomes an additional protected dependency; mail-service backup is not a Ghost backup. |

Proposed backup service levels (owner must approve before activation): daily
encrypted off-host checkpoint, RPO <=24h for mailbox/registry snapshots and RTO
<=4h after replacement host availability. Accepted-mail durability between
snapshots still depends on intact spool/storage; queue loss cannot meet zero RPO
without replication, which v1 does not supply. Define escalation for lost accepted
mail, do not advertise zero-loss disaster recovery. Retention proposal 7 daily /
4 weekly / 3 monthly; deleted mailbox messages retained indefinitely until an
explicit authorized purge. Off-host credential custody and restore access require
an actual qualified destination, not the existing read-only backup mount alone.

## Queue restoration qualification protocol (MAIL-05)

1. Stop new admission, record a boundary generation and all queue IDs/recipient
   states without exporting message content. Quiesce native delivery and observe
   all owned writers exited; snapshot spool, mailbox/metadata, registry, verifiers,
   keys and manifests at one coordinated checkpoint. Record in-flight/uncertain
   transfers separately. Refuse a "full backup" before this protocol is qualified.
2. Restore into a new empty owned root, compatible engines/UIDs, **network none**
   or exclusively internal synthetic networks, no production host bindings, no
   real recipient MX access. Original instance must not concurrently deliver the
   copied queue. Preserve original checkpoint immutably.
3. Validate ownership, file hashes, config/registry/credential versions, queue
   integrity, Maildir/IMAP identities and key fingerprints. Recreate only runtime
   sockets/derived maps; do not initialize a nonempty queue. Native queue repair
   actions, if required, are individually recorded and tested.
4. Resume to a synthetic MX/LMTP sink and account for every recipient: pending,
   deferred, completed, bounced, expired or **uncertain**. Include mixed local/
   remote delivery, multi-recipient partial success, quota-full, lost DATA/LMTP
   acknowledgements, crash between Maildir commit and reply, DSNs, key rotation
   and interruption during registry activation. Check no undeclared outbound
   connections, no user-crossed data and no secret leakage.
5. Only the specific tested checkpoint/engine protocol can lift the standalone
   queue refusal. Existing application backup/restore guards are not removed
   globally. Restore-time loss of completion knowledge can resend mail already
   accepted remotely; document duplicate exposure and operator reconciliation.

SMTP cannot make acceptance across hosts atomic. A lost final acknowledgement,
or rollback to a checkpoint predating a completed delivery, can cause duplicates.
Correlate queue ID + owning instance + Message-ID + recipient + timestamps, not
Message-ID alone. Never change Oxy's dedup key, clear its ledger or submit the
form again to resolve an uncertain delivery. Hold ambiguous items for operator
review and controlled sink/recipient evidence; do not silently discard them.

## Phased migration

**M0 — freeze/inventory.** Capture current Oxy config/active revision and exact
image/plugin/distribution receipts, forms-state key/ledger fingerprints and spool
inventory. Current upstream is `mail.drumee.com:587`, not necessarily the same
system as OVH's receiving MX. Inventory every existing OVH mailbox/alias/forward,
human client and outstanding queue; owner approves actual senders/recipients.
Keep existing provider credentials/trust protected and usable for rollback. Do
not rely on one empty-queue observation to retire the old instance.

**M1 — build in parallel.** MAIL-02/03 assemble a separate `oxymot-mail` project,
new root and owned networks/identities. No volume adoption from Oxy/Ghost. Use
synthetic domains, CA and messages with no public bindings or Internet SMTP route.
Qualify negative authentication/TLS/relay/header cases, local delivery, IMAP and
quotas before proposing target installation. MAIL-01 lab is not this gate.

**M2 — target preparation, separately authorized.** Check real target storage,
ports/routes/DNS/provider network policy, obtain valid mail certificate, publish
new DKIM selector and provision exact approved mailboxes/aliases/accounts. Keep
MX on OVH. Validate service config from immutable release receipt. Establish
backups and MAIL-05 isolated restore before accepting production responsibility.
Owner performs DNS/PTR edits; application teams do not own those changes.

**M3 — gradual outbound clients.** First Oxy, then Ghost with separate stop/go
receipts, controlled authorized recipients and full headers. Oxy migration changes
its client endpoint/account/trust and **removes owned mail/DKIM from the new app
composition** using the qualified external dependency contract. Keep its original
spool/root/keys and old native deployment preserved; do not use an update that
removes its only remaining queue writer before draining. If the old project
cannot safely run its queue drain independently of application stop, freeze
Oxy new admission briefly, drain it before application replacement or qualify a
separate legacy drain owner with explicit ownership transfer. Never copy its
spool into autonomous mail. Preserve forms-state mount/key/ledger with the same
plugin revision; verify rollback against both current endpoint descriptors.

Do not attach Ghost to either old Oxy network or the new mail-control network.
Stage Ghost's protected `mail.transport=SMTP`, `mail.from`, options host/private
port, secure=false, requireTLS=true, auth and tls.servername/CA verification,
logger/debug off. Existing configuration JSON supports this path; no assumption
that Ghost understands an `_FILE` env option. Materialize the app credential in
the existing protected JSON mount via a root-only tool reading the secret FD;
never put it in Docker Env, Compose text, command line or Git. Restart only Ghost
when its config requires it; preserve SQL/content and publication settings.
MAIL-04 proves exact Ghost/Nodemailer version options before use; member/newsletter
features stay outside scope. Test a controlled transactional invitation/reset
without enabling staff verification or broad automatic email changes implicitly.

During transition, each instance handles mail it already accepted; service
discovery/certificate verification must continue when Oxy stops/upgrades/rolls
back. Record relay acceptance, remote acceptance and mailbox reception separately.
Existing upstream stays available while old queue drains. No re-enqueue into a
new transport just because the app endpoint changed.

**M4 — migrate mailbox history.** Inventory source IMAP folders/UIDs and permitted
export mechanism. Perform read-only initial IMAP copy to new UUID Maildirs via a
qualified migration tool, encrypted transport and explicit UID/flag mapping;
provider UIDs may change across servers, so document client resync rather than
claim preserving remote UIDVALIDITY. Delta sync and compare per-folder message/
flag counts/content hashes in memory. Preserve the source; do not delete/rewrite
provider mail or mark it read while validating. Local backup/restore of the new
service must preserve its own IMAP UID state. Resolve conflicting edits/deletions
explicitly; no blind bidirectional sync.

**M5 — switch reception.** After MAIL-02–05 pass and owner approval, reduce MX TTL
at least one existing TTL window in advance, update the **complete** target MX set
to the qualified hostname and retain OVH mailbox service during propagation.
Do not leave OVH as a nominal backup MX unless it is deliberately configured to
deliver to the same local mailbox set under a separately qualified contract.
Cached senders will still deliver to old OVH MX, others to new server. Poll/delta
copy old-provider deliveries to new mailboxes with a durable per-source UID
ledger, plus explicit duplicate/conflict handling. No provider forward back to a
domain whose MX points at itself; avoid loops. Qualify provider acceptance and
late-arrival monitoring before cutover, not afterward.

Observe for **at least 7 days** after last DNS change and until old-provider
arrivals/queues are accounted for; extend based on actual sender retry behavior.
DNS TTL is not a hard bound on all cached senders. Keep a route for late old-MX
arrivals until owner explicitly retires it. Unknown local addresses still reject
at RCPT on new MX. Never use catch-all to hide missing migration inventory.

## Rollback and message responsibility

| Trigger | Action / retained responsibility |
| --- | --- |
| Oxy integration failure | Close new form admission first; preserve pending/uncertain ledger. Restore reviewed former app config/endpoint using canonical rollback and same state/key. New mail service continues Ghost/MX unchanged. Old and new queues each finish their accepted messages; no duplicate HTTP submission. |
| Ghost SMTP failure | Restore its prior protected config or approved provider SMTP fallback, restart Ghost only. Current baseline prior config has **no SMTP**, so restoring it disables transactional sending rather than providing a working fallback. To promise provider SMTP fallback, qualify a separate Ghost provider account/config in MAIL-04. |
| Autonomous direct delivery failure before MX cutover | Point clients to their approved provider path; preserve autonomous queue and let it retry direct when corrected. A switch of an existing queue's route to smarthost requires explicit per-instance operation/qualification, not editing direct mode or copying spool. |
| Reception cutover failure | Owner restores OVH MX set/TTL, keeps autonomous 25 listening for cached senders and preserves its accepted queues/Maildirs. Reconcile new-server arrivals back to provider via qualified append/delta workflow; IMAP writes/deltas need conflict ledger. No service teardown while any sender still uses cached new MX or any accepted recipient is unresolved. |
| Bad mail software/config update | Restore a compatible previous image/config revision, retain latest registry/verifiers/Maildirs/queue and keys. Refuse schema downgrade; forward recovery if incompatible. Preserve exact former image digests ahead of update. |
| Disk/host failure | Preserve both stores and uncertainty ledger; restore only through MAIL-05-qualified checkpoint protocol. No manual live spool copies, new dedup key or untested generic backup bypass. |

Provider fallback for **new** outbound submissions preserves alpha.6's verified
TLS and exact imported upstream credential contract. It may require retaining
the old relay as a dedicated reviewed drain/fallback project; that ownership
transition is MAIL-04 work. Direct-MX v1 never silently changes transport mode.
Messages with definitive failure are reported/DSN'd, not automatically resubmitted
through a second provider. Rollback approval does not erase responsibility for
messages accepted during MX propagation by either receiving system.

## Oxymot network and DNS checklist

| Item | Verified now | Proposed value / activation gate |
| --- | --- | --- |
| SMTP identity | Oxy relay hostname `forms.oxymot.fr`; proposed mail host A exists | `mail.oxymot.fr`, EHLO and certificate SAN; owner approval |
| A/source IPv4 | A `15.235.100.230` | Prove actual NAT/source from service, inbound 25/587/465/993 and outbound 25; MAIL-01 performs no live SMTP probe |
| AAAA | `2607:5300:205:200::d222` exists | **Remove/defer mail AAAA** before MX cutover unless inbound/outbound IPv6, PTR, TLS and reputation are separately qualified; IPv4-only v1 cannot justify publishing it |
| PTR | IPv4 reverse is generic VPS name | Owner sets PTR to `mail.oxymot.fr`, proves forward-confirmed reverse; provider control required |
| MX | OVH 1/5/100 | Owner replaces set with proposed `10 mail.oxymot.fr.` only after gates; do not change MX now |
| SPF apex | `v=spf1 include:mx.ovh.com -all` | One record authorizing actual IPv4 **and** current providers during dual operation, e.g. `v=spf1 ip4:15.235.100.230 include:mx.ovh.com -all`; verify mail.drumee.com sender authorization separately before final value |
| SPF EHLO | Not checked | Appropriate `mail.oxymot.fr` policy for actual IPv4/null-sender DSNs |
| DKIM | No active selector established by MAIL-01 | `mail2026a._domainkey.oxymot.fr`, exact public TXT from real key; preserve provider selectors; do not publish fixture keys |
| DMARC | No TXT in 2026-11-12 recursive query with SOA; older reports differ | Owner verifies authoritative state and report destination; proposed initial `v=DMARC1; p=none; adkim=r; aspf=r` for observation, preserving any deliberately stronger existing policy until reviewed |
| Private reachability | Existing Oxy/Ghost source bridges identified | Proposed owned gateway `172.30.250.1:1587`, not allocated; qualify routing/source restriction from both real networks |
| Certificate | Old Oxy private cert expires 2027-02-07 | Independent public mail certificate plus tested renewal/export/reload; no HTTPS-key reuse |

All proposed DNS text must be regenerated from qualified actual inputs. Owner
performs forward DNS, reverse DNS and any provider request. Network provider
permission, IP reputation, abuse monitoring, disk capacity, backup destination,
monitoring recipient and recovery-key custody are launch prerequisites. They
do not block synthetic implementation of the frozen transport contract.
