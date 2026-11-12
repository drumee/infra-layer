# MAIL-01 evidence and limits

The audit used fetched Git references and existing SSH access **read-only**.
[observations.json](observations.json) is a sanitized factual projection, not a
complete deployment export. [dns.txt](dns.txt) retains read-only DNS answers.
Secrets, message bodies, environment dumps and production archives are excluded.

## Final isolated execution

- [contract-checks.json](contract-checks.json): **10 cases PASS**, one valid and
  nine invalid configurations. JSON Schema draft2020-12 plus selected cross-field
  checks (network, roots, signing-domain coverage, retry ordering).
- [native-hypotheses.json](native-hypotheses.json): **16 native checks PASS**,
  Postfix 3.10.13 / OpenDKIM 2.11 / Dovecot 2.4.1 package versions recorded in result.
  Argon2id availability, actual Unix LMTP delivery and unknown-user rejection,
  UUID-directed Maildir, IMAPS with certificate verification, mailbox isolation,
  SMTP-only versus IMAP identity separation, quota temporary failure, canonical
  SASL identity generation and explicit reload observation.
- [execution.json](execution.json): exact final argv/start/end/exit/stdout hashes,
  source/schema/example hashes, local image IDs and container cleanup observation.

The container ran with `--network none`, no published ports, no host data mounts
apart from read-only lab source, and disposable `/run` tmpfs. Loopback IMAPS and
Unix LMTP exchanged **synthetic** messages wholly inside that container. No real
SMTP message was emitted. No volume/network was created; the probe container was
removed. The local lab image and Python venv remain unpublished for reproducibility.
Build-time package downloads used the base image's immutable Debian snapshot
`20261105T000000Z`; build network access was for APT, not mail delivery.

Reproduction, after verifying local base tag ID:

```sh
docker image inspect drumee-minimal-application-tools:ff6e6b399128e633 --format '{{.Id}}'
# Must be sha256:a02cc47d0ebca12a55759edb00757b3a8cdd00112ad4afe9a4ff7b5337ffe843
docker build --pull=false -t mail01-hypothesis:local docs/mail-01/lab
docker run --rm --network none \
  --mount type=bind,source="$PWD/docs/mail-01/lab",target=/lab,readonly \
  --tmpfs /run:rw,nosuid,size=128m mail01-hypothesis:local
python3 -m venv /tmp/mail01-validation
/tmp/mail01-validation/bin/pip install jsonschema==4.26.0
/tmp/mail01-validation/bin/python docs/mail-01/lab/check_contract.py
```

No tests of shipped source were needed for documentation-only changes. The lab
does **not** implement or qualify Postfix end-to-end MX/submission/header milter,
full password/session revocation, concurrent hard quota enforcement, reboot,
backup/restore, direct Internet delivery, DNS reputation or Ghost integration.
The matrix assigns those checks to MAIL-02–06; no synthetic result replaces them.
Argon2id support is shown, not load sizing or enforcement of production KDF parameters.

## Findings that changed the design

Initial native attempts failed: inline Dovecot blocks were rejected; expanding
`home` before LMTP user lookup failed; the Python LMTP client needed its `ehlo`
method (which emits LHLO). These were lab configuration/harness corrections,
not production changes. An initial Docker build addressed an image ID as a remote
image name and failed resolution; the local tag was then verified and used.

Two successful-looking assumptions were disproved and explicitly corrected:

1. An over-quota synthetic message was initially accepted because Dovecot's
   default `quota_storage_grace` is **10 MiB**. The corrected probe sets grace to
   zero and observes a temporary LMTP failure. The normative hard quota requires
   this explicit setting; it still needs concurrent IMAP/LMTP tests in MAIL-02.
2. Rewriting a passwd-file and disabling auth cache did not immediately change
   the returned identity in the first attempt. The final probe uses a new
   generation path, explicit Dovecot reload and a bounded observation before
   releasing the conceptual admission barrier. This is now required in the
   registry activation protocol. It demonstrates the Dovecot identity mechanism,
   not complete Postfix session revocation.

Failed attempts remain failures; only the final, hashed commands contribute to
the counts above. No existing test/guard was relaxed. MAIL-01's conclusion is
that the frozen contract supports starting implementation, not that the future
service is ready for traffic. **SMTP_RECOVERY_UNQUALIFIED remains applicable.**
