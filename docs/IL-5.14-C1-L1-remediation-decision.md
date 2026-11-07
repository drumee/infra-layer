# IL-5.14-C1-L1 remediation decision

Gates B and C: PASS. Selected correction: replace the one unused `catch (_)` binding in readActive with optional `catch {}`. No baseline reconciliation is necessary. The old exception value is neither referenced nor evaluated by any initializer; removing its binding loses no side effect. The try body, canonical ACTIVE_STATE_CORRUPTED refusal, error status, remaining validation, cleanup and Docker behavior are unchanged. Node >=22 is the existing public engine contract and supports this syntax.

Implementation commit ce1ba500d3775d1a7f6ac0156d26b60a4c6ccc4c changes exactly those four characters in the production file. An exact single-edit byte comparison verifies the rest of the file is identical to dac28db. An initial AST analysis included source positions, so its differing offsets were unsuitable for semantic comparison; the byte comparison supplies the intended proof without equating offsets with behavior. No runtime assertion was changed by that analysis.

A focused regression exercises a missing active pointer and malformed JSON through the actual readActive implementation. It requires null for absence and the unchanged explicit corruption code without leaking the malformed sensitive fixture. The existing tests for structurally invalid active state remain intact. Syntax checks pass for activation.js and lifecycle-safety.test.js.

The network attachment identity correction, optional State.Health guard, public exports/declarations, Nodemailer graph, Docker ownership/refusal checks and trusted executable handling are unchanged. The old crypto warning is left in scope. Baseline, lint engine, rules, severity, file inventory and all unrelated warnings are unchanged. No suppression or duplicate baseline allowance is introduced.

[Hashed unchanged inputs](evidence/IL-5.14-C1-L1/qualified-inputs.json), [source proof](evidence/IL-5.14-C1-L1/lint-inventory-and-source-proof.json).
