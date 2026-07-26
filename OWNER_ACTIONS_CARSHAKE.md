# OWNER ACTIONS — CarShake Traffic Maximization

**Date:** 2026-07-23
**Status:** READY-TO-DEPLOY (all local changes committed)

---

## 1. Deploy

If Vercel deploy was SSO-blocked during the automated run, the branch `instant-proof-tool` is ready to ship. All changes are committed locally.

**To deploy:**
```bash
cd ~/carshake
vercel deploy --prod
```

If you get an SSO gate, authenticate via the Vercel CLI or dashboard. The deployment does NOT require secrets — it's a static site deploy.

---

## 2. What Changed (this run)

### T1 — Fabricated stats purged
- `faq.html`: Removed "$2,100 avg claim", "73/100 founding spots", "$500+ per dispute", "14 years ROI", "$2.97/mo" claims
- `faq.html` Brunson trust bar: Removed "$2,100", "73/100", "$500+", "14 years", "$2.97/mo" — kept "60 sec" and "8 angles checked" (factual)
- `industries/auto-insurance/index.html`: Removed "Fleets using CarShake report measurable reduction in total loss claims"
- `blog/what-to-do-valet-damages-your-car/index.html`: Removed "approximately 70% of claims fail", cleaned trust bar
- `how-to/prevent-false-damage-claims/index.html` + `.html` flat: Removed "5-15% disputed", "Thousands of drivers", economics section
- **Bulk clean:** 461 files cleaned of Brunson trust bar fabricated numbers (1,283 replacements)

### T2 — URL canonicalization
- `vercel.json`: Added `"cleanUrls": true`
- `index.html`: Fixed 3 internal links from `.html` to pretty URLs
- Sitemap already uses pretty URLs

### T3 — City page consolidation
- **Kept (20):** NYC, LA, Miami, Chicago, SF, Vegas, DC, Boston, Dallas, Houston, Atlanta, Seattle, Phoenix, San Diego, Denver, Orlando, New Orleans, Nashville, Austin, Philadelphia
- **Noindexed (23):** Anchorage, Baltimore, Charlotte, Cincinnati, Cleveland, Columbus, Detroit, Honolulu, Indianapolis, Jacksonville, Kansas City, Memphis, Milwaukee, Minneapolis, Pittsburgh, Portland, Raleigh, Richmond, Sacramento, Salt Lake City, San Antonio, St. Louis, Tampa
- Pruned cities removed from sitemap, pages remain live with `noindex,follow`

### T4 — Instant Proof tool
- Verified live (HTTP 200), zero `getUserMedia` calls (file-capture only)
- Added "Link to this tool" embed snippet at bottom of tool page
- Added link to tool from FAQ page
- Homepage already links prominently

### T5 — llms-full.txt + IndexNow
- `llms-full.txt`: Verbatim text from homepage, FAQ, tool page, 10 keeper city pages
- IndexNow key: `c03ed1532b4f4e1c9a5f8d7e6b2a1c0d.txt` at root
- Script: `scripts/indexnow-ping.sh` (run after deploy)

---

## 3. Post-Deploy Verification

```bash
# Core pages
curl -s -o /dev/null -w "%{http_code}\n" https://carshake.online/
curl -s -o /dev/null -w "%{http_code}\n" https://carshake.online/free/instant-proof
curl -s -o /dev/null -w "%{http_code}\n" https://carshake.online/city/new-york
curl -s -o /dev/null -w "%{http_code}\n" https://carshake.online/llms-full.txt

# Clean URL redirect
curl -s -o /dev/null -w "%{http_code}\n" https://carshake.online/city/new-york.html
# Should return 308

# Run IndexNow ping
bash scripts/indexnow-ping.sh
```

---

## 4. GSC & Bing WMT

**Google Search Console:**
1. Go to https://search.google.com/search-console
2. Submit updated sitemap: `https://carshake.online/sitemap.xml`
3. Check Index Coverage report for pruned city pages — they should drop out gradually

**Bing Webmaster Tools:**
1. Go to https://www.bing.com/webmasters
2. Import sitemap: `https://carshake.online/sitemap.xml`
3. Submit URLs via the IndexNow API (already configured)

---

## 5. Distribution — Free Instant Proof Tool

The free tool at https://carshake.online/free/instant-proof is genuinely useful: no signup, in-browser, stamps date/time/location. Pitch it as a utility, not as marketing.

### 10 target communities:
1. **r/valet** (small but relevant)
2. **r/parking** — "Free tool to timestamp your car photos before valet"
3. **r/cars** — weekly self-promo thread
4. **r/roadtrip** — rental car damage prevention angle
5. **r/Justrolledintotheshop** — mechanics might appreciate
6. **Car-specific forums** (FerrariChat, Rennlist, Bimmerpost) — valet damage is a hot topic
7. **r/TalesFromTheFrontDesk** — hotel valet stories
8. **r/uberdrivers** / **r/lyftdrivers** — rideshare drivers documenting their vehicles
9. **Hacker News** "Show HN" — "Free browser tool to timestamp car photos for valet/rental proof"
10. **r/YouShouldKnow** — "YSK there's a free tool that stamps your car photos with date/time/location for valet damage proof"

### 5 articles to pitch the tool to:
1. "What to do if a valet damages your car" — any outlet's version
2. "How to dispute rental car damage charges" — travel blogs
3. "Valet parking horror stories" — BuzzFeed / Jalopnik
4. "Insurance claim photo tips" — insurance comparison sites
5. "Pre-purchase car inspection checklist" — car buying guides

**Pitch template:** "I built a free browser tool that timestamps car photos before valet/rental handover — no signup, nothing uploaded. It's helped people dispute damage claims. Thought your readers might find it useful: https://carshake.online/free/instant-proof"

---

## 6. Known Issues (Out of Scope)

- **Email capture broken by CSP**: The Supabase email capture form fails due to Content-Security-Policy blocking Supabase connections. This is flagged but NOT addressed in this run (CSP edits are explicitly out of scope per the runbook). The form will silently fail for users.
- **Permissions-Policy blocks camera/geolocation**: Intentional — the Instant Proof tool uses file-capture, not camera APIs. Do NOT "improve" it toward getUserMedia.
- **Locations directory**: The `locations/` directory has separate `.html` pages (not part of city/ consolidation). These were not touched.

---

## 7. Traffic Secrets Audit — Owner Actions (2026-07-26)

Companion to `AUDIT_TRAFFIC_SECRETS.md` (composite score: **52/100**).
What the code could NOT do — only a human can. Ranked by ROI.

### Tier 1 — highest leverage (do first)

**7.1 Record ONE Epiphany Bridge video (Secrets #6, #13, #16)**
The single highest-leverage asset missing from the business. Script the "$4,200 claim overturned in 72 hours" story (already referenced on `tripwire.html`) into a 4–8 min hero's-journey video. It becomes:
- the homepage centerpiece,
- the tripwire's promised "4-Minute Video Walkthrough" (currently a placeholder),
- the seed YouTube video (Secret #13),
- the Perfect Webinar core story (Secret #16).
One shoot, four uses. **This unlocks Secrets #6, #13, and #16 simultaneously.**

**7.2 Launch the YouTube channel (Secret #13) — the biggest unlocked lever**
Car content is a top-3 YouTube vertical and the entire Dream 100 (Doug DeMuro, Donut, ChrisFix, Stradman, Supercar Blondie) lives there. "How 3 photos + a timestamp beat a $4,200 valet claim" is a clickable thumbnail. Start with the Epiphany Bridge video, then a weekly cadence of: before/after damage breakdowns, "watch me dispute" walkthroughs, and Dream 100 reaction/collab bait.

**7.3 Write + schedule the email nurture sequence (Secret #10 — the critical gap)**
`/api/email-capture.js` captures + delivers the Playbook, then... silence. "Traffic You Own" requires you to actually mail the list. Write a 5-email sequence:
- Email 1 (Day 0): Playbook delivery *(exists)*
- Email 2 (Day 1): the Epiphany Bridge story *(teased in code, not written)*
- Email 3 (Day 3): "3 False Beliefs" (repurpose the homepage section)
- Email 4 (Day 5): tripwire pitch ($7 Emergency Kit)
- Email 5 (Day 8+): Shield+ subscription pitch
Then a **weekly broadcast** (Seinfeld/soap-opera style). Resend supports sequences via their Broadcasts/Audiences.

### Tier 2 — wire the business properly

**7.4 Configure Stripe `success_url` to chain tripwire → OTO (Secret #19)**
The funnel architecture is now wired in *links* (this deploy added tripwire→OTO), but the true post-purchase redirect still requires a Stripe config change: set the $7 payment link's `success_url` to `https://carshake.online/oto` so buyers land on the Shield+ upsell automatically. *(Cannot be done from code — it's a Stripe Dashboard setting on the payment link `cNi4gyfRp18Y0W26vS0x20k`.)*

**7.5 Execute the Dream 100 outreach (Secrets #2, #4, #17)**
`dream100.html` is a static list, not a program. Pick the top 20, work the 6-step playbook already documented on that page (comment → share → add value → DM → propose → collab). Prioritize the **Reddit/YouTube/forum tiers** (where buyers gather) over the operator tiers (B2B partnerships, longer cycle). Consider making `dream100.html` `noindex` — it's currently public and telegraphs your playbook to targets.

**7.6 Activate the Instagram handle (Secret #15)**
`instagram.com/carshake` is now linked from the footer (this deploy) but has no content. Post before/after damage-proof photo pairs — this niche is *made* for IG. Cross-post YouTube shorts.

**7.7 Build real affiliate tracking (Secrets #17, #20)**
`affiliates.html` promises 30% recurring but admits "we track referrals by hand." Until there's real tracking (Rewardful / FirstPromoter / Tolt over Stripe), the affiliate channel cannot pay out and is effectively dead. Wire one of those services.

### Tier 3 — paid traffic (only after Tiers 1–2)

**7.8 Decide on + re-enable paid pixels (Secret #9)**
Pixels were removed 2026-07-25 (deliberate). To run paid, you'll need to re-add tracking — but do it as **server-side / Conversions API** (CAPI) rather than client pixels, respecting the privacy-first CSP you built. Recommended first channel: **Reddit Ads** (cheap, Dream-100-adjacent audience, lower CAC than Meta/Google for this niche). The tripwire ($7 SLO) is built to self-liquidate — but it needs paid traffic to liquidate.

**7.9 Stand up the Perfect Webinar (Secret #16)**
The homepage "3 False Beliefs" section is already Brunson's 3-secret webinar structure in prose. Convert it to a 30-min evergreen webinar script, record it, host on YouTube unlisted, embed on a new `/webinar` squeeze page that gates the replay for an email.

### Persona clarification (Secret #1)
**7.10 Write the dream-customer persona down.** The site serves two buyers silently mashed together: (a) the anxious luxury/rental-car owner ($7 kit buyer) and (b) the fleet/operator buyer. Pick ONE primary for the homepage; spin operators to a dedicated `/for/operators` lane. Document it here:

> **Primary dream customer:** _(fill in: age, car they drive, venues they valet at, the fear that keeps them up, where they hang out online)_

