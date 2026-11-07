# L1 final regression qualification

The final runtime source passes13 network regressions, two complete real Docker cycles,207 unit tests,24 contracts, canonical gateway/services/lifecycle/HTTPS integration and87 real application assertions. Historical failures below are preserved. [Current results and exact sources](IL-5.14-C1-L1-regression-qualification.md).

---

# IL-5.14-C1 resumed regression disposition

**FAILED_QUALIFICATION at real Docker acceptance.** S1 is NODEMAILER_SECURITY_QUALIFIED. The original alpha.3 reproduction was reconfirmed after S1, then the canonical correction was implemented at ad3fd8c7ef765f3718e6e06154b9fdd44786ed22.

`node --test test/unit/network-attachments.test.js` passes 13 focused tests, exit 0/no skips. Actual-code fixtures cover normal identity/membership, unsettled endpoint metadata without container inspection, missing objects, foreign ownership, invalid data, Docker nonzero diagnostics, required-vs-creation network absence, stale identities, bounded resolution/deadline and immediate refusal without retry. The original reproduction remains unchanged and continues loading historical c218811 source directly.

The next required command,`node test/network-attachments/real-docker.cjs`, exits1 on its first attempt at source de5e260ed69fd875d12e7782e8a7335879f239b7. Its log retains only ERR_ASSERTION; the exact assertion and total count were not persisted. No real cycle is counted PASS. The second planned cycle and later canonical suites are NOT_EXECUTED. No retry follows. Readback confirms owned cleanup and protected Docker state is unchanged.

S1's 180 unit tests, 17 real services and 11 application groups/87 assertions qualify the dependency update at e914db67, not the materially changed network behavior. Full current lifecycle, application, trusted-tool, package and lint qualification remains outstanding. [Detailed failure](IL-5.14-C1-real-docker-failure.md), [focused results](evidence/IL-5.14-C1-network/focused-network.log), [execution ledger](evidence/IL-5.14-C1-network/execution.jsonl).

---

## Original pre-S1 disposition (preserved verbatim)

# IL-5.14-C1 regression disposition

**Gate E: NOT_EXECUTED. No corrected implementation is qualified.**

The original-source reproduction is retained: `node test/network-attachments/reproduce-alpha3.cjs`, exit 0, two assertions requiring the expected alpha.3 error and invalid endpoint-key inspection. Its controlled Docker fixture is not real daemon integration. [Reproduction](IL-5.14-C1-defect-reproduction.md).

All twelve corrective categories remain NOT_EXECUTED:normal container attachment, sandbox-less endpoint handling, missing required container, unexpected endpoint, foreign attachment, invalid metadata, Docker failure propagation, required network absence, Redis recovery, container restart, detachment/cleanup and repeated independent lifecycle.

No npm test, contracts, lint, real Docker lifecycle, gateway, services, application, system-tools or package qualification is run after the mandatory development-audit failure. No previously passing suite is assigned to unimplemented code. No Docker resource was created or modified by this mission, so no mission lifecycle cleanup was needed.

The existing alpha.3 defect remains observable and uncorrected. Future continuation must first resolve the failed mandatory audit without weakening its scope, then establish corrective semantics and execute all required positive, negative and real integration cases. [Final status](IL-5.14-C1-final-decision.md).
