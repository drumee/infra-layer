# Proposed Infra Layer contract: drumee.mail-service/1

## Version and integration boundary

This is an additive **new public contract**, separate from infrastructure spec
v2's `mail` object. Proposed exports from `@drumee/infra-layer/mail-service`:
`validateMailService(spec)`, `planMailService(spec, resources)`,
`composeMailService(plan, distribution)`; TypeScript declarations ship together.
Validation returns `{valid, normalized, diagnostics:[{code,path,severity}]}`;
invalid plans have `applicable:false` and cannot prepare. Normalization never
reads secrets or mutates the input. Canonical serialization, sorted set fields
and explicit defaults determine a SHA256 plan revision. Image digests, resource
identity, certificates' public fingerprints and applied registry generation are
part of the activation attestation; password material is never in the plan.

Existing `planInfrastructure`, `validateSpec`, v1/v2 specs, capture/relay,
`smtp-external-credential` and old lifecycle exports retain behavior. New fields
are **not** sent to old validators. A new unused producer release and exact npm
URL/SRI/member inventory are required after implementation/qualification; MAIL-01
does not allocate or publish alpha.7. Reject unknown versions/fields. Breaking
semantic changes require `drumee.mail-service/2`; additive optional fields require
schema/design revision and negative compatibility tests, never reinterpretation.

Debian adds `distribution.profile: mail` and `profiles/mail`. A new mail lifecycle
descriptor carries `contract: drumee.mail-distribution/1`, exact source/package/
image identities, owner, four resource records (spool, mailboxes, registry,
operator-state), secret projections and permitted network/listener inventory.
Use the new composition path; do not weaken `lifecycle/composition.js` whitelist
or make an application manifest impersonate infrastructure. Native renderers and
validation are shared by future channels; initial qualification is Docker only.
No Team/native-host migration is implied.

## Declarative shape

The normative [JSON Schema](mail-service.v1.schema.json) uses draft 2020-12.
All objects reject extra fields. Required fixed policy fields make the security
model explicit. [service.valid.json](examples/service.valid.json) is a complete
example with disabled public listeners, empty registry and **placeholder** image
digests. It uses proposed, unallocated network/UID values; planning must label
them `SITE_INPUT_UNQUALIFIED`, and activation must reject placeholder images.

| Field | Rules / defaults |
| --- | --- |
| `contract` | Exactly `drumee.mail-service/1` |
| `deployment` | Stable ID/project, absolute owned root, disjoint backup root, non-root operator UID/GID; exact four image digests. Resource ownership cannot change through an ordinary config update. |
| `hostname`, `domains` | Canonical lower ASCII DNS names; domains nonempty, unique, IDNA A-labels preconverted explicitly. SMTP hostname may differ from mail domains. No trailing dot, wildcard or IP literal. |
| `ip_family` | Default/only v1 value `ipv4`. AAAA publication is a site gate and does not enable IPv6. A future qualified revision may add it. |
| `networks` | Explicit private RFC1918 edge subnet/gateway and private submission bind/port/source CIDRs; see cross-checks. CIDRs are reachability controls, never authentication. |
| `listeners` | Four explicit host exposure records: 25/587/465/993. `enabled` defaults false; no exposure inferred from a port string or DNS record. Private endpoint always authenticated STARTTLS. |
| `tls` | Provided full certificate chain, private-key ref, client CA bundle ref, TLS >=1.2; renew-before default 30 days. No issuer private key supplied to apps/services. |
| `outbound.mode` | Exactly `direct-mx`; no relayhost, relay credentials, smarthost fallback or address rewriting. |
| `outbound.tls` | Default `opportunistic` -> Postfix `may`; `required-verify` -> `verify` for every destination, no clear fallback. `require_verify_domains` default empty, exact recipient-domain policies override opportunistic mode. |
| Queue policy | Message/bounce expiry 432000 s (5 days); minimum/maximum retry 300/4000 s, queue scan 300 s. Native Postfix schedules, not guaranteed delivery deadlines. |
| `delivery` | `lmtp-unix`, `maildir-by-id`, quota-full temporary; quota default 1 GiB per new mailbox, max message 10 MiB. Existing mailbox quotas never silently change with a default update. |
| `dkim` | One active RSA selector/key ref per sending local domain, 2048-bit minimum; no duplicate selectors/domain; domain must be declared. |
| `registry` | Exactly `drumee.mail-registry/1`, bootstrap `empty`. Desired config contains no mailbox/account/password lists; operations owns them. |

## Required semantic validation beyond Schema

1. Validate FQDN label lengths/grammar; domains and hostname have at least two
   labels and no special-use name at production activation. Apply the deliberately
   narrower ASCII email grammar from [operations](operations.md); no SMTPUTF8,
   implicit plus extensions, regex/catch-all address maps or external alias target.
2. Reject roots equal, nested, symlinked, shared, top-level system directories,
   foreign-owned or group/world writable. Use descriptor-based no-follow traversal,
   exclusive creation, inode/owner checks and durable ownership markers. No existing
   nonempty resource is initialized/adopted automatically. Refuse root/project/UID
   drift with `MAIL_RESOURCE_IDENTITY_MISMATCH`.
3. Require nonoverlapping owned subnet, available gateway/bind/ports, no conflict
   with host routes or existing projects. Private bind must equal owned gateway;
   never `0.0.0.0`, public, loopback or a foreign interface. Source CIDRs must be
   private, canonical, non-/0 and exclude the mail-control network. Reject arbitrary
   bind substitutions at activation. Public listeners accept IPv4 literal binds;
   their firewall reachability still needs separate authorization.
4. Enforce `minimal_backoff <= maximal_backoff`; queue scan <= maximum backoff;
   message size <= new default quota. Paths/maps, shell strings or native config
   snippets are not user extension points. Direct mode refuses `relay_endpoint`,
   `relay_user`, `relay_secret_ref`, trusted-network bypass or `relay_tls:none`.
5. Every local sending domain has exactly one active DKIM descriptor. Undeclaring
   a domain with live addresses, queued recipients or active sender grants refuses
   `MAIL_DOMAIN_IN_USE`. Renaming a domain is a reviewed migration, not string edit.
6. Check exact declared secret types/consumers: TLS leaf key only Postfix/Dovecot;
   DKIM private key only OpenDKIM; CA/public chain only clients that need them.
   Declared references must exist at prepare; expired/wrong-SAN cert, mismatched
   key/chain or unavailable credential generation fail before exposure. TLS failure
   never silently falls back for submission. An unused/extra mount/network refuses.
7. Validate engine capability/version profile, native config syntax and actual
   ownership on activation. Resolve image names only to immutable qualified
   digests; never pull a mutable tag during restart/rollback. MAIL-02 selects exact
   artifacts; the MAIL-01 lab's Debian snapshot is a hypothesis baseline, not a
   release qualification. Dovecot 2.4 syntax is required; 2.3 config is not reused.

The `examples/*.invalid.json` cases demonstrate unknown version, upstream in
direct mode, absent TLS, inline password, unqualified IPv6, anonymous source,
nested backups, missing signing-domain coverage and contradictory retry limits.
Schema rejects structural cases; the design checker separately rejects semantic
cases. Neither checker is a shipped transport implementation.

## Application client dependency

Proposed `drumee.mail-client/1` value:

```json
{
  "contract": "drumee.mail-client/1",
  "service_id": "oxymot-mail",
  "host": "172.30.250.1", "port": 1587,
  "tls_mode": "starttls", "server_name": "mail.oxymot.fr",
  "ca_ref": "secret:oxy-mail/ca", "account_id": "oxyform",
  "credential_ref": "secret:oxy-mail/submission",
  "required": true
}
```

This is an **external dependency**, never `requires:[mail]` on an absent owned
service. Debian application profile gains a separately versioned optional client
descriptor and endpoint health probe; old manifests remain valid. If required,
failed TLS/auth readiness makes that application's readiness false. Stop/rollback
cannot call any mail lifecycle operation or reclaim its ports/networks/volumes.
Health authenticates without MAIL FROM/DATA. Probe results never qualify delivery.
Client pins include endpoint, SAN/trust, account and credential generation but no
server private keys. Ghost receives the equivalent protected SMTP JSON config,
under its existing owner; it does not consume an Infra application manifest.

## State and resource separation

The declarative plan controls engines, domains, limits, listeners and references.
The managed registry controls mailbox identities, aliases, grants, credentials,
flags and effective quota; its monotonically increasing revision is separate
from software/config revision. A software rollback preserves current registry,
mail data and secrets, refusing incompatible schemas. Reapplying config cannot
reset a password, drop an address, empty a queue, recreate DKIM or provision sample
`contact@oxymot.fr`. See [operations](operations.md) for atomic state activation.
