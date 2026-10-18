# IL-5.9-A — Sonar to GitHub security migration

Review status: **BLOCKED_GITHUB_PERMISSIONS** for complete security-result review.
Decommission status: **SECURITY_MIGRATION_INCOMPLETE**. The independently
implementable GitHub chain is running successfully; Sonar is still active.

## Preserved decisions

IL-5.8 examined 26 original Sonar findings, corrected 21 and proposed five false
positives (one misleading unused default removed). The four remaining logical
findings are owner-approved: S8431 immutable image digest, S5332 mandatory verified
SMTP STARTTLS, S7780 literal POSIX SSH quoting and S9382 bounded sequential polling.
At the initial reference their actual Sonar states were four OPEN. The older replacement-ID history and
Security B/Reliability A/failed gate are retained, not rewritten as closure.
IL-5.9's approved S8431 transition received HTTP 401; no disposition was recorded by that mission.
See IL-5.8-sonar-disposition.md, IL-5.8-security-review.md and
IL-5.9-sonar-closure.md for exact IDs and proof. This mission attempts no Sonar
administration or authentication workaround.

Fresh post-push readback at a9decba observes three OPEN issues: S5332/S7780/S9382.
S8431 is now CLOSED with resolution FIXED, update/close time
2026-10-18T13:15:11Z. Its Dockerfile has zero diff from the initial reference; no
Sonar write was made here. The public changelog is empty, so cause/actor is not
established. Do not count this scanner-side disappearance as another code fix or
as a recorded False Positive disposition. The fresh issue snapshot is retained
alongside the earlier four-OPEN evidence, without erasing either observation.

## Replacement coverage and limits

| Concern | GitHub chain / actual boundary |
| --- | --- |
| Command/argument injection and untrusted data | Native JavaScript/TypeScript CodeQL queries executed, including relevant CWE classes; CLI arguments/custom RPC model coverage is not guaranteed |
| Unsafe paths/arbitrary file access | CodeQL path queries plus unchanged canonical no-follow/owner/resource tests and explicit hostile-file regressions |
| Sensitive data and network abuse | CodeQL sensitive-data/transport/request query families plus package secret scan; not a proof of log redaction or deployment isolation |
| Control flow and undefined names | ESLint recommended correctness rules; real unit/contract checks; newly introduced diagnostics fail the gate |
| Unused symbols/legacy catches | 65 individually recorded visible baseline warnings; no blanket exclusion; owning follow-up required |
| TLS/SMTP/no open relay | Real existing STARTTLS CA/name/no-TLS negatives, SASL/relay refusal and canonical service acceptance remain essential; generic scanner protocol labels cannot prove TLS correctness |
| Deterministic schema ordering/composition | Existing code-unit comparator and exact golden composition/error regressions; no locale-style substitution |
| Docker immutable images | Existing digest validation and package/distribution provenance tests; ESLint and JS CodeQL do not parse Dockerfile pin policy equivalently to S8431 |
| Complexity/style/duplication ratings | Sonar A/B/C/D and every Sonar style rule are not reproduced; no score equivalence claim |
| Dependencies | Strict npm production/development audits; weekly Dependabot configuration; alert enablement/inventory needs owner read access and config integration into main |
| Real loopback/LAN/ACL/recovery | Existing qualified-host canonical suites, not a static scanner or mocked network test |

No tests are globally excluded. ESLint excludes only generated node_modules and
.cache directories; narrow browser globals are declared for the actual browser
fixture. Its context-specific warning levels are coupled to a reviewed exact
baseline and fail-on-new gate, not ignored findings. The six new tests validate
lint regression rejection, real rule behavior, CI YAML safety and runner-owner
independence. No deliberately vulnerable production code was introduced.

## Actual GitHub execution

Native default setup already existed at audit start. It is retained rather than
replaced by conflicting advanced YAML. Main run 39128072669 succeeds; PR run
39130988786 succeeds on a9decbab, with results upload and server processing
complete. Versioned Quality run 39130991341 passes all five jobs. Initial Quality
run 39130724308 failed one pre-existing golden fixture's host UID dependency;
that failure and its narrow correction remain documented in qualification.

The fine-grained CLI token cannot read Code Scanning alert/analysis inventory,
native setup options, Dependabot alert/enablement state or Actions administration:
HTTP 403. Execution and upload **are proven**; zero alerts, configured suite label,
full Security-tab visibility and alert-state administration **are not proven**.
No new alert can be accepted/closed through inference from a successful job.
The owner needs an authorized Security review or a connection with Code scanning
alerts:read and Dependabot alerts:read, and owner verification of setup/enablement.
Do not expand permissions or change protections automatically.

## Progressive decommission record

Origin is the external `sonarqubecloud` GitHub App. No versioned Sonar workflow,
scanner config or repository token reference was present to remove. Therefore
nothing obsolete is deleted from this branch and Sonar continues posting checks.
Its history and issue evidence are retained.

Remaining owner operations, in order:

1. Inspect the PR's actual Code Scanning alert inventory and any new findings;
   inspect Dependabot alert inventory/enablement and native CodeQL setup scope.
   Record reviewed SHA, findings, decisions and date. Resolve significant findings
   before approving a replacement; do not call an inaccessible inventory empty.
2. Review the green Quality/CodeQL runs, lint baseline policy, exact dependency
   pins, candidate receipt, consumer/types and canonical retained heavy evidence.
3. After replacement qualification is complete, authorize the repository-scoped
   external Sonar integration cleanup. This mission does not remove an organization
   app, revoke tokens, alter required checks or use missing Sonar authentication.
4. Confirm externally that Sonar stops publishing only after the owner cleanup.
   Until then, report its real failing check alongside GitHub results.

No merge, publication, image/tag delivery, Debian lock/PR change, Oxy-form
resumption, production operation or Oxymotion D0 occurs here. Source f91253c
remains the qualified runtime implementation; the new package metadata has a
separate integrity receipt and must not reuse the old SRI.
