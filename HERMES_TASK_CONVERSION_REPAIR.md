# HERMES TASK — carshake.online Conversion Repair

**Target site:** carshake.online
**Repo:** `~/carshake` — **static site, no build step** (repo root IS the deployed output), branch **`instant-proof-tool`**
**Vercel project:** `carshake` (no `rootDirectory`)
**Authored:** 2026-07-22
**Executor:** Hermes Agent (DeepSeek v4 Pro), autonomous
**Real data (90 days):** 211 pageviews · 177 visitors · 199 sessions · **94.0% bounce** · **0 email captures**

**Objective:** **108 HTML pages — including the homepage and every city landing page — load with no JavaScript and no stylesheet.** They reference an entry bundle and a stylesheet that return **404**. Nothing on those pages can work: not the hero CTA, not the email form, not the rendering. This is a deterministic two-string fix. Do it first.

---

## 0. READ THIS FIRST — SIX HARD RULES

### RULE 1 — ORDER MATTERS. FIX `index.html` **BEFORE** RUNNING ANY BUILD/DEPLOY COMMAND.

`prerender.mjs:60` reads the homepage as its **base template**:
```js
let baseHtml = readFileSync(resolve(DIST, 'index.html'), 'utf8');
```
`npm run deploy` runs `npm run prerender` **first**. So:

- Fix `index.html` **first** → prerender propagates the **correct** asset hashes to every generated page. ✅
- Run deploy **before** fixing `index.html` → prerender re-stamps the **dead** hashes back across every page, silently undoing your work. ❌

**Never run `npm run deploy` or `npm run prerender` until Gate 3.1 has passed.**

### RULE 2 — NEVER INVENT AN ASSET HASH
The correct filenames already exist on disk and are already used by working pages. You **copy** them; you never construct or guess a hash. Any `/assets/...` filename you write must exist in `~/carshake/assets/`. Verify with `ls` before writing it.

### RULE 3 — THE $7 STRIPE LINK IS THE ONLY WORKING PURCHASE PATH. DO NOT TOUCH IT.
The "Go Pro: Premium Valet Kit" `buy.stripe.com` link is the single confirmed-functional revenue path on this site. Do not modify, relabel the price of, or repoint that URL. Never create a new Stripe link (RULE 2 logic applies to payment URLs too).

### RULE 4 — THE INSTANT PROOF TOOL MUST STAY FILE-CAPTURE, NOT CAMERA
`/free/instant-proof` is the other confirmed-working feature. It deliberately uses a **file upload**, **not** `getUserMedia`, because a global `Permissions-Policy` header blocks `camera=()` and `geolocation=()` sitewide. **Do not "upgrade" it to a live camera** — it will silently break. This tool is also the subject of an in-flight task (branch `instant-proof-tool`, `HERMES_TASK_INSTANT_PROOF_TOOL.md`).

### RULE 5 — NEVER FABRICATE PROOF
"Join 200+ drivers" is unverifiable against 177 real visitors and 0 captured emails. You may delete or soften it. You may **never** replace it with a different invented number, testimonial, or logo.

### RULE 6 — SCOPE + IN-FLIGHT WORK
The tree carries uncommitted work from the instant-proof task: `free/instant-proof.html` (modified), `sitemap.xml` (modified), `HERMES_TASK_INSTANT_PROOF_TOOL.md` (untracked). **Stage by explicit path only. Never `git add -A`.** Do not stage those three unless you deliberately changed them.

---

## 1. PRE-FLIGHT (abort conditions)

```bash
cd ~/carshake
```

**1.1 — Branch, tree, rollback point.**
```bash
git branch --show-current   # expect: instant-proof-tool
git status --short          # expect: M free/instant-proof.html, M sitemap.xml, ?? HERMES_TASK_INSTANT_PROOF_TOOL.md
git rev-parse HEAD          # RECORD — rollback target
```
**ABORT** if `index.html` or `assets/` already show uncommitted edits.

**1.2 — Another agent active?**
```bash
ps aux | grep -i hermes | grep -v grep
```
**ABORT** if anything references `carshake` or a `vercel` deploy in flight.

**1.3 — Confirm the breakage is real and current.**
```bash
for a in index-RFf_eR7N.js index-BZyP2o6T.css charts-DpChsq1R.js supabase-DMy4srAv.js; do
  printf "%-26s %s\n" "$a" "$(curl -s -o /dev/null -w '%{http_code}' https://carshake.online/assets/$a)"
done
```
Verified 2026-07-22: the first two return **404**, the last two return **200**.
**If the first two now return 200, the site has been fixed by someone else — ABORT and report.**

**1.4 — Git author.**
```bash
git config user.email   # MUST be sales@sipiteno.com
```

---

## 2. THE DIAGNOSIS

### 2.1 — P0: 108 pages reference assets that do not exist

`index.html` (and 107 other pages) reference:

| Referenced | On disk? | Live |
|---|---|---|
| `/assets/index-RFf_eR7N.js` | ❌ **absent** | **404** |
| `/assets/index-BZyP2o6T.css` | ❌ **absent** | **404** |
| `/assets/charts-DpChsq1R.js` | ✅ | 200 |
| `/assets/markdown-EJqmjYtY.js` | ✅ | 200 |
| `/assets/supabase-DMy4srAv.js` | ✅ | 200 |

What `assets/` actually contains:
```
index-fzxhT5D0.js    201,596 b   <- the ENTRY bundle (references each shared chunk 2x)
index-B0vl4M5z.js      2,921 b   <- small preload shim, NOT the entry
index-n3krrL_N.css    74,457 b   <- the main stylesheet
index.es-Bk5ZAGE9.js 151,019 b   <- separate ES variant
charts-DpChsq1R.js / markdown-EJqmjYtY.js / supabase-DMy4srAv.js   <- unchanged, already correct
```

**The entry JS and CSS hashes are stale.** A rebuild produced new entry filenames, the shared chunks kept their hashes (unchanged content), but 108 HTML files were never re-stamped — so only the entry pair 404s.

**Proof the correct values are known:** `valet-damage-report-2026.html` and `ultimate-guide-valet-damage-proof.html` already reference the working set and are unaffected:
```
src="/assets/index-fzxhT5D0.js"
href="/assets/index-n3krrL_N.css"
```

**Consequence:** on 108 pages the React app never boots and the stylesheet never loads. That means **no email capture, no working hero CTA, no proper rendering** — which explains 94% bounce and 0 subscribers far better than any copy problem.

Count the damage yourself:
```bash
grep -rl "index-RFf_eR7N\|index-BZyP2o6T" --include="*.html" . | wc -l   # expect 108
```

### 2.2 — CORRECTION: the CSP is **not** the current blocker

Earlier notes attribute the 0-subscriber problem to a CSP block on the Supabase call. **That is no longer accurate.** `vercel.json` has two CSP blocks:

- **block 6**, `source: "/(.*)"` — `connect-src 'self' https://*.supabase.co https://*.posthog.com …` → **Supabase is allowed** on the whole site.
- **block 7**, `source: "(/embed.*)"` — `connect-src 'self'` (restrictive) → applies **only to `/embed*`**.

So the homepage form is *not* CSP-blocked; it simply **never executes**, because the JS that would run it is 404. Confirm live before concluding anything:
```bash
curl -sI https://carshake.online/ | grep -i "content-security-policy" | grep -o "connect-src[^;]*"
```
**Do not edit CSP as part of this task.** If the header does not contain `*.supabase.co`, record it and stop — that is a separate change.

### 2.3 — P1: The hero CTA is a dead click

The primary hero button **"Try CarShake — Free"** points at `/#demo`, an in-page anchor. With the entry bundle 404'd, nothing renders a demo there. The secondary CTA — **"📷 Try the free Instant Proof tool →"** → `/free/instant-proof` — is confirmed **working**.

### 2.4 — P2: Unverifiable proof, no risk reversal, four competing asks

- *"Join 200+ drivers"* — no names, logos, or reviews; contradicted by 0 captured emails.
- No guarantee/risk-reversal next to the $7 kit (the sister site churnlens uses "100% money-back" language).
- Four competing asks on one page: app demo, free tool, free checklist, $7 kit.

### 2.5 — Things that are RIGHT — do not "fix" them

- **`/free/instant-proof`** — a genuinely working, no-signup canvas tool. Preserve it (RULE 4).
- **The $7 Stripe checkout** — the one working purchase path (RULE 3).
- The pain-point copy is well written. This task is not a rewrite.

---

## 3. EXECUTION

### STEP 3.1 — Re-point the 108 pages at the assets that exist (THE fix)

**3.1a — Verify the targets exist before writing them (RULE 2).**
```bash
cd ~/carshake
ls -la assets/index-fzxhT5D0.js assets/index-n3krrL_N.css   # BOTH must exist
```
**If either is missing, STOP.** Do not substitute another filename — re-derive the entry from a known-good page instead:
```bash
grep -oE '(src|href)="/assets/index[^"]+"' valet-damage-report-2026.html
```
and use exactly what that working page uses.

**3.1b — Fix `index.html` FIRST (RULE 1 — it is prerender's base template).**
```bash
sed -i '' 's|/assets/index-RFf_eR7N\.js|/assets/index-fzxhT5D0.js|g; s|/assets/index-BZyP2o6T\.css|/assets/index-n3krrL_N.css|g' index.html
grep -oE '(src|href)="/assets/index[^"]+"' index.html   # verify before continuing
```

**3.1c — Fix the remaining 107 pages with the same deterministic replacement.**
```bash
grep -rl "index-RFf_eR7N\|index-BZyP2o6T" --include="*.html" . \
  | xargs sed -i '' 's|/assets/index-RFf_eR7N\.js|/assets/index-fzxhT5D0.js|g; s|/assets/index-BZyP2o6T\.css|/assets/index-n3krrL_N.css|g'
```
This is a pure string substitution of two known-dead filenames for two known-present ones. It changes no copy, no markup, no logic.

**Gate 3.1 — all must pass:**
```bash
# no page references a dead asset any more
grep -rl "index-RFf_eR7N\|index-BZyP2o6T" --include="*.html" . | wc -l   # MUST be 0

# every referenced entry asset exists on disk
for f in $(grep -rhoE '/assets/index[^"]+' --include="*.html" . | sort -u); do
  test -f ".$f" && echo "OK  $f" || echo "MISSING  $f"
done   # NO line may say MISSING

# nothing but asset paths changed
git diff --stat | tail -3
git diff index.html | grep -E "^[+-]" | grep -v "assets/index" | grep -vE "^(\+\+\+|---)" | wc -l   # MUST be 0
```
**If the last check is non-zero you changed something other than asset paths — revert and redo.**

---

### STEP 3.2 — Point the hero CTA somewhere real

In `index.html`, change the primary hero CTA **"Try CarShake — Free"** from `/#demo` to the confirmed-working tool: **`/free/instant-proof`**.

Then re-run the prerender propagation consideration: because `index.html` is the base template, do **not** hand-edit this into all 108 pages — Step 5 will regenerate them.

Keep exactly **one** primary-styled CTA in the hero; demote the now-duplicate "Try the free Instant Proof tool" link to secondary text, or remove it since the primary now goes there.

**Gate 3.2:**
```bash
grep -c 'href="/#demo"' index.html   # MUST be 0 (or justified in the report)
grep -c "free/instant-proof" index.html   # MUST be >= 1
```

---

### STEP 3.3 — Remove the unverifiable social proof

Find and neutralise *"Join 200+ drivers"*:
```bash
grep -rn "200+ drivers\|200+ " --include="*.html" . | head
```
Replace with a claim needing no number (e.g. *"Free checklist — no spam, unsubscribe anytime"*, keeping the existing honest microcopy) or delete the phrase. **Do not substitute a different number** (RULE 5).

**Gate 3.3:** `grep -rn "200+ drivers" --include="*.html" . | wc -l` → `0`.

---

### STEP 3.4 — Add risk reversal beside the $7 kit

Add a short guarantee line adjacent to the existing "Go Pro: Premium Valet Kit" CTA — e.g. *"7-day money-back guarantee — email us and we refund, no questions."*

**Only state terms the owner will actually honour.** If you cannot confirm a refund policy exists, use the softest truthful framing or skip this step and record it. **Do not modify the Stripe URL itself** (RULE 3).

**Gate 3.4:** `git diff | grep -c "buy.stripe.com"` → `0` (the link itself unchanged).

---

### STEP 3.5 — Bridge the working tool to the offer

In `/free/instant-proof`, after a user successfully stamps and downloads a photo, show one contextual offer: the free checklist opt-in **or** the $7 kit — not both.

Constraints: it must appear **after** the download, must not gate the tool, and must not introduce `getUserMedia` (RULE 4). Note this file has uncommitted changes from the in-flight instant-proof task — **if editing it risks a conflict, skip this step and record it.**

---

## 4. VALIDATION (before deploy)

```bash
cd ~/carshake

# 4.1 No dead asset references anywhere
grep -rl "index-RFf_eR7N\|index-BZyP2o6T" --include="*.html" . | wc -l    # 0

# 4.2 Stripe link untouched
git diff | grep -c "buy.stripe.com"                                        # 0

# 4.3 No camera API introduced
git diff | grep -c "getUserMedia"                                          # 0

# 4.4 CSP untouched
git diff --name-only | grep -c "vercel.json"                               # 0

# 4.5 Positioning guard
node scripts/guard-positioning.mjs

# 4.6 Only intended files staged later
git status --short
```

---

## 5. DEPLOY

**5.1 — Now (and only now) it is safe to run prerender.** With `index.html` corrected, prerender propagates the **good** hashes.

```bash
npm run deploy
```
This runs, in order: `npm run prerender` → `inject-disambiguation.py carshake` → `guard-positioning.mjs` → `npx vercel --prod --yes`.

**5.2 — After prerender, re-verify before the upload completes** (if the chain fails midway, check this immediately):
```bash
grep -rl "index-RFf_eR7N\|index-BZyP2o6T" --include="*.html" . | wc -l   # MUST STILL BE 0
```
**If this became non-zero, prerender re-stamped the dead hashes from a stale template.** Stop, find the template source, fix it there, and do not deploy.

**5.3 — ⚠ DEPLOY MAY BE BLOCKED.** This project has previously been **SSO-gated**, and it has historically been published manually via Lovable rather than the CLI. If `npx vercel --prod --yes` fails with an authentication/SSO error:
- **Do not** attempt to bypass, re-authenticate with new credentials, or switch accounts.
- Commit your work locally, write the report, and escalate: the owner must publish.
- State clearly in the report that **the fix is committed but NOT live**.

**5.4 — Commit (do this regardless of whether the deploy succeeds).**
```bash
git add index.html $(grep -rl "index-fzxhT5D0" --include="*.html" . | tr '\n' ' ')
git status --short   # REVIEW: do NOT stage free/instant-proof.html or sitemap.xml unless you changed them
git commit -m "fix(carshake): point 108 pages at asset bundles that actually exist

index.html and 107 other pages referenced /assets/index-RFf_eR7N.js and
/assets/index-BZyP2o6T.css, both of which 404. The entry bundle and stylesheet
had been rebuilt to index-fzxhT5D0.js / index-n3krrL_N.css but the HTML was
never re-stamped, so the homepage and every city page loaded with no JS and no
CSS — no email capture, no working CTA, no styling.

- Re-point all 108 pages at the assets present in assets/
- Hero CTA now goes to the working /free/instant-proof tool instead of dead /#demo
- Remove unverifiable 'Join 200+ drivers' claim
Stripe checkout link and CSP untouched."
```

---

## 6. POST-DEPLOY VERIFICATION

```bash
sleep 45

# 6.1 THE fix — the entry assets must now resolve
for a in index-fzxhT5D0.js index-n3krrL_N.css; do
  printf "%-24s %s\n" "$a" "$(curl -s -o /dev/null -w '%{http_code}' https://carshake.online/assets/$a)"
done   # BOTH MUST be 200

# 6.2 The homepage references only live assets
for f in $(curl -s https://carshake.online/ | grep -oE '/assets/[^"]+' | sort -u); do
  printf "%-34s %s\n" "$f" "$(curl -s -o /dev/null -w '%{http_code}' https://carshake.online$f)"
done   # ALL MUST be 200

# 6.3 A city page too (they were all broken)
curl -s https://carshake.online/city/austin | grep -oE '/assets/index[^"]+' | sort -u

# 6.4 The working paths still work
curl -s -o /dev/null -w "%{http_code}\n" https://carshake.online/free/instant-proof   # 200
```

**6.5 — MANDATORY rendered checks** (a 200 does not prove the app boots):
1. Open `https://carshake.online/` in a fresh incognito window. Confirm the page is **styled** and no console 404s remain.
2. Submit the email form with a test address and confirm the network call to `*.supabase.co` **succeeds** (this is the first time it has been able to run — this is the real test of whether opt-in works).
3. Open `/free/instant-proof`, upload a photo, confirm the stamped download still works.
4. Confirm the hero CTA lands on the tool, not a dead anchor.

**Rollback:**
```bash
git revert --no-edit HEAD && npm run deploy
```

---

## 7. REPORT (write this file, always — even on abort)

Write `~/carshake/HERMES_REPORT_CONVERSION_REPAIR.md` with:

1. **Asset fix ledger** — count of files changed (expect 108), the old → new filenames, and the Section 6.1/6.2 status codes before and after.
2. **Whether the deploy succeeded or was SSO-blocked.** If blocked, say plainly: *"the fix is committed locally but is NOT live; the owner must publish."* This is the single most important line in the report.
3. **Email capture test result** (6.5 step 2) — did the Supabase call finally succeed? This determines whether the CSP note is now fully closed or still open.
4. **Confirmation** that the Stripe URL, `vercel.json`/CSP, and `getUserMedia` were untouched.
5. **Steps skipped** and why (especially 3.5 if the in-flight instant-proof changes made it unsafe).
6. **Escalate to owner:**
   - **How long has the site been shipping broken bundles?** Every visitor in the 90-day window (177 people) likely saw an unstyled, non-functional page. The 94% bounce and 0 opt-ins are almost certainly this, not copy. Historical analytics for this domain should be treated as invalid.
   - **Why did 108 files go stale?** If the publish flow (Lovable manual publish vs. the `npm run deploy` chain) can re-stamp old hashes, this will recur. The publish process needs one owner, not two.
   - The site still has **no verifiable social proof** and no confirmed refund policy for the $7 kit.

---

## 8. WHAT SUCCESS LOOKS LIKE

- `grep -rl "index-RFf_eR7N\|index-BZyP2o6T" --include="*.html" .` returns **0 files**.
- Every `/assets/*` URL referenced by the live homepage returns **200**.
- The homepage renders **styled**, with no console 404s, and the email form's Supabase call actually fires.
- `/free/instant-proof` still stamps and downloads a photo; no `getUserMedia` anywhere.
- The `buy.stripe.com` link and `vercel.json` are **unmodified**.
- No invented asset hash, payment URL, or social-proof number.
- If the deploy was SSO-blocked, the report says so **unambiguously** — a committed fix that never shipped is not a completed task.

**The deepest point:** every previous diagnosis of this site — the CSP theory, the copy critique, the bounce-rate hand-wringing — was reasoning about a page that **was never able to run**. 108 pages have been serving a hero, a form, and a CTA with no JavaScript and no stylesheet behind them. Two filenames are wrong. Fix those two strings, confirm the form finally reaches Supabase, and only then find out what this site's real conversion rate is — because nobody has ever measured it.
