# MAIL-05 cold standalone recovery implementation

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
