"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs=require("node:fs"), path=require("node:path"), os=require("node:os");
const F=require("../../lib/filesystem-safety"), A=require("../../lifecycle/activation"), T=require("../../lifecycle/transitions");
test("lifecycle writers reject concurrent and stale locks without taking over",async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),"il3-lock-"));let release;const blocked=new Promise(resolve=>release=resolve);
  try { const writer=F.lockAsync(root,()=>blocked);await assert.rejects(()=>F.lockAsync(root,async()=>{}),{code:"RESOURCE_LOCKED"});release();await writer;fs.mkdirSync(path.join(root,".infra-lifecycle-lock"),{mode:0o700});await assert.rejects(()=>F.lockAsync(root,async()=>{}),{code:"RESOURCE_LOCKED"}); }
  finally{fs.rmSync(root,{recursive:true,force:true});}
});
test("corrupt renewal schedule and arbitrary provider errors never expose values",()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),"il3-renew-"));try {fs.writeFileSync(path.join(root,"renewal.json"),"private-sensitive-bad-json",{mode:0o600});assert.throws(()=>T.renewalTrigger(root,{authorized:true}),error=>error.code==="RENEWAL_STATE_CORRUPTED"&&!error.message.includes("private"));assert.equal(A.safeCode({code:"RAW_SECRET_123"}),"LIFECYCLE_OBSERVATION_FAILED");}finally{fs.rmSync(root,{recursive:true,force:true});}
});
test("configuration/image/schema/volume/secret changes have explicit compatibility classifications",()=>{
  const prior={revision:"a",fingerprints:[],composition:{instance_id:"instance",plan:{effective_domain:"drumee.lan"},resources:[],distribution:{schema_versions:{}},compose:{services:{redis:{image:"sha256:a"}}}}};const active={prepared:prior};
  assert.deepEqual(A.classifyChanges(active,prior),{categories:["no-op"],compatible:true});
  const image=structuredClone(prior);image.revision="b";image.composition.compose.services.redis.image="sha256:b";assert.ok(A.classifyChanges(active,image).categories.includes("image-upgrade"));
  const schema=structuredClone(image);schema.composition.distribution.schema_versions={kernel:"2"};assert.equal(A.classifyChanges(active,schema).compatible,false);
  const volume=structuredClone(image);volume.composition.resources=[{id:"new"}];assert.equal(A.classifyChanges(active,volume).compatible,false);
  const secret=structuredClone(image);secret.fingerprints=[{fingerprint:"new"}];assert.deepEqual(A.classifyChanges(active,secret),{categories:["secret-rotation"],compatible:false});
});
test("corrupt active pointer is rejected before any daemon request",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"il3-active-"));try{fs.writeFileSync(path.join(root,"active.json"),JSON.stringify({revision:"secret-value"}),{mode:0o600});assert.throws(()=>A.readActive(root),{code:"ACTIVE_STATE_CORRUPTED"});}finally{fs.rmSync(root,{recursive:true,force:true});}
});
test("filesystem helpers reject a replaced symlink mount before invoking Docker",()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),"il3-helper-"));try{const directory=path.join(root,"real");fs.mkdirSync(directory,{mode:0o700});const link=path.join(root,"link");fs.symlinkSync(directory,link);assert.throws(()=>require("../../lifecycle/docker").helper({project:"test",distribution:{helper_image:"invalid"}},link,"process.exit(0)"),{code:"UNSAFE_RESOURCE_PATH"});}finally{fs.rmSync(root,{recursive:true,force:true});}
});
test("a corrupted pre-existing rotation generation cannot be committed over a valid canonical secret", async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"il3-rotation-"));const secret_api=require("../../capabilities/secrets");const original_read=A.readActive,original_inspect=A.inspectDeployment;
 try{
  const owner="test-instance",ref={resource:"redis",key:"auth"},descriptor={ref,type:"redis-auth",consumers:["redis"]};const store=secret_api.createFilesystemSecretStore(path.join(root,"secrets"),owner);const before=store.ensure(descriptor,{authorized:true});
  const id="a".repeat(32),directory=path.join(root,"rotations",id);F.privateDirectory(directory,true);const staged=secret_api.createFilesystemSecretStore(path.join(directory,"secrets"),owner);const first=staged.import(descriptor,store.read(ref,"redis"),{authorized:true});const rotated=staged.rotate(descriptor,{authorized:true,expected_fingerprint:first.fingerprint,consumer_transition:"test"});
  const current=JSON.parse(F.read(path.join(directory,"secrets/redis/auth/current.json")));F.atomic(path.join(root,"secrets/redis/auth",current.generation+".secret"),"corrupted");
  F.atomic(path.join(directory,"rotation.json"),JSON.stringify({id,ref,type:"redis-auth",project:"test",previous_revision:"a".repeat(64),candidate_revision:"b".repeat(64),previous_fingerprint:before.fingerprint,candidate_fingerprint:rotated.fingerprint,consumers:["redis"],status:"transitioning"}));
  F.atomic(path.join(root,"pending-rotation.json"),JSON.stringify({id}));A.readActive=()=>({revision:"b".repeat(64),prepared:{instance_id:owner}});A.inspectDeployment=async()=>({ready:true});
  await assert.rejects(()=>T.finishRotation(root,id,{authorized:true,rotation_id:id}),{code:"SECRET_CORRUPTED"});assert.equal(store.inspect(ref).fingerprint,before.fingerprint);assert.equal(JSON.parse(F.read(path.join(directory,"rotation.json"))).status,"transitioning");
 }finally{A.readActive=original_read;A.inspectDeployment=original_inspect;fs.rmSync(root,{recursive:true,force:true});}
});
