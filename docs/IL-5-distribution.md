# IL-5 distribution ownership

The operator distribution lives in
[drumee/debian minimal-application](https://github.com/drumee/debian/tree/feat/il5-minimal-application/profiles/minimal-application).
Its [operator guide](https://github.com/drumee/debian/blob/feat/il5-minimal-application/docs/IL-5-distribution.md)
describes verified acquisition, immutable image/plugin assembly, explicit
`drumee-ctl --profile minimal-application`, host Nginx integration and recovery.
Infra Layer supplies no competing installer or application-specific settings.

Debian's normal image contains published Runtime alpha.4 and explicitly supplied
native plugins. Infra Layer remains an operator dependency with zero production
npm dependencies of its own. The reference host uses Runtime's native anonymous
context/authorizer; consumer-specific canonical authentication adapters remain
the consumer's composition responsibility. Oxy-form source is not imported.

The application-only descriptor has no gateway/Hub/MFS/Finder/DB/Redis/DNS.
Optional canonical SMTP/DKIM requires explicit capabilities, immutable native
image, persistent queue, TLS, authorized secret projections and relay inputs.
The built-in reference example contains no disposable test plugin.

Debian owns outer owner/storage policy, config snapshots, artifacts and command
dispatch; public Infra APIs own planning, preparation, activation, observation,
stop, cold backup, isolated restoration and compatible rollback. Existing Team
and minimal-kernel source profiles are retained. See [qualification](IL-5-qualification.md)
for exact tested scopes and [handoff](IL-5-release-handoff.md) for integration order.
