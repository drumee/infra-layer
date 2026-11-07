# IL-5.14-R1-F1-E3-A1 independent source review

Decision: **CHANGES_REQUESTED**. Qualification stopped after independent reproduction of one **MAJOR** finding at local head `8bf02d5407ee9dbb06c4c7f86d04d3fc533ac4d7`.

## A1-IR-001 — Preservation guard accepts disabled historical and authorized assertions

Location: `test/support/harness-preservation.cjs:50`, `:56`, `:72`, `:88`.

The guard extracts each protected CallExpression and records selected function, statement and block contexts. It does not preserve expression evaluation context. Inserting a logical short-circuit immediately around a protected call leaves every extracted text/context identity unchanged.

I independently read pinned historical bytes from Git at `703b637425487286632e741045a1b96591e90c62`, read the actual current harness from disk, and passed three separately mutated strings to `guard.verify`. Each mutation prefixes exactly one existing assertion with `false &&`:

1. Historical `check(redis(["PING"]), "PONG")`.
2. Authorized replacement `assert.throws(() => D.checkNetworks(missing), { code: "NETWORK_ATTACHMENT_MISMATCH" })`.
3. Authorized full-detachment addition `assert.throws(() => D.checkNetworks(composition, { require_existing: true }), { code: "NETWORK_ATTACHMENT_MISMATCH" })`.

All three are accepted with `historicalExpressions:52`, `currentExpressions:54`, `replacements:1`, `additions:1`, exactly like the original canonical harness. JavaScript short-circuit semantics mean those assertions and their nested validation calls would not execute. The mutations were parsed only; no generated or mutated JavaScript was executed, and no repository file was changed.

The exact evidence is `guard-short-circuit-probe.json` in this directory. The bug defeats the required context-bound preservation of both the historical protection and the one narrowly authorized security contract replacement. Presence/count/order/diagnostic phase alone does not establish preserved evaluation. The current harness itself was not found to contain these injected short-circuits; this finding concerns a false acceptance by the required regression guard.

Required disposition: preserve evaluation/parent context sufficiently to reject suppression or changed execution conditions, with independent negative coverage at least for these three actual-source mutations. Do not execute arbitrary mutation strings. No broad new replacement authorization is implied.

## Scope and stop state

Read repository AGENTS.md, original R1 review and decision, E3 contract/stop decision, A1 authorization inventory/replacement identification/guard qualification, lifecycle/docker.js, the current real-Docker harness, helper and focused guard/network tests. The runtime now compares complete configured network sets and enumerates project containers in addition to declared network attachment maps, which addresses the shape of the original missed-container exposure. This preliminary source observation is not independent closure or completed runtime qualification.

Per mandatory stop, no package verification, positive full-suite qualification, Docker fixtures, final-head/hosted checks or R1 FINDING_CLOSED determination followed the new MAJOR finding. The parent reviewer was notified promptly. Repository status remained clean. No implementation edits, commits, PR changes, merge, publish, tag, deployment, protected configuration change or downstream modifications occurred.

Residual limitations retained: `SMTP_RECOVERY_UNQUALIFIED`; `H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED`; historical Debian H3 failed, no downstream qualification claim.

## Exact source and probe identities

Recorded independently in `source-and-probe-identity.json`:

- `test/support/harness-preservation.cjs`: SHA256 `174586571877b31fc70073992e54b58a377397d02a31fb8ac7bbfe15ba642d4d`, 6647 bytes.
- `test/network-attachments/real-docker.cjs`: SHA256 `7529d2820ae2205df4877e5ebd65852368300f003083a6a873164552a332c4f4`, 10469 bytes.
- `test/unit/harness-preservation.test.js`: SHA256 `983dd4843fc55eda5f353a1862d89f9382a6cdb6c393b2ae22b34a79a9d8edd2`, 5813 bytes.
- `lifecycle/docker.js`: SHA256 `2a72f5bca8d8494141eca7b597d52a820643cb0dcf04c9c2dd9bfd2b01ca2650`, 16110 bytes.
- `pinnedHistorical:703b637425487286632e741045a1b96591e90c62:test/network-attachments/real-docker.cjs`: SHA256 `67672bb516d08281f8dbdba8e8fe1b1a8f9f15d86667a3b7f74f2229cc9d107c`, 8827 bytes.
- `guard-short-circuit-probe.json`: SHA256 `09bd1ad4e985d7bacde2f4f1e6779e1e8a02b9cbd930104faa52d737bef832fb`, 1682 bytes.
