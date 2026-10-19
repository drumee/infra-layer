# IL-5.8 SonarCloud disposition and qualification

Decision: **READY_FOR_SECURITY_REVIEW**. No merge/publication or false-positive
acceptance is implied. All 26 initial findings and the two replacement IDs are
examined. Owner/security review is still required for the four open contextual
false-positive proposals. No issue is closed manually and no quality gate,
exclusion, rule or protection is altered.

## Reviewed revisions and analysis

- Initial HEAD: `de4b34e99370bf3b9f0d17399db4b2ea3d107677`.
- Inventory commit: `0c4d1f1`.
- Correction HEAD: `744f9956cb8bf5b129285c3375a594afe8b673b9`.
- Final executable/package source: `f91253c1d034270af3c7815f514b1e8c91f78020`;
  its extra change records candidate metadata/provenance. Subsequent report
  commits do not change executable/package bytes. The closing execution report
  identifies the final pushed documentation HEAD, avoiding a self-referential
  commit hash in this tracked file.
- Initial Sonar GitHub check: 117199059647, FAILURE, Security D/Reliability D.
- Correction check: 117626476477 on 744f995, FAILURE, Security B/Reliability A.
  [Sonar PR analysis](https://sonarcloud.io/dashboard?id=drumee_infra-layer&pullRequest=2).
  Final examined PR HEAD `c7fe3b146b6f12a61fdbc2b59396d07ce8ccde9b`
  has completed Sonar check **117632916652**, also FAILURE, with the same four
  OPEN IDs and Security B/Reliability A. See final-checks/final-issues/final-gate
  evidence. The subsequent closing evidence commit is documentation-only; its
  exact hash and live check are identified in the execution handoff.

The fresh initial snapshot matches all 26 IL-5.7 IDs. The correction API returns
28 historical records: 24 CLOSED and four OPEN. Two of the closures are line/
identity replacements, **not fixes**: S7780 and S9382 have new OPEN IDs.
There are no open findings in shipped files and no open reliability bug.
The only remaining VULNERABILITY is S5332 in the non-shipped SMTP test client.
The five shipped findings have code corrections, behavioral proofs and analyzer
closure, rather than a line move alone. The initial classifications are
21 FIX_COMPLETED and five contextual FALSE_POSITIVE proposals (one removed
misleading unused default, four remaining logical findings). No initial finding
is deferred or silently treated as an accepted real vulnerability.

Full snapshots and per-rule metadata are under [evidence](evidence/IL-5.8/).
The public API omitted long-form descriptions; attempted official RSPEC sources
returned 404, and rule-site fetches were unavailable. Names, messages, severity,
category and security standards were retrievable. The review does not invent
unavailable recommendations or claim that access was complete.

## Individual disposition

Initial locations remain stable references; current line shifts do not establish
resolution. Behavioral context is expanded in [security review](IL-5.8-security-review.md).

| Initial ID | Rule / initial location | Classification | Risk assessment | Correction or proof | Correction-analysis observation |
| --- | --- | --- | --- | --- | --- |
| `AaFGkAAM7h-_7ZHL5nV7` | `javascript:S7723`; `test/application/package-consumer.js:9` | FIX_COMPLETED | Constructor style inconsistency; no exploit demonstrated. | Use new Error with identical messages; actual application or isolated installed consumer exercises owning harness. | CLOSED |
| `AaFGkAHd7h-_7ZHL5nWA` | `javascript:S3776`; `lifecycle/composition.js:57` | FIX_COMPLETED | Dense supplied-service validation made ordering/security review difficult. | Internal helper extraction in original order; 32 exact baseline output/error comparisons; legacy lifecycle and HTTPS/jobs. | CLOSED |
| `AaFGj__s7h-_7ZHL5nVp` | `docker:S8431`; `test/application/Dockerfile:1` | FALSE_POSITIVE | Digest remains authoritative; descriptive Node tag is provenance, not a floating acquisition. | Immutable real image build; no Dockerfile edit. | OPEN |
| `AaFGj___7h-_7ZHL5nVu` | `javascript:S7723`; `test/application/build.js:5` | FIX_COMPLETED | Constructor style inconsistency; no exploit demonstrated. | Use new Error with identical messages; actual application or isolated installed consumer exercises owning harness. | CLOSED |
| `AaFGj___7h-_7ZHL5nVv` | `javascript:S4036`; `test/application/build.js:10` | FIX_COMPLETED | Inherited PATH could select attacker code with developer/Docker rights. | Fixed absolute verified tools and child PATH; malicious PATH and writable tool/ancestor refusals; actual build/SSH run. | CLOSED |
| `AaFGj___7h-_7ZHL5nVw` | `javascript:S4036`; `test/application/build.js:11` | FIX_COMPLETED | Inherited PATH could select attacker code with developer/Docker rights. | Fixed absolute verified tools and child PATH; malicious PATH and writable tool/ancestor refusals; actual build/SSH run. | CLOSED |
| `AaFGj___7h-_7ZHL5nVx` | `javascript:S4036`; `test/application/build.js:12` | FIX_COMPLETED | Inherited PATH could select attacker code with developer/Docker rights. | Fixed absolute verified tools and child PATH; malicious PATH and writable tool/ancestor refusals; actual build/SSH run. | CLOSED |
| `AaFGkAAR7h-_7ZHL5nV8` | `javascript:S7723`; `test/application/host.js:4` | FIX_COMPLETED | Constructor style inconsistency; no exploit demonstrated. | Use new Error with identical messages; actual application or isolated installed consumer exercises owning harness. | CLOSED |
| `AaFGj__y7h-_7ZHL5nVr` | `jssecurity:S8707`; `test/application/interrupt.js:5` | FIX_COMPLETED | Arbitrary CLI read before canonical activation could consume external metadata. | Private normalized owned regular one-link input, no-follow/nonblocking/size/root/project checks; traversal/link/FIFO/mode negatives; actual SIGKILL/recovery. | CLOSED |
| `AaFGj__y7h-_7ZHL5nVq` | `javascript:S2681`; `test/application/interrupt.js:6` | FIX_COMPLETED | Compact control flow increased callback/return misreading risk. | Explicit braces preserve guard/return; unit timeout/late/double/error probes or actual interruption/recovery, according to file. | CLOSED |
| `AaFGj__57h-_7ZHL5nVs` | `javascript:S5332`; `test/application/plugins/qualification/worker.js:11` | FALSE_POSITIVE | Actual protocol is SMTP with mandatory verified STARTTLS; the HTTP label is inapplicable. | Real plugin TLS-positive/no-STARTTLS/bad-CA/bad-name tests plus Postfix SASL/relay denial. | OPEN |
| `AaFGj__57h-_7ZHL5nVt` | `javascript:S7723`; `test/application/plugins/qualification/worker.js:15` | FIX_COMPLETED | Constructor style inconsistency; no exploit demonstrated. | Use new Error with identical messages; actual application or isolated installed consumer exercises owning harness. | CLOSED |
| `AaFGkAAG7h-_7ZHL5nVy` | `javascript:S1788`; `test/application/run.js:10` | FIX_COMPLETED | Default before TLS argument made fixture calling convention unclear. | Default handled in request body construction; same existing application call sites re-executed. | CLOSED |
| `AaFGkAAG7h-_7ZHL5nV0` | `javascript:S7780`; `test/application/run.js:40` | FALSE_POSITIVE | Literal quote escaping is intentional POSIX SSH-program quoting, with validated data. | Real independent-LAN nonce control/refusal; replacement ID is tracked below. | CLOSED; same finding OPEN as AaFOFe0GZ2pN_ZCiPhed |
| `AaFGkAAG7h-_7ZHL5nV1` | `javascript:S7723`; `test/application/run.js:40` | FIX_COMPLETED | Constructor style inconsistency; no exploit demonstrated. | Use new Error with identical messages; actual application or isolated installed consumer exercises owning harness. | CLOSED |
| `AaFGkAAG7h-_7ZHL5nVz` | `javascript:S4036`; `test/application/run.js:40` | FIX_COMPLETED | Inherited PATH could select attacker code with developer/Docker rights. | Fixed absolute verified tools and child PATH; malicious PATH and writable tool/ancestor refusals; actual build/SSH run. | CLOSED |
| `AaFGkAAG7h-_7ZHL5nV2` | `javascript:S7723`; `test/application/run.js:45` | FIX_COMPLETED | Constructor style inconsistency; no exploit demonstrated. | Use new Error with identical messages; actual application or isolated installed consumer exercises owning harness. | CLOSED |
| `AaFGkAAG7h-_7ZHL5nV3` | `javascript:S2486`; `test/application/run.js:67` | FIX_COMPLETED | Catch-all retry hid unexpected certificate/protocol failures until timeout. | Retry only ECONNREFUSED, explicit timeout assertion; actual verified host-proxy run. | CLOSED |
| `AaFGkAAG7h-_7ZHL5nV4` | `javascript:S9382`; `test/application/run.js:67` | FALSE_POSITIVE | Bounded sequential polling must observe later startup rather than simultaneous attempts. | Real delayed Nginx startup; fail-closed timeout; only ECONNREFUSED is retried. | CLOSED; same finding OPEN as AaFOFe0GZ2pN_ZCiPhee |
| `AaFGkAAG7h-_7ZHL5nV5` | `javascript:S2259`; `test/application/run.js:71` | FIX_COMPLETED | The analyzer could not prove async preparation completed before initial snapshot use. | Explicit non-null preparation guard; actual prepare/restart/rollback/restore checks. | CLOSED |
| `AaFGkAAG7h-_7ZHL5nV6` | `javascript:S6582`; `test/application/run.js:113` | FIX_COMPLETED | Redundant cleanup condition obscured nullable process state. | Optional chain retains no-proxy and already-exited semantics; real host proxy cleanup. | CLOSED |
| `AaFGj_9q7h-_7ZHL5nVo` | `javascript:S7778`; `lib/plan-v2.js:73` | FIX_COMPLETED | Adjacent appends obscure one ordered reference inventory. | Single append retains account refs before explicit refs; composition/secret tests and legacy SQL service tests. | CLOSED |
| `AaFGkAHd7h-_7ZHL5nWB` | `javascript:S3358`; `lifecycle/composition.js:86` | FIX_COMPLETED | Nested role selection obscured initialization precedence. | Explicit job/application/kernel role selection; byte-identical comparison, kernel/job tests. | CLOSED |
| `AaFGkACL7h-_7ZHL5nV-` | `javascript:S2871`; `lifecycle/external-gateway.js:15` | FIX_COMPLETED | Implicit ordering obscured canonical schema-key intent; locale ordering would be wrong here. | Use existing S.lexical code-unit comparator; plugin permutation/invalid keys and exact output comparison. | CLOSED |
| `AaFGkACL7h-_7ZHL5nV_` | `javascript:S2681`; `lifecycle/external-gateway.js:28` | FIX_COMPLETED | Compact control flow increased callback/return misreading risk. | Explicit braces preserve guard/return; unit timeout/late/double/error probes or actual interruption/recovery, according to file. | CLOSED |
| `AaFGkAAX7h-_7ZHL5nV9` | `javascript:S5443`; `test/support/application-inputs.js:4` | FALSE_POSITIVE | Unused pure-fixture argument never allocated a file; predictable temporary allocation was not present. | Removed misleading unused default; 32 exact composition comparisons and actual private-root acceptance. | CLOSED |

Replacement IDs `AaFOFe0GZ2pN_ZCiPhed` (S7780) and
`AaFOFe0GZ2pN_ZCiPhee` (S9382) remain OPEN at run.js lines 41/73. They retain the
same FALSE_POSITIVE proposals and proofs as their original logical findings;
they are not counted as two newly fixed issues. S8431 and S5332 retain their
original IDs. Classification is a review recommendation, not a Sonar mutation.

## Qualification actually executed in IL-5.8

Host: Node 22.22.0, npm 11.18.0, Git 2.39.5, Docker 29.2.0,
TypeScript 5.9.3; Debian host LAN wlp3s0 192.168.5.201, independent read-only
`ssh testbox` client wlp2s0 192.168.5.202. Nginx 1.22.1 is the existing unpacked,
unprivileged qualification executable, with per-run private config/CA/prefix.
No host firewall, resolver, trust store or persistent service was modified.

| Exact command | Result and counting scope |
| --- | --- |
| `npm test` | 153 TAP passed, zero failure/skip (141 existing + 12 new tests); TLS socket cases and 32 equivalence cases are included, not additional TAP totals |
| `npm run test:gateway` | 17 TAP passed, zero failure/skip; includes one actual Chromium scenario |
| `npm run test:services` | 17 TAP passed, zero failure/skip; actual SMTP/DKIM/upstream controlled TLS and historical services |
| `npm run test:lifecycle` | 16 TAP passed, zero failure/skip; startup/recovery/ownership/rollback |
| `IL5_NETWORK_CLIENT=testbox IL5_LAN_ADDRESS=192.168.5.201 IL5_HOST_NGINX=/tmp/drumee-il5-host-nginx/usr/sbin/nginx npm run test:application` | 11 groups, 87 functional assertions, zero failure/skip |
| `npm run test:package` | 40-file allowlist and isolated installed-export/consumer audit pass; not TAP |
| `IL5_APP_IMAGE=sha256:b98ae69b0a39ce4edb26fefa2a60ba28620ab12fe6ccd28d2f6daade4be6901d IL5_TSC=/tmp/drumee-il4-typescript/node_modules/typescript/bin/tsc node test/application/package-consumer.js` | Eight functional assertions, strict installed NodeNext types, actual idempotent preparation, no activation/checkout import |
| `npm run test:lifecycle:gateway` | Four functional HTTPS/renewal/job scenarios pass; not TAP or full kernel provisioning |
| Debian `npm test --prefix profiles/minimal-application` | Five TAP passed, zero failure/skip, using unchanged locked source; not a new-pin acceptance |
| `npm audit --omit=dev --json` | Zero production vulnerabilities reported; empty package production dependency set, no claim about all dev tools |

The two independent-client checks (positive nonce route and refused application
LAN connection) are inside the 87 assertions. They are not added again as remote
checks. The one gateway browser case is inside its 17 TAP tests. The application
host proxy is real HTTPS/CA/SAN, not another browser case. No full minimal-kernel
260/3/16 replay, Debian 90-assertion cleanroom or Runtime 56-test replay is claimed;
their previous evidence remains historical, with read-only repositories and
unchanged public contracts. Broad heavy suites ran sequentially.

Actual application run: source f91253c, project drumee-il5-abca4a98. Docker and ss
show only 127.0.0.1:36787; the independent LAN client reached the nonce control
and received ECONNREFUSED at the application port. Native allowed RPC and 403,
host Nginx TLS, stop/start, config rollback, failed startup, SIGKILL/recovery,
unknown-root/tamper refusal and separate no-SMTP restore all pass. Optional mail
failure remains isolated, required mail failure makes readiness false, backend
failure preserves queue ownership/key generations. Backup with SMTP fails
SMTP_RECOVERY_UNQUALIFIED. No Internet delivery or SMTP spool restore is claimed.
Owned resources are cleaned; the original unrelated resources are preserved.

Early failures are retained, not counted as passes: sandbox worker restrictions
prevented initial unit/targeted/Debian test execution; authorized host reruns
passed. The first comparative fixture paired a null healthcheck mutation with an
interval mutation and threw before testing either implementation; the generator
was corrected, then 32 complete old/new outputs matched. That interim unit run
failed for its missing comparison fixture; the final 153-test suite passes.
The unsupported gh pr-view field, deprecated Projects preflight in gh pr edit, and unavailable rule descriptions are read-only
retrieval failures, not qualification results. The retained initial sandbox log and execution transcript preserve these failures; overwritten intermediate logs are not represented as retained raw evidence.

## Refreshed local candidate and consumer impact

Version remains unpublished `@drumee/infra-layer@0.1.0-alpha.3`; registry read on
2026-10-18 lists stage, alpha.1 and alpha.2 only. No npm operation publishes.

- Artifact: `/tmp/drumee-il58-artifacts/drumee-infra-layer-0.1.0-alpha.3.tgz`.
- Source f91253c; 98,736 bytes, unpacked 353,399 bytes; 40 allowlisted files.
- SRI: `sha512-mwbKb02dvTHS7lthOXg+suJ7llUi88sT5e+GssHzqsZk4ajAE5P61YhrNg8kO+C/C8Q6F8t0vvoSSo5gLjW4Dg==`.
- SHA1: `0cbadffb71f31e195b95176401627311c68fbdaa`.
- SHA256 and every member hash are in [artifact receipt](evidence/IL-5.8/artifact.json).
- Production dependencies remain empty; Runtime alpha.4 dev/fixture pin and
  npm integrity remain unchanged. Public declarations, exports and locks have
  zero diff from initial HEAD. Tests/evidence/private test resources are absent
  from the package. Package audit and separate installed consumer produce the
  same new SRI, independently confirming repeat packing of the selected bytes.
- Fresh download/extraction of the immutable f91253c GitHub archive, with no Git
  directory/node_modules, produces the identical npm SRI and 40-file allowlist;
  see clean-source-repack.json. Source archive is 246,882 bytes, SRI
  `sha512-DVe44qGmOCM2gGu4DBbwCqZVtZxa7nynpRsbWGGVx5o7x3AUCpYkPTVpeyMOjYZQfUBD3ZMspvjI/US3ZgmAcQ==`.
  Its exact codeload URL and SHA256 are in artifact.json. This is a verified
  future selection input, not an automatic change to Debian's current lock.

The old 98,007-byte/SRI +voNV... alpha.3 candidate remains historical and must not
be used to identify these changed bytes. Debian still locks c6ef6e9 source archive
with its original /XFg... SRI. Its read-only five-test result confirms that old
selection; it does not install these fixes. To consume this review, a separately
authorized Debian change must pin the exact new source + source-archive SRI (which
is distinct from npm SRI), or the future published npm artifact, then re-run
installed-consumer and cleanroom acceptance for that selection. No automatic
lock change or claim of qualification for an unselected new Debian dependency.
Integration order remains Infra #2, then Debian #7; no base change or merge.

## Owner decisions and residual risks

1. Review the four still-open contextual false-positive proposals, especially
   SMTP mandatory TLS proof. If the owner changes issue states, do so individually
   with the recorded evidence; a quality-gate success is not manufactured here.
2. Operational trust in the developer account, Docker socket, approved tools,
   explicit script inputs and SSH client remains necessary. The hardening does
   not sandbox an attacker with the same UID/root or qualify an arbitrary host.
   Treat this as a documented operational assumption requiring owner review,
   not an accepted remote vulnerability or an automatic risk waiver.
3. Review code/qualification and decide merge separately. Sonar check remains
   FAILURE while its Security B condition is outstanding. Repository policies
   and the independent Debian CI debts remain untouched.
4. Select a new verified dependency before claiming Debian contains the fixes;
   publication, image distribution and production/Oxy-form rollout are separate
   authorizations. SMTP Internet acceptance, SPF/DKIM/DMARC/bounces and spool
   recovery remain future work. Neither OF-02 nor Oxymotion D0 is started.

## Closing evidence and PR update

The completed post-report check on c7fe3b1 is retained in final-checks.json,
final-issues.json and final-gate.json: four OPEN logical findings, no new
annotation, Reliability A/Security B and FAILURE. The closing evidence commit
changes only this report and evidence; package/executable source stays f91253c.
The final execution handoff confirms the live check on that documentation commit.

The PR body was updated with this security-review handoff, preserving its previous
qualification history and main base. CLI update first failed on deprecated
Projects GraphQL preflight, then REST returned token 403. The authorized GitHub
connector update succeeded; no credential, repository permission or protection
was changed. These are tooling observations, not Sonar or test successes.

## IL-5.9 owner decision and blocked application (2026-10-18)

The owner explicitly approved the four remaining contextual false positives
(S8431, S5332, S7780, S9382). This supersedes the earlier pending-owner-decision
statement only; historical source/qualification evidence is preserved.
Application of those decisions is **BLOCKED_SONAR_PERMISSIONS**: the approved
S8431 transition returned HTTP 401 Authentication is required. All four issues
remain OPEN on independent readback, Security B/Reliability A, quality gate ERROR.
No comment, disposition, severity/rule/protection change or passing gate is claimed.

[IL-5.9 closure attempt](IL-5.9-sonar-closure.md) retains exact IDs, justifications,
response/readback evidence and the four remaining individual operations. The
mission's access stop rule prevents starting Debian realignment/requalification;
Debian still selects historical c6ef6e9 and has not received the IL-5.8 fixes.
Resume with an authorized Sonar interface or individually verified owner actions,
then verify/re-lock f91253c and execute the required new-selection qualification.
No merge, publication, production/Oxy-form operation or D0 is authorized/performed.
