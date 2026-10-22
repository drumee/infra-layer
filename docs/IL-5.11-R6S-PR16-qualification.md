# Current review outcome: qualification stopped

**FAILED_QUALIFICATION.** PR #17 is integrated at75ac104ddce8700b406ba839cfe1b8bfe6d6f477. PR #16 remains open atfea6e0f461c1969addfe504feb12f33fdd0701b4 because hosted packaging failed in a generic subprocess probe that assumes /usr/bin/node. Local successes remain valid observations, but do not close the hosted gate. No fix or rerun followed this stop. See [the complete stop and recovery report](IL-5.11-R6S-postmerge-verification.md). Publication also requires a valid separately authorized npm session; current authenticated reads returnHTTP401.

## Proposed PR #16 document retained for review

The following text describes the unmerged convergence branch and its actual local evidence. Its pending gates remain pending; it does not establish final integrated qualification or authorize publication.

# PR #16 convergence qualification

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
