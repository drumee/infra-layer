# IL-5.14-CQ-01 qualification evidence

All executable/package checks below apply to **`5bb733b7f709547f928f87edf9a37fd7f31fe4be`**, cwd `/home/somanos/github/infra-layer`. No executable file is changed. The [baseline](IL-5.14-CQ-01-baseline.md) identifies historical applicability and release risks.

## Environment and receipts

[environment.json](evidence/IL-5.14-CQ-01/environment.json) records UTC observation, UID/GID, platform, exact tool versions, Docker context/endpoint, daemon identity and resource summaries. Host Node 22.22.0, npm 11.18.0, Docker 29.2.0, Compose 5.0.2. Default endpoint: `unix:///var/run/docker.sock`; daemon `f8cee57d-3923-46b6-8d55-6cd6490ec1db`, host `asohka`. Inventory: 35 containers (one running), 21 networks and 682 volumes. Unrelated projects are present; nonproduction environment isolation is **NOT_ESTABLISHED**.

Each qualification command below has a JSON receipt and separate raw `.stdout`/`.stderr` files under [evidence/IL-5.14-CQ-01](evidence/IL-5.14-CQ-01/). Receipts include exact argv, cwd, source SHA, UTC start/end, exit and stream byte counts/SHA256. The small external capture script only records subprocess results; it does not reinterpret failures. Its source and the package/environment scripts are retained as text for reproduction. No new test-runner or reporter framework is introduced.

The first read-only environment capture failed on a malformed Docker output template. One corrected capture completed; no resource mutation occurred. Its metadata output inadvertently replaced the first attempt's same-named JSON receipt. [environment-initial.json](evidence/IL-5.14-CQ-01/environment-initial.json) transparently reconstructs that receipt from the original tool result, with unchanged retained raw streams. The independent reviewer identified this reporting collision; the original failure is not hidden and is not a product defect.

Initial sandbox runs of unit/contracts/mounts failed. Raw unit output includes `spawnSync /usr/bin/git EPERM`; initial outputs often expose only file-level results. The package check rejected sandbox-remapped `/usr` ownership (`65534`, `UNSAFE_QUALIFICATION_EXECUTABLE`). The development audit encountered DNS restrictions; packing encountered npm cache write restrictions. Corresponding host reruns used the trusted toolchain outside the sandbox, with unchanged source and assertions. Initial failures are preserved, not relabeled successful. This explains the current execution choice, not historical E1/D1/B1 causality.

## Canonical checks and security regressions

| Command | Result | Raw evidence / receipt |
|---|---|---|
| `npm test` | **PASS**, 369 tests, zero failed/skipped/cancelled | [unit-host.stdout](evidence/IL-5.14-CQ-01/unit-host.stdout), [receipt](evidence/IL-5.14-CQ-01/unit-host.json) |
| `npm run test:contracts` | **PASS**, 24 tests, zero failed/skipped/cancelled | [contracts-host.stdout](evidence/IL-5.14-CQ-01/contracts-host.stdout), [receipt](evidence/IL-5.14-CQ-01/contracts-host.json) |
| `npm run lint` | **PASS**, zero errors/new findings, 28 visible historical warnings | [lint.stdout](evidence/IL-5.14-CQ-01/lint.stdout), [receipt](evidence/IL-5.14-CQ-01/lint.json) |
| `node --test test/diagnostics/fixture-volumes/mounts.test.cjs test/diagnostics/fixture-volumes/safety.test.cjs` | **PASS**, 63 named tests, zero skipped | [mounts-host.stdout](evidence/IL-5.14-CQ-01/mounts-host.stdout), [receipt](evidence/IL-5.14-CQ-01/mounts-host.json) |
| `npm run test:package` | **PASS**, closed runtime inventory and `PACKED_CONSUMER_OK` | [package-host.stdout](evidence/IL-5.14-CQ-01/package-host.stdout), [receipt](evidence/IL-5.14-CQ-01/package-host.json) |
| `npm ls --all --json` | **PASS**, installed dependency graph resolves | [npm-graph.stdout](evidence/IL-5.14-CQ-01/npm-graph.stdout), [receipt](evidence/IL-5.14-CQ-01/npm-graph.json) |
| `npm audit --omit=dev --json` | **PASS**, zero production findings; package has no production dependencies | [audit-prod.stdout](evidence/IL-5.14-CQ-01/audit-prod.stdout), [receipt](evidence/IL-5.14-CQ-01/audit-prod.json) |
| `npm audit --include=dev --json` | **FAIL**, exit 1; five moderate entries, zero high/critical | [audit-dev-host.stdout](evidence/IL-5.14-CQ-01/audit-dev-host.stdout), [receipt](evidence/IL-5.14-CQ-01/audit-dev-host.json) |
| `python3 -B -m unittest discover -s test/security -p '*_test.py' -v` | **FAIL**, 25 tests: 22 pass, three Docker foreign-UID setup errors | [filesystem-security.stderr](evidence/IL-5.14-CQ-01/filesystem-security.stderr), [receipt](evidence/IL-5.14-CQ-01/filesystem-security.json) |

The new advisory is [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), published after the earlier clean audit. The locked dependency is minimatch 10.2.6, used by ESLint 10.13.0 and `@eslint/config-array` 0.23.5. The advisory describes pattern amplification with optimization level 2 or greater and identifies 11.0.1 as patched. Five audit entries express the dependency chain, not five independent vulnerabilities. The candidate package contains none of these development dependencies. No exploit against the runtime is demonstrated. Both current parent dependency ranges require minimatch major 10; npm's suggested major ESLint downgrade is not a justified automatic correction. No downgrade, forced override, audit-threshold change or risk acceptance is made. The failed canonical audit remains a release blocker requiring a compatible dependency correction and requalification.

The filesystem suite contains an indirect Docker dependency missed before invocation: three foreign-UID setup cases attempted unnamed, temporary, `--rm` containers with CHOWN capability. All three failed to connect to the Docker socket (`permission denied`); none reached successful creation, and no successful Docker resource mutation is evidenced. This was an execution-preflight mistake. The suite is not retried on the shared daemon, and its result remains failed. These are not qualified ownership-refusal scenarios or a real Docker campaign. Other Docker-bearing workflows, including `test:system-tools` and `test:integration`, are withheld under the same isolation prerequisite. No test is silently excluded from a claimed passing suite.

## Product invariants demonstrated deterministically

The unit TAP contains individual named results, rather than only a command exit 0. Actual canonical modules are exercised through the existing fixed-module loader. The security refusal-effectiveness cases launch the actual validator and prove both unsafe success and an unrelated error cause child-process failure. Existing guard/source tests remain intact.

| Required property | Representative current results in unit-host.stdout |
|---|---|
| Exact declared attachment set; no silent reconciliation | F1-D1–D3 and F1-D6; extra networks and disconnected inventory fail; checks remain observations |
| Network/endpoint identities | F1-D8/D9, E1-D3/D4; wrong IDs produce `NETWORK_ATTACHMENT_MISMATCH` |
| Valid declared multihoming | F1-D4 and E1-D7 pass; incomplete declarations and project-wide union substitution fail |
| Foreign/unauthorized resources | F1-D10, E1-D9 and A2 foreign negative controls pass |
| Docker failures remain fatal | F1-D12, E1-D10 and A2 command negative control pass; no readiness retry of command/ownership failures |
| Authorization before recovery and disclosure | E1 D1/D16 and D2, R5 E16; refusal occurs before admission/destruction |
| Controlled recovery and strict final state | R5 E1–E4, E19–E22; recreation failure and missing/extra final membership remain fatal |
| Original/cleanup failure propagation | S2 entry-point Promise and cleanup-rejection regressions preserve original cause; R5 failed recreation retains recovery-required state |
| Bounded behavior | Existing network-readiness fake-clock/deadline tests and no-retry fatal-error tests pass |

R5's [historical real Docker acceptance](IL-5.14-R1-F1-E3-A4-R5-F1-E1-docker-acceptance.md) and [raw result](evidence/IL-5.14-R1-F1-E3-A4-R5-F1-E1/docker-attempt-1/result.json) remain supporting evidence only. The candidate's production/package inputs are byte-identical to that executable. They do not substitute for CQ-01's unexecuted consolidated integration/application gates.

## Mount comparison and assertion execution

No new comparator is needed. Existing `test/diagnostics/fixture-volumes/mounts.cjs` projects type, volume name, destination, source hash, driver, RW, mode and propagation; validates complete records; and compares serialized tuples by occurrence count. Arrays remain in their original order and are not mutated. Tests cover permutations, preserved/missing/extra duplicates, absent/additional mounts, all relevant altered attributes and frozen inputs. Historical three-field replay is explicitly separate from the live comparison and cannot downgrade current evidence.

In addition to the existing named assertions, one bounded direct negative control calls the current comparator with only RW changed. [Exact argv](evidence/IL-5.14-CQ-01/mount-negative.json) records the complete `node -e` program. [stdout](evidence/IL-5.14-CQ-01/mount-negative.stdout) contains `CQ01_ASSERTION_REACHED`; [stderr](evidence/IL-5.14-CQ-01/mount-negative.stderr) identifies `MOUNT_MULTISET_MISMATCH` with changed field `rw` and the actual comparator stack; exit is **1 as required**. The post-call `UNREACHABLE_UNSAFE_SUCCESS` marker is absent. A thrown comparison cannot become successful process completion. No TAP diagnostic investigation is required.

This establishes deterministic comparator behavior. **V1-F1-REC-001 remains open** because current real Docker mount reconciliation has not been demonstrated and independently accepted.

## Controlled Docker and canonical application gates

**NOT_EXECUTED — isolation prerequisite not satisfied.** The current shared daemon is the same identity as older campaigns, but old authorization or old inventory does not establish current isolation. The owner was asked for a current isolated environment record; no such record is available at reporting time. Existing application environment variables `IL5_NETWORK_CLIENT`, `IL5_LAN_ADDRESS` and `IL5_HOST_NGINX` are also absent. Historical values are not silently reused as current authorization or valid prerequisites.

The canonical command remains `npm run test:application` with its required explicit network client, LAN address and trusted native nginx. It is not run with missing prerequisites merely to manufacture a predictable failure, and no partial scenario is substituted. Startup, connectivity, HTTPS/RPC, authorization/isolation, lifecycle/recovery/rollback, service integration and shutdown therefore remain **UNQUALIFIED for current complete application acceptance**. No current recurrence of `NETWORK_ATTACHMENT_MISMATCH` is observed; the earlier occurrence remains historical and unexplained, with no claim of a fix.

| Resource accounting | CQ-01 result |
|---|---|
| Campaign containers/networks/volumes/images created | None |
| Campaign resources removed | None |
| Real campaign security refusals/mount reconciliation | Not executed |
| Three indirect filesystem-test fixture attempts | Denied at socket connection; no creation IDs/receipts |
| Unknown/historical resources adopted or deleted | None |
| H01–H04 historical cleanup | Still unresolved, protected and outside CQ-01 cleanup scope |

There is no claimed successful campaign cleanup. The new-attempt resource inventory is empty because the campaign was withheld, not because historical cleanup completed. The four protected identities retain the original [historical volume disposition](IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2-historical-volume-disposition.md). No attempt is made to identify or resolve them. Safe future cleanup must verify exact creation identity, markers, type, lifecycle state and absence of unauthorized references before any exact removal.

## Exact-candidate package

`npm pack --json --pack-destination docs/evidence/IL-5.14-CQ-01` builds a new local archive from the candidate; [receipt](evidence/IL-5.14-CQ-01/pack-host.json) and [npm inventory](evidence/IL-5.14-CQ-01/pack-host.stdout) are retained. A separate verifier reads the tar without extraction, rejects links/unsafe or duplicate names, compares every member with both `git show HEAD:<path>` and working-tree bytes, and verifies npm SHA512 integrity. Actual installation of this retained archive is offline with scripts disabled; installed file names and hashes also match all members. All public literal and wildcard JavaScript exports load from the consumer, and the existing 37 consumer refusal assertions pass. [Consumer output](evidence/IL-5.14-CQ-01/retained-package-consumer.stdout), [receipt](evidence/IL-5.14-CQ-01/retained-package-consumer.json).

| Artifact property | Verified value |
|---|---|
| Name/version | `@drumee/infra-layer@0.1.0-alpha.3`, local unpublished candidate |
| Retained archive | [drumee-infra-layer-0.1.0-alpha.3.tgz](evidence/IL-5.14-CQ-01/drumee-infra-layer-0.1.0-alpha.3.tgz) |
| Length / members | 105706 bytes / 43 regular files |
| SHA256 | `004f018288018f678ed044c56ee4b9de520ab9ec9bc0e7deb3b6d59c172f99e1` |
| npm integrity | `sha512-lOz13ust70N4xnXD4LRDujRebtZerW0OjXvtYXUf35OU3Wj3w0YPg+w+P6stDPSLXGZygDHW6/eOKExLEmoj6g==` |
| Required private helper | `internal/rollback-authorization.js` present, import closure validated |
| Production dependencies | None |
| Test/diagnostic files | Absent from archive |

[package-identity.json](evidence/IL-5.14-CQ-01/package-identity.json) contains the complete inventory and member SHA256. The newly measured archive happens to equal the historical K1 hash because the inputs and npm packing are unchanged; that equality is measured, not inherited from the missing old archive. Canonical package auditing additionally validates import closure, bounded computed dispatch and sensitive/test-only content exclusion. Installed consumer fixtures are retained locally below the recorded exclusive `/tmp/cq01-consumer-*` directory for review; they contain no Docker resources. No publication, version assignment, release tag or consumer runtime acceptance is implied. This package gate passes; it does not waive the failed development audit or missing runtime acceptance.

## Review and conclusion

One consolidated independent review examines implementation, raw evidence and the withheld integration boundaries. Its disposition and remaining gates are recorded in the [final decision](IL-5.14-CQ-01-final-decision.md). No new hosted CI, CodeQL or Sonar analysis is triggered, since the PR remains unchanged; older hosted results are not relabeled current.

Final source/archive/receipt/link integrity checks pass. A full staged `git diff --cached --check` exits 2 solely because the preserved failed package command's raw `package.stdout` ends with an extra blank line. The three authored reports pass the same whitespace check. The raw stream is retained byte-for-byte; the full check is not reported as passing and no whitespace rule is changed.
