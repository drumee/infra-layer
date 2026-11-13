# MAIL-02 Debian gate closure and rebuilt-image qualification

This addendum supersedes the earlier CI comparison against `b5a9c70`. The actual
PR13 base is `ff6e6b399128e6332c984fc2e8e60f660bd5f881`, not an earlier PR head.
The starting heads were Infra `a8661a80937fc3dddf6ba55911351771102ee785` and
Debian `54773065d6d9c348e601e2f2366b3fb614235297`. Both remain ancestors; all
pushes are non-force. PR38 and PR13 remain drafts and unmerged. No artifact was
published and no production, DNS, public firewall or recipient was changed.

## Diagnostic comparison

Complete original hosted logs and matching local replays are retained in
[evidence/ci-closure-2026-11-13](evidence/ci-closure-2026-11-13/). Comparison groups
ShellCheck diagnostics by rule, repository-relative file and cause, ignoring line
movement. `base-pr-comparison.json` retains each original location.

| Gate | Actual base ff6e6b3 | Starting PR 5477306 | Corrected branch |
| --- | --- | --- | --- |
| ShellCheck 0.11.0, warning threshold | FAIL, 91 | FAIL, same 91 | PASS, zero |
| Digest-pinned FROM | FAIL, 11 legacy instructions | FAIL, 12 including mail | PASS |
| No global npm install | FAIL, Dockerfile.server | FAIL, same cause | PASS |
| Other packaging rules | PASS | PASS | PASS |

The mail failure is `profiles/mail/Dockerfile.native`, physical line3, on
`54773065d6d9c348e601e2f2366b3fb614235297`: `FROM ${MAIL_TOOLS_IMAGE}`. The gate's
comment-filtered stream reports line2. That file is absent from the actual base.
The old builder checked config ID `a02cc47…` but passed a mutable local tag to
FROM; a config-ID check does not satisfy a manifest-pinned acquisition rule.
The previous statement of zero added packaging diagnostics described comparison
with `b5a9c70`, which already contained this defect. It did not establish absence
of a PR-introduced defect relative to ff6e6b3.

The exact ShellCheck composite action is
`00b27aa7cb85167568cb48a3838b75f4265f2bca`; the replay executes its Run-check Bash
block with its unchanged scan/exclusion/options inputs. Check the emitted
`statuscode` as well as the wrapper exit status. Packaging was replayed with the
unchanged script on Git-tracked archives in the same Debian trixie tool container,
`debian:trixie-slim@sha256:020c0d20b9880058cbe785a9db107156c3c75c2ac944a6aa7ab59f2add76a7bd`.
Versions and full commands accompany the evidence. `.github/workflows/ci.yml` and
`scripts/check-packaging.sh` are byte-identical to ff6e6b3: no rule, severity,
exclusion, threshold or job was removed or relaxed.

Inherited maintenance is separately reviewable in draft
[Debian PR14](https://github.com/drumee/debian/pull/14), head
`7afe68ea3642e392a41a803a0f8487b01bd56fcc`. Its two commits are also cherry-picked
into PR13 so required jobs can pass without a preceding merge. The complete
rule/file inventory and fixes are in Debian `docs/ci-baseline/README.md`.
They cover shell declarations, quoting/arrays, fatal cwd/credential guards,
retention with space-containing paths, seed-command continuation, immutable
legacy base images, and local-prefix PM2 installation from the existing lock.
Generated/cloned `*/src/` is untouched. Eight targeted command-double tests cover
argument preservation and missing/invalid/mismatched parent references without
publishing. A real synthetic legacy server build reports locked PM2 5.4.3.
These legacy images are not the mail transport images.

## Immutable native FROM, without publication

The canonical Dockerfile now contains a literal FROM:

```dockerfile
FROM drumee-minimal-application-tools@sha256:c9d6b4d5a69d7c53272ff13a4b90679422d61428a6f868a0463e3bdcfbe58236
```

This digest identifies a real locally reconstructed OCI manifest, not an image
config ID presented as a registry digest. The closed local OCI layout is derived
from `docker save` of the expected immutable config ID. The verifier checks the
single manifest/config, Linux/amd64 identity, blob hashes/sizes and uncompressed
layer diff IDs before building. It refuses a populated target, missing/corrupt
blobs and a changed FROM/lock. No mutable fallback exists.

`profiles/mail/build.cjs` binds the **complete FROM name including its digest** to
that verified OCI layout through BuildKit's named-context mechanism. A temporary
`docker-container` builder uses pinned
`moby/buildkit@sha256:c5f8862f52499773af85bc07695b2379ef08e8002352b0df2c4864c91d78dabe`.
The default Docker driver cannot import this OCI context and is not substituted.
The builder is removed after use; `--load` imports only into the laboratory's
local image store. There is no registry publication or registry resolution of
this local base. Six negative/positive OCI/FROM tests run in the Debian suite.

| Identity | Value |
| --- | --- |
| Base OCI manifest | `sha256:c9d6b4d5a69d7c53272ff13a4b90679422d61428a6f868a0463e3bdcfbe58236` |
| Base image config | `sha256:a02cc47d0ebca12a55759edb00757b3a8cdd00112ad4afe9a4ff7b5337ffe843` |
| Rebuilt native image config | `sha256:ab41ba434fa20afd54f71f43fc31ad2aaa94260193a4e9b56cc0e5c971fb1a56` |
| Native quota module | `01fec4a55d42add0d62b939216bec57869513b2dab6b55c83ae51c93dd22f4c5` |
| Frozen npm archive | `03a1402e447015e20b41900b05edfda00ea0ea01ae3b5e7b358b7d88d071aa99` |

The package remains unpublished `0.1.0-alpha.7-mail02.15`, producer
`de5ea272fe40c77dded529d03ef3ce1f174472ab`, with the same50 packed members and no
production dependencies. Configuration generation is byte-identical for the
same spec/registry apart from the three engine image references. Postfix3.10.13,
Dovecot2.4.1 and OpenDKIM2.11.0 are unchanged. The module is byte-identical.

The image ID nevertheless changed from `f2b46de…`; it was not silently covered
by the former image's transport verdict. Rootfs comparison covers7533 entries,
file types, numeric owners, modes, link targets and file hashes, ignoring build
mtimes. Eight paths differ: build account dates in shadow/shadow-, unused generated
snakeoil certificate/key, ldconfig cache and three apt/dpkg logs. No key payload
is published. Runtime Config is equal. The new image receives an independent
native replay on the workstation and Docker26 VM, including concurrency and
private submission; this comparison is supporting evidence, not a replacement
for those tests.

## Final native and Debian results

Final Debian head: `ad1c7be3c0a6860fb1cfa58918d79cd026828a95`. Its code checkpoint
is5d7afef; the subsequent commit changes only the qualification README. The final
Infra tip and its hosted jobs are recorded in PR38's delivery description; its
runtime/package files are bound by `source-byte-attestation.json`, avoiding a
self-referential commit hash inside the commit itself.

The current [20-row matrix](evidence/ci-closure-2026-11-13/matrix.json) is PASS
throughout; there are no retained required-gate failures. Every row links existing
public evidence and its driver in reproduction.md. Individual native controls
were asserted, including all45 checks on each host, not just process exits.

| Replay | Result and evidence |
| --- | --- |
| SMTP/LMTP/IMAP, delivered Authentication-Results and DKIM | PASS, host-final-45.json and vm-final-45.json,45 each |
| Original concurrent quota regression | PASS, host/vm-original-race-result.json,20 rounds each, no overshoot |
| Atomic quota admissions, fitting operations, COPY/MOVE, namespace races, death/restart, isolation, queued retry | PASS, host/vm-atomic-quota-result.json,8 each |
| Actual expunge frees capacity and deferred LMTP resumes at unchanged1MiB | PASS, host-quota-release-result.json plus reconciliation |
| MX alternatives/NXDOMAIN/Null MX/partial results and strict TLS | PASS, host/vm-mx-result.json; host-mx-expiry-result.json |
| TLS renewals/invalid inputs, expired leaf/issuer/no STARTTLS/alerts | PASS, host/vm-tls-result.json, expiry-result.json, expired-issuer-result.json |
| Registry generations, retained disable/delete, sessions and acceptance boundaries | PASS, host/vm-registry-cache-result.json, registry-result.json, session-result.json |
| Resource ownership and foreign resources before exposure | PASS, host/vm-identity-result.json,63 each; foreign-resource-result.json,7 each |
| Disk pressure/queue alerts, missing mount, normal reboot with nonempty queue | PASS, vm-disk-result.json, mount-result.json, boot-result.json |
| Private allowed/denied/unauthenticated clients and recreated projects on Docker26 | PASS, vm-private-before-reboot.json and vm-private-after-reboot.json,8 each |
| Independent client/service lifecycle, protocol negatives, write failure, signer/rate/alerts | PASS, corresponding host/vm life, result, protocol, write-failure, signing, rate and alerts reports |

The image export SHA256 is
`af63275f4621ca4165e7b657d13d2fb8c404904ca0078be4922a49ebd35fd608`.
`native-image.json`, `native-versions.json`, generated-config/rootfs comparisons,
source attestation and `SHA256SUMS` bind the artifacts and evidence. The guest's
observed runtime image IDs, bindings, networks and mounts are retained separately.
The owned lab service and mount unit were disabled/stopped after collection;
Maildirs, queues and the loop image are retained. Only the qualification guest
was rebooted and powered off; the physical host was not rebooted.

Local checks:333 Debian suite checks,5 mail profile tests,6 immutable-base tests,
8 maintenance regression tests,10 minimal-application tests and8 archive-boundary
tests pass. Infra409 unit/24 contract tests, lint and package checks pass. The
additional old general integration command has four FAILs reproduced on starting
Infra a8661a8 with the same command: BIND9 A/SOA/TXT query, BIND9 restart, controlled
relay setup and BIND9 changed-zone query. Full logs and normalized comparison are
retained. This is not a required hosted quality job and no general integration
PASS or speculative runner diagnosis is claimed.

## Scope retained for MAIL-03

Administration remains MAIL-03; real application integration remains MAIL-04.
No deployment, merge, public exposure, DNS/PTR or release acquisition is implied.
`SMTP_RECOVERY_UNQUALIFIED` remains for coordinated Oxy-form restoration and for
the autonomous queue/registry/Maildir/IMAP/secrets/keys restore. A guest reboot
uses existing storage and does not qualify replacement-storage restoration.
Preserve queues, ledger and deduplication keys. `accepted` is not proof of recipient
receipt; uncertain acknowledgments and old-backup replay can duplicate delivery.
