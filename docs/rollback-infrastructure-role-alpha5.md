# Alpha.5 — mixed-service failed-start rollback qualification

## Change and boundary

Starting producer main: `a8037dd62a50ae4bcb8ab0b36f6a8e1b5f23a0a6`.
Published alpha.4 remains immutable. Alpha.5 was selected after successful public
registry inspection found versions through alpha.4 and no alpha.5 release.
The existing publication convention is the prerelease `next` tag. No publication,
release tag, Debian lock update or Oxy-form merge is part of this correction.

The failed-start recovery guard compared Docker's observed empty string for an
absent role label directly with the prepared JavaScript missing property. Mail
and DKIM have no explicit role; the supplied application does. Only `""` now maps
to undefined for this comparison. No other falsy value is normalized, required
roles remain exact, and the other authorization/identity/network logic is unchanged.
Infrastructure labels are not rewritten to hide the mismatch.

Real Docker 29.2.0 also exposed a template-specific distinction: inspecting only
the missing label yields `""`, but the complete adapter template yields `null`
after the optional health lookup. The adapter now explicitly serializes an absent
or empty string label as `""`, independently of that template evaluation detail.
Docker labels are strings; a nonempty value remains exact. The rollback guard
still rejects a supplied null observation. The baseline runner records the actual
full-adapter null value rather than substituting the reduced-template observation.

The complete real replay exposed another representation-only mismatch: Docker
returns the same SMTP mount records in different array orders across inspections.
The authoritative comparison now sorts serialized complete records ordinally,
without mutating either observation or removing duplicates. Added, missing,
duplicated or changed mount records still refuse. No mount authorization policy
or network condition is relaxed.

## Frozen evidence inputs

- Debian CLI/configuration code: `175e6fd1c1500a05192ad367dca95ebd1fcecdbb`.
- Oxy-form configuration code: `9f558e505fef5e16bcc3246fbef93f0e513264da`.
- Real Oxy-form plugin image:
  `sha256:93d608295a22feeb1008f3a48c8f47e5427e20947b87232dfb7d835e9efa82f8`.
- Canonical SMTP/DKIM tools:
  `sha256:592eea5363d23d3dac46dffab71a776cfbb4f2e4673f9f7c7b39d694e76dbf3e`.
- The image plugin receipt identifies
  `a28984efb26b1661f971148a25aa4756b8e32425`; all shipped plugin bytes equal
  the Oxy-form PR #3 source above. Images contain Runtime alpha.4 and the real
  forms plugin, not an invented RPC fixture. They remain local/unpublished.

The application/runtime/plugin and native-tool executable inputs are unchanged,
so those immutable images are reused. They were originally built with alpha.4
provenance labels; this is not claimed as a new image build with alpha.5. The
host-side operator/lifecycle implementation is the explicit archive under test.

## Real regression procedure

`test/rollback-role/run.cjs INPUT.json` creates an owned consumer fixture. It
copies only frozen CLI/configuration sources, creates a separate qualification
manifest/lock with an explicit archive dependency, and verifies installed version,
archive SRI and module resolution. It does not edit or claim to qualify the
released Debian dependency graph. No producer-checkout fallback or mock Docker
adapter is used. Its input explicitly chooses expected baseline refusal or
candidate recovery; baseline defect reproduction is not reported as a PASS of
published alpha.4's recovery capability.

Input fields: archive (absolute tarball), version, producer_source (qualified
commit), debian_repository and oxy_repository (read-only Git object sources),
images (immutable image receipt), expect (`blocked` or `ready`), output (private
report). No credentials belong in this descriptor. The runner generates synthetic
submission credentials and uses only a private capture queue, with no real mail.

The real sequence installs application/mail/DKIM, captures a synthetic request,
checks ordinary configuration rollback, fails plugin provenance/startup, verifies
recovery-required and real observed identities/roles, rejects an unauthorized
rollback, and requests rollback to the prior verified revision. Candidate mode
also checks actual readiness/RPC after recovery, durable ledger/queue IDs/secret
generations, real extra-network refusal without container replacement, explicit
SMTP_RECOVERY_UNQUALIFIED and owner refusal, plus redacted logs. Every created
resource is ownership-checked before removal. The complete before/after receipts
and final source/archive/check results are recorded in the final decision report.

## Targeted refusal coverage

The role tests cover missing infrastructure roles plus required application roles,
unexpected nonempty roles, null/false/zero, unauthorized contexts, owner/project/
name/image/image-ID/revision/service changes, configured/live exposure changes,
and declared mount source/write-mode changes. Existing rollback-boundary tests
retain complete network/ID/revision/strict-readiness checks; authoritative
reinspection now explicitly exercises both changed configured bindings and an
added mount. The change does not provide a new general identity or mount policy.

## Release and downstream handoff

The dependency graph, public exports/declarations, Dockerfile and production
JavaScript outside the Docker observation template and rollback guard are unchanged. The version/root lock and current release metadata are
updated; historical receipts retain their original meanings. The alpha.5 tarball
has new bytes and requires its own inventory/SHA256/SRI/consumer/type qualification.
No alpha.4 archive checksum is reused for it.

After exact-head PR and main checks pass and the merged-source archive reproduces,
alpha.5 may be recommended for a separate owner publication decision. Prepare an
explicit `npm publish ARCHIVE --access public --tag next --ignore-scripts` command;
do not execute it in this mission. Only after authorized publication should
Debian receive a targeted registry/lock convergence, followed by a full OF-01R
replay. Oxy-form PR #3 stays draft; real upstream SMTP and mailbox reception remain
separate work. SMTP spool backup/restore remains unsupported and explicitly refused.

## Qualified local receipt

Executable/archive source: `25dca4695976545f51f34504f071c80e15a1d9d1`.
Subsequent test-only fixture completion does not change any archive member.
Node 22.22.0 / npm 11.18.0 / Docker 29.2.0 were used.

- Published alpha.4 real-adapter baseline: ordinary rollback succeeds; failed
  plugin-provenance recovery is refused as RUNTIME_IDENTITY_MISMATCH.
- Alpha.5 real adapter: all six groups pass, including actual post-recovery
  readiness/RPC, unchanged durable ledger, queued message IDs and secret
  generations, real unexpected-network refusal and retained SMTP recovery refusal.
- Unit tests: 399; contracts: 24; mount/ownership regressions: 63; Python security:
  31; isolated system-tool permission scenarios: 12. All pass without skips.
- ESLint: zero errors/new findings; 26 existing warnings remain visible.
- Production/development audits: zero vulnerabilities at qualification time.
- Canonical package audit, isolated installed consumer (8 + 37 assertions),
  strict NodeNext public declaration checks: pass. No production npm dependencies.
- Two independent clean-source archive builds are byte-identical: 43 members,
  108632 compressed bytes, 386015 unpacked bytes. The member inventory is identical
  to alpha.4; changed members are the manifest, three release documents and the
  two corrected implementation files.

SHA256: `d714ea7fcce17041a4c6c9509add14c52c735169a4d6660d55ff570fc64fc75f`

SRI: `sha512-NmHYfb/n83s2iY7MEpqNBU7W6xMGAiUHaUfzcm8C57ooPMR2oQeB6Q9O37ip0/Mb3O+/Oa4vx3n7ONLEcE2IVQ==`

Exact-head hosted PR/main checks and merged-source archive comparison are required
before the final publication-readiness recommendation. The local report and raw
receipts remain outside the published inventory. No external SMTP delivery or
mailbox receipt is claimed by this isolated capture qualification.
