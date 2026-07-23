# HERMES TASK — carshake.online: Free "Instant Proof" Tool (functional lead magnet)

> **Runbook for:** Hermes Agent running DeepSeek v4 Pro
> **Mode:** AUTONOMOUS — build, validate, commit, deploy without human intervention, subject to the fail-safes in §1.
> **Repo:** `~/carshake` (static HTML site, `outputDirectory: "."`, deployed via Vercel CLI).
> **Deploy:** `npm run deploy` (prerender → inject-disambiguation → guard-positioning → `vercel --prod --yes`). Project `carshake`.
> **Author of runbook:** Claude (2026-07-21), grounded in a live audit.

---

## 0. What you are building and why

CarShake's product is *creating visual proof* — GPS/timestamped before-&-after photos of your car so you never pay for valet/rental/parking damage you didn't cause. But the audit found a glaring mismatch: **CarShake is a tool product with a text-only marketing site and no working free tool.** (The site has 1,212 pages but only ~132 `<img>` tags, mostly tracking pixels; the existing "damage-report-generator" has zero interactive elements.)

You will ship the thing the site is missing and the thing this product is *about*: a **free, no-signup, browser-based "Instant Proof" tool.** A visitor at the moment of need ("I'm about to hand my keys to a valet") opens it on their phone, snaps before/after photos, and the tool **stamps the date, time, and location onto each photo** and lets them download it — a timestamped proof record, free, in 30 seconds.

**Why this skyrockets organic (mechanism):**
- **Free functional tools are the #1 reliable organic + backlink magnet** — people search for them ("free car damage documentation," "timestamp photo for valet," "prove car condition before valet") and *link* to them.
- It's the most **on-brand, shareable** asset possible — it delivers the core product value for free.
- It doubles as a **conversion** fix (value-first entry → app install / email) for a site memory notes has ~0 subscribers.
- It's an **AI-search** answer: "what should I do before valet parking?" → "document your car — here's a free tool."

**Why it's low-risk to build autonomously:** it's a single self-contained static HTML page with vanilla JS (no framework, no backend, no dependencies), using `<input type="file" capture>` + `<canvas>` — a standard, well-trodden pattern. Complete code is in §3.

---

## 1. 🚨 GUARDRAILS + FAIL-SAFES — READ FIRST

### 1a. Use file-input capture, NOT getUserMedia.
- The site's global `Permissions-Policy` header **blocks `camera` and `geolocation`** (`camera=(), geolocation=()`). A `getUserMedia` camera tool would be **dead on arrival.**
- Use `<input type="file" accept="image/*" capture="environment">` — this opens the native camera on mobile and is **NOT** gated by Permissions-Policy. Do not use `navigator.mediaDevices.getUserMedia`.
- Geolocation is optional and progressive: the tool works fully with **timestamp + a user-typed location**. An auto-GPS button may be added, but it must **fail silently** if blocked (it will be, unless the optional §5b header override is applied). Never make the tool depend on GPS.

### 1b. CSP compliance.
- The site sets CSP via a `<meta http-equiv>` tag per page. The tool page carries **its own** meta CSP allowing `img-src 'self' data: blob:` and inline scripts (`script-src 'self' 'unsafe-inline'`) — both already permitted site-wide. Canvas → `toDataURL` → download works under this. Do NOT add external script/CDN dependencies (CSP `default-src 'self'` would block them).

### 1c. NEVER fabricate.
- No invented stats, testimonials, "X drivers protected," ratings, or claims anywhere on the page. The tool's value is functional. (This site has a prior fabricated-stats flag — do not add to it.)
- The stamped photo shows only **real** data: the actual current date/time from the device clock, and whatever location text the **user** typed (or real GPS if they granted it). The tool must not invent or alter EXIF/metadata to misrepresent when a photo was taken — it overlays a visible, honest timestamp; that's it.

### 1d. Positioning guard + build.
- `scripts/guard-positioning.mjs` runs in `npm run deploy` and fails on wrong positioning. Keep copy on-brand ("proof, not a dispute"). Do not contradict it.
- Additive-first: one new HTML page + one rewrite in `vercel.json` + one sitemap entry + (optional) internal links. Do not touch other pages' logic.

### 1e. Idempotency + commit hygiene.
- Safe to re-run. `git config user.email` must be a team email (`sales@sipiteno.com`) before deploy (Vercel blocks non-team commit authors). `git add` only files this task creates/edits.

---

## 2. Deliverable — `free/instant-proof.html`

A self-contained SEO landing page **with the working tool embedded.** Create it exactly (adjust brand color if the site uses a different accent — check `index.html`).

## 3. The full page (create `free/instant-proof.html`)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com 'self'; img-src 'self' data: blob:; connect-src 'self';">
<title>Free Car Proof Tool — Timestamp Your Car Photos Before Valet | CarShake</title>
<meta name="description" content="Free, no-signup tool: snap before & after photos of your car and CarShake stamps the date, time, and location onto each one. Instant proof against valet, rental, or parking damage claims.">
<link rel="canonical" href="https://carshake.online/free/instant-proof">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<meta property="og:title" content="Free Car Proof Tool — Timestamp Your Car Photos">
<meta property="og:description" content="Snap before & after photos; CarShake stamps date, time & location. Free proof against valet/rental/parking damage.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://carshake.online/free/instant-proof">
<meta property="og:image" content="https://carshake.online/og-image.png">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"SoftwareApplication","name":"CarShake Instant Proof","applicationCategory":"UtilitiesApplication","operatingSystem":"Web","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"description":"Free browser tool that stamps date, time and location onto your car photos to create timestamped proof before valet, rental, or parking.","url":"https://carshake.online/free/instant-proof","publisher":{"@type":"Organization","name":"CarShake","url":"https://carshake.online"}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"HowTo","name":"How to create timestamped proof of your car's condition","totalTime":"PT1M","step":[
{"@type":"HowToStep","name":"Add a photo","text":"Tap 'Add photo' and take a picture of your car (or choose one you just took)."},
{"@type":"HowToStep","name":"Add location","text":"Type where you are (e.g. 'Bellagio valet, Las Vegas'). Optional: tap 'Use my GPS' if your browser allows it."},
{"@type":"HowToStep","name":"Stamp it","text":"CarShake overlays the current date, time, and location onto the photo."},
{"@type":"HowToStep","name":"Download","text":"Download the stamped photo. That's your timestamped proof — keep it before and after the valet."}
]}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"Is this free?","acceptedAnswer":{"@type":"Answer","text":"Yes. The Instant Proof tool is free and needs no signup. Everything happens in your browser — your photos never leave your device."}},
{"@type":"Question","name":"Does the timestamp prove when the photo was taken?","acceptedAnswer":{"@type":"Answer","text":"The tool stamps the current date and time from your device onto the image as a visible record. For the strongest proof, take the photo at the moment you hand over or collect your car, and take one before and one after."}},
{"@type":"Question","name":"Do my photos get uploaded anywhere?","acceptedAnswer":{"@type":"Answer","text":"No. All processing happens locally in your browser. Nothing is uploaded."}}
]}
</script>
<style>
:root{--accent:#e11d48;--bg:#0b1120;--fg:#e2e8f0;--card:#111a2e;--line:#1e293b}
@media(prefers-color-scheme:light){:root{--bg:#f8fafc;--fg:#0f172a;--card:#fff;--line:#e2e8f0}}
*{box-sizing:border-box}body{margin:0;font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--fg)}
.wrap{max-width:760px;margin:0 auto;padding:1.5rem 1rem 4rem}
h1{font-size:1.9rem;line-height:1.15;margin:.3rem 0}.lead{color:#94a3b8;font-size:1.05rem}
.tool{background:var(--card);border:1px solid var(--line);border-radius:.9rem;padding:1.25rem;margin:1.5rem 0}
label{display:block;font-weight:600;margin:.9rem 0 .35rem}
input[type=text]{width:100%;padding:.7rem;border:1px solid var(--line);border-radius:.5rem;background:transparent;color:var(--fg);font-size:1rem}
.btn{display:inline-block;background:var(--accent);color:#fff;border:0;border-radius:.6rem;padding:.75rem 1.15rem;font-size:1rem;font-weight:600;cursor:pointer;text-decoration:none}
.btn.sec{background:transparent;border:1px solid var(--line);color:var(--fg)}
.file{display:block;margin:.4rem 0}
canvas{max-width:100%;height:auto;border-radius:.5rem;margin-top:1rem;display:none;border:1px solid var(--line)}
.row{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.8rem}
.muted{color:#94a3b8;font-size:.9rem}
h2{margin-top:2.2rem}ol{padding-left:1.2rem}details{border-top:1px solid var(--line);padding:.75rem 0}summary{cursor:pointer;font-weight:600}
.cta{background:var(--accent);color:#fff;border-radius:.8rem;padding:1.2rem 1.35rem;margin:2rem 0}
.cta a{color:#fff;text-decoration:underline}
a{color:var(--accent)}
</style>
</head>
<body>
<div class="wrap">
<p class="muted"><a href="/">CarShake</a> › <a href="/free">Free tools</a> › Instant Proof</p>
<h1>Free car proof tool — stamp your photos before valet</h1>
<p class="lead">Snap a photo of your car and CarShake stamps the <strong>date, time, and location</strong> onto it. Timestamped proof against valet, rental, or parking damage — free, no signup, nothing leaves your phone.</p>

<div class="tool">
  <label for="loc">Where are you? (shown on the photo)</label>
  <input type="text" id="loc" placeholder="e.g. Bellagio valet, Las Vegas" autocomplete="off">
  <div class="row"><button class="btn sec" id="geo" type="button">📍 Use my GPS (optional)</button></div>

  <label class="file" for="file">📷 Add a photo of your car</label>
  <input class="file" type="file" id="file" accept="image/*" capture="environment">

  <canvas id="cv"></canvas>
  <div class="row" id="actions" style="display:none">
    <a class="btn" id="dl" download="carshake-proof.jpg">⬇ Download stamped proof</a>
    <button class="btn sec" id="again" type="button">Add another photo</button>
  </div>
  <p class="muted">Tip: take one photo <strong>before</strong> you hand over the car and one <strong>after</strong> you get it back.</p>
</div>

<div class="cta"><strong>Want this automatic?</strong> The CarShake app captures GPS-verified, dual-timestamped, AI-checked before/after records for you — so you have airtight proof without thinking about it. <a href="/">See how CarShake works →</a></div>

<h2>How it works</h2>
<ol>
<li><strong>Add a photo</strong> — tap and take a picture of your car (or pick one you just took).</li>
<li><strong>Add location</strong> — type where you are; optionally tap “Use my GPS”.</li>
<li><strong>Stamp it</strong> — CarShake overlays the date, time, and location.</li>
<li><strong>Download</strong> — save the stamped photo. Repeat before and after the valet.</li>
</ol>

<h2>FAQ</h2>
<details><summary>Is this free?</summary><p>Yes — free, no signup. Everything runs in your browser; your photos never leave your device.</p></details>
<details><summary>Does the timestamp prove when the photo was taken?</summary><p>It stamps your device's current date and time onto the image as a visible record. For the strongest proof, take the photo at the moment you hand over or collect the car — one before, one after.</p></details>
<details><summary>Do my photos get uploaded?</summary><p>No. All processing is local in your browser. Nothing is uploaded anywhere.</p></details>

<p class="muted" style="margin-top:2rem"><a href="/how-to-dispute-valet-damage">How to dispute valet damage →</a> · <a href="/faq/what-to-do-if-valet-damages-car">What to do if a valet damages your car →</a></p>
</div>

<script>
(function(){
  var file=document.getElementById('file'),cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  var loc=document.getElementById('loc'),dl=document.getElementById('dl'),actions=document.getElementById('actions'),again=document.getElementById('again'),geo=document.getElementById('geo');
  function stamp(img){
    var maxW=1600, scale=Math.min(1, maxW/img.width), w=Math.round(img.width*scale), h=Math.round(img.height*scale);
    cv.width=w; cv.height=h; ctx.drawImage(img,0,0,w,h);
    var now=new Date();
    var line1=now.toLocaleString();
    var line2=(loc.value||'').trim();
    var pad=Math.round(w*0.02), fs=Math.max(16, Math.round(w*0.028));
    var lines=['CarShake proof · '+line1]; if(line2) lines.push(line2);
    var barH=pad*2 + lines.length*(fs*1.35);
    ctx.fillStyle='rgba(0,0,0,0.62)'; ctx.fillRect(0,h-barH,w,barH);
    ctx.fillStyle='#fff'; ctx.font='600 '+fs+'px system-ui,sans-serif'; ctx.textBaseline='top';
    lines.forEach(function(t,i){ ctx.fillText(t, pad, h-barH+pad + i*(fs*1.35)); });
    cv.style.display='block'; actions.style.display='flex';
    dl.href=cv.toDataURL('image/jpeg',0.92);
  }
  file.addEventListener('change',function(){
    var f=file.files&&file.files[0]; if(!f) return;
    var img=new Image(); img.onload=function(){ stamp(img); URL.revokeObjectURL(img.src); };
    img.src=URL.createObjectURL(f);
  });
  again.addEventListener('click',function(){ file.value=''; file.click(); });
  geo.addEventListener('click',function(){
    if(!navigator.geolocation){ geo.textContent='GPS unavailable'; return; }
    geo.textContent='Locating…';
    navigator.geolocation.getCurrentPosition(function(p){
      var lat=p.coords.latitude.toFixed(5), lon=p.coords.longitude.toFixed(5);
      loc.value=(loc.value?loc.value+' · ':'')+lat+', '+lon; geo.textContent='📍 GPS added';
    }, function(){ geo.textContent='📍 GPS blocked — type location instead'; }, {timeout:8000});
  });
})();
</script>
</body>
</html>
```

---

## 4. Wire it up

### 4a. Rewrite (clean URL) — `vercel.json`
Add to the `rewrites` array (mirror the existing entries):
```json
{ "source": "/free/instant-proof", "destination": "/free/instant-proof.html" }
```

### 4b. Sitemap
Add `<url><loc>https://carshake.online/free/instant-proof</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>` to `sitemap.xml` before `</urlset>` (idempotent — skip if present). High priority: it's a key landing page.

### 4c. Internal links (do this — it's how the tool gets discovered + ranks)
Add a prominent link to `/free/instant-proof` from the highest-intent existing pages. Insert an inline link near the top of each (find a natural sentence; keep it one line, idempotent — skip if the href already present):
- `how-to-dispute-valet-damage.html`
- `faq/what-to-do-if-valet-damages-car.html`
- `faq/is-valet-liable-for-damage.html`
- `how-to-protect-car-valet-parking.html`
- `ultimate-guide-valet-damage-proof.html`
- the homepage `index.html` (a "Try the free proof tool" link near the hero CTA)

Suggested anchor: `<a href="/free/instant-proof">Create free timestamped proof now →</a>`. These contextual links from problem-aware pages are what funnel intent into the tool and pass internal PageRank to it.

---

## 5. Optional enhancements (only if safe)

### 5a. Fix the broken image-sitemap reference (quick win)
`robots.txt` declares `Sitemap: https://carshake.online/image-sitemap.xml` but **that file does not exist** (404). Either remove that line from `robots.txt`, or (better, later) generate a real image sitemap once the site has real content images. For now, **remove the dead reference** so crawlers don't hit a 404 sitemap.

### 5b. Enable auto-GPS on the tool route (optional, finicky)
To make the "Use my GPS" button work, the tool route needs `Permissions-Policy: geolocation=(self)`, but the global header sets `geolocation=()`. Add a **more specific** header source in `vercel.json` for `/free/instant-proof(.html)?` with `geolocation=(self)`. **Test after deploy** — Vercel may still apply the broad `/(.*)` rule; if GPS stays blocked, that's fine (the tool works without it; the button fails gracefully). Do not block the release on this.

---

## 6. VALIDATE (before deploy)

```bash
cd ~/carshake
# a) page exists and is self-contained
test -s free/instant-proof.html && echo "✓ page present"
# b) JSON-LD blocks parse
node -e "const h=require('fs').readFileSync('free/instant-proof.html','utf8');[...h.matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)].forEach(m=>JSON.parse(m[1]));console.log('✓ JSON-LD valid')"
# c) uses file-capture NOT getUserMedia (Permissions-Policy safety)
grep -q "getUserMedia" free/instant-proof.html && echo "FAIL: remove getUserMedia" || echo "✓ no getUserMedia"
grep -q 'capture="environment"' free/instant-proof.html && echo "✓ file capture present"
# d) no fabricated stats/claims
grep -inE "[0-9,]+ (drivers|users|customers) (protected|trust|saved)|[0-9]+% of (drivers|valets)" free/instant-proof.html && echo "FAIL: remove claim" || echo "✓ no fabricated claims"
# e) rewrite + sitemap wired
grep -q "/free/instant-proof" vercel.json && echo "✓ rewrite" 
grep -q "/free/instant-proof" sitemap.xml && echo "✓ sitemap"
# f) positioning guard
node scripts/guard-positioning.mjs
```
If any check fails, fix and re-run. Do not deploy a failed check.

---

## 7. DEPLOY (autonomous)

```bash
cd ~/carshake
git config user.email    # must print sales@sipiteno.com; if blank: git config user.email sales@sipiteno.com
git checkout -b instant-proof-tool
git add free/instant-proof.html vercel.json sitemap.xml robots.txt \
        how-to-dispute-valet-damage.html faq/what-to-do-if-valet-damages-car.html \
        faq/is-valet-liable-for-damage.html how-to-protect-car-valet-parking.html \
        ultimate-guide-valet-damage-proof.html index.html 2>/dev/null
git commit -m "Add free Instant Proof tool (functional lead magnet) + internal links"

# Deploy via the repo's own command (prerender + inject-disambiguation + guard + vercel --prod)
npm run deploy

# --- Verify live ---
sleep 20
curl -s https://carshake.online/free/instant-proof | grep -c "Instant Proof"          # expect >=1
curl -sI https://carshake.online/free/instant-proof | head -1                          # expect 200
curl -s https://carshake.online/free/instant-proof | grep -c 'capture="environment"'   # expect 1 (tool shipped)
curl -s https://carshake.online/how-to-dispute-valet-damage | grep -c "/free/instant-proof"  # expect >=1 (internal link live)
```
> Note: the interactive part (camera + canvas) needs a real browser to fully exercise. The curl checks confirm the page + tool markup shipped. If a headless browser (playwright) is available, load the page and confirm no console errors; otherwise flag for a quick manual mobile check.

If the page 404s, confirm the `vercel.json` rewrite was added and that `npm run deploy` completed (memory: carshake deploys have been SSO/auth-gated before — if `vercel --prod` errors on auth, report it; do not force).

---

## 8. POST-DEPLOY (multipliers)

1. **Search Console + Bing:** request indexing on `/free/instant-proof`.
2. **Distribution (where the backlinks come from):** free tools earn links when shared — post it where the problem is discussed (r/askcarsales, r/valet, r/rental, car forums, "free tools" roundups) and link it from any CarShake social/newsletter. Note this for the owner; it's the multiplier.
3. **Watch conversion:** the tool is also a value-first funnel entry — track clicks from the tool's "See how CarShake works" CTA in PostHog.

---

## 9. Expected results (honest, mechanism-based — estimates, not guarantees)

| Effect | Mechanism | Realistic outcome | When |
|---|---|---|---|
| **Ranks for tool queries** | A genuinely useful free tool page with HowTo/SoftwareApplication schema targets "free car damage documentation / timestamp photo / valet proof" | New organic entries on high-intent tool queries the text pages don't win | 3–8 weeks |
| **Backlinks** | Free functional tools are among the most-linked content types; sharable at the moment of need | Links to a linkable asset lift the whole domain's authority | 1–4 months (needs §8 sharing) |
| **AI-search answers** | "What should I do before valet parking?" → tool is the actionable answer; HowTo/FAQ schema | Cited/surfaced by ChatGPT/AI Overviews for protective-action queries | 1–3 months |
| **Conversion** | Value-first free tool → app/email CTA; fixes the ~0-subscriber problem with a no-friction entry | More qualified funnel entries than a text page | immediate |

**Straight talk:**
- The tool is the asset; **links + rankings compound with the sharing in §8.** Publishing alone gets you the indexable, schema-rich page and the conversion path; the backlink upside needs distribution.
- This is distinct from the site's existing text content because it's *functional* — it does the job the visitor came to do, which is what earns links and citations that pure articles don't.
- Measure: Search Console impressions on tool queries + referring domains to `/free/instant-proof`, and PostHog clicks on the tool's app CTA.

---

## 10. Rollback
Fully additive (one new page + a rewrite + a sitemap line + internal-link insertions). Roll back: `git revert` the commit, `npm run deploy`. Deleting `free/instant-proof.html` + its rewrite removes it cleanly.

### Definition of done
- [ ] `free/instant-proof.html` created (self-contained; file-capture not getUserMedia; own CSP; JSON-LD valid).
- [ ] `vercel.json` rewrite + `sitemap.xml` entry added; internal links added from ≥5 high-intent pages + homepage.
- [ ] (Optional) dead `image-sitemap.xml` line removed from robots.txt.
- [ ] All §6 checks pass incl. no-getUserMedia + no-fabricated-claims; positioning guard green.
- [ ] Committed to a branch; deployed via `npm run deploy`; live checks pass (page 200, tool markup present, internal link live).
- [ ] Distribution steps (§8) noted for the owner. Zero fabricated content anywhere.
```
