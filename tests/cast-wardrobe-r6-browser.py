"""Compatibility entrypoint for the old R6 browser workflow.

R6's light-DOM VN Hero selector became obsolete after Cast Islands v2 and
Material Edition's full VN anatomy replacement. This entrypoint preserves the
behavioural checks through their current, separately maintained regressions.
"""
from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parent
for test in ('cast-island-api-browser.py','cast-material-edition-browser.py'):
 print('Running current browser regression:',test,flush=True)
 subprocess.run([sys.executable,str(root/test)],check=True)
