#!/usr/bin/env python3
"""Runner: expand all thin carshake pages using content generators."""
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, "/Users/sipi/carshake")
from _content_data import gen_city, CITY_DATA
from _content_vs import gen_vs, gen_scenario, COMPETITOR_DATA, SCENARIO_DATA
from _content_learn import gen_learn, gen_faq, gen_glossary, gen_checklist, LEARN_DATA, FAQ_DATA, GLOSSARY_DATA, CHECKLIST_DATA

ROOT = Path("/Users/sipi/carshake")


def word_count(html_content):
    text = re.sub(r"<script[^>]*>.*?</script>", "", html_content, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return len(text.split())


def find_insertion_point(content):
    """Find where to inject content - before CTA/footer/main-close."""
    patterns = [
        r'(<section[^>]*>\s*<h2[^>]*>\s*Start protecting)',
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
            return m.start()
    # Try before first CTA-styled link
    m = re.search(r'(<a[^>]*style="[^"]*background[^"]*")', content, flags=re.IGNORECASE)
    if m:
        return m.start()
    return None


def inject(content, new_html):
    pos = find_insertion_point(content)
    if pos:
        return content[:pos] + new_html + "\n" + content[pos:]
    # Fallback: before </body>
    if "</body>" in content:
        return content.replace("</body>", new_html + "\n</body>", 1)
    return content + new_html


def title_to_slug(title):
    """Extract a slug from the page title."""
    # e.g. "CarShake vs Inspectr - Car Inspection Apps Compared" -> "inspectcheck"? No, use filename
    return None


def process_file(filepath, gen_func, slug, display_name=None):
    """Process a single file: check if thin, inject content if so."""
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception as e:
        return ("error", str(e))

    wc_before = word_count(content)
    if wc_before >= 300:
        return ("skip_ok", wc_before)

    # Never staple a second comparison onto a page that already has one. The round15
    # pages ship a "Quick comparison" table plus an FAQ but run under 300 words, so
    # without this guard they get a duplicate "Feature comparison" section (and a second
    # FAQ) appended on every run.
    low = content.lower()
    if ("feature comparison:" in low
            or "quick comparison" in low
            or "<!-- isenberg-round" in low):
        return ("skip_has_comparison", wc_before)

    new_html = gen_func(slug, display_name) if display_name else gen_func(slug)
    if not new_html:
        return ("no_template", wc_before)

    new_content = inject(content, new_html)
    wc_after = word_count(new_content)

    if wc_after <= wc_before:
        return ("no_growth", wc_before, wc_after)

    filepath.write_text(new_content, encoding="utf-8")
    return ("patched", wc_before, wc_after)


def main():
    stats = {"patched": 0, "skip_ok": 0, "no_template": 0, "no_growth": 0, "error": 0}
    details = []

    # === CITY PAGES ===
    # for/<city>/ pattern
    for slug, _ in CITY_DATA.items():
        for pattern in [f"for/{slug}/index.html", f"{slug}/index.html", f"cities/{slug}/index.html"]:
            fp = ROOT / pattern
            if fp.exists():
                # display name from slug
                name_map = {
                    "los-angeles": "Los Angeles", "san-francisco": "San Francisco",
                    "new-york": "New York", "las-vegas": "Las Vegas",
                }
                display = name_map.get(slug, slug.replace("-", " ").title())
                result = process_file(fp, gen_city, slug, display)
                stats[result[0]] = stats.get(result[0], 0) + 1
                if result[0] == "patched":
                    details.append((pattern, result[1], result[2]))
                elif result[0] not in ("skip_ok",):
                    details.append((pattern, result[0], result[1] if len(result) > 1 else ""))

    # === VS PAGES ===
    for slug in COMPETITOR_DATA:
        for pattern in [f"vs/{slug}/index.html", f"vs/{slug}.html"]:
            fp = ROOT / pattern
            if fp.exists():
                result = process_file(fp, gen_vs, slug, slug)
                stats[result[0]] = stats.get(result[0], 0) + 1
                if result[0] == "patched":
                    details.append((pattern, result[1], result[2]))

    # === SCENARIO PAGES ===
    for slug in SCENARIO_DATA:
        for pattern in [f"scenarios/{slug}/index.html", f"scenarios/{slug}.html"]:
            fp = ROOT / pattern
            if fp.exists():
                result = process_file(fp, gen_scenario, slug)
                stats[result[0]] = stats.get(result[0], 0) + 1
                if result[0] == "patched":
                    details.append((pattern, result[1], result[2]))

    # === LEARN PAGES ===
    for slug in LEARN_DATA:
        for pattern in [f"learn/{slug}/index.html", f"learn/{slug}.html"]:
            fp = ROOT / pattern
            if fp.exists():
                result = process_file(fp, gen_learn, slug)
                stats[result[0]] = stats.get(result[0], 0) + 1
                if result[0] == "patched":
                    details.append((pattern, result[1], result[2]))

    # === FAQ PAGES ===
    for slug in FAQ_DATA:
        for pattern in [f"faq/{slug}/index.html", f"faq/{slug}.html"]:
            fp = ROOT / pattern
            if fp.exists():
                result = process_file(fp, gen_faq, slug)
                stats[result[0]] = stats.get(result[0], 0) + 1
                if result[0] == "patched":
                    details.append((pattern, result[1], result[2]))

    # === GLOSSARY PAGES ===
    for slug in GLOSSARY_DATA:
        for pattern in [f"glossary/{slug}/index.html", f"glossary/{slug}.html"]:
            fp = ROOT / pattern
            if fp.exists():
                result = process_file(fp, gen_glossary, slug)
                stats[result[0]] = stats.get(result[0], 0) + 1
                if result[0] == "patched":
                    details.append((pattern, result[1], result[2]))

    # === CHECKLIST PAGES ===
    for slug in CHECKLIST_DATA:
        for pattern in [f"checklists/{slug}/index.html", f"checklists/{slug}.html"]:
            fp = ROOT / pattern
            if fp.exists():
                result = process_file(fp, gen_checklist, slug)
                stats[result[0]] = stats.get(result[0], 0) + 1
                if result[0] == "patched":
                    details.append((pattern, result[1], result[2]))

    print("=== EXPANSION RESULTS ===")
    print(f"Patched: {stats['patched']}")
    print(f"Already OK (>=300 words): {stats['skip_ok']}")
    print(f"No template match: {stats['no_template']}")
    print(f"No growth (insertion failed): {stats['no_growth']}")
    print(f"Errors: {stats['error']}")
    print()
    if details:
        print("=== PATCHED FILES (before -> after words) ===")
        for d in sorted(details):
            if len(d) == 3 and d[0] not in ("no_template", "no_growth", "error"):
                print(f"  {d[0]}: {d[1]} -> {d[2]} words")
            else:
                print(f"  {d}")


if __name__ == "__main__":
    main()
