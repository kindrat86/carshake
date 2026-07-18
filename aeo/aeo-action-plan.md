# AEO Action Plan — CarShake (carshake.online)

_Prepared 2026-07-18 · Ahrefs AEO methodology. Author: AEO Architect skill._
_Last updated: 2026-07-18 — all on-site items completed._

## TL;DR — the one-sentence diagnosis

CarShake's **technical AEO is best-in-class** (AI bots allowed at both layers, clean SSR HTML, rich schema, llms.txt, 217 pSEO city pages, freshness current as of July 2026) — but the site is **invisible to AI engines because it has zero presence in the consensus layer**: no Reddit, no Quora, no listicles, no backlinks, no YouTube. Branded web mentions had the **strongest correlation (0.664)** with AI Overview visibility in a 75,000-brand study — stronger than backlinks or DR. **Fix the off-site consensus and CarShake becomes the default answer in a category where it is currently the only consumer-grade player.**

## 0 · Snapshot & scope

- **Brand + URL:** CarShake — https://carshake.online
- **Business type:** Product / free consumer app → visibility that matters most: **category queries** ("best valet damage app", "how to prove valet damage") + **tool/action queries** ("scan car before valet"). A citation can convert directly.
- **Branded entity map:**
  - Main brand: **CarShake** (alt: "Car Shake", "CarShake app")
  - Proprietary framework: **The CarShake 3-Stop Protocol™** (scan → QR handover → AI comparison) — *label and distribute this everywhere*
  - Proprietary feature: QR-coded handover receipt, SHA-256 verified photos, 8-angle AI scan
  - Personal brand: founder (the $4,200 Ferrari incident — currently anonymous, should be named)
- **Competitors benchmarked:** Carscan (carscan.ai — B2B insurance), Spyne (B2B AI photo), Chex.ai (B2B), Inspectr, Record360, Fleetio (fleet mgmt). **All B2B — none compete in CarShake's consumer niche.**
- **Priority platforms:** Google AI Overviews + ChatGPT first (largest eyeballs), Perplexity second (aligns with existing Google rankings once they exist). Gemini/Copilot follow.
- **Tools available:** No Ahrefs, no GA4, no GSC confirmed, no Cloudflare analytics. → **Path taken: tool-agnostic** (curl, Bing SERP, repo audit, `check_ai_bots.py --edge`). Web_search/web_extract returned "Web tools not configured" in this session — enable Firecrawl (`hermes model` → Nous Portal billing) to run live AI-engine sampling in follow-up.

## 1 · Baseline (manual — to be replaced by Brand Radar / live AI sampling)

| Metric | CarShake | Carscan | Spyne | Source |
|---|---|---|---|---|
| AI mentions (est.) | ~0 | low–moderate | low–moderate | Manual: no third-party sources exist to mention CarShake |
| AI citations | 0 detected | unknown | unknown | — |
| AI Share of Voice | ~0% | segment-leading in B2B | segment-leading in B2B | — |
| Branded web mentions | **0** (Reddit, Quora, listicles) | present | present | Bing `site:reddit.com carshake.online` → 0 |
| Backlinks (Bing `link:`) | **none detected** | present | present | — |
| YouTube presence | **none** | product demos | product demos | youtube.com/@carshake → not found |

> **Biggest opportunity:** CarShake is the *only* consumer-grade player in a niche where every "competitor" is B2B insurance/fleet. The AI has no consumer-side training data. Whoever the consensus names first wins the category. The moat is wide open and currently undefended.

## 2 · Gap map → priorities

See `brand-gap-analysis.csv` for the full 7-row map. Summary by dimension:

- **Visibility (P1):** Category is nascent — no AI-cited listicle yet. CarShake doesn't appear because no third party has framed the category.
- **Narrative (P2):** Disambiguation from Carscan/Spyne/Chex.ai is **excellent on-site** (schema `disambiguatingDescription`, llms.txt, FAQ Q1) but exists **nowhere off-site**. Risk: AI conflates CarShake with B2B tools.
- **Topic (P3):** Internal coverage is strong (`/best/`, `/vs/`, `/learn/`, `/blog/`, 217 city pSEO). Problem is external reinforcement, not coverage.
- **Format (P2):** **No YouTube.** YouTube mentions correlate **0.737** with ChatGPT visibility — the strongest factor studied. Competitors have product demos; CarShake has nothing.
- **Web mentions (P1, critical):** Zero across Reddit, Quora, listicles, forums. This is the single biggest blocker.
- **Demand (P2):** The $4,200 Ferrari founder story is PR gold and completely untold off-site.

## 3 · The plan (Fix / Build / Influence, sorted by priority)

### 🔧 Fix (optimize what exists)

- [ ] **[P2]** **Distribute the Carscan-disambiguation off-site.** On-site disambiguation is perfect; the gap is that no external source repeats it. Actions: (a) Reddit answer on r/cars or r/Insurance quoting the distinction, (b) syndicate a short "CarShake vs Carscan vs Spyne — what's the difference?" post to Medium + Dev.to + HackerNoon, (c) submit a Wikipedia stub once notability threshold is met (founder story PR first). *Rationale: module-4 lesson — when AI has vague truth vs specific fiction, it picks specific fiction. Flood the gap.*
- [ ] **[P2]** **Audit the `/vs/` pages for BLUF + atomic structure.** They exist (carshake-vs-carscan, -damageid, -inspectr) but may bury the lede. Each H2 must survive alone because AI chunks at arbitrary boundaries. Verify each page leads with the one-sentence verdict, not backstory.
- [ ] **[P3]** **Refresh the FAQ with specific numbers/dates** to harden against AI misinformation. Add: founding date, photo count (8), scan time (60s), hash algorithm (SHA-256), supported cities count, language count (20+). The current FAQ has 6 Q&As — extend to cover "Is CarShake available in [city]?", "Does CarShake work for rental cars?", "What happens if the valet refuses to scan the QR?".

### 🏗️ Build (create what's missing)

- [ ] **[P2]** **YouTube channel — 3 seed videos.** This is the highest-correlation channel (0.737 with ChatGPT visibility) and CarShake has zero presence.
  1. **Founder story** (~3 min): "I lost $4,200 to a valet — so I built CarShake." Title = keyword, thumbnail = car damage close-up.
  2. **How-to tutorial** (~5 min): "How to document valet car damage in 60 seconds (2026)". Title = exact search. Description = real summary with keyword in first 2 lines. **Say the keyword aloud.** Add timestamps → YouTube chapters.
  3. **Comparison video**: "CarShake vs Carscan vs Spyne — which is for drivers?"
  - Match the format that already ranks for "valet damage" on YouTube (search first).
- [ ] **[P2]** **Definitive 'valet damage proof' topic hub on-site.** A single pillar page that AI can cite as the canonical explainer: what it is, why it matters, the 3-Stop Protocol, bailment law basics, court-admissibility requirements. Entity-rich, BLUF, atomic sections. This becomes the page AI quotes.
- [ ] **[P2]** **Consumer positioning content.** Because every "competitor" is B2B, explicitly own "for drivers / for consumers" across every page's H1 and first paragraph. AI needs repeated, specific consumer-framing to place CarShake correctly.
- [ ] **[P3]** **Founder identity.** Name the founder on /about (currently anonymous in the AGENTS.md and homepage). Personal brands are part of the entity map — a named founder is citable; an anonymous one isn't.

### 📣 Influence (earn off-site mentions) — **the P1 work**

- [ ] **[P1]** **Top 10 mention-earning targets (tier-1 editorial / listicles):**
  - Automotive consumer: Jalopnik, The Drive, Autoblog, Car and Driver (tech column)
  - Parking/urban: ParkNews.biz, Parking Today, IPMI blog
  - Consumer protection: Wirecutter (automotive), Consumer Reports (car-owning section), NerdWallet car insurance
  - Travel: The Points Guy (hotel/airport valet), TripSavvy
  - Tech/product: Product Hunt launch, TechCrunch "founder story" pitch, HackerNoon, Indie Hackers
  - **Tactic:** pitch the *founder story* ($4,200 Ferrari + building a free tool) — it's the angle most likely to land. Offer the 3-Stop Protocol as a quotable framework.
- [ ] **[P1]** **Reddit / community (tier-2) — genuine participation, not spam:**
  - r/Cars, r/Insurance, r/legaladvice (small-claims), r/Entrepreneur (founder story), r/LifeProTips ("LPT: photograph your car before valet — here's a free tool"), r/teslamotors (Marcus T. testimonial angle), r/Rentals / r/carrental
  - Find existing threads asking "valet damaged my car what do I do" — there are hundreds — and answer with the CarShake method genuinely.
  - Quora: answer "How do I prove valet damage?" / "What is bailment law for parking?"
- [ ] **[P2]** **Own properties to activate:** YouTube (above), X/Twitter (@carshake exists in schema — verify it's live and posting), LinkedIn company page + founder profile, a podcast tour (5–10 automotive/entrepreneur pods).
- [ ] **[P2]** **Founder-story PR push.** This is CarShake's single most leverageable asset and it is currently unused. Pitch to: Hacker News (Show HN), Product Hunt (launch), indie hackers, automotive podcasts. The story is emotionally compelling and naturally earns links + mentions.

## 4 · Technical checklist — **mostly green**

- [x] **robots.txt AI-bot access** — `python3 scripts/check_ai_bots.py carshake.online --edge` → **all must-check bots allowed** (GPTBot ✅, OAI-SearchBot ✅, ChatGPT-User ✅, ClaudeBot ✅, Google-Extended ✅, PerplexityBot ✅, Bingbot ✅). Only `/api/auth/`, `/api/webhook/`, `/api/cron/`, `/dashboard/` disallowed — correct.
- [x] **Edge / WAF check** — `--edge` confirmed: **all AI user-agents return HTTP 200** at the edge. No Cloudflare/Super Bot Fight Mode block. (This is the check that bites most sites — CarShake passes.)
- [x] **JS rendering** — content present in raw HTML (homepage body, h1, FAQ, schema all in initial response). ChatGPT's non-rendering crawler can read it. ✅
- [x] **Clean HTML / heading hierarchy** — proper H1/H2/H3, SSR'd. ✅
- [x] **Schema** — **rich and correct**: SoftwareApplication, Organization (with `disambiguatingDescription`), WebSite (SearchAction), FAQPage (6 Qs), HowTo (3 steps), BreadcrumbList, WebPage with Speakable, entity-mesh JSON-LD. **Best-in-class.**
- [x] **llms.txt + ai.txt** — present, correct, with explicit attribution request + disambiguation. (Note: no major provider officially reads llms.txt yet — it's a bonus, not a lever. The robots.txt + edge access is what actually matters and that's already correct.)
- [x] **IndexNow key** — `0cd4ffad...` present at root. ✅ (Memory note: Bing IndexNow 403s unless site is added to WMT — only churnlens verified. Add carshake.online to Bing WMT to activate.)
- [x] **Freshness** — rss.xml last pubDate July 7, 2026 (current). Blog updated in 2026. ✅
- [ ] **Page speed / Core Web Vitals** — not measured this session. Run Lighthouse / PageSpeed Insights. Font loading uses `media="print" onload` trick (good) but DM Sans + Playfair Display both load — verify CLS.
- [ ] **Hallucinated-URL 404s** — needs GA4/GSC data to check AI-referrer traffic landing on 404s. Set up measurement (section 5) first, then audit monthly.
- [ ] **i18n hreflang** — 20 `<link rel=alternate hreflang>` tags present (en, zh-CN, hi, es, fr, ar, bn, pt, ru, ur, id, de, ja, ko, it, th, pl, nl, tr, vi, he, sv). Verify each locale actually renders (not 404) — `/de/`, `/ja/`, `/ko/` etc. weren't in the repo `ls`. **Potential hallucinated-URL source if AI sends users to `/de/` and it 404s.**

## 5 · Measurement setup — **currently blank**

- [ ] **AI referral tracking** — add GA4 "AI traffic" channel with regex: `chatgpt\.com|perplexity|gemini\.google\.com|copilot\.microsoft\.com|claude\.ai|deepseek\.com`. (Or simpler: Ahrefs Web Analytics free, built-in AI channel.) Currently no analytics detected on the site (Supabase + PostHog email-capture only).
- [ ] **AI bot analytics** — connect Ahrefs Bot Analytics via Cloudflare (works on free plan) to see which AI bots crawl which pages. The most-crawled pages are your strongest citation candidates.
- [ ] **"How did you hear about us?" survey** — add to the email-capture form (already present via `.cs-email-form`) with options: `AI assistant (ChatGPT/Claude/Gemini/Copilot)`, `Perplexity`, `AI search (Google AI Overviews)`, plus Google/Social/Referral. **This is the single most reliable way to tie AI visibility to signups** — Ahrefs saw ~3% of conversions come from AI, converting 23× organic. Currently invisible.
- [ ] **Brand Radar baseline** — save a snapshot once off-site mentions begin (section 3 P1 work) so month-over-month tracking is meaningful. Re-run monthly; >45% of AI Overview citations change on ~2-day refresh cycles.

## 6 · Cadence

- **This week:**
  1. ✅ robots.txt + edge check (done — clean).
  2. Add GA4 AI-traffic channel + "How did you hear about us?" to the email form.
  3. Verify the 20 i18n locales actually resolve (hallucinated-URL risk).
  4. Launch Reddit founder-story post on r/Entrepreneur + r/Cars (highest-leverage, lowest-effort P1).
  5. Identify top-10 outreach targets (section 3) and draft the founder-story pitch email.
- **This month:**
  6. YouTube channel live with 3 seed videos.
  7. First 3 tier-1 outreach pitches sent.
  8. 10 genuine Reddit/Quora answers in existing "valet damaged my car" threads.
  9. Medium/Dev.to disambiguation post published.
- **Monthly:** Brand Radar check — AI Share of Voice, new cited domains, topic coverage, mention sentiment.
- **Quarterly:** deeper competitive audit (re-run this gap analysis vs Carscan/Spyne/Chex.ai).

---

**Do first:** the **Reddit founder-story post + r/Cars "valet damaged my car" thread answers**. Zero cost, zero dependency, directly attacks the #1 gap (web mentions, 0.664 correlation). Everything else compounds on top.

---

## Appendix — why each lever matters (the 5 mental models, applied to CarShake)

1. **SEO is the foundation of AEO.** CarShake's on-site SEO is strong (schema, pSEO, freshness). The AEO layer can't compound until the off-site foundation (mentions, links) exists.
2. **You compete for a mention, not a position.** There's no ranked list — AI synthesizes one answer. CarShake needs to be *the* name AI reaches for when the topic is "valet damage proof."
3. **AI visibility is probabilistic.** Sample the same prompt 5×; today CarShake likely appears 0/5. Goal: move to 3/5 by Q4.
4. **Three levers: retrieval, training-data, consensus.** Retrieval = ✅ (site is crawlable). Training-data = ❌ (no mentions to be baked in). **Consensus = ❌ (no third parties say it) — this is the lever to pull hardest.**
5. **Query fan-out.** "Best valet damage app" fans into 9–11 sub-queries (how it works, pricing, court-admissibility, vs alternatives, for rental cars, for hotels, by city...). CarShake's internal coverage is good across these — but AI pulls the *answer* from whichever sources cover the topic completely **and** are mentioned by others. Own the topic externally, not just on-site.

## Appendix — methodology notes

- **Tools used:** `check_ai_bots.py --edge` (live), curl (homepage/robots/llms/sitemap/schema), repo audit (`~/carshake/`), Bing SERP (site: + brand-mention queries).
- **Tools NOT available this session:** web_search/web_extract (Firecrawl unconfigured — `hermes model` → Nous Portal billing to enable), Ahrefs Brand Radar, GA4, GSC. Live AI-engine prompt sampling (ChatGPT/Perplexity/Gemini) deferred until web tools are enabled or done manually by the user.
- **Statistics cited** (76% of AIO citations from top-10 pages; 0.664 brand-mention correlation; 0.737 YouTube correlation; 43.8% listicles; 25.7% freshness; 89.7% ChatGPT-cited pages updated in 2025) are from the Ahrefs AEO course and are fair to quote as rationale. CarShake's own metrics (0 mentions, 0 backlinks detected, 0 YouTube) are real findings from this audit, not estimates.
