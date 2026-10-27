# Package qualification — partial, NOT_EXECUTED as complete gate

Canonical `npm run test:package` passed concurrently with the failing unit suite:42 allowed package members, no production dependencies, packed consumer smoke PASS. Transient tested archive SRI: `sha512-4QahcHIO6t04bnC4W1LNclBffwSSakVq+d+bMDfN/78dPAxRYp6kCH5aTXkupakSDptD18S5R1pyxhap3ztQ4A==`. Full [package log](evidence/IL-5.14-R1-F1-E2/package-audit.log) preserves the exact inventory. This is not a retained and fully qualified E2 release candidate.

No retained archive SHA256 or strict NodeNext/application consumer qualification was produced after the unit stop. Do not reuse historical S2 SHA256 `3f6bdc655180ffa8b2a2f0746583b02b377fcbf3da2fc473761d3cbeae56e54b` for the changed runtime. Public exports/types/manifests/dependencies remain unedited. Alpha.3 remains immutable; nothing was published/tagged. Gate G NOT_EXECUTED as a completed package/security gate.
