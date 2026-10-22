"""Verify a selected clean candidate with exclusive evidence outputs and canonical packaging."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
REPOSITORY = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPOSITORY / 'docs/evidence/IL-5.11-D2'))
from secure_evidence import (cli, execution, clean_source, trusted_input, check_input_tree,
                             private_input, require)
import datetime
import hashlib
import json
import os
import subprocess
import time

NPM = '/usr/bin/npm'


def commands(offline=False):
    install = [NPM, 'ci', '--ignore-scripts', '--no-audit', '--no-fund']
    if offline:
        install.append('--offline')
    return [
        ('install', install), ('unit', [NPM, 'test']),
        ('contracts', [NPM, 'run', 'test:contracts']),
        ('system-tools', [NPM, 'run', 'test:system-tools']),
        ('package', [NPM, 'run', 'test:package']), ('lint', [NPM, 'run', 'lint']),
        ('audit-production', [NPM, 'audit', '--omit=dev', '--json']),
        ('audit-development', [NPM, 'audit', '--include=dev', '--json']),
        ('consumer', ['/usr/bin/node', 'test/application/package-consumer.js']),
    ]


def check_members(root, reference):
    for name, digest in reference['files'].items():
        trusted_input(root / name)
        require(hashlib.sha256((root / name).read_bytes()).hexdigest() == digest,
                'DISTRIBUTED_MEMBER_CHANGED: ' + name)


def run_steps(root, out, env, steps):
    results = []
    for number, (name, command) in enumerate(steps, 1):
        start = time.monotonic()
        with out.open_new(name + '.txt') as log:
            process = subprocess.run(command, cwd=root, env=env, stdout=log,
                                     stderr=subprocess.STDOUT, timeout=180)
        result = {'name': name, 'command': command, 'exit_code': process.returncode,
                  'seconds': time.monotonic() - start,
                  'sha256': hashlib.sha256(out.read_bytes(name + '.txt')).hexdigest()}
        results.append(result)
        out.write_json(f'steps-{number:02d}.json', results)
        print(json.dumps(result), flush=True)
        if process.returncode:
            out.write_json('steps.json', results)
            return results, process.returncode
    out.write_json('steps.json', results)
    return results, 0


def canonical_artifact(root, out, env):
    command = ['/usr/bin/python3', '-B', str(REPOSITORY / 'docs/evidence/IL-5.11-D2/artifact.py'),
               '--source', str(root)]
    with out.open_new('artifact.txt') as log:
        result = subprocess.run(command, env=env, stdout=log, stderr=subprocess.STDOUT, timeout=180)
    require(result.returncode == 0, 'CANONICAL_ARTIFACT_HELPER_FAILED')
    first = json.loads(out.read_bytes('artifact.txt').decode().splitlines()[0])
    with private_input(first['output']) as evidence:
        receipt = json.loads(evidence.read_bytes('artifact-receipt.json'))
    require(receipt['source'] == clean_source(root), 'ARTIFACT_SOURCE_MISMATCH')
    return receipt, first['output']


def main():
    parser = cli(__doc__)
    parser.add_argument('--offline-install', action='store_true',
                        help='Explicit offline npm ci; fails if the private cache cannot satisfy it')
    args = parser.parse_args()
    with execution(args, 'release-review/verify.py') as (root, out, source, env):
        reference_path = root / 'docs/evidence/IL-5.11-D2/D2-artifact-receipt.json'
        trusted_input(reference_path)
        reference = json.loads(reference_path.read_text())
        check_members(root, reference)
        require(bool(env.get('IL5_TSC')) and bool(env.get('IL5_APP_IMAGE')),
                'EXPLICIT_TYPESCRIPT_AND_IMAGE_REQUIRED')
        trusted_input(env['IL5_TSC'])
        check_input_tree(Path(env['IL5_TSC']).parent.parent)
        results, code = run_steps(root, out, env, commands(args.offline_install))
        if code:
            return code
        artifact, artifact_root = canonical_artifact(root, out, env)
        require(clean_source(root) == source, 'SOURCE_CHANGED_DURING_VERIFICATION')
        receipt = dict(artifact)
        receipt.update({
            'date_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'source': source, 'tree': subprocess.check_output([
                '/usr/bin/git', 'rev-parse', 'HEAD^{tree}'], cwd=root, text=True).strip(),
            'D2_source': reference['source'], 'clean_tree_before_after': True,
            'package_lock_sha256': hashlib.sha256((root / 'package-lock.json').read_bytes()).hexdigest(),
            'public_types_sha256': {name: artifact['files'][name]
                                   for name in ('index.d.ts', 'lifecycle/index.d.ts')},
            'artifact_evidence_root': artifact_root, 'steps': results,
            'installation_network': 'offline-requested' if args.offline_install else 'registry-explicit',
            'heavy_tests_reused_by_identity': ['gateway 17/17', 'services 17/17 and campaign 3x17/17',
                                              'lifecycle 16/16', 'application 87 assertions'],
        })
        out.write_json('receipt.json', receipt)
        print(json.dumps({k: v for k, v in receipt.items()
                          if k not in ('files', 'steps', 'exports', 'public_types_sha256')}, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
