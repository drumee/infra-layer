# A3 final decision

**BLOCKED_EVIDENCE** — the original Postfix-labelled HTTP failure lacks a verified causal explanation. No production/test correction or complete qualification is justified. Investigation stops without speculative retry/pooling changes or further integration campaign.

Baseline964e3a4a09be14f7951246d65dcc936bc29ab1c3, clean branch fix/il514-c1-network-attachment-identity; PR20 remains on cd9b8322bd7eef3b4094710ec4ea26be94f08922/main. All production/canonical-test bytes remain unchanged. New commits contain reports and original diagnostic evidence only.

| Gate | Status | Evidence/disposition |
|---|---|---|
| A | PASS | Both original failures, commands/source/known and missing evidence reconstructed separately; hashes verified. |
| B | PASS | Application restart-backoff endpoint mismatch reproduced on actual canonical image/policy; original historical exact snapshot absent. |
| C | BLOCKED | Postfix/control HTTP first causal event unverified; hypothesis did not reproduce, focused actual-source3/3 success is not a fix. |
| D | BLOCKED | Relationship UNDETERMINED; individual HTTP cause insufficient for a cross-failure correction. |
| E | BLOCKED | Only application design direction supported; no safe HTTP corrective design. |
| F | NOT_EXECUTED | No implementation or corrected targeted tests. |
| G | NOT_EXECUTED | No complete application/services acceptance rerun. |
| H | PASS | Implementation unchanged; E2 source-specific Docker evidence preserved, no corrected-runtime qualification. |
| I | NOT_EXECUTED | Remaining local qualification not resumed. |
| J | NOT_EXECUTED | No fresh security/package candidate qualification. |
| K | NOT_EXECUTED | No push/new hosted qualification. |
| L | NOT_EXECUTED | No independent final closure. |
| M | PASS | Evidence-based blocked diagnosis and original failures preserved. |

**Application:** real narrow diagnostic reproduces the exact refusal branch on actual canonical APP_CRASH=1/unless-stopped image: State.Restarting=true, Running=true,Pid0,ExitCode1; exact configured network/name/NetworkID match, EndpointID empty. Docker validator uses Running without Restarting and rejects absent active endpoint; rollback re-enters this precheck before force recreation. The steady-state refusal remains appropriate, but recovery needs a demonstrated phase distinction while retaining complete configured set/ID/ownership and extra-network refusals. Original A2 container/stack facts were absent; new IDs are not backfilled into history. [Root cause](IL-5.14-R1-F1-E3-A3-application-root-cause.md). No fix applied while independent HTTP cause is unresolved.

**Postfix:** original request is HTTP GET127.0.0.1:44221 capture-count control API, before test15 SMTP submission/intentional capture stop. A synchronous dkim restart follows the last successful count; stale pooled idle socket was a provisional hypothesis only. Direct-host and Docker-published idle-close diagnostics both succeed on a new connection instead of reproducing UND_ERR_SOCKET. The first probe's expected-error assertion exits1 and is retained as failed hypothesis, not hidden. One predeclared focused actual-source SMTP/DKIM/Postfix observation then passes3/3,exit0 with HTTP200; no original socket error or server-close cause appears. It does not prove a fix or17/17 qualification. [HTTP report](IL-5.14-R1-F1-E3-A3-postfix-root-cause.md). No repeated attempt/campaign follows.

No common cause is demonstrated; relationship UNDETERMINED. No Connection:close alteration, arbitrary sleep, broad retry, new readiness policy, ignored Docker error, changed expected code or assertion is introduced. Next evidence must establish the original failing request/socket/receiver lifecycle rather than assuming a source fix from correlation.

Exact commands, source964e3a4, UID/GID1000, timestamps, exit statuses, log hashes and protected Docker snapshots: [ledger](evidence/IL-5.14-R1-F1-E3-A3/execution.jsonl). Node client22.22.0, pinned Docker HTTP diagnostic server22.23.3, actual socket tuple/bytes and timeouts are in raw JSON; historical missing facts remain explicit. Diagnostic wrapper loads only fixed actual modules and observer files, changes only its fixed test-child selection, never evaluates source strings and preserves Docker/assertion semantics.

Owned application-restart, Docker HTTP and focused services resources have no remaining containers/networks/images; HTTP child stopped. [Cleanup readback](evidence/IL-5.14-R1-F1-E3-A3/cleanup-readback.json). Original A2 FAILED_QUALIFICATION records remain unchanged. Full app/services/unit/lifecycle/audit/package/hosted qualification and independent final closure are NOT_EXECUTED in A3; no pass is inferred. No new candidate package/hash is claimed.

No push, PR update, merge, publication, tag, deployment, protected-config change, foreign-resource modification or downstream repository action. Residuals SMTP_RECOVERY_UNQUALIFIED; H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED; historical Debian H3 remains failed; no SMTP Internet/spool recovery or Debian acceptance claim.
