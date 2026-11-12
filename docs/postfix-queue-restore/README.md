# SMTP-RESTORE-01 — alpha.6 cold Postfix spool recovery

This lot qualifies a **cold spool procedure**, separate from MAIL-02 transport
implementation. Its scope is the existing canonical Infra Layer alpha.6 relay,
with synthetic configuration/credentials and the exact deployed Postfix payload.
It adds test tooling and documentation, not a runtime recovery API or release.

Verdict: **POSTFIX_QUEUE_RESTORE_QUALIFIED**, scoped to the tested alpha.6 relay.
Final campaign: 49 checks pass; the source is retained and no exactly-once claim
is made. Coordinated Oxy-form restoration and future standalone-profile recovery
remain separately **SMTP_RECOVERY_UNQUALIFIED**.

- [Operator procedure and exact commands](procedure.md)
- [Reference, storage boundaries and prerequisites](reference.md)
- [Results, limitations and requalification gates](results.md)
- [Sanitized evidence](evidence/)

The verdict applies only to the tested checkpoint/engine/procedure. Existing
alpha.6 `backupDeployment` / `restoreDeployment` application guards remain
`SMTP_RECOVERY_UNQUALIFIED`. This qualification does not bypass them, qualify
coordinated Oxy-form restoration or qualify the future standalone mail profile.
Ghost/MySQL backup/restoration is already qualified and is not rerun here.

No production service is stopped or reconfigured. Production access is limited
to read-only image inspection/export. All SMTP traffic is synthetic, inside internal Docker
networks with no published ports or Internet SMTP route. Source queue storage,
archives, witness files and replacement volumes are retained; no queue purge is
used by the qualification.
