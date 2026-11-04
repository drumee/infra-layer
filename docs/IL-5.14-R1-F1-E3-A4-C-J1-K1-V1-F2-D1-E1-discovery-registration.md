# E1 discovery and registration — Gate D BLOCKED

| Lifecycle boundary | Original D1 supported state | New direct native control |
|---|---|---|
| MODULE_LOADED | Target-load-complete journal observed | Not independently probed; file-level execution exits0 |
| REGISTRATION_CODE_REACHED | Before/after registration markers observed | Literal synchronous test(name,fn) source, no runtime marker |
| TEST_REGISTERED | NOT_ESTABLISHED by native acknowledgment | NOT_ESTABLISHED |
| TEST_STARTED | NOT_ESTABLISHED | NOT_ESTABLISHED |
| TEST_COMPLETED | NOT_ESTABLISHED | NOT_ESTABLISHED |
| TEST_RESULT_EMITTED | Parent output has no expected named result; inner emission unknown | Parent native TAP lacks named result; inner emission unknown |
| TEST_RESULT_COLLECTED | No named result in recorded native events; validator rejects | Raw redirect complete, no named result present |

Both invocations explicitly select an existing CommonJS file under --test. New file is positive.test.cjs; original fixture.cjs was explicitly selected rather than relying on name discovery. No name filter, skip/todo or asynchronous registration is present in inspected source/argv. Those facts narrow hypotheses, not prove individual registration or execution. Correct classification separates file discovery, source reachability, inner test lifecycle and observed parent result. No extra callback probe, suite, comparator or repeated control was run after native failure.
