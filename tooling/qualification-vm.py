#!/usr/bin/env python3
"""Run on testbox: mirror protected guest evidence and gate qualification reboots."""
import argparse
import hashlib
import json
import os
import pathlib
import shlex
import socket
import stat
import subprocess
import tarfile
import uuid
import artifacts as store


def guest(args, command):
    return ['docker', 'exec', '-i', args.container, 'ssh', '-o', 'BatchMode=yes',
            '-o', 'ConnectTimeout=10', '-i', args.key, '-p', '2222',
            args.guest_user + '@127.0.0.1', shlex.join(command)]


def observe(args):
    if socket.gethostname() != 'testbox':
        raise ValueError('QUALIFICATION_HOST_MUST_BE_TESTBOX')
    info = json.loads(subprocess.check_output(['docker', 'inspect', args.container]))[0]
    if info['NetworkSettings']['Networks'] or info['HostConfig'].get('PortBindings'):
        raise ValueError('QUALIFICATION_VM_NOT_ISOLATED')
    code = ('import pathlib,hashlib,socket,json; p=pathlib.Path(' + repr(args.guest_tool) + ');'
            'print(json.dumps({"host":socket.gethostname(),"home":str(pathlib.Path.home()),'
            '"tool_sha256":hashlib.sha256(p.read_bytes()).hexdigest()}))')
    observed = json.loads(subprocess.check_output(guest(args, ['python3', '-c', code]), timeout=30))
    if observed['host'] != 'mail02-qualification' or observed['tool_sha256'] != args.guest_tool_sha256:
        raise ValueError('QUALIFICATION_GUEST_OR_TOOL_MISMATCH')
    return info, observed


def guest_tool(args, operation):
    return guest(args, ['python3', args.guest_tool, operation, args.project, args.lot, args.execution])


def synchronize(args):
    info, observed = observe(args)
    verified = json.loads(subprocess.check_output(guest_tool(args, 'verify'), timeout=120))
    if not verified['ok']:
        raise ValueError('QUALIFICATION_GUEST_EVIDENCE_INVALID')
    path = store.canonical(args.project, args.lot, args.execution)
    if not path.exists():
        store.initialize(args.project, args.lot, args.execution)
    with store.root_store(persistent=True) as (root, _), store.run_directory(root, args.project, args.lot, args.execution) as (fd, _), store.lease(fd):
        m = store.validate_manifest(store.read_at(fd, store.MANIFEST), args.project, args.lot, args.execution)
        m.update(state='resumable', completed_at=None, pinned=True, qualification_required=True, backup_required=True)
        evidence = store.directory_at(fd, 'evidence', store.mount_id(fd), True)
        name = 'guest-evidence-' + uuid.uuid4().hex + '.tar'
        try:
            output = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=evidence)
            with os.fdopen(output, 'wb') as stream:
                result = subprocess.run(guest_tool(args, 'export'), stdout=stream, stderr=subprocess.PIPE, timeout=600)
                stream.flush(); os.fsync(stream.fileno())
            if result.returncode:
                raise ValueError('QUALIFICATION_EXPORT_FAILED_RETAINED')
            snapshot = path / 'evidence' / name
            with tarfile.open(snapshot, 'r:') as archive:
                seen = set()
                for member in archive:
                    entry = pathlib.PurePosixPath(member.name)
                    if (entry.is_absolute() or '..' in entry.parts or '\\' in member.name
                            or member.name in seen or not (member.isfile() or member.isdir())):
                        raise ValueError('QUALIFICATION_EXPORT_UNSAFE')
                    seen.add(member.name)
                # Constant control-file name, no member extraction to the filesystem.
                control = archive.getmember(store.MANIFEST)
                if not control.isfile() or control.size > 1024 * 1024:
                    raise ValueError('QUALIFICATION_EXPORT_MANIFEST_INVALID')
                archive.fileobj.seek(control.offset_data)
                guest_manifest = store.decode(archive.fileobj.read(control.size))
            store.validate_manifest(guest_manifest, args.project, args.lot, args.execution)
            if guest_manifest['state'] not in ['resumable', 'completed']:
                raise ValueError('QUALIFICATION_GUEST_STILL_ACTIVE')
            if guest_manifest['checksums_sha256'] != verified['data']['checksums_sha256']:
                raise ValueError('QUALIFICATION_GUEST_CHANGED_DURING_EXPORT')
            digest = hashlib.sha256()
            with snapshot.open('rb') as stream:
                for block in iter(lambda: stream.read(1024 * 1024), b''):
                    digest.update(block)
            receipt = {'contract': 'drumee.qualification-host-copy/1', 'at': store.stamp(),
                       'host': socket.gethostname(), 'guest': observed['host'],
                       'container_id': info['Id'], 'guest_run': verified['data']['path'],
                       'guest_checksums_sha256': guest_manifest['checksums_sha256'],
                       'guest_resume': guest_manifest.get('resume'), 'snapshot': name,
                       'snapshot_sha256': digest.hexdigest(), 'bytes': snapshot.stat().st_size}
            store.atomic_at(evidence, 'host-copy-receipt.json', receipt)
            store.checkpoint(fd, m, {'next': 'host verification before guest reboot', 'guest': receipt})
            store.verify_run(fd, m)
            return path, receipt
        finally:
            os.close(evidence)


def reboot(args):
    path, receipt = synchronize(args)
    info, _ = observe(args)
    resume = receipt['guest_resume'] or {}
    if not resume.get('reboot_required'):
        raise ValueError('QUALIFICATION_REBOOT_NOT_STAGED')
    # All VM backing files must be in this protected host execution directory.
    vm_mounts = [m for m in info['Mounts'] if m['Destination'] == '/vm']
    if len(vm_mounts) != 1:
        raise ValueError('QUALIFICATION_VM_STORAGE_UNDECLARED')
    base = pathlib.Path(vm_mounts[0]['Source'])
    if base.resolve() != base or not base.is_relative_to(path / 'work'):
        raise ValueError('QUALIFICATION_VM_STORAGE_REQUIRES_COLD_ADOPTION')
    for component in [base, *base.parents]:
        if component == path:
            break
        if component.is_symlink():
            raise ValueError('QUALIFICATION_VM_STORAGE_SYMLINK')
    for name in ['guest.qcow2', 'base.qcow2', 'seed.iso']:
        file = base / name
        value = file.lstat()
        if not stat.S_ISREG(value.st_mode) or value.st_uid != os.getuid() or stat.S_IMODE(value.st_mode) != 0o600:
            raise ValueError('QUALIFICATION_VM_BACKING_UNSAFE')
    with store.root_store(persistent=True) as (root, _), store.run_directory(root, args.project, args.lot, args.execution) as (fd, _), store.lease(fd):
        m = store.validate_manifest(store.read_at(fd, store.MANIFEST), args.project, args.lot, args.execution)
        # FD mount IDs reject hidden bind mounts as well as different devices.
        opened = []
        parent = fd
        backing = {}
        try:
            for part in base.relative_to(path).parts:
                parent = store.directory_at(parent, part, store.mount_id(fd)); opened.append(parent)
            for name in ['guest.qcow2', 'base.qcow2', 'seed.iso']:
                file = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=parent)
                try:
                    info = os.fstat(file); store.secure_stat(info)
                    if store.mount_id(file) != store.mount_id(fd):
                        raise ValueError('QUALIFICATION_VM_BACKING_MOUNT')
                    backing[name] = {'device': info.st_dev, 'inode': info.st_ino, 'bytes': info.st_size}
                finally:os.close(file)
        finally:
            for directory in reversed(opened):os.close(directory)
        store.verify_run(fd, m)
        evidence = store.directory_at(fd, 'evidence', store.mount_id(fd))
        try:
            store.atomic_at(evidence, 'pre-reboot-' + uuid.uuid4().hex + '.json',
                            {'at': store.stamp(), 'verified_host_path': str(path),
                             'host_copy': receipt, 'vm_storage': str(base), 'backing_identities': backing, 'action': 'guest reboot only'})
        finally:
            os.close(evidence)
        store.checkpoint(fd, m, {'next': 'reconnect guest and execute next phase', 'phase': resume.get('phase')})
        # Evidence/receipt fsync and host hash verification happen before this command.
        store.verify_run(fd, m)
        host_receipt = hashlib.sha256(json.dumps(receipt, sort_keys=True).encode()).hexdigest()
        subprocess.run(guest(args, ['python3', args.guest_tool, 'request-reboot',
            '--checksums-sha256', receipt['guest_checksums_sha256'],
            '--host-receipt-sha256', host_receipt, args.project, args.lot, args.execution]), check=True, timeout=40)
    return {'reboot_requested': True, 'host_artifact_path': str(path)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation', choices=['sync', 'reboot'])
    parser.add_argument('project', type=store.identifier); parser.add_argument('lot', type=store.identifier)
    parser.add_argument('execution', type=store.identifier)
    parser.add_argument('--container', default='mail02-qualification-vm', type=store.identifier)
    parser.add_argument('--guest-user', default='lab', type=store.identifier)
    parser.add_argument('--key', default='/vm/id_ed25519')
    parser.add_argument('--guest-tool', required=True)
    parser.add_argument('--guest-tool-sha256', required=True)
    args = parser.parse_args(); os.umask(0o077)
    try:
        result = reboot(args) if args.operation == 'reboot' else {'host_artifact_path': str(synchronize(args)[0])}
        print(json.dumps({'ok': True, 'data': result}, indent=2))
    except (ValueError, OSError, KeyError, subprocess.SubprocessError) as error:
        print(json.dumps({'ok': False, 'message': str(error)})); return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
