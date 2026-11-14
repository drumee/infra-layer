"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),os=require("node:os"),path=require("node:path"),{spawn}=require("node:child_process");
const lock=require("../../capabilities/mail-service/lock");
test("mail lock is exclusive, preserves its inode and is released on process death",async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"mail-lock-test-"));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const script='require(process.argv[1])(process.argv[2],()=>{process.stdout.write("locked\\n");Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,60000);})';
 const child=spawn(process.execPath,["-e",script,require.resolve("../../capabilities/mail-service/lock"),root]);t.after(()=>child.kill("SIGKILL"));
 await new Promise((resolve,reject)=>{child.stdout.once("data",resolve);child.once("error",reject);child.once("exit",code=>{if(code)reject(Error("child failed"));});});
 const inode=fs.statSync(root+"/.mail-transport-lock").ino;assert.throws(()=>lock(root,()=>{}),{code:"RESOURCE_LOCKED"});
 const ended=new Promise(resolve=>child.once("exit",resolve));child.kill("SIGKILL");await ended;
 lock(root,()=>assert.equal(fs.statSync(root+"/.mail-transport-lock").ino,inode));
});
test("mail lock refuses a linked or unsafe lock without touching its target",t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"mail-lock-unsafe-"));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.writeFileSync(root+"/sentinel","retained",{mode:0o600});fs.linkSync(root+"/sentinel",root+"/.mail-transport-lock");assert.throws(()=>lock(root,()=>{}),{code:"MAIL_RESOURCE_IDENTITY_MISMATCH"});assert.equal(fs.readFileSync(root+"/sentinel","utf8"),"retained");
});
