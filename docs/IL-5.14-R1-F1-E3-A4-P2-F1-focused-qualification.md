# Observer F1 focused qualification

Gate E PASS at executable `fd708aaf914accc93aa42fcd705740db390721d5`. Tests ran in the required order; every command exits0, with no skips/cancellations. Exact argv, times, SHA256 source/log identities and protected Docker before/after snapshots are in [execution.jsonl](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/execution.jsonl). Host Node22.22.0/Undici6.23.0, Docker29.2.0, UID/GID1000.

| Order/scope | Command after record.py label | Actual result |
|---|---|---|
|1 original143 |node --test test/diagnostics/observer-shutdown/regression.test.cjs |1/1 PASS; historical actual module subprocess exits1 as expected; corrected full lifecycle accepts |
|2 matrix |node --test test/diagnostics/observer-shutdown/matrix.test.cjs |30/30 PASS |
|3 stream/order/result/redaction/ready |node --test test/diagnostics/observer-shutdown/protocol.test.cjs |8/8 PASS |
|4 actual Docker process contract |node --test test/diagnostics/observer-shutdown/docker-probe.test.cjs |2/2 PASS; positive controlled143 and fatal stderr negative |
|5 complete existing diagnostic preflight |node --test test/diagnostics/postfix-http/diagnostic.test.cjs test/diagnostics/services-capture/preflight.test.cjs |18/18 PASS |
|6 historical assertion guards |node --test test/unit/harness-preservation.test.js test/unit/harness-reachability.test.js test/unit/refusal-effectiveness.test.js |54/54 PASS |

The regression loads only a literal copied historical module from commit7b5edbd with SHA256 d257d1c246e877473f78bbc4fcf33ad4f0b0e0dbaa8cb1cece13a4203afde78b, through normal CommonJS; no source-string execution. It reproduces the exact old close predicate with a controlled child model and preserves old exit1/output. New state/signaling/stream guarantees are qualified separately. [Regression output](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/exit143-regression.log), [historical terminal stream](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/historical-regression/historical.jsonl).

Actual positive probe `F1-DOCKER-31fb75e8-7f60-4404-95f9-95bc9fef8a90`: Node observer2546681 directly spawns Docker CLI2546688. A fresh labeled network-none container emits create/start/die/destroy and is removed; exact ID2f3403777343f460680ffb0bd336ebdb0778c6b2ac0015df9f09fbd3789290a1. Coverage completes before recorded intent. kill(SIGTERM) returns true, CLI exit/close143/null match, stdout/stderr end+close, no partial line/stderr/prior failure, Node wrapper exit/close0 and drained streams. [Result](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/docker-probes/result.json), [actual CLI timeline](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/docker-probes/docker.jsonl), [parent timeline](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/docker-probes/controller.jsonl). One owned container only; no network/port or foreign-resource mutation. Existing pinned base image is retained.

Actual negative CLI probe uses an invalid read-only events timestamp. CLI stderr64 bytes is observed and hashed, not ignored or exposed. First failure OBSERVER_STDERR persists through exit1/close1; Node wrapper exits1. No resource is created. [Negative stream](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/docker-probes/stderr-control.jsonl). These expected child failures remain fatal within the harness; the containing negative test passes by asserting failure.

Output bounds retain4096-event hard refusal; bulky raw bound files remain in private temporary directories with hash/count receipts. Existing P1/P2 controls still prove genuine active-request failure, handler/process failure, reset/refusal, persistent error propagation, idle shutdown distinction, unfinished cross-case detection and no sentinels in logs. [Preflight output](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/diagnostic-preflight.log), [guards](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/assertion-guards.log). No existing assertion or timeout changed. Independent closure is still required before a canonical campaign.
