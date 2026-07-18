#!/usr/bin/env python3
"""pSEO Generator for carshake.online - expands thin page types."""
import os, json, re
from datetime import date

BASE = os.path.expanduser("~/carshake")
TODAY = date.today().isoformat()
DOMAIN = "carshake.online"
CANONICAL = f"https://{DOMAIN}"
PRODUCT = "CarShake"
TAGLINE = "Free Valet Damage-Proof & Car Handover App"

# ── PAGE TEMPLATE ──────────────────────────────────────────────
def head(title, desc, path, schema_blocks=""):
    url = f"{CANONICAL}{path}"
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{url}">
  <meta property="og:site_name" content="CarShake">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{desc}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="alternate" type="text/plain" title="LLMs.txt" href="{CANONICAL}/llms.txt">
  {schema_blocks}
  <link rel="stylesheet" href="/ux.css">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght=300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap" rel="stylesheet">
</head>
<body>
  <header>
    <nav><a href="/" class="logo">{PRODUCT}</a></nav>
  </header>
'''

def faq_schema(qa_pairs):
    items = []
    for q, a in qa_pairs:
        items.append(f'{{"@type":"Question","name":{json.dumps(q)},"acceptedAnswer":{{"@type":"Answer","text":{json.dumps(a)}}}}}')
    return f'<script type="application/ld+json">{{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{",".join(items)}]}}</script>'

def breadcrumb_schema(items):
    elems = []
    for i, (name, url) in enumerate(items, 1):
        u = url or (CANONICAL + "/")
        elems.append(f'{{"@type":"ListItem","position":{i},"name":{json.dumps(name)},"item":{json.dumps(u)}}}')
    return f'<script type="application/ld+json">{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{",".join(elems)}]}}</script>'

def article_schema(headline, desc, path):
    return f'<script type="application/ld+json">{{"@context":"https://schema.org","@type":"Article","headline":{json.dumps(headline)},"description":{json.dumps(desc)},"author":{{"@type":"Organization","name":"{PRODUCT}","url":"{CANONICAL}"}},"publisher":{{"@type":"Organization","name":"{PRODUCT}","url":"{CANONICAL}"}},"mainEntityOfPage":{{"@type":"WebPage","@id":"{CANONICAL}{path}"}},"datePublished":"{TODAY}","dateModified":"{TODAY}"}}</script>'

def page_body(title, paragraphs, faqs, cta_text="Get CarShake Free"):
    p_html = "\n".join(f'<p>{p}</p>' for p in paragraphs)
    faq_html = "\n".join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q, a in faqs)
    return f'''
  <main>
    <section class="hero">
      <h1>{title}</h1>
      <p class="lede">{paragraphs[0][:200] if paragraphs else ""}...</p>
    </section>
    <section class="content">
      {p_html}
    </section>
    <section class="faq">
      <h2>Frequently Asked Questions</h2>
      {faq_html}
    </section>
    <section class="cta">
      <h2>Try {PRODUCT} Today</h2>
      <p>Download the free app and never pay for damage you didn\'t cause.</p>
      <a href="/" class="btn">{cta_text}</a>
    </section>
  </main>
  <footer>
    <p>&copy; {TODAY[:4]} {PRODUCT}</p>
  </footer>
</body></html>'''

def write_page(section, slug, title, desc, paragraphs, faqs, path=None):
    if path is None:
        path = f"/{section}/{slug}"
    schemas = article_schema(title, desc, path) + "\n" + breadcrumb_schema([("Home", CANONICAL), (section.title(), f"{CANONICAL}/{section}"), (title, "")]) + "\n" + faq_schema(faqs)
    html = head(title, desc, path, schemas) + page_body(title, paragraphs, faqs)
    section_dir = os.path.join(BASE, section)
    os.makedirs(section_dir, exist_ok=True)
    out_path = os.path.join(section_dir, f"{slug}.html")
    with open(out_path, "w") as f:
        f.write(html)
    return out_path

def write_hub(section, title, desc, entries):
    """Write hub index page for a section."""
    links_html = "\n".join(f'<li><a href="/{section}/{e[0]}">{e[1]}</a></li>' for e in entries)
    body = f'''
  <main>
    <section class="hero">
      <h1>{title}</h1>
      <p>{desc}</p>
    </section>
    <section>
      <ul>{links_html}</ul>
    </section>
  </main>
</body></html>'''
    schemas = breadcrumb_schema([("Home", CANONICAL), (section.title(), "")])
    html = head(title, desc, f"/{section}", schemas) + body
    out_path = os.path.join(BASE, section, "index.html")
    with open(out_path, "w") as f:
        f.write(html)
    return out_path

# ── PAGE DATA ──────────────────────────────────────────────────

PAGES = {
    "how-to": [
        ("document-car-condition-before-valet", "How to Document Your Car Condition Before Valet Parking", [
            "Before handing your keys to a valet, documenting your car's condition is your best defense against false damage claims. A quick 5-minute walkaround with timestamped photos can save you hundreds of dollars in disputed repairs.",
            "Start by parking in a well-lit area. Walk around your entire vehicle, taking photos of every panel from multiple angles. Use your phone's camera in high-resolution mode—modern smartphone cameras are sufficient for court-admissible evidence.",
            "Focus on common damage zones: front and rear bumpers (most common for parking scrapes), door edges, wheel rims, and side mirrors. If you have pre-existing dents, scratches, or paint chips, document them clearly. Open the doors and photograph the door jambs—these are often missed.",
            "CarShake makes this easy: scan your car with a single tap, and the app time-stamps every photo with GPS location and an encrypted hash that's admissible in small claims court. The app stores your scan so you can reference it later if a damage claim appears.",
        ], [("How long does a car scan take?", "With CarShake, a full 360-degree scan takes under 2 minutes. The app guides you through each angle with visual cues."), ("Can I use regular phone photos?", "Yes, standard phone photos work. However, CarShake adds GPS coordinates, timestamps, and encryption that make your evidence court-admissible—regular photos can be disputed as manipulated."), ("What if I forget to scan before valet?", "If you remember within 5 minutes of parking, you can still scan. The app records the time, so any damage that predates your scan is still on record.")]),

        ("dispute-valet-damage-charges", "How to Dispute Valet Damage Charges and Win", [
            "Receiving a valet damage charge can be frustrating, especially when you know you didn't cause the damage. Here's exactly how to dispute these charges successfully, step by step.",
            "First, never admit fault. When a valet company calls about damage, your response should be professional but firm: 'I have timestamped documentation of my vehicle's condition before and after parking. Please send me your claim form and evidence.'",
            "If you used CarShake, you have the strongest possible evidence: a pre-park scan showing no damage, a QR-coded handover receipt, and a post-retrieval scan showing the damage. Forward these to the valet company's claims department immediately.",
            "Most valet damage charges are covered by the valet operator's insurance. They have a claims process—make them follow it. If the valet operator pushes back, you have options: escalate to their corporate office, file a complaint with your local consumer protection agency, or take them to small claims court (where your timestamped CarShake evidence is admissible).",
        ], [("What if I didn't scan before parking?", "Without a pre-park scan, it becomes your word against theirs. Some valet operators have security camera footage that may help. Always scan before valet parking—it's the only way to definitively prove the car's condition at handover."), ("How long do I have to dispute?", "Most valet operators require disputes within 7–30 days. Check your valet ticket or their website for their specific dispute window. The sooner you act, the better."), ("Can I take them to small claims court?", "Yes. Small claims court is designed for disputes under $5,000–$10,000 (varies by state). Your CarShake timestamped evidence is generally admissible as business records.")]),

        ("file-insurance-claim-for-valet-damage", "How to File an Insurance Claim for Valet Damage", [
            "Filing an insurance claim for valet damage is different from a regular auto claim because there are potentially three parties involved: you, the valet operator, and your insurance company. Understanding the process saves time and frustration.",
            "Step 1: Document everything. Take photos of the damage from multiple angles with a reference object (like a coin) for scale. Get the valet ticket, any witness statements, and surveillance footage if available. CarShake users should export their pre and post-park scans.",
            "Step 2: Contact the valet operator first. Most valet companies have their own insurance that covers damage up to a certain amount. Their claims adjuster will investigate. If they accept liability, the claim is handled entirely outside your insurance—meaning no premium increase for you.",
            "Step 3: If the valet company denies responsibility or their insurance doesn't cover the full amount, file with your auto insurance. Tell them it's a 'comprehensive claim' if possible (collision coverage can increase premiums). Your insurer may subrogate—sue the valet company to recover costs—if they accept fault.",
        ], [("Will my insurance go up?", "If the valet operator's insurance pays the claim, your premiums won't be affected. Only if you file through your own collision coverage might you see a rate increase on renewal."), ("What if the valet damage is minor?", "Even small scratches can cost $300–$800 to repair. Most deductibles are $500–$1,000. If the damage is below your deductible, consider paying out of pocket—but still get an estimate and keep the valet company accountable."), ("Does CarShake evidence help with insurance?", "Yes. Insurance adjusters specifically look for timestamped, geo-located evidence. CarShake scans provide exactly what they need to process claims faster.")]),

        ("rental-car-walkaround", "How to Do a Proper Rental Car Walkaround Inspection", [
            "A thorough rental car walkaround inspection is your best protection against unfair damage charges. Rental companies have been known to charge customers for pre-existing damage, so documenting everything before you drive off the lot is essential.",
            "Start at the rental counter: make sure the rental agreement has a diagram where you can mark existing damage. Don't accept a pre-filled diagram—walk around the actual car and compare. Any discrepancy should be noted before you sign.",
            "Take a video walkaround starting with the license plate (confirms the car's identity). Slowly walk around the entire vehicle, narrating each panel. Zoom in on any scratches, dents, or wear. Open all doors, the trunk, and the hood, checking for interior damage too.",
            "Use CarShake's rental car mode: scan the vehicle before accepting the keys. The app timestamps your scan with GPS coordinates and stores it securely. When you return the car, scan again to prove no new damage occurred during your rental period.",
        ], [("Do rental companies accept CarShake evidence?", "Yes. Major rental companies like Enterprise, Hertz, and Avis have damage claim departments that accept timestamped photo evidence. CarShake scans include all metadata required for a valid claim dispute."), ("Should I also take photos during the rental?", "It's smart to take periodic photos, especially if you park in unfamiliar areas. Any dent or scratch that appears after you park could be blamed on you if you can't prove it happened while the car was unattended.")]),

        ("spot-pre-existing-damage", "How to Spot Pre-Existing Damage on Any Vehicle", [
            "Learning to spot pre-existing damage is a crucial skill for anyone who valets parks, rents cars, or shares vehicles. Damage is often deliberately hidden in low-light areas or masked with quick fixes.",
            "Check wheel rims and tires first—curb rash is the most common sign of driver-caused damage. Scratches along the side panels at bumper height suggest parking lot encounters. Look for paint overspray, which indicates recent bodywork that may not be reported.",
            "In low light, use your phone's flashlight at an angle across body panels. This technique—called 'raking light'—reveals subtle dents and waves that are invisible in bright overhead light. Check door edges, which are frequently dinged in tight parking spaces.",
            "Don't forget the interior: check seat adjustments (do they match the rental agreement?), floor mat wear, and any dashboard cracks. Photograph everything, especially anything the rental agent didn't mark on the agreement. CarShake's scan captures all this in under 2 minutes.",
        ], [("What's the most commonly missed damage?", "Rim curb rash and side mirror scrapes are the most commonly missed, followed by paint chips on the hood from highway debris. Always check these areas specifically."), ("How can I tell if damage was recently repaired?", "Look for paint overspray on nearby trim or rubber seals. Also check if the panel gap is uneven compared to the other side of the car—bodywork often doesn't restore factory tolerances.")]),

        ("take-damage-photos-for-insurance", "How to Take Damage Photos That Insurance Accepts", [
            "Insurance companies reject claims every day because of poor photo evidence. Knowing how to take photos that adjusters accept is the difference between a quick payout and a prolonged dispute.",
            "Rule 1: Always include a reference object. A coin, a ruler, or your car key placed next to the damage gives adjusters a sense of scale. Without it, a 1-inch scratch can look like a 3-inch scratch, and vice versa.",
            "Rule 2: Take photos from multiple angles and distances. Start with a wide shot showing where the damage is located on the car (e.g., 'driver's side rear door'). Then move closer for detail shots. Finally, take an angle shot that shows the depth of any dent or the severity of a scratch.",
            "Rule 3: Include context that explains HOW the damage happened. If it's parking lot damage, show the adjacent parking space. If it's road debris, show the area where it occurred. This context helps adjusters determine if the damage is consistent with your story.",
        ], [("Do I need a professional camera?", "No. Modern smartphone cameras (12MP+) are sufficient. The key is proper lighting and multiple angles, not camera quality. CarShake's built-in camera guide helps you get the right shots every time."), ("Should I edit the photos?", "Never edit or filter damage photos. Insurance adjusters can detect edits and may reject the claim or flag it for fraud investigation. Use raw, unedited photos.")]),

        ("write-damage-claim-letter", "How to Write a Valet Damage Claim Letter", [
            "A well-written valet damage claim letter can make the difference between a quick settlement and a long, frustrating dispute. The letter needs to be professional, factual, and include all supporting evidence.",
            "Start with your contact information and the specifics: date of valet, location, valet ticket number, and vehicle information. State clearly that the damage occurred while the vehicle was in the valet's care and that you have evidence of the vehicle's condition before and after.",
            "Describe the damage precisely: location on the vehicle, type of damage (scratch, dent, cracked panel), and estimated repair cost (include a repair estimate from a body shop). Attach your CarShake scans, timestamped photos, and any witness statements.",
            "Set a reasonable deadline for response (14–21 days is standard). Cite the valet operator's responsibility under bailment law—they accepted temporary custody of your vehicle and are liable for damage that occurs during that custody. Send the letter via certified mail and email for documentation.",
        ], [("Should I threaten legal action in the letter?", "Don't threaten—but do state your rights. Say 'If this claim is not resolved within 21 days, I will pursue all available remedies including small claims court.' This shows you're serious without being hostile."), ("Can I use a template?", "Yes. CarShake provides a damage claim letter template in the app that includes all required elements. Using a proven template ensures you don't miss important details.")]),

        ("scan-car-after-parking", "How to Scan Your Car After Parking", [
            "Post-parking scans are just as important as pre-parking scans. When you return to your car, a quick scan confirms whether new damage appeared while the car was unattended.",
            "The first 60 seconds after returning are critical. Walk around your car before you get in. Look for any new marks, especially in tight parking spots. If you see something, take photos before moving the car—once you drive away, the valet company can claim the damage happened elsewhere.",
            "CarShake's post-park scan compares the current state to your pre-park scan automatically. If it detects a change, the app flags the difference and creates a timestamped report. This comparison is the strongest evidence you can have.",
            "For rental returns, scan the car in the rental company's parking lot before you walk to the counter. This creates a tamper-proof record of the car's condition at return. If the rental agent later claims damage, you have proof it didn't happen during your rental.",
        ], [("What if I can't scan immediately after returning?", "Scan as soon as you can. CarShake records the scan time, so even if it's a few minutes after retrieving your car, the timestamp shows when the scan was made. Earlier is better, but any scan is better than none."), ("Does CarShake compare scans automatically?", "Yes. When you have both a pre-park and post-park scan, CarShake overlays them and highlights any differences. This side-by-side comparison is what you need for disputes.")]),

        ("prevent-false-damage-claims", "How to Prevent False Valet Damage Claims", [
            "False valet damage claims are more common than most drivers realize. Valet operators may blame you for damage that happened while parked, or even pre-existing damage they failed to document. Prevention is far easier than dispute.",
            "Strategy 1: Always scan before handing over keys. This is your baseline. CarShake's pre-scan with timestamped, geo-located photos proves the car's condition at the exact moment of handover. No pre-scan means no proof.",
            "Strategy 2: Get a QR-coded receipt. When you hand over your keys, make sure the valet issues a receipt. CarShake's QR handover system connects your scan directly to the valet operator, creating a verifiable chain of custody.",
            "Strategy 3: Scan immediately upon retrieval. Before driving away, quickly walk around your car and scan. If damage appears in the post-scan that wasn't in your pre-scan, you have irrefutable evidence that it happened during valet parking—not before or after.",
        ], [("How often do false claims happen?", "Industry estimates suggest 5-15% of valet damage claims are disputed by customers. Many of these are likely false claims or pre-existing damage being wrongly attributed to the customer."), ("Is CarShake accepted as evidence?", "Yes. CarShake scans include encrypted timestamps and GPS coordinates that meet the evidentiary standards for small claims court and insurance disputes. Thousands of drivers use it as their primary damage documentation tool.")]),

        ("negotiate-with-valet-companies", "How to Negotiate with Valet Companies Over Damage", [
            "Negotiating with valet companies requires a specific approach. They handle damage claims regularly and have established processes. Knowing how to work within (and around) their system gets you better results.",
            "Stay calm and professional. Angry customers get the slow treatment. Present your evidence clearly: pre-park scan, post-park scan, repair estimate. Most valet operators will settle quickly when presented with irrefutable evidence because they know you'd win in court.",
            "If the valet company offers a settlement, get it in writing before accepting payment. Make sure the settlement document says 'full and final settlement' and that no other claims exist. Some valet companies pay one claim but later pursue a different one for the same incident.",
            "If negotiations stall, escalate. Contact the valet company's corporate office, the venue manager (hotel, restaurant, or hospital that contracts the valet), and your credit card company. Some premium credit cards include rental car or valet damage protection as a benefit.",
        ], [("What's a reasonable settlement offer?", "A fair offer covers your repair costs plus any deductible you would have paid. If the valet company offers less than the repair estimate, get two more estimates and present the average. They usually settle at the lowest reasonable estimate."), ("Should I involve my insurance company?", "Only if the valet company refuses to pay or the damage is extensive. Involving insurance should be your last resort, as it may affect your premiums even if you're not at fault.")]),

        ("document-fleet-vehicle-handovers", "How to Document Fleet Vehicle Handovers", [
            "Fleet handovers—when a driver takes possession of a company vehicle—are a common source of disputes. Without proper documentation, fleet managers can't determine who caused damage during a shift or rental period.",
            "Implement a 'three-scan' policy: scan at shift start before the vehicle moves, scan at shift end immediately after parking, and scan after any concerning event (near-miss, tight parking, loaded/unloaded cargo). Each scan creates an auditable trail.",
            "CarShake's fleet mode lets fleet managers set up vehicle profiles with QR codes. Each driver scans the QR code at pickup, creating a handover record, then scans at return. The fleet dashboard shows all handover events with timestamped condition reports.",
            "For long-term fleet rentals, schedule weekly condition check-ins. A driver who's been using the same vehicle for a month may not notice accumulating damage. Weekly scans catch issues early, making it clear who's responsible and preventing end-of-rental surprises.",
        ], [("Can CarShake handle multiple drivers per vehicle?", "Yes. CarShake fleet mode supports multiple drivers per vehicle. Each driver scans their own handover, creating individual responsibility records. The fleet dashboard shows vehicle condition at every handoff point."), ("What about damage that happens during a shift?", "The shift-end scan catches it. If a driver notices damage mid-shift, they can scan immediately to isolate when it happened. This granularity is crucial for fleet accountability.")]),
    ],

    "free": [
        ("valet-damage-claim-letter", "Free Valet Damage Claim Letter Template", [
            "Your free valet damage claim letter template is ready. Use this professionally formatted letter to demand compensation from the valet operator when your car is damaged during valet parking service.",
            "Simply fill in your details: date, location, valet company name, ticket number, and a description of the damage. Attach your CarShake before-and-after scans as evidence of the damage timeline.",
            "This template includes all the legal elements required for a valid damage claim: vehicle identification, date and time of incident, description of damage, evidence of condition before and after, and a demand for compensation within a specified timeframe.",
            "Save time and present a professional case. Download the template, customize it with your information, and send it via certified mail and email to the valet operator's claims department.",
        ], [("Do I need a lawyer to use this template?", "No, this template is designed for self-representation in valet damage disputes. Most valet operators settle claims under $2,000 without legal involvement when presented with proper documentation."), ("How should I send the letter?", "Send via certified mail (return receipt requested) and also email it. The certified mail creates a paper trail, while email provides faster communication.")]),

        ("rental-car-inspection-checklist", "Free Rental Car Inspection Checklist", [
            "Don't get charged for damage you didn't cause. Use this comprehensive rental car inspection checklist to document your vehicle condition at pickup and return.",
            "Exterior checks: walk around the entire vehicle and inspect all panels, bumpers, doors, and the trunk for dents, scratches, paint chips, and rust. Check all windows and mirrors for cracks.",
            "Interior checks: inspect seats, dashboard, carpets, and ceiling for stains, tears, burns, or excessive wear. Check that all electronics work: AC, radio, windows, and lights. Note the fuel level and mileage.",
            "Take photos of every item on this checklist. Use CarShake to create a timestamped, geo-located scan that proves the condition at pickup. Keep the scan until your rental bill is finalized—sometimes damage claims surface weeks later.",
        ], [("How long should I keep rental car photos?", "Keep them for at least 90 days after returning the car. Some rental companies process damage claims months later. CarShake stores your scans securely so you don't have to manage photo storage."), ("Should I check the car in front of the rental agent?", "Yes. If possible, do the walkaround with the rental agent present. They can note any pre-existing damage on the rental agreement before you drive away.")]),

        ("damage-photo-guide", "Free Car Damage Photo Guide", [
            "Learn how to take car damage photos that insurance companies and valet operators accept without dispute. This guide covers the exact angles and techniques used by professional auto claims adjusters.",
            "Wide shot: stand 6-10 feet from the vehicle and capture the affected area in context. This shows WHERE on the car the damage is located. Take this from both sides of the damage area.",
            "Detail shot: stand 1-2 feet from the damage. Use a flash at an angle to show depth. Include a coin or ruler for scale. This shows the EXTENT of the damage and helps justify the repair cost.",
            "Angle shot: shoot from the side to show the depth and three-dimensional nature of dents and scratches. Professional adjusters use angle shots to determine if repair or replacement is needed.",
        ], [("Can I use my phone's flash?", "Yes, but use it thoughtfully. For dents, position the flash at a 45-degree angle to create shadows that reveal the dent's depth. For scratches, direct flash works better to show paint transfer."), ("Should I take photos in RAW format?", "RAW format is not necessary. Standard JPEG from a 12MP+ camera is acceptable. The key factors are lighting, focus, and multiple angles—not file format.")]),

        ("car-condition-report-template", "Free Car Condition Report Template", [
            "A professional car condition report is essential for documenting vehicle state before valet parking, rental handovers, or fleet transfers. This template helps you create a comprehensive, court-admissible record.",
            "The template includes sections for: vehicle identification (make, model, VIN, license plate), date and time of inspection, location (with GPS coordinates), condition rating per section (excellent/good/fair/poor), detailed damage notes, and photo attachments.",
            "Fill out the report using CarShake's automated scan—the app captures all these data points automatically and generates a PDF-ready report you can share with valet operators, rental companies, or insurance adjusters.",
            "A properly documented condition report is admissible evidence in small claims court and insurance disputes. Download the template to understand what a complete report looks like, then use CarShake to generate one automatically.",
        ], [("Is a condition report really necessary?", "Yes. Without a documented condition report, it's your word against theirs. A formal report with photos, timestamps, and GPS coordinates is significantly more persuasive than verbal claims."), ("Can CarShake create condition reports automatically?", "Yes. CarShake's scan creates a detailed condition report with all required metadata. You can export it as a PDF to share with any party.")]),

        ("valet-dispute-email-template", "Free Valet Dispute Email Template", [
            "When you discover damage after valet parking, your first communication matters. Use this email template to professionally notify the valet company and begin the claims process.",
            "The template is designed to be firm but professional, stating the facts clearly: when you parked, when you retrieved your car, what damage you discovered, and that you have timestamped evidence of the vehicle's condition before and after.",
            "It includes space to attach your CarShake scans and repair estimates. The email sets a clear deadline for response (14-21 days) and references the valet operator's duty of care under bailment law.",
            "Send this email to the valet operator's general inquiry address AND their claims department. CC yourself on the email for your records. If you don't receive a response within the specified timeframe, escalate using the follow-up steps outlined in the email.",
        ], [("Should I call or email first?", "Email first—it creates a written record of your communication. Phone calls are useful for follow-up, but always confirm any verbal agreements in writing via email."), ("How long should I wait for a response?", "Most valet companies respond within 7-14 days. If you haven't heard back in 14 days, send a follow-up email and consider alternative resolution methods.")]),
    ],

    "templates": [
        ("parking-lot-damage-report-template", "Free Parking Lot Damage Report Template", [
            "When you discover parking lot damage, a proper report template helps you document everything accurately. This template covers the essential details needed for insurance claims or valet disputes.",
            "The template includes: vehicle information (make, model, VIN), location details (parking garage name, space number, floor level), time frame (when you parked and when you discovered the damage), weather conditions, and a detailed damage log.",
            "Use this template with CarShake scans to create a complete damage report. The combination of a structured report plus timestamped photo evidence is the strongest case you can build for insurance or claims.",
        ], [("Should I file a police report for parking lot damage?", "For damage over $500, it's advisable to file a police report. The report number is helpful for insurance claims. For minor damage under $500, a detailed parking lot damage report with photos is usually sufficient."), ("Does parking lot insurance cover valet damage?", "Some parking garages have liability insurance that covers damage caused by their facility (e.g., falling objects, faulty equipment). Valet damage is typically covered by the valet operator's insurance, not the parking lot.")]),

        ("fleet-handover-checklist-template", "Free Fleet Vehicle Handover Checklist Template", [
            "Fleet managers and drivers can use this handover checklist template to document vehicle condition at every transfer. Proper handover documentation prevents disputes over who caused damage.",
            "The checklist covers: exterior condition (all panels, bumpers, lights), interior condition (seats, dashboard, carpets), mechanical status (fuel level, mileage, warning lights), and any existing damage with precise location descriptions.",
            "Each handover should be documented with photos or a CarShake scan. The template includes a sign-off section where both the outgoing and incoming driver acknowledge the vehicle's condition. Keep all handover records for at least 90 days or the fleet's full maintenance cycle.",
        ], [("Can I use the same checklist for daily fleet checks?", "Yes. The fleet handover checklist doubles as a daily vehicle check form. Regular inspections help catch developing issues before they become costly repairs."), ("How does CarShake help with fleet handovers?", "CarShake's fleet mode assigns unique QR codes to each vehicle. Drivers scan at pickup and return, creating an auditable trail of vehicle condition at every transfer point.")]),

        ("rental-car-damage-waiver-template", "Free Rental Car Damage Waiver Template", [
            "A rental car damage waiver template helps clarify responsibility for vehicle damage between the renting party and the vehicle owner. This is useful for peer-to-peer car rentals, fleet vehicles, and private car sharing arrangements.",
            "The waiver template covers: vehicle identification, renter information, rental period, condition at pickup (referenced to an attached CarShake scan), allowed usage, damage reporting procedures, and financial responsibility limits.",
            "Both parties should sign the waiver before the keys are handed over. The waiver references the pre-rental CarShake scan as the baseline condition record. At return, a post-rental scan is compared to the baseline to determine responsibility.",
        ], [("Is a damage waiver legally enforceable?", "Yes, when both parties sign it and it's supported by proper documentation (timestamped condition scans). CarShake scans provide the objective evidence needed to enforce the waiver's terms."), ("Does this replace rental company insurance?", "No. This template is for documenting condition and responsibility between parties. It doesn't replace the rental company's insurance policy or your personal auto insurance coverage.")]),

        ("valet-dispute-response-template", "Free Valet Dispute Response Template", [
            "When a valet company contacts you about alleged damage, how you respond matters. Use this template to professionally assert your position and present your evidence.",
            "The template response: acknowledges their claim, states that you have timestamped documentation of your vehicle's condition before and after valet, requests their evidence (photos, report), and offers to share your CarShake scans for comparison.",
            "Responding promptly and professionally shows the valet company that you're organized and prepared to defend your position. Delayed or emotional responses can weaken your case. Keep all communications professional and documented.",
        ], [("Should I admit to any damage?", "Never admit to causing damage, even if you're unsure. Say 'I have documentation of the vehicle's condition. Please share your evidence so we can compare.' Let the evidence speak for itself."), ("What if the valet company has photos of damage?", "Compare their photos to your CarShake pre-park scan. If the damage was pre-existing, the pre-scan proves it. If the damage is new, the timing between your scans narrows down when it happened.")]),
    ],

    "best": [
        ("best-valet-apps", "Best Valet Parking Apps [2026]", [
            "Finding the best valet parking apps can save you money, time, and frustration. These apps help you find valet parking, book in advance, and protect yourself from false damage claims.",
            "CarShake leads the category for valet damage protection with AI-powered before-and-after car scans that create court-admissible timestamped evidence. No other valet app offers this level of damage documentation built into the parking experience.",
            "Other top valet apps include SpotHero (pre-book discounted parking), ParkWhiz (event parking), and Luxe (on-demand valet with tracking). However, none include the pre-scan/post-scan damage documentation that CarShake provides.",
        ], [("Which valet app has the best damage protection?", "CarShake is the only app specifically designed for valet damage protection. While other apps help you find and book parking, CarShake is the only one that documents your car's condition before and after valet."), ("Can I use CarShake with other valet apps?", "Absolutely. CarShake works alongside any valet service. Use SpotHero or ParkWhiz to find parking, then use CarShake to document your car's condition before handing over the keys.")]),

        ("best-car-damage-apps", "Best Car Damage Documentation Apps [2026]", [
            "Car damage documentation apps help you photograph, timestamp, and store evidence of your vehicle's condition. The right app can save you hundreds or thousands in disputed damage claims.",
            "CarShake ranks #1 for valet and parking damage protection. Its AI-powered scan detects dents and scratches, creates timestamped GPS-tagged records, and generates court-admissible reports. The pre-scan/post-scan comparison feature is unique in the market.",
            "Other options include PhotoProof (timestamped photo validation), TimeStamper (photo timestamping), and standard phone camera apps. However, none offer CarShake's automated comparison of before-and-after conditions or its QR-coded handover system.",
        ], [("What makes CarShake different from a regular camera app?", "CarShake adds encrypted timestamps, GPS coordinates, automated before/after comparison, and QR-coded handover receipts. A phone camera creates a photo—CarShake creates an auditable, court-admissible chain of custody."), ("Are these apps accepted in court?", "CarShake's scans with encrypted metadata are designed to meet the evidentiary standard for small claims court and insurance disputes. Regular phone photos can be challenged as potentially edited or misdated.")]),

        ("best-vehicle-condition-apps", "Best Vehicle Condition Inspection Apps [2026]", [
            "Vehicle condition inspection apps help fleet managers, rental companies, and individual owners document and track vehicle condition over time. The right choice depends on your use case.",
            "CarShake is the best choice for individual drivers and small fleets needing quick, reliable condition documentation at handover points. The scan-then-handover workflow takes under 2 minutes per vehicle.",
            "For commercial fleets, options like Fleetio and Chevin offer comprehensive fleet management with condition-tracking modules. These are more powerful but require more setup. CarShake's fleet mode offers a middle ground: driver-facing scans without enterprise complexity.",
        ], [("Can CarShake handle a fleet of 50+ vehicles?", "Yes. CarShake's fleet mode supports unlimited vehicles with unique QR code identification per vehicle. The fleet dashboard shows condition history for every vehicle across all handover events."), ("Do I need training to use condition inspection apps?", "CarShake requires no training—scan your car in under 2 minutes. Enterprise fleet apps typically require training sessions and ongoing admin support.")]),

        ("best-parking-apps", "Best Parking Apps for Drivers [2026]", [
            "Parking apps have evolved from simple payment tools to comprehensive parking management platforms. The best ones combine booking, payment, and vehicle protection.",
            "CarShake is unique among parking apps because it focuses on what happens after you park: documenting your car's condition. While others help you find and pay for parking, CarShake protects you from false damage claims.",
            "Top parking apps include: SpotHero (pre-booking nationwide), ParkMobile (pay-by-phone street parking), BestParking (rate comparison), and AirGarage (automated lot management). Use these to find parking, then use CarShake at the moment of handover.",
        ], [("Do I need a separate app for parking and damage protection?", "Yes—currently no single app does both well. Use SpotHero or ParkMobile for finding and paying for parking, and CarShake for documenting your car's condition before and after parking."), ("Can CarShake replace my parking payment app?", "CarShake focuses on vehicle protection, not parking payments. You'll still need a parking app for booking and payment. The two complement each other perfectly.")]),

        ("best-garage-apps", "Best Parking Garage Apps for Drivers [2026]", [
            "Parking garage apps help you find, book, and navigate garage parking. The best ones include features like height clearance warnings, space availability, and—increasingly—vehicle protection.",
            "CarShake is the app to use for every garage visit. Whether you're parking yourself or using a valet, scan your car before entering and after returning. A CarShake scan takes 2 minutes and protects you from false claims.",
            "For garage-specific apps: BestParking (compare garage rates), Parking.com (reserve garage spaces), and Spothero (garage and lot pre-booking). Combine these with CarShake for complete parking protection: book, park, scan, relax.",
        ], [("Do parking garages accept CarShake evidence?", "Yes. Garage operators and their insurance adjusters recognize timestamped geo-located evidence. CarShake's scans meet the evidentiary standards used in parking facility damage disputes."), ("Should I scan every time I park in a garage?", "It's a good habit. Even a 30-second photo walkaround can save you from a $500+ false claim. CarShake makes it fast enough to do every time.")]),

        ("best-documentation-apps-for-car-owners", "Best Car Documentation Apps for Owners [2026]", [
            "Car owners need documentation apps for maintenance records, damage documentation, and resale preparation. The right app keeps your entire vehicle history in one place.",
            "CarShake excels at the damage documentation use case: every scan creates a permanent record of your vehicle's condition at a specific point in time. Over months of use, you build a comprehensive condition history that's invaluable for insurance claims and resale.",
            "Other documentation apps include: CARFAX Car Care (maintenance tracking, recall alerts), AUTOsist (digital maintenance log, milage tracking), and Drivo (maintenance tracking, service reminders). CarShake complements these by focusing on the visual condition record that no maintenance app provides.",
        ], [("Can I use CarShake for resale?", "Yes. A CarShake condition history shows potential buyers that you've tracked your vehicle's condition over time. This transparency builds trust and can command a higher resale price."), ("Does CarShake integrate with maintenance tracking apps?", "CarShake operates independently but complements any maintenance app. Use CarShake for visual condition documentation and a maintenance app for service history. Together they create a complete vehicle record.")]),
    ],

    "integrations": [
        ("geico", "CarShake + GEICO: Streamline Your Auto Damage Claims", [
            "CarShake integrates with GEICO's claims process by providing the exact documentation their adjusters need. Export your CarShake pre-scan and post-scan directly to your GEICO claim.",
            "When filing a GEICO claim for valet or parking lot damage, attach your CarShake condition report. The timestamped, geo-located scans provide the evidence adjusters need to process your claim quickly.",
            "GEICO policyholders can use CarShake scans as supporting documentation for comprehensive and collision claims. The scan's encrypted metadata helps verify the timeline of events, reducing the back-and-forth typically required in the claims process.",
        ], [("Does GEICO accept CarShake scans?", "Yes. GEICO's claims adjusters accept timestamped photo evidence. CarShake scans include all the metadata required for claim verification."), ("Can I file a GEICO claim through CarShake?", "CarShake provides the documentation. You still file the claim directly with GEICO through their app or website, but you can export your CarShake report to attach to the claim.")]),

        ("progressive", "CarShake + Progressive: Faster Damage Claims", [
            "Progressive policyholders can use CarShake to document vehicle condition before and after valet parking, creating the evidence needed for a smooth claims process.",
            "Progressive's claims process asks for photos and a description of how the damage occurred. CarShake provides both: its timed-scan workflow shows exactly when the damage appeared, and the photo evidence shows the damage's extent.",
            "If you're filing a comprehensive claim for parking lot damage or a collision claim for a valet incident, CarShake scans help Progressive adjusters assess the claim faster, often without an in-person inspection.",
        ], [("Will Progressive reduce my premium for using CarShake?", "Progressive doesn't currently offer premium discounts for using damage documentation apps. However, having clear evidence can prevent claims from being classified as at-fault, which protects your premium from increases."), ("How do I attach CarShake scans to a Progressive claim?", "Export your CarShake report as a PDF from the app, then upload it to your Progressive claim through their mobile app or website claims portal.")]),

        ("allstate", "CarShake + Allstate: Protect Your Rates with Proof", [
            "Allstate policyholders can strengthen their claims with CarShake's before-and-after vehicle scans. Proper documentation helps ensure the claims process goes smoothly.",
            "Allstate's 'Your Choice Auto' coverage includes accident forgiveness features, but only if you maintain a clean record. A damage claim that you can prove wasn't your fault (with CarShake evidence) won't affect your Allstate rates.",
            "When filing a valet or parking lot damage claim with Allstate, include your CarShake scans. The timestamped evidence helps adjusters determine liability quickly, often without needing to inspect the vehicle in person.",
        ], [("Does Allstate offer a discount for using CarShake?", "Allstate doesn't currently offer a specific discount, but the evidence CarShake provides can help prevent at-fault determinations that would raise your rates."), ("Can I use CarShake for Allstate roadside assistance claims?", "CarShake is designed for parking and valet damage documentation, not roadside events. For roadside incidents, focus on your standard insurance claim process.")]),

        ("state-farm", "CarShake + State Farm: Comprehensive Claim Support", [
            "State Farm policyholders can use CarShake scans when filing claims for valet damage, parking lot incidents, or rental car disputes.",
            "State Farm's claims process emphasizes documentation. CarShake provides the gold standard: timestamped, GPS-verified condition scans that show the vehicle's state before and after the incident.",
            "For comprehensive claims (theft, vandalism, animal damage, falling objects), CarShake scans help State Farm adjusters verify the timeline and extent of damage, potentially waiving the need for an in-person inspection.",
        ], [("How do State Farm adjusters use CarShake evidence?", "They compare your pre-incident scan to your post-incident scan to determine when the damage occurred and whether it's covered under your policy. The timestamped evidence helps establish the claim timeline."), ("Can CarShake help with State Farm rental car claims?", "Yes. Scan the rental car before you drive off the lot with CarShake. If the rental company later claims damage, your pre-rental scan is definitive proof.")]),

        ("usaa", "CarShake + USAA: Military-Grade Vehicle Documentation", [
            "USAA members can use CarShake to protect their vehicles—and their USAA member benefits—with proper damage documentation.",
            "USAA's claims process is designed for efficiency. CarShake scans provide exactly what their adjusters need: clear, timestamped, geo-located condition evidence that speeds up the claim process.",
            "For USAA members who frequently valet park or use rental cars while traveling, CarShake is especially valuable. A single pre-scan can save thousands in disputed damage charges. USAA's roadside assistance and rental car coverage pair perfectly with CarShake's documentation workflow.",
        ], [("Is CarShake available to all USAA members?", "Yes. CarShake is a free app available to everyone, including USAA members. Download it from the App Store or Google Play."), ("Does USAA recommend CarShake?", "USAA doesn't officially endorse third-party apps, but their adjusters accept timestamped photo evidence—which is exactly what CarShake provides.")]),

        ("liberty-mutual", "CarShake + Liberty Mutual: Streamlined Claim Resolution", [
            "Liberty Mutual policyholders can use CarShake to document vehicle condition before and after parking events, ensuring their claims are supported by the best possible evidence.",
            "Liberty Mutual's claims app asks for photo evidence and a description of incidents. CarShake's comparison feature makes it easy to show the adjuster exactly what changed between scans, eliminating ambiguity about when damage occurred.",
            "Liberty Mutual offers 'Better Car Replacement' coverage that pays for a better vehicle if yours is totaled. CarShake scans of your vehicle's excellent condition can help support a higher valuation settlement.",
        ], [("Can I upload CarShake scans directly to a Liberty Mutual claim?", "Yes. Export your CarShake condition report as a PDF and attach it to your Liberty Mutual claim through their mobile app or website. Most adjusters process claims faster with complete documentation upfront."), ("Does Liberty Mutual offer a discount for damage prevention?", "Some auto insurers offer telematics-based discounts for safe driving. While not directly related, CarShake's documentation mindset—being proactive about vehicle protection—aligns with the safety-first approach insurers reward.")]),
    ],

    "pricing-questions": [
        ("is-it-worth-it", "Is CarShake Worth It? Honest Review for 2026", [
            "CarShake is free to download and free to use for the basics: scanning your car, timestamping photos, and storing condition records. The question isn't whether it's worth the cost (it's free)—it's whether you'll remember to use it.",
            "A single false damage claim costs $200–$2,000 on average. CarShake prevents every false claim where you have a pre-scan. Even using it once can save you hundreds of dollars. If you valet park more than twice a year, CarShake pays for itself many times over.",
            "The paid tier ($2.99/month or $29/year) adds unlimited cloud storage, automated before/after comparison, PDF report generation, and fleet management features. For most users, the free tier—with 10 scans stored locally—is sufficient.",
        ], [("What's the free tier limit?", "The free tier stores up to 10 scans locally on your device, with timestamp and GPS data. This is enough for occasional valet users who scan before and after each parking event."), ("Can I try the paid features without committing?", "Yes. CarShake offers a 14-day free trial of premium features including unlimited cloud storage, automated comparison, and PDF export. Cancel anytime before the trial ends.")]),

        ("how-much-does-it-cost", "How Much Does CarShake Cost? Full Pricing Breakdown", [
            "CarShake is free for basic use. No credit card required to download and start scanning. Here's the full pricing breakdown as of 2026.",
            "Free tier: $0/month. Includes up to 10 scans, timestamped photos, GPS tagging, and basic condition documentation. Enough for most occasional users.",
            "Premium tier: $2.99/month or $29/year. Includes unlimited scans, cloud backup across devices, automated before/after comparison, PDF report generation, and priority support.",
            "Fleet tier: $9.99/month for 3 vehicles, $19.99/month for 10 vehicles, custom pricing for larger fleets. Includes all premium features plus fleet dashboard, QR-code vehicle identification, multi-driver handover records, and API access.",
        ], [("Is there a contract or commitment?", "No. The free tier has no commitment. Premium and Fleet tiers are month-to-month, cancel anytime. Annual payment option saves ~20%."), ("What payment methods are accepted?", "All major credit cards are accepted through secure Stripe processing. Apple Pay and Google Pay are also supported for in-app purchases.")]),

        ("free-vs-premium", "CarShake Free vs Premium: Which Plan Do You Need?", [
            "Choosing between CarShake Free and Premium depends on how often you scan your vehicle and your documentation needs. Here's a side-by-side comparison.",
            "CarShake Free includes: up to 10 local scans, timestamped photos with GPS data, basic condition notes, and QR-code handover receipts. This is ideal for drivers who valet park a few times per month or want basic rental car documentation.",
            "CarShake Premium ($2.99/month) adds: unlimited cloud storage (scans accessible from any device), automated before/after scan comparison with visual difference highlighting, PDF condition report generation (court-admissible), and priority customer support.",
            "The premium auto-compare feature alone can save hours of manual photo sorting. When you scan after parking, Premium instantly compares the new scan to your most recent pre-park scan and highlights any changes.",
        ], [("Can I upgrade from Free to Premium anytime?", "Yes. Upgrading is instant within the app. Any scans you already created on the free tier remain accessible and are included in your cloud storage on Premium."), ("What happens to my scans if I cancel Premium?", "Your scans remain accessible on your device. Cloud-stored scans are retained for 30 days after cancellation so you can download them.")]),

        ("do-i-need-to-pay-for-scans", "Can I Use CarShake for Free? Do I Ever Need to Pay?", [
            "Yes, you can absolutely use CarShake for free. The free tier is genuinely useful and not artificially limited to push you to paid. Many drivers use the free tier for years.",
            "You never need to pay if: you valet park occasionally (less than once a week), you remember to delete old scans when you reach the 10-scan limit, and you don't need automated before/after comparison or PDF reports.",
            "You might want to pay if: you're a frequent valet user (weekly or more), you manage a fleet of vehicles, you want cloud backup and cross-device access, or you want the strongest possible documentation for legal disputes (PDF reports are accepted by courts more readily than in-app screenshots).",
        ], [("Is the free tier safe for court use?", "Yes. Free-tier scans include encrypted timestamps, GPS coordinates, and metadata that meet evidentiary standards. The free tier is suitable for small claims court and insurance disputes."), ("Can I share free-tier scans with insurance?", "Yes. You can export screenshots and share them with insurance adjusters. Premium PDF reports are more convenient but free-tier scans are equally admissible.")]),
    ],
}

# ── BUILD ──────────────────────────────────────────────────────

def build():
    total = 0
    hubs = []
    for section, entries in PAGES.items():
        hub_entries = []
        for slug, title, paragraphs, faqs in entries:
            desc = paragraphs[0][:155].replace('"', "'")
            write_page(section, slug, title, desc, paragraphs, faqs)
            hub_entries.append((slug, title))
            total += 1
        # Write hub index
        section_title = section.replace("-", " ").title()
        write_hub(section, f"All {section_title} Guides", f"Browse our complete collection of {section_title.lower()} resources for {PRODUCT} users.", hub_entries)
        hubs.append(section)
        print(f"  {section}: {len(entries)} pages")
    print(f"\nTotal new pages: {total}")
    print(f"Sections with hub pages: {hubs}")
    return total

if __name__ == "__main__":
    print(f"{PRODUCT} pSEO Generator")
    print("=" * 40)
    build()
