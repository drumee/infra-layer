# Alpha.6 external SMTP authentication qualification

## Candidate and scope

Baseline: `6b04a883484beb5d8ec274bbef75cd1a254ddb54` (published alpha.5).
The external-authentication runtime payload was committed at
`ce4cb2482e3a012350c27ff584b4941f3e7848c8`; subsequent qualification changes
are outside the package inventory. The final source and hosted/main receipts
are recorded in the delivery report. Alpha.6 is not published by this work.

The [contract](smtp-external-auth-alpha6.md) defines accepted bytes, explicit
refusals, the new import-only secret type, private native map creation and the
consumer migration. Internal identifiers, dependencies, public lifecycle APIs,
the services Dockerfile, rollback/network guards, CI, CodeQL and Sonar scope
remain unchanged. The new `lib/smtp-auth.js` is a required package member.

## New executable evidence

- Native Postfix/TLS matrix: **10 cases / 254 assertions**, all passing.
  Simple, full-address, opaque and Unicode accounts; punctuation, separators,
  shell literals, leading/internal whitespace, non-normalized Unicode and ASCII
  control bytes in passwords; 255-byte boundaries. In-memory comparisons prove
  exact map and SASL values, one map entry, private modes, TLS-only authentication,
  fixed envelope/body and actual sink receipt. Wrong authentication, untrusted
  CA, wrong hostname and absent STARTTLS fail without sink delivery; TLS failures
  cause no authentication. Private relay acceptance is a distinct observation.
- Eleven malformed runtime files refuse before connection, including final
  LF/CRLF, embedded LF/CR/NUL, malformed UTF-8, BOM, trailing whitespace and size
  failures. A separate **36-assertion** serializer run also checks removal of a
  partially written fake map and suppression of credential-bearing child stderr.
- Real application + SMTP + DKIM recovery: **7 groups / 201 assertions**, passing.
  Ordinary rollback, controlled plugin-provenance startup failure, authorized
  recovery, service readiness, durable ledger/data, queue IDs and secret generations
  are checked. An extra real network still refuses. The synthetic authenticated
  upstream receives the preserved queued message after recovery, with exact
  account/password and validated TLS; the queue then drains.
- Unit tests **405**, contracts **24**, Python filesystem security **31**, isolated
  system-tools security **12**, mount/ownership regressions **63**: all pass.
  ESLint: zero errors/new findings, 23 existing warnings. Both npm audits: zero
  vulnerabilities at the observation date, 2026-11-08. Closed package/installed
  consumer audit passes; additional consumer/type checks: **8 + 37 assertions**,
  strict NodeNext declarations pass. No production npm dependencies.

Commands: canonical `npm ci --ignore-scripts --no-audit --no-fund`, both audits,
`npm test`, `npm run test:contracts`, `npm run lint`, `npm run test:package`,
`npm run test:system-tools`, existing Python and mount/ownership suites;
`node test/smtp-auth/run.cjs <private-input.json>` and
`node test/rollback-role/run.cjs <private-input.json>`.

The tools image is
`sha256:9bd904ed25890e994cd8b12782dcdc02c3c9f58aa99d5fe67871c7d54f95362d`
(Postfix 3.10.13, Perl 5.40.1). Recovery uses the unchanged real Oxy-form image
`sha256:906a2dcf00261c8b573cf72be78b0279f9625a9e9326a03e430fa171c3a833d4`,
Debian CLI/configuration source `2d2fd20d7a8116ae5023088cc4129246afe09c24`
and Oxy configuration source `0cce3e7869ea08adc991891c00bc69238ca03d62`.
An owned consumer installs the explicit unpublished candidate archive, with the
upstream descriptor changed to the new type. This is not a requalification of
the published alpha.5 or an update to the actual Debian/Oxy source locks.

Initial runs exposed native postmap creation mode 0644 (corrected under a 0700
directory before startup), an incorrect test requirement for two authentications
(one exact successful authentication plus receipt is sufficient), and a guarded
network observation refusal during a concurrent Docker transition. The final
recovery campaign was rerun alone and passed without weakening production guards.
The SMTP test server's separate account-control-character refusal is documented;
password control-byte fidelity was verified separately. Raw evidence stays local.

## Artifact and remaining boundaries

Archive: `drumee-infra-layer-0.1.0-alpha.6.tgz`, **44 members**, **110826 bytes**
compressed, **391815 bytes** unpacked. SHA256:
`562a01bf5d8dba6151bf3a1768e56655df9e9302ed2ea6f072a4ed72eb177874`.
SRI:
`sha512-ZuGENEDYE1Ug6FJYzvSR+MG8zzOaBMBkYhgx+5nNR5OKMDBHpOvCfdzDe1XNfNz7fKqRfCHFQZGlxvYQzEm+YQ==`.
Independent archive builds are byte-identical. A post-merge exact-source rebuild
and separate main checks remain mandatory before the final publication verdict.

Unchanged native binaries, runtime/plugin image and protected lifecycle inputs
support reuse of earlier unrelated acceptance evidence; the affected SMTP and
mixed recovery paths were rerun. `SMTP_RECOVERY_UNQUALIFIED` remains enforced:
no spool backup/restore or exactly-once delivery guarantee is added. No owner
credential or real provider is used. Oxy-form #3 remains draft. External provider,
mailbox receipt and SPF/DKIM/DMARC qualification follow separately after authorized
publication and immutable downstream convergence. No release action occurs here.
