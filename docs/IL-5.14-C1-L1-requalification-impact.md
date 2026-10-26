# IL-5.14-C1-L1 impact-based qualification

Gate E: PASS for the L1 change. Production source ce1ba500d3775d1a7f6ac0156d26b60a4c6ccc4c differs from dac28db only by removal of the unused readActive catch parameter. No initializer, try/catch body, native command, order, timeout, return value, public API, lock, Docker ownership condition or network/health behavior changes. A new unit case checks missing and malformed active state against the actual implementation. The optional binding syntax is supported by the unchanged Node >=22 engine contract.

readActive is used by activation/observation and lifecycle transitions to reject corrupted or unattested active pointers. Its catch still raises ACTIVE_STATE_CORRUPTED. This is a binding-only change, not a new recovery or retry policy. No baseline or scanner update was needed. [Exact single-edit proof and diagnostics](evidence/IL-5.14-C1-L1/lint-inventory-and-source-proof.json), [unchanged input hashes](evidence/IL-5.14-C1-L1/qualified-inputs.json).

| L1 control | Actual command/result at ce1ba50 |
|---|---|
| Syntax | node --check lifecycle/activation.js and node --check test/unit/lifecycle-safety.test.js, exit 0 |
| Focused active state/network/diagnostics/lint policy | node --test test/unit/lifecycle-safety.test.js test/unit/network-attachments.test.js test/unit/qualification-diagnostic.test.js test/unit/security-tooling.test.js, exit 0, 38 passed |
| Canonical lint | npm run lint, exit 0; 0 errors, 28 visible historical warnings, 0 new findings |
| Unit | npm test, exit 0, 207 passed, no skips |
| Contracts | npm run test:contracts, exit 0, 24 passed, no skips |
| Previously failing real Docker acceptance | node test/network-attachments/real-docker.cjs, exit 0, two independent cycles, network/Redis recovery/restart/refusal/cleanup exercised |

The broader C1 implementation and D1 shared State.Health template correction still require the full parent service/lifecycle/application/security/package qualification. Those are recorded separately rather than replaced with historical S1 results. Existing S1 dependency reproducibility/integrity evidence remains applicable because both manifests/locks and the selected graph remain identical; final audits are required separately. API declarations and exports are unchanged from the qualified historical artifact, and final package consumer checks remain mandatory.

No Debian code, Server Runtime, Oxy-form, published npm artifact or protected host configuration was modified. The gateway test sandbox correction from D1 is retained; the final canonical gateway suite exercises that actual launch, rather than reusing older browser evidence. Historical H3 failure, H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED and SMTP_RECOVERY_UNQUALIFIED remain disclosed.

[Exact commands, sources, timestamps, exits and protected Docker snapshots](evidence/IL-5.14-C1-L1/execution.jsonl).
