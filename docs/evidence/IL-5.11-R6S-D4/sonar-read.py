import sys
sys.dont_write_bytecode=True
sys.path.insert(0,'/tmp/il511-r6s/docs/evidence/IL-5.11-D2')
from secure_evidence import EvidenceDirectory
import urllib.request,urllib.parse,json,datetime,hashlib
scope=sys.argv[1]
params={'componentKeys':'drumee_infra-layer','ps':'500','statuses':'OPEN,CONFIRMED,REOPENED'}
params.update({'branch':'main'} if scope=='main' else {'pullRequest':scope})
queries={'issues':'https://sonarcloud.io/api/issues/search?'+urllib.parse.urlencode(params)}
if scope=='main':queries['analysis']='https://sonarcloud.io/api/project_analyses/search?project=drumee_infra-layer&branch=main&ps=1'
with EvidenceDirectory.create() as out:
 print('EVIDENCE_ROOT='+str(out.path),flush=True);receipts=[]
 for name,url in queries.items():
  try:
   with urllib.request.urlopen(url,timeout=30) as response:data=response.read();code=response.status
   value=json.loads(data)
   with out.open_new(name+'.json') as f:f.write(data.decode())
   receipts.append({'url':url,'http_status':code,'sha256':hashlib.sha256(data).hexdigest(),'date':datetime.datetime.now(datetime.timezone.utc).isoformat()})
   if name=='issues':print(json.dumps({'scope':scope,'total':value.get('total'),'returned':len(value.get('issues',[]))}),flush=True)
   else:print(json.dumps(value.get('analyses',[])[:1]),flush=True)
  except urllib.error.HTTPError as error:
   receipts.append({'url':url,'http_status':error.code,'date':datetime.datetime.now(datetime.timezone.utc).isoformat()})
 out.write_json('http-receipts.json',receipts)
