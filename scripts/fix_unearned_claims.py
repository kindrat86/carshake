#!/usr/bin/env python3
"""
Remove unearned social proof and the first-party repair-cost claim.

Found 2026-07-25 by running churnlens's provenance gate across the portfolio:
    python3 ~/churnlens/scripts/check_provenance_claims.py --root ~/carshake

TWO PROBLEMS
------------
1. "Trusted by <City> drivers." / "Trusted by businesses in <City>."
   Templated across ~40 city pages, the international city pages and the locale
   pages - 444 occurrences, in visible copy, <meta> descriptions and JSON-LD
   `description` fields. CarShake's own funnel store (~/.carshake/funnel.db)
   holds 9 subscribers in total, so "trusted by Austin drivers" (and by Boston,
   Dallas, Denver ... drivers) is not something the site can say. Replaced with
   "Built for <City> drivers." - a statement of design intent, which is true,
   reads naturally in the same slot, and keeps the local relevance the page
   needs.

2. "According to our analysis of 2026 repair cost data, ..."
   There is no such analysis. It also contradicts the site's own CSV, whose
   footer describes the same numbers as "industry repair cost estimates". The
   ranges are plausible market figures and are kept; only the claim to have
   measured them is removed.

The CC BY 4.0 dataset (vehicle-damage-costs-2026.csv) invites other people to
cite these numbers, so its footer is made explicit about what they are: indicative
published ranges, not measurements, that vary widely by vehicle and location.

Idempotent. Run from ~/carshake.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = re.compile(r"(^|/)(\.git|node_modules|\.claude|worktrees|dist|\.vercel)(/|$)")
SCAN = {".html", ".txt", ".json", ".csv", ".xml"}

# 1. unearned social proof -> statement of design intent
TRUSTED_DRIVERS = (re.compile(r"Trusted by ([A-Z][A-Za-z .'\-]*?) drivers\."), r"Built for \1 drivers.")
TRUSTED_BUSINESS = (re.compile(r"Trusted by businesses in ([A-Z][A-Za-z .'\-]*?)\."), r"Built for businesses in \1.")
# The Salt Lake City page's description was truncated by the generator at a meta
# length limit, so it reads "Trusted by Salt Lake City..." with no " drivers." to
# match. Restore the full, honest sentence rather than leaving a dangling ellipsis.
TRUSTED_TRUNCATED = (
    re.compile(r"Trusted by ([A-Z][A-Za-z .'\-]*?)\.\.\."),
    r"Built for \1 drivers.",
)

# 2. first-party analysis claim -> honest framing consistent with the CSV
ANALYSIS = [
    (
        "According to our analysis of 2026 repair cost data, a single door ding can cost $150–$500 to repair",
        "Typical published repair estimates put a single door ding at $150–$500",
    ),
    (
        "According to our analysis of 2026 repair cost data,",
        "Typical published repair estimates suggest",
    ),
    ("our analysis of 2026 repair cost data", "commonly quoted repair-cost ranges"),
]

# 3. CSV / dataset provenance
CSV_OLD = "Source: Industry repair cost estimates, 2024-2026. CC BY 4.0. Cite as: CarShake (carshake.online), \"Vehicle Damage Cost Database\", 2026. Actual costs vary by vehicle make, model, location, and repair shop."
CSV_NEW = (
    '"Source: Indicative repair-cost ranges compiled by CarShake from commonly quoted body-shop '
    "estimates. These are editorial estimates for orientation - NOT measurements, not a survey, and "
    "not derived from CarShake user data. Actual cost varies widely by make, model, trim, paint, "
    "location and shop; get a local quote before relying on any figure here. Last reviewed "
    '2026-07-25."\n'
    '"Licence: CC BY 4.0 - cite as CarShake (carshake.online), ""Vehicle Damage Cost Database"", 2026."\n'
)


def main() -> int:
    changed = edits = 0
    for p in sorted(ROOT.rglob("*")):
        if not p.is_file() or p.suffix.lower() not in SCAN or SKIP.search("/" + str(p.relative_to(ROOT))):
            continue
        try:
            orig = p.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        out, n = orig, 0
        for rx, repl in (TRUSTED_DRIVERS, TRUSTED_BUSINESS, TRUSTED_TRUNCATED):
            out, k = rx.subn(repl, out)
            n += k
        for find, repl in ANALYSIS:
            if find in out:
                n += out.count(find)
                out = out.replace(find, repl)
        if out != orig:
            p.write_text(out, encoding="utf-8")
            changed += 1
            edits += n
    print(f"  copy: {edits} edit(s) across {changed} file(s)")

    # CSV footer
    csv = ROOT / "vehicle-damage-costs-2026.csv"
    if csv.is_file():
        lines = csv.read_text(encoding="utf-8").splitlines(keepends=True)
        kept = [l for l in lines if not l.startswith("Source: Industry repair cost estimates")]
        if len(kept) != len(lines):
            if not kept[-1].endswith("\n"):
                kept[-1] += "\n"
            csv.write_text("".join(kept) + CSV_NEW, encoding="utf-8")
            print("  csv:  footer rewritten")
        else:
            print("  csv:  already clean")

    # verification
    leaks = []
    for p in sorted(ROOT.rglob("*")):
        if not p.is_file() or p.suffix.lower() not in SCAN or SKIP.search("/" + str(p.relative_to(ROOT))):
            continue
        try:
            t = p.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        if "Trusted by" in t or "our analysis of 2026" in t:
            leaks.append(str(p.relative_to(ROOT)))
    if leaks:
        print(f"\nFAIL: {len(leaks)} file(s) still carry a claim: {leaks[:5]}", file=sys.stderr)
        return 1
    print("\nOK - no unearned social proof or first-party repair-cost claim remains.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
