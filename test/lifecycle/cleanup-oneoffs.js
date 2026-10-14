"use strict";
// Harness recovery only: never invoked by production activation or restoration.
const assert=require("node:assert/strict"),driver=require("../../lifecycle/docker");
function cleanupOneoffs(prepared) {
  const ids=driver.docker(["ps","-a","--filter","label=com.docker.compose.project="+prepared.project,"--format","{{.ID}}"] ).trim().split("\n").filter(Boolean);
  const observed=ids.map(id=>JSON.parse(driver.docker(["inspect","--format",'{"id":{{json .Id}},"owner":{{json (index .Config.Labels "org.drumee.infra.owner")}},"project":{{json (index .Config.Labels "com.docker.compose.project")}},"service":{{json (index .Config.Labels "com.docker.compose.service")}},"oneoff":{{json (index .Config.Labels "com.docker.compose.oneoff")}}}',id])));
  for(const value of observed){assert.equal(value.owner,prepared.project);assert.equal(value.project,prepared.project);assert.ok(prepared.compose.services[value.service]);assert.match(value.id,/^[a-f0-9]{64}$/);}
  for(const value of observed)if(String(value.oneoff).toLowerCase()==="true")driver.docker(["rm","--force",value.id]);
}
module.exports={cleanupOneoffs};
