# Valid canonical Services campaign

Gate G PASS: **CANONICAL_SERVICES_DIAGNOSTIC_PASS**, native Services17/17, campaign exit0, first_failure:null. One new campaign only, justified by the independently closed observer correction. P2's prior invalid campaign remains unchanged and is not retroactively qualified.

Executable `fd708aaf914accc93aa42fcd705740db390721d5`; attempt `P2-F1-SERVICES-44a15964-e61b-4347-9167-211df21937eb`; project drumee-il2-test-be22d37f plus suffix -ephemeral. Exact command: `python3 test/diagnostics/observer-shutdown/record.py canonical-attempt-1 node test/diagnostics/services-capture/campaign.cjs /tmp/drumee-p2f1-ncv3fhrl/canonical-attempt-1`. The fixed canonical node test/services/run.js runner executes all17 original cases in original order/default scheduling; only test-only diagnostics/readiness/completion controls are added. No case split, HTTP policy/assertion/expected result/network permission/Services timeout or retry change.

Prerequisites A–F, source hashes, independent FINDING_CLOSED, case inventory, environment and cleanup plan were recorded in [campaign preflight](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/campaign-preflight.json). Host Node22.22.0/Undici6.23.0, capture Node22.23.3/Undici6.28.1, Docker29.2.0, UID/GID1000. Execution2026-10-28T14:58:02.509452Z–14:59:05.660026Z, exit0. Exact child argv and terminal result in [test-result.json](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/canonical-attempt-1/test-result.json).

| Required observation | Actual result |
|---|---|
| Services cases |17 start/completion pairs in order1–17; native TAP17 passed,0 failed/skipped/cancelled; child exit0 |
| HTTP operations |9 host request/header/parser-body/original JSON completions; no fetch/request/operation error, unresolved boundary or cross-case completion |
| Relevant case15 GET |Operation3 starts14:58:50.856Z and JSON completes14:58:50.859Z before same-process intentional stop marker; not the historical failed operation |
| Idle notifications |UND_ERR_SOCKET in15/16 and UND_ERR_INFO in16 remain logged as idle_persistent_connection, active_requests:[], pending_application:[]; not suppressed or relabeled historical causality |
| Capture lifecycle |All observed handler/return/finish chains complete; three capture process incarnations listen, intentionally close and exit0; no handler/server/uncaught failure |
| Main observer identity |Node2554111, direct CLI2554151, private instance token/ready receipt and initial/final container IDs verified |
| Ephemeral identity |Node2554112, direct CLI2554152, separate private token/receipt/project |
| Collection |17 cases/request/server cutoff valid after owned Compose down; main18 and ephemeral3 created-container lifecycles complete, every observed create has start/die/destroy; snapshot core IDs covered |
| Event streams |Main668 daemon rows plus16 lifecycle metadata; ephemeral32 daemon rows plus16 metadata; bounded, sanitized, exact daemon timestamp digits |
| Controlled stop |Both workers record COLLECTION_COMPLETE then STOP_REQUESTED; per-worker intent precedes actual child-object kill(SIGTERM), success:true |
| CLI termination |Both exit143/null and close143/null match; stdout/stderr end+close, no partial line, zero stderr, no prior failure; classification CONTROLLED_SIGTERM_COMPLETE |
| Outer wrappers |Both Node exit0/close0, stdout/stderr end+close, no unexpected output or prior error |
| Whole campaign |campaign-result code0/first_failure:null; actual recorded process exit0; canonical filesystem removal observed |
| Cleanup |Main/ephemeral project+owner containers/networks/images absent; owned runner directory and both Node/two CLI PIDs gone; foreign container/network ID sets unchanged |

Per-worker intent/send/exit/close are ordered by process_instance and sequence; UTC across workers is contextual only. Contract `pid` fields name target CLI, not necessarily the logger emitter; receipts/parent records disambiguate observer_pid/cli_pid. COLLECTING receipt is spawn/stream readiness, not an invented daemon subscription ACK; success separately enforces actual lifecycle coverage.

[Raw complete output](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/canonical-attempt-1.log), [command/source/exit ledger](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/execution.jsonl), [summary](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/campaign-summary.json), [client](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/canonical-attempt-1/client.jsonl), [server including cleanup](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/canonical-attempt-1/server-after-cleanup.jsonl), [main observer](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/canonical-attempt-1/docker-main.jsonl), [ephemeral observer](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/canonical-attempt-1/docker-ephemeral.jsonl), [parent lifecycle](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/canonical-attempt-1/orchestrator.jsonl), [final result](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/canonical-attempt-1/campaign-result.json), [cleanup receipt](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/cleanup-readback.json).

This valid current qualification does not identify the historical Postfix first causal event. New DKIM restart5325.707378ms differs from original7133.044383ms. Synchronous diagnostic logging/hooks/Promise continuations perturb timing; the original aggregate Gateway prefix and unsynchronized/NAT limitations remain. No further campaign is conducted to pursue recurrence. Independent campaign review is a separate Gate K.
