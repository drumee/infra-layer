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

Qualification is incomplete: **MAIL-05_BLOCKED** until the full native BK-01/BK-02,
uncertain SMTP/LMTP outcomes, reboot, client and negative matrix is demonstrated.
Coordinated Oxy-form recovery remains `SMTP_RECOVERY_UNQUALIFIED`.
