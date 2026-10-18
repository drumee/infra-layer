# IL-5.8 SonarCloud inventory

Initial source: `de4b34e99370bf3b9f0d17399db4b2ea3d107677`, existing
`feat/il5-external-gateway`, PR #2. The separately cloned working tree was clean;
original sibling Infra main remains at alpha.2. Debian's pre-existing changelog
edits and untracked AGENTS.md are preserved; Debian, Runtime and Oxy-form are
read-only in this mission. No repository AGENTS file exists in this Infra branch.

The fresh public API snapshot on 2026-10-18 matches all 26 issue IDs from IL-5.7,
with no additions: 21 tests, five shipped; seven VULNERABILITY, three CRITICAL,
seven MAJOR, sixteen MINOR. All are OPEN. Initial quality gate is ERROR,
Security D and Reliability D. This is an issue inventory, not issue acceptance.

Evidence: [issues](evidence/IL-5.8/initial-issues.json),
[gate](evidence/IL-5.8/initial-gate.json),
[rule metadata](evidence/IL-5.8/rules/). The public `api/rules/show` endpoint requires
`organization=drumee`; it returns names, categories, severity, parameters and
security standards, but no description sections for this session. No unavailable
recommendation is invented. Rule messages below are the actual API findings.
Primary SonarSource RSPEC descriptions, when retrievable, are retained separately
with URL/status in `rules/sources.json`.

Reproduce read-only with `api/issues/search?componentKeys=drumee_infra-layer&pullRequest=2&ps=500`,
`api/qualitygates/project_status?projectKey=drumee_infra-layer&pullRequest=2`, and
`api/rules/show?key=RULE&organization=drumee` at https://sonarcloud.io.
The initial GitHub Sonar check is 117199059647, analyzed 2026-10-16 on de4b34e.

| Issue ID | Rule | Severity / category | Initial file:line | Scope | Actual message | Potential risk / treatment |
| --- | --- | --- | --- | --- | --- | --- |
| `AaFGkAAM7h-_7ZHL5nV7` | `javascript:S7723` | MINOR / CODE_SMELL | `test/application/package-consumer.js:9` | test | Use `new Error()` instead of `Error()`. | Constructor style inconsistency; no exploit demonstrated. FIX_COMPLETED; see individual disposition. |
| `AaFGkAHd7h-_7ZHL5nWA` | `javascript:S3776` | CRITICAL / CODE_SMELL | `lifecycle/composition.js:57` | shipped | Refactor this function to reduce its Cognitive Complexity from 39 to the 15 allowed. | Dense supplied-service validation made ordering/security review difficult. FIX_COMPLETED; see individual disposition. |
| `AaFGj__s7h-_7ZHL5nVp` | `docker:S8431` | MAJOR / CODE_SMELL | `test/application/Dockerfile:1` | test | Use either the version tag or the digest for the image instead of both. | Digest remains authoritative; descriptive Node tag is provenance, not a floating acquisition. FALSE_POSITIVE; see individual disposition. |
| `AaFGj___7h-_7ZHL5nVu` | `javascript:S7723` | MINOR / CODE_SMELL | `test/application/build.js:5` | test | Use `new Error()` instead of `Error()`. | Constructor style inconsistency; no exploit demonstrated. FIX_COMPLETED; see individual disposition. |
| `AaFGj___7h-_7ZHL5nVv` | `javascript:S4036` | MINOR / VULNERABILITY | `test/application/build.js:10` | test | Make sure the "PATH" variable only contains fixed, unwriteable directories. | Inherited PATH could select attacker code with developer/Docker rights. FIX_COMPLETED; see individual disposition. |
| `AaFGj___7h-_7ZHL5nVw` | `javascript:S4036` | MINOR / VULNERABILITY | `test/application/build.js:11` | test | Make sure the "PATH" variable only contains fixed, unwriteable directories. | Inherited PATH could select attacker code with developer/Docker rights. FIX_COMPLETED; see individual disposition. |
| `AaFGj___7h-_7ZHL5nVx` | `javascript:S4036` | MINOR / VULNERABILITY | `test/application/build.js:12` | test | Make sure the "PATH" variable only contains fixed, unwriteable directories. | Inherited PATH could select attacker code with developer/Docker rights. FIX_COMPLETED; see individual disposition. |
| `AaFGkAAR7h-_7ZHL5nV8` | `javascript:S7723` | MINOR / CODE_SMELL | `test/application/host.js:4` | test | Use `new Error()` instead of `Error()`. | Constructor style inconsistency; no exploit demonstrated. FIX_COMPLETED; see individual disposition. |
| `AaFGj__y7h-_7ZHL5nVr` | `jssecurity:S8707` | MAJOR / VULNERABILITY | `test/application/interrupt.js:5` | test | Path Traversal via faulty LLM-supplied CLI arguments | Arbitrary CLI read before canonical activation could consume external metadata. FIX_COMPLETED; see individual disposition. |
| `AaFGj__y7h-_7ZHL5nVq` | `javascript:S2681` | MAJOR / CODE_SMELL | `test/application/interrupt.js:6` | test | This statement will not be executed conditionally; only the first statement will be. The rest will execute unconditionally. | Compact control flow increased callback/return misreading risk. FIX_COMPLETED; see individual disposition. |
| `AaFGj__57h-_7ZHL5nVs` | `javascript:S5332` | MINOR / VULNERABILITY | `test/application/plugins/qualification/worker.js:11` | test | Using http protocol is insecure. Use https instead. | Actual protocol is SMTP with mandatory verified STARTTLS; the HTTP label is inapplicable. FALSE_POSITIVE; see individual disposition. |
| `AaFGj__57h-_7ZHL5nVt` | `javascript:S7723` | MINOR / CODE_SMELL | `test/application/plugins/qualification/worker.js:15` | test | Use `new Error()` instead of `Error()`. | Constructor style inconsistency; no exploit demonstrated. FIX_COMPLETED; see individual disposition. |
| `AaFGkAAG7h-_7ZHL5nVy` | `javascript:S1788` | MAJOR / CODE_SMELL | `test/application/run.js:10` | test | Move this default parameter last, so callers can omit it instead of passing "undefined". | Default before TLS argument made fixture calling convention unclear. FIX_COMPLETED; see individual disposition. |
| `AaFGkAAG7h-_7ZHL5nV0` | `javascript:S7780` | MINOR / CODE_SMELL | `test/application/run.js:40` | test | `String.raw` should be used to avoid escaping `\`. | Literal quote escaping is intentional POSIX SSH-program quoting, with validated data. FALSE_POSITIVE; see individual disposition. |
| `AaFGkAAG7h-_7ZHL5nV1` | `javascript:S7723` | MINOR / CODE_SMELL | `test/application/run.js:40` | test | Use `new Error()` instead of `Error()`. | Constructor style inconsistency; no exploit demonstrated. FIX_COMPLETED; see individual disposition. |
| `AaFGkAAG7h-_7ZHL5nVz` | `javascript:S4036` | MINOR / VULNERABILITY | `test/application/run.js:40` | test | Make sure the "PATH" variable only contains fixed, unwriteable directories. | Inherited PATH could select attacker code with developer/Docker rights. FIX_COMPLETED; see individual disposition. |
| `AaFGkAAG7h-_7ZHL5nV2` | `javascript:S7723` | MINOR / CODE_SMELL | `test/application/run.js:45` | test | Use `new Error()` instead of `Error()`. | Constructor style inconsistency; no exploit demonstrated. FIX_COMPLETED; see individual disposition. |
| `AaFGkAAG7h-_7ZHL5nV3` | `javascript:S2486` | MINOR / CODE_SMELL | `test/application/run.js:67` | test | Handle this exception, don't catch it at all, or explain in a comment why it is ignored. | Catch-all retry hid unexpected certificate/protocol failures until timeout. FIX_COMPLETED; see individual disposition. |
| `AaFGkAAG7h-_7ZHL5nV4` | `javascript:S9382` | MINOR / CODE_SMELL | `test/application/run.js:67` | test | Unexpected `await` inside a loop. | Bounded sequential polling must observe later startup rather than simultaneous attempts. FALSE_POSITIVE; see individual disposition. |
| `AaFGkAAG7h-_7ZHL5nV5` | `javascript:S2259` | MAJOR / BUG | `test/application/run.js:71` | test | TypeError can be thrown as "initial" might be null or undefined here. | The analyzer could not prove async preparation completed before initial snapshot use. FIX_COMPLETED; see individual disposition. |
| `AaFGkAAG7h-_7ZHL5nV6` | `javascript:S6582` | MINOR / CODE_SMELL | `test/application/run.js:113` | test | Prefer using an optional chain expression instead, as it's more concise and easier to read. | Redundant cleanup condition obscured nullable process state. FIX_COMPLETED; see individual disposition. |
| `AaFGj_9q7h-_7ZHL5nVo` | `javascript:S7778` | MINOR / CODE_SMELL | `lib/plan-v2.js:73` | shipped | Merge these Array#push() calls into a single call with multiple arguments. | Adjacent appends obscure one ordered reference inventory. FIX_COMPLETED; see individual disposition. |
| `AaFGkAHd7h-_7ZHL5nWB` | `javascript:S3358` | MAJOR / CODE_SMELL | `lifecycle/composition.js:86` | shipped | Extract this nested ternary operation into an independent statement. | Nested role selection obscured initialization precedence. FIX_COMPLETED; see individual disposition. |
| `AaFGkACL7h-_7ZHL5nV-` | `javascript:S2871` | CRITICAL / BUG | `lifecycle/external-gateway.js:15` | shipped | Provide a compare function that depends on "String.localeCompare", to reliably sort elements alphabetically. | Implicit ordering obscured canonical schema-key intent; locale ordering would be wrong here. FIX_COMPLETED; see individual disposition. |
| `AaFGkACL7h-_7ZHL5nV_` | `javascript:S2681` | MAJOR / CODE_SMELL | `lifecycle/external-gateway.js:28` | shipped | This statement will not be executed conditionally; only the first statement will be. The rest will execute unconditionally. | Compact control flow increased callback/return misreading risk. FIX_COMPLETED; see individual disposition. |
| `AaFGkAAX7h-_7ZHL5nV9` | `javascript:S5443` | CRITICAL / VULNERABILITY | `test/support/application-inputs.js:4` | test | Make sure publicly writable directories are used safely here. | Unused pure-fixture argument never allocated a file; predictable temporary allocation was not present. FALSE_POSITIVE; see individual disposition. |

Each risk assessment, behavioral proof and final analysis mapping is recorded in
[security review](IL-5.8-security-review.md) and
[disposition](IL-5.8-sonar-disposition.md). Sonar issue states will not be changed
by this mission; contextual classifications remain owner-review proposals.
