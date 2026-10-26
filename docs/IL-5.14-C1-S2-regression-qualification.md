# IL-5.14-C1-S2 local regression, security and package qualification

Gates E and F: PASS. Exact executable source f54a6ea3c1d170ee543ef98a890b38f0dd449a55, with loader implementation c2320fd as its ancestor. Debian12 amd64, normal UID/GID1000:1000, Node22.22.0/npm11.18.0, ESLint10.13.0, Docker29.2.0. Subsequent local evidence/report commits do not alter executable or packaged inputs.

| Actual command | Exit | Actual result |
|---|---:|---|
| node --test test/unit/network-loader.test.js test/unit/network-attachments.test.js | 0 | 19 passed:6 secure-loader and all13 original network regressions |
| node --test test/unit/qualification-diagnostic.test.js | 0 | 17 passed, including actual child-process assertion/async/Docker/cleanup/write/close failure controls |
| npm test | 0 | 217 passed, no failures/skips |
| npm run test:contracts | 0 | 24 passed, no skips |
| npm run lint | 0 | 0 errors,0 new findings,28 visible historical warnings;65-entry baseline unchanged |
| node test/network-attachments/real-docker.cjs | 0 | 2 independent full cycles,40 counted assertions plus direct start checks; real Redis interruption/recovery, restart, detachment, ownership/missing-object refusals, cleanup |
| node test/network-attachments/container-health.cjs | 0 | 15 assertions, historical Go-template failure retained and corrected unknown-health/ownership behavior verified |
| npm run test:integration | 0 | Gateway17,services17,lifecycle16,HTTPS/job fixture4 scenarios; actual Chromium sandbox retained, no skips |
| npm run test:application with explicit testbox/LAN/host Nginx inputs | 0 | 11 groups/87 assertions, actual Runtime alpha.4, public/protected RPC, independent LAN refusal, strict HTTPS, lifecycle/recovery/rollback/backup, SMTP/DKIM/STARTTLS/auth/relay refusal |
| npm run test:system-tools | 0 | 12 real trusted-tool/protected-configuration cases |
| python3 -B -m unittest discover -s test/security -p '*_test.py' -v | 0 | 25 filesystem/subprocess/ownership/archive tests, no skips |
| npm audit --include=dev --json --registry=https://registry.npmjs.org | 0 | Root:0 findings |
| npm audit --omit=dev --json --registry=https://registry.npmjs.org | 0 | Production:0 findings |
| npm audit --include=dev --json --registry=https://registry.npmjs.org in test/application | 0 | Private application fixture:0 findings |
| npm run test:package | 0 | 42 whitelisted members, offline consumer/export smoke and deterministic integrity PASS |
| node test/application/package-consumer.js via owned image wrapper | 0 | 8+37 consumer assertions, real non-activating preparation, strict NodeNext types, no production dependencies |
| node test/security/installed-consumer.cjs <offline consumer> | 0 | 4 genuine Docker/ss/OpenSSL/PATH/foreign-CA refusal cases |

Exact commands including environment, UTC start/end, source revision, exit, log SHA256 and protected Docker snapshots are preserved in [the ledger](evidence/IL-5.14-C1-S2/execution.jsonl). Full integration ran once, 2026-10-26T14:26:22.860691–14:37:51.388506 UTC. Real application ran once,14:38:29.830020–14:40:33.612535 UTC. No mandatory failure or acceptance retry occurred. Expected controlled negative child/Docker failures are asserted, not reclassified as successful operations.

## Compatibility and immutable inputs

No public export, declaration, manifest, lock, trusted executable policy, Docker error wrapper or missing State.Health correction changed. The private monotonic readiness implementation is shared by production and tests; the new factory makes clock/delay explicit without exporting a public test API. Its5s deadline,50ms delay and refusal semantics retain actual regression coverage. All affected runtime suites were rerun rather than borrowing L1 results for modified activation code.

Nodemailer10.1.7, smtp-server3.19.24 and nested Nodemailer10.1.4 remain exact and audit-clean. Root lock SHA256 remains29656a3b8e09e4cf640c9b5f5519d47b95bc960abbe5ce33639a93b3a7cd23f3. Clean isolated npm ci reproduces the same5209 file/link entries; no new project dependency is introduced. Node builtin mocking uses the existing supported runtime. The isolated consumer compiler is existing pinned TypeScript5.9.3, Apache-2.0, with registry integrity in its unchanged tool lock; it is not a production or repository dependency. [Input hashes](evidence/IL-5.14-C1-S2/source-inputs.json), [tool provenance](evidence/IL-5.14-C1-S2/tooling-identity.json).

## Unpublished package bytes

The private production readiness helper adds one member. Explicit package allowlisting is extended only for internal/network-readiness.js; test loaders/mocks/diagnostic helpers remain excluded from publication. This is not a scanner exclusion. Every archive member is byte-compared with qualified source.

| Property | Current local review archive |
|---|---|
| Members / compressed size | 42 /103349 bytes |
| SHA256 | 3f6bdc655180ffa8b2a2f0746583b02b377fcbf3da2fc473761d3cbeae56e54b |
| SRI | sha512-sQF88I/AJUt2kHEoEQawYlLj9okhwvT/tmOMecB6Jfsvv5icxSsFUQxovw1Wue59SBuGJrcufst5LRU0mqM7IQ== |
| Prior L1 archive SHA256 | cb1fed84867a2f0f52c95dcd3649e7e1a6193e4334614b824a4112816273297d |
| Production dependencies | none |
| Public API/type compatibility | installed exports and strict NodeNext consumer passed |

The local archive retains development manifest version metadata; it is not an approved alpha.3 replacement and is never published. No new release version or tag is assigned. The registry alpha.3 artifact was independently read and retains101778 bytes and SHA256 c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e. [Candidate member receipt](evidence/IL-5.14-C1-S2/candidate-receipt.json), [published artifact readback](evidence/IL-5.14-C1-S2/published-alpha3-readback.json).

Final readback verifies9 owned namespaces and their children/declared network variants absent. Protected /etc/docker metadata/content snapshots remain unchanged across every receipt. Only independently owned fixtures/images are cleaned up; no foreign Docker resource, Debian, Server Runtime or Oxy-form is modified. SMTP_RECOVERY_UNQUALIFIED and H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED remain. Actual Internet delivery/spool recovery and downstream Debian stability qualification are not claimed.

These local passes do not resolve the hosted findings by inference. Exact-head Quality,CodeQL and SonarCloud security A/reliability A under all unchanged conditions remain mandatory before final review readiness.
