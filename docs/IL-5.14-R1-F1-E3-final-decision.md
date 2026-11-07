# E3 final decision

**CHANGES_REQUESTED** — mandatory static-review stop; no guard implementation or test rerun.

Reviewed clean local source `3c54d0fc5f15d7d6be52bd0201d93acdc3797a02`; executable revision `740d01f77b20358cee8b3cad4cb501b830bd0ce8`. PR20 remains open on `cd9b8322bd7eef3b4094710ec4ea26be94f08922`, main. Analysis uses pinned historical `703b637` resolved to full SHA and actual current source via Espree; tool/source hashes: [identity](evidence/IL-5.14-R1-F1-E3/source-identity.json).

52 historical protected expressions,54 current,51 ordered exact-text matches,1 absent historical outer assertion,3 unmatched current calls. Two current calls are the explained F1 full-detachment assertion plus nested inspection. The remaining new assertion REPLACES historical `check(D.checkNetworks(missing), undefined)` with `assert.throws(() => D.checkNetworks(missing), { code: "NETWORK_ATTACHMENT_MISMATCH" })`. Its identical nested call text has also moved from success-check argument to rejection callback. This is MODIFIED_HISTORICAL, not an insertion-only change.

E3 explicitly requires every historical expression to remain unchanged and stops if one is removed/modified. The requested addition-only reconciliation cannot satisfy that condition against actual F1 source. Restoring historical success would contradict the fail-closed membership requirement. Silently approving the replacement as an addition would violate E3's guard contract. A narrowly explicit technical disposition for this exact contract replacement is required before implementation may resume. No change to test expectations, historical reference or production source was made.

| Gate | Status | Evidence/disposition |
|---|---|---|
| A | PASS | Complete static inventory/classification; pure-addition hypothesis false: one historical assertion replaced. |
| B | BLOCKED | Strict unchanged-history requirement conflicts with actual F1 documented contract replacement; explicit disposition required. |
| C | NOT_EXECUTED | Mandatory stop before guard implementation. |
| D | NOT_EXECUTED | No guard mutation tests. |
| E | NOT_EXECUTED | No unit rerun. |
| F | PASS | PASS_PREVIOUS_VERIFIED_SOURCE: E2 runtime/acceptance hashes unchanged; no Docker rerun. |
| G | NOT_EXECUTED | Remaining integration/lint/audit/consumer checks not started. |
| H | NOT_EXECUTED | No new complete package/security qualification. |
| I | NOT_EXECUTED | No push/new hosted head. |
| J | NOT_EXECUTED | R1 finding remains open; independent closure not performed. |
| K | PASS | Source-specific stop decision and evidence recorded. |

Complete expression text/spans/types/contexts/duplicate occurrences and difference classifications: [inventory](evidence/IL-5.14-R1-F1-E3/expression-inventory.json), [classification](evidence/IL-5.14-R1-F1-E3/classification.json). The LCS was used only for static diagnosis, never substituted for a strict guard. No historical Docker/spawn removal or reordered retained sequence was observed. Prior S2 wrapper/context changes are recorded explicitly.

Existing E2 Docker acceptance remains PASS_PREVIOUS_VERIFIED_SOURCE: runtime, readiness, diagnostic and actual acceptance bytes match exactly;21 network,42 Redis over2 cycles,15 Health assertions and verified cleanup are historical evidence, not new E3 execution. E2 unit244/245 remains a failure; no passing E3 count is invented. No package candidate identity or new hosted success is claimed.

Required next disposition: authorize only the precise historical success-to-refusal replacement, pin both identities/contexts and require a strict one-to-one replacement-aware guard plus negative deletion/modification/order/duplicate/insertion tests. Preserve all other historical operations and individually inventoried F1 additions. Do not remove the preservation test, regenerate a broad baseline, restore unsafe acceptance or introduce arbitrary-subsequence permission.

No merge, publication, tag, deployment, PR update or downstream change occurred. R1 MAJOR remains open pending full qualification and independent review. Residual limits: SMTP_RECOVERY_UNQUALIFIED; H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED; failed Debian H3; downstream qualification incomplete.
