# Independent V1-F1 minimal patch review

The committed a5c61911c62dd2e48f4c87330f1d84990c1069e3 patch is exactly two lines: remove the overwritten empty stdout initializer in the test-only Docker adapter, and change the fixed campaign evidence directory from V1 to V1-F1. Both existing command result/error branches still assign actual output before recording or returning/throwing. Module initialization, process creation, stream/error propagation and cleanup ownership semantics are unchanged. The literal evidence-root change binds the fresh attempt and preserves old failed evidence; it introduces no caller-controlled path.

Ownership and safety-test files are unchanged. No production, package, historical assertion, daemon policy, timeout or retry changes are present. The retained package SHA256 was independently rechecked. The partial creation structured-ledger limitation remains LOW auditability; the existing global inventory guard ordinarily detects surviving unmanifested resources, and no new security bypass was demonstrated.

This is static minimal-diff support only. Campaign approval remains pending required focused/canonical lint/safety/assertion controls, current read-only daemon/resource checks and an explicit one-attempt plan. Historical volume deletion remains forbidden. The reviewer ran no test or Docker command and changed no implementing file.
