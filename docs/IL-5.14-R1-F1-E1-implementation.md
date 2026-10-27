# Minimal error-contract restoration

Split declaration validation in serviceNetworks: malformed/empty/duplicate/invalid-format roles remain INVALID_NETWORK_ATTACHMENT; valid missing role now returns the historical NETWORK_ATTACHMENT_MISMATCH. No successful membership comparison, ownership check, Docker exception or readiness condition is removed. Sort observed network roles, attachment keys and container inventory IDs for documented deterministic precedence. Public signatures/exports/types/dependencies and scanner settings remain unchanged.

Added twelve E1 contract cases to the actual-module fixture suite, retaining all16 F1 cases and the historical assertion unchanged. First corrected targeted execution:47 tests PASS,0 failures/skips,exit0. Original F1 failure remains preserved. New membership-real.cjs exercises actual Docker extra-network refusal, same-owner extra network, valid object-form multihoming, missing/fully disconnected memberships, non-destructive validation, restoration and owned cleanup. Existing two-cycle Redis acceptance remains mandatory, including its F1 strengthened disconnect refusal.

Qualification is recorded against the implementation commit created after this report; later reports must distinguish source from documentation-only revisions.
