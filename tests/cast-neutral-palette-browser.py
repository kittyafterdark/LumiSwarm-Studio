"""Legacy test entrypoint. The v1.0.46 Material Edition supersedes the v1.0.45
neutral-surface assumption; twelve unique surfaces now intentionally react to
the authored speaker color. Keep this path for existing local test commands.
"""
from pathlib import Path
from runpy import run_path
run_path(str(Path(__file__).with_name('cast-material-edition-browser.py')),run_name='__main__')
