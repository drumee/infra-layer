# IL-5.14-C1-S1 mail compatibility

Gate S1-E: PASS at executable sourcee914db67e7b0fec97df89ad1875c18cc984efcd8 and the exact locks recorded in qualified-inputs.json. Node22.22.0/npm11.18.0,UID/GID1000:1000,real local Docker daemon;protected /etc/docker snapshots match before/after every recorded command. [Exact execution ledger](evidence/IL-5.14-C1-S1/execution.jsonl).

| Command | Exit | Actual coverage |
|---|---|---|
| `node --test test/unit/nodemailer-compatibility.test.js` |0 |4 tests:all three advisory recipient examples,MIME/envelope/DKIM generation,strict real STARTTLS/auth/pooling/recipient refusal,greeting timeout and connection cleanup |
| `npm test` |0 |180 unit tests,0 failures/skips;includes the four new compatibility tests and existing mail/TLS/security contracts |
| `npm run test:services` |0 |17 real service integration tests,0 failures/skips;SMTP authentication and STARTTLS,relay refusal,cryptographic OpenDKIM verification,controlled capture delivery and strict outbound TLS/auth;owned cleanup confirmed |
| `env IL5_NETWORK_CLIENT=testbox IL5_LAN_ADDRESS=192.168.5.201 IL5_HOST_NGINX=/tmp/drumee-il513-c1-nginx/root/usr/sbin/nginx npm run test:application` |0 |11 groups/87 assertions,actual published Runtime alpha.4 application and updated private Nodemailer fixture;real SMTP/DKIM/STARTTLS/refusal,loopback/independent LAN refusal,strict host Nginx CA/SAN,lifecycle/rollback/interruption/restore/foreign-resource contracts;owned cleanup confirmed |

The new SMTP compatibility server uses a private temporary key/certificate,explicit trusted CA/hostname verification and loopback binding. Two pooled submissions reuse one authenticated TLS connection. Partial recipient refusal preserves accepted/rejected results;all-recipient and authentication failures retain their SMTP status/code. A server withholding its greeting causes explicit ETIMEDOUT. Temporary sockets and keys are cleaned;no key is logged or packaged.

Real service project:drumee-il2-test-efbba8b2,2026-10-25T15:54:10.205230–15:55:11.437005 UTC. Application project:drumee-il5-33187e6b,15:55:39.606248–15:57:40.410482 UTC. The independent client is the previously authorized testbox qualification host;no production service or unrelated resource is changed. [Application result](evidence/IL-5.14-C1-S1/application-result.json).

The existing service scenario also exercises a limited local Postfix queue/capture-outage case. This does not establish full durable SMTP spool recovery,Internet delivery or broader downstream recovery support. **SMTP_RECOVERY_UNQUALIFIED** remains. Application SMTP recovery is explicitly refused by its existing contract;no assertion was relaxed. No real browser/kernel/network-fix qualification is claimed by these mail results. Full network-affected Infra suites remain required after the conditional canonical correction.
