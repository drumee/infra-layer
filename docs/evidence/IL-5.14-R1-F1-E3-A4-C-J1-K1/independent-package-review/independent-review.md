# Independent K1 package security review

**FINDING_CLOSED — J1-PKG-001**, at exact candidate **20c8a2931dc95f6beca1eb7ac2c0fbe5282194ee**. No current MAJOR or BLOCKER was found in this focused package scope. The original R1 network finding is outside this review and is not closed here. Complete local convergence and hosted qualification remain separate obligations.

This is a separately scoped reviewer assessment. The reviewer did not implement or modify the correction. Repository AGENTS.md, J1's original failed package report/output and the nine K1 implementation/qualification reports were read. Git HEAD, complete three-file K1 diff and source hashes were independently checked. No runtime, rollback/network behavior, package export, dependency manifest/lock, scanner policy or historical assertion was changed by K1. Only the package audit and its focused test-only helper/regressions changed. Untracked parent qualification documents are evidence, not executable inputs.

## Finding and corrective boundary

The original audit rejected internal/rollback-authorization.js because its closed internal enumeration still listed only system-tools and network-readiness. The package manifest already selected internal/. The R5 helper is required: supported lifecycle rollbackDeployment resolves through lifecycle/recovery.js, activateRollback in lifecycle/activation.js and its private authorized rollback token, then conditionally loads this helper during recovery-required admission. Removing the helper from distribution would break that legitimate runtime path.

The corrected internal pattern adds only rollback-authorization to that enumeration. Unknown/nested internal files, test fixtures and unapproved paths remain rejected. Existing other allowlist patterns are preserved. The original unexpected-member, sensitive-content and undeclared-literal-external-import assertion predicates are preserved in a test-only validator, synchronously called by the canonical audit. Original manifest/license/empty-dependency/integrity/install/public-API assertions remain active in the canonical entry point. The extraction is justified by isolated negative fixtures; it does not ship in the archive or create a permissive alternate audit.

A mandatory helper-presence assertion checks the inventory itself, not the source filesystem. Added relative closure checks require targets to be present in that same inventory, including directory index.js resolution. The single current computed import in lib/plan-v2.js is explicitly bounded by the inspected production planned-capability list and maps dkim to mail; dns/database/redis/mail index files are all present. The audit refuses unreviewed computed expressions. This is a source-specific qualification control, not a claim of a general JavaScript dependency parser.

## Independent executions

All seven commands ran under UID/GID1000 using the repository's trusted Node/npm/environment controls. Exact argv/cwd/source/UTC/exits/log SHA256 and protected Docker configuration snapshots are in execution.json. Every exit was0 and every protected configuration snapshot was unchanged. Node22.22.0 and pinned TypeScript5.9.3 apply. No live Docker, network or recovery campaign ran.

| Independent operation | Actual observation |
|---|---|
| node --test test/unit/package-inventory.test.js |15/15 PASS, no failed/skipped/cancelled tests; each negative refused for its intended assertion reason |
| node test/package-audit.js |Canonical audit0,43 members and PACKED_CONSUMER_OK; assertions executed through the shared validator |
| Offline actual archive install in a new isolated consumer |Install0, no global install or registry publication |
| Installed public/runtime check |CommonJS root and supported public exports resolve within that consumer; lifecycle rollback function loads; activation-context helper load and safe unauthorized-operation refusal pass; no source-tree cache fallback |
| Canonical strict NodeNext TypeScript consumer |Compiler0 with --strict/--noEmit/NodeNext/ES2022 and the unchanged public canonical check.ts program |
| Controlled missing-helper archive install |Separate42-member local fixture installs successfully, intentionally omitting only the helper; no published or real candidate archive changed |
| Missing-helper runtime negative |Root/lifecycle imports still load, but the actual installed activation module's contextual helper load fails MODULE_NOT_FOUND as expected; proves the closure test detects omission that root-only smoke tests would miss |

The fifteen candidate regressions cover E1–E15: exact helper authorization/presence/closure, existing approved internal members, normal inventory, unknown/nested internal refusal, missing helper/transitive module refusal, test fixture and credential/private-key refusal, undeclared external import refusal, arbitrary extra path refusal, actual-inventory completeness despite filesystem presence and fatal child-process propagation. The child nonzero outcome is expected and explicitly asserted; the regression command remains0 only when that refusal occurs.

The root implementing command evidence was also read:369 unit/24 contracts,0 lint errors/28 historical warnings/0 new findings, three audits0 vulnerabilities and installed consumer security4. These are reviewed implementing-agent results, not extra independent runs or counts to add to the independent15. They do not replace remaining parent integration/security gates.

## Actual archive and closure

Independently read the retained archive `/tmp/drumee-k1-l0h17j68/candidate/drumee-infra-layer-0.1.0-alpha.3.tgz`: **43 regular members /105706 bytes**, SHA256 **004f018288018f678ed044c56ee4b9de520ab9ec9bc0e7deb3b6d59c172f99e1**. Independently computed SHA512 matches npm integrity **sha512-lOz13ust70N4xnXD4LRDujRebtZerW0OjXvtYXUf35OU3Wj3w0YPg+w+P6stDPSLXGZygDHW6/eOKExLEmoj6g==**. SHA256 is the archive identity; npm integrity is recorded separately.

Every extracted-in-memory member matches its frozen source bytes and the package-identity member hash inventory. No link, test loader, test fixture or unauthorized internal file is present. The only internal members are the exact approved three. The helper imports node:path, lib/filesystem-safety.js and lifecycle/preparation.js, whose source/member dependency closure is packaged; public and installed runtime loading confirms that closure without executing Docker rollback. No undeclared production dependency is introduced. The actual-byte equality plus the independently executed canonical content checks support the absence of prohibited sensitive content in this artifact. This does not claim arbitrary future source is safe without renewed qualification.

The independent consumer used the retained actual archive, not source-tree linking. Strict type declarations load from that installation. The missing-helper negative used a new private local tarball; it did not mutate the candidate or published alpha.3. Original archive and installed parent consumer remain untouched. All independent valid/broken consumer directories were removed after observations. The controlled negative archive/program and logs are deliberately retained as bounded qualification evidence under the secure private review directory. No Docker resource, production file or protected Docker configuration was changed.

## Disposition and limits

J1-PKG-001 is independently **FINDING_CLOSED**: required helper inclusion, strict internal exclusion, completeness, archive integrity and isolated installed runtime/public/type compatibility are demonstrated. Source identity and protected source hashes reverified at completion. There is no independent final R1/F1 local security closure in this focused result. Parent Gateway/network/lifecycle/application and other remaining obligations must still be satisfied before claiming LOCAL_F1_QUALIFIED_AWAITING_PR_PUSH_AUTHORIZATION.

Historical Postfix uncertainty remains ROOT_CAUSE_UNDETERMINED — OWNER_ACCEPTED under the owner's narrowly scoped Option B; this review supplies no Postfix causal explanation. SMTP_RECOVERY_UNQUALIFIED and H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED remain. No Internet SMTP delivery, spool recovery, Debian acceptance or unrelated lifecycle reliability claim is made. No push, merge, tag, publication, deployment or remote review submission occurred.

Evidence: execution.json and seven original command logs; inspection.json records exact source/member/compiler/program hashes, controlled negative archive identity and cleanup. review.py is the independent executable record; runtime-check.txt is its exact controlled consumer program. location.json identifies the secure retained private artifacts. The accompanying sha256.json covers this review's actual evidence files.
