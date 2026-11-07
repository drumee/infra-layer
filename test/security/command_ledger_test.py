"""Command ledger contracts without Docker or production filesystem mutation."""
import contextlib
import hashlib
import importlib.util
import io
import json
import pathlib
import sys
import tempfile
import unittest
from unittest import mock

spec = importlib.util.spec_from_file_location("command_ledger", pathlib.Path(__file__).resolve().parents[1] / "diagnostics/command_ledger.py")
ledger = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ledger)


class CommandLedgerTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = pathlib.Path(self.temporary.name)
        self.evidence = self.root / "evidence"
        self.output = self.root / "private"
        self.diagnostics = self.root / "diagnostics"
        for directory in [self.evidence, self.output, self.diagnostics]:
            directory.mkdir(mode=0o700)
        (self.evidence / "baseline.json").write_text(json.dumps({"private_directory": str(self.output)}))
        (self.diagnostics / "z.cjs").write_text("last")
        (self.diagnostics / "a.cjs").write_text("first")

    def execute(self, command, snapshots=None):
        stream = io.StringIO()
        with mock.patch.object(ledger, "protected", side_effect=snapshots or [[], []]), \
                mock.patch.object(ledger.subprocess, "check_output", return_value="fixed-revision\n"), \
                contextlib.redirect_stdout(stream):
            code = ledger.record_command(self.root, self.evidence, [self.diagnostics], command)
        return code, json.loads(stream.getvalue())

    def test_command_exit_and_evidence_are_preserved(self):
        for status in [0, 7]:
            with self.subTest(status=status):
                code, row = self.execute([f"exit-{status}", sys.executable, "-c", f"print('output'); raise SystemExit({status})"])
                self.assertEqual(code, status)
                self.assertEqual(row["exit"], status)
                self.assertEqual(pathlib.Path(row["log"]).read_bytes(), b"output\n")
                self.assertEqual(pathlib.Path(row["log"]).stat().st_mode & 0o777, 0o600)
                self.assertEqual(row["log_sha256"], hashlib.sha256(b"output\n").hexdigest())
                self.assertEqual(list(row["diagnostic_hashes"]), ["diagnostics/a.cjs", "diagnostics/z.cjs"])
                self.assertEqual(row["source"], "fixed-revision")
                self.assertTrue(row["protected_unchanged"])
                self.assertEqual(json.loads((self.evidence / "execution.jsonl").read_text().splitlines()[-1]), row)

    def test_protected_change_overrides_command_exit(self):
        code, row = self.execute(["changed", sys.executable, "-c", "raise SystemExit(7)"], [[{"uid": 1}], [{"uid": 2}]])
        self.assertEqual(code, 99)
        self.assertEqual(row["exit"], 7)
        self.assertFalse(row["protected_unchanged"])
        self.assertEqual(row["protected_before"], [{"uid": 1}])
        self.assertEqual(row["protected_after"], [{"uid": 2}])

    def test_existing_log_refuses_before_command_execution(self):
        (self.output / "existing.log").write_text("preserve")
        with mock.patch.object(ledger.subprocess, "run") as run:
            with self.assertRaises(FileExistsError):
                self.execute(["existing", "unused"])
            run.assert_not_called()
        self.assertEqual((self.output / "existing.log").read_text(), "preserve")

    def test_invalid_name_and_missing_command_are_refused(self):
        for argv in [["../escape", "unused"], ["missing"]]:
            with self.subTest(argv=argv), self.assertRaises(AssertionError):
                self.execute(argv)

    def test_spawn_failure_propagates_without_success_record(self):
        with self.assertRaises(FileNotFoundError):
            self.execute(["missing-executable", str(self.root / "absent")])
        self.assertFalse((self.evidence / "execution.jsonl").exists())

    def test_diagnostic_hashes_are_collected_after_command(self):
        script = "from pathlib import Path; Path('diagnostics/new.cjs').write_text('created')"
        _, row = self.execute(["creates", sys.executable, "-c", script])
        self.assertEqual(row["diagnostic_hashes"]["diagnostics/new.cjs"], hashlib.sha256(b"created").hexdigest())


if __name__ == "__main__":
    unittest.main()
