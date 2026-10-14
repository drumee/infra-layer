"use strict";
const ref = (resource, key) => ({ resource, key });
function serviceInputs(root = "/tmp/infra-services-fixture", project = "infra-services-test", tools_image = "sha256:" + "a".repeat(64)) {
  const uid = typeof process.getuid === "function" ? process.getuid() : 1000; const gid = typeof process.getgid === "function" ? process.getgid() : 1000;
  const keys = { admin: ref("database", "admin"), database: ref("database", "service"), redis: ref("redis", "auth"), ca: ref("tls", "ca-key"), leaf: ref("tls", "leaf-key"), certificate: ref("tls", "certificate"), ca_bundle: ref("tls", "ca-certificate"), smtp: ref("mail", "submission"), dkim: ref("mail", "dkim"), tsig: ref("dns", "tsig") };
  const descriptors = [["admin", "database-admin", ["database"]], ["database", "database-service", ["database-client"]], ["redis", "redis-auth", ["redis"]], ["ca", "tls-ca-key", ["tls-issuer"]], ["leaf", "tls-leaf-key", ["tls-issuer", "mail", "gateway"]], ["smtp", "smtp-relay-credential", ["mail"]], ["dkim", "dkim-key", ["dkim"]], ["tsig", "dns-tsig", ["dns"]]].map(([name, type, consumers]) => ({ ref: keys[name], type, consumers: consumers.sort() }));
  const tool = (data_source, listen_port, user = uid) => ({ image: tools_image, uid: user, gid: user === 0 ? 0 : gid, ...(data_source ? { data_source } : {}), listen_port, bindings: [] });
  return { keys, spec: {
    contract_version: "2", instance: { id: project, domain: "drumee.lan" }, http: { enabled: false, https: false },
    secrets: { store_resource: "infrastructure-secrets", resources: descriptors },
    tls: { provider: "local", certificate_ref: keys.certificate, private_key_ref: keys.leaf, ca_key_ref: keys.ca, ca_bundle_ref: keys.ca_bundle, state_resource: "tls-state", leaf_days: 30, renew_before_days: 10 },
    dns: { mode: "local", ipv4: "192.168.50.10", serial: 1, clients: ["127.0.0.0/8", "172.16.0.0/12"], listen: ["0.0.0.0"], recursion: false, tsig_ref: keys.tsig, state_resource: "dns-state" },
    database: { mode: "managed", endpoint: { host: "database", port: 3306, transport: "tcp" }, engine_series: "11.4", admin_secret_ref: keys.admin, service_secret_ref: keys.database, service_user: "infra_client", state_resource: "database-state", initialize: true },
    redis: { mode: "managed", endpoint: { host: "redis", port: 6379, transport: "tcp" }, auth_secret_ref: keys.redis, persistence: "aof", state_resource: "redis-state" },
    mail: { mode: "capture", endpoint: { host: "mail", port: 2525, transport: "tcp" }, hostname: "drumee.lan", relay_endpoint: { host: "capture", port: 2525, transport: "tcp" }, relay_tls: "none", submission_user: "fixture", submission_secret_ref: keys.smtp, clients: ["127.0.0.0/8"], queue_resource: "mail-queue", initialize: true, dkim: { domain: "drumee.lan", selector: "infra", key_ref: keys.dkim } }
  }, requirements: { contract_version: "2", capabilities: ["tls", "dns", "database", "redis", "smtp"] }, adapter_input: {
    kind: "docker-services", project, network: project + "-kernel", services: {
      dns: { ...tool(root + "/dns", 1053), bindings: [{ host_address: "127.0.0.1", host_port: 15353, protocol: "tcp" }, { host_address: "127.0.0.1", host_port: 15353, protocol: "udp" }] },
      database: { ...tool(root + "/database", 3306, 0), image: "mariadb@sha256:611a2fcc5fa7c6ceb8644c6f74b25ede004ff6c3a6b38c8f8c23d3bbf6c26430" },
      redis: { ...tool(root + "/redis", 6379), image: "redis@sha256:ff02b58f971e7d7d156a1267e283fcbbeee91773b6aa36c49dac28ecfe28eadf" },
      mail: tool(root + "/mail", 2525, 0), dkim: tool(null, 8891)
    }, resource_sources: ["admin", "redis", "leaf", "certificate", "ca_bundle", "smtp", "dkim", "tsig"].map((name) => ({ ref: keys[name], source: root + "/projections/" + name }))
  } };
}
module.exports = { serviceInputs };
