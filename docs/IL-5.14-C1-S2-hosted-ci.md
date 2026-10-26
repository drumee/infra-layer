# IL-5.14-C1-S2 hosted qualification protocol and current state

Current status: PENDING_HOSTED_CI. All mandatory local checks pass at executable source f54a6ea3c1d170ee543ef98a890b38f0dd449a55. No new hosted PASS is claimed before the corrected branch is pushed and its exact head is analyzed. Existing PR20 remains open against main; no replacement PR is created.

The source is frozen. Evidence/report-only commits may follow. Each pushed head must be verified independently: all five Quality jobs, CodeQL actions/javascript-typescript/python and combined status, and SonarCloud Code Analysis must succeed for that head. The SonarCloud project_pull_requests API must identify PR20 and the same commit SHA before its quality-gate response is accepted. The main-branch project_analyses response does not identify PR analysis and is not used as proof.

Required actual gate conditions: security rating1/A, reliability1/A, maintainability/duplication/hotspot conditions OK, projectStatus OK and ignoredConditions=false. Query the original6 issue IDs and unresolved S1523/S8704/S9383 rules; no transition/dismissal/false-positive/risk-acceptance API is invoked. Sink removal, fixed trusted module loading, non-executing pinned historical proof and explicit Promise ownership must be reflected in the hosted result rather than inferred from moved lines.

On a required failure, preserve the exact-head raw response and stop without a retry, scanner change or qualification claim. Pending checks stay PENDING_HOSTED_CI. After the first successful hosted result, add only the necessary final report/evidence if needed, distinguish that earlier head, and recheck the resulting documentation-only head. No further commit follows the final successful verification; the final PR description and local final-head readback record its exact SHA and URLs.

Historical L1 failure remains in its original reports. No publication, merge, tag, deployment, downstream change or global protection modification is authorized. SMTP_RECOVERY_UNQUALIFIED and H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED remain.
