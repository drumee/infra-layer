"""Capture a selected command from a clean checkout using private evidence outputs."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
REPOSITORY = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPOSITORY / 'docs/evidence/IL-5.11-D2'))
from secure_evidence import EvidenceDirectory, clean_source, component
import argparse
import subprocess
import os
import json
import datetime
import hashlib
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('name', type=component)
    parser.add_argument('source', type=Path)
    parser.add_argument('command', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if not args.command:
        parser.error('an explicit command is required')
    source = clean_source(args.source)
    with EvidenceDirectory.create() as out:
        print('EVIDENCE_ROOT=' + str(out.path), flush=True)
        started = datetime.datetime.now(datetime.timezone.utc).isoformat()
        start = time.monotonic()
        with out.open_new(args.name + '.txt') as log:
            result = subprocess.run(args.command, cwd=args.source, stdout=log,
                                    stderr=subprocess.STDOUT, timeout=2400)
        raw = out.read_bytes(args.name + '.txt')
        out.write_json(args.name + '.json', {
            'name': args.name, 'source': source,
            'clean_tree': not subprocess.check_output([
                '/usr/bin/git', 'status', '--porcelain=v1', '--untracked-files=all'],
                cwd=args.source, text=True).strip(),
            'command': args.command, 'cwd': str(args.source), 'date': started,
            'elapsed_s': time.monotonic() - start, 'exit_code': result.returncode,
            'uid': os.geteuid(), 'gid': os.getegid(), 'groups': os.getgroups(),
            'log_sha256': hashlib.sha256(raw).hexdigest(),
            'runner_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'output': str(out.path),
        })
        print(raw.decode(errors='replace')[-14000:], flush=True)
        print('EXIT=' + str(result.returncode), flush=True)
        return result.returncode


if __name__ == '__main__':
    sys.exit(main())
