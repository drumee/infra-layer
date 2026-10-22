"""Validate explicitly selected private qualification evidence against a clean source."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
REPOSITORY = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPOSITORY / 'docs/evidence/IL-5.11-D2'))
from secure_evidence import EvidenceDirectory, private_input, clean_source, require
import argparse
import os
import json
import hashlib
import re
import subprocess
import datetime


def validate(root, qualification, artifact, out):
    source = clean_source(root)
    progress = json.loads(qualification.read_bytes('qualification-progress.json'))
    receipt = json.loads(artifact.read_bytes('artifact-receipt.json'))
    require(progress['source'] == receipt['source'] == source, 'EVIDENCE_SOURCE_MISMATCH')
    require(progress['complete'] and not progress['stopped']
            and all(step['exit_code'] == 0 for step in progress['steps']), 'INCOMPLETE_QUALIFICATION')
    logs = {}
    projects = set()
    secret_matches = []
    for step in progress['steps']:
        data = qualification.read_bytes(step['name'] + '.txt')
        digest = hashlib.sha256(data).hexdigest()
        require(digest == step['log_sha256'], 'LOG_HASH_MISMATCH')
        text = data.decode()
        projects.update(re.findall(r'drumee-il[1235]-(?:test-)?[a-f0-9]{8}', text))
        logs[step['name']] = {'sha256': digest, 'exit_code': step['exit_code'], 'bytes': len(data)}
        if re.search(rb'-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----', data):
            secret_matches.append(step['name'])
        if re.search(rb'(?:npm_[A-Za-z0-9]{30,}|gh[pousr]_[A-Za-z0-9]{30,})', data):
            secret_matches.append(step['name'])
    readback = {}
    for project in sorted(projects):
        readback[project] = {
            kind: subprocess.check_output([
                '/usr/bin/docker', *command, '--filter', 'label=com.docker.compose.project=' + project,
                '--format', '{{.ID}}'], text=True).split()
            for kind, command in [('containers', ['ps', '-a']), ('networks', ['network', 'ls'])]}
    require(not any(value for resources in readback.values() for value in resources.values()),
            'OWNED_RESOURCES_REMAIN')
    require(not secret_matches, 'POTENTIAL_SECRET_IN_LOGS')
    packs = []
    for number in (1, 2):
        with private_input(artifact.path / ('pack-' + str(number))) as pack:
            packs.append(pack.read_bytes('drumee-infra-layer-0.1.0-alpha.3.tgz'))
    require(packs[0] == packs[1] and hashlib.sha256(packs[0]).hexdigest() == receipt['sha256'],
            'ARTIFACT_HASH_MISMATCH')
    out.write_json('validation.json', {
        'source': source, 'date': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'uid': os.geteuid(), 'gid': os.getegid(), 'qualification_complete': progress['complete'],
        'stopped': progress['stopped'], 'all_log_hashes_match': True, 'logs': logs,
        'private_key_or_token_pattern_hits': secret_matches,
        'secret_scan_limit': 'Pattern scan only; no universal absence-of-secret guarantee',
        'owned_cleanup_readback': readback, 'two_packs_identical': True,
        'artifact_sha256_recalculated': hashlib.sha256(packs[0]).hexdigest(),
        'members': receipt['members'],
        'npm_metadata': {'exports': receipt['exports'],
                         'production_dependencies': receipt['production_dependencies']},
        'clean_tree_after': True,
        'output_scope': 'Private helper roots/logs/JSON/cache; unchanged canonical fixtures are separate.',
    })


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--qualification', required=True, type=Path)
    parser.add_argument('--artifact', required=True, type=Path)
    args = parser.parse_args()
    with private_input(args.qualification) as qualification, private_input(args.artifact) as artifact:
        with EvidenceDirectory.create() as out:
            print('EVIDENCE_ROOT=' + str(out.path), flush=True)
            validate(args.source, qualification, artifact, out)


if __name__ == '__main__':
    main()
