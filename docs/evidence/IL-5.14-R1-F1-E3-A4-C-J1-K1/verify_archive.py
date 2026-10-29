"""Read and compare the real local tarball; no extraction or publication."""
from pathlib import Path
import base64
import hashlib
import json
import re
import tarfile

evidence = Path(__file__).resolve().parent
root = evidence.parents[2]
baseline = json.loads((evidence / "baseline.json").read_text())
dry = json.loads((evidence / "dry-inventory.log").read_text())[0]
packed = json.loads((evidence / "construct-archive.log").read_text())[0]
archive = Path(baseline["private_directory"]) / "candidate" / packed["filename"]
data = archive.read_bytes()
integrity = "sha512-" + base64.b64encode(hashlib.sha512(data).digest()).decode()
assert packed["integrity"] == dry["integrity"] == integrity
assert len(data) == packed["size"]
with tarfile.open(archive, "r:gz") as tar:
    members = tar.getmembers()
    assert all(m.isfile() and m.name.startswith("package/") for m in members)
    names = [m.name.removeprefix("package/") for m in members]
    assert len(names) == len(set(names)) == len(dry["files"]) == packed["entryCount"]
    assert set(names) == {v["path"] for v in dry["files"]} == {v["path"] for v in packed["files"]}
    content = {name: tar.extractfile(member).read() for name, member in zip(names, members)}
assert "internal/rollback-authorization.js" in content
assert all(content[name] == (root / name).read_bytes() for name in names)
edges = []
computed = []
for name in names:
    if not name.endswith(".js"):
        continue
    for match in re.finditer(r'require\(["\']([^"\']+)["\']\)', content[name].decode()):
        request = match[1]
        assert request.startswith((".", "node:"))
        if request.startswith("."):
            import posixpath
            base = posixpath.normpath(posixpath.join(posixpath.dirname(name), request))
            target = next((p for p in [base, base + ".js", base + "/index.js", base + ".json", base + "/index.json"] if p in content), None)
            assert target, (name, request)
            edges.append(dict(importer=name, request=request, member=target))
    for match in re.finditer(r'\brequire\(([^)]*)\)', content[name].decode()):
        if re.fullmatch(r'["\'][^"\']+["\']', match[1]):
            continue
        assert name == "lib/plan-v2.js" and match[1] == '`../capabilities/${name === "dkim" ? "mail" : name}`'
        targets = ["capabilities/" + part + "/index.js" for part in ["dns", "database", "redis", "mail"]]
        assert all(target in content for target in targets)
        computed.append(dict(importer=name, expression=match[1], finite_targets=targets))
identity = dict(source=json.loads((evidence / "candidate.json").read_text())["source"],
                archive=str(archive), filename=packed["filename"], name=packed["name"], version=packed["version"],
                sha256=hashlib.sha256(data).hexdigest(), npm_integrity=integrity,
                size=len(data), members=len(names), member_hashes={name: hashlib.sha256(content[name]).hexdigest() for name in sorted(names)},
                source_bytes_match=True, required_helper_present=True, literal_relative_edges=edges,
                computed_imports=computed, production_dependencies=[], public_runtime_path=["lifecycle/index.js:rollbackDeployment", "lifecycle/recovery.js:rollbackDeployment", "lifecycle/activation.js:activateRollback", "internal/rollback-authorization.js:authorizeRollback"],
                verifier_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest())
(evidence / "package-identity.json").write_text(json.dumps(identity, indent=2) + "\n")
print(json.dumps({k: identity[k] for k in ["sha256", "npm_integrity", "size", "members", "required_helper_present"]}))
