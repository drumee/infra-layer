"use strict";
// Test-only canonical acquisition/preparation. Never reads production credentials.
const fs = require("node:fs"), path = require("node:path"), assert = require("node:assert/strict");
const input = JSON.parse(fs.readFileSync(process.argv[2]));
const api = require(path.join(input.consumer, "lib/index.js"));
const L = require(path.join(input.consumer, "lifecycle/index.js"));
const { serviceInputs } = require("../support/service-inputs");
async function main() {
  const x = serviceInputs(input.root + "/durable", input.project, input.image), k = x.keys;
  delete x.spec.database; delete x.spec.redis;
  x.spec.dns = { mode: "none" }; x.spec.instance.domain = "relay.fixture.invalid";
  x.spec.secrets.resources = x.spec.secrets.resources.filter(d => ["tls-leaf-key", "smtp-relay-credential", "dkim-key"].includes(d.type));
  const external = { resource: "mail", key: "external" };
  x.spec.secrets.resources.push({ ref: external, type: "smtp-external-credential", consumers: ["mail"] });
  x.spec.tls = { provider: "provided", certificate_ref: k.certificate, private_key_ref: k.leaf, ca_bundle_ref: k.ca_bundle };
  Object.assign(x.spec.mail, { mode: "relay", hostname: "relay.fixture.invalid", relay_endpoint: { host: "receiver", port: 2525, transport: "tcp" }, relay_tls: "required", relay_user: "synthetic-upstream", relay_secret_ref: external, dkim: { domain: "relay.fixture.invalid", selector: "fixture", key_ref: k.dkim } });
  x.requirements.capabilities = ["smtp"];
  x.adapter_input.services = { mail: x.adapter_input.services.mail, dkim: x.adapter_input.services.dkim };
  const source = name => input.keys + "/" + name;
  x.adapter_input.resource_sources = [[k.leaf, "relay.key"], [k.certificate, "relay.pem"], [k.ca_bundle, "trust.pem"], [k.smtp, "submission"], [external, "upstream"], [k.dkim, "unused-dkim-projection"]].map(([ref, name]) => ({ ref, source: source(name) }));
  const plan = api.planInfrastructure(x.spec, x.requirements, x.adapter_input); assert.equal(plan.applicable, true);
  const distribution = { contract_version: "1", id: "queue-restore-qualification", profile: "infrastructure", init_jobs: [], persistent_resources: [], schema_versions: {}, external_writers: "none", helper_image: input.node_image, provenance: { repository: "https://github.com/drumee/infra-layer", revision: input.source, path: "test/queue-restore", acceptance: "infrastructure" } };
  const composition = L.composeDeployment(plan, distribution);
  const prepared = await L.prepareDeployment(composition, { root: input.root, authorized: true, create_resources: true, imports: [{ ref: k.leaf, file: source("relay.key") }, { ref: k.smtp, file: source("submission") }, { ref: external, file: source("upstream") }] });
  fs.writeFileSync(input.output, JSON.stringify(prepared, null, 2), { mode: 0o600, flag: "wx" });
  console.log(JSON.stringify({ prepared: true, revision: prepared.revision, image: input.image }));
}
main().catch(e => { console.error(e.code || "QUEUE_FIXTURE_PREPARATION_FAILED"); process.exitCode = 1; });
