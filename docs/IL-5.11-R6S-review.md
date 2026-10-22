# IL-5.11-R6S corrective maintenance review

## Scope and references

The review started from PR #17 at `cdbf50939087b2d70c687dba7b4531ffbb8daa41`, PR #16 at `1c9d20f1cc315628cfd703199423c6efc873ff13`, and canonical main at `a02b76e4c421e96e63406d7b10edc2b76a6056c1`. All three remote references were checked. Both PRs were open and unmerged. The original workspace remained unchanged; maintenance is isolated in `/tmp/il511-r6s`.

No existing ancestor or scoped AGENTS.md was found. Commit `bd623dd` adds the permanent repository-wide English documentation policy without removing instructions. The policy distinguishes owner conversations from documentation and preserves historical logs, quotations, and machine-generated evidence.

## Implementation review

The private-output implementation uses descriptor-relative exclusive directory creation with 128 bits of random naming; private roots require the executing UID and mode0700. Files are created O_EXCL/O_NOFOLLOW/O_NONBLOCK, mode0600, and checked for regular type, ownership, link count and inode identity. Reads use no-follow descriptors. Root/system-owned ancestors are trusted; only the system sticky /tmp is permitted as a shared writable ancestor. Non-system foreign UID parents are rejected. Group ownership alone does not grant access because private directories/files grant no group/other permissions. Setgid or other unexpected mode bits are rejected by the exact private-mode check.

Other-UID actors cannot replace entries within these roots under the documented local filesystem model. Descriptor operations prevent reopening an attacker-selected output inode. Directory paths passed to child commands assume the same UID does not rename its own resources during execution. Root, a hostile filesystem, compromised child executables and malicious same-UID processes remain outside the guarantee. This is an explicit trust boundary, not protection against every local administrator.

Descriptors are closed on success and exceptional construction paths. Closing an evidence context deliberately retains its evidence; it does not recursively delete caller-selected paths. Docker cleanup belongs to the canonical harness and is checked by project. No public npm member, dependency, export, type or application contract is intended to change.

D4 mounts only its owned fixture directly, retaining CAP_CHOWN alone, no privileged container or DAC bypass. The real foreign UID/GID65532 and readable/searchable mode0755 are verified before invoking the helper. The test requires the helper's exact UNTRUSTED_OWNER exception rather than accepting an earlier kernel EACCES. Sentinel and ownership-restoration assertions are explicit. The eleven original scenarios retain their separate86-assertion count.

## Focused maintenance changes identified by review

Five executable diagnostic utilities had fixed imports from a neighbouring /tmp checkout. Their historical executions used selected and verified inputs, but replay should not require that machine-specific neighbour. They now load the established utility from the checkout containing the executed script and have import-safe main entry points. The runner validates its selected source before executing the requested command.

The export and validation utilities now open explicitly selected existing private evidence through a shared read-only private_input context. The validator no longer uses fixed historical input paths; source, qualification and artifact inputs are required arguments. It enforces matching source commits, complete successful progress, descriptor-based log reads, and protected pack reads. The helper closes descriptors even if private-input validation fails. Historical source versions remain in Git at the reviewed reference; raw evidence JSON and logs are unchanged. Old receipts continue to describe their original executions and script fingerprints.

Five focused maintenance regressions supplement the original eleven scenarios: repository-local import without execution side effects, symlink/permission rejection for inputs, genuine foreign UID rejection for private reads, export byte/hash preservation, and refusal of input/output symlinks. These tests do not replace functional replay of the utilities or PR #16's future independent qualification.

## Acceptance gates

The initial development run passed16 tests: the original11 scenarios/86 explicit assertions plus5 maintenance tests, without skips. It ran on an uncommitted maintenance tree and is retained as development evidence, not the final clean-source qualification. A clean-source replay, package compatibility, current GitHub checks and controlled integration remain pending. No merge has been attempted.

PR #16 remains a separate convergence task. Its earlier scripts must not be treated as safe solely because they reside under docs. SonarCloud failure, individual technical dispositions, Security inventory HTTP403 limitations, and the bounded SMTP uncertainty remain distinct from these maintenance changes.
