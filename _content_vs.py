# Comparison data and generator
from _content_data import gen_city, CITY_DATA

COMPETITOR_DATA = {
    "inspectcheck": {
        "name": "InspectCheck", "category": "multi-point vehicle inspection app",
        "focus": "dealership service lane inspections and multi-point checklists",
        "carshake_wins": ["consumer-focused valet damage proof", "QR handover receipts", "photo timestamping for disputes", "court-admissible evidence format"],
        "competitor_wins": ["professional multi-point inspection forms", "service department workflow integration", "mechanic-friendly checklist templates", "dealer management system integration"],
    },
    "damage-id": {
        "name": "Damage ID", "category": "AI-powered vehicle damage detection platform",
        "focus": "automated damage detection from photos using computer vision",
        "carshake_wins": ["complete three-step valet protocol", "timestamped handover receipts", "consumer-friendly mobile workflow", "dispute resolution focus"],
        "competitor_wins": ["AI automated damage detection", "enterprise fleet inspection scale", "insurance company integrations", "bulk photo processing"],
    },
    "damage-iid": {
        "name": "Damage IID", "category": "vehicle damage documentation tool",
        "focus": "damage condition reports for vehicle transfers",
        "carshake_wins": ["valet-specific handover workflow", "QR-coded receipts", "time-bound custody chain", "consumer mobile app"],
        "competitor_wins": ["detailed condition report templates", "vehicle transfer documentation", "dealer handover workflows", "printable PDF reports"],
    },
    "carfax": {
        "name": "Carfax", "category": "vehicle history report service",
        "focus": "compiling accident history, title issues, and service records from data sources",
        "carshake_wins": ["real-time damage documentation", "valet-specific handover proof", "preventive evidence capture", "QR handover receipts"],
        "competitor_wins": ["comprehensive historical data", "accident report database", "odometer readings", "title and lien records", "service history aggregation"],
    },
    "eva-prep": {
        "name": "EVA Prep", "category": "vehicle preparation and inspection tool",
        "focus": "prepping vehicles for sale or rental with condition documentation",
        "carshake_wins": ["consumer valet damage proof", "timestamped evidence format", "mobile-first workflow", "dispute-focused output"],
        "competitor_wins": ["vehicle preparation workflow", "dealer lot management", "inventory condition tracking", "batch processing capabilities"],
    },
    "repairpal": {
        "name": "RepairPal", "category": "auto repair marketplace and cost estimator",
        "focus": "connecting drivers with certified mechanics and repair price estimates",
        "carshake_wins": ["damage documentation before repair", "evidence for repair disputes", "valet damage proof", "QR handover system"],
        "competitor_wins": ["certified mechanic network", "fair price estimation", "repair shop reviews", "warranty coverage"],
    },
    "record360": {
        "name": "Record360", "category": "asset condition documentation platform",
        "focus": "enterprise-grade condition tracking for rentals, leases, and fleet management",
        "carshake_wins": ["consumer mobile app simplicity", "valet-specific handover workflow", "QR-coded receipts", "no enterprise contract required"],
        "competitor_wins": ["enterprise-grade infrastructure", "rental fleet scale", "API integration with rental software", "multi-location fleet management"],
    },
    "parking-snapshot": {
        "name": "Parking Snapshot", "category": "parking lot photo documentation tool",
        "focus": "recording vehicle position in parking facilities",
        "carshake_wins": ["complete valet handover protocol", "cryptographic timestamping", "court-admissible evidence", "QR receipt system"],
        "competitor_wins": ["parking facility focused", "lot operator features", "entry/exit timestamping", "kiosk integration"],
    },
    "rental-condition-report": {
        "name": "rental condition reports", "category": "vehicle condition documentation method",
        "focus": "paper-based or digital checklists for rental car handover",
        "carshake_wins": ["automated photo capture", "cryptographic timestamps", "QR handover receipts", "mobile app convenience"],
        "competitor_wins": ["industry-standard format", "no app required", "universal acceptance", "paper trail familiarity"],
    },
    "auto-md": {
        "name": "AutoMD", "category": "auto repair information and quote service",
        "focus": "providing repair cost estimates and DIY guides",
        "carshake_wins": ["damage evidence capture", "valet handover proof", "dispute documentation", "pre-repair condition record"],
        "competitor_wins": ["repair cost estimation", "DIY repair guides", "mechanic finder", "parts pricing database"],
    },
    "carshake-vs-inspectr": {
        "name": "Inspectr", "category": "vehicle inspection workflow tool",
        "focus": "dealership and fleet inspection management",
        "carshake_wins": ["consumer valet focus", "QR handover receipts", "court-admissible evidence", "mobile-first design"],
        "competitor_wins": ["professional inspection workflows", "enterprise fleet scale", "hardware integration options", "multi-point checklist templates"],
    },
    "carshake-vs-damageid": {
        "name": "DamageID", "category": "AI vehicle damage detection tool",
        "focus": "automated damage identification from vehicle photos",
        "carshake_wins": ["complete valet protocol", "handover receipt system", "dispute-focused workflow", "consumer mobile app"],
        "competitor_wins": ["AI-powered detection", "automated damage classification", "enterprise integration", "bulk photo analysis"],
    },
}


def gen_vs(slug, display_name):
    key = slug.rstrip("/").replace("/index.html", "")
    d = COMPETITOR_DATA.get(key)
    if not d:
        return None
    carshake_rows = "\n".join(
        [f'<tr><td>{f}</td><td>Yes</td><td>{"Yes" if f in d["competitor_wins"] else "No"}</td></tr>' for f in d["carshake_wins"]]
    )
    competitor_strengths = "; ".join(d["competitor_wins"][:3])
    return f"""
<section>
<h2>Feature comparison: CarShake vs {d["name"]}</h2>
<p>{d["name"]} is a {d["category"]} focused on {d["focus"]}. CarShake is purpose-built for a different problem: giving individual drivers court-admissible proof of their vehicle's condition at valet handovers, rental returns, and service visits.</p>
<table>
<thead><tr><th>Feature</th><th>CarShake</th><th>{d["name"]}</th></tr></thead>
<tbody>
{carshake_rows}
<tr><td>Mobile app (consumer)</td><td>Yes</td><td>{"Yes" if "consumer" in d["category"] or "mobile" in d["category"] else "No"}</td></tr>
</tbody>
</table>

<h2>When CarShake is the better choice</h2>
<p>If you are an individual driver who hands your car to valets at restaurants, hotels, airports, or rental facilities, CarShake is designed specifically for you. The three-step protocol (scan before, QR receipt at handover, scan at pickup) creates a chain of custody that holds up in small claims court and insurance disputes. You do not need a dealership contract, enterprise account, or special hardware, just your phone.</p>
<p>CarShake's evidence format includes cryptographic timestamps and geolocation, which makes it substantially stronger than informal photos when filing a valet damage claim. Insurance adjusters are more likely to approve claims backed by structured documentation than unstructured phone photos.</p>

<h2>When {d["name"]} might be the better fit</h2>
<p>{d["name"]} excels at {d["focus"]}. If your needs are closer to {competitor_strengths}, then {d["name"]} may serve you better. The two tools solve related but distinct problems. {d["name"]} is built for professional or enterprise use cases, while CarShake is built for consumer protection at the moment of vehicle handover.</p>

<h2>Cost and accessibility</h2>
<p>CarShake's core scan-and-receipt functionality is free for individual drivers. {d["name"]} typically targets enterprise customers or professional users and may require a subscription or contract. For one-off valet damage disputes, CarShake's free tier is usually sufficient.</p>

<h2>Frequently asked questions</h2>
<details>
<summary>Can I use both CarShake and {d["name"]}?</summary>
<p>Yes, they are complementary. Many drivers use CarShake for valet and rental handover protection while relying on {d["name"]} for {d["focus"].split(",")[0]}. The tools serve different points in the vehicle ownership lifecycle.</p>
</details>
<details>
<summary>Which produces stronger evidence for an insurance claim?</summary>
<p>For valet damage disputes specifically, CarShake's QR handover receipt and cryptographic timestamping create a tighter chain of custody than standard condition reports. For automated damage classification or pre-existing damage documentation, {d["name"]} may have advantages depending on your use case.</p>
</details>
<details>
<summary>Do I need {d["name"]} if I have CarShake?</summary>
<p>It depends on your use case. If your primary concern is valet damage, rental disputes, or proving condition at handover, CarShake covers it. If you need {d["focus"]}, you would benefit from {d["name"]} as well.</p>
</details>
<details>
<summary>What about pricing comparison?</summary>
<p>CarShake offers a free tier that covers most consumer needs. {d["name"]}'s pricing varies based on use case and scale. Check their website for current rates.</p>
</details>
</section>
"""


# Scenario content
SCENARIO_DATA = {
    "wedding-valet": {
        "context": "Wedding valet services are often operated by third-party contractors who may carry minimal insurance. Guests at weddings are frequently unfamiliar with the venue layout, and the time pressure of moving hundreds of cars creates ideal conditions for damage.",
        "without": "Without documentation, wedding valet damage claims typically fail because guests cannot prove the car was undamaged when they arrived. The valet company can claim pre-existing damage, and without a baseline, the guest has no recourse.",
        "with": "With CarShake, each guest scans their car on arrival, gets a QR receipt at handover, and scans again at departure. Any damage is immediately attributable to the valet period, and the evidence supports claims against the valet contractor or wedding venue.",
    },
    "hotel-valet": {
        "context": "Hotel valet services operate 24/7 and handle vehicles from hundreds of guests. Cars are often moved multiple times between the porte-cochere and remote overflow lots, creating multiple opportunities for damage. Hotel liability is frequently limited by the parking ticket's fine print.",
        "without": "Without timestamped evidence, hotel valet damage claims are notoriously difficult. Hotels cite the parking ticket disclaimer, and guests cannot prove the damage was not there when they arrived.",
        "with": "CarShake documentation defeats the ticket disclaimer by proving condition at a specific moment. The QR handover receipt creates a clear transfer of custody, and post-retrieval scans capture any new damage with precise timing.",
    },
    "body-shop-handover": {
        "context": "Body shop handovers are high-stakes: you are dropping off a car for repairs and picking up a loaner, or retrieving your car after work was done. Damage during transport, lot moves, or test drives is common but hard to attribute.",
        "without": "Body shop damage disputes often come down to your word against the shop's. If a new dent appears, the shop can claim it was there when you dropped off, and without before photos, you are stuck.",
        "with": "CarShake scans at drop-off and pickup create a definitive record of what was and was not there. Any damage that appears during the shop's custody is clearly attributable, supporting claims against the shop's garagekeeper's insurance.",
    },
    "rental-return": {
        "context": "Rental car companies aggressively pursue damage claims because it is a revenue stream. At return, agents inspect vehicles for the slightest marks and charge renters for damage that may have been pre-existing. This is one of the most common consumer disputes in travel.",
        "without": "Without a documented pre-rental condition, renters routinely get billed for scratches, dents, and interior damage they did not cause. Disputing these charges after the fact is time-consuming and often unsuccessful.",
        "with": "Scanning the rental car at pickup and return gives you timestamped proof of its actual condition at both points. If the rental company claims new damage, you have evidence showing the car's condition when you took possession, making it much harder for them to charge you for pre-existing wear.",
    },
    "restaurant-valet": {
        "context": "Restaurant valet services handle high vehicle turnover during peak dining hours. The rush to park and retrieve cars quickly increases the risk of lot damage, curb scrapes, and interior wear. Liability is often murky because the restaurant contracts out the service.",
        "without": "Restaurant valet damage is among the hardest to claim. The restaurant blames the valet contractor, the valet contractor blames pre-existing damage, and the diner is stuck with the repair bill.",
        "with": "A quick CarShake scan before handing over the keys gives you timestamped proof of your car's condition. The QR receipt establishes the valet's custody, and a post-dinner scan reveals any new damage immediately while you are still at the venue.",
    },
    "airport-parking": {
        "context": "Airport valet and long-term parking involves leaving your car for days or weeks with minimal oversight. Lot attendants move vehicles, weather causes damage, and other parkers cause door dings. Proving when damage occurred is nearly impossible without documentation.",
        "without": "Airport parking damage claims are notoriously hard to win. The parking operator can claim damage happened after pickup, during transport, or was pre-existing, and without timestamps, you cannot disprove it.",
        "with": "CarShake scans at airport drop-off and return create a precise window of custody. Any damage that appears between those two scans is attributable to the parking period, making claims much stronger.",
    },
}


def gen_scenario(slug):
    d = SCENARIO_DATA.get(slug)
    if not d:
        return None
    title = slug.replace("-", " ")
    return f"""
<section>
<h2>Why {title} causes so many disputes</h2>
<p>{d["context"]}</p>
<p>The core challenge with {title} damage claims is attribution. The handover, parking, retrieval, and transport all create opportunities for damage, but without a documented chain of custody, no one can prove when it happened. That ambiguity benefits the service operator, not the vehicle owner.</p>

<h2>Without CarShake: the typical dispute</h2>
<p>{d["without"]}</p>
<p>This is why most {title} damage claims are abandoned. The effort required to gather evidence after the fact (tracking down surveillance footage, filing police reports, hiring experts) exceeds the cost of the repair for most drivers.</p>

<h2>With CarShake: documented chain of custody</h2>
<p>{d["with"]}</p>
<p>The protocol is designed to take less than two minutes:</p>
<ol>
<li><strong>Before handover:</strong> Open CarShake and walk around your car. The app guides you to capture all exterior panels, wheels, roof, and interior. Every photo is timestamped and geolocated automatically.</li>
<li><strong>At handover:</strong> Hand the valet or attendant the QR code on your phone. They scan it, creating a cryptographic receipt that links them to your vehicle's documented condition at that exact moment.</li>
<li><strong>At retrieval:</strong> Repeat the scan. The app compares against your baseline and flags any new damage with precise timing relative to the handover.</li>
</ol>

<h2>What to do if you discover damage</h2>
<p>If your post-retrieval scan reveals damage that was not in your baseline:</p>
<ul>
<li><strong>Document immediately:</strong> The CarShake scan is your primary evidence. Do not move the car or leave the venue until you have completed the scan.</li>
<li><strong>Notify the operator on-site:</strong> Report the damage while you are still at the location. Ask for a supervisor and an incident report.</li>
<li><strong>Request surveillance footage:</strong> Many parking facilities have cameras. Request that they preserve footage from the relevant time window.</li>
<li><strong>File with your insurance:</strong> Submit the CarShake documentation with your claim. The timestamped evidence significantly improves claim outcomes.</li>
</ul>

<h2>Frequently asked questions</h2>
<details>
<summary>How long does the scan take?</summary>
<p>About 90 seconds for a complete exterior and interior scan. The app guides you through each panel and confirms capture before moving on.</p>
</details>
<details>
<summary>What if the valet refuses to scan the QR code?</summary>
<p>The QR scan is optional. Your pre-handover photos are the critical evidence. They timestamp your car's condition before the valet took possession. The QR receipt strengthens the chain of custody but is not required for a valid claim.</p>
</details>
<details>
<summary>Does this hold up in small claims court?</summary>
<p>Yes. CarShake photos include cryptographic timestamps and geolocation data, which courts accept as evidence of condition at a specific time and place. The QR handover receipt establishes transfer of custody.</p>
</details>
<details>
<summary>What if I forget to scan before handover?</summary>
<p>Unfortunately, without a before baseline, it is very difficult to prove damage occurred during the valet period. Make it a habit. CarShake can send reminders when you arrive at venues known for valet parking.</p>
</details>
</section>
"""
