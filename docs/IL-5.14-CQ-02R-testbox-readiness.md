# IL-5.14-CQ-02R — testbox readiness

Recorded 2026-11-04. **T1 FAIL — CQ02R-SEC-001, isolation/noninterference.** A separate temporary Docker daemon/containerd and independent LAN client were established, but they did not isolate the host network namespace. Initial temporary-daemon startup deleted the existing default daemon's `docker0` interface. Earlier T1 PASS receipts are withdrawn as overall readiness evidence. Temporary resources have been removed; the shared bridge remains unrestored pending separate owner authorization.

## Source and scope

The three CQ-02 reports were read. Initial local HEAD and open PR #20 head were both `b67c48dbc8dd9e1f365a2259b12f90f62180b042`, descending from CQ-01 checkpoint `5df139e952ce9ce6d8cedfc86367c9c24dd9b402`. Initial tree was clean; branch is `fix/il514-c1-network-attachment-identity`, PR base `main`. [Initial metadata](evidence/IL-5.14-CQ-02R/pr-start.json) and [final readback](evidence/IL-5.14-CQ-02R/pr-end.json) confirm the remote remains unchanged. No push occurred.

**Final executable candidate: `76236faa85dd2cfdaf46646b28ce38fd41d26fb3`.** Two local commits change only three test files: an isolated evidence-directory option and live two-mount permutation assertions; a tmpfs preventing Redis's implicit anonymous volume in its sleep fixture; and explicit read-only volume CLI syntax with its strict expected mode. Production code, CommonJS, manifest, lock and package inputs remain unchanged. [Full source/package hashes](evidence/IL-5.14-CQ-02R/source-package-identity.json) also explain applicability of earlier results and validations recorded immediately before their corresponding commits.

| Host prerequisite | Verified observation |
|---|---|
| SSH/operator | `testbox` resolves to host `minis`; somanos UID/GID 1000, passwordless sudo |
| Capacity | Four CPUs, approximately 8 GiB RAM; approximately 286 GB available on `/data` |
| Tools | Node 22.23.2, npm 10.9.8, Docker 29.7.2, Compose 5.4.0; native nginx 1.26.3 |
| Existing workloads | Three stopped Debian initialization containers, four networks, five volumes; 15 unique daemon images / 13 image-list records |
| Protected daemon | `690569ff-0ab3-482e-81d0-09e2c6f93da0`, `/data/docker`; never selected for campaign mutation |
| Private daemon | `97180776-3da5-479c-b9b6-b59a2211c28b`; task-exclusive data/exec roots, socket, pidfile and separate containerd |
| Network | Testbox `192.168.5.202` on `wlp2s0`; private pool `10.247.0.0/16`; temporary build bridge `br-cq6ce32480`, `10.247.254.1/24` |
| Independent client | `asohka`, freshly observed `192.168.5.201`; separate SSH process and LAN positive control, application loopback denial |
| Host proxy | `/usr/sbin/nginx`, task-local configuration/prefix and temporary ports; existing native service configuration preserved |

The client is a different machine from testbox and its shared Docker daemon is not used. [Before inventory](evidence/IL-5.14-CQ-02R/testbox-before.json), [initially accepted readiness](evidence/IL-5.14-CQ-02R/T1-readiness.json), [build-network configuration](evidence/IL-5.14-CQ-02R/T1-build-network-corrected.json), [LAN control](evidence/IL-5.14-CQ-02R/independent-client.stdout). The retained initial readiness receipts are not proof of the failed host-network boundary.

Immutable image references used by the fixtures are `node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392`, `redis@sha256:ff02b58f971e7d7d156a1267e283fcbbeee91773b6aa36c49dac28ecfe28eadf` and `debian@sha256:7b140f374b289a7c2befc338f42ebe6441b7ea838a042bbd5acbfca6ec875818`. Pull/preflight receipts retain resolved IDs. The canonical application build records image `sha256:2556d5916611c7168d62c96993051b49b3482da7dbe0bf7f39988c03cea4398e` and rollback image `sha256:fadf9d950818ad85c465e6483beea937cbafb9339a7eb75b0b11d93dcf79a618`; both were removed by owned cleanup. The services image failed to build, so no completed image identity is claimed for it.

Executed application configuration:

```text
IL5_NETWORK_CLIENT=192.168.5.201
IL5_LAN_ADDRESS=192.168.5.202
IL5_HOST_NGINX=/usr/sbin/nginx
```

## Isolation and ownership protocol

Campaign `CQ02R-6ce32480-5cce-4512-a6a1-27872271b397` exclusively created `/data/drumee-cq02r-6ce32480-5cce-4512-a6a1-27872271b397`, with a creation/owner receipt. The [fixed wrapper](evidence/IL-5.14-CQ-02R/environment/run-isolated) uses a private mount namespace, binds only the private socket over the namespace's Docker socket, checks the exact private daemon ID and drops to somanos. The original host socket remains unchanged. [Configuration and creation receipts](evidence/IL-5.14-CQ-02R/environment/) establish separation beyond names and labels.

Allowed mutations were campaign creation, owned container lifecycle/recovery, and removal only after exact identity/type, creation receipt, expected labels or nonce, state and references were verified. Live projected events retain creation/destroy IDs without exec secrets. Canonical per-fixture ownership checks remain active; prefixes or labels alone never authorize deletion. H01–H04 and all existing host resources remain outside scope.

The private daemon disables iptables/ip6tables management, forwarding changes and automatic masquerading. Four explicitly receipted, campaign-commented rules provide private-pool forwarding and build egress. No existing firewall rule is replaced, but those settings do not prevent Docker deleting the shared default bridge. Temporary client authorization is source-IP restricted, forced to the canonical network-client program and disallows forwarding; host trust is pinned to actual asohka public host keys. Both temporary SSH files were created exclusively and removed after identity/content checks.

Preparation failures are retained: the first firewall comparison incorrectly included changing timestamps/counters; its initial IPv4 raw hash cannot independently prove original rule equality. The normalized baseline was captured before the first campaign rule insertion, and initial daemon configuration already disabled firewall management. Final full static IPv4/IPv6 rules match that baseline. An initial custom-bridge configuration combined mutually exclusive `bridge`/`bip`; removing `bip` corrected that task bridge configuration before application execution. Overall T1 remained invalid because of the earlier shared-bridge deletion. These are bounded preparation corrections, not product acceptance passes.

## Active host-network incident and recovery boundary

Independent final comparison found the baseline `docker0` interface (ifindex 6, MAC `9a:54:f0:cd:ea:8f`, IPv4 `172.17.0.1/16`) and its `172.17.0.0/16` route missing. [Live inspection/journal](evidence/IL-5.14-CQ-02R/host-network-delta-live.json) records removal at 17:08:20/21 UTC, immediately after initial temporary-daemon startup at 17:08:19. The protected daemon has not restarted and still records a default bridge network referencing this absent interface.

The [initial configuration reconstructed and hash-verified against its creation receipt](evidence/IL-5.14-CQ-02R/environment/initial-daemon-config-reconstructed.json) selected `bridge:none`. The actual Docker build identifies Moby commit `6a43e3d`; its [network initialization](https://github.com/moby/moby/blob/6a43e3d/daemon/daemon_unix.go#L830) calls host default-bridge deletion when the bridge is disabled. [Causal attribution](evidence/IL-5.14-CQ-02R/host-network-causality.json) therefore identifies an execution/isolation defect in campaign setup, not an inferred Infra Layer production-code defect. The mount namespace protected socket selection, not host networking. The initial readiness checks omitted interface/route comparison; subsequent campaigns ran before independent review discovered the failure.

**T5 FAIL for host noninterference.** All campaign workloads and temporary access, four rules, owned bridge, processes, mounts and directories are removed. [Scoped temporary-resource verification](evidence/IL-5.14-CQ-02R/cleanup-final-verification.json) and [protected Docker-object comparison](evidence/IL-5.14-CQ-02R/protected-resource-comparison-corrected.json) pass, but cannot establish preservation of the kernel bridge. Existing containers remain stopped; no running default workload was observed. Shared bridge functionality is not restored or qualified.

No further host mutation or daemon restart is attempted. Obtain owner authorization for targeted restoration against the recorded interface/route and default-network baseline, after checking current references and NetworkManager/daemon ownership. A restart of shared Docker or a reconstructed bridge must not be implicit cleanup. Before another campaign, use a genuinely separate VM or demonstrate host-network isolation as well as daemon/containerd separation. See the [qualification report](IL-5.14-CQ-02R-qualification.md) for the blocking decision.
