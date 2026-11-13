import { validateMailService, planMailService, composeMailService, prepareMailService, activateMailRegistry, operateMailService, rotateMailTLS, reconcileMailTLS, observeMailService } from '@drumee/infra-layer/mail-service';
const checked = validateMailService({});
if (checked.valid && checked.normalized) {
 const plan = planMailService(checked.normalized, {registry: {} as never, secret_sources: []});
 if (!plan.applicable) throw new Error("invalid fixture");
 const compose = composeMailService(plan, { acceptance: true });
 const prepared = prepareMailService(plan, { authorized: true, acceptance: true, verifiers: {} });
 activateMailRegistry(prepared, {authorized: true, expected_generation: 1});
 operateMailService(prepared, 'preflight', {authorized: true});
 rotateMailTLS(prepared, {certificate_file:'/private/cert',key_file:'/private/key',ca_file:'/private/ca'}, {authorized: true});
 reconcileMailTLS(prepared, {authorized: true});
 observeMailService(prepared, {authorized: true, queue_age_seconds: 3600, auth_failures: 5});
 console.log(compose);
}
