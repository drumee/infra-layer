# Proposed narrowly scoped corrective follow-up — not executed

Trigger: C-J mandatory failure C-LINT-001, unchanged fd708aa/8452b9b, npm run lint exit1. Scope is one unused local binding in test/diagnostics/observer-shutdown/matrix.test.cjs:3. No functional/security defect is inferred from that warning.

Proposed correction: remove `drain` only from the destructuring import `{ model, complete, drain, terminal }`. Retain model.cjs and its export, every matrix assertion, observer lifecycle/identity/stream/error controls and all production files. Do not change lint policy/baseline or introduce suppressions. This proposal is not applied during C.

Under a separately dispositioned follow-up, record the preserved failing lint evidence, make the narrow test-only edit, establish a new harness/source SHA and freeze, verify canonical lint has0 errors and0 new findings with the unchanged policy, run observer30-case matrix and affected source/assertion/contract controls, and obtain review appropriate to that bounded change. Reconcile retained R5/Services evidence by exact relevant-source comparison; a matrix import-only edit must not be represented as a new Services campaign or silently transferred executable identity. Resume the remaining parent qualification matrix on the new coherent baseline. Full application/lifecycle, security, audits, package/consumer and final R1 review remain required. No blind repeated campaign or push is authorized by this proposal.

The existing owner Option B applies only to historical Postfix uncertainty and cannot waive C-LINT-001 or any later failure.
