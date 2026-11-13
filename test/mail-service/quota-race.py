import concurrent.futures,imaplib,json,pathlib,re,smtplib,ssl,socket,threading
cfg=json.loads(pathlib.Path('/keys/client.json').read_text());ctx=ssl.create_default_context(cafile='/keys/ca.pem')
class IMAP(imaplib.IMAP4_SSL):
 def _create_socket(self,timeout):return ctx.wrap_socket(socket.create_connection(('dovecot',993),timeout),server_hostname='mail.oxymot.fr')
def imap():
 s=IMAP('dovecot',993,ssl_context=ctx,timeout=15);s.login('second@oxymot.fr',cfg['second']);return s
seed=b'From: quota@dest.invalid\r\nSubject: concurrency seed\r\n\r\n'+b'x'*650000
body=b'From: quota@dest.invalid\r\nSubject: concurrency candidate\r\n\r\n'+b'y'*250000
with imap() as s:
 for folder in ['Race-Seed','Race-Append']:s.create(folder)
 assert s.append('Race-Seed',None,None,seed)[0]=='OK'
results=[]
for iteration in range(20):
 barrier=threading.Barrier(2)
 def append():
  with imap() as s:barrier.wait();return s.append('Race-Append',None,None,body)[0]
 def deliver():
  with smtplib.LMTP('/run/mail-sockets/lmtp',timeout=15) as s:
   s.ehlo();s.mail('external@dest.invalid');code,_=s.rcpt('mbx-22222222-2222-4222-8222-222222222222@local.invalid')
   if code!=250:barrier.wait();return code
   assert s.docmd('DATA')[0]==354;barrier.wait();s.send(body+b'\r\n.\r\n');return s.getreply()[0]
 with concurrent.futures.ThreadPoolExecutor(2) as pool:
  a=pool.submit(append);b=pool.submit(deliver);outcomes=[a.result(),b.result()]
 usage=0
 with imap() as s:
  for folder in ['INBOX','Race-Seed','Race-Append']:
   s.select(folder);kind,ids=s.search(None,'ALL')
   if ids[0]:
    data=s.fetch(ids[0].replace(b' ',b','),'(RFC822.SIZE)')[1];usage+=sum(int(x) for x in re.findall(rb'RFC822.SIZE (\d+)',b' '.join(x for x in data if isinstance(x,bytes))))
 results.append({'iteration':iteration,'append':outcomes[0],'lmtp':outcomes[1],'stored_bytes':usage,'quota_bytes':1048576})
 if usage>1048576:
  print(json.dumps({'status':'FAIL_CONCURRENT_QUOTA_OVERSHOOT','observations':results}));raise SystemExit(1)
 # Keep seed; remove only the explicit synthetic race candidates between rounds.
 with imap() as s:
  for folder in ['INBOX','Race-Append']:
   s.select(folder);ids=s.search(None,'ALL')[1][0]
   if ids:s.store(ids.replace(b' ',b','),'+FLAGS','(\\Deleted)');s.expunge()
print(json.dumps({'status':'PASS_CONCURRENT_QUOTA','observations':results}))
