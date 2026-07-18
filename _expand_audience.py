#!/usr/bin/env python3
"""Expand /for/<audience> pages.
Targets: corporate-fleets, exotic-car-dealers, casino-operators, event-venues,
luxury-hotel-managers, parking-garages, hotel-valet, auto-transport,
exotic-car-rentals, ride-share-drivers.
"""
import re

# Each page = (inject_before_marker, [sections])
# Each section = (htag, heading, [blocks])
# Each block = ('p', text) | ('ul', [items]) | ('det', q, a)

PAGES = {}

PAGES["for/corporate-fleets/index.html"] = (
    '<p><a href="https://carshake.online" style="color:#0066cc">Back to CarShake →</a></p>',
    [
        ("h2", "Corporate fleet vehicle documentation", [
            ("p", "Corporate fleets — sales fleets, executive car programs, service vans, and pool vehicles — change hands constantly. Every handover between employees, vendors, and parking facilities is a liability event. Without a documented pre-condition record, the company cannot prove whether a dent, scrape, or interior stain existed before the most recent driver, and that ambiguity drives up insurance premiums, repair spend, and interdepartmental disputes."),
            ("p", "CarShake gives fleet managers a standardized pre-trip and post-trip condition report for every vehicle, every driver, every handover. Photos are timestamped and tamper-evident. Reports export as PDF for HR, risk, legal, and insurance, and the underlying data is available via API for integration into fleet management systems like Geotab, Samsara, and Wheels."),
        ]),
        ("h2", "Use cases across the fleet lifecycle", [
            ("ul", [
                "Driver assignment — document condition at every key handover.",
                "Long-term parking — prove condition before airport or hotel valet.",
                "Accident evidence — capture post-incident state with geotagged photos.",
                "Lease return — avoid end-of-term wear-and-tear disputes with the lessor.",
                "Vendor accountability — prove condition before and after body shop, detail, or transport.",
            ]),
        ]),
        ("h2", "Workflow integration", [
            ("p", "CarShake is built to drop into existing fleet operations. Drivers scan a QR decal on the windshield to start a session, capture a guided photo walkthrough, and receive a QR-coded digital handover receipt — no app install required for one-off drivers. For fleet admins, sessions are visible in a dashboard with filters by driver, vehicle, date, and location. CSV and PDF exports feed straight into incident reports and claims files, and a REST API supports custom integrations with telematics, HR, and risk management platforms."),
        ]),
        ("h2", "ROI and compliance benefits", [
            ("p", "Fleet operators typically see a measurable drop in unresolved damage disputes within the first quarter of rollout. Standardized condition reports shorten claims handling time, reduce disputed repair invoices, and give risk and legal teams an evidentiary record they can actually use. For fleets subject to DOT, OSHA, or internal audit requirements, CarShake documentation satisfies the recordkeeping expectations around pre- and post-trip inspection without the overhead of a paper DVIR."),
        ]),
        ("h2", "FAQ — Corporate fleets", [
            ("det", "Does CarShake integrate with our telematics or fleet management platform?", "Yes. CarShake exposes a REST API and supports CSV/PDF export. Common integrations include Geotab, Samsara, Motive, Wheels, and custom internal tools."),
            ("det", "Do drivers need to install an app?", "No. Drivers can scan a QR decal and run a session in the browser. A native app is available for power users."),
            ("det", "Does this satisfy DOT pre-trip inspection requirements?", "CarShake documents condition with timestamped photos, which complements — but does not replace — a driver's DOT DVIR where one is legally required."),
            ("det", "Can we export records for legal or insurance?", "Yes. Sessions export as tamper-evident PDFs with metadata suitable for use as evidence in claims and litigation."),
        ]),
    ],
)

PAGES["for/exotic-car-dealers/index.html"] = (
    '<p><a href="https://carshake.online" style="color:#0066cc">Back to CarShake →</a></p>',
    [
        ("h2", "Why exotic and luxury dealers need CarShake", [
            ("p", "Exotic and luxury dealers move six- and seven-figure inventory through more hands than almost any other business: detailers, transport drivers, service techs, lot attendants, salespeople, and customers on test drives. Every handover is a liability event on a vehicle where a single refinish can cost five figures and a panel repair can erase six figures of resale value. Without a documented pre-condition record, the dealer cannot prove whether a scratch, curb rash, or interior scuff existed before the most recent touch."),
            ("p", "CarShake gives exotic dealers a fast, standardized condition capture at every handover. A salesperson runs a 90-second guided photo walkthrough on the showroom floor; the customer receives a QR-coded digital receipt acknowledging the vehicle's condition at delivery; any new damage is flagged instantly at return. Records are timestamped, tamper-evident, and exportable as PDF."),
        ]),
        ("h2", "Dealer-specific use cases", [
            ("ul", [
                "Customer delivery — document condition at handover and on return from a test drive.",
                "Service write-up — capture pre-service condition to dispute comebacks and warranty claims.",
                "Consignments — prove condition when a private-seller vehicle enters and exits inventory.",
                "Transport — document at pickup and delivery for enclosed carrier shipments.",
                "Demo and press loans — protect loaner inventory against undisclosed damage.",
            ]),
        ]),
        ("h2", "Workflow integration", [
            ("p", "CarShake is designed to slot into the showroom, not slow it down. A QR decal on the windshield starts a session; a guided photo walkthrough runs on any phone; the customer gets a QR-coded digital receipt by text or email. Sessions flow into the dealer dashboard, where managers can filter by VIN, salesperson, and date. PDF exports attach directly to the deal jacket in CDK, Reynolds, or Dominion, and an API supports custom DMS integrations."),
        ]),
        ("h2", "ROI and compliance benefits", [
            ("p", "Exotic dealers typically see a sharp reduction in disputed damage claims within the first 60 days. Standardized delivery documentation shortens customer disputes, protects the dealer against unwarranted warranty and comeback claims, and preserves certified-pre-owned resale value by proving provenance. For dealerships subject to manufacturer audit, CarShake records satisfy the documentation expectations around delivery condition and customer acknowledgment without the overhead of paper forms."),
        ]),
        ("h2", "FAQ — Exotic car dealers", [
            ("det", "Does CarShake integrate with our DMS?", "Yes. PDF exports attach to deal jackets in CDK, Reynolds, and Dominion, and a REST API supports custom integrations."),
            ("det", "Will customers actually scan at delivery?", "The walkthrough is a 90-second guided capture. The customer receives a QR-coded digital receipt acknowledging condition — fast enough to fit a showroom delivery."),
            ("det", "What about high-gloss paint and carbon fiber?", "The guided capture includes close-ups of vulnerable panels — splitter, rocker, diffuser, wheels — so curb rash and clear-coat damage are documented before the customer leaves."),
            ("det", "Will the records hold up in a customer dispute?", "CarShake records are timestamped and tamper-evident and are regularly accepted as evidence in small-claims and warranty disputes."),
        ]),
    ],
)

PAGES["for/casino-operators/index.html"] = (
    '<p><a href="https://carshake.online" style="color:#0066cc">Explore CarShake for casino operators →</a></p>',
    [
        ("h2", "Why casino operators choose CarShake", [
            ("p", "Casinos run some of the largest valet operations in the world. A single Strip or boardwalk property can process thousands of vehicles a night, with peak surges on weekends, fight nights, and concert evenings. Cars are stacked four and five deep, shuttled to remote lots, and retrieved on demand by a workforce that turns over fast. The damage exposure per vehicle is high, and the per-claim value is even higher because casino guests drive premium vehicles and tip for speed — not for care."),
            ("p", "CarShake gives casino valet managers a standardized, fast condition capture at every handover. The guest gets a QR-coded digital bailment receipt; any new damage at retrieval is flagged instantly with timestamped photos. Records export as PDF for risk, legal, and insurance, and flow into dashboards that surface high-risk lots, shifts, and attendants."),
        ]),
        ("h2", "Casino-specific use cases", [
            ("ul", [
                "Guest drop-off — fast scan on arrival, QR-coded bailment receipt to guest.",
                "VIP and high-limit valet — closer documentation for highest-value guest vehicles.",
                "Overnight and long-term parking — prove condition for multi-day stays.",
                "Self-park overflow — document when remote lots are pressed into service.",
                "Rental fleet return — protect partner rental operations on property.",
            ]),
        ]),
        ("h2", "Workflow integration", [
            ("p", "CarShake is built for the pace of a casino valet stand. Valets scan a QR decal or enter the claim check, run a 30-second guided capture of the four corners and wheels, and hand the guest a QR-coded receipt. Retrieval reverses the flow. Managers see live dashboards by shift, stand, and lot. CSV and PDF exports feed risk and insurance reporting, and an API integrates with property management and parking systems."),
        ]),
        ("h2", "ROI and compliance benefits", [
            ("p", "Casino operators typically see a measurable drop in disputed guest claims within the first quarter. Standardized condition reports shorten claim resolution, protect the property against fraudulent claims, and give risk and gaming compliance teams an evidentiary record suitable for internal review. For properties subject to state gaming commission oversight, CarShake documentation supports the recordkeeping expectations around bailment operations."),
        ]),
        ("h2", "FAQ — Casino operators", [
            ("det", "How fast is the valet capture? Casino valet can't slow down.", "The capture is a 30-second guided walkthrough — fast enough for a Strip-property valet stand at peak."),
            ("det", "Does this work for remote and overflow lots?", "Yes. Cars staged in remote lots are documented at drop-off and retrieval regardless of lot location."),
            ("det", "Can we tie claims to a guest or loyalty number?", "Yes. Sessions can be tagged with loyalty or player-club IDs for cross-reference with guest services."),
            ("det", "Will records hold up in a guest dispute?", "CarShake records are timestamped and tamper-evident and are regularly accepted as evidence in small-claims and insurance disputes."),
        ]),
    ],
)

PAGES["for/event-venues/index.html"] = (
    '<p><a href="https://carshake.online" style="color:#0066cc">Explore CarShake for event venues →</a></p>',
    [
        ("h2", "Why event venues choose CarShake", [
            ("p", "Concert halls, convention centers, sports arenas, and private event venues run their highest valet volumes on the nights they can least afford a problem. A sold-out show means hundreds of vehicles dropped off in two hours, stacked in tight lots, and retrieved in a chaotic surge at the end of the night. Damage claims spike on those nights, and the fine-print waiver on the valet ticket is built to protect the operator — not the guest."),
            ("p", "CarShake gives event venues a fast, standardized condition capture at every handover. The guest receives a QR-coded digital bailment receipt; any new damage at retrieval is flagged instantly with timestamped photos. Venue managers see live dashboards filtered by event, gate, and shift, and reports export as PDF for risk, legal, and insurance."),
        ]),
        ("h2", "Venue-specific use cases", [
            ("ul", [
                "Concert and touring shows — high-volume drop-off and retrieval surges.",
                "Convention and trade-show floor — multi-day parking for exhibitors and attendees.",
                "Sports and arena events — VIP and suite valet with closer documentation.",
                "Private galas and weddings — protect the venue against post-event claims.",
                "Festival and outdoor sites — document condition in temporary or remote lots.",
            ]),
        ]),
        ("h2", "Workflow integration", [
            ("p", "CarShake is designed for the chaos of an event-night valet stand. Valets scan a QR decal, run a 30-second guided capture, and hand the guest a QR-coded receipt. Retrieval reverses the flow. Venue managers see live dashboards by event and gate. CSV and PDF exports feed risk and insurance reporting, and an API supports integration with ticketing and access-control systems."),
        ]),
        ("h2", "ROI and compliance benefits", [
            ("p", "Venues typically see a measurable drop in disputed guest claims within the first event quarter. Standardized condition reports shorten claim resolution, protect the venue against fraudulent claims, and give risk and legal teams an evidentiary record. For venues subject to municipal or venue-authority oversight, CarShake documentation supports the recordkeeping expectations around public-facing parking operations."),
        ]),
        ("h2", "FAQ — Event venues", [
            ("det", "Can CarShake handle a 2,000-car event-night surge?", "Yes. The capture is a 30-second guided walkthrough designed for peak event throughput."),
            ("det", "Does this work for temporary and pop-up lots?", "Yes. Lots are documented at drop-off and retrieval regardless of whether they are permanent or temporary."),
            ("det", "Can we tag sessions to a ticket or event?", "Yes. Sessions can be tagged with event IDs, gate IDs, or ticket numbers for cross-reference with access control."),
            ("det", "Will records hold up in a guest dispute?", "CarShake records are timestamped and tamper-evident and are regularly accepted as evidence in small-claims and insurance disputes."),
        ]),
    ],
)

PAGES["for/luxury-hotel-managers/index.html"] = (
    '<p><a href="https://carshake.online" style="color:#0066cc">Explore CarShake for luxury hotel managers →</a></p>',
    [
        ("h2", "Why luxury hotels choose CarShake", [
            ("p", "Luxury hotels are defined by the guest experience — and the moment a guest retrieves their car and finds a new scratch, the entire stay is reframed as a complaint. Five-star and Forbes-rated properties face the highest stakes: premium guest vehicles, multi-day overnight valet, and a brand promise that does not tolerate a damage dispute. The traditional paper valet ticket, with its fine-print disclaimer, actively undermines the brand."),
            ("p", "CarShake gives luxury hotel managers a fast, branded, white-glove condition capture at every handover. The guest receives a QR-coded digital bailment receipt by text or email; any new damage at retrieval is flagged instantly with timestamped photos. Records export as PDF for risk, legal, and insurance, and dashboards surface high-risk shifts, stands, and attendants."),
        ]),
        ("h2", "Luxury-hotel-specific use cases", [
            ("ul", [
                "Arrival and departure valet — branded receipt and instant dispute resolution.",
                "VIP and suite guests — closer documentation for highest-value vehicles.",
                "Multi-night overnight parking — prove condition for the length of the stay.",
                "Concierge and errand runs — document when the car leaves and returns to the lot.",
                "Rental and chauffeur handovers — protect partner operations on property.",
            ]),
        ]),
        ("h2", "Workflow integration", [
            ("p", "CarShake is built to reinforce, not interrupt, the arrival experience. The valet scans a QR decal, runs a 30-second guided capture, and sends the guest a QR-coded digital receipt branded to the property. Retrieval reverses the flow. The front office sees live status in the PMS-adjacent dashboard, and reports export as PDF for risk and insurance. An API supports integration with Opera, Mews, and other property management systems."),
        ]),
        ("h2", "ROI and compliance benefits", [
            ("p", "Luxury properties typically see a sharp reduction in guest complaints and disputed damage claims within the first 60 days. Standardized condition reports shorten claim resolution, protect the property against fraudulent claims, and give risk and legal teams an evidentiary record that supports the brand promise. For properties subject to brand-standards audits, CarShake documentation satisfies the recordkeeping expectations around guest vehicle handling."),
        ]),
        ("h2", "FAQ — Luxury hotel managers", [
            ("det", "Can the guest receipt be branded to our property?", "Yes. The digital receipt is white-labeled with property branding, logo, and concierge contact."),
            ("det", "Does CarShake integrate with Opera or Mews?", "Yes. CarShake exposes a REST API and supports integration with Opera, Mews, and other PMS platforms."),
            ("det", "What about VIP and chauffeur-driven vehicles?", "Closer documentation for the highest-value guest vehicles is supported, including multi-day overnight parking."),
            ("det", "Will records hold up in a guest dispute?", "CarShake records are timestamped and tamper-evident and are regularly accepted as evidence in guest dispute and insurance resolution."),
        ]),
    ],
)

PAGES["for/parking-garages/index.html"] = (
    '<p><a href="https://carshake.online" style="color:#0066cc">Explore CarShake for parking garages →</a></p>',
    [
        ("h2", "Why parking garage operators choose CarShake", [
            ("p", "Parking garages — whether municipal, private, airport, hospital, or office — are the most high-volume vehicle handover environment in the country. A single downtown garage can process thousands of vehicles a day, with attendant-parked cars shuffled tight in narrow stacked rows. Damage disputes are routine, and the printed ticket with its liability disclaimer is designed to protect the operator — not the parker."),
            ("p", "CarShake gives garage operators a fast, standardized condition capture at every attendant handover. The parker receives a QR-coded digital bailment receipt; any new damage at retrieval is flagged instantly with timestamped photos. Managers see live dashboards filtered by level, shift, and attendant, and reports export as PDF for risk, legal, and insurance."),
        ]),
        ("h2", "Garage-specific use cases", [
            ("ul", [
                "Attendant-parked garages — document every attendant handover.",
                "Valet-assist and stack parking — capture pre-condition before shuffling.",
                "Monthly and contract parkers — recurring documentation for tenant accounts.",
                "Airport and hospital garages — protect high-throughput public-facing operations.",
                "EV charging valet — document vehicles plugged and unplugged by staff.",
            ]),
        ]),
        ("h2", "Workflow integration", [
            ("p", "CarShake is built for the throughput of an attendant garage. Attendants scan a QR decal or ticket, run a 30-second guided capture, and hand the parker a QR-coded receipt. Retrieval reverses the flow. Garage managers see live dashboards by level and shift. CSV and PDF exports feed risk and insurance reporting, and an API supports integration with PARCS systems like TIBA, SKIDATA, Scheidt & Bachmann, and parking access platforms."),
        ]),
        ("h2", "ROI and compliance benefits", [
            ("p", "Garage operators typically see a measurable drop in disputed damage claims within the first quarter of rollout. Standardized condition reports shorten claim resolution, protect the operator against fraudulent claims, and give risk and legal teams an evidentiary record. For operators subject to municipal oversight or lease audits, CarShake documentation supports the recordkeeping expectations around public-facing parking operations."),
        ]),
        ("h2", "FAQ — Parking garages", [
            ("det", "Can CarShake integrate with our PARCS system?", "Yes. CarShake supports integration with TIBA, SKIDATA, Scheidt & Bachmann, and other major PARCS platforms via API."),
            ("det", "How fast is the attendant capture?", "The capture is a 30-second guided walkthrough — fast enough for a high-throughput attendant garage."),
            ("det", "Does this work for self-park garages too?", "Self-parkers can run a voluntary scan at entry to document condition, useful for monthly contract accounts."),
            ("det", "Will records hold up in a parker dispute?", "CarShake records are timestamped and tamper-evident and are regularly accepted as evidence in small-claims and insurance disputes."),
        ]),
    ],
)

PAGES["for/hotel-valet/index.html"] = (
    '<p><a href="https://carshake.online" style="color:#0066cc">Explore CarShake for hotel valet services →</a></p>',
    [
        ("h2", "Why hotel valet services choose CarShake", [
            ("p", "Hotel valet is the most guest-facing parking operation in the industry. The valet stand is the first and last impression of the property, and the moment a guest retrieves their car and finds new damage, the entire stay is reframed as a complaint. Overnight stays compound the risk: the vehicle may be moved several times across shifts, lots, and attendants over a multi-day stay, and the printed ticket with its fine-print disclaimer actively undermines the guest relationship."),
            ("p", "CarShake gives hotel valet operators a fast, branded condition capture at every handover. The guest receives a QR-coded digital bailment receipt; any new damage at retrieval is flagged instantly with timestamped photos. Managers see live dashboards filtered by shift, stand, and lot, and reports export as PDF for risk, legal, and insurance."),
        ]),
        ("h2", "Hotel-valet-specific use cases", [
            ("ul", [
                "Arrival and departure — branded receipt and instant dispute resolution.",
                "Overnight parking — document condition across multi-day stays and shifts.",
                "Concierge and errand runs — document when the car leaves and returns to the lot.",
                "Event and conference valet — handle high-volume banquet and meeting overflow.",
                "Rental return and partner handovers — protect partner operations on property.",
            ]),
        ]),
        ("h2", "Workflow integration", [
            ("p", "CarShake is built for the pace of a hotel valet stand. The valet scans a QR decal, runs a 30-second guided capture, and sends the guest a QR-coded digital receipt. Retrieval reverses the flow. The front office sees live status in a dashboard adjacent to the PMS, and reports export as PDF for risk and insurance. An API supports integration with Opera, Mews, and other property management systems."),
        ]),
        ("h2", "ROI and compliance benefits", [
            ("p", "Hotel valet operators typically see a sharp drop in guest complaints and disputed damage claims within the first 60 days. Standardized condition reports shorten claim resolution, protect the operator against fraudulent claims, and give risk and legal teams an evidentiary record that supports the guest relationship. For operators subject to brand-standards audits, CarShake documentation satisfies the recordkeeping expectations around guest vehicle handling."),
        ]),
        ("h2", "FAQ — Hotel valet services", [
            ("det", "How fast is the valet capture? Our stand can't slow down.", "The capture is a 30-second guided walkthrough — fast enough for peak check-in and check-out windows."),
            ("det", "Does this work for overnight and multi-day parking?", "Yes. Condition is documented at drop-off and any new damage is flagged at retrieval, regardless of stay length."),
            ("det", "Can we tie sessions to a guest or reservation?", "Yes. Sessions can be tagged with reservation or loyalty IDs for cross-reference with the PMS."),
            ("det", "Will records hold up in a guest dispute?", "CarShake records are timestamped and tamper-evident and are regularly accepted as evidence in guest dispute and insurance resolution."),
        ]),
    ],
)

PAGES["for/auto-transport/index.html"] = (
    '</article>\n<section class="cta">',
    [
        ("h2", "Why auto transport companies choose CarShake", [
            ("p", "Auto transport companies live and die by the bill of lading. The condition report at pickup is the legal record of the vehicle's pre-shipment state; the report at delivery is the proof that any new damage happened in transit. Paper condition reports are slow, error-prone, and routinely disputed by customers who insist the damage was already there. The result is a claims process that drags on for weeks and erodes margins on every load."),
            ("p", "CarShake gives auto transport companies a fast, standardized, digital condition report at pickup and delivery. Photos are timestamped and tamper-evident. The customer signs the QR-coded digital bill of lading on their phone. Reports export as PDF for claims files and insurance, and the data integrates with transport management systems via API."),
        ]),
        ("h2", "Auto-transport-specific use cases", [
            ("ul", [
                "Pickup condition report — capture the vehicle at the origin with the customer present.",
                "Delivery condition report — prove any new damage happened in transit.",
                "Multi-leg shipments — document every handover between carriers.",
                "Enclosed and exotic transport — closer documentation for highest-value loads.",
                "Auction and dealer inventory — capture condition at the lane and on arrival.",
            ]),
        ]),
        ("h2", "Workflow integration", [
            ("p", "CarShake is built for the roadside and the lot. The driver scans a QR decal or enters the VIN, runs a guided photo walkthrough of the four corners, wheels, glass, and roof, and has the customer sign the digital bill of lading on their phone. Delivery reverses the flow. Dispatch sees live status in a dashboard, and reports export as PDF for claims. An API supports integration with transport management systems like Truckstop, DAT, Samsara, and internal platforms."),
        ]),
        ("h2", "ROI and compliance benefits", [
            ("p", "Auto transport operators typically see a sharp drop in disputed claims within the first quarter of rollout. Standardized condition reports shorten claim resolution, protect the carrier against fraudulent claims, and give dispatch and risk teams an evidentiary record. For carriers subject to FMCSA recordkeeping expectations, CarShake documentation satisfies the documentation standard around pickup and delivery condition without the overhead of paper forms."),
        ]),
        ("h2", "FAQ — Auto transport", [
            ("det", "Does this replace our paper bill of lading?", "CarShake produces a digital, customer-signed bill of lading that is faster and more defensible than paper, and exports as PDF."),
            ("det", "Can the customer sign on the driver's phone?", "Yes. The customer reviews the photos and signs the digital bill of lading on the driver's device at pickup and delivery."),
            ("det", "Does CarShake integrate with our TMS?", "Yes. CarShake exposes a REST API and supports integration with Truckstop, DAT, Samsara, and custom internal TMS platforms."),
            ("det", "Will records hold up in a freight claim?", "CarShake records are timestamped and tamper-evident and are regularly accepted as evidence in cargo claims and insurance disputes."),
        ]),
    ],
)

PAGES["for/exotic-car-rentals/index.html"] = (
    '</article>\n<section class="cta">',
    [
        ("h2", "Why exotic car rental companies choose CarShake", [
            ("p", "Exotic and luxury car rental is a business where every vehicle is a six-figure asset and every renter is a stranger. The traditional paper walk-around at pickup is slow, error-prone, and routinely disputed at return when the renter insists a scratch or curb rash was already there. Without a defensible pre-condition record, the rental company eats the repair — and the vehicle sits in the shop instead of earning revenue."),
            ("p", "CarShake gives exotic rental companies a fast, standardized, digital condition capture at pickup and return. The renter walks a guided photo tour of the four corners, wheels, splitter, and interior; signs the QR-coded digital acknowledgment on their phone; and any new damage at return is flagged instantly with timestamped photos. Records export as PDF for claims and insurance."),
        ]),
        ("h2", "Exotic-rental-specific use cases", [
            ("ul", [
                "Pickup walkthrough — renter-acknowledged condition capture at the start of the rental.",
                "Return inspection — flag any new damage instantly with timestamped photos.",
                "Concierge delivery — document condition at the hotel, airport, or residence.",
                "Track-day and experience rentals — closer documentation for high-stress use.",
                "Long-term and subscription rentals — recurring condition captures across the term.",
            ]),
        ]),
        ("h2", "Workflow integration", [
            ("p", "CarShake is built to fit the exotic rental checkout, not slow it down. The agent or renter scans a QR decal, runs a 90-second guided photo walkthrough, and the renter signs the digital acknowledgment on their phone. Return reverses the flow. Fleet managers see live status in a dashboard filtered by VIN and renter, and reports export as PDF for claims. An API supports integration with rental management systems like Rent Centric, TSD, and lower-cost custom platforms."),
        ]),
        ("h2", "ROI and compliance benefits", [
            ("p", "Exotic rental operators typically see a sharp reduction in disputed damage claims within the first 60 days. Renter-acknowledged condition capture shortens disputes, protects the company against unwarranted claims, and preserves the revenue-earning availability of the fleet. For operators subject to state rental regulations, CarShake documentation supports the recordkeeping expectations around condition at pickup and return."),
        ]),
        ("h2", "FAQ — Exotic car rentals", [
            ("det", "Will renters actually do a walkthrough at pickup?", "The guided capture is a 90-second photo tour with renter signature on their phone — fast enough to fit a luxury checkout."),
            ("det", "Does this integrate with our rental management system?", "Yes. CarShake supports integration with Rent Centric, TSD, and custom platforms via API."),
            ("det", "What about delivery to a hotel or airport?", "Yes. Concierge delivery is fully supported — the walkthrough and signature happen wherever the renter takes possession."),
            ("det", "Will records hold up in a chargeback or claim?", "CarShake records are timestamped and tamper-evident and are regularly accepted as evidence in credit-card chargebacks and insurance claims."),
        ]),
    ],
)

PAGES["for/ride-share-drivers/index.html"] = (
    '</article>\n<section class="cta">',
    [
        ("h2", "Why rideshare drivers choose CarShake", [
            ("p", "Rideshare drivers put their personal vehicle through more handovers in a week than most owners see in a year. Every rider is a stranger, every ride is a fresh damage risk, and the platforms — Uber and Lyft — side with the rider in any disputed damage claim unless the driver can prove the vehicle was clean and undamaged before pickup. Without that proof, a single spilled drink, scratched door, or torn seat becomes the driver's loss."),
            ("p", "CarShake gives rideshare drivers a fast, shift-start and shift-end condition capture. The driver runs a 60-second guided photo walkthrough of the four seats, cargo area, and exterior; the report is timestamped and tamper-evident. Any new damage at shift end is documented instantly. Records export as PDF to support a platform damage claim or an insurance filing."),
        ]),
        ("h2", "Rideshare-specific use cases", [
            ("ul", [
                "Shift-start capture — prove the vehicle was clean and undamaged before the first pickup.",
                "Rider incident — document damage immediately after a problem ride.",
                "Shift-end capture — flag any new damage before the next shift.",
                "Insurance claim — produce a defensible pre-condition record for your personal policy.",
                "Rental and fleet drivers — protect yourself against the platform's return inspection.",
            ]),
        ]),
        ("h2", "Workflow integration", [
            ("p", "CarShake is built for the driver's seat, not the office. The driver scans a QR decal on the windshield, runs a 60-second guided photo walkthrough, and the report is stored automatically. A native mobile app supports one-tap capture at shift start and end. Reports export as PDF to attach to a platform damage claim or an insurance filing."),
        ]),
        ("h2", "ROI and compliance benefits", [
            ("p", "Rideshare drivers typically recover the cost of CarShake the first time they file a supported platform damage claim or dispute a fraudulent rider report. Standardized condition reports shorten claim resolution, protect the driver against unjustified platform deductions, and give the driver's personal insurer a defensible pre-condition record. For drivers subject to platform vehicle standards, CarShake documentation supports the recordkeeping expectations around vehicle condition."),
        ]),
        ("h2", "FAQ — Rideshare drivers", [
            ("det", "Will this actually help with an Uber or Lyft damage claim?", "Yes. A timestamped pre-condition record is the single most important evidence in a platform damage dispute."),
            ("det", "How fast is the capture? I'm between rides.", "The capture is a 60-second guided photo walkthrough — designed for shift start and end, not between every ride."),
            ("det", "Do I need to install an app?", "A native app is available for one-tap capture, but you can also run sessions in the browser by scanning a QR decal."),
            ("det", "Will my personal insurance accept the records?", "CarShake records are timestamped and tamper-evident and are regularly accepted by personal auto insurers as evidence of pre-condition."),
        ]),
    ],
)


def render_block(block):
    kind = block[0]
    if kind == "p":
        return f"<p>{block[1]}</p>"
    if kind == "ul":
        items = "".join(f"<li>{i}</li>" for i in block[1])
        return f"<ul>{items}</ul>"
    if kind == "det":
        return f"<details><summary><strong>{block[1]}</strong></summary><p>{block[2]}</p></details>"
    raise ValueError(block)


def render_sections(sections):
    out = []
    for htag, htext, blocks in sections:
        body = "\n".join(render_block(b) for b in blocks)
        out.append(f'<section style="margin-top:2em">\n<{htag} style="font-size:1.4em;font-weight:700;margin:.5em 0">{htext}</{htag}>\n{body}\n</section>')
    return "\n".join(out)


def patch_file(path, inject_before, sections):
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    if inject_before not in html:
        print(f"  !! marker not found in {path}")
        return False
    new_html = html.replace(inject_before, render_sections(sections) + "\n" + inject_before, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_html)
    return True


def wordcount(path):
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    html = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.S)
    html = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", html)
    return len(text.split())


if __name__ == "__main__":
    for path, (inject_before, sections) in PAGES.items():
        before = wordcount(path)
        ok = patch_file(path, inject_before, sections)
        after = wordcount(path) if ok else before
        status = "OK" if 400 <= after <= 700 else "CHECK"
        print(f"{status} {path}: {before} -> {after}")
