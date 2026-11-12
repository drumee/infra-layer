# Audited baseline and gaps

Observation window: 2026-11-11–12; final remote read at 2026-11-12 UTC. Git origins
were fetched. The starting Infra checkout was an older, diverged alpha.3 branch
(`cc0b106`), not the delivery baseline. Its untracked `.aws` was not read or
modified. Work uses `/tmp/mail01-infra`, branch `docs/mail-01-autonomous-service`,
from Infra `origin/main` below. Other working checkouts and their edits remain intact.

## Exact references actually audited

| Repository / source | Immutable reference | Meaning |
| --- | --- | --- |
| drumee/infra-layer, origin/main | `09b7f28bce99ba3744e31a0ee5b2dde868a9a86a` | Published `0.1.0-alpha.6` source; design base |
| drumee/debian, origin/feat/container-distribution | `ff6e6b399128e6332c984fc2e8e60f660bd5f881` | Oxy-form's immutable distribution pin, merged PR #11 |
| Debian alpha.6 feature branch | `ae0668bd836e869caf61634d1692f46e504271fa` | Consumer qualification/handoff, ancestor of distribution merge |
| Debian origin/main | `558e4b8561c70897a3383e1ac188e70a2d607892` | Does not contain minimal-application; not a suitable implementation base |
| Debian local minimal-application checkout | `490c4b0a28ffb35da6ff248402139b5f600c793f` | Older alpha.3 source lock, not actual current Oxy pin |
| somanos/oxy-form, origin/main | `fc51a0b58f4ba4c0bfcc25cd2bbe392bedf2f78d` | Merge PR #3, actual backend code/configuration pin |
| Oxy backend feature head | `edec3b9fa82cc692daf2dc2fcf0c915df9584613` | Alpha.6 qualification and owner-confirmed reception record |
| somanos/oxymot, origin/main | `f080ce7acb76d9cf7576c02861c947820e266a7b` | Ghost production/admin, form activation and backup documentation |
| drumee/blog local main | `85abf75c79fdcca46006559fbebbfd8ec44f01ee` | Historical website tree; not Ghost deployment authority |

Repository instructions: Infra `AGENTS.md` requires English documentation;
Debian root `AGENTS.md` requires preserving generated source trees, existing
channels, immutable version management and secrets. Oxy-form has no AGENTS file
in the audited tree. Oxymot root instructions prohibit importing unrelated
internal-project material; only public-site/Ghost references were used. Historical
statements such as "no backend deployed" in old local README files are not current
deployment evidence. They were not rewritten.

The Debian alpha.6 source lock and Oxy `scripts/distribution.cjs` agree on npm
archive **44 members / 110826 bytes**, SHA256
`562a01bf5d8dba6151bf3a1768e56655df9e9302ed2ea6f072a4ed72eb177874`, SRI
`sha512-ZuGENEDYE1Ug6FJYzvSR+MG8zzOaBMBkYhgx+5nNR5OKMDBHpOvCfdzDe1XNfNz7fKqRfCHFQZGlxvYQzEm+YQ==`.
MAIL-01 rechecks these pins in source/receipts; it does not republish or claim a
new byte-for-byte registry acquisition. Runtime remains `0.1.0-alpha.4`.

## Code-level findings

| Audited file(s), relative to immutable repository reference above | Verified behavior | Required evolution |
| --- | --- | --- |
| Infra `lib/contracts-v2.js`, `capabilities/mail/index.js` | Only `capture` / `relay`; `relay_endpoint` always required; relay TLS must be `required`, rendered `verify`; no direct MX mode | New explicit service contract, no silent reinterpretation |
| Same renderer | Empty `mydestination`, one SMTP listener, mandatory inbound TLS, optional Cyrus SASL; authenticated **or** trusted CIDR authorization | Separate MX/submission listeners, auth mandatory for submission, local address validation |
| Same renderer | Explicit `relayhost`, 1 MiB message limit; queue/bounce expiry 1 day, backoff 10–30 s | New standalone defaults; old defaults unchanged |
| Infra mail renderer / `lib/smtp-auth.js` | Imported upstream password serialized through protected Postfix hash map; exact byte rules, no shell interpolation | Preserve external relay contract for fallback; autonomous mode has no upstream credential |
| Infra mail renderer | OpenDKIM `Mode s`, originating macro, private mail-control network, DKIM key reference; milter failure tempfails | Sign originating submission only, verify/no signing on MX ingress |
| Infra `adapters/docker/{resources,services}.js`, `lib/validation.js` | Scoped per-consumer secret mounts; mail/DKIM host binding forbidden in existing adapter | New explicit authorized listener contract; no relaxation of old guard |
| Infra `lifecycle/{composition,preparation,activation,docker,recovery}.js` | Project/resource identity, exact networks, revisions and prepared-state checks; mail-control internal; queue owner marker rejects nonempty foreign spool | Independent mail lifecycle/identity; don't attach Ghost to an application-owned network |
| Infra `lifecycle/recovery.js` | Application with mail refuses backup/restore `SMTP_RECOVERY_UNQUALIFIED` | Retain refusal until queue recovery qualification |
| Debian `bin/drumee-ctl` | Early explicit `--profile minimal-kernel|minimal-application` dispatch, before legacy Team detection | Add `mail` dispatch here; preserve default/old branches |
| Debian `profiles/minimal-application/{operator.js,lib/config.js,lib/distribution.js}`, source lock | Distribution validation/compose uses public Infra API, exact acquisition, owned storage | New `profiles/mail`; separately versioned client dependency for external mail |
| Oxy `scripts/{distribution,configure}.cjs` | Exact Debian pin; composes application + mail + DKIM; app `requires: [mail]`; private submission `mail:2525`, user `forms` | External submission dependency; no ownership of autonomous mail |
| Oxy `server/{mail,validation,state}.js` | Bundled Nodemailer 10.1.7, TLS >=1.2/name/CA verified, dedicated password file; fixed envelope/header sender and recipient; content-free HMAC ledger, durable 32-byte dedup key | Reuse client path, preserve state/key and uncertainty semantics; no new transport |

The current Oxy code uses bundled Nodemailer directly in its native plugin;
the historical Messenger proposal is not the active implementation. The Oxy
alpha.6 receipt reports 9 groups / 242 assertions plus provider acceptance and
owner-confirmed reception/authentication. SPF/DKIM/DMARC PASS there is explicitly
owner-reported, without archived complete headers or a known selector.

## Deployment readback (read-only)

Existing SSH access to `debian@15.235.100.230` was used for bounded Docker
inventory, mounts/networks and projected JSON receipt fields. No service was
stopped, installed, reconfigured or sent a message. No credential contents,
message bodies, complete Docker environments or populated auth maps were exported.
The [sanitized observation](evidence/observations.json) records the relevant facts.

- Oxy project `oxy-form-oxymot`: application healthy, loopback `28971 -> 3101`;
  mail/DKIM healthy and no host ports. Active revision
  `dfd68d908337c69ae0d23cfae6cdd35033e8b5212af2022de2ee5a1ff7f8bc5a`.
  Root `/srv/oxy-form/deployment`, spool `/durable/mail`, separate forms-state
  and operator-state resources. Mail is on its app network plus internal control.
  Effective hostname `forms.oxymot.fr`, upstream `mail.drumee.com:587`,
  `relay_tls:required`, submission login `forms`, trusted list loopback only.
  Queue observation was zero entries. Existing provided certificate expires
  `2027-02-07T07:54:12Z`; neither it nor its private key was copied.
  Deployed application image is
  `sha256:cacd8333accebb96ad8d08d206fc92852af5a1f0d986519dd38c023f9aa9333d`;
  deployed mail/DKIM image is
  `sha256:c9d6b4d5a69d7c53272ff13a4b90679422d61428a6f868a0463e3bdcfbe58236`.
  These differ from the historical local qualification image IDs, which are not
  presented as deployed images. Read-only image labels assert Infra alpha.6,
  producer SHA/package SRI and Debian revision matching the pins above; this is
  deployment metadata corroboration, not a fresh byte comparison/rebuild of those
  deployed images. [Image-label projection](evidence/deployed-image-labels.json).
- Ghost `ghost:6.73.0-bookworm`, MySQL `8.4.13`, healthy; loopback `2368`.
  Networks `oxymot-blog_backend` and `oxymot-blog_egress`. Content volume
  `oxymot_blog_content_c1r_20261105` at `/var/lib/ghost/content`. Protected
  `ghost-config.production.json` has **no mail configuration**. These existing
  networks/volumes remain Ghost-owned.
- Server recovery receipts under `/var/lib/oxymot-recovery/main-disk-20261109/`
  include a real postboot observation and native reattestation. This supersedes
  the old form activation document's "reboot not exercised" for that deployment;
  it does not qualify the future mail service or queue restore.
- Oxymot tracked `experiments/blog-05c-lite-c5-pre/evidence/isolated-restore.json`
  records `ISOLATED_RESTORE_PASS`, 2026-11-06, SQL/content comparisons, 8 pages,
  no production volumes/host ports; archive SHA256
  `e9af52751055120c9f87af448e5fba3b8f2204affb56d7f7e35c3142124f3b96`.
  This is qualified Ghost application restoration, not offsite contractual proof
  and not SMTP spool restoration.

Auditable source links: [Infra mail renderer](https://github.com/drumee/infra-layer/blob/09b7f28bce99ba3744e31a0ee5b2dde868a9a86a/capabilities/mail/index.js),
[Infra validation](https://github.com/drumee/infra-layer/blob/09b7f28bce99ba3744e31a0ee5b2dde868a9a86a/lib/contracts-v2.js),
[Debian dispatcher](https://github.com/drumee/debian/blob/ff6e6b399128e6332c984fc2e8e60f660bd5f881/bin/drumee-ctl),
[Debian lock](https://github.com/drumee/debian/blob/ff6e6b399128e6332c984fc2e8e60f660bd5f881/profiles/minimal-application/infra-source-lock.json),
[Oxy client](https://github.com/somanos/oxy-form/blob/fc51a0b58f4ba4c0bfcc25cd2bbe392bedf2f78d/server/mail.js),
[Oxy receipt](https://github.com/somanos/oxy-form/blob/fc51a0b58f4ba4c0bfcc25cd2bbe392bedf2f78d/docs/evidence/OF-01R-alpha6-backend-receipt.json),
[Ghost restore receipt](https://github.com/somanos/oxymot/blob/f080ce7acb76d9cf7576c02861c947820e266a7b/experiments/blog-05c-lite-c5-pre/evidence/isolated-restore.json).

## Network/DNS observations versus assumptions

DNS reads on 2026-11-12: MX priorities 1/5/100 point to
`mx1.mail.ovh.net`, `mx2.mail.ovh.net`, `mx3.mail.ovh.net`; SPF is
`v=spf1 include:mx.ovh.com -all`. `mail.oxymot.fr` A is `15.235.100.230`, AAAA
is `2607:5300:205:200::d222`; IPv4 PTR is `vps-c5f4cd75.vps.ovh.ca`.
A recursive TXT query for `_dmarc.oxymot.fr` returned no answer with SOA authority;
that observation differs from an older reported quarantine policy and must be
rechecked authoritatively before cutover. No active provider DKIM selector was
established. Current A/AAAA presence does not qualify an SMTP listener or route.

Not established: port 25 egress from the future service network, inbound port 25
reachability, reverse DNS control, IPv6 viability/reputation, certificate renewal
for the future service, current provider return-path semantics, complete provider
mailbox inventory or offsite mail RPO/RTO. No SMTP connection or emission was made
to establish them. Proposed allocations and DNS changes are in [migration](migration.md).
