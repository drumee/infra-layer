# IL-5.9-A security-tooling audit

Initial HEAD is `33869fe0f63e0bf47e4eb1e6290de0311a6aa2da`, following the mission's
16154bcc reference by one documentary commit. Branch feat/il5-external-gateway is
clean and matches origin. No AGENTS file exists in this Infra tree. Debian,
Runtime and Oxy-form are read-only and are not repinned or modified.

## Existing controls and capabilities

No .github directory, versioned workflow, Sonar configuration or ESLint setup
exists at the initial HEAD. Sonar is the external `sonarqubecloud` GitHub App,
not a repository job. Its history and four OPEN owner-approved false positives
remain intact; its issue API write remains unavailable (prior HTTP 401 evidence).
No action in this migration closes issues or disables Sonar.

The live Actions inventory already contains **native CodeQL default setup**,
workflow 388429010 at dynamic/github-code-scanning/codeql, created 2026-10-18
14:37:40+02:00. Its main run 39128072669 on bef9a37 succeeds. GitHub's default
setup is preferred; adding an advanced workflow while default setup is active
would duplicate/conflict with the native configuration. No advanced workflow is
introduced and no security integration is turned off. A native PR run must still
be observed on the pushed migration before calling PR analysis operational.

Main logs demonstrate JavaScript/TypeScript extraction, execution of 89 queries
in codeql/javascript-queries 2.4.7, CLI 2.27.2, successful results upload and
`Analysis upload status is complete`. Observed action checkout v6 SHA d23441a...
and CodeQL v4 SHA 6f2ac81... are GitHub-managed default-setup versions, not a
repository SHA lock. Native runner permissions include contents/actions read
and security-events write. GitHub owns its trigger/runner/token configuration;
no claim is made that a locally generated YAML controls it.

Repository is public; repo metadata reports admin/push true, but the PAT's
fine-grained endpoint capabilities differ:

| Capability | Actual evidence |
| --- | --- |
| Workflow/run/job/check/log reads | Available; real native analysis can be inspected |
| CodeQL execution | Main scan succeeds; migration PR scan qualification follows |
| Publication in Code Scanning | Main log confirms upload and server processing complete |
| Code Scanning analyses/alerts REST read | HTTP 403 Resource not accessible by personal access token |
| Default-setup configuration REST read | HTTP 403; exact configured query-suite selector/admin options unavailable |
| Dependabot alerts / enabled-state REST read | HTTP 403; cannot claim alerts enabled or zero |
| Actions permission administration read | HTTP 403 |
| Security alert state administration | Not tested or authorized by this migration; no disposition attempted |

Thus analysis success is not a complete alert inventory or proof of no security
findings. No additional repository activation is needed to execute/publish the
already observed native scan. Owner verification of alert inventory/settings and
a connection with Code Scanning/Dependabot read permissions remain necessary.
Do not grant broad access or modify protections as a workaround. Evidence stores
endpoint-specific responses, workflow/job/check metadata and query inventory.

Official basis: [GitHub default setup](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/configure-code-scanning/configure-code-scanning)
recommends starting with the native configuration for eligible public repositories;
[CodeQL Action](https://github.com/github/codeql-action) documents separate analysis
and result upload. Neither resource supplies missing repository permissions.

## ESLint initial measurement and classification

Node 22.22.0 meets ESLint 10.13.0's ^22.13 runtime requirement. Exact dev pins:
eslint 10.13.0, @eslint/js 10.0.1, globals 17.13.0; flat CommonJS configuration
keeps the existing technology/module contract. A locked YAML parser is added for
workflow configuration tests. There are no production dependencies.

Initial recommended scan BEFORE changes measures **74 diagnostics**:
52 no-unused-vars, nine no-undef, eight no-empty, three no-control-regex,
one preserve-caught-error and one getter-return. No implementation is rewritten.
All initial file/line/message records are preserved in eslint-initial.json.

- Nine no-undef findings concern deliberate browser globals IL1_BROWSER_RESULT
  and IL1_BOOTSTRAP. Declare these two read-only only for browser-entry.js, plus
  browser globals only in that fixture. No undefined-variable rule is disabled.
- 52 unused symbols are historical unused imports/destructuring/caught `_` values.
  They are maintenance debt or deliberate sanitized-error parameters; no new
  exploitable behavior is demonstrated. Keep them visible at warning level.
- Eight empty catches are existing parse-failure, retry or cleanup probes; inspect
  their owning negative/timeout tests rather than treating every empty block as
  harmless. Keep warnings only on the six affected files. Owning follow-up should
  clarify each catch with its actual failure semantics, not blanket suppression.
- Three control-regex findings are FALSE_POSITIVE proposals: security validators
  intentionally reject NUL/control characters. Retain those warnings in the two
  owning files; do not remove the rejection or disable the rule elsewhere.
- preserve-caught-error in the service test deliberately sanitizes child-command
  failure output. Chaining raw stderr/cause could disclose test credentials. Keep
  the one-file warning; source/source-error exposure requires its own review.
- getter-return in the accessor-rejection unit fixture deliberately verifies that
  the getter is not invoked by plain-tree validation. The single-file warning is
  a contextual FALSE_POSITIVE proposal, not a production getter correction.

The contextual scan has **zero errors and 65 visible warnings**. Recommended
correctness rules remain errors generally. A checked, line-specific baseline
retains every warning; npm run lint prints all of them and fails on ANY new,
moved or duplicate diagnostic, or any error even if inserted into the baseline.
Deletion of a finding is allowed. No inline suppression or global file exclusion
is accepted. No automatic baseline-regeneration command is supplied. Baseline
updates require reviewed attribution and cannot waive a new security defect.
The 65 are not called fixed, nor inflated into test counts. No broad style rule,
locale sort change or sequential-polling rewrite is introduced.

## Planned independently controlled CI

The repository workflow separates unit, overlapping contract subset, ESLint,
dependency audits and package checks. Docker/Chromium/LAN suites stay explicit
qualified-host checks. The Actions workflow has contents:read only, pinned
checkout/setup-node SHAs, fixed Node 22.22.0, no persisted Git credential, no
production secret, deployment, publication or write token. Fork PRs run their
merge checkout under read-only permissions; no pull_request_target is used.
Dependabot YAML covers root npm, the separate application fixture and Actions,
weekly with limited PR counts; no automerge. It takes effect on the default branch
after owner-controlled integration, not merely by existing on this feature branch.

## Completion note — authorized result checks

The native Advanced Security result check is a separate accessible surface from
the 403-denied Security REST inventory. It exposed three medium
js/bad-code-sanitization diagnostics even while analysis/conclusion were green.
Those were actually corrected by a fixed remote program + stdin data, unit
regressed and requalified in the real LAN/application run. The new result check
reports no new PR-code alerts. This resolves the initial PR-result visibility
blocker without granting permissions or claiming full repository inventory access.
Current status and exact source/check IDs are in the qualification report. The
full Security inventory/admin limits and external Sonar cleanup remain explicit.
YAML validation uses exact dev dependency yaml 2.9.1.
