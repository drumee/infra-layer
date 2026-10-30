# Additive independent V1-F1 plan readback

PREFLIGHT_REVIEW_PASS remains supported for the same exact candidate/attempt/harness. The final plan adds only a bounded read-only post-campaign exact resource/daemon check and retrospective container-event retrieval, filtered by exact attempt label and a completed past time window. Removing that field reconstructs the prior independently reviewed plan byte-for-byte by SHA256. The initial preflight receipt is preserved.

This adds no fixture, live observer, source change, retry or second campaign. Actual container ID and die exitCode/start/stop/destroy evidence must remain correlated; missing mandatory proof cannot be fabricated or inferred solely from a successful stop command. All original ownership, no historical deletion and one-attempt stop conditions remain in force. No reviewer Docker command or test was executed.
