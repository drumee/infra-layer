# Rollback call path

A3 raw application-diagnostic.json (source964e3a4) observes Running=true, Restarting=true, Pid0, ExitCode1, exact configured network/ID and EndpointID="". Original A2 lacked this raw snapshot; these facts are not backfilled into it.

recovery.rollbackDeployment validates owner authorization/target compatibility and invokes activation. activation's preflight inspectProject → checkPorts → networksReady currently runs before native validation and Compose up --force-recreate. docker.containerNetworks only permits empty endpoints for !running; it rejects Docker restart backoff at its endpoint-presence branch. Thus recreation cannot begin. The smallest corrective boundary is rollback-only authorization before recreation, preserving ordinary checkNetworks and final networksReady.

The failed candidate revision is recorded by activation-failed/recovery-required journal entries. Its immutable prepared.json and the active candidate permit source-specific image/revision/mount verification; project labels alone do not authorize recreation. A4 source modifications must remain confined to this boundary and its direct tests.
