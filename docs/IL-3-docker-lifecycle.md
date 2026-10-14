# IL-3 Docker lifecycle — implementation and integration boundary

Status: **INTEGRATION_BLOCKED**. Infrastructure lifecycle work is committed in the
canonical `drumee/infra-layer` repository. This is not full minimal-kernel or
Oxymotion acceptance, release qualification, or authorization to start IL-4.
Published `0.1.0-alpha.1` and `v0.1.0-alpha.1` remain unchanged.
Starting main: `0f5fb92cccae1441ba45c288acf7fc06b57ba6eb`.

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

## Real-kernel integration blocker and evidence

A complete deployable minimal-kernel composition was not found in the inspected
repositories. The required missing distribution-owned artifact must provide:
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

The owner was asked for the approved distribution artifact while independent
infrastructure work continued. No new kernel host, permissive SQL provisioning
mock, Team installation or transient implementation fork was introduced.

## Acceptance stages and remaining mandatory coverage

Stage A covers actual disposable native infrastructure, lifecycle/failure,
backup/restore, and a separate unchanged IL-1 contract fixture for HTTPS renewal.
Existing real FileIo/session/ACL/WebSocket/upload/Range/Chromium contract suites
remain independent regression evidence. A fixture pass is not full acceptance.
Stage B is infrastructure-only on Debian testbox; details/results below.
Stage C remains blocked on the distribution artifact. Persisted canonical users,
ACLs, Hubs, MFS-to-content recovery, real kernel Redis reconnect and full browser
acceptance of the composed profile are unverified.

Also outstanding before full IL-3 qualification: live interruption/resumption
of a coordinated secret rotation, non-Redis consumer rotation, durable automatic
renewal scheduling, SMTP queue backup/recovery, supplied real initialization-job
execution across upgrades/restores, engine-version compatibility upgrades and
zero-downtime/selective activation. These are explicit incomplete requirements,
not skipped tests or features implied by generated configuration.

No IL-4, permanent stack, Oxymotion deployment, npm publication, host trust/DNS
change, deletion of unrelated Docker resources or kernel/package source change
was performed.

## Validation ledger

This ledger records final clean-checkout commands, results, remote ownership,
LAN observations and checkpoint revisions. It is completed after validation;
unverified acceptance paths above cannot be converted into passes by this ledger.
