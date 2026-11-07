# D1 static inspection — Gate C PASS

No comparator/test/fixture input was changed or executed during this inspection. mounts.cjs exports projectMount/assertMountsEqual/assertInventoryEqual/explicit historical replay. Complete tuple count maps retain multiplicity; only mount array order is disregarded; inventory's other fields retain deepStrictEqual. Validation and error construction are synchronous. Module initialization only loads assert/ownership/crypto and defines helpers; tests call projectMount three times before first registration. Inputs appear structurally consistent by inspection; actual execution remains unproven.

| Hypothesis | Static disposition | Evidence/limit |
|---|---|---|
| Wrong require path or missing export | CONTRADICTED for checked literal local paths/exports | Files and declared exports exist; no runtime load claim |
| Circular local comparator dependency | CONTRADICTED | mounts -> ownership -> crypto, no reverse require |
| Syntax error | CONTRADICTED by historical six syntax PASS | No new assertion result inferred |
| Top-level fixture/JSON load exception | PLAUSIBLE_HYPOTHESIS | Three helper calls plus historical file reads; no captured cause |
| Invalid fixture shape or expectation | INSUFFICIENT_EVIDENCE | Negative assertions intentionally expect throws; do not rewrite them |
| Test registration API misuse | INSUFFICIENT_EVIDENCE | Standard synchronous test(name,fn), loop; no captured failure |
| Async comparator lifecycle error | CONTRADICTED for comparator itself | Comparator callbacks synchronous; runner lifecycle remains separate |
| Unhandled exception/rejection | PLAUSIBLE_HYPOTHESIS | No worker cause was captured |
| Worker/report serializer/bootstrap failure | PLAUSIBLE_HYPOTHESIS | Native source permits fatal reporter/bootstrap failures; no actual stack yet |
| Python tail truncation caused missing saved output | CONTRADICTED | Saved complete log hash matches receipt; output tail only presentation |
| Trusted system executable metadata failure | PLAUSIBLE_HYPOTHESIS | Adapter test calls root-owned-path verifier even with execFileSync doubled; current read-only metadata recorded, historical exact environment incomplete |
| Comparator multiset algorithm defect | INSUFFICIENT_EVIDENCE | High-level exit1 cannot establish an algorithm failure |

The Docker adapter case imports production system-tools and replaces cp.execFileSync before invoking createDocker. The replacement handles all Docker argv without launching a Docker process; createDocker still performs filesystem trust checks. Fingerprint case parses campaign source through existing espree helper; it does not execute the campaign. No real Docker command is needed or authorized. No VERIFIED_STATIC_DEFECT is established as the cause at this stage.
