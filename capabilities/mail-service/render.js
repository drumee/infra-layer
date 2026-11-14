"use strict";
const { privateServiceAddress } = require("./validation");
function render(spec) {
  const m = spec, q = m.outbound;
  const base = `compatibility_level = 3.6
myhostname = ${m.hostname}
myorigin = ${m.domains[0]}
mydestination =
relay_domains =
relayhost =
inet_interfaces = all
inet_protocols = ipv4
smtputf8_enable = no
recipient_delimiter =
queue_directory = /var/spool/postfix
queue_minfree = 67108864
smtpd_client_connection_count_limit = 20
smtpd_client_connection_rate_limit = 120
anvil_rate_time_unit = 60s
data_directory = /var/spool/postfix/infra-data
mail_owner = postfix
setgid_group = postdrop
mynetworks =
virtual_mailbox_domains = socketmap:inet:policy:10001:domains
virtual_mailbox_maps = socketmap:inet:policy:10001:mailboxes
virtual_alias_maps = socketmap:inet:policy:10001:aliases
virtual_transport = lmtp:unix:/run/mail-sockets/lmtp
smtpd_relay_restrictions = reject_unauth_destination
smtpd_recipient_restrictions = check_policy_service inet:policy:10002, reject_unlisted_recipient
smtpd_sasl_auth_enable = no
smtpd_sasl_type = dovecot
smtpd_sasl_path = /run/mail-sockets/auth
smtpd_sasl_security_options = noanonymous
smtpd_tls_security_level = may
smtpd_tls_auth_only = yes
smtpd_tls_cert_file = /keys/current/certificate.pem
smtpd_tls_key_file = /keys/current/key.pem
smtpd_tls_mandatory_protocols = >=TLSv1.2
smtpd_tls_protocols = >=TLSv1.2
smtp_tls_security_level = ${q.tls === "required-verify" ? "verify" : "may"}
smtp_tls_CAfile = /keys/current/ca.pem
smtp_tls_policy_maps = texthash:/config/tls-policy
smtp_sasl_auth_enable = no
smtpd_milters =
non_smtpd_milters =
milter_protocol = 6
milter_default_action = tempfail
milter_connect_timeout = 3s
milter_command_timeout = 5s
milter_content_timeout = 5s
milter_mail_macros = i {auth_authen} {auth_type} {daemon_name}
milter_end_of_data_macros = i {auth_authen} {daemon_name}
smtpd_sender_login_maps = socketmap:inet:policy:10001:senders
message_size_limit = ${m.delivery.message_size_bytes}
maximal_queue_lifetime = ${q.maximal_queue_lifetime_seconds}s
bounce_queue_lifetime = ${q.bounce_queue_lifetime_seconds}s
minimal_backoff_time = ${q.minimal_backoff_seconds}s
maximal_backoff_time = ${q.maximal_backoff_seconds}s
queue_run_delay = ${q.queue_run_delay_seconds}s
smtpd_timeout = 300s
maillog_file = /dev/stdout
maillog_file_prefixes = /dev
biff = no
append_dot_mydomain = no
`;
  const submission = (wrapper, privateListener = false) => `${privateListener ? m.networks.private_submission.port : wrapper ? "465" : "587"} inet n - n - - smtpd
 -o smtpd_tls_security_level=encrypt
 -o smtpd_tls_wrappermode=${wrapper ? "yes" : "no"}
 -o smtpd_sasl_auth_enable=yes
 -o smtpd_relay_restrictions=permit_sasl_authenticated,reject
 -o smtpd_client_restrictions=${privateListener ? "check_client_access,cidr:/config/private-sources" : "permit_sasl_authenticated,reject"}
${privateListener ? " -o smtpd_delay_reject=no\n" : ""}
 -o smtpd_sender_restrictions=reject_authenticated_sender_login_mismatch
 -o smtpd_milters=inet:policy:10003,inet:opendkim:8891
 -o milter_macro_daemon_name=ORIGINATING
`;
  const master = `25 inet n - n - - smtpd
${submission(false)}${submission(true)}${submission(false, true)}pickup unix n - n 60 1 pickup
cleanup unix n - n - 0 cleanup
qmgr unix n - n 300 1 qmgr
tlsmgr unix - - n 1000? 1 tlsmgr
rewrite unix - - n - - trivial-rewrite
bounce unix - - n - 0 bounce
defer unix - - n - 0 bounce
trace unix - - n - 0 bounce
verify unix - - n - 1 verify
flush unix n - n 1000? 0 flush
proxymap unix - - n - - proxymap
proxywrite unix - - n - 1 proxymap
smtp unix - - n - - smtp
relay unix - - n - - smtp
showq unix n - n - - showq
error unix - - n - - error
retry unix - - n - - error
discard unix - - n - - discard
lmtp unix - - n - - lmtp
anvil unix - - n - 1 anvil
scache unix - - n - - scache
postlog unix-dgram n - n - 1 postlogd
`;
  const dovecot = `dovecot_config_version = 2.4.1
dovecot_storage_version = 2.4.1
base_dir = /run/dovecot
state_dir = /run/dovecot-state
protocols = imap lmtp
listen = *
log_path = /dev/stderr
ssl = required
ssl_server_cert_file = /keys/current/certificate.pem
ssl_server_key_file = /keys/current/key.pem
ssl_min_protocol = TLSv1.2
auth_mechanisms = plain login
auth_cache_size = 0
auth_debug = no
auth_debug_passwords = no
auth_verbose_passwords = no
auth_username_format = %{user | lower}
auth_policy_server_url = http://policy:10004/
auth_policy_hash_nonce = admission-only-no-password-attribute
auth_policy_request_attributes =
auth_policy_reject_on_fail = yes
auth_policy_report_after_auth = no
mail_driver = maildir
mailbox_list_index = no
mail_home = /mailboxes/unassigned
mail_path = ~/Maildir
first_valid_uid = 5000
passdb passwd-file {
 passwd_file_path = /registry/current/%{protocol}.passwd
}
userdb passwd-file {
 passwd_file_path = /registry/current/users
}
mail_plugins {
 quota = yes
}
quota "Mailbox" {
 driver = count
 storage_size = ${m.delivery.default_quota_bytes}B
 storage_grace = 0
}
quota_full_tempfail = yes
lmtp_rcpt_check_quota = yes
postmaster_address = postmaster@${m.domains[0]}
namespace inbox {
 inbox = yes
 separator = /
}
service imap-login {
 inet_listener imap {
  port = 0
 }
 inet_listener imaps {
  port = 993
  ssl = yes
 }
}
service lmtp {
 unix_listener /run/mail-sockets/lmtp {
  mode = 0600
  user = postfix
  group = postfix
 }
}
service auth {
 user = root
 unix_listener /run/mail-sockets/auth {
  mode = 0660
  user = postfix
  group = postfix
 }
}
`;
  const keytable = m.dkim.map((d, i) => `${d.domain} ${d.domain}:${d.selector}:/keys/dkim-${i}.pem`).join("\n") + "\n";
  const signing = m.dkim.map(d => `*@${d.domain} ${d.domain}`).join("\n") + "\n";
  const opendkim = `Syslog no
Mode s
Canonicalization relaxed/relaxed
KeyTable /config/key-table
SigningTable refile:/config/signing-table
Socket inet:8891@0.0.0.0
InternalHosts 127.0.0.1
MacroList csl:{daemon_name}=ORIGINATING
PidFile /run/opendkim.pid
UMask 0077
RequireSafeKeys yes
`;
  const marker = JSON.stringify({ owner: m.deployment.id, resource: "mail-queue" });
  const entrypoint = `#!/bin/sh
set -eu
umask 077
test -f /var/spool/postfix/.infra-owner || exit 78
test "$(cat /var/spool/postfix/.infra-owner)" = '${marker}' || exit 78
mkdir -p /var/spool/postfix/infra-data
chown postfix:postfix /var/spool/postfix/infra-data
mkdir -p /config
cp -a /source/. /config/
chown root:root /config /config/*
chmod 755 /config
if nft list table inet drumee_mail_private >/dev/null 2>&1; then exit 78; fi
nft -f /source/private-input.nft
postfix -c /config check
exec setpriv --bounding-set=-net_admin,-setpcap --inh-caps=-net_admin --ambient-caps=-net_admin postfix -c /config start-fg
`;
  const privateInput = `table inet drumee_mail_private {
 chain input {
  type filter hook input priority -10; policy accept;
  tcp dport ${m.networks.private_submission.port} ip saddr ${m.networks.edge_gateway} counter drop
  tcp dport ${m.networks.private_submission.port} ip saddr ${privateServiceAddress(m)} counter accept
  tcp dport ${m.networks.private_submission.port} ip saddr { ${m.networks.private_submission.allowed_sources.join(", ")} } counter accept
  tcp dport ${m.networks.private_submission.port} counter drop
 }
}
`;
  return { "private-input.nft": privateInput, "main.cf": base, "master.cf": master, "dovecot.conf": dovecot, "opendkim.conf": opendkim, "key-table": keytable, "signing-table": signing, "private-sources": `${m.networks.edge_gateway} REJECT Source identity hidden by gateway\n${privateServiceAddress(m)}/32 OK\n` + m.networks.private_submission.allowed_sources.map(cidr => `${cidr} OK`).join("\n") + "\n0.0.0.0/0 REJECT Private submission source forbidden\n", "tls-policy": q.require_verify_domains.map(d => `${d} verify`).join("\n") + "\n", "postfix-entrypoint.sh": entrypoint, "dovecot-entrypoint.sh": `#!/bin/sh
set -eu
test -f /mailboxes/.infra-owner || exit 78
test "$(cat /mailboxes/.infra-owner)" = '${JSON.stringify({ owner: m.deployment.id, resource: "mailboxes" })}' || exit 78
exec dovecot -F -c /registry/active.conf
` };
}
function credentials(registry, verifiers) {
  const get = id => { const v = verifiers[id]; if (typeof v !== "string" || !/^\{ARGON2ID\}[^\r\n:]{20,1024}$/.test(v)) throw Object.assign(new Error("MAIL_VERIFIER_INVALID"), { code: "MAIL_VERIFIER_INVALID" }); return v; };
  const user = (login, b) => `${login}::5000:5000::/mailboxes/${b.id}/home::userdb_mail_path=/mailboxes/${b.id}/Maildir userdb_quota/Mailbox/storage_size=${b.quota_bytes}B`;
  return {
    "imap.passwd": registry.mailboxes.filter(b => b.imap_enabled).map(b => `${b.address}:${get(b.id)}`).join("\n") + "\n",
    "smtp.passwd": [...registry.accounts.filter(a => a.enabled).map(a => `${a.id}:${get(a.id)}::::::user=acct-${a.id}-g${a.credential_generation}`), ...registry.mailboxes.filter(b => b.submission_enabled).map(b => `${b.address}:${get(b.id)}::::::user=mbx-${b.id}-g${b.credential_generation || registry.generation}`)].join("\n") + "\n",
    users: registry.mailboxes.flatMap(b => [user(b.address, b), user(`mbx-${b.id}@local.invalid`, b)]).join("\n") + "\n"
  };
}
module.exports = { render, credentials };
