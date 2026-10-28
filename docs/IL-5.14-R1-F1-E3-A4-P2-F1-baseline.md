# Observer F1 baseline and finding reconstruction

Gate A: original P2-IR-1 rejection is conclusively established by preserved source and records; executable regression follows. Clean initial HEAD `21e22681ce5c6f8cc0bbccc791c5adf4f5c12be5`, branch fix/il514-c1-network-attachment-identity, origin drumee/infra-layer. Its parent is diagnostic executable `7b5edbd9e9731a51d558a9e11c7def2cfa6c6acb`;21e2268 changes reports/evidence only. Qualified R5 `72f4c67254561ca5c4c47a6a65e9620e57da7841` remains source-equivalent in production/recovery/canonical Services/guards/dependencies. All commits preserved; no reset. [Baseline/environment](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/baseline.json).

188 historical manifest entries across A2/A3/E1/P1/P2 were accessible and hash-verified, including private original logs. [Integrity receipt](evidence/IL-5.14-R1-F1-E3-A4-P2-F1/historical-integrity.json). PR20 remains OPEN/base main/head cd9b8322bd7eef3b4094710ec4ea26be94f08922, updated_at2026-10-26T14:58:20Z; read-only verification, no PR mutation.

P2 final decision and independent P2-IR-1 MAJOR finding read in place. Original attempt `P2-SERVICES-9db223fe-ad0c-469a-8e5c-1b17500358b7`; Node orchestrator PID2450171 starts Node collectors2450515/2450516. Each collector directly spawns /usr/bin/docker events --since <attempt-start> --filter label=com.docker.compose.project=<main-or-ephemeral> --format {{json .}}. Main project drumee-il2-test-1f8d59c5; suffix -ephemeral. Controller command: node test/diagnostics/services-capture/campaign.cjs /tmp/drumee-p2-7ex9xczy/canonical-attempt-1. Node collector command follows source argv project, started, file, attempt; exact CLI child PID was not recorded.

| Field | Preserved P2 record |
|---|---|
| Controller origin | After Services terminal result and owned Compose down, source calls observer.kill(SIGTERM) on the held Node child object |
| Controller sequence/time | cleanup.compose.completed sequence21 at13:28:33.962Z, then source signal loop; no per-send controller intent/result row |
| Node collector received signal | collector.stop.requested at13:28:33.973Z; main sequence645, ephemeral34 |
| CLI signal request | Source SIGTERM handler sets stopping=true and calls cli.kill(SIGTERM); return value and CLI PID unavailable |
| CLI termination observation | collector.completed main646/ephemeral35 at13:28:33.975Z: code143, signal:null, stopping:true, partial_line:false |
| exit versus close | P2 records CLI close only, not separate CLI exit; parent records Node exit1, not separate Node close |
| Collection state | Main643 and ephemeral32 Docker event rows, including created/start/die/destroy for18/3 containers; all observed creates have destroy. No explicit completion acknowledgment or strict coverage contract |
| Streams | stdout buffer empty; stderr was ignored by P2; EOF/close and stream-error states unavailable |
| Prior errors | No logged collector error; absence of stderr/stream records prevents claiming none conclusively |
| Services | Native17/17 PASS, child exit0 |
| Campaign | Both Node collectors exit1, parent exit1; DIAGNOSTIC_CAMPAIGN_INVALID |
| Cleanup | Owned main/ephemeral resources and collector PIDs gone; preexisting container/network ID sets unchanged |

The exact rejecting statement is docker-events.cjs:25 at7b5edbd: `(code !== 0 && signal !== "SIGTERM")` remains true for143/null even when stopping=true and buffer empty. The preserved terminal rows plus source conclusively demonstrate that rejection. The records strongly support a CLI-level representation following intended termination, but do not fully attribute the exact signal delivery under the new mandatory contract: CLI PID, kill result, separate exit, stderr and stream closure are missing. They are not invented or retroactively accepted. New controlled qualification must establish these missing facts.

[Original independent finding](evidence/IL-5.14-R1-F1-E3-A4-P2/independent-review/independent-review.md), [original orchestrator records](evidence/IL-5.14-R1-F1-E3-A4-P2/canonical-attempt-1/orchestrator.jsonl), [original main observer](evidence/IL-5.14-R1-F1-E3-A4-P2/canonical-attempt-1/docker-main.jsonl). P2's18/54 preflight and raw17 native result remain historical; campaign1 is never rewritten. A2 historical active GET cause remains ROOT_CAUSE_UNDETERMINED.
