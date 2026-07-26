#!/usr/bin/env python3
"""
CarShake state×venue compound pSEO generator.
Produces /state-venue/{state}-{venue}/index.html.

Scope: only the 29 states that already have a /state/{slug} hub, so every
upward link resolves. Each page also links down to the real city-venue pages
that already exist for cities in that state.

Design notes:
  - No fabricated state-specific legal claims. Bailment/liability framing is
    generic and points readers to the state hub for the specifics.
  - No fabricated reviews (CLAUDE.md honesty policy).
  - Shares CSS/schema helpers with _gen_city_venue.py via _pseo_common.
"""
import json
from pathlib import Path

from _pseo_common import (
    BASE, MODIFIED, ROOT, article, head_block, org_schema, update_sitemap_block,
)

PUBLISHED = "2026-07-26"   # first publication of the state-venue page set

# (state_slug, state_name) — restricted to states that have an existing
# /state/{slug} hub. Verified 2026-07-26 against state/ on disk.
STATES = [
    ("alaska", "Alaska"), ("arizona", "Arizona"), ("california", "California"),
    ("colorado", "Colorado"), ("connecticut", "Connecticut"), ("dc", "Washington, D.C."),
    ("florida", "Florida"), ("georgia", "Georgia"), ("hawaii", "Hawaii"),
    ("illinois", "Illinois"), ("indiana", "Indiana"), ("louisiana", "Louisiana"),
    ("maryland", "Maryland"), ("massachusetts", "Massachusetts"), ("michigan", "Michigan"),
    ("minnesota", "Minnesota"), ("missouri", "Missouri"), ("nevada", "Nevada"),
    ("new-jersey", "New Jersey"), ("new-york", "New York"),
    ("north-carolina", "North Carolina"), ("ohio", "Ohio"), ("oregon", "Oregon"),
    ("pennsylvania", "Pennsylvania"), ("tennessee", "Tennessee"), ("texas", "Texas"),
    ("virginia", "Virginia"), ("washington", "Washington"), ("wisconsin", "Wisconsin"),
]

# Cities per state that already have /city-venue/{city}-{venue} pages.
# Drives the downward "see it in your city" links (only links that exist).
CITIES_BY_STATE = {
    "arizona": [("phoenix", "Phoenix")],
    "california": [("los-angeles", "Los Angeles"), ("san-francisco", "San Francisco"),
                   ("san-diego", "San Diego"), ("sacramento", "Sacramento")],
    "colorado": [("denver", "Denver")],
    "dc": [],
    "florida": [("miami", "Miami"), ("orlando", "Orlando"), ("tampa", "Tampa"),
                ("jacksonville", "Jacksonville")],
    "georgia": [("atlanta", "Atlanta")],
    "illinois": [("chicago", "Chicago")],
    "indiana": [("indianapolis", "Indianapolis")],
    "louisiana": [("new-orleans", "New Orleans")],
    "massachusetts": [("boston", "Boston")],
    "michigan": [("detroit", "Detroit")],
    "minnesota": [("minneapolis", "Minneapolis")],
    "missouri": [("kansas-city", "Kansas City"), ("st-louis", "St. Louis")],
    "nevada": [("las-vegas", "Las Vegas")],
    "new-york": [("new-york", "New York")],
    "north-carolina": [("charlotte", "Charlotte"), ("raleigh", "Raleigh")],
    "ohio": [("cincinnati", "Cincinnati"), ("cleveland", "Cleveland"),
             ("columbus", "Columbus")],
    "oregon": [("portland", "Portland")],
    "pennsylvania": [("philadelphia", "Philadelphia"), ("pittsburgh", "Pittsburgh")],
    "tennessee": [("nashville", "Nashville"), ("memphis", "Memphis")],
    "texas": [("houston", "Houston"), ("dallas", "Dallas"), ("san-antonio", "San Antonio"),
              ("austin", "Austin")],
    "washington": [("seattle", "Seattle")],
    "wisconsin": [("milwaukee", "Milwaukee")],
    # States below have a state hub but no covered city in the city-venue set yet.
    "alaska": [], "connecticut": [], "hawaii": [], "maryland": [],
    "new-jersey": [], "virginia": [],
}

VENUES = [
    ("restaurants", "Restaurants", "restaurant"),
    ("hotels", "Hotels", "hotel"),
    ("event-venues", "Event Venues", "event venue"),
    ("corporate-parking", "Corporate Parking", "corporate parking garage"),
    ("hospitals", "Hospitals", "hospital"),
]


def venue_context(venue_slug, venue_noun):
    ctx = {
        "restaurants": {
            "scene": "upscale and chain restaurants with valet stand operations",
            "risk": "tight curbside lanes, hurried attendants moving dozens of cars per shift, and narrow restaurant driveways",
            "ritual": "dinner and weekend service rushes",
        },
        "hotels": {
            "scene": "full-service and boutique hotels operating overnight valet",
            "risk": "overnight key custody, multi-level garage stacking, and high attendant turnover between shifts",
            "ritual": "check-in and check-out windows",
        },
        "event-venues": {
            "scene": "concert halls, banquet facilities, and conference centers",
            "risk": "peak-load valet surges, contract (not in-house) valet crews with high staff churn, and dark overflow lots",
            "ritual": "event load-in and load-out rushes",
        },
        "corporate-parking": {
            "scene": "corporate campus and Class-A office parking garages",
            "risk": "monthly-contract parking where the garage operator can deny any single incident, multi-tenant garage stacking, and tight garage-column clearances",
            "ritual": "weekday morning arrival and evening departure",
        },
        "hospitals": {
            "scene": "hospital and medical-center parking operations",
            "risk": "stress-driven short tempers, long key-custody windows during appointments, large garages with blind corners, and third-party contractors who frequently disclaim liability",
            "ritual": "appointment drop-off and pickup windows",
        },
    }
    return ctx[venue_slug]


def jd(name, q, a):
    return {"@type": "Question", "name": name,
            "acceptedAnswer": {"@type": "Answer", "text": a}}


def build_page(state_slug, state_name, venue_slug, venue_label, venue_noun):
    slug = f"{state_slug}-{venue_slug}"
    url = f"{BASE}/state-venue/{slug}"
    state_hub = f"{BASE}/state/{state_slug}"
    vc = venue_context(venue_slug, venue_noun)

    title = f"{state_name} {venue_label} Valet Damage Claims — CarShake"
    desc = (f"Defeat false valet damage claims at {state_name} {venue_label.lower()}. "
            f"Free 60-second pre-scan with timestamped, GPS-verified photos and a QR "
            f"handover receipt. {state_name} bailment-law context included.")

    # Downward links to real city-venue pages in this state.
    cities = CITIES_BY_STATE.get(state_slug, [])
    city_links = "".join(
        f'<li><a href="{BASE}/city-venue/{cslug}-{venue_slug}">{cname} {venue_label.lower()}</a></li>'
        for cslug, cname in cities
    ) if cities else ""

    faqs = [
        (f"How do {state_name} drivers document a car before valet at {article(venue_noun)} {venue_noun}?",
         f"Open CarShake in your phone browser at the {venue_noun}'s valet stand and run the 60-second guided scan before you hand over the keys. CarShake captures 8 timestamped, GPS-verified photos covering every exterior angle, then generates a QR handover receipt the attendant confirms. The whole sequence takes about a minute and requires no app download."),
        (f"Does {state_name} bailment law help me if a valet damages my car at {article(venue_noun)} {venue_noun}?",
         f"It can. When you hand your keys to a valet in {state_name}, a bailment is created and the {venue_noun} (or its valet contractor) is expected to return the car in the condition it was received. The hard part is proving the before-state — which is exactly what a timestamped CarShake scan provides. For the state-specific liability limits, statutes of limitation, and how {state_name} courts have treated valet disclaimers, see our {state_name} valet liability guide linked below."),
        (f"Is CarShake free in {state_name}?",
         f"Yes. The free plan includes 3 scans per month — enough to cover a typical {venue_noun} visit. Shield+ at $2.97/month unlocks unlimited scans and PDF evidence reports, which is less than the cost of a single disputed cleaning fee or deductible."),
    ]

    article_json = {
        "@context": "https://schema.org", "@type": "Article",
        "headline": title, "description": desc,
        "author": {"@type": "Organization", "name": "CarShake", "url": BASE},
        "publisher": {"@type": "Organization", "name": "CarShake", "url": BASE},
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "datePublished": PUBLISHED, "dateModified": MODIFIED,
    }
    breadcrumb_json = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/"},
            {"@type": "ListItem", "position": 2, "name": state_name, "item": state_hub},
            {"@type": "ListItem", "position": 3,
             "name": f"{venue_label} Valet Damage Claims", "item": url},
        ],
    }
    faq_json = {"@context": "https://schema.org", "@type": "FAQPage",
                "mainEntity": [jd(q, q, a) for q, a in faqs]}

    schemas = [json.dumps(article_json), json.dumps(breadcrumb_json),
               json.dumps(faq_json), org_schema()]
    head = head_block(title, desc, url, schemas)

    faq_visible = "\n".join(f'<h3>{q}</h3>\n<p>{a}</p>' for q, a in faqs)
    city_block = (
        f'<h2>{state_name} {venue_label.lower()} by city</h2>\n'
        f'<p>See how CarShake works at {venue_label.lower()} in {state_name}\'s '
        f'major metros:</p>\n<ul>{city_links}</ul>\n'
        if city_links else ""
    )

    body = f"""
<nav class="breadcrumb"><a href="{BASE}/">CarShake</a> › <a href="{state_hub}">{state_name}</a> › {venue_label} Valet Damage Claims</nav>
<article>
<header>
<h1>{state_name} {venue_label} Valet Damage Claims</h1>
<p class="lede">{state_name} drivers who hand their keys to a valet at {vc['scene']} are routinely asked to pay for damage they didn't cause. CarShake is a free, 60-second scan you run before and after handover — timestamped, GPS-verified photos plus a QR receipt the attendant confirms — that turns a "he-said-she-said" dispute into settled evidence.</p>
</header>

<h2>Why {venue_label.lower()} valet in {state_name} generates so many damage disputes</h2>
<p>{state_name} {venue_label.lower()} operate under conditions that make damage disputes almost inevitable: {vc['risk']}. The disputes surface most during {vc['ritual']}. Without a timestamped before-state record, the {venue_noun}'s valet operator can (and often does) claim the damage was pre-existing — and the driver has no way to prove otherwise.</p>
<p>CarShake closes that gap. A 60-second scan before you hand over the keys, plus a second scan at pickup, produces a tamper-evident record that ties any new damage to the exact window the {venue_noun} had custody of your car.</p>

<h2>How {state_name} bailment law fits in</h2>
<p>When you hand your keys to a valet in {state_name}, you've created a <em>bailment</em> — the {venue_noun} (or its valet contractor) takes temporary custody of your vehicle and is expected to return it in the condition it was received. In practice, valet operators often try to disclaim liability for cosmetic damage, and the dispute almost always comes down to one question: <strong>can you prove the car's condition before handover?</strong> CarShake's timestamped, GPS-verified, SHA-256-hashed photos plus the QR handover receipt are exactly that proof. For the specifics that vary by state — liability caps, statutes of limitation, and how {state_name} courts have treated valet-ticket disclaimers — see our <a href="{state_hub}">{state_name} valet liability guide</a>.</p>

<div class="callout">
<strong>The {state_name} angle:</strong> disputes at {venue_noun}s are most often won or lost on <em>whether the driver can prove the before-state</em>. A CarShake pre-scan is the cheapest insurance you'll ever carry — it's free.
</div>

<h2>How {state_name} drivers use CarShake at {article(venue_noun)} {venue_noun}</h2>
<ol>
<li><strong>Before handover:</strong> open CarShake in your phone browser at the {venue_noun}'s valet stand and run the guided 8-angle scan. It takes about 60 seconds and captures timestamped, GPS-verified photos of every exterior surface.</li>
<li><strong>QR handover receipt:</strong> the attendant scans a QR code that creates a mutual digital handshake — both parties have acknowledged the car's documented condition at a specific time.</li>
<li><strong>At pickup:</strong> run the scan again. CarShake compares every angle and flags any new scratch, dent, or curb scuff with a timestamped before/after overlay.</li>
<li><strong>If there's a dispute:</strong> export the PDF evidence report. The timestamped, SHA-256-hashed photos plus the QR receipt provide verifiable documentation that the {venue_noun}'s valet operator cannot dismiss as "pre-existing."</li>
</ol>

<h2>What it costs</h2>
<p>Free plan: 3 scans per month — enough to cover a typical {venue_noun} visit. Shield+ at <strong>$2.97/month</strong> unlocks unlimited scans and exportable PDF evidence reports. That is less than the cost of a single disputed cleaning fee or insurance deductible. See <a href="{BASE}/pricing">pricing</a>.</p>

{city_block}
<h2>Frequently asked questions</h2>
{faq_visible}

<div class="cta"><a href="{BASE}/">Scan your car before your next {state_name} {venue_noun} visit &rarr;</a></div>

<section class="related-links">
<h3>Related pages</h3>
<ul>
<li><a href="{state_hub}">{state_name} valet liability guide</a></li>
<li><a href="{BASE}/valet-damaged-my-car">What to do if a valet damaged your car</a></li>
<li><a href="{BASE}/industries/auto-insurance">CarShake for auto insurance evidence</a></li>
<li><a href="{BASE}/industries/car-rental">CarShake for rental cars</a></li>
<li><a href="{BASE}/faq">CarShake FAQ</a></li>
<li><a href="{BASE}/about">About CarShake</a></li>
</ul>
</section>
</article>
<footer>
<p>© 2026 CarShake. Free valet-damage-proof handover app for {state_name} drivers.</p>
<p><a href="{BASE}/">Home</a> · <a href="{BASE}/faq">FAQ</a> · <a href="{BASE}/about">About</a></p>
</footer>
</body>
</html>
"""
    html = head + body
    out_dir = ROOT / "state-venue" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(html, encoding="utf-8")
    return url


def main():
    urls = []
    for state_slug, state_name in STATES:
        for venue_slug, venue_label, venue_noun in VENUES:
            url = build_page(state_slug, state_name, venue_slug, venue_label, venue_noun)
            urls.append(url)
    update_sitemap_block("state-venue", urls, priority="0.6")
    print(f"Generated {len(urls)} state-venue pages ({len(STATES)} states x {len(VENUES)} venues)")
    print(f"Sample: {urls[0]}")


if __name__ == "__main__":
    main()
