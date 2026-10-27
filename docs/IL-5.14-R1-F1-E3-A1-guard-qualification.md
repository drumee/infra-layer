# Guard qualification

First focused execution `node --test test/unit/harness-preservation.test.js`:22 PASS,0 FAIL,0 skipped,exit0. It includes all20 required A1 cases plus spawn/operator and pinned-source/bounded-output controls. Negative cases assert exact guard codes; parser exceptions do not satisfy them. In-memory source mutations are parsed only, never executed or written over the canonical harness.

The prior blocking test alone passes, followed by the complete qualification-diagnostic file, both exit0. The real canonical harness is read from disk and checked against the pinned historical Git source, not replaced with a passing fixture. The guard builds its expected sequence from two explicit literal transformations over verified historical source, not a current-source baseline. Exact protected sequence comparison includes nested calls, context, counts and order. Final mode requires the one replacement and the one approved addition subtree, each once.

Comparison modes are explicit: historical (no authorization applied), additions (only approved detachment subtree), candidate (both the one replacement and approved addition). The approved replacement is one AST subtree even though the extractor emits two nested protected calls. Code diagnostics remain bounded category/index; no raw Docker source payload is printed by guard errors. No dynamic JavaScript evaluation or general execution boundary is introduced. No guard mode is chosen from CLI/untrusted input in canonical tests.

Source before commit was9cead06 plus only the identified guard/helper/tests and reports. The following focused commit preserves those tested bytes; full qualification follows that exact commit. Historical F1/E1/E2/E3 failure records remain untouched.
