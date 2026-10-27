# Recovery authorization contract

A4 R1: operational readiness remains the unmodified default checkNetworks contract. Running containers with missing endpoints remain NETWORK_ATTACHMENT_MISMATCH. No operational success is inferred from recovery authorization.

Only the authorized rollback entry point may request the narrow pre-recreation check, under the lifecycle writer lock, after immutable target preparation verification. The latest recovery-required journal event must identify the failed immutable candidate. Every inventoried resource must match either that verified failed candidate or the attested active candidate by project, service, image/image ID, revision, ports and mounts. Expected Compose service container name is project-service-1; one-off job names are ineligible. Container IDs are captured and rechecked during network authorization. Duplicates and substitutions are refused.

The separate authorization check shares complete network observation with checkNetworks. Every observed network name, network ID, reverse attachment and owner must still satisfy the service-specific canonical topology. Only a snapshot-matching container actually observed Running=true and Restarting=true may lack an active endpoint when its configured EndpointID is exactly empty and no ordinary/synthetic network endpoint exists. Missing configured membership, unexpected network, wrong identity, ownership, wrong nonempty endpoint, malformed data or Docker error remains fatal. No name-only deletion, unknown disconnect, polling or mismatch catch is introduced.

The existing Compose force-recreation sequence remains the destructive operation, scoped to the verified project/file/service. Full network and functional/protocol readiness runs afterwards; the recovery authorization is never passed to final validation. A failed recreation or final validation cannot create an active attestation.

The admission is deliberately separate from ordinary recover:true activation/resume: a private operation marker is used only by the rollback entry point. Ordinary startup, stopped-service startup, interrupted activation and normal network inspection retain their existing contracts.
