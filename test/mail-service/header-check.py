"""Inspect controlled receiver evidence without disclosing message bodies."""
import hashlib,json,pathlib,sys
base=pathlib.Path(sys.argv[1]);found=[]
for p in (base/'witness').glob('message-*.eml'):
 body=p.read_bytes()
 if b'auth-header-' in body:
  found.append({'file':p.name,'sha256':hashlib.sha256(body).hexdigest(),'locally_authoritative_client_header_preserved':b'Authentication-Results: mail.oxymot.fr;' in body})
assert found
failed=any(x['locally_authoritative_client_header_preserved'] for x in found)
result={'status':'FAIL_UNTRUSTED_AUTHENTICATION_RESULTS' if failed else 'PASS_UNTRUSTED_AUTHENTICATION_RESULTS_REMOVED','observations':found}
(base/'header-result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result));raise SystemExit(1 if failed else 0)
