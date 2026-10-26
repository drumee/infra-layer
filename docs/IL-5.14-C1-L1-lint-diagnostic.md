# IL-5.14-C1-L1 lint diagnosis

Gate A: PASS. Resume source dac28dbae8febabecfea5e0cdef7afb968487efd, clean branch fix/il514-c1-network-attachment-identity, repository drumee/infra-layer. Canonical integration target origin/main and the GitHub default branch are c218811effc83da25cf71a914e27accc96101329 / main. Existing commits and historical evidence are preserved.

`package.json` defines `npm run lint` as `node tooling/lint.cjs`. ESLint 10.13.0, Node 22.22.0, npm 11.18.0, Debian 12 amd64, UID/GID 1000:1000. The original command was reproduced at 2026-10-26T09:06:26.835259–09:06:28.212705 UTC, exit 1: 0 errors, 29 visible warnings, 65 baseline entries and 1 unmatched finding. The raw log SHA256 is 8e5506c29ae2cd0d856ebaf546aa546eebeb7541907e9abaa6c88ee5d5b37a7d, identical to the D1 failure.

The exact unmatched diagnostic is lifecycle/activation.js:26:65, rule no-unused-vars, severity 1, message `'_' is defined but never used.` Source: `catch (_) { F.fail("ACTIVE_STATE_CORRUPTED"); }` in readActive. The exception is never read: the catch always throws the canonical corruption refusal. The historical alpha.3 function has the identical statement at line 13; the baseline records the same symbol, column, rule, severity and message there. The added networksReady helper moved the statement down without changing its meaning. Classification: EXISTING_FINDING_MOVED. The unused crypto import is a separate accepted historical warning and is not this blocker.

The comparison engine consumes exact file/line/column/rule/severity/message entries as a multiset; moving this warning fails by design. The scanner and baseline were not defective or modified to permit the move. Evidence is retained in the L1 baseline receipt, source proof and full before/after inventory.

[Baseline](evidence/IL-5.14-C1-L1/baseline.json), [original command output](evidence/IL-5.14-C1-L1/baseline-lint.log), [exact source/inventory comparison](evidence/IL-5.14-C1-L1/lint-inventory-and-source-proof.json).
