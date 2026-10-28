# ESLint baseline restored — Gate D PASS

Candidate `0dd9a17d2fe63b98ba3fd6ef56c5252b595a60ec`; parent checkpoint `d44e51877151f2ab7f0397bfc3e2835767159de2`. Production/package inputs remain byte-identical to `fd708aaf914accc93aa42fcd705740db390721d5`. Node22.22.0/Undici6.23.0/npm11.18.0/ESLint10.13.0, Docker29.2.0, Linux amd64, UID/GID1000. Exact command argv/cwd/UTC, actual and expected return codes, log hashes, protected configuration and frozen-input readbacks are in [execution ledger](evidence/IL-5.14-R1-F1-E3-A4-C-J1/execution.jsonl).

Canonical command before and after: `npm run lint` → `node tooling/lint.cjs`. Both full-scope outputs are preserved, not substituted with file-only lint.

| Observation | Canonical exit | Errors | Visible warnings | Stored baseline entries | New findings |
|---|---|---|---|---|---|
| Before removal, d44e518 |1 |0 |29 |65 |1 |
| After removal,0dd9a17 |0 |0 |28 |65 |0 |

[Before](evidence/IL-5.14-R1-F1-E3-A4-C-J1/baseline-lint.log), [after](evidence/IL-5.14-R1-F1-E3-A4-C-J1/restored-lint.log). The single resolved diagnostic is unused drain at matrix.test.cjs:3:26. Historical warnings remain visible; they were not removed or suppressed.65 is the unchanged stored baseline inventory, not the current warning count. Every policy/config/ignore/baseline file is byte-identical. No lint rerun occurred after the separate package failure.
