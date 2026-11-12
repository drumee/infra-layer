"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const api = require("../../capabilities/mail-service");
const example = require("../../docs/mail-01/examples/service.valid.json");
test("MAIL-01 structural/semantic examples retain their explicit acceptance boundaries", () => {
  for (const name of fs.readdirSync(path.join(__dirname, "../../docs/mail-01/examples"))) {
    const input = require("../../docs/mail-01/examples/" + name), before = JSON.stringify(input);
    assert.equal(api.validateMailService(input).valid, name.includes(".valid."), name);
    assert.equal(JSON.stringify(input), before);
  }
});
test("Mail plan defaults, isolated composition, tamper and registry guards", () => {
  const plan = api.planMailService(example);
  assert.equal(plan.applicable, true); assert.equal(plan.spec.outbound.maximal_queue_lifetime_seconds, 432000);
  const compose = api.composeMailService(plan, { acceptance: true });
  assert.equal(compose.networks.edge.internal, true); assert.equal(compose.networks.control.internal, true);
  assert.ok(Object.values(compose.services).every(x => !x.ports));
  assert.match(plan.artifacts["main.cf"], /relayhost =\n/);
  assert.match(plan.artifacts["main.cf"], /smtp_sasl_auth_enable = no/);
  assert.match(plan.artifacts["dovecot.conf"], /storage_grace = 0/);
  const corrupt = structuredClone(plan); corrupt.artifacts["main.cf"] += "mynetworks=0.0.0.0/0";
  assert.throws(() => api.composeMailService(corrupt), { code: "MAIL_PLAN_TAMPERED" });
  assert.throws(() => api.planMailService(example, { registry: { contract: "drumee.mail-registry/1", generation: 0, mailboxes: [], aliases: [], accounts: [] } }), { code: "MAIL_REGISTRY_INVALID" });
});
test("Originating author parser and Authentication-Results identity boundaries", () => {
  const { authenticationService, authorMailbox } = require("../../capabilities/mail-service/policy");
  assert.equal(authenticationService('(comment) "MAIL.OXYMOT.FR." 1\r\n\t; spf=pass'), "mail.oxymot.fr");
  assert.equal(authenticationService('"mail\\.oxymot.fr"; spf=pass'), "mail.oxymot.fr");
  assert.equal(authenticationService('"external relay"; spf=pass'), "external relay");
  assert.equal(authenticationService('upstream.invalid; reason="mail.oxymot.fr"'), "upstream.invalid");
  assert.equal(authenticationService('mail.oxymot.fr.invalid; spf=pass'), "mail.oxymot.fr.invalid");
  assert.equal(authenticationService('mail.oxymot.fr\r\nX-Injected: bad'), null);
  assert.equal(authorMailbox('"Contact, team" (support) <contact@oxymot.fr>'), "contact@oxymot.fr");
  assert.equal(authorMailbox('contact@oxymot.fr,second@oxymot.fr'), null);
  assert.equal(authorMailbox('group:contact@oxymot.fr;'), null);
  assert.equal(authorMailbox('"ignored <address>" <contact@oxymot.fr>'), "contact@oxymot.fr");
});
test("Private acceptance uses canonical routing and an exact source packet filter before capability drop", () => {
  const plan=api.planMailService(example), compose=api.composeMailService(plan,{acceptance:true,private_bind:true});
  assert.equal(compose.networks.edge.internal,false);assert.equal(compose.networks.control.internal,true);
  assert.equal(compose.services.postfix.ports.length,1);
  assert.equal(compose.services.postfix.ports[0].host_ip,plan.spec.networks.private_submission.address);
  assert.match(plan.artifacts["private-input.nft"],/tcp dport .* drop/);
  assert.match(plan.artifacts["postfix-entrypoint.sh"],/nft -f \/source\/private-input.nft/);
  assert.match(plan.artifacts["postfix-entrypoint.sh"],/setpriv --bounding-set=-net_admin/);
});
