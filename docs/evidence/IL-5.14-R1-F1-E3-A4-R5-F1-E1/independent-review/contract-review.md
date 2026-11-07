# Independent E1 error-contract review

Baseline1e859f6d4dd0682ebbceaeee994ce7c69504238d; read-only source/evidence review. No tests, Docker or repository modifications. Final closure pending corrected exact-source qualification.

Historical rollback-authorization.test.js:46 supplies a valid caller authorization, prior candidate and recovery-required journal revision with canonical service application. Substituting resource revision or service invalidates the runtime identity. RUNTIME_IDENTITY_MISMATCH is the established, appropriate refusal; caller/journal operation authority has not disappeared merely because the observed resource contradicts it. The early combined journal-service/observed-presence predicate confuses these phases.

The minimal proposed order is correct: caller/journal scope authorization first; immutable candidate verification and runtime identity loop second; known failed-service/revision target-presence eligibility third; network admission last. Preserve early refusal for missing/unknown journal service. Preserve the historical expected assertion. The newly added R5 E11 wrong-resource-service case must expect identity refusal for the same independently justified reason; this remains a mandatory rejection before recreation.

Moving public rollback context.authorized/revision-format guards before readActive is appropriate. An unauthorized caller must receive operation refusal before corrupted active-state contents can influence the result. Valid authorized calls still read/verify active attestation and retain corruption errors.

No favorable final qualification, R5 daemon result, independent boundary closure or parent F1 closure is asserted by this preliminary contract opinion.
