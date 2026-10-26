# IL-5.14-C1-L1 security qualification

Gate G: PASS for mandatory locally executable controls. Source ce1ba500d3775d1a7f6ac0156d26b60a4c6ccc4c; final CI-only source 03e63e114278ee24561847d3a7c88e910f293a08 leaves runtime/package/dependency inputs unchanged. No exception or threshold change is used.

At 2026-10-26T09:22:08–09:22:09 UTC, official registry https://registry.npmjs.org:

| Actual audit command/scope | Exit | Findings |
|---|---:|---:|
| npm audit --include=dev --json --registry=https://registry.npmjs.org, root | 0 | 0 |
| npm audit --omit=dev --json --registry=https://registry.npmjs.org, root | 0 | 0 |
| npm audit --include=dev --json --registry=https://registry.npmjs.org, test/application | 0 | 0 |

Full machine-readable results are preserved under the final-audit logs in [the evidence manifest](evidence/IL-5.14-C1-L1/files-sha256.json). Zero reported findings is not proof of absolute security. No original advisory is ignored, suppressed or relabeled. npm ls confirms direct nodemailer 10.1.7, smtp-server 3.19.24 and its nested nodemailer 10.1.4, with no overrides. Root lock SHA256 remains 29656a3b8e09e4cf640c9b5f5519d47b95bc960abbe5ce33639a93b3a7cd23f3. A fresh isolated npm ci yields the same 5209 file/link entries as the tested installation, excluding only the location-specific hidden npm lock. [Clean-install comparison](evidence/IL-5.14-C1-L1/clean-install-comparison.json).

Security controls actually exercised:

- Typed Docker container/network/endpoint metadata, unsettled endpoint refusal, missing required resource refusal and real nonzero command propagation: 13 source-fixture cases and two real lifecycle cycles.
- Normal-user execution, ownership, foreign-resource refusal and cleanup: real services/lifecycle/application suites. /etc/docker snapshots remain unchanged for all receipts.
- Trusted binaries and protected configuration: npm run test:system-tools, exit 0, 12 real-filesystem/container scenarios, including writable/foreign/symlink/PATH/plugin/config refusals; host binaries unchanged.
- Installed package, not checkout-private imports: node test/security/installed-consumer.cjs <isolated consumer>, exit 0, 4 real Docker/ss/OpenSSL substitution and wrong-CA scenarios; substitute executables never run.
- HTTPS CA/SAN validation, secret permissions, loopback-only publication, independent LAN denial and public/protected RPC: 87-assertion real application acceptance.
- STARTTLS/authentication, DKIM signature material and actual unauthorized relay denial: 17 services tests plus application SMTP scenario.
- Real Chromium gateway acceptance retains sandboxing; local debugging/profile isolation remains mandatory.
- Canonical Python filesystem/ownership/subprocess/archive regressions: 25 passed, exit 0, no skips. Original scanner baseline and severity remain intact; final lint has 0 errors/0 new findings and 28 visible historical warnings.

The registry alpha.3 artifact was independently read and retains size 101778, SHA256 c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e and the canonical SHA512 SRI. The separate local corrected archive has a different hash and was never published. [Registry readback](evidence/IL-5.14-C1-L1/published-alpha3-readback.json).

Hosted CI/security results are separate from these local results. The branch-protection API returned HTTP403 with the current credential, so detailed protection requirements are unverified; no policy/configuration bypass or change was attempted. [Policy readback](evidence/IL-5.14-C1-L1/github-policy-readback.json). SMTP_RECOVERY_UNQUALIFIED remains: no Internet mail delivery or spool recovery qualification. H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED remains distinct from the H3 network identity defect and D1 optional-health defect.
