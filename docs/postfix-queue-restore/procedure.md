# Reproducible cold-spool procedure

This procedure is qualified only for the references and limitations in
[reference.md](reference.md). It is **not authorization to operate production**.
The commands below reproduce the synthetic qualification. A production execution
requires a separately reviewed/fenced maintenance operation and protected backup
of its own configuration and secret generations; never substitute real addresses
or passwords into this harness.

## 1. Establish immutable artifacts

Use a normal operator account with access to the local Docker daemon, Node22,
Python3, OpenSSL, curl, the exact local image payload and the pre-existing helper
images. All work is in a new private directory; no host root installation.
Check out this qualification branch/commit in a clean isolated worktree.

```sh
umask 077
QUEUE_INPUT=$(mktemp -d /tmp/queue-input.XXXXXXXX)
curl -fLsS https://registry.npmjs.org/@drumee/infra-layer/-/infra-layer-0.1.0-alpha.6.tgz \
  -o "$QUEUE_INPUT/infra-layer-alpha6.tgz"
printf '%s  %s\n' \
  562a01bf5d8dba6151bf3a1768e56655df9e9302ed2ea6f072a4ed72eb177874 \
  "$QUEUE_INPUT/infra-layer-alpha6.tgz" | sha256sum -c -
mkdir "$QUEUE_INPUT/consumer"
printf '%s\n' '{"private":true,"dependencies":{"@drumee/infra-layer":"file:../infra-layer-alpha6.tgz"}}' \
  > "$QUEUE_INPUT/consumer/package.json"
npm install --prefix "$QUEUE_INPUT/consumer" --ignore-scripts --no-audit --no-fund
```

Compare SRI and every package member with Debian's lock before executing it:

```sh
git -C /path/to/debian show \
  ff6e6b399128e6332c984fc2e8e60f660bd5f881:profiles/minimal-application/infra-source-lock.json \
  > "$QUEUE_INPUT/source-lock.json"
python3 - "$QUEUE_INPUT" <<'PY'
import base64,hashlib,json,pathlib,sys,tarfile
r=pathlib.Path(sys.argv[1]); lock=json.loads((r/'source-lock.json').read_text())
data=(r/'infra-layer-alpha6.tgz').read_bytes()
assert hashlib.sha256(data).hexdigest()==lock['sha256']
assert 'sha512-'+base64.b64encode(hashlib.sha512(data).digest()).decode()==lock['integrity']
with tarfile.open(r/'infra-layer-alpha6.tgz') as t:
    files={m.name.removeprefix('package/'):hashlib.sha256(t.extractfile(m).read()).hexdigest() for m in t if m.isfile()}
assert files==lock['package']['files']
installed=r/'consumer/node_modules/@drumee/infra-layer'
assert {str(p.relative_to(installed)):hashlib.sha256(p.read_bytes()).hexdigest() for p in installed.rglob('*') if p.is_file()}==files
print('44-member source lock and installed bytes verified')
PY
```

Verify the Postfix image config digest and rootfs diff IDs against
[image.json](evidence/image.json), plus the offline helper and Node helper IDs.
If obtaining the image again is necessary, the original acquisition was the
following read-only operation, followed by a **local** load:

```sh
ssh -o BatchMode=yes debian@15.235.100.230 \
  'sudo -n docker image save sha256:c9d6b4d5a69d7c53272ff13a4b90679422d61428a6f868a0463e3bdcfbe58236' \
  > "$QUEUE_INPUT/postfix-image.tar"
docker load -i "$QUEUE_INPUT/postfix-image.tar"
docker image inspect \
  sha256:a02cc47d0ebca12a55759edb00757b3a8cdd00112ad4afe9a4ff7b5337ffe843 \
  --format '{{json .RootFS}}'
```

The server descriptor is an OCI manifest digest; the local Docker store reports
the referenced config digest. Verify the exported manifest/config link and layers,
not equality between these two different kinds of identifier. No image is
published or installed on the server by this step.

## 2. Execute the complete isolated campaign

```sh
python3 test/queue-restore/run.py \
  "$QUEUE_INPUT/consumer/node_modules/@drumee/infra-layer" \
  "$QUEUE_INPUT/report.json" > "$QUEUE_INPUT/run.log" 2>&1
python3 - "$QUEUE_INPUT/report.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1]))
assert r['verdict']=='POSTFIX_QUEUE_RESTORE_QUALIFIED'
assert all(x['pass'] for x in r['checks'])
assert all('error' not in x for x in r['cleanup'])
print(r['verdict'],len(r['checks']),'checks')
print('Preserved source/archive/witness root:',r['retained_private_root'])
print('Preserved replacement volumes:',r['retained_volumes'])
PY
```

The report contains **every exact native Docker/Postfix/helper command**, arguments,
UTC boundaries, exits and output hashes. `prepare.cjs` generates fresh synthetic
TLS/credentials through canonical alpha.6 preparation; the private working root
is printed in the report, never replaced by an existing deployment. The fixture
changes only the isolated topology, resource mounts and restart fencing. It
publishes no port and uses only `--internal` networks. Offline helpers use
`--network none`. Test client passwords are read from private mounted files,
never argv/env. Do not enable debug logging or export populated authentication maps.

The seven negative restoration cases are part of this command. They must return
exit78 with the expected code **before activation**, and preserve the cold source
and pre-existing target inventory. The receiver's durable `.eml`/event files are
retained in the private witness directory; only synthetic IDs/digests/results are
exported as evidence. No archive, TLS private key or message body is committed.

## 3. Capture boundary and cold backup

The complete campaign automates the following sequence, with observed preconditions:

1. Isolate the receiver from real recipients; set its private control file to
   `defer`. Submit three messages through normal SMTP EHLO/verified STARTTLS/AUTH/
   MAIL/RCPT/DATA. Record each final submission250, queue ID, Message-ID and time.
2. Wait for all three native `postqueue -j` entries to be **deferred with451**.
   Independently require receiver durable acceptance count zero and at least
   one refusal event per synthetic message. Postfix submission acceptance alone
   is insufficient to establish non-delivery; the controlled witness supplies it.
3. Fence all source automatic starts. In the fixture, the restart policy is `no`;
   request native clean shutdown using:

   ```text
   docker update --restart=no SOURCE_CONTAINER
   docker exec -d SOURCE_CONTAINER postfix -c /run/infra-mail/config stop
   docker inspect SOURCE_CONTAINER
   ```

   Detached exec avoids losing the control transport when the daemon PID1 exits.
   Do **not** treat exec launch success as shutdown proof. Wait for `Running=false`,
   PID0, exit0, and no running container with any overlapping writable spool mount.
   There must also be no host submission tool, service manager, scheduled job,
   container restart or other host writer capable of changing this private spool.
   Record the maintenance/fencing owner. A live Docker daemon or a stopped process
   alone does not supply cross-host fencing. If the writer set is uncertain, stop.
4. Offline `storage.py` snapshots the full spool. Its JSON input names source,
   archive, receipt, exact owner/resource, image/config digest, operator numeric
   UID/GID and the externally established quiescence precondition. Helpers have
   no Docker socket or network. They preserve numeric UID/GID, mode, mtime_ns and
   all regular-file digests; only recorded runtime socket nodes are omitted.
5. Independently verify archive SHA256 and receipt hash before restoration. Store
   the trusted receipt hash outside the archive's replaceable location. A digest
   supplied by an untrusted archive is not an authenticity check. Persist config,
   descriptor/reference manifest, exact secret generations, cert chain/key/CA and
   DKIM material separately with protected access and a tested recovery route.

The source remains cold and unchanged for the rest of the campaign. Reading can
change access time; access time/ctime/inodes are not restoration equivalence fields.
No live spool tar, manual file selection, queue re-submission or application retry
is substituted for this capture boundary.

## 4. Restore and verify before allowing delivery

Create a new uniquely named, labeled replacement volume. The procedure refuses an
existing target; it never merges into, empties or overwrites one. The qualification
storage tool accepts target children only under its separate `/replacement` mount,
so an accidental source-subtree target is rejected. Parent paths are private and
operator-controlled; serialize restore operations. No untrusted concurrent writer
is permitted to race filesystem checks. The tool is not a multi-tenant restore API.

Verify trusted receipt hash, archive digest, every member's coverage/type/content/
numeric ownership/mode and embedded `.infra-owner`, plus exact image/config
compatibility, **before extracting**. Restore into private staging, fsync files/
directories, apply recorded metadata, compare the complete inventory, then rename
staging to the absent destination. Failed staging is retained for inspection;
existing target data and source are preserved. An incomplete archive fails even
when its outer archive checksum has been deliberately recomputed in the test.

With no network and the original still fenced, use the exact image to parse each
queue file via `postcat -c /config -q SOURCE_QUEUE_ID`; correlate the synthetic
Message-ID and original inventory. In the fixture `/config` contains the canonical
main/master/SASL configuration mounts. Require source and restored inventories to
match **before** native queue maintenance. Then place the **dedicated restored
queue only** on native hold while still offline:

```text
postsuper -c /config -h ALL
```

Startup may repair short queue file names to match the replacement inodes. This
is legitimate Postfix behavior, not message identity preservation: record a
one-to-one **old ID -> new ID -> correlation** mapping while all restored entries
are held. Reject ambiguous/missing mappings. Keep the original IDs/checkpoint/
instance/time and message digests, not only Message-ID. Do not attempt release
with stale IDs or assume a successful `postsuper` exit means a message moved.
See [postsuper structure repair](https://www.postfix.org/postsuper.1.html).

Only after matching metadata, queue coverage, marker, image, configuration, keys,
certificate trust and writer fencing may the unchanged native entrypoint start
the replacement. It reconstructs `/run` from retained references and runs native
config/queue checks. Start on the isolated network **with all messages held** and
receiver still refusing. Confirm the source remains stopped, exactly one queue
processor is active, no host port exists, all expected messages are present and
no sink acceptance occurred. Failure retains hold and all evidence.

Set receiver mode `accept`, then release explicitly reviewed current IDs:

```text
postsuper -c /run/infra-mail/config -H CURRENT_QUEUE_ID
postqueue -c /run/infra-mail/config -i CURRENT_QUEUE_ID
```

Verify per-recipient native completion and independent receiver durable receipt,
correlation and content digest. Do not infer delivery from an empty queue alone.
For the proven non-deliveries, require exactly one durable receipt each during
this primary restoration phase, and no pending queue item. Preserve the original
source regardless of success; it is not restarted in parallel.

## 5. Uncertain delivery and old-checkpoint handling

The independent witness has a specific `uncertain` mode: durably write/fsync the
complete message and acceptance event, then cut the TLS/SMTP connection **before
the final250**. The campaign observes a durable receiver copy and a deferred
Postfix queue entry with lost end-of-DATA acknowledgement. It immediately holds
that queue ID. This is not a451 rejection: the receiver has accepted responsibility
but the sending MTA does not know it.

Operational response:

1. Fence automatic resumption: hold affected IDs, or stop/hold the whole isolated
   restored queue when the uncertain set cannot be identified safely. Close new
   application admission if needed; do not delete/requeue/resubmit blindly.
2. Preserve source/checkpoint/current spool, complete timestamps, old/new queue-ID
   map, envelope/recipient, Message-ID and protected content digests, SMTP stage/
   response, receiver logs/receipts and operator action history.
3. Ask the receiver operator for a bounded trace match. A sender's `status=deferred`
   is not evidence that the receiver lacks a copy; `accepted` in an application
   ledger is not evidence of mailbox receipt.
4. Decide per recipient: continue holding for investigation, resume with an
   explicitly accepted duplicate risk, or use a separately authorized disposition
   after definitive receipt evidence. This lot performs **no queue deletion** and
   does not qualify a production discard action. A repeated full message can be
   delivered; Message-ID is not a universal receiver deduplication protocol.
5. Record who approved release, the current ID and the evidence considered.

The campaign deliberately approves one synthetic retry after the lost250 and
observes two receiver copies with the same digest, then an empty queue. That is
evidence of duplicate risk, not a defect hidden by success of the recovery method.

An **old backup** is different: it can contain messages that definitely completed
after the backup boundary. The campaign restores the original checkpoint again,
starts it held, then deliberately releases just one already-completed message;
the receiver records another copy. Two other old-checkpoint messages remain held
in the retained stale volume. Reconcile the entire completion interval before
production replay; a matching checkpoint checksum does not prove replay is safe.

## 6. Return path and Oxy-form state

If validation fails before resumption, do not activate the target. Preserve its
data/staging, keep source cold and repair the missing dependency or use another
empty target. A return to the original spool is possible only after fencing the
replacement and proving it accepted/delivered **nothing** since the checkpoint.
Once the replacement processed messages, the original snapshot is stale: do not
restart it as a naive rollback. Preserve the latest replacement queue and reconcile
every post-checkpoint recipient, or keep service stopped for explicit recovery.
The same applies after a software/config rollback. Never run both source and copy.

Oxy-form's `ledger.json` and its existing 32-byte HMAC `key` must remain together
on the same persistent forms-state identity. Its worker records `accepted` after
relay submission acceptance and reports `accepted_by_relay`; it does not attest
recipient receipt. Preserve pending/uncertain reservations, key fingerprint,
business submission ID, original Message-ID/envelope, relay identity, checkpoint
boundary and queue-ID map. Do not clear records, create a new HMAC key, retry the
HTTP form or change request tokens to manufacture recovery.

**Coordinated Oxy-form restoration remains SMTP_RECOVERY_UNQUALIFIED.** No real
plugin, RPC reservation, ledger checkpoint or coordinated state restore is part
of this spool-only campaign. Claiming it later requires a distinct scenario:
freeze new RPC admission and all state/spool writers, capture consistent ledger+
key+queue+secret generations, restore both to an isolated deployment with native
identity checks, exercise accepted/pending/uncertain records and duplicate RPC
requests, and account for deliveries completed after capture. The current
application backup/restore API guard remains unchanged.
