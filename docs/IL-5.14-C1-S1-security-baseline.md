# IL-5.14-C1-S1 security baseline

Gate S1-A: PASS. Resume e13777f897d72dcb14e464ac69547709c2a051e7 was clean on fix/il514-c1-network-attachment-identity. Node22.22.0/npm11.18.0,normal UID/GID1000:1000. The original `npm audit --include=dev --json --registry=https://registry.npmjs.org` was reproduced before remediation,exit1. The earlier C1 report and raw audit remain unchanged.

The root manifest/lock and installation declared Nodemailer10.1.1 and smtp-server3.19.22 as development dependencies. smtp-server also required Nodemailer10.1.1 exactly,so changing only the direct root pin would leave a vulnerable nested copy. The private test/application fixture independently declared Nodemailer10.1.1 as a fixture dependency;its worker uses it for real SMTP acceptance inside the disposable application image. This fixture dependency is not a production dependency of the published Infra Layer package or a modification of Server Runtime.

Root test/services/services.test.js uses Nodemailer as the SMTP client;test/services/capture.js uses smtp-server in the isolated capture sink. The root package has no production dependencies. Nodemailer source/node_modules are not in its published files allowlist;the dev dependency declaration is metadata,not a bundled runtime copy. Development classification still matters for mandatory CI and the test environment.

| Advisory | Severity | Vulnerable range | First patched | Installed paths/impact |
|---|---|---|---|---|
| [GHSA-8c8m-p3m8-cjg8](https://github.com/advisories/GHSA-8c8m-p3m8-cjg8) |Moderate6.5 |>=3.0.0 <10.1.4 |10.1.4 |Root/direct and smtp-server's exact dependency;address comment parsing can select an unintended recipient |
| [GHSA-m943-m63m-w62w](https://github.com/advisories/GHSA-m943-m63m-w62w) |Moderate6.5 |Same |10.1.4 |Same graph;quoted/comment semicolon handling can change address groups |
| [GHSA-85x2-q946-cp5h](https://github.com/advisories/GHSA-85x2-q946-cp5h) |Moderate6.5 |Same |10.1.4 |Same graph;quoted angle-address handling can select another domain |

These are three advisories and two npm package entries:nodemailer plus propagated smtp-server. There are no high/critical entries in the preserved baseline. Fixture addresses and messages are isolated,but passing vulnerable parsing or compromised tools into the acceptance environment is not exempt from the existing full-development audit policy.

Remediation scope is the root development mail graph and the independently locked application acceptance fixture. No public API,production dependency,external canonical repository or published alpha.3 artifact is changed. Exact before/after locks,registry integrity,commands and audit evidence are referenced by the S1 final decision.
