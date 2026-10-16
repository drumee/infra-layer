# Drumee Infra Layer — IL-5 development (alpha.3, unpublished)

## IL-5 application distribution

This branch adds a canonical application profile behind an external host proxy,
with strict loopback publication and no implicit gateway/DB/Redis/DNS. It reuses
the lifecycle, supplied-service and secret contracts; Runtime and consumers remain
unchanged. See [architecture](docs/IL-5-architecture.md) and
[public contract](docs/IL-5-contract.md), [qualification ledger](docs/IL-5-qualification.md)
and [review handoff](docs/IL-5-release-handoff.md). The ledger distinguishes
measured qualification from future consumer acceptance.
Published alpha.2 remains the baseline and has not been overwritten.
No npm/image publication, production operation or D0 execution is authorized.

## Historical IL-4 distribution qualification

KB-01B resolves the historical first-human/operator enrollment blocker. Debian
now integrates the canonical capability with runtime alpha.4, isolated SQL roles
and a private provisioner. IL-4R candidate qualification is in progress; the
earlier blocked checkpoint remains documented as historical evidence.
The current work corrects composition inventory normalization, preserves the
existing API and records Debian's pinned dependency inventory and real SQL
role investigation. See [the IL-4 report](docs/IL-4-release-qualification.md).
No new npm release, image publication or release tag has been made.

## Unreleased IL-3 lifecycle work

IL-3 is **READY_FOR_TECHNICAL_REVIEW** for the documented minimal Docker profile.
The owner-approved distribution fixture now supplies the real kernel host,
initialization jobs and canonical recovery probes. Infrastructure
lifecycle, native-service recovery and real-kernel/testbox results
are documented in [docs/IL-3-docker-lifecycle.md](docs/IL-3-docker-lifecycle.md).
The npm alpha still represents IL-1.1; this development tree is not published.

The approved distribution boundary and qualified fixture are recorded in
[the IL-3 kernel handoff](docs/IL-3-kernel-distribution-handoff.md).
The fixture lives in transient; Infra Layer remains the canonical reusable
infrastructure repository. IL-4 stabilization is authorized; package/image
publication still requires separate owner approval.

The five root functions retain their contracts. Explicit operations use:

```js
const lifecycle = require("@drumee/infra-layer/lifecycle");
const composition = lifecycle.composeDeployment(plan, distribution);
// The operator chooses a private empty root and explicitly authorizes creation.
const context = { root: "/absolute/private/owned-deployment", authorized: true,
  create_resources: true };
const prepared = await lifecycle.prepareDeployment(composition, context);
// Preparation does not start daemons. Activation is a separate decision.
const state = await lifecycle.activateDeployment(prepared, context);
```

This snippet belongs inside an async CommonJS composition function. The
`distribution` is a validated supplied image/listener/job/resource contract;
Infra Layer does not provide kernel provisioning SQL or an application host.
See [lifecycle/index.d.ts](lifecycle/index.d.ts) for operational contracts and
supported boundaries. Configured services require locally available pinned
images and explicit host bindings. Lifecycle execution requires local Docker,
Compose, ss, Node 22 and OpenSSL; these executable prerequisites are not bundled
in npm. Kernel/application readiness is not inferred from infrastructure probes.

`npm run test:integration` runs the unchanged gateway/service suites followed by
isolated lifecycle and HTTPS contract-fixture tests. `npm run test:lifecycle`
and `npm run test:lifecycle:gateway` run those independently. All harness resources
have unique ownership/project identities and are cleaned up after validation.
The separate approved distribution fixture verifies real SQL authentication,
Hub/MFS authorization, FileIo, Redis/WebSocket, LETC/Finder, persistent restart
and isolated recovery. LAN BIND9/HTTPS and browser checks ran on testbox through
the declared client configuration. This evidence does not turn the original
memory-store contract fixture into full acceptance. Scope limits remain in
the lifecycle report; no IL-4 or release is implicitly authorized.


CommonJS infrastructure contracts, pure plans, safe rendering and independently
testable HTTP, secrets, TLS, DNS, MariaDB, Redis and outbound SMTP capabilities.
The five root functions and version-1 gateway behavior remain compatible.
Version 2 explicitly opts into IL-2 service resources. This development tree is
private and has not been published; the npm alpha/tag remains the IL-1.1 baseline.

The kernel declares requirements and retains identity, sessions, ACL, MFS and
schema ownership. Infra Layer provides capability fragments, never application
installation. Complete Compose assembly, activation, coordinated upgrades and
backup/restore belong to IL-3 and the distribution. There is no applyPlan.

## Public API

```js
const {
  validateSpec, planInfrastructure, renderPlan,
  inspectInfrastructure, diagnoseInfrastructure
} = require("@drumee/infra-layer");

const validation = validateSpec(spec, requirements);
const plan = planInfrastructure(spec, requirements, adapter_input, {
  ports: [{ address: "127.0.0.1", port: 8080, protocol: "tcp" }]
});
if (!plan.applicable) {
  // Machine-readable diagnostics/conflicts contain field names and codes only.
  throw new Error("INFRA_PLAN_NOT_APPLICABLE");
}
renderPlan(plan, "/tmp/operator-owned-render"); // render only; no activation

const docker = require("@drumee/infra-layer/adapters/docker/nginx");
const state = await inspectInfrastructure({
  id: "instance-gateway", desired_revision: plan.revision,
  container_id: "<full-64-character-Docker-id>", plan
}, docker);
const diagnostics = diagnoseInfrastructure(state, requirements);
```

The sample observation marks port 8080 occupied; use actual supplied observations
for the selected environment. `plan.applicable` means this gateway projection can
be rendered; it is not a claim that missing DNS/TLS/kernel prerequisites exist.

`validateSpec` and `planInfrastructure` are pure: no filesystem, process, network,
time, random, sysEnv or secret-store access. JSON-compatible plain objects only;
accessors/cycles/unknown properties are rejected. No implicit hostname or port
fallback. The versioned field contract is also documented in [index.d.ts](index.d.ts).

## Version-1 compatibility schema

Unknown fields are errors. Values below are explicit inputs, not Team defaults.

| Object | Required fields | Constraints |
|---|---|---|
| InfrastructureSpec | `contract_version: "1"`, `instance`, `dns`, `http` | Identifier and lower-case DNS hostname syntax. `instance.domain` optional only when resulting hostname is not required. |
| `spec.instance` | `id`; optional `domain` | Infrastructure resource identity, not a UID/Hub. |
| `spec.dns` | `mode` | Exactly `none`, `local`, `localhost`. |
| `spec.http` | `enabled`, `https`; optional `accepted_hosts` | Explicit booleans; finite hostname allowlist. localhost mode accepts only localhost as effective/accepted hostname. |
| `spec.tls` | When HTTPS: `provider: "provided"`, `certificate_ref`, `private_key_ref` | Opaque `{resource,key}` refs only. No certificate/key contents or issuance; local/ACME providers require the explicit version-2 capability contract. |
| KernelInfrastructureRequirements | `contract_version: "1"`, `http` | The actual composition host's listener and file-delegation contract. |
| `requirements.http` | `service_endpoint`, `page_endpoint`, `websocket_endpoint`, `public_assets`, `delegated_artifact_root`, `internal_artifact_prefix`, `max_binary_chunk_bytes`, `readiness_path`, `bootstrap_paths` | Endpoints `{host,port,transport:"tcp"}`; no URL/userinfo/config snippets. Chunk ceiling positive, at most 64 MiB; composition must declare its runtime's actual ceiling. |
| Public assets | `{id,url_prefix,root}` | Allowed prefixes `/-/app/`, `/-/api/`, `/-/plugins/`, `/-/static/`, `/-/images/`, `/-/fonts/`; only declare consumed views. Roots are scoped absolute paths, disjoint from protected storage. |
| Docker input | `kind: "docker-nginx"`, `project`, `network`, `image`, `listen_port`, `health_port`, `bindings`, `artifact_view`, `public_views`, `tmpfs_bytes`, `timeouts` | Immutable image `@sha256`; nonprivileged container ports >=1024; finite host IP/port bindings. All bindings use one external port authority; IPv4/IPv6 bindings may share it. Different external ports are explicitly unsupported in IL-1. |
| Protected view | `{source,target,kernel_target}` | Host source and gateway target are scoped absolute paths; kernel_target must equal declared delegated_artifact_root. Read-only in gateway. |
| Public views | `{id,source,target}` | Exactly one per asset declaration, no destination collisions, protected overlap or executable/config/temp-state mount. |
| TLS views | `{ref,source,target}` for both refs | File references, read-only, disjoint from public/protected views. Operator/distribution supplies readable matching certificate/key. |
| Timeouts | `client_body_seconds`, `upstream_seconds`, `websocket_seconds`, `send_seconds` | Explicit positive integer seconds, at most 86400. |
| Planning observation | optional `ports: [{address,port,protocol}]` | Only read-only TCP/UDP occupancy data; no credentials, global environment or raw inspection output. |

Paths use scoped absolute ASCII components, no dot segments, double separators,
trailing separators, whitespace, config interpolation or broad `/data`/system
roots. Artifact roots and URL prefixes are separate types: prefixes end in `/`.
Mount scope remains a distribution responsibility; never designate credentials,
server code, customer metadata or a whole host data partition as public assets.
Endpoints must resolve/reach the kernel on the declared Docker network;
`localhost` inside Nginx is the gateway container, not the Docker host.

### DNS resolution

| Mode | Supplied domain | Effective domain | IL-1 BIND behavior |
|---|---|---|---|
| none | example.com | example.com | No service or zone |
| none | absent | undefined | No service; enabled hostname-dependent gateway rejected |
| local | example.com | example.com | Future local DNS prerequisite recorded, no service started |
| local | absent | drumee.lan | Same prerequisite; official local default |
| localhost | any valid supplied domain | localhost | No service; supplied name does not affect revision; host publication must be loopback |
| localhost | absent | localhost | Same behavior |

No DNS mode is inferred from TLS. Version 1 records prerequisites only; version 2 plans BIND resources. LAN resolver configuration remains operator-owned.

### Plans, revisions and rendering

Plans contain normalized explicit inputs, resource descriptors, generated
artifact content/digests, diagnostics, conflicts, compatibility constraints and
prerequisites. They never contain credential values. Revisions hash normalized
inputs **and** Nginx/Docker configuration before stamping the resulting revision
label. Ordering is lexical and independent of locale. Mutable port observations
affect applicability, not the configuration revision.

`renderPlan` re-generates/compares artifacts before writing. Destinations must be
inside the explicitly supplied caller-owned render directory with trusted,
non-writable-by-others parents; sticky root-owned `/tmp` is allowed. Symlinks,
hardlinked files, unowned files, edited generated files, forged artifacts and
cross-instance/project overwrite are refused. Existing unrelated files are
preserved. All bytes are staged/fsynced before per-file rename; ordinary rename
failure rolls back earlier owned-file changes. Render ownership is recorded in
`.infra-layer-render.json`, written last. This is not a crash-atomic deployment
transaction; use an exclusively owned output
directory, then validate a complete revision before later activation.

The atomic directory lock `.infra-layer-render.lock` rejects competing writers
with `RENDER_LOCKED`. It covers manifest reading, staging, destination rechecks,
replacement and rollback. There is no automatic stale-lock takeover based on
PID or time: after a crash, the operator must verify ownership/process exit and
inspect the complete directory before recovery. A partial crash can leave mixed
files; removing a stale lock alone cannot authorize edited/mismatched artifacts.
Recovery/activation remains IL-3. Locks are released on ordinary success/error.

Generated artifacts:

- `nginx.conf`: complete gateway config, no wildcard includes or broad root.
- `gateway.compose.json`: one gateway service + externally supplied network.
- `.infra-layer-render.json`: ownership/revision/digest manifest, no activation.

Rendering performs no `nginx -t` or Docker execution implicitly. It verifies
generated content; the explicit integration/distribution validation runs native
syntax checks against mounted resources. There is no `applyPlan`.

## Gateway contracts

| Routes | Delivery |
|---|---|
| `/-/svc/module.method`, `/-/service/module.method` | Kernel native service endpoint; authentication/bootstrap/media/MFS remain dispatched by the kernel. |
| Exact `/-/{svc,service}/mfs-transfer.upload_chunk` | Binary body limit equals declared runtime ceiling on both aliases; HTTP/1.1, request buffering off, no automatic upstream retry. |
| Actual `/-/vdo/<nid>[/<hub>]/...` HLS forms | Kernel media endpoint, not a public static HLS shortcut. |
| `/`, `/-/`, declared bootstrap `.js` paths | Page endpoint, no-store; only explicitly declared pages. |
| `/-/websocket/`, `/-/ws/` | WebSocket endpoint, original Origin/subprotocol/OTAK retained; kernel authorizes. |
| Declared public asset prefixes | Exact scoped read-only views, no directory listing or symlink delivery. |
| Declared internal prefix, normally `/__drumee_artifacts/` | Internal-only alias; authorized service response → real FileIo X-Accel → protected file. GET/HEAD only, no-store, symlinks denied. |
| `/__infra_ready` | Read-only composition readiness probe proxied to declared page readiness path; not a synthetic 200 from generated config. |
| Everything else | Fail closed; no legacy Team/file/letc/avatar rewrites or SPA fallback. |

Trust boundary is **direct edge**. No real_ip/trusted-proxy chain inference.
Nginx overwrites X-Real-IP, X-Connecting-IP, X-Forwarded-For/Proto/Port and removes
Forwarded, X-Forwarded-Host, URL-routing overrides and client X-Accel-Redirect.
Host/port authority must match declared names and external binding. Cookie,
session bridge, request method/query, Origin and response session headers remain
intact. CORS is owned by kernel configuration; gateway adds no independent ACL
or credentialed wildcard policy. Page/WebSocket upstreams cannot delegate files;
only native service responses are allowed to use X-Accel.

Actual Nginx tests demonstrate original/ZIP bytes, Content-* headers, HEAD,
single/suffix/open-ended ranges, 206/416 and stale If-Range fallback. Multiple
ranges are deliberately limited to one (`max_ranges 1`), not advertised as a
multipart-range feature. Private response/query/session/OTAK values and internal
artifact paths are excluded from safe access logs; critical-only error logging
avoids query-bearing request traces. Functional failures remain observable by
status/readiness checks and explicit syntax validation.

An idle upload can close/reset its client connection while Nginx records 408;
with unbuffered proxying, delivery of a complete HTTP 408 response is not
guaranteed. Tests verify the five-second fixture deadline and backend partial
tempfile cleanup. Clients must handle transport interruption and kernel-owned
retry/status rules. No multipart upload service is added.

Only one transfer backend is supported; Maps/leases are kernel-process-local.
Gateway restart preserves content. Kernel restart loses active transfer IDs;
graceful shutdown clears known staging. No restart-resume, shared transfer store
or load balancing is implemented. All symlinks, including legitimate links in
the delegated view, are denied; archive-worker links used while building ZIPs
are not directly served by Nginx.

## Docker fragment and state

The adapter emits an official digest-pinned image, uid/gid 101, capability drop,
no-new-privileges, read-only root/config/assets/protected view, bounded `/tmp`
tmpfs, memory/pid limits and explicit TCP publication. No host networking or
privileged mode. The separate health listener is loopback **inside the container**
and does not bypass external TLS validation. The distribution supplies the
network and upstreams; a gateway with published host ports needs a bridge that
permits ingress. Docker 29 `internal:true` suppresses the tested published-port
path; the harness uses a dedicated ordinary bridge and publishes only gateway
loopback/high-port ingress. Kernel listeners have no published host ports.

`inspectInfrastructure(deployment, adapter)` calls an explicit observer. The
Docker observer reads only identity/ownership/ports/running/health/revision fields
and probes the plan-bound gateway; raw environment/health-log output is not projected.
The Docker observer validates the exact plan, full container ID, owner,
Compose project/service labels, declared published bindings and revision before
any HTTP request. It uses only the local `/var/run/docker.sock`, fixed loopback
addresses (wildcard bindings map to loopback), declared external port, primary
hostname and fixed `/__infra_ready` path. No caller URL/Host, DNS resolution,
redirect following or disabled HTTPS verification. LAN-only publications and
remote/rootless Docker daemon sockets are unsupported by this alpha observer.
Requests have an absolute 3-second deadline and 4 KiB response bound.

`desired_revision` is the plan revision; `observed_revision` is the Docker label
(`active_revision` is a compatibility alias only). Matching labels do **not**
verify loaded Nginx configuration. A functional probe does **not** verify MFS
delivery. The Docker observer reports loaded configuration and protected delivery
as unverified, so `diagnoseInfrastructure().ready` remains false even when HTTP
is functional. Separate explicit observer attestations may establish these
facts; Docker labels or syntax checks cannot. Activation/process attestation
and reliable drift/recovery evidence remain IL-3 work. Observer failures expose
only allowlisted diagnostic codes, never raw errors.

## Reproduce validation

Prerequisites: Node 22+, Docker/Compose, Chromium-compatible browser, `unzip`,
Git, tar and OpenSSL. Infra Layer has **no production npm dependency**. All test-only dependencies are pinned in package-lock.json. Runtime tests have no
external service/network dependency; initial image/package preparation may need
registry/APT access.

```sh
git clone https://github.com/drumee/infra-layer.git
cd infra-layer
npm ci
npm test
npm run test:integration
npm run test:package
```

The gateway runner (`npm run test:gateway`) uses a unique `drumee-il1-test-<suffix>` project, a free
127.0.0.1 high port, a dedicated network and caller-owned temporary fixtures. It
refuses existing project/network/image ownership collisions. Fetches only the
test dependency revision in `test/integration/kernel-dependencies.json`, archives
the listed kernel/build/capability paths into its temporary workspace, installs
the UI/build locked dependencies there, and builds browser
assets with existing ui-build, prepares a test-only Node+zip composition image,
checks Compose and `nginx -t` before gateway startup, waits for health, and runs
the actual HTTP/WebSocket/FileIo/transfer/Chromium cases. Final cleanup removes
only its containers/network/image and temporary files; no named volumes or
production host services are created. `IL1_KEEP_OUTPUT=1` preserves only its
temporary output for investigation; normal mode cleans everything. It never
starts BIND, mail, DB, Redis or an acceptance application.

Pinned test prerequisites:

- Nginx: `nginx@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752`.
- Node: `node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392`.
- Test archive utility: Debian `zip=3.0-13+deb12u1`.

Levels executed: foundation units; real Nginx; real kernel JS authorization,
Session/dispatch, FileIo/media/MFS service and transfer/archive classes; real
LETC/hello browser smoke with dynamic plugin/service/WebSocket reconnect. Identity,
Hub/node persistence, filesystem metadata and Redis-compatible pub/sub are
in-memory test stores. This does not prove MariaDB/Redis lifecycle, provisioned
platform identities, Finder product acceptance, TLS trust or Oxymotion D0.

See [PROVENANCE.md](PROVENANCE.md). `drumee/infra-layer` is the canonical source;
the transient copy remains a pinned IL-1.1 integration snapshot. IL-2 is implemented in this standalone development tree; release and IL-3 require separate approval.

## IL-2 version-2 contracts

Migration is explicit: set **both** Spec and Requirements to `contract_version:
"2"`, declare `requirements.capabilities`, retain `requirements.http` only when
the gateway is enabled, and select `kind: "docker-services"`. Supply the previous
Docker Nginx input as `adapter_input.gateway` when required. Project/network
ownership must agree. Mixed versions, new fields on version 1 and unsupported
capability combinations are errors; nothing is silently dropped.

| Declaration | Purpose and supported boundary |
|---|---|
| `secrets.store_resource`, `resources[]` | Durable store identity and opaque `{ref,type,consumers}` descriptors; no values. Only selected capability secrets enter `required_secrets`. |
| `dns.mode` | Exactly `none`, `local`, `localhost`; deterministic effective domain, `drumee.lan` default for local. None/localhost produce no DNS fragment or TSIG requirement. |
| Local DNS `ipv4`, optional `ipv6`/`ipv6_reachable`, `serial`, `listen`, `clients`, `recursion`, `state_resource` | Explicit reachable LAN record, monotonic unsigned serial, listening addresses and client CIDRs. Authoritative-only by default; recursion needs explicit forwarders and restricted clients. `tsig_ref` permits authenticated zone transfer, never automatic updates. Public-domain authority requires `split_horizon:true`. |
| `tls.provider` | `local`, `provided`, or narrow `acme`; certificate/key/CA resource refs. Local declares separate CA key, durable issuer state and renewal bounds. ACME declares separate account/challenge refs, Cloudflare and an allowed Let's Encrypt directory. Provider is independent of DNS mode. |
| `database` | Managed or external TCP MariaDB 11.4, service user/ref. Managed adds admin ref, durable state and explicit first-initialization permission. No kernel/application schemas or grants. |
| `redis` | Managed or external TCP endpoint and auth ref. Explicit `ephemeral` or `aof`; only managed AOF declares durable state. |
| `mail` | Optional capture/controlled relay, endpoint/hostname, client CIDRs, queue identity and first initialization. Incoming STARTTLS; optional submission/relay credentials. Relay requires verified outbound TLS. Capture accepts only an internal single-label sink. Optional DKIM domain/selector/key/public TXT. |
| Docker service input | Digest/local-image-ID pin, uid/gid, listener, scoped state source and explicit bindings. Only DNS publishes TCP/UDP; DB/Redis/mail production fragments publish none. MariaDB/Postfix initialization needs scoped root capabilities; DNS/Redis/OpenDKIM are non-root. |
| `resource_sources[]` | Explicit individual read-only credential/certificate projections. No store-root mount. Duplicate/overlapping durable ownership and secret/data overlaps are rejected. |

Generated fragments are `dns.compose.json`, `database.compose.json`,
`redis.compose.json`, `mail.compose.json`, optional `dkim.compose.json` and the
existing gateway fragment. Associated native configurations and the mail
entrypoint are owned render artifacts. Networks and persistent resources must
already be supplied by the future distribution. `capabilities/docker/Dockerfile.services` is a pinned capability image recipe, not a distribution
installer; callers supply its exact resulting digest. OpenDKIM's control network
is separate from the kernel network and is not published.

### Explicit lifecycle functions

These subpaths are intentionally separate from the five pure/render/observe
root functions. They are trusted **operator** operations; `authorized:true`
records explicit execution intent, not kernel user authorization.

| CommonJS subpath | Functions |
|---|---|
| `capabilities/secrets` | `createFilesystemSecretStore(root, owner)` → `inspect`, `ensure`, `import`, `rotate`, `read`, `materialize`. First creation/import explicitly authorized; rotation additionally checks current fingerprint and named consumer transition. |
| `capabilities/tls` | `prepareLocalCertificate(config, store, operation)`, `validateCertificate({certificate,key,hostname,ca_bundle,now})`, `prepareAcmeCertificate(config,store,operation,issuer?)`. Return prepared material/public fingerprints, never activation. |
| `capabilities/tls/acme` | `createLegoIssuer(config)` → explicit account `register`, account-state verification and DNS-01 issuance. Verified external lego 5.5.2 executable/SHA required; no binary bundled. |
| `capabilities/dns` | `prepareZone(domain,dns,dkim,directory,{authorized:true,owner})`, deterministic zone/config functions. New contents require an advanced explicit serial; no running-server activation. |
| `capabilities/database` | `createServiceAccount(config,store,authenticated_client,{authorized:true})`. Engine checked; fresh account has USAGE only. Existing credentials are never reset. Schema owners decide grants separately. |
| `capabilities/redis` | `materializeClientConfiguration(store,ref,endpoint,directory,{authorized:true,owner})`. Private owned authenticated `redisUrl`, consumed by actual Essentials RedisStore. `redisAuth` alone is not used by that client. |
| `capabilities/mail` | `dkimRecord(domain,selector,store,ref)` exposes public TXT/fingerprint; rotation uses the secret store and requires later consumer/DNS transition. |

Lifecycle directories are private and owned. Exclusive locks reject concurrent
or stale writers; no PID/time-based takeover. Interrupted incomplete state fails
closed. Secret generations, CA/leaf keys, account state, TSIG/DKIM keys, queues
and durable engine files survive ordinary render/restart/recreation. Consumer
projections are exclusive, narrowly mounted files; administrators with host root
or Docker access remain trusted. Never mount the secret store into services.

Local TLS uses a persistent CA, separate leaf key and DNS SAN. Operators distribute
the **public** CA certificate/fingerprint and configure client trust themselves.
Provided keys are never replaced. ACME rejects drumee.lan/localhost/private
names; registration, terms and public-DNS execution are explicit, and tests make
no public issuance/challenge. Scheduling, coordinated reload and crash recovery
remain IL-3. Prepared certificates are not reported active.

### Observation and validation

`adapters/docker/services` observes only plan-owned local Docker identities,
images, projects, revisions and exact published bindings before protocol exec.
No arbitrary diagnostic URL or destination. Native DNS, authenticated DB/Redis,
SMTP and certificate checks remain distinct from loaded-configuration evidence.
External endpoints require an explicit trusted observer. Matching labels cannot
prove loaded configuration; the built-in observer conservatively reports it
unverified and keeps activation/dependency diagnostics. Gateway readiness also
requires protected-delivery evidence. Database engine readiness never establishes
schema readiness.

`npm run test:integration` executes gateway then infrastructure-service harnesses.
`npm run test:services` runs the latter independently: actual BIND9 checks/queries,
MariaDB initialization/TCP/auth/persistence, Redis auth/pubsub/AOF/ephemeral modes
and revision-pinned Essentials client, Postfix STARTTLS/auth/queue retry, verified
OpenDKIM message signatures and outbound TLS/auth to an isolated capture alias.
All host publications are disposable loopback/high ports. Tests generate and
remove only their own credentials, queues, data and networks. No external mail,
testbox deployment, LAN resolver change or system CA installation occurs.

`npm run test:package` audits the exact allowlist and installs the packed archive
offline into an isolated consumer. No test harness, historical kernel source,
generated private key, executable ACME binary or production npm dependency is
distributed. See the implementation/validation record in
[docs/IL-2-infrastructure-services.md](docs/IL-2-infrastructure-services.md).
# Alpha.2 candidate integration

The unpublished `0.1.0-alpha.2` candidate contains the qualified-development
lifecycle implementation; published alpha.1 does not. Full Debian qualification
is still in progress. See `CHANGELOG.md` and `docs/IL-4R-isolation.md`.

Managed `database.accounts` accepts additional `{ user, secret_ref }` principals
with independent database-service resources authorizing `database-account`.
Activation creates absent accounts and verifies credentials without resets or
SQL grants. The distribution supplies its own scoped SQL grant policy.

`Distribution.services` accepts private supplied services with mandatory health,
explicit dependency ordering, scoped mounts and secret projections. This keeps
provisioning credentials out of the ordinary kernel host. Services participate
in lifecycle observation, stopping and coordinated recovery. No service may
publish an additional application port through this contract.

The Debian compatibility dependency remains explicitly
`@drumee/server-runtime@0.1.0-alpha.4`, whose KB-01A authority is consumed by
canonical KB-01B enrollment. Infra Layer does not implement those capabilities.

