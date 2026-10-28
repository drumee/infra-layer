# P2 baseline

Gate A PASS. Clean initial checkout `ee53ed9448cd89f1cc84580863600aa47d9b335e` on `fix/il514-c1-network-attachment-identity`, origin drumee/infra-layer. Qualified R5 executable `72f4c67254561ca5c4c47a6a65e9620e57da7841` is an ancestor; P1 executable `5954bc121b3790d405aa48bf724a624c259f30a2` adds only opt-in test diagnostics; ee53ed9 adds reports/evidence only. No history reset or commit loss. Runtime, canonical Services, guards, dependencies and network/recovery code match72f4c67. [Baseline/environment](evidence/IL-5.14-R1-F1-E3-A4-P2/baseline.json).

Read-only PR20 verification: OPEN, base main, head cd9b8322bd7eef3b4094710ec4ea26be94f08922, updated_at2026-10-26T14:58:20Z. [Receipt](evidence/IL-5.14-R1-F1-E3-A4-P2/pr-initial.json). No remote mutation.

139 manifest entries across A2/A3/E1/P1 are accessible and hash-verified, including private historical raw logs. [Integrity receipt](evidence/IL-5.14-R1-F1-E3-A4-P2/historical-integrity.json). P1 final decision, independent raw review, source/evidence matrix, original A2 log/cause excerpt, A3 Postfix reports and E1 final qualification were read/referenced. No historical report or output is rewritten.

| Historical record | Source and command | Disposition retained |
|---|---|---|
| Original A2 Services |04a4fc9f1196ef42aec9428144609735e00ceb4a; npm run test:integration → node test/all-integration.js → separate node test/services/run.js → node --test test/services/services.test.js |16/17, exit1; initial case15 GET127.0.0.1:44221/ rejects fetch failed/UND_ERR_SOCKET before stop/SMTP; raw SHA256 e28aa1ded3cf6a7df838c79d82a3f1e1a337f3e7ba2a1e1ea429c242992c5d3b |
| A3 targeted |964e3a4a09be14f7951246d65dcc936bc29ab1c3; fixed wrapper services-diagnostic.cjs selects SMTP/DKIM/Postfix |3/3 PASS, non-reproduction; raw SHA2563071573f3701b9ae9a9229dd979d05ec4c0f753b8ef1e9466502233ae0f863b1 |
| P1 controls |5954bc1; node --test test/diagnostics/postfix-http/diagnostic.test.cjs |9/9 PASS; intentional failures asserted |
| P1 preservation |5954bc1; node --test test/unit/harness-preservation.test.js test/unit/harness-reachability.test.js test/unit/refusal-effectiveness.test.js |54/54 PASS |
| P1 targeted |5954bc1; node test/diagnostics/postfix-http/services-attempt.cjs /tmp/drumee-p1-jipiesom/postfix-attempt-1 |3/3 PASS, five completed HTTP controls |
| P1 idle close |Same targeted attempt; connection1 after request3 completed |UND_ERR_SOCKET during intentional capture stop, no failed fetch; cannot explain historical pre-stop GET |
| R5 |72f4c67; see E1 execution ledger and independent FINDING_CLOSED |55 focused/354 unit/24 contracts/38 Docker assertions; historical qualified recovery, not rerun by baseline work |

Original root cause and full receiver/socket cause chain remain unavailable; exact original capture PID/container ID and Docker event stream remain unavailable. Host Node22.22.0 historical/current; current host reports Undici6.23.0. P1 measured pinned capture Node22.23.3/Undici6.28.1; original capture version map was not logged, so no invented historical map. Docker29.2.0 recorded historically and verified currently. Preserve POSTFIX_SERVICES_16_OF_17, POSTFIX_HTTP_CAPTURE_UND_ERR_SOCKET, A3_POSTFIX_TARGETED_3_OF_3_PASS and all P1 independent limitations.
