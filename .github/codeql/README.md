# Native CodeQL contract

This repository uses GitHub **default setup**, workflow
`dynamic/github-code-scanning/codeql` (388429010), discovered active during
IL-5.9-A. Do not add an advanced workflow alongside it or disable default setup
without an owner-approved migration. The setting is hosted by GitHub, not by this
file. Observed analysis/upload evidence is in docs/IL-5.9-A-qualification.md.

Language: javascript-typescript; automatic source extraction, no application
build/activation required. No repository test exclusion is configured here:
lib, lifecycle, capabilities, adapters, tests and qualification/tooling scripts
must remain in the default JavaScript analysis scope; generated node_modules is
not owning source. GitHub's managed configuration/versions can change; record
CLI/action/query-pack versions per qualification rather than treating this note
as a pinned scanner. Default setup supplies PR/default/protected-branch scans and
its own periodic schedule; confirm actual PR checks after pushes.

Main observation: CLI 2.27.2, javascript-queries 2.4.7, 89 executed queries.
The retained query inventory includes command/argument injection, path traversal,
unsafe input, credential/plaintext/transport patterns and network request abuse.
Static models do not prove file ownership, RPC/ACL policy, Docker loopback
publication, correct SMTP STARTTLS, recovery or absence of sensitive log data.
Those remain canonical unit and real integration acceptance obligations.

The fine-grained CLI token cannot read the native setup configuration or Code
Scanning alerts/analyses (HTTP 403). Successful analysis and processed SARIF
upload are observable through Actions; they are distinct from reading the full
Security alert inventory or changing alert state. Owner must verify the configured
query suite and alert inventory with authorized Security access. Do not infer
zero alerts from the successful job or the absence of check annotations.

Official references:
- https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/configure-code-scanning/configure-code-scanning
- https://github.com/github/codeql-action
- https://codeql.github.com/codeql-query-help/javascript/

The authorized Checks API also exposes the separate Advanced Security result
check. In this qualification it surfaced three medium alerts despite a successful
job/conclusion. Those were corrected and the new result check has no new PR-code
alerts. Always inspect its title/annotations, not just conclusion; this PR-scoped
surface is distinct from full Security inventory and state administration.
