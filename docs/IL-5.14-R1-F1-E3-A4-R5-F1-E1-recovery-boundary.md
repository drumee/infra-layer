# Deterministic recovery boundary

Gate G PASS. The fixed boundary fixture uses actual rollback/activation, actual active-attestation/journal verification and the canonical Docker/network validator. Preparation verification and external probe are explicitly isolated; command execution is deterministic rather than real Docker. The first inventory snapshot may have Restarting=false while the authoritative target inspection observes Running=true/Restarting=true and expected NetworkID with empty EndpointID. Private rollback authority and verified journal service select admission; narrow eligibility is checked at the authoritative inspection.

Positive boundary checks show preparation/identity verification → authorizeRecoveryNetworks → compose up --force-recreate → strict final check, with ready=true only afterwards. Negative authorization, identity and extra-network controls assert both exact error and no recreation command. A final missing/extra network and unhealthy recreated service remain failures. Unrelated restarting service does not inherit failed-service endpoint permission. See rollback-boundary.test.js and recovery-error-contract.test.js; all55 focused cases pass.

This is controlled metadata evidence, not a claim that the fixture observed daemon behavior. Separate actual Docker acceptance below observes real restart-backoff and real replacement.
