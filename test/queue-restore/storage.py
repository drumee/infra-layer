"""Offline qualification storage tool. No daemons/network; explicit trusted receipt."""
import hashlib
import json
import os
import pathlib
import stat
import sys
import tarfile
import tempfile


def digest(data):
    return hashlib.sha256(data).hexdigest()


def safe(path):
    p = pathlib.Path(path)
    if not p.is_absolute() or str(p) != path or '..' in p.parts or p.parts[1] not in ['work', 'replacement']:
        raise ValueError('UNSAFE_PATH')
    for parent in [*reversed(p.parents), p]:
        if parent.exists() and parent.is_symlink():
            raise ValueError('SYMLINK_PATH')
    return p


def inventory(root):
    result = []
    omitted = []
    for p in [root, *sorted(root.rglob('*'))]:
        st = p.lstat()
        name = str(p.relative_to(root))
        if os.listxattr(p,follow_symlinks=False):
            raise ValueError('UNSUPPORTED_EXTENDED_METADATA')
        if stat.S_ISSOCK(st.st_mode) and name.split('/')[0] in ['private', 'public']:
            omitted.append(name)
            continue
        kind = 'directory' if stat.S_ISDIR(st.st_mode) else 'file' if stat.S_ISREG(st.st_mode) else None
        if kind is None or p.is_symlink() or (kind == 'file' and st.st_nlink != 1):
            raise ValueError('UNSUPPORTED_NODE')
        row = {'path': name, 'kind': kind, 'uid': st.st_uid, 'gid': st.st_gid,
               'mode': stat.S_IMODE(st.st_mode), 'mtime_ns': st.st_mtime_ns}
        if kind == 'file':
            row.update(size=st.st_size, sha256=digest(p.read_bytes()))
        result.append(row)
    return result, omitted


def marker(root, expected):
    p = root/'.infra-owner'
    if not p.is_file() or p.is_symlink() or json.loads(p.read_text()) != expected:
        raise ValueError('OWNER_MARKER_MISMATCH')


def snapshot(cfg):
    src, archive, receipt = map(safe, [cfg['source'], cfg['archive'], cfg['receipt']])
    if archive.parent != pathlib.Path('/work') or receipt.parent != pathlib.Path('/work'):
        raise ValueError('OUTPUT_SCOPE_INVALID')
    marker(src, cfg['owner'])
    entries, omitted = inventory(src)
    if archive.exists() or receipt.exists():
        raise ValueError('OUTPUT_EXISTS')
    # The orchestrator must supply observed stopped/mount-fence receipts.
    if not cfg.get('quiescence_verified'):
        raise ValueError('QUIESCENCE_REQUIRED')
    with open(archive, 'xb') as out:
        os.chmod(archive, 0o600)
        os.chown(archive,cfg['operator_uid'],cfg['operator_gid'])
        with tarfile.open(fileobj=out, mode='w', format=tarfile.PAX_FORMAT) as tar:
            for row in entries:
                tar.add(src/row['path'], arcname=row['path'], recursive=False)
        out.flush()
        os.fsync(out.fileno())
    again, _ = inventory(src)
    if entries != again:
        raise ValueError('SOURCE_CHANGED_DURING_CAPTURE')
    data = {'contract':'postfix-cold-spool/1','owner':cfg['owner'],'image':cfg['image'],
            'config_sha256':cfg['config_sha256'],'entries':entries,'omitted_runtime_sockets':omitted,
            'archive_sha256':digest(archive.read_bytes())}
    with open(receipt, 'x') as f:
        os.chmod(receipt, 0o600)
        os.chown(receipt,cfg['operator_uid'],cfg['operator_gid'])
        f.write(json.dumps(data,sort_keys=True,indent=2)+'\n')
        f.flush()
        os.fsync(f.fileno())
    return {'archive_sha256':data['archive_sha256'],'receipt_sha256':digest(receipt.read_bytes()),
            'entries':len(entries),'owner':data['owner'],'omitted_runtime_sockets':omitted,
            'source_identity':{'device':src.stat().st_dev,'inode':src.stat().st_ino}}


def restore(cfg):
    archive, receipt, target = map(safe, [cfg['archive'],cfg['receipt'],cfg['target']])
    if target.parent != pathlib.Path('/replacement') or target.name.startswith('.'):
        raise ValueError('TARGET_SCOPE_INVALID')
    if target.exists() or target.is_symlink():
        raise ValueError('TARGET_EXISTS')
    if digest(receipt.read_bytes()) != cfg['expected_receipt_sha256']:
        raise ValueError('UNTRUSTED_RECEIPT')
    saved = json.loads(receipt.read_text())
    if saved['contract'] != 'postfix-cold-spool/1' or saved['owner'] != cfg['owner']:
        raise ValueError('OWNER_MARKER_MISMATCH')
    if saved['image'] != cfg['image'] or saved['config_sha256'] != cfg['config_sha256']:
        raise ValueError('COMPATIBILITY_MISMATCH')
    if digest(archive.read_bytes()) != saved['archive_sha256']:
        raise ValueError('ARCHIVE_INTEGRITY_FAILURE')
    # Validate all member names/types/digests before creating any target data.
    with tarfile.open(archive) as tar:
        members = tar.getmembers()
        by_name = {m.name:m for m in members}
        rows = {r['path']:r for r in saved['entries']}
        if len(by_name) != len(members) or set(by_name) != set(rows):
            raise ValueError('ARCHIVE_COVERAGE_FAILURE')
        for name, m in by_name.items():
            parts = pathlib.PurePosixPath(name)
            if parts.is_absolute() or '..' in parts.parts or str(parts) != name:
                raise ValueError('UNSAFE_MEMBER')
            r = rows[name]
            if not (m.isdir() and r['kind'] == 'directory' or m.isfile() and r['kind'] == 'file'):
                raise ValueError('UNSAFE_MEMBER_TYPE')
            if (m.uid,m.gid,m.mode) != (r['uid'],r['gid'],r['mode']):
                raise ValueError('METADATA_MISMATCH')
            if m.isfile() and (m.size != r['size'] or digest(tar.extractfile(m).read()) != r['sha256']):
                raise ValueError('MEMBER_INTEGRITY_FAILURE')
        owner = json.loads(tar.extractfile(by_name['.infra-owner']).read())
        if owner != cfg['owner']:
            raise ValueError('OWNER_MARKER_MISMATCH')
        staging = pathlib.Path(tempfile.mkdtemp(prefix='.queue-restore-', dir=target.parent))
        try:
            for name, r in sorted(rows.items(), key=lambda kv:len(pathlib.PurePosixPath(kv[0]).parts)):
                dst = staging/name
                if r['kind'] == 'directory':
                    dst.mkdir(exist_ok=True)
                else:
                    with open(dst, 'xb') as f:
                        f.write(tar.extractfile(by_name[name]).read())
                        f.flush()
                        os.fsync(f.fileno())
                os.chown(dst,r['uid'],r['gid'])
                os.chmod(dst,r['mode'])
            for r in sorted(rows.values(),key=lambda r:len(pathlib.PurePosixPath(r['path']).parts),reverse=True):
                os.utime(staging/r['path'],ns=(r['mtime_ns'],r['mtime_ns']))
                if r['kind'] == 'directory':
                    fd = os.open(staging/r['path'],os.O_RDONLY|os.O_DIRECTORY)
                    try:
                        os.fsync(fd)
                    finally:
                        os.close(fd)
            actual, _ = inventory(staging)
            if actual != saved['entries']:
                raise ValueError('RESTORED_INVENTORY_MISMATCH')
            # Qualified callers serialize all restore work in a private owned parent.
            if target.exists():
                raise ValueError('TARGET_EXISTS')
            os.rename(staging,target)
            parentfd = os.open(target.parent,os.O_RDONLY|os.O_DIRECTORY)
            try:
                os.fsync(parentfd)
            finally:
                os.close(parentfd)
            marker(target,cfg['owner'])
            return {'restored':True,'entries':len(actual),'metadata_exact':True,
                    'target_identity':{'device':target.stat().st_dev,'inode':target.stat().st_ino}}
        except Exception:
            # Keep failed private staging for inspection; never remove an occupied target.
            raise


def main(cfg):
    if cfg['operation'] == 'snapshot':
        return snapshot(cfg)
    if cfg['operation'] == 'restore':
        return restore(cfg)
    if cfg['operation'] == 'inventory':
        rows, omitted = inventory(safe(cfg['source']))
        return {'sha256':digest(json.dumps(rows,sort_keys=True).encode()),'entries':rows,'omitted':omitted}
    raise ValueError('UNSUPPORTED_OPERATION')


if __name__ == '__main__':
    try:
        result = main(json.loads(pathlib.Path(sys.argv[1]).read_text()))
        print(json.dumps({'ok':True,**result}))
    except (ValueError,OSError,KeyError,tarfile.TarError) as error:
        code = str(error) if isinstance(error,ValueError) else 'STORAGE_FAILURE'
        print(json.dumps({'ok':False,'code':code if code.isupper() else 'STORAGE_FAILURE'}))
        sys.exit(78)
