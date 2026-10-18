# Infra Layer quality and security policy

This policy complements versioned canonical tests and owner review; it does not
change branch protections or automatically make new jobs required.

## Before merge

New significant vulnerabilities must be investigated and corrected or receive an
explicit, scoped owner risk decision. New CodeQL/ESLint/test regressions must be
resolved before merge. A green scanner execution is not proof of zero alerts:
review Code Scanning results with an authorized account and correlate their
source SHA. CodeQL publication, alert reading and alert administration are
separate capabilities. Missing result access remains an explicit review blocker.

Run `npm ci --ignore-scripts --no-audit --no-fund`, `npm run lint`, `npm test`,
`npm run test:contracts`, both npm production/development audits and
`npm run test:package`. The contract subset overlaps the unit suite; do not add
its count to unit totals. New workflows fail on command errors, with no
continue-on-error or forced-success wrapper. Dependency advisories are evaluated
for production versus qualification-tool exposure; a development advisory is not
automatically a production incident, but audit failure requires owner assessment.

Network, permission, secret, SMTP, lifecycle, storage or public-contract changes
also require the corresponding real gateway/services/lifecycle/application
acceptance on a qualified host. These suites must never silently skip mandatory
proof. Hosted quality runners do not claim real LAN, Docker, SMTP or Chromium
acceptance. Reuse old heavy evidence only with verified identical relevant code,
fixture locks/images, dependencies and preserved environmental assumptions.

## False positives and risk decisions

Every disposition must identify the diagnostic/rule, exact source SHA/location,
technical reason, positive/negative evidence, owner/date and the actual tool
state. Distinguish false positive, real accepted risk and deferred debt. Never
bulk-close, lower severity, suppress rules globally or move code just to improve
a score. If an interface cannot record the decision, retain the owner's local
record and report the tool's actual unchanged state.

IL-5.8's four Sonar false positives have explicit owner acceptance; Sonar's four
OPEN states and HTTP 401 administration failure remain historical facts. No new
security result is waived by those decisions. CodeQL has no guaranteed one-to-one
mapping to Sonar rules and does not replace actual TLS/network/ACL tests.

## ESLint baseline governance

The initial 74 recommended-rule findings were individually classified by context.
Nine legitimate browser-global findings are resolved by a narrow declaration;
65 warnings remain visible, not fixed or hidden. Baseline source is 33869fe.
`tooling/eslint-baseline.json` contains exact file/line/column/rule/severity/message
records. The lint wrapper prints every finding and fails on any error or any new,
moved or duplicated finding. Removing a finding is permitted. Inline suppression
is disabled. No baseline regeneration is automatic. Updating the baseline needs
a reviewed diff, explanation, regression evidence and owner decision for any real
risk; it must not absorb new defects to turn CI green. Fix historical unused
symbols/catches in targeted owning lots rather than broad source rewrites here.

## Supply chain and artifacts

Keep exact npm development versions and integrity-bearing lockfiles; production
remains dependency-free. Dependabot proposes weekly updates for root npm, the
independently locked application fixture and pinned Actions, after its config is
integrated into the default branch. It must not auto-merge, auto-publish or
silently update immutable qualified images, Runtime pins or source provenance.
Security alert enablement and inventory need owner confirmation when APIs deny
access. Review every update and requalify the affected graph.

Keep local npm tarball SRI distinct from source archive SRI. Any changed shipped
metadata/code needs a new receipt even when version remains unpublished alpha.3.
New lint/YAML tools must never become production imports/dependencies. Preserve
old receipts and state clearly which consumer lock selects which artifact.

## Controls and decommissioning

Native CodeQL default setup remains the chosen scanner. The versioned Quality
workflow separates unit, contract, lint, dependency and package jobs with a
read-only token and immutable action references. Fork PRs must not gain write
permissions or secrets; do not use pull_request_target for untrusted code.

Do not disable Sonar until CodeQL PR execution/upload, result review, lint,
dependency coverage, package/types/consumer tests and this policy are qualified.
The external Sonar GitHub App is not repository-owned configuration. App removal,
organization-token revocation and branch-policy changes require a separate owner
operation; preserve Sonar history. If result-reading permissions prevent review,
keep both controls active and report SECURITY_MIGRATION_INCOMPLETE.

Before proposing required checks, the owner must review multiple successful
representative PR/fork/main executions, stable job names, tool/runner availability,
alert permissions, accepted debt and failure behavior. Only a separate explicit
owner decision can change protections. Neither merge nor publication is implied.
