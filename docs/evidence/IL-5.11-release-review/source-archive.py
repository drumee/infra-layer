"""Download and verify the exact GitHub source archive without extracting untrusted members."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
REPOSITORY = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPOSITORY / 'docs/evidence/IL-5.11-D2'))
from secure_evidence import cli, execution, require
import base64
import datetime
import hashlib
import io
import json
import subprocess
import tarfile
import urllib.parse
import urllib.request

MAX_DOWNLOAD = 50 * 1024 * 1024


def git_inventory(root):
    records = subprocess.check_output(['/usr/bin/git', 'ls-tree', '-rz', '--full-tree', 'HEAD'], cwd=root)
    expected = {}
    for record in records.split(b'\0'):
        if not record:
            continue
        header, name = record.split(b'\t', 1)
        mode, kind, blob = header.decode().split()
        require(kind == 'blob' and mode in ('100644', '100755'), 'UNSUPPORTED_SOURCE_GIT_TYPE')
        size = int(subprocess.check_output(['/usr/bin/git', 'cat-file', '-s', blob], cwd=root))
        expected[name.decode()] = {'mode': mode, 'blob': blob, 'size': size}
    return expected


def verify_archive(data, commit, expected):
    require(len(data) <= MAX_DOWNLOAD, 'SOURCE_ARCHIVE_TOO_LARGE')
    archive_root = 'infra-layer-' + commit
    seen = {}
    directories = set()
    # Streaming iteration rejects unexpected sizes before reading member contents.
    with tarfile.open(fileobj=io.BytesIO(data), mode='r|gz', bufsize=1024) as archive:
        for member in archive:
            parts = member.name.split('/')
            require(parts[0] == archive_root and '..' not in parts
                    and not member.name.startswith('/'), 'UNSAFE_SOURCE_ARCHIVE_PATH')
            if member.isdir():
                require(member.size == 0 and member.name not in directories,
                        'DUPLICATE_OR_INVALID_SOURCE_DIRECTORY')
                directories.add(member.name)
                continue
            name = '/'.join(parts[1:])
            require(name in expected and name not in seen, 'UNEXPECTED_OR_DUPLICATE_SOURCE_MEMBER')
            item = expected[name]
            require(member.isfile() and not member.issparse() and member.size == item['size'],
                    'UNSAFE_SOURCE_MEMBER_TYPE_OR_SIZE')
            with archive.extractfile(member) as stream:
                content = stream.read(item['size'] + 1)
            require(len(content) == item['size'], 'SOURCE_MEMBER_SIZE_MISMATCH')
            blob = hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content).hexdigest()
            require(blob == item['blob'], 'SOURCE_GIT_BLOB_MISMATCH')
            seen[name] = hashlib.sha256(content).hexdigest()
    require(set(seen) == set(expected), 'SOURCE_GIT_PATHS_MISSING')
    return seen, archive_root


def download(commit):
    require(len(commit) == 40 and all(c in '0123456789abcdef' for c in commit), 'INVALID_SOURCE_COMMIT')
    url = f'https://github.com/drumee/infra-layer/archive/{commit}.tar.gz'
    request = urllib.request.Request(url, headers={'User-Agent': 'IL-5.11-Release-Review'})
    with urllib.request.urlopen(request, timeout=60) as response:
        final = urllib.parse.urlsplit(response.geturl())
        require(final.scheme == 'https' and final.hostname in ('github.com', 'codeload.github.com'),
                'UNAPPROVED_SOURCE_ARCHIVE_ORIGIN')
        data = response.read(MAX_DOWNLOAD + 1)
        require(len(data) <= MAX_DOWNLOAD, 'SOURCE_ARCHIVE_TOO_LARGE')
        return data, url, response.geturl(), response.status, response.headers.get('ETag')


def store_archive(out, data):
    with out.open_new('infra-layer-source.tar.gz') as stream:
        stream.buffer.write(data)


def main():
    args = cli(__doc__).parse_args()
    with execution(args, 'release-review/source-archive.py') as (root, out, source, env):
        expected = git_inventory(root)
        data, url, final_url, status, etag = download(source)
        seen, archive_root = verify_archive(data, source, expected)
        store_archive(out, data)
        receipt = {
            'date_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'git_commit': source,
            'git_tree': subprocess.check_output(['/usr/bin/git', 'rev-parse', 'HEAD^{tree}'],
                                                cwd=root, text=True).strip(),
            'requested_url': url, 'resolved_url': final_url, 'http_status': status, 'etag': etag,
            'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
            'integrity': 'sha512-' + base64.b64encode(hashlib.sha512(data).digest()).decode(),
            'members_verified_against_all_git_blobs': len(seen), 'all_git_paths_present': True,
            'archive_root': archive_root, 'archive_kind': 'GitHub source archive, distinct from npm package',
        }
        out.write_json('source-archive-receipt.json', receipt)
        print(json.dumps(receipt, indent=2))


if __name__ == '__main__':
    main()
