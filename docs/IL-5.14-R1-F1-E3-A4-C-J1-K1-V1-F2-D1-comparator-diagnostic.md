# D1 controlled comparator diagnostic — Gate F NOT_EXECUTED

Source checkpoint `f6ec38e24d2504b3ed45fe4da94b4a00e785da4c`; unchanged comparator implementation `5699ab0ca9bed36aa00fa9b3692c4e64b7119ee6`; diagnostic commit `57a451e8f7cea089385a618a96e0aa8e2af7eb24`. Installed /usr/bin/node v22.22.0; exact binary and diagnostic/comparator source hashes in baseline.json. Attempt ID `D1-02a026b2-8d7d-4d4d-b579-70d9a970be7f`. No comparator diagnostic attempt or Docker operation occurred.

Gate E failed on the first synthetic fixture's event-fidelity assertion. The prerequisite diagnostic method is not qualified, so the one authorized comparator diagnostic was not consumed or executed. There is no comparator load/registration/case/error/worker/report result for D1 and no diagnostic-start.json. The only new Node test result belongs to the synthetic preflight fixture.

The original F2 failure remains exactly its preserved file-level ERR_TEST_FAILURE, exit1 with no actionable child cause. Do not label this stage DIAGNOSTIC_PASS_HISTORICAL_TEST_FAILURE_UNDETERMINED or a new opaque comparator attempt: neither occurred. No passing comparator, algorithm defect, expected-value defect or worker root cause can be inferred from the preflight event gap.
