"use strict";
// Explicit private-target authorization; laboratory acceptance never implies it.
const fs = require("node:fs"), os = require("node:os"), crypto = require("node:crypto"), net = require("node:net");
const V = require("./validation"), F = require("../../lib/filesystem-safety");
const CONTRACT = "drumee.mail-private-activation/1";
const sha = data => crypto.createHash("sha256").update(data).digest("hex");
function shape(value, fields) {
  return value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).sort((a, b) => a.localeCompare(b)).join(",") === fields.sort((a, b) => a.localeCompare(b)).join(",");
}
function privateIPv4(ip) {
  if (typeof ip !== "string" || net.isIP(ip) !== 4) return false;
  const parts = ip.split(".").map(Number);
  return parts.every(n => n <= 255) && (parts[0] === 10 || parts[0] === 192 && parts[1] === 168 || parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31);
}
function approval(value, transportDigest, root) {
  const fields = ["contract", "mode", "approval_id", "target_hostname", "machine_id", "transport_digest", "storage", "smtp_destinations", "ca_sha256", "docker_version"];
  if (!shape(value, fields) || value.contract !== CONTRACT || value.mode !== "private") V.fail("MAIL_PRIVATE_APPROVAL_INVALID");
  if (!/^[a-f0-9-]{36}$/.test(value.approval_id) || !/^[a-z0-9][a-z0-9.-]{0,252}$/.test(value.target_hostname) || !/^[a-f0-9]{32}$/.test(value.machine_id)) V.fail("MAIL_PRIVATE_APPROVAL_INVALID");
  if (value.docker_version !== "29.9.2") V.fail("MAIL_PRIVATE_DOCKER_UNQUALIFIED");
  if (value.transport_digest !== transportDigest || !/^[a-f0-9]{64}$/.test(value.ca_sha256)) V.fail("MAIL_PRIVATE_CONFIGURATION_MISMATCH");
  const st = value.storage;
  if (!shape(st, ["root", "uuid", "root_dev", "root_ino", "filesystem"]) || st.root !== root || st.filesystem !== "ext4" || !/^[a-f0-9-]{36}$/.test(st.uuid)) V.fail("MAIL_PRIVATE_STORAGE_INVALID");
  if (!Number.isSafeInteger(st.root_dev) || st.root_dev < 1 || !Number.isSafeInteger(st.root_ino) || st.root_ino < 1) V.fail("MAIL_PRIVATE_STORAGE_INVALID");
  if (!Array.isArray(value.smtp_destinations) || value.smtp_destinations.length > 16 || new Set(value.smtp_destinations).size !== value.smtp_destinations.length || value.smtp_destinations.some(ip => !privateIPv4(ip))) V.fail("MAIL_PRIVATE_DESTINATION_INVALID");
  return value;
}
function specApproval(spec, value) {
  approval(value, V.digest(spec), spec.deployment.root);
  if (Object.values(spec.listeners).some(listener => listener.enabled)) V.fail("MAIL_PRIVATE_PUBLIC_LISTENER_FORBIDDEN");
  if (spec.networks.private_submission.allowed_sources.some(cidr => !cidr.endsWith("/32") || !privateIPv4(cidr.slice(0, -3)))) V.fail("MAIL_PRIVATE_ALLOCATION_INVALID");
  return value;
}
function host(value, command) {
  if (os.hostname() !== value.target_hostname || fs.readFileSync("/etc/machine-id", "utf8").trim() !== value.machine_id) V.fail("MAIL_PRIVATE_HOST_MISMATCH");
  if (command(["docker", "version", "--format", "{{.Server.Version}}"]).trim() !== value.docker_version) V.fail("MAIL_PRIVATE_DOCKER_MISMATCH");
  const root = value.storage.root;
  if (!fs.existsSync(root) || fs.realpathSync(root) !== root) V.fail("MAIL_PRIVATE_STORAGE_MISMATCH");
  F.privateDirectory(root);
  const stat = fs.lstatSync(root);
  const mount = JSON.parse(command(["findmnt", "-J", "--target", root, "-o", "TARGET,SOURCE,FSTYPE,UUID,OPTIONS"])).filesystems;
  if (mount.length !== 1 || mount[0].target !== root || mount[0].fstype !== "ext4" || mount[0].uuid !== value.storage.uuid || mount[0].options.split(",").includes("ro")) V.fail("MAIL_PRIVATE_STORAGE_MISMATCH");
  if (stat.dev !== value.storage.root_dev || stat.ino !== value.storage.root_ino) V.fail("MAIL_PRIVATE_STORAGE_MISMATCH");
}
function trust(value, ca) {
  if (sha(ca) !== value.ca_sha256) V.fail("MAIL_PRIVATE_TRUST_MISMATCH");
}
function artifacts(original, value) {
  if (!value) return original;
  const marker = "nft -f /source/private-input.nft\n";
  if (original["postfix-entrypoint.sh"].split(marker).length !== 2) V.fail("MAIL_PRIVATE_FILTER_TEMPLATE_MISMATCH");
  const destinations = value.smtp_destinations;
  const allow = destinations.length ? `tcp dport 25 ip daddr { ${destinations.join(", ")} } accept\n` : "";
  const rules = `table inet drumee_mail_private_egress {\n chain output {\n type filter hook output priority -10; policy accept;\n ${allow}tcp dport { 25, 465, 587 } counter drop\n }\n}\n`;
  return { ...original, "private-egress.nft": rules, "postfix-entrypoint.sh": original["postfix-entrypoint.sh"].replace(marker, marker + "nft -f /source/private-egress.nft\n") };
}
function verifyCertificate(value, command, tls) {
  const leaf = new crypto.X509Certificate(F.read(tls.directory + "/certificate.pem"));
  if (!leaf.checkHost(value.hostname, { subject: "never" }) || Date.parse(leaf.validFrom) > Date.now() || Date.parse(leaf.validTo) <= Date.now()) V.fail("MAIL_CERTIFICATE_INVALID");
  command(["openssl", "verify", "-purpose", "sslserver", "-verify_hostname", value.hostname, "-CAfile", tls.directory + "/ca.pem", tls.directory + "/certificate.pem"]);
}
function prepared(value, context, command, tls, validateCertificate = true) {
  if (!value.private_activation) {
    if (context?.activation) V.fail("MAIL_PRIVATE_APPROVAL_MISMATCH");
    return false;
  }
  const declared = approval(value.private_activation, value.transport_digest, value.root);
  if (context?.acceptance === true || V.digest(context?.activation) !== V.digest(declared)) V.fail("MAIL_PRIVATE_APPROVAL_MISMATCH");
  host(declared, command); trust(declared, F.read(tls.directory + "/ca.pem"));
  if (validateCertificate) verifyCertificate(value, command, tls);
  return true;
}
module.exports = { approval, specApproval, host, trust, artifacts, prepared };
