#!/usr/bin/env python3
"""Regression checks for indexable sitemap hubs flagged as Soft 404 risks."""
from __future__ import annotations

import re
from html import unescape
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
HUBS = {
    "best/index.html",
    "cities.html",
    "free/index.html",
    "integrations/index.html",
    "pricing-questions/index.html",
}


def visible_words(html: str) -> int:
    html = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", html, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", html)
    return len(re.findall(r"[A-Za-z][A-Za-z'-]*", unescape(text)))


class IndexingHubTests(unittest.TestCase):
    def test_hubs_have_substantive_visible_content(self) -> None:
        for relative_path in HUBS:
            with self.subTest(relative_path=relative_path):
                html = (ROOT / relative_path).read_text(encoding="utf-8")
                self.assertGreaterEqual(
                    visible_words(html),
                    250,
                    f"{relative_path} is too thin for an indexable sitemap hub",
                )

    def test_sitemap_does_not_include_noindex_pages(self) -> None:
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        self.assertNotIn("<meta name=\"robots\" content=\"noindex", sitemap)


if __name__ == "__main__":
    unittest.main(verbosity=2)
