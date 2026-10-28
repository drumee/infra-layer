# Independent P2 review

**CHANGES_REQUESTED. Gate M FAIL.** The first P2 campaign is **DIAGNOSTIC_CAMPAIGN_INVALID**, overall exit1. The native Services child completed17/17 with exit0, but that observation must not be promoted to a valid canonical qualification. The historical Postfix HTTP cause remains **ROOT_CAUSE_UNDETERMINED**, and the historical finding is not closed.

Reviewed executable: `7b5edbd9e9731a51d558a9e11c7def2cfa6c6acb`; starting checkpoint `ee53ed9448cd89f1cc84580863600aa47d9b335e`; qualified R5 `72f4c67254561ca5c4c47a6a65e9620e57da7841`. This separately scoped reviewer inspected sources and original evidence; no independent tests, Docker operations, integration reruns, implementation edits or PR mutations were performed. Read-only commands/exits and independently computed hashes are retained beside this report.

## Material finding P2-IR-1

**MAJOR — test-only diagnostic qualification reliability, not a demonstrated production Postfix defect.** At `test/diagnostics/services-capture/docker-events.cjs:25`, the close handler accepts code0 or signal SIGTERM after controlled stopping, but rejects code143 with a null signal. Both actual Docker CLI observers terminate through that observed representation after the wrapper explicitly requests SIGTERM. The next line's SIGTERM handler establishes `stopping=true` and sends the signal to the CLI; the terminal records show no partial line.

Attempt `P2-SERVICES-9db223fe-ad0c-469a-8e5c-1b17500358b7`, project `drumee-il2-test-1f8d59c5`, records:

1. Services child exit0,17/17 assertions/tests passed.
2. Canonical owned Compose cleanup completes with exit0.
3. Both collectors record `collector.stop.requested`, then `collector.completed` with code143, signal null, stopping true and partial_line false.
4. Their close predicate sets process.exitCode1. The orchestrator observes both collector exits1 and preserves overall exit1.

This source-supported mechanism explains the **new instrumentation failure only**. It occurs after the test child exits and cannot explain the historical active GET failure. Error propagation was preserved: no nonzero process result was hidden or changed into PASS.

Required next scope: establish a narrow collector termination contract and a deterministic regression for the observed controlled code143 representation, including negative controls for unexpected143, other nonzero exits, errors and partial/truncated streams. A correction must preserve genuine observer failures and may not accept arbitrary nonzero exits just because shutdown was requested. The18 HTTP preflight controls did not cover the new collector process shutdown contract. Any later canonical run requires a separately justified fresh attempt against a frozen corrected diagnostic source; this review does not authorize or claim such a run. The current failed result must remain intact.

## Evidence and limited observations

I independently verified the original A2 raw log SHA256 `e28aa1ded3cf6a7df838c79d82a3f1e1a337f3e7ba2a1e1ea429c242992c5d3b`: case15's initial capturedCount rejects fetch failed/UND_ERR_SOCKET before intentional capture stop or SMTP submission. Exact original receiver/socket lifecycle and nested cause chain remain absent. A3 raw targeted log SHA256 `3071573f3701b9ae9a9229dd979d05ec4c0f753b8ef1e9466502233ae0f863b1` matches its3/3 non-reproduction result. P1's9/54/3 results and independent BLOCKED_EVIDENCE review remain historical; its idle UND_ERR_SOCKET after completion during intentional shutdown does not explain the original request.

P2's new architecture inventories all17 cases, their one shared worker/process/project/configuration tree and capture server, and the external shared kernel network used by the private ephemeral Redis case. The canonical file, Docker argv, expected outcomes, source order and default concurrency remain unchanged. Host capture HTTP first appears in case13; earlier cases have distinct clients but share Docker/network resources and server age. Case14 synchronously restarts DKIM before case15's initial GET. No earlier explicit capture shutdown is found. The direct capture calls await JSON; the Docker healthcheck's header-only exit uses a separate short-lived process. Source risks remain hypotheses absent a demonstrated active-request violation.

The invalid campaign's retained local traces show the following observations, without constituting a qualified campaign PASS:

- All17 case starts and completions appear in order1–17. Native TAP independently records17 passed,0 failed, child exit0.
- Nine host requests have headers, parser body completion and application JSON completion. All request-to-operation mappings are present; no fetch/request/operation failure, cross-case completion or unresolved application work appears at case, shutdown or process-exit boundaries.
- Thirty server requests, including healthchecks, have handler-return/response-finish chains. Three capture process incarnations listen and exit0 during intended stop/restart/recreation/final cleanup; no handler throw, server error or uncaught server exception appears.
- Client traces retain two idle `UND_ERR_SOCKET` events during cases15/16 intentional closure and one idle `UND_ERR_INFO`. Their active-request lists and pending application lists are empty. The initial case15 GET already completed. These are not evidence that an active request failed and cannot backfill the historical cause.
- Separate main/ephemeral daemon streams contain646/35 records including terminal observer metadata. The terminal close-status defect remains visible. Daemon nanosecond digits are retained as strings rather than converted through Number, but separate clock domains and cross-NAT attribution still limit causal inference.

The successful selected controls and absence of an observed host leak do not rule out all historical races, resource effects or system history. Observer hooks, synchronous writes and Promise continuations perturb timing; preceding Gateway/system-load history from the original aggregate command is outside this P2 Services run. No causal correction or failing-before/passing-after historical regression exists.

## Preservation and review responsibilities

| Review requirement | Independent assessment |
|---|---|
| Exact source and evidence | Git HEAD and source hashes match7b5edbd; raw historical and campaign hashes independently verified; no post-failure diagnostic source change |
| Architecture/test ordering/shared resources | All17 names match canonical source; single shared fixture and external ephemeral-network use identified; actual case order retained |
| HTTP lifecycle/active versus idle | P1 observer reused; P2 maps application JSON completion separately from parser completion; negative leak fixture and real operation linkage inspected |
| Error propagation | Original fetch/JSON rejections rethrown; synchronous handler fatal monitor preserved;18/18 preflight and54/54 guard results inspected, not independently rerun |
| Canonical campaign validity | FAIL: collector shutdown classification produces overall1; raw native17/17 cannot override mandatory G4 invalidation |
| Correction/regression | No Postfix correction justified; demonstrated collector defect remains uncorrected under stop policy; no corrective campaign, full unit or contracts claimed |
| Security/data isolation | Metadata-only observers, no new headers/payload logging/network changes; source logging allowlist and sentinel checks inspected; no new security bypass established |
| Cleanup | Readback shows main and ephemeral project/owner containers, networks and images empty; runner directory and collector PIDs gone; preexisting container/network ID sets unchanged |
| R5/network/guard source | Independent Git diff against72f4c67 is empty for production, lifecycle, canonical Services, guards, network tests and dependency files. Historical R5 qualification remains applicable; no new R5 Docker claim |
| Owner risk decision | NOT_EXECUTED: valid campaign prerequisite is unmet. No owner acceptance is inferred or recommended as if qualification had passed |

The final implementing report should retain **FAILED_QUALIFICATION**, Gate G FAIL, Gate H ROOT_CAUSE_UNDETERMINED, correction/corrective qualification/full regressions/residual-risk preparation NOT_EXECUTED under the stop boundary. The parent handoff is **RECOVERY_QUALIFIED_POSTFIX_BLOCKED_EVIDENCE**. Neither FINDING_CLOSED nor ROOT_CAUSE_UNDETERMINED_CONFIRMED with a valid canonical campaign is supported by this failed attempt.
