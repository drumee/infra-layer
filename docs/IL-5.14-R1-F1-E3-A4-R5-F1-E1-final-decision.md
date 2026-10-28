# E1 final local decision

**R5_RECOVERY_QUALIFIED** at executable72f4c67254561ca5c4c47a6a65e9620e57da7841. The recovery-admission error contract is restored and actual Docker rollback of the verified restarting target succeeds. Independent local review returns FINDING_CLOSED with no MAJOR/BLOCKER in this scope.

Parent A4 handoff: **RECOVERY_QUALIFIED_POSTFIX_NOT_EXECUTED**. Do not automatically start Postfix or push. Original final-head R1 closure and complete F1 qualification remain outstanding.

| Gate | Status | Evidence/disposition |
|---|---|---|
| A | PASS | Clean1e859f6 baseline, PR identity and parent evidence hashes verified; exact authorized historical failure reconstructed. |
| B | PASS | Caller/journal authority precedes identity; identity precedes eligibility. Historical expectation independently justified. |
| C | PASS | Narrow helper ordering and public authorization-before-state-read correction; no network validator change. |
| D | PASS | Authorization/identity/eligibility matrix including no-disclosure and failure controls. |
| E | PASS | Historical1 selected, focused29, complete55 tests all PASS, exit0; historical assertion unchanged. |
| F | PASS | Full354/354 unit and24/24 contracts, no skips, exit0. A2 guard unchanged and covered. |
| G | PASS | Actual-module deterministic boundary reaches modeled recreation and requires strict final validation; negatives stop before destruction. |
| H | PASS | One new actual Docker attempt,38 assertions, real restart-backoff/empty endpoint, actual replacement, final readiness, negative controls, cleanup. |
| I | PASS | SECURITY_BOUNDARY_VERIFIED in local recovery scope. |
| J | PASS | Separate reviewer FINDING_CLOSED;14 independent probes and103 focused tests, actual Docker evidence inspected. |
| K | PASS | Source freeze, local evidence/handoff; no push or unrelated work. |

Starting checkpoint1e859f6d4dd0682ebbceaeee994ce7c69504238d. Qualified executable72f4c67254561ca5c4c47a6a65e9620e57da7841 includes implementation and test changes; later reporting commit contains only E1 documentation/evidence. Unit/focused tests used exactly those committed implementation/test bytes before the commit; the separate real-Docker runner was extended afterwards and actually executed at72f4c67. Source hashes independently matched. No executable edit followed qualification/review.

Exact commands, UTC times, source identities, UID/GID1000, exits and protected configuration snapshots: [execution ledger](evidence/IL-5.14-R1-F1-E3-A4-R5-F1-E1/execution.jsonl). Node22.22.0/Docker29.2.0. [Source identity](evidence/IL-5.14-R1-F1-E3-A4-R5-F1-E1/source-identity.json), [Docker receipt/report](evidence/IL-5.14-R1-F1-E3-A4-R5-F1-E1/docker-attempt-1/result.json), [independent decision](evidence/IL-5.14-R1-F1-E3-A4-R5-F1-E1/independent-review/decision.json).

The real Docker run observes failed container254c5e7ec8deb509b9c711680a2a9b7f63796f96b2372baac73a8a5836b6fd67 restarting with an empty expected endpoint, while ordinary validation remains refused. Authorized rollback reaches actual Compose force-recreation and produces healthy container654c83a24f4758f81ce1324cfd5ce97e8facc6c6204f74ec290aa03f2f64e295. Final strict membership and protocol validation pass. A deliberate real final detachment later proves a missing membership cannot return ready. Command-failure injection is explicitly distinguished from the genuine initial crashing Compose failure. All mission-created resources removed and filtered cleanup readback empty.

PR20 remains OPEN/main atcd9b8322bd7eef3b4094710ec4ea26be94f08922. No push/PR update, merge, publish, tag, deployment, package build, hosted campaign, protected Docker change, foreign-resource modification, downstream modification or Postfix investigation. Historical failed evidence remains unchanged. This local status does not imply overall integration readiness.

Limitations remain: SMTP_RECOVERY_UNQUALIFIED; H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED; historical Debian H3 failure. No SMTP Internet delivery/spool recovery or downstream Debian acceptance claim. Parent A4 must separately investigate Postfix and complete its remaining qualification before any PR delivery.
