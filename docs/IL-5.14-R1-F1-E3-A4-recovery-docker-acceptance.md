# A4-R5-RECOVERY-1 — FAIL

Exactly one new real-Docker recovery attempt; no rerun. Command:

```text
env IL514_DIAGNOSTIC_DIR=/tmp/drumee-il514-a4-fl8t4b6j/recovery-docker node test/network-attachments/rollback-real.cjs
```

Started2026-10-27T22:15:27.321753+00:00, ended22:15:37.957513, exit1. Tested51cfd7b plus precisely archived candidate bytes. Fresh0700 diagnostic preflight passed. Daemon29.2.0, clientNode22.22.0, owned projectdrumee-il5-8169752d.

Initial real canonical application activation succeeded and was ready. Snapshot-substitution refusals, same-owner undeclared extra network refusal, missing membership refusal and reconnection were exercised. Crash candidate activation failed as expected and inspectDeployment returned ready=false. Raw degraded observation: container21c5cef1dd727415bbcb1d199c38c1666cca7956c0a0924eca14f67f8905e67b, State.Running=true, Restarting=true, Pid0, ExitCode1, exact expected configured networkdrumee-il5-8169752d-application with IDffe42e5ceffbb3896caba869eb07cd9af19b1b3594d1a84d902117ab9b160f2d, EndpointID="". Normal checkNetworks refused as intended.

**Mandatory failure:** actual L.rollbackDeployment returned NETWORK_ATTACHMENT_MISMATCH instead of a ready recovered deployment. Stack: containerNetworks docker.js:134 → validateNetworks → checkNetworks → networksReady → activation.js:165 → activateRollback → recovery.rollbackDeployment. That stack is the ordinary preflight branch, not authorization helper. The exact internal selector values were not recorded; do not invent them from an earlier Docker snapshot. No container-replacement success or final readiness is claimed.

The report counts20 assertions, including cleanup; it is not20 passing recovery assertions. Last recorded completed step is initial-operational. Recovery operation and later expected Docker-operation-failure control were not completed. Original raw failure/result/trace/log are preserved without rewriting.

Cleanup PASS: exact deployment owner file/project/UID verified before owned cleanup; own containers/network/extra-network and exact owned image removed. Readback confirms no matching resources. /etc/docker snapshots unchanged. No foreign resources modified. Stopped immediately after this failure; no new Docker acceptance or Workstream P followed.

Evidence: [failure](evidence/IL-5.14-R1-F1-E3-A4/recovery-docker/failure.json), [raw report](evidence/IL-5.14-R1-F1-E3-A4/recovery-docker/result.json), [cleanup readback](evidence/IL-5.14-R1-F1-E3-A4/cleanup-readback.json), [preflight](evidence/IL-5.14-R1-F1-E3-A4/recovery-preflight.json).
