# Post-PR hosted disposition

**BLOCKED_SECURITY:** local results below remain PASS, but the subsequently executed SonarCloud gate fails. Hosted Quality and CodeQL passed on observed e0beb70; later-head checks are not assumed. [Current hosted failure and required follow-up](IL-5.14-C1-L1-hosted-ci-stop.md).

---

# IL-5.14-C1-L1 package and local CI qualification

Gate H: PASS for mandatory local checks. Runtime/package source ce1ba500d3775d1a7f6ac0156d26b60a4c6ccc4c. CI-only final source 03e63e114278ee24561847d3a7c88e910f293a08; every packaged member remains byte-identical. Documentation/evidence commits after these do not change the qualified inputs.

## Unpublished review archive

npm run test:package exits 0. The canonical audit checks the 41-member allowlist, all production imports, no dependencies, credentials/development files/absolute local paths, dry-run versus actual archive integrity, and offline clean consumer installation/export smoke tests. PACKED_CONSUMER_OK is recorded.

A retained npm pack --json archive in the exclusive mission directory has:

| Property | Value |
|---|---|
| Members | 41 |
| Compressed bytes | 103207 |
| SHA256 | cb1fed84867a2f0f52c95dcd3649e7e1a6193e4334614b824a4112816273297d |
| SRI | sha512-u3CY36JNQXeLlrLHvxK+2wS5Q+T3L3wd/xCB4yNzcE0FJHCcpTYzKz/cd2+CHAxiwlLPag+uLWJrVBsJvjzKaA== |
| Production dependencies | none |
| Engine | Node >=22; exercised on 22.22.0 |
| Local archive | /tmp/drumee-il514-c1-l1-evidence/candidate/drumee-infra-layer-0.1.0-alpha.3.tgz |

This is an unpublished local review archive with the unchanged development manifest version, not an approved alpha.3 replacement. No old archive was overwritten or registry artifact modified. The archive is intentionally not committed as a distributable. Every extracted member is byte-compared with source and hashed in [the receipt](evidence/IL-5.14-C1-L1/candidate-receipt.json). The canonical package audit and independent packed consumer produce the same SRI, establishing deterministic package inputs for this tested tree, not byte-identical Docker images.

The actual test/application/package-consumer.js runs through an isolated mission-owned image wrapper: exit 0, 8 main assertions plus 37 consumer refusal assertions, real preparation without activation, public exports resolve inside the installed consumer and strict NodeNext TypeScript compilation passes. Public loopback literal types retain the negative unsafe-binding check. TypeScript 5.9.3 is installed exactly in a separate temporary tool prefix with registry integrity in its lock; no repository dependency changes. The wrapper verifies ownership before removing its image tag. Helper source and receipt are archived as evidence text. node test/security/installed-consumer.cjs adds 4 genuine trusted-tool/TLS/port refusal scenarios against the offline installed archive.

## Version recommendation

Official npm metadata at 2026-10-26T09:11:12 UTC lists alpha.1, alpha.2 and alpha.3, with next=alpha.3. Remote branches/open PRs were reviewed; no alpha.4 release candidate was identified, while historical alpha.3 documentation and dependency PRs remain open. Recommend 0.1.0-alpha.4 for a separate release approval/preparation decision. It is not assigned, reserved, tagged, approved for publication or published here. Current manifests/locks retain their version and the published alpha.3 digest remains unchanged. [Registry state](evidence/IL-5.14-C1-L1/registry-release-state.log), [release review](evidence/IL-5.14-C1-L1/release-review-state.json).

## CI-equivalent checks and history prerequisite

The pinned Quality workflow has five required local equivalents: unit, contracts, ESLint, production/development audits and packaging plus Python security filesystem checks. All pass. A clean isolated npm ci reproduces the 5209 installed entries used for testing. The disposable-host toolchain hardening step is specific to hosted runners and is not executed against protected host toolchain metadata here; equivalent local trusted-executable checks pass. Hosted execution remains separately pending until actually observed.

The D1 assertion-preservation regression reads the historical harness at commit 703b637. The pinned checkout action defaults to one commit, so the workflow now specifies fetch-depth:0 and the existing workflow test requires it. This preserves the regression instead of skipping it in hosted CI. Read-only permissions, persist-credentials:false, pinned actions and every scanner/test remain unchanged. [Official pinned checkout documentation](https://github.com/actions/checkout/blob/d23441a48e516b6c34aea4fa41551a30e30af803/README.md), [source/impact proof](evidence/IL-5.14-C1-L1/ci-history-contract.json).

After this CI-only edit, npm test again passes all 207 tests and npm run lint again reports 0 errors/0 new findings/28 visible historical warnings. Runtime suites are not repeated because no runtime or packaged byte changed. Exact revisions/UTC commands/exits/log hashes are retained in [the ledger](evidence/IL-5.14-C1-L1/execution.jsonl). Hosted checks are PENDING_HOSTED_CI before PR execution; no branch policy or scanner is disabled. Branch protection details could not be read (HTTP403), and no merge-readiness claim is made.
