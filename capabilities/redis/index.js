"use strict";
const S = require("../../lib/spec");
const F = require("../../lib/filesystem-safety");
const fs = require("node:fs");
const path = require("node:path");
function plan(inputs) {
  const { spec, adapter_input } = inputs; const config = spec.redis; const adapter = adapter_input.services.redis; const D = require("../../adapters/docker/resources");
  const value = D.service(inputs, "redis", config.endpoint.host); value.volumes = [D.bind("./redis.conf", "/config/redis.conf"), D.bind(D.source(inputs, config.auth_secret_ref), "/run/secrets/redis-auth")];
  const marker = JSON.stringify({ owner: spec.instance.id, resource: config.state_resource || "ephemeral" });
  let command = 'umask 077; infra_password="$(cat /run/secrets/redis-auth)"; case "$infra_password" in *[!A-Za-z0-9_+=.:/@-]*|"") exit 78;; esac; printf \'requirepass "%s"\\n\' "$infra_password" > /tmp/redis-auth.conf; ';
  if (config.persistence === "aof") { value.volumes.push(D.bind(adapter.data_source, "/data", false)); command += `if [ -f /data/.infra-owner ]; then [ "$(cat /data/.infra-owner)" = '${marker}' ] || exit 78; else [ -z "$(ls -A /data)" ] || exit 78; printf '%s' '${marker}' > /data/.infra-owner; fi; `; }
  else value.tmpfs.push(`/data:rw,noexec,nosuid,size=33554432,uid=${adapter.uid},gid=${adapter.gid},mode=0700`);
  value.entrypoint = ["/bin/sh", "-c", command + "exec redis-server /config/redis.conf"];
  value.healthcheck = { test: ["CMD-SHELL", `REDISCLI_AUTH="$(cat /run/secrets/redis-auth)" redis-cli -h 127.0.0.1 -p ${config.endpoint.port} ping | grep -Fx PONG`], interval: "2s", timeout: "2s", retries: 15 };
  return { compose: D.fragment(inputs, "redis", value), artifacts: [{ path: "redis.conf", content: `bind 0.0.0.0\nprotected-mode yes\nport ${config.endpoint.port}\ndaemonize no\nlogfile ""\ninclude /tmp/redis-auth.conf\ndir /data\nsave ""\nappendonly ${config.persistence === "aof" ? "yes" : "no"}\nappendfsync everysec\nmaxmemory 67108864\nmaxmemory-policy ${config.persistence === "aof" ? "noeviction" : "allkeys-lru"}\n` }],
    resources: config.persistence === "aof" ? [D.durable(inputs, config.state_resource, adapter.data_source, "AOF manifest/base/incremental files and credentials together")] : [{ id: "redis-ephemeral", kind: "cache-pubsub", owner: spec.instance.id, persistent: false, reconstructible: true }],
    prerequisites: [{ owner: "kernel-host", code: "AUTHENTICATED_REDIS_URL_MATERIALIZATION_REQUIRED" }, { owner: "operator", code: "REDIS_PROTOCOL_AND_RECONNECTION_VALIDATION_REQUIRED" }] };
}
function materializeClientConfiguration(store, ref, endpoint, directory, operation = {}) {
  if (operation.authorized !== true || !S.plainTree(endpoint) || !S.endpoint(endpoint) || !S.identifier(operation.owner)) F.fail("REDIS_OPERATION_NOT_AUTHORIZED"); F.privateDirectory(directory, true);
  const password = store.read(ref, "redis").toString(); const url = `redis://:${encodeURIComponent(password)}@${endpoint.host.includes(":") ? `[${endpoint.host}]` : endpoint.host}:${endpoint.port}`;
  const content = `${JSON.stringify({ redisHost: endpoint.host, redisPort: endpoint.port, redisUrl: url, liveUpdateChannel: "LIVE_UPDATE_CHANNEL" })}\n`;
  return F.lock(directory, () => {
    const file = path.join(directory, "redis-config.json"); const marker = path.join(directory, "infra-redis-config.json");
    if (fs.existsSync(file) || fs.existsSync(marker)) {
      let metadata; try { metadata = JSON.parse(F.read(marker)); } catch (_) { F.fail("REDIS_CONFIGURATION_OWNERSHIP_MISMATCH"); }
      if (metadata.owner !== operation.owner || metadata.digest !== S.digest(F.read(file).toString()) || !F.read(file).equals(Buffer.from(content))) F.fail("REDIS_CONFIGURATION_OWNERSHIP_MISMATCH");
    } else { F.atomic(file, content); F.atomic(marker, JSON.stringify({ owner: operation.owner, digest: S.digest(content) })); }
    return { ref, fingerprint: store.inspect(ref).fingerprint, active: false, activation_required: true };
  });
}
module.exports = { plan, materializeClientConfiguration };
