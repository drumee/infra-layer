# Focused regressions — FAIL

Exactly one mandatory focused run:

```text
node --test test/unit/rollback-boundary.test.js test/unit/rollback-authorization.test.js
```

Node v22.22.0, UID/GID1000, source c23c861 plus recorded candidate byte hashes. Started2026-10-28T08:55:50.215865+00:00, ended08:55:50.812082, exit1.44 tests,43 PASS,1 FAIL,0 skips/cancellations. The test runner completed this single invocation; no suite or diagnostic was relaunched after the failure.

All26 new boundary tests pass, including actual orchestrator admission→recreation command→strict final-validation ordering with a deterministic adapter, no false readiness, extra-network/foreign/project/service/ID/duplicate/source/authority refusals, recover:true negative control, unrelated invalid service refusal, final missing/extra network, unhealthy recreation and command failure. These are controlled metadata/command fixtures, not real Docker recreation. P.verifyPrepared and external probe are explicitly mocked; real active/journal hash verification and the canonical network validator execute. Fixture mocks and private directories restore in finally. No dynamic evaluation or mutated canonical harness.

The previous18-case authorization file passes17 and fails its final historical test at test/unit/rollback-authorization.test.js:46, assertion line58. The loop first exercises owner/image/image_id substitutions, then revision='foreign'. The new failed-service/revision presence branch fires before resource identity validation. Expected RUNTIME_IDENTITY_MISMATCH; actual ROLLBACK_OPERATION_NOT_AUTHORIZED, from internal/rollback-authorization.js:8. Wrong service would encounter the same early presence check, but the saved failure is the first observed failing iteration, revision. Static tracing establishes this; no additional diagnostic run followed.

Gate E FAIL. Gate F BLOCKED overall despite the new positive deterministic boundary check, because the mandatory focused prerequisite failed. Gates G/H NOT_EXECUTED: no real Docker, full unit, contracts, real application rollback, broader network/guard campaign or unrelated services/package/hosted commands. Historical317/24 are not borrowed. [Raw output](evidence/IL-5.14-R1-F1-E3-A4-R5-F1/boundary-focused.log), [receipt](evidence/IL-5.14-R1-F1-E3-A4-R5-F1/execution.jsonl).
