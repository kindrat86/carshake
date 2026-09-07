#!/usr/bin/env python3
"""Ensure the sitemap gate checks the HTML that Vercel clean URLs serve."""
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import test_sitemap_quality as quality


class SitemapFileResolution(unittest.TestCase):
    def test_flat_clean_url_wins_over_shadowed_directory_index(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            flat = root / 'answers.html'
            flat.write_text('<html>served content</html>', encoding='utf-8')
            directory = root / 'answers'
            directory.mkdir()
            (directory / 'index.html').write_text('<html>shadowed content</html>', encoding='utf-8')
            with patch.object(quality, 'ROOT', root), patch.object(quality, 'EXACT_REWRITES', {}):
                self.assertEqual(quality.html_for_path('/answers'), flat)

    def test_directory_index_is_used_when_no_flat_file_exists(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            directory = root / 'city' / 'athens'
            directory.mkdir(parents=True)
            index = directory / 'index.html'
            index.write_text('<html>directory content</html>', encoding='utf-8')
            with patch.object(quality, 'ROOT', root), patch.object(quality, 'EXACT_REWRITES', {}):
                self.assertEqual(quality.html_for_path('/city/athens'), index)


if __name__ == '__main__':
    unittest.main(verbosity=2)