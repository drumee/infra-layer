"""Delete only unique synthetic runs in the real HOME/artifacts root; never alter HOME."""
import contextlib,datetime as dt,fcntl,hashlib,importlib.util,json,os,pathlib,subprocess,tempfile,unittest,uuid
from unittest.mock import patch
source=pathlib.Path(__file__).resolve().parents[2]/'tooling/artifacts.py'
spec=importlib.util.spec_from_file_location('artifact_store',source);a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
class Retention(unittest.TestCase):
 def setUp(self):
  self.project='infra-layer';self.lot='ARTIFACTS-SYNTHETIC';self.ident='test-'+uuid.uuid4().hex
  self.path=a.initialize(self.project,self.lot,self.ident,1)
 def edit(self,**values):
  with a.root_store() as (root,_),a.run_directory(root,self.project,self.lot,self.ident) as (fd,_):
   m=a.read_at(fd,a.MANIFEST);m.update(values);a.atomic_at(fd,a.MANIFEST,m)
 def expired(self,**values):
  old=(a.now()-dt.timedelta(days=5)).isoformat();self.edit(state='completed',created_at=old,completed_at=old,pinned=False,qualification_required=False,backup_required=False,**values)
 def rows(self,apply=False):return a.cleanup(apply,self.project,self.lot,self.ident)
 def tearDown(self):
  # Test-created sentinels only; failed/unsafe runs are retained for manual inspection.
  if self.path.exists():
   try:self.expired();self.rows(True)
   except (ValueError,OSError):pass
 def test_preview_and_explicit_delete_journal(self):
  file=self.path/'payload';file.write_bytes(b'x'*65536);file.chmod(0o600);self.expired()
  row=self.rows()[0];self.assertTrue(row['eligible']);self.assertEqual(row['action'],'preserved');self.assertGreater(row['size_bytes'],65536);self.assertTrue(file.exists());self.assertIn('retention exceeded',row['reason'])
  result=self.rows(True)[0];self.assertEqual(result['action'],'deleted');self.assertFalse(self.path.exists());self.assertGreater(result['released']['allocated_bytes'],0)
  journal=pathlib.Path.home()/'artifacts/.cleanup-events.jsonl';events=[json.loads(x) for x in journal.read_text().splitlines()];self.assertTrue(any(x.get('path')==str(self.path) and x.get('action')=='deleted' for x in events))
 def test_active_resumable_pin_and_required_evidence_preserved(self):
  self.assertFalse(self.rows(True)[0]['eligible'])
  self.edit(state='resumable');self.assertFalse(self.rows(True)[0]['eligible'])
  for flag in ['pinned','qualification_required','backup_required']:
   self.expired();self.edit(**{flag:True});self.assertFalse(self.rows(True)[0]['eligible']);self.assertTrue(self.path.exists())
 def test_retention_default_project_lot_and_run_override(self):
  self.expired();self.edit(retention_days=10);self.assertFalse(self.rows()[0]['eligible'])
  m={'project':'example','lot':'LOT','retention_days':None};p={'default_days':90,'projects':{'example':{'days':30,'lots':{'LOT':7}}}}
  self.assertEqual(a.retention(m,p),7);m['retention_days']=2;self.assertEqual(a.retention(m,p),2)
 def test_invalid_missing_and_duplicate_manifest_preserved(self):
  file=self.path/a.MANIFEST;original=file.read_bytes()
  for data in [b'{}',b'[]',b'{"pinned":true,"pinned":false}',b'{invalid']:
   file.write_bytes(data);self.assertFalse(self.rows(True)[0]['eligible']);self.assertTrue(self.path.exists())
  file.unlink();self.assertFalse(self.rows(True)[0]['eligible']);file.write_bytes(original);file.chmod(0o600)
 def test_symlink_and_hardlink_never_followed(self):
  # The hardlink witness must share the run filesystem (/tmp can be tmpfs).
  with tempfile.TemporaryDirectory(dir=self.path) as tmp:
   sentinel=pathlib.Path(tmp)/'sentinel';sentinel.write_text('preserve');sentinel.chmod(0o600)
   link=self.path/'external';link.symlink_to(sentinel);self.expired();self.assertFalse(self.rows(True)[0]['eligible']);self.assertEqual(sentinel.read_text(),'preserve');link.unlink()
   os.link(sentinel,link);self.assertFalse(self.rows(True)[0]['eligible']);self.assertEqual(sentinel.read_text(),'preserve');link.unlink()
 def test_mount_id_check_rejects_same_device_bind_mount(self):
  child=self.path/'mounted';child.mkdir(mode=0o700);self.expired();real=a.mount_id
  def mount(fd):
   return real(fd)+1 if pathlib.Path('/proc/self/fd',str(fd)).resolve()==child else real(fd)
  with patch.object(a,'mount_id',side_effect=mount):self.assertFalse(self.rows(True)[0]['eligible'])
  self.assertTrue(child.exists());child.rmdir()
 def test_revalidate_eligibility_before_delete(self):
  self.expired();real=a.eligibility;calls=[]
  def changed(m,p):
   calls.append(1)
   return real(m,p) if len(calls)==1 else (False,'pinned during preview')
  with patch.object(a,'eligibility',side_effect=changed):self.assertFalse(self.rows(True)[0]['eligible'])
  self.assertTrue(self.path.exists())
 def test_live_lease_overrides_completed_manifest(self):
  self.expired()
  with a.root_store() as (root,_),a.run_directory(root,self.project,self.lot,self.ident) as (fd,_),a.lease(fd):
   self.assertFalse(self.rows(True)[0]['eligible']);self.assertTrue(self.path.exists())
 def test_partial_cleanup_becomes_resumable(self):
  self.expired()
  with patch.object(a,'remove_contents',side_effect=OSError('synthetic interruption')):self.rows(True)
  self.assertEqual(json.loads((self.path/a.MANIFEST).read_text())['state'],'resumable')
 def test_checksum_change_is_detected(self):
  file=self.path/'proof';file.write_bytes(b'before');file.chmod(0o600)
  with a.root_store() as (root,_),a.run_directory(root,self.project,self.lot,self.ident) as (fd,_):
   m=a.read_at(fd,a.MANIFEST);a.checkpoint(fd,m,{'next':'native replay'});self.assertEqual(a.verify_run(fd,m)['files'],1);file.write_bytes(b'after')
   with self.assertRaisesRegex(ValueError,'EVIDENCE_CHANGED'):a.verify_run(fd,m)
 def test_invalid_identifiers_and_retention(self):
  for name in ['..','/tmp/escape','a/b','a\\b','-option','']:
   with self.assertRaises(ValueError):a.canonical(name,'lot','run')
  for value in [0,-1,True,1.5,36501]:
   with self.assertRaises(ValueError):a.days(value)
 def test_exec_journals_failure_and_keeps_run_resumable(self):
  result=subprocess.run(['python3',str(source),'exec',self.project,self.lot,self.ident,'--','python3','-c','raise SystemExit(7)'],capture_output=True)
  self.assertEqual(result.returncode,7);m=json.loads((self.path/a.MANIFEST).read_text());self.assertEqual(m['state'],'resumable');self.assertEqual(m['last_exit'],7)
 def test_reboot_rechecks_digest_and_blocks_new_work_until_boot_changes(self):
  from types import SimpleNamespace
  self.edit(state='resumable',resume={'phase':'a','reboot_required':True})
  m=json.loads((self.path/a.MANIFEST).read_text())
  args=SimpleNamespace(project=self.project,lot=self.lot,execution=self.ident,checksums_sha256='0'*64,host_receipt_sha256='a'*64)
  real=a.root_store
  @contextlib.contextmanager
  def local(*unused,**kwargs):
   with real(persistent=False) as value:yield value
  with patch.object(a,'root_store',local),patch.object(a.socket,'gethostname',return_value='mail02-qualification'),patch.object(a.subprocess,'run') as reboot:
   with self.assertRaisesRegex(ValueError,'EVIDENCE_CHANGED'):a.request_reboot(args)
   reboot.assert_not_called();args.checksums_sha256=m['checksums_sha256'];a.request_reboot(args)
   reboot.assert_called_once();self.assertTrue(json.loads((self.path/a.MANIFEST).read_text())['resume']['reboot_pending'])
   command=SimpleNamespace(project=self.project,lot=self.lot,execution=self.ident,argv=['python3','-c','pass'],resume=None)
   with self.assertRaisesRegex(ValueError,'REBOOT_PENDING'):a.execute(command)
 def test_ephemeral_filesystem_is_rejected(self):
  mount={'filesystems':[{'target':'/','fstype':'tmpfs','source':'tmpfs','options':'rw','uuid':None}]}
  with patch.object(a.subprocess,'check_output',return_value=json.dumps(mount)):
   with self.assertRaisesRegex(ValueError,'NOT_PERSISTENT'): 
    with a.root_store(persistent=True):pass
 def test_host_reboot_refuses_unstaged_or_legacy_storage(self):
  from types import SimpleNamespace
  import sys
  sys.path.insert(0,str(source.parent));import importlib
  vm=importlib.import_module('qualification-vm')
  args=SimpleNamespace(project=self.project,lot=self.lot,execution=self.ident)
  info={'Mounts':[{'Destination':'/vm','Source':'/tmp/legacy-vm'}]}
  for resume,reason in [({},'NOT_STAGED'),({'reboot_required':True},'COLD_ADOPTION')]:
   with patch.object(vm,'synchronize',return_value=(self.path,{'guest_resume':resume})),patch.object(vm,'observe',return_value=(info,{})),patch.object(vm.subprocess,'run') as command:
    with self.assertRaisesRegex(ValueError,reason):vm.reboot(args)
    command.assert_not_called()
 def test_host_gate_refuses_wrong_execution_host(self):
  import sys,importlib
  sys.path.insert(0,str(source.parent));vm=importlib.import_module('qualification-vm')
  with patch.object(vm.socket,'gethostname',return_value='workstation'),patch.object(vm.subprocess,'check_output') as command:
   with self.assertRaisesRegex(ValueError,'MUST_BE_TESTBOX'):vm.observe(None)
   command.assert_not_called()
if __name__=='__main__':unittest.main()
