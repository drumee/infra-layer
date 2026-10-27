# Error diagnostic

Gate A PASS. Local branch/head `fix/il514-c1-network-attachment-identity` / `3384434e1048e2157d3abbb43a6dfdf3fccf1b98`, clean tree; PR20 remains open on `cd9b8322bd7eef3b4094710ec4ea26be94f08922`, main `c218811effc83da25cf71a914e27accc96101329`. No unchanged failing suite was rerun.

Saved F1 log identifies `network object identity, isolation and actual membership cannot be substituted`, test/unit/network-attachments.test.js:69, assertion77. Final mutation changes redis.networks to `["other"]`; kernel network/container metadata stay structurally valid. Call: checkNetworks → containerNetworks → serviceNetworks. At original line87 one condition combines empty/duplicate roles with `!Object.hasOwn(compose.networks, role)`, emitting INVALID_NETWORK_ATTACHMENT. Historical code selected.includes(role) instead emitted NETWORK_ATTACHMENT_MISMATCH for that same observed-vs-declared conflict.

This is overbroad semantic classification, not a Docker/environment failure or absent optional Health. The original F1 34/35 result and stack remain immutable in docs/evidence/IL-5.14-R1-F1/focused-network.log.
