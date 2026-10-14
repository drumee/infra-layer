# IL-2 infrastructure services — implementation record

IL-2 is ready for technical review within the validated support boundaries below.
No release, permanent acceptance deployment or IL-3 implementation is claimed.
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

Validation: node --test test/unit/secrets.test.js, 10 pass, 0 fail/skip. Cases cover
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

## Checkpoints IL-2.3–IL-2.6: common contracts and services

Version 2 is an explicit opt-in. Both Spec and Requirements must select it;
version 1 retains its exact gateway-only behavior and rejects new service fields.
Requirements declare capability names, optional HTTP listener/views, while Spec
declares desired capabilities and typed opaque secrets. `docker-services` maps
them to composable fragments; existing `docker-nginx` input is nested only when
HTTP is enabled. Complete schema and migration rules are in README/index.d.ts.
No apply/installer, implicit migration, ignored mandatory capability or kernel
import was added. Root exports remain the same five functions.

Normalized inputs/resource ownership/configuration determine revisions. Port
observations affect applicability only. Unit tests forbid filesystem writes,
process execution, clock and randomness during v2 validation/planning. Rendering
uses the unchanged manifest/ownership/concurrency/rollback protections. Secret
materialization uses an exclusive atomic link transition to refuse competing
destination creation, rather than overwriting after a preflight check. Imported
RSA keys below 2048 bits, unsupported EC curves and non-RSA DKIM are rejected.

### DNS

Exactly `none | local | localhost`, with the approved deterministic matrix:

| Mode | Supplied domain | Effective domain | v2 BIND resources |
|---|---|---|---|
| none | example.com | example.com | None |
| none | absent | Undefined | None; hostname-dependent capabilities reject |
| local | example.com | example.com | Declared local authority, explicit split-horizon acknowledgement |
| local | absent | drumee.lan | Local authority |
| localhost | any | localhost | None; host publication must remain loopback |

Local DNS requires an explicit reachable host IPv4 address; container addresses
are never inferred. AAAA requires explicit reachability declaration. Zone files
are deterministic immutable generations, with a private owner/domain/digest/
serial pointer. Content changes require an increased serial. Corrupt state or
attempted takeover is refused. BIND is authoritative-only unless restricted
recursion/forwarders are explicitly declared; no open `/0` recursive access.
TSIG material is persistent and projected privately for authenticated transfers;
dynamic updates/control ports are disabled. The generated native config maps
Docker wildcard addresses to BIND's `any` ACL, not a literal nonexistent interface.

Native `named-checkconf`, `named-checkzone`, UDP/TCP A/SOA/TXT queries, NXDOMAIN,
REFUSED recursion, port collision, corrupt config, serial change and restart/
recreation tests pass. AAAA record transport is tested over IPv4; real IPv6/LAN
reachability and DHCP/client resolver configuration are not claimed.

### MariaDB / Redis

Managed MariaDB is the official immutable 11.4 image, persistent owned data,
local administrative credentials, private TCP service accounts and native
healthcheck. A root initialization wrapper has only explicit initialization
capabilities; `/tmp` is bounded and usable after switching to mysql. A foreign
or partially initialized directory fails closed, never silently cleared. Engine
compatibility and authenticated connection are separate from kernel/module
schema prerequisites. Explicit account provisioning creates USAGE only; existing
account credentials are preserved. Tests verify only native system schemas on
fresh initialization, rejected credentials, TCP access, unchanged account state
and durable fixture rows across restart/recreation. Test-owned `infra_probe`
tables are created by tests, never by capability plans or startup.

Managed Redis is a pinned 7.4 image, non-root, password from private projection,
bounded private runtime include, no secret argv/config preview, private network.
Ephemeral state uses bounded tmpfs without snapshots/AOF; only declared AOF uses
durable owned data. Real authentication, rejection, pub/sub, recreation and
ephemeral loss tests pass. Actual revision-pinned Essentials RedisStore uses the
materialized authenticated redisUrl, including publisher/duplicate subscriber
clients; redisAuth alone is ignored by this source. No generic client is changed.
External DB/Redis plans emit endpoints and operator observation prerequisites,
never managed containers, initialization or schema grants.

### SMTP / DKIM

Optional Postfix supports isolated capture and controlled outbound relay. Relay
TLS is verified, incoming submission requires STARTTLS, authentication is optional
by declaration, and trusted-client CIDRs are explicit without `/0`. Relay rules
reject other clients, with no mailbox SQL or local hosting bootstrap. Debian
Cyrus SASL uses an explicit root-owned runtime config path and private database.
The persistent queue is initialized only when explicitly authorized and empty;
ownership marker and queue survive recreation. Key/credentials are reconstructed
only as private runtime projections from unchanged persistent secrets.

OpenDKIM is a separate non-root descriptor on the private mail-control network,
with RSA signing key and public selector TXT. It is unreachable through the
kernel network or published host ports. The native image has an explicit UID
1000 account; OpenDKIM's safe-key checks require a resolvable process identity.
Signing failure is fail-closed (tempfail). Native config checks, authenticated
STARTTLS submission, rejected anonymous/bad authentication, signature/body hash
verification against public key, signing-key preservation, queue outage/retry/
recreation and verified/authenticated outbound TLS to a capture alias pass.
Only `.invalid` fixture recipients and isolated sinks are used; no external mail.

### State and observation

`inspectInfrastructure` selects v2 only for explicit version-2 deployments and
revalidates the exact plan before calling observers. Docker observation is
local-socket-only, full container ID plus owner/project/service/image/revision
and exact published bindings before any protocol exec. Unexpected test-only
DB/Redis/mail exposure is deliberately refused by the production observer.
Wrong-owned identities never become diagnostic request targets. Public state
whitelists codes and bounded public versions/fingerprints, not Docker env/mounts,
raw errors, credentials or private material.

Desired revision, observed label, configuration validity, resource/process health,
protocol function, loaded configuration, dependencies and pending activation are
separate. Labels never prove loaded config. A trusted custom observer needs a
revision-bound runtime-configuration attestation; the built-in observer leaves it
unverified. Gateway readiness also requires protected-delivery evidence. DB
state reports engine compatibility and outstanding schema ownership; prepared
TLS remains pending activation. Successful generation/syntax/health alone never
produces full readiness. No IL-3 attestation/activation system was implemented.

## Persistence and recovery inventory

| Resource | Preservation / backup boundary |
|---|---|
| Secret store | All current/retained generations, descriptor/owner manifests and fingerprints; explicit rotation/CAS only |
| TLS | CA certificate/key, separate leaf key/generations, issuer pointer, ACME account/client state and challenge refs; preserve trust anchor |
| DNS | Zone generations/serial pointer, TSIG and native state/journals; restore together before validation/activation |
| MariaDB | Engine-consistent full data plus credentials/version/ownership; image rollback is not database rollback |
| Redis AOF | Base/incremental files plus manifest and credentials; ephemeral cache/pubsub is reconstructible |
| SMTP | Quiesced/engine-safe queue plus submission/relay/DKIM secrets and published selector record |

No coordinated backup/restore, consumer rotation, crash-atomic multi-file
activation or automated interrupted initialization recovery is claimed. Locks
are never taken over on PID/time heuristics. IL-3 must validate ownership,
consistency/version and a complete candidate before activating it. Root/Docker
administrators and the issuing process are trusted; mode 0600 alone cannot
isolate administrators. Services mount individual projections, not the store.

## Revision and image evidence

Canonical source main began at b1b8e8666e92ec604d933b9c99145c90b966362b;
GitHub main was rechecked before closure and remained at that release baseline.
The annotated alpha tag still resolves to that exact commit. No tag/version is
rewritten, no npm publication occurs, and development package remains private.

| Checkpoint | Commit |
|---|---|
| IL-2.1 secrets | ef2798dccca8d4a23e64c4bd4d35045d2930f26b |
| IL-2.2 TLS | 22e3494f48b5e64847067618269eaf7ab4c53bb4 |
| IL-2.3 DNS/versioned integration | 9907576f9b680c43efc9c112e6e309b7e9f45a82 |
| IL-2.4 MariaDB/Redis | ad7b64c2bc04f45e7adc28a99c2f592b208d9989 |
| IL-2.5 SMTP/DKIM | f468ceb4234e111454918d642efc9f2793cbaad5 |
| IL-2.6 security/state/integration | f4b961c33edd5474be33ae49ff0a88765261252e |

Documentation closure follows in a separate commit; Git history/final report
identify its exact revision without embedding a self-referential hash.

Pinned official images:

- Nginx `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752`.
- Node `node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392`.
- MariaDB `mariadb@sha256:611a2fcc5fa7c6ceb8644c6f74b25ede004ff6c3a6b38c8f8c23d3bbf6c26430` (executed 11.4.13).
- Redis `redis@sha256:ff02b58f971e7d7d156a1267e283fcbbeee91773b6aa36c49dac28ecfe28eadf` (executed 7.4.11).
- Capability recipe Debian `debian@sha256:7b140f374b289a7c2befc338f42ebe6441b7ea838a042bbd5acbfca6ec875818`.

Dockerfile.services pins BIND9 9.18.49-1~deb12u2, Postfix 3.7.11-0+deb12u1,
OpenDKIM 2.11.0~beta2-8+deb12u1, Cyrus SASL 2.1.28+dfsg-10 and OpenSSL
3.0.22-1~deb12u1. It removes apt-generated RNDC/snakeoil signing material in
the same creation layer. No private key is baked into distributed artifacts.
The distribution must build/retain an exact image digest; availability of these
pinned Debian package versions is an explicit build prerequisite, not a promise
that unpinned transitive OS packages are forever byte-identical.

Production npm dependencies: **none**. Development-only declared versions:
websocket 1.0.35, redis 4.7.1, mariadb 3.5.4, nodemailer 10.1.1,
smtp-server 3.19.22, jsonfile 5.0.0, lodash 4.18.1. Final npm audit reported zero
vulnerabilities. Optional native installation hooks remain disabled by local
allow-scripts policy; exercised paths use JS fallbacks successfully.

## Validation ledger

| Suite | Pass | Fail | Skip |
|---|---:|---:|---:|
| Standalone units (66 retained + 43 IL-2) | 109 | 0 | 0 |
| Real Nginx/kernel/FileIo/WebSocket/Chromium | 17 | 0 | 0 |
| Real BIND9/MariaDB/Redis/Postfix/DKIM/service observation | 17 | 0 | 0 |
| Unchanged runtime/capability regressions | 68 | 0 | 0 |
| Unchanged Finder core/transfer clients | 27 | 0 | 0 |
| Total independent cases | **238** | **0** | **0** |

The original 178 cases are preserved; new unit/service cases add 60. Package
allowlist/consumer and native preflight checks are additional assertions, not
inflated TAP case counts. Development failures in initial BIND wildcard mapping,
MariaDB tmpfs ownership, OpenDKIM UID lookup and Postfix SASL config path were
resolved in Infra Layer/harness code; no kernel modifications or reduced tests.

Executed standalone commands:

```sh
npm ci
npm test
npm run test:gateway
npm run test:services
npm run test:package
npm audit --json
git diff --check
```

The complete clean-checkout entry point is `npm run test:integration` (gateway
then services). The independent clone at integration/security commit
f4b961c33edd5474be33ae49ff0a88765261252e contains no preinstalled sibling runtime.
Its own `npm ci`, `npm test`, `npm run test:integration`, `npm run test:package`
all passed: 109 units, 17 gateway cases and 17 service cases, zero failures/skips;
package audit and offline packed-consumer import/plan check also passed. Fresh
projects were drumee-il1-test-00dc9c9c (127.0.0.1:32771) and
drumee-il2-test-b72bc130 (dynamic loopback high ports). Both cleanup checks passed;
the independent checkout remained clean. Final documentation does not
alter runtime/test/dependency files from this validated source revision.

Read-only external regression commands (no source changes):

```sh
node --test target/foundation/server-runtime/test/*.test.js \
  target/modules/host-filesystem/test/*.test.js \
  target/modules/mfs-transfer/test/*.test.js \
  target/modules/mfs-service/test/*.test.js \
  target/modules/media-service/test/*.test.js
node --test finder/test/finder-core.test.js
```

The first ran in unchanged transient revision 5469b48109dbb20eacbbc9314a6772264b388843;
Finder ran in unchanged standalone revision b46e2c94b615a1993b6162716d9e8965d0029564.
These are
supplemental read-only regression evidence; standalone test scripts themselves
have no sibling path requirement. Integration acquisition uses only declared
revision faee9a57487d80f79a8ec79a68887e6da36ca489 and allowlisted files. Package
audit inspects all 29 allowed files, rejects credentials/keys/local paths and
undeclared runtime imports, and installs the packed archive offline into a new
consumer that imports only @drumee/infra-layer and generates a representative v2
plan. Temporary packages are removed; no registry publication.

## Safety, limits and IL-3 prerequisites

Local Docker projects use unique `drumee-il1-test-*` / `drumee-il2-test-*` names,
loopback high ports, isolated bind data and explicit ownership checks. Containers,
networks, images and generated secrets/data belonging exclusively to each test
are removed, including failed attempts. No host ports 53/80/443 were claimed.
No testbox access/deployment, host DNS/firewall/trust change, Oxymotion deployment,
live database access, credential rotation or unrelated resource removal occurred.
Transient sources/kernel/runtime/Finder remained unchanged.

Remaining unverified behavior is explicit: live ACME/Cloudflare/staging
connectivity, actual LAN/client DNS and IPv6 reachability, LAN browser trust,
permanent acceptance deployment and coordinated disaster recovery. Provided
certificates/local CA and ACME issuer-boundary contracts are tested; ACME mocks
do not prove external CA interoperability. Test certificates do not establish
future production/acceptance TLS readiness. SMTP tests are local capture only,
not public mail deliverability. Docker healthy/syntax/labels do not establish
loaded configuration or application acceptance.

Future D0 remains instance.domain=drumee.lan, dns.mode=local on testbox. IL-3
must discover/declare its actual reachable LAN address, bind container DNS TCP/
UDP to an approved host address, document client resolver selection, distribute
the public CA through operator trust, supply Nginx/engine/secret views, compose
the minimal kernel and its schema/provisioning lifecycle, provide dependency
ordering/loaded-revision evidence, activate/reload safely and coordinate backup,
restore/upgrades/rotation. SMTP remains optional for kernel startup. No generic
Infra Layer API contains Oxymotion-specific services/schema. Release and IL-3
await project-owner approval; implementation does not begin them automatically.
