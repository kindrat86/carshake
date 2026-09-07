#!/usr/bin/env python3
"""Align local HTML canonical/og:url tags with Vercel trailingSlash:false.
Run after any generator and before the exact-canonical release gate.
"""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://carshake.online'
SKIP = {'.git', '.vercel', '.claude', 'node_modules', 'scripts'}
def normalize(source):
    def tag(match):
        value = match.group(0)
        if not (re.search(r'\brel=[\"\']canonical[\"\']', value, re.I) or re.search(r'\bproperty=[\"\']og:url[\"\']', value, re.I)):
            return value
        return re.sub(r'(\b(?:href|content)=[\"\'])(https://carshake\.online/[^\"\']*)([\"\'])', lambda m: m[1] + (m[2].rstrip('/') if m[2] != BASE + '/' else m[2]) + m[3], value)
    return re.sub(r'<(?:link|meta)\b[^>]*>', tag, source, flags=re.I)
def main():
    changed=[]
    for file in ROOT.rglob('*.html'):
        if any(part in SKIP for part in file.relative_to(ROOT).parts):continue
        old=file.read_text(encoding='utf8');new=normalize(old)
        if new!=old:file.write_text(new,encoding='utf8');changed.append(str(file.relative_to(ROOT)))
    print(f'Canonical normalization: {len(changed)} HTML files updated')
if __name__=='__main__':main()
