# V1-F1 baseline — Gate A PASS

Clean resume checkpoint **af888a0bb51d837e40479bd69d7aec797dbf6767**, branch `fix/il514-c1-network-attachment-identity`, origin `drumee/infra-layer`. AGENTS.md English policy applies. Original K1, A1 and V1 manifests, all 177 original non-documentation inputs, four original V1 harness hashes and the qualified archive were verified before editing. [Baseline](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/baseline.json).

The actual original declaration is `let stdout = "", error;` at `test/diagnostics/fixture-volumes/docker.cjs:11:9`. Successful execution assigns stdout from execFileSync; failure assigns stdout from the caught output. Both overwrite the empty literal before recording its hash or trimming/returning output. The initializer has no side effects or lifecycle meaning. The same surrounding assignments, original exception and Docker command arguments must remain.

Before correction, canonical **`npm run lint` reproduced exit 1**, one `no-useless-assignment` error and 28 historical warnings. This expected initial reproduction is separate from corrected-candidate qualification; it does not rewrite V1's old failure or count as a failed corrected-candidate attempt. [New original-source replay](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/baseline-reproduction.json), [output](evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F1/baseline-eslint.log).

Qualified production/package source remains `20c8a2931dc95f6beca1eb7ac2c0fbe5282194ee`, archive SHA256 **004f018288018f678ed044c56ee4b9de520ab9ec9bc0e7deb3b6d59c172f99e1**. V1-F1 attempt is **V1-F1-3fc8b481-011a-4fba-b735-f764ab3f1ece**, secure private root `/tmp/drumee-v1-f1-_g1ljncz`. Historical source/results, unknown volume identities and deletion restrictions remain distinct.
