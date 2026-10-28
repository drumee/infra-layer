# Independent observer shutdown review

**FINDING_CLOSED — Gate F PASS** for the original test-only observer finding P2-IR-1 at executable `fd708aaf914accc93aa42fcd705740db390721d5`. No new MAJOR or BLOCKER was established in this observer correction review. Starting checkpoint21e2268 and qualified R5 executable72f4c67 are preserved. This separately scoped reviewer did not implement the correction, edit source, run Docker, run Services, or change the PR.

## Original failure and independent reproduction

I read the P2 independent MAJOR finding and original main/ephemeral terminal records. Both old collectors recorded143/null after stopping:true and empty final buffer, then returned1; the orchestrator retained1 despite native Services17/17. The old source rejects that numeric representation at its close predicate. The old evidence did not record the CLI PID, kill result, separate exit, stderr or full stream closure, so it cannot retroactively satisfy the stronger contract.

I independently ran the hash-pinned actual historical-module regression, **1/1 PASS, exit0**. The test executes the trusted original7b5edbd module under a fixed controlled child adapter; its old subprocess exits1 for the intended143/null case, as expected. It then verifies the corrected lifecycle accepts the properly completed/attributed direct-child representation. This is an executable reproduction of the original classification defect, not a reproduction of the historical Postfix GET.

I independently ran the full D1–D30 mutation matrix, **30/30 PASS, exit0**, and protocol/order/coverage/readiness/bounding checks, **8/8 PASS, exit0**. Exact commands, source, UTC times, UID/GID1000, exits and log hashes are in execution.json; original outputs are adjacent. All negative assertions check the intended refusal or first-failure disposition. No independent Docker or canonical Services campaign was run.

## Corrected attribution and result contract

The runtime process chain is a fixed Node parent/private IPC fork → Node observer → directly spawned `/usr/bin/docker events` child. Numeric143 is accepted only within the latter's held ChildProcess identity and exact Docker-events executable/argv contract, after successful spawn, required collection, prior controller completion intent, own CLI SIGTERM intent and successful same-child kill result. The outer Node observer must independently exit0/close0 with drained wrapper streams and matching IPC identity. Wrapper143 is rejected.

The classifier retains its first error. Premature0/143, unsolicited143/SIGTERM, wrong child/PID, failed signal, SIGKILL, unexpected nonzero, missing data, spawn/stream/collection/parse errors, duplicate stop and timeouts cannot become success through later cleanup. Exit alone does not qualify: matching close plus stdout/stderr end/close and no partial event or prior error are required. A Services failure or unrelated campaign failure remains primary even when observer cleanup is accepted. Both mandatory observers are required by the actual campaign result helper.

I inspected the real Docker probe's complete raw records and result. Node observer2546681 owns direct CLI2546688. Sequence9 marks collection complete,10 stop requested,11 records SIGTERM intent to2546688,12 records successful delivery,13–16 record both stream ends/closes,17/18 record CLI exit/close143/null,19–21 classify controlled completion. The parent separately records wrapper exit/close0 and both wrapper streams complete. The producer container's required create/start/die/destroy and owned cleanup are present. The second actual Docker probe records stderr bytes and retains OBSERVER_STDERR/failure with observer exit1. Those are implementing-run2/2 results inspected independently, not new reviewer Docker executions.

## Required guarantees

| Review responsibility | Assessment |
|---|---|
| Exact source and original P2 finding | Verified HEADfd708aa, original defect predicate/records and pinned historical replay |
| Controlled143 versus signal-form completion | Matrix D2/D3 and inspected direct Docker positive support both; no global143 or signal-only bypass |
| Unsolicited/premature termination | D5–D9 fail with expected reasons; live collector cannot declare collection complete without required evidence |
| Earlier collection/stream/error masking | D10–D12/D20/D28 and actual stderr negative preserve first fatal result |
| Services/result precedence | D18/D25/D26 and campaignResult keep native/non-observer failure primary; cleanup never writes a successful override |
| Process identity and wrappers | D13/D27/D29 plus fixed fork/direct CLI source bind object/PID/argv and reject wrong target or unverified wrapper |
| Stream closure/order | D22 and protocol incomplete-stream case prohibit final success before both end+close and matching exit/close |
| Coverage/readiness | Private atomic receipt is checked by an event-driven barrier; final17-case/request/server and owned container lifecycle coverage is separately mandatory |
| Data/security/bounds | Event action suffixes/payload attributes are excluded, stderr retained only as count/hash, hard limits remain; no retry/sleep or production network change |
| Qualified R5/canonical assertions | Independent Git diffs versus72f4c67 are empty for production, recovery, canonical Services/capture, guards/network acceptance, dependencies and scanner/tooling files |
| Remaining scope | Services campaign and campaign evidence review still required; historical Postfix cause remains unknown; no owner risk accepted |

## Precision and limits

Most failure mutations use deterministic child lifecycle models, as permitted; they do not claim all failures were induced in real host processes. Timeout refusal is simulated and statically wired to bounded watchdogs; no successful forced cleanup of an uncooperative SIGTERM-ignoring process is claimed. No SIGKILL escalation is introduced. A remaining process would invalidate cleanup/qualification.

COLLECTING means CLI spawn and pipe attachment, not a fictitious daemon subscription ACK. Final required coverage (18 main/3 ephemeral creates, inspected identities and complete observed owned lifecycles) remains necessary. It is a scoped lifecycle contract rather than an all-daemon-event claim. Exact full-suite coverage still needs review from the forthcoming actual campaign.

Two wording details should remain explicit in the parent reports. The classifier's duplicate normal stop sends no second normal signal; a fatal worker IPC error may still issue best-effort abort SIGTERM to the same held child while retaining failure. Also, target-specific `pid` fields override the logger's base emitter PID on some records. Observer/CLI receipts, explicit observer_pid/cli_pid and role/process_instance/sequence disambiguate the two identities; no cross-process millisecond causality is inferred.

This disposition closes **only P2-IR-1 observer misclassification**. It does not qualify the complete Services campaign, close the historical Postfix finding, qualify SMTP recovery, or accept residual risk. Parent may proceed through its explicitly authorized Gate G only after its other prerequisites and exact source freeze remain satisfied.
