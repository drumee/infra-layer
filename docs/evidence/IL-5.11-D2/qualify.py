"""Run the eleven canonical commands in their historical order; stop at first failure."""
import datetime
import hashlib
import json
import subprocess
import time
import sys
sys.dont_write_bytecode = True
from secure_evidence import cli, execution

STEPS = [
    ('unit', ['/usr/bin/npm', 'test']),
    ('contracts', ['/usr/bin/npm', 'run', 'test:contracts']),
    ('gateway', ['/usr/bin/npm', 'run', 'test:gateway']),
    ('services', ['/usr/bin/npm', 'run', 'test:services']),
    ('lifecycle', ['/usr/bin/npm', 'run', 'test:lifecycle']),
    ('application', ['/usr/bin/npm', 'run', 'test:application']),
    ('package', ['/usr/bin/npm', 'run', 'test:package']),
    ('lint', ['/usr/bin/npm', 'run', 'lint']),
    ('audit-production', ['/usr/bin/npm', 'audit', '--omit=dev', '--json']),
    ('audit-development', ['/usr/bin/npm', 'audit', '--include=dev', '--json']),
    ('consumer', ['/usr/bin/node', 'test/application/package-consumer.js']),
]


def main():
    args = cli(__doc__).parse_args()
    receipts = []
    with execution(args, 'qualify.py', qualification=True) as (cwd, out, source, env):
        for index, (name, command) in enumerate(STEPS, 1):
            print('BEGIN ' + name, flush=True)
            start = time.monotonic()
            date = datetime.datetime.now(datetime.timezone.utc).isoformat()
            log = name + '.txt'
            with out.open_new(log) as stream:
                result = subprocess.run(command, cwd=cwd, env=env, stdout=stream,
                                        stderr=subprocess.STDOUT, timeout=2200)
            receipt = {'name': name, 'command': command, 'source': source,
                       'started_utc': date, 'elapsed_s': time.monotonic() - start,
                       'exit_code': result.returncode,
                       'log_sha256': hashlib.sha256(out.read_bytes(log)).hexdigest()}
            receipts.append(receipt)
            progress = {'source': source, 'steps': receipts, 'complete': index == len(STEPS),
                        'stopped': result.returncode != 0}
            out.write_json(f'qualification-progress-{index:02d}.json', progress)
            print(json.dumps(receipt), flush=True)
            if result.returncode or index == len(STEPS):
                out.write_json('qualification-progress.json', progress)
            if result.returncode:
                return result.returncode
    return 0


if __name__ == '__main__':
    sys.exit(main())
