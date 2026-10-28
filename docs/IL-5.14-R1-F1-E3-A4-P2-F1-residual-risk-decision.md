# Owner decision: residual historical Postfix uncertainty

**Owner decision: PENDING. No option selected. No risk acceptance authorized or inferred.** This package concerns only the unexplained historical Postfix-associated HTTP capture incident. Observer MAJOR P2-IR-1 is separately corrected/closed. Current local qualification is complete; independent Gate K returns CAMPAIGN_EVIDENCE_VALID at the same executable. Gate L decision-package preparation is PASS; the owner decision alone remains PENDING.

| Evidence | Outcome / scope |
|---|---|
| Original A2 |Mandatory Services16/17, exit1; active initial case15 count GET fetch failed/UND_ERR_SOCKET; source04a4fc9, Node22.22 host, Docker29.2 recorded, target127.0.0.1:44221/ |
| Historical context |Last count1, then synchronous DKIM restart7133.044383ms; rejection precedes intended capture stop and case15 SMTP submission. Original receiver/socket close cause/tuple/bytes/CLI/container timeline missing |
| A3 |Three selected SMTP/DKIM/Postfix cases pass; idle-close hypotheses not reproduced; not a fix |
| P1 |9 transport controls,54 guards,3 targeted cases pass; idle UND_ERR_SOCKET during later deliberate shutdown differs from the original active GET |
| P2 |18 controls/54 guards/native17 pass, but campaign1 invalidated by new observer143 classifier. Preserved as failure, not retroactively qualified |
| F1 correction |Strict owned-child intent/window/exit-close/stream/first-failure contract; regression1, matrix30, protocol8, actual Docker2, diagnostic18, guards54 pass; observer independent FINDING_CLOSED |
| New canonical |fd708aa, attempt P2-F1-SERVICES-44a15964-e61b-4347-9167-211df21937eb;17/17 and complete campaign0; both observers fully qualify/close; cleanup verified |
| Broader safeguards |Current unit354/354 and contracts24/24 pass; qualified R5 production/security source-equivalent; independent campaign evidence review recorded separately |

Original severity/impact: one mandatory integration scenario failed and blocked qualification. No separately assigned production Postfix severity is established by the old evidence. The original R1 Docker isolation MAJOR is a different finding and remains subject to future final-head independent review. The failing operation was a test HTTP control before the affected case's SMTP submission; no Internet mail delivery failure or lost message is demonstrated.

What is established: current complete canonical Services behavior passes, current observers preserve real failures and correct cleanup, test order1–17 and request JSON completion are visible, no unresolved/cross-case HTTP work appears, and intended idle closure is distinguishable from active failure. The explicit subsequent capture stop in historical case15 cannot cause its preceding GET failure. No current material Services regression or security bypass is observed within this scope.

What remains unknown: the first historical causal event, responsible component, exact pooled socket state, receiver/process/container/network event and reason prior/current runs differed. Timing differed (current DKIM5325.707378ms versus historical7133.044383ms); observer overhead, separate clocks/NAT and the original aggregate's earlier Gateway/system history limit comparison. A small number of non-random, differently instrumented runs cannot estimate a recurrence rate or prove absence of a latent defect. No historical root-cause fix is claimed.

If the issue recurs, a required capture GET can fail and invalidate Services qualification, delaying integration and reducing confidence in the fixture/platform lifecycle. If an underlying production-relevant transport/lifecycle problem exists, its impact cannot be quantified from present evidence. These are unresolved reliability and test-confidence risks. No new network isolation/security defect is demonstrated, and accepting this uncertainty would not waive R1 or any current security gate.

Detection/fail-closed guarantees: direct failed GETs reject with original cause; unsolicited/premature observer exits, stream/parse/stderr/coverage failures and wrong identity remain fatal; Services failure cannot be overwritten by clean shutdown. The qualified local diagnostic entrypoint can retain client/server/case/container/process timelines for subsequent authorized campaigns. It does not add production mail observability. Ordinary existing readiness polling is unchanged: it can catch interim check errors for at most80 attempts with the existing200ms inter-check interval, records those errors, and throws PROTOCOL_READINESS_TIMEOUT on persistent failure. Idle post-completion socket notifications are distinct from a failed request. This is not a new retry remedy.

Reasonable mitigation: preserve the current diagnostics and exact-source failure artifacts for parent qualification; keep mandatory Services/error/security gates; stop on recurrence and investigate its first recorded event. No arbitrary sleep, speculative retry or error waiver is proposed. Continue full parent integration/security/package qualification only under its own authorization; no production rollout is authorized here.

## Explicit owner options

**Option A — Continue investigation.** Require a separately justified new causal question/observation before integration. Additional runs must target new evidence, not repeat unchanged suites to obtain a result. This is the conservative recommendation if historical causal certainty is required.

**Option B — Accept residual historical uncertainty.** Explicitly accept this documented uncertainty based on current valid qualification, while leaving the old incident unexplained and preserving every current mandatory test/security requirement. This may permit the parent qualification process to resume under an explicit owner decision; it does not waive a current failure, authorize push, qualify the whole F1 program, close R1, or invent a Postfix fix. Codex and the independent reviewer have not selected this option.

**Option C — Reject candidate.** Decide that the remaining uncertainty is unacceptable. Preserve commits/evidence and the qualified R5 checkpoint; do not silently rewrite history or discard unrelated work.

An owner response must explicitly identify the selected option and scope. General development authorization, a passing run, or independent evidence validation is not acceptance. Any later acceptance record must preserve the historical ROOT_CAUSE_UNDETERMINED status and record actual owner authorization; no such authorization exists at this handoff.

[Canonical evidence](IL-5.14-R1-F1-E3-A4-P2-F1-canonical-services-campaign.md), [causal limitations](IL-5.14-R1-F1-E3-A4-P2-F1-causal-assessment.md), [regressions](IL-5.14-R1-F1-E3-A4-P2-F1-regression-qualification.md), [observer review](IL-5.14-R1-F1-E3-A4-P2-F1-independent-review.md), [campaign review](IL-5.14-R1-F1-E3-A4-P2-F1-campaign-review.md), [recovery preservation](IL-5.14-R1-F1-E3-A4-P2-F1-recovery-impact.md). SMTP_RECOVERY_UNQUALIFIED, H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED and historical Debian H3 failure remain. No Internet SMTP, spool/queue persistence, general fault tolerance or downstream Debian acceptance is qualified.
