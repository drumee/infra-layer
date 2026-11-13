# MAIL-02 isolated service candidate

Draft delivery: [Infra PR #38](https://github.com/drumee/infra-layer/pull/38) and
[Debian PR #13](https://github.com/drumee/debian/pull/13). Both remain unqualified.

This is an unpublished implementation candidate, not a production activation or
an overall MAIL-02 qualification. The authoritative gate remains the unchanged
[MAIL-01 matrix](../mail-01/qualification.md). See `qualification.md` for measured
results and remaining gates. `capture` and `relay` keep their alpha.6 contracts.
The additive CommonJS/type export is `@drumee/infra-layer/mail-service`.

## Reference and provenance

- Infra MAIL-01: PR [#36](https://github.com/drumee/infra-layer/pull/36),
  `2328b28b126355e40f18815e74c20e203ca6388f`.
- Debian MAIL-01: PR [#12](https://github.com/drumee/debian/pull/12),
  `3c91036f95528e3f9baa04cb78b2b74ae96f63a1`.
- Debian implementation base: `feat/container-distribution`,
  `ff6e6b399128e6332c984fc2e8e60f660bd5f881`.
- Alpha.6: `09b7f28bce99ba3744e31a0ee5b2dde868a9a86a`;
  archive SHA256 `562a01bf5d8dba6151bf3a1768e56655df9e9302ed2ea6f072a4ed72eb177874`.
- Alpha.6 cold restore: PR [#37](https://github.com/drumee/infra-layer/pull/37),
  `6cc3483991b95d0f0c68e46ef9d62d1ca917c5f5`. Reuse its checkpoint,
  ownership, replacement-storage and acknowledgement-loss scenarios in MAIL-05;
  its verdict does not cover this profile.
- The requested local `74f72c9` / previous `feat/mail-02-service` could not be
  found in local refs, reflogs, unreachable objects or remote heads. This branch
  starts from the exact MAIL-01 source. No provenance is attributed to that
  inaccessible implementation.

## Implemented boundary

The dependency-free validator checks the MAIL-01 schema and semantic constraints,
normalizes defaults without changing its input, and refuses additional fields.
`planMailService` seals spec, registry projection, protected secret references and
native artifacts. `composeMailService` emits a separate four-service project:
Postfix, OpenDKIM, Dovecot 2.4 and a bounded Node socketmap/policy/Milter helper.
The runtime has no application-container dependencies. Control ports 10001–10003
and DKIM are confined to its internal control network; LMTP and SASL use a shared
Unix-socket volume. Mailbox UUID directories use vmail 5000:5000 with mode 0700.
The helper does not receive password verifiers or TLS/DKIM private keys. It enforces bounded per-account submission attempts and disk high-water admission through marker-file-only storage views.

Port 25 has no AUTH, optional STARTTLS, local primary/alias recipient maps and no
CIDR relay bypass. Maps fail temporarily when unavailable. Ports 587/465 require
TLS and SASL. A before-queue Milter checks canonical credential generation,
envelope grants and one permitted From; conflicting Sender, Resent and duplicate
From headers are refused. SMTP application principals are absent from IMAP's
passdb. Incoming mail bypasses the originating signing chain. Direct MX delivery
has an empty relayhost and no outgoing SASL; global/domain TLS policies select
`may` or `verify`. Dovecot delivers over LMTP to stable UUID Maildirs with count
quota, zero grace and temporary full-quota refusal. No forwarding/catch-all is
introduced. Count quota has a measured concurrent LMTP/IMAP overflow and is not qualified. A distinct1587 native listener enforces declared source CIDRs, but its independent host-gateway access path fails in the tested Docker26 topology.

`prepareMailService` enforces owner identity, protected paths, exact local OCI
config IDs, key/host/chain validity, immutable credential generations and durable
resource markers. Native startup refuses a missing/wrong queue or Maildir marker;
only explicit initial preparation seeds a new spool. It retains all durable data
on stop. Runtime activation additionally checks complete image/execution/network/port/mount identities, stable Maildir owners, storage inodes and closed secret projections. All core services use restart=no; a mail-owned guarded boot unit is supplied by Debian. Config and verifier digests are checked before lifecycle operations.
Public-port activation is deliberately refused by the candidate: only isolated
acceptance composition may start. This is a protection for unfinished gates.

`activateMailRegistry` uses a lock, expected-generation comparison, admission
barrier and durable intent record. It atomically switches a complete immutable
private projection through a relative symlink, verifies native auth generation,
kicks affected IMAP users (including quota changes) and publishes the public registry before removing the
barrier. Exceptions retain the barrier. It does not implement the authoritative
MAIL-03 database, request-id journal or crash reconciliation. An incomplete
activation requires inspection; do not remove its barrier blindly.

Before signing, the Milter removes only Authentication-Results assertions claiming the local service identity. The delivered receiver message retains external results as untrusted metadata and still verifies DKIM. TLS rotation/reconciliation and nonsecret observation APIs are documented in the updated qualification and reproduction files.

The public APIs consume Argon2id verifier strings, never plaintext passwords.
The laboratory sends synthetic passwords to `doveadm pw` through stdin only;
command receipts contain hashes of output, never the verifier output itself.
Authoritative password input and administrative verbs remain MAIL-03.

## Lab reproduction

Use Node 22, Docker/Compose and the exact image IDs in `qualification.md`. Acquire
those images locally; do not pull a mutable substitute or publish this candidate.

```sh
npm ci
npm test
npm run lint
npm run test:package
mkdir -m 700 /tmp/mail02-pack
npm pack --ignore-scripts --pack-destination /tmp/mail02-pack
# Install the archive in a private consumer with scripts disabled. Copy the
# source/archive/member receipt to CONSUMER/mail02-receipt.json.
MAIL02_CONSUMER=/absolute/private/consumer python3 test/mail-service/run.py
```

The harness refuses a missing installed-consumer path or receipt. Preparation and
rotation import the installed package, never sibling implementation source. It
creates internal Docker networks, publishes no host port, has no external DNS
forwarder and uses only `dest.invalid` MX witnesses. It records exact argv, exit
status and stdout/stderr hashes, correlates queue IDs and durable receiver files,
and checks native DKIM using `opendkim-testmsg`. Generated credentials, messages,
certificates, verifiers and native logs remain in private temporary directories.
The sanitized report is the shareable evidence. Cleanup stops only the named lab
project and retains queue/Maildirs; no volume or message purge is performed.

The harness fault-injects native Postfix TLS settings for the strict/opportunistic
negative control and restores the setting. These mutations are recorded commands,
not a claim that two distinct release artifacts were qualified.

## Handoff

See [qualification.md](qualification.md) for unfinished MAIL-02 gates and [MAIL-03 handoff](mail-03-handoff.md) for the detailed administrative boundary. MAIL-03 may review the API and
protocol but must not infer MAIL-02 completion. Keep the MAIL-01 administrative
semantics and implement an authoritative transactional registry, protected password
input, request-id/CAS/idempotency, crash recovery and purge guards there. MAIL-04
must test real Ghost/Oxy clients on independent projects; the current Ghost test
is an SMTP-account fixture, not a deployed Ghost application.

`SMTP_RECOVERY_UNQUALIFIED` remains applicable to coordinated Oxy-form recovery
and to the new profile's complete queue/registry/Maildir/IMAP recovery. Do not reset
the Oxy ledger or deduplication key. `accepted` proves local SMTP acceptance only.
