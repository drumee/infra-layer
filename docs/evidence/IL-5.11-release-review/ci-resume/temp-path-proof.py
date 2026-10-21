"""Bounded reproduction of evidence-writer path handling; owned temporary files only."""
from pathlib import Path
import tempfile,json,datetime
result={'recorded_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Only this process-owned TemporaryDirectory; no repository, system file, existing qualification path or service touched','distributed_package_changed':False}
with tempfile.TemporaryDirectory(prefix='il511-evidence-path-proof-') as selected:
 base=Path(selected);out=base/'outputs';out.mkdir();victim=base/'owned-sentinel';victim.write_text('KEEP');(out/'unit.txt').symlink_to(victim)
 # Same operation as D2 qualify.py:9 and campaign.py:19.
 log=out/'unit.txt'
 with log.open('w') as stream:stream.write('replacement log')
 result['preplanted_log_symlink_followed']=victim.read_text()=='replacement log'
 outside=base/'outside-output';outside.mkdir();claimed=base/'claimed-output';claimed.symlink_to(outside,target_is_directory=True)
 # Same mkdir(exist_ok=True) / write_text pattern as campaign.py.
 claimed.mkdir(exist_ok=True);(claimed/'campaign-summary.json').write_text('{}')
 result['preplanted_output_directory_symlink_followed']=(outside/'campaign-summary.json').is_file()
 result['all_effects_confined_to_owned_fixture']=True
assert result['preplanted_log_symlink_followed'] and result['preplanted_output_directory_symlink_followed']
result['cleanup']='TemporaryDirectory removed all owned fixtures'
print(json.dumps(result,indent=2))
