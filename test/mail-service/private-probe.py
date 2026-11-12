"""Application-private submission; the projection contains only one SMTP account and public CA."""
import email.utils,json,pathlib,smtplib,socket,ssl,sys
cfg=json.loads(pathlib.Path('/keys/client.json').read_text());host=sys.argv[1];allowed=sys.argv[2]=='allowed';tag=sys.argv[3] if len(sys.argv)>3 else None;account=cfg.get('account','oxymotion');password=cfg.get('password',cfg.get(account));sender=cfg.get('sender','second@oxymot.fr');result={'expected':sys.argv[2]}
try:
 s=smtplib.SMTP(host,1587,timeout=30 if allowed else 4)
 if not allowed:s.close();result.update(status='FAIL',reason='unapproved source received SMTP greeting')
 else:
  s.ehlo();assert 'auth' not in s.esmtp_features;ctx=ssl.create_default_context(cafile='/keys/ca.pem');s._host='mail.oxymot.fr';s.starttls(context=ctx);s.ehlo();assert s.mail(sender)[0]==530
  try:s.auth('PLAIN',lambda challenge=None:'\0'+account+'\0'+password+'-wrong');raise AssertionError('bad password accepted')
  except smtplib.SMTPAuthenticationError as e:assert e.smtp_code==535
  s.login(account,password);assert s.mail(sender)[0]==250
  if tag:
   assert s.rcpt('contact@oxymot.fr')[0]==250;code,_=s.data('From: '+sender+'\r\nDate: '+email.utils.formatdate()+'\r\nMessage-ID: <'+tag+'@fixture.invalid>\r\nSubject: '+tag+'\r\n\r\nSynthetic private transaction\r\n');assert code==250;result.update(accepted=True,correlation=tag)
  else:s.rset()
  s.quit();result.update(status='PASS',tls_verified=True,authentication_required=True,bad_password_code=535,account=account)
except (smtplib.SMTPConnectError,smtplib.SMTPServerDisconnected,socket.timeout,ConnectionError,OSError) as e:result.update(status='PASS' if not allowed else 'FAIL',access_blocked=True,exception=type(e).__name__,errno=getattr(e,'errno',None),smtp_code=getattr(e,'smtp_code',None))
print(json.dumps(result))
