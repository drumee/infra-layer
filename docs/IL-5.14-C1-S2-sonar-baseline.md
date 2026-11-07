# IL-5.14-C1-S2 SonarCloud baseline

Gate A: PASS. Clean checkout and open non-draft PR20 both identify branch fix/il514-c1-network-attachment-identity at5852b1b0361cb6b2a50ae4722011971d279f98e3, base main. Node22.22.0/npm11.18.0. Current hosted Quality/CodeQL pass while SonarCloud fails security D/reliability C. Original L1 evidence is untouched; current issue/flow and quality-gate responses are preserved separately.

| Issue | Rule/category/severity | Actual source and path |
|---|---|---|
| AaF3kH4s1yc4XiDUvCPU | javascript:S1523 / VULNERABILITY / CRITICAL | test/network-attachments/load.cjs:15, load(execute,source) → vm.runInNewContext(source,context) |
| AaF3kH4s1yc4XiDUvCPV | jssecurity:S8704 / VULNERABILITY / MAJOR | Same sink; scanner flow labels its single location as LLM/CLI-supplied input |
| AaF3kH4s1yc4XiDUvCPT | javascript:S9383 / BUG / MAJOR | container-health.cjs:6, unowned returned diagnostic.run Promise |
| AaF3kH4t1yc4XiDUvCPY | javascript:S9383 / BUG / MAJOR | test/diagnostics/fixture.cjs:12, passthrough branch |
| AaF3kH4t1yc4XiDUvCPZ | javascript:S9383 / BUG / MAJOR | test/diagnostics/fixture.cjs:15, other controlled branches |
| AaF3kH4q1yc4XiDUvCPB | javascript:S9383 / BUG / MAJOR | real-docker.cjs:32, main async scenario |

The user mission's longer diagnostics path differs from the actual repository path test/diagnostics/fixture.cjs; the issue JSON and actual file establish the locations above. The scanner does not provide a demonstrated end-to-end CLI trace beyond the single sink annotation. Current callers use a fixed current-file read or fixed git-show source, but the loader accepts arbitrary source strings and gives evaluated code process, custom require, Buffer and console. No exploitability or false-positive decision is inferred from test-only placement. The unsafe generic boundary is removed rather than suppressed.

The current network suite has a second VM evaluation to append an export for the private networksReady helper. Both evaluation paths must be removed. The network loader substitutes only child_process.execFileSync, performance and Atomics; current Docker validation does not need the latter two. The private readiness tests require a controllable monotonic clock and scheduler to preserve deadline/retry assertions. Historical reproduction evaluates alpha.3 source from c218811effc83da25cf71a914e27accc96101329 without validating its bytes; the source SHA256 is c2e56482823bb6f69754ebd48fa4cdc609c609f0db58e6537bf9ef6b3e86d445 and the fixed attachment fixture SHA256 is c7313101fa16e8027b6b880585316fadf51a41f29915a49e0b67b68e9179baa0.

The existing diagnostic.run catches task failures, captures/logs diagnostics and sets exitCode1, then resolves its Promise. Callers do not own that Promise; exceptions outside the catch (including trace close) can reject without an explicit terminal owner. Existing child tests establish many failure outcomes, but do not supply this missing ownership contract. The correction must reject the original failure and give each entry point an explicit terminal handler, after cleanup.

Two critical-severity cognitive-complexity findings are CODE_SMELL, not additional vulnerabilities. Maintainability A already passes; no unrelated lifecycle complexity refactor is planned. The full baseline contains57 issues (2 vulnerabilities,4 bugs,51 code smells). [Current issue flows](evidence/IL-5.14-C1-S2/issues-baseline.json), [original stop](IL-5.14-C1-L1-hosted-ci-stop.md).
