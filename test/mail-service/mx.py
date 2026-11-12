"""Private durable SMTP witness: synthetic envelopes only, no delivery forwarding."""
import base64
import email
import hashlib
import json
import os
import pathlib
import socket
import socketserver
import ssl
import threading
import time

ROOT = pathlib.Path('/witness')
LOCK = threading.Lock()
CFG = json.loads(pathlib.Path('/keys/receiver.json').read_text())
CTX = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
CTX.minimum_version = ssl.TLSVersion.TLSv1_2
CTX.load_cert_chain('/keys/receiver.pem', '/keys/receiver.key')


def durable(name, data):
    with open(ROOT/name, 'xb', buffering=0) as f:
        f.write(data)
        os.fsync(f.fileno())
    fd = os.open(ROOT, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def record(data, mode):
    parsed = email.message_from_bytes(data)
    correlation = parsed.get('Message-ID', '')
    assert correlation.endswith('@fixture.invalid>')
    with LOCK:
        index = len(list(ROOT.glob('event-*.json'))) + 1
        digest = hashlib.sha256(data).hexdigest()
        accepted = mode in ['accept', 'uncertain', 'plain']
        if accepted:
            durable(f'message-{index:06d}.eml', data)
        event = {'index': index, 'at_ns': time.time_ns(), 'message_id': correlation,
                 'sha256': digest, 'bytes': len(data), 'mode': mode,
                 'durable_acceptance': accepted, 'final_250_sent': mode in ['accept', 'plain']}
        durable(f'event-{index:06d}.json', (json.dumps(event)+'\n').encode())


class Handler(socketserver.StreamRequestHandler):
    def send(self, line):
        self.wfile.write(line.encode()+b'\r\n')
        self.wfile.flush()

    def handle(self):
        self.request.settimeout(30)
        secure = authenticated = False
        self.send('220 receiver ESMTP synthetic witness')
        try:
            while line := self.rfile.readline(1048577):
                command = line.decode('ascii', 'replace').strip()
                verb = command.split(' ', 1)[0].upper()
                if verb in ['EHLO', 'HELO']:
                    self.send('250-receiver')
                    self.send('250-SIZE 1048576')
                    self.send('250-8BITMIME' if secure or pathlib.Path('/control/mode').read_text().strip() == 'plain' else '250-STARTTLS')
                    self.send('250 8BITMIME')
                elif verb == 'STARTTLS' and not secure:
                    self.send('220 2.0.0 TLS ready')
                    self.request = CTX.wrap_socket(self.request, server_side=True)
                    self.rfile = self.request.makefile('rb')
                    self.wfile = self.request.makefile('wb')
                    secure = True
                elif verb == 'AUTH' and secure:
                    parts = command.split(' ')
                    if len(parts) == 2:
                        self.send('334 ')
                        parts.append(self.rfile.readline().strip().decode())
                    fields = base64.b64decode(parts[-1]).split(b'\0')
                    authenticated = len(fields) == 3 and fields[1].decode() == CFG['user'] and fields[2].decode() == CFG['password']
                    self.send('235 2.7.0 Authenticated' if authenticated else '535 5.7.8 Refused')
                elif verb == 'MAIL':
                    self.send('250 2.1.0 Sender OK')
                elif verb == 'RCPT':
                    self.send('250 2.1.5 Recipient OK' if 'sink@dest.invalid' in command else '550 5.1.1 Refused')
                elif verb == 'DATA':
                    self.send('354 End with dot')
                    data = bytearray()
                    while chunk := self.rfile.readline(1048577):
                        if chunk == b'.\r\n':
                            break
                        data.extend(chunk[1:] if chunk.startswith(b'..') else chunk)
                        if len(data) > 1048576:
                            return
                    mode = pathlib.Path('/control/mode').read_text().strip()
                    record(bytes(data), mode)
                    if mode == 'uncertain':
                        self.request.shutdown(socket.SHUT_RDWR)
                        return
                    self.send('451 4.3.0 Synthetic temporary refusal' if mode == 'defer' else '250 2.0.0 Durable witness accepted')
                elif verb == 'QUIT':
                    self.send('221 Bye')
                    return
                elif verb in ['RSET', 'NOOP']:
                    self.send('250 OK')
                else:
                    self.send('502 Unsupported')
        except (OSError, ValueError, ssl.SSLError):
            return


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


with Server(('0.0.0.0', 25), Handler) as server:
    server.serve_forever()
