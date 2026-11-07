"""D1 bounded non-Docker recorder. No retries; comparator attempt uses an exclusive marker."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import selectors
import shutil
import signal
import subprocess
import sys
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
EVIDENCE = ROOT / "docs/evidence/IL-5.14-R1-F1-E3-A4-C-J1-K1-V1-F2-D1"
BASELINE = json.loads((EVIDENCE / "baseline.json").read_text())
BOUND = 262144


def frozen():
    for name, expected in {**BASELINE["frozen_inputs"], **BASELINE["comparator_harness_sha256"], **BASELINE["diagnostic_harness_sha256"]}.items():
        assert hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == expected, name


def redact(value):
    return re.sub(r"\b(password|token|secret|authorization)\s*[:=]\s*[^\s,;]+", r"\1=[REDACTED]", value, flags=re.I)


def capture(label, target, scenario=None, failing_reporter=False):
    frozen()
    private = Path(BASELINE["private_directory"]) / label
    public = EVIDENCE / label
    private.mkdir(mode=0o700)
    public.mkdir(mode=0o700)
    reporter = HERE / ("failure-reporter.cjs" if failing_reporter else "reporter.cjs")
    command = ["/usr/bin/node", "--require=" + str(HERE / "preload.cjs"), "--trace-uncaught", "--test",
               "--test-reporter=tap", "--test-reporter=" + str(reporter),
               "--test-reporter-destination=stdout", "--test-reporter-destination=" + str(private / "events.jsonl"), str(target)]
    environment = os.environ.copy()
    environment.update(D1_CAPTURE_DIR=str(private), D1_TARGET_FILE=str((ROOT / target).resolve()))
    if scenario is not None:
        environment["D1_FIXTURE"] = scenario
    else:
        environment.pop("D1_FIXTURE", None)
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    process = subprocess.Popen(command, cwd=ROOT, env=environment, stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True)
    selector = selectors.DefaultSelector()
    streams = {}
    for name, pipe in [("stdout", process.stdout), ("stderr", process.stderr)]:
        selector.register(pipe, selectors.EVENT_READ, name)
        streams[name] = dict(seen=0, kept=bytearray(), digest=hashlib.sha256())
    timed_out = False
    forced_close = False
    deadline = time.monotonic() + 45
    while selector.get_map():
        if time.monotonic() > deadline and not timed_out:
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass  # Exact owned group already exited; no foreign signal.
            timed_out = True
            deadline = time.monotonic() + 2
        elif time.monotonic() > deadline and timed_out:
            forced_close = True
            for key in list(selector.get_map().values()):
                selector.unregister(key.fileobj)
                key.fileobj.close()
            break
        for key, _ in selector.select(timeout=0.5):
            chunk = os.read(key.fileobj.fileno(), 65536)
            if not chunk:
                selector.unregister(key.fileobj)
                key.fileobj.close()
                continue
            stream = streams[key.data]
            stream["seen"] += len(chunk)
            stream["digest"].update(chunk)
            stream["kept"].extend(chunk[:max(0, BOUND - len(stream["kept"]))])
    returncode = process.wait()
    frozen()
    output = {}
    for name, stream in streams.items():
        raw = bytes(stream["kept"])
        (private / (name + ".raw")).write_bytes(raw)
        text = redact(raw.decode("utf8", errors="replace"))
        (public / (name + ".txt")).write_text(text)
        output[name] = {"bytes_seen": stream["seen"], "bytes_kept": len(raw), "sha256_all_raw_bytes": stream["digest"].hexdigest(), "bounded": stream["seen"] > len(raw), "eof": not forced_close}
    for path in private.glob("*.jsonl"):
        assert path.stat().st_size <= 1048576, "D1_SIDECHANNEL_FILE_BOUND"
        shutil.copyfile(path, public / path.name)
    result = {"label": label, "attempt": BASELINE["attempt"], "source": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
              "node": BASELINE["node_version"], "command": command, "cwd": str(ROOT), "pid": process.pid,
              "started": started, "ended": datetime.datetime.now(datetime.timezone.utc).isoformat(), "returncode": returncode,
              "signal": -returncode if returncode < 0 else None, "timed_out": timed_out, "forced_stream_close": forced_close, "streams": output,
              "frozen_inputs_unchanged": True, "comparator_source_unchanged": True}
    (public / "result.json").write_text(json.dumps(result, indent=2) + "\n")
    with (EVIDENCE / "execution.jsonl").open("a") as ledger:
        ledger.write(json.dumps(result) + "\n")
    return result, public


def records(directory):
    return [json.loads(line) for file in sorted(directory.glob("process-*.jsonl")) for line in file.read_text().splitlines()]


def preflight():
    controls = []
    target = Path("test/diagnostics/comparator-failure/fixture.cjs")
    for scenario in ["success", "load", "registration", "assertion", "rejection", "worker", "reporter", "precedence", "bounds"]:
        result, directory = capture("preflight-" + scenario, target, scenario, scenario in ["reporter", "precedence"])
        events = records(directory)
        encoded = json.dumps(events)
        kinds = [x["kind"] for x in events]
        if scenario in ["success", "bounds"]:
            assert result["returncode"] == 0, scenario
        else:
            assert result["returncode"] != 0, scenario
        assert not result["timed_out"], scenario
        assert "D1_COLLECTION_ERROR" not in (directory / "stderr.txt").read_text(), scenario
        assert all(s["eof"] for s in result["streams"].values()), scenario
        if scenario == "success":
            assert "target-load-complete" in kinds and "registration-complete" in kinds
            assert any(x.get("type") == "test:pass" and x.get("name") == "D1 fixture success" for x in events)
        if scenario == "load":
            assert "target-load-error" in kinds and "D1_LOAD_FAILURE" in encoded and "D1_INNER_CAUSE" in encoded and "fixture.cjs:" in encoded
        if scenario == "registration":
            assert "registration-start" in kinds and "registration-complete" not in kinds and "D1_REGISTRATION_FAILURE" in encoded
        if scenario == "assertion":
            assert any(x.get("type") == "test:fail" and x.get("name") == "D1 fixture assertion" and x.get("error", {}).get("cause", {}).get("code") == "ERR_ASSERTION" for x in events)
        if scenario == "rejection":
            assert "unhandled-rejection" in kinds and "D1_REJECTION_FAILURE" in encoded
        if scenario == "worker":
            assert any(x["kind"] == "process-exit" and x.get("code") == 7 for x in events)
            assert any(x.get("error", {}).get("exitCode") == 7 for x in events)
        if scenario in ["reporter", "precedence"]:
            assert "injected-reporter-error" in kinds and "D1_REPORTER_FAILURE" in encoded
        if scenario == "precedence":
            parent = [x for x in events if x.get("pid") == result["pid"]]
            first = next(i for i, x in enumerate(parent) if x.get("type") == "test:fail")
            second = next(i for i, x in enumerate(parent) if x["kind"] == "injected-reporter-error")
            assert first < second and "ERR_ASSERTION" in json.dumps(parent[first])
        if scenario == "bounds":
            public_text = (directory / "stdout.txt").read_text() + (directory / "events.jsonl").read_text() + encoded
            assert "synthetic-value" not in public_text
            assert (directory / "stdout.txt").stat().st_size <= BOUND
            assert result["streams"]["stdout"]["bounded"]
        controls.append({"scenario": scenario, "status": "PASS", "root_exit": result["returncode"], "evidence": directory.name})
    summary = {"status": "PASS", "controls": controls, "required_controls": ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"], "comparator_attempts": 0}
    (EVIDENCE / "diagnostic-preflight.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary))


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "preflight":
        try:
            preflight()
        except BaseException as cause:
            (EVIDENCE / "PREFLIGHT-STOP.json").write_text(json.dumps({"status": "FAIL", "error_type": type(cause).__name__, "error": str(cause)}, indent=2) + "\n")
            raise
    elif mode == "comparator":
        assert json.loads((EVIDENCE / "diagnostic-preflight.json").read_text())["status"] == "PASS"
        assert not (EVIDENCE / "PREFLIGHT-STOP.json").exists()
        with (EVIDENCE / "diagnostic-start.json").open("x") as marker:
            marker.write(json.dumps({"attempt": BASELINE["attempt"], "resume_checkpoint": BASELINE["checkpoint"], "diagnostic_source": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()}) + "\n")
        result, _ = capture("comparator-diagnostic", Path("test/diagnostics/fixture-volumes/mounts.test.cjs"))
        print(json.dumps(result))
        sys.exit(result["returncode"] if result["returncode"] >= 0 else 128 - result["returncode"])
    else:
        raise ValueError("UNAPPROVED_D1_MODE")
