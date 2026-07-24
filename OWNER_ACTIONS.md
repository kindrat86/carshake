# CarShake — Owner Actions Queue

Actions requiring a manual deploy/publish by the owner. Newest first.

---

## 2026-07-23 — Publish Instant Proof tool changes (T4)

**Commit:** `92af0ad` (worktree
`worktrees/20260723T152801Z-backlog-conversion-CARSHAKE`, detached HEAD off
`324a4d7`)

**What changed** (3 files, +60/-12):
- `free/instant-proof.html` — T4 instrument + monetize the Instant Proof tool:
  - CSP `<meta>` connect-src now allows `https://*.posthog.com` (was `'self'`
    only, which would silently block all analytics — the site's documented
    historical failure mode).
  - PostHog custom events fired directly against the `/capture/` API
    (`instant_proof_used` on download, `instant_proof_subscribed` on opt-in),
    localStorage-persisted distinct_id. No external library.
  - Post-download email capture block wired to `/api/email-capture`
    (`source=instant_proof`, honeypot, inline fetch). Checklist copy matches
    the endpoint's actual `CHECKLIST_HTML` — no fabrication.
  - `$7` kit upsell linking the live Stripe URL already used elsewhere
    (`buy.stripe.com/cNi4gyfRp18Y0W26vS0x20k`).
  - Removed the dead "Use my GPS" button + handler (global Permissions-Policy
    `geolocation=()` blocks it); softened copy/JSON-LD refs. file-capture
    (input capture) untouched.
- `prerender.mjs` — added `https://carshake.online/free/instant-proof` to
  `pages[]` (durable sitemap registration; a hand-edit alone is reverted on
  the next prerender).
- `sitemap.xml` — added the `/free/instant-proof` `<url>` entry directly so
  it ships without needing a prerender run.

**Pre-deploy checks (from CLAUDE.md):**
1. These are static, Vercel-served files (NOT the Lovable SPA) — the Lovable
   manual-publish caveat does not apply here; `free/instant-proof.html`,
   `sitemap.xml`, `prerender.mjs` deploy via the standard Vercel path.
2. Split-brain warning (07-23): confirm which source is actually live before
   deploying so you overwrite the right one.
3. Deploy previously succeeded on this repo with no SSO gate — but re-verify
   the deploy is not SSO-gated first.
4. Vercel spend cap: use a prebuilt/CLI archive deploy, NOT a cloud build.

**Deploy commands** (run from the worktree
`/Users/sipi/growth-loop/sites/carshake.online/worktrees/20260723T152801Z-backlog-conversion-CARSHAKE`):

```
npm run prerender           # regenerates sitemap.xml with the new tool URL
vercel deploy --prod --archive=tgz
```

**Post-deploy verification:**
- Confirm `instant_proof_used` / `instant_proof_subscribed` events land in
  PostHog (project "Git Deal Flow", token phc_lyZ…WqauX, host eu.i.posthog.com).
- Confirm the checklist opt-in delivers via `/api/email-capture`
  (Resend "CarShake" audience + checklist send).
- Confirm `/free/instant-proof` appears in the live sitemap.

**Still deferred (NOT in this commit — separate Lovable publish):**
- T5 SPA honesty labels (the "$2,100 saved" style cards) and the
  "US and EU courts" claim softening live in the Lovable-managed SPA bundle
  (`/assets/index-*.js`) — no source in this repo. Must go through Lovable's
  own publish path. Open owner action.
