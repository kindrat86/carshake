#!/usr/bin/env python3
"""Exercise the real research generator in isolation, never overwrite release pages."""
from pathlib import Path
import shutil,subprocess,tempfile,sys
R=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='carshake-generator-') as tmp:
 root=Path(tmp);target=root/'research/valet-damage-hotspots-2026';target.mkdir(parents=True)
 shutil.copyfile(R/'research/valet-damage-hotspots-2026/data.csv',target/'data.csv')
 subprocess.run(['node',str(R/'scripts/gen-damage-index.mjs')],cwd=root,check=True,capture_output=True)
 failures=[]
 for p in root.rglob('*.html'):
  text=p.read_text()
  for bad in ['https://carshake.online/researchvalet-', 'valet-damage-indexaustin', 'valet-damage-indexmiami','valet-damage-indexchicago',"valet-damage-index'+r.slug"]:
   if bad in text:failures.append(f'{p.relative_to(root)}: malformed URL {bad}')
 if failures:
  print('\n'.join(failures));sys.exit(1)
 print('PASS: research generator creates no malformed dataset, city or widget URLs')
