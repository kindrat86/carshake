#!/usr/bin/env python3
"""
Idempotent SEO enrichment for the CarShake static site.

What it does (all safe to re-run):
  1. Injects a BreadcrumbList JSON-LD block into every template page that lacks one.
  2. Converts the misleading LocalBusiness block on /city/* pages to Service + areaServed
     (a remote SaaS cannot truthfully claim a local NAP, which LocalBusiness implies).
  3. Replaces the artificial cross-product sameAs[] inside every Organization @graph with
     a single honest same-entity identity (the project's own repo).

Idempotency: each block carries a marker comment; re-runs skip already-enriched pages.
Validation: every modified file is parsed back to confirm all JSON-LD blocks are valid.
"""
import json, re, sys, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://carshake.online"
MARKER = "seo-enrich-breadcrumbs-v1"
SVC_MARKER = "seo-enrich-service-v1"
SAMEAS_MARKER = "seo-enrich-sameas-v1"

HONEST_SAMEAS = ["https://github.com/kindrat86/carshake"]

LD_RE = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)

def slug_from_path(p):
    return os.path.relpath(p, ROOT).split(os.sep)

def classify(parts):
    if len(parts) >= 3 and parts[-1] == 'index.html':
        return parts[0], parts[1]
    return None, None

def breadcrumb_trail(template, slug, html):
    current = None
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.S)
    if h1:
        current = re.sub(r'<[^>]+>', '', h1.group(1)).strip()
        current = re.sub(r'\s*[—–-]\s*CarShake.*$', '', current).strip()
    hubs = {
        'city': ("City Guides", "/city"),
        'state': ("State Guides", "/state"),
        'protect': ("Use Cases", "/protect"),
        'vehicle': ("Vehicle Guides", "/vehicle"),
        'scenario': ("Scenarios", "/scenario"),
        'best': ("Comparisons", "/best"),
        'blog': ("Blog", "/blog"),
    }
    if template in hubs:
        return ([("Home", "/"), hubs[template]], current or slug.replace('-', ' ').title())
    return ([("Home", "/")], current or slug)

def make_breadcrumb_jsonld(trail, current):
    items = []
    for i, (name, url) in enumerate(trail, 1):
        items.append({"@type": "ListItem", "position": i, "name": name, "item": BASE + url})
    items.append({"@type": "ListItem", "position": len(trail) + 1, "name": current})
    obj = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}
    return '<!-- ' + MARKER + ' -->\n<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + '</script>'

def make_service_jsonld(slug, name, desc):
    obj = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Valet Damage Protection in " + name,
        "serviceType": "Vehicle Condition Documentation & Valet Damage Protection",
        "provider": {"@type": "Organization", "name": "CarShake", "url": BASE},
        "areaServed": {"@type": "City", "name": name},
        "url": BASE + "/city/" + slug,
        "description": desc,
    }
    return '<!-- ' + SVC_MARKER + ' -->\n<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + '</script>'

def validate_all_jsonld(html, path):
    for i, b in enumerate(LD_RE.findall(html)):
        try:
            json.loads(b)
        except Exception as e:
            raise ValueError(f"{path}: JSON-LD block {i} invalid after edit: {e}")

def fix_sameas_in_graph(html, path):
    blocks = LD_RE.findall(html)
    if not blocks:
        return html, False
    new_html = html
    for b in blocks:
        if SAMEAS_MARKER in b or '"Organization"' not in b:
            continue
        try:
            d = json.loads(b)
        except Exception:
            continue
        target = d.get('@graph', None)
        modified = False
        if isinstance(target, list):
            for node in target:
                if isinstance(node, dict) and node.get('@type') == 'Organization' and 'sameAs' in node:
                    if node['sameAs'] != HONEST_SAMEAS:
                        node['sameAs'] = HONEST_SAMEAS
                        modified = True
        elif isinstance(d, dict) and d.get('@type') == 'Organization' and 'sameAs' in d:
            if d['sameAs'] != HONEST_SAMEAS:
                d['sameAs'] = HONEST_SAMEAS
                modified = True
        if modified:
            new_block = '<!-- ' + SAMEAS_MARKER + ' -->\n<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False) + '</script>'
            new_html = new_html.replace('<script type="application/ld+json">' + b + '</script>', new_block, 1)
            return new_html, True
    return new_html, False

def remove_localbusiness(html, path):
    pattern = re.compile(
        r'<script type="application/ld\+json">\s*\{\s*"@context":\s*"https://schema\.org",\s*'
        r'"@type":\s*"LocalBusiness".*?\}\s*</script>\s*', re.S)
    m = pattern.search(html)
    if m:
        return html.replace(m.group(0), '', 1), True
    return html, False

def process(path):
    template, slug = classify(slug_from_path(path))
    if template is None:
        return False
    with open(path, encoding='utf-8') as f:
        html = f.read()
    if not html.strip():
        return False
    original = html
    actions = []

    if '"BreadcrumbList"' not in html:
        trail, current = breadcrumb_trail(template, slug, html)
        bl = make_breadcrumb_jsonld(trail, current)
        if '</head>' in html:
            html = html.replace('</head>', bl + '\n</head>', 1)
            actions.append('breadcrumb')

    if template == 'city':
        city_name = re.sub(r'-', ' ', slug).title()
        m_desc = re.search(r'<meta name="description" content="([^"]+)"', html)
        desc = m_desc.group(1) if m_desc else ""
        if SVC_MARKER not in html and '"LocalBusiness"' in html:
            html, did = remove_localbusiness(html, path)
            if did:
                svc = make_service_jsonld(slug, city_name, desc)
                html = html.replace('</head>', svc + '\n</head>', 1)
                actions.append('localbusiness->service')

    html, did = fix_sameas_in_graph(html, path)
    if did:
        actions.append('sameAs')

    if html == original:
        return False

    validate_all_jsonld(html, path)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    return actions

def main():
    patterns = ['city/*/index.html', 'state/*/index.html', 'protect/*/index.html',
                'vehicle/*/index.html', 'scenario/*/index.html', 'best/*/index.html',
                'blog/*/index.html']
    files = sorted(set(f for pat in patterns for f in glob.glob(os.path.join(ROOT, pat))))
    stats = {'breadcrumb': 0, 'localbusiness->service': 0, 'sameAs': 0, 'unchanged': 0, 'errors': 0}
    for p in files:
        try:
            acts = process(p)
            if not acts:
                stats['unchanged'] += 1
            else:
                for a in acts:
                    stats[a] = stats.get(a, 0) + 1
        except Exception as e:
            stats['errors'] += 1
            print(f"ERROR {p}: {e}", file=sys.stderr)
    print(json.dumps(stats, indent=2))
    print(f"Processed {len(files)} template pages")

if __name__ == '__main__':
    main()
