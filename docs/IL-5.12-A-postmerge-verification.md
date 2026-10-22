# IL-5.12-A post-merge verification

**DOCUMENTATION_MERGED_RELEASE_CANDIDATE_VERIFIED** at canonical main `efc8ca2639f31793124459f28b9979235e28b023`. This closes the authorized documentation consolidation. It does not authorize npm publication, release tags, image publication or deployment.

## Canonical source and controlled integration

| Reference | Exact identity |
|---|---|
| Previously qualified main | 09170b9e435b5f9bf564237b9fcae080b56fc932 |
| Initial PR #18 HEAD | faf9c660bfa0312d5dc910cdf8b8938e047e0899 |
| Final reviewed PR #18 HEAD | de084c82d21c8149db1e3d6affe7084e4aa2cfca |
| PR #18 merge / canonical main | efc8ca2639f31793124459f28b9979235e28b023 |
| Integrated Git tree | 82014b917003d36159b59524233bc4e22c971529 |
| Qualified D2 executable content | dbc0be5c20029374c68bdf510dfadd7da079fcf6; same41npm members as d19e62ba682dc2d781f5f941c7ba4b37e3a65053 |

GitHub confirms PR #18 merged. Merge parents are09170b9e435b5f9bf564237b9fcae080b56fc932 andde084c82d21c8149db1e3d6affe7084e4aa2cfca. The merge tree equals the exact reviewed HEAD tree; GitHub reports valid commit verification. The final77-file diff contains documentation, reports and evidence only, with no executable helper/runtime/npm member/CI change. Root AGENTS.md is unchanged and retains the permanent English-first policy. No qualified helper was replaced by an older version.

Before merging, HEAD/base, five successful Quality jobs, three successful CodeQL analyses plus the PR result, no review requests for changes, no unresolved inline threads and conflict-free eligibility were refreshed. Main metadata reported protected=false and required checks off; parent-inclusive rulesets were empty. Detailed classic protection read remainedHTTP403for the integration. Normal merge commits were enabled. PR #18 was marked ready, read back as draft=false, then merged through the ordinary endpoint with expected HEADde084c82. No bypass, policy change or alternate authentication merge strategy was used.

## A1–A8 completion

| Control | Result | Evidence |
|---|---|---|
| A1 Scope | PASS | Initial70files classified; final77files reviewed; no executable/package/config change. |
| A2 Provenance | PASS with documented environment/visibility limits | Historical source09170b9e remains attached to its actual logs and workflows;53manifest entries and nine verifier log hashes checked. |
| A3 Artifact | PASS | Two builds at initialfaf9c660 and correctedde084c82; all41members and archive bytes unchanged. |
| A4 Policies/checks | PASS | Exact final-head Quality39781724439 and CodeQL39781718077 pass; Sonar remains failed and non-enforced under observed policy. |
| A5 Corrections | PASS | Only report environment-recording claim and matrix-direction reference corrected; new English review/evidence, no history rewrite. |
| A6 Merge | PASS | PR #18 ready state and merged=true independently confirmed; merge SHA above. |
| A7 Post-merge | PASS | Exact-source artifact/source checks, unchanged tree/helpers/metadata and actual post-merge Quality/CodeQL results below. |
| A8 Handoff | AVAILABLE | Separate English IL-5.12 publication handoff; publication requires another owner decision. |

The original failure report and raw historical evidence remain unchanged. The old present-tense stop statements are visibly labeled as a superseded historical snapshot. Earlier tests are not attributed to this new documentation commit. Newly executed checks below are separated from evidence reused by demonstrated identity.

## Newly executed local verification

Clean clone `/tmp/il512-a-main` selected the actual merge SHA. Environment: Linux 6.1.0-41-amd64, Python 3.11.2, Nodev22.22.0, npm11.18.0; operatorUID/GID1000:1000. Existing private/exclusive evidence helpers were used without modification. Commands are reproducible from an equivalent clean selected checkout:

```sh
python3 -B docs/evidence/IL-5.11-R6S-D4/run-proof.py il512-a7-artifact /tmp/il512-a-main python3 -B docs/evidence/IL-5.11-D2/artifact.py --source /tmp/il512-a-main
python3 -B docs/evidence/IL-5.11-R6S-D4/run-proof.py il512-a7-source-archive /tmp/il512-a-main python3 -B docs/evidence/IL-5.11-release-review/source-archive.py --source /tmp/il512-a-main
```

| Command receipt | UTC start | Exit | Complete journal SHA256 |
|---|---|---:|---|
| [Two-build artifact](evidence/IL-5.12-A-postmerge/postmerge-build/il512-a7-artifact.json) | 2026-10-22T12:55:41.707617+00:00 | 0 | 38233702d9e958a7967f30ac28ab86877fd84d438cf39b74b4f573a3c83390e4 |
| [Source archive](evidence/IL-5.12-A-postmerge/source-run/il512-a7-source-archive.json) | 2026-10-22T12:55:45.098595+00:00 | 0 | 2a580ed9670a5d918376745f9ee8a21ab846a19de47da2298bfd787b5f848fb3 |

Two real npm builds are byte-identical. Every regular member matches selected source and the complete qualified41-member map. Metadata, exports, typings, lockfile, production dependencies and publication scripts are unchanged; production dependencies and prepublication hooks remain empty. The separate GitHub source download returnsHTTP200and verifies all715Git blobs byte for byte without filesystem extraction.

| Artifact | Size / contents | SHA256 | SRI SHA512 |
|---|---|---|---|
| npm | 101778bytes /41members | c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e | sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA== |
| GitHub source | 1106734bytes /715Git blobs | 1a579353e64a091c0a2249d328343de540b1022d0dc43cfb3544a160e61cb045 | sha512-TnZCJdG/LMhhk4a+ZSQcng4j23CdV27DaankmD/xQtT7wcs2Mn6lgXblDDXCK+Hq/KxQZWjFiVtbJ1jsf9ecJQ== |

These hashes were newly computed, not copied as measurements from reference values. Commit, tree, GitHub source archive, npm archive and member identities remain distinct. The exhaustive npm member map is referenced in the artifact summary; unchanged contents do not make source archives identical across different commits.

A supplementary inspection independently rechecked tree equality, member contents/hashes and known private-key/npm/GitHub-token signatures, finding none. Its setup incidents are explicitly retained: the first inline invocation omitted-B and created an untracked Python cache before its clean-state assertion; it did not reach the archive checks. A second invocation used-B from a separate clean checkout and completed the content/tree assertions, but its diagnostic collector then incorrectly passed the mode0755cache directory to private_input, which correctly refused PRIVATE_DIRECTORY_REQUIRED. Neither nonzero process is counted as a successful full qualification command. Diagnostic metadata was subsequently captured using a verified regular read-only input. The cache is retained in the disposable clone; no historical file or tracked source was altered. The required artifact/source commands above had already passed on clean source, and canonical CI independently succeeds. [Incident record](evidence/IL-5.12-A-postmerge/independent/inspection-setup-incident.json) and [individual inspection results](evidence/IL-5.12-A-postmerge/independent/postmerge-independent-inspection.json) preserve this distinction. No mandatory check was retried until success.

## Actual post-merge GitHub execution

[Quality39782283280](https://github.com/drumee/infra-layer/actions/runs/39782283280) completed successfully at exactlyefc8ca2639f31793124459f28b9979235e28b023: eslint, dependencies, unit, contracts and packaging all pass. Packaging job119836311968 actually executes25Python methods without failures/skips, including genuine foreignUID65532, helper-level refusal, sentinel integrity and the original11scenarios/86explicit assertions. The86are not a count of all assertions in the extended suite.

[CodeQL39782284104](https://github.com/drumee/infra-layer/actions/runs/39782284104) completed successfully at that same SHA: JavaScript/TypeScript, Python and Actions. Logs confirm94/94JavaScript,2/2TypeScript,16/16Python and1/1Actions files scanned, successful SARIF upload and completed processing. Execution, publication and conclusions are separately observed. There is no fabricated aggregate PR-result check on main, nor any inference that global alerts are absent.

Hosted checks are actual new executions on the merge commit. The earlier full local verifier at09170b9e and heavy D2 Gateway17/17, Services17/17 plus3x17/17campaign, Lifecycle16/16 and application87assertions remain earlier source-specific evidence. They are reused only under unchanged runtime, distributed members and relevant test/helper inputs; no fresh heavy acceptance or local25-method rerun is claimed in this mission. Python25methods were newly executed by hosted CI, not by the local artifact helper.

## Scanner status and access limitations

SonarCloud remains **FAILURE** at efc8ca2639f31793124459f28b9979235e28b023. Analysis078600b6-76b7-4058-bdd4-ce885fbaf54d explicitly identifies that revision. The accessible inventory returns250open/confirmed/reopened findings, compared with246in the preceding stored main snapshot. Exactly four newly added findings are the same public SHA256 fields already reviewed on PR #18:

| Main issue key | Receipt | Disposition / administrative state |
|---|---|---|
| AaFjrlqT7lu2rHAZLodF | Review-Final/artifact receipt:26 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED /OPEN |
| AaFjrlqG7lu2rHAZLodE | Review-Final/independent inspection:22 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED /OPEN |
| AaFjrloi7lu2rHAZLodD | Review-Final/verifier receipt:26 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED /OPEN |
| AaFjrlq67lu2rHAZLodG | Review-Stop/pr16-head-artifact receipt:26 | FALSE_POSITIVE_TECHNICALLY_CONFIRMED /OPEN |

Each exact field was checked against independently recalculated SHA256 of public capabilities/secrets/index.js. It is a content fingerprint, not a secret. Prior findings retain their scoped technical dispositions and administrative states. No alert is closed, rule disabled, scan called green or global acceptance of250findings implied.

Fresh GitHub CLI reads identify somanos; Code Scanning, Dependabot and Secret Scanning inventories each returnHTTP403 Resource not accessible by personal access token. Exact commands, dates and response bodies are retained. These remain visibility limitations, not empty inventories. Accessible exact-source workflows, logs, source review and reproducible artifacts support this scoped documentation decision.

## Publication and residual limitations

Read-only npm checks at2026-10-22T12:56:04UTC verify publisher somanos, target-package read-write rights and2FA auth-and-writes. alpha.3 remains absent; next=0.1.0-alpha.2 and latest=0.1.0-alpha.1. Credentials/ACLs are not changed, no OTP is stored and no publication is attempted. Local OIDC is unavailable; no registry attestation is claimed. Permissions/2FA and registry metadata must be refreshed immediately before a separately authorized publication.

The original SMTP root cause remains unknown. Owner acceptance is limited to experimental alpha.3's historical uncertainty and does not include future regressions, message loss, TLS defects, open relay, Internet delivery or spool restoration. SMTP_RECOVERY_UNQUALIFIED remains. Root/same-UID compromise, compromised tools and hostile filesystems remain outside evidence-helper guarantees. Debian's aa9057f224f4ae5cf80d777e3cb2fad092193fb1lock, Runtime and Oxy-form are unchanged; D0 is not started.

[Evidence manifest](evidence/IL-5.12-A-postmerge/manifest.json) records files and hashes; complete CodeQL logs, binary archives and full Sonar snapshot remain in identified private roots with fingerprints and authenticated references rather than unnecessary duplication. [Publication handoff](IL-5.12-alpha3-publication-handoff.md) contains prerequisites,2FA/channel requirements and post-publication controls. These post-merge reports use a separate branch based on final main; no direct main report commit or automatic merge of that follow-up PR is performed.
