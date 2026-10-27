# A4 final decision

**FAILED_QUALIFICATION** — first mandatory real-Docker recovery attempt failed. Stop without retry, further correction, Workstream P or push. No recovery success is claimed.

Starting checkpoint51cfd7b9839d45f6423fdb0f2be0d240ee8c114a plus the exact candidate hashes in [source identity](evidence/IL-5.14-R1-F1-E3-A4/source-identity.json). A local preservation commit retains the unqualified implementation/tests and evidence; it is not a qualified source revision. Remote PR20 remains OPEN/main atcd9b8322bd7eef3b4094710ec4ea26be94f08922.

| Gate | Status | Evidence / disposition |
|---|---|---|
| 0 | PASS | Clean baseline, PR identity,27 original A3 hashes and historical evidence references verified. |
| R1 | PASS | Written operational-readiness/recovery-authority distinction; no general mismatch bypass. |
| R2 | PASS | A3 refusal before recreation traced; specific rollback-only boundary defined. |
| R3 | BLOCKED | Candidate implemented, but not qualified by real recovery. |
| R4 | BLOCKED |18 new deterministic tests PASS; complete actual recovery contract not demonstrated. |
| R5 | FAIL | One realDocker attempt exit1 NETWORK_ATTACHMENT_MISMATCH, owned cleanup PASS. |
| P1 | NOT_EXECUTED | Workstream P not started after mandatory R5 stop. |
| P2 | NOT_EXECUTED | No new transport instrumentation. |
| P3 | NOT_EXECUTED | No transport probes. |
| P4 | NOT_EXECUTED | Original Postfix first cause remains unexplained. |
| P5 | NOT_EXECUTED | No speculative Postfix correction. |
| C1 | BLOCKED | CONVERGENCE_BLOCKED; recovery unqualified and Postfix unresolved. |
| C2 | NOT_EXECUTED | No full application/services acceptance. |
| C3 | NOT_EXECUTED | Earlier317unit/24contracts/100focused PASS; remaining full F1 gates stopped. |
| C4 | NOT_EXECUTED | No fresh security/audit/package/consumer qualification. |
| C5 | NOT_EXECUTED | No push/PR update/new hosted head. |
| C6 | NOT_EXECUTED | No independent final closure. |

Real fixture observed Running=true/Restarting=true and expected configured network with empty endpoint. Ordinary validation correctly refused. Rollback then took the ordinary preflight branch and failed before recreation. The exact internal gate snapshot is unavailable, so no selector/race explanation is claimed as proven. [Failure detail](IL-5.14-R1-F1-E3-A4-recovery-docker-acceptance.md). A later correction must investigate admission selection and distinguish authoritative configured identity from unavailable live restart-state observations without relaxing network/ownership checks. No post-failure implementation edit or test rerun occurred.

Exact command argv, source baseline, timestamps, UID/GID1000, exits and protected-config snapshots are in [execution.jsonl](evidence/IL-5.14-R1-F1-E3-A4/execution.jsonl). Tool versions Node22.22.0/Docker29.2.0; fresh directory and changed-byte receipt [preflight](evidence/IL-5.14-R1-F1-E3-A4/recovery-preflight.json). No skips in the317-unit,24-contract or100-focused passes. These positives do not override R5. E2 Docker results remain historical; affected A4 runtime requalification did not pass. No new package identity or hosted result exists.

No production deployment, merge, publication, tag, push, foreign-resource change, protected Docker change or downstream action. Mission-owned projectdrumee-il5-8169752d has no remaining containers/networks/image. A2 guard and actual historical acceptance harness bytes remain unchanged. Original failed reports remain intact.

Residuals: SMTP_RECOVERY_UNQUALIFIED; H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED. Historical Debian H3 remains failed; no SMTP Internet delivery/spool recovery or Debian qualification is claimed. Original R1 MAJOR remains open. Owner-facing disposition: do not integrate this candidate; preserve for separately scoped causal correction and new qualification.
