# Persistent artifact policy validation — 2026-11-15

This report validates artifact orchestration and conservative retention. It does
not replay or extend the frozen MAIL-05 native mail qualification. Source and
replacement volumes, retained checkpoints, old guest disks and existing evidence
were preserved. No native service was started and no reboot was performed.

## Sources and execution locations

Implementation is on `feat/qualification-artifacts-policy` in Infra Layer, Debian
and Oxymot, based on the existing completed MAIL-05 branches. The locked native
consumer and images are unchanged. The deployed common tool SHA256 is
`a138a02d5e05e395de764d5541802a0d1ec28d4d489a359aebb9c3ffd969092f`;
the host controller SHA256 is
`b3ffdb023fb9e5e056de7334cd624882cba808ddeb7a3eab865c979a419cb6e8`.

Authoritative delegated evidence is on **testbox**:
`/home/somanos/artifacts/infra-layer/ARTIFACTS-POLICY/policy-20261115/`.
Its storage probe recorded writable persistent ext4 on `/dev/sdb2`. Private
`evidence/source/` contains the tested source; `source-initial/` retains its earlier
version. Each command has a unique log. `host-copy-receipt.json`, unique guest tar
snapshots, the checksum manifest and resume journal are retained there.

The actual guest is **mail02-qualification**, inside outer container
**mail02-qualification-vm**, using Docker **26.1.5+dfsg1**. Its private run is
`/home/lab/artifacts/infra-layer/ARTIFACTS-POLICY/policy-20261115/`.
The host mirror was verified after the final guest checkpoint. The outer container
has no Docker network attachments or published ports. Guest evidence is accessible
and checksum-verified from testbox without the workstation.

Local preparation evidence is retained at:

- `/home/somanos/artifacts/infra-layer/ARTIFACTS-POLICY/policy-20261115/`
- `/home/somanos/artifacts/oxymot/ARTIFACTS-POLICY/policy-20261115/`
- `/home/somanos/artifacts/debian/ARTIFACTS-POLICY/policy-20261115/`

## Results

| Control | Result |
| --- | --- |
| Retention/store tests | 16/16 passed locally, on testbox and in the designated guest |
| Synthetic preview and explicit deletion | Passed; only unique manifest-identified synthetic runs were deleted |
| Protections and invalid manifests | Active/resumable/pinned/required runs, malformed/missing manifests preserved |
| Path and race checks | Links, mount IDs, inherited/live leases, immediate revalidation and partial-failure preservation passed |
| Real same-device bind mount | Preview and apply refused `ARTIFACT_MOUNT_BOUNDARY`; source sentinel intact; only synthetic target deleted after unmount |
| Guest-to-host handoff | Private export, checksum verification and host receipt passed |
| Real legacy-storage reboot gate | Refused `QUALIFICATION_VM_STORAGE_REQUIRES_COLD_ADOPTION` before reboot dispatch |
| Oxymot synthetic phase-A driver | 13 incremental snapshots verified; no native mail services or reboot |
| Infra suite | 416/416 tests; lint 0 errors/0 new findings; packed-consumer audit passed |
| Debian suite | 338 passed, 0 failed; qualification wrapper smoke test passed |
| Oxymot suite | Passed, including 162 Node tests, engine checks and byte-stable build |

The final synthetic MAIL-05 driver run is
`/home/somanos/artifacts/oxymot/MAIL-05/artifact-plumbing-d6944c2ddaee49b1abb5d3975dd4bd59/`.
It remains resumable with backup/evidence protection because it stages the host
handoff; it is not a native MAIL-05 verdict. Cleanup audit entries are in each
execution host's `$HOME/artifacts/.cleanup-events.jsonl`.

An initial guest test used a hardlink witness in `/tmp` and correctly encountered
`EXDEV` because that filesystem differs from the persistent store. The witness now
uses disposable scratch on the synthetic run filesystem; the final 16 tests pass.
The initial Oxymot suite inherited the artifact runner's private umask and failed
an existing test that deliberately creates an exposed lock. Running that suite
with its expected umask 022 passed; store logs remain private. Failed attempts were
retained alongside successful logs, rather than rewritten as passes.

## Continuation and limits

No periodic deletion job was installed. Runs containing these qualification proofs
remain pinned and retain required-evidence/backup protections. See
[operations](qualification-artifacts.md) for preview, explicit `--apply`, pinning
and retention overrides. No broad deletion was applied to existing data.

The VM's existing `/home/somanos/mail02-vm` backing directory has not been moved.
A fresh native campaign requiring reboot must cold-adopt its backing storage under
its canonical testbox run before the gate permits a reboot. Preserve the current
VM and logical mail-storage identities during that separately reviewed operation.
The current policy validation is complete; it supplies no new MAIL-05 native
qualification verdict. Coordinated Oxy-form file/ledger/deduplication-key recovery
remains `SMTP_RECOVERY_UNQUALIFIED`.
