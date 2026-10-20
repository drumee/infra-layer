"use strict";
const { trustedExecutable, trustedEnvironment } = require("../support/trusted-process");
// Test-only stderr capture with secret scrubbing. Production drops raw errors.
const { execFileSync }=require("node:child_process"), path=require("node:path"),fs=require("node:fs");
const driver=require("../../lifecycle/docker"),secrets=require("../../capabilities/secrets");
module.exports={...driver,compose(prepared,args,options={}){
  try{return execFileSync(trustedExecutable("docker"),["--host","unix:///var/run/docker.sock","compose","-p",prepared.project,"-f",prepared.compose_file,...args],{encoding:"utf8",stdio:"pipe",timeout:180000,maxBuffer:8*1024*1024,...options,env:trustedEnvironment(options.env)});}
  catch(error){let diagnostic=String(error.stderr||"");for(const directory of new Set([prepared.secret_store,path.join(prepared.root,"secrets")]))if(fs.existsSync(directory)){const store=secrets.createFilesystemSecretStore(directory,prepared.instance_id);for(const item of prepared.fingerprints)try{diagnostic=diagnostic.split(store.read(item.ref,item.consumers[0]).toString()).join("[redacted]");}catch{ /* Keep the owning test failure; optional cleanup or diagnostic data may be unavailable. */ }}
    if(diagnostic.includes("PRIVATE KEY"))diagnostic="PRIVATE_MATERIAL_DIAGNOSTIC_SUPPRESSED";console.error("IL3 test-only "+args[0]+": "+diagnostic.slice(-2000));throw Object.assign(Error("DOCKER_LIFECYCLE_COMMAND_FAILED"),{code:"DOCKER_LIFECYCLE_COMMAND_FAILED"});}
}};
