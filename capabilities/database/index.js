"use strict";
const S = require("../../lib/spec");
function plan(inputs) {
  const { spec, adapter_input } = inputs; const config = spec.database; const adapter = adapter_input.services.database; const D = require("../../adapters/docker/resources");
  const value = D.service(inputs, "database", config.endpoint.host); value.cap_add = ["CHOWN", "SETUID", "SETGID", "DAC_OVERRIDE", "FOWNER"];
  value.tmpfs = ["/tmp:rw,noexec,nosuid,size=33554432,mode=1777", "/run/mysqld:rw,nosuid,size=16777216,uid=999,gid=999,mode=0755"]; value.mem_limit = "512m";
  value.volumes = [D.bind("./mariadb.cnf", "/config/mariadb.cnf"), D.bind(adapter.data_source, "/var/lib/mysql", false), D.bind(D.source(inputs, config.admin_secret_ref), "/run/secrets/database-admin")];
  value.environment = { MARIADB_ROOT_PASSWORD_FILE: "/run/secrets/database-admin", MARIADB_ROOT_HOST: "localhost", MARIADB_SKIP_TEST_DB: "1" };
  const marker = JSON.stringify({ owner: spec.instance.id, resource: config.state_resource, engine: config.engine_series });
  const guard = `if [ -d /var/lib/mysql/mysql ]; then [ -f /var/lib/mysql/.infra-owner ] && [ "$(cat /var/lib/mysql/.infra-owner)" = '${marker}' ] || exit 78; else [ -z "$(ls -A /var/lib/mysql)" ] || exit 78; ${config.initialize ? `umask 077; printf '%s' '${marker}' > /var/lib/mysql/.infra-owner;` : "exit 78;"} fi; `;
  value.entrypoint = ["/bin/sh", "-c", guard + "exec /usr/local/bin/docker-entrypoint.sh mariadbd --defaults-extra-file=/config/mariadb.cnf"];
  value.healthcheck = { test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"], interval: "2s", timeout: "3s", retries: 30, start_period: "10s" };
  return { compose: D.fragment(inputs, "database", value), artifacts: [{ path: "mariadb.cnf", content: `[mariadb]\nbind-address=0.0.0.0\nport=${config.endpoint.port}\nskip-name-resolve=1\nmax_connections=50\ncharacter-set-server=utf8mb4\ncollation-server=utf8mb4_unicode_ci\n` }],
    resources: [D.durable(inputs, config.state_resource, adapter.data_source, "engine-consistent snapshot plus credentials; no image-only database rollback")],
    prerequisites: [{ owner: "kernel/modules", code: "SCHEMAS_PROVISIONING_AND_GRANTS_OUTSTANDING" }, { owner: "operator", code: "EXPLICIT_SERVICE_ACCOUNT_PROVISIONING_REQUIRED" }, { owner: "operator", code: "DATABASE_ENGINE_AUTH_AND_VERSION_VALIDATION_REQUIRED" }] };
}
async function createServiceAccount(config, store, client, operation = {}) {
  if (operation.authorized !== true || !config || config.mode !== "managed" || !/^[a-z][a-z0-9_]{0,31}$/.test(config.service_user || "") || !client || typeof client.query !== "function") throw Object.assign(new Error("DATABASE_OPERATION_NOT_AUTHORIZED"), { code: "DATABASE_OPERATION_NOT_AUTHORIZED" });
  const password = store.read(config.service_secret_ref, "database-client").toString();
  try {
    const version = await client.query("SELECT VERSION() AS version"); if (!String(version[0]?.version).startsWith("11.4.")) throw Object.assign(new Error("DATABASE_VERSION_INCOMPATIBLE"), { code: "DATABASE_VERSION_INCOMPATIBLE" });
    const exists = await client.query("SELECT User FROM mysql.user WHERE User = ? AND Host = '%'", [config.service_user]);
    if (exists.length) return { account: config.service_user, created: false, diagnostic_codes: ["EXISTING_ACCOUNT_CREDENTIAL_VALIDATION_REQUIRED"] };
    await client.query("CREATE USER ?@'%' IDENTIFIED BY ?", [config.service_user, password]);
    return { account: config.service_user, created: true, diagnostic_codes: ["APPLICATION_SCHEMA_GRANTS_OUTSTANDING"] };
  } catch (error) { const code = error.code === "DATABASE_VERSION_INCOMPATIBLE" ? error.code : "DATABASE_ACCOUNT_PROVISIONING_FAILED"; throw Object.assign(new Error(code), { code }); }
}
module.exports = { plan, createServiceAccount };
