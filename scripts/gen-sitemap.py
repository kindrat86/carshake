#!/usr/bin/env python3
"""
Generate a complete sitemap.xml by sweeping every real index.html in the deploy root,
respecting .vercelignore + .gitignore exclusions and canonical hreflang.

Rules:
  - One <url> per real page (index.html or .html with a vercel cleanUrl rewrite).
  - Excludes locale dirs (ar,bn,es,fr,hi,id,pt,ru,ur,zh-CN) — those get their own
    hreflang alternates on the canonical (en) pages, added as <xhtml:link>.
  - Excludes everything in .vercelignore (agent files, scripts, reports, .claude).
  - Excludes 0-byte placeholder files.
  - lastmod from git log when available, else file mtime.
"""
import os, re, subprocess, glob
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://carshake.online"

# Excluded top-level entries (from .vercelignore + obvious non-page dirs)
EXCLUDED_DIRS = {
    '.git', '.vercel', '.claude', '.well-known', '.github', 'node_modules',
    'scripts', 'i18n', 'public', 'templates', 'data', 'images', 'api',
    # HTML fragments and iframe/embed artifacts are not standalone search pages.
    'embed', 'widgets',
    # locale translations — handled via hreflang alternates on canonical pages
    'ae','ar','bn','es','fr','hi','id','pt','ru','ur','zh-CN',
    'de','it','ja','ko','fa','pl','tr','vi','th',
}
EXCLUDED_FILES = {
    '404.html',
    'network-widget.html',
    'related-tools.html',
}
EXCLUDED_REL_FILES = {
    'network/widget.html',
}
# Excluded by .vercelignore pattern (repo-root docs/reports)
EXCLUDED_ROOT_DOCS = re.compile(
    r'^(AUDIT_SCORECARD|CLAUDE|HERMES_|OWNER_ACTIONS|REPORT_).*(\.md)$'
)

LOCALES = ['ar','bn','es','fr','hi','id','pt','ru','ur','zh-CN']

def git_lastmod(rel):
    try:
        out = subprocess.run(
            ['git','log','-1','--format=%cI','--', rel],
            cwd=ROOT, capture_output=True, text=True, timeout=5).stdout.strip()
        if out:
            return out[:10]  # YYYY-MM-DD
    except Exception:
        pass
    return None

def file_lastmod(path):
    try:
        return datetime.fromtimestamp(os.path.getmtime(path)).date().isoformat()
    except Exception:
        return None

def get_canonical(html):
    m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    if m:
        return m.group(1)
    return None

def get_robots(html):
    m = re.search(r'<meta name="robots" content="([^"]+)"', html)
    if m:
        return m.group(1)
    return None

def is_excluded_html(rel, fn):
    """Exclude support artifacts that happen to use an .html extension."""
    rel_posix = rel.replace(os.sep, '/')
    return (
        fn in EXCLUDED_FILES
        or rel_posix in EXCLUDED_REL_FILES
        or ('/' not in rel_posix and re.match(r'^google[^/]*\.html$', fn, re.I))
    )

def is_external_canonical(canonical):
    """A sitemap must never emit a canonical URL owned by another host."""
    return bool(canonical and canonical != BASE and not canonical.startswith(BASE + '/'))

def collect_pages():
    """Yield (url_path, abspath, lastmod, canonical, robots, is_noindex)."""
    pages = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS and not d.startswith('.')]
        rel_dir = os.path.relpath(dirpath, ROOT)
        # skip if inside an excluded dir
        if any(part in EXCLUDED_DIRS for part in rel_dir.split(os.sep) if part != '.'):
            continue

        for fn in filenames:
            if not fn.endswith('.html') and fn != 'index.html':
                # include .html files that have a vercel rewrite (we detect via vercel.json)
                continue
            if fn.endswith('.html') and fn != 'index.html':
                continue  # .html files handled separately (cleanUrls rewrite)
            abspath = os.path.join(dirpath, fn)
            rel = os.path.relpath(abspath, ROOT)
            if is_excluded_html(rel, fn):
                continue
            # skip vercelignored root docs
            base = os.path.basename(rel)
            top = rel.split(os.sep)[0]
            if EXCLUDED_ROOT_DOCS.match(base) or EXCLUDED_ROOT_DOCS.match(top):
                continue
            if rel.startswith('aeo/') or rel.startswith('press/') and fn != 'index.html':
                continue
            try:
                if os.path.getsize(abspath) == 0:
                    continue
            except OSError:
                continue
            with open(abspath, encoding='utf-8', errors='ignore') as f:
                html = f.read(4096)
            # url path
            if rel == 'index.html':
                url_path = '/'
            else:
                url_path = '/' + rel.replace(os.sep, '/').replace('/index.html','').replace('index.html','')
                url_path = url_path.rstrip('/') or '/'
            robots = get_robots(html)
            is_noindex = bool(robots and 'noindex' in robots.lower())
            canonical = get_canonical(html)
            if is_external_canonical(canonical):
                continue
            lastmod = git_lastmod(rel) or file_lastmod(abspath)
            pages.append((url_path, abspath, lastmod, canonical, robots, is_noindex))
    return pages

def collect_html_cleanurls():
    """Collect .html files (non-index) that have a vercel rewrite -> clean URL.
    Parse vercel.json rewrites."""
    pages = []
    vj = os.path.join(ROOT, 'vercel.json')
    rewrites = {}
    if os.path.exists(vj):
        import json
        try:
            cfg = json.load(open(vj))
            for r in cfg.get('rewrites', []):
                src = r.get('source','')
                dst = r.get('destination','')
                if src and dst.endswith('.html'):
                    rewrites[dst.lstrip('/')] = src
        except Exception:
            pass
    # also cleanUrls: true means every x.html -> /x
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS and not d.startswith('.')]
        for fn in filenames:
            if fn == 'index.html' or not fn.endswith('.html'): continue
            abspath = os.path.join(dirpath, fn)
            rel = os.path.relpath(abspath, ROOT)
            if is_excluded_html(rel, fn):
                continue
            top = rel.split(os.sep)[0]
            if EXCLUDED_ROOT_DOCS.match(top) or top in EXCLUDED_DIRS:
                continue
            if os.path.getsize(abspath) == 0: continue
            # cleanUrl path
            if dirpath == ROOT:
                url_path = '/' + fn[:-5]
            else:
                rel_dir = os.path.relpath(dirpath, ROOT).replace(os.sep,'/')
                url_path = '/' + rel_dir + '/' + fn[:-5]
            # if vercel has an explicit rewrite mapping, prefer that source
            mapped = rewrites.get(rel.replace(os.sep,'/'))
            if mapped:
                url_path = mapped
            with open(abspath, encoding='utf-8', errors='ignore') as f:
                html = f.read(4096)
            canonical = get_canonical(html)
            if is_external_canonical(canonical):
                continue
            robots = get_robots(html)
            is_noindex = bool(robots and 'noindex' in robots.lower())
            lastmod = git_lastmod(rel) or file_lastmod(abspath)
            pages.append((url_path, abspath, lastmod, canonical, robots, is_noindex))
    return pages

def main():
    pages = collect_pages() + collect_html_cleanurls()
    # dedupe by url_path, prefer non-noindex
    seen = {}
    for p in pages:
        up = p[0]
        if up not in seen or (seen[up][5] and not p[5]):
            seen[up] = p
    pages = sorted(seen.values(), key=lambda p: p[0])

    raw_indexable = [p for p in pages if not p[5]]
    noindex_count = len(pages) - len(raw_indexable)

    # Dedupe by the final canonical URL, not by source file path. Legacy aliases
    # can have different files and url_paths while pointing at one canonical.
    by_loc = {}
    for p in raw_indexable:
        url_path, _, _, canonical, _, _ = p
        self_url = BASE + (url_path if url_path != '/' else '/')
        loc = canonical or self_url
        # Canonical URLs in some prerendered pages carry a trailing slash, which
        # 308-redirects. Emit the redirect-free form (keep the root slash).
        if loc != BASE + '/' and loc.endswith('/'):
            loc = loc.rstrip('/')
        self_url_normalized = self_url if self_url == BASE + '/' else self_url.rstrip('/')
        is_self_canonical = loc == self_url_normalized
        if loc not in by_loc or (is_self_canonical and not by_loc[loc][1]):
            by_loc[loc] = (p, is_self_canonical)
    indexable = sorted(((loc, item[0]) for loc, item in by_loc.items()), key=lambda x: x[0])

    out = ['<?xml version="1.0" encoding="UTF-8"?>']
    out.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
               'xmlns:xhtml="http://www.w3.org/1999/xhtml">')
    for loc, page in indexable:
        url_path, abspath, lastmod, canonical, robots, is_noindex = page
        out.append('  <url>')
        out.append(f'    <loc>{loc}</loc>')
        if lastmod:
            out.append(f'    <lastmod>{lastmod}</lastmod>')
        # hreflang alternates for locale translations (if they exist on disk)
        for loc_code in LOCALES:
            alt_path = os.path.join(ROOT, loc_code, url_path.lstrip('/'), 'index.html')
            if os.path.exists(alt_path):
                href = f"{BASE}/{loc_code}{url_path}"
                out.append(f'    <xhtml:link rel="alternate" hreflang="{loc_code}" href="{href}"/>')
        out.append('  </url>')
    out.append('</urlset>')

    target = os.path.join(ROOT, 'sitemap.xml')
    with open(target, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')
    print(f"Wrote {target}: {len(indexable)} indexable URLs ({noindex_count} noindex excluded)")

if __name__ == '__main__':
    main()
