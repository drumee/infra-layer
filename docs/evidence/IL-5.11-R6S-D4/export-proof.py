"""Export explicitly selected private evidence to a new repository-local directory."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
REPOSITORY = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPOSITORY / 'docs/evidence/IL-5.11-D2'))
from secure_evidence import EvidenceDirectory, private_input, component
import argparse
import hashlib
import datetime


def copy_files(source, destination, hashes, prefix=''):
    for path in sorted(source.path.iterdir()):
        if path.name == 'npm-cache' or path.suffix == '.tgz':
            continue
        if path.is_dir():
            if path.name not in ('pack-1', 'pack-2'):
                continue
            with private_input(path) as child, destination.child(path.name) as newchild:
                copy_files(child, newchild, hashes, prefix + path.name + '/')
            continue
        data = source.read_bytes(path.name)
        with destination.open_new(path.name) as stream:
            stream.write(data.decode('utf-8'))
        hashes[prefix + path.name] = hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('name', type=component)
    args = parser.parse_args()
    parent = REPOSITORY / 'docs/evidence/IL-5.11-R6S-D4'
    with private_input(args.source) as source, EvidenceDirectory.create(parent, args.name) as out:
        hashes = {}
        copy_files(source, out, hashes)
        out.write_json('export.json', {
            'source_private_root': str(args.source),
            'recorded_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'unchanged_bytes': True, 'files_sha256': hashes,
            'omitted': ['npm-cache', '*.tgz'],
            'exporter_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        })
        print(out.path)


if __name__ == '__main__':
    main()
