import os,pathlib,stat,tempfile,unittest,json,datetime,subprocess,hashlib
ROOT=pathlib.Path(__file__).parent
REPO=pathlib.Path('/home/somanos/github/infra-layer')
def directory(value, expected_uid=None):
 p=pathlib.Path(value)
 if not p.is_absolute():raise ValueError('ABSOLUTE_DIRECTORY_REQUIRED')
 s=p.lstat()
 if stat.S_ISLNK(s.st_mode) or not stat.S_ISDIR(s.st_mode):raise ValueError('REAL_DIRECTORY_REQUIRED')
 if p.resolve()!=p:raise ValueError('UNSAFE_PATH_RESOLUTION')
 if s.st_uid!=(os.getuid() if expected_uid is None else expected_uid):raise ValueError('DIRECTORY_OWNER_MISMATCH')
 if stat.S_IMODE(s.st_mode)!=0o700:raise ValueError('DIRECTORY_MODE_UNSAFE')
 for parent in p.parents:
  ps=parent.lstat()
  if stat.S_ISLNK(ps.st_mode) or not stat.S_ISDIR(ps.st_mode):raise ValueError('UNSAFE_PARENT_PATH')
  if ps.st_uid not in (0,os.getuid()):raise ValueError('UNSAFE_PARENT_OWNER')
  if ps.st_mode & 0o022 and not (parent==pathlib.Path('/tmp') and ps.st_uid==0 and ps.st_mode & stat.S_ISVTX):raise ValueError('UNSAFE_PARENT_MODE')
 if list(p.iterdir()):raise ValueError('DIAGNOSTIC_OUTPUT_CONFLICT')
 v=os.statvfs(p);free=v.f_bavail*v.f_frsize
 if free<64*1024*1024:raise ValueError('INSUFFICIENT_DIAGNOSTIC_SPACE')
 probe=p/('.preflight-'+os.urandom(8).hex())
 fd=os.open(probe,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 try:os.write(fd,b'exclusive-write-check\n');os.fsync(fd)
 finally:os.close(fd);probe.unlink()
 return {'path':str(p),'uid':s.st_uid,'gid':s.st_gid,'mode':oct(stat.S_IMODE(s.st_mode)),'freeBytes':free,'empty':True,'exclusiveWrite':True,'safeParents':True}
class Checks(unittest.TestCase):
 def setUp(self):self.root=pathlib.Path(tempfile.mkdtemp(prefix='preflight-fixture-',dir=ROOT));self.root.chmod(0o700)
 def tearDown(self):
  for p in self.root.iterdir():
   if p.is_symlink() or p.is_file():p.unlink()
   else:p.rmdir()
  self.root.rmdir()
 def test_c1_missing(self):
  with self.assertRaises(FileNotFoundError):directory(self.root/'absent')
 def test_c2_symlink(self):
  p=self.root/'link';p.symlink_to(self.root,target_is_directory=True)
  with self.assertRaisesRegex(ValueError,'REAL_DIRECTORY_REQUIRED'):directory(p)
 def test_c3_permissions(self):
  p=self.root/'unsafe';p.mkdir(mode=0o755)
  with self.assertRaisesRegex(ValueError,'DIRECTORY_MODE_UNSAFE'):directory(p)
 def test_c4_ownership_policy_simulation(self):
  with self.assertRaisesRegex(ValueError,'DIRECTORY_OWNER_MISMATCH'):directory(self.root,os.getuid()+1)
 def test_c5_conflicting_output(self):
  (self.root/'trace.jsonl').write_text('preserved fixture')
  with self.assertRaisesRegex(ValueError,'DIAGNOSTIC_OUTPUT_CONFLICT'):directory(self.root)
  self.assertEqual((self.root/'trace.jsonl').read_text(),'preserved fixture')
 def test_c6_valid(self):self.assertTrue(directory(self.root)['exclusiveWrite'])
if __name__=='__main__':
 result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Checks))
 if not result.wasSuccessful():raise SystemExit(1)
 print(json.dumps({'preflightCases':6,'passed':6,'dockerCallsDuringNegativeTests':0,'note':'pure directory validation; no acceptance or Docker subprocess in fixture tests; foreign owner modeled by mismatching the required UID'}))
