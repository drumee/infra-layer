# IL-5.12-A documentation and release-candidate review

## Source and scope

Review started on 2026-10-22 with remote main `09170b9e435b5f9bf564237b9fcae080b56fc932` and PR #18 HEAD `faf9c660bfa0312d5dc910cdf8b8938e047e0899`. GitHub reported the PR open, draft, unmerged and conflict-free. The root AGENTS.md policy was read and preserved; it is the only tracked agent instruction file. All newly authored technical documentation is English.

This review authorizes documentation consolidation only. No npm publication, release tag, image publication, deployment, public API/runtime change, scanner/protection modification or external repository change is performed or authorized here.

## A1 — Complete inventory: PASS

The initial complete diff contains 70 regular files with mode100644, all under docs:

| Category | Files | Assessment |
|---|---:|---|
| Documentation and qualification reports | 5 | Reviewed complete additions/changes, including the final report and release handoff. |
| Machine-readable qualification evidence | 36 | JSON parsed; source, outcomes and fingerprints checked. |
| Qualification logs | 18 | Read-only records; executable command text in a log does not make it an introduced utility. |
| Historical stop evidence | 11 | Added preservation copies, including four empty npmrc records; no credentials in those empty files. |
| Executable utilities | 0 | No Python/JavaScript/shell helper, executable mode or shebang introduced. |
| npm members, runtime code, CI/configuration | 0 | No changes. |

All modified preexisting files are Markdown reports. No existing raw evidence is overwritten. The original stop snapshot is explicitly labeled historical and superseded; its old present-tense failure statements are not a current release decision. The detailed path list and per-file hashes are in [inventory.json](evidence/IL-5.12-A-review/inventory.json).

The two narrowly scoped report corrections and new IL-5.12 review records added during this mission remain documentation/evidence only. No executable or package modification is necessary. A bounded scan of all initial changed contents finds no private-key header, known npm/GitHub token signature or populated Authorization header. This is supplemented by complete file classification and source review; it is not proof against every possible unknown secret format.

## A2 — Consistency and provenance: PASS with explicit limits

Historical qualification remains attributed to the source actually tested. The retained final-main negative, verifier and archive receipts identify `09170b9e435b5f9bf564237b9fcae080b56fc932`. Their source/clean-tree/zero-exit fields and complete journal SHA256 values were checked against the exported logs. All nine verifier step hashes match their logs. The negative log contains25passing methods and the original11scenarios total86explicit assertions;86is not the assertion count of all25methods.

GitHub independently confirms [Quality39768113212](https://github.com/drumee/infra-layer/actions/runs/39768113212) and [CodeQL39768112702](https://github.com/drumee/infra-layer/actions/runs/39768112702) succeeded at exactly09170b9e. Those historical runs are not described as executions at the newer documentation HEAD. The five Quality jobs, JS/TS/Python/Actions scans and uploaded results are supported by the retained source-specific receipts and job references.

The53entries of the final evidence manifest match file bytes and hashes. The41npm member hashes, package metadata/lockfile and qualified helpers are unchanged between09170b9e andfaf9c660. Earlier heavy Gateway/Services/Lifecycle/application acceptance is reused by the documented identical executable/harness inputs, without inventing a new heavy run. A fresh npm build during this mission is recorded separately below.

Two documentation corrections were required:

1. The post-merge report claimed IL5_TSC and IL5_APP_IMAGE environment values were recorded by run-proof.py. Code and receipts show that wrapper records the command array and execution metadata, not environment values. The report now explicitly states this limit. No environment snapshot is reconstructed or inserted into historical evidence.
2. The PR16 report referred to its original eight dispositions as being above the new conclusion, while the matrix is below it. The reference is corrected without changing technical dispositions.

The original SMTP root cause remains unknown. Owner acceptance is limited to historical intermittent uncertainty in experimental alpha.3, excludes new regressions, message loss, TLS defects and open relay, and does not qualify Internet delivery or spool restoration. SMTP_RECOVERY_UNQUALIFIED remains explicit. HTTP403 Code Scanning/Dependabot/Secret Scanning inventory limits remain documented, without empty-inventory inference. The recorded npm identity/ACL/2FA observations remain dated and require refreshing before actual publication.

## A3 — Fresh package verification: PASS

A new clean clone `/tmp/il512-a-clean` selected initial PR HEADfaf9c660. The actual command was:

```sh
python3 -B docs/evidence/IL-5.11-R6S-D4/run-proof.py il512-a3-initial-artifact /tmp/il512-a-clean python3 -B docs/evidence/IL-5.11-D2/artifact.py --source /tmp/il512-a-clean
```

The private/exclusive runner receipt records the UTC execution date, exact source/command, UID/GID/groups, elapsed time, exit0 and journal hash. It invokes two real npm pack builds with scripts disabled, verifies every regular member against selected source and the earlier candidate map, and independently calculates both archive hashes.

- Package: @drumee/infra-layer@0.1.0-alpha.3.
- Two archives byte-identical;41members;101778compressedbytes.
- npm SHA256: c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e.
- npm SRI: sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==.
- Metadata, exports, public declarations, lockfile and publication scripts unchanged; no production dependencies or prepublication hooks.

[Actual runner command/date/result/journal hash](evidence/IL-5.12-A-review/artifact-run/il512-a3-initial-artifact.json) and [measured artifact summary](evidence/IL-5.12-A-review/artifact-summary.json). The complete41member map is referenced rather than duplicated. Binary tarballs remain in identified private roots. The package will be rebuilt again at the final reviewed HEAD and actual merge commit; those later results must not be attributed to this initial execution.

The retained09170b9eGitHub source archive has its own SHA256 db9067052f1f92ecb2dc059c27d00683f865f689c10a78adfe209d2edab5cb73 and SRI sha512-IIU5Qzlp7UFUmCbheScLl5VE/dkonJTBz/cuyfiDIN3ldO64ZnT7+NwAH1jifdSvdbzPqOzRBQ1jslxPhlWRBw==. It is not the npm archive and is not a fingerprint of a future documentation merge. A new canonical source archive is a separate post-merge measurement.

## A4 — Initial checks and policies

At initial HEADfaf9c660, [Quality39776816413](https://github.com/drumee/infra-layer/actions/runs/39776816413) has five completed successful jobs. [CodeQL39776805639](https://github.com/drumee/infra-layer/actions/runs/39776805639) JS/TS, Python and Actions and the PR CodeQL result succeed. SonarCloud is **FAILURE**, not successful. Its four OPEN findings are reviewed individually below. No reviews requesting changes or unresolved inline review threads were returned.

Main branch metadata reports protected=false, required checks off, and the applicable parent-inclusive ruleset list is empty. Detailed classic protection reads returnHTTP403 Resource not accessible by integration. This visibility limit is preserved; no rules are changed or bypassed. Draft state is an explicit administrative step, not evidence of failed qualification. Exact final HEAD/base/checks and review state must be refreshed after these documentation corrections and immediately before marking ready/merging.

| Sonar issue | Location | Technical disposition; administrative state remains OPEN |
|---|---|---|
| AaFjib3lTWFCQUPlhxll | Review-Final/artifact/artifact-receipt.json:26 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED: public source SHA256. |
| AaFjib3hTWFCQUPlhxlk | Review-Final/independent/independent-artifact-inspection.json:22 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED: same public source SHA256. |
| AaFjib0QTWFCQUPlhxlj | Review-Final/verifier/receipt.json:26 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED: same public source SHA256. |
| AaFi9udEuHJJGxOssqN_ | Review-Stop/pr16-head-artifact/artifact-receipt.json:26 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED: same public source SHA256 in a preserved historical receipt. |

For all four, SHA256 of public capabilities/secrets/index.js was independently recalculated as b872fa5cdd6868d0b89f17038aa445a8c709e675f4e82452fb7283647d48c432 and matched the exact signaled field. The value is a content fingerprint, not a credential or authentication capability. The snapshot/HTTP receipt is preserved with this review. This disposition accepts no new risk, closes no alert and does not globally accept historical findings.

## A5 — Narrow corrections and final-head gate

Only the two report inaccuracies above are corrected; original machine-readable evidence and failure logs are retained byte for byte. New inventory/build/scanner records are created under a distinct exclusive directory. New documentation follows AGENTS.md. A normal commit/push is required, with no history rewrite. Final-head package identity, hosted checks and policy refresh must pass before integration. A6/A7 have not yet occurred at this report's authoring point; their exact merge identity and new observations belong in `docs/IL-5.12-A-postmerge-verification.md` on a separate documentation branch.

The pre-merge review is favorable within these explicit final-head gates. Publication remains prohibited and requires a separate owner decision, current publisher rights/2FA, unchanged package identity and the stop conditions in the publication handoff.
