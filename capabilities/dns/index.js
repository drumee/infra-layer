"use strict";
const fs = require("node:fs");
const path = require("node:path");
const S = require("../../lib/spec");
const F = require("../../lib/filesystem-safety");
function renderZone(domain, dns, dkim) {
  const txt = dkim?.public_key && dkim.domain === domain ? `\n${dkim.selector}._domainkey IN TXT ${[`v=DKIM1; k=rsa; p=${dkim.public_key}`].flatMap((value) => value.match(/.{1,200}/g)).map((value) => `"${value}"`).join(" ")}\n` : "";
  return `$ORIGIN ${domain}.\n$TTL 300\n@ IN SOA ns.${domain}. hostmaster.${domain}. ( ${dns.serial} 300 120 604800 300 )\n@ IN NS ns.${domain}.\n@ IN A ${dns.ipv4}\nns IN A ${dns.ipv4}\n${dns.ipv6 ? `@ IN AAAA ${dns.ipv6}\nns IN AAAA ${dns.ipv6}\n` : ""}${txt}`;
}
function zoneFile(domain, dns, dkim) { const zone = renderZone(domain, dns, dkim); return { file: `zone-${dns.serial}-${S.digest(zone).slice(0, 16)}.db`, zone }; }
function renderConfiguration(domain, dns, listen_port, dkim) {
  const ipv4 = dns.listen.filter((value) => require("node:net").isIP(value) === 4); const ipv6 = dns.listen.filter((value) => require("node:net").isIP(value) === 6);
  return `${dns.tsig_ref ? 'include "/tmp/dns-tsig.conf";\n' : ""}options {\n directory "/var/cache/bind";\n pid-file "/tmp/named.pid";\n session-keyfile "/tmp/session.key";\n listen-on port ${listen_port} { ${ipv4.length ? ipv4.map((value) => value === "0.0.0.0" ? "any" : value).join("; ") + ";" : "none;"} };\n listen-on-v6 port ${listen_port} { ${ipv6.length ? ipv6.map((value) => value === "::" ? "any" : value).join("; ") + ";" : "none;"} };\n recursion ${dns.recursion ? "yes" : "no"};\n allow-query { ${dns.clients.join("; ")}; };\n allow-query-cache { ${dns.recursion ? dns.clients.join("; ") : "none"}; };\n allow-recursion { ${dns.recursion ? dns.clients.join("; ") : "none"}; };\n ${dns.recursion ? `forward only; forwarders { ${dns.forwarders.join("; ")}; };` : ""}\n dnssec-validation no;\n empty-zones-enable no;\n version "not disclosed";\n};\ncontrols {};\nzone "${domain}" { type primary; file "/var/cache/bind/${zoneFile(domain, dns, dkim).file}"; allow-update { none; }; allow-transfer { ${dns.tsig_ref ? 'key "infra-tsig"' : "none"}; }; notify no; };\n`;
}
function prepareZone(domain, dns, dkim, directory, operation = {}) {
  if (operation.authorized !== true || !S.hostname(domain) || dns?.mode !== "local" || !Number.isSafeInteger(dns.serial)) F.fail("DNS_OPERATION_NOT_AUTHORIZED");
  if (!S.plainTree(dns) || !S.plainTree(dkim === undefined ? null : dkim) || !S.identifier(operation.owner) || dns.serial < 1 || dns.serial > 4294967295 || require("node:net").isIP(dns.ipv4) !== 4 || (dns.ipv6 && require("node:net").isIP(dns.ipv6) !== 6) || (dkim && (!S.hostname(dkim.domain) || !/^[a-z][a-z0-9-]{0,62}$/.test(dkim.selector || "") || (dkim.public_key !== undefined && !/^[a-zA-Z0-9+/=]{100,1024}$/.test(dkim.public_key))))) F.fail("INVALID_DNS_CONFIGURATION");
  F.privateDirectory(directory, true);
  return F.lock(directory, () => {
    const output = zoneFile(domain, dns, dkim); const manifest_file = path.join(directory, "infra-zone.json");
    if (fs.existsSync(manifest_file)) {
      let state; try { state = JSON.parse(F.read(manifest_file)); } catch (_) { F.fail("DNS_STATE_CORRUPTED"); }
      if (state.owner !== operation.owner || state.domain !== domain || !/^zone-\d+-[a-f0-9]{16}\.db$/.test(state.file) || S.digest(F.read(path.join(directory, state.file)).toString()) !== state.digest) F.fail("DNS_STATE_CORRUPTED");
      if (state.digest !== S.digest(output.zone) && dns.serial <= state.serial) F.fail("DNS_SERIAL_NOT_ADVANCED");
      if (dns.serial < state.serial) F.fail("DNS_SERIAL_NOT_ADVANCED");
    } else if (fs.readdirSync(directory).some((name) => name.startsWith("zone-") || name === "infra-zone.json")) F.fail("DNS_STATE_CORRUPTED");
    const file = path.join(directory, output.file);
    if (fs.existsSync(file)) { if (!F.read(file).equals(Buffer.from(output.zone))) F.fail("DNS_STATE_CORRUPTED"); }
    else F.atomic(file, output.zone);
    F.atomic(manifest_file, `${S.serialize({ owner: operation.owner, domain, serial: dns.serial, file: output.file, digest: S.digest(output.zone) })}\n`);
    return { domain, serial: dns.serial, zone_digest: S.digest(output.zone), file: output.file, active: false, activation_required: true };
  });
}
function plan(inputs, domain) {
  const { spec, adapter_input } = inputs; const adapter = adapter_input.services.dns; const D = require("../../adapters/docker/resources");
  const value = D.service(inputs, "dns", "dns");
  value.volumes = [D.bind("./bind9.conf", "/config/bind9.conf"), D.bind(adapter.data_source, "/var/cache/bind", false)];
  let command = "exec named -g -c /config/bind9.conf";
  if (spec.dns.tsig_ref) { value.volumes.push(D.bind(D.source(inputs, spec.dns.tsig_ref), "/run/secrets/dns-tsig")); command = 'umask 077; infra_secret="$(cat /run/secrets/dns-tsig)"; case "$infra_secret" in *[!A-Za-z0-9+/=]*) exit 78;; esac; [ "${#infra_secret}" = 44 ] || exit 78; printf \'key "infra-tsig" { algorithm hmac-sha256; secret "%s"; };\\n\' "$infra_secret" > /tmp/dns-tsig.conf; ' + command; }
  value.entrypoint = ["/bin/sh", "-c", command.replace("exec named -g -c /config/bind9.conf", 'exec "$@"'), "infra-dns"];
  value.command = ["named", "-g", "-c", "/config/bind9.conf"];
  value.healthcheck = { test: ["CMD-SHELL", `dig @127.0.0.1 -p ${adapter.listen_port} ${domain} A +short | grep -Fx ${spec.dns.ipv4}`], interval: "2s", timeout: "2s", retries: 15 };
  return { compose: D.fragment(inputs, "dns", value), artifacts: [{ path: "bind9.conf", content: renderConfiguration(domain, spec.dns, adapter.listen_port, spec.mail?.dkim) }],
    resources: [D.durable(inputs, spec.dns.state_resource, adapter.data_source, "zone generations, serial manifest and any DNS journals together")],
    prerequisites: [{ owner: "operator", code: "NAMED_CHECKCONF_CHECKZONE_AND_EXPLICIT_ZONE_PREPARATION_REQUIRED" }, { owner: "LAN-operator", code: "CLIENT_RESOLVER_CONFIGURATION_AND_LAN_REACHABILITY_REQUIRED" }, ...(spec.dns.split_horizon ? [{ owner: "operator", code: "EXTERNAL_DNS_RECORD_SHADOWING_REVIEW_REQUIRED" }] : [])] };
}
module.exports = { renderZone, renderConfiguration, prepareZone, zoneFile, plan };
