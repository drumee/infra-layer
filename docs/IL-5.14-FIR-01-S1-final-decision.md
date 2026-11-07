# IL-5.14-FIR-01-S1 — Final decision

## Source and scope

- Published PR starting head: `1725a63711b8d016343ba76c0946255939c058e5`.
- Tested source candidate: `73b2fd6465409ddfc50396986e9daaf5993cde8b`. This report is a later documentation-only addition. The candidate is a descendant of the published head; no history was rewritten.
- Candidate Dockerfile SHA-256: `7d8750840f4baf9f6592c0a160252f8aae0271c15bb083f2aa070e6779a29fad`.
- Manifest SHA-256: `cc050811dc2c956269069b89c1d3e90e5adbbe920a136b6f0671c6bcec0a0bb5`; lockfile SHA-256: `9432fa3c53e47654ef6d24ebe51001ad3aa6dcc55fc3d41d531c244a261f9721`.
- Changes are limited to Sonar configuration, explicit string ordering in the identified source and tests, and authenticated services-image package transport. Documentation and historical test fixtures remain present. No secret lifecycle or rule thresholds were changed.

## SonarCloud scope

The candidate adds `sonar.exclusions=docs/**` and `sonar.test.exclusions=docs/**`, leaving maintained source, active tests, tooling and Dockerfiles in scope. There was no tracked scanner configuration or CI scanner workflow at the starting head; a separate SonarQube Cloud GitHub check indicates automatic analysis. No administrative session or token was available to inspect project settings, and the owner reports no SonarCloud account.

The intended exclusions are **not established as effective for this PR**. SonarQube Cloud's [automatic-analysis documentation](https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/automatic-analysis) says its properties file is read from the default branch and also describes limitations on wildcard patterns. This creates an unresolved applicability question for a properties file added only on the PR branch. The current hosted quality gate remains failed on the published head; no newer hosted analysis has run. A project administrator must establish a supported configuration and demonstrate the effective scope; do not infer a passing gate from this file.

## Sorting and transport

Nine default sorts corresponding to the eight reported S2871 findings now use an explicit ordinal comparator. Inputs are strings: relational comparison preserves the default JavaScript UTF-16 lexicographic ordering, including duplicates and prefixes. The mount multiset and network/ownership regression suites and bounded ordinal controls passed. No locale-dependent collation was introduced.

The services Dockerfile uses HTTPS for the same dated Debian snapshot indexes and pinned package archives. It retains the digest-pinned Debian base, signed indexes, all three exact index hashes, fixed package versions, per-package SHA-256 checks and rejection of unexpected package URIs. A digest-pinned curl image supplies the CA bundle at build time; Debian APT is explicitly directed to that bundle. There is no HTTP fallback or disabled TLS verification. The first build failed because the minimal base did not select the supplied bundle by default; the candidate corrects that cause. Positive HTTPS/index-hash verification passed, and negative controls rejected an invalid CA and an incorrect index hash.

The no-cache services build succeeded on the isolated temporary test host. Its image ID was `sha256:cffed5b1a4ba1890edba26264b3ea2010bfbe93bbbde75c3b591fae1d332a2a4`. Its 143 installed package/version entries produced SHA-256 `8ab1c939e59e477681161a49532850616b255a8462e8aafe92838e038a9b6867`, matching the previous qualified inventory. Postfix exposed the expected `hash` map and `cyrus` SASL mechanisms. The canonical application services image was `sha256:309700afc165c1e9899ce01f544c8f0bc19c0e43f2c72bda5e00e1eed7bf1499`; image identity is recorded separately from package identity.

## Local qualification

| Check | Outcome |
| --- | --- |
| Clean locked installation, complete dependency graph and development/production audits | PASS |
| ESLint | PASS: zero errors; 28 historical warnings |
| Unit tests and contracts | PASS: 369 and 24 respectively |
| Mount/ownership regressions | PASS: 63 |
| Services image and real services suite | PASS: build; 18 tests; cleanup confirmed |
| Canonical application acceptance | PASS: 11 groups, 87 assertions, including independent LAN denial, HTTPS/RPC, recovery, rollback, backup, SMTP/DKIM and relay refusal |
| TLS negative controls | PASS: untrusted CA and wrong digest refused |
| Package and installed consumer | PASS: 43 members and 37 consumer checks |
| Effective Sonar exclusion and hosted quality gate | NOT ESTABLISHED; hosted result still failed on starting head |

The unit, contract, lint and dependency results were recorded at `1285658`; the only subsequent executable change was the Dockerfile trust-store selection, which does not change those checks' inputs. The canonical package check was rerun successfully at `73b2fd` after that change.

The npm archive is unpublished: `@drumee/infra-layer@0.1.0-alpha.3`, 107206 bytes, SHA-256 `87f560f73a72ce068c2c9c298488bcdfc963e16bf861e9d48e15b88f759efa22`, integrity `sha512-eJAxIq+lvq22p7CXhY2mTtK56wtvppkv9pt48pGzxWU1rGBxVMppNI02wBfwLNE+1OuecEDB34yaXMqI72gsiw==`. Its members were compared with candidate source; the package has no production dependencies. The manifest and lockfile are unchanged from the published candidate, so the DEP-01 compatibility qualification remains applicable to their inputs. The archive is retained locally, not published.

Application evidence expressly leaves SMTP recovery unsupported and Internet delivery untested. Historical Postfix, network-mismatch, H1 and Debian H3 limitations remain as previously recorded. The completed application run does not extend those claims to production mail delivery.

## Ownership and confidentiality

The owner authorized testbox only for temporary testing. A fresh host/daemon and resource inventory preceded mutation. A projected Docker event record accounted for 155 container creations and destructions and six network creations and destructions; no volume creation was recorded. The final inventory had no containers or volumes, the three default networks and the original five image IDs. The campaign image was deleted only after checking its exact ID, ownership labels and absence of references. Temporary client authorization, SSH configuration, report and owned working directory were removed after identity checks. BuildKit cache was not indiscriminately pruned and remains accounted for as daemon cache. Raw campaign and cleanup evidence is retained privately outside the deliverable branch.

A bounded scan of the new source changes for common credential material and private-host markers found no established disclosure. Field names and synthetic values are not treated as operational secrets. Operational secrets remain deployment-managed outside Git; existing secrets may persist across updates. This check is bounded and does not assert that historical credentials were revoked or constitute a complete secret audit.

## Independent review

The independent reviewer inspected the actual candidate, representative image, TLS, services, application, ownership and cleanup evidence, and the exact-source archive and consumer checks. The reviewer confirmed the bounded compatibility and security results above and identified an earlier package-check log for a different archive; the exact-candidate canonical rerun resolves that provenance gap. The reviewer found no demonstrated new product-security defect and returned `S1_BLOCKED_EVIDENCE` because the effective SonarCloud scope and resulting hosted gate are unproven.

## Decision and next action

**`S1_BLOCKED_EVIDENCE`**: the implementation and affected local runtime checks passed, but effective SonarCloud scope is not established and the hosted gate remains failed. The branch is not ready for an owner push approval request under the stated gate. No push, merge, publication, tag or deployment was performed.

The smallest next action is to identify an administrator of the SonarCloud project and establish a supported `docs/**` exclusion for source and test analysis without changing security rules or thresholds. Verify the effective project settings and applicable analysis behavior. Only then can a separate owner-authorized normal push and exact-head hosted CI, CodeQL and SonarCloud checks be considered.
