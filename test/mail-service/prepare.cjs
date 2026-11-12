"use strict";
const fs = require("node:fs"), { createRequire } = require("node:module");
if (!process.env.MAIL02_CONSUMER) throw Error("MAIL02_INSTALLED_CONSUMER_REQUIRED");
const api = createRequire(process.env.MAIL02_CONSUMER + "/package.json")("@drumee/infra-layer/mail-service");
const i = JSON.parse(fs.readFileSync(process.argv[2])), spec = require("../../docs/mail-01/examples/service.valid.json");
spec.deployment = { ...spec.deployment, root: i.root, backup_root: i.root + "-backups", id: i.project, project: i.project, owner_uid: process.getuid(), owner_gid: process.getgid(), images: Object.fromEntries(["postfix", "dovecot", "opendkim", "helper"].map(k => [k, "local/mail@" + (k === "helper" ? i.node_image : i.image)])) };
spec.networks.edge_subnet = "10.243.47.0/24"; spec.networks.edge_gateway = "10.243.47.1"; spec.networks.private_submission.address = "10.243.47.1";
spec.networks.private_submission.allowed_sources = ["10.243.47.0/25"];
const registry = { contract: "drumee.mail-registry/1", generation: 1,
  mailboxes: [{ id: "11111111-1111-4111-8111-111111111111", address: "contact@oxymot.fr", quota_bytes: 1048576, receive_enabled: true, imap_enabled: true, submission_enabled: false }, { id: "22222222-2222-4222-8222-222222222222", address: "second@oxymot.fr", quota_bytes: 1048576, receive_enabled: true, imap_enabled: true, submission_enabled: false }],
  aliases: [{ address: "hello@oxymot.fr", mailbox_id: "11111111-1111-4111-8111-111111111111", receive_enabled: true }, ...["postmaster", "abuse"].map(name => ({ address: name + "@oxymot.fr", mailbox_id: "22222222-2222-4222-8222-222222222222", receive_enabled: true }))],
  accounts: [{ id: "ghost", enabled: true, credential_generation: 1, envelope_from: ["contact@oxymot.fr"], header_from: ["contact@oxymot.fr"] }, { id: "oxymotion", enabled: true, credential_generation: 1, envelope_from: ["second@oxymot.fr"], header_from: ["second@oxymot.fr"] }]
};
const sources = ["certificate", "key", "ca"].map(k => ({ ref: "secret:mail-tls/" + k, file: i.keys + "/" + ({ certificate: "certificate.pem", key: "key.pem", ca: "ca.pem" })[k] }));
sources.push({ ref: "secret:mail-dkim/oxymot", file: i.keys + "/dkim.pem" });
const plan = api.planMailService(spec, { registry, secret_sources: sources });
const prepared = api.prepareMailService(plan, { authorized: true, acceptance: true, verifiers: i.verifiers });
fs.writeFileSync(i.output, JSON.stringify({ plan, prepared }, null, 2), { mode: 0o600 });
console.log(JSON.stringify({ applicable: plan.applicable, revision: plan.revision }));
