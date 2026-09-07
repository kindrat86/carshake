#!/usr/bin/env python3
"""Check links as public URLs, not filesystem directories or rewrite patterns."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit,unquote
import re,json,sys
ROOT=Path(__file__).resolve().parents[1]
BASE='https://carshake.online'
class HTML(HTMLParser):
    def __init__(self):super().__init__();self.links=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='a' and attrs.get('href'):self.links.append(attrs['href'])
CFG=json.loads((ROOT/'vercel.json').read_text())
def route(rule,path):
    source=rule['source']
    if '(' in source or '*' in source:return None
    names=re.findall(r':([A-Za-z]+)',source)
    pattern=re.sub(r':[A-Za-z]+',r'([^/]+)',source)
    match=re.fullmatch(pattern,path)
    if not match:return None
    target=rule['destination']
    for name,value in zip(names,match.groups()):target=target.replace(':'+name,value)
    return target

def resolve(path,seen=None):
    seen=set() if seen is None else set(seen)
    path=unquote(path)
    if path in seen:return None
    seen.add(path)
    if path.startswith('/api/'):return 'api'
    path=path.rstrip('/') or '/'
    for rule in CFG.get('redirects',[]):
        target=route(rule,path)
        if target:
            if target.startswith(('http:','https:')):return 'external'
            return resolve(target,seen)
    rel=path.lstrip('/')
    # Vercel filesystem routes win before parameterized fallback rewrites.
    choices=[ROOT/'index.html'] if not rel else [ROOT/(rel+'.html'),ROOT/rel/'index.html',ROOT/rel]
    file=next((p for p in choices if p.is_file() and p.stat().st_size),None)
    if file:return file
    for rule in CFG.get('rewrites',[]):
        target=route(rule,path)
        if target:
            if target.startswith('/api/'):return 'api'
            file=ROOT/target.lstrip('/')
            return file if file.is_file() and file.stat().st_size else None
    return None
def check():
    urls=re.findall(r'<loc>([^<]+)</loc>',(ROOT/'sitemap.xml').read_text())
    bad={};redirect_links={}
    for url in urls:
        file=resolve(urlsplit(url).path)
        if not isinstance(file,Path):bad.setdefault(url,[]).append('sitemap');continue
        page=HTML();page.feed(file.read_text())
        for href in page.links:
            link=urlsplit(urljoin(url,href))
            if link.netloc!='carshake.online' or link.scheme not in ['http','https']:continue
            if not resolve(link.path):bad.setdefault(link.path,[]).append(url)
    return bad
if __name__=='__main__':
    bad=check();print(json.dumps({'broken_targets':len(bad),'examples':{u:v[:2] for u,v in bad.items()}},indent=2));sys.exit(bool(bad))
