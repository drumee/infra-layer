"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {credentials}=require("../../capabilities/mail-service/render");
test("mail verifiers require the qualified Argon2id format and parameters",()=>{
 const id="11111111-1111-4111-8111-111111111111",registry={generation:1,mailboxes:[{id,address:"contact@example.invalid",quota_bytes:1048576,imap_enabled:true,submission_enabled:false}],accounts:[]};
 const value="{ARGON2ID}$argon2id$v=19$m=65536,t=3,p=1$"+"A".repeat(22)+"$"+"B".repeat(43);
 assert.equal(credentials(registry,{[id]:value})["imap.passwd"],"contact@example.invalid:"+value+"\n");
 for(const weak of [value.replace("65536","8192"),value.replace("t=3","t=1"),value.replace("p=1","p=2"),value.replace("v=19","v=16"),value.replace("ARGON2ID","PLAIN"),"{ARGON2ID}"+"x".repeat(64),value+"\n"]){assert.throws(()=>credentials(registry,{[id]:weak}),{code:"MAIL_VERIFIER_INVALID"});}
});
