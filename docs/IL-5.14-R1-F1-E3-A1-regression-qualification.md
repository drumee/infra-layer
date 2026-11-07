# A1 regression qualification — stopped by independent MAJOR

At source8bf02d5407ee9dbb06c4c7f86d04d3fc533ac4d7, the implementer's tests passed: focused guard22, original preservation case1, full diagnostic17, full unit267, contracts24; no failed/skipped mandatory cases. These are actual executions, not proof that guard coverage is complete. Independent A1-IR-001 falsifies the guard's required semantic-context guarantee despite those green tests.

Other completed commands: ESLint0 errors/0 new findings/28 historical warnings; development/production/private application audits0 findings; package audit42 members and smoke PASS; trusted-tool12 scenarios; filesystem25 tests; installed security consumer4 scenarios; strict NodeNext packed consumer8 preparation assertions plus37 refusal assertions. Exact commands, timestamps, exit statuses and log hashes are retained in the evidence ledger.

The already-started integration aggregate completed gateway17 and services17 before the independent stop. Its parent was suspended to prevent the next suite from launching while the current lifecycle child completes owned cleanup. Aggregation is not a complete PASS; final control/cleanup readback records its disposition. No application acceptance or new hosted check was launched after the finding.

No production/test source correction, retry or additional qualification was attempted after independent notification. Historical F1/E1/E2/E3 outcomes remain preserved. E2 real Docker21/42/15 is reused only after unchanged-source hash verification, not claimed as a new A1 run.


## Controlled integration interruption and cleanup

Independent stop occurred while lifecycle tests were already running. The aggregate parent was suspended to prevent the next lifecycle-gateway suite. SIGTERM to the active test did not finish termination, so the owned test/command descendants were frozen and terminated; the owning lifecycle runner remained alive and executed its catch/finally. Log confirms `IL3 cleanup confirmed: drumee-il3-test-1240415f`. The aggregate was then terminated before any next suite. Recorded integration exit143 is deliberate cancellation, not a measured runtime regression. No aggregate PASS is claimed. Signal actions/reasons are in independent-stop-control.json; final-cleanup-readback.json confirms all4 started fixture namespaces have no containers/networks/images.

The separate real application acceptance and lifecycle-gateway suite are NOT_EXECUTED. Gateway17 and services17 completed before cancellation; lifecycle suite has no successful final qualification result. All raw output is retained, including cancellation errors; no command failure was converted to success.
