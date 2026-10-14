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
