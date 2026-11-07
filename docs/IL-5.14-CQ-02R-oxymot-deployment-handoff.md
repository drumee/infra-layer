# IL-5.14-CQ-02R — Oxymot production deployment handoff

**Plan only; activation is not authorized.** Qualification candidate `76236faa85dd2cfdaf46646b28ce38fd41d26fb3` is **CQ02R_BLOCKED_SECURITY**: campaign setup deleted testbox's shared `docker0` bridge. Application image construction and the development audit also fail. No production release or image set is approved. Oxymot is treated as production under the owner's current designation; its earlier nonproduction description grants no exception.

## Read-only baseline and protected services

SSH inventory of `debian@oxymot.fr` identifies host `vps-c5f4cd75`, Docker daemon `b9c382a6-6e0e-458c-8690-4e4797190106`, Engine 29.9.2 / Compose 5.6.1. [Configuration hashes, routes, resource identities and firewall baseline](evidence/IL-5.14-CQ-02R/oxymot-production-baseline.json) retain no credential/private-key contents. Inspection performed no production mutation.

| Protected area | Current observation and consequence |
|---|---|
| Public Nginx/static website | `/etc/nginx/sites-available/oxymot`, root `/var/www/oxymot/public`; HTTP redirects to HTTPS, static `try_files`; retain existing installation, ownership and publication output |
| HTTPS/routes | Existing certificate `/etc/ssl/oxymot/fullchain.pem`; verified public HEAD `/` and `/blog/` return 200; `/-/` and `/-/svc/health.ready` return 404, so no current Infra route is established |
| Ghost | Existing `oxymot-blog` Ghost 6.73.0-bookworm, loopback `127.0.0.1:2368`, volume `oxymot_blog_content` and secret binds; preserve exact container/image/mount identities |
| MySQL | Existing MySQL 8.4.13, no published port, volume `oxymot_blog_mysql_data`; preserve ownership, data and all existing network attachments |
| Additional Nginx | A second existing master uses `/run/oxymot-blog-b1r/nginx.conf`; loopback 8443 is occupied and protected, not a free deployment port |
| Publication and monitoring | Existing `oxymot-pull`, blog monitor, ACME renewal and firewall guard remain under their present owners/configuration |
| Backups | Blog backup script invokes mysqldump/tar/restic; last service result is success, but current restore acceptance is **not demonstrated**; backup timer file presence does not prove scheduling/readiness |
| Capacity | Approximately 3.8 GiB RAM, 2.3 GiB available, no swap, 31 GiB free disk; approve measured resource limits/headroom before adding workloads |

[Public route checks](evidence/IL-5.14-CQ-02R/oxymot-public-routes.json), [Nginx process/config hashes](evidence/IL-5.14-CQ-02R/oxymot-nginx-process-baseline.json), [service observations](evidence/IL-5.14-CQ-02R/oxymot-publication-backup.json), [corrected publication/backup script metadata](evidence/IL-5.14-CQ-02R/oxymot-publication-details.json). The initial automatic token classification inspected the Python executable; use the corrected script record for `/opt/oxymot/deploy-pull.py` rather than interpreting ELF tokens as publication behavior. Selected Infra installation locations were absent; this is not a whole-host absence proof.

## Proposed deployment architecture

Infra Layer supplies planning/lifecycle APIs, not an approved production application. The qualification plugin must not become the production plugin. Define and qualify the actual consumer/profile, plugin ACLs and service requirements first. Read-only Oxy-form distribution/SMTP documents at `7f368473d4f350a88e844b841f97a175b53921b8` describe an older alpha.2 consumer and distribution blocker; those documents are not changed and do not prove compatibility with this candidate.

Create a distinct explicitly owned project, private networks, storage roots, secrets, queue and deployment receipts. Do not reuse or attach the blog networks, database volumes or secret binds. Existing Ghost is foreign to Infra Layer's managed-network ownership validator; adding it to such a network is not a supported integration shortcut. No relabeling or relaxed ownership check is proposed.

Keep backend services private and application publication loopback-only on a separately approved, freshly verified free port, excluding 2368 and 8443. Keep the current host Nginx, TLS, ACME and public static routes. Review a minimal proxy include for approved public application endpoints before any change: preserve canonical `/-/` and `/-/svc/` behavior, require method/service allowlists and actual plugin authorization, and refuse administrative/private RPC exposure. A broad proxy of every service is not approved. Alternate hostnames, DNS or public ports require separate design/authorization; none is assumed available.

## SMTP integration boundary

Future intent is **Oxy-form → EssentialsMessenger → Infra relay → authenticated upstream → controlled recipients**, plus a separately qualified Ghost client path. No current Ghost mail setting, credential, DNS record, firewall port or upstream account is changed. Current public exposure remains SSH/HTTP/HTTPS; no public SMTP relay is proposed.

Choose the actual upstream, allowed sender/Reply-To policy, recipient controls, rate/abuse limits and outbound-provider constraints. Require authenticated submission, STARTTLS with certificate verification and narrowly scoped client credentials. Trusted network CIDRs may bypass SASL under the current Postfix rules; prohibit broad trusted ranges and verify actual refusal behavior. Keep DKIM/control interfaces private; qualify SPF/DKIM/DMARC changes separately with explicit DNS authorization.

Ghost's existing foreign project requires a reviewed supported cross-project authenticated ingress/client contract before integration can be called ready. Do not connect its container to a managed Infra network or reuse `oxymot-blog_backend` as an implicit trust boundary. Obtain separate owner authorization for any eventual Ghost configuration change. Oxy-form consumer compatibility, unauthorized-relay refusals, TLS/auth failures, recipient controls and controlled delivery must pass before mail activation. Internet delivery, queue recovery and exactly-once delivery are not established. Historical Postfix HTTP-capture acceptance is incident-specific; `SMTP_RECOVERY_UNQUALIFIED` remains binding.

## Reversible rollout, after separate approval

1. **Freeze inputs:** require owner-authorized recovery of testbox's shared bridge and a genuinely separate VM or verified host-network boundary for future qualification. Resolve the services-image APT pins and dependency blocker; complete isolated acceptance and independent review; approve a distinct release version, exact Git/artifact hashes, immutable image digests, consumer/profile, configuration and ownership inventory. Current archive SHA256 `004f0182…` identifies review content only; production images remain unselected.
2. **Verify recovery and continuity:** securely back up affected Nginx configuration with ownership/mode/hash, record protected Ghost/MySQL/network/volume IDs, and verify existing backups through an isolated restore without altering live services. Approve storage/memory limits and preserve the existing publication/backup/ACME schedule. Capture baseline website/blog HTTPS, Ghost/MySQL health, listeners, firewall and certificate routing immediately before activation.
3. **Stage owned resources:** use the approved new project only; verify creation receipts, exact types/IDs, labels, mounts, network sets and loopback bindings. Apply the approved private readiness/authentication checks before any proxy change. No daemon-wide prune or unrelated Compose operation is permitted.
4. **Activate deliberately:** after explicit production activation approval, review the exact Nginx change, run `nginx -t`, and perform a controlled reload preserving existing masters/routes. Verify `/`, `/blog/`, TLS and publication/monitor health as well as approved application HTTPS/RPC behavior, unauthorized refusals and private listener boundaries. SMTP activation requires its additional acceptance above.
5. **Rollback on a fatal error, unauthorized attachment/access, failed readiness, changed protected ownership or degraded website/blog health:** disable only the new proxy include and restore its backed-up predecessor; syntax-check and reload. Stop/revert only positively identified new resources to an approved immutable candidate. Preserve new data/queue for diagnosis; SMTP recovery is not assumed. Recheck all protected routes/services. Never remove or restore over Ghost, MySQL, their volumes/networks or the static website as part of Infra rollback.

## Production authorization gate

Activation requires closed qualification-isolation/recovery obligations, completed full acceptance behind a verified host-network boundary, exact approved release inputs, a resolved or separately owner-disposed dependency finding, production impact review, verified backups/rollback, a supported actual application/SMTP integration contract and **subsequent explicit owner authorization**. Selection of oxymot.fr is not that authorization. The immediate next action is owner-reviewed testbox bridge recovery; services-image inputs and compatible dependency remediation also require corrective work and affected qualification. No oxymot.fr mutation or fallback campaign is permitted; deployment stays blocked.
