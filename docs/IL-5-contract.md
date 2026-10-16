# IL-5.1 — application / external-gateway public contract

Implemented: additive `Distribution.profile: application`, native supplied
service reuse and an explicit private host ingress. Actual network/process evidence is recorded in [qualification](IL-5-qualification.md);
pure composition tests are not used as network acceptance.

## Distribution

Version remains `Distribution.contract_version: "1"`; new fields are opt-in.
`application` is a `SuppliedApplication`: the existing non-root immutable-image
service contract, plus required `plugins: { id, root, revision }[]` inventory.
An empty explicit plugin inventory is allowed. IDs/roots are unique, roots are
absolute safe paths and artifact revisions are immutable 40/64-digit hex IDs.
This metadata never loads code; the distribution host uses the native runtime
descriptor/dispatcher. Immutable image and validation/health contracts bind the
actual plugin content. No generic RPC worker or ACL implementation is in Infra.

Existing service command, entrypoint, non-secret environment, dependencies,
resource mounts, authorized secret projections, healthcheck and listener fields
retain validation. Application has one declared listener matching host ingress.
Reserved infrastructure identities cannot masquerade as applications. Supplied
application services keep the existing private `kernel` network role; the name
does not imply installation of kernel capabilities. Host networking is refused.

The required `external_gateway` record is:

```js
{
  kind: 'host-loopback', protocol: 'http',
  host_address: '127.0.0.1', host_port: 28971, container_port: 3101,
  route_prefix: '/-/', rpc_prefix: '/-/svc/', tls_termination: 'external',
  readiness_path: '/-/svc/health.ready'
}
```

Ports are explicit integers >=1024; values above are examples, not defaults.
The generated publication is Docker TCP target=container_port,
published=host_port, host_ip=127.0.0.1. `listener_ports` alone never publishes.
The external proxy upstream is derived as http://127.0.0.1:host_port and reported
in deployment observation. Alternate interfaces, wildcard/IPv6/loopback aliases,
different path prefixes, implicit TLS, extra ports and mixed managed HTTP
gateway fields are rejected. IPv6 publication is initially unsupported.

Application plans set `spec.http.enabled=false`, `https=false`, with no gateway
adapter. SMTP may separately require TLS material; it is never HTTPS termination.
Both historical profiles retain their guards/representations, and reject the
new application fields rather than accidentally relaxing their semantics.

## Secrets

V2 requirements add optional `secret_refs: SecretRef[]` selecting declared secret
descriptors. Unknown/duplicate refs fail. Selected application secrets can be
prepared without any infrastructure service. `SecretDescriptor.type` adds
`application-secret`; the existing provider generates, persists and projects it.
No credential implementation or raw value is added to the planner. Existing
inputs without new fields preserve normalization and selected secret lists.

## Dependencies and SMTP

No Hub/MFS/Finder/SQL/Redis/DNS/gateway requirement is implicit. Only declared
infrastructure fragments exist. Application activation order is selected
DNS/database/Redis, selected DKIM/mail, initialization jobs, then application;
shutdown reverses it. Application may explicitly depend on available jobs or
services. Requiring mail also requires `smtp` in capability requirements, making
its readiness mandatory. Otherwise selected SMTP is optional with diagnostics.
The application cannot depend on or join the private DKIM-only control network.
Existing SMTP planning, CIDR/SASL, STARTTLS/upstream verification, no public
bindings, persistent queue and declared relay endpoint are reused unchanged.

## Readiness and recovery

Activation/inspection validate exact image/mount/port/process evidence, execute
the supplied native health command and probe the declared host-loopback native
RPC path. The response must be bounded JSON with HTTP 200 and `status: ok`.
This proves application ingress, not external proxy TLS or Internet isolation;
those require independent qualification observations. External TLS is explicitly
outside Infra Layer ownership and is never marked HTTPS-verified by this probe.

Deployment state optionally adds `application` with derived upstream, container
and host ports, exact binding, prefixes, external TLS ownership and protocol
evidence. Readiness errors are safe machine codes. No arbitrary probe URL or
caller-created success attestation is accepted.

No-SMTP application backup/restore uses the existing cold lifecycle and exact
resource/schema/secret matching. Application backup/restore with mail fails
closed with `SMTP_RECOVERY_UNQUALIFIED`; existing generic copying is not a spool
recovery contract. Existing profile semantics remain unchanged. Configuration
rollback requires matching images, resources, schemas and secret generations;
no unqualified engine/image downgrade is allowed.

Public root functions/exports stay unchanged. New types are exported through
the existing root/lifecycle declarations. The local development package will
use alpha.3 and is not published by IL-5.

## IL-5.2 integration clarification

Actual SMTP client integration requires trust without leaking private keys. The
existing projection pipeline now accepts `secret_mounts.format: tls-ca-bundle`
only for the exact plan TLS ca_bundle_ref, for the service itself, and only when
that reference is not a selected secret descriptor. It projects public CA PEM
with existing canonical preparation; private/leaf-key references and unrelated
consumers are rejected. No root secret store or HTTPS private key is mounted.

For application profiles only, optional mail/DKIM process/protocol unavailability
is diagnosed separately while verified application ingress remains ready. Image,
mount, port and ownership violations still fail hard. Failed optional daemons
are not listed as protocol-functional. Required SMTP remains a readiness gate.
The additive provenance classification `real-application` distinguishes native
application evidence from a full real-kernel/Hub/MFS qualification.
