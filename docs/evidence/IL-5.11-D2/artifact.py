"""Rebuild twice and compare exact npm members and bytes against the read-only D receipt."""
import base64
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tarfile
import sys
sys.dont_write_bytecode = True
from secure_evidence import cli, component, execution, require, trusted_input


def main():
    args = cli(__doc__).parse_args()
    with execution(args, 'artifact.py') as (root, out, source, env):
        prior_path = root / 'docs/evidence/IL-5.11-resume/D-artifact-receipt.json'
        trusted_input(prior_path)
        prior = json.loads(prior_path.read_text())
        packs = []
        for number in (1, 2):
            with out.child('pack-' + str(number)) as dest:
                result = subprocess.check_output([
                    '/usr/bin/npm', 'pack', '--json', '--ignore-scripts',
                    '--pack-destination', str(dest.path)], cwd=root, env=env, text=True)
                metadata = json.loads(result)[0]
                name = component(metadata['filename'])
                packs.append(dest.read_bytes(name))
                with dest.open_new('pack.json') as stream:
                    stream.write(result)
        require(packs[0] == packs[1], 'PACK_BYTES_DIFFER')
        data = packs[0]
        files = {}
        with tarfile.open(fileobj=io.BytesIO(data)) as archive:
            for member in archive.getmembers():
                require(member.isfile() and member.name.startswith('package/'), 'UNSAFE_TAR_MEMBER')
                name = member.name[len('package/'):]
                require('..' not in Path(name).parts and not Path(name).is_absolute()
                        and name not in files, 'UNSAFE_OR_DUPLICATE_TAR_NAME')
                with archive.extractfile(member) as stream:
                    content = stream.read()
                trusted_input(root / name)
                require(content == (root / name).read_bytes(), 'MEMBER_CONTENT_DIFFERS: ' + name)
                files[name] = hashlib.sha256(content).hexdigest()
        require(files == prior['files'], 'DISTRIBUTED_MEMBERS_CHANGED')
        sha = hashlib.sha256(data).hexdigest()
        sri = 'sha512-' + base64.b64encode(hashlib.sha512(data).digest()).decode()
        require(sha == prior['sha256'] and sri == prior['integrity'], 'NPM_IDENTITY_CHANGED')
        manifest = json.loads((root / 'package.json').read_text())
        require(not manifest.get('dependencies', {}), 'PRODUCTION_DEPENDENCIES_CHANGED')
        receipt = {
            'source': source, 'prior_executable_source': prior['source'], 'clean_tree': True,
            'two_packs_identical': True, 'members': len(files), 'packed_bytes': len(data),
            'sha256': sha, 'integrity': sri, 'identical_to_previous_D_candidate': True,
            'files': files, 'version': manifest['version'],
            'production_dependencies': manifest.get('dependencies', {}), 'exports': manifest['exports'],
            'prepublication_scripts': {k: v for k, v in manifest['scripts'].items()
                                      if k in ('prepare', 'prepack', 'prepublish',
                                               'prepublishOnly', 'publish', 'postpublish')},
        }
        out.write_json('artifact-receipt.json', receipt)
        print(json.dumps({k: v for k, v in receipt.items() if k not in ('files', 'exports')}, indent=2))


if __name__ == '__main__':
    main()
