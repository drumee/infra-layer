# Alpha.6 — canonical external SMTP authentication contract

## Distinct identities and compatibility

Internal Drumee IDs and mail.submission_user retain S.identifier unchanged.
mail.relay_user is an external SASL authentication account, not an internal ID
and not necessarily an email address. Message sender and recipients remain
separate trusted transport/application configuration; form input cannot select
a relay, authentication identity, sender or recipient.

New external credentials use an explicitly imported secret descriptor:

```json
{"ref":{"resource":"mail","key":"upstream"},"type":"smtp-external-credential","consumers":["mail"]}
```

Only mail.relay_secret_ref accepts this new type. Internal submission still
requires smtp-relay-credential, and all existing reference/consumer guards apply.
The old external smtp-relay-credential descriptor remains accepted for previously
supported values, but retains its restrictive import validation. Consumers needing
provider punctuation/UTF-8 must select the new type for their upstream secret;
they must not change the internal submission secret type or bypass the store.
Generation is forbidden for either imported external type: the provider's exact
secret is supplied through a protected file/import, never invented or transformed.

## Accepted bytes and explicit refusals

Accounts and new external secrets are nonempty, strict UTF-8, **1–255 bytes**,
without a UTF-8 BOM, NUL, CR or LF. Limits are in bytes, not JavaScript characters.
The 255-byte implementation bound covers SASL PLAIN's mandatory interoperability
size; RFC 4616 does not impose it as a universal protocol maximum.

Accounts accept full addresses and opaque names, spaces internally, punctuation
and UTF-8. With the selected standard Postfix account:password result format,
colon in the account cannot be represented and is refused. Leading ASCII space,
tab, vertical tab and form feed are refused because postmap strips leading value
whitespace. They are not silently removed. Internal submission IDs are not widened.

Secrets may contain former alphabet exclusions, quotes, shell metacharacters,
backslashes, dollar signs, backticks, colons, leading/internal spaces and tabs,
and valid UTF-8. Trailing ASCII space/tab/vertical-tab/form-feed is refused because
postmap would strip it. A final LF or CRLF is **refused**, not treated as an editor
terminator: no trim, command substitution or newline normalization is performed.
Invalid UTF-8, BOM, forbidden controls, empty/oversized values fail with
SMTP_RELAY_CREDENTIAL_INVALID before native connection. Account validation uses
INVALID_SMTP_AUTH_ACCOUNT at mail.relay_user. Existing safe file/ACL diagnostics
remain valid for unsafe files, descriptors or consumers.

## Actual native storage and execution

The canonical import/store/projection keeps the accepted Buffer unchanged and
private. The entrypoint reads no external password through shell substitution.
It runs a fixed generated Perl program; account and destination are separate
read-only artifact files and the password is the canonical secret projection.
The pinned tools image already provides core Perl and Postfix 3.10.13; no new
service, scanner or production npm dependency is introduced. Missing tools refuse
SMTP_RELAY_AUTH_TOOL_UNAVAILABLE.

Perl reads raw bytes without following links, validates the strict UTF-8 byte grammar without decoding,
checks length/representation and private secret ownership/modes, and streams one
key TAB account:secret LF entry to fixed /usr/sbin/postmap -i arguments. Credentials
never enter program source, process arguments or environment. No eval or user
shell interpolation is used. Validation does not normalize credential bytes.

The indexed hash database is /run/infra-mail/auth/sasl_passwd.db, not a password
hash: it contains sensitive authentication material. Its directory is 0700, map
0600, owned by the executing mail principal; /run is disposable tmpfs. No populated
plaintext source table is written. Child output is suppressed; map creation errors
produce SMTP_RELAY_AUTH_MAP_FAILED and remove newly created map files/directory.
Validation errors create no map. Controlled failures are qualified explicitly;
SIGKILL can prevent cleanup but cannot make the private tmpfs map public or durable.
No table or credential-bearing query output is exported as evidence.

TLS remains required with certificate and peer-name verification before SMTP AUTH.
Submission TLS/auth-only policy, open-relay refusal and scoped secret mounts remain.
SMTP_RECOVERY_UNQUALIFIED is retained; this is not spool backup/restore support.

## Primary basis and executable proof

- [Postfix postmap manual](https://www.postfix.org/postmap.1.html): key/value
  records, surrounding whitespace removal and incremental stdin insertion.
- [Postfix SASL guide](https://www.postfix.org/SASL_README.html): destination-keyed
  account:password maps, root-only file protection and verified TLS policy.
- [Postfix configuration](https://www.postfix.org/postconf.5.html#smtp_sasl_password_maps):
  account/password separator and SASL map lookup contract.
- [RFC 4616](https://www.rfc-editor.org/rfc/rfc4616.html): UTF-8 SASL PLAIN fields,
  NUL separation, mandatory 255-octet support and transport protection.

A direct Postfix 3.10.13 probe verified preservation of punctuation, embedded tabs,
leading password spaces, colons, backslash and UTF-8, and demonstrated loss of
trailing space/tab. Those unrepresentable values are refused, never claimed supported.
The qualification matrix uses generated/imported/projected candidate bytes, a real
native Postfix relay and an isolated TLS SMTP sink. Assertions compare values in
memory without printing them. Authentication, private relay acceptance and sink
reception are separate results. Invalid files and a controlled postmap failure
exercise fail-closed behavior and private cleanup before any connection.

The test-only orchestration adds a local TLS sink and loopback submission port to
generated native service inputs; it does not claim that extra fixture as a normal
authorized production composition. Separate canonical application/SMTP/DKIM
recovery qualification preserves all lifecycle and network invariants.

## Delivery boundary

Alpha.6 availability is verified against npm; publication is not performed.
The exact committed-source archives, inventories/hashes, local and hosted checks,
merged-source rebuild and final disposition are recorded in the final receipt.
Only after separately authorized publication should Debian acquire the new exact
version/URL/SRI/member receipt, then Oxy-form update its immutable distribution pin
and the upstream descriptor type. Its internal submission descriptor stays legacy.
Oxy-form PR #3 remains draft. Real provider authentication, designated mailbox
receipt and SPF/DKIM/DMARC evidence are later OF-01R work, not established by the
synthetic sink. No owner credential is read or reused by this correction.
