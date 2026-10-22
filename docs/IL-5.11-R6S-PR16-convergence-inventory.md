# Current review outcome: qualification stopped

**FAILED_QUALIFICATION.** PR #17 is integrated at75ac104ddce8700b406ba839cfe1b8bfe6d6f477. PR #16 remains open atfea6e0f461c1969addfe504feb12f33fdd0701b4 because hosted packaging failed in a generic subprocess probe that assumes /usr/bin/node. Local successes remain valid observations, but do not close the hosted gate. No fix or rerun followed this stop. See [the complete stop and recovery report](IL-5.11-R6S-postmerge-verification.md). Publication also requires a valid separately authorized npm session; current authenticated reads returnHTTP401.

## Proposed PR #16 document retained for review

The following text describes the unmerged convergence branch and its actual local evidence. Its pending gates remain pending; it does not establish final integrated qualification or authorize publication.

# PR #16 executable-documentation convergence inventory

## Baseline

PR #17 merged as `75ac104ddce8700b406ba839cfe1b8bfe6d6f477`. Its integrated tree passed16 regression/maintenance test methods (including the original11 scenarios/86 assertions) and two fresh npm constructions with the unchanged41-member identity. PR #16 started at `1c9d20f1cc315628cfd703199423c6efc873ff13`; its existing branch merged the updated main without conflicts or history rewriting. Root AGENTS.md now governs this work.

The complete PR-specific path list was inspected against the updated main. Three additional Python scripts are present; no new shell, JavaScript, CJS or other executable utility is hidden in the added evidence paths. JSON/text evidence and reports are inputs/records, not trusted executable code. The maintained R6S Python files inherited from main remain shared dependencies rather than new PR #16 copies.

| Utility/path | Existing trust boundary | Convergence |
| --- | --- | --- |
| docs/evidence/IL-5.11-release-review/verify.py | Caller checkout and caller-selected reusable output; ordinary truncating opens; fixed shared npm cache and TypeScript path; duplicated packaging checks | Use established clean_source/execution/private_input primitives, explicit tools, new private outputs, immutable progress and canonical artifact helper |
| docs/evidence/IL-5.11-release-review/source-archive.py | Fixed checkout/output paths, reusable output directory and truncating writes; remote gzip/tar input; assert-based validation | Explicit clean source, exclusive output, read-only Git object inventory, bounded HTTPS download, streaming archive verification without extraction, explicit errors |
| docs/evidence/IL-5.11-release-review/ci-resume/temp-path-proof.py | Intentionally reproduces old writes inside its own TemporaryDirectory; all sentinels and symlink targets are inside that private fixture | Preserve exact historical source and output; classify as bounded historical reproducer, not the implementation used for new evidence |
| Existing premerge/postmerge JSON and logs, source-archive-receipt.json | READ_ONLY_INPUT, records tied to their original source commits | Preserve bytes; new runs write to different private roots and new evidence folders |
| New helper roots, logs, JSON, cache and package subprocess output | PRIVATE_EXCLUSIVE, UID caller, root0700/files0600, descriptor-relative operations | No implicit reuse, symlink following or foreign cleanup |
| Selected clean checkout, lockfile, source Git objects, TypeScript package | TRUSTED_EXISTING/READ_ONLY_INPUT with explicit provenance and owner/mode/link checks | No neighbouring repository imports or implicit /tmp checkout selection |
| GitHub source response | UNTRUSTED archive until every member matches the selected Git tree | Do not extract; reject unexpected names/types, duplicates, traversal, incorrect sizes/content and missing blobs |

No utility recursively deletes caller-selected paths. Child tools receive paths only inside new private output directories. Temporary package files and npm cache are retained with the evidence root; container cleanup remains scoped to the canonical test harness. Root/same-UID actors and hostile filesystems remain outside the established filesystem guarantee.

The verifier's installation step must use a new private npm cache. Its default installation therefore explicitly allows registry access while retaining npm ci, ignore-scripts, no-audit and no-fund; the old offline installation depended on a prepopulated shared cache. This is an explicit qualification setup change, not a new production dependency. Offline installation is an explicit option and fails normally if the fresh cache lacks required packages. Audit already requires registry access. No runtime package script or application contract changes.

Inventory acceptance: complete. Functional and negative qualification remains a separate gate before integration.
