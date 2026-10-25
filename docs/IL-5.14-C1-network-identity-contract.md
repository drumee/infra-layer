# IL-5.14-C1 identity contract disposition

**Gate C: NOT_EXECUTED to qualification.** Source review and original-defect reproduction pass, but the mandatory development audit fails before corrective semantics are selected or implemented. This document records required invariants, not an approved correction.

Network identity, container identity, endpoint identity and project ownership are distinct. An attachment map key is not guaranteed to be an inspectable Docker object. A sandbox-less endpoint must retain its EndpointID/Name/address metadata without being silently promoted to an authorized container. Recognizing that type does not establish readiness, ownership or permission to ignore it.

The corrected contract must preserve valid container-backed inspection and all existing network owner/project/type/isolation and service-owner checks. Missing required containers/networks, inconsistent metadata, foreign resources, unexpected endpoints and genuine command failures must remain explicit failures. Creation-time network absence and verified post-cleanup absence need their own lifecycle meaning; they do not authorize accepting missing required live resources.

No blanket endpoint filtering, name-based ownership assumption, Docker-error suppression, unconditional retry, automatic repair or deletion is selected. Whether a transient endpoint is awaited, refused or otherwise reconciled must be justified by lifecycle state and owner verification before implementation. No such unqualified production behavior is introduced after the security stop.

[Baseline](IL-5.14-C1-source-baseline.md), [reproduction](IL-5.14-C1-defect-reproduction.md), [security stop and final matrix](IL-5.14-C1-final-decision.md).
