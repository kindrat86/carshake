# Conversion Repair Report — carshake.online

**Date:** 2026-07-22
**Executor:** Hermes Agent (DeepSeek v4 Pro)
**Branch:** `instant-proof-tool`
**Commit:** `03d6c5d`

---

## 1. Asset Fix Ledger

| Metric | Value |
|---|---|
| Files changed | **344** (not 108 — all city/state/pricing/generated pages were also broken) |
| Old entry JS (404) | `/assets/index-RFf_eR7N.js` |
| New entry JS (200) | `/assets/index-fzxhT5D0.js` |
| Old stylesheet (404) | `/assets/index-BZyP2o6T.css` |
| New stylesheet (200) | `/assets/index-n3krrL_N.css` |
| Status before fix | `index-RFf_eR7N.js` → **404**, `index-BZyP2o6T.css` → **404** |
| Status after fix (live) | `index-fzxhT5D0.js` → **200**, `index-n3krrL_N.css` → **200** |

All 5 asset references on the live homepage return 200. City pages (verified: `/city/austin`) reference the correct entry assets.

## 2. Deploy Status ✅

**SUCCESS.** Deployed and aliased to `https://carshake.online` in 36 seconds. No SSO blocks encountered this time. The site is live with the corrected assets.

- Build URL: `https://carshake-776o2he2x-sales-3429s-projects.vercel.app`
- Custom domain: `https://carshake.online` — verified responding

## 3. Email Capture Test

**NOT YET TESTED (manual step).** The Supabase call from the email form requires a real browser session with live JavaScript. By code analysis:
- CSP header allows `connect-src *.supabase.co` (confirmed via curl)
- The email form JS will now actually load since the entry bundle resolves
- **This is the first time in 90+ days the form can even attempt a Supabase call**

A human should open https://carshake.online/ in an incognito window, submit a test email, and check browser DevTools → Network → confirm a 200-level response to `*.supabase.co`.

## 4. Guardrails Verified

| Guard | Status |
|---|---|
| Stripe `buy.stripe.com` URL | **Untouched** ✅ |
| `vercel.json` / CSP | **Untouched** ✅ |
| `getUserMedia` / camera API | **Not introduced** ✅ |
| No invented asset hashes | Verified — copied from files on disk ✅ |
| No invented social proof | "Join 200+ drivers" replaced with honest microcopy ✅ |

## 5. Steps Completed / Skipped

- **3.1** Asset fix — ✅ 344 pages re-pointed
- **3.2** Hero CTA → `/free/instant-proof` — ✅
- **3.3** Remove "200+ drivers" — ✅
- **3.4** Risk reversal beside $7 kit — ✅ (soft guarantee, no refund policy invented)
- **3.5** Contextual offer in instant-proof tool — **SKIPPED** — `free/instant-proof.html` has uncommitted in-flight changes from the `HERMES_TASK_INSTANT_PROOF_TOOL.md` task. Editing risks merge conflicts. The primary CTA already routes to this tool.

## 6. Escalate to Owner

### The site has been shipping broken bundles for at least 90 days.

**177 real visitors** and **211 pageviews** in the analytics window saw a page with **no JavaScript and no CSS** — because the entry bundle and stylesheet hashes in 344 HTML files had been replaced by a rebuild but the HTML was never updated to match. Every visitor saw:
- An unstyled white page with un-formatted text
- A hero CTA button that anchored to `/#demo` (which does nothing without React)
- An email form that never fires its Supabase request
- No working purchase flow (the $7 Stripe link was alone and unreachable)

**The 94% bounce rate and 0 email captures are explained by this single bug.** Every previous diagnosis (CSP theory, copy critique) was reasoning about a page that **was never able to run**. Until the email form works, no conclusions can be drawn about conversion.

### Why did 344 files go stale?

The publish process has two possible paths:
1. **Lovable manual publish** (historical) — may re-stamp old hashes without rebuilding
2. **`npm run deploy` CLI chain** (current) — runs prerender → disambiguation → guard → `vercel --prod`

If the chain can re-stamp stale hashes from an uncorrected template, the bug recurs next time someone publishes from the wrong branch or before fixing `index.html`. The fix in commit `03d6c5d` corrected `index.html` first (the prerender base template), so subsequent prerender runs will propagate the **correct** hashes — *as long as the entry bundle filenames don't change again.*

### Remaining items

- **Email form verification** — confirm the Supabase call actually fires in a live browser
- **No verifiable social proof** — "Join 200+ drivers" removed with no replacement number; the site has no testimonials, logos, or reviews
- **Refund policy** — the $7 kit has no confirmed refund mechanism; the soft guarantee added needs owner confirmation
- **Publish process** — should be owned by one pipeline, not two. If Lovable re-publishes from its own build, it may reintroduce the stale hashes.

## 7. Verdict

The P0 (asset breakage) is **fixed and live**. The deploy succeeded and the custom domain aliased correctly. The email form can now *attempt* its Supabase call for the first time in the site's measurable history. Whether opt-in actually works depends on whether the Supabase endpoint responds — but the CSP is not blocking it, and the JS will now execute.
