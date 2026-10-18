"use strict";
const { applicationInputs } = require("./application-inputs");
const { serviceInputs } = require("./service-inputs");
function cases() {
  const result = [];
  const add = (name, change) => { const value = applicationInputs(); change(value); result.push({ name, value }); };
  add("minimal", () => {});
  add("plugin-key-order", v => { v.distribution.application.plugins[0] = { root: "/app/plugins/qualification", revision: "b".repeat(40), id: "qualification" }; });
  add("smtp-dependent-ca", v => {
    const smtp = serviceInputs(); v.spec.instance.domain = "drumee.lan"; v.spec.tls = smtp.spec.tls; v.spec.mail = smtp.spec.mail; v.spec.secrets = smtp.spec.secrets;
    v.adapter_input.services = { mail: smtp.adapter_input.services.mail, dkim: smtp.adapter_input.services.dkim }; v.adapter_input.resource_sources = smtp.adapter_input.resource_sources;
    v.requirements.capabilities = ["smtp"]; v.distribution.application.requires = ["mail"];
    v.distribution.application.secret_mounts = [{ ref: smtp.spec.tls.ca_bundle_ref, consumer: "application", target: "/run/secrets/mail-ca", format: "tls-ca-bundle" }];
  });
  add("ordered-mounts-and-secrets", v => {
    v.distribution.persistent_resources = ["second", "first"].map(id => ({ id, source: "/qualification/" + id, uid: 1000, gid: 1000, backup_required: true }));
    v.distribution.application.mounts = ["second", "first"].map(resource => ({ resource, target: "/app/" + resource, read_only: false }));
    const ref = { resource: "application", key: "signing" }; v.spec.secrets.resources = [{ ref, type: "application-secret", consumers: ["application"] }]; v.requirements.secret_refs = [ref];
    v.distribution.application.secret_mounts = [{ ref, consumer: "application", target: "/run/secrets/key", format: "raw" }];
  });
  const mutations = [
    ["uid", v => v.uid = 0], ["gid", v => v.gid = -1], ["image", v => v.image = "latest"], ["command", v => v.command = []],
    ["entrypoint", v => v.entrypoint = []], ["environment", v => v.environment = { PASSWORD: "fixture" }],
    ["resource", v => v.mounts = [{ resource: "missing", target: "/app/state", read_only: false }]],
    ["secret", v => v.secret_mounts = [{ ref: { resource: "foreign", key: "key" }, consumer: "application", target: "/run/key", format: "raw" }]],
    ["dependency", v => v.requires = ["missing"]], ["healthcheck", v => v.healthcheck = null],
    ["health-interval", v => v.healthcheck.interval = "0s"], ["health-retries", v => v.healthcheck.retries = 0],
    ["extra-plugin", v => v.plugins[0].extra = "key"], ["missing-plugin", v => delete v.plugins[0].root]
  ];
  for (const [name, mutate] of mutations) add(name, v => mutate(v.distribution.application));
  // Multiple invalid fields prove diagnostic precedence, not just success output.
  for (const [name, mutate] of mutations) add("precedence-" + name, v => { mutate(v.distribution.application); v.distribution.application.environment = { PASSWORD: "fixture" }; });
  return result;
}
module.exports = { cases };
