# IL-5.10-B — canonical Infra Layer integration

## Preflight before any merge

IL-5.10-A is PASS: Debian merge 1ff957f is byte-identical to qualified HEAD
490c4b0; its new targeted application/kernel/archive/shared checks all pass.
Owning report: drumee/debian docs/IL-5.10-A-debian-integration-audit.md on branch
docs/il510-integration, audit commit 4c60b54.

Examined PR #2 HEAD aa9057f224f4ae5cf80d777e3cb2fad092193fb1 into main
bef9a379754bcf9a46fed8bcb6f88fe1f775c739. PR is open, unmerged, mergeable;
unstable reflects the known external Sonar failure. Branch metadata reports
protected=false and effective branch rules []; classic protection details,
global Code Scanning and Dependabot inventories remain HTTP 403. Those limits
are explicitly retained rather than treated as complete alert visibility.

All five current Quality jobs succeed. CodeQL result check 117694357674 is
SUCCESS, reports no new alerts in changed PR code and has zero annotations;
the analysis job also succeeds. Sonar check 117694341945 remains FAILURE.
Live Sonar readback has the same three OPEN records as the last closing audit:
AaFPQwg-CiUwZk3hfrD2/S7780, AaFOFe0GZ2pN_ZCiPhee/S9382 and
AaFGj__57h-_7ZHL5nVs/S5332, all in the qualification harness. There is no new
open case or location/context change. The earlier S8431 was closed by the
external analyzer without manual disposition. Owner acceptance of the reviewed
logical false positives and the IL-5.10 policy selecting GitHub Quality/CodeQL
are the authority for proceeding with this unchanged legacy gate. No annotation,
rule, protection or external integration is altered.

The 24-commit PR range from main to aa9057f was inventoried. It contains the
approved additive application distribution, IL-5.8 fixes, qualified harness,
GitHub controls and evidence/docs. There are no later unexamined commits.
All shipped members match the 40-file qualified Debian source receipt; fresh
npm pack retains alpha.3 SRI ZZIxqtHs…9Pw==, size 98,808 bytes. Public declarations,
exports and source are exactly the previously qualified revision, including the
literal 127.0.0.1-only ingress, bounded native readiness probe, no implicit
services, authorized projections, private DKIM, ownership checks and explicit
SMTP_RECOVERY_UNQUALIFIED refusal. Current contract tests include positive and
negative application/security cases; previous 87 Infra and 126 Debian real
assertion runs are retained by exact code/input identity, not claimed rerun.

Fresh preflight results: 161 TAP pass, 24 contract TAP pass (overlapping subset),
0 ESLint errors/65 visible historical warnings/0 new diagnostics, npm production
and development audit 0 vulnerabilities, exact candidate tarball identity.
No test or control is weakened. The immediate head/base/protection recheck and
expected-head guarded, ordinary merge commit are still required. Merge is not
claimed by this preflight text; the confirmed result will be appended below.

## Confirmed integration and post-merge checks

Status: **PASS**. GitHub independently confirms PR #2 merged at
2026-10-19 12:46:41 UTC, ordinary merge commit
`9e4166618ca519e5d9b9e58f5191d37c5fd56462`, preserving aa9057f and its ancestry.
The feature reference still exists. Main's exact root tree
`83121b0357c4fc1fa2df6f6ffa49236fd5fa105e` equals the qualified PR head;
`git diff aa9057f 9e41666` is empty. No conflict resolution or package-byte change
was introduced. Fresh post-merge runs pass 161 unit TAP and 24 overlapping
contract TAP, zero failure/skip. npm pack again produces the exact qualified
98,808-byte alpha.3 candidate and unchanged SRI.

On canonical main, all five Quality jobs and native CodeQL analysis succeed.
CodeQL/Dependabot analysis annotations are runner-image migration notices, not
new security diagnostics. Dependabot config validation also succeeds. Full
Security/Dependabot alert APIs remain HTTP 403, so this is not a claim of zero
repository-wide alerts. The PR result with zero new annotations remains the
available scoped security result for the byte-identical code.

The default-branch Sonar inventory is **broader than the PR scope**: 227 OPEN
records (188 code smells, 23 vulnerability classifications, 16 bugs). Three
branch-specific IDs map by rule/file/hash/message to the already reviewed logical
S7780/S9382/S5332 cases. The other 224 records predate this merge; the 22 other
vulnerability classifications point to statements already present in the old
main bef9a37 (PATH/process or temporary-fixture concerns). They are not new IL-5
source statements and are **not** all covered by the owner's four false-positive
decisions. They are retained as a distinct legacy repository-security inventory,
not silently closed, marked false positive or declared safe. The new operational
Quality/CodeQL policy does not imply their administrative acceptance. Broader
owner triage remains a release-review reservation; no new significant IL-5
source finding or changed context is demonstrated by this analysis.

Sonar's main gate remains ERROR (new reliability D, security B under its existing
previous-version period). No tool/rule/protection is disabled. This explicit
scope distinction replaces any misleading inference that the entire repository
has only the three PR findings. The observed inventory and legacy statement
comparison are retained in [integration evidence](evidence/IL-5.10/B-integration.json);
[preflight evidence](evidence/IL-5.10/B-preflight.json) retains the original PR view.

This B PASS permits the convergence-plan stage. No npm/image/tag publication,
Debian-main merge, production operation or consumer deployment occurred.
