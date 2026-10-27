# E2 final decision

**FAILED_QUALIFICATION** — secure preflight and new actual Docker acceptance pass; mandatory full unit suite fails. No retry, production/test correction, push or independent finding closure followed the failure.

Tested source: `2ec85bcd16219f592ee40836728493584bbd170a`; executable/test revision `740d01f77b20358cee8b3cad4cb501b830bd0ce8`, unchanged from E1 hashes. E2 introduces only reports and archived setup/evidence scripts, not application/harness/test changes. PR20 remains open at the earlier independently reviewed `cd9b8322bd7eef3b4094710ec4ea26be94f08922`, target main.

Exact commands, timestamps, UID/GID1000, exit codes and protected configuration snapshots: [ledger](evidence/IL-5.14-R1-F1-E2/execution.jsonl). Node22.22.0, npm11.18.0, Docker29.2.0; full environment and directory receipts: [preflight](evidence/IL-5.14-R1-F1-E2/preflight-receipt.json).

| Gate | Status | Evidence/disposition |
|---|---|---|
| A | PASS | E1 initialization failure verified; historical Docker scenario NOT_EXECUTED. |
| B | PASS | Existing diagnostic contract documented; no harness source change. |
| C | PASS | 6 secure positive/negative preflight cases; no Docker launch. |
| D | PASS | Unique private directories verified; source hashes and tools frozen. |
| E | PASS | 21 membership+42 Redis+15 optional Health assertions; all owned cleanup verified. |
| F | FAIL | Full unit245 total/244 pass/1 preservation-test failure; contracts/lint/package check pass. |
| G | NOT_EXECUTED | Full security/audit/retained package/strict consumer stopped; package smoke only passed. |
| H | NOT_EXECUTED | No push/new hosted head. |
| I | NOT_EXECUTED | Original MAJOR remains open; independent closure not eligible. |
| J | PASS | Historical results preserved; precise failed decision recorded. |

Original E1 FAILED_QUALIFICATION is preserved; its Docker scenario was NOT_EXECUTED due to initialization ENOENT. E2's fresh700 directories, ownership, safe parents, exclusive writes, free space and source checks all pass. Actual Docker acceptance:21 membership assertions,42 across2 Redis cycles,15 optional Health assertions; cleanup independently read back empty. Earlier47/47 targeted tests remain applicable to unchanged executable bytes.

Current blocker: exact-expression preservation test at qualification-diagnostic.test.js:61 compares current strengthened F1 security assertions with the pinned pre-F1 harness. It reports the deliberately added full-detachment refusal and missing-network refusal. The validator was not observed to fail its actual Docker scenarios, but the mandatory preservation test has not been safely reconciled. Required follow-up: narrowly account for the independently justified F1 contract changes while retaining protection against arbitrary assertion removal/weakening and Docker command reordering, then rerun affected/full checks. Do not simply drop the preservation test or replace its baseline to hide changes.

Contracts24 PASS, ESLint0 errors/0 new findings/28 historical warnings, canonical42-member package audit+smoke PASS. Unit245 total/244 PASS/1 FAIL/0 skipped. Full integration/security/audits/strict consumers and retained candidate remain unexecuted. No new full package SHA is claimed; transient package smoke SRI is documented separately. Independent R1 MAJOR remains OPEN.

No merge, publication, tag, deployment, downstream repository action or foreign-resource modification occurred. Residual limitations: SMTP_RECOVERY_UNQUALIFIED; H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED; historical Debian H3 remains failed; Debian downstream acceptance is not qualified.
