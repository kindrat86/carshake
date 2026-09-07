#!/usr/bin/env node
// Static content must not be replaced by the client router's NotFound/empty blog.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
const APP_SCRIPT = /[ \t]*<script\b[^>]*\bsrc=["']\/assets\/index-[^"']+\.js["'][^>]*>\s*<\/script>/gi;

export function spaOwnsRoute(urlPath) {
  const route = urlPath.replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
  if (route === '/' || route === '/index') return true;
  // Routes actually implemented by the shipped client. Blog HTML has its own
  // article inventory; the client blog incorrectly uses an empty data source.
  return /^\/(?:city(?:\/[^/]+)?|protect\/[^/]+|state\/[^/]+|vehicle(?:\/[^/]+)?|scenario\/[^/]+|how-it-works|faq|pricing|trust|dashboard(?:\/scan\/[^/]+)?|scan\/(?:new|[^/]+(?:\/exit)?)|business(?:\/dashboard)?|auth\/callback)$/.test(route);
}

export function preserveStaticContent(html, urlPath) {
  if (spaOwnsRoute(urlPath)) return html;
  return html.replace(APP_SCRIPT, '');
}

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['node_modules', 'scripts', 'tests'].includes(entry.name)) continue;
    const file = resolve(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(file);
    else if (entry.isFile() && file.endsWith('.html')) yield file;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes('--write');
  const changed = [];
  for (const file of htmlFiles(ROOT)) {
    const html = readFileSync(file, 'utf8');
    const output = preserveStaticContent(html, '/' + relative(ROOT, file));
    if (output === html) continue;
    // Refuse to strip an entry point from an empty document.
    if (!/<h[12]\b/i.test(html) || !/id=["']root["']/.test(html)) {
      throw new Error(`No prerendered content in ${relative(ROOT, file)}`);
    }
    changed.push(relative(ROOT, file));
    if (write) writeFileSync(file, output);
  }
  console.log(JSON.stringify({ mode: write ? 'write' : 'check', count: changed.length, files: changed }));
  if (!write && changed.length) process.exitCode = 1;
}
