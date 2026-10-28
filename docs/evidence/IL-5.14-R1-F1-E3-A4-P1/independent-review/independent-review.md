# Independent P1 local review

Disposition: **BLOCKED_EVIDENCE**. Gate M is BLOCKED; the original Postfix-associated HTTP finding is not independently closed. Reviewed diagnostic executable: `5954bc121b3790d405aa48bf724a624c259f30a2`. Qualified recovery executable: `72f4c67254561ca5c4c47a6a65e9620e57da7841`; starting checkpoint: `9d8eebbb107ad3d46a189ae9d7d308d436b8e7ce`. Review is a separately scoped agent assessment, not implementing-agent self-certification. No Docker or integration test was rerun by this reviewer.

## Evidence and source identity

I independently read the original A2 integration log in its preserved private directory and verified SHA256 `e28aa1ded3cf6a7df838c79d82a3f1e1a337f3e7ba2a1e1ea429c242992c5d3b`. It records case15 failing `fetch failed`, with the canonical capturedCount stack before capture stop/SMTP submission; the separate original trace supplies `UND_ERR_SOCKET`. The original nested socket cause/receiver close lifecycle remains absent. I read the A3 focused log and independently matched SHA256 `3071573f3701b9ae9a9229dd979d05ec4c0f753b8ef1e9466502233ae0f863b1`; its3/3 PASS is non-reproduction. Original source identities04a4fc9/A3-964e3a4 are preserved separately from P1.

I inspected the new architecture, hypotheses, instrumentation and all seven diagnostic/recording source files; independently checked Git source differences and current Node versions; read controlled E1–E9 traces, the9/9 diagnostic log,54/54 assertion-guard log, targeted preflight, execution ledger and cleanup readback. Exact read-only commands/results and independently computed source hashes are in `read-only-commands.json` and `source-and-evidence.json`. The two historical source logs are preserved outside Git, and their hashes are independently rechecked here. No independent test counts are invented:9,54 and3 are implementing-run evidence inspected by this reviewer.

The only executable additions relative to qualified72f4c67 are the opt-in `test/diagnostics/postfix-http` modules. Current production/lifecycle/network/canonical Services/guard source equivalence independently holds. No rollback, activation, Docker validation, ownership, endpoints, configured multihoming or final recovery checks were changed. R5 historical qualification remains applicable to its unchanged source; this is not a new R5 Docker execution.

## Actual targeted result and interpretation

Attempt `P1-POSTFIX-01d146db-98ca-4c0f-a970-178fc80b8b13`, project `drumee-il2-test-27a13e1d`, ran only the original SMTP/DKIM/Postfix cases at5954bc1, exit0,3/3. All5 client capture requests have headers/body completion; no `client.request.error` or `client.fetch.error` occurs. The relevant initial post-DKIM request3 reuses client connection1 and completes200/body. The server records13 handler returns and response finishes, including healthchecks, and two capture process incarnations with intentional stop/start and exit0. These observations are consistent with a successful diagnostic; they do not reproduce the historical failing request.

The trace **does contain `client.socket.error: UND_ERR_SOCKET`** on connection1 at2026-10-28T11:00:13.213Z. It follows request3 body completion at11:00:12.743Z and the intentional capture stop. All request operations still succeed. This is an observed idle-socket shutdown event, not a hidden failed fetch and not the original pre-stop failing count. Its presence demonstrates why the final socket code alone is insufficient to classify the historical incident. It must not be erased or summarized as an entirely error-free socket trace.

Historical DKIM restart took7133.044383ms; this run took5313.207987ms. The new timing and observer overhead do not establish identical historical conditions. They cannot falsify all idle-close/race hypotheses, nor prove why A3 passed. Historical first causal event remains **ROOT_CAUSE_UNDETERMINED**. No positive root-cause classification, smallest correction or failing-before/passing-after historical regression is justified. No second unchanged attempt or full Services campaign is warranted by this result.

## Review of requested guarantees

| Responsibility | Independent assessment |
|---|---|
| Exact source, original failure and A3 results | Verified with Git/source hashes and raw historical log hashes; distinct execution revisions retained |
| HTTP architecture and hypotheses | Correctly separate client HTTP observation, capture HTTP handler, orchestration, Docker and SMTP; plausible hypotheses remain UNDETERMINED |
| Causal observations | Public server/socket/process events supplement experimental Undici channels; process-instance UUIDs avoid PID-reuse confusion; controlled fault signatures are present |
| Handler and fetch propagation | Sync handler rethrows original exception; fetch delegates once and rethrows original rejection object/cause; monitors do not consume default fatal errors |
| Regression and correction | Historical cause unproved; no correction or historical deterministic regression claimed; correction/focused/full acceptance gates appropriately stop |
| Transport failure controls | E2/E3/E4/E5/E6/E7/E9 retain explicit failures and expected process exits; one request per controlled case, no hidden loop or fabricated success |
| Retry/sleep/assertions | No new retry, sleep, timeout increase or assertion/expected-result weakening; existing canonical readiness polling is unchanged |
| Resource and security boundary | Owner-filtered read-only Docker observations; unchanged canonical collision/cleanup commands; no networking broadening, secret mount change or foreign-resource mutation |
| Cleanup | Reviewed cleanup receipt shows empty owned containers/networks/images, unchanged preexisting container/network sets; both actual capture process incarnations exit0 |
| Diagnostic data | Controlled authorization sentinel absent from retained trace; logger emits metadata only, no request/response headers, messages or secret file content |
| R5 and assertion guard | Source-equivalent recovery/security paths;54/54 existing guard/reachability/refusal results inspected; no new R5 qualification claim |
| Remaining material finding | Original causal evidence remains a closure blocker. No newly demonstrated MAJOR code or security defect is established by this limited review. Original R1 campaign finding remains outside P1 closure |

## Residual diagnostic limits

- Synchronous event writes and a Promise continuation perturb timing; functional delegation is preserved, but uninstrumented timing equivalence is not established.
- `mono_ns` and sequence are reliable within each process; UTC/daemon clocks do not prove millisecond cross-process causality. Docker `timeNano` passes through JavaScript Number before String in this observer, so recorded daemon nanoseconds lose precision and must not be used as exact nanosecond evidence.
- Docker publication/NAT prevents assuming host and container socket tuples are directly identical. Attribution needs the process/endpoint/container context; no fabricated exact cross-NAT mapping is claimed.
- The fixed synchronous capture handler is instrumented; generic asynchronous handler rejection coverage is not claimed. Header emission is reflected by handler-return flags/response finish rather than a separately instrumented writeHead event.
- The original socket cause chain is unavailable, and the new request succeeded. The new process/receiver timeline cannot be backfilled into the original failure.
- Only3 of17 Services cases were selected; no complete Services, corrected focused, full unit/contract or package qualification occurred in P1. Old R5 totals remain historical.

The defensible handoff is **RECOVERY_QUALIFIED_POSTFIX_BLOCKED_EVIDENCE**. No correction, push, merge, publication or broader qualification follows. This independent review confirms the blocked disposition; it does not return FINDING_CLOSED.
