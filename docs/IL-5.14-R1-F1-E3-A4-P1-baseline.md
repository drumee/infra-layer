# P1 baseline and historical reconstruction

Gate A PASS. Repository `drumee/infra-layer`, branch `fix/il514-c1-network-attachment-identity`, clean starting HEAD `9d8eebbb107ad3d46a189ae9d7d308d436b8e7ce`. Its direct parent is qualified executable `72f4c67254561ca5c4c47a6a65e9620e57da7841`; the checkpoint adds only E1 documentation/evidence. No reset, checkout replacement or commit deletion occurred. Production, recovery, network, canonical Services and assertion guard bytes match the qualified executable. PR20 read-only connector verification: OPEN, base `main`, head `cd9b8322bd7eef3b4094710ec4ea26be94f08922`, updated 2026-10-26T14:58:20Z. No PR mutation is authorized.

All 104 entries in the A2/A3/E1 historical hash manifests were found and matched, including original private logs. [Integrity receipt](evidence/IL-5.14-R1-F1-E3-A4-P1/historical-integrity.json), [baseline/environment/source equivalence](evidence/IL-5.14-R1-F1-E3-A4-P1/baseline.json). Historical logs remain in their original private directories; only a bounded original failure excerpt is added here. Historical independent E1 decision remains FINDING_CLOSED; 55 focused, 354 unit, 24 contracts and 38 Docker assertions belong to executable72f4c67, not newly run P1 tests.

| Field | Original A2 failure |
|---|---|
| Preserved results | POSTFIX_SERVICES_16_OF_17; POSTFIX_HTTP_CAPTURE_UND_ERR_SOCKET |
| Test | Postfix queue survives capture outage and mail container recreation, then retries locally without key regeneration |
| File/location | test/services/services.test.js:151; first capturedCount at line152; fetch helper line50 |
| Command/exit | npm run test:integration; aggregate exit1; Services child16/17, exit1 |
| Source | 04a4fc9f1196ef42aec9428144609735e00ceb4a |
| Host runtime | Node22.22.0, npm11.18.0; current identical Node binary reports built-in Undici6.23.0; original runtime versions map was not recorded |
| Docker | Historical reports record29.2.0; exact failing instant daemon snapshot unavailable |
| Endpoint/expectation | GET http://127.0.0.1:44221/ mapped to capture8025; JSON count expected, then original queue assertions; HTTP handler returns200 |
| Capture process/container | Node in dedicated capture service; project drumee-il2-test-c8eb299f; exact PID/container ID unavailable |
| Last success | case14 passed DKIM signature verification, synchronous dkim restart and unchanged key fingerprint; last successful count1 at16:16:25.992Z |
| Timing | dkim restart16:16:26.317–16:16:33.450Z (7133.044383ms); capture error16:16:33.454Z on2026-10-27 |
| Error/cause | TypeError: fetch failed, node internal Undici14902:13; capturedCount50:62, TestContext152:79; trace code UND_ERR_SOCKET. Full nested cause/message/socket unavailable |
| Server logs/events | Tail of later combined logs retained, but no HTTP request/socket/close timeline at failure; relevant daemon events unavailable |
| Socket | UND_ERR_SOCKET; original tuple, connection ID, byte counts, FIN/RST evidence unavailable |
| After failure | later capture count succeeds; final mail/dkim/capture running/healthy, OOMfalse,restarts0; these snapshots cannot explain earlier socket closure |
| Cleanup | runner cleanup.confirmed16:16:47.938Z; A2 readback confirms owned resources removed |

[Original failure excerpt](evidence/IL-5.14-R1-F1-E3-A4-P1/original-failure-excerpt.log). Complete original log SHA256 `e28aa1ded3cf6a7df838c79d82a3f1e1a337f3e7ba2a1e1ea429c242992c5d3b`; preserved A2/A3 ledgers contain exact commands and original paths.

A3 actual-source attempt A3-POSTFIX-FOCUSED-DIAGNOSTIC-1 used source `964e3a4a09be14f7951246d65dcc936bc29ab1c3`, whose Services bytes equal A2 and the P1 starting checkpoint. The fixed wrapper selected SMTP, DKIM and Postfix cases in original order. Child command: `/usr/bin/node --require /tmp/drumee-il514-r1-f1-e3-a3-pw32_qs8/services-observer.cjs --test --test-name-pattern=SMTP STARTTLS/authenticated|OpenDKIM signs|Postfix queue survives /home/somanos/github/infra-layer/test/services/services.test.js`. Wrapper: `node /tmp/drumee-il514-r1-f1-e3-a3-pw32_qs8/services-diagnostic.cjs`. Exit0,3/3,14 not selected; HTTP200 after restart, no original error. Preserve A3_POSTFIX_TARGETED_3_OF_3_PASS as diagnostic non-reproduction, not resolution. Log SHA256 `3071573f3701b9ae9a9229dd979d05ec4c0f753b8ef1e9466502233ae0f863b1`.

A3 direct-host idle-close hypothesis probe exited1 (expected error did not occur); Docker-published variant exited0 with hypothesisReproduced:false. Both remain historical failures/non-reproduction evidence, not a causal fix. A4 stopped at failed recovery before any Postfix investigation. E1 subsequently qualified recovery only. Required reports and their linked evidence have been read; no historical result is rewritten.
