# Frozen reference and persistence boundaries

## Audited inputs

| Input | Qualified reference |
| --- | --- |
| Infra producer | `09b7f28bce99ba3744e31a0ee5b2dde868a9a86a`, published `@drumee/infra-layer@0.1.0-alpha.6` |
| npm archive | SHA256 `562a01bf5d8dba6151bf3a1768e56655df9e9302ed2ea6f072a4ed72eb177874`; 44 members; exact SRI in [artifact receipt](evidence/artifact.json) |
| Debian consumer | `ff6e6b399128e6332c984fc2e8e60f660bd5f881`, `feat/container-distribution`, not Debian main |
| Oxy-form | Main `fc51a0b58f4ba4c0bfcc25cd2bbe392bedf2f78d`, deployment plugin provenance `39f8dac04c3e986d0bd614265bff9a86b72bfb0a`; Runtime alpha.4 |
| MAIL-01 design | Infra `2328b28b126355e40f18815e74c20e203ca6388f`, [dossier](https://github.com/drumee/infra-layer/tree/2328b28b126355e40f18815e74c20e203ca6388f/docs/mail-01) |
| Production image descriptor | OCI manifest `sha256:c9d6b4d5a69d7c53272ff13a4b90679422d61428a6f868a0463e3bdcfbe58236` |
| Same image loaded locally | Config digest `sha256:a02cc47d0ebca12a55759edb00757b3a8cdd00112ad4afe9a4ff7b5337ffe843`; Postfix `3.10.13-0+deb13u1` |
| Offline helper / client / witness | Local test image `sha256:36afa984f1187ff7fef17356fa7ead13af9a756681ac4a0c234a58fdc38f47e8`, Python 3.13; MAIL-01 image, not a new artifact publication |
| Canonical preparation helper | `node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392` |

Root AGENTS instructions require English documentation and prohibit committing
secrets; Debian instructions preserve generated source trees, existing channels
and immutable acquisition. Oxy-form has no additional AGENTS file at the inspected
main. The alpha.6 qualification, Oxy operations/state implementation and MAIL-01
queue recovery design were read. Working checkouts and untracked `.aws` stay intact.

The npm archive was downloaded independently; SHA256, SHA512 SRI and **every one
of the 44 packaged file hashes** match Debian's immutable source lock. The test
installs that archive with scripts disabled and uses its public planner/composer/
preparation APIs. It does not import a sibling runtime implementation.

Read-only `docker image save` on the existing server exports the Postfix image;
no production container or volume is started/stopped/copied. Docker's source OCI
manifest digest and local image config digest are different identifiers for the
same image payload: the exported manifest points to that config, and the three
rootfs diff IDs match the remote image inspection. [Image evidence](evidence/image.json)
records the archive digest and layer identities. The manifest/config distinction
does not represent a producer version or Postfix binary substitution.

## Canonical versus fixture configuration

`test/queue-restore/prepare.cjs` obtains the unmodified alpha.6 native renderer
through the installed package and real `prepareDeployment`. It selects
`profile:infrastructure`, Postfix + OpenDKIM, provided TLS, authenticated
submission on2525, `mode:relay`, authenticated `[receiver]:2525`,
`relay_tls:required` (native `smtp_tls_security_level=verify`), loopback-only trusted
CIDR and persistent `mail-queue`. No TLS verification is disabled. Certificates
have explicit CA key usage and server SAN/EKU; credentials are generated synthetic
private files, never arguments. Signing is enabled with a generated fixture DKIM
key. Queue expiry/backoff retain canonical 1day / 10–30seconds defaults.

The test-only orchestration changes **only** resource placement and fixture
transport topology: both networks are internal, the receiver is a synthetic TLS/
SASL witness, no port is published, restart is disabled to fence stopped queues,
and restored copies mount replacement storage. The native configs, startup script,
SASL map serializer and queue format are unmodified. Generated config hashes,
prepared revision, input/test source hashes, argv/UTC/exits/output hashes and exact
message/queue IDs are retained in the final report. This is not an ordinary
deployed canonical distribution or a generic lifecycle API recovery result.

## Storage and identities

| Item | Persistence / required recovery treatment |
| --- | --- |
| `/var/spool/postfix` | Entire cold spool: incoming/active/deferred/hold/bounce/defer/maildrop and other native subdirectories, `infra-data`, queue records, numeric ownership, modes, nanosecond mtime and ownership marker. Do not select only visible deferred message files. |
| `.infra-owner` | Exact JSON `{owner:INSTANCE_ID,resource:mail-queue}` from canonical entrypoint. Logical identity remains unchanged on replacement; wrong owner/resource refuses. It is not a license to run two copies. |
| `/var/spool/postfix/infra-data` | Persistent Postfix auxiliary state; owned by postfix after native initialization. Included, not regenerated independently of checkpoint. |
| `/run/infra-mail`, `/tmp` | Disposable tmpfs. TLS leaf copy, runtime config, internal SASL DB and external SASL password map are reconstructed from protected references by the unchanged entrypoint. Do not archive/replay live tmpfs auth maps. |
| Spool `private/*` / `public/*` Unix sockets | Runtime endpoints, not messages. The cold inventory records and excludes only socket nodes in these two directories; preserves the directories and their metadata. Native startup recreates sockets. Any other special node/hardlink/symlink or extended metadata refuses this limited procedure. |
| Postfix identity | UID102/GID103 in the exact image; root bootstrap; postdrop is a **group**, not a user. Numeric group identity is recorded by the native probe in the result. DKIM fixture service UID/GID1000. No renumbering/chown-to-current-user of spool files. |
| TLS/CA, SMTP submission/upstream credentials, DKIM key | Separate protected store/projections and provided cert references. Preserve exact generations, descriptor types/consumers, trusted CA chain, leaf/key/SAN/expiry and DKIM selector/public key. The spool archive alone cannot recover these dependencies. |
| Oxy forms-state ledger + 32-byte HMAC key | Separate application resource; not in the spool. Never reset either to facilitate recovery. No actual application ledger is read or restored by this lot. |
| Future Maildir/IMAP registry | Absent from alpha.6 relay. No local mailbox/LMTP/IMAP restoration is claimed. |

The initial source is a private bind-backed resource. Replacement and stale-copy
tests use distinct, labeled Docker **volumes**, with verified distinct spool
inodes and exact metadata/content inventories before startup. These are new logical
storage resources on the same qualification host. No physical disk failure,
offsite retrieval, filesystem migration, encryption restore or replacement-host
boot is claimed.

Archives/receipts are mode0600 under a mode0700 owner directory; file contents
and credential-bearing projections remain local. The independently retained
receipt hash is the trust anchor; archive self-checksum alone is insufficient.
In operations, encrypt message archives and credential backups under separately
managed recovery keys and test retrieval/decryption before relying on them. This
lot qualifies protected local artifacts, not an offsite encryption/retention SLA.
