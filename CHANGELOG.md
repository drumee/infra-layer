# 0.1.0-alpha.3 — IL-5 development, unpublished

- Add an explicitly private application distribution without a managed gateway.
- Reuse native service, resource, secret and lifecycle contracts; retain legacy profiles.
- Add application plugin inventory and explicit required secret references.
- Add CA-only SMTP trust projections without application access to issuer keys.
- Reject unqualified application SMTP backup/restore; preserve cold no-SMTP recovery.
- Record actual Runtime/host-proxy/network/recovery and installed-consumer evidence
  separately from future SMTP Internet delivery and Oxy-form acceptance.

## IL-5.8 security/reliability review — unpublished candidate refresh

- Harden qualification executable resolution and private interruption inputs.
- Preserve exact composition output and validation precedence while extracting
  internal validators; clarify probe completion and deterministic key sorting.
- Add timeout/late-callback, unsafe-file/PATH and actual SMTP TLS refusal tests.
- Public declarations, exports, dependency pins, loopback routes and canonical
  SMTP/recovery policy are unchanged. Repack with a new integrity receipt; the
  previous candidate SRI and Debian source lock do not identify these new bytes.

## IL-5.11R trusted system tools — unpublished candidate refresh

- Resolve Docker, ss and OpenSSL through fixed, root-controlled Debian paths;
  validate symlink entry paths, targets, executable permissions and ancestors.
- Use minimal child environments, system Docker CLI configuration and protected
  Compose plugin paths; revalidate the configured ACME client before execution.
- Harden the affected qualification launchers without changing public exports,
  types, dependency pins, network policy or lifecycle operation order.
- Include one private internal module. Previous 40-file candidate integrities and
  Debian's source receipt do not identify this new 41-file candidate.

# Changelog

## 0.1.0-alpha.2 — release candidate, unpublished

- Include the IL-2 native capabilities and IL-3 lifecycle APIs absent from
  published alpha.1: preparation, activation/attestation, inspection, coordinated
  backup, isolated restore, rollback, renewal and protected secret transitions.
- Preserve corrected resource normalization and stable malformed-resource
  diagnostics validated at IL-4 checkpoint `35fe3d0…`.
- Admit separate managed SQL accounts using infrastructure-owned secret
  references, without application grants or credential resets.
- Compose private distribution control-plane services independently from the
  ordinary kernel process, retaining canonical ownership and recovery guards.
- Declare CommonJS/package/lifecycle exports and include their public types.

Debian compatibility targets the explicit minimal-kernel profile with
`@drumee/server-runtime@0.1.0-alpha.4` and canonical KB-01B enrollment. Runtime,
identity, session and ACL implementations remain owned by their existing
packages. There are no production npm dependencies in Infra Layer.

Full IL-4R integration, clean-checkout, LAN/browser and recovery qualification
must pass before declaring this candidate release-qualified. No publication or
release tag is authorized by preparing this archive.

## 0.1.0-alpha.1 — published baseline

IL-1.1 infrastructure planning, Nginx integration and observation. This registry
release does not contain the later IL-3 lifecycle implementation. Development
source archives retaining alpha.1 metadata are separate immutable artifacts.
