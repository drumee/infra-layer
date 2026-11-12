# Reproduction and retained evidence

Read [qualification.md](qualification.md) first. The current result is
**MAIL-02_BLOCKED**, including two observed implementation failures. Use only a
private synthetic laboratory, the exact images and a DNS server without external
forwarding. Never replace `.invalid` destinations with real recipients. A successful
process exit alone is insufficient: several diagnostic drivers deliberately write
a FAIL report without exiting nonzero. Assert each report's status/checks.

## Frozen package and installed consumer

Node22, Docker/Compose and the retained image export are prerequisites. This run
used the archive from producer `4a73f8984fc1c0f884a8735d741551d8721d31d9`; test
checkpoint `168498d130a35ea7e2fccef46987cf2a9f5b4b71` has identical packed bytes.
Additional final documentation does not change those bytes.

```sh
git worktree add --detach /tmp/mail02-reproduce 168498d130a35ea7e2fccef46987cf2a9f5b4b71
cd /tmp/mail02-reproduce
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run test:contracts
npm run lint
npm run test:package
mkdir -m 700 /tmp/mail02-reproduce-pack
npm pack --ignore-scripts --pack-destination /tmp/mail02-reproduce-pack
sha256sum /tmp/mail02-reproduce-pack/drumee-infra-layer-0.1.0-alpha.7-mail02.4.tgz
```

Require SHA256 `3332f762399dc9a482447ca1e021ba197c733ff83502ce9f99eb1ea4c8fea1a8`,
SRI and all50 members in
[`archive.json`](evidence/requalification-2026-11-12/archive.json). Never substitute
a changed archive. In Debian's `feat/mail-02-profile` worktree with the final lock:

```sh
node profiles/mail/acquire.cjs /tmp/mail02-reproduce-pack/drumee-infra-layer-0.1.0-alpha.7-mail02.4.tgz
node --test tests/mail/profile.cjs
bash tests/run-all.sh
```

The acquisition verifies the archive before installation, disables scripts, checks
a closed installed inventory and has no registry/sibling-source fallback. Copy the
public archive receipt to the private installed consumer, then run Infra's fixtures:

```sh
install -m 600 docs/mail-02/evidence/requalification-2026-11-12/archive.json /absolute/CONSUMER/mail02-receipt.json
MAIL02_CONSUMER=/absolute/CONSUMER MAIL02_RETAIN_RUNTIME=1 python3 test/mail-service/run.py
```

`CONSUMER` is Debian `profiles/mail/.cache/consumer` or a separately installed
private consumer. Load exact local image config IDs from qualification.md first;
a new build/ID is a new qualification. `docker load` does not restore RepoDigests;
inside the guest set `MAIL02_NODE_IMAGE=sha256:d0a16be756b6ec6658aecb8b7bcf87fa6c7d0d7fcc6ca53ad14bb49a4c90bdd7`.
The native image has Postfix/OpenDKIM/Dovecot/OpenSSL but no Node; use the pinned
Node helper for metadata operations.

The main harness prints a private `RUN/report.json`. It creates two UUID boxes,
hello/postmaster/abuse aliases, distinct ghost/oxymotion credentials, a lab CA,
certificates and RSA2048 DKIM key. Password hashing uses stdin; verifiers and keys
remain in protected files. SMTP/LMTP/IMAP use native binaries and independent
fsynced receiver files. The report records commands/exits/output hashes, not
credential output or message content. Keep private root permissions0700.

The45 checks include the original42. The added assertions inspect the delivered
message: three local Authentication-Results assertions are removed, including
folded/repeated/quoted variants, while two external results remain untrusted;
DKIM still verifies. Stopping policy after DATA354 produces4xx before final250.
Do not use the historical .0 header failure as the current verdict.

```sh
python3 test/mail-service/mx-check.py "$RUN"
python3 test/mail-service/life-check.py "$RUN/report.json"
```

`mx-check` uses only the lab DNS/MX. It checks alternate421, NXDOMAIN/Null MX,
250/451/550 recipient disposition, strict-domain TLS without clear fallback and
native forced expiry (`postsuper -e` for a specific synthetic ID). It restores its
recorded tmpfs policy overrides. `life-check` owns separate synthetic client
projects and compares complete mail identities during their lifecycle changes.
These are account fixtures, not real Ghost/Oxy compatibility tests.

## Separate pure profile

The DNS/MX auxiliary services and temporary DNS overrides in the first harness are
explicit test inputs, not an allowed production composition. Strict full-role
preflight must use the pure four-service Debian profile. After all harness tests,
stop only that unique harness project with its runtime compose file; preserve
storage and omit `-v`/prune/message deletion:

```sh
docker compose -p "$PROJECT" -f "$RUN/compose.json" down --remove-orphans
# In Debian's worktree, using final test drivers:
MAIL02_RETAIN_RUNTIME=1 MAIL02_PRIVATE_BIND=1 python3 tests/mail/native-lifecycle.py "$RUN"
```

This creates a fresh `PROFILE` root and private copies of all source secrets.
`MAIL02_PRIVATE_BIND=1` requests port1587 **inside the disposable VM** only. Do not
use it to open a production/physical-host port. Without this flag no host port is
published. Do not attach application backend networks. Exact commands used for the
workstation's pure profile were:

```sh
python3 tests/mail/tls-native.py /tmp/mail02-profile-770kpico /tmp/mail02-native-og0e6pku /tmp/mail02-infra/test/mail-service
python3 tests/mail/identity-controls.py /tmp/mail02-profile-770kpico
python3 tests/mail/protocol-native.py /tmp/mail02-profile-770kpico /tmp/mail02-native-og0e6pku /tmp/mail02-infra/test/mail-service
python3 tests/mail/registry-native.py /tmp/mail02-profile-770kpico /tmp/mail02-native-og0e6pku /tmp/mail02-infra/test/mail-service
python3 tests/mail/rate-native.py /tmp/mail02-profile-770kpico /tmp/mail02-native-og0e6pku /tmp/mail02-infra/test/mail-service
python3 tests/mail/signing-native.py /tmp/mail02-profile-770kpico /tmp/mail02-native-og0e6pku /tmp/mail02-infra/test/mail-service
```

Use newly printed paths for a fresh run. TLS checks stage SAN/key faults and sealed
same-ref replacements, rotate all five listener fingerprints, preserve negotiated
SMTP sessions/account for retired IMAP sessions, kill Dovecot during reload and
require explicit successful reconciliation with admission closed. No generic
arbitrary-command fault hook is added to the product API.

Identity checks stop all four cores, alter one owned fixture, assert a specific
refusal and zero running cores, compare full data/metadata hashes, then restore
the original. Replacement-target sentinels are retained. Protocol negatives use
distinct IPs instead of disabling Dovecot penalties. Registry tests advance beyond
all staged immutable generation numbers, including failed candidates; they do not
reuse/overwrite a failed generation. Quota-change test preserves its appended
message and prior accepted local recipient. Rate test emits no DATA and confirms
persistence across policy restart. Signer outage must return4xx with unchanged
queue; native Postfix in this run refused as early as STARTTLS454. It also delivers
synthetic postmaster/abuse messages and reads the expected second UUID via IMAP.

## Guest, private routing and actual reboot

The retained runner is QEMU container `mail02-qualification-vm` on testbox under
`/home/somanos/mail02-vm`. Its outer network was disconnected before testing;
QEMU's SSH host-forward listens only on127.0.0.1 inside that container. No physical
host TCP port is published. The base qcow2/export hashes are in qualification.md.
Never reboot testbox or run the following reboot on the workstation.

Commands **inside the disposable guest**, with uid1000/gid1001:

```sh
TMPDIR=/home/lab/runs MAIL02_CONSUMER=/home/lab/work/r4/consumer \
MAIL02_NODE_IMAGE=sha256:d0a16be756b6ec6658aecb8b7bcf87fa6c7d0d7fcc6ca53ad14bb49a4c90bdd7 \
MAIL02_RETAIN_RUNTIME=1 python3 /home/lab/work/r4/infra/test/mail-service/run.py
# After retaining the base evidence, run the pure profile with its own private inputs.
TMPDIR=/home/lab/runs MAIL02_RETAIN_RUNTIME=1 MAIL02_PRIVATE_BIND=1 \
python3 /home/lab/work/r4/debian/tests/mail/native-lifecycle.py /home/lab/runs/mail02-native-rf42i3o0
python3 /home/lab/work/r4/debian/tests/mail/private-network.py /home/lab/runs/mail02-profile-yxjq7li_ /home/lab/runs/mail02-native-rf42i3o0 /home/lab/work/r4/infra/test/mail-service
python3 /home/lab/work/r4/debian/tests/mail/boot-native.py /home/lab/runs/mail02-profile-yxjq7li_ /home/lab/runs/mail02-native-rf42i3o0 /home/lab/work/r4/infra/test/mail-service stage
sudo systemctl reboot --no-block
# Reconnect through the existing container-local SSH forward, then:
python3 /home/lab/work/r4/debian/tests/mail/boot-native.py /home/lab/runs/mail02-profile-yxjq7li_ /home/lab/runs/mail02-native-rf42i3o0 /home/lab/work/r4/infra/test/mail-service verify
python3 /home/lab/work/r4/debian/tests/mail/private-network.py /home/lab/runs/mail02-profile-yxjq7li_ /home/lab/runs/mail02-native-rf42i3o0 /home/lab/work/r4/infra/test/mail-service
```

The stage driver installs a mail-owned unit only in the guest, with
RequiresMountsFor, preflight and start/stop. All cores use `restart:no`, preventing
a Docker restart from bypassing whole-service validation. Stage writes one delivered
message, then a second accepted/deferred local message with Dovecot stopped.
Verification confirms a changed guest boot ID, guarded activation, retained prior
content, native queue flush and exactly one observed second-message IMAP match.
This is same-storage restart persistence, not backup restoration.

The private-network driver creates/recreates separate owned routed client bridges
48/49, never attaches them to mail or a foreign backend, and attempts the gateway
with CA/hostname verification and required auth. The expected positive source48
currently gets ECONNREFUSED, as does forbidden49. The four results are FAIL overall;
do not treat universal denial as a working filter. An initial internal client
bridge had no gateway route; that failed attempt is retained separately. No
firewall bypass was made. Keep this gate failed until the network design works.

## Concurrent quota failure

Run on the fresh base harness's empty second box, before reusing it for any other
content test. Attach a root helper **only inside the lab** to the internal edge
and existing Unix-socket volume, mounting protected synthetic client keys read-only:

```sh
docker run --rm --network "$PROJECT-edge" \
  --mount "type=volume,source=$PROJECT-sockets,target=/run/mail-sockets" \
  --mount "type=bind,source=$RUN/keys,target=/keys,readonly" \
  --mount "type=bind,source=$INFRA/test/mail-service,target=/lab,readonly" \
  --entrypoint python3 \
  sha256:36afa984f1187ff7fef17356fa7ead13af9a756681ac4a0c234a58fdc38f47e8 \
  /lab/quota-race.py
```

Read the actual volume name from prepared compose; do not guess a foreign volume.
The helper seeds650k, synchronizes APPEND250k and LMTP250k after DATA354, then reads
RFC822 sizes. On this candidate the first iteration accepts both and reports
`FAIL_CONCURRENT_QUOTA_OVERSHOOT`. Preserve that failed mailbox and obtain an
independent read-only physical-file witness. The script's bounded retry cleanup
is only for its explicitly synthetic empty qualification mailbox, not existing
user mail; do not rerun against a box with unrelated content. No setting of
`lmtp_user_concurrency_limit` alone resolves the IMAP race.

## Bounded disk pressure

This requires guest-only integration privileges. Create a **new** owner-controlled
file and directory with O_EXCL/absence checks; never use a block device or an
existing image. The run used a256MiB file, ext4, loop mount with nodev/nosuid and
owner1000:1001 mode0700 at `/home/lab/bounded-mail02`. Stop/down the other owned
profile first so its network pool is free. Exact format/mount commands, after
exclusive creation and `ftruncate(256*1024*1024)`, were:

```sh
/usr/sbin/mkfs.ext4 -F -q /home/lab/runs/mail02-bounded-qualification.ext4
sudo mount -o loop,nodev,nosuid /home/lab/runs/mail02-bounded-qualification.ext4 /home/lab/bounded-mail02
sudo chown 1000:1001 /home/lab/bounded-mail02
sudo chmod 700 /home/lab/bounded-mail02
TMPDIR=/home/lab/bounded-mail02 MAIL02_RETAIN_RUNTIME=1 \
python3 /home/lab/work/r4/debian/tests/mail/native-lifecycle.py /home/lab/runs/mail02-native-rf42i3o0
python3 /home/lab/work/r4/debian/tests/mail/disk-native.py /home/lab/bounded-mail02/mail02-profile-iwu13a5j /home/lab/runs/mail02-native-rf42i3o0 /home/lab/work/r4/infra/test/mail-service
```

The disk driver verifies findmnt reports loop/ext4 and size<512MiB. It delivers
one old message, accepts/defer another with Dovecot stopped, and allocates only a
new synthetic filler until48MiB remain. It checks SMTP452, unchanged queue IDs,
queue-age/disk alerts, removes only the filler in finally, restarts Dovecot,
flushes the queue and reads old/new messages. Queue/spool/Maildirs are never purged.

## Results, cleanup and rollback

Inspect each JSON check, not just exit0. Share only sanitized reports, receipts,
source hashes and logs already reviewed for secrets. Retain native receiver
messages, private keys/verifiers and raw logs privately. The evidence manifest
hashes the committed public artifacts. Compare final packed50 members and Debian
runtime/test hashes before attributing results to a final SHA.

Stop only the named lab projects, without `-v`, prune or `postsuper -d`. Disable
only the generated guest mail unit after its proof. Unmount the owned loop mount
after stopping its writers, retaining its image and private roots. Power off only
the disposable guest after evidence collection. Returning to an earlier code
candidate must preserve each instance's accepted queue; never run two copies.

`SMTP_RECOVERY_UNQUALIFIED` remains for Oxy coordinated state and the complete new
profile. Do not reset the ledger/dedup key, and do not describe a reboot as a
replacement-storage restore. Publication, production activation, DNS/PTR and host
firewall changes require a later lot.
