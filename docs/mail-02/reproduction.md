# Reproducing the isolated MAIL-02 qualification

Use [qualification.md](qualification.md) for the current verdict, image identities,
scenario dispositions and evidence. Run only with synthetic identities/messages,
private files and controlled `.invalid` SMTP receivers. Never substitute a real
recipient. A rendered config or successful process exit is not transport proof.
Assert each result's status and individual checks; observation contracts have a
`contract` field rather than a test `status`.

## Acquire the frozen package and engines

Use the two final draft-PR revisions, Node22, the pinned local image exports and
Docker/Compose. The frozen producer is
`de5ea272fe40c77dded529d03ef3ce1f174472ab`; later test/documentation changes leave
all50 packed members identical. The unpublished package is
`0.1.0-alpha.7-mail02.15`. Retain its exact archive and verify SHA256
`03a1402e447015e20b41900b05edfda00ea0ea01ae3b5e7b358b7d88d071aa99` and the SRI/member
inventory in `evidence/requalification-2026-11-13/archive.json`. Do not publish it.
A changed npm tar stream is not silently substituted for this frozen archive.

```sh
# Infra worktree; the general suites do not send real SMTP.
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run test:contracts
npm run lint
npm run test:package

# Debian worktree; archive installation disables scripts and has no source fallback.
node profiles/mail/acquire.cjs /absolute/private/drumee-infra-layer-0.1.0-alpha.7-mail02.15.tgz
node --test tests/mail/profile.cjs
bash tests/run-all.sh
install -m 600 profiles/mail/infra-source-lock.json profiles/mail/.cache/consumer/mail02-receipt.json
```

`acquire.cjs` verifies SHA256/SRI before install. Every consumer import verifies
closed installed inventory and member hashes. For an offline guest without npm,
copy the already installed private consumer plus receipt, then call the same
`consumer.cjs.verify(installedPath, receipt)` before use. Do not create a sibling
source fallback. Type validation uses TypeScript5.9.3, strict/ES2022/Node16 module
resolution, and the installed-consumer fixture in evidence.

Load the exact images from qualification.md. The custom quota module is mandatory:
stock Dovecot count quota is the reproduced failing baseline. The native image
config ID is `sha256:ab41ba434fa20afd54f71f43fc31ad2aaa94260193a4e9b56cc0e5c971fb1a56`.
It contains the module hash `01fec4a55d42add0d62b939216bec57869513b2dab6b55c83ae51c93dd22f4c5`.
Verify it before use, for example:

```sh
docker image inspect sha256:ab41ba434fa20afd54f71f43fc31ad2aaa94260193a4e9b56cc0e5c971fb1a56 --format '{{.Id}}'
docker run --rm --network none --entrypoint sha256sum sha256:ab41ba434fa20afd54f71f43fc31ad2aaa94260193a4e9b56cc0e5c971fb1a56 /usr/lib/dovecot/modules/lib10_quota_plugin.so
```

`node profiles/mail/build.cjs` is a separate rebuild path: exact base config ID,
pinned source commit and15 hashes, bounded source patches, pinned Dovecot-dev ABI,
fixed apt snapshot inherited from the base, a temporary compiler, and a native
image receipt. It formats no mail storage. A different module/image is a new
qualification, even when native syntax checks pass. Local config IDs are not
registry manifest digests. The native FROM now uses the verified local OCI
manifest described in [ci-closure.md](ci-closure.md), imported through a pinned
BuildKit named context without publication. Release acquisition remains outside
this lot. Run `python3 tests/mail/native-base.test.py` in the Debian worktree
before building; corrupt/missing blobs, a changed/mutable/absent FROM and a
populated target must be refused. The closed layout is reconstructed from the
expected local base config ID; no tag fallback is permitted.

## Native transport, controlled MX and original regression

In the Infra worktree, set `CONSUMER` to the absolute Debian
`profiles/mail/.cache/consumer` and `SCRIPTS` to the absolute Infra
`test/mail-service`. Copy fixture files to an immutable private snapshot before a
run; the harness checks that its source files did not change during execution.

```sh
MAIL02_CONSUMER="$CONSUMER" MAIL02_RETAIN_RUNTIME=1 python3 "$SCRIPTS/run.py"
```

The harness prints `RUN/report.json`. It owns two UUID boxes, an alias and separate
ghost/oxymotion accounts, a lab CA/leaf/DKIM key, DNS without external forwarding,
and a durable SMTP witness. Password hashing uses stdin and protected files;
reports contain output hashes, not verifiers or private keys. Preserve root0700
and credential files0600. Node helpers execute outside the native engine, which
contains no Node/Python runtime. In a guest loaded from image exports, set
`MAIL02_NODE_IMAGE=sha256:d0a16be756b6ec6658aecb8b7bcf87fa6c7d0d7fcc6ca53ad14bb49a4c90bdd7`.

Require45 native PASS checks, including delivered duplicate/folded local
Authentication-Results removal, retained external results, valid DKIM, and policy
failure after DATA354 but before final250. The original quota-race fixture runs
before application lifecycle probes while the second box's INBOX is empty:

```sh
docker run --rm --network "$PROJECT-edge" \
  --mount "type=volume,source=$PROJECT-sockets,target=/run/mail-sockets" \
  --mount "type=bind,source=$RUN/keys,target=/keys,readonly" \
  --mount "type=bind,source=$SCRIPTS,target=/lab,readonly" \
  --entrypoint python3 sha256:36afa984f1187ff7fef17356fa7ead13af9a756681ac4a0c234a58fdc38f47e8 /lab/quota-race.py
python3 "$SCRIPTS/mx-check.py" "$RUN"
python3 "$SCRIPTS/life-check.py" "$RUN/report.json"
python3 "$SCRIPTS/mx-expiry-check.py" "$RUN"
```

`PROJECT` is the run's recorded project. The original race retains its seed and
removes only its synthetic candidates between20 rounds; never aim it at an existing
mailbox. Its empty-folder cleanup now skips an empty IMAP message set. The MX driver
checks actual per-recipient outcomes and independent fsynced receiver events.
Forced expiry uses `postsuper -e` for a named synthetic ID; it is not a natural
five-day timer run. The expired-MX driver requires a native deferred certificate
failure, no plaintext witness, then one observed TLS delivery after peer recovery.
It restores its laboratory overrides. The receiver never forwards messages.

## Canonical independent profile and remaining native drivers

Stop/down only the owned native-harness project, retaining all data and volumes,
before reusing its lab subnet for a fresh canonical profile. Do not use `down -v`,
prune, queue deletion or Maildir copying to repair a test. In the Debian worktree:

```sh
MAIL02_RETAIN_RUNTIME=1 python3 tests/mail/native-lifecycle.py "$RUN"
```

The driver prints `PROFILE/result.json`, clones protected synthetic inputs,
prepares/installs only the four canonical services, exercises preflight and
lifecycle guards, and retains the runtime. `SOURCE` below is the original `RUN`.
Execute each command and verify its named result JSON:

```sh
python3 tests/mail/quota-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/registry-cache-native.py "$PROFILE"
python3 tests/mail/tls-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/tls-extra.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/tls-chain-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/protocol-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/registry-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/session-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/write-failure.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/quota-reconcile-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/identity-controls.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/foreign-resources.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/signing-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/rate-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
```

For the actual expunge/space-release scenario, use a **separate** fresh canonical
profile with an empty second mailbox; preserve it after the check. Do not insert
this into a populated profile's sequence:

```sh
python3 tests/mail/quota-release-native.py "$RELEASE_PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/quota-reconcile-native.py "$RELEASE_PROFILE" "$SOURCE" "$SCRIPTS"
```

The script accepts a500KiB message through SMTP25, observes native quota452 and its
queue ID, expunges only its own800KiB seed in a dedicated folder, keeps the1MiB quota
unchanged, and proves one queued delivery after capacity is freed. The delivered
message remains stored. Stop only that owned project before reusing the lab subnet.

Use a fresh profile for the full sequence. Drivers retain their owned synthetic
seeds, failed candidate generations and negative-target sentinels; replaying a
single driver may have additional fresh-fixture preconditions. Never reset an
account-generation high-water mark, ledger or deduplication key to make a test pass.

Quota probes synchronize native LMTP DATA and IMAP operations, record overlapping
times, read RFC822.SIZE independently, exercise simultaneous flags/folder renames,
observe the kernel lock, kill only the identified lab IMAP worker, prove another
UUID remains live, and verify queued retry/restart. Write-failure uses the owned
Maildir/tmp mode, then restores it. COPY/MOVE headroom semantics are documented in
the native design. Registry-cache uses11 same-size quota changes and checks native
userdb plus increasing whole-second generation mtimes. Active-session tests cover
both sides of final SMTP acceptance, combined flag disable and the retained UUID
projection used by future deletion tombstones. They do not implement MAIL03.

The expired fixtures use explicit past start/end dates. Negative `-days` creates an
invalid inverted interval on older OpenSSL and is rejected by OpenSSL3.5; it is not
the final expiry proof. The signer probe permits Docker DNS resolution of a withdrawn
service alias within its client deadline; only an explicit native4xx plus unchanged
queue passes. An early timeout is a failed observation, not accepted evidence.
Distinct client IPs retain native Dovecot authentication penalties.

## Dedicated Docker26 guest, real mount and normal reboot

Only use the dedicated qualification VM. Keep the outer QEMU container disconnected
from every physical-host network and without published ports. Never reboot the
physical SSH host. The guest has its own Docker26 engine and retained image files.

Repeat the same native harness, original race, MX and lifecycle checks there.
For the canonical private path, set `MAIL02_PRIVATE_BIND=1` only in this disconnected
guest. The acceptance composition then uses its canonical routed edge and an exact
gateway1587 binding; clients use the separate static frontal endpoint.

Create **new** bounded storage with the guest-only driver:

```sh
python3 tests/mail/mount-native.py create
# Read the returned MANIFEST, MOUNT and mount-unit name.
TMPDIR="$MOUNT" MAIL02_PRIVATE_BIND=1 MAIL02_RETAIN_RUNTIME=1 \
  python3 tests/mail/native-lifecycle.py "$RUN"
```

The driver creates an O_EXCL256MiB file, formats only that new file, installs an
owned loop/ext4 systemd mount and preserves an underlying fallback sentinel. A
failed setup file is retained and never formatted again. The profile and all its
durable resources must be below the new mount. Repeat the canonical driver matrix
there; prove native versions/image/module match the workstation.

```sh
python3 tests/mail/private-network.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/disk-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/mount-native.py refuse "$MANIFEST" "$PROFILE"
python3 tests/mail/boot-native.py "$PROFILE" "$SOURCE" "$SCRIPTS" stage
```

The private driver creates independent Ghost/Oxymotion/forbidden Compose projects,
with read-only CA and **only each app's own SMTP credential**. It checks verified
STARTTLS, no-auth/wrong-password refusal, sender-specific submission and local
receiver evidence. Unknown frontal sources and a backend-only masqueraded source
must be dropped at packet input. It recreates projects without changing mail IDs
or deleting the external frontal network. Require eight PASS observations.

The disk driver verifies loop/ext4 and size before allocating only its own pressure
file. It establishes prior accepted mail and a deferred message, measures the
64MiB-or10% refusal threshold, requires SMTP452 with unchanged accepted queue and
alerts, removes only the pressure file, then proves old/new message access.

The missing-mount driver stops the owned mail unit/writers, unmounts only the owned
loop filesystem, renames its source file to a retained name, and attempts the mail
unit. A failed mount dependency must prevent all core exposure. The underlying
sentinel/directory listing and retained filesystem hash must be unchanged. Its
`finally` path restores the source name, mount and guarded unit; no data copy or
fallback directory creation is allowed.

`boot-native stage` installs the generated mail-owned unit, checks its guarded
start and mount requirements, preserves a prior local message, accepts another
while LMTP is stopped, and records the nonempty queue and guest boot ID. From the
**guest control channel only**, request a normal reboot:

```sh
sudo systemctl reboot --no-block
```

Reconnect to the same dedicated guest. Without editing rules, network options,
mounts, markers or credentials, run:

```sh
python3 tests/mail/boot-native.py "$PROFILE" "$SOURCE" "$SCRIPTS" verify
python3 tests/mail/quota-reconcile-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/private-network.py "$PROFILE" "$SOURCE" "$SCRIPTS"
python3 tests/mail/rate-native.py "$PROFILE" "$SOURCE" "$SCRIPTS"
```

Require changed boot ID, active mail-owned unit, preflight, retained old body
hashes, exactly one observed delivery of the pending local message and private
positive/negative results after recreation. Preserve separate pre/post-reboot
private reports. Run rate last to avoid deliberately filling the Ghost rate bucket
before other positive submissions. Allow only natural window expiry; do not reset
persistent counters. Reboot on existing storage is **not replacement-storage
restoration**.

After collection, stop only owned lab projects/units, retaining queue/Maildir/registry,
negative targets and loop images. Unmount only after writers stop. Disable only
owned guest units before shutting down the dedicated guest; no purge or production
cleanup. Protect private evidence and publish only the reviewed nonsecret reports.
Full new-profile and coordinated Oxy-form restoration remain
**SMTP_RECOVERY_UNQUALIFIED**.

## Debian gate closure

The exact base/PR replay, unchanged gate commands, tool versions and normalized
diagnostic comparison are in [ci-closure.md](ci-closure.md) and its evidence
folder. `shellcheck-replay.txt` records the composite action inputs and emitted
status check. Use separate clean worktrees so generated files cannot change the
scanner inventory. Run `bash tests/run-all.sh`, `python3 tests/ci-baseline-regression.py`,
`python3 tests/mail/native-base.test.py` and `node --test tests/mail/profile.cjs`;
then require green hosted lint, packaging, suite and minimal-application-contract
jobs on the final PR13 SHA. No inherited failure is waived.
