# IL-5.14-C1-S1 dependency security qualification

Gates S1-C and S1-D: PASS. Dependency source9e8eb7c and focused-test sourcee914db67e7b0fec97df89ad1875c18cc984efcd8 preserve all unrelated package records. Root lock SHA256: `29656a3b8e09e4cf640c9b5f5519d47b95bc960abbe5ce33639a93b3a7cd23f3`. Commands run as UID/GID1000:1000,Node22.22.0/npm11.18.0,official registryhttps://registry.npmjs.org.

The original full-development audit was first reproduced with exit1 and preserved as original-audit.json. After the exact dependency update,the following commands each return0 with zero vulnerability entries and no threshold/ignore changes:

```sh
npm audit --include=dev --json --registry=https://registry.npmjs.org
npm audit --omit=dev --json --registry=https://registry.npmjs.org
# The private application acceptance fixture is independently locked:
cd test/application
npm audit --package-lock-only --include=dev --json --registry=https://registry.npmjs.org
```

Audit timestamps and complete machine output are preserved in the S1 execution ledger. The initial passing audit ran after the manifest/lock update and before its commit;the committed lock is identical. Clean installation then succeeds for the committed root and application locks. No audit result is transferred to a materially different graph.

`node test/security/nodemailer-lock.cjs <owned>/nodemailer-10.1.7.tgz` creates two independent fresh prefixes. The second uses the same owned npm cache. Both npm ci operations and npm ls --all succeed;their exact installed graphs and5,209 file/link entries match,SHA256 `4395bc35353bb4b531407798cf4a7c1973e37bd87e5fae5ef58d3521da1c4d32`. Lock records enforce exact versions,official registry URLs and SHA512 integrity. Root Nodemailer10.1.7 and nested10.1.4 are both checked. Generated hidden npm lock metadata is excluded from the content digest;actual package files/symlinks are compared.

The downloaded10.1.7 tarball SHA512 equals its official registry SRI and the lock. An independent positive fixture installs the unchanged local archive offline using a supported npm-generated lock and verifies version10.1.7. The negative fixture alters only its expected SHA512 to another syntactically valid value,uses a separate fresh cache,and performs one offline npm ci. It fails with EINTEGRITY/status1;no Nodemailer package manifest is installed and the external sentinel remains unchanged. The original archive's hash remains correct. No shared cache or registry artifact is corrupted and no network fallback is possible in that offline control.

The root development graph and private acceptance fixture audits resolve all three original advisories. No high,critical,moderate,low or informational finding remains in these recorded scopes. This is dated registry evidence,not proof of absolute software security. No published alpha.3 tarball,production dependency,Server Runtime,Oxy-form,Debian checkout or host security configuration is changed.

Evidence is indexed by the [S1 final decision](IL-5.14-C1-S1-final-decision.md);the exact commands,source,exits,timestamps,protected-Docker comparisons,registry metadata and negative stderr remain in the archived ledger/results.
