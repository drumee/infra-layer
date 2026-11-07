# IL-5.14-C1-L1 canonical lint qualification

Gate D: PASS at executable source ce1ba500d3775d1a7f6ac0156d26b60a4c6ccc4c. Exact command `npm run lint`, 2026-10-26T09:07:03.223426–09:07:04.728351 UTC, exit 0. ESLint 10.13.0 under the unchanged repository configuration reports 0 errors, 28 visible warnings, 65 baseline entries and 0 new findings. The unused catch binding is gone. This is not a zero-total-warning claim.

| Measurement | Checkpoint dac28db | Corrected ce1ba50 |
|---|---:|---:|
| Exit | 1 | 0 |
| Errors | 0 | 0 |
| Visible warnings | 29 | 28 |
| New unmatched findings | 1 | 0 |
| Baseline entries | 65 | 65 |

Baseline SHA256 remains 4ed3ffda318796bda37b65deda058240d0d8926b866ffc46c7bd678b68cfbfb2. Scope remains ESLint lintFiles(["."]); no file exclusion, rule disablement, severity reduction, blanket directive or baseline expansion occurred. The historical entry need not be removed: existing regression tests explicitly permit resolved debt without weakening detection of moved/new/duplicate findings.

The focused command `node --test test/unit/lifecycle-safety.test.js test/unit/network-attachments.test.js test/unit/qualification-diagnostic.test.js test/unit/security-tooling.test.js` passes all 38 tests, no skips. It covers the active pointer catch, network identities, error reporting and the actual baseline comparison/refusal policy. [Receipt ledger](evidence/IL-5.14-C1-L1/execution.jsonl), [canonical output](evidence/IL-5.14-C1-L1/corrected-lint.log), [focused log](evidence/IL-5.14-C1-L1/focused-regressions.log).
