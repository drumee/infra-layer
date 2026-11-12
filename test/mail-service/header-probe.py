"""Negative qualification probe: locally authoritative client headers must disappear."""
import email.utils,json,sys,uuid
# client imports TLS verification and reads protected synthetic credentials.
sys.argv=['header-probe.py','probe']
from client import connect
correlation='auth-header-'+uuid.uuid4().hex
with connect() as smtp:
 smtp.sendmail('contact@oxymot.fr',['sink@dest.invalid'],'From: contact@oxymot.fr\r\nDate: '+email.utils.formatdate()+'\r\nMessage-ID: <'+correlation+'@fixture.invalid>\r\nAuthentication-Results: mail.oxymot.fr; spf=pass smtp.mailfrom=forged.invalid\r\nSubject: Synthetic header negative control\r\n\r\n'+correlation)
print(json.dumps({'correlation':correlation,'accepted_by_postfix':True}))
