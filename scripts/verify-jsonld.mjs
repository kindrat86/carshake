#!/usr/bin/env node
/**
 * Blocking JSON-LD gate on the SHIPPED output.
 *
 * Why this exists alongside scripts/validate_jsonld.py: that one runs at
 * checkout on committed source and skips build directories by design. The
 * corruption that actually reached Google — Search Console "Unparsable
 * structured data / Parsing error: Missing ',' or '}'" on voicelogpro.com,
 * 2026-07-25 — is introduced *between* the repo and the deployed page, by
 * the centrally generated pSEO pages and by build-time post-processors. A
 * source-only lint structurally cannot see that class of bug.
 *
 * Two distinct causes produced that one Search Console message:
 *
 *   "@context":"https://***@type":"WebPage"     <- `schema.org","` clobbered,
 *   "@context":"https://schema.org","@type":…      swallowing @type
 *
 *   "mainEntity":[…]`}                         <- leftover JS template-literal
 *   "mainEntity":[…]}                             backtick closing a FAQPage
 *
 * Both are checked by signature as well as by JSON.parse, because a repair
 * step with no verification after it is worse than no repair: it lets a new
 * variant of the corruption ship silently. Blocks that parse but whose
 * @context was corrupted are caught too, since JSON.parse waves those through.
 *
 * Node, not Python, on purpose: every deploy path runs the build (Vercel cloud
 * builds, and local `vercel build && vercel deploy --prebuilt` alike) and node
 * is guaranteed in all of them, while python3 is not.
 *
 * Self-contained by design — no cross-repo import, so it works in Vercel's
 * shallow clone. Keep the copies in the 10 site repos identical.
 *
 * Usage: node scripts/verify-jsonld.mjs [dir ...]
 *   Default target: vercel.json's `outputDirectory` — the tree that actually
 *   ships. Exit 1 on any bad block, or if a named directory does not exist.
 *
 * The default was hardcoded to `dist` until 2026-07-25, which is wrong on every
 * site that deploys from the repo root. This site has `outputDirectory: "."` and
 * `buildCommand: null` and no dist/ at all, so an argument-less run did not lint
 * the wrong tree — it exited 1 with `dist not found — run the build first`, on a
 * site that has no build. Same misdirected default as churnlens (where it lint
 * 78 stale .vercelignored pages instead of the 294 real ones), just a louder
 * failure. Reading `outputDirectory` keeps the copies in the 10 site repos
 * identical AND correct per-site (this site "." — voicelogpro "dist").
 *
 * Note for this repo specifically: `scripts/` is .vercelignored, so this gate
 * cannot be hung off vercel.json's buildCommand (the file is absent in the build
 * container and every deploy would fail). It runs in CI and locally before a
 * deploy — see CLAUDE.md.
 *
 * See ~/.growth-engine/GUARDRAILS.md rule 3 for the portfolio-wide context and
 * ~/.growth-engine/validate-jsonld-live.py for the post-deploy live check.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve, relative } from 'node:path';

/**
 * The deploy root, per vercel.json. Falls back to `dist` when it exists (the
 * old default, so build-based sibling sites are unaffected), else the repo root.
 */
function defaultTarget() {
  try {
    const cfg = JSON.parse(readFileSync('vercel.json', 'utf8'));
    if (typeof cfg.outputDirectory === 'string' && cfg.outputDirectory) {
      return { dir: cfg.outputDirectory, why: 'vercel.json outputDirectory' };
    }
  } catch {
    // No vercel.json, or unreadable — fall through to the heuristic.
  }
  if (existsSync('dist') && statSync('dist').isDirectory()) {
    return { dir: 'dist', why: 'no outputDirectory in vercel.json; dist/ exists' };
  }
  return { dir: '.', why: 'no outputDirectory in vercel.json and no dist/' };
}

const dirs = process.argv.slice(2);
let defaultWhy = null;
if (dirs.length === 0) {
  const { dir, why } = defaultTarget();
  dirs.push(dir);
  defaultWhy = `${dir} (${why})`;
}

// Directories that never contain shippable HTML. `assets` holds hashed bundles
// and is the bulk of a vite dist, so skipping it keeps this fast on large sites.
//
// `.vercel` matters here beyond speed: `.vercel/output` is a prebuilt artifact,
// a second full copy of the site. Skipping it keeps a `.` scan reporting the
// source tree only. It stays explicitly scannable — `node
// scripts/verify-jsonld.mjs .vercel/output` is the documented pre-deploy check
// before any `vercel deploy --prebuilt`, because that artifact has shipped
// broken JSON-LD before.
const SKIP = new Set([
  'node_modules', '.git', '.next', '.vercel', 'assets',
  '__pycache__', '.venv', 'venv', 'coverage',
]);

// .vercelignore is the authority on what ships, so honour it rather than letting
// the hardcoded list above drift away from it. Deliberately narrow: only bare
// top-level directory names (`dist/`, `scripts/`, `/aeo`), never globs or nested
// paths. A single leading slash is stripped — it is the .vercelignore idiom for
// "top level only", and this repo's file is written entirely in that style, so
// rejecting it would silently honour nothing here.
//
// This is the one place where the gate is allowed to shrink its own surface, so
// it is a real hazard: a green gate bought by narrowing coverage looks identical
// to a green gate that checked everything. Two things keep it honest — the names
// come from the same file Vercel obeys (so anything skipped is genuinely
// unrequestable), and every skipped name is printed on every run, so the surface
// is visible in the log instead of implied. An explicitly named directory is
// still always scanned.
function vercelIgnoredDirs() {
  const names = [];
  let text;
  try {
    text = readFileSync('.vercelignore', 'utf8');
  } catch {
    return names;
  }
  for (const line of text.split('\n')) {
    const entry = line.trim();
    if (!entry || entry.startsWith('#') || entry.startsWith('!')) continue;
    // Strip one leading slash ("/scripts" means top-level scripts/) and any
    // trailing slashes, then require a bare name: a glob, or a nested path like
    // `.vercel/output`, needs per-file matching this deliberately does not do.
    const name = entry.replace(/^\//, '').replace(/\/+$/, '');
    if (!name || /[*?[\]/]/.test(name)) continue;
    if (!existsSync(name) || !statSync(name).isDirectory()) continue;
    names.push(name);
  }
  return names;
}

const ignoredDirs = vercelIgnoredDirs();
for (const name of ignoredDirs) SKIP.add(name);

const BLOCK_RE =
  /<script[^>]*\btype\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;

const SIGNATURES = [
  {
    re: /https:\/\/\*{3}/,
    msg: 'clobbered @context (https://*** — expected https://schema.org)',
  },
  {
    re: /"@context"\s*:\s*"[^"]*@type/,
    msg: '@type swallowed into the @context string',
  },
  {
    re: /\]\s*`\s*\}/,
    msg: 'stray template-literal backtick closing the schema (]`} instead of ]})',
  },
];

const errors = [];
let files = 0;
let blocks = 0;

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) walk(join(dir, e.name));
      continue;
    }
    if (extname(e.name) !== '.html') continue;
    check(join(dir, e.name));
  }
}

function check(path) {
  const rel = relative(process.cwd(), path) || path;
  let html;
  try {
    html = readFileSync(path, 'utf8');
  } catch {
    return;
  }
  files++;

  BLOCK_RE.lastIndex = 0;
  let m;
  let i = -1;
  while ((m = BLOCK_RE.exec(html)) !== null) {
    i++;
    const raw = m[1].trim();
    if (!raw) continue;
    blocks++;

    for (const { re, msg } of SIGNATURES) {
      if (re.test(raw)) errors.push(`${rel} [block ${i}]: ${msg}`);
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      errors.push(`${rel} [block ${i}]: invalid JSON — ${err.message}`);
      continue;
    }

    for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
      if (!node || typeof node !== 'object') continue;
      const ctx = node['@context'];
      if (ctx === undefined) {
        errors.push(`${rel} [block ${i}]: missing @context`);
      } else if (typeof ctx === 'string' && !ctx.includes('schema.org')) {
        errors.push(`${rel} [block ${i}]: suspect @context ${JSON.stringify(ctx.slice(0, 80))}`);
      }
      if (!('@type' in node) && !('@graph' in node)) {
        errors.push(`${rel} [block ${i}]: missing @type (and no @graph)`);
      }
    }
  }
}

if (defaultWhy) {
  console.log(`[verify-jsonld] no target given — defaulting to ${defaultWhy}`);
}
if (ignoredDirs.length) {
  console.log(
    `[verify-jsonld] skipping .vercelignore'd director${
      ignoredDirs.length === 1 ? 'y' : 'ies'
    }: ${ignoredDirs.join(', ')} (not deployed)`
  );
}

const scanned = [];
for (const d of dirs) {
  const root = resolve(process.cwd(), d);
  if (!existsSync(root)) {
    console.error(
      `❌ verify-jsonld: ${d} not found` +
        (d === 'dist' ? ' — run the build first.' : '.')
    );
    process.exit(1);
  }
  if (!statSync(root).isDirectory()) {
    console.error(`❌ verify-jsonld: ${d} is not a directory.`);
    process.exit(1);
  }
  walk(root);
  scanned.push(d);
}

console.log(
  `[verify-jsonld] scanned ${files} HTML file(s), ${blocks} JSON-LD block(s) in ${scanned.join(', ')}`
);

if (errors.length) {
  console.error(
    `\n❌ verify-jsonld: ${errors.length} error(s) — refusing to ship broken structured data:`
  );
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    '\nFix the generator or post-processor that emitted this, not the page — ' +
      'regeneration will re-introduce a hand-patched file.'
  );
  process.exit(1);
}

console.log('[verify-jsonld] OK — all shipped JSON-LD parses');
