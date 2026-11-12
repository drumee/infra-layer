import email.utils
import imaplib
import json
import pathlib
import smtplib
import socket
import ssl
import sys
import time

action = sys.argv[1]
cfg = json.loads(pathlib.Path('/keys/client.json').read_text())
ctx = ssl.create_default_context(cafile='/keys/ca.pem')
ctx.minimum_version = ssl.TLSVersion.TLSv1_2


class Implicit(smtplib.SMTP_SSL):
    def _get_socket(self, host, port, timeout):
        return ctx.wrap_socket(socket.create_connection((host, port), timeout), server_hostname='mail.oxymot.fr')


class IMAP(imaplib.IMAP4_SSL):
    def _create_socket(self, timeout):
        return ctx.wrap_socket(socket.create_connection(('dovecot', 993), timeout), server_hostname='mail.oxymot.fr')


def connect(port=587, auth='ghost', tls=True):
    s = Implicit('postfix', port, timeout=8, context=ctx) if port == 465 else smtplib.SMTP('postfix', port, timeout=8)
    s.ehlo('fixture.invalid')
    if tls and port != 465:
        s._host = 'mail.oxymot.fr'
        s.starttls(context=ctx)
        s.ehlo('fixture.invalid')
    if auth:
        s.login(auth, cfg[auth])
    return s


if action == 'send':
    auth, sender, recipient, tag, port = sys.argv[2:]
    with connect(int(port), auth if auth != '-' else None, int(port) != 25) as s:
        data = f'From: {sender}\r\nTo: {recipient}\r\nMessage-ID: <{tag}@fixture.invalid>\r\nSubject: Synthetic transactional email\r\nDate: {email.utils.formatdate(localtime=False)}\r\n\r\n{tag}\r\n'
        s.sendmail(sender, [recipient], data)
    print(json.dumps({'accepted':True,'id':tag}))
elif action == 'checks':
    results = []
    def check(name, fn):
        fn()
        results.append(name)
    with connect(25, None, False) as s:
        assert 'auth' not in s.esmtp_features and 'starttls' in s.esmtp_features
        s.mail('outside@dest.invalid')
        assert s.rcpt('sink@dest.invalid')[0] >= 500
        s.rset();s.mail('outside@dest.invalid')
        assert s.rcpt('unknown@oxymot.fr')[0] >= 500
        results += ['mx-no-auth-starttls-offered','anonymous-relay-denied','unknown-local-recipient-denied-at-rcpt']
    with connect(587, None, False) as s:
        assert 'auth' not in s.esmtp_features
        code,_=s.docmd('AUTH','PLAIN AHRlc3QAdGVzdA==')
        assert code >= 500
        results.append('auth-before-tls-refused')
    with connect() as s:
        try:
            s.sendmail('second@oxymot.fr',['sink@dest.invalid'],'From: second@oxymot.fr\r\n\r\nbad envelope')
            raise AssertionError('sender accepted')
        except (smtplib.SMTPRecipientsRefused,smtplib.SMTPSenderRefused,smtplib.SMTPDataError):
            results.append('account-envelope-grant-enforced')
    with connect() as s:
        try:
            s.sendmail('contact@oxymot.fr',['sink@dest.invalid'],'From: second@oxymot.fr\r\n\r\nbad author')
            raise AssertionError('header accepted')
        except (smtplib.SMTPRecipientsRefused,smtplib.SMTPSenderRefused,smtplib.SMTPDataError):
            results.append('account-header-grant-enforced')
    with IMAP('dovecot',993,ssl_context=ctx,timeout=8) as s:
        try:
            s.login('ghost',cfg['ghost'])
            raise AssertionError('app IMAP accepted')
        except imaplib.IMAP4.error:
            results.append('smtp-account-denied-imap')
        s.login('contact@oxymot.fr',cfg['contact'])
        assert s.select('../22222222-2222-4222-8222-222222222222/Maildir')[0]=='NO'
        results.append('imap-cross-mailbox-path-denied')
    print(json.dumps({'checks':results}))
elif action == 'imap':
    user,tag = sys.argv[2:]
    with IMAP('dovecot',993,ssl_context=ctx,timeout=8) as s:
        s.login(user,cfg['contact'] if user.startswith('contact') else cfg['second'])
        s.select('INBOX');typ,ids=s.search(None,'ALL');assert typ=='OK'
        found=[]
        for ident in ids[0].split():
            data=s.fetch(ident,'(RFC822)')[1][0][1]
            if tag.encode() in data:
                found.append({'id':ident.decode(),'local_dkim':b'DKIM-Signature:' in data})
        print(json.dumps({'matches':found}))
elif action == 'fill-quota':
    with IMAP('dovecot',993,ssl_context=ctx,timeout=8) as s:
        s.login('contact@oxymot.fr',cfg['contact'])
        assert s.append('INBOX',None,None,b'From: quota@dest.invalid\r\nSubject: quota seed\r\n\r\n'+b'x'*800000)[0]=='OK'
        result=s.append('INBOX',None,None,b'From: quota@dest.invalid\r\nSubject: quota excess\r\n\r\n'+b'x'*500000)
        assert result[0]=='NO'
        print(json.dumps({'imap_overquota_refused':True}))
elif action == 'large-local':
    with connect(25,None,False) as s:
        s.sendmail('external@dest.invalid',['contact@oxymot.fr'],'From: external@dest.invalid\r\nMessage-ID: <quota-local@fixture.invalid>\r\nSubject: quota blocked\r\n\r\n'+'x'*500000)
    print(json.dumps({'accepted_by_postfix':True}))
elif action == 'local-rcpt':
    with connect(25,None,False) as s:
        s.mail('external@dest.invalid');code,_=s.rcpt('contact@oxymot.fr')
        print(json.dumps({'code':code}))
elif action == 'tls-checks':
    checks=[]
    for context,hostname,label in [(ctx,'wrong.invalid','wrong-peer-name-refused'),(ssl.create_default_context(),'mail.oxymot.fr','untrusted-issuer-refused')]:
        with smtplib.SMTP('postfix',587,timeout=8) as s:
            s.ehlo();s._host=hostname
            try:
                s.starttls(context=context)
                raise AssertionError('invalid TLS accepted')
            except ssl.SSLCertVerificationError:
                checks.append(label)
    with connect(587,None) as s:
        try:
            s.sendmail('contact@oxymot.fr',['sink@dest.invalid'],'From: contact@oxymot.fr\r\n\r\nno auth')
            raise AssertionError('anonymous submission accepted')
        except (smtplib.SMTPRecipientsRefused,smtplib.SMTPSenderRefused):checks.append('submission-requires-authentication')
    try:
        smtplib.SMTP('postfix',465,timeout=2)
        raise AssertionError('plaintext465 accepted')
    except (TimeoutError,smtplib.SMTPServerDisconnected):checks.append('465-requires-tls-first-byte')
    for body in ['From: contact@oxymot.fr\r\nFrom: second@oxymot.fr\r\n\r\nduplicate',
                 'From: contact@oxymot.fr\r\nSender: second@oxymot.fr\r\n\r\nsender',
                 'From: contact@oxymot.fr\r\nResent-From: second@oxymot.fr\r\n\r\nresent']:
        with connect() as s:
            try:
                s.sendmail('contact@oxymot.fr',['sink@dest.invalid'],body)
                raise AssertionError('unauthorized author accepted')
            except smtplib.SMTPDataError:checks.append('unauthorized-header-variant-denied')
    print(json.dumps({'checks':checks}))
elif action == 'policy-failure':
    try:
        with connect() as s:
            s.sendmail('contact@oxymot.fr',['sink@dest.invalid'],'From: contact@oxymot.fr\r\n\r\npolicy unavailable')
            raise AssertionError('policy failure accepted')
    except smtplib.SMTPRecipientsRefused as e:code=next(iter(e.recipients.values()))[0]
    except smtplib.SMTPResponseException as e:code=e.smtp_code
    assert 400<=code<500
    print(json.dumps({'temporary_code':code}))
elif action == 'rotation-sessions':
    smtp=connect()
    imap=IMAP('dovecot',993,ssl_context=ctx,timeout=8);imap.login('contact@oxymot.fr',cfg['contact']);imap.select('INBOX')
    other=IMAP('dovecot',993,ssl_context=ctx,timeout=8);other.login('second@oxymot.fr',cfg['second']);other.select('INBOX')
    pathlib.Path('/control/sessions-ready').write_text('ready')
    for _ in range(300):
        if pathlib.Path('/control/rotated').exists():break
        time.sleep(.1)
    else:raise TimeoutError('registry rotation did not complete')
    results=[]
    try:
        smtp.sendmail('contact@oxymot.fr',['sink@dest.invalid'],'From: contact@oxymot.fr\r\n\r\nold session')
        raise AssertionError('old SMTP session survived credential generation')
    except smtplib.SMTPResponseException as e:
        assert e.smtp_code in [421,550,553];results.append('existing-smtp-session-revoked')
    except smtplib.SMTPRecipientsRefused:
        results.append('existing-smtp-session-revoked')
    finally:smtp.close()
    try:
        imap.noop();raise AssertionError('old IMAP session survived password rotation')
    except (imaplib.IMAP4.abort,imaplib.IMAP4.error,OSError):results.append('affected-imap-session-kicked')
    assert other.noop()[0]=='OK';results.append('unrelated-imap-session-preserved');other.logout()
    try:
        connect();raise AssertionError('old password accepted')
    except smtplib.SMTPAuthenticationError:results.append('old-smtp-password-refused')
    cfg=json.loads(pathlib.Path('/keys/client.json').read_text())
    with connect() as s:
        s.sendmail('contact@oxymot.fr',['sink@dest.invalid'],'From: contact@oxymot.fr\r\nDate: '+email.utils.formatdate()+'\r\nMessage-ID: <credential-rotated@fixture.invalid>\r\nSubject: synthetic rotation\r\n\r\ncredential-rotated')
        results.append('new-password-and-generation-submit')
    with IMAP('dovecot',993,ssl_context=ctx,timeout=8) as s:
        s.login('contact@oxymot.fr',cfg['contact']);assert s.select('INBOX')[0]=='OK';results.append('rotated-imap-password-retains-mailbox')
    print(json.dumps({'checks':results}))
elif action == 'policy-eom':
    with connect() as s:
        assert s.mail('contact@oxymot.fr')[0]==250
        assert s.rcpt('sink@dest.invalid')[0]==250
        assert s.docmd('DATA')[0]==354
        s.send(b'From: contact@oxymot.fr\r\nAuthentication-Results: mail.oxymot.fr; spf=pass\r\n\r\nsynthetic EOM refusal\r\n')
        pathlib.Path('/control/policy-data-ready').write_text('ready')
        for _ in range(600):
            if pathlib.Path('/control/policy-data-release').exists():break
            time.sleep(.1)
        else:raise TimeoutError('policy fault coordination')
        s.send(b'.\r\n');code,_=s.getreply();assert 400<=code<500
    print(json.dumps({'temporary_code':code}))
