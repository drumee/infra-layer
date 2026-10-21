"""Real filesystem regressions; run: python3 -B -m unittest discover -s test/security -p '*_test.py' -v.

Foreign ownership uses chown directly as root, otherwise a pinned, isolated Docker
container with only CAP_CHOWN and one process-owned fixture bind mount. No mocks.
"""
import concurrent.futures
import importlib.util
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
ROOT = Path(__file__).absolute().parents[2]
HELPERS = ROOT / 'docs/evidence/IL-5.11-D2'
sys.path.insert(0, str(HELPERS))
from secure_evidence import EvidenceDirectory, UnsafeEvidencePath, trusted_input

IMAGE = 'node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392'
REFUSED = (UnsafeEvidencePath, OSError)


class EvidenceTests(unittest.TestCase):
    def setUp(self):
        self.fixture = tempfile.TemporaryDirectory(prefix='il511-r6s-test-')
        self.base = Path(self.fixture.name)
        self.outside = self.base / 'outside'
        self.outside.mkdir()
        self.sentinel = self.outside / 'sentinel'
        self.sentinel.write_bytes(b'KEEP\x00original')

    def tearDown(self):
        self.assertEqual(self.sentinel.read_bytes(), b'KEEP\x00original')
        self.fixture.cleanup()

    def test_D1_root_symlink(self):
        old = self.base / 'il511-D2-results'
        old.symlink_to(self.outside, target_is_directory=True)
        with self.assertRaises(REFUSED):
            EvidenceDirectory.create(self.base, old.name)
        with EvidenceDirectory.create(self.base) as out:
            out.write_json('new.json', {'ok': True})
            self.assertNotEqual(out.path, old)
        self.assertEqual(sorted(p.name for p in self.outside.iterdir()), ['sentinel'])
        with self.assertRaises(REFUSED):
            EvidenceDirectory.create(old)

    def test_D2_log_symlink(self):
        with EvidenceDirectory.create(self.base) as out:
            (out.path / 'unit.txt').symlink_to(self.sentinel)
            with self.assertRaises(REFUSED):
                out.open_new('unit.txt')
            with self.assertRaises(REFUSED):
                out.read_bytes('unit.txt')

    def test_D3_existing_root_and_output(self):
        selected = self.base / 'existing'
        selected.mkdir(mode=0o700)
        marker = selected / 'owned'
        marker.write_bytes(b'UNCHANGED')
        with self.assertRaises(REFUSED):
            EvidenceDirectory.create(self.base, selected.name)
        self.assertEqual(marker.read_bytes(), b'UNCHANGED')
        with EvidenceDirectory.create(self.base) as out:
            with out.open_new('once') as stream:
                stream.write('original')
            with self.assertRaises(REFUSED):
                out.open_new('once')
            self.assertEqual(out.read_bytes('once'), b'original')
            with self.assertRaises(REFUSED):
                out.open_new('../outside/sentinel')

    def _chown(self, path, uid, gid):
        if os.geteuid() == 0:
            os.chown(path, uid, gid)
        else:
            subprocess.run([
                '/usr/bin/docker', 'run', '--rm', '--network', 'none', '--read-only',
                '--cap-drop=ALL', '--cap-add=CHOWN', '--user', '0:0',
                '--mount', 'type=bind,source=' + str(self.base) + ',target=/fixture',
                IMAGE, '/usr/local/bin/node', '-e',
                'require("node:fs").chownSync(process.argv[1],+process.argv[2],+process.argv[3])',
                '/fixture/' + path.name, str(uid), str(gid)], check=True,
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=90)

    def test_D4_foreign_ownership_real_uid(self):
        parent = self.base / 'foreign'
        parent.mkdir(mode=0o755)
        original = os.stat(parent)
        try:
            self._chown(parent, 65532, 65532)
            self.assertNotEqual(os.stat(parent).st_uid, os.geteuid())
            with self.assertRaises(REFUSED):
                EvidenceDirectory.create(parent)
            with self.assertRaises(REFUSED):
                trusted_input(parent, directory=True)
        finally:
            self._chown(parent, original.st_uid, original.st_gid)
        self.assertEqual(list(parent.iterdir()), [])

    def test_D5_untrusted_permissions(self):
        parent = self.base / 'writable'
        parent.mkdir(mode=0o700)
        parent.chmod(0o777)
        with self.assertRaises(REFUSED):
            EvidenceDirectory.create(parent)
        parent.chmod(0o1777)
        with self.assertRaises(REFUSED):
            EvidenceDirectory.create(parent)
        parent.chmod(0o700)
        with EvidenceDirectory.create(self.base) as out:
            out.path.chmod(0o777)
            with self.assertRaises(REFUSED):
                out.open_new('bad')
            out.path.chmod(0o700)

    def test_D6_fifo_nonblocking(self):
        with EvidenceDirectory.create(self.base) as out:
            os.mkfifo(out.path / 'fifo', 0o600)
            with self.assertRaises(REFUSED):
                out.open_new('fifo')
            with self.assertRaises(REFUSED):
                out.read_bytes('fifo')
            (out.path / 'directory').mkdir()
            with self.assertRaises(REFUSED):
                out.open_new('directory')

    def test_D7_concurrent_processes(self):
        code = ('import sys,json;sys.dont_write_bytecode=True;sys.path.insert(0,sys.argv[1]);'
                'from secure_evidence import EvidenceDirectory;'
                'o=EvidenceDirectory.create(sys.argv[2]);'
                'o.write_json("result.json",{"run":sys.argv[3]});print(o.path);o.close()')
        def run(index):
            result = subprocess.run([sys.executable, '-B', '-c', code, str(HELPERS),
                                     str(self.base), str(index)], check=True, capture_output=True,
                                    text=True, timeout=20)
            path = Path(result.stdout.strip())
            self.assertEqual(json.loads((path / 'result.json').read_text()), {'run': str(index)})
            return path
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            paths = list(executor.map(run, range(16)))
        self.assertEqual(len(set(paths)), 16)
        self.assertEqual(len({(p.stat().st_dev, p.stat().st_ino) for p in paths}), 16)

    def test_D8_close_never_cleans_foreign_resources(self):
        out = EvidenceDirectory.create(self.base)
        root = out.path
        (root / 'foreign-link').symlink_to(self.outside, target_is_directory=True)
        out.close()
        out.close()
        self.assertTrue(root.is_dir())
        self.assertTrue((root / 'foreign-link').is_symlink())
        self.assertTrue(self.sentinel.is_file())
        # An explicit symlink root cannot be selected even for an empty context.
        selected = self.base / 'foreign-root'
        selected.symlink_to(self.outside, target_is_directory=True)
        with self.assertRaises(REFUSED):
            with EvidenceDirectory.create(self.base, selected.name):
                pass

    def test_D9_result_identity_and_modes(self):
        expected = json.loads((HELPERS / 'D2-artifact-receipt.json').read_text())
        with EvidenceDirectory.create(self.base) as out:
            out.write_json('receipt.json', expected)
            raw = out.read_bytes('receipt.json')
            self.assertEqual(json.loads(raw), expected)
            self.assertEqual(stat.S_IMODE(out.path.stat().st_mode), 0o700)
            self.assertEqual(stat.S_IMODE((out.path / 'receipt.json').stat().st_mode), 0o600)
            self.assertEqual(os.stat(out.path).st_uid, os.geteuid())
            with out.child('pack-1') as child:
                with child.open_new('pack.json') as stream:
                    stream.write('{}\n')
                self.assertEqual(child.read_bytes('pack.json'), b'{}\n')
            with self.assertRaises(REFUSED):
                out.child('pack-1')
        spec = importlib.util.spec_from_file_location('qualification', HELPERS / 'qualify.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        self.assertEqual([name for name, _ in module.STEPS], [
            'unit', 'contracts', 'gateway', 'services', 'lifecycle', 'application',
            'package', 'lint', 'audit-production', 'audit-development', 'consumer'])

    def test_D10_historical_two_primitives(self):
        # Replay the precise two writes from temp-path-proof.py using the new API.
        with EvidenceDirectory.create(self.base) as out:
            (out.path / 'unit.txt').symlink_to(self.sentinel)
            with self.assertRaises(REFUSED):
                with out.open_new('unit.txt') as stream:
                    stream.write('replacement log')
        claimed = self.base / 'claimed-output'
        claimed.symlink_to(self.outside, target_is_directory=True)
        with self.assertRaises(REFUSED):
            with EvidenceDirectory.create(self.base, claimed.name) as out:
                out.write_json('campaign-summary.json', {})
        self.assertFalse((self.outside / 'campaign-summary.json').exists())

    def test_hardlink_and_closed_descriptor_refused(self):
        with EvidenceDirectory.create(self.base) as out:
            os.link(self.sentinel, out.path / 'linked')
            with self.assertRaises(REFUSED):
                out.read_bytes('linked')
        with self.assertRaises(REFUSED):
            out.write_json('closed.json', {})


if __name__ == '__main__':
    unittest.main(verbosity=2)
