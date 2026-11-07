# Secure preflight qualification

Gates C/D PASS. Six pure preflight cases passed,exit0: missing path rejected; symlink rejected;0755 rejected; wrong owner policy rejected using a different expected UID (safe simulation without changing filesystem ownership); existing trace.jsonl rejected and contents preserved; valid fresh0700 owned directory accepted with exclusive write/fsync/unlink. No Docker subprocess is reachable from these fixture tests. [Setup/preflight source and summary](evidence/IL-5.14-R1-F1-E2/).

Attempt `drumee-il514-r1-f1-e2-jef250tq` uses an actual atomic temporary parent, not an assumed path. Three distinct child directories membership/redis/health were created and validated before any acceptance process. [Pre-execution receipt](evidence/IL-5.14-R1-F1-E2/preflight-receipt.json) records full source, unchanged hashes, Node/npm/Docker versions, UID/GID,0700 modes, free bytes, exact commands, namespace prefixes and absence of stale membership resources. Docker executable resolves through existing trusted validation; daemon accessible. The same exact paths are passed in IL514_DIAGNOSTIC_DIR.

No persistent harness implementation change was made. Reproducible caller setup is archived as prepare.py/preflight.py, with source checks and guarded directory creation. The original E1 absent directory was not reused or modified.
