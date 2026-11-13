"""Run inside the dedicated guest: snapshot, then verify after a real VM reboot."""
import hashlib,json,pathlib,subprocess,sys,time
report=pathlib.Path(sys.argv[2]);r=json.loads(report.read_text());base=pathlib.Path(r['private_root']);project=r['project'];compose=base/'compose.json'
def run(*args,ok=True):
 p=subprocess.run(args,capture_output=True,timeout=90)
 if ok and p.returncode:raise RuntimeError('guest command failed: '+str(args[:3]))
 return p

def queue():return sorted(json.loads(x)['queue_id'] for x in run('docker','compose','-p',project,'-f',str(compose),'exec','-T','postfix','postqueue','-c','/config','-j').stdout.splitlines())
def digests():
 result={}
 for root in [base/'service/durable/registry',base/'service/candidates']:
  for p in root.rglob('*'):
   if p.is_file() and not p.is_symlink():result[str(p.relative_to(base))]=hashlib.sha256(p.read_bytes()).hexdigest()
 # Body files, unlike mutable index/cache files, must survive byte-for-byte.
 for p in (base/'service/durable/mailboxes').rglob('*'):
  if p.is_file() and p.parent.name in ['cur','new']:result[str(p.relative_to(base))]=hashlib.sha256(p.read_bytes()).hexdigest()
 return result
snapshot=base/'vm-before.json';boot=pathlib.Path('/proc/sys/kernel/random/boot_id').read_text().strip()
if sys.argv[1]=='snapshot':
 assert r['status']=='PASS_IMPLEMENTED_SUBSET' and r['runtime_retained']
 q=queue();assert q
 snapshot.write_text(json.dumps({'boot_id':boot,'queue_ids':q,'files':digests()}));snapshot.chmod(0o600)
 print(json.dumps({'snapshot':str(snapshot),'queue_count':len(q),'boot_id':boot}))
else:
 previous=json.loads(snapshot.read_text());assert previous['boot_id']!=boot
 for _ in range(120):
  p=run('docker','inspect',project+'-postfix-1',ok=False)
  if p.returncode==0 and json.loads(p.stdout)[0]['State'].get('Health',{}).get('Status')=='healthy':break
  time.sleep(1)
 assert previous['queue_ids']==queue();assert previous['files']==digests()
 # Both restored sockets must be real Unix sockets, not stale files.
 run('docker','exec',project+'-postfix-1','/bin/sh','-ec','test -S /run/mail-sockets/lmtp; test -S /run/mail-sockets/auth')
 common=['docker','run','--rm','--network',project+'-edge','--user','1000:1000','--mount','type=bind,source='+str(pathlib.Path(__file__).parent)+',target=/lab,readonly','--mount','type=bind,source='+str(base/'keys')+',target=/keys,readonly','--entrypoint','python3','sha256:36afa984f1187ff7fef17356fa7ead13af9a756681ac4a0c234a58fdc38f47e8','/lab/client.py']
 observed=json.loads(run(*(common+['imap','contact@oxymot.fr','inbound-primary'])).stdout);assert len(observed['matches'])==1
 # Missing and wrong spool refuse before any writer can activate. Keep original intact.
 run('docker','compose','-p',project,'-f',str(compose),'stop','postfix')
 source=base/'service/durable/spool';saved=source.with_name('spool-retained-for-guard');source.rename(saved)
 try:
  p=run('docker','compose','-p',project,'-f',str(compose),'start','postfix',ok=False);assert p.returncode!=0
  source.mkdir(mode=0o700)
  (source/'.infra-owner').write_text('{"owner":"foreign","resource":"mail-queue"}')
  run('docker','compose','-p',project,'-f',str(compose),'up','-d','postfix',ok=False)
  # unless-stopped may report Running during a restart transition. Observe the
  # native guard exit first, then stop the restart loop before checking writers.
  for _ in range(100):
   state=json.loads(run('docker','inspect',project+'-postfix-1').stdout)[0]['State']
   if state['ExitCode']==78:break
   time.sleep(.1)
  assert state['ExitCode']==78
  run('docker','compose','-p',project,'-f',str(compose),'stop','postfix')
  state=json.loads(run('docker','inspect',project+'-postfix-1').stdout)[0]['State'];assert not state['Running']
 finally:
  run('docker','compose','-p',project,'-f',str(compose),'stop','postfix',ok=False)
  if source.exists():
   for p in source.iterdir():p.unlink()
   source.rmdir()
  saved.rename(source)
 run('docker','compose','-p',project,'-f',str(compose),'start','postfix');time.sleep(3);assert previous['queue_ids']==queue()
 result={'status':'PASS_REBOOT_AND_SPOOL_GUARDS','before_boot':previous['boot_id'],'after_boot':boot,'queue_ids':previous['queue_ids'],'preserved_files':len(previous['files']),'imap_primary_readable':True,'unix_sockets_recreated':True,'missing_spool_refused':True,'wrong_spool_exit':78,'original_source_preserved':True}
 (base/'vm-result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
