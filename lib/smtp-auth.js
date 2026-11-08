"use strict";
// External SASL credentials are data, not Drumee resource identifiers.
const F = require("./filesystem-safety");
const MAX_BYTES = 255;
function text(value) {
  return typeof value === "string" && value.length > 0 && Buffer.byteLength(value) <= MAX_BYTES && Buffer.from(value).toString("utf8") === value && !value.startsWith("\uFEFF") && !value.includes("\0") && !value.includes("\r") && !value.includes("\n");
}
function account(value) {
  // ':' separates the account from its password; postmap strips leading space.
  return text(value) && !value.includes(":") && ![9, 11, 12, 32].includes(value.charCodeAt(0));
}
function validSecret(value) {
  if (!Buffer.isBuffer(value) || value.length === 0 || value.length > MAX_BYTES) return false;
  const decoded = value.toString("utf8");
  // Preserve bytes, including leading/internal spaces; never strip a final LF.
  return text(decoded) && Buffer.from(decoded).equals(value) && ![9, 11, 12, 32].includes(decoded.charCodeAt(decoded.length - 1));
}
function validateSecret(value) { if (!validSecret(value)) F.fail("SMTP_RELAY_CREDENTIAL_INVALID"); }

// The canonical tools image provides core Perl and Postfix. Account, lookup key
// and password are read from files; only fixed executable/path arguments reach exec.
const serializer = String.raw`use strict;
use warnings;
use Fcntl qw(O_RDONLY O_NOFOLLOW S_ISREG);
umask 0077;
$SIG{PIPE} = 'IGNORE';
my $dir = '/run/infra-mail/auth';
my $map = $dir . '/sasl_passwd';
my $created = 0;
my $diagnostic = 'SMTP_RELAY_CREDENTIAL_INVALID';
sub fail {
    if ($created) { unlink($map . '.db'); unlink($map); rmdir($dir); }
    print STDERR $diagnostic, "\n";
    exit 78;
}
sub read_bytes {
    my ($file, $private) = @_;
    sysopen(my $fh, $file, O_RDONLY | O_NOFOLLOW) or fail();
    my @s = stat($fh);
    @s && S_ISREG($s[2]) && $s[3] == 1 && !($s[2] & ($private ? 0077 : 0022)) && (!$private || $s[4] == $>) && $s[7] > 0 && $s[7] <= 320 or fail();
    binmode($fh); local $/; my $bytes = <$fh>; close($fh) or fail();
    defined($bytes) or fail();
    return $bytes;
}
sub credential {
    my ($bytes) = @_;
    length($bytes) > 0 && length($bytes) <= 255 or fail();
    # RFC UTF-8 byte grammar: no decoding, normalization or replacement.
    $bytes =~ /\A(?:
      [\x00-\x7f] | [\xc2-\xdf][\x80-\xbf] |
      \xe0[\xa0-\xbf][\x80-\xbf] | [\xe1-\xec\xee-\xef][\x80-\xbf]{2} |
      \xed[\x80-\x9f][\x80-\xbf] | \xf0[\x90-\xbf][\x80-\xbf]{2} |
      [\xf1-\xf3][\x80-\xbf]{3} | \xf4[\x80-\x8f][\x80-\xbf]{2}
    )+\z/x && $bytes !~ /[\x00\r\n]/ && $bytes !~ /\A\xef\xbb\xbf/ or fail();
    return $bytes;
}
my $user = credential(read_bytes('/config/postfix-relay-user', 0));
my $password = credential(read_bytes('/run/secrets/mail-relay', 1));
my $key = read_bytes('/config/postfix-relay-destination', 0);
$user !~ /:/ && $user !~ /\A[ \t\x0b\x0c]/ && $password !~ /[ \t\x0b\x0c]\z/ && $key !~ /[\x00\r\n\s]/ or fail();
$diagnostic = 'SMTP_RELAY_AUTH_MAP_FAILED';
mkdir($dir, 0700) or fail(); $created = 1;
my $pid = open(my $pipe, '|-'); defined($pid) or fail();
if (!$pid) {
    open(STDOUT, '>', '/dev/null') or exit 78;
    open(STDERR, '>', '/dev/null') or exit 78;
    exec {'/usr/sbin/postmap'} '/usr/sbin/postmap', '-i', 'hash:' . $map or exit 78;
}
binmode($pipe); print {$pipe} $key, "\t", $user, ':', $password, "\n" or fail();
close($pipe) or fail();
my @s = lstat($map . '.db');
@s && S_ISREG($s[2]) && $s[3] == 1 && $s[4] == $> && !($s[2] & 0077) or fail();
chmod(0600, $map . '.db') == 1 or fail();
`;
module.exports = { account, validSecret, validateSecret, serializer, MAX_BYTES };
