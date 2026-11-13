"""Read-only independent IMAP per-folder RFC822 totals for restart reconciliation."""
import imaplib,json,pathlib,re,socket,ssl
cfg=json.loads(pathlib.Path('/keys/client.json').read_text());ctx=ssl.create_default_context(cafile='/keys/ca.pem')
class IMAP(imaplib.IMAP4_SSL):
 def _create_socket(self,timeout):return ctx.wrap_socket(socket.create_connection(('dovecot',993),timeout),server_hostname='mail.oxymot.fr')
result=[]
for user in ['contact','second']:
 with IMAP('dovecot',993,ssl_context=ctx,timeout=20) as s:
  s.login(user+'@oxymot.fr',cfg[user]);status,rows=s.list();assert status=='OK';folders=[];total=count=0
  for row in rows:
   if b'\\Noselect' in row:continue
   folder=row.decode().rsplit(' ',1)[-1].strip('"');assert re.fullmatch(r'[A-Za-z0-9_./-]+',folder),folder;assert s.select(folder,readonly=True)[0]=='OK';ids=s.search(None,'ALL')[1][0];size=messages=0
   if ids:
    messages=len(ids.split());data=s.fetch(ids.replace(b' ',b','),'(RFC822.SIZE)')[1];values=re.findall(rb'RFC822.SIZE (\d+)',b' '.join(x for x in data if isinstance(x,bytes)));assert len(values)==messages;size=sum(map(int,values))
   folders.append({'name':folder,'virtual_bytes':size,'messages':messages});total+=size;count+=messages
  result.append({'address':user+'@oxymot.fr','virtual_bytes':total,'messages':count,'folders':folders})
print(json.dumps({'boxes':result}))
