# IL-5.14-C1-L1 hosted security qualification stop

**Current status: BLOCKED_SECURITY.** All mandatory local L1 gates pass and the canonical correction PR is open, but hosted SonarCloud fails. CANONICAL_FIX_READY_FOR_REVIEW is not the current decision. No scanner setting, issue disposition, source correction, assertion or policy is changed after this failure. The PR is preserved for review; no merge, publication, tag or deployment occurs.

PR: https://github.com/drumee/infra-layer/pull/20, target main. Initial delivery head 9ed26cb3aaf1b98a1aafc34f3b5d077ca7b51f5f; documentation-only subsequent head e0beb70c65a103dce74b636601f777646c12829f. Hosted readback for e0beb70 reports all five Quality jobs (unit, contracts, eslint, dependencies, packaging) SUCCESS and CodeQL actions/javascript-typescript/python plus the combined CodeQL check SUCCESS. SonarCloud Code Analysis is FAILURE. No result is inferred from local execution. [Exact current-head readback](evidence/IL-5.14-C1-L1/hosted/current-head-checks.json).

The first hosted failure was detected while recording PR delivery. Its raw receipt is preserved, even though the accompanying automated delivery text still described checks as pending. This report and the current decision supersede that pending/ready text; the historical receipt is not rewritten.

## Failed quality gate

Official SonarCloud API project_status is ERROR, ignoredConditions=false:

| Condition | Actual | Required | Result |
|---|---:|---:|---|
| New reliability rating | 3 / C | 1 / A | FAIL |
| New security rating | 4 / D | 1 / A | FAIL |
| New maintainability rating | 1 / A | 1 / A | PASS |
| New duplicated line density | 1.8% | at most 3% | PASS |
| New security hotspots reviewed | 100% | 100% | PASS |

[Complete quality gate JSON](evidence/IL-5.14-C1-L1/hosted/quality-gate.json), [SonarCloud PR dashboard](https://sonarcloud.io/dashboard?id=drumee_infra-layer&pullRequest=20).

The unresolved issue response contains 57 findings: 51 CODE_SMELL, 4 BUG and 2 VULNERABILITY. Severities: 37 MINOR, 17 MAJOR, 3 CRITICAL. These are scanner classifications, not 57 demonstrated vulnerabilities or npm audit findings. No exploitability determination or false-positive acceptance has been performed. [Full issue records and flows](evidence/IL-5.14-C1-L1/hosted/issues.json), [50 GitHub annotations](evidence/IL-5.14-C1-L1/hosted/sonar-annotations.json).

Blocking security findings are both at test/network-attachments/load.cjs:15:

- javascript:S1523, CRITICAL VULNERABILITY, issue AaF3kH4s1yc4XiDUvCPU: review safe dynamic code execution.
- jssecurity:S8704, MAJOR VULNERABILITY, issue AaF3kH4s1yc4XiDUvCPV: scanner reports code injection from CLI-controlled input.

The loader evaluates its source argument with vm.runInNewContext and supplies process plus a custom require. It is used for actual-source fixture tests, including historical source reproduction. That test purpose alone does not establish a sufficient trust boundary or justify suppressing a security finding. The input flow and intended test-only restrictions require a focused security assessment/correction before this gate can be cleared. No canonical production vulnerability is asserted without that assessment.

Reliability findings use javascript:S9383 for the top-level Promise from diagnostic.run at container-health.cjs:6, diagnostics/fixture.cjs:12 and15, and real-docker.cjs:32. Existing passing outcome-propagation tests remain valid evidence, but do not turn the hosted findings into PASS. The remaining critical-severity code-smell entries concern cognitive complexity in qualification-diagnostic.cjs:37 and lifecycle/docker.js:84; they are not additional critical vulnerability entries.

## Stop and next prerequisite

Stop further qualification and preserve PR #20. Resolve or explicitly assess the identified security and reliability findings under the unchanged mandatory gate policy, preserving actual-source regressions, assertions, trusted tools, error status and network ownership. Requalify every affected executable change and rerun the hosted gate. No blanket suppression, scanner exclusion, automatic false-positive relabeling or policy exception is authorized here.

Local results remain: lint0 new findings/28 visible historical warnings, unit207, contracts24, complete real Docker2 cycles, integration17+17+16+4 scenarios, application87 assertions, security12+4+25, package/consumer/types PASS, npm audits0 findings. H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED and SMTP_RECOVERY_UNQUALIFIED remain. The published alpha.3 artifact and downstream repositories are unchanged.
