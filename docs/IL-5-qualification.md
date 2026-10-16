# IL-5 qualification ledger

Status: IL-5.0–2 implemented and locally validated; Debian integration and full
regression/clean-checkout qualification remain pending. No release approval.

## IL-5.1 pure/public contracts

Published baseline alpha.2 and original profile guards were inspected before
implementation. Original 127 units pass unchanged. Fourteen added application
contract cases yield 141 passing TAP tests, zero failures/skips in the selected
final unit run. Tests include rejected public/IPv6/alias bindings, internal vs
host listener distinction, profile conflicts, plugins, consumer-selected secrets,
CA-only projection, SMTP ordering and resource/ownership/tamper boundaries.
Package audit/isolated installed consumer pass; production dependencies remain
empty. The current local development version is unpublished alpha.3.

## IL-5.2 real lifecycle

Command (actual explicitly authorized isolated local host/client):

```sh
IL5_NETWORK_CLIENT=testbox IL5_LAN_ADDRESS=192.168.5.201 \
IL5_HOST_NGINX=/tmp/drumee-il5-host-nginx/usr/sbin/nginx npm run test:application
```

Source before final evidence commit; report
[`evidence/IL-5-application-phase2.json`](evidence/IL-5-application-phase2.json).
Eleven sequential functional groups and 86 direct assertions pass, including
cleanup ownership guards. They are not TAP tests and are not added to TAP totals.
Runtime is published alpha.4, SRI pinned in the test fixture lock; it is not a
custom dispatcher or simulated HTTP server. No Hub/MFS/Finder/SQL/Redis/DNS or
container gateway is present in the application-only composition.

Evidence includes actual preparation without daemon start, public native RPC and
protected 403, exact Docker binding and `ss` observation at 127.0.0.1, plus an
independent LAN client. Testbox first reaches a nonce-bearing temporary control
listener on the host's LAN address, then receives ECONNREFUSED at the runtime
publication. Host-only HTTP success is not the isolation proof. IPv6 publication
is rejected by contract and no IPv6 application binding is observed.

The external proxy is a real unprivileged host Nginx process, not a container.
Debian nginx 1.22.1-9+deb12u10 was downloaded/unpacked under /tmp only; archive
SHA256 `cc7ae36d024f602861eeefe64656d14481b3bd224d81f8d69f789de49f16375a`.
Its isolated TLS certificate is checked by actual CA/SAN validation. The worker
observes the unchanged `/-/svc/qualification.ping` request path through Nginx.
No system configuration, trust store, firewall or resolver was changed.

Controlled stop/start, configuration update and rollback, failed backend startup,
real SIGKILL after actual Docker startup, explicit interrupted-journal recovery,
unknown-root refusal, tampered prepared state and complete no-SMTP backup with
isolated restoration all pass. Resource bytes and secret generations persist.
Unqualified application image changes remain refused with verified backup
evidence. The test-only driver hook kills the real activation process; it does
not substitute network/protocol/health observations or application state.

SMTP uses unchanged canonical Postfix/DKIM image composition and actual daemons.
The application verifies STARTTLS against the projected public CA and performs
SASL authentication. Wrong credentials return EAUTH; an unauthenticated relay
attempt returns EENVELOPE. Only a loopback client CIDR is trusted, so the actual
application-network client must authenticate. SMTP/DKIM have no host ports and
DKIM has only its private control network. Optional mail failure leaves HTTP
ready with explicit diagnostics; mandatory mail failure makes deployment
readiness false while the already running backend remains observable. Backend
failure/recovery preserves queue ownership and secret/DKIM identity.

Application SMTP backup/restore explicitly refuses SMTP_RECOVERY_UNQUALIFIED.
This test sends no successful message and proves no Internet delivery, upstream
provider, recipient, SPF/DMARC, bounce or SMTP spool recovery behavior. Existing
SMTP/DKIM capture regression must still be replayed in IL-5.4. Oxy-form and D0
acceptance remain separate and unexecuted.

## Failed-attempt disclosure

An initial new contract test assumed array-valued DKIM networks; the canonical
fragment is an alias-bearing object. The fixture now checks its actual isolated
network keys. The first real runner failed npm self-reference under its nested
fixture package, corrected by resolving the public export from the owner package.
The next fixture used the intentionally forbidden `/data` mount target and was
corrected to `/app/state`, preserving the guard. Host Nginx initially attempted
its default system FastCGI temporary path; all unused temporary paths are now
explicitly inside the owned test prefix. A negative ownership fixture initially
failed the earlier private-directory permission guard; creating its root 0700
allows the intended unknown-owner rejection. No guard or test was weakened.
Failed projects were cleaned by exact ownership; these runs are excluded from
passing totals.

## Remaining phases

IL-5.3: reproducible Debian profile, explicit images/plugins/config/operator.
IL-5.4: full unchanged Infra suites, installed tarball/types/preparation consumer,
Debian selector/schema/operator/negative tests and retained minimal-kernel run.
IL-5.5: clean-checkout integrated distribution acceptance and final cross-linked
review PRs. No npm/image publication or production/Oxy-form/D0 operation.
