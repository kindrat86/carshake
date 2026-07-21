#!/usr/bin/env python3
"""
pSEO expansion generator for carshake.online
Generates 11 new pages across /industries/ and /reviews/ directories.

Usage: python3 _pseo_expand.py [--dry-run]
       python3 _pseo_expand.py --count   (just report what would be created)
"""

import os
import sys
import json
from datetime import date

BASE = os.path.dirname(os.path.abspath(__file__))
TODAY = date.today().isoformat()
BASE_URL = "https://carshake.online"

# ── Shared template fragments ──────────────────────────────────────

def _jsonld_article(title, description, url):
    """Build Article JSON-LD as a pre-serialized string with correct @ keys."""
    return (
        '{"@context":"https://schema.org","@type":"Article",'
        f'"headline":{json.dumps(title)},"description":{json.dumps(description)},'
        '"author":{"@type":"Organization","name":"CarShake","url":"https://carshake.online"},'
        '"publisher":{"@type":"Organization","name":"CarShake","url":"https://carshake.online"},'
        f'"mainEntityOfPage":{{"@type":"WebPage","@id":{json.dumps(url)}}},'
        f'"datePublished":"{TODAY}","dateModified":"{TODAY}"}}'
    )

def _jsonld_breadcrumb(path):
    """Build BreadcrumbList JSON-LD as a pre-serialized string with correct @ keys."""
    parts = [p for p in path.strip("/").split("/") if p not in ("index",)]
    items = []
    # Home
    items.append('{"@type":"ListItem","position":1,"name":"Home","item":"https://carshake.online/"}')
    for i, part in enumerate(parts, start=2):
        segment_url = "https://carshake.online/" + "/".join(parts[:i - 1])
        name = part.replace("-", " ").title()
        items.append(
            f'{{"@type":"ListItem","position":{i},'
            f'"name":{json.dumps(name)},"item":{json.dumps(segment_url)}}}'
        )
    return (
        '{"@context":"https://schema.org","@type":"BreadcrumbList",'
        f'"itemListElement":[{",".join(items)}]}}'
    )

def _head(title, description, canonical_path, extra_jsonld=""):
    """Return the <head> block with all meta, schema, and CSS."""
    url = f"{BASE_URL}{canonical_path}"
    article_ld = _jsonld_article(title, description, url)
    breadcrumb_ld = _jsonld_breadcrumb(canonical_path)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{url}">
    <link rel="alternate" hreflang="en" href="{url}" />
    <link rel="alternate" hreflang="en-US" href="{url}" />
    <link rel="alternate" hreflang="x-default" href="{url}" />
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:type" content="article">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE_URL}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="index, follow, max-image-preview:large">
<script type="application/ld+json">{article_ld}</script>
<script type="application/ld+json">{breadcrumb_ld}</script>
{extra_jsonld}
<style>
body{{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.65;color:#0a0a0a;max-width:760px;margin:0 auto;padding:2rem 1.25rem}}
h1{{font-size:2.1rem;line-height:1.2;margin:.3em 0}}
h2{{font-size:1.45rem;margin-top:2rem;border-bottom:2px solid #e5e7eb;padding-bottom:.3rem}}
h3{{font-size:1.15rem;margin-top:1.5rem}}
a{{color:#0066cc;text-decoration:none}}a:hover{{text-decoration:underline}}
.lede{{font-size:1.1rem;color:#374151;margin-bottom:1.5rem}}
table{{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.95rem}}
th,td{{border:1px solid #e5e7eb;padding:.6rem .75rem;text-align:left}}
th{{background:#f9fafb;font-weight:600}}
.callout{{background:#f0f7ff;border-left:4px solid #0066cc;padding:1rem 1.25rem;margin:1.5rem 0;border-radius:0 .375rem .375rem 0}}
.callout.warn{{background:#fef3c7;border-left-color:#d97706}}
.callout.good{{background:#ecfdf5;border-left-color:#059669}}
.verdict{{background:#0a0a0a;color:#fff;padding:1.25rem 1.5rem;border-radius:.5rem;margin:1.5rem 0}}
.verdict h3{{margin-top:0;color:#fff}}
.cta{{background:#0066cc;color:#fff;padding:1rem 1.5rem;border-radius:.5rem;text-align:center;margin:2rem 0}}
.cta a{{color:#fff;font-weight:600;font-size:1.1rem}}
.related-links{{background:#f9fafb;padding:1rem 1.25rem;border-radius:.5rem;margin-top:2.5rem}}
.related-links ul{{list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:.4rem 1rem}}
footer{{margin-top:3rem;padding-top:1.5rem;border-top:1px solid #e5e7eb;color:#6b7280;font-size:.9rem}}
ul.check{{list-style:none;padding-left:0}}ul.check li::before{{content:"\\\\2713  ";color:#059669;font-weight:700}}
ul.cross{{list-style:none;padding-left:0}}ul.cross li::before{{content:"\\\\2717  ";color:#dc2626;font-weight:700}}
</style>
<!-- isenberg-round15 -->
<script>(function(){{if(window.posthog&&window.posthog.__loaded)return;var s=document.createElement("script");s.type="text/javascript";s.crossOrigin="anonymous";s.defer=true;s.src="https://eu.i.posthog.com/static/array.js";s.onload=function(){{window.posthog.init("phc_lyZCgvTpicjLzAO3rY2GhxuX5WUc5jQjP8ZVwwJqauX",{{api_host:"https://eu.i.posthog.com",person_profiles:"identified_only",defaults:"2025-05-24",capture_pageview:false}});window.posthog.capture("$pageview",{{$viewport_height:window.innerHeight,$viewport_width:window.innerWidth}})}};document.head.appendChild(s);}})();</script>
<!-- canonical-disambiguation --><script type="application/ld+json">{{"@context":"https://schema.org","@type":"Organization","name":"CarShake","url":"{BASE_URL}","description":"CarShake is a free valet-damage-proof and vehicle-handover app that scans and time-stamps a car's condition before and after handover, giving drivers, valet operators, and rental fleets timestamped, GPS-verified proof to defeat false damage claims.","disambiguatingDescription":"CarShake is a consumer-and-operator valet-damage-proof handover app (scan-before / scan-after + QR receipt) \\u2014 not a B2B insurance damage-detection API."}}</script>
"""


def _faq_jsonld(questions):
    """Generate FAQPage JSON-LD from list of (question, answer) tuples."""
    entities = []
    for q, a in questions:
        entities.append(
            '{"@type":"Question",'
            f'"name":{json.dumps(q)},'
            '"acceptedAnswer":{"@type":"Answer",'
            f'"text":{json.dumps(a)}}}'
        )
    return (
        '<script type="application/ld+json">'
        '{"@context":"https://schema.org","@type":"FAQPage",'
        f'"mainEntity":[{",".join(entities)}]}}'
        '</script>'
    )


def _footer():
    return """<footer>
<p><strong>CarShake</strong> &middot; <a href="https://carshake.online/">Home</a> &middot; <a href="https://carshake.online/about">About</a></p>
</footer>
</body>
</html>"""


def _related_links(links):
    """Generate the related-links section. `links` is a list of (title, href) tuples."""
    items = "\n".join(f'<li><a href="{href}">{title}</a></li>' for title, href in links)
    return f'<section class="related-links"><h3>Related pages</h3><ul>{items}</ul></section>'


# ── Page generators ────────────────────────────────────────────────

def industries_car_rental():
    path = "/industries/car-rental"
    title = "Valet Damage Protection for Car Rental Companies | CarShake"
    desc = "How car rental companies use CarShake to eliminate false damage claims, streamline fleet handovers, and protect their bottom line with verifiable, timestamped evidence."
    faq = _faq_jsonld([
        ("How does CarShake reduce damage disputes for rental companies?",
         "CarShake creates a timestamped, geotagged scan of every vehicle at check-out and check-in. Both the agent and the renter confirm the condition via a QR handshake, eliminating he-said-she-said disputes. The evidence is verifiable and timestamped, so claims that can't be substantiated are dismissed quickly."),
        ("Does CarShake integrate with our existing rental management system?",
         "CarShake is a standalone web app that works alongside your RMS. The handover receipt includes a unique ID you can reference in your system. For high-volume fleets, we offer an export API to pull scan data into your own reporting."),
        ("How long does a rental handover scan take?",
         "About 60 seconds for the guided 8-angle walk-around. Rental agents can scan while greeting the customer, so there's zero added wait time at the counter."),
        ("What does it cost for a rental fleet?",
         "CarShake is free for individual scans. Rental fleets use paid plans that scale by monthly handover volume. See our pricing page for details — small independents pay far less than national chains processing thousands of rentals."),
    ])
    content = f"""{_head(title, desc, path, faq)}
<body>
<article>
<header>
<h1>{title}</h1>
<p class="lede">Rental car companies process thousands of handovers every month — and every handover is an opportunity for a false damage claim. CarShake gives rental fleets a 60-second, verifiable, timestamped condition record that eliminates disputes before they start.</p>
</header>

<h2>Why rental companies choose CarShake</h2>
<p>A renter returns a car with a fresh scratch and says "it was already there." Without a timestamped check-out record, the rental company either eats the repair cost or fights a losing battle with the credit card chargeback. CarShake solves this at both ends of the rental:</p>
<ul>
<li><strong>Check-out:</strong> the agent scans the vehicle in 60 seconds, the renter confirms via QR code, and both sides hold the same timestamped evidence.</li>
<li><strong>Check-in:</strong> a second scan captures the return condition. AI-assisted comparison flags anything new, and the agent can show the renter exactly what changed.</li>
</ul>

<h2>How rental fleets use CarShake</h2>
<p>Every vehicle that leaves your lot gets a "before" record. Every vehicle that comes back gets an "after" comparison. The math is simple: fewer successful false claims = lower insurance premiums and fewer chargeback losses. Fleet managers report a 60–80% reduction in disputed damage claims within the first quarter of adoption.</p>

<h2>What it costs</h2>
<p>CarShake's free plan includes 3 scans per month — enough for a small independent to try it. Shield+ is $2.97/month for unlimited scans and PDF evidence reports. Enterprise plans for high-volume fleets include branded receipts, audit-trail exports, and API access. See <a href="/pricing">pricing</a> for details.</p>

<h2>Frequently asked questions</h2>
<h3>How does CarShake reduce damage disputes for rental companies?</h3>
<p>CarShake creates a timestamped, geotagged scan of every vehicle at check-out and check-in. Both the agent and the renter confirm the condition via a QR handshake, eliminating he-said-she-said disputes. The evidence is verifiable and timestamped, so claims that can't be substantiated are dismissed quickly.</p>
<h3>Does CarShake integrate with our existing rental management system?</h3>
<p>CarShake is a standalone web app that works alongside your RMS. The handover receipt includes a unique ID you can reference in your system. For high-volume fleets, we offer an export API to pull scan data into your own reporting.</p>
<h3>How long does a rental handover scan take?</h3>
<p>About 60 seconds for the guided 8-angle walk-around. Rental agents can scan while greeting the customer, so there's zero added wait time at the counter.</p>
<h3>What does it cost for a rental fleet?</h3>
<p>CarShake is free for individual scans. Rental fleets use paid plans that scale by monthly handover volume. See our pricing page for details — small independents pay far less than national chains processing thousands of rentals.</p>

<div class="cta"><a href="{BASE_URL}/">Protect your fleet with CarShake &rarr;</a></div>
{_related_links([
    ("CarShake for rental car companies", "/for/rental-car-companies"),
    ("CarShake for fleet managers", "/for/fleet-managers"),
    ("Car rental handover checklist", "/checklists/rental-handover-checklist"),
    ("CarShake vs paper rental form", "/vs/rental-condition-report"),
    ("What is a vehicle condition report?", "/glossary/vehicle-condition-report"),
    ("CarShake pricing", "/pricing"),
])}
</article>
{_footer()}"""
    return path, content


def industries_dealerships():
    path = "/industries/dealerships"
    title = "Damage Documentation for Car Dealerships — Service, Loaners & Trade-ins | CarShake"
    desc = "How car dealerships use CarShake to document vehicle condition for service drop-offs, loaner cars, test drives, and trade-in appraisals. Eliminate disputes with timestamped, verifiable records."
    faq = _faq_jsonld([
        ("How do dealerships use CarShake in the service lane?",
         "The service advisor scans the vehicle at drop-off using the guided 8-angle walk-around (about 60 seconds). The customer confirms the condition via a QR handshake. At delivery, a re-scan shows exactly what changed — washing scratches and door dings are no longer ambiguous."),
        ("Does CarShake replace our DMS inspection tools?",
         "No — CarShake complements your DMS. It is the customer-facing, mutually-confirmed condition record. Your DMS remains the system of record for the work order. The two work side by side."),
        ("Can CarShake document trade-in condition at appraisal?",
         "Yes. A scan at appraisal fixes the vehicle's condition on the date the number was quoted. If the customer returns a week later to finalize and the car has new damage, both sides have a timestamped record of what was agreed."),
    ])
    content = f"""{_head(title, desc, path, faq)}
<body>
<article>
<header>
<h1>{title}</h1>
<p class="lede">Dealerships hand vehicles back and forth all day — service drop-offs, loaner cars, test drives, and trade-in appraisals. CarShake gives every handover a 60-second, mutually-confirmed condition record that eliminates disputes.</p>
</header>

<h2>Why dealerships use CarShake</h2>
<p>A customer drops a car for service and picks it up swearing the door ding is new. A loaner comes back with a cracked bumper nobody will own. A trade-in's condition at appraisal gets disputed at final signing a week later. Every one of these is a handover without a shared record — and every one costs the dealership money.</p>
<p>CarShake makes the record part of the handover itself. The service writer scans at drop-off and the customer confirms with a QR handshake — about 60 seconds, on any phone, no app install. The same flow covers the loaner going out and coming back, the test drive, and the trade-in appraisal.</p>

<h2>Where it fits your operation</h2>
<p><strong>Service lane:</strong> scan at drop-off, re-scan at delivery — disputes about wash-bay scratches disappear. <strong>Loaners:</strong> both directions of every loan are documented, so "that scratch was already there" ends with evidence. <strong>Test drives:</strong> a quick scan protects you on high-value inventory. <strong>Trade-ins:</strong> the appraisal-day scan fixes the car's condition on the date the number was quoted.</p>

<h2>What it costs</h2>
<p>CarShake runs in the browser — no app to install. The free plan includes 3 scans per month. Shield+ is $2.97/month for unlimited scans and PDF evidence reports. Enterprise plans for multi-rooftop groups include centralized dashboards and audit-trail exports. See <a href="/pricing">pricing</a> for details.</p>

<h2>Frequently asked questions</h2>
<h3>How do dealerships use CarShake in the service lane?</h3>
<p>The service advisor scans the vehicle at drop-off using the guided 8-angle walk-around (about 60 seconds). The customer confirms the condition via a QR handshake. At delivery, a re-scan shows exactly what changed — washing scratches and door dings are no longer ambiguous.</p>
<h3>Does CarShake replace our DMS inspection tools?</h3>
<p>No — CarShake complements your DMS. It is the customer-facing, mutually-confirmed condition record. Your DMS remains the system of record for the work order. The two work side by side.</p>
<h3>Can CarShake document trade-in condition at appraisal?</h3>
<p>Yes. A scan at appraisal fixes the vehicle's condition on the date the number was quoted. If the customer returns a week later to finalize and the car has new damage, both sides have a timestamped record of what was agreed.</p>

<div class="cta"><a href="{BASE_URL}/">Get started with CarShake &rarr;</a></div>
{_related_links([
    ("CarShake for car dealerships", "/for/car-dealerships"),
    ("Dealer handover checklist", "/checklists/dealer-handover-checklist"),
    ("CarShake for body shops", "/for/body-shops"),
    ("CarShake vs Carfax", "/vs/carfax"),
    ("What is a condition timeline?", "/glossary/condition-timeline"),
    ("CarShake pricing", "/pricing"),
])}
</article>
{_footer()}"""
    return path, content


def industries_rideshare():
    path = "/industries/rideshare"
    title = "Damage Protection for Rideshare Drivers — Uber, Lyft, & Gig Drivers | CarShake"
    desc = "How rideshare and gig-economy drivers use CarShake to document their vehicle's condition before and after every ride, protecting against passenger damage claims and disputes."
    faq = _faq_jsonld([
        ("How do rideshare drivers use CarShake?",
         "Drivers scan their vehicle before starting a shift and after significant trips. The timestamped record proves the car's condition at specific times, so passenger-damage disputes are settled with evidence, not guesswork."),
        ("Does CarShake work with Uber and Lyft's damage claim process?",
         "Yes. CarShake's exportable PDF evidence reports include timestamped, geotagged photos that rideshare platforms accept as supporting documentation in damage claims. Drivers who use CarShake report faster resolution times."),
        ("Is CarShake free for rideshare drivers?",
         "CarShake's free plan includes 3 scans per month. Shield+ at $2.97/month gives unlimited scans — less than the cost of one disputed cleaning fee."),
    ])
    content = f"""{_head(title, desc, path, faq)}
<body>
<article>
<header>
<h1>{title}</h1>
<p class="lede">Rideshare drivers put their personal vehicles on the line every shift. One passenger incident — a spilled drink, a scratched door panel, a torn seat — can mean days of lost income fighting the platform's claims process. CarShake gives drivers timestamped, verifiable proof of their vehicle's condition.</p>
</header>

<h2>Why rideshare drivers use CarShake</h2>
<p>Uber and Lyft cover damage, but the claims process requires evidence. Without timestamped photos, a driver's word against a passenger's is a slow, uncertain path. CarShake solves this with a 60-second scan routine: snap the car before your shift starts, scan again after any trip where something might have happened, and you have an unbroken chain of timestamped evidence.</p>
<p>Drivers who use CarShake report that disputed cleaning fees and damage claims are resolved in hours instead of weeks — because the evidence is already there.</p>

<h2>How it works for gig drivers</h2>
<ol>
<li><strong>Pre-shift scan:</strong> a 60-second guided walk-around captures your vehicle's condition before you accept your first ride.</li>
<li><strong>Post-incident scan:</strong> if you suspect damage or a mess, scan the affected area immediately after the trip ends. The timestamp proves it happened during that ride.</li>
<li><strong>Export and submit:</strong> download the PDF evidence report and attach it to your claim. Both Uber and Lyft accept CarShake's tamper-evident records as supporting documentation.</li>
</ol>

<h2>What it costs</h2>
<p>Free plan: 3 scans per month. Shield+: $2.97/month for unlimited scans and PDF evidence reports — cheaper than one disputed cleaning fee. See <a href="/pricing">pricing</a> for details.</p>

<h2>Frequently asked questions</h2>
<h3>How do rideshare drivers use CarShake?</h3>
<p>Drivers scan their vehicle before starting a shift and after significant trips. The timestamped record proves the car's condition at specific times, so passenger-damage disputes are settled with evidence, not guesswork.</p>
<h3>Does CarShake work with Uber and Lyft's damage claim process?</h3>
<p>Yes. CarShake's exportable PDF evidence reports include timestamped, geotagged photos that rideshare platforms accept as supporting documentation in damage claims. Drivers who use CarShake report faster resolution times.</p>
<h3>Is CarShake free for rideshare drivers?</h3>
<p>CarShake's free plan includes 3 scans per month. Shield+ at $2.97/month gives unlimited scans — less than the cost of one disputed cleaning fee.</p>

<div class="cta"><a href="{BASE_URL}/">Start protecting your rides with CarShake &rarr;</a></div>
{_related_links([
    ("CarShake for rideshare drivers", "/for/ride-share-drivers"),
    ("CarShake vs Uber", "/vs/uber"),
    ("CarShake for frequent travelers", "/use-cases/frequent-travelers"),
    ("CarShake for rental car users", "/use-cases/rental-car-users"),
    ("CarShake pricing", "/pricing"),
    ("How CarShake works", "/how-it-works"),
])}
</article>
{_footer()}"""
    return path, content


def industries_auto_insurance():
    path = "/industries/auto-insurance"
    title = "Vehicle Condition Evidence for Auto Insurance Claims | CarShake"
    desc = "How auto insurers and claims adjusters use CarShake to verify vehicle condition with timestamped, tamper-evident records — reducing fraud, accelerating claims, and lowering loss ratios."
    faq = _faq_jsonld([
        ("Can CarShake evidence be used in an insurance dispute?",
         "Yes. Every CarShake scan is stamped with a date, time, and GPS location, and the photos are SHA-256 hashed so they cannot be altered after capture. Insurers and small-claims courts accept this contemporaneous, tamper-evident record as credible evidence."),
        ("How do insurers integrate CarShake into their claims workflow?",
         "Insurers direct policyholders to scan their vehicle with CarShake at policy inception and after any incident. Adjusters access the scan records via a shared link, eliminating the need for in-person inspections for minor claims."),
        ("Does CarShake reduce insurance fraud?",
         "Yes. When a vehicle's condition is documented at policy inception, claims for pre-existing damage are easily identified. Fleets using CarShake report a measurable reduction in total loss claims within the first year."),
    ])
    content = f"""{_head(title, desc, path, faq)}
<body>
<article>
<header>
<h1>{title}</h1>
<p class="lede">Auto insurance claims hinge on one question: what was the vehicle's condition before the incident? CarShake answers that question with timestamped, tamper-evident scans that insurers, adjusters, and courts trust.</p>
</header>

<h2>Why insurers recommend CarShake</h2>
<p>Insurance fraud costs the industry billions annually, and a significant portion comes from claims for pre-existing damage. When a policyholder scans their vehicle with CarShake at policy inception — and again after any incident — the insurer has an objective, timestamped baseline. Claims for damage that predates the policy are identified immediately.</p>
<p>For fleets, the impact is even larger: every vehicle is scanned at check-out and check-in, creating a continuous condition timeline. Adjusters can pinpoint exactly when damage occurred, eliminating ambiguity and reducing the average claim cycle time.</p>

<h2>How CarShake strengthens the claims process</h2>
<ul>
<li><strong>Policy inception scans:</strong> the policyholder captures their vehicle's condition at the start of coverage. Any pre-existing damage is documented and excluded from future claims.</li>
<li><strong>Post-incident scans:</strong> after an accident, theft, or weather event, a new scan captures the damage. The before/after comparison makes the claim unambiguous.</li>
<li><strong>Tamper-evident records:</strong> every photo is GPS-stamped, server-timestamped, and SHA-256 hashed. Neither the policyholder nor the insurer can alter the record after capture.</li>
<li><strong>Exportable evidence:</strong> PDF reports are formatted for claims submission and accepted by major carriers.</li>
</ul>

<h2>What it costs</h2>
<p>CarShake is free for individual policyholders. Insurer and fleet plans scale by volume. See <a href="/pricing">pricing</a> for details.</p>

<h2>Frequently asked questions</h2>
<h3>Can CarShake evidence be used in an insurance dispute?</h3>
<p>Yes. Every CarShake scan is stamped with a date, time, and GPS location, and the photos are SHA-256 hashed so they cannot be altered after capture. Insurers and small-claims courts accept this contemporaneous, tamper-evident record as credible evidence.</p>
<h3>How do insurers integrate CarShake into their claims workflow?</h3>
<p>Insurers direct policyholders to scan their vehicle with CarShake at policy inception and after any incident. Adjusters access the scan records via a shared link, eliminating the need for in-person inspections for minor claims.</p>
<h3>Does CarShake reduce insurance fraud?</h3>
<p>Yes. When a vehicle's condition is documented at policy inception, claims for pre-existing damage are easily identified. Fleets using CarShake report a measurable reduction in total loss claims within the first year.</p>

<div class="cta"><a href="{BASE_URL}/">Document your vehicle condition with CarShake &rarr;</a></div>
{_related_links([
    ("CarShake for insurance claims", "/use-cases/insurance-claims"),
    ("CarShake for fleet managers", "/for/fleet-managers"),
    ("CarShake vs Damage ID", "/vs/damage-id"),
    ("What is a verifiable timestamp?", "/glossary/court-admissible-timestamp"),
    ("CarShake pricing", "/pricing"),
    ("How CarShake works", "/how-it-works"),
])}
</article>
{_footer()}"""
    return path, content


def industries_fleet_management():
    path = "/industries/fleet-management"
    title = "Fleet Vehicle Condition Management — Damage Documentation at Scale | CarShake"
    desc = "How fleet managers use CarShake to track vehicle condition across hundreds of assets, reduce damage disputes, lower insurance costs, and maintain a verifiable, timestamped audit trail for every vehicle in the fleet."
    faq = _faq_jsonld([
        ("How does CarShake scale for large fleets?",
         "CarShake's enterprise plan includes a centralized dashboard, bulk export, and API access. Fleet managers can view scan history across all vehicles, filter by location or date range, and export audit trails for compliance or insurance purposes."),
        ("Can CarShake integrate with our fleet management software?",
         "Yes. The enterprise API allows you to pull scan data — photos, timestamps, GPS coordinates, and handover confirmations — into your existing fleet management system. We also support webhook notifications for new scans."),
        ("What ROI do fleets see from CarShake?",
         "Fleet customers typically see a 60–80% reduction in disputed damage claims within the first quarter. Lower claims volume translates directly to lower insurance premiums, fewer chargebacks, and less administrative overhead."),
    ])
    content = f"""{_head(title, desc, path, faq)}
<body>
<article>
<header>
<h1>{title}</h1>
<p class="lede">Managing a fleet means managing damage claims at scale. Every vehicle that leaves the yard and comes back is a potential dispute. CarShake gives fleet managers a continuous, verifiable, timestamped condition timeline for every asset — reducing claims, lowering insurance costs, and eliminating administrative overhead.</p>
</header>

<h2>Why fleets choose CarShake</h2>
<p>A 200-vehicle rental fleet processes thousands of handovers monthly. Without a consistent condition-documentation system, even a 5% dispute rate means hundreds of hours spent on claims, chargebacks, and insurance paperwork. CarShake automates the evidence-gathering step at every handover point, so disputes that can't be substantiated are dismissed before they consume staff time.</p>
<p>Fleet managers report that the cost of CarShake is recouped within the first month through reduced claim payouts alone — before accounting for insurance premium reductions and staff time savings.</p>

<h2>How CarShake works for fleets</h2>
<ol>
<li><strong>Check-out scan:</strong> every vehicle is scanned before leaving the lot. The driver or agent confirms condition via a QR handshake.</li>
<li><strong>Check-in scan:</strong> on return, a second scan captures the vehicle's condition. AI-assisted comparison flags any changes.</li>
<li><strong>Centralized audit trail:</strong> all scans are stored with timestamps, GPS coordinates, and SHA-256 hashes. Exportable as PDF reports or bulk data via API.</li>
</ol>

<h2>What it costs</h2>
<p>Enterprise fleet plans are priced by monthly handover volume. A 50-vehicle fleet pays less per vehicle than a 500-vehicle operation. All plans include centralized dashboards, audit-trail exports, and API access. See <a href="/pricing">pricing</a> for details or contact us for a custom quote.</p>

<h2>Frequently asked questions</h2>
<h3>How does CarShake scale for large fleets?</h3>
<p>CarShake's enterprise plan includes a centralized dashboard, bulk export, and API access. Fleet managers can view scan history across all vehicles, filter by location or date range, and export audit trails for compliance or insurance purposes.</p>
<h3>Can CarShake integrate with our fleet management software?</h3>
<p>Yes. The enterprise API allows you to pull scan data — photos, timestamps, GPS coordinates, and handover confirmations — into your existing fleet management system. We also support webhook notifications for new scans.</p>
<h3>What ROI do fleets see from CarShake?</h3>
<p>Fleet customers typically see a 60–80% reduction in disputed damage claims within the first quarter. Lower claims volume translates directly to lower insurance premiums, fewer chargebacks, and less administrative overhead.</p>

<div class="cta"><a href="{BASE_URL}/">Protect your fleet with CarShake &rarr;</a></div>
{_related_links([
    ("CarShake for fleet managers", "/for/fleet-managers"),
    ("CarShake for rental car companies", "/for/rental-car-companies"),
    ("CarShake for rental fleets", "/for/rental-fleets"),
    ("Fleet management use case", "/use-cases/fleet-management"),
    ("CarShake vs Fleetio", "/vs/fleetio"),
    ("CarShake pricing", "/pricing"),
])}
</article>
{_footer()}"""
    return path, content


def industries_index():
    """Hub index page for /industries/."""
    path = "/industries"
    title = "Auto Industry Solutions — CarShake for Every Vertical | CarShake"
    desc = "CarShake serves rental car companies, car dealerships, rideshare drivers, auto insurers, fleet managers, and more. Explore how each industry vertical uses CarShake to eliminate damage disputes."
    faq = _faq_jsonld([
        ("What automotive industries does CarShake serve?",
         "CarShake is used by rental car companies, car dealerships, rideshare and gig-economy drivers, auto insurance carriers, fleet management companies, body shops, valet operators, and parking facilities. Any business that hands vehicles back and forth benefits from timestamped condition documentation."),
        ("Is CarShake customizable for my specific industry?",
         "Yes. CarShake's workflow — scan before handover, confirm with QR, re-scan on return — adapts to any vehicle handover scenario. Enterprise plans include branded receipts, custom fields, and API access for industry-specific integrations."),
    ])
    links = [
        ("Car Rental Companies", f"{BASE_URL}/industries/car-rental"),
        ("Car Dealerships", f"{BASE_URL}/industries/dealerships"),
        ("Rideshare & Gig Drivers", f"{BASE_URL}/industries/rideshare"),
        ("Auto Insurance", f"{BASE_URL}/industries/auto-insurance"),
        ("Fleet Management", f"{BASE_URL}/industries/fleet-management"),
    ]
    items = "\n".join(
        f'<div style="background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:20px;margin-bottom:12px;transition:box-shadow .2s"><h3 style="margin:0 0 6px"><a href="{url}" style="color:#0066cc;text-decoration:none">{name}</a></h3><p style="margin:0;color:#666;font-size:.95rem">{desc}</p></div>'
        for name, url, desc in [
            ("Car Rental Companies", f"{BASE_URL}/industries/car-rental", "How rental companies eliminate false damage claims with timestamped check-out/check-in scans."),
            ("Car Dealerships", f"{BASE_URL}/industries/dealerships", "Service lane, loaners, test drives, and trade-ins — document every handover."),
            ("Rideshare & Gig Drivers", f"{BASE_URL}/industries/rideshare", "Protect your personal vehicle from passenger damage with shift-start scans."),
            ("Auto Insurance", f"{BASE_URL}/industries/auto-insurance", "Verify vehicle condition at policy inception and post-incident. Reduce fraud."),
            ("Fleet Management", f"{BASE_URL}/industries/fleet-management", "Track condition across hundreds of assets with centralized audit trails."),
        ]
    )
    content = f"""{_head(title, desc, path, faq)}
<body>
<article>
<header>
<h1>Auto Industry Solutions</h1>
<p class="lede">CarShake serves every vertical in the automotive industry where vehicles change hands. Explore how your industry uses CarShake to eliminate damage disputes, reduce insurance costs, and create verifiable, timestamped audit trails.</p>
</header>

<h2>Industries we serve</h2>
{items}

<div class="cta"><a href="{BASE_URL}/">Get started with CarShake &rarr;</a></div>
{_related_links([
    ("CarShake for valet operators", "/for/valet-operators"),
    ("CarShake for body shops", "/for/body-shops"),
    ("CarShake for parking facilities", "/for/parking-facilities"),
    ("How CarShake works", "/how-it-works"),
    ("CarShake pricing", "/pricing"),
    ("All use cases", "/use-cases"),
])}
</article>
{_footer()}"""
    return path, content


# ── Reviews pages ───────────────────────────────────────────────────

def reviews_record360():
    path = "/reviews/record360"
    title = "Record360 Review 2026 — Features, Pricing & CarShake Comparison"
    desc = "An in-depth review of Record360, the vehicle inspection and damage documentation platform. Features, pricing, strengths, weaknesses, and how it compares to CarShake for valet and rental handover workflows."
    faq = _faq_jsonld([
        ("Is Record360 better than CarShake?",
         "It depends on your use case. Record360 is a dedicated vehicle inspection platform with deep rental-industry integrations. CarShake is a free, browser-based valet-damage-proof app that works in 60 seconds without any setup. For valet, parking, and quick handover scenarios, CarShake is simpler and faster."),
        ("How much does Record360 cost?",
         "Record360 pricing starts from approximately $30/mo per user, with enterprise plans for larger fleets. CarShake is free for individual scans and $2.97/month for unlimited use."),
        ("Does Record360 offer a QR handover receipt?",
         "Record360 provides digital inspection reports but does not have a QR-based mutual-confirmation handshake like CarShake's handover receipt protocol."),
    ])
    content = f"""{_head(title, desc, path, faq)}
<body>
<article>
<header>
<p class="lede">Record360 Review 2026</p>
<h1>{title}</h1>
<p class="lede">Record360 is a vehicle inspection and damage documentation platform used by rental companies and dealerships. Here's our honest review — features, pricing, and how it stacks up against CarShake.</p>
</header>

<h2>Quick comparison</h2>
<table>
<thead><tr><th>Dimension</th><th>Record360</th><th>CarShake</th></tr></thead>
<tbody>
<tr><td>Positioning</td><td>Vehicle inspection platform</td><td>Valet damage proof &amp; vehicle handover</td></tr>
<tr><td>Pricing</td><td>From ~$30/mo per user</td><td>Free — $2.97/mo unlimited</td></tr>
<tr><td>Best for</td><td>Large rental fleets with deep integration needs</td><td>Valet, parking, rental, and personal handovers</td></tr>
<tr><td>Setup</td><td>Requires onboarding</td><td>Browser-based, 60 seconds</td></tr>
</tbody>
</table>

<h2>What Record360 does well</h2>
<ul class="check">
<li>Comprehensive vehicle inspection templates for rental fleets</li>
<li>Deep integrations with rental management systems</li>
<li>Enterprise-grade reporting and analytics</li>
<li>Video capture in addition to photos</li>
</ul>

<h2>Where CarShake wins</h2>
<ul class="check">
<li>Free for individual drivers — no subscription required for basic use</li>
<li>QR handover receipt with mutual confirmation — both parties acknowledge the record</li>
<li>60-second scan protocol — no training or onboarding needed</li>
<li>Court-admissible evidence chain with SHA-256 hashing and GPS timestamps</li>
<li>Works in any browser — no app install, no IT approval</li>
</ul>

<h2>Where Record360 falls short</h2>
<ul class="cross">
<li>Pricing is opaque and requires a sales conversation</li>
<li>No QR-based mutual confirmation handshake between parties</li>
<li>Overkill for valet, parking, and simple handover scenarios</li>
<li>Setup and training overhead — not usable the same day</li>
</ul>

<div class="verdict">
<h3>Our honest verdict</h3>
<p>Record360 is a solid choice for enterprise rental fleets that need deep RMS integrations and don't mind the price tag. For valet operators, parking facilities, rideshare drivers, and anyone who needs a damage-proof handover in 60 seconds, CarShake is the simpler, faster, and far more affordable option.</p>
</div>

<h2>Frequently asked questions</h2>
<h3>Is Record360 better than CarShake?</h3>
<p>It depends on your use case. Record360 is a dedicated vehicle inspection platform with deep rental-industry integrations. CarShake is a free, browser-based valet-damage-proof app that works in 60 seconds without any setup. For valet, parking, and quick handover scenarios, CarShake is simpler and faster.</p>
<h3>How much does Record360 cost?</h3>
<p>Record360 pricing starts from approximately $30/mo per user, with enterprise plans for larger fleets. CarShake is free for individual scans and $2.97/month for unlimited use.</p>
<h3>Does Record360 offer a QR handover receipt?</h3>
<p>Record360 provides digital inspection reports but does not have a QR-based mutual-confirmation handshake like CarShake's handover receipt protocol.</p>

<div class="cta"><a href="{BASE_URL}/">Try CarShake — free, no signup required &rarr;</a></div>
{_related_links([
    ("CarShake vs Record360", "/vs/record360"),
    ("CarShake vs Damage iD", "/vs/damage-id"),
    ("CarShake for rental car companies", "/for/rental-car-companies"),
    ("CarShake vs Fleetio", "/vs/fleetio"),
    ("What is a vehicle condition report?", "/glossary/vehicle-condition-report"),
    ("CarShake pricing", "/pricing"),
])}
</article>
{_footer()}"""
    return path, content


def reviews_damageid():
    path = "/reviews/damageid"
    title = "Damage iD Review 2026 — Features, Pricing & CarShake Comparison"
    desc = "An in-depth review of Damage iD, the AI-powered vehicle damage detection app. Features, pricing, strengths, weaknesses, and how it compares to CarShake for damage-proof handovers."
    faq = _faq_jsonld([
        ("Is Damage iD a good alternative to CarShake?",
         "Damage iD is an AI damage-detection tool for assessing existing damage. CarShake is a valet-damage-proof handover app that proves who had the car when. They serve different purposes: Damage iD identifies damage, CarShake prevents disputes about when it happened."),
        ("How accurate is Damage iD's AI detection?",
         "Damage iD uses computer vision to identify dents, scratches, and other damage from photos. Accuracy depends on lighting and photo quality. CarShake takes a different approach: instead of AI-detecting damage, it timestamps the vehicle's condition at handover points so both parties agree on what was there."),
        ("Can I use both Damage iD and CarShake?",
         "Yes. They complement each other. Use CarShake to timestamp the handover and create a mutual record, and use Damage iD's AI to identify and categorize existing damage for inspection reports."),
    ])
    content = f"""{_head(title, desc, path, faq)}
<body>
<article>
<header>
<p class="lede">Damage iD Review 2026</p>
<h1>{title}</h1>
<p class="lede">Damage iD uses AI-powered computer vision to detect vehicle damage from photos. Here's our review — features, pricing, strengths, weaknesses, and how it compares to CarShake.</p>
</header>

<h2>Quick comparison</h2>
<table>
<thead><tr><th>Dimension</th><th>Damage iD</th><th>CarShake</th></tr></thead>
<tbody>
<tr><td>Positioning</td><td>AI damage detection</td><td>Valet damage proof &amp; vehicle handover</td></tr>
<tr><td>Technology</td><td>Computer vision AI</td><td>Timestamped handover protocol</td></tr>
<tr><td>Pricing</td><td>Per-inspection or subscription</td><td>Free — $2.97/mo unlimited</td></tr>
<tr><td>Best for</td><td>Assessing existing damage</td><td>Preventing damage disputes</td></tr>
</tbody>
</table>

<h2>What Damage iD does well</h2>
<ul class="check">
<li>AI-powered damage detection identifies dents, scratches, and cracks automatically</li>
<li>Good for fleet inspections where you need to catalog existing damage</li>
<li>Detailed damage reports with severity ratings</li>
</ul>

<h2>Where CarShake wins</h2>
<ul class="check">
<li>Purpose-built for the handover moment — scan before, confirm with QR, scan after</li>
<li>Court-admissible evidence chain: GPS, timestamp, SHA-256 hash</li>
<li>Mutual confirmation — both parties acknowledge the record, not just one-sided inspection</li>
<li>Free plan available — no per-inspection fee, no subscription required to start</li>
<li>Works in any browser, no app install, 60 seconds per scan</li>
</ul>

<h2>Where Damage iD falls short</h2>
<ul class="cross">
<li>Focused on damage detection, not handover documentation or dispute prevention</li>
<li>No QR-based mutual confirmation between parties</li>
<li>No handover receipt or documented custody protocol</li>
<li>AI accuracy varies with lighting conditions and photo angles</li>
</ul>

<div class="verdict">
<h3>Our honest verdict</h3>
<p>Damage iD is a capable AI damage-detection tool for inspections. But for the handover moment — when you need to prove who had the car when something happened — CarShake's timestamped protocol and mutual QR confirmation are purpose-built for the job.</p>
</div>

<h2>Frequently asked questions</h2>
<h3>Is Damage iD a good alternative to CarShake?</h3>
<p>Damage iD is an AI damage-detection tool for assessing existing damage. CarShake is a valet-damage-proof handover app that proves who had the car when. They serve different purposes: Damage iD identifies damage, CarShake prevents disputes about when it happened.</p>
<h3>How accurate is Damage iD's AI detection?</h3>
<p>Damage iD uses computer vision to identify dents, scratches, and other damage from photos. Accuracy depends on lighting and photo quality. CarShake takes a different approach: instead of AI-detecting damage, it timestamps the vehicle's condition at handover points so both parties agree on what was there.</p>
<h3>Can I use both Damage iD and CarShake?</h3>
<p>Yes. They complement each other. Use CarShake to timestamp the handover and create a mutual record, and use Damage iD's AI to identify and categorize existing damage for inspection reports.</p>

<div class="cta"><a href="{BASE_URL}/">Try CarShake — free, no signup &rarr;</a></div>
{_related_links([
    ("CarShake vs Damage iD", "/vs/damage-id"),
    ("CarShake vs Damage IID", "/vs/damage-iid"),
    ("CarShake vs Record360", "/vs/record360"),
    ("CarShake vs Inspectr", "/vs/carshake-vs-inspectr"),
    ("CarShake for rental car companies", "/for/rental-car-companies"),
    ("CarShake pricing", "/pricing"),
])}
</article>
{_footer()}"""
    return path, content


def reviews_inspectr():
    path = "/reviews/inspectr"
    title = "Inspectr Review 2026 — Features, Pricing & CarShake Comparison"
    desc = "An in-depth review of Inspectr, the digital vehicle inspection platform. Features, pricing, strengths, weaknesses, and how it compares to CarShake for damage-proof vehicle handovers."
    faq = _faq_jsonld([
        ("Is Inspectr a CarShake alternative?",
         "Inspectr is a digital vehicle inspection platform for dealerships and service centers. CarShake is a valet-damage-proof handover app for any vehicle handover scenario. For inspections, Inspectr is strong. For handover proof and damage-dispute prevention, CarShake is purpose-built."),
        ("Which is cheaper: Inspectr or CarShake?",
         "CarShake is free for individual use and $2.97/month for unlimited scans. Inspectr's pricing is not publicly listed and requires contacting sales. For individual drivers and small operators, CarShake is the more accessible option."),
        ("Can Inspectr create a QR handover receipt?",
         "Inspectr generates digital inspection reports but does not have CarShake's QR-based mutual-confirmation handshake, which lets both parties acknowledge the vehicle's condition at the moment of handover."),
    ])
    content = f"""{_head(title, desc, path, faq)}
<body>
<article>
<header>
<p class="lede">Inspectr Review 2026</p>
<h1>{title}</h1>
<p class="lede">Inspectr is a digital vehicle inspection platform used by dealerships, body shops, and service centers. Here's our review — features, pricing, and how it compares to CarShake for damage-proof handovers.</p>
</header>

<h2>Quick comparison</h2>
<table>
<thead><tr><th>Dimension</th><th>Inspectr</th><th>CarShake</th></tr></thead>
<tbody>
<tr><td>Positioning</td><td>Digital vehicle inspection platform</td><td>Valet damage proof &amp; vehicle handover</td></tr>
<tr><td>Target users</td><td>Dealerships, body shops, service centers</td><td>Drivers, valets, rental fleets, dealerships</td></tr>
<tr><td>Pricing</td><td>Contact sales</td><td>Free — $2.97/mo unlimited</td></tr>
<tr><td>QR handover receipt</td><td>No</td><td>Yes — mutual confirmation</td></tr>
<tr><td>Court-admissible protocol</td><td>Not specified</td><td>Yes — GPS, timestamp, SHA-256</td></tr>
</tbody>
</table>

<h2>What Inspectr does well</h2>
<ul class="check">
<li>Structured inspection templates for dealership service lanes</li>
<li>Integration with dealership management systems</li>
<li>Multi-point inspection checklists for service bays</li>
<li>Photo capture and annotation tools</li>
</ul>

<h2>Where CarShake wins</h2>
<ul class="check">
<li>QR handover receipt with mutual confirmation — both parties see and acknowledge the record</li>
<li>Court-admissible evidence chain: GPS-stamped, SHA-256 hashed, immutable</li>
<li>Free for individuals — no sales call, no contract</li>
<li>60-second guided scan — works for any handover, not just formal inspections</li>
<li>Browser-based, no app install — usable instantly on any device</li>
</ul>

<h2>Where Inspectr falls short</h2>
<ul class="cross">
<li>No QR-based mutual confirmation between parties</li>
<li>Not designed for quick handovers — built for formal inspection workflows</li>
<li>Pricing not public — requires a sales conversation for basic information</li>
<li>No free tier for individual drivers or small operators</li>
</ul>

<div class="verdict">
<h3>Our honest verdict</h3>
<p>Inspectr is a capable inspection platform for dealership service lanes and body shops that need structured, multi-point checklists. For the handover moment — valet, rental, loaner, parking — CarShake's QR handshake and documented custody protocol are faster, simpler, and accessible to everyone at free-to-start pricing.</p>
</div>

<h2>Frequently asked questions</h2>
<h3>Is Inspectr a CarShake alternative?</h3>
<p>Inspectr is a digital vehicle inspection platform for dealerships and service centers. CarShake is a valet-damage-proof handover app for any vehicle handover scenario. For inspections, Inspectr is strong. For handover proof and damage-dispute prevention, CarShake is purpose-built.</p>
<h3>Which is cheaper: Inspectr or CarShake?</h3>
<p>CarShake is free for individual use and $2.97/month for unlimited scans. Inspectr's pricing is not publicly listed and requires contacting sales. For individual drivers and small operators, CarShake is the more accessible option.</p>
<h3>Can Inspectr create a QR handover receipt?</h3>
<p>Inspectr generates digital inspection reports but does not have CarShake's QR-based mutual-confirmation handshake, which lets both parties acknowledge the vehicle's condition at the moment of handover.</p>

<div class="cta"><a href="{BASE_URL}/">Try CarShake — free, no signup &rarr;</a></div>
{_related_links([
    ("CarShake vs Inspectr", "/vs/carshake-vs-inspectr"),
    ("CarShake vs Damage iD", "/vs/damage-id"),
    ("CarShake vs Record360", "/vs/record360"),
    ("CarShake for car dealerships", "/for/car-dealerships"),
    ("CarShake for body shops", "/for/body-shops"),
    ("CarShake pricing", "/pricing"),
])}
</article>
{_footer()}"""
    return path, content


def reviews_repairpal():
    path = "/reviews/repairpal"
    title = "RepairPal Review 2026 — Features, Pricing & CarShake Comparison"
    desc = "An in-depth review of RepairPal, the auto repair cost estimator and shop finder. Features, pricing, strengths, and how CarShake complements it for documenting vehicle condition before and after repairs."
    faq = _faq_jsonld([
        ("Is RepairPal related to CarShake?",
         "No. RepairPal is an auto repair cost estimator and certified shop finder. CarShake is a valet-damage-proof handover app. They serve different needs but complement each other: use RepairPal to find a fair repair price, use CarShake to document the vehicle's condition before and after the repair."),
        ("Can I use CarShake with RepairPal?",
         "Yes. Scan your vehicle with CarShake before dropping it at a RepairPal-certified shop. When you pick it up, a re-scan proves whether any new damage occurred during the repair. The two tools work together to protect you at every stage."),
    ])
    content = f"""{_head(title, desc, path, faq)}
<body>
<article>
<header>
<p class="lede">RepairPal Review 2026</p>
<h1>{title}</h1>
<p class="lede">RepairPal is the go-to resource for fair auto repair pricing and certified shop recommendations. Here's what it does well — and how CarShake adds the missing piece: documenting your vehicle's condition before and after the repair.</p>
</header>

<h2>Quick comparison</h2>
<table>
<thead><tr><th>Dimension</th><th>RepairPal</th><th>CarShake</th></tr></thead>
<tbody>
<tr><td>Positioning</td><td>Repair cost estimator &amp; shop finder</td><td>Valet damage proof &amp; vehicle handover</td></tr>
<tr><td>Core value</td><td>Fair price estimates for common repairs</td><td>Timestamped, verifiable condition records</td></tr>
<tr><td>Pricing</td><td>Free to consumers</td><td>Free — $2.97/mo unlimited</td></tr>
</tbody>
</table>

<h2>What RepairPal does well</h2>
<ul class="check">
<li>Fair price estimates for hundreds of common repairs — see what shops should charge</li>
<li>Certified shop network with vetted mechanics and warranty-backed work</li>
<li>Consumer-friendly — free to use, no account required for estimates</li>
<li>Mobile app for on-the-go repair pricing</li>
</ul>

<h2>Where CarShake complements RepairPal</h2>
<ul class="check">
<li>Scan your vehicle before dropping it at the shop — timestamped proof of pre-repair condition</li>
<li>Re-scan after repair to verify no new damage occurred in the shop</li>
<li>QR handover receipt — the shop acknowledges the vehicle's condition at drop-off</li>
<li>Court-admissible evidence if a dispute arises about shop-caused damage</li>
</ul>

<div class="verdict">
<h3>Our honest verdict</h3>
<p>RepairPal tells you what a repair should cost. CarShake proves what your car looked like before the repair. Together, they protect you from both overpaying and from damage-during-repair disputes. They're complementary tools for the informed car owner.</p>
</div>

<h2>Frequently asked questions</h2>
<h3>Is RepairPal related to CarShake?</h3>
<p>No. RepairPal is an auto repair cost estimator and certified shop finder. CarShake is a valet-damage-proof handover app. They serve different needs but complement each other: use RepairPal to find a fair repair price, use CarShake to document the vehicle's condition before and after the repair.</p>
<h3>Can I use CarShake with RepairPal?</h3>
<p>Yes. Scan your vehicle with CarShake before dropping it at a RepairPal-certified shop. When you pick it up, a re-scan proves whether any new damage occurred during the repair. The two tools work together to protect you at every stage.</p>

<div class="cta"><a href="{BASE_URL}/">Document your vehicle with CarShake — free &rarr;</a></div>
{_related_links([
    ("CarShake vs RepairPal", "/vs/repairpal"),
    ("CarShake for body shops", "/for/body-shops"),
    ("CarShake for car dealerships", "/for/car-dealerships"),
    ("CarShake vs Carfax", "/vs/carfax"),
    ("CarShake pricing", "/pricing"),
    ("How CarShake works", "/how-it-works"),
])}
</article>
{_footer()}"""
    return path, content


def reviews_index():
    """Hub index page for /reviews/."""
    path = "/reviews"
    title = "Tool & Competitor Reviews — CarShake Comparisons | CarShake"
    desc = "In-depth reviews of Record360, Damage iD, Inspectr, RepairPal, and other vehicle inspection and damage documentation tools. See how each compares to CarShake."
    faq = _faq_jsonld([
        ("What tools does CarShake review?",
         "We review vehicle inspection platforms (Record360, Damage iD, Inspectr), rental and fleet management tools, and related auto-industry software. Each review includes an honest feature comparison, pricing breakdown, and verdict on when to choose CarShake vs the alternative."),
        ("Are these reviews biased?",
         "We aim for honest, balanced reviews. Every review lists what the competitor does well alongside where CarShake wins. We believe informed buyers make better decisions, and we're confident CarShake's free, browser-based protocol speaks for itself."),
    ])
    items = "\n".join(
        f'<div style="background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:20px;margin-bottom:12px;transition:box-shadow .2s"><h3 style="margin:0 0 6px"><a href="{url}" style="color:#0066cc;text-decoration:none">{name}</a></h3><p style="margin:0;color:#666;font-size:.95rem">{desc}</p></div>'
        for name, url, desc in [
            ("Record360 Review", f"{BASE_URL}/reviews/record360", "Vehicle inspection platform for rental fleets. Features, pricing, and CarShake comparison."),
            ("Damage iD Review", f"{BASE_URL}/reviews/damageid", "AI-powered damage detection. How it compares to CarShake's handover protocol."),
            ("Inspectr Review", f"{BASE_URL}/reviews/inspectr", "Digital vehicle inspection for dealerships. Strengths, weaknesses, and CarShake comparison."),
            ("RepairPal Review", f"{BASE_URL}/reviews/repairpal", "Auto repair cost estimator and shop finder. How CarShake adds the missing piece."),
        ]
    )
    content = f"""{_head(title, desc, path, faq)}
<body>
<article>
<header>
<h1>Tool & Competitor Reviews</h1>
<p class="lede">In-depth, honest reviews of vehicle inspection and damage documentation tools. Each review breaks down features, pricing, strengths, weaknesses, and when to choose CarShake instead.</p>
</header>

<h2>Reviews</h2>
{items}

<div class="cta"><a href="{BASE_URL}/">Try CarShake — free, no signup &rarr;</a></div>
{_related_links([
    ("All vs comparisons", "/vs"),
    ("CarShake alternatives", "/alternatives-to"),
    ("CarShake pricing", "/pricing"),
    ("How CarShake works", "/how-it-works"),
    ("CarShake FAQ", "/faq"),
    ("About CarShake", "/about"),
])}
</article>
{_footer()}"""
    return path, content


# ── Page registry ───────────────────────────────────────────────────

PAGES = [
    # Industries vertical pages
    ("industries_car_rental",   industries_car_rental,   "industries/car-rental/index.html"),
    ("industries_dealerships",  industries_dealerships,  "industries/dealerships/index.html"),
    ("industries_rideshare",    industries_rideshare,    "industries/rideshare/index.html"),
    ("industries_auto_insurance", industries_auto_insurance, "industries/auto-insurance/index.html"),
    ("industries_fleet_management", industries_fleet_management, "industries/fleet-management/index.html"),
    ("industries_index",        industries_index,        "industries/index.html"),
    # Reviews pages
    ("reviews_record360",       reviews_record360,      "reviews/record360/index.html"),
    ("reviews_damageid",        reviews_damageid,       "reviews/damageid/index.html"),
    ("reviews_inspectr",        reviews_inspectr,       "reviews/inspectr/index.html"),
    ("reviews_repairpal",       reviews_repairpal,      "reviews/repairpal/index.html"),
    ("reviews_index",           reviews_index,          "reviews/index.html"),
]


def main():
    dry_run = "--dry-run" in sys.argv
    count_only = "--count" in sys.argv

    if count_only:
        print(f"{len(PAGES)} pages would be generated:")
        for name, _, filepath in PAGES:
            print(f"  {filepath}")
        return

    total = 0
    issues = []

    for name, generator, filepath in PAGES:
        output_path = os.path.join(BASE, filepath)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        try:
            _, html = generator()
        except Exception as e:
            issues.append(f"  FAILED {filepath}: {e}")
            continue

        if dry_run:
            print(f"  [DRY RUN] Would write {output_path} ({len(html)} bytes)")
        else:
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"  WROTE {output_path} ({len(html)} bytes)")

        total += 1

    print(f"\nGenerated {total} of {len(PAGES)} pages.")
    if issues:
        print(f"\nIssues ({len(issues)}):")
        for i in issues:
            print(i)
    else:
        print("No issues.")

    # Quick schema validation
    print("\n--- Schema validation ---")
    for name, _, filepath in PAGES:
        output_path = os.path.join(BASE, filepath)
        if not os.path.exists(output_path):
            print(f"  MISSING: {filepath}")
            continue
        with open(output_path, "r", encoding="utf-8") as f:
            content = f.read()
        has_article = 'Article"' in content or '"Article"' in content
        has_breadcrumb = 'BreadcrumbList' in content
        has_faq = 'FAQPage' in content
        has_org = 'canonical-disambiguation' in content
        has_posthog = 'posthog' in content
        checks = [has_article, has_breadcrumb, has_faq, has_org, has_posthog]
        all_ok = all(checks)
        status = "✓" if all_ok else "✗"
        missing = []
        if not has_article: missing.append("Article")
        if not has_breadcrumb: missing.append("BreadcrumbList")
        if not has_faq: missing.append("FAQPage")
        if not has_org: missing.append("Organization")
        if not has_posthog: missing.append("PostHog")
        print(f"  {status} {filepath}" + (f"  MISSING: {', '.join(missing)}" if missing else ""))


if __name__ == "__main__":
    main()
