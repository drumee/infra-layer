"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const { composeDeployment } = require("../../lifecycle");
const { verifyComposition } = require("../../lifecycle/composition");
const { applicationInputs } = require("../support/application-inputs");
const { serviceInputs } = require("../support/service-inputs");
const compose = value => composeDeployment(value.plan(), value.distribution);
test("application has one explicit loopback publication and no implicit infrastructure", () => {
  const value = applicationInputs(), before = JSON.stringify(value);
  const result = compose(value);
  assert.deepEqual(Object.keys(result.compose.services), ["application"]);
  assert.deepEqual(result.activation_order, ["application"]); assert.deepEqual(result.shutdown_order, ["application"]);
  assert.deepEqual(result.compose.services.application.ports, [{ target: 3101, published: 28971, host_ip: "127.0.0.1", protocol: "tcp" }]);
  assert.deepEqual(result.compose.services.application.networks, ["kernel"]);
  assert.equal(result.compose.services.application.read_only, true); assert.deepEqual(result.compose.services.application.cap_drop, ["ALL"]);
  assert.equal(result.compose.services.application.network_mode, undefined);
  assert.deepEqual(verifyComposition(result), result); assert.equal(JSON.stringify(value), before);
});
for (const address of ["0.0.0.0", "::", "::1", "127.0.0.2", "192.168.5.201", "localhost", "::ffff:127.0.0.1"]) test("application rejects noncanonical host binding " + address, () => {
  const value = applicationInputs(); value.distribution.external_gateway.host_address = address;
  assert.throws(() => compose(value), { code: "PRIVATE_APPLICATION_BINDING_REQUIRED" });
});
test("application rejects invalid ports, listener confusion, routes and hidden publications", () => {
  const mutations = [v => v.external_gateway.host_port = 80, v => v.external_gateway.host_port = "28971", v => v.external_gateway.container_port = 80, v => v.external_gateway.protocol = "https", v => v.external_gateway.route_prefix = "/api/", v => v.external_gateway.rpc_prefix = "/svc/", v => v.external_gateway.tls_termination = "managed", v => v.external_gateway.readiness_path = "/health", v => v.application.listener_ports = [3102], v => v.application.listener_ports.push(3102), v => v.application.ports = [{ host_ip: "0.0.0.0" }], v => v.application.network_mode = "host"];
  for (const mutate of mutations) { const value = applicationInputs(); mutate(value.distribution); assert.throws(() => compose(value)); }
});
test("application cannot borrow or relax legacy profile semantics", () => {
  for (const profile of ["kernel", "infrastructure"]) { const value = applicationInputs(); value.distribution.profile = profile; assert.throws(() => compose(value), { code: "APPLICATION_COMPOSITION_REQUIRED" }); }
  for (const mutate of [v => delete v.distribution.external_gateway, v => v.distribution.kernel = v.distribution.application, v => v.distribution.services = [], v => v.adapter_input.gateway = {}, v => v.spec.http.enabled = true]) { const value = applicationInputs(); mutate(value); assert.throws(() => compose(value)); }
});
test("plugins are explicit immutable inventory without an alternate loader", () => {
  const value = applicationInputs(); const first = compose(value);
  value.distribution.application.plugins[0].revision = "c".repeat(40); assert.notEqual(compose(value).revision, first.revision);
  for (const mutate of [v => delete v.plugins, v => v.plugins.push(v.plugins[0]), v => v.plugins[0].root = "/app/../etc", v => v.plugins[0].revision = "main", v => v.plugins[0].secret_value = "not-a-secret"]) { const next = applicationInputs(); mutate(next.distribution.application); assert.throws(() => compose(next), { code: "INVALID_APPLICATION_PLUGINS" }); }
});
test("application secrets select only declared references and retain consumer boundaries", t => {
  const value = applicationInputs(); const ref = { resource: "application", key: "signing" };
  value.spec.secrets.resources = [{ ref, type: "application-secret", consumers: ["application"] }];
  assert.deepEqual(value.plan().required_secrets, []);
  value.requirements.secret_refs = [ref];
  value.distribution.application.secret_mounts = [{ ref, consumer: "application", target: "/run/secrets/signing", format: "raw" }];
  const plan = value.plan(); assert.equal(plan.applicable, true); assert.equal(plan.required_secrets.length, 1);
  const result = compose(value); assert.equal(result.projections[0].consumer, "application"); assert.deepEqual(Object.keys(result.compose.services), ["application"]);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "infra-il5-secret-")); fs.chmodSync(root, 0o700); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const store = require("../../capabilities/secrets").createFilesystemSecretStore(path.join(root, "secrets"), "infra-application");
  const first = store.ensure(plan.required_secrets[0], { authorized: true }); assert.equal(store.ensure(plan.required_secrets[0]).fingerprint, first.fingerprint);
  assert.throws(() => store.read(ref, "unrelated"), { code: "SECRET_CONSUMER_FORBIDDEN" });
  value.distribution.application.secret_mounts[0].consumer = "unrelated"; assert.throws(() => compose(value), { code: "INVALID_SECRET_REFERENCE" });
  value.requirements.secret_refs.push(ref); assert.equal(value.plan().applicable, false);
  value.requirements.secret_refs = [{ resource: "missing", key: "absent" }]; assert.equal(value.plan().applicable, false);
});
test("SMTP/DKIM compose unchanged, private and before an explicitly dependent application", () => {
  const value = applicationInputs(), smtp = serviceInputs();
  value.spec.instance.domain = "drumee.lan"; value.spec.tls = smtp.spec.tls; value.spec.mail = smtp.spec.mail; value.spec.secrets = smtp.spec.secrets;
  value.adapter_input.services = { mail: smtp.adapter_input.services.mail, dkim: smtp.adapter_input.services.dkim }; value.adapter_input.resource_sources = smtp.adapter_input.resource_sources;
  value.requirements.capabilities = ["smtp"]; value.distribution.application.requires = ["mail"];
  const result = compose(value); assert.deepEqual(result.activation_order, ["dkim", "mail", "application"]);
  assert.deepEqual(Object.keys(result.compose.services.dkim.networks), ["mail-control"]); assert.equal(result.compose.networks["mail-control"].internal, true);
  for (const id of ["mail", "dkim"]) assert.equal((result.compose.services[id].ports || []).length, 0);
  assert.equal(result.compose.services.application.depends_on.mail.condition, "service_healthy");
  const ca = { ref: smtp.spec.tls.ca_bundle_ref, consumer: "application", target: "/run/secrets/mail-ca", format: "tls-ca-bundle" };
  value.distribution.application.secret_mounts = [ca];
  assert.equal(compose(value).projections[0].format, "tls-ca-bundle");
  ca.ref = smtp.spec.tls.private_key_ref; assert.throws(() => compose(value), { code: "INVALID_SECRET_REFERENCE" });
  ca.ref = smtp.spec.tls.ca_bundle_ref; ca.consumer = "unrelated"; assert.throws(() => compose(value), { code: "INVALID_SECRET_REFERENCE" });
  ca.consumer = "application"; ca.format = "raw"; assert.throws(() => compose(value), { code: "INVALID_SECRET_REFERENCE" });
  ca.format = "tls-ca-bundle";
  value.requirements.capabilities = []; assert.throws(() => compose(value), { code: "APPLICATION_DEPENDENCY_REQUIREMENT" });
  value.distribution.application.requires = []; assert.deepEqual(compose(value).activation_order, ["dkim", "mail", "application"]);
});
test("application retains immutable image, resource, dependency and tamper guards", () => {
  for (const mutate of [v => v.image = "node:latest", v => v.uid = 0, v => v.mounts = [{ resource: "unknown", target: "/data", read_only: false }], v => v.requires = ["undeclared"], v => v.environment = { PASSWORD: "not-a-secret" }, v => delete v.healthcheck]) { const value = applicationInputs(); mutate(value.distribution.application); assert.throws(() => compose(value)); }
  const result = compose(applicationInputs()); result.compose.services.application.ports[0].host_ip = "0.0.0.0"; assert.throws(() => verifyComposition(result), { code: "COMPOSITION_TAMPERED" });
});
