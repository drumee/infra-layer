"use strict";
const S = require("../../lib/spec");
function source(inputs, ref) { return inputs.adapter_input.resource_sources.find((entry) => S.serialize(entry.ref) === S.serialize(ref)).source; }
function bind(source, target, read_only = true) { return { type: "bind", source, target, read_only, bind: { create_host_path: false } }; }
function service(inputs, name, alias) {
  const adapter = inputs.adapter_input.services[name];
  return { image: adapter.image, user: `${adapter.uid}:${adapter.gid}`, read_only: true, cap_drop: ["ALL"], security_opt: ["no-new-privileges:true"],
    networks: { kernel: { aliases: [alias] } }, tmpfs: [`/tmp:rw,noexec,nosuid,size=33554432,uid=${adapter.uid},gid=${adapter.gid},mode=0700`], mem_limit: "256m", pids_limit: 128,
    stop_grace_period: "30s", ports: adapter.bindings.map((value) => ({ target: adapter.listen_port, published: String(value.host_port), host_ip: value.host_address, protocol: value.protocol })), labels: { "org.drumee.infra.owner": inputs.adapter_input.project }, volumes: [] };
}
function fragment(inputs, name, value) {
  // Compose interpolates even JSON command strings. Escape container-shell
  // variables; mounted configuration/script artifacts are not interpolated.
  if (value.entrypoint) value.entrypoint = value.entrypoint.map((item) => item.replace(/\$/g, () => "$$"));
  if (value.healthcheck?.test?.[0] === "CMD-SHELL") value.healthcheck.test[1] = value.healthcheck.test[1].replace(/\$/g, () => "$$");
  return { services: { [name]: value }, networks: { kernel: { external: true, name: inputs.adapter_input.network } } };
}
function durable(inputs, id, source, consistency) { return { id, kind: "filesystem-state", owner: inputs.spec.instance.id, source, persistent: true, backup_required: true, consistency_required: consistency, recovery_prerequisites: ["OWNERSHIP_AND_VERSION_VALIDATION", "COORDINATED_ACTIVATION_REQUIRED"] }; }
module.exports = { source, bind, service, fragment, durable };
