# IL-5.14-CQ-02 qualification evidence

All local qualification commands apply to **`5df139e952ce9ce6d8cedfc86367c9c24dd9b402`** in `/home/somanos/github/infra-layer`, Node 22.22.0 / npm 11.18.0. [Source identity](evidence/IL-5.14-CQ-02/source-identity.json) freezes 191 non-documentation hashes; manifest and lock are unchanged. The candidate is byte-equivalent to the CQ-01 executable for all runtime, package, test and tooling inputs.

## Commands and dependency evidence

Raw streams and `.receipt.json` records are retained under [CQ-02 evidence](evidence/IL-5.14-CQ-02/). Each receipt records argv, cwd, source SHA, manifest/lock SHA256, UTC start/end, exit and stream hashes. The existing CQ-01 capture/consumer process is reused with separate receipt and output filenames. Small attempt-local script sources are retained for reproduction; no test-observation framework is added.

| Command | Exit / outcome | Evidence |
|---|---|---|
| Six current `npm view` queries | 0 / current releases and parent constraints captured | [metadata](evidence/IL-5.14-CQ-02/registry-metadata.json), [receipt](evidence/IL-5.14-CQ-02/registry-metadata.receipt.json) |
| `npm ci --ignore-scripts --no-audit --no-fund` | 0 / clean locked install | [stdout](evidence/IL-5.14-CQ-02/clean-install.stdout), [receipt](evidence/IL-5.14-CQ-02/clean-install.receipt.json) |
| `npm ls --all --json` | 0 / graph resolves; all 128 installed versions separately match lock entries | [graph](evidence/IL-5.14-CQ-02/installed-graph.stdout), [receipt](evidence/IL-5.14-CQ-02/installed-graph.receipt.json) |
| `npm audit --include=dev --json` | **1 / FAIL**, five moderate chain entries, zero high/critical | [audit](evidence/IL-5.14-CQ-02/audit-dev.stdout), [receipt](evidence/IL-5.14-CQ-02/audit-dev.receipt.json) |
| `npm audit --omit=dev --json` | 0 / PASS, zero findings | [audit](evidence/IL-5.14-CQ-02/audit-prod.stdout), [receipt](evidence/IL-5.14-CQ-02/audit-prod.receipt.json) |
| `npm run lint` | 0 / PASS, zero errors/new findings, 28 historical warnings | [stdout](evidence/IL-5.14-CQ-02/lint.stdout), [receipt](evidence/IL-5.14-CQ-02/lint.receipt.json) |
| `npm test` | 0 / PASS, 369 tests, no failures/skips/cancellations | [TAP](evidence/IL-5.14-CQ-02/unit.stdout), [receipt](evidence/IL-5.14-CQ-02/unit.receipt.json) |
| `npm run test:contracts` | 0 / PASS, 24 tests, no failures/skips/cancellations | [TAP](evidence/IL-5.14-CQ-02/contracts.stdout), [receipt](evidence/IL-5.14-CQ-02/contracts.receipt.json) |
| `npm run test:package` | 0 / PASS, closed inventory and `PACKED_CONSUMER_OK` | [stdout](evidence/IL-5.14-CQ-02/package-audit.stdout), [receipt](evidence/IL-5.14-CQ-02/package-audit.receipt.json) |
| Actual lint exposure observation | 0 / observation complete, not audit remediation | [stdout](evidence/IL-5.14-CQ-02/dependency-exposure.stdout), [exact command](evidence/IL-5.14-CQ-02/dependency-exposure.receipt.json) |

Clean installation reports the existing deprecated `yaeti@0.0.6` package. No lifecycle scripts are enabled, graph entries invalidated or manifest/lock bytes changed. No audit findings are suppressed.

The current advisory chain is `eslint` / `@eslint/config-array` → `minimatch@10.2.6`, with propagated entries for `@eslint/js` and eslint-utils. [Current registry metadata](evidence/IL-5.14-CQ-02/registry-metadata.json) identifies ESLint latest 10.14.0 still requiring `^10.2.6`, config-array latest 0.23.5 requiring `^10.2.4`, no major-10 release newer than 10.2.6, first patched minimatch 11.0.1 and latest 11.0.4. Installed ESLint remains the exact locked 10.13.0; no unrelated update is installed. [Advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249), [upstream correction](https://github.com/isaacs/minimatch/commit/77a0f5c).

The exposure observation wraps existing preprocessing methods only to count calls, invokes actual `ESLint.lintFiles(["."])`, delegates all calls unchanged and restores methods in `finally`. It records 175 linted files, 19 level-1 preprocessing calls and zero first-phase preprocessing calls, with installed source hashes. The advisory's aggressive branch was not reached in that invocation. No malicious-pattern workload or timing-based pass criterion is used. This observation does not remove the installed vulnerable dependency or satisfy the mandatory audit. **DEPENDENCY_REMEDIATION_BLOCKED_COMPATIBILITY** remains the Gate B result; available current parents do not support the patched major through their declared ranges.

## Environment, filesystem fixtures and campaign boundary

[Local environment](evidence/IL-5.14-CQ-02/environment-details.json) confirms the unchanged shared default daemon and absent application variables. The owner's later nonproduction endpoint is inspected over SSH in [remote-sudo-inventory.receipt.json](evidence/IL-5.14-CQ-02/remote-sudo-inventory.receipt.json); its raw stdout includes daemon identity, container/network/volume inventories, socket metadata, interfaces and sudo authority. The initial ordinary-user inspection could not access the socket; its zero-valued error response is not treated as an empty daemon. Read-only sudo inspection establishes the actual two running unrelated containers, five networks and twelve volumes. [Remote summary](evidence/IL-5.14-CQ-02/remote-environment-summary.json).

The remote daemon is distinct from the local historical daemon. Its nonproduction status is explicitly owner-confirmed, but the shared `oxymot-blog` workloads remain outside CQ-02 ownership. The owner's follow-up explicitly prohibits intervention on the blog and identifies future Infra Layer SMTP-relay use; it supplies no dedicated daemon or isolation mechanism. All associated blog/database resources stay protected. Labels/unique names alone would not enforce isolation. No campaign mutation is made on either daemon. **Gate C: DOCKER_ISOLATION_NOT_ESTABLISHED.**

Static examination identifies the three filesystem cases: `test_D4_foreign_ownership_real_uid`, `test_private_input_foreign_uid_is_rejected_by_helper`, and `test_foreign_uid_rejected_for_output_and_checkout`. They share `_chown()` in `test/security/evidence_helpers_test.py`. For nonroot operator UID 1000, a pinned Node image with container UID/GID 0:0 and only CAP_CHOWN changes one exclusive fixture directory to UID/GID 65532. Direct binding avoids traversing a foreign private parent; no DAC override is required. Mode 0755 permits inspection but denies ordinary operator writes. Assertions require `UNTRUSTED_OWNER` for output/input/private-input/checkout operations and unchanged sentinels/contents; finally restores original UID/GID before owned fixture cleanup. Root execution has an existing direct `os.chown` path, but no alternate execution is used to bypass Gate C.

The canonical complete command remains `python3 -B -m unittest discover -s test/security -p '*_test.py' -v`. **CQ-02 does not invoke it.** The three old setup failures are not newly tested refusals. No subset is substituted or reported as a passing complete suite. Fixture naming/creation receipts would need to be reconciled with the established isolated environment before execution; none is invented here.

The required real scenarios—expected/extra attachments, network/endpoint identity, multihoming, recreation/recovery authority, fatal Docker failures, live unordered mount observations and safe ownership cleanup—are **NOT_EXECUTED**. CQ-01's deterministic 63 mount/ownership regressions and fatal comparator control remain applicable by exact source hashes. Fresh unit TAP contains current network/refusal-effectiveness/rollback/error-propagation results. Neither set substitutes for live mount reconciliation; **V1-F1-REC-001_OPEN** remains.

| Resource accounting | CQ-02 |
|---|---|
| New Docker containers/networks/volumes/images | None |
| Docker lifecycle/removal commands | None |
| Remote source/configuration writes | None |
| Socket permission changes | None |
| Historical/foreign resource mutation or deletion | None |
| Campaign cleanup | Not executed; empty current campaign ownership inventory, not a successful cleanup claim |
| H01–H04 | Protected unresolved historical obligations; remote volumes are not assigned to those unknown identities |

## Canonical application acceptance

[Remote prerequisite readback](evidence/IL-5.14-CQ-02/remote-application-prerequisites.stdout) confirms `/usr/sbin/nginx` 1.26.3 exists and all three application variables are unset. The observed public interface address is not adopted as an authorized independent-client test configuration. No suitable `IL5_NETWORK_CLIENT` route is established. No existing nginx configuration is modified, and no historical client/address is reused.

The [canonical documentation](IL-5-qualification.md) and `test/application/run.js` require an independent SSH client that first proves control-route access and then denial of non-loopback application access, plus the host proxy and complete lifecycle sequence. **APPLICATION_ENVIRONMENT_NOT_READY**; Gates C/D also do not pass. `npm run test:application` is **NOT_EXECUTED**. No partial smoke test or expected prerequisite failure is substituted. Startup, HTTPS/RPC, authorization/isolation, service integration, lifecycle/recovery/rollback/backup and final cleanup remain unqualified as a complete current application campaign. No new occurrence or resolution of historical `NETWORK_ATTACHMENT_MISMATCH` is claimed.

## Exact candidate package

`npm pack --json --pack-destination docs/evidence/IL-5.14-CQ-02` builds the current unpublished archive. [Pack inventory](evidence/IL-5.14-CQ-02/pack.stdout), [receipt](evidence/IL-5.14-CQ-02/pack.receipt.json). The reused verifier checks each tar member against both candidate Git bytes and working-tree bytes without extracting it, then installs this exact archive offline with scripts disabled. Installed inventory/hashes match every member. All public literal and wildcard JavaScript exports load; existing 37 consumer refusal assertions pass. [Consumer results](evidence/IL-5.14-CQ-02/retained-package-consumer.stdout), [receipt](evidence/IL-5.14-CQ-02/retained-package-consumer.receipt.json).

| Property | Measured value |
|---|---|
| Package | `@drumee/infra-layer@0.1.0-alpha.3`, no version bump |
| Source | `5df139e952ce9ce6d8cedfc86367c9c24dd9b402` |
| Retained archive | [drumee-infra-layer-0.1.0-alpha.3.tgz](evidence/IL-5.14-CQ-02/drumee-infra-layer-0.1.0-alpha.3.tgz) |
| Size / inventory | 105706 bytes / 43 regular files |
| SHA256 | `004f018288018f678ed044c56ee4b9de520ab9ec9bc0e7deb3b6d59c172f99e1` |
| npm integrity | `sha512-lOz13ust70N4xnXD4LRDujRebtZerW0OjXvtYXUf35OU3Wj3w0YPg+w+P6stDPSLXGZygDHW6/eOKExLEmoj6g==` |

[package-identity.json](evidence/IL-5.14-CQ-02/package-identity.json) contains manifest/lock identity and all member hashes. Required runtime files, exports and `internal/rollback-authorization.js` are present. Canonical closure checking finds no undeclared runtime dependency, privileged test/diagnostic source or secrets. Production dependencies remain empty. Equality with CQ-01's hash is freshly measured from this archive, not inherited. Exclusive installed-consumer fixtures are retained under the recorded `/tmp/cq02-consumer-*` directory for review, with no Docker resources. No publication occurs.

The one consolidated independent review and final integrity record are linked from the [final decision](IL-5.14-CQ-02-final-decision.md). The clean package gate does not waive the failed development audit or unexecuted mandatory campaigns.
