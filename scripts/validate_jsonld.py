#!/usr/bin/env python3
"""JSON-LD lint: every <script type="application/ld+json"> block in every
scanned .html file must be valid JSON with a top-level @context and
(@type or @graph). Zero dependencies (stdlib only) so it runs on any CI
runner without an install step.

Usage:
  python3 scripts/validate_jsonld.py [root [root ...]]

Exits 1 (and prints every failure) if any block is invalid. Exits 0 on a
clean scan, including the case where zero .html files are found.
"""
import json
import os
import re
import sys

SKIP_DIRS = {
    ".git", "node_modules", ".venv", ".testvenv", ".buildvenv",
    ".vercel", ".next", "dist", "build", "__pycache__", ".turbo",
}

BLOCK_RE = re.compile(
    r'<script[^>]*\btype\s*=\s*"application/ld\+json"[^>]*>(.*?)</script>',
    re.S | re.I,
)


def iter_html_files(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if fn.endswith(".html"):
                yield os.path.join(dirpath, fn)


def check_file(path):
    errors = []
    blocks = []
    try:
        html = open(path, encoding="utf-8", errors="strict").read()
    except UnicodeDecodeError as e:
        return [f"{path}: not valid UTF-8 ({e})"]

    for i, raw in enumerate(BLOCK_RE.findall(html)):
        block = raw.strip()
        if not block:
            continue
        try:
            parsed = json.loads(block)
        except json.JSONDecodeError as e:
            errors.append(f"{path} [block {i}]: invalid JSON — {e}")
            continue

        blocks.append(parsed)
        nodes = parsed if isinstance(parsed, list) else [parsed]
        for node in nodes:
            if not isinstance(node, dict):
                continue
            if "@context" not in node:
                errors.append(f"{path} [block {i}]: missing @context")
            if "@type" not in node and "@graph" not in node:
                errors.append(f"{path} [block {i}]: missing @type (and no @graph)")

    # Dataset nodes must carry a resolvable creator: either a typed
    # Organization/Person object, or an @id reference to a node defined
    # anywhere in this document. Google flags missing/unresolvable creator
    # values as "Invalid object type for field creator" (WNC class,
    # non-critical Dataset issue).
    doc_nodes = []
    for parsed in blocks:
        doc_nodes.extend(parsed if isinstance(parsed, list) else [parsed])
    graph_nodes = []
    for n in doc_nodes:
        if isinstance(n, dict) and isinstance(n.get("@graph"), list):
            graph_nodes.extend(n["@graph"])
    doc_nodes.extend(graph_nodes)

    defined_ids = {
        n.get("@id") for n in doc_nodes if isinstance(n, dict) and n.get("@id")
    }

    def _creator_ok(cr):
        if not isinstance(cr, dict):
            return False
        if cr.get("@id"):
            return cr["@id"] in defined_ids
        return bool(cr.get("@type")) and bool(cr.get("name"))

    for n in doc_nodes:
        if isinstance(n, dict) and n.get("@type") == "Dataset":
            if not _creator_ok(n.get("creator")):
                errors.append(
                    f"{path}: Dataset {n.get('@id') or n.get('name', '?')!r} has "
                    f"missing or unresolvable creator (need @type+name object, or "
                    f"@id defined in this document)"
                )
    return errors


def main():
    roots = sys.argv[1:] or ["."]
    all_errors = []
    files_scanned = 0
    blocks_seen = 0
    for root in roots:
        for path in iter_html_files(root):
            files_scanned += 1
            html = open(path, encoding="utf-8", errors="ignore").read()
            blocks_seen += len(BLOCK_RE.findall(html))
            all_errors.extend(check_file(path))

    print(f"[validate_jsonld] scanned {files_scanned} HTML file(s), "
          f"{blocks_seen} JSON-LD block(s) in {', '.join(roots)}")

    if all_errors:
        print(f"[validate_jsonld] {len(all_errors)} error(s):")
        for e in all_errors:
            print(f"  - {e}")
        sys.exit(1)

    print("[validate_jsonld] OK")


if __name__ == "__main__":
    main()
