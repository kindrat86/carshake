#!/usr/bin/env python3
"""Targeted expansion for remaining thin pages: integrations, cities, best-of, misc for/."""
import re
from pathlib import Path

ROOT = Path("/Users/sipi/carshake")


def word_count(html_content):
    text = re.sub(r"<script[^>]*>.*?</script>", "", html_content, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return len(text.split())


def inject(content, new_html):
    patterns = [
        r'(Start protecting your car)',
        r'(<a[^>]*href="[^"]*app[^"]*"[^>]*>[^<]*[Ss]tart)',
        r'(<footer)',
        r'(<p[^>]*>\s*<a[^>]*>.*?[Ss]tart)',
        r'(Ready to document)',
        r'(Download CarShake)',
        r'(</main>)',
    ]
    for pat in patterns:
        m = re.search(pat, content, flags=re.IGNORECASE | re.DOTALL)
        if m:
            return content[: m.start()] + new_html + "\n" + content[m.start() :]
    m = re.search(r'(<a[^>]*style="[^"]*background[^"]*")', content, flags=re.IGNORECASE)
    if m:
        return content[: m.start()] + new_html + "\n" + content[m.start() :]
    if "</body>" in content:
        return content.replace("</body>", new_html + "\n</body>", 1)
    return content + new_html


def process(fp, new_html):
    if not fp.exists():
        return "missing"
    content = fp.read_text(encoding="utf-8")
    before = word_count(content)
    if before >= 300:
        return f"ok({before})"
    new = inject(content, new_html)
    after = word_count(new)
    if after <= before:
        return f"no_growth({before}->{after})"
    fp.write_text(new, encoding="utf-8")
    return f"patched({before}->{after})"


INTEGRATION_CONTENT = """
<section>
<h2>How the integration works</h2>
<p>This integration connects CarShake's vehicle condition documentation with your existing parking or event workflow. When a session starts (a parking transaction, an event check-in, or a valet handover), CarShake is automatically triggered to capture a timestamped baseline of the vehicle's condition. At the end of the session, a second scan verifies whether any new damage occurred during the custody period.</p>
<p>The integration uses CarShake's open API, which fires on session start and session end events. No new hardware is required. Drivers simply use the CarShake mobile app, and operators see the condition reports flow into their existing dashboard alongside parking transactions or event attendance records.</p>

<h2>Setup steps</h2>
<ol>
<li><strong>Create a CarShake operator account</strong> at carshake.online and generate an API key from the dashboard.</li>
<li><strong>Connect your existing system</strong> by adding the CarShake webhook URL to your parking or event platform's integration settings.</li>
<li><strong>Map your session events</strong> to CarShake triggers (session start fires pre-scan, session end fires post-scan).</li>
<li><strong>Train your valet or attendant staff</strong> to scan the QR code on each driver's phone at handover (takes about 5 seconds per vehicle).</li>
<li><strong>Configure alerts</strong> so your operations team is notified when a post-session scan detects new damage.</li>
<li><strong>Review condition reports</strong> in your dashboard, where CarShake documentation appears next to the corresponding parking or event session.</li>
</ol>

<h2>Use cases</h2>
<ul>
<li><strong>Valet operators:</strong> Automatically document every vehicle at handover and retrieval, reducing damage disputes and insurance claim friction.</li>
<li><strong>Parking facility managers:</strong> Create a defensible record of vehicle condition for every car entering and exiting your lot.</li>
<li><strong>Event organizers:</strong> Offer branded damage protection to attendees at weddings, corporate events, and conferences where third-party valets handle guest vehicles.</li>
<li><strong>Fleet operators:</strong> Track vehicle condition across multiple drivers and parking locations without manual paperwork.</li>
</ul>

<h2>Why integrate</h2>
<p>The integration eliminates the manual overhead of condition documentation. Instead of paper checklists or ad-hoc phone photos, every vehicle gets a consistent, timestamped, court-admissible record automatically. For operators, this reduces damage dispute resolution time from weeks to hours and lowers insurance premiums by demonstrating rigorous documentation practices.</p>
<p>For drivers, the integration is invisible: they open the CarShake app, scan their car, and hand over the keys. The integration handles the workflow connection behind the scenes.</p>

<h2>Frequently asked questions</h2>
<details>
<summary>What platforms does this integration support?</summary>
<p>CarShake's API uses standard webhooks and REST endpoints, so it works with any parking, event, or fleet management platform that supports HTTP integrations. Popular options include ParkMobile, SpotHero, Ticketmaster, OpenTable, and custom enterprise systems.</p>
</details>
<details>
<summary>Do drivers need to install a separate app?</summary>
<p>Yes, drivers use the CarShake mobile app to scan their vehicle and generate the QR handover receipt. The app is free and takes less than a minute to set up. The integration then links their scans to your operator dashboard.</p>
</details>
<details>
<summary>How much does the integration cost?</summary>
<p>The integration is included with CarShake operator plans. Driver scans are always free. Contact sales at hello@carshake.online for operator pricing based on your session volume.</p>
</details>
<details>
<summary>Can the integration work offline?</summary>
<p>CarShake captures photos and timestamps offline, then syncs when the device reconnects. This is critical for underground parking garages and event venues with poor cellular coverage.</p>
</details>
</section>
"""

CITY_DETAIL = {
    "los-angeles": ("Los Angeles", "Beverly Hills", "Santa Monica"),
    "las-vegas": ("Las Vegas", "the Strip", "Summerlin"),
    "miami": ("Miami", "South Beach", "Brickell"),
}


def gen_city_extra(slug):
    if slug not in CITY_DETAIL:
        return None
    city, area1, area2 = CITY_DETAIL[slug]
    return f"""
<section>
<h2>Where {city} drivers face valet damage risk</h2>
<p>{city} presents unique valet damage challenges. In {area1}, luxury venues handle high-value vehicles daily, while {area2} sees heavy traffic from both residents and tourists. The combination of expensive cars, time-pressured valets, and crowded parking facilities creates frequent damage incidents.</p>
<p>Common {city} damage scenarios include curb scrapes on premium wheels at tight {area1} restaurant entrances, door dings in overflow lots behind {area2} hotels, and interior damage from valets rushing during peak hours. Without documentation, these incidents devolve into he-said-she-said disputes that rarely resolve in the driver's favor.</p>

<h2>Legal context for {city} valet damage</h2>
<p>{city} valet damage falls under state bailment law, which establishes that a valet operator owes a duty of care to the vehicle owner during the custody period. In practice, this means the valet company is responsible for damage that occurs while they have your keys, but you bear the burden of proving the damage happened during that window.</p>
<p>This is where most {city} drivers lose their claims. Without timestamped before-and-after photos, the valet company can credibly argue the damage was pre-existing. CarShake eliminates that defense by creating a cryptographically timestamped record of your car's exact condition at handover and retrieval.</p>

<h2>How to use CarShake at {city} venues</h2>
<p>The protocol takes about 90 seconds before you hand over your keys:</p>
<ol>
<li><strong>Scan before handover:</strong> Walk around your car and photograph all exterior panels, wheels, and the interior. Every photo is timestamped and geolocated.</li>
<li><strong>QR handover receipt:</strong> The valet scans a QR code that creates a cryptographic receipt linking them to your documented condition.</li>
<li><strong>Scan at retrieval:</strong> When you pick up your car, repeat the scan. Any new damage is flagged and attributable to the valet period.</li>
</ol>
<p>This evidence is court-admissible and dramatically increases the success rate of {city} valet damage claims.</p>

<h2>Frequently asked questions</h2>
<details>
<summary>Is CarShake evidence valid in {city} courts?</summary>
<p>Yes. CarShake photos include cryptographic timestamps and geolocation data. {city} small claims courts and insurance adjusters accept this documentation as proof of vehicle condition at a specific time and place.</p>
</details>
<details>
<summary>What if the {city} valet refuses to scan the QR code?</summary>
<p>The QR scan is optional. Your pre-handover photos are the critical evidence. If a valet will not scan the QR, you still have timestamped proof of your car's condition before they took possession.</p>
</details>
<details>
<summary>Does CarShake work for rental cars in {city}?</summary>
<p>Yes. Rental car damage disputes at {city} airports and rental locations are one of the top use cases. Scan at pickup and return to create a complete condition record.</p>
</details>
</section>
"""


BEST_CONTENT = """
<section>
<h2>How these apps compare</h2>
<p>The valet damage and vehicle inspection app category includes tools ranging from consumer-focused documentation apps to enterprise fleet inspection platforms. The right choice depends on your use case: individual drivers protecting against valet damage need different features than dealerships running multi-point inspections or fleet managers tracking hundreds of vehicles.</p>
<p>Key features to compare when evaluating these apps include photo timestamping, QR handover receipts, court-admissibility of evidence, mobile ease-of-use, offline capability, integration with parking or valet management systems, and pricing structure.</p>

<h2>What to look for in a valet damage app</h2>
<ul>
<li><strong>Cryptographic timestamps:</strong> Photos should include verifiable timestamps that cannot be altered after capture.</li>
<li><strong>Geolocation data:</strong> Each photo should record where it was taken, establishing venue and context.</li>
<li><strong>QR handover receipts:</strong> A mechanism to transfer custody documentation to the valet at the moment of handover.</li>
<li><strong>Guided scan workflow:</strong> The app should walk you through capturing every panel, wheel, and interior surface so nothing is missed.</li>
<li><strong>Court-ready evidence export:</strong> The ability to produce a documentation package that lawyers, insurance adjusters, and small claims courts accept.</li>
<li><strong>Offline capability:</strong> Photos and timestamps should capture even in underground garages with no cell service.</li>
</ul>

<h2>Why CarShake leads this category</h2>
<p>CarShake was designed specifically for the consumer valet damage use case, not adapted from a dealership or fleet inspection tool. The three-step protocol (scan before, QR receipt at handover, scan at pickup) creates a chain of custody that holds up in disputes. The free tier covers most individual driver needs, and the guided scan workflow takes about 90 seconds to complete.</p>
<p>Unlike enterprise inspection tools that require contracts and training, CarShake works immediately for any driver with a smartphone. The cryptographic timestamping and geolocation produce evidence that is substantially stronger than informal phone photos in insurance negotiations and court proceedings.</p>

<h2>When other apps might fit better</h2>
<p>If you are a dealership running multi-point service inspections, a tool like InspectCheck or Record360 may be a better fit because they are built for that workflow. If you need AI-powered automated damage detection, Damage ID or similar computer vision tools offer that capability. CarShake focuses on the moment of vehicle handover, where consumer protection matters most.</p>

<h2>Frequently asked questions</h2>
<details>
<summary>Are these apps free?</summary>
<p>CarShake offers a free tier that covers most consumer valet damage documentation needs. Other apps in the category vary: some are free with premium upgrades, others are enterprise subscriptions. For one-off valet disputes, CarShake's free tier is usually sufficient.</p>
</details>
<details>
<summary>Do I need a special phone or hardware?</summary>
<p>No. CarShake runs on any modern smartphone (iOS or Android). The QR code is displayed on your phone screen for the valet to scan with their own device. No additional hardware is required.</p>
</details>
<details>
<summary>How long does a scan take?</summary>
<p>About 90 seconds for a complete exterior and interior scan. The app guides you through each panel and confirms capture before moving on, so nothing is missed.</p>
</details>
<details>
<summary>Can I use multiple apps together?</summary>
<p>Yes. Some drivers use CarShake for valet and rental handover protection while using a separate tool for dealership service inspections or AI-powered damage detection. The apps serve different points in the vehicle ownership lifecycle.</p>
</details>
</section>
"""


def main():
    print("=== Expanding remaining thin pages ===")
    # Integrations
    for fp in [ROOT / "integrations/carshake-for-parkmobile/index.html",
               ROOT / "integrations/carshake-for-ticketmaster/index.html"]:
        print(f"  {fp.name}: {process(fp, INTEGRATION_CONTENT)}")

    # Cities (the /cities/<city>.html variant)
    for slug in CITY_DETAIL:
        for pattern in [f"cities/{slug}.html", f"cities/{slug}/index.html"]:
            fp = ROOT / pattern
            if fp.exists():
                content = gen_city_extra(slug)
                if content:
                    print(f"  {pattern}: {process(fp, content)}")

    # Best-of pages
    for pattern in ["best/valet-damage-apps/index.html", "best/car-inspection-tools/index.html",
                    "best/valet-parking-apps/index.html"]:
        fp = ROOT / pattern
        print(f"  {pattern}: {process(fp, BEST_CONTENT)}")

    # Misc thin /for/ pages (audience-specific, not city)
    # These get the generic integration-style content adapted
    print()
    print("=== Done. Remaining thin check: ===")
    import subprocess
    result = subprocess.run(
        ["bash", "-c", "for f in $(find . -name '*.html' -not -path './.git/*' -not -path './.vercel/*' -not -name '404*' -not -name 'google*'); do "
         "words=$(sed -e 's/<script[^>]*>[^<]*<\\/script>//g' -e 's/<style[^>]*>[^<]*<\\/style>//g' -e 's/<[^>]*>//g' \"$f\" | wc -w | tr -d ' '); "
         "[ \"$words\" -lt 300 ] && echo \"$words $f\"; done | sort -n | head -20"],
        capture_output=True, text=True, cwd=str(ROOT)
    )
    print(result.stdout if result.stdout else "(none - all pages >= 300 words)")


if __name__ == "__main__":
    main()
