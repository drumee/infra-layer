# Recovery regression qualification

R4 BLOCKED overall because actual recreation/post-recovery qualification did not complete. Deterministic tests passed; they do not replace R5.

Commands (exact argv/times/exits in execution.jsonl):

- node --test test/unit/rollback-authorization.test.js test/unit/network-membership.test.js test/unit/harness-preservation.test.js test/unit/harness-reachability.test.js test/unit/refusal-effectiveness.test.js:100/100 PASS, exit0, no skips.
- npm test:317/317 PASS, exit0, no skips (includes18 new rollback checks).
- npm run test:contracts:24/24 PASS, exit0, no skips.

New18-case fixture uses the actual canonical Docker module through the existing constrained loader; no generated JavaScript executes. Coverage includes exact restarting authorization without false readiness, restored endpoint acceptance, extra network refusal, owner/project/service mismatch, ID/name/revision/image/role snapshot substitution, duplicate/omitted inventory, Docker failure, missing final membership, one-off-name refusal and pre-creation behavior. Existing network tests independently cover legitimate array/object multihoming and error taxonomy. The authorization helper fixture explicitly mocks only prepared verification; actual real preparation is reserved for R5. Full scope and statements are in test/unit/rollback-authorization.test.js.

R4-04 actual rollback/recreation, R4-11 actual failed-recreation control, complete final-validation negatives and R5 security campaign remain unqualified: R5 stopped before reaching them. R4-15 owned cleanup was observed with actual Docker, but no full recovery success follows. Eighteen passing test labels are not a claim that all16 requested end-to-end contracts passed.

The full A2 guard/mutation and behavioral refusal tests still pass in the317-unit run. Its source and actual historical real-Docker harness bytes are unchanged. The single authorized A1 replacement remains unchanged.
