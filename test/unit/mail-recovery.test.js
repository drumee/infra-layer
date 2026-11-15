"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const M=require("../../capabilities/mail-service");
test("offline rebind requires explicit authorization and checkpoint identity",()=>{
  assert.throws(()=>M.rebindMailServiceStorage({},{}),/MAIL_ACTIVATION_UNAUTHORIZED/);
  assert.throws(()=>M.rebindMailServiceStorage({},{authorized:true,checkpoint:"mutable"}),/MAIL_ACTIVATION_UNAUTHORIZED/);
});
test("normal lifecycle refuses fenced source before activation",()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),"mail-recovery-fence-"));
  try {
    fs.writeFileSync(path.join(root,"recovery-fence.json"),JSON.stringify({phase:"captured"}),{mode:0o600});
    for(const operation of ["start","restart","preflight"])
      assert.throws(()=>M.operateMailService({root},operation,{authorized:true,acceptance:true}),/MAIL_RECOVERY_FENCED/);
  }finally{fs.unlinkSync(path.join(root,"recovery-fence.json"));fs.rmdirSync(root);}
});
