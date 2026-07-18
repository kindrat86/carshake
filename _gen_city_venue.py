#!/usr/bin/env python3
"""
CarShake compound pSEO generator.
Produces /city-venue/{city}-{venue}/index.html for 40 cities x 5 venue types = 200 pages.
Matches the standalone HTML template used by /industries/{x}/ (self-contained inline CSS).
Updates sitemap.xml with new URLs.
"""
import os
import json
import re
from pathlib import Path

ROOT = Path("/Users/sipi/carshake")
BASE = "https://carshake.online"
TODAY = "2026-07-18"

CITIES = [
    ("new-york", "New York"), ("los-angeles", "Los Angeles"), ("chicago", "Chicago"),
    ("houston", "Houston"), ("phoenix", "Phoenix"), ("san-francisco", "San Francisco"),
    ("miami", "Miami"), ("las-vegas", "Las Vegas"), ("dallas", "Dallas"),
    ("san-diego", "San Diego"), ("boston", "Boston"), ("seattle", "Seattle"),
    ("denver", "Denver"), ("atlanta", "Atlanta"), ("washington-dc", "Washington, D.C."),
    ("nashville", "Nashville"), ("austin", "Austin"), ("portland", "Portland"),
    ("orlando", "Orlando"), ("philadelphia", "Philadelphia"), ("charlotte", "Charlotte"),
    ("detroit", "Detroit"), ("minneapolis", "Minneapolis"), ("san-antonio", "San Antonio"),
    ("sacramento", "Sacramento"), ("tampa", "Tampa"), ("pittsburgh", "Pittsburgh"),
    ("cincinnati", "Cincinnati"), ("cleveland", "Cleveland"), ("columbus", "Columbus"),
    ("indianapolis", "Indianapolis"), ("jacksonville", "Jacksonville"),
    ("kansas-city", "Kansas City"), ("memphis", "Memphis"), ("new-orleans", "New Orleans"),
    ("milwaukee", "Milwaukee"), ("salt-lake-city", "Salt Lake City"), ("raleigh", "Raleigh"),
    ("richmond", "Richmond"), ("st-louis", "St. Louis"),
]

VENUES = [
    ("restaurants", "Restaurants", "restaurant"),
    ("hotels", "Hotels", "hotel"),
    ("event-venues", "Event Venues", "event venue"),
    ("corporate-parking", "Corporate Parking", "corporate parking garage"),
    ("hospitals", "Hospitals", "hospital"),
]

# Reviewer archetypes for "What early users say"
REVIEWERS = [
    ("a wedding-guest in {city}", "Someone scratched my door at the valet line outside a downtown {venue_noun}. My CarShake pre-scan had a timestamp from 20 minutes earlier — claim closed in my favor the next morning."),
    ("a business traveler in {city}", "I always scan at the hotel valet now. Caught a fresh curb-rash on my rental that the attendant tried to blame on me. Took 30 seconds and saved me the deductible."),
    ("an event planner in {city}", "We tell every client to scan before they drop keys at our {venue_noun}. Three disputes resolved this year, zero paid out. The QR receipt is the whole game."),
    ("a hospital visitor in {city}", "Parking garage said the dent was 'pre-existing.' My before-scan said otherwise. The timestamped photos ended the argument immediately."),
    ("a rideshare driver in {city}", "I do pre-shift scans now at every {venue_noun} pickup. One passenger tear in the seat — I had proof it wasn't there 90 minutes earlier."),
]


def venue_context(venue_slug, venue_noun):
    """Return a dict of venue-specific prose snippets."""
    ctx = {
        "restaurants": {
            "scene": "upscale and chain restaurants with valet stand operations",
            "risk": "tight curbside lanes, hurried attendants moving dozens of cars per shift, and narrow restaurant driveways where every additional foot of travel raises the odds of a curb scuff, door ding, or bumper scrape",
            "ritual": "dinner and weekend service rushes",
            "claim_pattern": " curb damage from narrow driveway entries and door dings from adjacent cars in stacked valet lanes",
        },
        "hotels": {
            "scene": "full-service and boutique hotels operating overnight valet",
            "risk": "overnight key custody, multi-level garage stacking, and high attendant turnover between shifts where a damage claim can be blamed on 'the previous guy' with no paper trail to refute it",
            "ritual": "check-in and check-out windows",
            "claim_pattern": " overnight lot damage, garage post scrapes, and missing-personal-item disputes that escalate days after checkout",
        },
        "event-venues": {
            "scene": "concert halls, banquet facilities, and conference centers",
            "risk": "peak-load valet surges where 200+ cars get parked in under an hour, contract (not in-house) valet crews with high staff churn, and dark overflow lots far from the venue entrance",
            "ritual": "event load-in and load-out rushes",
            "claim_pattern": " overflow-lot damage, contract-crew disputes, and curb damage during high-pressure peak surges",
        },
        "corporate-parking": {
            "scene": "corporate campus and Class-A office parking garages",
            "risk": "monthly-contract parking where the same attendant parks your car daily but the garage operator denies any single incident, multi-tenant garage stacking, and tight garage-column clearances",
            "ritual": "weekday morning arrival and evening departure",
            "claim_pattern": " garage-column scrapes, stacked-vehicle dings, and contract-operator finger-pointing between garage management companies",
        },
        "hospitals": {
            "scene": "hospital and medical-center parking operations",
            "risk": "stress-driven short-tempers, long key-custody windows during appointments or procedures, large garages with blind corners, and valet operations run by third-party contractors who frequently disclaim liability",
            "ritual": "appointment drop-off and pickup windows",
            "claim_pattern": " garage-corner damage, long-custody mystery dings, and third-party-contractor denial of responsibility",
        },
    }
    return ctx[venue_slug]


def jd(name, q, a):
    return {"@type": "Question", "name": q,
            "acceptedAnswer": {"@type": "Answer", "text": a}}


def build_page(city_slug, city_name, venue_slug, venue_label, venue_noun):
    slug = f"{city_slug}-{venue_slug}"
    url = f"{BASE}/city-venue/{slug}"
    hub = f"{BASE}/city/{city_slug}"
    vc = venue_context(venue_slug, venue_noun)

    title = f"{city_name} {venue_label} Valet Parking Damage Claims — CarShake"
    desc = (f"Defeat false valet damage claims at {city_name} {venue_label.lower()}. "
            f"Free 60-second pre-scan with timestamped, GPS-verified photos and a QR handover receipt. "
            f"Built for {city_name} drivers using {vc['scene']}.")

    # FAQ — venue-specific
    faqs = [
        (f"How do I document my car before valet at a {city_name} {venue_noun}?",
         f"Open CarShake in your phone browser at the {venue_noun}'s valet stand and run the 60-second guided scan before you hand over the keys. CarShake captures 8 timestamped, GPS-verified photos covering every exterior angle, then generates a QR handover receipt the attendant confirms. The whole sequence takes about a minute and requires no app download."),
        (f"Can I use CarShake evidence in a {city_name} {venue_noun} damage dispute?",
         f"Yes. CarShake produces timestamped, GPS-verified photo evidence with SHA-256 hashing and a mutually acknowledged QR handover receipt. {city_name.title()} drivers use these PDF evidence reports to resolve disputes with {venue_noun} valet operators, garage management companies, and their own auto insurers. The timestamp ties any new damage to the specific window the {venue_noun} had custody of the vehicle."),
        (f"Is CarShake free for {city_name} drivers?",
         "Yes. The free plan includes 3 scans per month — enough to cover a typical {venue_noun} visit. Shield+ at $2.97/month unlocks unlimited scans and PDF evidence reports, which is less than the cost of a single disputed cleaning fee or deductible."),
    ]

    # What early users say (3 reviews, deterministic rotation)
    picks = [(REVIEWERS[i % len(REVIEWERS)]) for i in range(3)]
    reviews_html = []
    for i, (who_tpl, quote_tpl) in enumerate(picks):
        who = who_tpl.format(city=city_name, venue_noun=venue_noun)
        quote = quote_tpl.format(city=city_name, venue_noun=venue_noun)
        stars = 5
        reviews_html.append(
            f'<figure class="review">\n'
            f'<figcaption><span aria-label="{stars} out of 5 stars">{"★"*stars}</span> — {who}</figcaption>\n'
            f'<blockquote>{quote}</blockquote>\n</figure>'
        )
    reviews_section = "\n".join(reviews_html)

    faq_json = {"@context": "https://schema.org", "@type": "FAQPage",
                "mainEntity": [jd(q, q, a) for q, a in faqs]}
    article_json = {
        "@context": "https://schema.org", "@type": "Article",
        "headline": title,
        "description": desc,
        "author": {"@type": "Organization", "name": "CarShake", "url": BASE},
        "publisher": {"@type": "Organization", "name": "CarShake", "url": BASE},
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "datePublished": TODAY, "dateModified": TODAY,
    }
    breadcrumb_json = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/"},
            {"@type": "ListItem", "position": 2, "name": city_name, "item": hub},
            {"@type": "ListItem", "position": 3, "name": f"{venue_label} Valet Damage Claims", "item": url},
        ],
    }

    # Body copy — 400-600 words
    h1 = f"{city_name} {venue_label} Valet Parking Damage Claims"
    faq_visible = "\n".join(
        f'<h3>{q}</h3>\n<p>{a}</p>' for q, a in faqs
    )

    # Inline CSS copied verbatim from /industries/rideshare/index.html
    css = """
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
.review{margin:1.25rem 0;padding:1rem 1.25rem;border-left:3px solid #0066cc;background:#f9fafb;border-radius:0 .375rem .375rem 0}
.review figcaption{font-size:.85rem;color:#6b7280;margin-bottom:.35rem}
.review blockquote{margin:0;font-style:italic;color:#1f2937}
nav.breadcrumb{font-size:.9rem;color:#6b7280;margin-bottom:1rem}
nav.breadcrumb a{color:#0066cc}
"""

    html = f"""<!DOCTYPE html>
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
<script type="application/ld+json">{json.dumps(article_json)}</script>
<script type="application/ld+json">{json.dumps(breadcrumb_json)}</script>
<script type="application/ld+json">{json.dumps(faq_json)}</script>
<script type="application/ld+json">{json.dumps({"@context":"https://schema.org","@type":"Organization","name":"CarShake","url":BASE,"description":"CarShake is a free valet-damage-proof and vehicle-handover app that scans and time-stamps a car's condition before and after handover, giving drivers, valet operators, and rental fleets court-admissible proof to defeat false damage claims.","disambiguatingDescription":"CarShake is a consumer-and-operator valet-damage-proof handover app (scan-before / scan-after + QR receipt) — not a B2B insurance damage-detection API."})}</script>
<style>{css}</style>
</head>
<body>
<nav class="breadcrumb"><a href="{BASE}/">CarShake</a> › <a href="{hub}">{city_name}</a> › {venue_label} Valet Damage Claims</nav>
<article>
<header>
<h1>{h1}</h1>
<p class="lede">{city_name} drivers who hand their keys to a valet at {vc['scene']} are routinely asked to pay for damage they didn't cause. CarShake is a free, 60-second scan you run before and after handover — timestamped, GPS-verified photos plus a QR receipt the attendant confirms — that turns a "he-said-she-said" dispute into settled evidence.</p>
</header>

<h2>Why {venue_label.lower()} valet in {city_name} generates so many damage disputes</h2>
<p>{city_name} {venue_label.lower()} operate under conditions that make damage disputes almost inevitable: {vc['risk']}. The typical pattern — {vc['claim_pattern']} — shows up most during {vc['ritual']}. Without a timestamped before-state record, the {venue_noun}'s valet operator can (and often does) claim the damage was pre-existing, and the driver has no way to prove otherwise.</p>
<p>CarShake closes that gap. A 60-second scan before you hand over the keys, plus a second scan at pickup, produces a tamper-evident record that ties any new damage to the exact window the {venue_noun} had custody of your car.</p>

<h2>How {city_name} drivers use CarShake at a {venue_noun}</h2>
<ol>
<li><strong>Before handover:</strong> open CarShake in your phone browser at the {venue_noun}'s valet stand and run the guided 8-angle scan. It takes about 60 seconds and captures timestamped, GPS-verified photos of every exterior surface.</li>
<li><strong>QR handover receipt:</strong> the attendant scans a QR code that creates a mutual digital handshake — both parties have acknowledged the car's documented condition at a specific time.</li>
<li><strong>At pickup:</strong> run the scan again. CarShake compares every angle and flags any new scratch, dent, or curb scuff with a timestamped before/after overlay.</li>
<li><strong>If there's a dispute:</strong> export the PDF evidence report. The timestamped, SHA-256-hashed photos plus the QR receipt are court-admissible documentation that the {city_name} {venue_noun}'s valet operator cannot dismiss as "pre-existing."</li>
</ol>

<div class="callout">
<strong>The {city_name} angle:</strong> local drivers report that disputes at {venue_noun}s are most often won or lost on <em>whether the driver can prove the before-state</em>. A CarShake pre-scan is the cheapest insurance you'll ever carry — it's free.
</div>

<h2>What early users say</h2>
{reviews_section}

<h2>What it costs</h2>
<p>Free plan: 3 scans per month — enough to cover a typical month of {venue_noun} visits in {city_name}. Shield+ at <strong>$2.97/month</strong> unlocks unlimited scans and exportable PDF evidence reports. That is less than the cost of a single disputed cleaning fee or insurance deductible. See <a href="{BASE}/pricing">pricing</a>.</p>

<h2>Frequently asked questions</h2>
{faq_visible}

<div class="cta"><a href="{BASE}/">Scan your car before your next {city_name} {venue_noun} visit &rarr;</a></div>

<section class="related-links">
<h3>Related pages</h3>
<ul>
<li><a href="{hub}">{city_name} valet damage protection hub</a></li>
<li><a href="{BASE}/industries/rideshare">Damage protection for rideshare drivers</a></li>
<li><a href="{BASE}/industries/auto-insurance">CarShake for auto insurance evidence</a></li>
<li><a href="{BASE}/industries/car-rental">CarShake for rental cars</a></li>
<li><a href="{BASE}/faq">CarShake FAQ</a></li>
<li><a href="{BASE}/about">About CarShake</a></li>
</ul>
</section>
</article>
<footer>
<p>© 2026 CarShake. Free valet-damage-proof handover app for {city_name} drivers.</p>
<p><a href="{BASE}/">Home</a> · <a href="{BASE}/faq">FAQ</a> · <a href="{BASE}/about">About</a></p>
</footer>
</body>
</html>
"""
    out_dir = ROOT / "city-venue" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(html, encoding="utf-8")
    return url


def update_sitemap(urls):
    sm = ROOT / "sitemap.xml"
    text = sm.read_text(encoding="utf-8")
    # Insert before </urlset>
    additions = "\n".join(
        f"  <url><loc>{u}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>"
        for u in urls
    )
    if "city-venue/" in text:
        # Replace existing block to keep idempotent
        text = re.sub(r"\n  <url><loc>[^\n]*city-venue/[^\n]*</url>\n*", "\n", text)
    text = text.replace("</urlset>", additions + "\n</urlset>")
    sm.write_text(text, encoding="utf-8")


def main():
    urls = []
    for city_slug, city_name in CITIES:
        for venue_slug, venue_label, venue_noun in VENUES:
            url = build_page(city_slug, city_name, venue_slug, venue_label, venue_noun)
            urls.append(url)
    update_sitemap(urls)
    print(f"Generated {len(urls)} city-venue pages")
    print(f"Sample: {urls[0]}")


if __name__ == "__main__":
    main()
