"""Acceptance-boundary probes; all credentials come from a protected mount."""
import imaplib,json,pathlib,re,smtplib,sys,time
mode,tag=sys.argv[1:];sys.argv=['probe','probe']
from client import connect,IMAP,cfg,ctx
control=pathlib.Path('/control')
def wait():
 for _ in range(900):
  if (control/(tag+'-release')).exists():return
  time.sleep(.1)
 raise TimeoutError('no registry release')
if mode=='inflight':
 with connect() as s:
  assert s.mail('contact@oxymot.fr')[0]==250;assert s.rcpt('second@oxymot.fr')[0]==250;assert s.docmd('DATA')[0]==354
  s.send(('From: contact@oxymot.fr\r\nMessage-ID: <'+tag+'@fixture.invalid>\r\nSubject: '+tag+'\r\n\r\nsynthetic pending policy change\r\n').encode());(control/(tag+'-ready')).write_text('DATA354');wait();s.send(b'.\r\n');code,_=s.getreply();assert 400<=code<500
 print(json.dumps({'status':'PASS_INFLIGHT_REVOCATION','final_code':code,'final_250':False}))
elif mode=='accepted':
 with connect() as s:
  s.mail('contact@oxymot.fr');assert s.rcpt('second@oxymot.fr')[0]==250;code,reply=s.data(('From: contact@oxymot.fr\r\nMessage-ID: <'+tag+'@fixture.invalid>\r\nSubject: '+tag+'\r\n\r\n').encode()+b'x'*250000);assert code==250;queue=re.search(rb'queued as ([A-F0-9]+)',reply);assert queue
 print(json.dumps({'status':'ACCEPTED_LOCALLY','queue_id':queue.group(1).decode(),'code':code}))
elif mode=='human-sessions':
 smtp=connect(587,None);smtp.login('contact@oxymot.fr',cfg['contact']);imap=IMAP('dovecot',993,ssl_context=ctx,timeout=8);imap.login('contact@oxymot.fr',cfg['contact']);imap.select('INBOX');(control/(tag+'-ready')).write_text('authenticated');wait();code=smtp.mail('contact@oxymot.fr')[0];assert code>=400;smtp.close()
 try:imap.noop();raise AssertionError('disabled IMAP session survived')
 except (imaplib.IMAP4.error,OSError):pass
 print(json.dumps({'status':'PASS_COMBINED_SESSION_REVOCATION','old_smtp_code':code,'old_imap_disconnected':True}))
else:raise ValueError('unknown acceptance probe')
