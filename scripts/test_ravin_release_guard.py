from __future__ import annotations

import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
STALE_PUBLIC_PATHS = (
    "/public/vs/ravin-ai",
    "/public/alternatives-to/ravin-ai",
)


class RavinReleaseGuardTest(unittest.TestCase):
    def test_only_stale_ravin_public_copies_are_deploy_excluded(self) -> None:
        entries = {
            line.strip()
            for line in (ROOT / ".vercelignore").read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.lstrip().startswith("#")
        }
        self.assertNotIn("/public", entries)
        for path in STALE_PUBLIC_PATHS:
            with self.subTest(path=path):
                self.assertIn(path, entries)
                self.assertTrue((ROOT / path.lstrip("/")).is_file())

    def test_canonical_ravin_pages_do_not_repeat_stale_pricing_copy(self) -> None:
        for relative in ("vs/ravin-ai.html", "alternatives-to/ravin-ai.html"):
            page = (ROOT / relative).read_text(encoding="utf-8")
            with self.subTest(relative=relative):
                self.assertNotIn("pricing: Varies", page)
                self.assertNotIn("Pro $19.97/mo", page)
                self.assertIn("$2.97", page)


if __name__ == "__main__":
    unittest.main()
