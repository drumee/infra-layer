"""Check delivered headers without disclosing bodies; external results stay untrusted."""
import email.parser,email.policy,hashlib,json,pathlib,sys
base=pathlib.Path(sys.argv[1]);found=[]
for p in (base/'witness').glob('message-*.eml'):
 body=p.read_bytes()
 if b'auth-header-' in body:
  parsed=email.parser.BytesParser(policy=email.policy.default).parsebytes(body)
  results=[str(x) for x in parsed.get_all('Authentication-Results',[])]
  valid=len(results)==2 and results[0].startswith('upstream.invalid;') and 'reason="mail.oxymot.fr"' in results[0] and results[1].startswith('mail.oxymot.fr.invalid;')
  found.append({'file':p.name,'sha256':hashlib.sha256(body).hexdigest(),'local_assertions_removed_external_preserved':valid})
assert found
passed=all(x['local_assertions_removed_external_preserved'] for x in found)
result={'status':'PASS_UNTRUSTED_LOCAL_AUTHENTICATION_RESULTS_REMOVED' if passed else 'FAIL_AUTHENTICATION_RESULTS_POLICY','observations':found}
(base/'header-result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result));raise SystemExit(0 if passed else 1)
