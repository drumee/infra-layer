# IL-4R distribution isolation integration

The Debian normal-install profile requires independent schema, platform
bootstrap, enrollment, Hub provisioner and ordinary runtime SQL principals.
The original managed database contract admitted one service account only;
an executable integration regression rejected `database.accounts` with
UNSUPPORTED_CAPABILITY_REQUIREMENT. Sharing that credential or generating
infrastructure secrets in Debian would violate the ownership boundary.

Managed databases now accept an optional bounded `accounts` list containing
`user` and `secret_ref` only. References must identify separate database-service
secrets authorizing the database-account consumer. They are included in the
canonical plan, private database projections and protected backup inventory.
Activation creates absent accounts and verifies existing credentials through
the real engine. It never resets a password or assigns SQL grants. Debian owns
the exact application SQL grant policy. Unknown users, duplicate ownership,
root, secret values and external resource management are rejected.

Distribution composition also admits optional private `services` using the
same restricted supplied-service contract as the kernel host. This allows an
independent Hub provisioner process without projecting its database credential
into the ordinary runtime. The lifecycle owns ordering, health, observation,
stopping and coordinated backup. Services cannot publish ports or bypass mount,
ownership or image validation. The kernel must depend on every declared service.

Legacy plans without these fields retain their prior representation. Accounts
are normalized by username. These additions do not supply an identity API,
authorization engine or second installer. Additional-account credential rotation
remains unsupported and must fail closed; no new rotation policy is claimed.

Qualification is in progress; this is not an npm release qualification claim.
