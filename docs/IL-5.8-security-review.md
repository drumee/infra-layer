# IL-5.8 security and reliability review

Scope: PR #2, initial de4b34e. This report assesses execution context and actual
behavior; Sonar severities are retained independently of contextual risk. See the
[individual inventory](IL-5.8-sonar-inventory.md) and
[final disposition](IL-5.8-sonar-disposition.md). No Sonar issue state is changed.

## Processes and trust boundary

The application qualification commands previously searched inherited PATH.
A malicious executable earlier on PATH could execute with the developer's Docker
permissions. Test location does not make that risk harmless. The four reported
sites are corrected using qualification-only `trustedExecutable` and
`trustedEnvironment`: fixed /usr/bin tools, absolute resolved targets, executable
regular files, root/current-user ownership and no group/world write permission
on files or their ancestor directories. A root-owned sticky temporary directory
is allowed only as an ancestor of an otherwise owner-controlled path. Resolution
returns the real absolute path used by execFile/spawn, with no local shell.
The child PATH is fixed to /usr/bin:/bin, including npm's node shebang. The main
acceptance process also fixes its PATH before invoking canonical Docker APIs.

Explicit unprivileged Nginx and TypeScript locations remain operator-supplied
qualification inputs, not remotely chosen application data. Nginx execution is
validated by the same filesystem check; TypeScript is an explicit script run by
the selected Node interpreter. Trusted current-user source, scripts, binaries,
SSH configuration, Docker socket and account are prerequisites. These checks do
not defend against the account itself being compromised, a malicious root or
same-UID replacement after validation. No production secret is read.

SSH uses a validated host alias without option syntax. Its generated remote
program contains only validated IPv4, integer ports and random hex nonce. The
shell quoting protects its literal program; no request, plugin or SMTP argument
is interpolated as a command. It runs the explicitly authorized separate LAN
client, not a production host. Fixed-path malicious-PATH and writable-file/
ancestor refusal tests exercise these boundaries without running the substitute.
The historical production Docker driver is unchanged; its documented trusted
operator environment remains necessary and is not newly certified against
arbitrary hostile process environments by this test-only correction.

## Temporary paths and interruption input

The S5443 default `/tmp/infra-application` was an unused argument: the pure input
factory did not allocate, inspect or return that path. Its removal eliminates a
misleading example; it is not a discovered symlink exploit. Actual qualification
uses mkdtemp plus explicit 0700 roots, never a predictable shared deployment root.

The interruption child formerly read an arbitrary CLI filename before canonical
activation verification. This is a real harness boundary worth tightening even
though the recorded parent supplied its own 0600 file. The new reader requires:

- Absolute normalized path and fixed filename `interrupt-prepared.json`.
- A non-symlink, realpath-equal, current-user private parent with the random
  qualification project name.
- O_NOFOLLOW/O_NONBLOCK open, regular owned file, one hardlink, private mode and
  at most 4 MiB before JSON parsing.
- Exact project identity and sibling `deployment` root in parsed metadata.

Canonical prepared-state, ownership and lifecycle authorization validation still
runs afterward. There is no adoption/recovery bypass. Negative tests cover
traversal, external file, symlink, hardlink, FIFO, size, modes and foreign
root/project, with no Docker action. S2681's child kill/return is made explicit:
only the kill is conditional; returning the Docker result remains unconditional.
The real interruption acceptance must still observe SIGKILL after actual startup.

## SMTP and TLS

The reported S5332 message says HTTP, but the actual operation is nodemailer
SMTP submission. `secure:false` selects explicit STARTTLS rather than implicit
TLS. The client also sets `requireTLS:true`, an explicit CA, servername and
`rejectUnauthorized:true`; it never enables ignoreTLS or opportunistic fallback.
Changing it to implicit TLS would violate the existing submission contract.

New tests use real loopback SMTPServer sockets and the actual qualification
plugin client. Verified STARTTLS succeeds. Absent STARTTLS, untrusted CA and
wrong server identity all reject with zero authentication callbacks: credentials
are not submitted before verified TLS. This is independent of the analyzer's
protocol label. Existing real Postfix/OpenDKIM acceptance additionally checks
SASL success, wrong password, unauthenticated relay denial, no host mail/DKIM
ports, private mail-control network and secret/queue generation preservation.
The service suite checks actual DKIM signing and a controlled upstream TLS
capture. No Internet delivery/SPF/DMARC/bounce or spool restoration is claimed.
S5332 is a contextual FALSE_POSITIVE proposal, subject to security-owner review.

## Shipped reliability and deterministic behavior

- **S2871:** schema keys are compared against the finite set id/revision/root.
  The existing canonical `S.lexical` comparator explicitly preserves code-unit
  ordering, independent of locale. Plugin key permutation and invalid-key
  regressions pass. A locale-aware comparator is deliberately not introduced.
- **S2681:** explicit completion guard and branches preserve single settlement,
  timeout cancellation and the same sanitized error. Tests cover success with
  late error, request/response error with late success, malformed/oversized/503
  responses, timeout with late response and no-gateway behavior. Mock events/
  clock here are unit evidence only; real protocol readiness is separate.
- **S3776:** internal identity, mount/secret and readiness validators are extracted
  in their original execution order. Their errors, projection order and generated
  service restrictions remain unchanged. No new export or contract is added.
- **S3358:** an explicit role selection preserves job precedence and application/
  kernel defaults. Existing init-job and kernel lifecycle tests remain required.
- **S7778:** one push appends SQL account refs followed by explicit secret refs,
  retaining original order, values and filtering.

Thirty-two outputs/error codes were generated from an isolated archive of the
initial commit, then compared byte-for-byte with the correction. The regression
retains their digests, including simultaneous invalid fields to detect changed
validation precedence. Historical profile, SQL/secret, kernel and job tests remain
active. Public declarations, exports, package dependency locks, binding/address/
port/routes, resource grants and SMTP policy are unchanged.

## Remaining contextual findings

The tag+digest Docker FROM is deliberately immutable: digest determines bytes;
the tag records intended Node 22 lineage. Removing that provenance merely to
satisfy S8431 is not a security correction. The image identity and runtime lock
are independently checked by real builds. This is a FALSE_POSITIVE proposal.

Bounded sequential readiness polling (S9382) is deliberate: parallel requests
would not observe later startup states reliably and could outlive cleanup.
Only ECONNREFUSED is retried after this correction; certificate/auth/protocol
errors propagate, and timeout has an explicit assertion. The SSH quote escape
(S7780) is intentional literal POSIX quoting, not an untrusted string escape.
These are maintainer-review false-positive proposals, not silently closed issues.

Error constructors/default-parameter/nullability/optional-chain alerts receive
local clarifications. The scope of their tests is the real application run and
isolated installed consumer. No test assertion or negative security check is
removed, and no rule, quality gate, exclusion or global suppression is modified.

## Residual boundaries requiring owner attention

Developer account/Docker/SSH/tool trust remains a genuine operational assumption;
these tests must not run on an untrusted checkout or compromised account. The
reported hostile PATH and arbitrary-file entry points are tightened, but this
is not a general sandbox for untrusted agents. File mode/UID enforcement uses
Linux APIs and is qualified on this host. Network evidence applies to the
observed Docker/host topology and must be repeated on another target.

SMTP backup/restore remains `SMTP_RECOVERY_UNQUALIFIED`. The external reverse
proxy owns TLS termination. Application binding remains strictly 127.0.0.1;
no public/LAN/IPv6 alias binding is admitted. Final run outcomes, residual Sonar
annotations, candidate SRI and the required Debian re-lock handoff are recorded
in the disposition. No risk acceptance or merge decision is manufactured here.
