# IL-5.14-C1 final decision

**BLOCKED_SECURITY. CANONICAL_FIX_READY_FOR_REVIEW is not reached.** The original network attachment defect is deterministically reproduced, but the repository's mandatory development-dependency audit exits1 before any production correction. The mission requires stopping on a mandatory security-check failure. No security exception, scanner change, dependency workaround or subsequent integration run is introduced.

## Source, reproduction and scope

The clean canonical checkout and fetched integration target origin/main are c218811effc83da25cf71a914e27accc96101329. Dedicated branch: fix/il514-c1-network-attachment-identity. Reproduction/evidence commit:3da56c9. Subsequent commits contain documentation/evidence only. Runtime environment:UID/GID 1000:1000, Node 22.22.0/npm 11.18.0. [Baseline](evidence/IL-5.14-C1/baseline.json), [command results, fixture hashes and evidence timestamps](evidence/IL-5.14-C1/execution.json).

The current and historical canonical lifecycle/docker.js SHA256 is c2e56482823bb6f69754ebd48fa4cdc609c609f0db58e6537bf9ef6b3e86d445. Its checkNetworks function blindly treats every network attachment key as a container identity. The fixture contains one container-backed and one sandbox-less endpoint attachment with realistic endpoint metadata derived from the pinned Moby producer. The original implementation attempts the invalid endpoint-key inspection and propagates the simulated Docker status 1 as DOCKER_LIFECYCLE_COMMAND_FAILED. This is an original-defect reproduction, not a successful fix or real lifecycle qualification.

## Mandatory security failure

The unmodified .github/workflows/quality.yml dependencies job runs both `npm audit --omit=dev` and `npm audit --include=dev`, with no severity reduction or allowed failure. This mission ran the latter with JSON output and the explicit official registry:

```sh
npm audit --include=dev --json --registry=https://registry.npmjs.org
```

Exit1; 2 moderate package entries, 0 high, 0 critical. Installed nodemailer 10.1.1 is affected by **three distinct advisories**; smtp-server 3.19.22 contributes the propagated dependency entry rather than a fourth underlying advisory. Both are direct development dependencies; the package has no declared production dependencies. [Complete original machine report](evidence/IL-5.14-C1/baseline-audit.json).

| Advisory | Severity and affected range | Finding |
|---|---|---|
| [GHSA-8c8m-p3m8-cjg8](https://github.com/advisories/GHSA-8c8m-p3m8-cjg8) |Moderate, CVSS 6.5; nodemailer>=3.0.0 <10.1.4 |Nested address comments can alter interpreted recipients |
| [GHSA-m943-m63m-w62w](https://github.com/advisories/GHSA-m943-m63m-w62w) |Moderate, CVSS 6.5; same range |A quoted/comment semicolon can alter address-group parsing |
| [GHSA-85x2-q946-cp5h](https://github.com/advisories/GHSA-85x2-q946-cp5h) |Moderate, CVSS 6.5; same range |An angle bracket inside a quoted local part can alter recipient interpretation |

Official advisory metadata reviewed 2026-10-25 identifies nodemailer 10.1.4 as patched. The raw npm report suggests smtp-server 3.21.1 as a resolution option. Neither is installed or qualified here; updating only a direct pin without checking the consuming graph would not demonstrate remediation. No audit fix --force, override, suppression or threshold change is used. The moderate severity and development scope are stated accurately; the blocker is failure of the existing mandatory CI policy, not an invented high/critical production exposure.

## Qualification matrix

| Gate | Status | Source, command, exit/count and evidence |
|---|---|---|
| A canonical baseline |PASS |Source c218811; current/default/integration main verified; function, callers, exports, declarations, security and actual suite commands inspected. [Baseline](IL-5.14-C1-source-baseline.md) |
| B original defect |PASS |Historical source c218811 plus hashed fixture;`node test/network-attachments/reproduce-alpha3.cjs`, exit 0, two assertions, controlled Docker status 1 expected. [Machine result](evidence/IL-5.14-C1/original-reproduction.json) |
| C corrective identity semantics |NOT_EXECUTED to qualification |Required distinctions documented, but no semantics selected/qualified after stop. [Contract disposition](IL-5.14-C1-network-identity-contract.md) |
| D implementation |NOT_EXECUTED |Production files, public API, exports, declarations and dependency locks unchanged |
| E focused corrective regressions |NOT_EXECUTED |All 12 categories remain required; original reproduction is not corrective coverage. [Disposition](IL-5.14-C1-regression-tests.md) |
| F real Docker lifecycle |NOT_EXECUTED |No resource creation, Redis/restart/detachment/cleanup or repeated lifecycle execution |
| G relevant Infra suites |NOT_EXECUTED |No full npm test/contracts/integration/application/security/lint suite after the mandatory failure |
| H package candidate |NOT_EXECUTED |No pack, consumer check, version selection, publication or tag. [Disposition](IL-5.14-C1-package-candidate.md) |
| I security/local CI |FAIL |`npm audit --include=dev --json --registry=https://registry.npmjs.org`, exit 1; 2 moderate package entries / 3 advisories, 0 high/critical; remaining checks NOT_EXECUTED |
| J final review decision |BLOCKED |This blocked report does not qualify an unimplemented correction or authorize a PR |
| Hosted CI |NOT_EXECUTED |No push/PR; no hosted result or PASS claim |

`npm ci --ignore-scripts --no-audit --no-fund` exits0 before the audit. The explicit installation flag does not disable the security gate:the separate canonical audit was executed and its failure preserved. No repeated audit is used to hide the result. Output-file UTC mtimes are retained as evidence timestamps; command start times are not fabricated.

## Immutable artifact and downstream reservation

Published **@drumee/infra-layer@0.1.0-alpha.3** remains immutable:source c218811effc83da25cf71a914e27accc96101329, 41 members, 101778 compressed bytes, SHA256 `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`, SRI `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`. No archive was overwritten and no new package candidate or production dependency was introduced.

Debian was not modified. Its H3 campaign remains permanently failed:run1 six paths/556 assertions PASS, run2 real invalid-object Docker inspection FAIL, runs3–5 NOT_EXECUTED. H2's diagnostic success is historical and is not a fix. **H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED** remains; this reproduction does not establish H1's lost underlying command. SMTP_RECOVERY_UNQUALIFIED remains a downstream limitation.

No Server Runtime, Oxy-form, foreign Docker resource, protected Docker configuration, ownership assertion, trusted executable rule or production host is modified. No source correction, PR, push, merge, npm/image publication, tag or deployment occurs.

Required continuation:resolve the failed development graph under the existing audit policy and qualify its compatibility, then resume the canonical network identity correction from the preserved reproduction. Real Docker/lifecycle, full regression, package/API/type/consumer and security qualification remain mandatory before any review-ready status. A corrected published artifact and Debian realignment/requalification require their separate later decisions; this mission does not start Debian H4.
