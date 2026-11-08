"use strict";
const fs = require("node:fs"), path = require("node:path"), { execFileSync } = require("node:child_process");
module.exports = function serializerChecks({ installed, tools, directory, check }) {
  fs.mkdirSync(directory, { mode: 0o700 }); const serializer = require(installed + "/lib/smtp-auth");
  fs.writeFileSync(directory + "/smtp-relay-auth.pl", serializer.serializer); fs.writeFileSync(directory + "/user", "synthetic-account@example.invalid", { mode: 0o600 }); fs.writeFileSync(directory + "/destination", "[provider]:2525", { mode: 0o600 });
  fs.writeFileSync(directory + "/postmap-failure", "#!/bin/sh\ncat >&2\nexit 1\n", { mode: 0o755 });
  function execute(fault = false) {
    const args = ["run", "--rm", "--network", "none", "--read-only", "--tmpfs", "/run:rw,noexec,nosuid,size=16m", "--mount", "type=bind,source=" + directory + ",target=/fixture,readonly", ...[["smtp-relay-auth.pl", "/config/smtp-relay-auth.pl"], ["user", "/config/postfix-relay-user"], ["destination", "/config/postfix-relay-destination"], ...(fault ? [["postmap-failure", "/usr/sbin/postmap"]] : [])].flatMap(([file, target]) => ["--mount", "type=bind,source=" + path.join(directory, file) + ",target=" + target + ",readonly"]), "--entrypoint", "/bin/sh", tools, "-c", "mkdir -p /run/secrets /run/infra-mail; install -m 600 /fixture/secret /run/secrets/mail-relay; /usr/bin/perl /config/smtp-relay-auth.pl; code=$?; if [ -e /run/infra-mail/auth ]; then exit 79; fi; exit $code"];
    let result; try { result = { status: 0, stdout: execFileSync("docker", args, { encoding: "utf8", stdio: "pipe", timeout: 30000 }), stderr: "" }; } catch (error) { result = { status: error.status, stdout: String(error.stdout), stderr: String(error.stderr) }; }
    check(result.status, 78); check(result.stdout, ""); check(result.stderr.trim(), fault ? "SMTP_RELAY_AUTH_MAP_FAILED" : "SMTP_RELAY_CREDENTIAL_INVALID");
  }
  const invalid = [Buffer.from("final\n"), Buffer.from("final\r\n"), Buffer.from("embedded\nentry"), Buffer.from("bad\0value"), Buffer.from("bad\rvalue"), Buffer.from("final "), Buffer.from("final\t"), Buffer.from([0xff]), Buffer.from("\uFEFFvalue"), Buffer.from("x".repeat(256)), Buffer.alloc(0)];
  for (const value of invalid) { fs.writeFileSync(directory + "/secret", value, { mode: 0o600 }); execute(); }
  fs.writeFileSync(directory + "/secret", "synthetic!map-failure-$()", { mode: 0o600 }); execute(true);
  return { invalid_runtime_files: invalid.length, invalid_before_connection: true, final_lf_and_crlf_explicitly_refused: true, malformed_utf8_nul_and_trailing_whitespace_refused: true, controlled_postmap_failure_cleaned: true, suppressed_child_error_output: true, private_tmpfs_only: true };
};
