# IL-2 infrastructure services — implementation record

Work in progress; no IL-2 completion or release is claimed here yet.
Canonical repository: https://github.com/drumee/infra-layer, branch main.
Starting/tagged commit: b1b8e8666e92ec604d933b9c99145c90b966362b.
On initial inspection main was clean at that commit. The public registry
confirmed @drumee/infra-layer@0.1.0-alpha.1, next/latest both at this first alpha,
SHA-1 972dbb903ac0d69280f72e48624887469d702450 and the expected SHA-512.
The published tag remains unchanged. Unreleased main is private:true to prevent
publication before phase completion and owner release approval.

## Checkpoint IL-2.1: persistent secret provider

The five root API functions remain unchanged. Explicit lifecycle capabilities
are imported separately; capabilities/secrets implements a persistent filesystem
provider. Plans never invoke it. Ten supported secret types cover DB admin/service,
Redis, CA/leaf/account keys, ACME DNS, DKIM, SMTP relay and TSIG. Imported provider
credentials are not invented. Existing valid secrets survive repeated ensure
calls without creation authorization. First creation/import requires authorized:
true. Rotation additionally requires an expected fingerprint and named consumer
transition; the provider does not activate consumers or claim rotation completed
across services.

The owner and exact descriptor are recorded in a private manifest. Generation
files and atomic current pointers are fsynced; keys are cryptographic RSA 2048
PKCS8 and passwords/TSIG use 32 random bytes. Directory/file ownership, private
permissions, symlinks/hardlinks, fingerprints and key syntax are checked before
use. An incomplete generation or stale exclusive lock fails closed, with no
automatic credential replacement. Old generations remain backup/recovery
resources after explicit rotation. This is not a coordinated service transaction.

Consumer read/projection requires its allowlisted identity. Only individual
projection files should be mounted, never the store root. The store/issuing
process is trusted to access owned secrets; Unix modes do not isolate host root
or an administrator with Docker access. Optional target uid/gid projection needs
explicit ownership and suitable privilege; capability containers mount only
their own files. Values are never returned by inspect or public Plan/State.

Validation: node --test test/unit/secrets.test.js, 7 pass, 0 fail/skip. Cases cover
first install, preservation, missing/corrupt values, unsafe permissions, stale
and concurrent creation, interrupted state, rotation CAS/failure, consumer
isolation and symlink/hardlink/path escape. Remaining checkpoints extend the
versioned declarative contracts and integrate these independently testable
capabilities with planning/rendering/observations.

## Checkpoint IL-2.2: TLS lifecycle

Local TLS persists a real RSA CA certificate separately from its private key in
the secret store. Leaf generations use a separate persistent key, SAN hostname,
serverAuth and non-CA constraints. Renewal is explicit and preserves both keys
and CA fingerprint. Existing issuer mismatch/corruption fails closed. Provided
material is read-only validated for SAN, matching private key, validity dates,
trust chain and permissions; CN-only matching is rejected. Candidate creation
and validation never perform Nginx activation or install client trust.

ACME is narrow DNS-01/Cloudflare through verified lego 5.5.2, source tag commit
452dc82113609488fb680acf8fc72712b1794f8d. The explicit binary path and SHA-256
are checked along with version/ownership/permissions. The linux-amd64 release
archive hash was 2a35505089e7772c92e1e9ac144df91151ef2eca8568630db0ff91fca06d9bef;
binary hash c7ccc528bb254bec3e8ca998a8994dab9653c3e1aa083fd3bfaaa0b75b527b62.
No executable is bundled in npm. Account registration is explicit, importing
the maintained client's account key into the secret store; future missing or
mismatched client state is refused before invoking its historical repair path.
Only the two Let's Encrypt production/staging directories are supported, with
explicit terms/public-DNS execution authorization. No local/localhost public
issuance. Challenge tokens are supplied through private files in a sanitized
environment; arbitrary executable hooks, URL overrides and TLS-skip-verify are
not exposed. CLI logs/errors are suppressed and mapped to stable diagnostics.

The evaluated acme-client npm package was removed before commit because its
node-forge dependency was flagged by npm audit (GHSA-86w9-cpqp-85rv). No production
npm dependency was retained. Primary references:
[lego CLI](https://go-acme.github.io/lego/obtain/index.html),
[OpenSSL verification](https://docs.openssl.org/3.4/man1/openssl-x509/).

Validation: node --test test/unit/tls.test.js, 5 pass, 0 fail/skip, plus official
lego --version/run --help/dnshelp inspection. ACME success/failure/renewal tests
use issuer-boundary mocks returning real locally issued X509 material; no
production/staging certificate or public DNS record has been requested. This
does not validate live Cloudflare or public CA connectivity. CA certificate and
fingerprint are exposed for operator trust distribution; trust installation,
renewal scheduling, coordinated activation and crash recovery remain IL-3.
