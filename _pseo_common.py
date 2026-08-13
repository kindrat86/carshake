#!/usr/bin/env python3
"""Shared helpers for CarShake pSEO generators.

Single source of truth for:
  - BASE URL and date constants
  - the article() helper (a/an based on vowel sound)
  - the inline CSS used by the standalone pSEO template
  - the marker-delimited sitemap-block updater

Keeps _gen_city_venue.py and _gen_state_venue.py consistent so a CSS or
schema tweak lands in both corpora at once.
"""
import json
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BASE = "https://carshake.online"
MODIFIED = date.today().isoformat()


def article(noun):
    """'an' if noun begins with a vowel sound, else 'a'.

    Every vowel-initial noun in this corpus (Atlanta, Austin, Orlando,
    Indianapolis, 'event venue', Idaho, Iowa, Ohio, Oklahoma, Oregon,
    Utah) takes a true vowel sound, so the simple rule is safe. Add an
    explicit exception here if a u-/h-/y- noun is ever introduced."""
    return "an" if noun.lstrip().lower()[:1] in "aeiou" else "a"


# Inline CSS — identical to the original /industries/rideshare/ template.
CSS = """
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.65;color:#0a0a0a;max-width:760px;margin:0 auto;padding:2rem 1.25rem}
h1{font-size:2.1rem;line-height:1.2;margin:.3em 0}
h2{font-size:1.45rem;margin-top:2rem;border-bottom:2px solid #e5e7eb;padding-bottom:.3rem}
h3{font-size:1.15rem;margin-top:1.5rem}
a{color:#0066cc;text-decoration:none}a:hover{text-decoration:underline}
.lede{font-size:1.1rem;color:#374151;margin-bottom:1.5rem}
table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.95rem}
th,td{border:1px solid #e5e7eb;padding:.6rem .75rem;text-align:left}
th{background:#f9fafb;font-weight:600}
.callout{background:#f0f7ff;border-left:4px solid #0066cc;padding:1rem 1.25rem;margin:1.5rem 0;border-radius:0 .375rem .375rem}
.callout.warn{background:#fef3c7;border-left-color:#d97706}
.callout.good{background:#ecfdf5;border-left-color:#059669}
.verdict{background:#0a0a0a;color:#fff;padding:1.25rem 1.5rem;border-radius:.5rem;margin:1.5rem 0}
.verdict h3{margin-top:0;color:#fff}
.cta{background:#0066cc;color:#fff;padding:1rem 1.5rem;border-radius:.5rem;text-align:center;margin:2rem 0}
.cta a{color:#fff;font-weight:600;font-size:1.1rem}
.related-links{background:#f9fafb;padding:1rem 1.25rem;border-radius:.5rem;margin-top:2.5rem}
.related-links ul{list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:.4rem 1rem}
footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid #e5e7eb;color:#6b7280;font-size:.9rem}
ul.check{list-style:none;padding-left:0}ul.check li::before{content:"\\2713  ";color:#059669;font-weight:700}
ul.cross{list-style:none;padding-left:0}ul.cross li::before{content:"\\2717  ";color:#dc2626;font-weight:700}
nav.breadcrumb{font-size:.9rem;color:#6b7280;margin-bottom:1rem}
nav.breadcrumb a{color:#0066cc}
"""


def org_schema():
    """The Organization disambiguation block used on every pSEO page."""
    return json.dumps({
        "@context": "https://schema.org", "@type": "Organization",
        "name": "CarShake", "url": BASE,
        "description": ("CarShake is a free valet-damage-proof and vehicle-handover "
                        "app that scans and time-stamps a car's condition before and "
                        "after handover, giving drivers, valet operators, and rental "
                        "fleets timestamped, GPS-verified proof to defeat false damage "
                        "claims."),
        "disambiguatingDescription": ("CarShake is a consumer-and-operator "
                                      "valet-damage-proof handover app (scan-before / "
                                      "scan-after + QR receipt) \u2014 not a B2B insurance "
                                      "damage-detection API."),
    })


def head_block(title, desc, url, schema_jsons):
    """Standard <head> for a pSEO page. schema_jsons = list of JSON strings."""
    schemas = "\n".join(
        f'<script type="application/ld+json">{s}</script>' for s in schema_jsons
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="author" content="CarShake">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="{url}">
<link rel="alternate" hreflang="en-US" href="{url}">
<link rel="alternate" hreflang="x-default" href="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="article">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{BASE}/og.png">
<meta name="robots" content="index, follow, max-image-preview:large">
{schemas}
<style>{CSS}</style>
</head>
<body>
"""


def sync_sitemap():
    """Regenerate the unified sitemap.xml via scripts/gen-sitemap.py.

    gen-sitemap.py is the single sitemap writer — it sweeps every index.html on
    disk (which already includes all generator output), so a generator never
    edits the sitemap itself. It just re-runs the full sweep after writing pages.
    """
    script = ROOT / "scripts" / "gen-sitemap.py"
    result = subprocess.run(
        [sys.executable, str(script)], cwd=str(ROOT),
        capture_output=True, text=True,
    )
    lines = (result.stdout or "").strip().splitlines()
    summary = lines[-1] if lines else (result.stderr or "").strip()[:200]
    print(f"[sitemap] gen-sitemap.py exit={result.returncode}: {summary}")
    return result.returncode == 0
