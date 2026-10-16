# Infra Layer IL-1 provenance

Architecture approval: transient `a31b544f565ca4438f1ed8df5eccb21bf0486104`,
`docs/refactoring/34-infra-layer-foundation.md`, refined by the IL-1 request.
Implementation baseline: transient branch `refactor/mapping`,
`9680a8cb09adfea5b40122a2df72cfdaa49fd8dd`.

The following IL-1 source ledger records the original incremental CommonJS
capability in transient. The IL-1.1 ledger below records its standalone extraction
and alpha release; this repository is now canonical. It is not a complete
distribution or a new kernel loader.

| New path | Source repository / file / symbol / inspected revision | Reason and intentional difference |
|---|---|---|
| `lib/{spec,validation,plan,state,rendering}.js`, `index.d.ts` | New implementation of the approved IL-0 public-contract specification | Pure, explicit JSON inputs; no sysEnv, secret generation, host installation or activation. Render ownership, no-follow checks, per-file atomic writes and ordinary-error rollback replace the historical mutating renderer. |
| `capabilities/http/nginx/{index,routes}.js` | `https://github.com/drumee/setup-infra`, pinned main `643d74fa8bc89d418ff1169daa09554ae84e48ef`; imported at transient baseline. `templates/etc/drumee/infrastructure/routes/app.conf.tpl` service/WebSocket/static locations; `internals/accel.{private,public}.conf.tpl` internal alias mechanism; `templates/etc/nginx/nginx.conf` sendfile and scratch paths | Semantically adapted route/transfer primitives, not wholesale copied templates. Explicit endpoints; finite minimal routes; no Team rewrites, server-code root, global credentialed CORS or broad private cache. Current FileIo prefix replaces historical `/mfs` internal alias. Direct-edge header overwrite, port authority, symlink denial, bounded scratch, unbuffered upload and protected-log redaction are intentional changes. |
| `adapters/docker/nginx.js` | New implementation; reuse evidence from `https://github.com/drumee/debian`, branch `feat/container-distribution`, `8a236e5d147a55cfd5580dcda0712cd6436ca93c`, `config/render.mjs::renderComposeRoles`, `bootstrap/usr/lib/drumee/entrypoint/web` and role-web Dockerfile | One scoped gateway descriptor; read-only mounts, non-root foreground process, syntax/functional readiness separation. No Debian installer, Team role dependency, complete stack, secret writer or host process control. |
| `test/integration/kernel-fixture.js` | Current transient runtime/session/permission/dispatch/WebSocket, HostFilesystem/FileIo, media/MFS service and transfer files at baseline `9680a8cb...`; standalone runtime comparison reference `fc7d9de3f3e63baea8258885e55efe8e242904d0` | Composes real classes unchanged. Memory identity/Hub/node/filesystem stores and pub/sub are isolated test substitutes for persistence only. FileIo, binary reception, ACL evaluation and archive process are not mocked. Fixture probe Worker is instrumentation, not a new application. |
| Test permission converter | `https://github.com/drumee/server-essentials`, pinned main `b9460ba442c9962471a592c49ce36b01e0327ff5`, `lib/lex/{permission,functions}.js::permissionValue` | Read from immutable evidence and copied only into temporary image build context; never a production dependency of Infra Layer. |
| `test/integration/{browser-entry,build-browser}.js` | transient `target/foundation/ui-runtime`, `target/tooling/ui-build` and existing `target/modules/hello` at `9680a8cb...`; standalone UI reference `5366d904356b414e87848a0bc8870b612e6c748a` | Reuses existing real LETC/hello/CommonJS/Webpack path. No direct-DOM replacement, new synthetic app, kernel singleton reinitialization by plugins, or frontend packaging ownership transfer. |
| Finder regression | `https://github.com/drumee/finder`, main `b46e2c94b615a1993b6162716d9e8965d0029564`, `test/finder-core.test.js` and logical transfer clients | Read-only consumer regression; no Finder code copied into production Infra Layer. |

setup-infra LICENSE is retained verbatim as this module's AGPL v3 LICENSE.
The historical generated templates inspected above carry generated-file notices,
not an additional copyright line; no historical copyright notice was removed.
New source retains the same applicable licensing. Original implementations remain
unchanged under `sources/**` and `target/**` outside this module.

Test image inputs are immutable official Nginx and Node digests (recorded in
README/report); the test-only archive utility is Debian `zip=3.0-13+deb12u1`.
No mutable GitHub branch is downloaded at build or test time. npm test-only
WebSocket dependencies are fixed by this module's package-lock.json. Existing
ui-build/ui-runtime dependencies are installed in temporary pinned test workspaces.

## IL-1.1 corrective extraction

Source: `https://github.com/drumee/transient`, `target/modules/infra-layer/`.
IL-1 baseline: `faee9a57487d80f79a8ec79a68887e6da36ca489`.
Canonical development/release repository after extraction:
`https://github.com/drumee/infra-layer`; transient becomes a pinned integration
snapshot. Exact corrective and subtree extraction revisions are appended to
this record in the standalone release preparation, then synchronized back.

Adaptations: plan-bound local Docker ownership/port/revision observation,
separate desired/observed/loaded/functional/protected-delivery evidence,
exclusive render-directory lock with explicit stale-lock rejection and
precommit destination checks. Five public functions and all routing/kernel
semantics retained; no IL-2 or activation mechanism. AGPL-3.0-only preserved.

Validation: 66 foundation/corrective units, 17 actual Nginx/kernel/Chromium cases,
68 unchanged runtime/capability regressions and 27 unchanged Finder tests.
All pass without skips. The standalone harness fetches only the immutable test
revision and path allowlist in `test/integration/kernel-dependencies.json` into
temporary storage; no sibling checkout or historical source tree is distributed.
An initial test-stub promisification error and static-test marker mismatch were
fixed without changing kernel implementations or reducing tests.

## Exact extraction ledger

- Transient corrective commit: `c1de9e77d412bd05d76f9b089b269f9720c54d3e`.
- History-preserving subtree split: `062f270f4459e1d247567fde6c8531c43f36688f`.
- Standalone extraction merge: `da03fac1ac835a551bb2dc92981525ff6f8967c9`.
- Preserved standalone initial main: `30b6c7584e06d4d9a1e31cf0d88a1e0b5ba4347f`.
- Exact release source is identified by Git tag `v0.1.0-alpha.1`; tag resolution
  and npm tarball integrity are recorded in transient dossier 36 after public
  registry verification. A self-referential commit hash is not embedded here.

The standalone package removes private:true only after source regression and
allowlist auditing; release metadata and this ledger are its intentional changes
from the corrective snapshot. Transient is synchronized to the exact release
tree after verification. The retained .gitignore matches the pre-existing
standalone initial commit; no unrelated work/history is overwritten.

## Unreleased IL-2 checkpoints

All IL-2 work is new infrastructure implementation in this canonical repository,
starting b1b8e8666e92ec604d933b9c99145c90b966362b. Persistent secret lifecycle
uses Node cryptographic primitives, private owned generation files and explicit
consumer projections; it does not copy historical regenerating credential logic.
See docs/IL-2-infrastructure-services.md for checkpoint evidence and phase limits.
No published alpha tag or historical kernel/source implementation is modified.

TLS lifecycle uses OpenSSL/Node X509 validation and lego 5.5.2 as an explicit
maintained executable prerequisite, inspected at go-acme/lego tag commit
452dc82113609488fb680acf8fc72712b1794f8d. AccountsStorage's missing-key regeneration
is guarded by prior ownership/fingerprint/state validation. No upstream client
code/binary, transient source tree or generated private key is shipped here.

IL-2 DNS, MariaDB and Redis resource modules are new implementations of the
approved capability boundaries, not copied installers. BIND9 9.18 native checks
and queries, official MariaDB 11.4 and Redis 7.4 pinned images provide execution
evidence. Image digests and exact Debian capability package versions are recorded
in the IL-2 report and Dockerfile.services. The native recipe removes package
installation-generated RNDC/snakeoil private material in its creation layer.

Mail adapts only Postfix relay/TLS/DKIM concepts from setup-infra main
643d74fa8bc89d418ff1169daa09554ae84e48ef, templates/etc/postfix/main.cf,
templates/etc/opendkim/KeyTable and infra.js::getDkim (historical paths inspected
in the IL-0 dossier and rechecked during IL-2).
It introduces no mailbox SQL, Team bootstrap or host-level installer. Native
Debian Postfix/Cyrus SASL configuration paths and OpenDKIM datasets were verified
against executable packages and primary documentation:
https://www.postfix.org/SASL_README.html and
https://manpages.debian.org/bookworm/opendkim/opendkim.conf.5.en.html.
All additions retain AGPL-3.0-only; LICENSE and historical notices are unchanged.

The real Redis client test acquires sources/server-essentials/lib/redis-store.js
from explicit transient revision faee9a57487d80f79a8ec79a68887e6da36ca489.
Its upstream import is server-essentials main b9460ba442c9962471a592c49ce36b01e0327ff5.
No runtime copy is distributed. Authenticated redisUrl is consumed; redisAuth
alone is ignored by this exact implementation. The fixture tests actual client,
publisher and duplicate subscriber authentication without changing that code.

IL-2 source checkpoints: ef2798d (secrets), 22e3494 (TLS), 9907576 (versioned
DNS contracts), ad7b64c (MariaDB/Redis), f468ceb (SMTP/DKIM). Subsequent integration
and documentation commits close security, observations, types and reproduction;
their full revisions are available in Git history and the final review report.
No npm release or replacement alpha tag is produced by IL-2.

## IL-3 unreleased lifecycle work

Canonical source remains drumee/infra-layer, main, starting at
0f5fb92cccae1441ba45c288acf7fc06b57ba6eb. The published alpha tag
v0.1.0-alpha.1 / b1b8e8666e92ec604d933b9c99145c90b966362b is unchanged.
No new package publication occurred. lifecycle/** is new AGPL-3.0-only code
composing this repository's existing versioned planners and capability adapters;
it does not copy kernel implementation or historical provisioning SQL.

The lifecycle HTTPS harness reuses the unchanged existing IL-1 fixture with
its pinned transient dependency acquisition; temporary kernel files stay outside
the standalone tree and npm tarball. It is explicitly contract-fixture evidence,
not a deployable real-kernel distribution. Exact revisions, source paths,
checkpoint commits, test evidence and remaining acceptance boundaries are in
docs/IL-3-docker-lifecycle.md. Historical source attribution/licensing above
remains intact. The source repository never moved back to transient.

The IL-3 follow-up handoff in docs/IL-3-kernel-distribution-handoff.md rechecks
revision-pinned runtime/control-plane/distribution sources and registry metadata.
It adds a proposed distribution-owned integration scope, not runtime source,
SQL provisioning or another canonical implementation. Inspected sources are
unchanged; registry metadata is distinguished from verified artifact acceptance.

The project owner approved that fixture on 2026-10-15. Its implementation lives
in transient at target/distributions/minimal-kernel-il3; runtime/module sources
remain unchanged. Qualified test source is
259189eb1d1452fae92e7a8c255a71d4fe29bc09, with exact execution evidence in
transient c5ee4591c87e7be2a7d91398cfcaa277787558e0,
docs/refactoring/37-infra-layer-il3-distribution.md. Infra Layer remains canonical.
The fixture pins this repository's 95db6c7aed097b62aa8081df17b3467d850e779c,
which adds bounded authenticated Redis native-check readiness. That correction
passes all 16 lifecycle tests, 123 units and package checks. No kernel SQL,
authorization or runtime implementation was copied or modified here. The
enclosing follow-up commit updates evidence/ownership documentation only.

## IL-4 qualification checkpoint

Starting revision: 6516c70349cc02bacffac565b5e103e660f970aa, main.
The owner approved IL-4 stabilization, not npm/image/tag publication.
070224b9048541f82ed819d65a458cc075b96d1f and
2d1f6aa6774f70f1d3cfc00f47a94ecf4133e314 correct distribution resource
normalization and preserve the historical infrastructure inventory prefix.
No public API, contract version, SQL or kernel implementation changes.
The new composition regression verifies deterministic permutation handling,
input purity, self-verification, legacy inventory order and tamper rejection.

Debian inventory checkpoint 4382c96d3362ed9eadce67cb59b18aaeb5e00ed9
records approved transient fixture c5ee4591c87e7be2a7d91398cfcaa277787558e0
and all locked artifacts. Transient SQL probe
96acf364841b7556e4bce34b96be592b6fc94a38 uses real canonical bootstrap,
authentication, Hub and MFS owners on disposable MariaDB. It demonstrates
restricted runtime grants, while explicitly exposing the absent first-human
enrollment contract. It does not introduce a production account initializer.
IL-3 history and release provenance remain intact. See
docs/IL-4-release-qualification.md for current tests, remaining qualification
and the precise integration boundary.

Final validation guard adf56e04961c3974e0bd0ad481b1700a15d99c09 validates
resource records before canonical sorting. Null and non-string identities keep
stable diagnostics, with no change to valid composition output or public API.
The existing added regression also exercises both malformed-input cases.
# IL-4R candidate integration

The original first-human blocker recorded in the historical sections is resolved
by canonical KB-01B at transient `59985d4a78e142b64f5976cc7460a723cca29a79`.
Debian consumes published `@drumee/server-runtime@0.1.0-alpha.4`, source
`f961f6214432c2e6dbbcde2b926544c076935950`, without changes to runtime or identity
contracts. The original 213-artifact/71-file inventory is preserved; the additive
Debian alignment records the current source and npm artifacts.

Infra Layer integration correction `9d8462b428db8c8421579067e7cb53b46630d39e`
starts from qualified `35fe3d0e6b6311d43940338b65a7e5ae74c0d222`. A reproduced
single-account limitation required independently projected managed SQL accounts
and private distribution services. Infra Layer owns their accounts, secret
generations, composition, observation and coordinated recovery. Debian owns
application SQL grants; the control plane owns all enrollment/provisioning SQL.
No planner, identity implementation, session or ACL engine is copied into Debian.

Candidate alpha.2 metadata and explicit CommonJS/lifecycle exports were prepared
at `08605d96161b9cea4044e97f0924e8e8561084d3`. No npm publication, release tag,
image publication or permanent deployment is performed. See
`docs/IL-4R-isolation.md` and the Debian IL-4R validation ledger for qualification
scope, artifact integrities, executed tests and outstanding operations.


## IL-5 application / external gateway

Starting published alpha.2 source: `bef9a379754bcf9a46fed8bcb6f88fe1f775c739`.
Canonical branch: `feat/il5-external-gateway`. Audit `d0b53e8`, additive contract
`11cd32c` and real application lifecycle checkpoint
`cf4ac5735f7ec0d48e48a9a752951f77f7284c74` implement the new opt-in profile.
Source-aware acceptance `d4a883a` and installed-consumer qualification `f0f48aa`
add tests only. Exact final revisions and artifact integrity are recorded in the
IL-5 review handoff, avoiding a self-referential package commit hash.

The application contract, loopback publication and CA-only projection are new
AGPL-3.0-only adaptations of this repository's own supplied-service/lifecycle
primitives. No planner, SMTP stack, identity/session/ACL or runtime is copied.
The real test host consumes published Server Runtime alpha.4, source
`f961f6214432c2e6dbbcde2b926544c076935950`, with its exact lockfile integrity.
Debian owns its generic host/image/plugin assembly and operator profile; Oxy-form
reports are read-only architectural evidence, not a source dependency.

Local metadata selects alpha.3, unpublished. Registry inspection on 2026-10-16
found alpha.2 as latest published alpha; no version, tag or image is published
by IL-5. Historical release-candidate descriptions above retain their original
checkpoint meaning. See docs/IL-5-qualification.md and
docs/IL-5-release-handoff.md for measured evidence and scope limits.
