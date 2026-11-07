# A1 security disposition — CHANGES_REQUESTED

**A1-IR-001 MAJOR:** the new preservation guard accepts short-circuit suppression of protected calls. Independent reviewer read actual pinned historical/current harness bytes and mutated strings only in memory: `false && check(redis(["PING"]), "PONG")`, and similarly the one authorized missing-membership replacement and full-detachment addition. All3 are incorrectly accepted with52 historical/54 current protected expressions,1 replacement and1 addition. No mutated JavaScript was executed.

Root cause: expressions() records selected function/if/loop/try contexts but omits LogicalExpression/evaluation-parent context. verify() compares exact call text and those incomplete contexts, so presence/count/order/phase do not prove execution. The actual harness was not found to contain the injected short-circuit; the demonstrated defect is a false-negative preservation guard.

Independent report and exact probes: [review](evidence/IL-5.14-R1-F1-E3-A1/independent-review/independent-review.md), [probes](evidence/IL-5.14-R1-F1-E3-A1/independent-review/guard-short-circuit-probe.json). Scope is local8bf02d5, not an updated hosted head. The review stops before R1 runtime/final-package/head closure; original R1 MAJOR remains open.

Required disposition: preserve relevant expression evaluation/parent context and add nonexecuting negative coverage for historical, replacement and addition suppression; reject altered conditions without expanding the one authorized replacement. No follow-up fix is implemented here after the mandatory stop.

All completed audit/secure-tool/fs checks pass with unchanged protected Docker snapshots. Dependencies remain exact Nodemailer10.1.7/smtp-server3.19.24/nested Nodemailer10.1.4; no dependency or scanner change. Those positives do not qualify the defective guard. Residuals SMTP_RECOVERY_UNQUALIFIED, H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED and failed Debian H3 remain.
