# Persistent qualification artifacts

The common implementation is `tooling/artifacts.py`. All projects use the same
store, manifest, lease, checksum and deletion rules; consumers must not fork a
weaker cleanup. Linux, Python 3.9+, util-linux `findmnt`, `/proc/self/fdinfo` mount IDs
and `flock` are required. Unsupported/ephemeral storage fails closed.

## Layout, protection and incremental state

The root is the current operator's real `$HOME/artifacts/`, never an overridden
HOME or arbitrary `--root`. Runs have exactly three levels:

```text
$HOME/artifacts/<project>/<lot>/<execution-id>/
  artifact-manifest.json    # contract, state, protections, retention, resume state
  checksums.json           # SHA256 and sizes; canonical JSON digest in manifest
  events.jsonl             # fsynced state/checkpoint journal
  .lease                   # live inherited flock, never guessed stale from PID
  evidence/                # private logs, reports, input/code snapshots, cold archives
  work/                    # explicitly protected live runtime / VM backing storage
```

Directories are 0700, files 0600. The store probes write/fsync access and records
mount source/type/UUID; tmpfs/ramfs/overlay/aufs/squashfs, read-only mounts and
symlinked paths are refused. This verifies the visible storage configuration, not
physical disk-loss durability. VM-backed persistence additionally requires the
host-side gate below. Keep plaintext credentials, keys and raw receiver originals
private; only the existing approved sanitized exporter may publish evidence.

`work/` is deliberately excluded from live checksum/export walks while
`backup_required=true`: hashing live mounted databases/images is not a coherent
backup. Immutable cold checkpoints, receipts, code and necessary client/receiver
inputs must be copied into `evidence/` incrementally. The live VM disk also resides
under the host run's `work/vm/`. Releasing backup protection requires an inspectable
same-mount private tree; mounted/symlinked/unsafe work is never auto-deleted.

New runs default to `active`, with both qualification and backup protection true.
`exec` holds the run lease throughout its command, writes a unique private log,
checkpoints before/after, returns the command's exit code and preserves failures
as `resumable`. Interrupted processes leave active/resumable manifests protected.
MAIL-05 also snapshots receipts and cold archives after each control. Repeated
attempts get unique logs; occupied native roots/checkpoints are never reset.

## Install and execute

```sh
mkdir -p "$HOME/.local/bin"
install -m755 tooling/artifacts.py "$HOME/.local/bin/artifacts.py"
install -m755 tooling/artifacts-cleanup "$HOME/.local/bin/artifacts-cleanup"
install -m755 tooling/qualification-vm.py "$HOME/.local/bin/qualification-vm.py"
python3 "$HOME/.local/bin/artifacts.py" init infra-layer EXAMPLE execution-001
python3 "$HOME/.local/bin/artifacts.py" exec infra-layer EXAMPLE execution-001 -- npm test
python3 "$HOME/.local/bin/artifacts.py" verify infra-layer EXAMPLE execution-001
```

The authoritative run is on the execution host. Local workstation preparation has
its own store; a workstation copy does not replace testbox artifacts. Pin the
common tool's SHA256 when transferring it into a guest. CLI JSON gives the exact
path. `exec` records resumable status even on success unless the qualification
controller explicitly completes the run after all required controls.

## Testbox VM handoff and reboot

Run `qualification-vm.py` **on testbox**, never from the workstation as though it
were the execution host. The existing isolated outer container and guest are
verified as `mail02-qualification-vm` / `mail02-qualification`; no Docker network
attachments or host-port publications are allowed. SSH uses the existing key
inside the outer container and its QEMU loopback 2222 forwarding; no guest egress
route or new credential is created.

```sh
python3 tooling/qualification-vm.py sync oxymot MAIL-05 execution-001 \
  --guest-tool /home/lab/artifacts/infra-layer/TOOLS/source/evidence/artifacts.py \
  --guest-tool-sha256 PINNED_SHA256
python3 tooling/qualification-vm.py reboot oxymot MAIL-05 execution-001 \
  --guest-tool /home/lab/artifacts/infra-layer/TOOLS/source/evidence/artifacts.py \
  --guest-tool-sha256 PINNED_SHA256
```

`sync` verifies guest checksums, exports only private regular evidence/control
files, stores a unique tar under testbox's canonical run, verifies the guest did
not change, and fsyncs host manifests/checksums/receipts. It never extracts member
paths onto the host. Host runs are pinned and retain both required protections.

`reboot` repeats sync, requires a staged `reboot_required` state, verifies the
host evidence, and checks that `/vm` backing files actually reside under this
host run's `work/` with correct ownership, private modes and no symlink/mount
alias. A legacy backing directory outside the store refuses with
`QUALIFICATION_VM_STORAGE_REQUIRES_COLD_ADOPTION`. The guest then reacquires its
lease and rechecks the expected digest before recording `reboot_pending` and
requesting only its own reboot. New commands refuse until the guest boot ID
changes. Never substitute a reboot of testbox or the workstation.

For an existing VM, preserve its disk, base image, seed, keys and input archives.
Cold-adopt only after confirming no active test and shutting down the designated
guest; never move a mounted/live QCOW2 or change native logical roots. Preserve the
old container/backing files, copy and verify them under the canonical host run's
`work/vm/`, then rebind the designated VM to that location with only one copy active.
Record identities, hashes and the maintenance outcome. Do not infer a new protocol
qualification from this storage adoption. Historical qualified resources are
preserved; they are not silently rewritten or moved by this tooling change.

## Pinning, completion and retention

```sh
python3 tooling/artifacts.py update oxymot MAIL-05 execution-001 --pinned yes
python3 tooling/artifacts.py retention oxymot --days 180
python3 tooling/artifacts.py retention oxymot --lot MAIL-05 --days 365
python3 tooling/artifacts.py update oxymot MAIL-05 execution-001 --retention-days 730
```

Priority is run override, lot, project, then 90 days. Expiry is measured from
`completed_at`, not directory mtime. Merely completing or unpinning a run never
releases required evidence/backups. Only after an explicit owner review establishing
that none is still required may an operator release the protections:

```sh
python3 tooling/artifacts.py update oxymot MAIL-05 execution-001 \
  --state completed --pinned no --qualification-required no --backup-required no
```

Do not use that example on still-required MAIL-05 evidence. Its manifests, archives,
original receiver messages and recovery material remain protected.

## Cleanup and audit

```sh
artifacts-cleanup                              # preview only
artifacts-cleanup --project oxymot --lot MAIL-05
artifacts-cleanup --project example --lot SYNTHETIC --execution test-001 --apply
```

Preview JSON reports path, age, retention, size/allocated bytes and selection
reason. Unsafe/unreadable trees show unknown size and manual-review reasons;
active leases stay untouched. Missing/malformed/duplicate-key manifests are
never inferred eligible from age. Only completed, unpinned, no-longer-required
runs beyond retention are candidates.

Apply locks the run and re-reads policy, manifest and directory identity immediately
before deletion. All traversal/unlink operations use directory descriptors and
`O_NOFOLLOW`; Linux mount IDs also reject same-device bind mounts. Symlinks,
hardlinks, special files, unsafe ownership/modes and mounts refuse the whole run.
A partial failure is journaled and, if the manifest remains, marked resumable.

`$HOME/artifacts/.cleanup-events.jsonl` records deletion intent, outcome, removed
logical/allocated bytes and the measured filesystem-free-space delta. The delta
may include concurrent filesystem activity; the allocated counter is not a promise
about open handles or unrelated disk use. No timer is installed. If a periodic job
is later approved, it must invoke this same command with `--apply`, not use a
separate age-based find/rm job.

Validation uses unique synthetic runs under the real HOME root, never a repurposed
HOME. Tests cover preview/apply, manifests, expiry/overrides, protections, locks,
checksum changes, symlink/hardlink/mount refusal, revalidation, partial failure and
reboot evidence freshness. A separate synthetic driver test verifies all 13 phase-A
snapshots and the host-handoff marker without services or reboot. The final report
records exact local/testbox/guest paths and the real bind-mount refusal result.

The [2026-11-15 validation report](qualification-artifacts-validation.md) records
the tested digests, actual execution locations, synthetic deletion and real
same-device mount refusal, suite results and preserved legacy-storage limitation.
