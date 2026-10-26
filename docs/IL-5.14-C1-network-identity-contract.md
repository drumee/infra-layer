# IL-5.14-C1 identity contract disposition

**Gate C: PASS for the resumed correction contract, after NODEMAILER_SECURITY_QUALIFIED.** Implementation and real qualification results are recorded separately; the original pre-S1 disposition remains below.

The synchronous `checkNetworks(composition)` API and undefined success result remain. An additive optional `{require_existing:true}` requires every declared network to exist; default absence remains permitted for creation/verified cleanup. Network object ID/name/owner/project/type/internal status, container owner/project/service and declared network membership are checked. Container-specific inspection uses `docker container inspect` only with a 64-hex container ID. Actual NetworkID/EndpointID and container Name must match attachment metadata.

Endpoint metadata must contain a consistent 64-hex EndpointID, Name and string address/MAC fields. A Moby endpoint-map key must equal ep- plus that EndpointID. Names outside the declared project/service namespace are explicitly unexpected. A matching namespace is **not ownership proof**:the endpoint is retained as metadata on NETWORK_ATTACHMENT_UNSETTLED and never accepted as an authorized container. All ordinary members and other networks are validated before this refusal, so it cannot hide a foreign member.

Activation may await only this verified unresolved-metadata condition for at most 5 seconds on a monotonic deadline, with 50ms state polling. Each observation is a fresh successful network metadata read. A Docker nonzero, missing required object, malformed metadata or ownership refusal escapes immediately; none is retried. Resolution means the endpoint disappears or becomes a fully validated container-backed attachment. Permanent/unexpected unresolved state never produces readiness. Required networks are verified again before runtime attestation; observation of unresolved or missing required networks reports not ready.

Errors distinguish invalid object identity, invalid/inconsistent attachment metadata, unexpected endpoint, unsettled attachment, required container/network absence, ownership mismatch and genuine Docker execution failure. The latter retains only safe exit status/signal/missing-object category; raw stderr/stdout/payloads/secrets remain suppressed. Required missing objects still fail with the original nonzero status when applicable. No lookup fallback, automatic repair or resource deletion is introduced.

No root/lifecycle export or TypeScript signature is removed. No TLS, SMTP, DNS, Redis, MariaDB, Nginx or secret-generation implementation changes are part of the network correction. Real lifecycle regression is required to qualify the new pre-attestation network check and bounded transition wait.

---

## Original pre-S1 disposition (preserved)

**Gate C: NOT_EXECUTED to qualification.** Source review and original-defect reproduction pass, but the mandatory development audit fails before corrective semantics are selected or implemented. This document records required invariants, not an approved correction.

Network identity, container identity, endpoint identity and project ownership are distinct. An attachment map key is not guaranteed to be an inspectable Docker object. A sandbox-less endpoint must retain its EndpointID/Name/address metadata without being silently promoted to an authorized container. Recognizing that type does not establish readiness, ownership or permission to ignore it.

The corrected contract must preserve valid container-backed inspection and all existing network owner/project/type/isolation and service-owner checks. Missing required containers/networks, inconsistent metadata, foreign resources, unexpected endpoints and genuine command failures must remain explicit failures. Creation-time network absence and verified post-cleanup absence need their own lifecycle meaning; they do not authorize accepting missing required live resources.

No blanket endpoint filtering, name-based ownership assumption, Docker-error suppression, unconditional retry, automatic repair or deletion is selected. Whether a transient endpoint is awaited, refused or otherwise reconciled must be justified by lifecycle state and owner verification before implementation. No such unqualified production behavior is introduced after the security stop.

[Baseline](IL-5.14-C1-source-baseline.md), [reproduction](IL-5.14-C1-defect-reproduction.md), [security stop and final matrix](IL-5.14-C1-final-decision.md).
