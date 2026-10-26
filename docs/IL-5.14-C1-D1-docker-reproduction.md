# IL-5.14-C1-D1 Docker reproduction and causal correction

## Single instrumented reproduction

Gate E: PASS for causal capture, not for acceptance. Exactly one uncorrected instrumented reproduction ran at source `62fbaec7e4a60a1f55ce5a61989e67fb79e1bcd6`, 2026-10-25T23:02:33.597423–23:02:49.663181 UTC. Exit 1 was preserved. Preconditions verified the S1 lock, installed graph/file identity, fixed Docker socket, immutable Redis image and absence of stale test resources. [Preflight](evidence/IL-5.14-C1-D1/reproduction-preflight.json), [installed readback](evidence/IL-5.14-C1-D1/installed-dependency-readback.json).

```sh
env IL514_DIAGNOSTIC_DIR=/tmp/drumee-il514-c1-d1-evidence/instrumented-real node test/network-attachments/real-docker.cjs
```

Scenario `drumee-il514-net-1dbb677f`, step `foreign-resource-refusal`, assertion `test/network-attachments/real-docker.cjs:73:28`, operator `throws`: expected `{code: "NETWORK_OWNERSHIP_MISMATCH"}`, actual `{code: "DOCKER_LIFECYCLE_COMMAND_FAILED", exit_status: 1, signal: null}`. Complete message, actual/expected and both stacks survive in [failure.json](evidence/IL-5.14-C1-D1/instrumented-real/failure.json). Original assertions and order remain unchanged.

Originating Docker call 127: `/usr/bin/docker --host unix:///var/run/docker.sock container inspect --format <canonical template plus name/networks> ac41634e4b633cd979794223c4e7d720da169f40395131804f5ced263311d012`. The complete sanitized argv is in [the trace](evidence/IL-5.14-C1-D1/instrumented-real/trace.jsonl). Docker exit 1, stdout newline, stderr:

```text
template parsing error: template: :1:207: executing "" at <.State.Health>: map has no entry for key "Health"
```

Call path: foreign-resource assertion → checkNetworks → networkObject → docker. The negative fixture intentionally has no HEALTHCHECK. Docker omits State.Health, but the common format evaluates `.State.Health` before reaching the ownership labels. The guard itself therefore fails. Classification: `OPTIONAL_HEALTH_TEMPLATE_LOOKUP`, a verified canonical metadata-template defect. This is neither a reason to change the ownership assertion nor evidence that the network identity correction should be removed. First-failure capture occurs before the unchanged finally; cleanup completed and readback finds no remaining mission resources. [Causal record](evidence/IL-5.14-C1-D1/verified-functional-cause.json).

The historical 703b637-era log contains no actual/expected values. The repeated original scenario now establishes this causal failure; it cannot retroactively recover missing historical fields. H1's separate historical cause remains undetermined.

## Minimal correction and exact-cause control

Gate F: PASS for the implemented correction and focused proof. Commit `eefc58803ad02823927c229ed2d49f91a5fb726f` changes only the optional-field guard in the shared inspection template:

```text
{{if .State.Health}} → {{if index .State "Health"}}
```

The existing absent-field result stays `"unknown"`. It does not become healthy or authorized. No public API, lock, ownership check, Docker arguments/order, timeout, retry or cleanup contract changes. Both inspectProject and network member inspection use the corrected common template, so full lifecycle requalification remains mandatory.

`node test/network-attachments/container-health.cjs`, 2026-10-25T23:11:15.851187–23:11:16.148523 UTC, exit 0, 15 assertions. Dedicated stopped non-root containers on network none prove State.Health is absent. The historical template loaded directly from 703b637 fails with Docker exit 1 and the exact Health diagnostic. The corrected implementation reports unknown and retains IDs/ownership. A second mission-owned negative fixture is rejected with DEPLOYMENT_OWNERSHIP_MISMATCH. Cleanup checks the independent qualification ownership marker before removing only these fixtures. [Before/after result](evidence/IL-5.14-C1-D1/container-health-regression.log), [trace](evidence/IL-5.14-C1-D1/health-regression/trace.jsonl).

## Corrected real acceptance

Gate G: PASS for focused network qualification. At source eefc588, `node --test test/unit/network-attachments.test.js` exits 0: all 13 tests pass, none skipped. The complete original real Docker scenario then runs once after the documented correction:

```sh
env IL514_DIAGNOSTIC_DIR=/tmp/drumee-il514-c1-d1-evidence/corrected-real node test/network-attachments/real-docker.cjs
```

2026-10-25T23:11:25.056831–23:11:57.556366 UTC, exit 0. Two independent complete cycles pass, 40 harness-counted assertions plus original direct start assertions, 240 explicit harness Docker command records. Both exercise authenticated Redis crash/recovery with durable readback, changed EndpointID, restart, detachment/reconnection, unchanged foreign-resource refusal, missing required network/container failures and verified cleanup.

| Cycle | Project | Network ID | Redis recovery | Cleanup |
|---|---|---|---|---|
| 1 | drumee-il514-net-08cfd4ec | fbfd52d99485a4295e912bbb1fdc87ba2c0dc9c791d97c58eac5c7bf3663468d | PASS | PASS |
| 2 | drumee-il514-net-393513e3 | d5e4d61493549ad9130b43c6229b48158ff72ed5e7f15ea75f164c892aa364ed | PASS | PASS |

Redis input: `redis@sha256:ff02b58f971e7d7d156a1267e283fcbbeee91773b6aa36c49dac28ecfe28eadf`; actual linux/amd64 image ID `sha256:5509c0097c6064aa8a3b1df58f1d950e67090fffa6678ae8f3f1dc2385f12deb`. Docker 29.2.0, UID/GID 1000:1000, same trusted executable and protected configuration. [Complete success result and resource identities](evidence/IL-5.14-C1-D1/real-acceptance-corrected.log), [final cleanup/lock readback](evidence/IL-5.14-C1-D1/final-readback.json).

Sandbox-less endpoint timing remains daemon-dependent. The 13 actual-source fixture tests deterministically exercise endpoint identities, metadata/refusal and bounded reconciliation; the real runs do not claim to force Moby's transient sandbox-less state. Their success is not a Debian H4 campaign, nor a complete parent C1 qualification.

## Subsequent mandatory stop

At source `d4be9edadc60cb70ea8d4236297dedd5052ccb0d`, unit 206/206 and contracts 24/24 pass. Canonical `npm run lint` exits 1: zero errors, 29 visible warnings, one exact-baseline mismatch. No services, gateway, complete lifecycle, application, package or final audit run follows that stop. No push or PR is created. See [current decision](IL-5.14-C1-final-decision.md).
