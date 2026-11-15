#!/usr/bin/env python3
"""Persistent private qualification artifacts and conservative Linux retention."""
import argparse
import contextlib
import datetime as dt
import fcntl
import hashlib
import json
import os
import pathlib
import re
import socket
import stat
import subprocess
import sys
import tarfile
import uuid

CONTRACT = 'drumee.artifact-run/1'
POLICY = 'drumee.artifact-retention/1'
MANIFEST = 'artifact-manifest.json'
CONTROL = {MANIFEST, '.lease', 'checksums.json', 'events.jsonl'}
STATES = {'active', 'resumable', 'completed'}
EPHEMERAL = {'tmpfs', 'ramfs', 'overlay', 'aufs', 'squashfs'}


def now():
    return dt.datetime.now(dt.timezone.utc)


def stamp():
    return now().isoformat()


def identifier(value):
    if not isinstance(value, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]{0,127}', value):
        raise ValueError('ARTIFACT_IDENTIFIER_INVALID')
    return value


def canonical(project, lot, execution):
    return pathlib.Path.home() / 'artifacts' / identifier(project) / identifier(lot) / identifier(execution)


def unique(pairs):
    out = {}
    for key, value in pairs:
        if key in out:
            raise ValueError('ARTIFACT_JSON_DUPLICATE_KEY')
        out[key] = value
    return out


def decode(data):
    try:
        return json.loads(data, object_pairs_hook=unique,
                          parse_constant=lambda value: (_ for _ in ()).throw(ValueError('ARTIFACT_JSON_NONFINITE')))
    except RecursionError:
        raise ValueError('ARTIFACT_JSON_NESTING_INVALID') from None


def mount_id(fd):
    for line in pathlib.Path('/proc/self/fdinfo', str(fd)).read_text().splitlines():
        if line.startswith('mnt_id:'):
            return int(line.split(':', 1)[1])
    raise ValueError('ARTIFACT_MOUNT_ID_UNAVAILABLE')


def secure_stat(value, directory=False):
    if value.st_uid != os.getuid() or stat.S_IMODE(value.st_mode) != (0o700 if directory else 0o600):
        raise ValueError('ARTIFACT_OWNER_OR_MODE_UNSAFE')
    if not directory and (not stat.S_ISREG(value.st_mode) or value.st_nlink != 1):
        raise ValueError('ARTIFACT_FILE_UNSAFE')


def directory_at(parent, name, expected_mount=None, create=False):
    if create:
        try:
            os.mkdir(name, 0o700, dir_fd=parent)
            os.fsync(parent)
        except FileExistsError:
            pass
    fd = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=parent)
    try:
        secure_stat(os.fstat(fd), True)
        if expected_mount is not None and mount_id(fd) != expected_mount:
            raise ValueError('ARTIFACT_MOUNT_BOUNDARY')
        return fd
    except BaseException:
        os.close(fd)
        raise


def read_at(fd, name):
    file = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
    try:
        secure_stat(os.fstat(file))
        if mount_id(file) != mount_id(fd):
            raise ValueError('ARTIFACT_MOUNT_BOUNDARY')
        with os.fdopen(file, 'rb', closefd=False) as stream:
            data = stream.read(1024 * 1024 + 1)
        if len(data) > 1024 * 1024:
            raise ValueError('ARTIFACT_CONTROL_TOO_LARGE')
        return decode(data)
    finally:
        os.close(file)


def atomic_at(fd, name, value):
    temporary = '.atomic-' + uuid.uuid4().hex
    file = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=fd)
    try:
        with os.fdopen(file, 'w') as stream:
            json.dump(value, stream, indent=2, allow_nan=False)
            stream.write('\n'); stream.flush(); os.fsync(stream.fileno())
        os.replace(temporary, name, src_dir_fd=fd, dst_dir_fd=fd)
        os.fsync(fd)
    finally:
        try:
            os.unlink(temporary, dir_fd=fd)
        except FileNotFoundError:
            pass


def append_at(fd, name, event):
    file = os.open(name, os.O_WRONLY | os.O_APPEND | os.O_CREAT | os.O_NOFOLLOW, 0o600, dir_fd=fd)
    try:
        secure_stat(os.fstat(file))
        if mount_id(file) != mount_id(fd):
            raise ValueError('ARTIFACT_MOUNT_BOUNDARY')
        data = (json.dumps(event, sort_keys=True, allow_nan=False) + '\n').encode()
        with os.fdopen(file, 'ab', closefd=False) as stream:
            stream.write(data); stream.flush(); os.fsync(stream.fileno())
        os.fsync(fd)
    finally:
        os.close(file)


@contextlib.contextmanager
def root_store(create=False, persistent=False):
    home = pathlib.Path.home()
    # Do not let an alias of /tmp (or a symlinked HOME) supply the durable root.
    if home.resolve() != home or any(home == p or p in home.parents for p in [pathlib.Path('/tmp'), pathlib.Path('/var/tmp')]):
        raise ValueError('ARTIFACT_HOME_UNSAFE')
    for path in [home, *home.parents]:
        if path.is_symlink():
            raise ValueError('ARTIFACT_HOME_UNSAFE')
    parent = os.open(home, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        fd = directory_at(parent, 'artifacts', create=create)
    finally:
        os.close(parent)
    try:
        if persistent:
            mount = json.loads(subprocess.check_output(
                ['findmnt', '-J', '-T', str(home / 'artifacts'), '-o', 'TARGET,FSTYPE,SOURCE,UUID,OPTIONS'], text=True))['filesystems'][0]
            if mount['fstype'] in EPHEMERAL or 'ro' in mount['options'].split(','):
                raise ValueError('ARTIFACT_STORAGE_NOT_PERSISTENT_WRITABLE')
            probe = '.probe-' + uuid.uuid4().hex
            atomic_at(fd, probe, {'probe': stamp()})
            os.unlink(probe, dir_fd=fd); os.fsync(fd)
        else:
            mount = None
        yield fd, mount
    finally:
        os.close(fd)


@contextlib.contextmanager
def global_lock(fd):
    file = os.open('.store.lock', os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600, dir_fd=fd)
    try:
        secure_stat(os.fstat(file))
        if mount_id(file) != mount_id(fd):
            raise ValueError('ARTIFACT_MOUNT_BOUNDARY')
        fcntl.flock(file, fcntl.LOCK_EX)
        yield
    finally:
        os.close(file)


@contextlib.contextmanager
def run_directory(root, project, lot, execution, create=False):
    opened = []
    try:
        parent = root
        for name in [project, lot, execution]:
            parent = directory_at(parent, identifier(name), mount_id(root), create)
            opened.append(parent)
        yield parent, opened[-2]
    finally:
        for fd in reversed(opened):
            os.close(fd)


@contextlib.contextmanager
def lease(fd, inherit=True):
    file = os.open('.lease', os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600, dir_fd=fd)
    try:
        secure_stat(os.fstat(file))
        if mount_id(file) != mount_id(fd):
            raise ValueError('ARTIFACT_MOUNT_BOUNDARY')
        own_path = os.readlink('/proc/self/fd/' + str(fd))
        inherited = (os.environ.get('DRUMEE_ARTIFACT_LEASE_FD')
                     if inherit and os.environ.get('DRUMEE_ARTIFACT_RUN') == own_path else None)
        if inherited is not None:
            held = int(inherited)
            a, b = os.fstat(held), os.fstat(file)
            if (a.st_dev, a.st_ino) != (b.st_dev, b.st_ino) or mount_id(held) != mount_id(fd):
                raise ValueError('ARTIFACT_INHERITED_LEASE_INVALID')
            fcntl.flock(held, fcntl.LOCK_EX | fcntl.LOCK_NB)
        else:
            try:
                fcntl.flock(file, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                raise ValueError('ARTIFACT_RUN_BUSY') from None
        yield held if inherited is not None else file
    finally:
        os.close(file)


def timestamp(value):
    result = dt.datetime.fromisoformat(value)
    if result.tzinfo is None:
        raise ValueError('ARTIFACT_TIME_INVALID')
    return result


def days(value):
    if type(value) is not int or not 1 <= value <= 36500:
        raise ValueError('ARTIFACT_RETENTION_INVALID')
    return value


def validate_manifest(m, project, lot, execution):
    if (not isinstance(m, dict) or m.get('contract') != CONTRACT or m.get('project') != project or m.get('lot') != lot
            or m.get('execution') != execution or m.get('state') not in STATES):
        raise ValueError('ARTIFACT_MANIFEST_INVALID')
    for key in ['pinned', 'qualification_required', 'backup_required']:
        if type(m.get(key)) is not bool:
            raise ValueError('ARTIFACT_PROTECTION_INVALID')
    created = timestamp(m['created_at'])
    if created > now():
        raise ValueError('ARTIFACT_TIME_INVALID')
    if m.get('retention_days') is not None:
        days(m['retention_days'])
    if m['state'] == 'completed':
        ended = timestamp(m['completed_at'])
        if ended < created or ended > now():
            raise ValueError('ARTIFACT_TIME_INVALID')
    return m


def policy_at(fd):
    try:
        value = read_at(fd, '.retention.json')
    except FileNotFoundError:
        return {'contract': POLICY, 'default_days': 90, 'projects': {}}
    if not isinstance(value, dict) or value.get('contract') != POLICY or not isinstance(value.get('projects'), dict):
        raise ValueError('ARTIFACT_RETENTION_INVALID')
    days(value['default_days'])
    for project, rule in value['projects'].items():
        identifier(project)
        if not isinstance(rule, dict) or not isinstance(rule.get('lots', {}), dict):
            raise ValueError('ARTIFACT_RETENTION_INVALID')
        if rule.get('days') is not None:
            days(rule['days'])
        for lot, count in rule.get('lots', {}).items():
            identifier(lot); days(count)
    return value


def retention(m, policy):
    project = policy['projects'].get(m['project'], {})
    return days(m.get('retention_days') or project.get('lots', {}).get(m['lot'])
                or project.get('days') or policy['default_days'])


def eligibility(m, policy):
    if m['state'] != 'completed':
        return False, 'active or resumable'
    if m['pinned']:
        return False, 'pinned'
    if m['qualification_required'] or m['backup_required']:
        return False, 'qualification evidence or backup still required'
    if (now() - timestamp(m['completed_at'])).total_seconds() <= retention(m, policy) * 86400:
        return False, 'retention not exceeded'
    return True, 'completed; protections released; retention exceeded'


def walk(fd, callback, prefix='', skip_root=()):
    """FD-anchored traversal: mount IDs also reject same-device bind mounts."""
    for entry in sorted(os.scandir(fd), key=lambda e: e.name):
        if not prefix and entry.name in skip_root:
            continue
        info = entry.stat(follow_symlinks=False)
        if stat.S_ISLNK(info.st_mode):
            raise ValueError('ARTIFACT_SYMLINK_REQUIRES_MANUAL_REVIEW')
        if stat.S_ISDIR(info.st_mode):
            child = directory_at(fd, entry.name, mount_id(fd))
            try:
                callback(prefix + entry.name, info, None)
                walk(child, callback, prefix + entry.name + '/')
            finally:
                os.close(child)
        elif stat.S_ISREG(info.st_mode):
            file = os.open(entry.name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
            try:
                actual = os.fstat(file); secure_stat(actual)
                if mount_id(file) != mount_id(fd) or (info.st_dev, info.st_ino) != (actual.st_dev, actual.st_ino):
                    raise ValueError('ARTIFACT_IDENTITY_OR_MOUNT_CHANGED')
                callback(prefix + entry.name, actual, file)
            finally:
                os.close(file)
        else:
            raise ValueError('ARTIFACT_SPECIAL_FILE_REQUIRES_MANUAL_REVIEW')


def sizes(fd):
    totals = {'size_bytes': 0, 'allocated_bytes': 0}
    def add(name, info, file):
        totals['size_bytes'] += info.st_size
        totals['allocated_bytes'] += info.st_blocks * 512
    walk(fd, add)
    return totals


def checkpoint(fd, m, resume=None):
    inventory = {}
    def add(name, info, file):
        if file is not None and name not in CONTROL and not name.startswith('.atomic-'):
            digest = hashlib.sha256()
            with os.fdopen(os.dup(file), 'rb') as stream:
                for block in iter(lambda: stream.read(1024 * 1024), b''):
                    digest.update(block)
            inventory[name] = {'sha256': digest.hexdigest(), 'bytes': info.st_size}
    skipped = ['work'] if m['backup_required'] else []
    walk(fd, add, skip_root=skipped)
    value = {'contract': 'drumee.artifact-checksums/1', 'at': stamp(), 'files': inventory,
             'excluded': skipped, 'exclusion_reason': 'live runtime; backup protection retained' if skipped else None}
    atomic_at(fd, 'checksums.json', value)
    if resume is not None:
        m['resume'] = resume
    m['updated_at'] = stamp()
    m['checksums_sha256'] = hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()
    atomic_at(fd, MANIFEST, m)
    append_at(fd, 'events.jsonl', {'at': stamp(), 'state': m['state'], 'resume': m.get('resume'), 'files': len(inventory)})
    return value


def initialize(project, lot, execution, retention_days=None):
    path = canonical(project, lot, execution)
    with root_store(True, True) as (root, mount), global_lock(root):
        policy_at(root)
        with run_directory(root, project, lot, execution, True) as (fd, _):
            if os.listdir(fd):
                raise ValueError('ARTIFACT_RUN_EXISTS')
            m = {'contract': CONTRACT, 'project': project, 'lot': lot, 'execution': execution,
                 'host': socket.gethostname(), 'created_at': stamp(), 'updated_at': stamp(),
                 'state': 'active', 'completed_at': None, 'pinned': False,
                 'qualification_required': True, 'backup_required': True,
                 'retention_days': days(retention_days) if retention_days is not None else None,
                 'storage': mount, 'resume': {'next': 'not started'}}
            with lease(fd):
                atomic_at(fd, MANIFEST, m)
                checkpoint(fd, m)
    return path


def remove_contents(fd, released):
    for entry in sorted(os.scandir(fd), key=lambda e: (e.name in {MANIFEST, '.lease'}, e.name)):
        info = entry.stat(follow_symlinks=False)
        if stat.S_ISDIR(info.st_mode):
            child = directory_at(fd, entry.name, mount_id(fd))
            try:
                remove_contents(child, released)
                current = os.stat(entry.name, dir_fd=fd, follow_symlinks=False)
                if (current.st_dev, current.st_ino) != (info.st_dev, info.st_ino):
                    raise ValueError('ARTIFACT_IDENTITY_CHANGED')
                os.rmdir(entry.name, dir_fd=fd)
            finally:
                os.close(child)
        elif stat.S_ISREG(info.st_mode):
            file = os.open(entry.name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
            try:
                actual = os.fstat(file); secure_stat(actual)
                if mount_id(file) != mount_id(fd) or (actual.st_dev, actual.st_ino) != (info.st_dev, info.st_ino):
                    raise ValueError('ARTIFACT_IDENTITY_OR_MOUNT_CHANGED')
                current = os.stat(entry.name, dir_fd=fd, follow_symlinks=False)
                if (current.st_dev, current.st_ino) != (actual.st_dev, actual.st_ino):
                    raise ValueError('ARTIFACT_IDENTITY_CHANGED')
                os.unlink(entry.name, dir_fd=fd)
                released['allocated_bytes'] += actual.st_blocks * 512
                released['size_bytes'] += actual.st_size
            finally:
                os.close(file)
        else:
            raise ValueError('ARTIFACT_UNSAFE_TREE_CHANGED')
    os.fsync(fd)


def cleanup(apply=False, project=None, lot=None, execution=None):
    rows = []
    try:
        store = root_store(persistent=True)
        with store as (root, _), global_lock(root):
            policy = policy_at(root)
            for p in sorted(os.listdir(root)):
                if p.startswith('.') or (project and p != project):
                    continue
                try:
                    pfd = directory_at(root, identifier(p), mount_id(root))
                except (ValueError, OSError):
                    rows.append({'path': str(pathlib.Path.home() / 'artifacts' / p), 'eligible': False, 'age_days': None, 'size_bytes': None, 'action': 'preserved', 'reason': 'unsafe project; manual review'}); continue
                try:
                    for l in sorted(os.listdir(pfd)):
                        if lot and l != lot:
                            continue
                        try:
                            lfd = directory_at(pfd, identifier(l), mount_id(root))
                        except (ValueError, OSError):
                            rows.append({'path': str(pathlib.Path.home() / 'artifacts' / p / l), 'eligible': False, 'age_days': None, 'size_bytes': None, 'action': 'preserved', 'reason': 'unsafe lot; manual review'}); continue
                        try:
                            for e in sorted(os.listdir(lfd)):
                                if execution and e != execution:
                                    continue
                                path = pathlib.Path.home() / 'artifacts' / p / l / e
                                row = {'path': str(path), 'eligible': False, 'age_days': None, 'size_bytes': None, 'action': 'preserved'}
                                try:
                                    identifier(e)
                                    with run_directory(root, p, l, e) as (fd, parent), lease(fd, inherit=False):
                                        m = validate_manifest(read_at(fd, MANIFEST), p, l, e)
                                        row.update(age_days=(now() - timestamp(m['created_at'])).total_seconds()/86400,
                                                   retention_days=retention(m, policy))
                                        row['eligible'], row['reason'] = eligibility(m, policy)
                                        row.update(sizes(fd))
                                        if row['eligible'] and apply:
                                            # Re-read state/policy/identity and scan again immediately before deletion.
                                            current = validate_manifest(read_at(fd, MANIFEST), p, l, e)
                                            if not eligibility(current, policy_at(root))[0] or current != m:
                                                raise ValueError('ARTIFACT_ELIGIBILITY_CHANGED')
                                            sizes(fd)
                                            identity = os.fstat(fd)
                                            linked = os.stat(e, dir_fd=parent, follow_symlinks=False)
                                            if (identity.st_dev, identity.st_ino) != (linked.st_dev, linked.st_ino):
                                                raise ValueError('ARTIFACT_IDENTITY_CHANGED')
                                            released = {'size_bytes': 0, 'allocated_bytes': 0}
                                            free_before = os.fstatvfs(root).f_bavail * os.fstatvfs(root).f_frsize
                                            append_at(root, '.cleanup-events.jsonl', {'at': stamp(), 'action': 'deletion-started', 'path': str(path), 'identity': [identity.st_dev, identity.st_ino], 'reason': row['reason']})
                                            try:
                                                remove_contents(fd, released)
                                                os.rmdir(e, dir_fd=parent); os.fsync(parent)
                                            except BaseException:
                                                # A partial cleanup must not be selected automatically again.
                                                if MANIFEST in os.listdir(fd):
                                                    current['state'] = 'resumable'; current['completed_at'] = None
                                                    current['resume'] = {'next': 'manual review of partial cleanup'}
                                                    atomic_at(fd, MANIFEST, current)
                                                row.update(action='incomplete', released=released)
                                                append_at(root, '.cleanup-events.jsonl', {'at': stamp(), 'action': 'deletion-incomplete', 'path': str(path), **released})
                                                raise
                                            free_after = os.fstatvfs(root).f_bavail * os.fstatvfs(root).f_frsize
                                            row.update(action='deleted', released=released, filesystem_free_delta_bytes=free_after-free_before)
                                            append_at(root, '.cleanup-events.jsonl', {'at': stamp(), **row})
                                except (ValueError, OSError, KeyError, TypeError) as error:
                                    row.update(eligible=False, reason='manual review: ' + type(error).__name__ + ' ' + str(error))
                                rows.append(row)
                        finally:
                            os.close(lfd)
                finally:
                    os.close(pfd)
    except FileNotFoundError:
        return []
    return rows


def mutate(args):
    with root_store(persistent=True) as (root, _), global_lock(root), run_directory(root, args.project, args.lot, args.execution) as (fd, _), lease(fd):
        m = validate_manifest(read_at(fd, MANIFEST), args.project, args.lot, args.execution)
        if args.command == 'update':
            for key in ['pinned', 'qualification_required', 'backup_required', 'retention_days']:
                value = getattr(args, key, None)
                if value is not None:
                    m[key] = days(value) if key == 'retention_days' else value
            if args.state:
                m['state'] = args.state
                m['completed_at'] = stamp() if args.state == 'completed' else None
        return checkpoint(fd, m, decode(args.resume) if getattr(args, 'resume', None) else None)


def verify_run(fd, m):
    expected = read_at(fd, 'checksums.json')
    if hashlib.sha256(json.dumps(expected, sort_keys=True).encode()).hexdigest() != m.get('checksums_sha256'):
        raise ValueError('ARTIFACT_CHECKSUM_MANIFEST_CHANGED')
    actual = {}
    def collect(name, info, file):
        if file is not None and name not in CONTROL and not name.startswith('.atomic-'):
            digest = hashlib.sha256()
            with os.fdopen(os.dup(file), 'rb') as stream:
                for block in iter(lambda: stream.read(1024 * 1024), b''):
                    digest.update(block)
            actual[name] = {'sha256': digest.hexdigest(), 'bytes': info.st_size}
    excluded = ['work'] if m['backup_required'] else []
    if expected.get('excluded') != excluded:
        raise ValueError('ARTIFACT_PROTECTION_CHANGED')
    walk(fd, collect, skip_root=excluded)
    if actual != expected['files']:
        raise ValueError('ARTIFACT_EVIDENCE_CHANGED')
    return {'path': str(canonical(m['project'], m['lot'], m['execution'])),
            'files': len(actual), 'checksums_sha256': m['checksums_sha256'], 'verified_at': stamp()}


def export_run(fd, m):
    verify_run(fd, m)
    # Only regular, private, same-mount evidence; runtime work stays in its VM disk.
    with tarfile.open(fileobj=sys.stdout.buffer, mode='w|') as archive:
        def emit(name, info, file):
            if name == '.lease' or name.startswith('.atomic-'):
                return
            item = tarfile.TarInfo(name)
            item.uid = info.st_uid; item.gid = info.st_gid
            item.mode = stat.S_IMODE(info.st_mode); item.mtime = int(info.st_mtime)
            if file is None:
                item.type = tarfile.DIRTYPE; archive.addfile(item)
            else:
                item.size = info.st_size
                with os.fdopen(os.dup(file), 'rb') as stream:
                    archive.addfile(item, stream)
        walk(fd, emit, skip_root=['work'] if m['backup_required'] else [])


def execute(args):
    path = canonical(args.project, args.lot, args.execution)
    command = args.argv[1:] if args.argv and args.argv[0] == '--' else args.argv
    if not command:
        raise ValueError('ARTIFACT_COMMAND_MISSING')
    with root_store(persistent=True) as (root, _), run_directory(root, args.project, args.lot, args.execution) as (fd, _), lease(fd) as held:
        m = validate_manifest(read_at(fd, MANIFEST), args.project, args.lot, args.execution)
        pending = m.get('resume') or {}
        if pending.get('reboot_pending') and pending.get('boot_id') == pathlib.Path('/proc/sys/kernel/random/boot_id').read_text().strip():
            raise ValueError('ARTIFACT_REBOOT_PENDING')
        m['state'] = 'active'; m['completed_at'] = None
        checkpoint(fd, m, decode(args.resume) if args.resume else {'next': 'command running'})
        evidence = directory_at(fd, 'evidence', mount_id(fd), True)
        try:
            name = 'command-' + uuid.uuid4().hex + '.log'
            output = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=evidence)
        finally:
            os.close(evidence)
        environment = dict(os.environ, DRUMEE_ARTIFACT_LEASE_FD=str(held), DRUMEE_ARTIFACT_RUN=str(path))
        print(json.dumps({'event': 'command-started', 'artifact_path': str(path), 'log': 'evidence/' + name}), flush=True)
        result = None
        try:
            with os.fdopen(output, 'wb') as stream:
                result = subprocess.run(command, stdout=stream, stderr=subprocess.STDOUT,
                                        pass_fds=(held,), env=environment)
                stream.flush(); os.fsync(stream.fileno())
        finally:
            m = validate_manifest(read_at(fd, MANIFEST), args.project, args.lot, args.execution)
            if result is None or result.returncode or m['state'] != 'completed':
                m['state'] = 'resumable'; m['completed_at'] = None
            m['last_exit'] = result.returncode if result else None
            checkpoint(fd, m)
        return result.returncode


def request_reboot(args):
    if socket.gethostname() != 'mail02-qualification' or not re.fullmatch(r'[a-f0-9]{64}', args.host_receipt_sha256):
        raise ValueError('ARTIFACT_REBOOT_TARGET_OR_RECEIPT_INVALID')
    with root_store(persistent=True) as (root, _), run_directory(root, args.project, args.lot, args.execution) as (fd, _), lease(fd):
        m = validate_manifest(read_at(fd, MANIFEST), args.project, args.lot, args.execution)
        verify_run(fd, m)
        if m['checksums_sha256'] != args.checksums_sha256 or not (m.get('resume') or {}).get('reboot_required'):
            raise ValueError('ARTIFACT_REBOOT_EVIDENCE_CHANGED')
        if m['state'] not in ['resumable', 'completed']:
            raise ValueError('ARTIFACT_REBOOT_RUN_ACTIVE')
        m['resume'].update(reboot_pending=True, boot_id=pathlib.Path('/proc/sys/kernel/random/boot_id').read_text().strip(),
                           host_receipt_sha256=args.host_receipt_sha256)
        atomic_at(fd, MANIFEST, m)
        append_at(fd, 'events.jsonl', {'at': stamp(), 'event': 'reboot-requested', 'resume': m['resume']})
        subprocess.run(['sudo', 'systemctl', 'reboot', '--no-block'], check=True, timeout=30)
    return {'reboot_requested': True}


def main(argv=None):
    os.umask(0o077)
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    init = sub.add_parser('init')
    update = sub.add_parser('update')
    check = sub.add_parser('checkpoint')
    verify = sub.add_parser('verify'); export = sub.add_parser('export'); execute_parser = sub.add_parser('exec')
    reboot_parser = sub.add_parser('request-reboot')
    reboot_parser.add_argument('--checksums-sha256', required=True)
    reboot_parser.add_argument('--host-receipt-sha256', required=True)
    for command in [init, update, check, verify, export, execute_parser, reboot_parser]:
        command.add_argument('project'); command.add_argument('lot'); command.add_argument('execution')
    execute_parser.add_argument('--resume'); execute_parser.add_argument('argv', nargs=argparse.REMAINDER)
    init.add_argument('--retention-days', type=int)
    update.add_argument('--state', choices=sorted(STATES))
    update.add_argument('--pinned', type=lambda v: {'yes': True, 'no': False}[v])
    update.add_argument('--qualification-required', type=lambda v: {'yes': True, 'no': False}[v])
    update.add_argument('--backup-required', type=lambda v: {'yes': True, 'no': False}[v])
    update.add_argument('--retention-days', type=int)
    update.add_argument('--resume'); check.add_argument('--resume')
    retain = sub.add_parser('retention'); retain.add_argument('project'); retain.add_argument('--lot'); retain.add_argument('--days', type=int, required=True)
    clean = sub.add_parser('cleanup'); clean.add_argument('--apply', action='store_true')
    for name in ['project', 'lot', 'execution']:
        clean.add_argument('--' + name, type=identifier)
    args = parser.parse_args(argv)
    try:
        if args.command == 'request-reboot':
            result = request_reboot(args)
        elif args.command == 'exec':
            return execute(args)
        elif args.command in ['verify', 'export']:
            with root_store(persistent=True) as (root, _), run_directory(root, args.project, args.lot, args.execution) as (fd, _), lease(fd):
                m = validate_manifest(read_at(fd, MANIFEST), args.project, args.lot, args.execution)
                if args.command == 'export':
                    export_run(fd, m); return 0
                result = verify_run(fd, m)
        elif args.command == 'init':
            result = {'path': str(initialize(args.project, args.lot, args.execution, args.retention_days))}
        elif args.command in ['update', 'checkpoint']:
            result = mutate(args)
        elif args.command == 'retention':
            with root_store(True, True) as (fd, _), global_lock(fd):
                policy = policy_at(fd); rule = policy['projects'].setdefault(identifier(args.project), {})
                if args.lot:
                    rule.setdefault('lots', {})[identifier(args.lot)] = days(args.days)
                else:
                    rule['days'] = days(args.days)
                atomic_at(fd, '.retention.json', policy); result = policy
        else:
            result = {'apply': args.apply, 'runs': cleanup(args.apply, args.project, args.lot, args.execution)}
        if args.command == 'cleanup' and any(row['action'] == 'incomplete' for row in result['runs']):
            print(json.dumps({'ok': False, 'code': 'ARTIFACT_CLEANUP_INCOMPLETE', 'data': result}, indent=2)); return 1
        print(json.dumps({'ok': True, 'data': result}, indent=2))
        return 0
    except (ValueError, OSError, KeyError, TypeError, subprocess.SubprocessError) as error:
        print(json.dumps({'ok': False, 'code': type(error).__name__, 'message': str(error)}))
        return 1


if __name__ == '__main__':
    raise SystemExit(main(['cleanup', *sys.argv[1:]] if pathlib.Path(sys.argv[0]).name == 'artifacts-cleanup' else None))
