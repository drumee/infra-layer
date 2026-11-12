"""Normal authenticated STARTTLS submission, no credentials in argv/output."""
import json
import pathlib
import re
import smtplib
import ssl
import sys

cfg = json.loads(pathlib.Path('/keys/client.json').read_text())
context = ssl.create_default_context(cafile='/keys/relay-ca.pem')
context.minimum_version = ssl.TLSVersion.TLSv1_2
rows = []
with smtplib.SMTP('mail', 2525, timeout=10) as client:
    client.ehlo('synthetic-client.fixture.invalid')
    client._host = 'relay.fixture.invalid'  # Explicit verified name, like the app's servername.
    client.starttls(context=context)
    client.ehlo('synthetic-client.fixture.invalid')
    client.login('fixture', cfg['password'])
    for name in sys.argv[1:]:
        message_id = f'<{name}@fixture.invalid>'
        data = f'From: sender@fixture.invalid\r\nTo: sink@fixture.invalid\r\nMessage-ID: {message_id}\r\nSubject: Synthetic queue recovery\r\n\r\nCorrelation: {name}\r\n'
        assert client.mail('sender@fixture.invalid')[0] == 250
        assert client.rcpt('sink@fixture.invalid')[0] == 250
        code, response = client.data(data)
        assert code == 250
        found = re.search(rb'queued as ([A-Z0-9]+)', response)
        assert found
        rows.append({'message_id':message_id,'queue_id':found[1].decode(),'smtp_code':code})
print(json.dumps(rows))
