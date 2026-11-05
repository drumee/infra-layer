# IL-5.14-FIR-01 — controlled public delivery

**Disposition: `FIR01_READY_FOR_OWNER_PUSH_APPROVAL`.** This local delivery is based on previously published PR head `56eb1a60456e5817bb0d11123feb0665a5581962`. Executable and package inputs are frozen at `d4473f4a14c964bdd18effc8aada68e07ece28d2`. This report is documentation only. A push, merge, publication and deployment each require their own authorization.

## Review map and qualification

The seven-file implementation delta contains the supported services-image package inputs, bounded SMTP readiness exchange, minimatch development override and three affected services-test fixtures. It is byte-identical outside documentation to the previously qualified candidate `fad6afcec37a3e873ad40b225ec137c86a6de066`. Existing tests and historical evidence already present in the published base are retained.

The previously qualified real environment exercised filesystem security, Docker network identity/isolation and unauthorized-resource refusals, rollback/recovery, live mount reconciliation, services (18 tests) and the complete application (11 groups/87 assertions). The later dependency correction changes only manifest/lock; its archive and installed consumer were requalified. SMTP recovery and Internet mail delivery remain outside the supported qualification scope. The Postfix capture incident, earlier application mismatch, H1 causality and Debian H3 remain historical limitations, without any broader risk acceptance.

Clean `npm ci --ignore-scripts --no-audit --no-fund`, `npm ls --all`, both development and production audits, canonical ESLint, 369 unit tests, 24 contracts, package verification and 37 installed-consumer refusal/export checks pass on the delivery source. ESLint reports the same 28 existing warnings and no errors. The qualified differential observed identical diagnostics and effective configurations for 175 files, with glob/negation and negative controls. The minimatch 11.0.4 override remains outside ESLint's declared major-10 range; reassess it after changes to ESLint, plugins or matcher configuration.

The unpublished package contains 43 members, 106981 bytes, SHA256 `6a0b5a7784a6572e5cdc0ff7cac89cb9db3648d543225d4d682bc1ef818d324f` and integrity `sha512-rqU18FJC11EJdGMe47HyYgqlpriHJxOCrCwn0rm1saa/1h2zQVnlLlAhl8V6Jb0C6W3sKEJsCSqmv7ij5DW42Q==`. It is byte-identical to the qualified archive, and its members match this delivery commit. Detailed qualification records remain preserved in the owner's local evidence branch; no new private host inventories are included in this delivery's commits. This does not erase information already present in the previously published history.

## Controlled handoff

The proposed normal fast-forward command, **only after separate owner authorization**, is:

```sh
git push origin delivery/il514-fir01-public:fix/il514-c1-network-attachment-identity
```

Before execution, verify the exact local head, clean worktree and actual PR head/ancestry; stop if the remote moved. After an approved push, inspect required unit, contract, ESLint, package, dependency/security, CodeQL and SonarCloud checks against the exact resulting PR SHA, using the actual branch-protection configuration. Hosted checks for this delivery have not yet run. No merge, npm/image publication, tag or production deployment follows automatically.
