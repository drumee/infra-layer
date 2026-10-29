# Original failure localization — initial Gate B BLOCKED pending observation

Current canonical run.js defines 11 groups. Earlier complete successful reference counted 87 assertions; the harness has no fixed expected-count constant and counts include nested helper/cleanup assertions. K1's 36 reported assertions and 6 completed groups are not full acceptance. The six completed names appear verbatim in original application-report.json. Last complete: controlled-configuration-update-and-canonical-rollback. First incomplete by source order: failed-startup-does-not-reset-owned-application-state, line81.

That group prepares APP_CRASH, expects an activation rejection, inspects ready=false, asserts persisted state remains 2, and awaits rollback to the initial revision expecting ready=true. The original report contains only code NETWORK_ATTACHMENT_MISMATCH. Message/stack/cause/precise API/target container ID/revision/network IDs/endpoint state are unavailable. Static counter reconstruction is consistent with a rollback-await refusal (33 before rollback assertion can execute plus 3 cleanup assertions), but is not used as substitute for direct causal observations. No assertion is changed or bypassed.

The current diagnostic explicitly tags each awaited operation and captures original driver exceptions and consumed network reads. It preserves the target generic activation-rejection, non-readiness, state-preservation and rollback-ready assertions. A one-attempt narrow diagnostic is justified because the preserved report cannot settle the operation or phase. The original application suite is not rerun unchanged.

## Final localization disposition

Gate B remains BLOCKED for original exact operation/phase. The sole new diagnostic explicitly executes the suspect rollback.crash await successfully; only activation.crash.expected rejects with DOCKER_LIFECYCLE_COMMAND_FAILED as intended. It does not prove which original awaited API emitted NETWORK_ATTACHMENT_MISMATCH. Original stack/IDs and first divergence remain missing. No new producer will run in A1.
