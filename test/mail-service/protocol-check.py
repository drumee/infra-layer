"""Additional native protocol negatives; credentials are read from a protected mount."""
import base64,json,os,pathlib,smtplib,socket,ssl,sys,uuid,warnings
mode=sys.argv[1] if len(sys.argv)>1 else 'normal';arguments=sys.argv[2:];sys.argv=['protocol-check.py','probe']
from client import connect,IMAP,cfg,ctx
checks=[]
def case(name,fn):
 if os.environ.get('MAIL02_ONLY_CASE') and os.environ['MAIL02_ONLY_CASE']!=name:return
 try:detail=fn();checks.append({'name':name,'status':'PASS','observation':detail})
 except Exception as e:checks.append({'name':name,'status':'FAIL','reason':str(e)})
def relay(host):
 with smtplib.SMTP(host,25,timeout=5) as s:
  s.ehlo();assert 'auth' not in s.esmtp_features;s.mail('outside@dest.invalid');code,_=s.rcpt('sink@dest.invalid');assert code>=500;return {'rcpt_code':code,'auth_advertised':False}
if mode=='loopback':case('loopback-anonymous-relay-refused',lambda:relay('127.0.0.1'))
else:
 case('edge-anonymous-relay-refused',lambda:relay('postfix'))
 def plaintext():
  with connect(587,None,False) as s:
   code,_=s.mail('contact@oxymot.fr');assert code==530;return {'mail_code':code}
 case('plaintext-mail-requires-starttls',plaintext)
 def unauthenticated():
  with connect(587,None) as s:
   code,_=s.mail('contact@oxymot.fr');assert code==530;return {'mail_code':code}
 case('verified-tls-without-auth-refused',unauthenticated)
 for who in ['ghost','oxymotion','contact@oxymot.fr','hello@oxymot.fr']:
  def wrong(who=who):
   with connect(587,None) as s:
    password=cfg[who]+'-wrong' if who in ['ghost','oxymotion'] else cfg['contact']
    try:s.login(who,password)
    except smtplib.SMTPAuthenticationError as e:assert e.smtp_code==535;return {'code':e.smtp_code}
    raise AssertionError('ineligible/wrong credential authenticated')
  case('smtp-ineligible-or-wrong-password-'+who,wrong)
 def authorization_identity():
  with connect(587,None) as s:
   payload=base64.b64encode(('oxymotion\0ghost\0'+cfg['ghost']).encode()).decode();code,_=s.docmd('AUTH','PLAIN '+payload);assert code==535;return {'code':code}
 case('sasl-authorization-identity-impersonation-refused',authorization_identity)
 for who in ['ghost','oxymotion','hello@oxymot.fr']:
  def app_imap(who=who):
   with IMAP('dovecot',993,ssl_context=ctx,timeout=8) as s:
    try:s.login(who,cfg.get(who,cfg['contact']))
    except Exception as e:
     import imaplib
     assert isinstance(e,imaplib.IMAP4.error);return {'authenticated':False}
    raise AssertionError('ineligible IMAP identity authenticated')
  case('imap-ineligible-'+who,app_imap)
 def namespaces():
  with IMAP('dovecot',993,ssl_context=ctx,timeout=8) as s:
   s.login('contact@oxymot.fr',cfg['contact']);kind,listed=s.list();assert kind=='OK'
   assert not any(b'22222222-2222' in x for x in listed)
   for mailbox in ['/mailboxes/22222222-2222-4222-8222-222222222222/Maildir','#shared/second','INBOX/../../22222222-2222-4222-8222-222222222222']:
    assert s.select(mailbox)[0]=='NO'
   return {'foreign_listed':False,'foreign_namespaces_selectable':False}
 case('imap-list-and-absolute-shared-namespace-isolation',namespaces)
 def internal_recipient():
  with connect(25,None,False) as s:
   s.mail('outside@dest.invalid');code,_=s.rcpt('mbx-11111111-1111-4111-8111-111111111111@local.invalid');assert code==550
   s.rset();s.mail('outside@dest.invalid');other,_=s.rcpt('unknown@oxymot.fr',['ORCPT=rfc822;contact@oxymot.fr']);assert other==550;return {'internal_rcpt_code':code,'unknown_with_orcpt_code':other}
 case('internal-recipient-and-orcpt-cannot-bypass-rcpt-validation',internal_recipient)
 def mx_after_tls():
  with connect(25,None,True) as s:assert 'auth' not in s.esmtp_features;return {'auth_advertised':False}
 case('mx-auth-remains-absent-after-starttls',mx_after_tls)
 def null_submission():
  with connect() as s:
   try:s.sendmail('',['second@oxymot.fr'],'From: contact@oxymot.fr\r\n\r\nsynthetic invalid envelope')
   except smtplib.SMTPResponseException as e:assert e.smtp_code>=500;return {'code':e.smtp_code}
   except smtplib.SMTPRecipientsRefused as e:assert all(v[0]>=500 for v in e.recipients.values());return {'refused':True}
   raise AssertionError('null app envelope accepted')
 case('authenticated-application-null-envelope-refused',null_submission)
 for host,port,starttls in [('postfix',587,True),('postfix',465,False),('dovecot',993,False)]:
  def legacy(host=host,port=port,starttls=starttls):
   with warnings.catch_warnings():
    warnings.simplefilter('ignore');old=ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT);old.minimum_version=old.maximum_version=ssl.TLSVersion.TLSv1_1
   old.load_verify_locations('/keys/ca.pem');old.set_ciphers('ALL:@SECLEVEL=0')
   try:
    if starttls:
     with smtplib.SMTP(host,port,timeout=5) as s:s.ehlo();s._host='mail.oxymot.fr';s.starttls(context=old)
    else:
     with old.wrap_socket(socket.create_connection((host,port),timeout=5),server_hostname='mail.oxymot.fr'):pass
   except ssl.SSLError as e:
    assert 'PROTOCOL_VERSION' in e.reason,'client/other failure is not a native protocol-version refusal: '+str(e.reason);return {'native_tls_alert':e.reason}
   raise AssertionError('TLS1.1 accepted')
  case('native-tls11-refused-'+str(port),legacy)
 def no_plain_imap():
  try:
   with socket.create_connection(('dovecot',143),timeout=2):raise AssertionError('plaintext IMAP listener open')
  except OSError:return {'plaintext_imap_listener':False}
 case('plaintext-imap-not-listening',no_plain_imap)
 if arguments:
  control=json.loads(arguments[0])
  for name,(address,port) in control.items():
   def denied(address=address,port=port):
    try:
     with socket.create_connection((address,port),timeout=1):raise AssertionError('control endpoint reachable from client edge')
    except OSError:return {'reachable':False}
   case('control-network-refuses-'+name,denied)
 assert not pathlib.Path('/run/mail-sockets/auth').exists() and not pathlib.Path('/run/mail-sockets/lmtp').exists()
 case('unix-auth-lmtp-not-mounted-in-client',lambda:{'auth_mounted':pathlib.Path('/run/mail-sockets/auth').exists(),'lmtp_mounted':pathlib.Path('/run/mail-sockets/lmtp').exists()})
print(json.dumps({'status':'PASS_NATIVE_PROTOCOL_NEGATIVES' if all(x['status']=='PASS' for x in checks) else 'FAIL_NATIVE_PROTOCOL_NEGATIVES','checks':checks}))
