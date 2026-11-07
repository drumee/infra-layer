# D1 final diagnostic decision

**FAILED_DIAGNOSTIC — Gate E, mandatory diagnostic preflight.** Original comparator cause: **ROOT_CAUSE_UNDETERMINED**. Independent causal verification: **BLOCKED_EVIDENCE**. The comparator diagnostic was **NOT_EXECUTED** because its capture method did not pass preflight.

Source checkpoint `f6ec38e24d2504b3ed45fe4da94b4a00e785da4c`; unchanged comparator implementation `5699ab0ca9bed36aa00fa9b3692c4e64b7119ee6`; diagnostic commit `57a451e8f7cea089385a618a96e0aa8e2af7eb24`. Installed /usr/bin/node v22.22.0; exact binary and diagnostic/comparator source hashes in baseline.json. Attempt ID `D1-02a026b2-8d7d-4d4d-b579-70d9a970be7f`. No comparator diagnostic attempt or Docker operation occurred.

The sole preflight command was `python3 test/diagnostics/comparator-failure/record.py preflight`. Its first synthetic success fixture invoked Node CLI with --require, --trace-uncaught, --test, TAP and JSON reporters. Node parent pid3/worker13 both exit0. Child journal records target-load-start, registration-start, registration-complete, target-load-complete and process-exit0. Native parent events contain only the fixture file-level pass; no `test:pass` named `D1 fixture success` exists. Both captured streams reached EOF; stderr is empty, stdout284 bytes, no timeout or truncation.

The Python validator fails at record.py:125 with AssertionError when requiring that individual pass event. Preflight orchestration exits1. This is the first verified D1 control failure; it is not an individual comparator assertion or reproduction of F2. Original-cause classification remains ROOT_CAUSE_UNDETERMINED. No source change, next fixture, unchanged rerun or comparator invocation follows.

The distinction between subprocess and orchestrator results is preserved: synthetic Node exit0 is successful file-level execution; Python preflight exit1 rejects missing required case evidence. No assertion or exit code was changed to accept file-level PASS. E1 module-load observation succeeds in isolation; E8 individual completion fidelity fails, so E2–7/E9–10 and the actual comparator attempt are NOT_EXECUTED. This is not a green diagnostic or a reproduced comparator assertion failure.

The original F2 implementation remains unchanged, with historical syntax6/6 and file-level ERR_TEST_FAILURE/pass0/fail1 preserved. D1 adds only bounded diagnostic capture and synthetic fixtures. Five diagnostic JavaScript syntax checks plus Python AST parse pass. Those checks do not qualify diagnostic behavior. The initially proposed static design received independent acceptance pending execution; the actual failure prevents causal certification. No implementation correction or test rerun follows the stop.

## Separate conclusions

| Dimension | Supported result |
|---|---|
| Original F2 failure | Preserved; file-level exit1, first underlying cause unknown |
| D1 instrumentation | Unqualified after first preflight event-fidelity failure |
| Controlled comparator diagnostic | NOT_EXECUTED |
| Root cause | ROOT_CAUSE_UNDETERMINED |
| Corrective proposal | NOT_EXECUTED; positive-cause entry condition unmet |
| Comparator qualification | V1_FAILED_QUALIFICATION; V1-F1-REC-001_OPEN |
| Docker cleanup | NOT_QUALIFIED; no Docker operation |
| Historical volumes | H01–H04 unresolved, protected, no new readback |
| Production/package source | Preserved original177 and comparator6; archive not rehashed |
| Independent review | BLOCKED_EVIDENCE, no causal confirmation |
| Application acceptance | FAILED NETWORK_ATTACHMENT_MISMATCH |
| Original R1 | FINAL_CLOSURE_PENDING |
| Remote delivery | NOT_AUTHORIZED; no push or remote mutation |

The exact first D1 failure, tool-copied traceback provenance, separate public stdout/stderr, native event stream, process journals, child/root exits, EOFs and frozen hashes are retained in docs/evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2-D1. Original private raw buffers remain bounded and unpublished. The new event gap does not establish a Node defect, comparator defect, assertion error, test expectation error or collector root cause. A separate diagnostic scope must first qualify an observable individual-case boundary; no exact correction is selected here.

| Gate | Status | Evidence / limitation |
|---|---|---|
| A | PASS | Verified checkpoint/ancestry/original file-level failure and missing evidence |
| B | PASS | Command/worker/serialization/reporter architecture reconstructed from installed Node |
| C | PASS | Static hypotheses inspected without causal overclaim |
| D | PASS | Narrow design independently accepted pending execution; not qualified |
| E | FAIL | First success fixture lacks required individual-case pass event; validator exit1 |
| F | NOT_EXECUTED | Preflight failure prohibits comparator diagnostic |
| G | BLOCKED | ROOT_CAUSE_UNDETERMINED; original first cause not captured |
| H | NOT_EXECUTED | No supported original cause, so no concrete correction |
| I | PASS | Original177/comparator6 unchanged; diagnostic-only additions |
| J | BLOCKED | Independent final causal verification blocked by failed preflight |
| K | PASS | Auditable failed diagnostic conclusion; not successful investigation |

[Structured gate matrix](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2-D1/final-gates.json), [preflight evidence](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2-D1/diagnostic-preflight-result.json), [independent review](IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2-D1-independent-review.md), [source impact](IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2-D1-source-impact.md). Final documentation-only checkpoint is the commit introducing this report and is recorded in the owner handoff/private checkpoint receipt to avoid a self-referential hash. No source change follows executed diagnostic commit57a451e.

Preserve V1_FAILED_QUALIFICATION; V1-F1-REC-001_OPEN; APPLICATION_ACCEPTANCE_FAILED_NETWORK_ATTACHMENT_MISMATCH; F1_FAILED_QUALIFICATION_APPLICATION_ACCEPTANCE; R1_FINAL_CLOSURE_PENDING; FIXTURE_VOLUME_CLEANUP_UNQUALIFIED. Also preserve APPLICATION_HISTORICAL_ROOT_CAUSE_UNDETERMINED, POSTFIX_HISTORICAL_ROOT_CAUSE_UNDETERMINED, POSTFIX_HISTORICAL_UNCERTAINTY_ACCEPTED_BY_OWNER, SMTP_RECOVERY_UNQUALIFIED, H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED and historical Debian H3 stability failure. Owner Option B covers only historical Postfix HTTP capture uncertainty. Four historical volume identities remain unresolved and protected; no new uncertainty is accepted.

No production access, real Docker campaign, Docker fixture/resource mutation, archive build, npm/image publication, PR edit/push/merge, tag, deployment or Debian/Server Runtime/Oxy-form modification occurs. A2 is not executed. Historical parent findings and risk boundaries remain unchanged.
