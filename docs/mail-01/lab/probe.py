"""Narrow native hypotheses only; runs in --network none with synthetic data."""
import imaplib
import json
import os
import pathlib
import smtplib
import socket
import ssl
import subprocess
import time

root = pathlib.Path('/run/mail01')
root.mkdir(mode=0o755)
checks = []


def run(args, **kwargs):
    result = subprocess.run(args, capture_output=True, **kwargs)
    if result.returncode:
        raise RuntimeError(args[0] + ' failed: ' + result.stderr.decode())
    return result


def check(name, value):
    if not value:
        raise AssertionError(name)
    checks.append(name)


password = 'MAIL01-synthetic-Only-2849'
hashed = run(['doveadm', 'pw', '-s', 'ARGON2ID'], input=(password+'\n'+password+'\n').encode()).stdout.decode().strip()
check('argon2id-supported', hashed.startswith('{ARGON2ID}'))
run(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
     '-subj', '/CN=mail.test.invalid', '-addext', 'subjectAltName=DNS:mail.test.invalid',
     '-keyout', str(root/'key'), '-out', str(root/'cert')])
for name in ['one', 'two']:
    home = root/name
    home.mkdir(mode=0o700)
    os.chown(home, 5000, 5000)
userdb = ''.join(f'{u}::5000:5000::{root/h}::\n' for u, h in
                 [('mbx-one@local.invalid', 'one'), ('mbx-two@local.invalid', 'two'),
                  ('contact@oxymot.fr', 'one'), ('second@oxymot.fr', 'two')])
(root/'users').write_text(userdb)
(root/'imap.passwd').write_text(f'contact@oxymot.fr:{hashed}\nsecond@oxymot.fr:{hashed}\n')
(root/'smtp.passwd').write_text(f'oxyform:{hashed}::::::user=acct-oxyform-g1\nghost:{hashed}::::::user=acct-ghost-g1\n')
config = f'''
dovecot_config_version = 2.4.1
dovecot_storage_version = 2.4.1
base_dir = {root}/dovecot
state_dir = {root}/state
protocols = imap lmtp
listen = 127.0.0.1
log_path = {root}/dovecot.log
ssl = required
ssl_server_cert_file = {root}/cert
ssl_server_key_file = {root}/key
ssl_min_protocol = TLSv1.2
auth_mechanisms = plain login
auth_cache_size = 0
auth_debug = no
auth_debug_passwords = no
auth_verbose_passwords = no
auth_username_format = %{{user | lower}}
mail_driver = maildir
mail_path = ~/Maildir
mail_home = {root}/unassigned
first_valid_uid = 5000
passdb passwd-file {{
  passwd_file_path = {root}/%{{protocol}}.passwd
}}
userdb passwd-file {{
  passwd_file_path = {root}/users
}}
mail_plugins {{
  quota = yes
}}
quota "Mailbox" {{
  driver = count
  storage_size = 1M
  storage_grace = 0
}}
quota_full_tempfail = yes
lmtp_rcpt_check_quota = yes
postmaster_address = postmaster@oxymot.fr
namespace inbox {{
  inbox = yes
  separator = /
}}
service imap-login {{
  inet_listener imap {{
 port = 0
}}
  inet_listener imaps {{
 port = 1993
 ssl = yes
}}
}}
service lmtp {{
  unix_listener {root}/lmtp {{
 mode = 0600
}}
}}
service auth {{
  unix_listener {root}/auth {{
 mode = 0600
}}
}}
'''.replace('port = 1993; ssl = yes', 'port = 1993\n ssl = yes')
(root/'dovecot.conf').write_text(config)
run(['doveconf', '-c', str(root/'dovecot.conf'), '-n'])
check('dovecot-2.4-config-parses', True)
proc = subprocess.Popen(['dovecot', '-F', '-c', str(root/'dovecot.conf')], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
try:
    for _ in range(100):
        if (root/'lmtp').exists():
            break
        if proc.poll() is not None:
            raise RuntimeError('Dovecot startup failed: '+proc.stderr.read().decode())
        time.sleep(.05)
    check('lmtp-unix-socket-created', (root/'lmtp').is_socket())
    with smtplib.LMTP(str(root/'lmtp'), timeout=5) as client:
        client.ehlo('lab.invalid')
        client.mail('synthetic@example.invalid')
        code, _ = client.rcpt('unknown@local.invalid')
        check('lmtp-unknown-recipient-rejected', code == 550)
        client.rset()
        check('lmtp-maildir-delivery', not client.sendmail('synthetic@example.invalid', ['mbx-one@local.invalid'],
              'From: synthetic@example.invalid\nTo: contact@oxymot.fr\nSubject: synthetic\n\nMAIL01-one\n'))
    check('maildir-created-by-stable-identity', len(list((root/'one/Maildir/new').glob('*'))) == 1)
    check('other-mailbox-empty', not list((root/'two').glob('Maildir/new/*')))
    ctx = ssl.create_default_context(cafile=str(root/'cert'))
    # Open a verified TLS socket explicitly, then let imaplib own its protocol.
    class LocalIMAP(imaplib.IMAP4_SSL):
        def _create_socket(self, timeout):
            raw = socket.create_connection(('127.0.0.1', 1993), timeout)
            return ctx.wrap_socket(raw, server_hostname='mail.test.invalid')
    with LocalIMAP('mail.test.invalid', 1993, ssl_context=ctx, timeout=5) as client:
        try:
            client.login('oxyform', password)
            raise AssertionError('SMTP app authenticated to IMAP')
        except imaplib.IMAP4.error:
            check('smtp-only-account-denied-imap', True)
        client.login('contact@oxymot.fr', password)
        check('imaps-mailbox-login', client.select('INBOX')[0] == 'OK')
        check('imaps-message-visible', client.search(None, 'ALL')[1] == [b'1'])
        check('imap-foreign-path-denied', client.select('../two/Maildir')[0] == 'NO')
    with smtplib.LMTP(str(root/'lmtp'), timeout=5) as client:
        big = 'From: synthetic@example.invalid\nSubject: synthetic quota\n\n' + 'x'*2200000
        try:
            client.sendmail('synthetic@example.invalid', ['mbx-one@local.invalid'], big)
            raise AssertionError('quota not enforced')
        except (smtplib.SMTPDataError, smtplib.SMTPRecipientsRefused) as error:
            code = error.smtp_code if hasattr(error, 'smtp_code') else next(iter(error.recipients.values()))[0]
            check('lmtp-quota-failure-temporary', 400 <= code < 500)
    # Exercise the separate SASL protocol eligibility through the native auth socket.
    auth = subprocess.run(['doveadm', '-c', str(root/'dovecot.conf'), 'auth', 'test', '-x', 'service=smtp', 'oxyform'],
                          input=(password+'\n').encode(), capture_output=True)
    check('smtp-account-authenticates-only-smtp-path', auth.returncode == 0)
    check('smtp-auth-returns-generation-identity', b'acct-oxyform-g1' in auth.stdout)
    # A new generation path and explicit reload avoid passwd-file's own stat cache.
    (root/'smtp-g2.passwd').write_text(f'oxyform:{hashed}::::::user=acct-oxyform-g2\n')
    (root/'imap-g2.passwd').write_text((root/'imap.passwd').read_text())
    (root/'dovecot.conf').write_text(config.replace('/%{protocol}.passwd', '/%{protocol}-g2.passwd'))
    run(['dovecot', '-c', str(root/'dovecot.conf'), 'reload'])
    for _ in range(40):
        rotated = subprocess.run(['doveadm', '-c', str(root/'dovecot.conf'), 'auth', 'test', '-x', 'service=smtp', 'oxyform'],
                                 input=(password+'\n').encode(), capture_output=True)
        if rotated.returncode == 0 and b'acct-oxyform-g2' in rotated.stdout:
            break
        time.sleep(.05)
    check('smtp-auth-observes-generation-after-explicit-reload', rotated.returncode == 0 and b'acct-oxyform-g2' in rotated.stdout)
    bad = subprocess.run(['doveadm', '-c', str(root/'dovecot.conf'), 'auth', 'test', '-x', 'service=smtp', 'contact@oxymot.fr'],
                         input=(password+'\n').encode(), capture_output=True)
    check('mailbox-without-submission-denied-smtp', bad.returncode != 0)
except Exception:
    print((root/'dovecot.log').read_text())
    raise
finally:
    proc.terminate()
    proc.wait(timeout=10)

versions = run(['dpkg-query', '-W', '-f=${Package}=${Version}\n', 'postfix', 'opendkim', 'dovecot-core', 'dovecot-imapd', 'dovecot-lmtpd']).stdout.decode().splitlines()
print(json.dumps({'scope':'MAIL-01 isolated native hypotheses; not end-to-end Postfix qualification',
                  'network':'none', 'published_ports':[], 'versions':versions, 'checks':checks, 'status':'PASS'}, indent=2))
