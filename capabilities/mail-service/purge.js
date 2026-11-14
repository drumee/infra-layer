"use strict";
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const F=require("../../lib/filesystem-safety"),V=require("./validation");
const {resolveTrustedExecutable,systemEnvironment}=require("../../internal/system-tools");
// Also used by the isolated backup fixture. Never emits message contents.
function inventory(root){
 const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),entries=Object.create(null),links=new Map();let count=0;
 function hash(file){const h=crypto.createHash("sha256"),fd=fs.openSync(file,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW),buffer=Buffer.alloc(65536);try{let n;while((n=fs.readSync(fd,buffer,0,buffer.length,null)))h.update(buffer.subarray(0,n));return h.digest("hex");}finally{fs.closeSync(fd);}}
 function visit(relative){
  if(++count>100000)throw Error("MAIL_INTEGRITY_FAILURE");
  const file=path.join(root,relative),s=fs.lstatSync(file,{bigint:true});
  if((!s.isDirectory()&&!s.isFile())||s.uid!==5000n||s.gid!==5000n||(s.mode&0o022n)!==0n||(s.mode&0o7000n)!==0n||s.isFile()&&(s.mode&0o111n)!==0n)throw Error("MAIL_STORAGE_UNSAFE");
  const e={type:s.isDirectory()?"directory":"file",uid:Number(s.uid),gid:Number(s.gid),mode:Number(s.mode&0o7777n),mtime_ns:String(s.mtimeNs)};entries[relative]=e;
  if(s.isDirectory()){for(const name of fs.readdirSync(file).sort())visit(relative?relative+"/"+name:name);}
  else{e.size=Number(s.size);e.sha256=hash(file);const key=s.dev+":"+s.ino;if(!links.has(key))links.set(key,[]);links.get(key).push({relative,nlink:Number(s.nlink)});}
 }
 visit("");
 for(const group of links.values())for(const value of group){if(value.nlink!==group.length)throw Error("MAIL_STORAGE_UNSAFE");if(group.length>1)entries[value.relative].link_group=group.map(x=>x.relative).sort()[0];}
 return entries;
}
function helper(input){
 const fs=require("node:fs"),crypto=require("node:crypto");
 const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
 const digest=v=>crypto.createHash("sha256").update(JSON.stringify(canonical(v))).digest("hex");
 const source=inventory("/source"),backup=inventory("/backup");
 if(digest(backup)!==input.snapshot_digest)throw Error("MAIL_INTEGRITY_FAILURE");
 for(const name of ["active","deferred","incoming","maildrop","hold","corrupt","saved","bounce","defer","trace","flush"]){
  const base="/queue/"+name;
  if(!fs.existsSync(base)){if(["active","deferred","incoming","maildrop","hold","corrupt"].includes(name))throw Error("MAIL_STORAGE_UNSAFE");continue;}
  function empty(dir){for(const name of fs.readdirSync(dir)){const file=dir+"/"+name,s=fs.lstatSync(file);if(!s.isDirectory())throw Error("MAIL_PURGE_REFERENCED");empty(file);}}
  empty(base);
 }
 if(!input.resume){if(digest(source)!==input.snapshot_digest)throw Error("MAIL_INTEGRITY_FAILURE");}
 else for(const [name,e] of Object.entries(source)){
  const old=backup[name];if(!old)throw Error("MAIL_INTEGRITY_FAILURE");
  const stable=v=>Object.fromEntries(Object.entries(v).filter(([k])=>k!=="link_group"&&(e.type!=="directory"||k!=="mtime_ns")));
  if(digest(stable(e))!==digest(stable(old)))throw Error("MAIL_INTEGRITY_FAILURE");
 }
 const lock=source["home/.drumee-quota.lock"];if(lock&&(lock.type!=="file"||lock.size!==0||lock.mode!==0o600||lock.link_group!==undefined))throw Error("MAIL_STORAGE_UNSAFE");
 const preserved=new Set(["","home","Maildir","Maildir/cur","Maildir/new","Maildir/tmp","home/.drumee-quota.lock"]);
 for(const relative of ["","home","Maildir","Maildir/cur","Maildir/new","Maildir/tmp"]){const s=fs.lstatSync("/source/"+relative);const expected=input.identities[relative?"/"+relative:""];if(!expected||s.dev!==expected.dev||s.ino!==expected.ino||(s.mode&0o7777)!==0o700||s.uid!==5000||s.gid!==5000)throw Error("MAIL_RESOURCE_IDENTITY_MISMATCH");}
 let erased=0;
 if(input.erase){
  for(const name of Object.keys(source).sort((a,b)=>b.split("/").length-a.split("/").length||b.localeCompare(a))){
   if(preserved.has(name))continue;
   const file="/source/"+name;if(source[name].type==="directory")fs.rmdirSync(file);else{fs.unlinkSync(file);erased++;}
  }
  for(const relative of ["home","Maildir/cur","Maildir/new","Maildir/tmp","Maildir",""]){const fd=fs.openSync("/source/"+relative,"r");try{fs.fsyncSync(fd);}finally{fs.closeSync(fd);}}
 }
 return {valid:true,erased_files:erased,remaining_entries:input.erase?0:Object.keys(source).filter(k=>!preserved.has(k)).length,source_digest:digest(source),backup_digest:input.snapshot_digest};
}
function runHelper(prepared,input,backup,identities,resume,erase){
 const image=prepared.compose.services.policy.image;
 const code="const inventory="+inventory.toString()+";const helper="+helper.toString()+";try{console.log(JSON.stringify(helper(JSON.parse(require('node:fs').readFileSync(0)))));}catch(e){console.log(JSON.stringify({valid:false,code:/^[A-Z0-9_]+$/.test(e.message)?e.message:'MAIL_INTEGRITY_FAILURE'}));process.exitCode=1;}";
 const args=["--host","unix:///var/run/docker.sock","run","--rm","-i","--network","none","--read-only","--user","0:0","--cap-drop","ALL","--cap-add","DAC_OVERRIDE","--security-opt","no-new-privileges:true","--memory","268435456","--cpus","1","--pids-limit","32","--mount",`type=bind,source=${prepared.root}/durable/mailboxes/${input.mailbox_id},target=/source${erase?"":",readonly"}`,"--mount",`type=bind,source=${backup}/data,target=/backup,readonly`,"--mount",`type=bind,source=${prepared.root}/durable/spool,target=/queue,readonly`,"--entrypoint","node",image,"-e",code];
 const manifest=JSON.parse(F.read(backup+"/manifest.json"));
 const r=spawnSync(resolveTrustedExecutable("docker"),args,{env:systemEnvironment("docker"),input:JSON.stringify({snapshot_digest:V.digest(manifest.snapshot),identities,resume,erase}),encoding:"utf8",maxBuffer:1048576,timeout:120000});
 let result;try{result=JSON.parse(r.stdout);}catch{V.fail("MAIL_DEPENDENCY_UNAVAILABLE");}
 if(r.status!==0||!result.valid)V.fail(["MAIL_STORAGE_UNSAFE","MAIL_INTEGRITY_FAILURE","MAIL_RESOURCE_IDENTITY_MISMATCH","MAIL_PURGE_REFERENCED"].includes(result.code)?result.code:"MAIL_DEPENDENCY_UNAVAILABLE");
 return result;
}
function control(prepared,input,context,tools){
 if(context?.authorized!==true||context.tombstone!==true||!input||Object.keys(input).some(k=>!["spec","mailbox_id","backup_id","operation_id","expected_generation","erase","precheck"].includes(k)))V.fail("MAIL_ACTIVATION_UNAUTHORIZED");
 const checked=V.validateMailService(input.spec);
 if(input.precheck!==undefined&&typeof input.precheck!=="boolean"||typeof input.erase!=="boolean"||!checked.valid||V.digest(checked.normalized)!==prepared.transport_digest||!/^[a-f0-9-]{36}$/.test(input.mailbox_id)||!/^[a-f0-9-]{36}$/.test(input.operation_id)||!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(input.backup_id))V.fail("MAIL_VALIDATION");
 tools.verifyPrepared(prepared);
 return tools.mailLock(prepared.root,()=>{
  const root=prepared.root,state=root+"/durable/operator-state",pub=root+"/durable/registry/public";
  const runtime=JSON.parse(F.read(root+"/candidates/"+F.read(state+"/runtime-revision").toString()+"/prepared.json"));tools.verifyRuntime(runtime);
  const staticFiles=p=>Object.fromEntries(Object.entries(p.files).filter(([k])=>k==="policy.js"||k.startsWith("config/")));
  if(V.digest(staticFiles(prepared))!==V.digest(staticFiles(runtime)))V.fail("MAIL_RUNTIME_UPGRADE_REQUIRED");
  const receiptFile=state+"/purge-"+input.operation_id+".json",existing=fs.existsSync(receiptFile)?JSON.parse(F.read(receiptFile)):null;
  if(existing&&(!["validated","executing","erased","applied"].includes(existing.phase)||Object.keys(existing).sort().join(",")!=="identity,phase,previous_registry"))V.fail("MAIL_INTEGRITY_FAILURE");
  const resumeLive=input.erase&&existing&&["erased","applied"].includes(existing.phase)&&existing.identity.target===prepared.revision&&existing.identity.operation_id===input.operation_id&&existing.identity.mailbox_id===input.mailbox_id&&existing.identity.backup_id===input.backup_id&&fs.existsSync(pub+"/admission-closed");
  const running=tools.docker(["ps","-q"]).trim().split("\n").filter(Boolean);
  for(const id of running){const container=JSON.parse(tools.docker(["inspect",id]))[0],own=container.Config.Labels?.["com.docker.compose.project"]===prepared.project;const permitted=resumeLive&&own&&["postfix","dovecot","opendkim","policy"].includes(container.Config.Labels?.["com.docker.compose.service"]);if(!permitted&&(own||container.Mounts.some(m=>(m.Name===prepared.compose.volumes.sockets.name||m.Source&&(m.Source===root||m.Source.startsWith(root+"/")||root.startsWith(m.Source+"/"))))))V.fail("MAIL_PURGE_REFERENCED");}
  const unresolved=state+"/unresolved-deliveries.json";
  if(fs.existsSync(unresolved)){const values=JSON.parse(F.read(unresolved));if(!Array.isArray(values)||values.length)V.fail("MAIL_PURGE_REFERENCED");}
  const previous=JSON.parse(F.read(pub+"/current.json")),next=JSON.parse(F.read(path.dirname(prepared.compose_file)+"/registry.json"));
  const box=previous.mailboxes.find(b=>b.id===input.mailbox_id);
  if(!box||box.receive_enabled||box.imap_enabled||box.submission_enabled)V.fail("MAIL_VALIDATION");
  if(![input.expected_generation,next.generation].includes(previous.generation)||!existing&&previous.generation!==input.expected_generation||(!input.precheck&&next.generation<=input.expected_generation)||input.precheck&&next.generation!==input.expected_generation)V.fail("MAIL_REVISION_CONFLICT");
  const normalized=r=>({...r,generation:0,mailboxes:r.mailboxes.map(b=>({...b,credential_generation:b.credential_generation||input.expected_generation}))});
  if(V.digest(normalized(previous))!==V.digest(normalized(next)))V.fail("MAIL_VALIDATION");
  const backupRoot=checked.normalized.deployment.backup_root;if(!fs.existsSync(backupRoot+"/owner.json"))V.fail("MAIL_NOT_FOUND");F.privateDirectory(backupRoot);
  const backupOwner=JSON.parse(F.read(backupRoot+"/owner.json"));
  if(V.digest(backupOwner)!==V.digest({contract:"drumee.mail-backup-owner/1",service_id:checked.normalized.deployment.id,uid:process.getuid(),gid:process.getgid()}))V.fail("MAIL_RESOURCE_IDENTITY_MISMATCH");
  const backup=backupRoot+"/mailboxes/"+input.mailbox_id+"/"+input.backup_id;if(!fs.existsSync(backup+"/manifest.json"))V.fail("MAIL_NOT_FOUND");F.privateDirectory(backup);
  if(fs.statSync(backup+"/manifest.json").size>33554432)V.fail("MAIL_INTEGRITY_FAILURE");
  const manifest=JSON.parse(F.read(backup+"/manifest.json"));
  if(Object.keys(manifest).sort().join(",")!=="backup_id,contract,mailbox_id,service_id,snapshot"||manifest.contract!=="drumee.mailbox-purge-backup/1"||manifest.mailbox_id!==input.mailbox_id||manifest.backup_id!==input.backup_id||manifest.service_id!==checked.normalized.deployment.id||!manifest.snapshot||typeof manifest.snapshot!=="object")V.fail("MAIL_INTEGRITY_FAILURE");
  const identity={operation_id:input.operation_id,mailbox_id:input.mailbox_id,backup_id:input.backup_id,target:prepared.revision,generation:next.generation,manifest_digest:V.digest(manifest)};
  if(existing&&(!["validated","executing","erased","applied"].includes(existing.phase)||Object.keys(existing).sort().join(",")!=="identity,phase,previous_registry"))V.fail("MAIL_INTEGRITY_FAILURE");
  if(existing&&V.digest(existing.identity)!==V.digest(identity))V.fail("MAIL_REQUEST_CONFLICT");
  const resume=existing&&["executing","erased","applied"].includes(existing.phase);
  const observed=runHelper(prepared,input,backup,prepared.mailbox_identities[input.mailbox_id],resume,false);
  if(input.precheck)return {validated:true,generation:previous.generation};
  const receipt=existing||{identity,phase:"validated",previous_registry:previous};
  if(!existing)F.atomic(receiptFile,JSON.stringify(receipt));
  // Durable intent precedes admission closure. No desired SQLite commit precedes this call.
  F.atomic(state+"/registry-intent.json",JSON.stringify({from:input.expected_generation,to:next.generation,revision:prepared.revision,previous_registry:receipt.previous_registry,phase:"applying"}));
  F.atomic(pub+"/admission-closed",JSON.stringify({from:input.expected_generation,to:next.generation,reason:"purge"}));
  if(!input.erase)return {validated:true,generation:next.generation};
  if(existing&&["erased","applied"].includes(existing.phase)){if(observed.remaining_entries!==0)V.fail("MAIL_INTEGRITY_FAILURE");return {erased:true,erased_files:0,backup_verified:observed.backup_digest,retained_identity:true};}
  F.atomic(receiptFile,JSON.stringify({...receipt,phase:"executing"}));
  const erased=runHelper(prepared,input,backup,prepared.mailbox_identities[input.mailbox_id],true,true);
  F.atomic(receiptFile,JSON.stringify({...receipt,phase:"erased"}));
  return {erased:true,erased_files:erased.erased_files,backup_verified:observed.backup_digest,retained_identity:true};
 });
}
module.exports={inventory,control};
