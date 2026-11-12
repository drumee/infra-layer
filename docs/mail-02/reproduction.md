# Reproduction, evidence and retained resources

Read `qualification.md` first: this is an incomplete qualification with an observed
security failure. Execute only against synthetic private lab inputs. Do not point
any command at production, replace recipient domains, publish images/packages or
attach an Internet-enabled mail network.

## Workstation and Debian profile

```sh
git worktree add --detach /tmp/mail02-reproduce c2552ac7b57771d72e61901582563112e2c3c26d
cd /tmp/mail02-reproduce
npm ci
npm test
npm run test:contracts
npm run lint
npm run test:package
mkdir -m 700 /tmp/mail02-reproduce-pack
npm pack --ignore-scripts --pack-destination /tmp/mail02-reproduce-pack
sha256sum /tmp/mail02-reproduce-pack/drumee-infra-layer-0.1.0-alpha.7-mail02.0.tgz
```

Compare the archive SHA256/SRI and every member against `evidence/archive.json`.
Do not silently accept a different archive. The package audit tests the packed
CommonJS consumer. The strict TypeScript check uses TypeScript 5.9.3, `--noEmit
--strict --module Node16 --moduleResolution Node16 --target ES2022` against an
installed import of `@drumee/infra-layer/mail-service`.

In the Debian candidate worktree:

```sh
node profiles/mail/acquire.cjs /tmp/mail02-reproduce-pack/drumee-infra-layer-0.1.0-alpha.7-mail02.0.tgz
node profiles/mail/build.cjs
node --test tests/mail/profile.cjs
bash tests/run-all.sh
```

Before the native harness, load the exact native, Node and Python helper image
config IDs from `qualification.md`. The build receipt and native version receipt
are mandatory. A rebuild producing a different ID is a new candidate requiring
qualification; it is not an interchangeable replacement.

The acquisition creates `profiles/mail/.cache/consumer`. Copy the public
`evidence/archive.json` receipt to `CONSUMER/mail02-receipt.json`, with mode0600.
Use the dossier's final test fixtures (the producer commit identifies package
code, and subsequent dossier commits supply additional VM/lifecycle probes).

```sh
MAIL02_CONSUMER=/absolute/CONSUMER python3 test/mail-service/run.py
```

Every normal run prints its private report path. The generated certs, keys,
credentials, messages and raw logs stay private. The harness creates two UUID
mailboxes, alias `hello@oxymot.fr`, separate `ghost`/`oxymotion` credentials, a lab
CA, two server certificates, an RSA2048 DKIM key, DNS53 and an SMTP25 witness.
It starts actual native engines; it is not a syntax/render-only test.

DNS resolves only the controlled `dest.invalid` zone, including the exact DKIM
public key. Failure modes are driven by private control files, not real DNS.
The receiver fsyncs independent message files. Native `opendkim-testmsg` verifies
actual received messages. Negative controls check explicit SMTP/IMAP results and
queue inventories. Commands, times, exits and output hashes are recorded in the
report; credential hashing reads stdin and never writes its output to reports.

For the existing profile's separate native operator exercise:

```sh
python3 tests/mail/native-lifecycle.py /absolute/SOURCE_RUN
```

Run this in Debian's worktree. It creates a new private root and unique mail
project, starts only four core services with no host publication, repeats install,
adds/removes one owned test network to prove refusal, then stops/removes only its
containers/networks. Durable bind storage and ownership markers are retained.

## Dedicated VM

The retained private runner is on `testbox`, under `/home/somanos/mail02-vm`, with
QEMU container `mail02-qualification-vm`. It uses `/dev/kvm`; the **host is never
rebooted**. `base.qcow2` matches the SHA512 in the qualification table and is kept
unchanged; `guest.qcow2` is its replacement overlay. No production access is used.
No host TCP port is published: QEMU `hostfwd=tcp:127.0.0.1:2222-:22` lives inside
that helper container's network namespace.

The bootstrap creates a private SSH key and NoCloud seed outside Git. Its lab user
is uid1000, with qualification-only sudo and Docker access. Docker26, pinned
Compose5.0.2 and the workstation Node22 binary were installed inside the guest.
The outer container bridge was disconnected **before** mail started. The only
remaining control channel is `docker exec` plus its loopback SSH forward. Images
and payload arrive using protected local files and `docker load`, never mail egress.

Guest commands for the retained run were:

```sh
chmod 700 /home/lab /home/lab/runs /home/lab/work
TMPDIR=/home/lab/runs \
MAIL02_CONSUMER=/home/lab/work/consumer \
MAIL02_NODE_IMAGE=sha256:d0a16be756b6ec6658aecb8b7bcf87fa6c7d0d7fcc6ca53ad14bb49a4c90bdd7 \
MAIL02_RETAIN_RUNTIME=1 \
python3 /home/lab/work/test/mail-service/run.py
```

`MAIL02_RETAIN_RUNTIME=1` is an explicit laboratory option: it leaves the unique
project running with restart policies so a real reboot can be tested. Without it,
the harness tears down its own containers/networks and preserves durable data.
The Node override is the same immutable config loaded from the saved image; it
avoids pretending that `docker load` reconstructed a registry RepoDigest.

For this run `REPORT=/home/lab/runs/mail02-native-gpscwlpo/report.json`. Record the
actual fresh path when reproducing. Root inside the disposable guest is needed
to read vmail5000's protected Maildir bytes; ordinary preparation remains uid1000.

```sh
sudo python3 /home/lab/work/test/mail-service/vm-check.py snapshot "$REPORT"
sudo systemctl reboot --no-block
# Reconnect to the guest through the existing docker-exec loopback SSH channel.
sudo python3 /home/lab/work/test/mail-service/vm-check.py verify "$REPORT"
python3 /home/lab/work/test/mail-service/life-check.py "$REPORT"
```

The verifier waits for native health, compares the nonempty queue and sealed
registry/candidate/Maildir body inventory, checks changed guest boot ID, reads the
primary via IMAP, then stops only its Postfix. It retains the source spool under a
separate name. A missing bind source must refuse; a replacement with foreign owner
must exit78. It stops the restart loop before checking that no writer remains,
restores the source in `finally`, and verifies the same queue IDs after startup.
Never substitute the physical host in the reboot command.

The lifecycle probe uses two independent **synthetic client** projects and backend
networks. It tests stop/update/exit42/rollback in both directions while the peer
submits and sends incoming MX mail. Complete mount records are compared as a
multiset because Docker does not promise array order; fields and duplicates are
not discarded. It removes only those client projects, retaining core mail data.

## Failed authentication-header gate

Inside a Python helper attached to the same internal mail edge, mount only the
lab scripts and protected synthetic `keys` directory, then execute:

```sh
python3 /lab/header-probe.py
```

On the guest (RUN is the private run root):

```sh
python3 /home/lab/work/test/mail-service/header-check.py "$RUN"
```

The first script verifies SMTP TLS, authenticates Ghost and submits a uniquely
correlated message containing a forged local Authentication-Results header.
The second reads only controlled witness files, writes `header-result.json` with
file/content hashes and header-presence booleans, and exits1 if that header survives.
On the frozen candidate it **does** survive: this is an actual failed gate, not
an expected-success test or a permitted configuration.

## Stop, rollback and retention

After collecting evidence, stop only the named lab project; do not use `-v`, prune,
queue purge or `postsuper -d`. Retain private roots, overlays, image exports and
receiver files for review. Power off only the disposable guest after stopping its
mail containers. A future rerun uses a new project/root and preserves the source.
The package/code rollback is to the prior candidate, but accepted messages remain
owned by their original instance. Do not start copied or older queues concurrently.

No production/DNS/port25/PTR/provider change occurred. The profile backup/restore
API remains refused. Reboot persistence is not cold restoration, and alpha.6 cold
restore evidence does not qualify these new queue, registry and Maildir artifacts.
