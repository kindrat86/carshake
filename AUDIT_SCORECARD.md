# CarShake QA/Speed/Security Audit — HERMES_PROMPT_12

**Date:** 2026-07-19  
**Site:** https://carshake.online  
**Repo:** ~/carshake | **Deploy:** Vercel Static  

---

## Scores

| Category | Score | Status |
|----------|-------|--------|
| **QA** | **75/100** | Good — minor issues |
| **Speed** | **85/100** | Solid — well-optimized |
| **Security** | **82/100** | Good — minor gaps |
| **Composite** | **80.7/100** | ⬆ +10.6 from 70.1 |

---

## QA Breakdown (75/100)

| Sub-category | Score | Notes |
|---|---|---|
| Content Quality | 18/25 | Homepage 2,371 words. Subpages thinner (vs/index: 487 words). Good copy. |
| Metadata & SEO | 22/25 | Excellent OG/schema/canonical/hreflang. **Fixed:** added favicon links. |
| Accessibility | 18/25 | Landmarks present (main, nav, footer). Skip link. Some ARIA. No static img tags — all JS-rendered. |
| AI Discoverability | 17/25 | agents.md ✓, llms.txt ✓, robots.txt AI bots ✓, ai-plugin.json ✓ |

**QA Issues Fixed:**
- ✅ Added `<link rel="icon">` for favicon.svg, favicon.png, favicon.ico (files existed but link was missing)

**QA Issues Remaining (not fixed — scope/risk):**
- No `<img>` tags in static HTML — all images JS-rendered (crawlers see zero images)
- Thin content on some subpages (vs/index: 487 words)
- Subpage title tags brief ("Vs — CarShake" should be more descriptive)

---

## Speed Breakdown (85/100)

| Sub-category | Score | Notes |
|---|---|---|
| TTFB | 20/20 | 0.196s — excellent (Vercel CDN HIT) |
| Page Weight | 17/20 | HTML 73KB, CSS 47KB combined, JS 16KB. Total first-load ~140KB. |
| Caching | 20/20 | Excellent: max-age, s-maxage, stale-while-revalidate, immutable for assets. |
| Resource Hints | 13/20 | Preconnect for fonts present. Missing preload for critical above-fold. |
| Render Optimization | 15/20 | Module scripts async. CSS external (not inlined). Good overall. |

**Speed: No critical issues.** Site loads fast from Vercel's edge CDN.

---

## Security Breakdown (82/100)

| Sub-category | Score | Notes |
|---|---|---|
| Transport Security | 20/20 | HSTS preload ✓, SSL redirect ✓, HTTPS enforced ✓ |
| Content Security | 18/25 | CSP present. **Fixed:** added frame-ancestors, base-uri, form-action, object-src. |
| Security Headers | 18/20 | All essential headers present. ACAO:* on HTML (Vercel default, not configurable). |
| Data Exposure | 14/20 | Supabase anon key in inline JS (public key, low risk). .env.local gitignored. |
| Best Practices | 12/15 | No auth cookies exposed. No Stripe keys. No password files. |

**Security Issues Fixed:**
- ✅ CSP strengthened: added `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `object-src 'none'`

**Security Issues NOT Fixed (per constraints — NO auth/payment/Stripe/DNS):**
- Supabase anon key embedded in inline `<script>` (line 68) — this is a public anon key by design, same pattern as Supabase docs
- `script-src 'unsafe-inline'` required for the email capture script — would need nonce/hash to fix properly which requires server-side generation
- `Access-Control-Allow-Origin: *` on all HTML responses — Vercel's default, not controllable via static config

---

## Changes Made

1. **index.html** — Added favicon `<link>` tags (SVG + PNG + ICO)
2. **vercel.json** — Strengthened CSP with `frame-ancestors`, `base-uri`, `form-action`, `object-src`

## Deploy

Deployed to Vercel static via `vercel --prod`.
