import subprocess, pathlib, time, json, os, re, hashlib, threading, datetime
cwd=pathlib.Path('/tmp/il511-D2-clean'); out=pathlib.Path('/tmp/il511-D2-results');out.mkdir(exist_ok=True)
source=subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=cwd,text=True).strip()
assert not subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','--untracked-files=all'],cwd=cwd,text=True).strip()
env=dict(os.environ,npm_config_cache='/tmp/drumee-il511r-npm-cache')
results=[]
for index in range(1,4):
 start=time.monotonic(); date=datetime.datetime.now(datetime.timezone.utc).isoformat(); log=out/f'services-{index}.txt'; samples=[]; project=[None]; done=threading.Event()
 def observe():
  while not done.is_set():
   sample={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsed_s':time.monotonic()-start,'loadavg':pathlib.Path('/proc/loadavg').read_text().strip(),'memory':{l.split(':')[0]:l.split(':')[1].strip() for l in pathlib.Path('/proc/meminfo').read_text().splitlines() if l.startswith(('MemAvailable:','SwapFree:'))},'pressure':{n:(pathlib.Path('/proc/pressure')/n).read_text().strip() for n in ['cpu','io','memory']}}
   if project[0]:
    ids=subprocess.check_output(['/usr/bin/docker','ps','-q','--filter','label=com.docker.compose.project='+project[0]],text=True).split()
    if ids:
     stats=subprocess.run(['/usr/bin/docker','stats','--no-stream','--format','{{json .}}',*ids],capture_output=True,text=True,timeout=20)
     sample['docker_stats_exit']=stats.returncode;sample['docker_stats']=[json.loads(l) for l in stats.stdout.splitlines() if l.startswith('{')]
   samples.append(sample);done.wait(10)
 thread=threading.Thread(target=observe);thread.start()
 with log.open('w') as f:
  process=subprocess.Popen(['/usr/bin/npm','run','test:services'],cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
  for line in process.stdout:
   f.write(line);f.flush()
   match=re.search(r'"project":"(drumee-il2-test-[a-f0-9]+)"',line)
   if match:project[0]=match.group(1)
  code=process.wait()
 done.set();thread.join()
 text=log.read_text(); scoped={}
 if project[0]:
  for kind,cmd in [('containers',['ps','-a']),('networks',['network','ls'])]:
   scoped[kind]=subprocess.check_output(['/usr/bin/docker',*cmd,'--filter','label=com.docker.compose.project='+project[0],'--format','{{.ID}}'],text=True).split()
 passed=code==0 and '# pass 17' in text and '# fail 0' in text and '# skipped 0' in text and 'IL2 owned resources cleaned: '+str(project[0]) in text and scoped=={'containers':[],'networks':[]}
 receipt={'run':index,'source':source,'started_utc':date,'elapsed_s':time.monotonic()-start,'exit_code':code,'pass':passed,'project':project[0],'cleanup_readback':scoped,'log_sha256':hashlib.sha256(log.read_bytes()).hexdigest(),'samples':samples}
 (out/f'services-{index}.json').write_text(json.dumps(receipt,indent=2)+'\n');results.append(receipt)
 print(json.dumps({k:v for k,v in receipt.items() if k!='samples'}),flush=True)
 if not passed:break
(out/'campaign-summary.json').write_text(json.dumps({'source':source,'planned_runs':3,'actual_runs':len(results),'all_pass':len(results)==3 and all(x['pass'] for x in results),'results':[ {k:v for k,v in x.items() if k!='samples'} for x in results]},indent=2)+'\n')
