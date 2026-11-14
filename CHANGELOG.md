# 0.1.0-alpha.7-mail03.7 — unpublished quota-transition correction

- Reproduce stale in-flight LMTP admission across a reported quota decrease.
- Defer local dispatch and gracefully retire Postfix delivery contexts before
  publishing quota changes; preserve accepted mail and unrelated IMAP sessions.
- Revoke affected IMAP contexts and verify the native UUID writer locks are free.
  A bounded busy drain keeps admission closed and returns incomplete, never success.
- Probe primary/internal UUID userdb limits, restore delivery, then allow the
  durable administrative commit/release protocol. Native image/module bytes stay
  unchanged; final native qualification is required for this new orchestration.

# 0.1.0-alpha.7-mail03.6 — unpublished administrative engine candidate

- Extend qualified MAIL-02 with crash-released mail locks, sealed reconciliation
  and admission fencing until the administrative commit is durable.
- Add private credential snapshot verification, exact virtual-byte observations,
  mailbox credential generations and explicit monitored application DSN UUIDs.
- Gate native authentication on the existing policy/control network without
  password, hash or login attributes; seal declarative resolver overrides.
- Verify complete runtime/template/storage identities before registry activation.
- Add separately guarded retained-backup content purge with queue/writer refusals,
  inode preservation and interruption recovery. Restoration remains unqualified.
- Preserve capture/relay, native image/module bytes and zero production dependencies.
  This candidate is local/unpublished; qualification evidence is in the paired dossier.

# 0.1.0-alpha.7-mail02.4 — unpublished follow-up candidate

- Remove forged local Authentication-Results, preserving external transit results.
- Seal key inputs and stage TLS generations with endpoint probes and rollback.
- Guard runtime identity, projections and Maildir ownership/inodes before exposure.
- Add guarded boot, credential high-water marks, disk admission and observations.
- Preserve capture/relay, zero production dependencies and recovery refusals.
- Native count quota still fails the concurrent LMTP/IMAP hard-limit requirement;
  MAIL-02 remains blocked pending complete evidence and a qualified correction.

# 0.1.0-alpha.7-mail02.0 — unpublished isolated mail-service candidate

- Add the MAIL-01 mail-service validator, types, native planning and isolated lifecycle.
- Add native SMTP/DKIM/LMTP/IMAPS laboratory and generation revocation evidence.
- Preserve capture/relay and the no-production-dependency package policy.
- MAIL-02 is not fully qualified; production activation and recovery remain refused.

# 0.1.0-alpha.6 — external SMTP authentication candidate, unpublished

- Validate provider authentication accounts separately from internal identifiers.
- Add import-only smtp-external-credential with an explicit UTF-8 byte contract.
- Stream one exact account:secret record into a private indexed Postfix map,
  without secret shell substitution, argument exposure or silent whitespace loss.
- Preserve TLS verification, consumer ACLs, private permissions, submission
  identifiers, lifecycle recovery and SMTP_RECOVERY_UNQUALIFIED.
- Alpha.5 is published and immutable. Alpha.6 is not published by this change.

## 0.1.0-alpha.5 — historical rollback recovery preparation

- Serialize absent Docker role labels explicitly as empty strings, independent
  of optional health lookup behavior.
- Normalize only Docker's empty-string observation of an absent infrastructure
  role before comparing it with the prepared candidate's missing label.
- Compare complete runtime mount records independently of Docker observation
  order while preserving multiplicity and rejecting every content difference.
- Preserve required application roles and every authorization, identity, exposure,
  mount and network refusal. Regress mixed application/SMTP/DKIM recovery.
- Alpha.4 remains an immutable published baseline. No publication, release tag,
  Debian lock update or Oxy-form merge is authorized by this candidate.

## 0.1.0-alpha.4 — historical release-identity preparation

The following notes describe its unpublished preparation; alpha.4 has since been published.

- Assign a distinct npm identity to the integrated IL-5.14 candidate because
  alpha.3 is already published with different bytes.
- Preserve runtime implementation, public APIs, dependencies and Docker inputs.
- Keep publication unauthorized and the main-branch SonarCloud policy blocker open.

## Historical IL-5 development notes — alpha.3 candidates

- Replace ambiguous image-reference backtracking with deterministic validation;
  preserve pinned SHA256/numeric-suffix formats and reject trailing controls.
- Qualify the corrected alpha.3 bytes separately from the IL-5.11R candidate.
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

## 0.1.0-alpha.7-mail02.13 (unpublished qualification candidate)

- Declare a static mail-owned frontal endpoint for independent source-preserving Docker client attachments.
- Install a fixed private-source packet filter inside the Postfix namespace, dropping NET_ADMIN before execution.
- Requalify against the separately built atomic native quota module; no production dependency is added.


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
