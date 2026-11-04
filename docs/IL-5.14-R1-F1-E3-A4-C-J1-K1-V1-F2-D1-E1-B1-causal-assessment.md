# B1 causal assessment — Gate F ROOT_CAUSE_UNDETERMINED

Repository source `a62c6e3b04a0916c89b8891d78697240679eab99` (resume checkpoint unchanged), Node `/usr/bin/node` v22.22.0. Temporary reference `/tmp/drumee-b1-native-s3r6yhe1/e1-native-positive.test.cjs`, exact source SHA256 `c32f3dc74a4feb035d6a3c22bf30540cb12ba854a4bd69f9dfa5bfe69016fd91`, archived as reference-positive.cjs.txt. No repository executable source changed.

The one native reference command is `/usr/bin/node --test --test-reporter=tap ./e1-native-positive.test.cjs`, cwd /tmp/drumee-b1-native-s3r6yhe1. It uses no D1 layer, custom reporter, filter, preload or environment reset. Native root exit0. Raw stdout347bytes; outer stderr0bytes. TAP contains all four B1 diagnostic comments, then Subtest/ok naming only e1-native-positive.test.cjs, plan1..1/tests1/pass1/fail0. It does not contain an exact named Subtest/ok for e1-native-positive. The period/suffix of the file name is not accepted as the test name.

The exclusively owned journal contains BEFORE_REGISTRATION, REGISTRATION_CALL_RETURNED, CALLBACK_STARTED and ASSERTION_COMPLETED in that order, pid13. Corresponding fs.writeSync fd2 return counts23/30/20/23 equal the exact marker bytes including newline. All four marker texts also appear in parent TAP, so these particular child stderr messages were retained. Empty outer stderr is not evidence of child stderr loss: Node surfaces those messages as TAP comments. The callback and code after assert.equal(2+2,4) are directly observed for this new reference. Native named registration/result acknowledgments remain absent. Callback-path completion is distinct from a native TEST_COMPLETED/PASS event.

This narrows the leading hypothesis: lack of a named native result does not imply lack of a callback. The new reference demonstrably enters and passes its assertion path while its native named result remains absent. This does not retrospectively prove original E1 registration or callback execution.

Installed native FileTest source increments its private reported-child counter on accepted test:pass/test:fail messages and suppresses its own file report when child results exist and no independent file error requires reporting. The observed outer file PASS is consistent with no accepted child pass/fail result. This is a **source-based inference**, not a measured counter, child transport capture or proof of which emission/serialization/parser stage failed. These particular child stderr writes reaching parent TAP contradict a general loss of all child stderr. The parent exposes file success because child exit0/file completion is acknowledged; this does not explain why the named result was absent.

No exact first faulty operation, responsible native component, working named reference pair or original E1 causal comparison is available. ROOT_CAUSE_UNDETERMINED remains the required classification. MISSING_NODE_TEST_REGISTRATION, UNREACHABLE_TEST_REGISTRATION, TEST_DISCOVERY_OR_SELECTION_DEFECT, WRONG_NODE_INVOCATION, WRONG_FIXTURE_EXECUTED, TEST_SKIPPED_OR_CANCELLED, NATIVE_REPORTER_BEHAVIOR, WRAPPER_OR_ENVIRONMENT_INTERFERENCE and OTHER_VERIFIED_CAUSE are not established as the original root cause.

| Hypothesis | Bounded classification |
|---|---|
| H1 — Missing registration call | CONTRADICTED as a literal source omission; original runtime acknowledgment unproved |
| H2 — Registration code not reached | UNRESOLVED for original runtime |
| H3 — Wrong ordinary-module invocation mode | CONTRADICTED for recorded CLI mode |
| H4 — Wrong test file | UNRESOLVED at unrecorded effective-worker boundary; no mismatch demonstrated |
| H5 — Discovery or selection filter | UNRESOLVED for native original lifecycle |
| H6 — Incorrect test framework usage | CONTRADICTED for inspected import/API |
| H7 — Registered but skipped or cancelled | UNRESOLVED for original; not supported for new callback path |
| H8 — Reporter output discrepancy | SUPPORTED as new-reference symptom only; original mechanism UNRESOLVED |
| H9 — Wrapper or command substitution | UNRESOLVED for unrecorded worker details; no substitution demonstrated |
| H10 — Other verified cause | UNRESOLVED |

hypotheses.json records expected/supporting/contradicting/missing evidence and a discriminating control for each. Source-level contradictions are not hidden worker acknowledgments. H8 supports only the new observed reporting symptom, not a confirmed reporter defect or original cause. No missing named result is administratively accepted.

B1 does not explain D1's earlier preflight, F2's ERR_TEST_FAILURE or V1-F1's mount-order reconciliation failure. A common native result-channel mechanism is a hypothesis until independently traced. No comparator/application/Docker execution is performed.
