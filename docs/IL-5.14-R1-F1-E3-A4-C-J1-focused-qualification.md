# Focused observer/assertion qualification — Gate C PASS

Candidate `0dd9a17d2fe63b98ba3fd6ef56c5252b595a60ec`; parent checkpoint `d44e51877151f2ab7f0397bfc3e2835767159de2`. Production/package inputs remain byte-identical to `fd708aaf914accc93aa42fcd705740db390721d5`. Node22.22.0/Undici6.23.0/npm11.18.0/ESLint10.13.0, Docker29.2.0, Linux amd64, UID/GID1000. Exact command argv/cwd/UTC, actual and expected return codes, log hashes, protected configuration and frozen-input readbacks are in [execution ledger](evidence/IL-5.14-R1-F1-E3-A4-C-J1/execution.jsonl).

Commands are prefixed by `python3 docs/evidence/IL-5.14-R1-F1-E3-A4-C-J1/run.py <label>` in the ledger.

| Inner command | Actual result | Exit | Evidence |
|---|---|---|---|
| `node --test test/diagnostics/observer-shutdown/matrix.test.cjs` |30/30 PASS |0 |observer-matrix.log |
| `node --test test/diagnostics/observer-shutdown/regression.test.cjs test/diagnostics/observer-shutdown/protocol.test.cjs` |9/9 PASS (1 original regression +8 protocol controls) |0 |observer-protocol.log |
| `node --test test/unit/harness-preservation.test.js test/unit/harness-reachability.test.js test/unit/refusal-effectiveness.test.js` |54/54 PASS |0 |assertion-guards.log |

All counts have0 skips/cancellations/failures. Matrix controls preserve attributed controlled SIGTERM/143 success and reject unsolicited143/SIGTERM, early exit0/143, premature stop, prior collection/stream/parse error, wrong process, signaling failure, timeout, SIGKILL, incomplete evidence, missing observer, duplicate requests and Services/earlier failures masked by cleanup. Protocol controls preserve exit-before-stream-close refusal, event window, readiness and bounded/redacted output. Original actual-module regression retains defective historical child exit1 as expected evidence while the corrected contract succeeds; it does not hide an actual test failure.

Assertion controls retain false&&/true||, unreachable/early-return/uncalled-function/duplicate-expression mutation refusal, sole authorized historical replacement and Docker/spawn integrity. These54 are later included in the354 full unit total and must not be added twice. No new assertion authorization exists.

Raw focused logger/negative-fixture files are copied under controlled-artifacts/ and original secure temporary directories remain recorded in logs. [Applicability and artifact inventory](evidence/IL-5.14-R1-F1-E3-A4-C-J1/applicability.json). No operational Docker observer campaign was needed for an import-only test change; prior actual-process/Services evidence is retained separately, not claimed rerun.
