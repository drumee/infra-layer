"""Authenticated private gateway probe; credentials only from the protected mount."""
import json,pathlib,smtplib,socket,ssl,sys
cfg=json.loads(pathlib.Path('/keys/client.json').read_text());host=sys.argv[1];allowed=sys.argv[2]=='allowed';result={'expected':sys.argv[2]}
try:
 s=smtplib.SMTP(host,1587,timeout=8)
 if not allowed:
  s.close();result.update(status='FAIL',reason='unapproved source received SMTP greeting')
 else:
  s.ehlo();assert 'auth' not in s.esmtp_features
  ctx=ssl.create_default_context(cafile='/keys/ca.pem');s._host='mail.oxymot.fr';s.starttls(context=ctx);s.ehlo();assert s.mail('contact@oxymot.fr')[0]==530;
  try:s.login('ghost',cfg['ghost']+'-wrong');raise AssertionError('bad password accepted')
  except smtplib.SMTPAuthenticationError as e:assert e.smtp_code==535
  s.login('oxymotion',cfg['oxymotion']);assert s.mail('second@oxymot.fr')[0]==250;s.rset();s.quit();result.update(status='PASS',tls_verified=True,authentication_required=True,bad_password_code=535,account='oxymotion')
except (smtplib.SMTPConnectError,smtplib.SMTPServerDisconnected,socket.timeout,ConnectionError,OSError) as e:
 result.update(status='PASS' if not allowed else 'FAIL',access_blocked=True,exception=type(e).__name__,errno=getattr(e,'errno',None),smtp_code=getattr(e,'smtp_code',None))
print(json.dumps(result))
