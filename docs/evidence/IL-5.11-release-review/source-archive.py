from pathlib import Path
import urllib.request,hashlib,base64,json,tarfile,io,subprocess,datetime
root=Path('/tmp/il511-release-main');out=Path('/tmp/il511-release-postmerge');out.mkdir(exist_ok=True);sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();assert sha=='a02b76e4c421e96e63406d7b10edc2b76a6056c1'
url=f'https://github.com/drumee/infra-layer/archive/{sha}.tar.gz'
with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'IL-5.11-Release-Review'}),timeout=60) as response:
 data=response.read();final_url=response.geturl();status=response.status;etag=response.headers.get('ETag')
(out/'infra-layer-source.tar.gz').write_bytes(data)
tracked=subprocess.check_output(['git','ls-tree','-rz','--full-tree','HEAD'],cwd=root).split(b'\0');expected={}
for record in tracked:
 if not record:continue
 head,name=record.split(b'\t',1);mode,kind,blob=head.decode().split();assert kind=='blob';expected[name.decode()]={'mode':mode,'blob':blob}
seen={}
with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as archive:
 roots={m.name.split('/')[0] for m in archive.getmembers()};assert len(roots)==1
 for m in archive.getmembers():
  if m.isdir():continue
  name=m.name.split('/',1)[1];assert name in expected;item=expected[name]
  if m.issym():content=m.linkname.encode();assert item['mode']=='120000'
  else:assert m.isfile();content=archive.extractfile(m).read();assert content==(root/name).read_bytes()
  expected_blob=hashlib.sha1(b'blob '+str(len(content)).encode()+b'\0'+content).hexdigest();assert expected_blob==item['blob'];seen[name]=hashlib.sha256(content).hexdigest()
assert set(seen)==set(expected)
receipt={'date_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'git_commit':sha,'git_tree':subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=root,text=True).strip(),'requested_url':url,'resolved_url':final_url,'http_status':status,'etag':etag,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'integrity':'sha512-'+base64.b64encode(hashlib.sha512(data).digest()).decode(),'members_verified_against_all_git_blobs':len(seen),'all_git_paths_present':True,'archive_root':next(iter(roots)),'archive_kind':'GitHub source archive, distinct from npm package'}
(out/'source-archive-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
