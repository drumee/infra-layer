# IL-4R alpha.2 release review

Status, 2026-10-16: **IL-4 — READY_FOR_RELEASE_REVIEW**. Candidate
`@drumee/infra-layer@0.1.0-alpha.2` is packaged and integration-qualified within
the explicit Debian minimal container profile. No npm/image publication or
release tag. Registry latest/next remain alpha.1; recheck availability before
any separately authorized publication.

The artifact source is `ad8f2baecb65e5e8782bb60fa92f1653bcc9f724`, branch
`feat/il4-release-candidate`, based on the qualified lifecycle/resource-order
checkpoint `35fe3d0e6b6311d43940338b65a7e5ae74c0d222`. The account/private-service
integration correction is `9d8462b428db8c8421579067e7cb53b46630d39e`; release
metadata is `08605d96161b9cea4044e97f0924e8e8561084d3`. This final evidence
commit changes no shipped file and therefore requires no dependency repin.

## Artifact and installed consumer

`drumee-infra-layer-0.1.0-alpha.2.tgz` contains 39 allowlisted production,
license, provenance, declaration and documentation files, with no production
npm dependencies. SRI:

`sha512-KuNELBJcKBA69RN65qoej4Wxw+lMN5NJO5d50ooHwydZMB90Rq42MyavDgOwpWqG12bPKjJKH0b01tvN17nsnw==`

Fresh remote Git clone, `npm ci`, units and package audit reproduce the same
tarball bytes/SRI. The standalone installed consumer imports root/lifecycle/
secret subpaths and plans infrastructure without a sibling repository. Strict
TypeScript 5.9.3 NodeNext compilation validates public account/private-service
types and rejects an invalid SecretRef. Explicit CommonJS/type exports retain
the original five root functions and expose lifecycle APIs absent from published
alpha.1. No claim is made that alpha.1 implements IL-3 lifecycle.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run test:integration
npm run test:package
npm pack --json
```

Infra results: **127 unit/security TAP**, **17 gateway TAP**, **17 native-service
TAP**, **16 lifecycle TAP**, and **four HTTPS/job scenarios**, all passing with
zero skips. These are separate counts, not one additive coverage total.

## Debian compatibility

Qualified code: Debian `4a0efba6193912ce5b0487db51fb541ca79638d0`; final ledger
commit `20a0bfa1a83af2a3a83e849c83b619676212a224`, on `feat/container-distribution`. Full report:
[Debian IL-4R ledger](https://github.com/drumee/debian/blob/feat/container-distribution/docs/minimal-kernel-il4r-ledger.md).
Machine-readable snapshot: [IL-4R-validation-evidence.json](IL-4R-validation-evidence.json).

Debian pins this source archive immutably, independent of the npm candidate
tarball. It retains the original 213-artifact/71-source inventory, adds verified
93-source acquisition, and explicitly consumes runtime alpha.4
(`f961f6214432c2e6dbbcde2b926544c076935950`) plus canonical KB-01B
`59985d4a78e142b64f5976cc7460a723cca29a79`. No runtime/control-plane identity,
session, password or ACL implementation was duplicated or modified.

Clean-checkout automatic and real-PTY interactive installations each pass
31 stage groups, three Chromium scenarios, real enrollment/authentication,
Hub lifecycle, MFS/FileIo/transfer/ZIP/Range/OTAK, persistent restart and isolated
cold restore. Automatic initialization also survives a killed canonical
enrollment transaction acknowledgement, missing committed credential refusal,
and concurrent installer resume. UID, operation ID, credential bytes, remit,
reserved identities, Hubs/MFS and local CA remain unchanged.

Real SQL validates the separate infrastructure administrator, schema, bootstrap,
enrollment, provisioner and runtime responsibilities. Ordinary runtime has no
global privilege, schema/account/authority/enrollment writes or direct cookie/
socket writes. Sixteen unique SQL denial cases pass fresh and restored. The
separate provisioner has explicit privileged shard-namespace grants; it is not
misrepresented as least-privileged runtime. Canonical DEFINER/INVOKER behavior
is documented and observed without credentials or authentication hashes.

Testbox uses the physical `192.168.5.202` LAN address, DNS TCP/UDP 53 and HTTPS
443 only after current inspection. A separate client verifies authoritative A
records, actual CA/SAN trust, normal login and real Chromium Finder/LETC/Window
Manager/WebSocket. Fourteen named remote acceptance requirements pass; isolated
restored browser access uses a scoped SSH tunnel to loopback. All disposable
deployment/restoration resources are removed. Pre-existing stopped containers,
networks, host firewall/resolver/trust and permanent services remain untouched.

Retained Debian checks: 331 legacy checks, 15 profile TAP, five Python OCI
security cases. Canonical KB-01B:18 unit/31 SQL TAP; runtime:56 unit/16 KB-01A SQL
TAP; retained kernel/control-plane/capabilities:85 TAP; system-mfs:7 TAP;
exact-source Finder:31 TAP. Overlaps/repeated stages are not added into totals.

## Review limitations and publication prerequisites

One local PTY attempt returned generic DOCKER_LIFECYCLE_COMMAND_FAILED during
restart after Redis rotation; underlying Docker child detail was unavailable
and its cause remains unconfirmed. An unchanged-source diagnostic rerun passed
all stages, alongside independent final automatic and remote runs. Earlier
corrected integration failures and excluded zero-test discovery are disclosed
in the Debian ledger. No test was weakened.

SMTP spool recovery is excluded. Additional managed-account secret rotation is
unsupported. Unqualified engine/schema/kernel transitions fail closed;
same-revision upgrade/rollback was exercised. Native Team packaging is unchanged.
Docker builds have pinned inputs and verified immutable exports; byte-identical
filesystem timestamps are not claimed. The npm candidate does reproduce
byte-for-byte. No automatic host trust/resolver/firewall changes or stale-lock
takeover are provided. Crashed locks/partial canonical DDL require explicit
owner investigation; missing committed administrator credentials are never
regenerated.

Release review must retain these scope limits, recheck registry availability,
select the intended source/branch and obtain explicit publication authorization.
No release tag, npm publish, image push, permanent testbox deployment or Oxymotion
operation is part of this qualification.
