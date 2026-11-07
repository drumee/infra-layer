# P2 causal assessment

Historical Postfix conclusion: **ROOT_CAUSE_UNDETERMINED**. Gate H BLOCKED_EVIDENCE for qualified causal disposition because Gate G is DIAGNOSTIC_CAMPAIGN_INVALID. Mission status FAILED_QUALIFICATION. Separate demonstrated defect: new P2 diagnostic collector shutdown classification; this is not the historical Postfix root cause.

| Record | Observation and causal limits |
|---|---|
| Original A2 |16/17; active initial case15 GET rejects fetch failed/UND_ERR_SOCKET before capture stop/SMTP submission. First receiver/socket/process event absent |
| A3 |3/3 selected success; two idle-close hypothesis probes do not reproduce original failure; cannot explain historical cause |
| P1 |9 known-cause controls,54 guard checks,3 selected cases pass; later idle UND_ERR_SOCKET after complete request during intentional stop, no active failure |
| P2 |Native17/17 and9 application-completed controls observed; no cross-case pending HTTP work. Overall1 due observer termination defect; campaign invalid for qualification |

The source and new traces give no demonstrated shared-capture premature cleanup, unresolved HTTP operation, failed capture process, Docker interruption of an active request, readiness violation or request-handler exception explaining A2. They also cannot rule these out historically: original receiver timeline is absent, current timing differs, and the diagnostic campaign failed its own final lifecycle contract. The new idle notifications occur after completed requests during deliberate stop/recreation. They must not be merged with the historical pre-stop active GET rejection. UND_ERR_INFO is retained separately as a new idle connection notification, not relabeled UND_ERR_SOCKET.

The observer defect has a supported mechanism: an explicitly requested SIGTERM is followed by Docker29.2 CLI code143/signal:null; the new observer accepts only code0 or signal-form SIGTERM for a controlled stop and rejects the actual return. Observer1 then propagates to wrapper1. It occurs after native tests and owned Compose cleanup; it cannot be the cause of a GET in the historical uninstrumented A2 run. This distinguishes a current diagnostic correctness defect from an unverified capture or SMTP defect.

No production/capture correction is justified. Gate I/J NOT_EXECUTED following mandatory stop; no post-failure executable edit, generic retry, sleep, timeout increase, error suppression or altered assertion. Gate L full unit/contracts NOT_EXECUTED. Gate N owner risk package NOT_EXECUTED: required valid complete diagnostic campaign and mandatory safeguard qualification are not satisfied. Do not ask the owner to accept an invalid campaign or infer acceptance from native17/17.

Smallest follow-up boundary is the test-only Docker observer's controlled termination contract. It requires a deterministic requested-stop return143 regression, signal-form completion, unrequested exit143/other nonzero refusals, and incomplete-stream/error propagation controls before correction can be qualified. No such regression or correction has been executed in P2 after the mandatory stop. Any new complete Services attempt needs a separately documented diagnostic purpose after that correction; no unchanged rerun was conducted or proposed to obtain PASS.

Parent handoff remains RECOVERY_QUALIFIED_POSTFIX_BLOCKED_EVIDENCE. Historical R1 independent closure, SMTP_RECOVERY_UNQUALIFIED, H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED and Debian H3 failure remain unchanged.
