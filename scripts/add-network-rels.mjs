#!/usr/bin/env node
/**
 * One-shot: add rel="sponsored" to outbound <a> links pointing to the Sipiteno
 * network of sibling sites, so Google does not treat them as a reciprocal
 * link scheme and so they don't pass PageRank.
 *
 * These are legitimate sister-site links (same owner), so `sponsored` is the
 * honest, Google-compliant rel value. We MERGE with any existing rel attribute
 * rather than overwriting it — `rel="noopener"` (reverse-tabnabbing protection
 * for target="_blank") becomes `rel="noopener sponsored"`, and `rel="related"`
 * becomes `rel="related sponsored"`. We never strip noopener.
 *
 * Scope: source HTML files only. Skips node_modules, .vercel, .claude
 * (build artifacts), and public/ (deploy mirrors that regenerate). Touches
 * JSON-LD `sameAs` arrays NEVER — those are schema data, not links.
 *
 * Idempotent: re-running is a no-op (a link already carrying sponsored is
 * left untouched).
 *
 * Usage:
 *   node scripts/add-network-rels.mjs --dry-run   # preview every change
 *   node scripts/add-network-rels.mjs             # apply
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SIBLING_DOMAINS = [
  'sipiteno.com',
  'gitdealflow.com',
  'signals.gitdealflow.com',
  'invisibleexit.com',
  'unlocksaas.com',
  'voicelogpro.com',
  'churnlens.site',
  'sanctionsai.dev',
  'sipi.bot',
];
// github.com/sipiteno is in sameAs (schema) only — no <a> tags link to it.

const SKIP_DIRS = new Set(['node_modules', '.vercel', '.claude', '.git', 'public', 'i18n', 'i18n_out']);
const DRY = process.argv.includes('--dry-run');

function listHtmlFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try { entries = readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) stack.push(resolve(d, e.name));
      } else if (e.isFile() && e.name.endsWith('.html')) {
        out.push(resolve(d, e.name));
      }
    }
  }
  return out;
}

// Rewrite the rel= of a single <a ...> opening tag to include "sponsored".
function addSponsoredToTag(tag) {
  const relMatch = tag.match(/\brel="([^"]*)"/);
  if (relMatch) {
    const existing = relMatch[1].split(/\s+/).filter(Boolean);
    if (existing.includes('sponsored')) return { tag, changed: false };
    const merged = [...existing, 'sponsored'].join(' ');
    return { tag: tag.replace(/\brel="[^"]*"/, `rel="${merged}"`), changed: true };
  }
  // No rel= at all: inject one right after the href attribute's closing quote.
  const hrefMatch = tag.match(/href=(["'])([^"']*)\1/);
  if (!hrefMatch) return { tag, changed: false };
  const insertAt = hrefMatch.index + hrefMatch[0].length;
  return {
    tag: tag.slice(0, insertAt) + ' rel="sponsored"' + tag.slice(insertAt),
    changed: true,
  };
}

function processFile(path) {
  const src = readFileSync(path, 'utf8');
  let modified = 0;
  const out = src.replace(/<a\b[^>]*>/gi, (tag) => {
    const hrefMatch = tag.match(/href=(["'])([^"']*)\1/i);
    if (!hrefMatch) return tag;
    const href = hrefMatch[2];
    if (!href.startsWith('https://')) return tag;
    let host;
    try { host = new URL(href).hostname; } catch { return tag; }
    if (!SIBLING_DOMAINS.includes(host)) return tag;
    const { tag: newTag, changed } = addSponsoredToTag(tag);
    if (changed) modified++;
    return newTag;
  });
  return { out, modified };
}

const files = listHtmlFiles(ROOT);
let totalChanged = 0;
let filesChanged = 0;
const sampleChanges = [];

for (const f of files) {
  const { out, modified } = processFile(f);
  if (modified > 0) {
    filesChanged++;
    totalChanged += modified;
    if (sampleChanges.length < 8) {
      sampleChanges.push({ file: relative(ROOT, f), modified });
    }
    if (!DRY) writeFileSync(f, out, 'utf8');
  }
}

console.log(`${DRY ? '[DRY-RUN] ' : ''}add-network-rels: ${totalChanged} link(s) across ${filesChanged} file(s).`);
if (sampleChanges.length) {
  console.log('Changes per file (showing up to 8):');
  for (const s of sampleChanges) console.log(`  ${s.modified}×  ${s.file}`);
}
if (DRY && totalChanged > 0) console.log('\nRe-run without --dry-run to apply.');
