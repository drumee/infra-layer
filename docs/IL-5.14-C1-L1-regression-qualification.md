# IL-5.14-C1-L1 final regression qualification

Gate F: PASS. Runtime/package source: ce1ba500d3775d1a7f6ac0156d26b60a4c6ccc4c. Final CI/test-only source: 03e63e114278ee24561847d3a7c88e910f293a08. Debian 12 amd64, UID/GID 1000:1000, Node 22.22.0/npm 11.18.0, Docker 29.2.0. The later change only supplies Git history to hosted tests and adds its workflow assertion; every package member remains byte-identical to ce1ba50. No runtime rerun is attributed to a materially different implementation.

| Actual repository command | Exit | Actual coverage |
|---|---:|---|
| npm test | 0 | 207 passed, no skips; rerun at final CI/test commit after its workflow assertion |
| npm run test:contracts | 0 | 24 passed, no skips |
| node --test test/unit/lifecycle-safety.test.js test/unit/network-attachments.test.js test/unit/qualification-diagnostic.test.js test/unit/security-tooling.test.js | 0 | 38 passed, including 13 network and 13 diagnostic cases |
| node test/network-attachments/real-docker.cjs | 0 | 2 independent complete cycles; 40 counted assertions plus original direct start checks; Redis recovery, changed endpoints, restart, detach/reconnect, required-object absence, ownership refusal and cleanup |
| npm run test:integration | 0 | Canonical sequential gateway 17/17, services 17/17, infrastructure lifecycle 16/16, HTTPS/job fixture 4 scenarios; no skips |
| env IL5_NETWORK_CLIENT=testbox IL5_LAN_ADDRESS=192.168.5.201 IL5_HOST_NGINX=/tmp/drumee-il513-c1-nginx/root/usr/sbin/nginx npm run test:application | 0 | 11 groups, 87 assertions; actual Runtime alpha.4 application, independent LAN refusal, external Nginx HTTPS, native RPC/authorization, restart/update/rollback/interruption recovery, backup/restore, SMTP/DKIM/STARTTLS/auth/relay refusals |

Integration execution: 2026-10-26T09:08:14.142258–09:19:06.073462 UTC. Application execution: 09:19:19.998770–09:21:24.524192 UTC. Exact individual timestamps, commands, source revisions, log hashes and protected Docker snapshots are in the [ledger](evidence/IL-5.14-C1-L1/execution.jsonl). [Application machine report](evidence/IL-5.14-C1-L1/application-report.json).

The gateway suite's actual Chromium launch retains sandboxing and uses the isolated profile and loopback ephemeral debugging transport. Its real browser test passes. The HTTPS/job lifecycle fixture explicitly does not claim full kernel provisioning/recovery. This canonical qualification is not Debian's six-path acceptance or a five-run downstream stability campaign.

Network regression fixtures deterministically cover sandbox-less endpoint identity/refusal and bounded reconciliation. Real daemon timing is not forced to produce a synthetic endpoint in every run. Ordinary container attachment, Redis interruption/restart and foreign-resource/missing-object failures are exercised against the real daemon. Genuine expected negative Docker outcomes remain visible and are distinguished from unexpected command failures.

All suites run once under the stated source, with no failed mandatory run retried. The original failing lint command is the required baseline reproduction, not a passing qualification. D1's historical diagnostic failure, causal reproduction and corrected Docker acceptance remain preserved separately.

No foreign resources are removed. Canonical cleanup verifies ownership; final namespace/name-prefix readback finds no remaining mission containers or networks. All /etc/docker snapshots are unchanged. [Cleanup and identities](evidence/IL-5.14-C1-L1/final-readback.json). SMTP_RECOVERY_UNQUALIFIED and H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED remain.
