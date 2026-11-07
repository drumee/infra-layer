"""P2-F1 local command ledger. No shell, retries, or protected configuration writes."""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from command_ledger import record_command

root = pathlib.Path(__file__).resolve().parents[3]
evidence = root / "docs/evidence/IL-5.14-R1-F1-E3-A4-P2-F1"
diagnostic_directories = [pathlib.Path(__file__).parent.parent / d for d in ["observer-shutdown", "services-capture", "postfix-http"]]
sys.exit(record_command(root, evidence, diagnostic_directories, sys.argv[1:]))
