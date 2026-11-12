# MAIL-01 — standalone Oxymot mail service design

Design version **1.0.0**, 2026-11-12. Status: **MAIL-01_READY_FOR_MAIL-02**.
This freezes an implementation contract, not a production activation decision.
MAIL-02 may implement and qualify isolated transport against this design. Public
ports, firewall/DNS/PTR changes, production installation, real SMTP emission,
artifact publication and deployment-triggering merges remain outside MAIL-01.

## Deliverables and order of authority

1. [Audited references and evidence boundaries](audit.md).
2. [Versioned contract, defaults and compatibility](contract.md), with
   [JSON Schema](mail-service.v1.schema.json) and [examples](examples/).
3. [Architecture, flows and security boundaries](architecture.md).
4. [Managed data model and CLI specification](operations.md).
5. [Migration, rollback and restoration](migration.md).
6. [MAIL-02–MAIL-06 acceptance gates and open decisions](qualification.md).
7. [Isolated hypotheses, commands and results](evidence/README.md).

Normative prose supplies cross-field and operational rules beyond JSON Schema.
The schema is a proposed contract artifact; no runtime API, CLI command, service
profile or package release is implemented by MAIL-01. Lab code is test-only.
Examples with reserved domains, zero digests and proposed allocations are
structurally valid design examples; they are deliberately not deployable.

The implementation split is explicit: Infra Layer owns validation, native
Postfix/OpenDKIM/Dovecot rendering, secret projections, resource/network identity
and lifecycle primitives. Debian owns `profiles/mail`, immutable acquisition,
image assembly and dispatch through the existing `bin/drumee-ctl`. MAIL-03 owns
the administrative CLI. Applications only receive the client submission contract.

## Decisions frozen for implementation

- An independent `mail` distribution and project own the queue, registry, mailbox
  storage, TLS/DKIM material and lifecycle. Oxy-form and Ghost own none of them.
- Postfix accepts Internet mail only for declared active local addresses; Dovecot
  receives it over a protected Unix LMTP socket and serves IMAPS. OpenDKIM signs
  authenticated originating mail only. App identities cannot log in to IMAP.
- Submission requires TLS and authentication on every path, including private
  application traffic. No CIDR bypass. Both envelope and author headers are
  authorized per account. A mailbox has independently controlled receive/IMAP/
  submission flags; aliases have no credential.
- Direct MX delivery uses IPv4 and opportunistic TLS by default, with an explicit
  verified-TLS option. There is no upstream relay in this new contract. Existing
  alpha.6 capture/relay contracts retain their behavior and version identity.
- Stable mailbox IDs determine Maildir paths. Deletion retains messages; purge
  is separate. Registry generations activate with a durable journal and service
  barrier; restrictions fail closed during an incomplete activation.
- SMTP queue backup/restore stays **SMTP_RECOVERY_UNQUALIFIED** until MAIL-05
  proves the queue-specific recovery protocol. Ghost's existing restore proof
  remains separate. No exactly-once delivery claim is made.

The remaining owner/site choices gate real integration or activation, not the
start of isolated transport implementation. Their consequences and deadlines are
listed in [qualification](qualification.md#open-decisions).
