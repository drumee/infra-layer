# IL-3 real-kernel distribution handoff

Status: **PROPOSED / AWAITING DISTRIBUTION FIXTURE APPROVAL**. This document
narrows the existing IL-3 integration blocker; it does not introduce a kernel
host, authorize upstream changes, or establish application acceptance.
Infra Layer baseline: `b783e244cee321ed815d72e6f8d56b24ee48726e`.
The [lifecycle report](IL-3-docker-lifecycle.md) remains the validation record.

## Rechecked evidence

The inspected remote refs still match the source revisions below. Paths and
symbols are executable evidence unless explicitly identified as documentation.

| Owner/source | Revision and evidence | Consequence |
|---|---|---|
| server-runtime | `fc7d9de3f3e63baea8258885e55efe8e242904d0`: `lib/index.js`, `lib/http.js`, `lib/session.js`, `lib/push-bus.js`, `schemas/SCHEMA_MANIFEST.json` | Supplies HTTP/session/authorization/WebSocket primitives and intrinsic SQL, but no composed executable image or platform provisioning job. |
| transient control plane | `5469b48109dbb20eacbbc9314a6772264b388843`: `target/control-plane/bootstrap/lib/index.js`, `lib/store.js`; `target/control-plane/hub-lifecycle/lib/index.js`, `lib/store.js` | Existing callable bootstrap and Hub lifecycle are private transitional packages; a distribution must wire their parameterized SQL adapters and lifecycle policy. |
| transient transfer boundary | Same transient revision: `target/modules/host-filesystem/lib/index.js`, `target/modules/mfs-service/lib/index.js`, `target/modules/mfs-transfer/lib/index.js` and their `package.json` | FileIo, MFS service and transfer host integration remain private transitional modules. Installing system-mfs alone does not install these HTTP services. |
| system-mfs | `53101c4a995ffca9118f795ab5d4c7c731200a2f`: `lib/index.js`, `lib/store.js`, `server/schemas/SCHEMA_MANIFEST.json` | Installs module lifecycle and provisions an already assigned shard. Does not create platform identities, a listening host, or HTTP transfer services. |
| Debian distribution | `8a236e5d147a55cfd5580dcda0712cd6436ca93c`, branch `feat/container-distribution`: `docker/Dockerfile.role-app`, `bootstrap/usr/lib/drumee/entrypoint/app`, `bootstrap/usr/lib/drumee/schemas/populate.js`, `release-manifest.yaml` | The app role installs server-pod and launches its PM2 ecosystem. Population calls setup-schemas Organization, Team offline/factory and factory templates. It is not a minimal-kernel composition. Main remains `b8b0ebe7082e1ad2366f3a7997712f5da5bba127`. |
| Existing browser composition | Same transient revision: `tests/integration/kernel/phase4.9-finder-live-browser.test.js` | Real SQL/runtime/browser coverage, but in-process test hosting, MemoryRedis, organisation 41 and copied password fingerprint from a preceding fixture. Cannot be relabelled as a fresh deployable instance or canonical recovery proof. |

The package registry now supplies more recent runtime/UI/Finder artifacts than
the original npm alpha baseline. This removes a possible package-availability
obstacle; it does not supply the missing composition or initialization jobs.
Metadata was queried explicitly, without publication or dist-tag changes:

| Exact npm version queried | Registry `gitHead` | Observed tags |
|---|---|---|
| `@drumee/server-runtime@0.1.0-alpha.3` | `fc7d9de3f3e63baea8258885e55efe8e242904d0` | next alpha.3, latest alpha.1 |
| `@drumee/ui-runtime@0.1.0-alpha.2` | `5366d904356b414e87848a0bc8870b612e6c748a` | next alpha.2, latest alpha.1 |
| `@drumee/finder@0.1.0-alpha.4` | `b46e2c94b615a1993b6162716d9e8965d0029564` | next alpha.4, latest alpha.1 |
| `@drumee/window-manager@0.1.0-alpha.2` | `e294979dfcb59f73af19975e40f890a0b366cd8c` | next/latest alpha.2 |
| `@drumee/system-mfs@0.1.0-alpha.1` | `cd87db7085bc8dd40614af7fa37cdd1a76ffc5a0` | next/latest alpha.1 |

The registry returned SHA-512 integrity for every queried version. Metadata
alone does not prove tarball/source equivalence. A fixture build must verify
the exact lockfile/tarballs and tests before choosing artifacts. In particular,
system-mfs's inspected alpha.2 source is ahead of its published alpha.1. Do not
silently substitute alpha.1 for tested alpha.2 behavior or publish it as part
of IL-3. A revision-pinned private test artifact is an explicit alternative.
The published infra-layer next/latest remain `0.1.0-alpha.1`.

## Proposed owner and location

Request a narrowly scoped **distribution-owned IL-3 integration fixture** in
`transient/target/distributions/minimal-kernel-il3/`, with its acceptance tests
under `transient/tests/integration/infra-il3/`. This is a proposed temporary
composition, not a new final package boundary or competing Docker installer.
It consumes Infra Layer's existing lifecycle API and exports a Distribution
record matching `infra-layer/lifecycle/index.d.ts`.

The user mission, section 10, requires an "explicitly approved,
distribution-owned integration fixture" when the host is missing. Approval is
needed for this concrete addition outside canonical Infra Layer; it is not a
routine Docker command confirmation. An already approved immutable distribution
artifact satisfying the same contract can be supplied instead.

Proposed fixture scope:

- A CommonJS composition host wiring unchanged runtime, SQL session/ACL, real
  authenticated Redis, FileIo, system-mfs and transfer services.
- A reproducible rootless image build, explicit package/source locks and build
  provenance. No moving branches, historical source trees or sibling paths at
  execution time. Private transitional modules are acquired only from the exact
  transient revision and declared in the image's source inventory.
- Distribution-owned manifest execution, platform bootstrap, Hub/MFS lifecycle
  registration and disposable acceptance-principal preparation jobs. No kernel
  SQL/authorization rewrite or historical factory bootstrap.
- LETC/frontend build artifacts produced through the existing CommonJS/Webpack
  contract, mounted as narrow public artifact views.
- Real gateway acceptance, restart, cold backup and isolated restoration tests.
  No Oxymotion, IL-4, publication, host resolver/trust changes or shared data.

Any demonstrated upstream defect remains a separate approval boundary.

## Executable artifact contract

The proposed distribution must deliver these artifacts, not placeholders:

| Artifact | Required evidence before activation |
|---|---|
| Kernel image | Immutable digest or inspected local image ID; source/version/lock inventory; rootless UID/GID; fixed argv; no embedded credentials; all runtime imports resolvable inside the image. |
| Listeners | Explicit service/page/WebSocket ports and host `kernel`, matching `KernelInfrastructureRequirements`; exact bootstrap and health paths; one transfer backend instance. |
| Public artifacts | Versioned frontend/plugin/static files and build metadata. Only their dedicated public views enter Nginx. No credential, server source or MFS root under a public view. |
| Protected artifact view | Original content, declared representations and staged archives beneath the validated FileIo root; the same relative mapping in kernel and gateway. Read-only gateway projection with `/__drumee_artifacts/` internal delegation. |
| Persistent resources | Every content/application root identified, scoped UID/GID and `backup_required:true`; no undeclared external writer. Temporary transfer directories separately bounded; no restart-resumable transfer promise. |
| Initialization jobs | Immutable image and `artifact_revision`, `effect:"idempotent"`, explicit ordered dependencies, narrow secret projections and separate validation argv; exit nonzero for partial/conflicting state. |
| Schema identifiers | Actual manifest schema versions and relevant artifact checksums, not arbitrary version strings claiming compatibility. Exact equality is required by initial isolated restore. |
| Acceptance runner | Real HTTP/session/Hub/MFS/OTAK/browser tests and read-only recovery checks. A health command establishes host protocol readiness only. |

The existing composer accepts one supplied kernel service with all listeners;
the fixture must satisfy this boundary or report a concrete contract extension.
Do not invent a second lifecycle API or copy the Compose orchestration.
There is no activation-ready sample with a fabricated image digest.

## Initialization sequence and ownership

1. Infra Layer prepares persistent roots, secrets, CA/leaf and zone. It starts
   and probes MariaDB/Redis. Its infrastructure service account has USAGE only.
2. A distribution job prepares its owned Yellow Page database and explicitly
   scoped account privileges, then executes the runtime package's intrinsic
   manifest in order. The runtime's schema-manifest executor currently lives
   in test helpers, not its public API; the distribution must supply a confined
   manifest executor rather than import `server-runtime/test/**` at runtime.
3. A platform job invokes existing `bootstrap({database,domain:"drumee.lan"})`
   and independently `validate({database,domain})`. Organisation/domain 1 and
   nobody `ffffffffffffffff` are canonical; guest/system are generated and
   distinct. `SqlPlatformStore.transaction()` requires the same DB connection
   throughout, so a pool query wrapper without connection affinity is invalid.
4. A control-plane job installs `SqlHubStore` and system-mfs lifecycle state,
   registers the exact system-mfs manifest and its trusted provisioning handler,
   and verifies required ownership/schema state. A Hub is created only through
   `HubLifecycle.createPrivateHub` with a real authenticated session and declared
   distribution policy. Nobody, guest or system cannot stand in for that session.
5. A disposable acceptance-principal job provides owner/reader/outsider accounts
   with explicitly authorized credentials stored outside manifests and logs.
   Platform bootstrap creates only system principals with empty fingerprints;
   it does not create a human login. Copying a prior fixture's fingerprint or
   reusing its organisation 41 is not a fresh-install strategy. The owner must
   approve the account-preparation entrypoint; preserve actual `session_signin`
   behavior and do not change password semantics inside Infra Layer.
6. The supplied host resolves real session, Domain/Hub and node permissions,
   passes authoritative contexts to MFS/transfer workers, uses actual Essentials
   RedisStore with authenticated `redisUrl`, and preserves runtime OTAK/Origin
   checks. Persisted capability readiness gates service dispatch.
7. Initialization validators pass; the host health/protocol probe passes; Infra
   Layer activates Nginx. Full acceptance is a subsequent test gate.

`SqlHubStore.ensureShard()` may create a shard and grant its declared runtime
user access. Its current optional `runtime_user` configuration is a trusted
control-plane input, not a client value; a host's least-privilege grant strategy
must account for that behavior without modifying the store implicitly.
system-mfs supports opaque `hub_id` resolution. Its optional host lookup uses a
`vhost` table absent from the inspected intrinsic runtime manifest; use the
confirmed Hub-ID path for the first fixture or separately establish the owning
schema. Do not add legacy vhost SQL just because that lookup exists.

## Acceptance and recovery gates

Fresh installation must succeed from empty task-owned roots without another
test environment, factory pool, prior user, local sibling checkout or production
credential. Second initialization preserves all identities, Hub IDs, ACLs,
credentials, CA identity and content bytes. Invalid platform/schema state must
fail closed instead of being silently repaired by request handling.

Before backup, test a real owner login, rejected invalid credentials, reader
access, outsider/cross-Hub denial, original/chunked uploads, original/ZIP/Range
downloads, direct internal-path denial, LETC plugin load and OTAK WebSocket
messages. Restart/recreation must preserve DB/MFS state and exercise real Redis
reconnection. Transfer sessions may be abandoned; report their documented limit.

Distribution supplies a scoped recovery inventory of canonical principal/Hub
identities, privileges and MFS node-to-content checksums, without plaintext
passwords or session tokens. Stop every declared writer before Infra Layer's
cold backup. Restore into a different owned project/root with loopback high
ports. Test database integrity, file bytes/correspondence, platform identity,
ACL decisions, CA fingerprint, DNS serial/zone, real reauthentication and browser
behavior. The current restore API's `kernel_recovery_verified:false` remains
honest; the external acceptance report can prove kernel recovery without
pretending that infrastructure-only state observations do so.

Only after local gates pass, reinspect testbox and execute the approved IL-3
profile using owned resources. Binding `192.168.5.202` and ports 53/80/443 must
be revalidated at execution time; they are previous observations, not leases.
An explicitly configured LAN client must query BIND9 and verify HTTPS with the
public CA, without automatic system trust/resolver installation.

## Next action and remaining IL-3 work

The concrete decision is to approve the proposed temporary distribution fixture
or supply an existing pinned image/jobs contract. Until then, Stage C, real
identity/ACL/MFS recovery and LAN browser acceptance remain blocked. No fixture
implementation or remote deployment was performed during this follow-up.
Independent lifecycle limitations listed in the main report also remain open;
approving a host does not close rotation, scheduling, SMTP recovery or upgrade
compatibility requirements automatically.

## Follow-up validation

This follow-up changes documentation only. Runtime, declarations, fixtures and
the existing qualified tests are unchanged. The prior lifecycle ledger retains
its original scope and counts; no new full-kernel acceptance is claimed.

- `git ls-remote`: Infra Layer main, transient refactor/mapping, Debian main and
  feat/container-distribution, and system-mfs main matched the recorded revisions.
- `npm view <exact-package-version> version gitHead dist.integrity dependencies --json`:
  metadata obtained for each version in the table; versions/dist-tags queried
  separately. No registry write.
- `git diff --check`: passed. Eight local documentation links checked, none missing.
- `npm run test:package`: passed, 38 allowlisted files, zero production
  dependencies, `PACKED_CONSUMER_OK`. The development archive integrity is
  `sha512-Q1+sMfKj5FqmJ72FBzhHPBkgdob9A3rpIHOxXqxPLMDbRGlYq/hNGMW5zMVisWNAVFXrhPa1qrIMOB7Q9+IYQQ==`.
  This is a local package check, not a published release.
- transient working tree and `git diff -- sources/`: clean. No SSH, Docker
  deployment, upstream package changes or new lifecycle execution in this follow-up.
