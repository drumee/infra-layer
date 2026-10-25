# IL-5.14-C1 source baseline

**Gate A: PASS. Overall BLOCKED_SECURITY after the development audit fails.**

The existing canonical checkout was clean on main at c218811effc83da25cf71a914e27accc96101329. GitHub repository metadata identifies main as the default branch; a fetch confirms origin/main remains at that same commit. No newer correction exists on the verified integration target. Dedicated branch:fix/il514-c1-network-attachment-identity. No unrelated work was overwritten.

The affected exported adapter function is lifecycle/docker.js:58 checkNetworks, exported through the existing ./lifecycle/* package subpath. Current and historical alpha.3 lifecycle/docker.js have identical SHA256 **c2e56482823bb6f69754ebd48fa4cdc609c609f0db58e6537bf9ef6b3e86d445**. [Baseline/environment](evidence/IL-5.14-C1/baseline.json).

checkNetworks receives a composition containing project, declared services and networks. It returns undefined on successful validation and throws coded errors on failure. It lists network names, inspects declared networks that exist, checks owner/project labels, bridge type and internal isolation, then applies a container inspection template to every key in network `.Containers`. Network absence is currently skipped to permit pre-creation activation; that behavior must not be mistaken for proof of required live-network existence.

The lifecycle activation caller is lifecycle/activation.js:160, before controlled service recreation. It first inspects owned project resources and ports, then validates networks and images. Recovery, restart, rollback and Redis transition paths can reach this activation. test/application/run.js also calls the exported adapter during owned cleanup. The adapter is synchronous. lifecycle/index.d.ts declares the higher-level lifecycle APIs; it has no dedicated checkNetworks declaration. No declaration or export was changed in this mission.

Docker calls use the trusted /usr/bin/docker resolver, explicit --host unix:///var/run/docker.sock, protected DOCKER_CONFIG=/etc/docker, HOME=/ and fixed minimal environment. The adapter forwards bounded execution controls and replaces child exceptions with DOCKER_LIFECYCLE_COMMAND_FAILED. Existing network validation rejects foreign owner/project/service labels; inspectProject additionally validates container IDs and duplicate service identities. These guarantees are not changed.

Discovered commands are npm test, test:contracts, test:integration, test:gateway, test:services, test:lifecycle, test:lifecycle:gateway, test:application, test:system-tools, test:package and lint. test/all-integration.js sequences gateway, services, lifecycle and lifecycle-gateway suites. .github/workflows/quality.yml targets main PRs and requires unit/contracts/lint/production and development audits/packaging checks. These commands are discovered, not claimed executed. Real application qualification requires explicit independent LAN and host Nginx inputs.

`npm ci --ignore-scripts --no-audit --no-fund` succeeds under UID/GID1000:1000, Node22.22.0/npm11.18.0. The subsequent canonical development audit fails; the mandatory security stop applies before correction or integration. [Exact commands, exits and fixture hashes](evidence/IL-5.14-C1/execution.json).
