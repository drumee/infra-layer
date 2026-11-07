# Minimal correction — Gate B PASS

Executable/test candidate **a5c61911** (full SHA in command receipts/attempt-plan.json) changes exactly two source lines relative to af888a0:

1. `docker.cjs`: `let stdout, error;` removes only the redundant empty-string initializer. Success/error assignments, actual output hash, original error propagation, executable/environment, command arguments and bounds are unchanged.
2. `campaign.cjs`: the fixed literal evidence root changes from V1 to **V1-F1**, binding the new baseline/approval/attempt and preserving the old failed evidence. No configurable arbitrary path or selector is introduced.

[Complete patch](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/correction.patch). No model/ownership check, test body/assertion, creation/removal command, consumer check, timeout, dependency, lint rule/ignore/suppression, runtime or package input changes. The code-only commit precedes qualification, so every corrected command has an exact Git source SHA plus four harness hashes. Syntax and lint validate both changed CommonJS files; the unchanged model and matrix remain checksum-equivalent to V1. The prior LOW partial-creation structured-ledger observation is not redesigned or falsely reported fixed; existing global reconciliation and failure semantics remain.
