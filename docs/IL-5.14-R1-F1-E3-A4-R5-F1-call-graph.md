# Complete pre-recreation call graph

Gate B PASS; classification EARLIER_OPERATIONAL_PREFLIGHT (recovery exception not reached). Locations below refer to c23c861, not later shifted lines.

| Call / location | Inputs, phase and scope | Checks / possible refusal | Prevents recreation? |
|---|---|---|---|
| recovery.rollbackDeployment:106–112 | root, requested revision, authorized context; read-only admission | readActive attestation/journal, authorized=true, revision syntax, saved prior candidate; compatible schemas/resources/secrets and no image upgrade | Yes |
| activation.activateRollback:208–210 | prepared prior, recover=true, private operation marker | authorized context; forwards private marker rather than public recover flag | Yes |
| activation.activateDeployment:156 | prepared/context/marker | P.verifyPrepared: composition, exact owner root, immutable source/configuration inventory/digests | Yes |
| F.lockAsync:157 | one deployment writer | lock ownership and exclusivity; no target destruction | Yes |
| J.readJournal/rotation:158–160 | verified root | journal hash chain; interrupted activation and secret transition authority | Yes |
| readActive/classifyChanges:161–162 | current active and requested prepared | active attestation, compatible identity/resources/schema/secrets | Yes |
| driver.inspectProject:163 | project + allowed services, all stopped/running project containers | container ID, owner/project/service labels, duplicate service refusal; read-only | Yes |
| driver.checkPorts:163 | desired composition + observed resources | conflicting host bindings and trusted Docker/ss failures; read-only, not readiness | Yes |
| branch/helper:164 | private marker AND latest recovery-required AND earlier restarting snapshot | recovery-specific identity/network authorization, but only if all selector conjuncts true | Yes |
| networksReady:165 | composition, driver, observed.length>0 | strict checkNetworks; complete configured set, verified network IDs/endpoints, ownership; bounded retries ONLY for NETWORK_ATTACHMENT_UNSETTLED | Yes — actual saved failure |
| checkImages:166 | desired image set | exact image/digest availability | Yes, after blocked call |
| upgrade checks:167 | prior/desired candidate | backup and engine compatibility; rollback must forbid incompatible upgrade | Yes |
| same-revision inspectDeployment:168 | current root/context | strict inspection if journal active; otherwise ready=false. A false state does not throw or skip recreation | Only ready=true returns no-op; not the saved failure |
| activation-intent:169 | target revision/prior revision | journal write; no recovery admission audit in old implementation | Yes on write error |
| compose config/nativeCheck:173–183 | verified project/file/service, native validation | trusted command failures remain fatal; native checks may run ephemeral controlled containers | Yes |
| compose up:184 | up -d --no-deps --force-recreate --wait --wait-timeout90 <service> | first destructive service recreation for rollback | Intended boundary |

After recreation: exact observed service, running/healthy, image/revision/mount/port checks, protocol check, external probe, strict final networksReady:192, active attestation write and final inspectDeployment. The no-op/inspection path does not catch or ignore the initial mismatch. Backup resume, restore activation, interrupted activation and secret/certificate transitions use ordinary activateDeployment and must remain outside the new private operation.

Controlled old-source fixture confirms two independent defects: first inventory restarting=false followed by authoritative network inspection restarting=true selects the strict preflight and fails before up; with restarting=true throughout, the helper rejects empty live restart ports as UNEXPECTED_SERVICE_EXPOSURE. Both expected-refusal diagnostics succeeded. They demonstrate the flawed boundary, not which original selector conjunct was false. The original internal selector state remains unavailable.
