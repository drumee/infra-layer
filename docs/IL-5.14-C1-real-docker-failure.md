# IL-5.14-C1 real Docker qualification stop

**FAILED_QUALIFICATION. S1 remains NODEMAILER_SECURITY_QUALIFIED.** The first real network qualification attempt exits1 with ERR_ASSERTION. It is not retried. No full parent regression,package qualification,final audit,push or PR follows.

Implementation source:ad3fd8c7ef765f3718e6e06154b9fdd44786ed22. Real test source:de5e260ed69fd875d12e7782e8a7335879f239b7. UID/GID1000:1000,Node22.22.0,Debian12 amd64,Docker29.2.0. Command and UTC interval:

```sh
node test/network-attachments/real-docker.cjs
# 2026-10-25T16:10:52.652127–16:11:08.799625 UTC, exit 1
```

Pinned Redis image:redis@sha256:ff02b58f971e7d7d156a1267e283fcbbeee91773b6aa36c49dac28ecfe28eadf. The script planned two independent owned cycles. Only the first namespace,drumee-il514-net-2c5e2fec,is observed;no complete cycle receives a recorded PASS. [Exact command/protected snapshots](evidence/IL-5.14-C1-network/execution.jsonl), [original unmodified stderr log](evidence/IL-5.14-C1-network/real-network.log), [machine stop](evidence/IL-5.14-C1-network/stop-receipt.json).

## What the retained evidence establishes

The test successfully reached creation/start of its unauthorized-ownership fixture after Redis startup,authenticated data operations,SIGKILL recovery,restart and explicit detach/reconnect steps. Source ordering and Docker events constrain the failure to a later assertion;they do not preserve its exact expected/actual values. Seventy-five retained daemon events identify the mission's Redis container9989bff33d86d5a1e89d82c2b21910ba0dd754b351398c1fff0fc7357283f29d and intruder fixture4648ba4138cc657e9f2e1fd4809703288d4330a125f956e987b95bd882aa144c. [Original events](evidence/IL-5.14-C1-network/failed-real-network-events.jsonl), [compact timeline](evidence/IL-5.14-C1-network/failed-event-timeline.json).

The intruder is a **mission-created negative fixture**,marked org.drumee.qualification with this unique project. Its canonical owner label intentionally differs. It is not a foreign user's resource. Cleanup verifies the separate mission marker before stopping/removing it. Docker's normal stop timeout eventually sends SIGKILL to its shell/sleep process;this is visible in the event timeline and is not hidden as a graceful exit. Redis stops normally during cleanup.

The new real-test catch printed only error.code,losing the assertion message,stack,phase,expected/actual values and in-memory command/result records. That is a diagnostic defect in this test harness. The cause of the failing assertion is **not established** from the retained evidence. Do not infer that it is merely a harmless test expectation,or conversely that production ownership validation failed. A later read-only inspect of the known removed Redis ID confirms Docker status1/object_missing classification,without rerunning lifecycle or converting the failed attempt into success.

## Cleanup and qualification limits

Read-only post-stop queries find no matching mission containers,network or temporary directory. Protected /etc/docker snapshots match before/after the failed attempt. No unrelated resource or host security setting is changed. [Readback](evidence/IL-5.14-C1-network/post-stop-readback.json), [removed-container diagnostic](evidence/IL-5.14-C1-network/removed-container-diagnostic.json).

The13 focused unit tests pass separately at ad3fd8c. That does not qualify real Redis lifecycle,foreign-resource refusal,independent repetition or the new production activation wait. Total assertions in the failed real run were not persisted;no invented count or complete-cycle PASS is assigned. Sandbox-less timing in the real daemon was not captured as a success result either.

The mandatory stop is retained. Next diagnostic prerequisite is a safely instrumented real harness preserving phase,original assertion identity/values and relevant sanitized state before cleanup,under an explicitly resumed qualification. Do not weaken the assertion or silently rerun this attempt. The production correction remains local and unqualified. H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED and SMTP_RECOVERY_UNQUALIFIED remain;this failure does not retrospectively identify H1.
