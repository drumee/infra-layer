"""Linux-only private evidence destinations. No reuse, replacement or recursive cleanup."""
import argparse
import contextlib
import datetime
import hashlib
import json
import os
from pathlib import Path
import secrets
import stat
import subprocess
import sys


class UnsafeEvidencePath(RuntimeError):
    """A destination or trusted input failed its filesystem contract."""


def require(condition, message):
    if not condition:
        raise UnsafeEvidencePath(message)


def component(name):
    require(isinstance(name, str) and name not in ('', '.', '..')
            and '/' not in name and '\x00' not in name, 'SIMPLE_NAME_REQUIRED')
    return name


def identity(info):
    return info.st_dev, info.st_ino


def system_uid():
    return os.stat('/', follow_symlinks=False).st_uid


def check_trusted(info, label, shared=False):
    require(info.st_uid in {0, system_uid(), os.geteuid()}, 'UNTRUSTED_OWNER: ' + label)
    if shared:
        require(stat.S_ISDIR(info.st_mode) and info.st_uid in {0, system_uid()}
                and info.st_mode & stat.S_ISVTX, 'UNTRUSTED_SHARED_PARENT: ' + label)
    else:
        require(not info.st_mode & 0o022, 'UNTRUSTED_PERMISSIONS: ' + label)


def open_trusted(path, directory=False):
    """Walk absolute, literal components without links; pin the selected inode.

    Only the system /tmp may be a shared sticky ancestor (or output parent).
    The final source/tool itself may never be that shared directory.
    """
    path = Path(path)
    require(path.is_absolute() and '..' not in path.parts, 'ABSOLUTE_LITERAL_PATH_REQUIRED')
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC)
    try:
        check_trusted(os.fstat(fd), '/')
        current = Path('/')
        for index, name in enumerate(path.parts[1:]):
            current /= name
            last = index == len(path.parts) - 2
            flags = os.O_RDONLY | os.O_CLOEXEC | os.O_NOFOLLOW | os.O_NONBLOCK
            if not last or directory:
                flags |= os.O_DIRECTORY
            next_fd = os.open(name, flags, dir_fd=fd)
            os.close(fd)
            fd = next_fd
            info = os.fstat(fd)
            require(stat.S_ISDIR(info.st_mode) if not last or directory
                    else stat.S_ISREG(info.st_mode), 'UNEXPECTED_INPUT_TYPE: ' + str(current))
            check_trusted(info, str(current), shared=current == Path('/tmp'))
        return fd
    except BaseException:
        os.close(fd)
        raise


def trusted_input(path, directory=False):
    fd = open_trusted(path, directory=directory)
    try:
        info = os.fstat(fd)
        require(not info.st_mode & 0o022, 'SHARED_INPUT_REFUSED: ' + str(path))
    finally:
        os.close(fd)
    return Path(path)


def check_input_tree(path):
    """Validate the TypeScript package whose JS is executed as a Node argument."""
    root = trusted_input(path, directory=True)
    for directory, names, files in os.walk(root, followlinks=False):
        for name in names + files:
            p = Path(directory) / name
            info = os.lstat(p)
            require(not stat.S_ISLNK(info.st_mode), 'INPUT_TREE_LINK: ' + str(p))
            require(stat.S_ISDIR(info.st_mode) or stat.S_ISREG(info.st_mode),
                    'INPUT_TREE_SPECIAL: ' + str(p))
            check_trusted(info, str(p))


class EvidenceDirectory:
    """Owned directory descriptor. Closing deliberately retains evidence."""

    def __init__(self, fd, path):
        self.fd = fd
        self.path = Path(path)
        self._identity = identity(os.fstat(fd))
        self._check()

    def _check(self):
        require(self.fd is not None, 'DIRECTORY_CLOSED')
        info = os.fstat(self.fd)
        require(stat.S_ISDIR(info.st_mode) and info.st_uid == os.geteuid()
                and stat.S_IMODE(info.st_mode) == 0o700
                and identity(info) == self._identity, 'PRIVATE_DIRECTORY_REQUIRED')
        # Detect accidental relocation before passing a path to a child program.
        entry = os.stat(self.path, follow_symlinks=False)
        require(identity(entry) == self._identity and not stat.S_ISLNK(entry.st_mode),
                'DIRECTORY_IDENTITY_CHANGED')

    @classmethod
    def create(cls, parent='/tmp', name=None):
        parent = Path(parent)
        parent_fd = open_trusted(parent, directory=True)
        try:
            # An explicit name is for new exports/tests, never for reuse.
            selected = component(name) if name is not None else 'il511-evidence-' + secrets.token_hex(16)
            os.mkdir(selected, mode=0o700, dir_fd=parent_fd)
            fd = os.open(selected, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC,
                         dir_fd=parent_fd)
            try:
                info = os.fstat(fd)
                require(identity(info) == identity(os.stat(selected, dir_fd=parent_fd,
                                                         follow_symlinks=False)), 'ROOT_IDENTITY_CHANGED')
                return cls(fd, parent / selected)
            except BaseException:
                os.close(fd)
                raise
        finally:
            os.close(parent_fd)

    def child(self, name):
        self._check()
        name = component(name)
        os.mkdir(name, mode=0o700, dir_fd=self.fd)
        fd = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC,
                     dir_fd=self.fd)
        try:
            return EvidenceDirectory(fd, self.path / name)
        except BaseException:
            os.close(fd)
            raise

    def open_new(self, name):
        self._check()
        name = component(name)
        fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW
                     | os.O_NONBLOCK | os.O_CLOEXEC, 0o600, dir_fd=self.fd)
        try:
            info = os.fstat(fd)
            require(stat.S_ISREG(info.st_mode) and info.st_uid == os.geteuid()
                    and info.st_nlink == 1 and stat.S_IMODE(info.st_mode) == 0o600,
                    'PRIVATE_REGULAR_OUTPUT_REQUIRED')
            require(identity(info) == identity(os.stat(name, dir_fd=self.fd,
                                                     follow_symlinks=False)), 'OUTPUT_IDENTITY_CHANGED')
            return os.fdopen(fd, 'w', encoding='utf-8')
        except BaseException:
            os.close(fd)
            raise

    def read_bytes(self, name):
        self._check()
        fd = os.open(component(name), os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK | os.O_CLOEXEC,
                     dir_fd=self.fd)
        try:
            info = os.fstat(fd)
            require(stat.S_ISREG(info.st_mode) and info.st_uid == os.geteuid()
                    and info.st_nlink == 1 and not info.st_mode & 0o022,
                    'OWNED_REGULAR_RESULT_REQUIRED')
            with os.fdopen(fd, 'rb', closefd=False) as stream:
                return stream.read()
        finally:
            os.close(fd)

    def write_json(self, name, value):
        with self.open_new(name) as stream:
            json.dump(value, stream, indent=2)
            stream.write('\n')

    def close(self):
        if self.fd is not None:
            os.close(self.fd)
            self.fd = None

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()



@contextlib.contextmanager
def private_input(path):
    """Read an explicitly selected existing private evidence directory, never reuse it as output."""
    path = Path(path)
    fd = open_trusted(path, directory=True)
    try:
        directory = EvidenceDirectory(fd, path)
    except BaseException:
        os.close(fd)
        raise
    with directory:
        yield directory


def cli(description):
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument('--source', required=True, type=Path, help='Explicit clean, trusted checkout')
    parser.add_argument('--output-parent', type=Path, default=Path('/tmp'),
                        help='Verified parent; creates a unique root and prints its path')
    return parser


def clean_source(root):
    root = trusted_input(root, directory=True)
    source = subprocess.check_output(['/usr/bin/git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
    require(not subprocess.check_output(['/usr/bin/git', 'status', '--porcelain=v1',
                                         '--untracked-files=all'], cwd=root, text=True).strip(),
            'CLEAN_SOURCE_REQUIRED')
    return source


def environment(out, qualification=False):
    # Remove inherited npm configuration: no shared cache or redirected logs.
    env = {k: v for k, v in os.environ.items() if not k.lower().startswith('npm_config_')}
    with out.child('npm-cache') as cache:
        env['npm_config_cache'] = str(cache.path)
    for kind in ('user', 'global'):
        name = 'npm-' + kind + '.npmrc'
        with out.open_new(name):
            pass
        env['npm_config_' + kind + 'config'] = str(out.path / name)
    if qualification:
        for key in ('CHROME_BIN', 'IL5_HOST_NGINX', 'IL5_TSC'):
            require(key in env, 'EXPLICIT_TOOL_REQUIRED: ' + key)
            trusted_input(env[key])
        check_input_tree(Path(env['IL5_TSC']).parent.parent)
        for key in ('IL5_NETWORK_CLIENT', 'IL5_LAN_ADDRESS', 'IL5_APP_IMAGE'):
            require(bool(env.get(key)), 'EXPLICIT_QUALIFICATION_INPUT_REQUIRED: ' + key)
    return env


def provenance(out, root, source, script):
    scripts = {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
               for p in sorted(Path(__file__).parent.glob('*.py'))}
    out.write_json('provenance.json', {
        'source': source,
        'tree': subprocess.check_output(['/usr/bin/git', 'rev-parse', 'HEAD^{tree}'],
                                        cwd=root, text=True).strip(),
        'helper': script, 'helper_sha256': scripts, 'uid': os.geteuid(),
        'started_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'python': sys.version, 'command': sys.argv, 'output': str(out.path),
        'clean_source': True, 'retained_on_close': True,
    })
    print(json.dumps({'output': str(out.path), 'source': source, 'helper': script}), flush=True)


@contextlib.contextmanager
def execution(args, script, qualification=False):
    source = clean_source(args.source)
    with EvidenceDirectory.create(args.output_parent) as out:
        provenance(out, args.source, source, script)
        env = environment(out, qualification=qualification)
        yield args.source, out, source, env
