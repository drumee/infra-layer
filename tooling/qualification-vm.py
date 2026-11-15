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

VM_PROFILES = {
    'mail02-qualification-vm': ('mail02-qualification-vm', 'mail02-qualification'),
    'mail06-qualification-vm': ('mail06-qualification-vm', 'mail06-qualification'),
}
# SSH's remote shell sees a constant program. Caller fields travel as JSON stdin,
# never as shell syntax, options, executable paths or Python source interpolation.
REMOTE = '''import hashlib,json,os,pathlib,runpy,socket,stat,sys
r=json.load(sys.stdin)
p=pathlib.Path(r['tool']);home=pathlib.Path.home()
if not p.is_absolute() or p.resolve()!=p or not p.is_relative_to(home/'artifacts'):
 raise ValueError('QUALIFICATION_TOOL_PATH_INVALID')
s=p.lstat()
if not stat.S_ISREG(s.st_mode) or s.st_uid!=os.getuid() or s.st_nlink!=1 or s.st_mode&0o077:
 raise ValueError('QUALIFICATION_TOOL_OWNER_INVALID')
if hashlib.sha256(p.read_bytes()).hexdigest()!=r['sha256']:
 raise ValueError('QUALIFICATION_TOOL_HASH_MISMATCH')
if r['operation']=='identity':
 print(json.dumps({'host':socket.gethostname(),'home':str(home),'tool_sha256':r['sha256']}))
else:
 if r['operation'] not in ['verify','export','request-reboot']:raise ValueError('QUALIFICATION_OPERATION_INVALID')
 sys.argv=[str(p),r['operation'],r['project'],r['lot'],r['execution']]
 if r['operation']=='request-reboot':
  sys.argv+=['--checksums-sha256',r['checksums_sha256'],'--host-receipt-sha256',r['host_receipt_sha256']]
 runpy.run_path(str(p),run_name='__main__')
'''
REMOTE_COMMAND = shlex.join(['/usr/bin/python3', '-I', '-c', REMOTE])


def profile(args):
    selected = getattr(args, 'container', 'mail02-qualification-vm')
    if selected == 'mail02-qualification-vm':
        return VM_PROFILES['mail02-qualification-vm']
    if selected == 'mail06-qualification-vm':
        return VM_PROFILES['mail06-qualification-vm']
    raise ValueError('QUALIFICATION_VM_PROFILE_INVALID')


def guest(args, operation, **extra):
    container, _ = profile(args)
    known_hosts = '/vm/known_hosts' if container == 'mail06-qualification-vm' else '/root/.ssh/known_hosts'
    command = ['/usr/bin/docker', 'exec', '--user', '0', '-i', container,
               '/usr/bin/ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10',
               '-o', 'UserKnownHostsFile=' + known_hosts, '-i', '/vm/id_ed25519',
               '-p', '2222', 'lab@127.0.0.1', REMOTE_COMMAND]
    request = {'operation': operation, 'tool': args.guest_tool, 'sha256': args.guest_tool_sha256,
               'project': args.project, 'lot': args.lot, 'execution': args.execution, **extra}
    return command, json.dumps(request).encode()


def query_guest(args, operation):
    command, data = guest(args, operation)
    result = subprocess.run(command, input=data, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            check=True, timeout=120)
    return json.loads(result.stdout)


def observe(args):
    if socket.gethostname() != 'testbox':
        raise ValueError('QUALIFICATION_HOST_MUST_BE_TESTBOX')
    container, hostname = profile(args)
    info = json.loads(subprocess.check_output(['/usr/bin/docker', 'inspect', container]))[0]
    if info['NetworkSettings']['Networks'] or info['HostConfig'].get('PortBindings'):
        raise ValueError('QUALIFICATION_VM_NOT_ISOLATED')
    observed = query_guest(args, 'identity')
    if observed['host'] != hostname or observed['tool_sha256'] != args.guest_tool_sha256:
        raise ValueError('QUALIFICATION_GUEST_OR_TOOL_MISMATCH')
    return info, observed


def export_guest(args, evidence, name):
    output = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=evidence)
    command, data = guest(args, 'export')
    with os.fdopen(output, 'wb') as stream:
        result = subprocess.run(command, input=data, stdout=stream, stderr=subprocess.PIPE, timeout=600)
        stream.flush()
        os.fsync(stream.fileno())
    if result.returncode:
        raise ValueError('QUALIFICATION_EXPORT_FAILED_RETAINED')


def exported_manifest(snapshot):
    with tarfile.open(snapshot, 'r:') as archive:
        seen = set()
        for member in archive:
            entry = pathlib.PurePosixPath(member.name)
            if (entry.is_absolute() or '..' in entry.parts or '\\' in member.name
                    or member.name in seen or not (member.isfile() or member.isdir())):
                raise ValueError('QUALIFICATION_EXPORT_UNSAFE')
            seen.add(member.name)
        control = archive.getmember(store.MANIFEST)
        if not control.isfile() or control.size > 1024 * 1024:
            raise ValueError('QUALIFICATION_EXPORT_MANIFEST_INVALID')
        archive.fileobj.seek(control.offset_data)
        return store.decode(archive.fileobj.read(control.size))


def copy_receipt(args, path, verified, info, observed, name):
    snapshot = path / 'evidence' / name
    manifest = exported_manifest(snapshot)
    store.validate_manifest(manifest, args.project, args.lot, args.execution)
    if manifest['state'] not in ['resumable', 'completed']:
        raise ValueError('QUALIFICATION_GUEST_STILL_ACTIVE')
    if manifest['checksums_sha256'] != verified['data']['checksums_sha256']:
        raise ValueError('QUALIFICATION_GUEST_CHANGED_DURING_EXPORT')
    digest = hashlib.sha256()
    with snapshot.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return {'contract': 'drumee.qualification-host-copy/1', 'at': store.stamp(),
            'host': socket.gethostname(), 'guest': observed['host'], 'container_id': info['Id'],
            'guest_run': verified['data']['path'], 'guest_checksums_sha256': manifest['checksums_sha256'],
            'guest_resume': manifest.get('resume'), 'snapshot': name,
            'snapshot_sha256': digest.hexdigest(), 'bytes': snapshot.stat().st_size}


def synchronize(args):
    info, observed = observe(args)
    verified = query_guest(args, 'verify')
    if not verified['ok']:
        raise ValueError('QUALIFICATION_GUEST_EVIDENCE_INVALID')
    path = store.canonical(args.project, args.lot, args.execution)
    if not path.exists():
        store.initialize(args.project, args.lot, args.execution)
    with store.root_store(persistent=True) as (root, _), store.run_directory(root, args.project, args.lot, args.execution) as (fd, _), store.lease(fd):
        m = store.validate_manifest(store.read_at(fd, store.MANIFEST), args.project, args.lot, args.execution)
        m.update(state='resumable', completed_at=None, pinned=True, qualification_required=True, backup_required=True)
        evidence = store.directory_at(fd, 'evidence', store.mount_id(fd), True)
        try:
            name = 'guest-evidence-' + uuid.uuid4().hex + '.tar'
            export_guest(args, evidence, name)
            receipt = copy_receipt(args, path, verified, info, observed, name)
            store.atomic_at(evidence, 'host-copy-receipt.json', receipt)
            store.checkpoint(fd, m, {'next': 'host verification before guest reboot', 'guest': receipt})
            store.verify_run(fd, m)
            return path, receipt
        finally:
            os.close(evidence)


def backing_directory(path, info):
    mounts = [m for m in info['Mounts'] if m['Destination'] == '/vm']
    if len(mounts) != 1:
        raise ValueError('QUALIFICATION_VM_STORAGE_UNDECLARED')
    base = pathlib.Path(mounts[0]['Source'])
    if base.resolve() != base or not base.is_relative_to(path / 'work'):
        raise ValueError('QUALIFICATION_VM_STORAGE_REQUIRES_COLD_ADOPTION')
    for component in [base, *base.parents]:
        if component == path:
            break
        if component.is_symlink():
            raise ValueError('QUALIFICATION_VM_STORAGE_SYMLINK')
    return base


def backing_files(fd, base, path):
    opened = []
    parent = fd
    identities = {}
    try:
        for part in base.relative_to(path).parts:
            parent = store.directory_at(parent, part, store.mount_id(fd))
            opened.append(parent)
        for name in ['guest.qcow2', 'base.qcow2', 'seed.iso']:
            file = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=parent)
            try:
                info = os.fstat(file)
                store.secure_stat(info)
                if store.mount_id(file) != store.mount_id(fd):
                    raise ValueError('QUALIFICATION_VM_BACKING_MOUNT')
                identities[name] = {'device': info.st_dev, 'inode': info.st_ino, 'bytes': info.st_size}
            finally:
                os.close(file)
    finally:
        for directory in reversed(opened):
            os.close(directory)
    return identities


def reboot(args):
    path, receipt = synchronize(args)
    info, _ = observe(args)
    resume = receipt['guest_resume'] or {}
    if not resume.get('reboot_required'):
        raise ValueError('QUALIFICATION_REBOOT_NOT_STAGED')
    base = backing_directory(path, info)
    with store.root_store(persistent=True) as (root, _), store.run_directory(root, args.project, args.lot, args.execution) as (fd, _), store.lease(fd):
        m = store.validate_manifest(store.read_at(fd, store.MANIFEST), args.project, args.lot, args.execution)
        backing = backing_files(fd, base, path)
        store.verify_run(fd, m)
        evidence = store.directory_at(fd, 'evidence', store.mount_id(fd))
        try:
            store.atomic_at(evidence, 'pre-reboot-' + uuid.uuid4().hex + '.json',
                {'at': store.stamp(), 'verified_host_path': str(path), 'host_copy': receipt,
                 'vm_storage': str(base), 'backing_identities': backing, 'action': 'guest reboot only'})
        finally:
            os.close(evidence)
        store.checkpoint(fd, m, {'next': 'reconnect guest and execute next phase', 'phase': resume.get('phase')})
        store.verify_run(fd, m)
        host_digest = hashlib.sha256(json.dumps(receipt, sort_keys=True).encode()).hexdigest()
        command, data = guest(args, 'request-reboot', checksums_sha256=receipt['guest_checksums_sha256'],
                              host_receipt_sha256=host_digest)
        subprocess.run(command, input=data, check=True, timeout=40)
    return {'reboot_requested': True, 'host_artifact_path': str(path)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation', choices=['sync', 'reboot'])
    for name in ['project', 'lot', 'execution']:
        parser.add_argument(name, type=store.identifier)
    parser.add_argument('--container', default='mail02-qualification-vm', choices=VM_PROFILES)
    parser.add_argument('--guest-user', default='lab', choices=['lab'])
    parser.add_argument('--key', default='/vm/id_ed25519', choices=['/vm/id_ed25519'])
    parser.add_argument('--guest-tool', required=True)
    parser.add_argument('--guest-tool-sha256', required=True)
    args = parser.parse_args()
    os.umask(0o077)
    try:
        result = reboot(args) if args.operation == 'reboot' else {'host_artifact_path': str(synchronize(args)[0])}
        print(json.dumps({'ok': True, 'data': result}, indent=2))
    except (ValueError, OSError, KeyError, subprocess.SubprocessError) as error:
        print(json.dumps({'ok': False, 'message': str(error)}))
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
