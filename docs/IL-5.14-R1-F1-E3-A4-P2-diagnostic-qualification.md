# P2 diagnostic preflight

Pre-campaign Gates E/F passed the listed controls at frozen source `7b5edbd9e9731a51d558a9e11c7def2cfa6c6acb`. Node22.22.0/Undici6.23.0, local isolated loopback fixtures, UID/GID1000. No Docker fixture or canonical Services campaign was used for this preflight.

`python3 test/diagnostics/services-capture/record.py transport-preflight node --test test/diagnostics/postfix-http/diagnostic.test.cjs test/diagnostics/services-capture/preflight.test.cjs` exits0,18/18 PASS, no skips/cancellations:9 unchanged P1 controls plus9 P2 controls. A nested two-case native-hook probe also exits0 and preserves1→2 order; it is included within P2 control8, not counted as two additional top-level controls.

| Control | Verified evidence |
|---|---|
| F1 normal response | Wire body completion followed by original JSON result and application completion; no pending case exit |
| F2 active interruption | Shutdown marker contains active operation; real request rejects with original cause; no fabricated completion |
| F3 idle intentional close | JSON/case completes first; idle socket end carries no pending application request; no request failure |
| F4 server.close after completion | Application completion precedes close request; no fetch error |
| F5 unobserved asynchronous boundary | Deliberately unfinished GET flagged at case end and next case; subsequent completion retains owner5/current6/cross_case:true |
| F6 handler propagation | Reuses P1 fatal handler fixture, uncaught child exit1 observed; client rejects; handler.throw retained |
| F7 normal cleanup | Empty pending list after assertions/case completion and before intentional cleanup |
| F8 native case hooks | Actual preloaded Node test child emits start/completion1→2; canonical default scheduling unchanged |
| F9 bounding/redaction | HTTP Authorization/body sentinels never logged;4096-event bound rejects overflow; raw bounded output retained privately with hash/byte/count receipt |

P1 controls independently retain reset/unavailable/process-exit/persistent-failure behavior. Every controlled negative outcome is asserted, not suppressed. [Original output](evidence/IL-5.14-R1-F1-E3-A4-P2/transport-preflight.log), [P2 control streams](evidence/IL-5.14-R1-F1-E3-A4-P2/p2-controls/F1.jsonl), [P1 control streams](evidence/IL-5.14-R1-F1-E3-A4-P2/p1-controls/E1.jsonl), [bounding receipt](evidence/IL-5.14-R1-F1-E3-A4-P2/p2-controls/bound-receipt.json), [exact commands/source hashes/exits/environment/protected configuration](evidence/IL-5.14-R1-F1-E3-A4-P2/execution.jsonl). Adjacent files contain all other controls.

`python3 test/diagnostics/services-capture/record.py assertion-guards node --test test/unit/harness-preservation.test.js test/unit/harness-reachability.test.js test/unit/refusal-effectiveness.test.js` exits0,54/54 PASS, no skips. [Original guard output](evidence/IL-5.14-R1-F1-E3-A4-P2/assertion-guards.log). No existing source/expectation changed.

Initial independent static review found no concrete pre-campaign blocker and explicitly retained observer timing uncertainty. Full-suite case/request linkage, live Docker streams and safe cleanup must still be validated from the one actual campaign. No cause claim follows preflight success. [Campaign preflight](evidence/IL-5.14-R1-F1-E3-A4-P2/campaign-preflight.json) fixes the competing hypotheses and safety/cleanup boundaries before execution.

## Post-campaign limitation and gate update

The one canonical campaign subsequently exits1 because both new Docker observers reject CLI exit143 after their explicitly requested SIGTERM. This termination-return variant was not covered by the18 HTTP/lifecycle controls. Gate E's complete instrumentation guarantee is therefore FAIL; Gate F retains only its actual18/18 and54/54 preflight results and does not qualify this untested shutdown branch. Gate G is DIAGNOSTIC_CAMPAIGN_INVALID/FAIL. No preflight log or historical output is changed. No correction or rerun follows the mandatory stop. [Campaign report](IL-5.14-R1-F1-E3-A4-P2-canonical-services-campaign.md).
