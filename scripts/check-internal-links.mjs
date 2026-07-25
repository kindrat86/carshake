/**
 * Internal-link guard for carshake.online.
 *
 * Why: this site has shipped 35 dead internal links in two separate waves —
 * 23 found on 2026-07-25 (/for/*, /vs/*, /alternatives-to/*) and 12 more the same
 * night (/glossary/*, /checklists/*, /templates/*) introduced by new funnel pages.
 * Both waves were the same defect: a page links a slug that the section never had.
 * Neither was visible to any existing check — only a full live crawl of production
 * found them, hours after deploy.
 *
 * This models carshake's actual routing so it can be trusted:
 *   outputDirectory "."  -> the repo root IS the deploy root
 *   cleanUrls true       -> /foo is served by foo.html
 *   trailingSlash false  -> /foo/ is canonicalised to /foo by Vercel
 * A href resolves if it maps to a shipped file OR matches a vercel.json
 * redirect/rewrite source. Files excluded by .vercelignore do NOT count as
 * resolving — they are not deployed, so linking them is still a 404.
 *
 * BASELINE: fails only on targets absent from scripts/internal-links-baseline.json.
 * That file is empty today because the site is clean; it exists so that if a future
 * wave lands, the guard can be adopted incrementally instead of blocking every
 * deploy. Shrink it, never grow it.
 *
 * Run: node scripts/check-internal-links.mjs [--update-baseline]
 * scripts/ is .vercelignore'd, so this cannot go in vercel.json buildCommand —
 * the file would not exist in the build container. It runs in CI and pre-deploy.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = join(ROOT, "scripts", "internal-links-baseline.json");
const UPDATE = process.argv.includes("--update-baseline");

// What is NOT deployed, read from .vercelignore itself rather than hardcoded — so
// the guard stays correct when that file changes. This matters in both directions:
// a link TO an ignored path is still a 404, and a link FROM an ignored page is not
// a real link at all (the page never ships). Getting the second half wrong made this
// guard report a dead link on calculator.html moments after that file was excluded.
const ALWAYS_SKIP = [".git", "node_modules", ".vercel"];

function ignoreMatchers() {
  let lines = [];
  try {
    lines = readFileSync(join(ROOT, ".vercelignore"), "utf-8")
      .split("\n").map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
  } catch { /* no .vercelignore: only ALWAYS_SKIP applies */ }
  const pats = [...ALWAYS_SKIP, ...lines].map((l) => l.replace(/^\/+/, "").replace(/\/+$/, ""));
  return pats.map((pat) => {
    // .vercelignore uses gitignore-ish globs. Support * and the common cases.
    const re = new RegExp(
      "^" + pat.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*") + "$"
    );
    return (rel) => {
      const parts = rel.split("/");
      // match the whole path, any leading directory, or the basename
      return re.test(rel) || re.test(parts[0]) || re.test(parts[parts.length - 1]) ||
             parts.some((_, i) => re.test(parts.slice(0, i + 1).join("/")));
    };
  });
}
const MATCHERS = ignoreMatchers();
const notDeployed = (rel) => MATCHERS.some((m) => m(rel));

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (notDeployed(relative(ROOT, p))) continue;
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (e.endsWith(".html")) out.push(p);
  }
  return out;
}

const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf-8"));
const routeSources = [...(vercel.redirects ?? []), ...(vercel.rewrites ?? [])].map((r) => r.source);

/**
 * vercel source -> RegExp.
 * ORDER IS LOAD-BEARING: `:name(pattern)` must be handled BEFORE bare `:name`,
 * because the param name is consumed by its own group. Getting this backwards makes
 * a locale-style rule match almost any path and silently excuse real breakage —
 * that bug excused ~49 genuine dead links when this guard was first written for
 * invisibleexit.
 */
function sourceToRe(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === ":") {
      const m = /^:([a-zA-Z]+)(\(([^)]*)\))?(\*)?/.exec(src.slice(i));
      if (m) {
        const [, , , group, star] = m;
        if (group) out += `(?:${group})`;
        else if (star) out += ".*";
        else out += "[^/]+";
        if (group && star) out += ".*";
        i += m[0].length;
        continue;
      }
    }
    out += /[.+?^${}()|[\]\\*]/.test(ch) ? "\\" + ch : ch;
    i++;
  }
  return new RegExp("^" + out + "$");
}
const routeRes = routeSources.map(sourceToRe);
const servedByRouting = (p) => routeRes.some((re) => re.test(p));

/** cleanUrls: /foo -> foo.html; also dir/index.html; also a literal asset. */
function servedByFile(p) {
  const clean = p.replace(/\/+$/, "");          // trailingSlash:false
  if (clean === "") return true;                 // "/" -> index.html
  const rel = clean.replace(/^\//, "");
  if (notDeployed(rel)) return false;             // .vercelignore'd: not deployed
  return (
    existsSync(join(ROOT, rel + ".html")) ||
    existsSync(join(ROOT, rel, "index.html")) ||
    existsSync(join(ROOT, rel))
  );
}

const pages = walk(ROOT);
const broken = new Map();

for (const file of pages) {
  const rel = relative(ROOT, file);
  if (notDeployed(rel)) continue;
  const html = readFileSync(file, "utf-8");
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    let href = m[1].trim();
    if (/^(https?:|mailto:|tel:|javascript:|data:|#)/i.test(href)) continue;
    if (!href.startsWith("/")) continue;
    href = href.split("#")[0].split("?")[0];
    if (href === "") continue;
    // Real interpolation syntax only. A bare "$" is legitimate in some slugs.
    if (/\$\{|`|\{\{|\}\}|\+\s*['"]|['"]\s*\+/.test(href)) {
      const k = `TEMPLATE_LEAK ${href}`;
      if (!broken.has(k)) broken.set(k, new Set());
      broken.get(k).add(rel);
      continue;
    }
    if (servedByFile(href) || servedByRouting(href)) continue;
    if (!broken.has(href)) broken.set(href, new Set());
    broken.get(href).add(rel);
  }
}

const found = [...broken.keys()].sort();

if (UPDATE) {
  writeFileSync(BASELINE, JSON.stringify({ allow: found }, null, 2) + "\n");
  console.log(`[check-internal-links] baseline written: ${found.length} allowed`);
  process.exit(0);
}

const baseline = existsSync(BASELINE)
  ? new Set(JSON.parse(readFileSync(BASELINE, "utf-8")).allow ?? [])
  : new Set();
const fresh = found.filter((h) => !baseline.has(h));
const fixed = [...baseline].filter((h) => !found.includes(h));

console.log(`[check-internal-links] scanned ${pages.length} page(s)`);
console.log(`  broken internal link targets: ${found.length} (baseline allows ${baseline.size})`);
if (fixed.length) console.log(`  ✅ ${fixed.length} baseline entr${fixed.length === 1 ? "y" : "ies"} now resolve — re-run with --update-baseline`);

if (fresh.length) {
  console.error(`\n[check-internal-links] FAIL: ${fresh.length} NEW broken internal link target(s):`);
  for (const h of fresh) {
    const srcs = [...broken.get(h)];
    console.error(`  ${h}`);
    console.error(`      linked from ${srcs.length} page(s), e.g. ${srcs[0]}`);
  }
  console.error(
    "\nUsually a link to a slug the section never had — compare against what exists\n" +
    "(ls glossary/ checklists/ templates/ for/ vs/). Fix the link, or redirect it in\n" +
    "vercel.json to a page that EXISTS. Do not add it to the baseline to get green."
  );
  process.exit(1);
}
console.log("[check-internal-links] OK — no new broken internal links");
