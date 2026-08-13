#!/usr/bin/env python3
"""
CarShake airport-valet pSEO generator.

Produces /airport-valet/{iata}/index.html pages — one per real US airport — from a
hard-coded dataset of factual airport records (IATA, name, city, state, region,
hub airlines). NO fabricated figures: no made-up valet rates, passenger counts,
or testimonials. The page carries real airport identity + honest, airport-agnostic
valet-damage-protection guidance, so each page has genuine unique value.

Usage:
  python3 _gen_airport.py [--limit N] [--hub]
Prints the path of each page created (one per line) so the orchestrator can gate
exactly the new files. Idempotent: skips airports that already have a page.
"""
import sys
import json
from pathlib import Path

from _pseo_common import (
    ROOT, BASE, MODIFIED, article, head_block, org_schema, sync_sitemap,
)

# (iata, airport_name, city, state, region, hub_note)
AIRPORTS = [
    ("ATL", "Hartsfield-Jackson Atlanta International Airport", "Atlanta", "Georgia", "Southeast", "the world's busiest airport and Delta Air Lines' primary hub"),
    ("LAX", "Los Angeles International Airport", "Los Angeles", "California", "West Coast", "the primary international gateway for Southern California"),
    ("ORD", "Chicago O'Hare International Airport", "Chicago", "Illinois", "Midwest", "a major hub for United Airlines and American Airlines"),
    ("DFW", "Dallas Fort Worth International Airport", "Dallas", "Texas", "South", "the largest hub for American Airlines"),
    ("DEN", "Denver International Airport", "Denver", "Colorado", "Mountain West", "the largest US airport by land area and a United hub"),
    ("JFK", "John F. Kennedy International Airport", "New York", "New York", "Northeast", "New York City's busiest international gateway"),
    ("SFO", "San Francisco International Airport", "San Francisco", "California", "West Coast", "a major hub for United and Alaska Airlines"),
    ("SEA", "Seattle-Tacoma International Airport", "Seattle", "Washington", "Pacific Northwest", "the primary hub for Alaska Airlines and Delta"),
    ("LAS", "Harry Reid International Airport", "Las Vegas", "Nevada", "Southwest", "the gateway for Las Vegas Strip traffic and a busy leisure hub"),
    ("MCO", "Orlando International Airport", "Orlando", "Florida", "Southeast", "the main gateway for Disney World and Central Florida tourism"),
    ("MIA", "Miami International Airport", "Miami", "Florida", "Southeast", "a major gateway to Latin America and the Caribbean"),
    ("CLT", "Charlotte Douglas International Airport", "Charlotte", "North Carolina", "Southeast", "American Airlines' second-largest hub"),
    ("PHX", "Phoenix Sky Harbor International Airport", "Phoenix", "Arizona", "Southwest", "a major hub for American and Southwest Airlines"),
    ("IAH", "George Bush Intercontinental Airport", "Houston", "Texas", "South", "a major United Airlines hub serving the Gulf Coast"),
    ("BOS", "Boston Logan International Airport", "Boston", "Massachusetts", "Northeast", "New England's primary international airport"),
    ("MSP", "Minneapolis-Saint Paul International Airport", "Minneapolis", "Minnesota", "Midwest", "a major Delta hub in the Upper Midwest"),
    ("DTW", "Detroit Metropolitan Wayne County Airport", "Detroit", "Michigan", "Midwest", "a major Delta Air Lines hub"),
    ("PHL", "Philadelphia International Airport", "Philadelphia", "Pennsylvania", "Northeast", "a major hub for American Airlines in the Mid-Atlantic"),
    ("LGA", "LaGuardia Airport", "New York", "New York", "Northeast", "New York City's closest airport to Manhattan"),
    ("BWI", "Baltimore/Washington International Airport", "Baltimore", "Maryland", "Mid-Atlantic", "a major Southwest Airlines base serving the DC-Baltimore corridor"),
    ("SAN", "San Diego International Airport", "San Diego", "California", "West Coast", "Southern California's coastal single-runway airport"),
    ("TPA", "Tampa International Airport", "Tampa", "Florida", "Southeast", "a major gateway for Florida's Gulf Coast"),
    ("MDW", "Chicago Midway International Airport", "Chicago", "Illinois", "Midwest", "Southwest Airlines' primary Chicago hub"),
    ("DCA", "Ronald Reagan Washington National Airport", "Washington", "District of Columbia", "Mid-Atlantic", "the closest airport to downtown Washington, DC"),
    ("IAD", "Washington Dulles International Airport", "Dulles", "Virginia", "Mid-Atlantic", "a major United hub serving international routes"),
    ("FLL", "Fort Lauderdale-Hollywood International Airport", "Fort Lauderdale", "Florida", "Southeast", "a major base for low-cost carriers serving South Florida"),
    ("SLC", "Salt Lake City International Airport", "Salt Lake City", "Utah", "Mountain West", "a major Delta Air Lines hub"),
    ("AUS", "Austin-Bergstrom International Airport", "Austin", "Texas", "South", "central Texas' fast-growing primary airport"),
    ("BNA", "Nashville International Airport", "Nashville", "Tennessee", "Southeast", "a major base for Southwest Airlines"),
    ("PDX", "Portland International Airport", "Portland", "Oregon", "Pacific Northwest", "the primary airport for Oregon and southwest Washington"),
    ("STL", "St. Louis Lambert International Airport", "St. Louis", "Missouri", "Midwest", "the primary airport serving the St. Louis metro"),
    ("RDU", "Raleigh-Durham International Airport", "Raleigh", "North Carolina", "Southeast", "the Research Triangle's primary airport"),
    ("SMF", "Sacramento International Airport", "Sacramento", "California", "West Coast", "Northern California's inland gateway"),
    ("SJC", "Norman Y. Mineta San Jose International Airport", "San Jose", "California", "West Coast", "Silicon Valley's closest major airport"),
    ("HNL", "Daniel K. Inouye International Airport", "Honolulu", "Hawaii", "Pacific", "Hawaii's primary international gateway"),
    ("OAK", "Oakland International Airport", "Oakland", "California", "West Coast", "a major Southwest base in the Bay Area"),
    ("DAL", "Dallas Love Field Airport", "Dallas", "Texas", "South", "Southwest Airlines' corporate home and primary Texas hub"),
    ("HOU", "William P. Hobby Airport", "Houston", "Texas", "South", "a major Southwest Airlines base for Houston"),
    ("MSY", "Louis Armstrong New Orleans International Airport", "New Orleans", "Louisiana", "South", "the primary airport for the Gulf South"),
    ("PIT", "Pittsburgh International Airport", "Pittsburgh", "Pennsylvania", "Northeast", "the primary airport for western Pennsylvania"),
    ("CLE", "Cleveland Hopkins International Airport", "Cleveland", "Ohio", "Midwest", "the primary airport for Northeast Ohio"),
    ("CVG", "Cincinnati/Northern Kentucky International Airport", "Cincinnati", "Ohio", "Midwest", "a major cargo and passenger hub in the Ohio Valley"),
    ("IND", "Indianapolis International Airport", "Indianapolis", "Indiana", "Midwest", "the primary airport for central Indiana"),
    ("MCI", "Kansas City International Airport", "Kansas City", "Missouri", "Midwest", "the primary airport for the Kansas City metro"),
    ("MKE", "Milwaukee Mitchell International Airport", "Milwaukee", "Wisconsin", "Midwest", "the primary airport for southeast Wisconsin"),
    ("SNA", "John Wayne Airport", "Santa Ana", "California", "West Coast", "Orange County's primary airport"),
    ("ONT", "Ontario International Airport", "Ontario", "California", "West Coast", "the inland gateway for the Greater Los Angeles area"),
]


def faq_block(iata, airport, city, state):
    return [
        {
            "q": f"Do I need proof before using valet parking at {airport}?",
            "a": (f"Yes. Before you hand your keys to any valet at {airport} ({iata}) in "
                  f"{city}, {state}, capture a timestamped, GPS-tagged scan of your car's "
                  "condition — all four sides, wheels, and windshield. Without a pre-handover "
                  "record, the valet can claim pre-existing damage and you have no recourse."),
        },
        {
            "q": f"What should I check after picking my car up at {airport}?",
            "a": ("Scan again at pickup and compare. New scrapes, dings, or curb rash that appear "
                  "between handover and pickup are exactly what a before-and-after record proves. "
                  "Report any new damage to the valet supervisor before you leave the property."),
        },
        {
            "q": f"Is valet parking at {iata} worth the risk?",
            "a": ("Valet parking is convenient, but handovers are the highest-risk moment for "
                  "cosmetic damage. The risk isn't the airport — it's the gap between who was "
                  "responsible for the car when. A 60-second scan closes that gap."),
        },
    ]


def gen_page(iata, airport, city, state, region, hub):
    url = f"{BASE}/airport-valet/{iata.lower()}"
    title = f"Valet Parking at {airport} ({iata}) — Protect Your Car in {city}"
    desc = (f"Using valet parking at {airport} ({iata}) in {city}, {state}? Learn how to "
            f"document your car's condition before and after handover so new damage can't be "
            f"blamed on you.")
    city_link = f"{BASE}/city/{city.lower().replace(' ', '-')}" if False else f"{BASE}/city"
    schema = json.dumps({
        "@context": "https://schema.org", "@type": "WebPage",
        "name": title, "url": url,
        "about": {"@type": "Airport", "name": airport, "iataCode": iata,
                  "address": {"@type": "PostalAddress", "addressLocality": city, "addressRegion": state}},
        "mainEntity": {
            "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": f["q"],
                            "acceptedAnswer": {"@type": "Answer", "text": f["a"]}}
                           for f in faq_block(iata, airport, city, state)],
        },
    })
    schemas = [org_schema(), schema]
    head = head_block(title, desc, url, schemas)

    faq_items = "".join(
        f"<h3>{f['q']}</h3><p>{f['a']}</p>" for f in faq_block(iata, airport, city, state)
    )

    body = f"""{head}
<nav class="breadcrumb"><a href="{BASE}/">Home</a> &rsaquo; <a href="{BASE}/airport-valet">Airport Valet Guides</a> &rsaquo; {iata}</nav>
<h1>Valet Parking at {airport} ({iata})</h1>
<p class="lede">{desc}</p>

<p>{airport} ({iata}) is {hub}, located in {city}, {state}, in the {region}. Every day
thousands of drivers hand their keys to valets here and at off-site lots near the terminals.
The handover is the single highest-risk moment for cosmetic damage &mdash; and it is almost
always the moment where &ldquo;it was already like that&rdquo; becomes the standard defense.</p>

<h2>Why the {city} handover is where damage gets disputed</h2>
<p>Valet damage claims at busy airports fail for one recurring reason: the driver has no
timestamped record of the car's condition before the handover. A scrape on the bumper, a curb
rash on the wheel, a door ding from a tight lot &mdash; without a pre-handover photo, none of
them can be tied to the lot that had custody. The {region} region is no exception; the dispute
mechanics are identical at {iata} as at any other major airport.</p>

<h2>What to scan before you hand over the keys at {iata}</h2>
<ul class="check">
<li>All four body panels, photographed square-on</li>
<li>Wheels and sidewalls (curb rash is the most common valet damage)</li>
<li>The windshield and mirrors (chips and cracks are easy to miss in daylight)</li>
<li>The front and rear bumpers &mdash; the two highest-contact zones</li>
</ul>
<p>Each photo should carry a GPS tag and a timestamp. That is what turns your word against
the valet's word into a dated, geotagged record &mdash; the difference between a denied claim
and a paid one at {airport}.</p>

<h2>Scan again at pickup in {city}</h2>
<p>After your trip, walk the same route before you drive off the lot. Compare against your
pre-handover scan. If new damage appeared while the car was in the valet's custody, report it
to the supervisor immediately &mdash; while you are still on the property &mdash; with your
before-and-after record in hand.</p>

<h2>FAQ</h2>
{faq_items}

<div class="callout good"><strong>The honest take:</strong> valet parking at {iata} is not
inherently dangerous &mdash; it is the <em>unrecorded</em> handover that is dangerous. A
60-second scan before and after is the cheapest insurance you can buy against a damage dispute
at {airport}.</div>

<div class="related-links">
<h3>Related</h3>
<ul>
<li><a href="{BASE}/city/{city.lower().replace(' ', '-')}">{city} valet damage guide</a></li>
<li><a href="{BASE}/cost-of/valet-damage-repair">Cost of valet damage repair</a></li>
<li><a href="{BASE}/learn/valet-damage-disputes">How to dispute valet damage</a></li>
<li><a href="{BASE}/airport-valet">All airport valet guides</a></li>
</ul>
</div>
</body></html>"""
    return body


def main():
    args = [a for a in sys.argv[1:]]
    limit = None
    if "--limit" in args:
        limit = int(args[args.index("--limit") + 1])
    do_hub = "--hub" in args

    created = []
    for iata, airport, city, state, region, hub in AIRPORTS:
        out_dir = ROOT / "airport-valet" / iata.lower()
        out_dir.mkdir(parents=True, exist_ok=True)
        target = out_dir / "index.html"
        if target.exists():
            continue
        target.write_text(gen_page(iata, airport, city, state, region, hub), encoding="utf-8")
        created.append(str(target))
        if limit and len(created) >= limit:
            break

    if do_hub or not created:
        hub = ROOT / "airport-valet" / "index.html"
        hub.write_text(gen_hub(), encoding="utf-8")
        created.append(str(hub))

    for c in created:
        print(c)

    sync_sitemap()
    print(f"[gen] created {len(created)} airport-valet page(s)", file=sys.stderr)


def gen_hub():
    url = f"{BASE}/airport-valet"
    title = "Airport Valet Parking Guides — Protect Your Car at US Airports"
    desc = ("Airport-by-airport valet parking guides: document your car's condition before and "
            "after handover at major US airports so new damage can't be blamed on you.")
    items = "".join(
        f'<li><a href="{BASE}/airport-valet/{i.lower()}">{airport} ({i})</a> &mdash; {city}, {st}</li>'
        for i, airport, city, st, *_ in AIRPORTS
    )
    head = head_block(title, desc, url, [org_schema()])
    return f"""{head}
<nav class="breadcrumb"><a href="{BASE}/">Home</a> &rsaquo; Airport Valet Guides</nav>
<h1>Airport Valet Parking Guides</h1>
<p class="lede">{desc}</p>
<p>Valet handovers at airports are a leading source of disputed cosmetic damage. Pick your
airport below for a focused guide on documenting your car's condition before and after handover.</p>
<ul class="check">{items}</ul>
<div class="callout good">Every guide uses real airport data (IATA code, city, state) and honest,
airport-agnostic guidance &mdash; no fabricated rates or statistics.</div>
</body></html>"""


if __name__ == "__main__":
    main()
