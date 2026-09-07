#!/usr/bin/env python3
"""Regression gate for indexable CarShake sitemap pages.

Every local sitemap URL must map to deployable HTML, be indexable, declare a
matching local canonical, and contain at least 150 visible words. This catches
Soft 404, stale noindex, missing-file, and canonical drift before deployment.
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://carshake.online"
MIN_VISIBLE_WORDS = 150


def visible_words(source: str) -> int:
    body = re.search(r"<body\b[^>]*>(.*?)</body>", source, re.I | re.S)
    text = body.group(1) if body else source
    text = re.sub(
        r"<(script|style|noscript|svg)\b[^>]*>.*?</\1>",
        " ",
        text,
        flags=re.I | re.S,
    )
    text = html.unescape(re.sub(r"<[^>]+>", " ", text))
    return len(re.findall(r"\b[\w'-]+\b", text))


def exact_rewrites() -> dict[str, Path]:
    config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
    routes: dict[str, Path] = {}
    for rewrite in config.get("rewrites", []):
        source = rewrite.get("source", "")
        destination = rewrite.get("destination", "")
        if ":" not in source and destination.endswith((".html", "/index.html")):
            routes[source] = ROOT / destination.lstrip("/")
    return routes


EXACT_REWRITES = exact_rewrites()


def html_for_path(path: str) -> Path | None:
    rewritten = EXACT_REWRITES.get(path)
    if rewritten and rewritten.is_file():
        return rewritten
    clean = path.strip("/")
    candidates = (
        [ROOT / "index.html"]
        if not clean
        # Vercel cleanUrls serves a flat file before a shadowed directory twin.
        else [ROOT / f"{clean}.html", ROOT / clean / "index.html"]
    )
    return next((candidate for candidate in candidates if candidate.is_file()), None)


def main() -> int:
    xml = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    urls = [html.unescape(loc.strip()) for loc in re.findall(r"<loc>([^<]+)</loc>", xml)]
    failures: list[str] = []

    if len(urls) != len(set(urls)):
        failures.append(f"duplicate sitemap URLs: {len(urls) - len(set(urls))}")

    for url in urls:
        parsed = urlparse(url)
        if parsed.netloc != "carshake.online":
            failures.append(f"foreign loc: {url}")
            continue
        page = html_for_path(parsed.path)
        if page is None:
            failures.append(f"no deployable HTML: {url}")
            continue
        source = page.read_text(encoding="utf-8", errors="replace")
        robots = re.search(
            r'<meta\b[^>]*name=["\']robots["\'][^>]*content=["\']([^"\']+)',
            source,
            re.I,
        )
        if robots and "noindex" in robots.group(1).lower():
            failures.append(f"noindex: {url} ({page.relative_to(ROOT)})")
        canonical = re.search(
            r'<link\b[^>]*rel=["\'][^"\']*canonical[^"\']*["\'][^>]*href=["\']([^"\']+)',
            source,
            re.I,
        )
        if canonical is None:
            failures.append(f"missing canonical: {url} ({page.relative_to(ROOT)})")
        elif canonical.group(1) != url:
            failures.append(
                f"canonical mismatch: {url} -> {canonical.group(1)} ({page.relative_to(ROOT)})"
            )
        words = visible_words(source)
        if words < MIN_VISIBLE_WORDS:
            failures.append(
                f"thin page: {url} has {words} visible words ({page.relative_to(ROOT)})"
            )

    if failures:
        print(f"FAIL: {len(failures)} sitemap quality issue(s)")
        for failure in failures:
            print(f"  {failure}")
        return 1
    print(
        f"PASS: {len(urls)} unique local sitemap URLs, each deployable, indexable, "
        f"self-canonical, and >= {MIN_VISIBLE_WORDS} visible words"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
