# IL-3 Docker lifecycle — implementation and integration boundary

Status: **READY_FOR_TECHNICAL_REVIEW** for the documented minimal Docker profile.
The owner-approved distribution fixture closes the initial kernel-host blocker
with actual SQL/MFS recovery and testbox/LAN acceptance. The follow-up ledger
below records the exact evidence and supported limits. This is not Oxymotion
acceptance, release approval, or authorization to start IL-4.
Published `0.1.0-alpha.1` and `v0.1.0-alpha.1` remain unchanged.
Starting main: `0f5fb92cccae1441ba45c288acf7fc06b57ba6eb`.

## Approved distribution follow-up qualification

The owner-approved fixture is independently maintained as distribution glue in
transient, not a second infrastructure implementation. Its exact source/commands,
images, test counts, failures corrected before qualification, private-state
boundaries and cleanup are in the
[pinned distribution report](https://github.com/drumee/transient/blob/c5ee4591c87e7be2a7d91398cfcaa277787558e0/docs/refactoring/37-infra-layer-il3-distribution.md).

- Infra Layer implementation qualification:
  `95db6c7aed097b62aa8081df17b3467d850e779c`; only the Redis native-check
  authenticated readiness wait differs from the earlier reviewed implementation.
  `npm test`: 123/123; `npm run test:lifecycle`: 16/16;
  `npm run test:lifecycle:gateway`: four scenarios;
  `npm run test:package`: 38 files, zero runtime dependencies,
  `PACKED_CONSUMER_OK`. No failures/skips in these final commands.
- Unchanged gateway/service suites: 17 + 17 passing cases. GitHub acquisition
  failures were disclosed; their regression-only fallback used the exact pinned
  transient Git objects through a process-scoped read-only local transport,
  without changing global Git configuration. The complete 68 runtime/capability
  and 27 Finder regressions also pass. Baseline total remains 268 TAP cases.
- Independent clean fixture checkout:
  `259189eb1d1452fae92e7a8c255a71d4fe29bc09`, four unit tests, 25 grouped
  functional checks across fresh/restart/restored states, plus actual SIGKILL
  rotation recovery with both Redis and kernel consumers and retained old keys.
  Browser uses real LETC/Finder/Window Manager and the actual WebSocket client.
- testbox qualification at distribution source
  `ae200e6ec502f4c62df9926d82d201564f665d62`:
  project `drumee-il3-kernel-5e42e59f`, BIND9 TCP/UDP
  `192.168.5.202:53`, Nginx local-CA HTTPS `192.168.5.202:443`, private MariaDB,
  Redis and kernel; all 25 grouped checks passed. The LAN client verified DNS,
  strict CA/SAN HTTPS and browser paths before/after restart; restored-loopback
  browser verification used an owned SSH tunnel. This revision predates only
  the added local crash test, not different host/kernel implementation.
- All task-owned containers, networks, bind data, protected backups and test
  image tags were removed; the owned testbox checkout/browser directory was
  deleted. The exact three pre-existing stopped containers, five volumes and
  original network remained unchanged. Ports 53/80/443 were free afterward.
  Ordinary build/download caches and harmless reports may remain; no unrelated
  image/cache pruning, host resolver/trust modification or permanent deployment.

The published alpha/tag is unchanged. Technical review must retain the explicit
support limits later in this document. This qualification is not approval to
publish, start IL-4, deploy Oxymotion or claim arbitrary provider compatibility.

## Contracts and ownership

The five root functions keep their IL-1/IL-2 signatures and behavior. Pure
`planInfrastructure` and `validateSpec` never invoke Docker, issue certificates,
create secrets, or access implicit host state. `renderPlan` remains rendering
without activation. The separate CommonJS `@drumee/infra-layer/lifecycle`
subpath exposes explicit, authorized operational functions; declarations are
in `lifecycle/index.d.ts`. No production npm dependencies were added.

| Function | Purpose and side effects |
|---|---|
| `composeDeployment(plan, distribution)` | Pure v2-plan composition, deterministic revision, conflicts and ownership validation |
| `prepareDeployment(composition, context)` | Claim an empty authorized root, prepare owned storage/secrets/TLS/DNS, render and seal candidates; no daemon starts |
| `activateDeployment(prepared, context)` | Recheck ownership, ports, networks, images and digests; validate native configuration, start/recreate owned services, probe, journal and attest |
| `inspectDeployment(root, context)` | Read-only native protocol observations and sealed revision/process evidence |
| `diagnoseDeployment(state)` | Safe machine-readable readiness and diagnostic codes |
| `classifyChanges(active, prepared)` | Pure no-op/configuration/recreation/image/volume/schema/credential/certificate/DNS classification |
| `rotateSecret(root, operation, context)` | Initially Redis only: staged generation, transition consumers, verify agreement, publish canonical pointer; retain old generations |
| `resumeSecretRotation(root, id, context)` | Explicit recovery of a recorded Redis transition |
| `renewDeployment(root, context)` | Explicit local leaf preparation, CA preservation, activation, last-known-good recovery |
| `renewalTrigger(root, context, now)` | Evaluate durable renewal schedule, diagnose due/expired status; no implicit scheduler or issuance |
| `stopDeployment(prepared, context)` | Gracefully stop verified owned services in reverse dependency order, retain data |
| `backupDeployment(root, directory, context)` | Protected cold backup with explicit owned-writer quiescence and database dump |
| `validateBackup(directory, schemaVersions, context)` | Verify inventory, bytes, ownership, immutable source composition and exact schema compatibility |
| `restoreDeployment(directory, composition, context)` | Restore into a fresh owned isolated root/project; prepare without activating |
| `rollbackDeployment(root, revision, context)` | Explicit compatible configuration rollback; refuse schema, secret-generation and image downgrade |

`context.root` is an absolute private operator-owned directory; `authorized:true`
is mandatory. `create_resources:true` separately authorizes first creation.
Existing nonempty directories and persistent stores are never adopted. Imports
are explicit private files, never credential fields in plans. Root owner claims
bind project, instance identity and operator UID. Bind storage lives below
`root/durable`. The execution driver is a privileged trusted boundary; the
production driver uses only the local Docker Unix socket. Test-only driver
injection exercises failure boundaries and is not functional evidence.

The distribution contract is version 1, independent of Spec/Requirements v2.
It supplies immutable image digests (or locally inspected image IDs), pinned
source provenance, service commands, rootless UIDs/GIDs, declared mounts,
secret consumer identities, health commands, listener ports, initialization
jobs, schema compatibility identifiers and complete persistent resource roots.
The source `acceptance` label states the distribution's declared test category;
it is not proof that kernel/application acceptance ran.

A kernel profile requires an explicitly supplied composition host. Infra Layer
contains no new kernel host, provisioning SQL, Team seeds or application image.
Initialization jobs must declare an immutable artifact revision, idempotent
behavior and a separate validation command. Matching completed job artifacts
are not rerun on a configuration update; their validator still runs. This is
not a migration solver. Unknown or incompatible schema changes fail closed.

## Compose assembly and isolation

`lifecycle/composition.js` regenerates and compares the complete applicable
plan before composition; tampered plans fail. Service/network/volume identities
and collisions cannot silently overwrite fragments. Distribution resource
mounts and secret projections are explicitly allowlisted. Arbitrary Compose
fields, host networking, privileged services, root kernel users, Docker socket
mounts, plaintext credential environment fields and unpinned images are rejected.

The project owns a named bridge network. Only declared gateway or DNS bindings
are published; database, Redis and kernel listeners stay private. DKIM uses its
internal mail-control network. Existing network ownership, project, driver,
isolation and attached container ownership are checked before activation.
TCP/UDP listeners and Docker published-port allocations are rechecked. No host
DNS, firewall, DHCP, SSH or client trust configuration is changed.

Order: prepare resources and secrets; prepare certificate/zone generations;
start and probe database/Redis; execute supplied idempotent initialization jobs;
start and probe supplied kernel; validate and start Nginx; verify HTTPS;
independently handle optional mail. DNS also receives native/functional checks.
Reverse order controls shutdown. Optional mail failures are diagnostic unless
SMTP is a declared mandatory capability.

Services retain IL-2 resource limits, read-only roots, narrow secret file mounts,
rootless DNS/Redis/Nginx/kernel execution, no-new-privileges and bounded tmpfs.
The MariaDB/Postfix image entrypoints retain their documented internal privilege
requirements. Temporary no-network filesystem helpers use only scoped bind
roots and the minimum DAC_OVERRIDE/CHOWN/FOWNER capabilities needed for native
container UID ownership, private-file inventory and recovery. They never mount
the Docker socket or host filesystem root inside a service.

## Candidate preparation, activation and attestation

Candidates live at `root/candidates/<prepared revision>`. Revision covers the
composition, secret fingerprints, certificate identity and immutable zone digest.
The desired plan revision remains separately recorded. Render ownership and
symlink/hardlink protections remain intact. Secret values occur only in private
store generations and narrowly projected files, excluded from ordinary manifests
and diagnostic objects. Prepared content includes byte digests, modes and UIDs.
Activation recomputes materialized Compose, candidate inventory, image identity,
mounts, ports and ownership. Editing a prepared file invalidates the candidate.

`root/journal/00000001.json...` is a fsynced, hash-chained lifecycle journal with
fixed phases and redacted detail keys. `active.json` must refer to the matching
journal event and attestation digest. These are integrity/ownership protections,
not a signature defending against a hostile Docker administrator or host root.
An exclusive root lock rejects competing/stale writers. Stale locks are never
silently stolen. An interrupted candidate or activation requires explicit
inspection/recovery; multi-file preparation is not claimed crash-atomic.

Native checks execute actual named-checkconf/named-checkzone, MariaDB help/config
parsing, an isolated Redis parser process, Postfix/OpenDKIM checks and nginx -t.
Nginx validation requiring upstream resolution follows kernel listener readiness.
Each required service must be healthy and pass a protocol check. MariaDB service
accounts receive infrastructure USAGE only; no schema or application grants are
installed. Account creation is refused when general/bin logging could leak the
credential statement. Supplied kernel jobs own all schema grants and provisioning.

Attestation binds sealed files, native validation, inspected immutable image,
container ID/start time/revision, controlled recreation, live protocol success
and the active journal event. Later recreation invalidates the attestation even
when labels match. HTTP protected delivery is not inferred from a health probe.
The exposed assurance is `controlled-recreation-and-protocol-verification`;
`in_memory_config_measured:false` remains explicit. Native checks cannot measure
all daemon memory directly. Per-service native/start/protocol checks may leave a
partial update on failure; the journal and previous candidate are retained, and
readiness becomes false until explicit reconciliation. No false automatic rollback
or zero-downtime guarantee is made.

Identical active verified candidates return no-op and retain container identities.
Changed candidates currently use controlled recreation, not a safe-reload path or
selective per-service rolling updates. This can interrupt unrelated services in
the composed project; optimization needs separate validation before broad use.

## Secrets, TLS and DNS transitions

Normal render/restart/recreation preserves existing generations. Redis rotation
clones a private store into an owned transition directory, generates a candidate
under CAS/fingerprint authorization, recreates declared consumers, verifies
protocol and generation agreement, then commits the canonical pointer. Pending
transitions cannot be reported ready. A failed transition reactivates previous
consumer projections; if that fails, it requires explicit recovery. Previous and
staged generations are retained for recovery, not automatically cleaned up.
Other coordinated secret rotation providers are explicitly unsupported, including
MariaDB administration, CA trust anchors, SMTP/DKIM and TSIG rotation. Capability
level IL-2 rotation APIs remain preparation primitives, not cross-consumer proof.

For local TLS, the issuer keeps the persistent CA key out of Nginx. The gateway
receives only public chain/certificate and leaf key. HTTPS probes use the declared
numeric binding, exact Host/SAN, a fresh TLS connection, private candidate public
CA certificate, normal trust verification and expected leaf fingerprint. There is
no arbitrary readiness URL, DNS lookup, redirect following or TLS verification
bypass. Renewals preserve the CA; failed activation restores the prior immutable
certificate projection. Public trust establishment remains operator-controlled.

A durable renewal.json records revision, expiry, fingerprint and threshold. The
explicit renewal trigger reports due/expired state and journals it. It is not an
automatically installed cron/service. A distribution scheduler must invoke the
trigger and authorized renewal operation and handle repeated failures. Local and
provided material are supported by preparation; ACME activation integration is
explicitly rejected with ACME_PREPARED_MATERIAL_REQUIRED. Production ACME issuance
was not attempted. Existing IL-2 ACME contracts remain unchanged.

DNS modes remain exactly none/local/localhost; local defaults to drumee.lan.
BIND authoritative-only zones use the declared reachable host address and an
explicit client allowlist. No container address inference, public delegation or
resolver configuration occurs. Immutable zone generations and the highest
prepared serial persist. A failed higher-serial candidate does not prevent TLS
work using the verified active zone; its bytes and sealed active candidate are
checked without rewinding serial state. The next new zone content must advance
beyond the highest prepared serial. This distinction is visible in journal and
candidate metadata, and is not an assertion that every prepared zone was served.

## Persistence, backup and isolated restoration

Declared durable roots cover database files, Redis AOF, DNS state, mail queue,
secret generations, TLS issuer/leaf state and distribution-supplied MFS/application
content roots. No kernel or application state is inferred from historical layouts.
A running database proves engine/authentication readiness, not schema readiness.
External database/Redis backups and external writers are unsupported in the
initial cold-backup implementation; they require an explicit owner protocol.

Cold backup requires quiescence=stop-owned-writers and a verified active source.
Owned writers stop before a locked all-databases logical dump; enabled database
events are refused. All owned engines then stop cleanly before state copying.
The protected manifest records source revision, schema identifiers, immutable
images/composition, time, declared resources, checksums, fingerprints, CA/zone
identity, consistency evidence and recovery prerequisites. Source and destination
inventories are compared. Private keys and database contents are in the protected
backup payload, never ordinary logs. Payload checksums are integrity evidence,
not encryption. Operators must protect off-host transport/storage separately.
Unsupported files, symlinks/hardlinks and runtime sockets fail closed; mail spool
IPC recovery needs further validation before claiming full queue backup support.

Restore never targets an active root or existing volume. It requires a new owned
project/root, identical instance/domain/schema identifiers, identical stateful
engine images, exact resource inventory/layout and isolated loopback high ports.
Ownership/modes, bytes, credentials, CA and DNS identities are preserved. The
initial implementation requires the same operator UID and root-relative storage
mapping; cross-UID remapping is unsupported. It prepares without activating;
engine and kernel recovery validation must then run explicitly. The API always
returns `kernel_recovery_verified:false`, because canonical identity/ACL/MFS
correspondence cannot be proved by infrastructure-only rows/file fixtures.

Configuration rollback requires compatible storage, schema identifiers and secret
generations. It never downgrades schemas or infers migration reversibility from
an image tag. Image rollback is refused; a coordinated isolated snapshot recovery
is the supported recovery boundary. An image update requires an exact validated
backup of the active revision; initial support is restricted to rebuilds with
unchanged observed native daemon version. Version-changing engine upgrades and
kernel/gateway image transitions require a separate distribution compatibility
contract and are refused rather than guessed.

## Distribution handoff: original blocker and resolution

The [kernel distribution handoff](IL-3-kernel-distribution-handoff.md) records
the follow-up source/registry recheck, concrete host/job/recovery contract and
proposed temporary distribution-owned fixture. It is a reviewable proposal,
not implemented kernel acceptance or approval to change upstream packages.

At the initial audit a complete deployable minimal-kernel composition was not
found. The approved fixture now supplies the previously missing contract. Its
required distribution-owned artifact provides:
immutable kernel image, HTTP/page/WebSocket listeners, validated rootless filesystem
views, database/authenticated Redis configuration, kernel/module schema jobs,
platform identity and Hub/MFS provisioning jobs, version/schema contracts, actual
protocol acceptance commands, and DB/MFS/application quiescence/recovery probes.
Infra Layer cannot implement these SQL/application responsibilities itself.

Concrete revision-pinned evidence:

- transient `5469b48109dbb20eacbbc9314a6772264b388843`,
  `tests/integration/kernel/phase4.9-finder-live-browser.test.js`: real runtime/SQL
  browser test assembled in-process, but its `MemoryRedis` class is a fixture,
  not a deployable kernel host or real authenticated Redis composition.
- transient test dependency `faee9a57487d80f79a8ec79a68887e6da36ca489`, allowlisted
  through `test/integration/kernel-dependencies.json`: the unchanged
  `test/integration/kernel-fixture.js` explicitly disclaims deployability and
  uses in-memory identity/permission stores. It proves real Session/ACL/FileIo
  transport behavior, not canonical persisted provisioning or recovery.
- debian main `b8b0ebe7082e1ad2366f3a7997712f5da5bba127` and container branch
  `8a236e5d147a55cfd5580dcda0712cd6436ca93c`:
  `deploy/docker/Dockerfile.populate`, `container-populate.js`, `schemas-init.sh`
  still use historical setup-schemas/factory initialization and Team payloads.
  They cannot be substituted for the minimal-kernel lifecycle.
- inspected standalone heads: server-runtime
  `fc7d9de3f3e63baea8258885e55efe8e242904d0`, ui-runtime
  `5366d904356b414e87848a0bc8870b612e6c748a`, system-mfs
  `53101c4a995ffca9118f795ab5d4c7c731200a2f`, window-manager
  `e294979dfcb59f73af19975e40f890a0b366cd8c`, finder
  `b46e2c94b615a1993b6162716d9e8965d0029564`. Packages alone do not supply the
  missing distribution image and initialization/recovery contract.

The owner explicitly approved the distribution fixture under IL-3 section 10.
The new composition host is distribution-owned in transient; no kernel host or
provisioning SQL was introduced into Infra Layer. Real SQL session/ACL/module
APIs are used; no permissive provisioning mock, Team installation or second
Infra Layer implementation was introduced.

## Acceptance stages and remaining mandatory coverage

Stage A covers actual disposable native infrastructure, lifecycle/failure,
backup/restore, and a separate unchanged IL-1 contract fixture for HTTPS renewal.
Existing real FileIo/session/ACL/WebSocket/upload/Range/Chromium contract suites
remain independent regression evidence. A fixture pass is not full acceptance.
Stage B is infrastructure-only on Debian testbox; details/results below.
The approved follow-up completes Stage C for the declared profile: persisted
canonical users, ACLs, Hubs, MFS-to-content recovery, authenticated Redis/pubsub,
restart and full LETC/Finder browser checks through the composed gateway.

The additional local test kills the rotation process after Redis transitions,
then explicitly recovers its inspected owned stale lock and resumes both Redis
and kernel consumers. Real initialization validators also run across restarts,
rotation and isolated restoration. Non-Redis coordinated rotation, installed
automatic renewal scheduling, SMTP spool IPC backup, version-changing upgrades
and zero-downtime/selective activation remain outside the qualified support
boundary. Optional mail is absent from the acceptance profile. Unsupported
operations remain explicit; this report claims no unrestricted provider support.

No IL-4, permanent stack, Oxymotion deployment, npm publication, host trust/DNS
change, deletion of unrelated Docker resources or kernel/package source change
was performed.

## Validation ledger

This ledger records final clean-checkout commands, results, remote ownership,
LAN observations and checkpoint revisions. It is completed after validation;
unverified acceptance paths above cannot be converted into passes by this ledger.

### Final source and checkpoints

Implementation/test qualification revision:
`f605d76f5a5c3e194d9948a1fcb8bc7efa0c9b02`, main. The final documentation
commit adds this ledger only; production files and validation scripts retain
that qualified content. `git log` identifies the enclosing closure-record commit.

| Checkpoint/change | Exact commit |
|---|---|
| IL-3.1 pure composition | 35ef0390882307611e7778fdf39064722a6724b0 |
| IL-3.2 preparation/activation/attestation | bb542d56e1e227b65398aab1556639b3fbda2c5c |
| Checkpoint export correction | 291ea0405b94a71a3db3ef140a07fb2b6be25472 |
| IL-3.3 persistence/Redis transition/TLS renewal | e901c7ba58f76b390a82dd0853d920cbb5ff624b |
| IL-3.4 cold backup/isolated restore/rollback | 99cd0c29184e6080062bfb6500faa51647a429e1 |
| IL-3.5 supplementary HTTPS contract fixture | 2617de821a9493a754a41d43f5b69b239957c3b8 |
| Lifecycle/security/package/image tests | a6a917b0940454ca01aa7a321a4f9fb43b0791b5 |
| Architecture/integration boundary dossier | 0d95d01159c3788dc8fcabfe432e6a66326b00a8 |
| Supplied job gating, harness interruption recovery | 9e9c683ffbd602e49d34b470d6f9516dc3828a9c |
| Helper mount and test-image ownership checks | c3a9b867d8857914da225387407999880a409e8b |
| Corrupt staged-generation commit refusal | b141bbf0df3878530ca1ac930700595a227159b1 |
| Strict watchdog error handling | f605d76f5a5c3e194d9948a1fcb8bc7efa0c9b02 |

IL-3.5 real-kernel acceptance is blocked, and IL-3.6 is a validation/boundary
record, not a declaration that every requested phase requirement is complete.
`git diff 0f5fb92 -- lib capabilities adapters` is empty: existing IL-1/IL-2
production primitives were not changed. Transient is clean at
5469b48109dbb20eacbbc9314a6772264b388843, with an empty `git diff -- sources/`.
No kernel/runtime/Finder/history sources changed.

### Local and clean-checkout commands/results

A fresh Git checkout containing only tracked standalone files ran npm ci,
npm test, npm run test:integration and npm run test:package. The combined
integration entry point completed at 0d95d01159c3788dc8fcabfe432e6a66326b00a8;
after subsequent focused corrections, affected unit/lifecycle/HTTPS/package
suites were rerun in that clean checkout at the revisions listed above.
Unchanged gateway/services do not import the new lifecycle module. No local
sibling repository is required by these scripts: kernel test acquisition fetches
the explicit GitHub SHA in kernel-dependencies.json into a disposable directory.
The separate 68/27 read-only regressions use unchanged local source revisions and
are supplemental, not hidden prerequisites for standalone scripts.

```sh
npm ci
npm test
npm run test:integration
npm run test:lifecycle
npm run test:lifecycle:gateway
npm run test:package
npm pack --dry-run --json
node --test target/foundation/server-runtime/test/*.test.js \
  target/modules/host-filesystem/test/*.test.js \
  target/modules/mfs-transfer/test/*.test.js \
  target/modules/mfs-service/test/*.test.js \
  target/modules/media-service/test/*.test.js
node --test test/finder-core.test.js
```

| Suite | Final pass | Fail | Skip | Evidence scope |
|---|---:|---:|---:|---|
| Standalone units | 123 | 0 | 0 | Original 109 plus 14 composition/journal/lifecycle security cases |
| Nginx/kernel/Chromium contract suite | 17 | 0 | 0 | Actual Session/ACL/FileIo/transfer/WebSocket/LETC code; memory identity fixtures |
| Native infrastructure services | 17 | 0 | 0 | BIND9, MariaDB, Redis/runtime client, SMTP capture/STARTTLS/auth/DKIM/queue |
| IL-3 lifecycle | 16 | 0 | 0 | Native Docker lifecycle, failures, persistence, isolated restoration, guarded image rebuild/rollback |
| Supplemental runtime/capability | 68 | 0 | 0 | Unchanged transient revision above |
| Supplemental Finder | 27 | 0 | 0 | Unchanged standalone b46e2c94b615a1993b6162716d9e8965d0029564 |
| HTTPS/job scenarios (separate assertion harness) | 4 | 0 | 0 | Real Nginx strict CA/SAN, served renewal, failed activation recovery, supplied idempotent job validation gate |

Total: **268 TAP tests**, plus **four HTTPS/job scenarios**. The scenarios are
not relabeled as TAP test cases or full kernel provisioning. npm ci installed
44 development packages; npm audit reported zero vulnerabilities. The native
optional addon install-script warnings do not change those results.

Clean-checkout project evidence: gateway drumee-il1-test-47d65613 on
127.0.0.1:36937; services drumee-il2-test-2c52102b; lifecycle
drumee-il3-test-a2cd68f4, drumee-il3-test-9197ef5e,
drumee-il3-test-4e6f5dce and final drumee-il3-test-3ee4ec76; HTTPS/job
fixture drumee-il3-gateway-7a058dab. Each reported ownership-checked cleanup.
The final strict-watchdog lifecycle command completed 16/16 at f605d76.

Development failures were retained as findings and corrected before qualification:
private-store copy permissions, reuse of a verified active DNS generation after
a failed higher-serial candidate, cached TLS probe connections during renewal,
package auditing of helper builtin imports, and interrupted harness cleanup.
A corrupted pre-existing candidate secret generation now fails before changing
the canonical pointer, with per-secret locking and fingerprint checks. Tests
requiring real Unix ownership were run outside the mapped filesystem sandbox;
its mapped /tmp UID is not a valid native permission-test environment.

The package audit passed the explicit allowlist: **38 files**, production source,
Docker descriptors/Dockerfile, declarations, README, PROVENANCE and LICENSE only.
No tests, generated state, archives, SQL data, keys, secrets, historical trees or
node_modules are packed; no production npm dependency or file: dependency exists.
The archive installed offline into an isolated consumer, exported the original
five root functions and the lifecycle subpath, and accepted representative v2
planning with drumee.lan. Unpublished development archive integrity:

`sha512-lD+7zcoPaIjTxYSoYTFMWyzmEdijZvT8qLGVTrQGF66ABPKKRP711vqfeCHhmabSlRDwK5wXGzm0aQIQXHXa6Q==`

This archive is **not** the immutable npm alpha release. No npm publication ran.
Registry inspection still reports versions 0.0.0-stage and 0.1.0-alpha.1, with next
and latest both pointing to 0.1.0-alpha.1. The published Git tag dereferences to
b1b8e8666e92ec604d933b9c99145c90b966362b and was not rewritten.

### testbox observations and owned tests

Read-only preflight: Debian 13.6/trixie, hostname minis, UID/GID 1000, Node 22.23.2,
Docker 29.7.2 and Compose 5.4.0. Declared reachable LAN address:
192.168.5.202 on wlp2s0/24. No globally reachable IPv6 address was observed.
Ports 53/80/443 were checked free before tests. No address was inferred from a
container, and no resolver, DHCP, firewall, SSH or trust-store setting was changed.

The infrastructure-only profile used exactly domain drumee.lan and dns.mode local,
BIND on the declared LAN address TCP/UDP 53 (internal rootless listener 1053),
private MariaDB/Redis listeners, persistent owned bind roots, a temporary local CA,
and an isolated journal. HTTP was disabled because no approved deployable kernel
composition was available. TLS state was explicitly prepared-pending-activation,
not remote HTTPS acceptance. SMTP/Oxymotion were not deployed.

First project drumee-il3-test-99a1efb1 exceeded the original global harness deadline;
cleanup initially refused an interrupted one-off identity collision. Its exact
owner/project/container evidence was inspected, then only that project's resources
were removed. The corrected harness handles owned interrupted test jobs and never
silently accepts watchdog errors; the final watchdog bound is 30 minutes.

The next project, **drumee-il3-test-0b765a5d**, returned exit 0 and reported
**16 successful subtests**, including physical/logical database backup,
independent restore, byte/CA/DNS/credential preservation, failure reconciliation,
rotation, conflicts, configuration rollback and backed-up same-version image
rebuild. The remote source was c3a9b867d8857914da225387407999880a409e8b; archive SHA-256:
8d2291b918de1bb1084402b17d764d85d7deccb91e7e220fe62cffb76adb8cba.
The later corrupt-generation guard and strict watchdog guard were qualified
locally, not retrospectively claimed as remotely executed changes.

From the independent LAN client 192.168.5.201/wlp3s0, the following actually ran
while the first owned BIND instance was available:

```sh
dig @192.168.5.202 drumee.lan A +time=2 +tries=2 +noall +answer
dig @192.168.5.202 drumee.lan SOA +tcp +time=2 +tries=2 +noall +answer
dig @192.168.5.202 example.net A +time=2 +tries=1 +noall +comments
```

A returned 192.168.5.202; TCP SOA reported serial 2; out-of-zone recursion was
REFUSED with recursion unavailable. This proves a real LAN client's DNS queries,
not trusted LAN HTTPS/browser or real-kernel acceptance. Client resolver use was
explicit through dig @address; no client settings were automatically installed.

Final inspection preserved these exact pre-existing containers and states:
c514f6c155f5 drumee-migrate-1, 86e518b5a6ec drumee-schemas-init-1,
e29b72ba5093 drumee-infra-init-1, all still Exited (0). The original drumee_drumee
network and five volumes drumee_cache_data, drumee_db_data, drumee_drumee_conf,
drumee_mfs_data, drumee_web_cache remain. No IL-3 containers, networks, durable
test roots, restored roots, backup payloads or source working directory remain;
ports 53/80/443 are again free. Historical images were not altered. Three newly
pulled pinned Node/MariaDB/Redis image caches were conservatively retained because
Docker reported image references; no global image/build-cache prune ran. BuildKit
cache may also remain. There is no active IL-3 service endpoint after cleanup.

Pinned engine resources used the existing IL-2 references:
MariaDB @sha256:611a2fcc5fa7c6ceb8644c6f74b25ede004ff6c3a6b38c8f8c23d3bbf6c26430,
Redis @sha256:ff02b58f971e7d7d156a1267e283fcbbeee91773b6aa36c49dac28ecfe28eadf,
Node @sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392,
Nginx @sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752
in local gateway tests. Owned tooling images were built from the pinned
capabilities/docker/Dockerfile.services recipe and referenced by inspected
immutable local image IDs. No image was published.

### Review gate

Before completing IL-3, the owner/distribution must supply the pinned minimal
host and canonical initialization/acceptance/recovery jobs described above.
The incomplete lifecycle support paths already listed also need qualification;
file timestamps/xattrs/POSIX ACLs are not preserved by the initial byte/mode/UID
copy provider and must be explicitly addressed if declared consumers require them.
Only after real persisted kernel/ACL/MFS/browser recovery and the complete
accepted lifecycle matrix pass should IL-4 stabilization, Debian distribution
integration, release preparation and Oxymotion D0 be authorized. This workstream
has not started any of them.

**IL-3 — INTEGRATION_BLOCKED**
