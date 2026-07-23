# HERMES REPORT — carshake.online Split-Brain Conversion Fix

**Date:** 2026-07-23
**Executor:** Hermes/Claude agent
**Branch:** `instant-proof-tool`
**Commits:** `dd5390d` (index.html fix), `a796991` (sitewide prerender propagation + pricing.html fix)
**Deployed:** `https://carshake.online` ✅ (`vercel deploy --prod --archive=tgz`, no SSO gate, aliased successfully)

---

## Root cause

The site was genuinely split-brain: crawlers/curl saw a real conversion funnel (Stripe "$7 Premium Kit" link, an `/api/subscribe` email capture form, and a CTA to `/free/instant-proof`) baked into the static HTML — but real visitors never saw any of it. That funnel markup lived *inside* `<div id="root">` in `index.html`, and the Lovable-managed React SPA bundle (`/assets/index-*.js`, no source in this repo, minified/opaque) does `ReactDOM.createRoot(root).render(...)` — a full replace, not a hydrate — on mount. That wipes everything inside `#root` and replaces it with the SPA's own, unrelated $2.97/mo "Shield+ / QR handshake" pitch. Verified via headless-browser JS pre-fix: `document.body.innerHTML.includes('buy.stripe.com')` → `false`, `document.querySelector('form')` → `null`; only `#demo`, `/business`, `/blog` links were reachable by real visitors.

## Fix

Moved the Stripe link, subscribe form, and instant-proof CTA out of `#root` into a new sibling `<div id="fallback-cta">` — a slim footer band, not a competing hero — placed immediately after the root div. Because it's a sibling, the SPA's `createRoot().render()` call never touches it, so it now survives hydration and renders for real visitors too, alongside (not instead of) the SPA's own content. No fabricated stats or testimonials were added (existing live Supabase-backed counters were left untouched, per the runbook's honesty gate).

Since `prerender.mjs` uses `index.html` as its literal base template, one `npm run prerender` run propagated this fix identically to all 108 generated pages (city, blog, state, protect, vehicle, scenario, faq, trust, compare, how-it-works, pricing).

## Regression caught and repaired mid-fix

Re-running `prerender.mjs` silently undid the 07-23 traffic-maximization report's city-page pruning: it re-added 20 previously-pruned cities back into `sitemap.xml` and stripped their `noindex` tags, because `prerender.mjs` has no awareness of that pruning decision. This was caught before commit and manually reverted — `noindex,follow` restored on all 20 `city/<slug>/index.html` pages, sitemap back down to 89 URLs (confirmed live).

**This will recur on every future `npm run prerender` run** until `prerender.mjs` is taught the pruned-city list directly. Flagged as an owner action below.

## Secondary fix: stale shadow file

`pricing.html` was a stale 0-byte file at the repo root (left over from 2026-07-21) that Vercel's `cleanUrls: true` was resolving `/pricing` to, instead of falling through to the real 15–17KB `pricing/index.html`. Deleted the stale file after confirming `pricing/index.html` has real content. `/pricing` now returns 200 with 17,864 bytes (verified live).

## GPS button (instant-proof tool)

Checked `free/instant-proof.html` — already handles the global `Permissions-Policy: geolocation=()` block honestly: the button is labeled "optional" and correctly reports "GPS blocked — type location instead" rather than silently failing. No change needed, and the policy itself was intentionally left in place per the runbook (same reasoning as the camera/getUserMedia block from the 07-21 instant-proof runbook).

## Post-deploy verification (live, post-hydration DOM — not just curl)

| Check | `/` | `/city/austin` | `/blog` |
|---|---|---|---|
| `buy.stripe.com` link present | ✅ | ✅ | ✅ |
| `/api/subscribe` form present | ✅ | ✅ | ✅ |
| `/free/instant-proof` link present | ✅ | ✅ | ✅ |
| SPA's own $2.97/mo content still present | ✅ | ✅ | ✅ |

- Screenshot confirmed the fallback band renders as a clean slim strip below the SPA's own content — no visual overlap, no duplicate/competing hero.
- `curl /pricing` → 200, 17,864 bytes.
- `curl /sitemap.xml` → 89 `<loc>` entries (pruning intact).
- `curl /city/portland` → `noindex,follow` present.
- Guard script `node scripts/guard-positioning.mjs` → passes, no privacy-browser contamination.

## Update 2026-07-23 (later same day): prerender pruning made permanent + email capture fixed end-to-end

**1. `prerender.mjs` pruned-city regression — fixed (commit `61e5ef0`).** Added a `PRUNED_CITIES` set (documenting all 23 cities from the traffic report; 20 of them have an actual `CITIES` entry and thus a generated page) and threaded a `noindex` flag through `injectMetaBody()` and the city-page loop. Every future `npm run prerender` now automatically keeps pruned cities out of `sitemap.xml` and marked `noindex,follow`, instead of silently reverting the pruning like it did before this fix. Verified: re-ran prerender, sitemap still 89 URLs, all 20 pruned pages still noindex'd, kept cities unaffected, guard passes.

**2. Email capture was silently broken end-to-end — fixed (commit `7e9a3f2`).** Asked to verify the fallback-cta form's capture path for real, and it failed on the first real test:

- **Field-name bug**: the form used `<input name="EMAIL">` (uppercase) but the endpoint it posted to reads `req.body.email` (lowercase) — confirmed live via curl simulating the exact browser POST: `400 {"error":"Valid email required"}` on every real submission.
- **Wrong endpoint entirely**: it posted to `/api/subscribe`, a Resend-only endpoint with **no database call at all** — and `RESEND_API_KEY` isn't even set on this Vercel project (`vercel env ls` → no env vars), so even a technically-successful submission there neither stored the lead anywhere durable nor sent the promised checklist email. The repo's actual durable capture path is `/api/email-capture` (Supabase insert → PostHog fallback → honest `502` if everything fails) — the same one `CLAUDE.md` already documents re: the CSP/Supabase history. Repointed the form there.
- **UX bug**: a plain `<form method="post">` to either endpoint navigates the whole page to raw JSON on submit. Added a small vanilla-JS submit handler (living outside `#root`, same as the rest of this block, so it's unaffected by the SPA's hydration wipe) that does a `fetch()` POST and shows an inline success/error message instead, with the plain form action left in place as a no-JS fallback.

**Live end-to-end verification after the fix**: curl to `/api/email-capture` with the corrected field returns `200 {"success":true,"stored":"analytics_fallback"}` (Supabase insert itself still fails — `SUPABASE_ANON_KEY` isn't set on Vercel either, a pre-existing gap already flagged in `CLAUDE.md`, not introduced by this fix — but the PostHog fallback succeeds, so the lead is captured as an analytics event rather than lost). Also drove an actual form submission in a real browser session against the live site: the inline message rendered "Check your inbox — your checklist is on the way." with no page navigation, confirming the JS handler works as intended.

## Owner actions required

1. ~~Teach `prerender.mjs` about the pruned-city list~~ — **done**, see update above.
2. ~~Prove end-to-end email capture~~ — **done**, see update above. Remaining gap: **set `SUPABASE_ANON_KEY` on the Vercel project** so leads land in the real `newsletter_subscribers`/`signups_cap` table instead of only the PostHog fallback event. Until then, captured leads are visible as `email_captured` events in PostHog, not as rows in Supabase.
3. **SPA copy changes are out of reach from this repo**: the Lovable-managed bundle (`/assets/index-*.js`) has no source here. Any copy/honesty-label changes to the SPA's own content (e.g. labeling the "$2,100 saved" style cards as hypothetical, per the runbook's HONESTY GATE) must go through Lovable's own publish path, not this repo.
4. **PostHog instrumentation on `/free/instant-proof`** was not added in this pass — out of scope, flagged for a future pass.
5. **Longer-term**: the Lovable SPA + this repo's static/Vercel pipeline are two independently-published systems fighting for the same page. Recommend deciding which system owns `/` going forward (or formalizing the fallback-band pattern as the permanent bridge between them) rather than letting this recur.
