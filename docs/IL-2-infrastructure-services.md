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
