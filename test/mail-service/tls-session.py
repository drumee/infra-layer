import hashlib,imaplib,json,pathlib,smtplib,socket,ssl,time
cfg=json.loads(pathlib.Path('/keys/client.json').read_text());ctx=ssl.create_default_context(cafile='/keys/ca.pem')
s=smtplib.SMTP('postfix',587,timeout=10);s.ehlo();s._host='mail.oxymot.fr';s.starttls(context=ctx);s.ehlo();s.login('ghost',cfg['ghost'])
i=imaplib.IMAP4_SSL.__new__(imaplib.IMAP4_SSL)
class IMAP(imaplib.IMAP4_SSL):
 def _create_socket(self,timeout):return ctx.wrap_socket(socket.create_connection(('dovecot',993),timeout),server_hostname='mail.oxymot.fr')
i=IMAP('dovecot',993,ssl_context=ctx,timeout=10);i.login('contact@oxymot.fr',cfg['contact']);i.select('INBOX')
def fp(sock):return ':'.join(hashlib.sha256(sock.getpeercert(binary_form=True)).hexdigest()[n:n+2] for n in range(0,64,2)).upper()
before={'smtp':fp(s.sock),'imap':fp(i.sock)};pathlib.Path('/control/tls-sessions-ready').write_text('ready')
for _ in range(1200):
 if pathlib.Path('/control/tls-sessions-release').exists():break
 time.sleep(.1)
else:raise TimeoutError('TLS rotation coordination')
time.sleep(8);out={}
for name,session in [('smtp',s),('imap',i)]:
 try:
  result=session.noop();out[name]={'state':'retained','original_fingerprint':before[name],'current_session_fingerprint':fp(session.sock)}
  assert out[name]['current_session_fingerprint']==before[name]
 except (smtplib.SMTPException,imaplib.IMAP4.error,OSError):out[name]={'state':'closed-by-native-reload','original_fingerprint':before[name]}
 finally:
  try:session.shutdown() if name=='imap' else session.close()
  except Exception:pass
print(json.dumps({'sessions':out}))
