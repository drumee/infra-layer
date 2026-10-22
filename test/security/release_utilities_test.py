"""PR16-specific real filesystem, subprocess, ownership and archive regressions."""
import concurrent.futures
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tarfile
import unittest

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'docs/evidence/IL-5.11-D2'))
from secure_evidence import EvidenceDirectory, UnsafeEvidencePath
import evidence_helpers_test as original_tests


def load(name):
    path = ROOT / 'docs/evidence/IL-5.11-release-review' / (name + '.py')
    spec = importlib.util.spec_from_file_location('release_' + name.replace('-', '_'), path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


VERIFY = load('verify')
ARCHIVE = load('source-archive')


class ReleaseUtilityTests(unittest.TestCase):
    def setUp(self):
        self.base = EvidenceDirectory.create()
        with self.base.open_new('sentinel') as stream:
            stream.write('KEEP')
        self.repo = self.base.child('repository')
        with self.repo.open_new('README.md') as stream:
            stream.write('fixture\n')
        subprocess.run(['/usr/bin/git', 'init', '-q', str(self.repo.path)], check=True)
        subprocess.run(['/usr/bin/git', 'add', 'README.md'], cwd=self.repo.path, check=True)
        subprocess.run(['/usr/bin/git', '-c', 'user.name=Qualification fixture',
                        '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false',
                        'commit', '-qm', 'Owned fixture'], cwd=self.repo.path, check=True)
        self.commit = subprocess.check_output(['/usr/bin/git', 'rev-parse', 'HEAD'],
                                              cwd=self.repo.path, text=True).strip()

    def tearDown(self):
        self.assertEqual(self.base.read_bytes('sentinel'), b'KEEP')
        self.assertEqual(subprocess.check_output(['/usr/bin/git', 'status', '--porcelain=v1'],
                                                cwd=self.repo.path, text=True), '')
        self.repo.close()
        self.base.close()  # Evidence roots are deliberately retained; no foreign recursive cleanup.

    def invoke(self, module, parent, source=None):
        command = [sys.executable, '-B', str(Path(module.__file__)),
                   '--source', str(source or self.repo.path), '--output-parent', str(parent)]
        result = subprocess.run(command, capture_output=True, text=True, timeout=20)
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn('"output":', result.stdout)
        return result

    def test_root_symlink_and_existing_output_parents(self):
        target = self.base.child('target')
        try:
            (self.base.path / 'linked').symlink_to(target.path, target_is_directory=True)
            for module in (VERIFY, ARCHIVE):
                result = self.invoke(module, self.base.path / 'linked')
                self.assertTrue('Not a directory' in result.stderr or 'symbolic link' in result.stderr)
            self.assertEqual(list(target.path.iterdir()), [])
            # Explicit creation refuses even a correctly owned preexisting root.
            with self.assertRaises(FileExistsError):
                EvidenceDirectory.create(self.base.path, 'target')
        finally:
            target.close()

    def test_output_file_symlinks_are_refused_by_both_actual_writers(self):
        with self.base.child('verify-output') as out:
            (out.path / 'probe.txt').symlink_to(self.base.path / 'sentinel')
            with self.assertRaises(FileExistsError):
                VERIFY.run_steps(self.repo.path, out, dict(os.environ),
                                 [('probe', [sys.executable, '-c', 'print("real")'])])
        with self.base.child('archive-output') as out:
            (out.path / 'infra-layer-source.tar.gz').symlink_to(self.base.path / 'sentinel')
            with self.assertRaises(FileExistsError):
                ARCHIVE.store_archive(out, b'verified-fixture')

    def test_foreign_uid_rejected_for_output_and_checkout(self):
        foreign = self.base.child('foreign')
        original = os.stat(foreign.path)
        changed = False
        foreign.path.chmod(0o755)
        try:
            original_tests.EvidenceTests._chown(self, foreign.path, 65532, 65532)
            changed = True
            self.assertEqual(foreign.path.stat().st_uid, 65532)
            self.assertNotEqual(os.geteuid(), 65532)
            self.assertEqual(list(foreign.path.iterdir()), [])
            for module in (VERIFY, ARCHIVE):
                self.assertIn('UNTRUSTED_OWNER:', self.invoke(module, foreign.path).stderr)
                self.assertIn('UNTRUSTED_OWNER:', self.invoke(module, self.base.path,
                                                             source=foreign.path).stderr)
            self.assertEqual(list(foreign.path.iterdir()), [])
        finally:
            if changed:
                original_tests.EvidenceTests._chown(self, foreign.path,
                                                    original.st_uid, original.st_gid)
            foreign.path.chmod(0o700)
            foreign.close()

    def test_excessive_permissions_are_rejected_before_output(self):
        with self.base.child('writable') as parent:
            parent.path.chmod(0o777)
            try:
                for module in (VERIFY, ARCHIVE):
                    self.assertIn('UNTRUSTED_PERMISSIONS:', self.invoke(module, parent.path).stderr)
                self.assertEqual(list(parent.path.iterdir()), [])
            finally:
                parent.path.chmod(0o700)

    def test_special_output_files_are_refused_without_blocking(self):
        with self.base.child('special-verify') as out:
            os.mkfifo(out.path / 'probe.txt', 0o600)
            with self.assertRaises(FileExistsError):
                VERIFY.run_steps(self.repo.path, out, dict(os.environ),
                                 [('probe', [sys.executable, '-c', 'print("real")'])])
        with self.base.child('special-archive') as out:
            os.mkfifo(out.path / 'infra-layer-source.tar.gz', 0o600)
            with self.assertRaises(FileExistsError):
                ARCHIVE.store_archive(out, b'verified-fixture')

    def test_concurrent_exclusive_creation_and_retained_cleanup_boundary(self):
        def create(index):
            try:
                with EvidenceDirectory.create(self.base.path, 'one-root') as out:
                    out.write_json('result.json', {'run': index})
                return True
            except FileExistsError:
                return False
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(create, range(16)))
        self.assertEqual(sum(results), 1)
        self.assertTrue((self.base.path / 'one-root/result.json').is_file())
        self.assertEqual(self.base.read_bytes('sentinel'), b'KEEP')

    def test_untrusted_checkout_links_are_rejected(self):
        (self.base.path / 'source-link').symlink_to(self.repo.path, target_is_directory=True)
        for module in (VERIFY, ARCHIVE):
            result = self.invoke(module, self.base.path, source=self.base.path / 'source-link')
            self.assertTrue('Not a directory' in result.stderr or 'symbolic link' in result.stderr)

    def make_archive(self, entries):
        output = io.BytesIO()
        with tarfile.open(fileobj=output, mode='w:gz') as archive:
            for name, content, kind, link in entries:
                member = tarfile.TarInfo(name)
                member.type = kind
                member.linkname = link
                member.size = len(content) if kind == tarfile.REGTYPE else 0
                archive.addfile(member, io.BytesIO(content) if kind == tarfile.REGTYPE else None)
        return output.getvalue()

    def test_source_archive_validates_real_git_objects_and_rejects_invalid_members(self):
        expected = ARCHIVE.git_inventory(self.repo.path)
        prefix = 'infra-layer-' + self.commit + '/'
        valid = [(prefix + 'README.md', b'fixture\n', tarfile.REGTYPE, '')]
        seen, root = ARCHIVE.verify_archive(self.make_archive(valid), self.commit, expected)
        self.assertEqual(seen, {'README.md': hashlib.sha256(b'fixture\n').hexdigest()})
        self.assertEqual(root, prefix[:-1])
        invalid = [
            [(prefix + '../sentinel', b'changed', tarfile.REGTYPE, '')],
            [('/absolute', b'changed', tarfile.REGTYPE, '')],
            [(prefix + 'unexpected', b'changed', tarfile.REGTYPE, '')],
            valid + valid,
            [(prefix + 'README.md', b'', tarfile.SYMTYPE, '../../sentinel')],
            [(prefix + 'README.md', b'', tarfile.FIFOTYPE, '')],
            [(prefix + 'README.md', b'changed\n', tarfile.REGTYPE, '')],
            [],
        ]
        for entries in invalid:
            with self.subTest(entries=entries):
                with self.assertRaises(UnsafeEvidencePath):
                    ARCHIVE.verify_archive(self.make_archive(entries), self.commit, expected)

    def test_verifier_records_real_command_results_and_original_log_hashes(self):
        with self.base.child('functional-output') as out:
            results, code = VERIFY.run_steps(self.repo.path, out, dict(os.environ), [
                ('probe', [sys.executable, '-c', 'print("functional-probe")'])])
            self.assertEqual(code, 0)
            self.assertEqual(results[0]['sha256'], hashlib.sha256(out.read_bytes('probe.txt')).hexdigest())
            self.assertEqual(out.read_bytes('probe.txt'), b'functional-probe\n')
            self.assertEqual(json.loads(out.read_bytes('steps.json')), results)
            self.assertEqual(json.loads(out.read_bytes('steps-01.json')), results)


if __name__ == '__main__':
    unittest.main(verbosity=2)
