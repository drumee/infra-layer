"""Pure public-API cost probe in bounded child processes; no network or service action.
Usage: python3 image-validation-cost.py BASELINE_TREE CANDIDATE_TREE
Both source trees must be selected/verified by the caller. Never executes input as code.
"""
import json, os, resource, subprocess, sys
WORKER = r"""
const path=require('node:path'),root=process.argv[1],n=+process.argv[2],family=process.argv[3];
const api=require(path.join(root,'lib')), {inputs}=require(path.join(root,'test/support/inputs'));
const v=inputs();v.adapter_input.image=(family==='colon'?'r:':'-')+'0'.repeat(n)+'@sha256:'+'f'.repeat(63)+'!';
const start=performance.now();const p=api.planInfrastructure(v.spec,v.requirements,v.adapter_input);
if(p.applicable||!p.diagnostics.some(x=>x.field==='adapter.image'&&x.code==='INCOMPATIBLE_ADAPTER_CONFIGURATION'))throw Error('VALIDATION_CONTRACT_CHANGED');
console.log(JSON.stringify({n,family,input_length:v.adapter_input.image.length,ms:performance.now()-start,refused:true}));
"""
def limits():
    resource.setrlimit(resource.RLIMIT_CPU, (2, 2))
    resource.setrlimit(resource.RLIMIT_NOFILE, (64, 64))
results=[]
for label, root in zip(['baseline','candidate'],sys.argv[1:3]):
    for family in ['plain','colon']:
        for n in [1024,4096,8192,16384,32768,65536]:
            try:
                p=subprocess.run(['/usr/bin/node','--max-old-space-size=64','-e',WORKER,os.path.realpath(root),str(n),family],capture_output=True,text=True,timeout=3,env={'PATH':'/usr/bin:/bin','LANG':'C','LC_ALL':'C'},cwd='/tmp',preexec_fn=limits)
                row=json.loads(p.stdout) if p.returncode==0 else {'n':n,'family':family,'limit_or_exit':p.returncode}
            except subprocess.TimeoutExpired:
                row={'n':n,'family':family,'wall_timeout':True}
            row['source']=label;results.append(row)
print(json.dumps({'cpu_limit_seconds':2,'wall_timeout_seconds':3,'js_heap_mib':64,'network_operations':False,'results':results},indent=2))
