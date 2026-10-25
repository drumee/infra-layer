# IL-5.14-C1-S1 final decision

**NODEMAILER_SECURITY_QUALIFIED.** All S1 gates pass. The parent canonical network correction is authorized to resume automatically;it is not yet qualified and no PR/publication is authorized by this intermediate result alone.

Resume e13777f897d72dcb14e464ac69547709c2a051e7 is preserved. Dependency commit9e8eb7c selects root/private-fixture Nodemailer10.1.7 and smtp-server3.19.24 with its exact patched Nodemailer10.1.4 dependency. Executable compatibility/lock-test source:e914db67e7b0fec97df89ad1875c18cc984efcd8. Subsequent S1 report commits change documentation/evidence only.

Root lock SHA256: `29656a3b8e09e4cf640c9b5f5519d47b95bc960abbe5ce33639a93b3a7cd23f3`. Nodemailer10.1.7 archive SHA256: `b9163453a4bf2643f0f7fe398daeb39c4492e548c55c56b2517aec616d2a64cb`;SRI `sha512-OQa6FDln5fLttmqSbjDiRYvFDOFNrBqfiOwHPlEbURil3b+vPB1v8xpi+Sp46drzNDlsTnNsS502vthmz56r4w==`. All selected registry/lock integrities match. [Machine decision](evidence/IL-5.14-C1-S1/decision.json), [all input hashes](evidence/IL-5.14-C1-S1/qualified-inputs.json), [evidence hashes](evidence/IL-5.14-C1-S1/files-sha256.json).

| Gate | Status | Evidence and limits |
|---|---|---|
| S1-A baseline/advisories |PASS |Original audit reproduced exit1,two moderate package entries from three advisory identities;root and private fixture roles/paths established. [Baseline](IL-5.14-C1-S1-security-baseline.md) |
| S1-B version selection |PASS |Official10.1.7 metadata/changelog reviewed;minimal smtp-server3.19.24 removes its vulnerable exact pin;no unrelated dependency churn. [Decision](IL-5.14-C1-S1-version-decision.md) |
| S1-C lock/integrity |PASS |Root/private-fixture npm ci succeeds;two fresh prefixes yield identical graph and5,209 file/link entries,content SHA2564395bc35353bb4b531407798cf4a7c1973e37bd87e5fae5ef58d3521da1c4d32;positive offline archive install0;invalid expected integrity EINTEGRITY1 with no successful package/fallback |
| S1-D audits |PASS |Root development and production audits,private fixture lock and installed audits all exit0/zero findings;no threshold change. Final audits2026-10-25T15:58:06 UTC bind the committed installation. [Security qualification](IL-5.14-C1-S1-security-qualification.md) |
| S1-E mail compatibility |PASS |4 focused tests,180 unit tests,17 real services and11 application groups/87 assertions pass without skips,retries or weakened restrictions. [Compatibility](IL-5.14-C1-S1-mail-compatibility.md) |
| S1-F security unblock |PASS |Exact graph,integrity,scope and real mail behavior qualified;no unresolved finding in the recorded scopes |
| Parent C1 network correction |NOT_EXECUTED at this decision |Existing reproduction retained;must now establish and qualify secure canonical attachment semantics |
| Hosted CI/PR |NOT_EXECUTED |No push/PR or hosted PASS claim at this intermediate stage |

Commands,UTC timestamps,UID/GID,source commits,exit codes and protected-Docker snapshots are preserved in the [execution ledger](evidence/IL-5.14-C1-S1/execution.jsonl). Tooling is Node22.22.0/npm11.18.0 on Debian12 amd64. Recorded zero audits are dated registry evidence,not proof of absolute software security.

Published Infra alpha.3 remains immutable:sourcec218811effc83da25cf71a914e27accc96101329,41 members,101778 bytes,SHA256c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e,SRI sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==. No published artifact,Runtime,Oxy-form or Debian file is modified. The root package has no new production dependency;the private acceptance fixture is deliberately updated and rebuilt for these tests.

**SMTP_RECOVERY_UNQUALIFIED** and **H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED** remain. H3 remains permanently failed;S1 does not repair or rerun it. No package/image publication,tag,merge or deployment occurred. Continue with the parent correction,real lifecycle/package/security checks and only then a qualified PR.
