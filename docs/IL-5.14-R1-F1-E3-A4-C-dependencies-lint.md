# Dependency and lint qualification — Gate J FAIL

**C-LINT-001 — MINOR maintainability finding; mandatory qualification blocker.** The canonical lint command exited1 on the unchanged candidate. No source correction or rerun followed.

Actual command: `python3 docs/evidence/IL-5.14-R1-F1-E3-A4-C/run.py lint npm run lint`. Inner command is exactly `npm run lint` → `node tooling/lint.cjs`. ESLint10.13.0, Node22.22.0, npm11.18.0, UID/GID1000. Checkout8452b9b, executablefd708aa. Exact timestamp/source/protected-state receipt: [STOP](evidence/IL-5.14-R1-F1-E3-A4-C/STOP.json), [ledger](evidence/IL-5.14-R1-F1-E3-A4-C/execution.jsonl). Full original output: [lint.log](evidence/IL-5.14-R1-F1-E3-A4-C/lint.log).

Actual totals:0 errors,29 visible warnings,65 stored baseline entries,**1 new finding**, exit1. The stored65 entries are the unchanged baseline inventory; they are not65 currently visible warnings. The previous28 visible warnings remain historical; the new29th warning is `no-unused-vars` at `test/diagnostics/observer-shutdown/matrix.test.cjs:3:26`: `'drain' is assigned a value but never used`.

Read-only `git blame -L 1,8 -- test/diagnostics/observer-shutdown/matrix.test.cjs` attributes the destructuring to fd708aa. Identifier search finds drain only in that import. This is a test-only lint violation introduced by the observer matrix, not evidence that observer shutdown or Postfix behavior is functionally broken. Zero lint errors do not override the canonical zero-new-findings policy. [Machine finding](evidence/IL-5.14-R1-F1-E3-A4-C/finding.json).

Development, production and private application-fixture audits: **NOT_EXECUTED**, stopped before audit execution. Existing Nodemailer10.1.7/smtp-server3.19.24/nested Nodemailer10.1.4 manifests/locks are preserved and source-equivalent; no fresh audit result or vulnerability-free claim is made. No dependency update, exclusion, suppression, baseline expansion or scanner-policy change occurred.

Required separate follow-up: remove only the unused drain destructured binding, preserve model export/observer assertions/error semantics, establish a new frozen harness identity and run the affected checks before resuming remaining convergence obligations. See [follow-up scope](IL-5.14-R1-F1-E3-A4-C-corrective-follow-up.md). C is stopped as FAILED_QUALIFICATION.
