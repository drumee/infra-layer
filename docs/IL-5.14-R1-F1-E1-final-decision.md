# E1 final decision

**FAILED_QUALIFICATION**. Error classification is restored and47 focused tests pass, but the required real Docker invocation exited1 before entering its scenario. The missing caller-supplied diagnostic directory is an implementing-agent setup omission, not an application/network assertion failure or a proven external environment blocker. No retry was performed.

Source: implementation commit `740d01f77b20358cee8b3cad4cb501b830bd0ce8`, descended from F1 `3384434e1048e2157d3abbb43a6dfdf3fccf1b98`; earlier PR head `cd9b8322bd7eef3b4094710ec4ea26be94f08922` remains unchanged. Documentation/evidence-only checkpoint follows executable source. Exact file hashes, Node/npm versions and execution context: [source identity](evidence/IL-5.14-R1-F1-E1/source-identity.json). Commands, timestamps, exit codes, logs and protected Docker snapshots: [ledger](evidence/IL-5.14-R1-F1-E1/execution.jsonl).

| Gate | Status | Evidence/disposition |
|---|---|---|
| A | PASS | Saved34/35 failure traced statically; unchanged failing suite not rerun. |
| B | PASS | Valid unknown role is semantic mismatch; malformed data stays distinct. |
| C | PASS | Minimal classification split with deterministic validation traversal; no assertion changed. |
| D | PASS | 47 targeted tests pass,0 fail/skip; exit0. |
| E | FAIL | Harness launch exit1: caller-supplied diagnostic directory absent; no Docker scenario executed. |
| F | NOT_EXECUTED | Stopped before full canonical regression/lint/audits. |
| G | NOT_EXECUTED | No package/security/consumer qualification. |
| H | NOT_EXECUTED | No push/new hosted checks. |
| I | NOT_EXECUTED | Original MAJOR finding still open; no independent signoff. |
| J | PASS | Failed launch evidence and precise local decision preserved. |

The historical assertion was unchanged. Structural roles remain INVALID_NETWORK_ATTACHMENT; valid role absent from declared composition now yields NETWORK_ATTACHMENT_MISMATCH. All16 F1 complete-membership cases and12 added E1 cases passed. This does not independently close the R1 MAJOR security finding: corrected real Docker behavior and all remaining suites are unqualified.

The first real launch failed in createDiagnostics/lstatSync because `/tmp/drumee-il514-r1-f1-e1/membership` did not exist. No Docker command, container or network creation occurred in that process. Expected prerequisite is a verified mission-owned0700 directory; filesystem validation must remain unchanged. Next continuation must preserve this failed launch evidence, prepare the prerequisite, then execute real Docker, full regression/security/package checks, exact-head hosted checks and separate independent review.

No push, PR update, merge, publication, release tag, deployment or downstream change occurred. No new artifact hash is claimed. Residual limitations: `SMTP_RECOVERY_UNQUALIFIED`; `H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED`; failed Debian H3 history remains; downstream acceptance is not qualified.
