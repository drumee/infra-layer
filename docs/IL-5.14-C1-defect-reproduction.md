# IL-5.14-C1 alpha.3 defect reproduction

**Gate B: PASS. This is a controlled metadata reproduction, not real Docker integration.**

Command: `node test/network-attachments/reproduce-alpha3.cjs`, exit 0. It loads the historical source directly with `git show c218811effc83da25cf71a914e27accc96101329:lifecycle/docker.js`, then executes that unchanged source with a controlled child-process adapter. No production code is patched. [Machine result](evidence/IL-5.14-C1/original-reproduction.json), [command/fixture identities](evidence/IL-5.14-C1/execution.json).

The checked-in fixture test/network-attachments/fixture.json models one owned bridge network and two distinct attachment records. One key is a container ID, with Name/EndpointID/MAC/address metadata. The other is the Moby endpoint-map key whose suffix equals its EndpointID; its metadata identifies a sandbox-less endpoint. Provenance is the pinned [Moby producer](https://github.com/moby/moby/blob/9c623849a9e6ce2add344fa1453c454dce75340f/daemon/network.go#L747-L763), which selects the two key categories according to sandbox association. The fixture's meaning is not inferred from the prefix alone.

The historical path is network list → owned network inspect → ordinary container inspect → invalid endpoint-key inspect. The ordinary container returns matching owner/project/service labels. Inspection of the endpoint key throws a simulated Docker status 1 with no-such-object stderr and newline stdout. The original adapter converts it to DOCKER_LIFECYCLE_COMMAND_FAILED, which the reproduction explicitly requires. It also asserts that the final attempted object key equals ep- plus the metadata's EndpointID.

The full resulting command, including the unchanged container JSON template, is archived in the machine result. The expected object type is a container; the actual object is an endpoint-map entry. This deterministically reproduces the type-confusion path. The harness itself exits0 because the expected historical failure is observed; it does not turn a production Docker failure into success.

Historical real evidence remains Debian IL-5.13-H3 run-02:network metadata produced an ep-… key, actual Docker inspect exited1 and the campaign stopped. H3 remains failed; the fixture does not replace its result or prove a correction. No H4 or Debian qualification is executed here. H1_DOCKER_LIFECYCLE_ROOT_CAUSE_UNDETERMINED remains.
