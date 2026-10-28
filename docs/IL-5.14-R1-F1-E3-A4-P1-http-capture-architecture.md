# P1 HTTP capture architecture

Gate B PASS by source reconstruction. Canonical files: test/services/run.js, capture.js, Dockerfile.capture, services.test.js, trace.js. No P1 canonical edits.

Five distinct subsystems: built-in fetch/Undici in Node test child; Node HTTP count server in capture container; synchronous runner/Compose orchestration; Docker container/network lifecycle; Postfix SMTP relay and disk queue. UND_ERR_SOCKET belongs to the first subsystem and does not prove an SMTP defect.

1. Runner creates fresh project, owned temporary directory, certificates, secret projections, capture directory and isolated service compositions. It checks project/image/network collisions.
2. It builds the pinned capture image, copying actual capture.js and installed dependencies. Capture is one Node process hosting SMTP2525 and HTTP8025.
3. HTTP listens on0.0.0.0:8025; host publication is127.0.0.1 at a dynamically allocated port. freePort briefly binds port0 then releases it; no lease covers the allocation-to-Compose interval.
4. Docker capture healthcheck GETs127.0.0.1:8025 every2s, timeout2s,retries15. Compose up --wait --wait-timeout90 establishes service health, not an eternal connection guarantee. SMTP and HTTP listening events are separately traced.
5. All services initialize via canonical adapters and direct Compose. Mail and capture share declared kernel network; DKIM has separate internal mail-control network. The request does not invoke lifecycle.checkNetworks or rollback admission.
6. SMTP case13 submits a local authenticated STARTTLS message, then capturedCount GETs the loopback HTTP endpoint until count>=1. Existing wait helper catches readiness probe errors, bounded80x200ms; P1 does not add or change that existing behavior. Case15's initial GET is direct and fatal on rejection.
7. HTTP receives GET `/`; it performs no authentication or request-body processing. It returns200/application-json with count,tls,authentication_required. It does not submit SMTP.
8. Synchronous handler writeHead/end completes the JSON; count derives from captured .eml files/SMTP onData, not an HTTP payload.
9. Response finish means Node flushed output, not proof of client receipt. Client headers and body completion must be observed separately.
10. capturedCount parses JSON and returns count. No explicit fetch abort or request timeout is supplied. Host Node defaults/built-in fetch policy apply; original effective client timeout map unavailable. Server has no custom HTTP timeouts; observed defaults must be recorded, not assumed from host version for container.
11. Case14 verifies DKIM signature/public material and unchanged key fingerprint across synchronous Compose restart(dkim). Case15 first reads count, stops capture, submits another SMTP message, asserts nonempty queue, force-recreates mail, verifies queue persistence, starts capture, flushes queue and checks increased count/key fingerprint.
12. Runner waits for child exit, snapshots state, validates logs; finally Compose down removes owned containers/networks, removes owned images, uses network-none helper to remove owned fixture files and removes its directory. No test-level cleanup precedes the initial case15 GET.
13. Capture SIGTERM handler closes SMTP first, then HTTP health.close, then process.exit0. A stalled SMTP close could delay HTTP shutdown; historical evidence does not show that occurring.

Original boundary: preparation/health readiness and earlier HTTP request/response success are confirmed; case14 restart and assertions complete. The initial case15 fetch starts and rejects. The first unobserved transition for that request is connection selection/establishment (including possible pooled reuse); no server receipt, handler, response completion or close reason is confirmed for it. SMTP submission and intentional capture shutdown in case15 have not yet executed. Later runner cleanup follows the failure. This rules out the *case15 subsequent* stop/SMTP operations as its initiating cause, but does not identify an independent earlier close.
