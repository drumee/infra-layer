# Observer shutdown mutation qualification

Gate D PASS at `fd708aaf914accc93aa42fcd705740db390721d5`. Node22.22.0, UID/GID1000. `python3 test/diagnostics/observer-shutdown/record.py shutdown-matrix node --test test/diagnostics/observer-shutdown/matrix.test.cjs`: exit0,30/30, no skips/cancellations. All requested D1–D26 plus four additional guards execute. Expected failures are asserted for the named reason; they are not test failures or ignored process exits.

| Case | Expected action | Asserted actual disposition | Test |
|---|---|---|---|
| D1 | PASS | NORMAL_COLLECTION_COMPLETE | PASS |
| D2 | PASS | CONTROLLED_SIGTERM_COMPLETE | PASS |
| D3 | PASS | CONTROLLED_SIGTERM_COMPLETE | PASS |
| D4 | PASS | campaign0 | PASS |
| D5 | REJECT | UNSOLICITED_TERMINATION | PASS |
| D6 | REJECT | UNSOLICITED_TERMINATION | PASS |
| D7 | REJECT | PREMATURE_EXIT | PASS |
| D8 | REJECT | PREMATURE_EXIT | PASS |
| D9 | REJECT | PREMATURE_STOP | PASS |
| D10 | REJECT | COLLECTION_ERROR | PASS |
| D11 | REJECT | STREAM_ERROR | PASS |
| D12 | REJECT | EVENT_PARSE_FAILED | PASS |
| D13 | REJECT | OBSERVER_IDENTITY | PASS |
| D14 | REJECT | SIGNAL_DELIVERY_FAILED | PASS |
| D15 | REJECT | SHUTDOWN_TIMEOUT | PASS |
| D16 | REJECT | UNEXPECTED_TERMINATION | PASS |
| D17 | REJECT | UNEXPECTED_TERMINATION | PASS |
| D18 | REJECT | SERVICES_FAILED | PASS |
| D19 | REJECT | DIAGNOSTIC_INCOMPLETE; COLLECTION_INCOMPLETE | PASS |
| D20 | REJECT | PRIOR_FATAL | PASS |
| D21 | REJECT | DUPLICATE_STOP | PASS |
| D22 | WAIT_THEN_PASS | no result until stdout/stderr end+close | PASS |
| D23 | REJECT | SPAWN_ERROR | PASS |
| D24 | REJECT | DIAGNOSTIC_INCOMPLETE | PASS |
| D25 | REJECT | ORIGINAL_FAILURE | PASS |
| D26 | REJECT | SERVICES_NOT_COMPLETE; COLLECTION_INCOMPLETE | PASS |
| D27 | REJECT | UNEXPECTED_TERMINATION (wrapper143) | PASS |
| D28 | REJECT | PARTIAL_EVENT | PASS |
| D29 | REJECT | OBSERVER_IDENTITY | PASS |
| D30 | REJECT_THEN_PASS | missing lifecycle/ID rejected; full owned lifecycle accepted | PASS |

Models invoke the actual classifier, parser/coverage and campaign result helpers used by the corrected harness. Fake PID101 and fake kill() represent deterministic lifecycle input and never signal host processes. D22 proves exit/close alone cannot qualify undrained streams; protocol controls separately prove bounded incomplete-stream refusal. D18/D25 preserve Services/earlier failures despite successful observer cleanup. D24 also refuses one observer when two are required. D27 denies143 for a non-Docker wrapper. D29 refuses changed PID without signaling.

[Original TAP](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/shutdown-matrix.log), [structured matrix](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/mutation-results.json), [per-case streams](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/shutdown-matrix/D1.jsonl), [ledger/source hashes](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/execution.jsonl). Adjacent streams D1–D30 retain transitions. Some campaign-only checks have no classifier-failure row; their exact helper-result assertions and TAP/source are the evidence, not fabricated process events.

Additional protocol8/8 checks cover late duplicate stop, exit-before-stream completion, missing case/request/server evidence, unresolved work, terminal Services failure, exact daemon timestamp/redaction, event-driven ready receipt/wrong PID and output4096-event bound. Actual Docker2/2 probes separately establish real process/stream behavior, so model success is not the sole attribution evidence. [Focused qualification](IL-5.14-R1-F1-E3-A4-P2-F1-focused-qualification.md).
