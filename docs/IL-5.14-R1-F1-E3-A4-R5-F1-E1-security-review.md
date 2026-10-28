# Focused security review

Gate I PASS, disposition SECURITY_BOUNDARY_VERIFIED for the local E1 recovery boundary. Source72f4c67, focused55,unit354,contracts24 and actual R5/38 assertions support this scope; original final-PR R1 closure and Postfix remain separate.

| Question | Verified disposition |
|---|---|
| Unauthorized caller learns target identity/state? | Public rollback rejects before readActive; corrupt-state/identity negative controls produce only authorization code and zero observed calls. |
| Unauthorized caller reaches recreation? | No, caller and journal scope precede candidate/resource processing. |
| recover:true alone enables admission? | No, private operation marker only rollback; normal recover path remains strict. |
| Mismatched identity or forged label passes? | No, verified candidate/root/image/revision/service/name/ID/role/configuration and mounts; labels alone insufficient. |
| Wrong-service/foreign resource modified? | Refused; real negative fixtures verified unmodified until mission-owned cleanup. |
| Unexpected network ignored? | Full service-specific configured set and verified IDs remain mandatory before empty-endpoint allowance. |
| Incomplete endpoint accepted generally? | Only scoped failed-service/failed-revision resource at authoritative Running/Restarting observation; no operational ready claim. Other invalid services remain strict. |
| Docker failure becomes success? | Actual adapter inspection failure test and injected recreation failure remain fatal. |
| Final validation skipped or failed recreation reported ready? | Strict final network plus health/protocol and explicit final ready requirement; actual final detachment fails. |
| Arbitrary exception relabeled as identity? | No catch/relabel. Identity has its original explicit checks; trusted scope remains first. |
| Identity before caller authorization? | No, caller check precedes public active-state read and helper identity access. |
| Other recovery workflows inherit permission? | No, backup resume/restore/transition paths still use normal activation without private marker. |

No dynamic evaluation, generic bypass option, scanner change, new historical replacement or network-validation modification. The E1 diff is narrow; inherited A4/R5-F1 recovery design is exercised within its local scope. Owner/host Docker control and lifecycle filesystem trust assumptions are unchanged; no claim of eliminating every possible external root/daemon race.
