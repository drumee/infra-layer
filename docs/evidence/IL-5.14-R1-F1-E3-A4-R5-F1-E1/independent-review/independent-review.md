# Independent E1 and local R5 boundary review

**FINDING_CLOSED**, scoped to the E1 identity-refusal regression and local recovery-preflight boundary at executable72f4c67254561ca5c4c47a6a65e9620e57da7841. No MAJOR/BLOCKER found in this scope. This is not final-head R1 closure, Postfix qualification, overall F1 qualification or push authorization.

## Source and independence

Separate reviewer process, no repository edits. Read actual current source, original failed A4 R5 raw stack/report, failed R5-F1 focused evidence and current correction. Exact HEAD and all11 current source-identity hashes verified; working tree clean at completion. Main precommit unit/focused receipts refer to1e859f6 plus the exact subsequently committed bytes; real Docker receipt independently confirms72f4c67. A2 guard and original real-Docker harness have no diff against c23c861.

## Contract and implementation

The historical identity test is retained unchanged. Valid caller, verified journal service/revision and immutable candidate evidence establish operation authority. Runtime revision/service substitution is then RUNTIME_IDENTITY_MISMATCH, not loss of caller authority. E1 moves only failed-target presence eligibility after the complete runtime identity loop. Missing/unknown journal service remains an early ROLLBACK_OPERATION_NOT_AUTHORIZED. The newer wrong-service test changes to the independently justified identity refusal, while still requiring no destructive recreation. Public rollback now rejects unauthorized or invalid-revision requests before reading potentially corrupt active state; authorized corruption still produces its real corruption error.

The recovery boundary is private-operation scoped, not recover:true scoped. Active/target compatibility and prepared ownership/integrity are reverified; journal identifies the one failed service/revision. Canonical service name, exact inventoried IDs, image/image ID, revision, role, configured publication and mounts are checked and rechecked. Live publication may shrink in restart backoff but cannot expand. Complete observed network names/IDs and ownership remain mandatory. Only that failed-service/revision target can receive the exactly-empty-endpoint accommodation, only when authoritative current metadata says Running=true and Restarting=true. Unrelated services retain strict endpoint requirements. No generic mismatch catch, retry or sleep is introduced. Normal activation and other recover:true paths remain strict. Final network validation, process health/protocol and final ready result remain required before successful rollback.

## Independent verification

Executed a reviewer-authored static CommonJS probe through actual rollback/activation/authorization/network modules with the repository's deterministic Docker fixture.14/14 controls pass: revision/service identity, unauthorized corrupt-state nondisclosure, authorized corruption, missing journal scope, missing failed-target eligibility, extra network before destruction, wrong image despite labels, configured exposure, ordinary recover:true refusal, admission/recreation/final strict ordering, final wrong network ID, final unhealthy process and recreation failure. Preparation verification and Docker observations are fixture-controlled; no simulated state is claimed as a real daemon observation.

Independently ran the three focused recovery/error-contract files and both A2 preservation/reachability files:103/103 PASS, zero skips, exit0. This includes all original preservation checks and the single authorized A1 replacement. No full suite or Docker campaign was repeated by this reviewer.

## Real Docker evidence review

Independently parsed original raw result/operations and command receipt from /tmp/drumee-r5-contract-e1-8j7z83n2/. AttemptR5-F1-E1-DOCKER-1 is exit0 at exact72f4c67,38 assertions, cleanupPASS. Raw state genuinely records Running=true/Restarting=true and empty expected EndpointID for degraded container254c5e7ec8deb509b9c711680a2a9b7f63796f96b2372baac73a8a5836b6fd67. Recovered container654c83a24f4758f81ce1324cfd5ce97e8facc6c6204f74ec290aa03f2f64e295 is distinct, running, nonrestarting and healthy. The recorded sequence is authorizeRecoveryNetworks success → actual Compose up --force-recreate success → strict network/health checks success. Later actual final detachment produces NETWORK_ATTACHMENT_MISMATCH and no ready result. Foreign/wrong-service/unauthorized/extra-network controls are present; the post-success recreation-failure control is explicitly adapter-injected on the real fixture, not misrepresented as a daemon-generated failure. The initial crashing activation does record a genuine Compose failure. Protected Docker snapshots remain unchanged; receipt log hash verified.

## Scope limits

No parent Postfix investigation, new package build, scanner change, hosted check, push or final PR approval. Existing SMTP_RECOVERY_UNQUALIFIED and H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED remain. Historical Debian H3 failure is unaffected. R5 local closure does not transfer to a future executable revision without impact review.
