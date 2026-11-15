# MAIL-05 cold standalone recovery implementation

**MAIL-05_QUALIFIED** for the exact isolated runtime and replacement-storage scope
below. The paired Oxymot fixture security gate is green at
`aab4b7cd58d388c69679a533a2907d86a43d0cc9`, with zero new/accepted issues and
zero annotations. Earlier blocked observations below are historical. Coordinated
Oxy-form remains `SMTP_RECOVERY_UNQUALIFIED`.

Work starts at Infra PR39 `1b60818f4f60cc6b54976184dbd6f0585b717a68`.
The paired Debian branch starts at MAIL-04 PR16
`d50cf30a287c829832e6748c5b6ffcd8d976fa9e`; client qualification consumes
Oxymot PR121 `db47ccf6f55473e82d90173c69ff1df6ca19822e`.

The explicit offline `rebindMailServiceStorage` primitive reseals only resource
identities after an external verified cold checkpoint has been restored to a
different device at the same logical root. Immutable candidate contents, transport
digest, registry generations, owners and permissions remain checked. It never
starts services and refuses mounted service writers. Normal lifecycle operations
refuse a captured/restoring fence; they never repair missing/replaced storage.

The distribution owns the archive manifest, dedicated mount authorization,
quiescence, authoritative SQLite identity migration and resumable operation journal.
No generic application recovery guard or capture/relay contract is lifted.

The native acceptance dossier is owned by the paired
[Oxymot PR122](https://github.com/somanos/oxymot/pull/122), with the operator
procedure and frozen14-gate matrix in
[Debian PR17](https://github.com/drumee/debian/pull/17). It records exact
archive/image/software identities, command receipts, separate SMTP and LMTP
acknowledgement-loss duplicates, older-checkpoint duplicates and normal guest
reboots on replacement storage. This primitive alone is not restoration proof.

The unpublished producer freeze is cc33e55f1e30167bc685757b9f66e62539b75483,
version0.1.0-alpha.7-mail05.1, archive SHA256
3168ba3e91b696cfac9d6f6d7fbc098379ba69d9b32d6e9657ef388c03c6a365.
The paired distribution locks all52 members. Later documentation commits do not
change this consumed archive or any native image. Unit tests415/0 and required
Quality gates pass; the general integration rerun retains the four historical
MAIL-03 failures explicitly, with no runner waiver or guard reduction.

Qualification scope is distinct ext4 UUID/device at the same logical root, on the
tested runtime. It does not cover physical host loss, arbitrary relocation,
offsite storage/encryption/key custody or unlisted artifact/schema/filesystem
changes. Coordinated Oxy-form recovery remains `SMTP_RECOVERY_UNQUALIFIED`.
All PRs remain drafts; no merge, publication or production intervention.

## Post-workstation-reboot recovery audit (2026-11-15)

The surviving source is this branch, not the workstation's former temporary
worktree. The actual execution host is `testbox`; its owned outer container
`mail02-qualification-vm` runs guest `mail02-qualification`, Docker26.1.5+dfsg1.
The persistent guest disk and `/home/lab/work/mail05-recovery/final-run` retained
the final native campaign and its first startup-flush failure. The replay resumes
at that missing command, preserves its failed receipt and completes the final
current-writer roundtrip and a distinct guest reboot. Local workstation reboots
are not protocol evidence.

The paired Oxymot dossier now records exact archive digests, host/guest boot IDs,
per-recipient duplication observations, independent witness verification and
protected evidence export. The source security gate initially failed on recovered
Oxymot487f52c; that historical block is resolved by fixture-only corrections at
Oxymotaab4b7cd58d388c69679a533a2907d86a43d0cc9. The supplemental native extraction,
partial-promotion, sealing and offline-hold interruption matrix also passes on
Oxymot4e39d6f2fac38ba243fae3a182d5a7c60641d745. No source guard is lifted by this documentation.
See the paired `docs/mail-05/qualification.md` and `mail-06-handoff.md` in draft122.


## Final source-gate disposition

All standalone native gates pass on the pinned producer, Debian writer/reader,
images and filesystem identities above. SonarCloud and both recovery-contracts
jobs now pass on the paired Oxymot correction, without exclusions, suppressions or
threshold changes. Ten adversarial tests and six focused read-only checks in the
same Docker26 guest confirm observer compatibility, all 37 durable witness IDs,
unchanged 20/2 quota rounds and byte-identical invalid-archive fixture output.
GNU tar 1.35 edits only an exclusive private copy of the fully validated fixture;
no archive-derived entry is passed to an output writer or extracted on disk.
No production/runtime bytes changed and no full native replay is claimed for the
fixture-only patch. The native sources remain frozen at the exact references
above. Sources, all targets and archives remain retained; mail services stay stopped
with empty queues. The paired final dossier and MAIL-06 handoff are in draft122.
