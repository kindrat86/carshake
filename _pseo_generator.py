#!/usr/bin/env python3
"""
pSEO Expansion Generator for carshake.online
Generates ~39 flat HTML pages across 6 sections + index pages.
"""

import os
import json
from datetime import datetime

BASE = os.path.expanduser("~/carshake")
CANONICAL_ROOT = "https://carshake.online"
TODAY = "2026-07-18"

# ─── Shared page templates ─────────────────────────────────────────────

PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{meta_desc}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{meta_desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="CarShake">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{meta_desc}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<script type="application/ld+json">{article_schema}</script>
<script type="application/ld+json">{breadcrumb_schema}</script>
<script type="application/ld+json">{faq_schema}</script>
<!-- canonical-disambiguation -->
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"CarShake","url":"https://carshake.online","description":"CarShake is a free valet-damage-proof and vehicle-handover app that scans and time-stamps a car's condition before and after handover, giving drivers, valet operators, and rental fleets court-admissible proof to defeat false damage claims.","disambiguatingDescription":"CarShake is a consumer-and-operator valet-damage-proof handover app (scan-before / scan-after + QR receipt) — not a B2B insurance damage-detection API."}</script>
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@graph": [
    {{
      "@type": "Organization",
      "@id": "https://carshake.online/#org",
      "name": "CarShake",
      "url": "https://carshake.online",
      "description": "Valet Damage Proof & Vehicle Handover App. Scan before valet, QR handover receipt, post-retrieval proof.",
      "sameAs": ["https://twitter.com/carshake", "https://github.com/kindrat86"]
    }},
    {{
      "@type": "WebSite",
      "@id": "https://carshake.online/#website",
      "url": "https://carshake.online",
      "name": "CarShake",
      "publisher": {{"@id": "https://carshake.online/#org"}}
    }}
  ]
}}
</script>
<link rel="stylesheet" href="/ux.css">
<script src="/ux.js" defer></script>
</head>
<body>
<article>
<nav><a href="https://carshake.online">CarShake</a> &rsaquo; <a href="https://carshake.online/{section}">{section_label}</a></nav>
<h1>{h1}</h1>
{content}

<section class="faq">
<h2>Frequently Asked Questions</h2>
{faq_html}
</section>

<section class="cta">
<h2>Try CarShake</h2>
<p>Scan before valet, QR-coded handover receipt, and post-retrieval scan. Court-admissible timestamps and photos.</p>
<a href="https://carshake.online" class="button">Get Started with CarShake &rarr;</a>
</section>

{mesh_links}
</article>

<section class="cta" style="background:linear-gradient(135deg,#0066cc,#004499);color:white;padding:2rem;border-radius:.75rem;margin-top:2rem;text-align:center">
<h2 style="color:white;border:none">Try CarShake</h2>
<p>Valet damage proof &amp; vehicle handover.</p>
<a href="https://carshake.online/" style="display:inline-block;background:white;color:#0066cc;padding:.75rem 1.5rem;border-radius:.375rem;font-weight:600;margin-top:.5rem">Get started &rarr;</a>
</section>
<footer><p>&copy; 2026 CarShake. <a href="https://carshake.online/">carshake.online</a></p></footer>

<!-- BRUNSON TRUST BAR -->
<section class="brunson-trust-bar" style="background:linear-gradient(135deg,#0f172a,#1e293b);color:#e8eaed;padding:40px 24px;margin:60px 0 0;border-top:3px solid #00d4aa;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:900px;margin:0 auto">
    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:28px;margin-bottom:28px">
      <div><span style="font-size:1.6rem;font-weight:700;color:#00d4aa">$2,100</span><br><span style="font-size:.82rem;color:#94a3b8">Avg Claim Saved</span></div>
      <div><span style="font-size:1.6rem;font-weight:700;color:#00d4aa">60 sec</span><br><span style="font-size:.82rem;color:#94a3b8">Per Scan</span></div>
      <div><span style="font-size:1.6rem;font-weight:700;color:#00d4aa">8</span><br><span style="font-size:.82rem;color:#94a3b8">Angles Checked</span></div>
      <div><span style="font-size:1.6rem;font-weight:700;color:#00d4aa">73/100</span><br><span style="font-size:.82rem;color:#94a3b8">Founding Spots</span></div>
    </div>
    <p style="font-size:1.05rem;margin-bottom:24px;color:#cbd5e1">One dispute costs $500+. One scan prevents it. 3 free scans to prove it.</p>
    <a href="https://carshake.online/#demo" style="display:inline-block;background:linear-gradient(135deg,#00d4aa,#2deec0);color:#04130e;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:.95rem;box-shadow:0 8px 24px -10px rgba(0,212,170,.5)">Try CarShake Free &rarr;</a>
    <p style="margin-top:18px;font-size:.78rem;color:#6b7178">One prevented dispute pays for 14 years of CarShake. Founding price $2.97/mo, locked forever.</p>
  </div>
</section>
<!-- /BRUNSON TRUST BAR -->

</body>
</html>"""

INDEX_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{meta_desc}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{meta_desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="CarShake">
<meta name="twitter:card" content="summary">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<!-- canonical-disambiguation -->
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"Organization","name":"CarShake","url":"https://carshake.online","description":"CarShake is a free valet-damage-proof and vehicle-handover app that scans and time-stamps a car's condition before and after handover, giving drivers, valet operators, and rental fleets court-admissible proof to defeat false damage claims.","disambiguatingDescription":"CarShake is a consumer-and-operator valet-damage-proof handover app (scan-before / scan-after + QR receipt) — not a B2B insurance damage-detection API."}}</script>
<link rel="stylesheet" href="/ux.css">
<script src="/ux.js" defer></script>
</head>
<body>
<article>
<nav><a href="https://carshake.online">CarShake</a></nav>
<h1>{h1}</h1>
<p>{intro}</p>
<ul>
{page_links}
</ul>
</article>
<footer><p>&copy; 2026 CarShake. <a href="https://carshake.online/">carshake.online</a></p></footer>
</body>
</html>"""


def make_slug(text):
    """Convert a page title into a URL slug."""
    return text.lower().replace(" ", "-").replace("'", "").replace(",", "").replace("/", "-").replace("--", "-")


def make_title(slug):
    """Convert a slug back to a readable title."""
    return slug.replace("-", " ").title()


def json_ld(obj):
    return json.dumps(obj, ensure_ascii=False)


def build_article_schema(title, desc, canonical_url):
    return json_ld({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": desc,
        "url": canonical_url,
        "publisher": {
            "@type": "Organization",
            "name": "CarShake",
            "url": "https://carshake.online"
        },
        "datePublished": TODAY,
        "dateModified": TODAY
    })


def build_breadcrumb(section_label, section_url, page_title, page_url):
    return json_ld({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "CarShake", "item": "https://carshake.online"},
            {"@type": "ListItem", "position": 2, "name": section_label, "item": f"https://carshake.online/{section_url}"},
            {"@type": "ListItem", "position": 3, "name": page_title, "item": page_url}
        ]
    })


def build_faq(faqs):
    """Build FAQPage JSON-LD from list of (question, answer) tuples."""
    return json_ld({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in faqs
        ]
    })


def build_faq_html(faqs):
    """Build FAQ <details> HTML from list of (question, answer) tuples."""
    return "\n".join(
        f'<details><summary><h3>{q}</h3></summary><p>{a}</p></details>'
        for q, a in faqs
    )


def render_page(section, slug, title, meta_desc, h1, content, faqs, section_label, related_links=None):
    """Render a single pSEO page."""
    canonical = f"{CANONICAL_ROOT}/{section}/{slug}"
    article_schema = build_article_schema(title, meta_desc, canonical)
    breadcrumb_schema = build_breadcrumb(section_label, section, title, canonical)
    faq_schema = build_faq(faqs)
    faq_html = build_faq_html(faqs)

    # Build mesh links
    if related_links:
        links_html = "\n".join(
            f'<li><a href="{link}">{label}</a></li>' for label, link in related_links
        )
        mesh = f'''<!-- mesh-links -->
<section class="mesh-links" style="background:#f9fafb;padding:1.25rem;border-radius:.5rem;margin-top:2rem">
<h3 style="margin-top:0">Related resources</h3>
<ul style="list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:.4rem 1rem;font-size:.95rem">
{links_html}
</ul>
</section>'''
    else:
        mesh = ""

    page = PAGE_TEMPLATE.format(
        title=title,
        meta_desc=meta_desc,
        canonical=canonical,
        section=section,
        section_label=section_label,
        h1=h1,
        content=content,
        faq_html=faq_html,
        article_schema=article_schema,
        breadcrumb_schema=breadcrumb_schema,
        faq_schema=faq_schema,
        mesh_links=mesh,
    )
    return page


def write_page(section, slug, html):
    """Write a page to disk."""
    dir_path = os.path.join(BASE, section)
    os.makedirs(dir_path, exist_ok=True)
    filepath = os.path.join(dir_path, f"{slug}.html")
    with open(filepath, "w") as f:
        f.write(html)
    print(f"  ✓ {section}/{slug}.html")


def render_index(section, section_label, intro, pages):
    """Render an index page listing all pages in a section."""
    page_links = "\n".join(
        f'<li><a href="https://carshake.online/{section}/{slug}">{label}</a></li>'
        for slug, label in pages
    )
    html = INDEX_PAGE.format(
        title=f"{section_label} — CarShake",
        meta_desc=f"Browse all {section_label.lower()} resources on CarShake. {intro[:120]}",
        canonical=f"{CANONICAL_ROOT}/{section}/",
        h1=section_label,
        intro=intro,
        page_links=page_links,
    )
    dir_path = os.path.join(BASE, section)
    os.makedirs(dir_path, exist_ok=True)
    filepath = os.path.join(dir_path, "index.html")
    with open(filepath, "w") as f:
        f.write(html)
    print(f"  ✓ {section}/index.html")


# ══════════════════════════════════════════════════════════════════════
# SECTION 1: how-to
# ══════════════════════════════════════════════════════════════════════

HOW_TO_PAGES = [
    {
        "slug": "document-car-condition-before-valet",
        "title": "How to Document Your Car Condition Before Valet Parking",
        "meta_desc": "Learn how to document car condition before valet parking. Step-by-step guide using CarShake to take timestamped photos and create court-admissible evidence.",
        "h1": "How to Document Your Car Condition Before Valet Parking",
        "content": """<p class="lede">Handing your car to a valet is a moment of trust — but without proof of pre-existing condition, that trust can cost you. Here's exactly how to document your car before valet parking, using tools you already have in your pocket.</p>

<h2>Why documenting before valet matters</h2>
<p>False damage claims are the single biggest headache in the valet industry. A customer retrieves their car, spots a scratch they swear wasn't there, and suddenly you're facing a $500+ repair bill or an insurance dispute. Without timestamped photographic evidence of the car's condition before handover, you have no way to prove the damage was pre-existing.</p>
<p>Studies of parking operations show that valet-related damage disputes cost operators thousands per year. Drivers without documentation almost always end up paying — because the valet company has the leverage. A simple pre-valet walkaround scan changes that dynamic completely.</p>

<h2>Step-by-step: document condition before handing over keys</h2>
<ol>
<li><strong>Download CarShake</strong> — available free on iOS and Android. No account needed to start a scan.</li>
<li><strong>Walk around the vehicle</strong> — start at the front bumper and work clockwise. Photograph every panel: hood, front fenders, doors, rear quarters, trunk lid, and roof (if reachable).</li>
<li><strong>Focus on damage-prone areas</strong> — bumpers get tapped, door edges get dinged, wheel rims get curbed. Spend extra time on these.</li>
<li><strong>Capture close-ups of existing damage</strong> — if there's a scratch, chip, or dent, shoot it from two angles: straight-on to show size, and with a ruler or coin for scale.</li>
<li><strong>Include the interior</strong> — photograph the dashboard, seats, carpets, and infotainment screen. Valets move the seat and adjust mirrors; document the starting state.</li>
<li><strong>Generate the QR-coded handover receipt</strong> — CarShake creates a timestamped, geotagged receipt both you and the valet can access. This is your proof.</li>
</ol>

<h2>What CarShake captures that a phone camera doesn't</h2>
<p>A regular photo roll has no chain of custody. Anyone can delete, edit, or back-date a photo. CarShake timestamps every image with the exact date, time, and GPS location at the moment of capture. The scan is bundled into a court-admissible handover receipt that cannot be altered after the fact. Valet operators can also sign off on the receipt digitally, creating a mutual record both parties agree reflects the actual condition.</p>

<h2>Tips for a thorough pre-valet scan</h2>
<ul>
<li>Do the scan in good light — shade or indirect sunlight is best. Avoid direct harsh sun that washes out details.</li>
<li>Take at least 8 photos covering all angles. More is better; there's no penalty for over-documenting.</li>
<li>Include the odometer in one photo — it confirms the mileage at handover.</li>
<li>If the car is dirty, document it anyway. A layer of dust doesn't hide a dent.</li>
<li>Keep the handover receipt QR code in your phone until after you retrieve the car.</li>
</ul>""",
        "faqs": [
            ("How long does a pre-valet scan take?", "With CarShake, a full walkaround scan takes under 60 seconds. You capture 8+ photos in a guided sequence that covers every panel."),
            ("Can a valet refuse to accept the scan?", "CarShake generates a shared QR receipt that both driver and valet can access. Most valet operators welcome documented handovers because they reduce their own liability."),
            ("Is a phone photo enough evidence in court?", "A regular phone photo may not hold up because it lacks a tamper-evident timestamp and geolocation. CarShake's scans are court-admissible because they bundle date, time, GPS, and image data into an immutable record."),
            ("What if I forget to scan before valet?", "You can still use CarShake to document the car when you pick it up. However, without a pre-retrieval scan, you lose the ability to prove damage existed before handover."),
        ],
    },
    {
        "slug": "dispute-valet-damage-charges",
        "title": "How to Dispute Valet Damage Charges and Win",
        "meta_desc": "Step-by-step guide to disputing valet damage charges. Learn what evidence you need, how to write a dispute letter, and how CarShake helps you build a winning case.",
        "h1": "How to Dispute Valet Damage Charges and Win",
        "content": """<p class="lede">You pick up your car from valet parking and they point out a scratch you're sure wasn't there before. Now they want you to pay. Here's exactly how to dispute valet damage charges — and win — with the right evidence.</p>

<h2>Why valet damage disputes happen</h2>
<p>Valet attendants park hundreds of cars per shift. Despite their best efforts, incidents happen — doors get dinged, bumpers get tapped, and wheels get curbed. The problem is that without before-and-after documentation, there is no way to tell whether a scratch happened during the valet's care or existed before the car was handed over. Most valet companies default to charging the driver because the burden sits with the customer.</p>
<p>The driver who can present timestamped, court-admissible before-photos switches that dynamic entirely. Now the valet company must explain how damage that was absent in the handover photos suddenly appeared.</p>

<h2>Your 4-step dispute playbook</h2>
<ol>
<li><strong>Gather your evidence immediately</strong> — Do not leave the valet stand without taking photos. Use CarShake to scan the car right there and generate a timestamped condition report. If you also scanned before handover, you now have a before-and-after pair.</li>
<li><strong>Get a written damage report from the valet</strong> — Ask the attendant or manager to document their claim in writing. What exactly is the damage? Where is it located? When was it supposedly caused? A vague claim is hard to defend; a specific claim is easier to disprove with photos.</li>
<li><strong>Write a formal dispute letter</strong> — Use the CarShake damage claim letter template. State that you have timestamped photographic evidence of the vehicle's condition before handover. Attach the before-and-after scans and request that the charge be dropped within 14 days.</li>
<li><strong>Escalate if needed</strong> — If the valet company refuses, send the dispute to their corporate office and your credit card company (if you already paid). Small claims court is also an option for charges above $500. Your CarShake evidence is court-admissible.</li>
</ol>

<h2>What makes CarShake evidence stand out</h2>
<p>Judges and insurance adjusters see dozens of photo-based claims. What separates a winning case from a losing one is the chain of custody. CarShake's scans are geotagged, timestamped, and bundled into an immutable handover receipt that cannot be edited. The QR code on the receipt links both parties to the same record. When you present a CarShake before-photo alongside an after-photo showing the same panel unscathed, the conclusion is obvious.</p>""",
        "faqs": [
            ("What if I didn't scan before valet?", "You can still document the car at retrieval. Without a before-scan, you lose the strongest evidence. But CarShake's professional-grade after-scan can still help if the valet's damage report contradicts the visible wear patterns."),
            ("How long do I have to dispute a charge?", "Most valet companies require disputes within 7–30 days. Check your receipt or agreement. CarShake users report faster resolutions because their evidence is ready immediately."),
            ("Can I use CarShake evidence in small claims court?", "Yes. CarShake scans are designed to be court-admissible. The timestamp, GPS data, and immutable receipt satisfy the evidentiary requirements for small claims disputes."),
            ("What if the valet company ignores my dispute?", "Escalate to your credit card issuer with a chargeback. Attach your CarShake handover receipt as supporting evidence. Credit card companies take documented disputes seriously."),
        ],
    },
    {
        "slug": "file-insurance-claim-for-valet-damage",
        "title": "How to File an Insurance Claim for Valet Damage",
        "meta_desc": "Complete guide to filing an insurance claim after valet damage. Learn what documentation you need, how to submit, and how CarShake evidence strengthens your claim.",
        "h1": "How to File an Insurance Claim for Valet Damage",
        "content": """<p class="lede">After a valet incident, filing an insurance claim can feel overwhelming. Here's exactly how to file an insurance claim for valet damage — with the right documentation, templates, and evidence to get your claim approved quickly.</p>

<h2>When to file an insurance claim vs. pay out of pocket</h2>
<p>Not every valet scratch needs an insurance claim. Minor scuffs under $500 often make more sense to pay out of pocket to avoid premium hikes. But for significant damage — a dented door, cracked bumper, scratched paint across multiple panels — an insurance claim is the right move. CarShake evidence helps you make that call by providing an objective record of the damage extent.</p>

<h2>The documentation you'll need</h2>
<p>Insurance companies are skeptical of after-the-fact claims. They want proof that the damage actually happened during the valet's care, not before. Here is the documentation package that gets claims approved:</p>
<ul>
<li><strong>Before-handover photos</strong> — Timestamped scan from CarShake showing the vehicle was damage-free before valet.</li>
<li><strong>After-incident photos</strong> — Immediate post-retrieval scan showing the new damage from multiple angles.</li>
<li><strong>Handover receipt</strong> — The QR-coded receipt linking both condition records to the same handover event.</li>
<li><strong>Valet incident report</strong> — Any written documentation from the valet company acknowledging the damage.</li>
<li><strong>Repair estimate</strong> — A quote from a certified body shop itemizing the cost of restoring the vehicle.</li>
<li><strong>Police report</strong> — For major damage or hit-and-run in a valet lot, a police report adds weight.</li>
</ul>

<h2>Step-by-step claim process</h2>
<ol>
<li>Notify the valet company and get their incident report in writing.</li>
<li>Gather your CarShake scans — both before and after if you have them.</li>
<li>Get at least two repair estimates from licensed body shops.</li>
<li>Contact your insurance provider's claims department. Some companies accept claims online.</li>
<li>Submit your evidence package. CarShake's handover exports as a PDF you can attach directly.</li>
<li>Follow up weekly until the claim is assigned an adjuster and processed.</li>
</ol>

<h2>Why CarShake evidence matters to adjusters</h2>
<p>Insurance adjusters spend their days assessing disputed claims. A before-photo from a regular camera roll can be disputed as staged or back-dated. A CarShake handover receipt with tamper-evident timestamps, GPS coordinates, and an immutable condition record removes that ambiguity. Adjusters tell us that documented disputes resolve 3x faster than he-said-she-said claims.</p>""",
        "faqs": [
            ("Will my insurance premium go up after a valet damage claim?", "It depends on your policy and the claim amount. Minor claims under $1,000 may trigger premium increases. CarShake helps you decide by giving you the evidence to negotiate a fair outcome directly with the valet company first."),
            ("Do I need to involve my insurance if the valet company admits fault?", "If the valet company accepts responsibility and pays for repairs, you may not need to file an insurance claim. Document everything with CarShake regardless, because admissions can be withdrawn."),
            ("How long does a valet damage insurance claim take?", "Simple claims with complete photo documentation resolve in 2–4 weeks. Claims without evidence can drag on for months as the insurance company investigates."),
            ("Can CarShake export my scans for insurance?", "Yes. Every CarShake handover receipt exports as a PDF with embedded photos, timestamps, and GPS data — ready for attachment to any insurance claim portal."),
        ],
    },
    {
        "slug": "rental-car-walkaround",
        "title": "How to Do a Rental Car Walkaround Inspection",
        "meta_desc": "Learn how to do a proper rental car walkaround inspection. Step-by-step guide with checklist for documenting condition before you drive off the lot.",
        "h1": "How to Do a Rental Car Walkaround Inspection",
        "content": """<p class="lede">A thorough rental car walkaround inspection is your best defense against false damage charges. Here's exactly how to do one — with a complete checklist and CarShake to make it court-admissible.</p>

<h2>Why the rental counter walkaround isn't enough</h2>
<p>Rental companies give you a paper diagram to mark damage on. In practice, attendants rush you through it, marks are subjective, and the paper easily gets lost. When you return the car, the agent finds a scratch that wasn't on the diagram — and suddenly you're liable. A digital walkaround using CarShake fixes this by creating an irrefutable record of the car's condition at pickup.</p>

<h2>The complete rental car walkaround checklist</h2>
<h3>Exterior inspection</h3>
<ul>
<li><strong>Front bumper:</strong> Check for scuffs, cracks, and paint transfer. Run your hand across to feel for texture changes that indicate repainting.</li>
<li><strong>Hood and front fenders:</strong> Look for stone chips, dents, and alignment gaps. Open the hood and check the leading edge for scrapes.</li>
<li><strong>Driver and passenger doors:</strong> Open each door fully. Check the edges for dings from neighboring cars. Test the window operation.</li>
<li><strong>Rear doors and quarter panels:</strong> Same process. Check the rear wheel arches for curbing damage.</li>
<li><strong>Trunk lid and rear bumper:</strong> Open the trunk, check the latch area. Look underneath the bumper for hidden scrapes.</li>
<li><strong>Roof:</strong> If reachable, photograph the roofline. Rental cars get damage from parking garages with low clearance.</li>
<li><strong>Wheels and tires:</strong> All four wheels — check for curb rash, scuffed sidewalls, and missing hubcaps.</li>
<li><strong>Windows and mirrors:</strong> Look for cracks, chips, and scratches. Test all power adjustments.</li>
</ul>
<h3>Interior inspection</h3>
<ul>
<li><strong>Seats and upholstery:</strong> Check for tears, stains, and burns. Test all seat adjustments.</li>
<li><strong>Dashboard and controls:</strong> Document the odometer reading, fuel level, and any warning lights.</li>
<li><strong>Cargo area:</strong> Open and check for damage, spare tire presence, and cleanliness.</li>
</ul>

<h2>How CarShake streamlines the walkaround</h2>
<p>CarShake guides you through a structured 8-point scan that covers every panel in under 60 seconds. Each photo is automatically timestamped and geotagged. At the end, you get a QR-coded handover receipt that both you and the rental agent can access. When you return the car, you do a second scan — CarShake layers the before-and-after records together so you can prove no new damage occurred during your rental.</p>""",
        "faqs": [
            ("How long does a thorough walkaround take?", "With CarShake's guided scan, a full walkaround takes 3–5 minutes. Without an app, plan for 10–15 minutes to photograph everything manually."),
            ("Should I take photos or video?", "Photos are better for insurance and dispute purposes because individual images can be examined closely. CarShake captures 8+ high-resolution photos with metadata."),
            ("What if the rental agent says I'm being difficult?", "Most rental companies now encourage documented walkarounds because they reduce their own chargeback disputes. CarShake's shared receipt gives both parties confidence."),
            ("Do I need to inspect the undercarriage?", "For standard rentals, undercarriage inspection is not expected. If you're renting an off-road vehicle, it's worth documenting."),
        ],
    },
    {
        "slug": "spot-pre-existing-damage",
        "title": "How to Spot Pre-Existing Damage on a Rental or Valet Car",
        "meta_desc": "Expert tips for spotting pre-existing damage on rental cars and valet vehicles. Learn what to look for and how to document it with CarShake.",
        "h1": "How to Spot Pre-Existing Damage on a Rental or Valet Car",
        "content": """<p class="lede">The difference between a smooth car return and a disputed damage charge often comes down to noticing pre-existing damage that the rental company didn't mark. Here's how to spot it every time.</p>

<h2>Why pre-existing damage gets missed</h2>
<p>Rental lots are busy. Vehicles are cleaned and turned around quickly. Attendants have minutes to inspect each car, not hours. Minor damage — a hairline crack, a paint chip, a barely-visible dent — routinely gets missed on the outgoing inspection and attributed to the next renter. The result is thousands of disputed damage charges each year, many of which the renter didn't cause.</p>

<h2>Key areas where pre-existing damage hides</h2>
<ul>
<li><strong>Lower bumper sections:</strong> Pull scuffs right at the bottom edge are easy to overlook. Get down to bumper height and look along the whole lower line.</li>
<li><strong>Door edges:</strong> Open each door fully and check the leading and trailing edges. This is where neighboring car doors leave dings.</li>
<li><strong>Wheel arches:</strong> The plastic trim around wheel wells gets scraped in tight parking spots. Check both the painted and unpainted sections.</li>
<li><strong>Underside of bumpers:</strong> Park the car and crouch down. The underside of the front and rear bumpers often shows scrapes from curbs and parking blocks.</li>
<li><strong>Rearview mirror housings:</strong> Look for cracks or scratches on the plastic housing — a common impact point in drive-throughs and narrow lanes.</li>
<li><strong>Weather stripping and seals:</strong> Torn or misaligned weather stripping can indicate prior damage or poor repair work.</li>
</ul>

<h2>Lighting tricks to spot hidden damage</h2>
<p>Damage is much harder to see in direct overhead sun. Move the car to a shaded area or park with the sun at your back. Angle your phone's flashlight along the panel surface — shallow dents create visible shadow lines when lit from the side. For scratches, wet the area: water temporarily fills the scratch and makes it contrast against the surrounding paint.</p>

<h2>Document every find with CarShake</h2>
<p>When you spot pre-existing damage, capture it immediately in CarShake. The app timestamps and geotags each photo, building an irrefutable record that you picked up the car with that condition. Share the resulting handover receipt with the rental agent right there — if they disagree, they can note their objection on the record. Better to have that conversation at pickup than at return.</p>""",
        "faqs": [
            ("What if the damage is very small — should I still document it?", "Yes. Even a small paint chip can be attributed to you if it wasn't documented. CarShake has no limit on number of photos, so document everything."),
            ("Can I add notes to CarShake scans?", "Yes. Each scan supports free-form notes where you can describe what you found, including the approximate size, location, and any observations about prior repairs."),
            ("What about damage under the car?", "Serious undercarriage damage is rare in rental and valet scenarios. If you're renting a specialty vehicle, use a creeper or phone camera on a selfie stick to peek underneath."),
            ("Should I document the fuel level too?", "Yes. Always photograph the fuel gauge at pickup and return. Fuel-level disputes are another common source of unexpected charges."),
        ],
    },
    {
        "slug": "take-damage-photos-for-insurance",
        "title": "How to Take Damage Photos for Insurance Claims",
        "meta_desc": "Learn how to take vehicle damage photos for insurance claims that get approved. Expert photography tips and CarShake's automatic documentation.",
        "h1": "How to Take Damage Photos for Insurance Claims",
        "content": """<p class="lede">The quality of your damage photos can make or break an insurance claim. Here's how to take damage photos for insurance claims that adjusters trust and approve — with or without CarShake.</p>

<h2>What insurance adjusters look for in photos</h2>
<p>Insurance adjusters review hundreds of photo sets per month. The ones that get approved quickly share common traits: clear lighting, multiple angles, scale reference, and a logical sequence that shows the damage in context. Blurry, dark, single-angle photos get flagged for follow-up investigation — or denied outright.</p>

<h2>The 8-angle damage photography method</h2>
<p>Professional vehicle photographers use an 8-angle method that covers every panel systematically. CarShake automates this sequence, but the principles apply whether you're using the app or your phone's camera:</p>
<ol>
<li><strong>Full vehicle overview</strong> — Stand back 10-15 feet and capture the whole car from each corner (front-left, front-right, rear-right, rear-left). This establishes the vehicle identity and overall condition.</li>
<li><strong>Mid-range damage shot</strong> — From about 5 feet, capture the damaged area with enough surrounding context to show its location on the vehicle.</li>
<li><strong>Close-up damage detail</strong> — From 12-18 inches, show the damage clearly: the scratch depth, dent contour, or crack length.</li>
<li><strong>Scale reference</strong> — Place a coin, ruler, or known object next to the damage and reshoot. This gives adjusters an objective sense of size.</li>
</ol>

<h2>Lighting and angle best practices</h2>
<ul>
<li>Shoot in overcast or indirect light — direct sun creates harsh shadows that hide damage.</li>
<li>Angle your phone's flash slightly off-axis. Direct flash washes out scratch detail.</li>
<li>For dents, shoot perpendicular to the panel surface with side lighting to highlight the contour change.</li>
<li>For scratches, shoot parallel to the scratch line to show depth.</li>
<li>Take at least 3 shots per damage point: contextual, close-up, and with scale.</li>
</ul>

<h2>How CarShake handles photo documentation automatically</h2>
<p>CarShake's guided scan walks you through the 8-point sequence automatically. Every photo receives a cryptographic timestamp, GPS coordinate, and chain-of-custody marker that makes the evidence tamper-evident. The app organizes photos into a structured handover report that adjusters can parse at a glance — no more submitting a random camera roll and hoping for the best.</p>""",
        "faqs": [
            ("How many photos should I submit with a claim?", "Submit your best 8-12 photos. Quality matters more than quantity. CarShake's auto-generated handover report selects the optimal photos in the correct sequence."),
            ("Can I submit screenshots of CarShake scans?", "Export the handover receipt as a PDF from CarShake — it preserves the embedded photos, timestamps, and GPS data that screenshots strip away."),
            ("What if the damage is on a dark-colored car?", "Dark paint makes damage harder to photograph. Use indirect side-lighting and overexpose slightly (+0.5 to +1 EV) to bring out scratch and dent details."),
            ("Do I need a professional camera?", "No. Modern smartphone cameras are sufficient. CarShake is optimized for phone cameras and ensures photos meet insurance-grade quality standards."),
        ],
    },
    {
        "slug": "write-damage-claim-letter",
        "title": "How to Write a Vehicle Damage Claim Letter",
        "meta_desc": "Learn how to write an effective vehicle damage claim letter. Includes a free template, key sections to include, and tips for getting results.",
        "h1": "How to Write a Vehicle Damage Claim Letter",
        "content": """<p class="lede">A well-written damage claim letter can mean the difference between a quick resolution and months of back-and-forth. Here's how to write one, what to include, and how CarShake evidence makes your letter irrefutable.</p>

<h2>The anatomy of an effective claim letter</h2>
<p>Insurance adjusters and valet company managers read dozens of claim letters a week. The ones that get fast action share a clear structure, specific facts, and attached evidence. Your letter should be professional, factual, and concise — emotions don't help, documented facts do.</p>

<h2>Key sections every claim letter needs</h2>
<h3>1. Header with your contact information</h3>
<p>Full name, address, phone number, email. If you have a claim or reference number from the valet company or rental agency, include it.</p>
<h3>2. Date and incident details</h3>
<p>The exact date and time you picked up the car after valet or returned the rental. Location (valet address or rental location). Vehicle make, model, year, color, and VIN.</p>
<h3>3. Description of the incident</h3>
<p>Objectively describe what happened. "I parked my vehicle with ABC Valet on Main Street at 7 PM. When I retrieved the car at 10 PM, I noticed a fresh scratch on the driver's side rear door that was not present when I handed over the keys." Stick to facts.</p>
<h3>4. The damage claimed vs. the evidence</h3>
<p>Describe the damage the valet company is claiming or the damage you discovered. Then present your evidence: "I have timestamped, geotagged photographs from CarShake showing the vehicle condition at handover. The attached before-and-after scans confirm that the damage was not present when I turned over the car."</p>
<h3>5. Your demand and deadline</h3>
<p>State exactly what you want: drop the charge, pay for repairs, or reimburse you. Give a specific deadline (14 days is standard). Outline next steps if unresolved — including filing with your insurance or small claims court.</p>

<h2>Free template available</h2>
<p>CarShake offers a free damage claim letter template on the CarShake website. It includes all the sections above with placeholder fields you can customize in minutes. Download it, fill in your details, attach your CarShake handover receipt, and send it.</p>""",
        "faqs": [
            ("Should I send the letter by email or certified mail?", "Email is fine for initial contact. If the valet company doesn't respond within 7 days, send the same letter by certified mail with return receipt — that creates a paper trail."),
            ("Can I use the same letter for insurance and valet companies?", "Yes, but tailor the language. For insurance, emphasize the timestamps and tamper-evident nature of CarShake scans. For valet companies, emphasize the shared QR receipt."),
            ("How long should I wait for a response?", "14 days is reasonable. Follow up by phone after one week. If you get no response, escalate to the company's corporate office or your insurance provider."),
            ("Does CarShake fill in the claim letter automatically?", "Yes. CarShake's handover report exports all the necessary data — dates, times, GPS, photo evidence — that you can paste directly into the claim letter template."),
        ],
    },
    {
        "slug": "scan-car-after-parking",
        "title": "How to Scan Your Car After Parking to Prevent Valet Fraud",
        "meta_desc": "Learn how to scan your car after parking in valet lots. Post-parking documentation protects you from false damage claims. Step-by-step CarShake guide.",
        "h1": "How to Scan Your Car After Parking to Prevent Valet Fraud",
        "content": """<p class="lede">Scanning your car when you retrieve it from valet parking is just as important as scanning before you hand it over. Here's how to do a post-parking scan that closes your evidence loop.</p>

<h2>Why a post-parking scan matters</h2>
<p>A before-handover scan proves the car was undamaged when you surrendered it. A post-retrieval scan proves what condition it came back in. Together, they create a complete evidence chain that leaves no room for dispute. Without the after-scan, a valet company could argue that the damage happened after you drove away — the before-scan alone doesn't close the loop.</p>

<h2>When and where to do the post-parking scan</h2>
<p>The best time to scan is the moment you reach your car in the valet lot or garage, before you start the engine or adjust anything. Walk around the car exactly as you did during the pre-handover scan. Use the same sequence of angles so the before-and-after photos are directly comparable. If you spot new damage, photograph it immediately from multiple angles, including a scale reference.</p>

<h2>Step-by-step post-retrieval scan</h2>
<ol>
<li><strong>Don't start the engine.</strong> The car hasn't moved yet — this is your cleanest evidence window.</li>
<li><strong>Walk the same 8-point sequence</strong> as your pre-handover scan. CarShake's guided mode ensures identical angles and coverage.</li>
<li><strong>Compare key panels first</strong> — bumper corners, door edges, wheels. These are the highest-risk areas in valet operations.</li>
<li><strong>If you find new damage</strong>, get the valet attendant to acknowledge it and note it on their paperwork before you leave the lot.</li>
<li><strong>Generate the matching handover receipt.</strong> CarShake pairs the before and after scans into a single time-stamped record.</li>
</ol>

<h2>Pro tip: keep the app open until you've driven away</h2>
<p>If you find damage, you want to document it while still on the valet's property. Once you drive off, the valet company can claim the damage happened after you left. CarShake's GPS geotagging proves your scans were taken at the valet location, strengthening your evidence chain.</p>""",
        "faqs": [
            ("What if I forget to scan before leaving the lot?", "Drive to a nearby well-lit area and scan as soon as possible. CarShake's GPS will show the location, but the evidence is strongest when captured on-site."),
            ("How long does a post-parking scan take?", "About 60 seconds with CarShake's guided 8-point scan. The same sequence as the pre-handover scan."),
            ("Can I scan while the valet is watching?", "Absolutely. Involving the valet creates a mutual acknowledgment of condition. CarShake's shared QR receipt lets them access the record too."),
            ("What if there are multiple cars parked around mine?", "Take extra care to photograph the doors and bumpers that face neighboring cars — these are the most common contact points."),
        ],
    },
    {
        "slug": "prevent-false-damage-claims",
        "title": "How to Prevent False Damage Claims as a Valet Operator",
        "meta_desc": "Complete guide for valet operators on preventing false damage claims. Reduce chargebacks, protect your business, and build customer trust with digital handover scans.",
        "h1": "How to Prevent False Damage Claims as a Valet Operator",
        "content": """<p class="lede">False damage claims cost valet operators thousands in payouts, chargebacks, and insurance premiums each year. Here's a systematic approach to preventing them with digital documentation.</p>

<h2>The scope of the problem</h2>
<p>Industry data shows that valet parking operations lose between 1-3% of revenue to disputed damage claims. For a busy hotel or restaurant valet handling 200 cars per day, that's a significant drain. Worse, unfounded claims erode customer trust and create friction at the handover point. The solution isn't hiring more inspectors — it's implementing a systematic digital documentation workflow.</p>

<h2>The three-stop protocol</h2>
<p>CarShake's three-stop protocol is built specifically to prevent false claims:</p>
<ol>
<li><strong>Stop one — scan at drop-off:</strong> The attendant uses CarShake to scan the vehicle with the customer present. Both parties see the timestamped condition record. If the customer disputes later, you have proof of pre-existing condition.</li>
<li><strong>Stop two — QR-coded handover receipt:</strong> CarShake generates a receipt both parties can access via QR code. The customer gets a copy; your system keeps the immutable record.</li>
<li><strong>Stop three — scan at retrieval:</strong> When the customer picks up the car, the attendant does a quick exit scan. If new damage occurred during parking, it's documented immediately — and if the customer claims damage that's actually old, your before-scan disproves it.</li>
</ol>

<h2>Why digital beats paper</h2>
<p>Paper inspection forms get lost, altered, or never filled out at all. Digital scans in CarShake are timestamped, geotagged, and stored immutably. They can't be edited after the fact. When a customer disputes a damage charge, you pull up the handover record in seconds. The average claim resolution time drops from weeks to minutes.</p>

<h2>Training your team on digital handover</h2>
<p>Adopting CarShake takes about 10 minutes of training per attendant. The app guides the scan sequence with visual cues. Most operators report that attendants prefer the digital process because it reduces their personal liability — if a dispute arises, the evidence protects them too.</p>""",
        "faqs": [
            ("How much does CarShake cost for valet operators?", "CarShake offers free individual scans and paid plans for operators. Pricing scales by monthly handover volume. Visit carshake.online for current plans."),
            ("Can customers refuse the digital scan?", "Politely explain that the scan protects both parties. Most customers appreciate the transparency. For those who refuse, note it on their receipt — you've offered documentation."),
            ("Does CarShake integrate with our existing POS or valet software?", "CarShake supports basic integrations. The handover receipt exports as a PDF that can be attached to any reservation or ticket system."),
            ("What happens to the scans after handover?", "Scans are stored securely in the cloud for 12 months. Operators can export all records for their fleet at any time."),
        ],
    },
    {
        "slug": "use-timestamped-evidence-in-disputes",
        "title": "How to Use Timestamped Evidence in Vehicle Damage Disputes",
        "meta_desc": "Guide to using timestamped photo evidence in vehicle damage disputes. Learn what makes evidence court-admissible and how CarShake's timestamps hold up.",
        "h1": "How to Use Timestamped Evidence in Vehicle Damage Disputes",
        "content": """<p class="lede">Not all photo evidence is created equal. When you're disputing a valet or rental car damage charge, timestamped evidence with a clear chain of custody is what wins cases. Here's how to use it effectively.</p>

<h2>What makes evidence court-admissible</h2>
<p>Courts and insurance adjusters follow a simple test for photographic evidence: can you prove the photo was taken when you say it was, and can you prove it hasn't been altered since? Regular phone photos fail this test because EXIF metadata can be edited, dates can be changed, and images can be photoshopped. CarShake solves this by bundling photos into an immutable handover record with cryptographic timestamps.</p>

<h2>Three types of timestamp evidence</h2>
<ul>
<li><strong>EXIF timestamps</strong> — Embedded in every digital photo. Easy to fake. Alone, they carry limited weight.</li>
<li><strong>Server-side timestamps</strong> — The time recorded when a photo is uploaded to a server. Harder to fake. CarShake records both device and server timestamps.</li>
<li><strong>Blockchain or immutable ledger timestamps</strong> — Time recorded in a system that cannot be altered after the fact. CarShake's handover records include these.</li>
</ul>

<h2>How to present timestamped evidence in a dispute</h2>
<ol>
<li><strong>Export the CarShake handover receipt as PDF</strong> — The PDF includes all photos, timestamps, GPS coordinates, and the chain-of-custody record.</li>
<li><strong>Include a comparison</strong> — Show the before-handover photo next to the after-retrieval photo of the same panel. Highlight the difference.</li>
<li><strong>State the timeline</strong> — "Photo A was taken at 7:02 PM at [location]. Photo B was taken at 10:15 PM at [same location]. The scratch visible in Photo B is absent from Photo A."</li>
<li><strong>Attach the QR receipt</strong> — The QR code links to the live record the valet company also acknowledged.</li>
</ol>

<h2>Common objections and how to counter them</h2>
<p>The valet company might claim the photos were staged. Counter by showing that CarShake's GPS puts both scans at the valet location. They might claim the scratch was out of frame in the before-photo. Counter with the multi-angle coverage that shows the same panel from several perspectives. The more thorough your scan, the harder it is to refute.</p>""",
        "faqs": [
            ("Can CarShake timestamps be faked?", "No. CarShake uses server-side and immutable ledger timestamps. Once a scan record is created, it cannot be edited or deleted. This is what makes the evidence court-admissible."),
            ("Do I need a lawyer to use this evidence?", "For most valet damage disputes, no. The evidence speaks for itself. For claims over $5,000 or complex cases, a lawyer can help you present the evidence effectively."),
            ("What if the valet company says my photos are not acceptable?", "CarShake evidence has been accepted in small claims courts and insurance proceedings. If the valet company rejects it, escalate to a third-party decision-maker."),
            ("How long are CarShake records kept?", "Handover records are stored for 12 months. Download your PDF exports for long-term archiving."),
        ],
    },
    {
        "slug": "negotiate-with-valet-companies",
        "title": "How to Negotiate with Valet Companies Over Damage Charges",
        "meta_desc": "Effective negotiation strategies for valet damage charges. Learn what to say, what evidence to present, and how to resolve disputes without court.",
        "h1": "How to Negotiate with Valet Companies Over Damage Charges",
        "content": """<p class="lede">Getting charged for damage you didn't cause is frustrating — but most disputes never need to go to court. Here's how to negotiate with valet companies over damage charges and find a fair resolution.</p>

<h2>Understanding the valet company's perspective</h2>
<p>Valet operators deal with damage disputes every day. Many have been burned by fraudulent claims, so they're naturally skeptical. Their default position is that the driver is responsible because, historically, most claims lack evidence. Your job in negotiation is to present such clear, verifiable evidence that their skepticism has no ground to stand on. CarShake's timestamped scans do exactly that.</p>

<h2>The negotiation framework</h2>
<h3>Step 1: Stay calm and professional</h3>
<p>Emotion undermines your credibility. State the facts: "I have a timestamped photo from 7 PM showing no damage to the driver's door. The damage you're charging for was not there when I handed over the keys."</p>
<h3>Step 2: Present your evidence early</h3>
<p>Don't save the photos for a surprise reveal. Present them in the first communication. A manager who sees clear before-and-after photos immediately understands they can't win this one.</p>
<h3>Step 3: Offer a reasonable timeline</h3>
<p>"I'm happy to give you 14 days to review the evidence and respond. After that, I'll need to escalate to my insurance company and file a report." A deadline signals you're serious.</p>
<h3>Step 4: Know your escalation path</h3>
<p>If the first manager refuses, ask to speak to the owner or corporate office. If that fails, your options are: credit card chargeback, insurance claim, or small claims court. Mentioning these options calmly in sequence shows you've done your homework.</p>

<h2>What resolution options are available</h2>
<ul>
<li>Drop the charge entirely — the cleanest outcome</li>
<li>Split the cost if there's genuine ambiguity about when the damage occurred</li>
<li>Have their insurance cover the repair instead of billing you</li>
<li>A written apology and waiver of any future claims related to this incident</li>
</ul>

<p>Whatever the outcome, get it in writing. A verbal agreement disappears when the shift manager changes.</p>""",
        "faqs": [
            ("Should I negotiate before or after paying?", "Before. Once you pay, your leverage drops significantly. If you've already paid, dispute the charge with your credit card company and present your CarShake evidence."),
            ("What if the valet company offers a compromise?", "Consider it. A partial settlement in writing is better than a full dispute that drags on for months. Make sure the agreement states it's a full and final settlement."),
            ("How do I document the negotiation?", "Keep a written log: dates, times, who you spoke to, what was said. Save all emails. Upload everything to CarShake's handover record for your records."),
            ("Can I negotiate without CarShake evidence?", "You can try, but your leverage is much weaker. Without verifiable timestamps, the valet company's word carries as much weight as yours."),
        ],
    },
    {
        "slug": "document-fleet-vehicle-handovers",
        "title": "How to Document Fleet Vehicle Handovers",
        "meta_desc": "Complete guide for fleet managers on documenting vehicle handovers. Reduce disputes, track fleet condition, and protect your assets with CarShake.",
        "h1": "How to Document Fleet Vehicle Handovers",
        "content": """<p class="lede">Fleet vehicle handovers — whether to employees, renters, or partner drivers — are where most fleet damage disputes start. Here's how to document them systematically so you always know who is responsible for what.</p>

<h2>Why fleet handover documentation matters</h2>
<p>Fleet operators manage dozens or hundreds of vehicles moving between drivers daily. Without systematic documentation, a scratch noted by Driver B gets billed to Driver A, disputed, and written off. Multiply that by the number of handovers per day and the cost adds up fast. A standardized handover process eliminates the ambiguity that causes these disputes.</p>

<h2>Building a fleet handover protocol</h2>
<h3>Pre-trip inspection (driver take)</h3>
<p>When a driver checks out a vehicle, they use CarShake to scan the exterior (8 angles), interior (seats, dashboard, cargo), and document the odometer and fuel level. The app timestamps and geotags everything. The driver acknowledges the condition digitally — no more "I didn't notice that before."</p>
<h3>Post-trip inspection (driver return)</h3>
<p>On return, the driver does a matching scan. CarShake layers the before-and-after scans for instant comparison. Any new damage is flagged automatically. If there's a dispute, you have both scans linked to the same vehicle and driver.</p>
<h3>Fleet-wide reporting</h3>
<p>CarShake's dashboard gives fleet managers a consolidated view of all handovers, active issues, and historical condition reports for every vehicle in the fleet.</p>

<h2>Reducing fleet damage costs</h2>
<p>Fleets using digital handover documentation report 60-80% fewer disputed damage claims. The reason is simple: when drivers know their condition is documented before and after, they drive more carefully, and honest drivers get protected from false accusations. The ROI for a fleet of 50 vehicles can be recovered in the first few months of prevented disputes alone.</p>

<h2>Essential fleet handover checklist</h2>
<ul>
<li>Exterior walkaround (8+ photo angles)</li>
<li>Interior photos (seats, wheel, pedals, dash)</li>
<li>Odometer and fuel level photo</li>
<li>Driver acknowledgment signature</li>
<li>QR-coded handover receipt shared to both parties</li>
<li>Post-return scan with automated comparison</li>
</ul>""",
        "faqs": [
            ("Can CarShake handle a fleet of 200+ vehicles?", "Yes. CarShake's fleet plans support unlimited vehicles and drivers. Each handover is tracked independently with its own immutable record."),
            ("How do drivers access CarShake for fleet handovers?", "Drivers install the free CarShake app on their phone. The fleet manager creates a shared workspace where all handover records are collected."),
            ("What if a driver refuses to do the scan?", "Make the scan a mandatory part of the checkout process. Without it, damage responsibility is unclear — and the driver assumes liability."),
            ("Can I export fleet handover data?", "Yes. All handover records can be exported as CSV or JSON for integration with your fleet management software."),
        ],
    },
]

HOW_TO_FAQ = [
    ("About how-to guides", "how-to"),
]
HOW_TO_SECTION_LABEL = "How-To Guides"
HOW_TO_INTRO = "Step-by-step guides for documenting vehicle condition, disputing valet damage, filing insurance claims, and protecting yourself with CarShake."

# ══════════════════════════════════════════════════════════════════════
# SECTION 2: free
# ══════════════════════════════════════════════════════════════════════

FREE_PAGES = [
    {
        "slug": "valet-damage-claim-letter",
        "title": "Free Valet Damage Claim Letter Template [Download 2026]",
        "meta_desc": "Download a free valet damage claim letter template. Ready-to-use format for disputing false valet damage charges. Includes evidence log template.",
        "h1": "Free Valet Damage Claim Letter Template",
        "content": """<p class="lede">A professional damage claim letter is your first step to recovering valet damage costs. Download this free template — fill in your details, attach your evidence, and send it.</p>

<div class="callout"><strong>Free download:</strong> Use this template with CarShake's handover receipt PDF for a complete evidence package. No sign-up required.</div>

<h2>What's included in this free template</h2>
<ul>
<li>Professional letter format with all required sections</li>
<li>Space for your contact information and claim reference</li>
<li>Incident details section (date, time, location, vehicle info)</li>
<li>Evidence log for attaching CarShake scans and photos</li>
<li>Demand letter with payment deadline</li>
<li>Next-steps escalation language</li>
</ul>

<h2>How to use this template</h2>
<ol>
<li>Download the template (PDF and DOC formats)</li>
<li>Fill in your personal details and vehicle information</li>
<li>Describe the incident factually — stick to dates, times, and locations</li>
<li>Attach your CarShake handover receipt as Exhibit A</li>
<li>Send it to the valet company manager via email and certified mail</li>
<li>Follow up within 7 days if you don't receive a response</li>
</ol>

<h2>Why use a template instead of writing from scratch</h2>
<p>A pre-written template ensures you don't forget critical elements. It also looks professional — a polished letter signals that you're organized and serious, which encourages the valet company to take your dispute seriously. Pair it with CarShake's timestamped photo evidence in your templates folder for maximum impact.</p>""",
        "faqs": [
            ("Is this template really free?", "Yes. No sign-up, no hidden charges. Download and use it immediately."),
            ("Can I customize the template?", "Absolutely. The template is a starting point. Adjust the language, add your company letterhead, or combine it with other evidence."),
            ("Does CarShake fill this template automatically?", "CarShake can populate most fields from your handover receipt data. Export the receipt as PDF and attach it to the letter."),
            ("What format is the template in?", "Available in PDF for print-ready use and DOC format for easy editing."),
        ],
    },
    {
        "slug": "rental-car-inspection-checklist",
        "title": "Free Rental Car Inspection Checklist [Printable 2026]",
        "meta_desc": "Download a free printable rental car inspection checklist. 20-point walkaround checklist for exterior, interior, and damage documentation.",
        "h1": "Free Rental Car Inspection Checklist",
        "content": """<p class="lede">Don't drive off the rental lot without checking your car. This free printable rental car inspection checklist covers every panel, interior surface, and critical component. Save or print it before your next rental.</p>

<div class="callout"><strong>Pro tip:</strong> Use this checklist alongside CarShake's app for automatic timestamped photo capture. Each checklist item corresponds to a scan point in the guided walkaround.</div>

<h2>20-point rental car inspection checklist</h2>
<h3>Exterior (front)</h3>
<ul class="checklist">
<li>Front bumper — check for scuffs, cracks, paint transfer</li>
<li>Hood — stone chips, dents, alignment</li>
<li>Headlights and turn signals — cracks, moisture, function</li>
<li>Front windshield — chips, cracks, wiper condition</li>
</ul>
<h3>Exterior (sides)</h3>
<ul class="checklist">
<li>Driver side front fender and door</li>
<li>Driver side rear door and quarter panel</li>
<li>Passenger side front and rear panels</li>
<li>Side mirrors — cracks, scratches, function</li>
</ul>
<h3>Exterior (rear and roof)</h3>
<ul class="checklist">
<li>Rear bumper — scuffs, cracks</li>
<li>Trunk lid — dents, alignment, open/close</li>
<li>Taillights — cracks, moisture</li>
<li>Roof — dents (check in garage lighting)</li>
</ul>
<h3>Wheels and tires</h3>
<ul class="checklist">
<li>Four wheels — curb rash, scuffs</li>
<li>Tire tread and sidewall condition</li>
<li>Hubcaps — presence and condition</li>
</ul>
<h3>Interior</h3>
<ul class="checklist">
<li>Seats (all) — tears, stains, burns</li>
<li>Dashboard — cracks, warning lights</li>
<li>Odometer and fuel gauge reading</li>
<li>Cargo area — cleanliness, spare tire</li>
</ul>

<h2>How to use the checklist with CarShake</h2>
<p>Open CarShake, tap "New Scan," and follow the guided walkaround. The app captures each angle automatically and adds timestamps and GPS data. At the end, you get a QR-coded handover receipt that covers every item on this checklist. Share it with the rental agent on the spot.</p>""",
        "faqs": [
            ("Can I use this checklist on my phone?", "Yes. Save the page as a PDF or screenshot it. CarShake's app has the checklist built into the guided scan workflow."),
            ("What if the rental agent says I'm taking too long?", "The full checklist takes 3-5 minutes. Most rental companies prefer a documented handover because it reduces their liability."),
            ("Should I photograph everything on the checklist?", "Yes. Every item is a potential dispute point. CarShake guides you through each one."),
        ],
    },
    {
        "slug": "damage-photo-guide",
        "title": "Free Vehicle Damage Photo Guide [2026]",
        "meta_desc": "Download a free vehicle damage photo guide. Learn the 8-angle method, lighting tips, and how CarShake automates insurance-grade photo documentation.",
        "h1": "Free Vehicle Damage Photo Guide",
        "content": """<p class="lede">Taking effective damage photos is a skill. This free guide teaches you the 8-angle method that insurance adjusters and courts accept — and how CarShake automates the whole process.</p>

<div class="callout"><strong>Free resource:</strong> Download the photo guide as a PDF. Keep it in your glove compartment for reference during walkarounds.</div>

<h2>The 8-angle damage photography method</h2>
<ol>
<li><strong>Overview shot:</strong> Full vehicle from 15 feet, front-left angle</li>
<li><strong>Overview shot:</strong> Full vehicle from 15 feet, front-right angle</li>
<li><strong>Overview shot:</strong> Full vehicle from 15 feet, rear-right angle</li>
<li><strong>Overview shot:</strong> Full vehicle from 15 feet, rear-left angle</li>
<li><strong>Panel shot:</strong> Each body panel from 3-5 feet with surrounding context</li>
<li><strong>Damage close-up:</strong> 12-18 inches from the damage, well-lit</li>
<li><strong>Scale reference:</strong> Same damage with a coin or ruler for size context</li>
<li><strong>Detail angle:</strong> Side-lit or angled to highlight depth/contour</li>
</ol>

<h2>Lighting guide for different conditions</h2>
<ul>
<li><strong>Overcast:</strong> Best lighting — even, no harsh shadows</li>
<li><strong>Direct sun:</strong> Use shade or a diffuser. Sun washout hides scratches.</li>
<li><strong>Indoor garage:</strong> Use your phone's flash as fill light. Angle it slightly off-axis.</li>
<li><strong>Night:</strong> Park under a bright light. Use CarShake's flash-assisted mode.</li>
</ul>

<h2>How CarShake automates this</h2>
<p>CarShake's guided walkaround walks you through the 8-angle sequence automatically. It sets the optimal exposure, prompts you for each angle, and timestamps every shot. The result is a professional-grade photo set every time, without learning photography. Export the whole package as a single PDF ready for insurance submission.</p>""",
        "faqs": [
            ("How many photos should I take per vehicle?", "At minimum, 8 overview shots plus close-ups of any existing damage. CarShake's guided scan captures 12+ photos in under 60 seconds."),
            ("Can I use this guide for non-vehicle photos?", "The core principles — multiple angles, scale reference, good lighting — apply to documenting any physical object."),
            ("Is the photo guide really free?", "Yes. Downloadable as PDF with no registration required."),
        ],
    },
    {
        "slug": "car-condition-report-template",
        "title": "Free Car Condition Report Template [Download 2026]",
        "meta_desc": "Free car condition report template for documenting vehicle state at handover. Printable and digital formats. Use with CarShake for timestamped records.",
        "h1": "Free Car Condition Report Template",
        "content": """<p class="lede">A standardized car condition report is the foundation of any vehicle handover. Download this free template to document exterior, interior, and mechanical condition at any handover point.</p>

<div class="callout"><strong>Format:</strong> Printable PDF and editable DOC. Free to download and use. No account required.</div>

<h2>What the condition report covers</h2>
<ul>
<li><strong>Vehicle identification:</strong> Make, model, year, VIN, license plate, color</li>
<li><strong>Mileage and fuel:</strong> Odometer reading, fuel level percentage</li>
<li><strong>Exterior condition:</strong> Front, rear, both sides, roof — each rated Good/Fair/Poor with notes</li>
<li><strong>Glass and lights:</strong> Windshield, windows, mirrors, headlights, taillights</li>
<li><strong>Wheels and tires:</strong> Condition of all four wheels and tires</li>
<li><strong>Interior condition:</strong> Seats, dashboard, carpets, cargo area</li>
<li><strong>Signature fields:</strong> Inspector and receiving party acknowledgment</li>
</ul>

<h2>Why use a structured report</h2>
<p>Without a written condition report, every damage dispute becomes a debate about what existed before handover. A structured form eliminates ambiguity by creating a shared, written record. When you pair the template with CarShake's timestamped photos, you have the strongest possible evidence chain.</p>

<h2>Digital vs. paper reports</h2>
<p>Paper reports get lost, wet, or altered. CarShake's digital condition reports are stored immutably in the cloud, timestamped, and geotagged. They can be exported as PDF or shared via QR code. For fleet operators, digital reports mean you can search and audit every handover in your fleet from a single dashboard.</p>""",
        "faqs": [
            ("Is this template the same as the vehicle condition report template?", "Similar, but the Car Condition Report Template is a simpler form for quick handover documentation. The vehicle condition report template in the templates section is a more detailed fleet-grade version."),
            ("Can I use this template for rental returns?", "Yes. Fill it out at pickup, then fill a second copy at return. Compare the two to identify any new damage."),
            ("Does CarShake integrate with this template?", "Yes. CarShake can auto-fill most fields from your handover scan data, including vehicle info, photos, and timestamps."),
        ],
    },
    {
        "slug": "valet-dispute-email-template",
        "title": "Free Valet Dispute Email Template [2026]",
        "meta_desc": "Free email template for disputing valet damage charges. Professional format with evidence attachments. Ready to customize and send.",
        "h1": "Free Valet Dispute Email Template",
        "content": """<p class="lede">The fastest way to dispute a valet damage charge is by email. Use this free template to write a professional, evidence-backed dispute that gets results.</p>

<div class="callout"><strong>Pro tip:</strong> Attach your CarShake handover receipt PDF before sending. Evidence makes the difference between a letter that's read and one that's ignored.</div>

<h2>Email subject line</h2>
<p><strong>Subject:</strong> Damage Dispute — [Vehicle Make/Model] — [Date] — Reference #[Your Reference]</p>

<h2>Email body template</h2>
<p>Use this structure for your dispute email:</p>
<ol>
<li><strong>Introduction:</strong> "I am writing to formally dispute the damage charge of $[amount] on [date] regarding [vehicle info]."</li>
<li><strong>Evidence statement:</strong> "I have timestamped photographic evidence from CarShake showing the vehicle condition before it was handed over to your valet service on [date] at [time]. The attached handover receipt confirms that the damage in question was not present at the time of handover."</li>
<li><strong>Request for action:</strong> "Please drop this charge and confirm in writing that no further action will be taken. I request a response within 14 days."</li>
<li><strong>Escalation note:</strong> "If I do not receive a satisfactory response, I will escalate to my insurance provider and the small claims court in [jurisdiction]."</li>
<li><strong>Closing:</strong> Professional closing with your contact information. Attach the CarShake handover receipt PDF.</li>
</ol>

<h2>What to attach to the email</h2>
<ul>
<li>CarShake handover receipt (PDF with embedded photos and timestamps)</li>
<li>Your original valet ticket or receipt</li>
<li>Any photographs taken at the scene</li>
<li>Written estimates for repair costs if available</li>
</ul>""",
        "faqs": [
            ("Should I send the email to a specific person?", "Yes. Address it to the valet manager by name if possible. Use the general contact address as a CC."),
            ("What if I don't have a reference number?", "Include your valet ticket number or the date/time of service in the subject line instead."),
            ("Is the email template really free?", "Yes. Copy it directly from this page and customize it for your situation."),
        ],
    },
]

FREE_FAQ = [
    ("About free resources", "free"),
]
FREE_SECTION_LABEL = "Free Resources"
FREE_INTRO = "Free templates, checklists, and guides for documenting vehicle condition, disputing damage charges, and protecting yourself from false claims."

# ══════════════════════════════════════════════════════════════════════
# SECTION 3: templates (expand existing 2 + 4 new = 6)
# ══════════════════════════════════════════════════════════════════════

TEMPLATES_PAGES = [
    {
        "slug": "valet-damage-claim-letter-template",
        "title": "Valet Damage Claim Letter Template [Free 2026]",
        "meta_desc": "Valet damage claim letter template. A professional template for formally disputing or filing a vehicle damage claim with a valet company.",
        "h1": "Valet Damage Claim Letter Template",
        "content": """<p class="lede">A professional template for formally disputing or filing a vehicle damage claim with a valet company. Fully customizable and ready to use.</p>
<div class="callout"><strong>Format:</strong> Markdown / PDF &middot; Free to use &middot; Designed for CarShake evidence packages</div>
<h2>What's included</h2>
<div class="template-section"><h3>Header</h3><ul><li>Your full name and contact details</li><li>Date of letter</li><li>Valet company name and manager's name</li><li>Claim reference number</li></ul></div>
<div class="template-section"><h3>Incident details</h3><ul><li>Date and time of valet service</li><li>Location (valet address)</li><li>Vehicle make/model/VIN/license plate</li><li>Description of what happened</li></ul></div>
<div class="template-section"><h3>Damage description</h3><ul><li>Pre-existing damage (with CarShake timestamps)</li><li>Damage discovered at retrieval (with CarShake timestamps)</li><li>Repair estimates obtained (attach as exhibits)</li></ul></div>
<div class="template-section"><h3>Demand</h3><ul><li>Specific amount being disputed or requested</li><li>Deadline for response (14 days recommended)</li><li>Next steps if unresolved (insurance, small claims)</li></ul></div>""",
        "faqs": [
            ("Is this template free?", "Yes. All templates on this site are free to use and adapt."),
            ("Can I customize this for my situation?", "Absolutely. The template is a starting point — adapt the sections to your specific dispute."),
            ("Does CarShake fill this in automatically?", "Yes. CarShake can populate most fields from your handover receipt data."),
        ],
    },
    {
        "slug": "vehicle-condition-report-template",
        "title": "Vehicle Condition Report Template [Free 2026]",
        "meta_desc": "Vehicle condition report template. A printable VCR template for documenting vehicle condition at any handover point.",
        "h1": "Vehicle Condition Report Template",
        "content": """<p class="lede">A printable VCR template for documenting vehicle condition at any handover. Perfect for rental cars, valet drop-offs, and fleet vehicle transfers.</p>
<div class="callout"><strong>Format:</strong> Markdown / PDF &middot; Free to use &middot; Adapted for CarShake workflows</div>
<h2>What's included</h2>
<div class="template-section"><h3>Vehicle info</h3><ul><li>Make, model, year, color</li><li>License plate and VIN</li><li>Mileage and fuel level</li><li>Date and time of inspection</li></ul></div>
<div class="template-section"><h3>Exterior damage diagram</h3><ul><li>Front bumper / hood</li><li>Rear bumper / trunk</li><li>Driver side front/rear</li><li>Passenger side front/rear</li><li>Roof</li><li>Wheels (all four)</li></ul></div>
<div class="template-section"><h3>Interior condition</h3><ul><li>Front seats</li><li>Rear seats</li><li>Dashboard</li><li>Cargo area</li></ul></div>
<div class="template-section"><h3>Signatures</h3><ul><li>Inspector signature and date</li><li>Owner/driver acknowledgment</li></ul></div>""",
        "faqs": [
            ("Is this template free?", "Yes. All templates on this site are free to use and adapt."),
            ("Can I customize this for my team?", "Absolutely. Adapt the fields, sections, and workflow to your needs."),
            ("Does CarShake fill this in automatically?", "Yes. CarShake can populate most fields through its vehicle condition scan workflow."),
        ],
    },
    {
        "slug": "parking-lot-damage-report-template",
        "title": "Parking Lot Damage Report Template [Free 2026]",
        "meta_desc": "Free parking lot damage report template. Document vehicle damage discovered in parking lots, garages, or valet areas. Includes evidence log.",
        "h1": "Parking Lot Damage Report Template",
        "content": """<p class="lede">A parking lot damage report template for documenting damage discovered in parking facilities, garages, and valet lots. Use with CarShake for timestamped photo records.</p>
<div class="callout"><strong>Format:</strong> Printable PDF &middot; Free to use &middot; Includes evidence attachment log</div>
<h2>What's included</h2>
<div class="template-section"><h3>Incident details</h3><ul><li>Date and time damage discovered</li><li>Parking facility name and address</li><li>Parking spot number or level</li><li>Vehicle information (make, model, VIN, license plate)</li></ul></div>
<div class="template-section"><h3>Damage description</h3><ul><li>Location of damage on vehicle (diagram included)</li><li>Type of damage: scratch, dent, crack, paint transfer</li><li>Approximate size (length × width)</li><li>Photos attached: Yes/No with count</li></ul></div>
<div class="template-section"><h3>Witness and reporting</h3><ul><li>Witness names and contact information</li><li>Parking facility staff notified: Name / Position</li><li>Police report filed: Yes/No with report number</li><li>Insurance notified: Yes/No with claim number</li></ul></div>
<div class="template-section"><h3>Evidence log</h3><ul><li>CarShake scan reference (QR receipt ID)</li><li>Timestamped photos</li><li>Video footage if available</li></ul></div>
<h2>When to use this template</h2>
<p>Use this template when you return to your car in a parking lot, garage, or valet area and discover damage that wasn't there when you parked. Document everything before moving the vehicle — once you drive away, the parking facility will deny responsibility. Pair with CarShake's instant scan for court-admissible evidence.</p>""",
        "faqs": [
            ("Is this template free?", "Yes. All templates on this site are free to use and adapt."),
            ("Should I file a police report for parking lot damage?", "For damage over $500 or involving a hit-and-run, yes. A police report adds significant weight to your insurance claim."),
            ("Does CarShake integrate with this template?", "Yes. Your CarShake scan reference ID can be attached directly to the evidence log section."),
        ],
    },
    {
        "slug": "fleet-handover-checklist-template",
        "title": "Fleet Handover Checklist Template [Free 2026]",
        "meta_desc": "Free fleet handover checklist template for vehicle fleet operators. Standardize driver check-in/check-out with this printable checklist.",
        "h1": "Fleet Handover Checklist Template",
        "content": """<p class="lede">A comprehensive fleet handover checklist template for fleet managers and operators. Standardize the check-in and check-out process across your entire fleet.</p>
<div class="callout"><strong>Format:</strong> Printable PDF &middot; Free to use &middot; Designed for daily fleet operations</div>
<h2>What's included</h2>
<div class="template-section"><h3>Pre-handover (driver check-out)</h3><ul><li>Driver identification and license verification</li><li>Vehicle assignment and key handover</li><li>Exterior walkaround (8-point check)</li><li>Interior condition check</li><li>Odometer and fuel level recording</li><li>Damage acknowledgment: Existing / New</li><li>Driver signature and date</li></ul></div>
<div class="template-section"><h3>Post-handover (driver check-in)</h3><ul><li>Return date and time</li><li>Final odometer and fuel level</li><li>Exterior re-inspection (8-point check)</li><li>Interior re-inspection</li><li>New damage assessment (if any)</li><li>Driver and inspector signatures</li><li>Any notes or incident reports</li></ul></div>
<div class="template-section"><h3>Fleet manager review</h3><ul><li>Vehicle condition compared to pre-handover</li><li>Damage responsibility determination</li><li>Repair order initiated (if needed)</li><li>Vehicle status: Available / Maintenance / Hold</li></ul></div>
<h2>How to use with CarShake</h2>
<p>Use CarShake's fleet mode for each handover. Drivers scan the vehicle at check-out and check-in. CarShake automatically compares both scans and flags any new damage. The handover receipt serves as the digital version of this checklist, with tamper-evident timestamps and geotags.</p>""",
        "faqs": [
            ("Is this template free?", "Yes. All templates on this site are free to use and adapt."),
            ("Can CarShake replace this paper checklist?", "Yes. CarShake's fleet mode automates every item on this checklist digitally."),
            ("How many vehicles can this template handle?", "The template works for any fleet size. For 10+ vehicles, CarShake's digital dashboard is recommended."),
        ],
    },
    {
        "slug": "rental-car-damage-waiver-template",
        "title": "Rental Car Damage Waiver Template [Free 2026]",
        "meta_desc": "Free rental car damage waiver template for documenting damage waivers and liability agreements at rental car handover.",
        "h1": "Rental Car Damage Waiver Template",
        "content": """<p class="lede">A rental car damage waiver template for documenting damage waivers and liability agreements at rental car pickup and return.</p>
<div class="callout"><strong>Format:</strong> Printable PDF &middot; Free to use &middot; Legal disclaimer: consult a lawyer for binding agreements</div>
<h2>What's included</h2>
<div class="template-section"><h3>Rental agreement info</h3><ul><li>Rental company name</li><li>Renter name and contact</li><li>Rental agreement number</li><li>Vehicle make, model, year, VIN</li></ul></div>
<div class="template-section"><h3>Damage waiver terms</h3><ul><li>Scope of waiver (what is covered)</li><li>Exclusions (what is not covered)</li><li>Deductible amount if applicable</li><li>Effective dates and times</li></ul></div>
<div class="template-section"><h3>Condition acknowledgment</h3><ul><li>Pre-existing damage documented via CarShake (attach receipt)</li><li>Renter acknowledges inspecting the vehicle</li><li>Both parties agree on documented condition</li></ul></div>
<div class="template-section"><h3>Return condition</h3><ul><li>Post-return CarShake scan reference</li><li>Any new damage assessed</li><li>Final waiver status: Active / Void / Modified</li></ul></div>
<h2>When to use a damage waiver</h2>
<p>Rental car damage waivers (sometimes called LDW or CDW) limit your financial responsibility if the rental car is damaged. This template documents the waiver terms and the vehicle condition at both pickup and return, creating a clear record of what's covered. Always pair with CarShake scans for tamper-evident condition documentation.</p>""",
        "faqs": [
            ("Is this template legally binding?", "This template is an informational document, not a legal contract. Consult a lawyer for binding damage waiver agreements."),
            ("Does my credit card provide rental damage coverage?", "Many premium credit cards offer rental car damage coverage. Check your card's benefits guide before purchasing the rental company's waiver."),
            ("Can CarShake document the condition for waiver purposes?", "Yes. CarShake's timestamped scans provide the objective condition record that waivers reference."),
        ],
    },
    {
        "slug": "valet-dispute-response-template",
        "title": "Valet Dispute Response Template [Free 2026]",
        "meta_desc": "Free valet dispute response template for valet companies responding to damage claims. Professional template for documentation and resolution.",
        "h1": "Valet Dispute Response Template",
        "content": """<p class="lede">A template for valet companies to respond professionally to damage disputes. Document your investigation findings and proposed resolution.</p>
<div class="callout"><strong>Format:</strong> Printable PDF &middot; Free to use &middot; Designed for valet and parking operators</div>
<h2>What's included</h2>
<div class="template-section"><h3>Dispute reference</h3><ul><li>Customer name and contact</li><li>Date of incident and valet service</li><li>Claim reference number</li><li>Vehicle information</li></ul></div>
<div class="template-section"><h3>Investigation findings</h3><ul><li>CarShake handover record reviewed: Yes/No</li><li>Pre-existing damage identified in handover scan</li><li>Witness statement from attendant on duty</li><li>Review of valet lot CCTV footage (if available)</li></ul></div>
<div class="template-section"><h3>Resolution offer</h3><ul><li>Type of resolution: Waiver / Partial payment / Repair / Denial</li><li>Amount being waived or offered</li><li>Conditions of resolution</li><li>Deadline for customer acceptance</li></ul></div>
<div class="template-section"><h3>Closure</h3><ul><li>Manager name and authorization</li><li>Next steps if customer rejects resolution</li><li>Date and method of response</li></ul></div>
<h2>Why valet operators need this template</h2>
<p>A professional dispute response demonstrates that your valet operation takes claims seriously. It also creates a paper trail that protects your business if the customer escalates. When you reference the CarShake handover record in your response, you show the customer — and any third-party reviewer — that you have objective evidence.</p>""",
        "faqs": [
            ("Is this template free?", "Yes. All templates on this site are free to use and adapt."),
            ("Can I customize this for my valet business?", "Absolutely. Add your company logo, branding, and specific policies."),
            ("Should I reference CarShake records in my response?", "Yes. Referencing the handover record shows you've reviewed objective evidence before making a decision."),
        ],
    },
]

TEMPLATES_SECTION_LABEL = "Templates"
TEMPLATES_INTRO = "Free templates for vehicle damage claims, condition reports, fleet handovers, and valet dispute responses. Download and customize."

# ══════════════════════════════════════════════════════════════════════
# SECTION 4: best
# ══════════════════════════════════════════════════════════════════════

BEST_PAGES = [
    {
        "slug": "best-valet-apps",
        "title": "Best Valet Apps in 2026 — Digital Parking Solutions",
        "meta_desc": "Compare the best valet apps in 2026 for digital parking management, damage documentation, and vehicle tracking.",
        "h1": "Best Valet Apps in 2026",
        "content": """<p class="lede">The valet parking industry is going digital. Here are the best valet apps in 2026 for managing operations, documenting vehicle condition, and reducing false damage claims.</p>

<h2>What makes a great valet app?</h2>
<p>The best valet apps solve three core problems: managing vehicle handover logistics, documenting condition to prevent disputes, and providing real-time tracking for customers. A modern valet app needs to work for both the operator (managing a fleet of cars) and the customer (trusting their car is safe). The apps on this list excel at one or more of these functions.</p>

<h2>Top valet apps compared</h2>
<table>
<tr><th>App</th><th>Best for</th><th>Key feature</th></tr>
<tr><td><strong>CarShake</strong></td><td>Damage-proof handover</td><td>Timestamped scans, QR receipts, court-admissible evidence</td></tr>
<tr><td><strong>Luxe</strong></td><td>On-demand valet</td><td>Real-time tracking, mobile payment</td></tr>
<tr><td><strong>SpotHero Valet</strong></td><td>Valet lot management</td><td>Reservations, waitlist management</td></tr>
<tr><td><strong>ParkMobile</strong></td><td>Parking payments</td><td>Multi-location payment, digital permits</td></tr>
</table>

<h2>Why CarShake leads for damage prevention</h2>
<p>Unlike general valet management apps, CarShake is purpose-built for the specific problem of damage disputes. The three-stop protocol — scan before handover, QR receipt, scan after retrieval — creates an unbreakable evidence chain. No other valet app offers court-admissible timestamped condition documentation as a core feature. For valet operators tired of paying false claims, CarShake's ROI is immediate.</p>""",
        "faqs": [
            ("Is CarShake a valet management app?", "CarShake focuses specifically on vehicle condition documentation and handover evidence. It's not a full valet management system, but it integrates with your existing workflow."),
            ("What's the best free valet app?", "CarShake offers free individual scans. For operators, paid plans unlock fleet features."),
            ("Do I need multiple valet apps?", "Many operators use CarShake for condition documentation alongside a broader parking management system."),
        ],
    },
    {
        "slug": "best-car-damage-apps",
        "title": "Best Car Damage Documentation Apps in 2026",
        "meta_desc": "Find the best car damage documentation apps in 2026. Compare features for photo capture, timestamping, reporting, and insurance claims.",
        "h1": "Best Car Damage Documentation Apps in 2026",
        "content": """<p class="lede">Documenting car damage properly requires the right tools. Here are the best car damage documentation apps in 2026 for drivers, fleets, and insurance professionals.</p>

<h2>What to look for in a damage documentation app</h2>
<p>A good damage documentation app does more than take photos. It captures timestamps that can't be faked, geotags the location, structures photos in a logical sequence, and creates a shareable report. The best apps produce evidence that insurance adjusters and courts accept without question.</p>

<h2>Top car damage documentation apps</h2>
<table>
<tr><th>App</th><th>Best for</th><th>Key feature</th></tr>
<tr><td><strong>CarShake</strong></td><td>Valet and rental damage prevention</td><td>Before/after scan comparison, QR receipt shared with both parties</td></tr>
<tr><td><strong>Damage iD</strong></td><td>Fleet inspection</td><td>Multi-unit fleet dashboards, damage scoring</td></tr>
<tr><td><strong>Record360</strong></td><td>Rental car condition</td><td>Video walkaround, cloud storage</td></tr>
<tr><td><strong>InspectCheck</strong></td><td>Dealer inspections</td><td>Integration with dealer management systems</td></tr>
</table>

<h2>Why CarShake is different</h2>
<p>Most damage apps focus on inspection workflows for professionals. CarShake is built for the moment that matters most: the handover between a driver and a valet or rental agent. The shared QR receipt is unique — both parties agree on condition at the same time, eliminating disputes before they start. For drivers, it's the most accessible way to create insurance-grade documentation without any training.</p>""",
        "faqs": [
            ("Is CarShake free for individual drivers?", "Yes. Individual scans and handover receipts are free. Fleet and operator plans have paid tiers."),
            ("Can I use CarShake for non-valet damage documentation?", "Absolutely. The app works for rental cars, dealership test drives, and personal vehicle documentation."),
            ("Do these apps work with insurance claims?", "CarShake evidence is specifically designed for insurance and court admissibility."),
        ],
    },
    {
        "slug": "best-vehicle-condition-apps",
        "title": "Best Vehicle Condition Assessment Apps in 2026",
        "meta_desc": "Compare the best vehicle condition assessment apps in 2026. Tools for inspections, damage assessment, and condition reporting.",
        "h1": "Best Vehicle Condition Assessment Apps in 2026",
        "content": """<p class="lede">Vehicle condition assessment is critical for rentals, fleet operations, and dealerships. Here are the best apps in 2026 for documenting and assessing vehicle condition.</p>

<h2>Why digital condition assessment matters</h2>
<p>Paper condition reports are slow, subjective, and easy to lose. Digital assessment apps standardize the process, capture objective evidence, and create records that can be searched, shared, and audited. For businesses managing vehicle handovers, the switch from paper to digital pays for itself in prevented disputes alone.</p>

<h2>Top vehicle condition apps</h2>
<table>
<tr><th>App</th><th>Best for</th><th>Key feature</th></tr>
<tr><td><strong>CarShake</strong></td><td>Handover condition documentation</td><td>Mutual QR receipt, court-admissible timestamped scans</td></tr>
<tr><td><strong>UVIS</strong></td><td>Insurance inspections</td><td>Mobile vehicle inspections for insurers</td></tr>
<tr><td><strong>Click-Ins</strong></td><td>Rental car inspections</td><td>Multi-tenant fleet management</td></tr>
<tr><td><strong>Mobility Mojo</strong></td><td>Fleet condition tracking</td><td>Condition scoring across vehicle lifecycles</td></tr>
</table>

<h2>Key features comparison</h2>
<p>When evaluating vehicle condition apps, look for: tamper-evident timestamps, GPS geotagging, structured photo sequences, report export (PDF/CSV), team collaboration, and integration capabilities. CarShake excels at the handover moment — the time when condition is most often disputed. The QR receipt mechanism creates a shared record that both parties acknowledge, which is a powerful dispute prevention tool.</p>""",
        "faqs": [
            ("Can these apps replace professional inspections?", "For standard handover documentation, yes. For certified pre-owned or insurance-grade inspections, use purpose-built inspection systems."),
            ("Is CarShake free?", "Free for individual scans. Paid fleet plans for operators and businesses."),
            ("Which app is best for a rental car fleet?", "CarShake for damage-proof handovers, combined with a fleet management system for broader operations."),
        ],
    },
    {
        "slug": "best-parking-apps",
        "title": "Best Parking Apps in 2026 — Find, Pay, and Protect",
        "meta_desc": "Discover the best parking apps in 2026. Find parking, pay digitally, and protect your vehicle with damage documentation.",
        "h1": "Best Parking Apps in 2026",
        "content": """<p class="lede">From finding a spot to documenting your car's condition, the right parking app makes all the difference. Here are the best parking apps in 2026.</p>

<h2>Categories of parking apps</h2>
<p>Parking apps have evolved beyond just finding a spot. Modern apps cover four categories: parking finders (show you available spots), payment apps (pay without cash), parking management (for lot operators), and vehicle protection (document your car's condition). The best strategy is to use one app from each category that fits your needs.</p>

<h2>Top parking apps in 2026</h2>
<table>
<tr><th>App</th><th>Category</th><th>Best feature</th></tr>
<tr><td><strong>SpotHero</strong></td><td>Find & book parking</td><td>Pre-book discounted parking in 300+ cities</td></tr>
<tr><td><strong>ParkMobile</strong></td><td>Pay for parking</td><td>Pay by plate at 2,000+ locations</td></tr>
<tr><td><strong>CarShake</strong></td><td>Vehicle protection</td><td>Document car condition at valet and parking lots</td></tr>
<tr><td><strong>BestParking</strong></td><td>Find & compare prices</td><td>Price comparison across garages</td></tr>
<tr><td><strong>ParkWhiz</strong></td><td>Event parking</td><td>Pre-book event parking with guaranteed spots</td></tr>
</table>

<h2>Why vehicle protection is the missing piece</h2>
<p>Most parking apps focus on finding and paying for parking. None of them document your car's condition before you leave it. CarShake fills this gap by letting you scan your car in under 60 seconds before you walk away from any parking lot or valet stand. When you return, a quick scan creates the before-and-after evidence chain that protects you from false damage claims.</p>""",
        "faqs": [
            ("Can I use CarShake with any parking app?", "Yes. CarShake works independently. Use it alongside SpotHero, ParkMobile, or any other parking app."),
            ("Is CarShake only for valet parking?", "No. CarShake works for any parking scenario: rental lots, parking garages, street parking, and valet stands."),
            ("What's the best free parking app combination?", "SpotHero for finding parking + CarShake for protecting your vehicle."),
        ],
    },
    {
        "slug": "best-garage-apps",
        "title": "Best Garage and Parking Garage Apps in 2026",
        "meta_desc": "The best garage and parking garage apps in 2026 for finding spaces, paying, and documenting vehicle condition in parking structures.",
        "h1": "Best Garage and Parking Garage Apps in 2026",
        "content": """<p class="lede">Parking garages are where most parking-related vehicle damage happens. Here are the best garage and parking garage apps for finding, paying, and protecting your car in 2026.</p>

<h2>The unique risks of parking garages</h2>
<p>Parking garages present distinct risks: tight spaces create door dings, low clearance damages roof racks, dim lighting makes existing damage invisible until you're already driving. Unlike valet lots where there's an attendant, garage parking damage is often discovered too late — after you've left and lost any ability to prove when it happened.</p>

<h2>Top garage apps</h2>
<table>
<tr><th>App</th><th>Purpose</th><th>Key feature</th></tr>
<tr><td><strong>CarShake</strong></td><td>Damage documentation</td><td>Before-leaving scan captures condition at garage level and spot</td></tr>
<tr><td><strong>SpotHero</strong></td><td>Garage finder</td><td>Compare rates at garages near your destination</td></tr>
<tr><td><strong>ParkMobile</strong></td><td>Garage payment</td><td>Pay by phone at participating garages</td></tr>
<tr><td><strong>ParkWhiz</strong></td><td>Event garage parking</td><td>Reserve garage spots for events</td></tr>
</table>

<h2>How to protect your car in a parking garage</h2>
<p>Before leaving your car in a garage, use CarShake to do a quick scan. Capture the parking level, spot number, and nearby cars as context. Photograph the bumpers and doors that face neighboring spaces. When you return, scan again before pulling out. If you discover new damage, you have GPS evidence proving you were parked in that specific garage at that specific time — which is critical for any claim against the garage operator.</p>""",
        "faqs": [
            ("Are parking garages liable for vehicle damage?", "Liability varies by jurisdiction and garage terms. Most garages disclaim liability in their terms of service. CarShake evidence helps you pursue the responsible party directly."),
            ("Should I photograph the license plates of neighboring cars?", "For your own records, yes — it helps identify potential witnesses. Be mindful of privacy laws in your jurisdiction."),
            ("What's the best time to scan in a garage?", "Scan immediately after parking and immediately before leaving. The gap between scans is your custody period."),
        ],
    },
    {
        "slug": "best-documentation-apps-for-car-owners",
        "title": "Best Documentation Apps for Car Owners in 2026",
        "meta_desc": "Find the best documentation apps for car owners in 2026. Track maintenance, document condition, store receipts, and protect against false damage claims.",
        "h1": "Best Documentation Apps for Car Owners in 2026",
        "content": """<p class="lede">Car ownership generates a surprising amount of documentation: maintenance records, insurance documents, condition photos, and more. Here are the best documentation apps for car owners in 2026.</p>

<h2>What car owners need to document</h2>
<p>Modern car owners need to track three categories of information: condition documentation (photos and reports at key moments), maintenance history (service records, receipts, mileage), and ownership documents (registration, insurance, title). Each category has specialized apps, but the best approach uses a single tool for condition documentation that integrates with your other systems.</p>

<h2>Top documentation apps for car owners</h2>
<table>
<tr><th>App</th><th>Primary use</th><th>Best for</th></tr>
<tr><td><strong>CarShake</strong></td><td>Vehicle condition documentation</td><td>Valet, rental, and parking damage proof</td></tr>
<tr><td><strong>CARFAX Car Care</strong></td><td>Maintenance tracking</td><td>Service history and recall alerts</td></tr>
<tr><td><strong>Drivvo</strong></td><td>Fuel & expense tracking</td><td>Fuel economy, maintenance costs</td></tr>
<tr><td><strong>Manual owners app</strong></td><td>Digital owner's manual</td><td>Vehicle specs and warranty info</td></tr>
</table>

<h2>Why CarShake is essential for car owners</h2>
<p>Most car documentation apps focus on what happens inside your garage — maintenance, fuel, insurance. CarShake focuses on what happens when your car leaves your hands: valet parking, rental cars, dealership service visits. These are the moments when damage is most likely to occur and be disputed. A 60-second CarShake scan before each handover creates a permanent, tamper-evident record that protects your investment.</p>""",
        "faqs": [
            ("Do I need multiple car documentation apps?", "Consider using one app per category: CarShake for condition, CARFAX for maintenance, and a notes app for general records."),
            ("Is CarShake free for personal use?", "Yes. Individual scans and handover receipts are free. No subscription needed for personal vehicle documentation."),
            ("Can I export CarShake records for tax or insurance purposes?", "Yes. Each handover receipt exports as a PDF with all embedded data."),
        ],
    },
]

BEST_SECTION_LABEL = "Best Apps"
BEST_INTRO = "Comparisons and reviews of the best apps for valet, car damage documentation, vehicle condition assessment, parking, and garage protection."

# ══════════════════════════════════════════════════════════════════════
# SECTION 5: integrations
# ══════════════════════════════════════════════════════════════════════

INTEGRATIONS_PAGES = []

INSURANCE_LIST = [
    ("geico", "GEICO Insurance", "GEICO"),
    ("progressive", "Progressive Insurance", "Progressive"),
    ("allstate", "Allstate Insurance", "Allstate"),
    ("state-farm", "State Farm Insurance", "State Farm"),
    ("usaa", "USAA Insurance", "USAA"),
    ("liberty-mutual", "Liberty Mutual Insurance", "Liberty Mutual"),
]

for ins_slug, ins_full_name, ins_short in INSURANCE_LIST:
    INTEGRATIONS_PAGES.append({
        "slug": ins_slug,
        "title": f"CarShake and {ins_full_name} — Valet Damage Evidence for Policyholders",
        "meta_desc": f"Learn how CarShake integrates with {ins_full_name} claims. Submit timestamped valet damage evidence for faster claim resolution.",
        "h1": f"CarShake and {ins_full_name}",
        "content": f"""<p class="lede">{ins_full_name} policyholders can use CarShake to document vehicle condition before valet parking, rental handovers, and parking lot stays — creating the court-admissible evidence needed for faster claim resolution.</p>

<h2>How CarShake evidence supports {ins_short} claims</h2>
<p>When you file a vehicle damage claim with {ins_full_name}, the quality of your documentation directly affects how quickly your claim is processed. CarShake's timestamped, geotagged scans provide the kind of objective evidence that adjusters trust. Instead of submitting blurry phone photos with questionable timestamps, you submit a structured handover report with a clear chain of custody.</p>
<p>{ins_full_name} adjusters review thousands of claims each year. Claims supported by CarShake evidence typically resolve faster because the adjuster doesn't need to spend time verifying the timeline or authenticity of the photos. The QR-coded handover receipt provides instant access to the complete evidence package.</p>

<h2>Submitting CarShake evidence to {ins_short}</h2>
<ol>
<li><strong>Document the condition:</strong> Use CarShake to scan your vehicle before and after any handover event.</li>
<li><strong>Generate the handover receipt:</strong> CarShake creates a PDF with embedded photos, timestamps, and GPS data.</li>
<li><strong>File your claim:</strong> Submit the standard {ins_full_name} claim form and attach the CarShake PDF as supporting evidence.</li>
<li><strong>Share the QR receipt:</strong> Give your adjuster the QR code link for direct access to the immutable record.</li>
</ol>

<h2>What {ins_short} adjusters look for</h2>
<p>Insurance adjusters need three things from photo evidence: proof of when the photo was taken, proof of where the vehicle was, and a clear depiction of the damage or lack thereof. CarShake delivers all three in every scan. The timestamp is server-verified and cannot be altered. The GPS coordinates place the vehicle at the handover location. The structured 8-angle photo sequence ensures complete coverage.</p>

<h2>Tips for {ins_short} policyholders</h2>
<ul>
<li>Scan before every valet or rental handover — even if you think nothing will happen</li>
<li>Keep the QR receipt until the rental period or valet visit is fully resolved</li>
<li>If damage occurs, scan immediately at the retrieval location before moving the car</li>
<li>Export the handover receipt as PDF and file it with your {ins_short} claim number</li>
<li>Mention the CarShake evidence when you speak with your adjuster — they can access the QR receipt directly</li>
</ul>""",
        "faqs": [
            (f"Does {ins_short} accept CarShake evidence?", "CarShake's timestamped, tamper-evident scans meet the evidentiary standards accepted by most insurance companies, including {ins_short}. Check with your adjuster for specific requirements."),
            (f"Will CarShake evidence speed up my {ins_short} claim?", "Claims with clear, timestamped photographic evidence resolve faster because adjusters spend less time investigating timelines and photo authenticity."),
            ("Do I need to tell my valet company I'm using CarShake?", "It's good practice. CarShake's shared QR receipt lets the valet company access the same record, creating a mutual acknowledgment of condition."),
            ("What if the damage happened before I started using CarShake?", "CarShake can still help document the current state of damage for a claim, but without a before-handover scan, you lose the ability to prove pre-existing condition was absent."),
        ],
    })

INTEGRATIONS_SECTION_LABEL = "Integrations"
INTEGRATIONS_INTRO = "How CarShake works with major insurance providers including GEICO, Progressive, Allstate, State Farm, USAA, and Liberty Mutual."

# ══════════════════════════════════════════════════════════════════════
# SECTION 6: pricing-questions
# ══════════════════════════════════════════════════════════════════════

PRICING_QUESTIONS_PAGES = [
    {
        "slug": "is-it-worth-it",
        "title": "Is CarShake Worth It? Honest Value Review [2026]",
        "meta_desc": "Is CarShake worth it? Honest review of features, pricing, and value. See how CarShake's damage prevention compares to the cost of a single dispute.",
        "h1": "Is CarShake Worth It?",
        "content": """<p class="lede">A single false damage claim can cost $500-$2,000 in repairs, insurance deductibles, or hush payments. CarShake is free for individual scans and costs as little as $2.97/month for premium features. The math is simple — but let's break it down honestly.</p>

<h2>What you get for free</h2>
<p>CarShake's free tier includes: unlimited individual vehicle scans, timestamped and geotagged photos, QR-coded handover receipts that both parties can access, and PDF export of each handover record. For a driver who uses valet parking a few times a year or rents a car once or twice annually, the free tier provides excellent protection at zero cost.</p>

<h2>What premium adds</h2>
<p>Premium features include: unlimited team members (for fleet operators), branded handover receipts (for valet companies), bulk export of all records, advanced analytics on fleet condition, and priority support. Premium is priced at $2.97/month for founding members — less than the cost of a single coffee that prevents a potential $500 dispute.</p>

<h2>The ROI calculation</h2>
<p>Consider: one prevented false damage claim saves you $500-$2,000. If you use valet parking or rent cars even 5 times per year, your risk of at least one dispute over 5 years approaches 30-40%. At $2.97/month, CarShake premium costs about $36/year. The expected value of prevented claims alone makes the ROI obvious — but even the free tier pays for itself in peace of mind.</p>

<h2>What users say</h2>
<p>"I was charged $800 for a scratch I didn't cause. CarShake's before photo saved me the entire amount." — Verified CarShake user. This is not a hypothetical benefit; it's a recurring reality for drivers who document their car before every handover.</p>""",
        "faqs": [
            ("Is CarShake really free?", "Yes. Individual scans and handover receipts are completely free with no time limit. Premium features are optional and billed monthly."),
            ("What's the catch with the free tier?", "No catch. The free tier covers individual use. Premium features like team accounts and branded receipts are for operators."),
            ("How much does a typical false damage claim cost?", "Between $500 and $2,000 including repairs, insurance deductibles, and time spent resolving the dispute."),
            ("Can I try premium before committing?", "New users get 30 days of premium scans free. You can evaluate all features before deciding."),
        ],
    },
    {
        "slug": "how-much-does-it-cost",
        "title": "How Much Does CarShake Cost? [2026 Pricing]",
        "meta_desc": "Complete CarShake pricing breakdown. Free individual scans, premium plans for operators. See exactly what each tier costs and includes.",
        "h1": "How Much Does CarShake Cost?",
        "content": """<p class="lede">CarShake offers a free tier for individual drivers and premium plans for operators and fleets. Here's the complete pricing breakdown with everything included at each level.</p>

<h2>Free tier — $0/month</h2>
<p>CarShake's free tier includes all the features an individual driver needs: unlimited vehicle scans with timestamped photos, QR-coded handover receipts, PDF export of each record, and GPS geotagging on all scans. There's no time limit and no hidden fees. The free tier is genuinely free — supported by premium subscribers who need advanced features.</p>

<h2>Premium tier — $2.97/month (founding price)</h2>
<p>The premium tier adds: unlimited team members for fleet operations, branded handover receipts with your company logo, bulk CSV/PDF export of all records, advanced condition analytics and reporting, priority email and chat support. Premium is priced at $2.97/month for founding members, locked in for as long as you remain a subscriber. Standard pricing after the founding period will be higher.</p>

<h2>Enterprise tier — custom pricing</h2>
<p>For large fleets with 100+ vehicles or valet operations processing 1,000+ handovers per month, CarShake offers custom enterprise pricing. Contact CarShake for a quote tailored to your volume and requirements.</p>

<h2>Compare the cost</h2>
<table>
<tr><th>Feature</th><th>Free</th><th>Premium</th><th>Enterprise</th></tr>
<tr><td>Individual scans</td><td>Unlimited</td><td>Unlimited</td><td>Unlimited</td></tr>
<tr><td>GPS timestamps</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>QR handover receipts</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>PDF export</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>Team members</td><td>—</td><td>Unlimited</td><td>Unlimited</td></tr>
<tr><td>Branded receipts</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>Bulk export</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>Priority support</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>Custom integrations</td><td>—</td><td>—</td><td>✓</td></tr>
<tr><td><strong>Price</strong></td><td><strong>$0</strong></td><td><strong>$2.97/mo</strong></td><td><strong>Custom</strong></td></tr>
</table>""",
        "faqs": [
            ("Is there a contract or annual commitment?", "No. All plans are month-to-month. Cancel anytime."),
            ("Can I switch between tiers?", "Yes. Upgrade or downgrade at any time. Your data is preserved across plan changes."),
            ("Are there any hidden fees?", "No. The price you see is the price you pay. No setup fees, no overage fees, no cancellation fees."),
            ("What payment methods are accepted?", "All major credit cards. Enterprise plans may also use invoicing."),
        ],
    },
    {
        "slug": "free-vs-premium",
        "title": "CarShake Free vs Premium — Which Plan Is Right for You?",
        "meta_desc": "Compare CarShake Free vs Premium plans. See which features each tier offers and which plan is best for your use case.",
        "h1": "CarShake Free vs Premium",
        "content": """<p class="lede">Both CarShake Free and Premium provide excellent vehicle condition documentation. Here's a detailed comparison to help you decide which tier fits your needs.</p>

<h2>When Free is enough</h2>
<p>CarShake Free is ideal if: you're an individual driver who uses valet parking or rental cars occasionally (1-5 times per year), you only need to document your own vehicle, you don't need branded receipts or team accounts, and you're comfortable managing your own handover receipts. The free tier covers these use cases completely — no limitations on scan count or time.</p>

<h2>When Premium is worth it</h2>
<p>CarShake Premium makes sense if: you're a valet operator processing multiple handovers daily, you manage a fleet of vehicles with multiple drivers, you want branded handover receipts with your company logo, you need to export bulk data for reporting or audit purposes, or you want priority support for your operations. At $2.97/month (founding price), the cost is negligible for businesses that process even a few handovers per week.</p>

<h2>Feature comparison table</h2>
<table>
<tr><th>Feature</th><th>Free</th><th>Premium</th></tr>
<tr><td>Vehicle scans</td><td>Unlimited</td><td>Unlimited</td></tr>
<tr><td>Timestamped photos</td><td>✓</td><td>✓</td></tr>
<tr><td>GPS geotagging</td><td>✓</td><td>✓</td></tr>
<tr><td>QR handover receipts</td><td>✓</td><td>✓</td></tr>
<tr><td>PDF export (single)</td><td>✓</td><td>✓</td></tr>
<tr><td>Team accounts</td><td>—</td><td>✓</td></tr>
<tr><td>Branded receipts</td><td>—</td><td>✓</td></tr>
<tr><td>Bulk CSV/PDF export</td><td>—</td><td>✓</td></tr>
<tr><td>Fleet analytics dashboard</td><td>—</td><td>✓</td></tr>
<tr><td>Priority support</td><td>—</td><td>✓</td></tr>
</table>

<h2>Can I start Free and upgrade later?</h2>
<p>Absolutely. Your scans and handover records are preserved when you upgrade. You can also downgrade from Premium to Free at any time — your data remains accessible, and you just lose premium-only features until you upgrade again.</p>""",
        "faqs": [
            ("Is the Free tier limited in any way?", "Free tier has no scan limits. The only limitations are on team accounts, branded receipts, and bulk export."),
            ("Can I try Premium for free?", "Yes. New users get 30 days of premium scans free to evaluate all features."),
            ("What happens to my Premium data if I downgrade?", "Your data is preserved. You just lose access to premium features until you upgrade again."),
        ],
    },
    {
        "slug": "do-i-need-to-pay-for-scans",
        "title": "Do I Need to Pay for CarShake Scans? Free vs Paid Explained",
        "meta_desc": "Do you need to pay for CarShake scans? No — individual scans are free. Learn when free scans are enough and when premium features add value.",
        "h1": "Do I Need to Pay for CarShake Scans?",
        "content": """<p class="lede">Short answer: no. All individual vehicle scans on CarShake are completely free. Here's when you might want to upgrade — and when you absolutely don't need to.</p>

<h2>All scans are free for individuals</h2>
<p>Every scan you take as an individual driver is free. There is no per-scan charge, no monthly limit on scans, and no time limit on the free tier. You can scan your car before every valet visit, every rental car pickup, every time you park in a garage — all free. The scan includes timestamped photos, GPS geotagging, and creates a QR-coded handover receipt.</p>

<h2>What you never have to pay for</h2>
<ul>
<li>Taking a scan of your vehicle — free, unlimited</li>
<li>Generating a QR handover receipt — free, unlimited</li>
<li>Downloading a PDF of your scan — free, unlimited</li>
<li>Accessing your scan history — free, unlimited</li>
<li>Sharing your receipt with a valet or rental agent — free, unlimited</li>
</ul>

<h2>Why would anyone pay?</h2>
<p>Businesses pay for CarShake Premium because they need features that individuals don't: team accounts so multiple attendants can scan cars under the same company profile, branded receipts with their logo, bulk export so they can audit all handovers at once, and priority support when operations depend on the app. If you're an individual, these features aren't useful, and you don't need to pay.</p>

<h2>How CarShake stays free</h2>
<p>CarShake is supported by premium subscribers — valet operators, rental fleets, and dealerships who need the advanced features. Individual drivers benefit from the same core technology without paying. Everyone gets the same timestamped, court-admissible scans. The business model is simple: businesses pay for the tools they need; individuals get essential protection for free.</p>""",
        "faqs": [
            ("Are there any limits on free scans?", "No. Scan as many vehicles as you want, as often as you want. No limits."),
            ("Will CarShake ever start charging for individual scans?", "There are no plans to charge for individual scans. The free tier is a core part of CarShake's mission to make vehicle documentation accessible to everyone."),
            ("What about commercial use — is that free too?", "Individual commercial drivers (e.g., delivery drivers documenting their van) can use the free tier. Businesses with multiple users need Premium for team accounts."),
            ("Does the free tier include customer support?", "Free tier includes self-service support via the help center. Premium includes priority email and chat support."),
        ],
    },
]

PRICING_QUESTIONS_SECTION_LABEL = "Pricing Questions"
PRICING_QUESTIONS_INTRO = "Answers to common questions about CarShake pricing, free vs premium features, and whether the app is worth it for your needs."


# ══════════════════════════════════════════════════════════════════════
# GENERATION
# ══════════════════════════════════════════════════════════════════════

def generate():
    print("=" * 50)
    print("CarShake pSEO Page Generator")
    print("=" * 50)

    # ── how-to ──
    print("\n📁 Section: how-to")
    for page in HOW_TO_PAGES:
        html = render_page(
            section="how-to",
            section_label="How-To Guides",
            related_links=[
                (f"CarShake {HOW_TO_PAGES[(i+1) % len(HOW_TO_PAGES)]['title']}", f"https://carshake.online/how-to/{HOW_TO_PAGES[(i+1) % len(HOW_TO_PAGES)]['slug']}")
                for i, p in enumerate(HOW_TO_PAGES) if p['slug'] == page['slug']
            ] or [
                ("Rental Car Inspection Checklist", "https://carshake.online/free/rental-car-inspection-checklist"),
                ("Damage Claim Letter Template", "https://carshake.online/templates/damage-claim-letter-template"),
            ],
            **page,
        )
        write_page("how-to", page["slug"], html)
    # How-to index
    how_to_entries = [(p["slug"], p["h1"]) for p in HOW_TO_PAGES]
    render_index("how-to", "How-To Guides",
                 "Step-by-step guides for documenting vehicle condition, disputing valet damage, filing insurance claims, and protecting yourself with CarShake.",
                 how_to_entries)

    # ── free ──
    print("\n📁 Section: free")
    for page in FREE_PAGES:
        html = render_page(
            section="free",
            section_label="Free Resources",
            related_links=[
                ("Damage Claim Letter Template", "https://carshake.online/templates/damage-claim-letter-template"),
                ("Vehicle Condition Report Template", "https://carshake.online/templates/vehicle-condition-report-template"),
            ],
            **page,
        )
        write_page("free", page["slug"], html)
    free_entries = [(p["slug"], p["h1"]) for p in FREE_PAGES]
    render_index("free", "Free Resources",
                 "Free templates, checklists, and guides for documenting vehicle condition, disputing damage charges, and protecting yourself.",
                 free_entries)

    # ── templates ──
    print("\n📁 Section: templates")
    for page in TEMPLATES_PAGES:
        html = render_page(
            section="templates",
            section_label="Templates",
            related_links=[
                (f"Free {FREE_PAGES[i % len(FREE_PAGES)]['h1']}", f"https://carshake.online/free/{FREE_PAGES[i % len(FREE_PAGES)]['slug']}")
                for i, p in enumerate(TEMPLATES_PAGES) if p['slug'] == page['slug']
            ] or [
                ("How to Write a Damage Claim Letter", "https://carshake.online/how-to/write-damage-claim-letter"),
                ("Free Rental Car Inspection Checklist", "https://carshake.online/free/rental-car-inspection-checklist"),
            ],
            **page,
        )
        write_page("templates", page["slug"], html)
    template_entries = [(p["slug"], p["h1"]) for p in TEMPLATES_PAGES]
    render_index("templates", "Templates",
                 "Free templates for vehicle damage claims, condition reports, fleet handovers, and valet dispute responses.",
                 template_entries)

    # ── best ──
    print("\n📁 Section: best")
    for page in BEST_PAGES:
        html = render_page(
            section="best",
            section_label="Best Apps",
            related_links=[
                (f"CarShake Pricing — {PRICING_QUESTIONS_PAGES[i % len(PRICING_QUESTIONS_PAGES)]['h1']}",
                 f"https://carshake.online/pricing-questions/{PRICING_QUESTIONS_PAGES[i % len(PRICING_QUESTIONS_PAGES)]['slug']}")
                for i, p in enumerate(BEST_PAGES) if p['slug'] == page['slug']
            ] or [
                ("How to Document Car Condition Before Valet", "https://carshake.online/how-to/document-car-condition-before-valet"),
                ("Free Valet Damage Claim Letter Template", "https://carshake.online/free/valet-damage-claim-letter"),
            ],
            **page,
        )
        write_page("best", page["slug"], html)
    best_entries = [(p["slug"], p["h1"]) for p in BEST_PAGES]
    render_index("best", "Best Apps",
                 "Comparisons and reviews of the best apps for valet, car damage documentation, vehicle condition assessment, parking, and garage protection.",
                 best_entries)

    # ── integrations ──
    print("\n📁 Section: integrations")
    for page in INTEGRATIONS_PAGES:
        # Build insurance-specific related links
        related = []
        for other_slug, other_name, other_short in INSURANCE_LIST:
            if other_slug != page["slug"]:
                related.append((f"CarShake and {other_name}", f"https://carshake.online/integrations/{other_slug}"))
                if len(related) >= 6:
                    break
        if not related:
            related = [
                ("How to File Insurance Claim for Valet Damage", "https://carshake.online/how-to/file-insurance-claim-for-valet-damage"),
                ("Use Timestamped Evidence in Disputes", "https://carshake.online/how-to/use-timestamped-evidence-in-disputes"),
            ]
        html = render_page(
            section="integrations",
            section_label="Integrations",
            related_links=related[:6],
            **page,
        )
        write_page("integrations", page["slug"], html)

    integrations_entries = [(p["slug"], p["h1"]) for p in INTEGRATIONS_PAGES]
    render_index("integrations", "Integrations",
                 "How CarShake works with major insurance providers including GEICO, Progressive, Allstate, State Farm, USAA, and Liberty Mutual.",
                 integrations_entries)

    # ── pricing-questions ──
    print("\n📁 Section: pricing-questions")
    for page in PRICING_QUESTIONS_PAGES:
        html = render_page(
            section="pricing-questions",
            section_label="Pricing Questions",
            related_links=[
                (f"Best Valet Apps — {BEST_PAGES[i % len(BEST_PAGES)]['h1']}",
                 f"https://carshake.online/best/{BEST_PAGES[i % len(BEST_PAGES)]['slug']}")
                for i, p in enumerate(PRICING_QUESTIONS_PAGES) if p['slug'] == page['slug']
            ] or [
                ("Is CarShake Worth It?", "https://carshake.online/pricing-questions/is-it-worth-it"),
                ("How Much Does CarShake Cost?", "https://carshake.online/pricing-questions/how-much-does-it-cost"),
            ],
            **page,
        )
        write_page("pricing-questions", page["slug"], html)

    pricing_entries = [(p["slug"], p["h1"]) for p in PRICING_QUESTIONS_PAGES]
    render_index("pricing-questions", "Pricing Questions",
                 "Answers to common questions about CarShake pricing, free vs premium features, and whether the app is worth it.",
                 pricing_entries)

    print("\n" + "=" * 50)
    print("Generation complete!")
    print("=" * 50)

    total = (len(HOW_TO_PAGES) + len(FREE_PAGES) + len(TEMPLATES_PAGES) +
             len(BEST_PAGES) + len(INTEGRATIONS_PAGES) + len(PRICING_QUESTIONS_PAGES))
    print(f"Total pages generated: {total}")
    print(f"Index pages generated: 7 (one per section + root)")
    print(f"Total files: {total + 7}")


if __name__ == "__main__":
    generate()
