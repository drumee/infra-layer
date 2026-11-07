# Independent V1 historical and legacy fixture audit

The four A1 unresolved entries are traceable creation contexts with exact creator container IDs. Their physical Docker volume names, mount associations and deletion sequences are not preserved. Names, current anonymous-volume metadata, timestamps and dangling status cannot bridge this gap. No historical deletion entitlement exists in V1.

The separate known Health volume has direct /data Mounts association and recorded exact successful deletion/reference/absence evidence. Its historical record must remain separate from the four unresolved entries. A current absence check is not a substitute for historical ownership/deletion proof, especially when historical engine identity was not captured.

Legacy membership, Redis network and optional-Health test cleanup removes exact marked containers and networks but omits implicit Redis volume inventory/removal. Their existing PASS fields do not establish full volume cleanup. A new isolated mechanism must be described as a newly qualified boundary, not implicit adoption by all historical fixtures.

The safety review will require creation receipts plus a closed current-attempt manifest, exact metadata/nonce identity and daemon binding, all-state container-reference checks and non-force exact deletion. Docker volumes have no immutable UUID comparable to container IDs; metadata matching does not defend against a privileged Docker administrator deliberately replacing resources with identical metadata. This threat boundary must be explicit.

No Docker operation, test, implementation edit, historical evidence rewrite or cleanup was performed by the reviewer in this initial audit. Campaign and final qualification are not yet reviewed.
