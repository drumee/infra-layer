import sys
sys.dont_write_bytecode=True
sys.path.insert(0,'/tmp/il511-r6s/docs/evidence/IL-5.11-D2')
from secure_evidence import EvidenceDirectory,clean_source
from pathlib import Path
import os,json,hashlib,re,subprocess,datetime
source=Path('/tmp/il511-r6s-clean');q=Path('/tmp/il511-evidence-64d1c6d4a4eb9e42eea1d429e626c445');a=Path('/tmp/il511-evidence-ae748d885d1d6a028a5a9ab8f885a246')
with EvidenceDirectory.create() as out:
 print('EVIDENCE_ROOT='+str(out.path),flush=True)
 progress=json.loads((q/'qualification-progress.json').read_text());artifact=json.loads((a/'artifact-receipt.json').read_text())
 logs={};projects=set();secret_matches=[]
 for step in progress['steps']:
  data=(q/(step['name']+'.txt')).read_bytes();digest=hashlib.sha256(data).hexdigest()
  if digest!=step['log_sha256']:raise RuntimeError('LOG_HASH_MISMATCH')
  text=data.decode();projects.update(re.findall(r'drumee-il[1235]-(?:test-)?[a-f0-9]{8}',text))
  logs[step['name']]={'sha256':digest,'exit_code':step['exit_code'],'bytes':len(data)}
  if re.search(rb'-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----',data):secret_matches.append(step['name'])
  if re.search(rb'(?:npm_[A-Za-z0-9]{30,}|gh[pousr]_[A-Za-z0-9]{30,})',data):secret_matches.append(step['name'])
 readback={}
 for project in sorted(projects):
  readback[project]={kind:subprocess.check_output(['/usr/bin/docker',*command,'--filter','label=com.docker.compose.project='+project,'--format','{{.ID}}'],text=True).split() for kind,command in [('containers',['ps','-a']),('networks',['network','ls'])]}
 if any(v for resources in readback.values() for v in resources.values()):raise RuntimeError('OWNED_RESOURCES_REMAIN')
 if secret_matches:raise RuntimeError('POTENTIAL_SECRET_IN_LOGS')
 packs=[(a/('pack-'+str(i))/'drumee-infra-layer-0.1.0-alpha.3.tgz').read_bytes() for i in (1,2)]
 if packs[0]!=packs[1] or hashlib.sha256(packs[0]).hexdigest()!=artifact['sha256']:raise RuntimeError('ARTIFACT_HASH_MISMATCH')
 out.write_json('validation.json',{'source':clean_source(source),'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'uid':os.geteuid(),'gid':os.getegid(),'qualification_complete':progress['complete'],'stopped':progress['stopped'],'all_log_hashes_match':True,'logs':logs,'private_key_or_token_pattern_hits':secret_matches,'secret_scan_limit':'Pattern scan only, plus existing canonical harness disclosure checks; no universal absence-of-secret guarantee','owned_cleanup_readback':readback,'two_packs_identical':True,'artifact_sha256_recalculated':hashlib.sha256(packs[0]).hexdigest(),'members':artifact['members'],'npm_metadata':{'exports':artifact['exports'],'production_dependencies':artifact['production_dependencies']},'clean_tree_after':True,'output_scope':'New helper roots/logs/JSON/cache; canonical test harness private fixtures and external report output are separate unchanged behaviors.'})
 print(json.dumps({'source':progress['source'],'steps':len(logs),'hashes_ok':True,'cleanup_empty':True,'pattern_hits':secret_matches,'members':artifact['members']}))
