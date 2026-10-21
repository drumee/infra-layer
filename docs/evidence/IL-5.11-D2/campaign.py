"""Three predeclared Services runs, preserving TAP and scoped cleanup criteria."""
import datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess
import threading
import time
import sys
sys.dont_write_bytecode = True
from secure_evidence import cli, execution

DOCKER = '/usr/bin/docker'


def observe(done, start, project, samples, errors):
    try:
        while not done.is_set():
            sample = {
                'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'elapsed_s': time.monotonic() - start,
                'loadavg': Path('/proc/loadavg').read_text().strip(),
                'memory': {line.split(':')[0]: line.split(':')[1].strip()
                           for line in Path('/proc/meminfo').read_text().splitlines()
                           if line.startswith(('MemAvailable:', 'SwapFree:'))},
                'pressure': {name: (Path('/proc/pressure') / name).read_text().strip()
                             for name in ('cpu', 'io', 'memory')},
            }
            if project[0]:
                ids = subprocess.check_output([
                    DOCKER, 'ps', '-q', '--filter',
                    'label=com.docker.compose.project=' + project[0]], text=True).split()
                if ids:
                    stats = subprocess.run([DOCKER, 'stats', '--no-stream', '--format',
                                            '{{json .}}', *ids], capture_output=True,
                                           text=True, timeout=20)
                    sample['docker_stats_exit'] = stats.returncode
                    sample['docker_stats'] = [json.loads(line) for line in stats.stdout.splitlines()
                                              if line.startswith('{')]
            samples.append(sample)
            done.wait(10)
    except Exception as error:
        errors.append(type(error).__name__ + ': ' + str(error))


def run_one(cwd, out, source, env, index):
    start = time.monotonic()
    date = datetime.datetime.now(datetime.timezone.utc).isoformat()
    log = f'services-{index}.txt'
    samples, errors, project = [], [], [None]
    done = threading.Event()
    with out.open_new(log) as stream:
        thread = threading.Thread(target=observe, args=(done, start, project, samples, errors))
        thread.start()
        try:
            with subprocess.Popen(['/usr/bin/npm', 'run', 'test:services'], cwd=cwd, env=env,
                                  stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                  text=True) as process:
                for line in process.stdout:
                    stream.write(line)
                    stream.flush()
                    match = re.search(r'"project":"(drumee-il2-test-[a-f0-9]+)"', line)
                    if match:
                        project[0] = match.group(1)
                code = process.wait()
        finally:
            done.set()
            thread.join()
    data = out.read_bytes(log)
    text = data.decode()
    scoped = {}
    if project[0]:
        for kind, command in [('containers', ['ps', '-a']), ('networks', ['network', 'ls'])]:
            scoped[kind] = subprocess.check_output([
                DOCKER, *command, '--filter', 'label=com.docker.compose.project=' + project[0],
                '--format', '{{.ID}}'], text=True).split()
    passed = (code == 0 and '# pass 17' in text and '# fail 0' in text and '# skipped 0' in text
              and 'IL2 owned resources cleaned: ' + str(project[0]) in text
              and scoped == {'containers': [], 'networks': []})
    receipt = {'run': index, 'source': source, 'started_utc': date,
               'elapsed_s': time.monotonic() - start, 'exit_code': code,
               'pass': passed, 'project': project[0], 'cleanup_readback': scoped,
               'log_sha256': hashlib.sha256(data).hexdigest(), 'samples': samples}
    if errors:
        receipt['observation_errors'] = errors
    out.write_json(f'services-{index}.json', receipt)
    print(json.dumps({k: v for k, v in receipt.items() if k != 'samples'}), flush=True)
    return receipt


def main():
    args = cli(__doc__).parse_args()
    results = []
    with execution(args, 'campaign.py') as (cwd, out, source, env):
        for index in range(1, 4):
            receipt = run_one(cwd, out, source, env, index)
            results.append(receipt)
            if not receipt['pass']:
                break
        summary = {'source': source, 'planned_runs': 3, 'actual_runs': len(results),
                   'all_pass': len(results) == 3 and all(item['pass'] for item in results),
                   'results': [{k: v for k, v in item.items() if k != 'samples'} for item in results]}
        out.write_json('campaign-summary.json', summary)
        # A failed campaign was already recorded as all_pass=false historically.
        # Return nonzero as well so callers cannot mistake it for successful qualification.
        return 0 if summary['all_pass'] else 1


if __name__ == '__main__':
    sys.exit(main())
