"""Create a synthetic certificate with a valid past interval on OpenSSL 3.0/3.5."""
import pathlib,uuid

def issue_expired(run,directory,csr,key,issuer,issuer_key,extensions,output,self_signed=False):
 state=pathlib.Path(directory)/('issuer-state-'+uuid.uuid4().hex);state.mkdir(mode=0o700);(state/'index').write_text('');(state/'serial').write_text('1000\n')
 if self_signed:
  issuer=state/'bootstrap.pem'
  run(['openssl','x509','-req','-in',str(csr),'-signkey',str(key),'-set_serial','999','-days','2','-extfile',str(extensions),'-out',str(issuer)])
  issuer_key=key
 config=state/'ca.cnf';config.write_text('[ca]\ndefault_ca = lab\n[lab]\ndatabase = '+str(state/'index')+'\nserial = '+str(state/'serial')+'\nnew_certs_dir = '+str(state)+'\ncertificate = '+str(issuer)+'\nprivate_key = '+str(issuer_key)+'\ndefault_md = sha256\ndefault_days = 1\npolicy = names\nunique_subject = no\n[names]\ncommonName = supplied\n[leaf]\n'+pathlib.Path(extensions).read_text())
 for file in state.iterdir():file.chmod(0o600)
 args=['openssl','ca','-batch','-notext','-config',str(config),'-extensions','leaf','-startdate','20260101000000Z','-enddate','20260102000000Z','-in',str(csr),'-out',str(output)]
 if self_signed:args.append('-selfsign')
 run(args);pathlib.Path(output).chmod(0o600)
