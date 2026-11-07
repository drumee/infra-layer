# IL-5.14-C1-S2 hosted qualification

Gate G: **PASS for exact head 9564b527362ce2d7bbc6b6618ae9915053c4db39**. Captured 2026-10-26T14:49:25.723891+00:00. The GitHub check-run head and SonarCloud PR20 commit.sha both match this SHA. No local result or main-branch analysis is substituted. The actual Sonar PR analysis date is 2026-10-26T14:47:56+0000; PR analysis identity is ff1ead0c-682d-479f-a582-62edd8c1bd95.

| Actual hosted check | Result | Evidence URL |
|---|---|---|
| unit | PASS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40343014747/job/121642440102) |
| contracts | PASS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40343014747/job/121642439867) |
| eslint | PASS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40343014747/job/121642439941) |
| dependencies | PASS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40343014747/job/121642440209) |
| packaging | PASS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40343014747/job/121642439450) |
| Analyze (actions) | PASS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40343006050/job/121642420340) |
| Analyze (javascript-typescript) | PASS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40343006050/job/121642420617) |
| Analyze (python) | PASS | [actual check](https://github.com/drumee/infra-layer/actions/runs/40343006050/job/121642420029) |
| CodeQL | PASS | [actual check](https://github.com/drumee/infra-layer/runs/121642708715) |
| SonarCloud Code Analysis | PASS | [actual check](https://sonarcloud.io/dashboard?id=drumee_infra-layer&pullRequest=20) |

All five Quality jobs and every CodeQL analysis/combined check succeed. SonarCloud Code Analysis succeeds. [Complete raw snapshot](evidence/IL-5.14-C1-S2/hosted/9564b527362ce2d7bbc6b6618ae9915053c4db39-20261026T144927412250.json), [Quality Gate](https://sonarcloud.io/dashboard?id=drumee_infra-layer&pullRequest=20).

| Unchanged Sonar condition | Actual | Required | Result |
|---|---|---|---|
| New security rating | A /1 | A /1 | PASS |
| New reliability rating | A /1 | A /1 | PASS |
| New maintainability rating | A /1 | A /1 | PASS |
| New duplicated lines | 0.6% | at most3% | PASS |
| New hotspots reviewed | 100% |100% | PASS |

API projectStatus=OK, ignoredConditions=false. PR20 status reports0 bugs,0 vulnerabilities and49 code smells. Remaining code smells are not relabeled as vulnerabilities or silently suppressed; maintainability and every required condition pass under the original gate.

All six original issue IDs are explicitly CLOSED/FIXED by hosted analysis: AaF3kH4s1yc4XiDUvCPU (S1523), AaF3kH4s1yc4XiDUvCPV (S8704), AaF3kH4s1yc4XiDUvCPT, AaF3kH4t1yc4XiDUvCPY, AaF3kH4t1yc4XiDUvCPZ and AaF3kH4q1yc4XiDUvCPB (S9383). A separate unresolved-rule search returns total0. No issue-transition, false-positive, accepted-risk or gate-configuration API was called. The sink was removed, the actual-source test boundary replaced and Promise ownership corrected; this is not a line-movement inference.

## Final-head consistency

Executable/package source remains f54a6ea3c1d170ee543ef98a890b38f0dd449a55. This necessary final evidence/report update is documentation-only and distinct from verified head 9564b527362ce2d7bbc6b6618ae9915053c4db39. Its new exact head must pass all mandatory hosted checks again before final confirmation. The final PR description and final-head readback record that SHA and actual URLs; no subsequent commit is permitted without another verification. The first-head PASS above is not a claim about an untested later head.

Until that recheck completes, the new documentation head is PENDING_HOSTED_CI. The final decision CANONICAL_FIX_READY_FOR_REVIEW becomes effective only after the exact current PR head passes. Original L1 failures are preserved and not rewritten. No merge, publication, tag, deployment, scanner weakening or downstream change occurred. SMTP_RECOVERY_UNQUALIFIED and H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED remain.
