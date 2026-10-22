# PR #16 convergence qualification

## Final hosted and integrated qualification — 2026-10-22

PR16 HEAD4777137b12cef25a1b4db6f7be265f327b830650 passes Quality39764624430 and CodeQL39764617680, including all25Python methods, no skips. SonarCloud remains FAILURE with ten annotations; the additional keys AaFjMVWpkTmw_53KoHEP and AaFjMVUPkTmw_53KoHEO are independently recalculated public-source SHA256 receipt copies, FALSE_POSITIVE_TECHNICALLY_CONFIRMED. The original eight individual dispositions above remain applicable. Main merge09170b9e435b5f9bf564237b9fcae080b56fc932 passes the new local suite/verifier/two-build artifact check and exact-source Quality39768113212/CodeQL39768112702. Its tree equals the reviewed PR tree. Main Sonar keys and individual dispositions are preserved separately; no alerts were closed.

See [the final post-merge report](IL-5.11-R6S-postmerge-verification.md) and its hashed evidence manifest for the complete current state. The source-specific sections below retain their historical scope.

## Hosted failure and authorized corrective replay — 2026-10-22

Quality run39753661585 at fea6e0f461c1969addfe504feb12f33fdd0701b4 failed after npm packaging passed: Python ran25methods, with24passes, one ERROR and zero skips. The generic stdout probe assumed /usr/bin/node; the hosted runner installed Node under its toolcache. FileNotFoundError occurred before the probe was executed. This failure remains preserved in the separate stop-report PR #18 and is not reclassified as a pass.

At owner-authorized resumption, commit e8ac692dd70160736d35cbe227cab37378a55477 changes only three generic test probes to sys.executable with a Python print command. It changes no qualification-tool resolution, timeout, security assertion, helper implementation or npm member. A clean clone passed all25methods without skips, including real foreign UID65532 and explicit UNTRUSTED_OWNER rejection. The original11scenarios retain86explicit assertions; those86are not a count of all assertions in the extended suite.

The complete verifier was newly executed at e8ac692: all nine commands returned zero, unit176, contracts24, system-tool scenarios12, package, lint, both audits and installed consumer passed. Two newly built archives match:41members,101778bytes, SHA256 c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e and npm SRI sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==. The verifier explicitly retains the distinction between these executions and heavy D2 acceptance reused by unchanged executable/test-input identity.

[New raw logs, source/date/UID/GID receipts, command results and journal hashes](evidence/IL-5.11-R6S-PR16-Resume/provenance.json) preserve each independent private execution root. Current-head hosted checks remain a mandatory pending gate before integration.

### Individual SonarCloud review

The read-only snapshot contains eight OPEN diagnostics; SonarCloud remains FAILURE. No alert is closed or suppressed. The five S6418 values were independently checked against SHA256 of public capabilities/secrets/index.js: b872fa5cdd6868d0b89f17038aa445a8c709e675f4e82452fb7283647d48c432. These fields record member-content fingerprints, contain no password/key, and confer no authentication capability.

| Issue key | Rule / location | Technical disposition |
|---|---|---|
| AaFi4toII_cSiCZiojSy | S6418 PR16/artifact receipt line26 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED: public source fingerprint recalculated above. |
| AaFi4tqhI_cSiCZiojS0 | S6418 PR16/main17-artifact receipt line26 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED: same independently recalculated public member. |
| AaFi4tqeI_cSiCZiojSz | S6418 PR16/verify receipt line26 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED: same public member fingerprint. |
| AaFfE62PcoUp91riuV1B | S6418 release-review/postmerge receipt line29 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED: same public member fingerprint; historical record retained. |
| AaFfE6yzcoUp91riuV0s | S6418 release-review/premerge receipt line29 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED: same public member fingerprint; historical record retained. |
| AaFi4tqoI_cSiCZiojS1 | S1192 source-archive.py line22 | STYLE: repeated approved absolute Git executable; no data-dependent dispatch or control-flow ambiguity. No unrelated refactor. |
| AaFi4tqoI_cSiCZiojS2 | S4790 source-archive.py line62 | CONTEXT_JUSTIFIED: SHA1 reproduces Git blob IDs, not password hashing or sole security verification. Complete archive member contents are also compared byte for byte with the selected Git objects, and archive SHA256/SHA512 are recorded separately. |
| AaFi4tqsI_cSiCZiojS3 | S5778 release_utilities_test.py line183 | STYLE: archive-construction and validation share an assertRaises scope, but construction raises no UnsafeEvidencePath; only validation can satisfy the expected exception. Each malformed variant has its own subtest. No false acceptance was identified. |

This review does not accept unrelated historical alerts globally. The snapshot and HTTP receipt are retained with the new evidence. New-head analysis will be checked for changes before merging.

## Source and execution scope

The first clean qualification source is `3740b38cefe15666f266cda933f6e53134cfd958`, built on integrated main `75ac104ddce8700b406ba839cfe1b8bfe6d6f477`. PR #16's original branch and history are preserved. All new documentation is English under the committed AGENTS.md policy. Historical machine-readable evidence and logs are unchanged.

Twenty-five test methods passed without skips: the original11 scenarios/86 explicit assertions, five maintenance tests and nine independently designed PR #16 methods. The additional methods cover the two actual writers and input handling, not a claim that earlier R6S assertions automatically qualify these utilities. Actual foreign UID65532 was established, helper-level UNTRUSTED_OWNER was required, and sentinels remained intact. Concurrent exclusive creation produced one winner and15refusals for one requested name. FIFO and symlink outputs were rejected without blocking. Eight malformed archive variants were rejected against a real owned Git fixture, including traversal, absolute/unexpected names, duplicates, symlinks, FIFO, changed content and missing paths. No mock replaced filesystem, Git or process behavior.

The complete verifier executed nine real commands from a clean clone: npm ci, unit, contracts, system-tools, package, lint, production audit, development audit and the installed consumer. All returned zero. Unit176/176 (contracts24 included), contracts24/24 separately, twelve PATH/tool scenarios, packaging, consumer8+37 assertions and strict TypeScript passed. Lint retained29historical warnings with zero errors/new findings; audits reported zero known vulnerabilities. Installation used an explicitly documented registry-backed fresh private cache rather than the old implicit shared offline cache.

The verifier invokes the canonical artifact helper, retaining its own log and reading its receipt through private_input. Two packages matched byte for byte and every member matched the selected source and D2 receipt:41files/101778compressedbytes. Recalculated npm SHA256 is c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e; SRI is sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==. Exports, types, lockfile, publication scripts/metadata and production dependencies are unchanged.

## Archive utility

The new source utility was executed against the remotely available integrated main75ac104. HTTPS returned200; all513Git blobs were verified without filesystem extraction. Source archive SHA256 was1e514c8ae0bdde74c93b560ee82e85030e5d90da2d9a06791a9eb316524b60f5 and source SRI sha512-c94urEuWpZp6AWQMrmH++x+QGLysjvUwG1BEvHT2nRQvyGMj9tEp6xi4fbmpE0daD5xF9HARUdGQevdHXgwbog==. These are source-archive identities and are separate from npm. The final canonical source archive will be measured again after integration.

Review also retains the original exact-content comparison against Git objects, in addition to object IDs, names, types, sizes and complete membership. A targeted final replay will cover this explicit content comparison before integration. Download size is bounded; archive verification is streamed and no untrusted path is used for output creation. Outputs are private/exclusive; directories are never implicitly reused and no foreign cleanup is performed. Private outputs are retained as evidence.

## Evidence and remaining gates

Every new execution has its own private root, command, source commit, date, UID/GID and journal hash. Exported raw logs and receipts will be linked below once collected. Historical heavy acceptance is reused only under unchanged executable/test-input identity; this verifier does not newly execute Gateway, Services, Lifecycle or the application acceptance suite. Its actually executed commands remain explicit.

Local convergence is favorable. Final current-head Quality, CodeQL, SonarCloud dispositions, package identity and conflict/policy refresh remain mandatory before merging PR #16. No scan or protection has been changed, and no administrative alert closure is claimed. Final post-merge verification is still a separate gate.

## Final local confirmation

Final utility source `4da3bf3` passes all25 methods again with the exact Git-content comparison retained. Its source-archive helper was re-executed against remotely available main75ac104, verified513blobs byte for byte as well as by Git object ID, and recalculated the same separate source fingerprint. [Complete commands, dates, UID/GID, raw logs and hashes](evidence/IL-5.11-R6S-PR16/provenance.json). The verifier implementation is byte-identical between3740b38 and4da3bf3; its complete nine-command execution is reused by that demonstrated identity, not claimed as re-executed.

Current npm publication access reads fail HTTP401. This does not establish a package-integrity defect or authorize authentication changes. The publication handoff explicitly marks account/ACL/2FA as currently unverified and publication blocked until a separate authorized publishing session is available. No npm write was attempted.
