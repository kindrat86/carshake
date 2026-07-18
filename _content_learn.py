# Learn, FAQ, glossary, checklist generators (all double-quote strings)


LEARN_DATA = {
    "valet-damage-insurance-claims": {
        "topic": "filing insurance claims for valet damage",
        "core": "Insurance claims for valet damage require proving the damage occurred during the valet's custody. Most claims fail because drivers lack timestamped before-evidence.",
        "legal": "Your personal auto insurance typically covers valet damage under collision or comprehensive coverage, but you will owe the deductible. Some policies subrogate against the valet company to recover costs.",
        "steps": [
            "Document immediately (CarShake scan at pickup)",
            "Notify the valet operator and request an incident report",
            "File a police report if the damage exceeds your deductible",
            "Contact your insurance within 24-48 hours",
            "Submit all evidence including CarShake photos and QR receipt",
            "Cooperate with the adjuster and request subrogation",
        ],
    },
    "car-dealership-damage-liability": {
        "topic": "dealership damage liability",
        "core": "When you leave your car at a dealership for service or trade-in, the dealership assumes a bailment responsibility. They owe you reasonable care for your vehicle.",
        "legal": "Dealerships carry garagekeeper's liability insurance for exactly this situation. However, they often dispute claims by arguing the damage was pre-existing.",
        "steps": [
            "Scan your car with CarShake at dealership drop-off",
            "Keep the QR receipt as proof of custody transfer",
            "Note the service advisor who received your vehicle",
            "At pickup, scan again and note any new damage",
            "Report damage immediately to the service manager",
            "Request a claim under their garagekeeper's policy",
        ],
    },
    "valet-damage-liability-laws": {
        "topic": "valet damage liability laws",
        "core": "Valet damage falls under bailment law, which varies by state. Most states apply a reasonable care standard, meaning the valet is liable only if they failed to exercise reasonable care.",
        "legal": "Bailment is a legal relationship where someone (the bailee) temporarily holds another person's property. For valets, this means they owe a duty of care proportional to the benefit they receive from the arrangement.",
        "steps": [
            "Establish the bailment (prove you handed over the car)",
            "Show damage occurred during the bailment period",
            "Demonstrate the bailee failed to exercise reasonable care",
            "Document the extent of damages with repair estimates",
            "File in small claims court if the valet company refuses to pay",
        ],
    },
    "how-to-prove-valet-damage": {
        "topic": "proving valet damage",
        "core": "Proving valet damage requires evidence that (1) your car was undamaged before handover and (2) the damage existed after retrieval. Timestamped photos are the gold standard.",
        "legal": "Courts apply the preponderance of evidence standard in civil cases, meaning you must show it is more likely than not that the damage occurred during the valet's custody.",
        "steps": [
            "Capture timestamped exterior photos before handover",
            "Photograph the interior and odometer reading",
            "Get a QR handover receipt if available",
            "Inspect the car immediately upon retrieval",
            "Photograph any new damage with timestamps",
            "Obtain a repair estimate within 7 days",
        ],
    },
    "what-to-do-if-valet-damages-car": {
        "topic": "what to do if a valet damages your car",
        "core": "If a valet damages your car, act immediately. The first 24 hours are critical for preserving evidence and establishing your claim.",
        "legal": "Most states require you to mitigate damages (get reasonable repairs) and file claims within a statute of limitations that ranges from 1-6 years depending on jurisdiction.",
        "steps": [
            "Do not leave the venue without documenting the damage",
            "Photograph everything with timestamps (CarShake)",
            "Request an incident report from the valet supervisor",
            "Get contact info for the valet company and their insurance",
            "File a police report for damage over 500 dollars",
            "Contact your insurance company within 48 hours",
        ],
    },
    "rental-car-damage-claims": {
        "topic": "rental car damage claims",
        "core": "Rental car damage claims are the most common travel-related consumer dispute. Rental companies aggressively pursue charges for damage that may be pre-existing.",
        "legal": "Rental companies must prove the damage occurred during your rental period. However, their inspection reports often lack precision, making it your word against theirs.",
        "steps": [
            "Scan the car with CarShake at pickup (before driving off)",
            "Note any existing damage on the rental agreement",
            "Keep your copy of the inspection form",
            "At return, scan again and compare against baseline",
            "Refuse to sign damage assessments you disagree with",
            "Dispute unauthorized charges in writing within 30 days",
        ],
    },
    "valet-damage-disputes": {
        "topic": "valet damage disputes",
        "core": "Valet damage disputes typically come down to evidence. The party with the better-documented timeline usually wins.",
        "legal": "Small claims court is the most common venue for valet damage disputes. Filing fees are low (30-80 dollars) and most states do not allow attorneys, leveling the playing field.",
        "steps": [
            "Gather all evidence (CarShake scans, QR receipts, photos)",
            "Get multiple repair estimates from licensed body shops",
            "Send a formal demand letter to the valet company",
            "Allow 30 days for response before filing in court",
            "File in small claims court if the demand is ignored",
            "Present your evidence clearly at the hearing",
        ],
    },
}


def gen_learn(slug):
    d = LEARN_DATA.get(slug)
    if not d:
        return None
    steps_html = "\n".join([f"<li>{s}</li>" for s in d["steps"]])
    return f"""
<section>
<h2>Understanding {d["topic"]}</h2>
<p>{d["core"]}</p>

<h2>Legal framework</h2>
<p>{d["legal"]}</p>

<h2>Step-by-step process</h2>
<ol>
{steps_html}
</ol>

<h2>Why documentation matters</h2>
<p>In virtually every {d["topic"]} scenario, the outcome hinges on documentation. Verbal claims that the damage was not there before carry little weight without corroborating evidence. Timestamped photos, written incident reports, and formal correspondence create a paper trail that holds up in negotiations, insurance claims, and court proceedings.</p>
<p>CarShake automates this documentation by timestamping and geolocating every photo, generating QR handover receipts that establish custody transfers, and producing court-ready evidence packages. Instead of manually organizing photos and receipts, the app handles the evidentiary chain of custody.</p>

<h2>Common pitfalls to avoid</h2>
<ul>
<li><strong>Waiting too long:</strong> Claims weaken significantly after 30 days. File promptly.</li>
<li><strong>Accepting verbal assurances:</strong> Get everything in writing, especially from valet supervisors and rental agents.</li>
<li><strong>Signing without inspecting:</strong> Never sign a damage acknowledgment without first scanning the vehicle.</li>
<li><strong>Skipping the police report:</strong> For damage over 500 dollars, a police report creates an official record.</li>
<li><strong>Repairing before documenting:</strong> Always photograph damage before any repairs begin.</li>
</ul>

<h2>Frequently asked questions</h2>
<details>
<summary>How long do I have to file a claim?</summary>
<p>Statutes of limitations vary by state, typically ranging from 1-6 years for property damage claims. However, evidence deteriorates quickly. File within 30 days for the strongest case.</p>
</details>
<details>
<summary>Should I go through my insurance or the valet company directly?</summary>
<p>Start with the valet company directly. If they refuse or offer inadequate compensation, file with your insurance and let them subrogate (recover from the valet company). This is often faster.</p>
</details>
<details>
<summary>What if the valet company says I signed a waiver?</summary>
<p>Valet parking tickets with liability disclaimers are not always enforceable. Many states limit the ability to disclaim negligence. Consult a local attorney or file in small claims court regardless.</p>
</details>
<details>
<summary>Can CarShake documentation be used in court?</summary>
<p>Yes. CarShake photos include cryptographic timestamps, geolocation data, and tamper-evident audit trails. Courts accept this as evidence of vehicle condition at a specific time and place.</p>
</details>
</section>
"""


FAQ_DATA = {
    "how-to-prove-valet-damage": [
        ("What evidence do I need to prove valet damage?", "You need (1) timestamped photos of your car before handover showing no damage, (2) a record of when and where you handed over the keys, and (3) timestamped photos showing the damage after retrieval. CarShake captures all three automatically through its scan-receipt-scan protocol. The stronger your evidence, the more likely the valet company or their insurer will settle without court."),
        ("Do phone photos count as evidence?", "Yes, but they are weaker than CarShake documentation. Phone photos can be taken at any time, so their timestamp is questionable. CarShake uses cryptographic timestamping tied to GPS location, making it much harder to challenge in court or insurance negotiations."),
        ("What if I forgot to take before photos?", "Without a baseline, proving the damage occurred during the valet period is very difficult. You can try to obtain surveillance footage from the venue, find witnesses, or check if your car has a dashcam that recorded the handover. But without before evidence, most claims fail."),
        ("How soon after damage should I document it?", "Immediately. The longer you wait, the harder it becomes to prove the damage occurred during the valet period. If you notice damage at pickup, scan the car before leaving the venue."),
    ],
    "how-long-do-valet-claims-take": [
        ("How long does a valet damage claim take to resolve?", "Typically 2-8 weeks if the valet company cooperates. Direct claims with the valet company's insurance can resolve in 2-4 weeks. Small claims court cases take 2-6 months from filing to hearing. Insurance subrogation (your insurer recovering from the valet) takes 3-6 months."),
        ("What can I do to speed up my claim?", "Submit complete documentation upfront: CarShake scans, repair estimates, and the QR handover receipt. Send a formal demand letter with a 30-day deadline. Follow up weekly. The more organized your evidence, the faster the claim processes."),
        ("What if the valet company ignores my claim?", "After 30 days of no response, file in small claims court. The filing fee (30-80 dollars) is usually worth it for damage claims over 500 dollars. Many valet companies settle immediately when served with court papers."),
        ("Can I get a rental car during repairs?", "If the damage makes your car undrivable, your insurance may cover a rental. If the valet company accepts liability, they should cover reasonable rental costs. Document all rental expenses for reimbursement."),
    ],
    "what-to-do-if-valet-damages-car": [
        ("What is the first thing I should do?", "Do not leave the venue. Open CarShake and scan your car immediately. The timestamped photos are your strongest evidence. Then find the valet supervisor and request an incident report."),
        ("Should I call the police?", "For damage over 500 dollars, file a police report. It creates an official record of the incident and can be critical evidence if the case goes to court. Many jurisdictions allow online filing for minor incidents."),
        ("Who pays, the valet company or my insurance?", "Ideally the valet company's insurance pays. Start by filing a claim with them. If they refuse or delay, file with your own insurer (you will owe the deductible), and they will subrogate to recover from the valet company."),
        ("What information should I collect at the scene?", "Get the valet company name, their insurance information, the supervisor's name and contact details, photos of the damage and the valet area, contact info for any witnesses, and a copy of any incident report they complete."),
    ],
}


def gen_faq(slug):
    items = FAQ_DATA.get(slug)
    if not items:
        return None
    qa_html = "\n".join([f"<details>\n<summary>{q}</summary>\n<p>{a}</p>\n</details>" for q, a in items])
    return f"""
<section>
<h2>Frequently asked questions</h2>
{qa_html}
<details>
<summary>Is CarShake documentation accepted by insurance companies?</summary>
<p>Yes. Insurance adjusters accept CarShake's timestamped, geolocated photos as evidence of vehicle condition. The cryptographic audit trail makes the documentation difficult to challenge, which often leads to faster claim approvals.</p>
</details>
</section>
"""


GLOSSARY_DATA = {
    "three-stop-protocol": (
        "three-stop protocol",
        "The three-stop protocol is CarShake's core methodology for documenting vehicle condition at handover. The three stops are: (1) pre-handover scan, (2) QR-coded handover receipt, and (3) post-retrieval scan.",
        "Without a documented chain of custody, damage claims become he-said-she-said disputes. The three-stop protocol creates an evidentiary record that courts and insurers accept.",
        "CarShake implements the three-stop protocol through its mobile app, guiding users through each step and automatically timestamping and geolocating every photo. The QR receipt cryptographically links the bailee to the documented condition.",
    ),
    "pre-damage-capture": (
        "pre-damage capture",
        "Pre-damage capture refers to photographing a vehicle's condition before it enters someone else's custody, before a valet parks it, before a rental agency takes it back, before a body shop begins work.",
        "Pre-damage capture is the single most important evidence in any vehicle damage dispute. Without a before baseline, you cannot prove that damage occurred during a specific period of custody.",
        "CarShake automates pre-damage capture with a guided scan workflow that ensures every panel, wheel, and interior surface is photographed with cryptographic timestamps.",
    ),
    "qr-handover-receipt": (
        "QR handover receipt",
        "A QR handover receipt is a cryptographic record generated when a valet or attendant scans a QR code on the vehicle owner's phone at the moment of vehicle handover. The receipt establishes a verifiable transfer of custody.",
        "The QR receipt matters because it creates an undeniable link between the bailee (valet) and the vehicle's documented condition. It eliminates the common defense of we never had custody of this vehicle.",
        "CarShake generates the QR code on the owner's phone. When the valet scans it, a timestamped receipt is created that includes the vehicle's condition snapshot, the valet's identifier, and the exact moment of handover.",
    ),
    "valet-handover": (
        "valet handover",
        "A valet handover is the moment a vehicle owner transfers physical custody of their vehicle to a valet parking attendant. Under bailment law, this creates specific legal duties for the valet.",
        "The handover moment is critical because it establishes when the valet's duty of care begins. Any damage after this point is presumptively attributable to the valet, unless they can prove otherwise.",
        "CarShake documents the valet handover through timestamped photos and an optional QR receipt. The documentation creates a clear legal record of when custody transferred and what the vehicle's condition was at that moment.",
    ),
}


def gen_glossary(slug):
    d = GLOSSARY_DATA.get(slug)
    if not d:
        return None
    term, definition, importance, handling = d
    return f"""
<section>
<h2>What is the {term}?</h2>
<p>{definition}</p>

<h2>Why it matters</h2>
<p>{importance}</p>

<h2>How CarShake handles {term}</h2>
<p>{handling}</p>

<h2>Related terms</h2>
<ul>
<li><a href="/glossary/three-stop-protocol">Three-stop protocol</a> - CarShake's complete documentation methodology</li>
<li><a href="/glossary/pre-damage-capture">Pre-damage capture</a> - Photographing condition before handover</li>
<li><a href="/glossary/qr-handover-receipt">QR handover receipt</a> - Cryptographic proof of custody transfer</li>
<li><a href="/glossary/valet-handover">Valet handover</a> - The legal moment of custody transfer</li>
</ul>

<h2>Frequently asked questions</h2>
<details>
<summary>Is the {term} legally binding?</summary>
<p>Yes, when properly documented. The combination of timestamped photos and QR receipts creates evidence that courts and insurance companies accept as proof of condition and custody at a specific moment.</p>
</details>
<details>
<summary>How long does {term} take?</summary>
<p>About 90 seconds for the photo scan, plus a few seconds for the QR receipt. The process is designed to be fast enough to complete at any valet stand, rental counter, or service drop-off.</p>
</details>
<details>
<summary>Do I need special equipment for {term}?</summary>
<p>No. CarShake runs on any smartphone. The QR code is displayed on your phone screen for the valet to scan with their own device. No hardware integration or special setup required.</p>
</details>
</section>
"""


CHECKLIST_DATA = {
    "dealer-handover-checklist": ("dealership vehicle handover", "dealership",
        ["Verify VIN matches paperwork", "Photograph all exterior panels with timestamps", "Check windshield for chips and cracks", "Inspect wheels for curb rash", "Note interior condition (seats, dashboard, headliner)", "Confirm fuel level and odometer reading", "Test all electronics (lights, AC, windows)", "Get written acknowledgment of condition from advisor"]),
    "valet-handover-checklist": ("valet parking handover", "valet",
        ["Scan exterior with CarShake before handing over keys", "Photograph interior and dashboard", "Remove valuables or place in trunk", "Set odometer reading on the QR receipt", "Confirm valet ticket matches vehicle description", "Verify the valet company name on the ticket", "Note any pre-existing damage on the ticket", "At pickup, scan again before leaving the venue"]),
    "post-accident-checklist": ("post-accident vehicle documentation", "accident scene",
        ["Ensure safety first (move to a safe location)", "Call police for any accident over 500 dollars damage", "Photograph all vehicles and the scene with timestamps", "Exchange insurance and contact information", "Note witnesses and their contact details", "Sketch or photograph the accident diagram", "Report to your insurance within 24 hours", "Scan your car with CarShake for a damage record"]),
    "pre-rental-checklist": ("rental car pickup inspection", "rental counter",
        ["Arrive early to allow full inspection time", "Scan the entire car with CarShake before driving off", "Note every scratch, dent, and interior mark", "Check tire condition and spare", "Verify fuel level and return policy", "Test brakes, lights, and AC before leaving the lot", "Confirm the rental agreement reflects all pre-existing damage", "Keep a copy of the inspection form"]),
    "rideshare-vehicle-inspection-checklist": ("rideshare vehicle inspection", "rideshare",
        ["Complete annual mechanical inspection", "Verify all lights, signals, and brakes function", "Check tire tread depth (minimum 4/32 inch)", "Ensure interior is clean and presentable", "Scan exterior condition with CarShake daily", "Document any damage after each shift", "Keep maintenance records current", "Verify rideshare platform inspection requirements"]),
    "body-shop-intake-checklist": ("body shop intake inspection", "body shop",
        ["Scan vehicle thoroughly before drop-off", "Photograph any existing damage", "Confirm repair scope matches the estimate", "Get written authorization for the work", "Note odometer reading at drop-off", "Remove personal items from the vehicle", "Establish pickup date and process", "Request text updates on repair progress"]),
    "rental-car-inspection-checklist": ("rental car inspection", "rental car agency",
        ["Inspect before signing any paperwork", "Photograph all panels with timestamps", "Check for hail damage on the roof and hood", "Inspect interior for stains, tears, burns", "Test all electronics and accessories", "Note fuel level and return requirements", "Verify spare tire and jack presence", "Get agent signature on condition form"]),
    "dealership-vehicle-intake-checklist": ("dealership service intake", "dealership service department",
        ["Scan vehicle condition with CarShake at drop-off", "Photograph the odometer reading", "Note fuel level", "Remove valuables and personal items", "Confirm repair authorization in writing", "Get loaner vehicle agreement if applicable", "Establish expected completion date", "Request text or call when vehicle is ready"]),
}


def gen_checklist(slug):
    d = CHECKLIST_DATA.get(slug)
    if not d:
        return None
    title, context, items = d
    items_html = "\n".join([f"<li>{item}</li>" for item in items])
    return f"""
<section>
<h2>Complete {title} checklist</h2>
<p>This checklist covers every step you should take when handling vehicle documentation at a {context}. Following it systematically protects you against damage disputes, liability claims, and undocumented charges.</p>

<h2>Step-by-step checklist</h2>
<ol>
{items_html}
</ol>

<h2>Why each step matters</h2>
<p>Skip a step, and you create a gap in your documentation that can be exploited later. For example, if you do not photograph the odometer at drop-off, a {context} can claim excessive mileage. If you do not scan the condition at handover, pre-existing damage may be attributed to you.</p>
<p>CarShake automates the critical photo-documentation steps. Instead of manually managing photos and notes, the app walks you through each panel and timestamp, ensuring nothing is missed.</p>

<h2>Common mistakes to avoid</h2>
<ul>
<li><strong>Rushing through inspection:</strong> Take the full 5-10 minutes. Rushing leads to missed damage.</li>
<li><strong>Signing without inspecting:</strong> Never sign a condition acknowledgment without verifying every detail.</li>
<li><strong>Skipping photos of minor damage:</strong> Small scratches become major disputes. Document everything.</li>
<li><strong>Not getting signatures:</strong> Verbal agreements are not evidence. Get written acknowledgment.</li>
<li><strong>Forgetting the interior:</strong> Interior damage is frequently disputed. Photograph seats, dash, and cargo areas.</li>
</ul>

<h2>Pro tips from claims adjusters</h2>
<ul>
<li>Use CarShake's timestamped photos as your primary evidence layer.</li>
<li>Always get the name and contact info of the person receiving your vehicle.</li>
<li>Keep copies of all paperwork, originals get lost.</li>
<li>Follow up any verbal communication with an email summary.</li>
<li>If damage appears at pickup, document it before leaving the {context}.</li>
</ul>

<h2>Frequently asked questions</h2>
<details>
<summary>How long should a proper inspection take?</summary>
<p>Plan for 5-10 minutes for a thorough inspection. CarShake's guided workflow helps you cover all critical areas systematically in about 90 seconds, with additional time for noting any existing damage.</p>
</details>
<details>
<summary>What if the {context} staff will not wait for me to inspect?</summary>
<p>Insist. Any reputable {context} will accommodate a reasonable inspection. If they refuse, consider it a red flag and document the situation. Take dated photos anyway, even if staff will not co-sign.</p>
</details>
<details>
<summary>Do I need to photograph every panel?</summary>
<p>Yes. Disputes often center on specific panels, and without photos of all of them, the other party can claim damage existed elsewhere. CarShake makes comprehensive capture quick and guided.</p>
</details>
<details>
<summary>Can I use this checklist for insurance purposes?</summary>
<p>Absolutely. Insurance adjusters rely on documented condition reports. CarShake photos with timestamps and geolocation are particularly compelling evidence for claims and disputes.</p>
</details>
</section>
"""
