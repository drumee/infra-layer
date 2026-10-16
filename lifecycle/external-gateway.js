"use strict";
const http = require("node:http");
const S = require("../lib/spec");
const F = require("../lib/filesystem-safety");
function validate(distribution, plan) {
  const app = distribution.application, gateway = distribution.external_gateway;
  if (!app || !S.record(gateway) || Object.keys(gateway).some(key => !["kind", "protocol", "host_address", "host_port", "container_port", "route_prefix", "rpc_prefix", "tls_termination", "readiness_path"].includes(key))) F.fail("EXTERNAL_GATEWAY_CONTRACT_REQUIRED");
  if (gateway.kind !== "host-loopback" || gateway.protocol !== "http" || gateway.host_address !== "127.0.0.1" || !S.port(gateway.host_port) || gateway.host_port < 1024 || !S.port(gateway.container_port) || gateway.container_port < 1024) F.fail("PRIVATE_APPLICATION_BINDING_REQUIRED");
  if (gateway.route_prefix !== "/-/" || gateway.rpc_prefix !== "/-/svc/" || gateway.tls_termination !== "external" || !/^\/-\/svc\/[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/.test(gateway.readiness_path || "")) F.fail("EXTERNAL_GATEWAY_ROUTE_INVALID");
  if (distribution.kernel !== undefined || distribution.services !== undefined || plan.inputs.spec.http.enabled || plan.inputs.spec.http.https || plan.inputs.adapter_input.gateway !== undefined) F.fail("APPLICATION_GATEWAY_CONFLICT");
  if (["gateway", "dns", "database", "redis", "mail", "dkim"].includes(app.id) || !Array.isArray(app.listener_ports) || app.listener_ports.length !== 1 || app.listener_ports[0] !== gateway.container_port) F.fail("APPLICATION_LISTENER_CONTRACT_MISMATCH");
  if (!Array.isArray(app.plugins) || app.plugins.length > 64) F.fail("INVALID_APPLICATION_PLUGINS");
  const ids = new Set(), roots = new Set();
  for (const plugin of app.plugins) {
    if (!S.record(plugin) || Object.keys(plugin).sort().join(",") !== "id,revision,root" || !S.identifier(plugin.id) || !S.resourcePath(plugin.root) || !/^[a-f0-9]{40,64}$/.test(plugin.revision || "") || ids.has(plugin.id) || roots.has(plugin.root)) F.fail("INVALID_APPLICATION_PLUGINS");
    ids.add(plugin.id); roots.add(plugin.root);
  }
  if (!Array.isArray(app.requires) || app.requires.includes("dkim") || app.requires.includes("mail") && !plan.inputs.requirements.capabilities.includes("smtp")) F.fail("APPLICATION_DEPENDENCY_REQUIREMENT");
  return gateway;
}
function binding(gateway) { return { target: gateway.container_port, published: gateway.host_port, host_ip: gateway.host_address, protocol: "tcp" }; }
function endpoint(gateway) { return { upstream: `http://${gateway.host_address}:${gateway.host_port}`, container_port: gateway.container_port, binding_address: gateway.host_address, host_port: gateway.host_port, route_prefix: gateway.route_prefix, rpc_prefix: gateway.rpc_prefix, tls_termination: gateway.tls_termination }; }
async function probe(prepared) {
  const gateway = prepared.composition.distribution.external_gateway;
  if (!gateway) return { applicable: false };
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error) => { if (settled) return; settled = true; clearTimeout(timer); if (error) reject(Object.assign(new Error("APPLICATION_PROTOCOL_FAILED"), { code: "APPLICATION_PROTOCOL_FAILED" })); else resolve({ ...endpoint(gateway), protocol_functional: true }); };
    const req = http.get({ agent: false, hostname: gateway.host_address, port: gateway.host_port, path: gateway.readiness_path, headers: { Host: "localhost" } }, res => {
      const chunks = []; let length = 0;
      res.on("data", bytes => { length += bytes.length; if (length > 4096) { finish(true); req.destroy(); } else chunks.push(bytes); });
      res.on("error", () => finish(true));
      res.on("end", () => { let body; try { body = JSON.parse(Buffer.concat(chunks)); } catch (_) {} finish(res.statusCode !== 200 || body?.status !== "ok"); });
    });
    const timer = setTimeout(() => { finish(true); req.destroy(); }, 5000);
    req.on("error", () => finish(true));
  });
}
module.exports = { validate, binding, endpoint, probe };
