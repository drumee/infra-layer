# A2 final qualification decision

**FAILED_QUALIFICATION** — mandatory canonical application and already-running services integration failures. The guard correction has favorable independent local verification, but the candidate is neither ready for merge nor fully qualified awaiting review.

Source: `04a4fc9f1196ef42aec9428144609735e00ceb4a`, descended from2b08fe1 and all prior checkpoints. Later changes are documentation/evidence only; no post-failure executable correction or retry occurred. PR20 stays open on remote `cd9b8322bd7eef3b4094710ec4ea26be94f08922`, target main. No push, PR update, hosted run, merge, publication, tag, deployment or downstream change occurred.

| Gate | Status | Evidence/disposition |
|---|---|---|
| A | PASS | Old A1 false&& bypass reproduced3/3 with nonexecuted static mutations. |
| B | PASS | Restricted execution-context/source-integrity contract, not a general reachability proof. |
| C | PASS | Pinned complete AST plus original protected sequence and unchanged one-replacement authorization. |
| D | PASS | 48 combined mutation tests pass;26 new reachability tests include24 mandatory categories. |
| E | PASS | 6 actual-module effectiveness cases;12 unsafe-success/unrelated child controls fail as intended. |
| F | PASS | Independent reproducer1,diag17,unit299,contracts24 pass without mandatory skips. |
| G | PASS | DOCKER_E2_EVIDENCE_PRESERVED via exact runtime/acceptance/diagnostic bytes. |
| H | FAIL | Canonical application exit1 NETWORK_ATTACHMENT_MISMATCH; services16/17 with fetch failed; no retries. |
| I | BLOCKED | Package/audit/security-specific positives recorded, but full lifecycle/application compatibility not qualified. |
| J | NOT_EXECUTED | No push/new hosted checks. |
| K | BLOCKED | Independent local guard/network evidence favorable; formal final-head findings closure withheld due failed integration. |
| L | PASS | Evidence-based failed decision and original raw failures preserved. |

Exact commands, timestamps, source commits, UID/GID1000, exits, protected Docker snapshots and original log hashes: [ledger](evidence/IL-5.14-R1-F1-E3-A2/execution.jsonl). Node22.22.0/npm11.18.0, isolated TypeScript5.9.3; Docker29.2.0 from original qualified environment/independent real daemon report. Initial focused tests used2b08fe1 plus exactly the edits committed at04a4fc9; subsequent full commands use that commit. [Source identity](evidence/IL-5.14-R1-F1-E3-A2/source-identity.json).

Guard-specific result: old bypass reproduced3/3; corrected exact reproducer refuses3/3;48 mutation tests (26 new) pass,6 effectiveness parent tests exercise18 child outcomes, diagnostics17, full unit299 and contracts24 pass, no mandatory skips. E2 actual daemon21 membership/42 Redis/15 Health remains applicable by exact unchanged-source comparison, not a new run.

**Failure1 — real application.**36 assertions and6 completed groups, ending controlled-configuration-update-and-canonical-rollback; next failed-startup-does-not-reset-owned-application-state group does not finish and reports NETWORK_ATTACHMENT_MISMATCH. There is no detailed stack or observed membership state in the report, so exact failing operation/internal mismatch branch and causal explanation remain undetermined. Do not call it an environment issue or relax the required membership refusal. Next diagnostic scope must capture the failed-startup/recovery lifecycle stage, complete configured/observed network sets and identities, container state/ownership and precise error origin before any runtime correction. Original [report](evidence/IL-5.14-R1-F1-E3-A2/application-report.json), [log](evidence/IL-5.14-R1-F1-E3-A2/application.log).

**Failure2 — services.** Gateway17/17 passes; services16/17 passes with case15 Postfix queue persistence/outage/recreation failing at capturedCount fetch (services.test.js:50/152), TypeError fetch failed and trace UND_ERR_SOCKET. Later successful capture/tests do not erase that failure. Root cause is not established. The aggregate naturally exits1 and never launches lifecycle/lifecycle-gateway. Original [integration log](evidence/IL-5.14-R1-F1-E3-A2/integration.log). Both long commands were launched before failure observation; no new qualification command followed and no repeated acceptance occurred. The attempted stop-control read found the aggregate already gone; no process signal/cancellation was sent, unlike A1.

Completed positives: audits development/production/private fixture0 findings; ESLint0 errors/0 new findings/28 historical warnings; filesystem25, trusted executable12, installed security consumer4; strict packed consumer8 preparation+37 refusal assertions and strict NodeNext. No dependency update or scanner-policy change occurred.

Package42 members,104123 bytes, SHA256 `e17068d0abbf98ecd143075fe916264df2c066110744af5831a9aa2c20065d6a`, SRI `sha512-4QahcHIO6t04bnC4W1LNclBffwSSakVq+d+bMDfN/78dPAxRYp6kCH5aTXkupakSDptD18S5R1pyxhap3ztQ4A==`. Every member equals E2 tested runtime, independently freshly reproduced as well. Archive retained outside source repo; package-specific checks do not override failed integrations. Published alpha.3 remains immutable.

**Independent review:** actual separate reviewer50 guard checks (46 negative),54 focused/299 unit,21 actual-source network fixtures,13 real Docker cases, and fresh exact package support local guard/network corrections. It finds no new guard MAJOR/BLOCKER, but withholds formal final-head/finding closure because required application qualification failed. Full original artifacts: `/tmp/drumee-il514-a2-independent-review-_w8ohvql/`; [report snapshot](evidence/IL-5.14-R1-F1-E3-A2/independent-review/independent-review.md). Final K remains BLOCKED, not FINDING_CLOSED or ready.

Cleanup verified: application, gateway, services and consumer image namespaces have no remaining containers/networks/images; [readback](evidence/IL-5.14-R1-F1-E3-A2/final-cleanup-readback.json). Reviewer separately verified its own namespace removed. No foreign resource modified. No production/test source fix was attempted after mandatory failures.

Residuals: SMTP_RECOVERY_UNQUALIFIED; H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED; historical Debian H3 failed; no Internet SMTP/spool recovery/downstream acceptance claim. Current failures are not equated with H1/H3.
