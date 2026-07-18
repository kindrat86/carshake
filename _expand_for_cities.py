#!/usr/bin/env python3
"""Expand /for/<city> pages. Template: dallas/chicago/houston (short);
LA/SF/miami (with h2+ul). Inject before CTA, add FAQ, target 400-600 words."""
import re, sys

PAGES = {}

PAGES["for/dallas/index.html"] = {
    "h1": "Dallas",
    "inject_before": '<p><a href="https://carshake.online" style="color:#0066cc;font-weight:600">Start protecting your car →</a></p>',
    "sections": [
        ("section", "h2", "Valet parking across Dallas", [
            "Dallas is a valet-first city. From the steakhouses of Uptown and the hotel towers of Downtown to the medical campuses around UTSW and the private clubs of Highland Park, drivers hand their keys to valets dozens of times a month. Texas heat, oversized trucks sharing tight lots, and a nightlife scene built around drop-off at the door all add up to constant handover risk.",
            "Common damage scenarios Dallas drivers see include curbed wheels on the tight turn-outs at Knox-Henderson restaurants, door dings in the stacked lots off McKinney Avenue, and front-bumper scrapes in the underground garages beneath Turtle Creek high-rises. When damage turns up at pickup, the driver has no proof the scratch wasn't there before — and the valet ticket almost always disclaims liability.",
        ]),
        ("section", "h2", "Texas law on valet damage", [
            "Texas does not cap a valet operator's liability, but nearly every valet ticket printed in Dallas includes a broad liability disclaimer for loss, theft, or damage. Under the Texas Supreme Court's reading of bailment law, those disclaimers are enforceable unless the customer can prove the operator's negligence. That proof gap is exactly where most claims die.",
            "CarShake closes the gap. A timestamped pre-handover scan, a QR-coded bailment receipt, and a post-retrieval scan create a documented condition record that shifts the evidentiary burden. In a Dallas County small-claims filing, that record is the difference between a he-said-she-said dismissal and a recoverable claim.",
        ]),
        ("section", "h2", "How Dallas drivers use CarShake", [
            ("ul", [
                "Scan your vehicle before handing the keys over at Truluck's, Al Biernat's, or the Joule.",
                "Receive a QR-coded handover receipt — the valet keeps the matching half.",
                "Scan again at pickup; any new damage is flagged instantly with photos and a timestamp.",
                "Export the full report as a PDF for your insurance carrier or a small-claims filing.",
            ]),
        ]),
        ("section", "h2", "FAQ — Dallas", [
            ("details", "Are valet damage waivers legal in Texas?", "They are generally enforceable, but a documented pre-condition record defeats most blanket disclaimers because it proves the damage occurred during the bailment."),
            ("details", "Does this work for rental cars picked up at DFW or Love Field?", "Yes. Run a CarShake scan at pickup so the rental company's return inspection can't attribute prior damage to you."),
            ("details", "What about private lots in Highland Park and University Park?", "CarShake works the same on private lots. The condition record is independent of who operates the lot."),
            ("details", "Will photos hold up in Dallas County Justice Court?", "CarShake records are timestamped and tamper-evident, and are regularly used as exhibits in small-claims and insurance proceedings."),
        ]),
    ],
}

PAGES["for/chicago/index.html"] = {
    "h1": "Chicago",
    "inject_before": '<p><a href="https://carshake.online" style="color:#0066cc;font-weight:600">Start protecting your car →</a></p>',
    "sections": [
        ("section", "h2", "Chicago's valet-first downtown", [
            "Chicago is a tightly stacked parking market. River North restaurants, Gold Coast hotels, Streeterville medical centers, and the West Loop tech offices all rely on valet because surface parking is functionally gone. Cars are double- and triple-parked in narrow underground garages, then retrieved on demand — and every shuffle is a chance for a scuffed bumper or a curbed wheel.",
            "Add lake-effect ice in the winter, tight ramp clearances under older Michigan Avenue buildings, and a valet workforce that turns over quickly, and Chicago drivers see damage at a rate that ranks among the highest of any US metro. The handover receipt in your glovebox, with its fine-print disclaimer, is designed to protect the operator — not you.",
        ]),
        ("section", "h2", "Illinois law on valet damage", [
            "Illinois treats valet parking as a bailment for mutual benefit. Under that doctrine the operator is legally responsible for damage, but only to the extent the customer can prove the car was undamaged at drop-off and damaged at pickup. That is precisely the proof most Chicago drivers cannot produce, which is why valet companies print aggressive waivers.",
            "CarShake produces the missing proof. A pre-handover scan, a QR-coded bailment receipt, and a post-retrieval scan create a documented condition record. In Cook County arbitration or small-claims court, that record defeats most blanket disclaimers.",
        ]),
        ("section", "h2", "Where Chicago drivers use CarShake", [
            ("ul", [
                "Steakhouses and tasting-menu rooms in the West Loop and Fulton Market.",
                "Hotel towers along North Michigan Avenue and in Streeterville.",
                "Condo and apartment buildings in the Loop, Gold Coast, and Lincoln Park.",
                "Event venues, theaters, and concert halls in the South Loop and Near North.",
                "Private clubs and restaurants in River North and Old Town.",
            ]),
        ]),
        ("section", "h2", "FAQ — Chicago", [
            ("details", "Are valet waivers enforceable in Illinois?", "They are limited by Illinois bailment law. A bailment for mutual benefit shifts responsibility to the operator if you can prove pre-condition — which CarShake documents."),
            ("details", "What if my condo's valet damages my car?", "Condo valet operations are some of the highest-risk in Chicago because cars are shuffled constantly. A CarShake scan every time you hand over the keys protects you regardless of building management."),
            ("details", "Does this work for airport valet at O'Hare or Midway?", "Yes. Scan at drop-off so the off-airport valet or parking service cannot later attribute pre-existing damage to you."),
            ("details", "Will my photos hold up in Cook County court?", "CarShake records are timestamped and tamper-evident, and are regularly accepted as evidence in small-claims and insurance disputes."),
        ]),
    ],
}

PAGES["for/houston/index.html"] = {
    "h1": "Houston",
    "inject_before": '<p><a href="https://carshake.online" style="color:#0066cc;font-weight:600">Start protecting your car →</a></p>',
    "sections": [
        ("section", "h2", "Houston's valet culture", [
            "Houston is a sprawling, car-dependent city where valet is the default at nearly every sit-down restaurant, hotel, and medical campus. From River Oaks to the Galleria, from the Texas Medical Center to Montrose, drivers hand keys to strangers dozens of times a month. Houston drivers also own large vehicles — full-size SUVs and pickups — that do not fit comfortably in tight valet lots, which raises damage risk further.",
            "Common damage patterns include curbed wheels on narrow River Oaks turn-outs, bumper scrapes in stacked Galleria-district lots, and door dings in the multi-level garages around the Medical Center. Heat-warped paint and a seasonal hurricane evacuation that puts vehicles in unfamiliar hands add to the exposure.",
        ]),
        ("section", "h2", "Texas law on valet damage liability", [
            "Texas does not cap valet liability, but virtually every valet ticket printed in Houston includes a disclaimer of responsibility for damage, loss, or theft. Texas courts generally enforce those disclaimers under bailment law unless the customer can prove the vehicle was undamaged at drop-off and the damage arose during the bailment.",
            "CarShake closes the proof gap. A timestamped pre-handover scan, a QR-coded bailment receipt, and a post-retrieval scan create an evidentiary record. In Harris County small-claims court, that record turns a dismissible he-said-she-said claim into a recoverable one.",
        ]),
        ("section", "h2", "How Houston drivers use CarShake", [
            ("ul", [
                "Scan before drop-off at steakhouses along Westheimer and Post Oak.",
                "Get a QR-coded receipt at hotel valet in Downtown, the Galleria, and the Medical Center.",
                "Scan at pickup after late nights in Midtown and Washington Avenue.",
                "Export the report to your insurer or to file in Harris County Justice Court.",
            ]),
        ]),
        ("section", "h2", "FAQ — Houston", [
            ("details", "Does Texas require valet companies to carry insurance?", "Yes, but the policies are narrow and claims are routinely denied without proof of pre-condition. CarShake provides that proof."),
            ("details", "Will this work for my pickup or large SUV?", "Yes. Large vehicles are at higher risk in Houston valet lots, and CarShake documents every panel before you hand over the keys."),
            ("details", "What if damage happens during a hurricane evacuation?", "A pre-handover scan documents condition before any long-distance move, whether to a hotel, an airport valet, or a friend's garage."),
            ("details", "Can I use this for rental cars at IAH or Hobby?", "Yes. Scanning at pickup protects you from being charged for prior damage when you return the car."),
        ]),
    ],
}

# LA, SF, miami already have some h2+ul content; we inject MORE before the CTA <p> at line 29
PAGES["for/los-angeles/index.html"] = {
    "h1": "Los Angeles",
    "inject_before": '<p style="margin-top:2em"><a href="https://carshake.online" style="color:#0066cc;font-weight:600">Start now →</a></p>',
    "sections": [
        ("section", "h2", "California law on valet damage", [
            "California Civil Code section 1840 et seq. treats valet parking as a bailment for mutual benefit. Under that doctrine the valet operator is legally responsible for damage to the vehicle during the bailment — but in practice, nearly every valet ticket printed in Los Angeles includes a liability disclaimer, and the burden falls on the customer to prove the vehicle was undamaged at drop-off. Without that proof, claims are routinely dismissed.",
            "CarShake produces the missing evidence. A pre-handover scan, a QR-coded bailment receipt, and a post-retrieval scan create a timestamped, tamper-evident condition record. In Los Angeles County small-claims court, that record defeats most blanket disclaimers and shifts the burden back onto the operator.",
        ]),
        ("section", "h2", "Where LA drivers face the most valet risk", [
            ("ul", [
                "West Hollywood and Beverly Hills restaurants, where stacked street valet dominates.",
                "Studio lots in Burbank, Culver City, and Hollywood — security gates, narrow lanes, heavy traffic.",
                "DTLA hotel and event valet under the high-rise core.",
                "Malibu and Pacific Coast Highway venues with tight cliffside lots.",
                "LAX-area hotel parking before international trips.",
            ]),
        ]),
        ("section", "h2", "LA-specific damage patterns", [
            "LA valet damage is dominated by curbed wheels from the aggressive turn-outs on Sunset and Santa Monica boulevards, bumper scrapes from underground garage ramps under older Hollywood buildings, and door dings in the tightly stacked lots behind Venice and Abbott Kinney restaurants. Studio lots add a unique exposure: vehicles are shuttled between distant parking rows and stages, and a single move can cover more than a mile of unfamiliar lanes.",
        ]),
        ("section", "h2", "FAQ — Los Angeles", [
            ("details", "Are valet waivers enforceable in California?", "They are limited by California bailment law. For a bailment for mutual benefit, the operator is responsible if you can prove pre-condition — which CarShake documents."),
            ("details", "Does this work at private studio lots?", "Yes. CarShake records condition independent of who operates the lot, including on secure studio property."),
            ("details", "What about rental cars at LAX?", "Scanning at pickup means the rental return inspection cannot attribute prior damage to you."),
            ("details", "Will my photos hold up in LA County small-claims court?", "CarShake records are timestamped and tamper-evident, and are regularly accepted as evidence in small-claims disputes."),
        ]),
    ],
}

PAGES["for/san-francisco/index.html"] = {
    "h1": "San Francisco",
    "inject_before": '<p style="margin-top:2em"><a href="https://carshake.online" style="color:#0066cc;font-weight:600">Start now →</a></p>',
    "sections": [
        ("section", "h2", "Why SF valet is uniquely risky", [
            "San Francisco combines the worst valet risk factors: extreme density, hills, narrow Victorian-era lots, and some of the highest vehicle break-in rates in the country. Cars are routinely double-parked three deep in garages under Nob Hill, Russian Hill, and Pacific Heights restaurants and hotels. Tight ramp clearances and steep inclines mean front and rear bumper damage is far more common here than in flat cities.",
            "SF drivers also face one of the highest rates of vehicle break-ins of any US metro. A valet receipt that disclaims liability for theft is cold comfort if the operator's lot is unsecured. A pre-handover scan documents what was inside the cabin and the condition of the glass — critical evidence if the car is returned broken into.",
        ]),
        ("section", "h2", "California bailment law in SF", [
            "Under California Civil Code section 1840 et seq., valet parking is a bailment for mutual benefit, which places legal responsibility for damage on the operator. But San Francisco valet tickets include aggressive liability disclaimers, and without proof of pre-condition the customer loses. CarShake produces that proof: a timestamped pre-handover scan, a QR-coded bailment receipt, and a post-retrieval scan create a documented condition record.",
            "In San Francisco small-claims court, that record defeats most blanket disclaimers. Insurance carriers also accept CarShake exports when a claim is filed.",
        ]),
        ("section", "h2", "Where SF drivers use CarShake", [
            ("ul", [
                "Mission, Hayes Valley, and NOPA restaurants with tiny rear lots.",
                "Union Square and SoMa hotels with stacked underground garages.",
                "Pacific Heights and Russian Hill private residences with shared valet.",
                "SOMA event venues and concert halls.",
                "SFO-area hotel valet before a flight.",
            ]),
        ]),
        ("section", "h2", "FAQ — San Francisco", [
            ("details", "Does CarShake document the cabin interior too?", "Yes. The scan captures glass, interior, and cargo — critical in SF where break-ins are common."),
            ("details", "Are valet waivers enforceable in California?", "They are limited by California bailment law. A bailment for mutual benefit places responsibility on the operator if you prove pre-condition — which CarShake documents."),
            ("details", "What about SF's curbside valet zones?", "CarShake works identically on curbside and garage valet. The condition record is independent of the location."),
            ("details", "Will this help with rental cars picked up at SFO?", "Yes. Scan at pickup so the return inspection cannot charge you for prior damage."),
        ]),
    ],
}

PAGES["for/miami/index.html"] = {
    "h1": "Miami",
    "inject_before": '<p style="margin-top:2em"><a href="https://carshake.online" style="color:#0066cc;font-weight:600">Start now →</a></p>',
    "sections": [
        ("section", "h2", "Miami's valet-first culture", [
            "Miami is one of the most valet-dependent cities in America. From South Beach nightclubs and Brickell high-rises to the Design District and Wynwood, dropping the keys at the door is the default — often the only — parking option. Add tropical humidity, a luxury-heavy vehicle mix, and seasonal influx traffic during Art Basel and Ultra, and the damage exposure compounds.",
            "Common Miami damage patterns include curbed wheels on the tight turn-outs along Ocean Drive and Lincoln Road, bumper scrapes in the underground garages under Brickell Avenue towers, and interior damage from sand and salt air when vehicles are staged outdoors. High-value vehicles — exotics, luxury SUVs, convertibles — attract a higher per-incident claim value, which makes the proof gap more expensive.",
        ]),
        ("section", "h2", "Florida law on valet damage", [
            "Florida Statutes section 715.07 governs valet parking and bailment. Florida courts generally treat valet parking as a bailment for mutual benefit, which shifts responsibility for damage to the operator — but, as elsewhere, valet tickets include broad liability disclaimers that are enforceable unless the customer can prove the vehicle was undamaged at drop-off.",
            "CarShake produces that proof. A timestamped pre-handover scan, a QR-coded bailment receipt, and a post-retrieval scan create a documented condition record. In Miami-Dade County court, that record defeats most blanket disclaimers.",
        ]),
        ("section", "h2", "Where Miami drivers use CarShake", [
            ("ul", [
                "South Beach hotel and restaurant valet along Collins and Washington Avenue.",
                "Brickell and Downtown office and condo towers.",
                "Design District boutiques and restaurants.",
                "Wynwood galleries, bars, and event venues.",
                "MIA-area hotel and rental-car valet before a flight.",
            ]),
        ]),
        ("section", "h2", "FAQ — Miami", [
            ("details", "Are valet waivers enforceable in Florida?", "They are limited by Florida bailment law. For a mutual-benefit bailment, the operator is responsible if you prove pre-condition — which CarShake documents."),
            ("details", "Does this help during Art Basel or Ultra when traffic is chaos?", "Yes. Peak-event weekends see the highest damage rates of the year — exactly when the proof gap hurts most."),
            ("details", "What about convertibles and exotic cars?", "CarShake documents every panel and the interior before handover, which is essential for the high-value vehicles common in Miami."),
            ("details", "Will my photos hold up in Miami-Dade County court?", "CarShake records are timestamped and tamper-evident, and are regularly accepted as evidence in small-claims and insurance disputes."),
        ]),
    ],
}


def render_block(block):
    """block is either str (paragraph) or tuple ('ul', [items]) or ('details', q, a)."""
    if isinstance(block, str):
        return f"<p>{block}</p>"
    kind = block[0]
    if kind == "ul":
        items = "".join(f"<li>{i}</li>" for i in block[1])
        return f"<ul>{items}</ul>"
    if kind == "details":
        return f"<details><summary><strong>{block[1]}</strong></summary><p>{block[2]}</p></details>"
    raise ValueError(block)


def render_sections(sections):
    out = []
    for sec in sections:
        _, htag, htext, blocks = sec
        body = "\n".join(render_block(b) for b in blocks)
        out.append(f'<section style="margin-top:2em">\n<h2 style="font-size:1.4em;font-weight:700;margin:.5em 0">{htext}</h2>\n{body}\n</section>')
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
    for path, spec in PAGES.items():
        before = wordcount(path)
        ok = patch_file(path, spec["inject_before"], spec["sections"])
        after = wordcount(path) if ok else before
        status = "OK" if 400 <= after <= 700 else "CHECK"
        print(f"{status} {path}: {before} -> {after}")
