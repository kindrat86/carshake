# 🚗 CarShake.Online — QA / Security / Speed Audit

**Audit Date:** 2026-07-18  
**Target:** https://carshake.online  
**Platform:** Static HTML on Vercel  
**Scope:** Security headers, broken links (top 20+ pages), HTTPS/HSTS only

---

## 📊 Score Summary

| Category  | Score | Grade |
|-----------|-------|-------|
| **Security** | **95/100** | A |
| **QA (Links)** | **85/100** | B+ |
| **Speed** | **95/100** | A |

---

## 🔒 Security (95/100)

### Present Headers ✅

| Header | Value | Status |
|--------|-------|--------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ Excellent |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `X-Frame-Options` | `DENY` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(self), geolocation=(self)` | ✅ |
| `Content-Security-Policy` | Comprehensive (see below) | ✅ Strong |
| `Cache-Control` | `public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800` | ✅ |
| HTTPS redirect (http→https) | `308 Permanent Redirect` | ✅ |

**CSP Breakdown:**
```
default-src 'self'
img-src 'self' data: blob: https:
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com
script-src 'self' 'unsafe-inline' https://*.posthog.com
connect-src 'self' https://*.supabase.co https://*.posthog.com
frame-ancestors 'none'
base-uri 'self'
form-action 'self' https://*.supabase.co
object-src 'none'
```

### Issues Found

**1. Missing Security Feature (Minor) — `Cross-Origin-Embedder-Policy` (COEP)**
   - Not a major risk for a static site, but missing `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` means Spectre-like mitigations aren't active.
   - **Impact:** Low. Static site, no sensitive cross-origin data.
   - **Fix (safe):** Add to vercel.json if needed:
     ```json
     { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
     ```

**2. `X-Powered-By` and Vercel info in headers** — Vercel exposes `server: Vercel` (acceptable, no version info leaked).

**HTTPS/HSTS:** ✅ Perfect. Full HSTS preload-ready. www→non-www permanent redirect.

**No mixed content detected** — zero `http://` references on the homepage.

---

## 🔗 QA — Link Integrity (85/100)

### Methodology
Crawled 309 sitemap URLs + extracted all `<a href>` links from the homepage. Verified HTTP status for every internal page and 16 external references.

### ✅ All Responding Properly
- **309/309 sitemap URLs** resolve (trailing-slash 308s → 200 for each)
- **All nav links** (how-it-works, pricing, faq, about, blog, contact, privacy, terms, trust, locations, glossary, for, state, city, etc.) — **200 OK**
- **All 10 international pages** (/ar, /bn, /es, /fr, /hi, /id, /pt, /ru, /ur, /zh-CN) — **200 OK**
- **All free tool sub-pages** (/free/valet-damage-claim-letter, /free/car-damage-scanner, etc.) — **200 OK**
- **All glossary, location, protect, state, for, best, checklists pages** — **200 OK**
- **All 16 external links** resolve (twitter returns 301 which is fine)

### ❌ Broken Link Found

| Path | Status | Issue |
|------|--------|-------|
| `/free` | **404** | Navigation link in homepage footer points to `/free` but there's no `/free` index page. The `/free/:slug/` sub-pages exist under `~/carshake/free/*/index.html`, but no `free.html` or `free/index.html` exists. |

**Fix:** Create `/free/index.html` as a landing gallery page listing all free tools (8 exist), or redirect `/free` to the first tool.
**Curl evidence:**
```bash
$ curl -sI https://carshake.online/free | head -6
HTTP/2 404
$ curl -sI https://carshake.online/free/car-damage-scanner | head -6
HTTP/2 200  # sub-pages work fine
```

### Minor QA Observations
- `/free` is the **only broken link** from the main navigation
- All 308 redirects for trailing slashes follow standard Vercel behavior — acceptable
- `robots.txt` references 3 sitemaps that all resolve correctly

---

## ⚡ Speed (95/100)

### Measured Performance

| Page | TTFB | Total | Size |
|------|------|-------|------|
| Homepage | **132ms** | 138ms | 73.6 KB |
| FAQ | **282ms** | 292ms | 56.1 KB |
| Glossary (pSEO) | **134ms** | 134ms | 11.1 KB |
| Answers | **192ms** | 192ms | 10.2 KB |

### Strengths ✅
- **Excellent TTFB** — ~130-280ms from Vercel edge (fra1 node)
- **Edge CDN** — All pages served via Vercel HTTP/2 edge cache
- **Aggressive caching** — HTML: 1hr browser, 24hr CDN, 7d stale-while-revalidate
- **Immutable asset hashes** — JS/CSS/fonts cached 1yr + immutable
- **No render-blocking external resources** beyond Google Fonts
- **Vercel cache HIT** — most pages served from cache (age: 600-1000s)

### Speed Optimization Potential (Minor)

1. **Homepage HTML is 73.6 KB** — large for a static landing page. Could be trimmed but acceptable for an app landing with embedded content.
2. **Three JS bundles** loaded: `index`, `charts`, `markdown`, `supabase` — some could be lazy-loaded.

---

## 📋 Recommendations (Safe Fixes Only)

| Priority | Issue | Fix |
|----------|-------|-----|
| 🔴 **HIGH** | `/free` → **404** | Create `free/index.html` listing free tools, or add redirect in vercel.json: `"/free" → "/free/car-damage-scanner"` |
| 🟡 **LOW** | Missing COOP header | Add `Cross-Origin-Opener-Policy: same-origin` to vercel.json (optional hardening) |
| 🟢 **INFO** | No `X-Powered-By` info leak | Already clean — Vercel only exposes `server: Vercel` (acceptable) |
| 🟢 **INFO** | Homepage 73.6 KB | Could defer loading of chart/supabase JS for faster LCP |

---

## ✅ What's Working Great

- Full HSTS preload (2-year max-age, subdomains, preload flag)
- Comprehensive CSP with minimal `unsafe-inline` (only for styles + PostHog)
- Frame-blocking (`DENY`), nosniff, referrer policy all set
- 309 sitemap URLs all resolve
- Perfect HTTPS enforcement (HTTP→HTTPS 308 redirect)
- www→non-www redirect with HSTS
- robots.txt with AI crawler allowances (GPTBot, Claude-Web, Perplexity, etc.)
- Image sitemap present for Google Images
- Cache strategy: CDN-optimized with stale-while-revalidate
