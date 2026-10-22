"""Focused maintenance regressions for repository-local evidence utilities."""
import importlib.util
import hashlib
import json
import os
from pathlib import Path
import stat
import sys
import unittest

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'docs/evidence/IL-5.11-D2'))
from secure_evidence import EvidenceDirectory, UnsafeEvidencePath, private_input
import evidence_helpers_test as original_tests


def load(name):
    path = ROOT / 'docs/evidence/IL-5.11-R6S-D4' / (name + '.py')
    spec = importlib.util.spec_from_file_location('review_' + name.replace('-', '_'), path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class EvidenceUtilityTests(unittest.TestCase):
    def test_bootstrap_uses_selected_repository_and_import_has_no_side_effects(self):
        for name in ['diagnose', 'run-proof', 'export-proof', 'sonar-read', 'validate-proof']:
            with self.subTest(name=name):
                module = load(name)
                self.assertEqual(module.REPOSITORY, ROOT)
                self.assertEqual(Path(sys.modules[module.EvidenceDirectory.__module__].__file__),
                                 ROOT / 'docs/evidence/IL-5.11-D2/secure_evidence.py')
                self.assertTrue(callable(module.main))

    def test_private_input_refuses_links_and_writable_directories(self):
        with EvidenceDirectory.create() as base:
            with base.child('input') as source:
                with source.open_new('log') as stream:
                    stream.write('original\n')
                (base.path / 'link').symlink_to(source.path, target_is_directory=True)
                with self.assertRaises(OSError):
                    with private_input(base.path / 'link'):
                        pass
                source.path.chmod(0o777)
                try:
                    with self.assertRaises(UnsafeEvidencePath):
                        with private_input(source.path):
                            pass
                finally:
                    source.path.chmod(0o700)
                self.assertEqual(source.read_bytes('log'), b'original\n')

    def test_private_input_foreign_uid_is_rejected_by_helper(self):
        with EvidenceDirectory.create() as base:
            with base.child('foreign') as source:
                original = os.stat(source.path)
                source.path.chmod(0o755)
                changed = False
                try:
                    original_tests.EvidenceTests._chown(self, source.path, 65532, 65532)
                    changed = True
                    self.assertEqual(source.path.stat().st_uid, 65532)
                    self.assertNotEqual(os.geteuid(), 65532)
                    self.assertEqual(list(source.path.iterdir()), [])
                    with self.assertRaisesRegex(UnsafeEvidencePath, '^UNTRUSTED_OWNER:'):
                        with private_input(source.path):
                            pass
                    self.assertEqual(list(source.path.iterdir()), [])
                finally:
                    if changed:
                        original_tests.EvidenceTests._chown(self, source.path,
                                                          original.st_uid, original.st_gid)
                    source.path.chmod(0o700)

    def test_export_preserves_bytes_and_hashes(self):
        export = load('export-proof')
        with EvidenceDirectory.create() as base:
            with base.child('input') as source, base.child('output') as dest:
                with source.open_new('result.json') as stream:
                    stream.write('{"observed": true}\n')
                hashes = {}
                export.copy_files(source, dest, hashes)
                self.assertEqual(dest.read_bytes('result.json'), source.read_bytes('result.json'))
                self.assertEqual(hashes, {'result.json': hashlib.sha256(source.read_bytes('result.json')).hexdigest()})

    def test_export_does_not_follow_output_or_input_symlinks(self):
        export = load('export-proof')
        with EvidenceDirectory.create() as base:
            with base.open_new('sentinel') as stream:
                stream.write('KEEP')
            with base.child('input') as source, base.child('output') as dest:
                with source.open_new('result') as stream:
                    stream.write('replacement')
                (dest.path / 'result').symlink_to(base.path / 'sentinel')
                with self.assertRaises(OSError):
                    export.copy_files(source, dest, {})
                self.assertEqual(base.read_bytes('sentinel'), b'KEEP')
            with base.child('input2') as source, base.child('output2') as dest:
                (source.path / 'linked').symlink_to(base.path / 'sentinel')
                with self.assertRaises(OSError):
                    export.copy_files(source, dest, {})
                self.assertEqual(list(dest.path.iterdir()), [])
                self.assertEqual(base.read_bytes('sentinel'), b'KEEP')
