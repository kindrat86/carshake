# Hermes Autonomous Execution Brief — carshake.online AEO/SEO Remediation

**Target repo:** `~/carshake` (branch `main`, HEAD at time of writing: `da98fc9`)
**Live domain:** https://carshake.online (Vercel project `carshake`, team `sales-3429s-projects`)
**Deploy command:** `npm run deploy` → runs `node prerender.mjs && python3 "$HOME/.growth-engine/inject-disambiguation.py" carshake && node scripts/guard-positioning.mjs && npx vercel --prod --yes`
**Source audit:** 10-site portfolio AEO/SEO audit, 2026-07-21, carshake.online scored 61/100 (lowest in portfolio), 1 critical + 1 high finding.
**Executor:** Hermes Agent (autonomous, DeepSeek v4 Pro). This document is your complete task spec — do not improvise scope beyond what's written here.

---

## 0. Read this whole section before touching anything

### 0.1 Collision check — mandatory first step, every run

This repo is also touched by an unattended Hermes swarm cron (`portfolio-traffic-rotation`) that edits and deploys this exact site every few hours. Editing or deploying while that job is mid-flight causes collisions (half-built trees, overwritten edits, or your fix getting silently reverted by the next tick).

Before making **any** edit:

```bash
ps aux | grep -i hermes | grep -v grep
vercel ls carshake --scope sales-3429s-projects | head -5
cd ~/carshake && git status --short && git log -1 --format='%H %ci'
```

- If a Hermes process is currently running against `~/carshake`, or a deploy landed in the last ~30 minutes, **wait** — do not start. Re-check every 10 minutes.
- If `git status --short` shows uncommitted changes that aren't yours, **stop and do not touch the tree** — another process may be mid-edit. Report this instead of proceeding.
- Confirm `git log -1` still shows `da98fc9` (or a later commit that clearly isn't a broken/partial one) as HEAD before starting.

### 0.2 The single most important rule on this entire portfolio

**A `Content-Security-Policy` header containing `require-trusted-types-for 'script'` with no matching `trustedTypes.createPolicy()` shim anywhere in the served JS will render the site COMPLETELY BLANK on load** (this is a documented, repeated incident across this owner's portfolio — it happened on `gitdealflow.com` and `signals.gitdealflow.com` for ~40 hours before being caught). A `curl` or plain HTTP-status check will **not** reveal this — the server still returns `200 OK` with a full HTML payload; the blank screen only happens client-side after the browser parses the CSP and refuses to execute scripts. **Every task below that touches `vercel.json`'s CSP header, and every deploy of this repo going forward, must be verified with an actual rendered check (see §5), not just a status-code check.**

### 0.3 Twin-file routing trap

Many routes on this site exist as **two separate files** — a flat `slug.html` at repo root and a `slug/index.html` in a subdirectory — and `vercel.json`'s `rewrites` array decides which one is actually served. Editing the wrong twin means your change compiles and commits cleanly but **never ships**. Always grep for both `slug.html` and `slug/index.html` before editing, and always check `vercel.json` to see which one the live route actually points to.

### 0.4 Guardrails you must never bypass

- `npm run guard:positioning` runs automatically as part of `npm run deploy` and fails the build if any page drifts into privacy/anonymous-browsing positioning language (a past incident on a sibling site, `invisibleexit.com`). If it fails, that means your change (or a pre-existing page) triggered it — fix the offending text, do **not** comment out or bypass the guard.
- Never use `git commit --no-verify`, never use `vercel --force` to skip build checks, never use `--allow-robots-change` unless a task below explicitly says to.
- Always create new commits. Never `git commit --amend` on a commit that's already been pushed/deployed.
- Never `git push --force` to `main`.

### 0.5 What you are NOT authorized to change autonomously

See §6 "Owner-gated — do not execute" at the bottom. Anything not explicitly listed as a task in §1–§4 is out of scope. Do not "improve while you're in there" — this brief is scoped deliberately.

---

## 1. P0 — CRITICAL — fix before any other deploy happens

### TASK-01: Remove the Trusted-Types CSP landmine from `vercel.json`

**File:** `~/carshake/vercel.json`, line 347 (the `Content-Security-Policy` header value inside the first `headers` block, `"source": "/(.*)"`)

**Root cause:** The committed CSP value ends with `...upgrade-insecure-requests; require-trusted-types-for 'script'`. There is no `trustedTypes.createPolicy()` call anywhere in the codebase (grepped: only hit is inside DOMPurify's minified internals at `assets/purify.es-*.js`, which is not a site-level policy registration). The site is currently safe **only because the live production deployment predates this commit** — production's actual CSP header (verified via `curl -sI https://carshake.online/`) does not yet contain this directive. The moment anyone runs `npm run deploy` (or the Hermes swarm cron redeploys) from the current `main` HEAD, this directive ships live and the site goes blank for every visitor.

**Fix — do exactly this:**

Find this line in `vercel.json` (currently line 347):
```
"value": "default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' https://*.posthog.com https://connect.facebook.net https://www.redditstatic.com https://snap.licdn.com; connect-src 'self' https://*.supabase.co https://*.posthog.com https://connect.facebook.net https://www.redditstatic.com https://snap.licdn.com; frame-ancestors 'none'; frame-src 'none'; base-uri 'self'; form-action 'self' https://*.supabase.co; object-src 'none'; upgrade-insecure-requests; require-trusted-types-for 'script'"
```

Remove exactly the trailing `; require-trusted-types-for 'script'` substring so the value ends at `...upgrade-insecure-requests`. Do not touch anything else in this line — every other directive (`connect-src` already correctly allows `https://*.supabase.co`, confirmed fixed) is fine as-is.

Do **not** touch the second `Content-Security-Policy` block at line ~360 (`frame-ancestors *; ...` — this is a separate, narrower policy for the `/embed` surface and does not contain `require-trusted-types-for`).

**Why removal, not a shim:** `script-src` already includes `'unsafe-inline'` across this whole site, which means Trusted Types enforcement provides negligible additional security here (TT exists to lock down `innerHTML`/dynamic-script injection, which `'unsafe-inline'` already permits broadly) — removing the directive is the low-risk fix. Do not attempt to write a `trustedTypes.createPolicy()` shim yourself; that is a larger change with its own risk of getting the policy name/scope wrong and is owner-gated if the owner later wants CSP hardened properly (see §6).

**Verification (before commit):**
```bash
cd ~/carshake
grep -n "require-trusted-types-for" vercel.json   # must return nothing
python3 -c "import json; json.load(open('vercel.json'))"   # must not error — confirms valid JSON after edit
```

---

## 2. P1 — HIGH — ship in the same deploy as TASK-01

### TASK-02: Add missing rewrites for `/how-it-works`, `/trust`, `/blog`, `/compare`

**Root cause (confirmed by direct inspection, not just the audit's live sampling):** `prerender.mjs`'s `TOP_PAGES` loop generates real, fully-rendered static content at `how-it-works/index.html`, `trust/index.html`, `blog/index.html`, and `compare/index.html` — these files exist on disk and are correct. However, unlike **every other** top-level page in this site (which has an explicit entry in `vercel.json`'s `rewrites` array, e.g. `"/about" -> "/about.html"`, `"/faq" -> "/faq.html"`), these four routes have **no rewrite rule at all**. Because the generated content lives in a subdirectory (`slug/index.html`) rather than as a flat `slug.html` at repo root, Vercel's implicit extensionless-file resolution (which auto-resolves `/pricing` → `/pricing.html` because that flat file exists at root) does not find them, and the bare path falls through to the client-rendered Vite SPA shell instead — which is exactly the "Loading" spinner the audit observed live on `/how-it-works`, `/trust`, `/blog` (and would also affect `/compare`, which the audit did not happen to sample but has the identical bug).

Confirmed via:
```bash
ls ~/carshake/how-it-works/index.html ~/carshake/trust/index.html ~/carshake/blog/index.html ~/carshake/compare/index.html   # all exist
grep -n '"/how-it-works"\|"/trust"\|"/blog"\|"/compare"' ~/carshake/vercel.json   # zero matches in "rewrites"
```

**Fix:** In `~/carshake/vercel.json`, inside the `"rewrites"` array, add four new entries following the exact pattern already used for `"/state/:slug" -> "/state/:slug/index.html"` and `"/blog/:slug" -> "/blog/:slug/index.html"` a few lines below. A safe insertion point is immediately before the existing `"/blog/:slug"` entry (keeps blog-related rules grouped), or anywhere else in the array — rewrite order only matters relative to any overlapping patterns, and none of these four paths overlap with any existing pattern (checked: no `/how-it-works/:slug`, `/trust/:slug`, `/blog` bare, or `/compare/:slug` rules exist elsewhere).

Add:
```json
    {
      "source": "/how-it-works",
      "destination": "/how-it-works/index.html"
    },
    {
      "source": "/trust",
      "destination": "/trust/index.html"
    },
    {
      "source": "/blog",
      "destination": "/blog/index.html"
    },
    {
      "source": "/compare",
      "destination": "/compare/index.html"
    },
```

**Verification (before commit):**
```bash
cd ~/carshake
python3 -c "import json; json.load(open('vercel.json'))"   # must not error
python3 -c "
import json
d = json.load(open('vercel.json'))
sources = {r['source'] for r in d['rewrites']}
assert {'/how-it-works','/trust','/blog','/compare'} <= sources, 'missing rewrite(s)'
print('OK — all 4 rewrites present')
"
```

---

## 3. P2 — MEDIUM — ship in the same deploy or the next one, in this order

### TASK-03: Verify (do not blindly edit) the FAQ-vs-pricing figure inconsistency

The source audit flagged a homepage FAQ schema stating premium "starts at $9/month" conflicting with the live `/pricing` page's "$2.97 Founder Price." **This could not be reproduced in the local repo at commit `da98fc9`** — `faq.html` and `index.html` both already reference `$2.97/mo` consistently, and no literal `$9/month` or `$9.99` string exists near any `FAQPage` JSON-LD block. The only `$9`-adjacent figures found locally are:
- `pricing-questions/how-much-does-it-cost/index.html` line 40: `"Fleet tier: $9.99/month for 3 vehicles..."` — a genuinely different SKU (fleet plan), not necessarily wrong, but worth a sanity check against whatever fleet pricing actually exists on `/pricing`.
- `tripwire.html` / `oto.html`: `"$9/mo value"` and `"$9 value"` — these describe a one-time tripwire/OTO upsell product's *stated value*, not a recurring subscription price; likely not the source of the audit's finding.

**Action:** After deploying TASK-01 and TASK-02, re-fetch the live homepage and `/faq` and grep the rendered `FAQPage` JSON-LD for any dollar figure that doesn't match `/pricing`'s live figure. If you find a genuine mismatch, fix the wrong side to match whatever `/pricing` currently states (treat `/pricing` as the source of truth, since it's the transactional page). If you find nothing (most likely, since local repo is already consistent), mark this task as **resolved / not reproducible** and move on — do not invent a fix for a discrepancy that isn't there.

```bash
curl -s https://carshake.online/ | grep -o '"@type": "FAQPage".\{0,4000\}' | grep -o '\$[0-9][0-9.]*'
curl -s https://carshake.online/pricing | grep -o '\$[0-9][0-9.]*' | sort -u
```

### TASK-04: Reconcile the fleet-tier pricing page against `/pricing`

**File:** `~/carshake/pricing-questions/how-much-does-it-cost/index.html` line 40 (and check its twin/source generator if one exists, likely a data object inside `prerender.mjs` for `pricing-questions/:slug`).

Confirm the live `/pricing` page currently offers a fleet tier at all, and if so, whether $9.99/mo-for-3-vehicles / $19.99/mo-for-10-vehicles matches what's actually sold. If `/pricing` has no fleet tier presently, either remove this specific claim or clearly label it "contact us for fleet pricing" rather than stating fixed figures that don't appear transactable anywhere.

```bash
curl -s https://carshake.online/pricing | grep -i -o '.\{0,80\}fleet.\{0,80\}'
```

If no fleet mention exists on `/pricing`, treat the fixed $9.99/$19.99 figures in `pricing-questions/how-much-does-it-cost/index.html` as unverifiable — soften to non-numeric contact-us language rather than inventing/removing numbers you can't confirm are accurate. If this can't be resolved with high confidence, skip and flag it in your execution log (§7) rather than guessing.

### TASK-05: `sameAs` third-party validation (quick, safe schema hygiene)

**File:** `~/carshake/index.html` and `~/carshake/about.html`, `Organization` JSON-LD block(s), `sameAs` array.

Currently `sameAs` only lists other properties owned by the same operator (`sipiteno.com`, `gitdealflow.com`, `github.com/sipiteno`). This is schema hygiene, not a breaking bug — do **not** invent new third-party profile URLs (no fabricated LinkedIn/Crunchbase links). If a real, already-live third-party profile for CarShake exists (check: does `x.com/carshake` or any other real, owned, already-public social profile exist? — memory notes `x.com/carshake` ownership was unverifiable as of a prior cycle, so do not assume it's ours), add it. If no genuine third-party profile can be confirmed to exist and be owned by this operator, **skip this task** — do not fabricate entities.

---

## 4. P3 — LOW — nice to have, only if time remains after P0–P2 are verified live

### TASK-06: pSEO city-page boilerplate reduction

City pages (`/austin`, `/boston`, and the ~40 pages generated by the city-page section of `prerender.mjs`) open with a near-identical TL;DR paragraph before city-specific content begins. This is a content-quality improvement, not a bug. If attempting: increase the ratio of genuinely city-specific detail (named local venues, local parking regulations, local valet-damage statistics if sourced) relative to the shared template intro, without fabricating any local statistic you cannot source. Given the effort/risk ratio, this task is optional — do not let it block or delay P0–P2.

---

## 5. Deploy protocol — follow exactly, in order

1. Re-run the §0.1 collision check. If clear, proceed.
2. Make the TASK-01 and TASK-02 edits together (they're both in `vercel.json`, ship as one commit — see below).
3. Run local verification commands from TASK-01 and TASK-02 above. All must pass before committing.
4. Commit:
   ```bash
   cd ~/carshake
   git add vercel.json
   git commit -m "fix: remove Trusted-Types CSP landmine + add missing rewrites for how-it-works/trust/blog/compare"
   ```
5. Run the deploy pipeline exactly as defined in `package.json` — do not shortcut it:
   ```bash
   npm run deploy
   ```
   This runs, in order: `prerender.mjs` (regenerates all static HTML — must complete with no errors) → `inject-disambiguation.py carshake` (growth-engine entity-disambiguation injector — must complete with no errors) → `guard-positioning.mjs` (must print `✅ positioning guard: no privacy/anonymous-browsing contamination` — if it fails, STOP, do not deploy, investigate what triggered it) → `vercel --prod --yes`.
6. Capture the deployment URL Vercel prints (`https://carshake-<hash>.vercel.app` or similar) for the verification step below.

**If any step in the pipeline fails, do not proceed to the next step and do not force through it.** Report the exact error in your execution log (§7) and stop.

---

## 6a. Post-deploy verification — mandatory, this is the step that actually catches a blank-screen regression

A `curl` status check is **not sufficient** (see §0.2). Run all of the following against the **production domain**, not just the Vercel preview URL, after DNS/edge cache has had a moment to update (wait ~30s after deploy completes):

```bash
# 1. Confirm the CSP header no longer contains the landmine directive
curl -sI https://carshake.online/ | grep -i "content-security-policy" | grep -c "require-trusted-types-for" # must print 0

# 2. Confirm the 4 previously-broken routes now serve real content, not a Loading shell
for path in how-it-works trust blog compare; do
  chars=$(curl -s "https://carshake.online/$path" | grep -o '<body[^>]*>.*</body>' | wc -c)
  echo "$path: $chars body chars (was ~200-380 before fix; must now be >1500)"
done

# 3. Confirm the homepage and a known-good page (e.g. /about) are UNCHANGED and still fully rendered
curl -s https://carshake.online/ | wc -c
curl -s https://carshake.online/about | wc -c

# 4. Confirm valid JSON-LD still parses (catches any prerender.mjs regression)
curl -s https://carshake.online/ | grep -o '<script type="application/ld+json">.*</script>' | head -1
```

**If you have any headless-browser or screenshot capability available, use it here** — render `https://carshake.online/` and each of the 4 fixed routes and visually confirm actual page content is showing (not a blank white page or a spinner). This is the single check that would have caught the original ~40-hour blank-screen incidents on this owner's other sites before they went unnoticed. If you cannot render, the character-count heuristic in step 2 above is your best proxy — a body under ~500 chars on any of these 4 routes post-deploy means the fix did not take and you must treat this as a failed deploy (see rollback below), not a success.

## 6b. Rollback plan — use immediately if §6a verification fails

```bash
# Option A — instant, no rebuild: roll the Vercel alias back to the last known-good deployment
vercel rollback --scope sales-3429s-projects

# Option B — revert the commit and redeploy clean
cd ~/carshake
git revert --no-edit HEAD
npm run deploy
```

Prefer Option A first (fastest path back to a working site — seconds, not a full rebuild). Follow up with Option B once you've diagnosed what went wrong, so `main` doesn't stay pointed at a broken commit even after the live alias is rolled back.

---

## 7. Execution log — append your results here as you work

Add a dated entry per run, e.g.:

```
### 2026-07-21 run
- TASK-01: done — removed require-trusted-types-for from vercel.json:347, verified 0 matches post-edit
- TASK-02: done — added 4 rewrites, verified all present in JSON
- TASK-03: not reproducible locally, re-checked live post-deploy, FAQ/pricing figures matched — closed, no fix needed
- TASK-04: [outcome]
- TASK-05: skipped — no genuine third-party profile found to add
- TASK-06: skipped — out of time budget
- Deploy: npm run deploy completed clean, guard-positioning passed
- Post-deploy verification: all 4 routes now >1500 body chars, CSP header clean, homepage/about unchanged
- No rollback needed
```

If you also have Telegram/Hermes-native reporting configured, send a one-line summary there too (critical fix shipped + verification result) — but this log is the durable record; keep it updated even if the Telegram message fails to send.

---

## 8. Owner-gated — do not execute autonomously

These require a human call on positioning, legal exposure, or brand identity. Flag them in your execution log for the owner's attention; do not act on them yourself:

- **Legal/evidentiary language on `faq.html`**: claims like *"CarShake records include cryptographic timestamps, GPS data, and photo evidence that meet evidentiary standards for small claims and insurance disputes"* and *"court-admissible"* framing are specific legal claims this agent cannot verify or soften without a positioning decision from the owner. Do not edit this language.
- **"40+ languages" claim** on `faq.html` / `how-it-works` — unverified; flag for owner, do not remove or change without confirmation of actual i18n support.
- **E-E-A-T / trust signals** (adding a real contact page, physical address, or named founder bio to replace the "Sipi T." pseudonym) — a positioning decision, not a pure technical fix.
- **NAP (no address/phone anywhere)** — likely deliberate for this business model; do not add fabricated address/phone data under any circumstances.
- **Full Trusted-Types re-enablement with a proper policy shim** (the more "correct" alternative to TASK-01's removal) — a larger, riskier change; only pursue if the owner explicitly requests CSP hardening back.
- Anything not listed as a numbered TASK above.

---

**End of brief.** Work top to bottom by priority (P0 → P1 → P2 → P3), verify after every deploy per §6a before moving to the next task, and never skip the §0.1 collision check between work sessions.
