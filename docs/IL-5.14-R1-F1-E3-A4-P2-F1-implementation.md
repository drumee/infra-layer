# Observer F1 implementation boundary

Candidate changes are test-only. Existing P1 HTTP observer, P2 client/case state, all canonical Services/capture assertions, production runtime, networking, ownership and qualified R5 code remain unchanged.

- observer-contract.cjs implements the small explicit lifecycle state/identity/first-failure classifier and campaign result precedence.
- observer-events.cjs retains sanitized Docker event parsing and exact timestamp digits, adding required owned-container lifecycle coverage.
- docker-events.cjs now consumes stdout **and stderr**, records spawn/exit/close and stream completion, verifies private IPC completion, records signal intent/delivery to the exact direct CLI child and classifies only after collection and closure.
- observer-control.cjs binds the private Node fork instance/token/PID, verifies both IPC identities and wrapper streams/exit/close, and preserves wrapper failures independently of Services.
- observer-ready.cjs provides an event-driven private receipt barrier for the existing synchronous runner; no polling delay or retry.
- evidence-window.cjs checks the actual17-case/request/server cutoff before controlled termination.
- campaign.cjs uses those helpers; retains all canonical Docker commands, case order and expectations, adds a scoped observation of successful owned root removal and a final sticky campaign result. It never turns a failed Services child or prior observer error into0.

New controlled tests in test/diagnostics/observer-shutdown include a hash-pinned actual historical-module replay without source-string evaluation, D1–D26 plus additional identity/coverage controls, ordering/redaction/ready/coverage checks and isolated actual Docker positive/negative probes. The original P2 module bytes and logs remain in Git/evidence; no historical result is overwritten.

This is broader than replacing one boolean because P2 lacked the required intent, child identity, stderr, exit/close, readiness and collection-completion evidence. Every added helper supplies one part of the mandatory contract. No production file, dependency/export, Postfix behavior, HTTP capture policy, Docker network permission, existing assertion, scanner policy, retry or arbitrary sleep changes.

Qualification and independent review are required before any canonical campaign; this implementation record does not assert a PASS before execution.
