# Ownership contract reverification — Gate D PASS

Compared with V1, `ownership.cjs`, all 24 safety test bodies and all cleanup selectors/flow are byte-identical. Only output declaration and the fixed new evidence destination change. An exact current-attempt creation manifest, receipt/nonce/labels, volume metadata fingerprint, allowed disposable lifecycle and daemon/context must agree; names or labels alone cannot authorize disposal. Historical entries are outside the current creation manifest.

| Required contract outcome | Actual mechanism |
|---|---|
| SAFE_TO_REMOVE | ELIGIBLE only after exact complete proof and zero consumers |
| PRESERVE_FOREIGN_RESOURCE | Wrong owner/attempt/daemon or manifest mismatch refuses |
| PRESERVE_UNKNOWN_OWNERSHIP | Missing/ambiguous/unknown creation evidence refuses |
| PRESERVE_REFERENCED_VOLUME | VOLUME_IN_USE for created/running/stopped/owned or foreign consumers |
| PRESERVE_REQUIRED_ARTIFACT | Explicit retain disposition; no removal |
| CLEANUP_FAILED | Original inspect/remove failure propagates; partial required cleanup INCOMPLETE; primary failure remains separately visible |

The adapter checks all-state `ps -a` references and actual Mounts. Cleanup repeats identity/daemon/reference eligibility immediately before exact **non-force** volume rm, then verifies absence and no consumers. Docker's refusal of a racing in-use volume is the final race defence. No foreign-container deletion, historical adoption, force, prune, wildcard or project-wide cleanup is permitted. Global pre/post metadata equality is additional evidence, not ownership authority.

Docker volumes lack immutable UUIDs equivalent to container IDs. Trusted attempt receipts plus Name/CreatedAt/driver/scope/labels/options/mountpoint fingerprint cannot defend against a privileged Docker administrator deliberately reproducing identical metadata. This scoped threat boundary and the LOW partial-creation ledger auditability limitation remain explicit; no material security bypass or false successful campaign was established. Such an uncertain partial object stays protected and fails qualification. Existing production network, rollback and observer contracts are unchanged.
