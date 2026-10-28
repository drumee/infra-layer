# Minimal E1 implementation

Gate C PASS. Production changes are limited to internal/rollback-authorization.js and lifecycle/recovery.js. lifecycle/docker.js, activation.js, the hardened A2 guard and historical real-Docker acceptance source are unchanged from1e859f6.

Caller authorization, prior/pending recovery-required evidence and declared journal service remain first. Immutable candidate/source and all runtime identity checks follow. Only the observed failed-service/failed-revision presence check moves after identity validation. Valid identity without scoped target eligibility still refuses admission; an identity mismatch can never reach network authorization or recreation. No catch/relabel, new bypass option, generic mismatch handler or error-code selection.

The helper safely rejects absent context. Public rollback rejects unauthorized/invalid requests before reading active.json; no target-state details escape to unauthorized callers. The admitted resource still undergoes service-specific complete-network checks and narrow restarting empty-endpoint recognition. Full final network, health and protocol validation remain mandatory.

Tests add11 explicit authorization/identity/eligibility/inspection/no-disclosure cases and a controlled actual-adapter inspection-failure input. Existing deterministic boundary fixture gains only that error injection. The historical18-case assertion file is unchanged. The newer wrong-service case is corrected for Case A semantics with refusal still fatal.

The real R5 runner gains passive method-boundary receipts, safe mission-owned negative fixtures and a real post-recreation detachment control. It retains every prior assertion. A command-failure control intentionally injects the canonical Docker failure; it is identified as a test injection, not an observed daemon error. Missing-final-membership control actually disconnects the mission-created recovered container immediately before strict final validation. No arbitrary sleeps/retries, dynamic evaluation or scanner policy changes.

Executable source frozen at72f4c67254561ca5c4c47a6a65e9620e57da7841; later reporting commits contain no executable changes. [Source identity](evidence/IL-5.14-R1-F1-E3-A4-R5-F1-E1/source-identity.json).
