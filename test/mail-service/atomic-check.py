"""Synthetic quota probes. Only explicitly created folders/correlations are removed."""
import concurrent.futures,email.utils,imaplib,json,pathlib,re,smtplib,ssl,socket,sys,threading,time,uuid
cfg=json.loads(pathlib.Path('/keys/client.json').read_text());ctx=ssl.create_default_context(cafile='/keys/ca.pem');tag='atomic-'+uuid.uuid4().hex
class IMAP(imaplib.IMAP4_SSL):
 def _create_socket(self,timeout):return ctx.wrap_socket(socket.create_connection(('dovecot',993),timeout),server_hostname='mail.oxymot.fr')
def login(user='second'):
 s=IMAP('dovecot',993,ssl_context=ctx,timeout=20);s.login(user+'@oxymot.fr',cfg[user]);return s
def body(size,label):return ('From: outside@dest.invalid\r\nMessage-ID: <'+tag+'-'+label+'@fixture.invalid>\r\nSubject: '+tag+'\r\n\r\n').encode()+b'x'*size
def usage(s,folders):
 total=0
 for folder in folders:
  assert s.select(folder)[0]=='OK';ids=s.search(None,'ALL')[1][0]
  if ids:
   rows=s.fetch(ids.replace(b' ',b','),'(RFC822.SIZE)')[1];total+=sum(map(int,re.findall(rb'RFC822.SIZE (\d+)',b' '.join(x for x in rows if isinstance(x,bytes)))))
 return total
def cleanup(s,folders):
 s.select('INBOX');ids=s.search(None,'HEADER','Message-ID',tag)[1][0]
 if ids:s.store(ids.replace(b' ',b','),'+FLAGS','(\\Deleted)');s.expunge()
 for folder in folders:
  s.select(folder);ids=s.search(None,'ALL')[1][0]
  if ids:s.store(ids.replace(b' ',b','),'+FLAGS','(\\Deleted)');s.expunge()
  s.select('INBOX');s.delete(folder)
action=sys.argv[1]
if action in ['high','fits','copy-race','move-race']:
 folders=[tag+'-seed',tag+'-append'];seed=650000 if action=='high' else 400000 if action.endswith('-race') else 300000
 if action.endswith('-race'):folders.append(tag+'-source')
 with login() as s:
  for f in folders:assert s.create(f)[0]=='OK'
  assert s.append(folders[0],None,None,body(seed,'seed'))[0]=='OK'
  if action.endswith('-race'):assert s.append(folders[2],None,None,body(250000,'source'))[0]=='OK'
 barrier=threading.Barrier(2);timings={}
 def append():
  with login() as s:
   if action.endswith('-race'):s.select(folders[2])
   barrier.wait();timings['append_start']=time.monotonic();r=(s.copy('1',folders[1]) if action=='copy-race' else s.xatom('MOVE','1',folders[1]) if action=='move-race' else s.append(folders[1],None,None,body(250000,'append')))[0];timings['append_end']=time.monotonic();return r
 def lmtp():
  with smtplib.LMTP('/run/mail-sockets/lmtp',timeout=20) as s:
   s.ehlo();s.mail('outside@dest.invalid');assert s.rcpt('mbx-22222222-2222-4222-8222-222222222222@local.invalid')[0]==250;assert s.docmd('DATA')[0]==354
   barrier.wait();timings['lmtp_start']=time.monotonic();s.send(body(250000,'lmtp')+b'\r\n.\r\n');r=s.getreply()[0];timings['lmtp_end']=time.monotonic();return r
 with concurrent.futures.ThreadPoolExecutor(2) as pool:
  a=pool.submit(append);b=pool.submit(lmtp);a,b=a.result(),b.result()
 with login() as s:
  size=usage(s,['INBOX',*folders]);assert size<=1048576
  assert (a=='OK' and b==250) if action=='fits' else ((a=='OK')+(b==250)>=1) if action=='move-race' else ((a=='OK')+(b==250)==1)
  assert max(timings['append_start'],timings['lmtp_start'])<min(timings['append_end'],timings['lmtp_end'])
  result={'status':'PASS_ATOMIC_'+action.upper(),'append':a,'lmtp':b,'virtual_bytes':size,'quota_bytes':1048576,'overlap_observed':True,'timings':timings};cleanup(s,folders)
 print(json.dumps(result))
elif action=='copy-move':
 folders=[tag+'-a',tag+'-b',tag+'-c']
 with login() as s:
  for f in folders:assert s.create(f)[0]=='OK'
  assert s.append(folders[0],None,None,body(600000,'large'))[0]=='OK';s.select(folders[0]);copy=s.copy('1',folders[1])[0];move=s.xatom('MOVE','1',folders[2])[0];assert copy==move=='NO';assert usage(s,['INBOX',*folders])<1048576
  cleanup(s,folders)
 with login() as s:
  for f in folders:assert s.create(f)[0]=='OK'
  assert s.append(folders[0],None,None,body(200000,'small'))[0]=='OK';s.select(folders[0]);assert s.copy('1',folders[1])[0]=='OK';before=usage(s,['INBOX',*folders]);s.select(folders[0]);assert s.xatom('MOVE','1',folders[2])[0]=='OK';after=usage(s,['INBOX',*folders]);assert before==after;cleanup(s,folders)
 print(json.dumps({'status':'PASS_ATOMIC_COPY_MOVE','excess_copy':copy,'move_without_staging_headroom':move,'positive_move_preserves_virtual_bytes':before}))
elif action=='hold':
 s=login();folder=tag+'-hold';s.create(folder);s.select(folder);wire=body(250000,'interrupted');s.send(b'HOLD APPEND '+folder.encode()+b' {'+str(len(wire)).encode()+b'}\r\n');line=s.readline();assert line.startswith(b'+');s.send(wire[:1000]);pathlib.Path('/control/held.json').write_text(json.dumps({'folder':folder,'tag':tag}));time.sleep(30)
 try:s.noop();raise AssertionError('interrupted worker survived')
 except (OSError,imaplib.IMAP4.error):pass
 print(json.dumps({'status':'PASS_INTERRUPTED_APPEND_DISCONNECTED'}))
else:raise ValueError('unknown atomic probe')
