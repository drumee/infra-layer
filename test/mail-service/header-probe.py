"""Submit duplicate/folded local assertions and legitimate external transit results."""
import email.utils,json,sys,uuid
sys.argv=['header-probe.py','probe']
from client import connect
correlation='auth-header-'+uuid.uuid4().hex
with connect() as smtp:
 smtp.sendmail('contact@oxymot.fr',['sink@dest.invalid'],
  'From: "Contact, team" (support) <contact@oxymot.fr>\r\nDate: '+email.utils.formatdate()+
  '\r\nMessage-ID: <'+correlation+'@fixture.invalid>\r\n'+
  'Authentication-Results: mail.oxymot.fr; spf=pass smtp.mailfrom=forged.invalid\r\n'+
  'Authentication-Results: upstream.invalid; dkim=none reason="mail.oxymot.fr"\r\n'+
  'Authentication-Results: (comment)\r\n\t"MAIL.OXYMOT.FR." 1\r\n\t; dkim=pass header.d=forged.invalid\r\n'+
  'Authentication-Results: mail.oxymot.fr.invalid; spf=none\r\n'+
  'Subject: Synthetic header negative control\r\n\r\n'+correlation)
print(json.dumps({'correlation':correlation,'accepted_by_postfix':True}))
