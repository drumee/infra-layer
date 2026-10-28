# P1 final decision

**BLOCKED_EVIDENCE — ROOT_CAUSE_UNDETERMINED.** Parent handoff: **RECOVERY_QUALIFIED_POSTFIX_BLOCKED_EVIDENCE**. Investigation stops after one successful non-reproduction; no speculative correction or full integration rerun.

Starting checkpoint `9d8eebbb107ad3d46a189ae9d7d308d436b8e7ce` directly follows qualified recovery executable `72f4c67254561ca5c4c47a6a65e9620e57da7841` with documentation/evidence only. P1 diagnostic executable `5954bc121b3790d405aa48bf724a624c259f30a2`; final preservation commit contains reports/evidence only. All existing local commits are preserved. No canonical Services, Postfix production, recovery, Docker validation, ownership, network security, dependency, assertion guard or scanner-policy byte changed.

| Gate | Status | Actual result |
|---|---|---|
| A | PASS | Original A2/A3 source/error/result reconstruction;104 historical hashes verified; checkpoint/source/PR identities preserved |
| B | PASS | HTTP client, capture process, dynamic loopback endpoint, readiness, SMTP and cleanup sequence established |
| C | PASS | H1–H10 remain historically UNDETERMINED; bounded discriminating observation declared |
| D | PASS | Scoped CommonJS client/server/process/socket observers; no retries, sleeps or suppression |
| E | PASS |9/9 known-cause diagnostic fixtures, exit0; expected transport/child failures asserted |
| F | BLOCKED | One actual-source SMTP/DKIM/Postfix diagnostic3/3, exit0, five HTTP200/body completions; original failing request not reproduced |
| G | BLOCKED | Historical first causal event unavailable; ROOT_CAUSE_UNDETERMINED |
| H | NOT_EXECUTED | No evidence-based correction available |
| I | NOT_EXECUTED | No corrected focused Postfix qualification |
| J | NOT_EXECUTED | No canonical complete Services run |
| K | PASS | Exact R5/canonical/network/guard source equivalence;54/54 guard/reachability/refusal checks, exit0; owned cleanup verified |
| L | NOT_EXECUTED | No full new unit/contract/affected regression qualification;54 preservation checks are reported separately |
| M | BLOCKED | Separate reviewer BLOCKED_EVIDENCE; original HTTP finding remains open |

[Complete per-gate source/environment/tool-version/command/exit/count/transport/security/review/evidence/limitation matrix](evidence/IL-5.14-R1-F1-E3-A4-P1/decision.json), [execution ledger](evidence/IL-5.14-R1-F1-E3-A4-P1/execution.jsonl), [root-cause decision](IL-5.14-R1-F1-E3-A4-P1-root-cause.md), [independent review](IL-5.14-R1-F1-E3-A4-P1-independent-review.md).

Attempt `P1-POSTFIX-01d146db-98ca-4c0f-a970-178fc80b8b13` selects only original SMTP/DKIM/Postfix cases after canonical fixture preparation. Client Node22.22.0/Undici6.23.0, capture Node22.23.3/Undici6.28.1, Docker29.2.0, UID/GID1000. Post-DKIM request3 reuses the existing socket and completes200/body before intentional capture stop. The trace retains an idle `UND_ERR_SOCKET` notification during that later deliberate shutdown, with no failed request or fetch; it is not the historical pre-stop failure. All13 server handlers, including healthchecks, finish normally. Different restart duration5313vs7133ms, observational timing perturbation and missing original receiver/socket events prevent causal closure. No further unchanged attempt is justified.

[Targeted evidence and interpretation](IL-5.14-R1-F1-E3-A4-P1-targeted-investigation.md), [diagnostic qualification](IL-5.14-R1-F1-E3-A4-P1-diagnostic-qualification.md), [recovery/security preservation](IL-5.14-R1-F1-E3-A4-P1-recovery-impact.md). Newly executed counts are9 diagnostic,54 preservation and3 targeted tests; they are separate scopes and do not replace original16/17 Services or historical A3 three-case results. Do not claim a new full unit/contract count, complete Services pass, correction or SMTP recovery.

Both actual capture process instances exit0; canonical owned cleanup completes. No mission container/network/image remains, protected Docker configuration is unchanged and preexisting container/network ID sets match. Diagnostics retain metadata only. Independent review establishes no new MAJOR code/security defect but cannot close the original finding. PR20 remains OPEN/base main/head `cd9b8322bd7eef3b4094710ec4ea26be94f08922`, unchanged updated_at. No push, PR update, merge, publication, tag, deployment, foreign-resource modification or Debian/Server Runtime/Oxy-form modification occurred.

R5 historical55 focused/354 unit/24 contracts/38 Docker and FINDING_CLOSED remain tied to unchanged72f4c67; R5 Docker was not rerun. Original R1 final-head independent closure and complete F1 campaign remain outstanding. Preserve POSTFIX_SERVICES_16_OF_17, POSTFIX_HTTP_CAPTURE_UND_ERR_SOCKET, A3_POSTFIX_TARGETED_3_OF_3_PASS, SMTP_RECOVERY_UNQUALIFIED and H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED. Historical Debian H3 remains failed. No Internet SMTP delivery, spool/mail recovery or downstream Debian acceptance is qualified.

Unexecuted correction and full Services reports are intentionally not fabricated; their statuses are recorded above. Future work requires new causal evidence or a separately justified diagnostic protocol. Keep the qualified R5 checkpoint and this blocked-evidence handoff local.
