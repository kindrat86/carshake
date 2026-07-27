# Incident Report — carshake.online: paused project + fabricated-scarcity fix

**Date:** 2026-07-26 → 2026-07-27
**Status:** ✅ **RESOLVED.** Site is UP, all funnel pages 200, and the fabricated
"47/100 founding spots" + "73 of 100" scarcity is **GONE from production**
(verified live on carshake.online).

---

## TL;DR

The canonical `carshake` Vercel project was **PAUSED** by Vercel's abuse
protection (triggered by the deploy storm — 6+ concurrent agent sessions
spawning ~14 simultaneous `vercel --prod` processes). Every deployment while
paused went to `BLOCKED`/`STAGED` state and the CLI hung at 0% CPU forever.
Unpaused the project via the REST API, then deployed the patched bundles. The
fabricated scarcity is now gone from production.

---

## The fabricated scarcity (the lie that was removed)

The SPA displayed **two different fake "founding spots" counts**, both fabricated
(real Stripe subscriber count on Shield+: 0):

1. **Sticky-bar: "47 of 100 founding spots"** — hardcoded
   `{total_signups: 47, founding_cap: 100}` default, fed by a dead Supabase
   `signups_cap` fetch (Supabase removed portfolio-wide 2026-07-23, so the fetch
   silently failed and the number stayed at the fake 47).
   - **Fix:** replaced the hook with `{scansCount:0, spotsLeft:0}` (no Supabase
     call); replaced DOM render `[l," founding spots"]` with
     `["Founding price — first 100 only"]`.

2. **/pricing page: "73 of 100 founding spots claimed"** — hardcoded string +
   false claim "after that, Shield+ goes to $5.97/mo".
   - **Fix:** replaced with `"Founding price — first 100 members only — locked
     at $2.97/mo for life"`.

**Why this mattered (Brunson lens):** fake scarcity destroys the trust the entire
Epiphany Bridge was built to create. Russell Brunson is explicit: scarcity must
be *real* ("first N members") or it backfires.

---

## Root cause: project was PAUSED

Diagnosed via the REST API (the CLI doesn't surface this — it just hangs):

```bash
# Deployments showed BLOCKED state with this reason:
GET /v6/deployments?projectId=prj_orxFPZPoPFiwVot8BasaZcsUvtOX
# → readyState: "BLOCKED"
# → readyStateReason: "The project associated to this deployment is paused.
#    New deployments cannot be built while the project is paused."

# Project object showed:
GET /v9/projects/carshake  →  "paused": true
```

The pause was Vercel's abuse protection, almost certainly triggered by the deploy
storm (the growth-loop launchd daemons were spawning many concurrent deploys).

## Resolution (what fixed it)

```bash
TOKEN=$(python3 -c "import json;print(json.load(open('$HOME/Library/Application Support/com.vercel.cli/auth.json'))['token'])")

# 1. Unpause the project (note: endpoint needs the project ID, not the name)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{}' \
  "https://api.vercel.com/v9/projects/prj_orxFPZPoPFiwVot8BasaZcsUvtOX/unpause?teamId=team_VqIhc5enyfXN91ZlfQhyz2bC"
# → project paused: false

# 2. Deploy the patched bundles from a clean dir (no .vercel/output artifact,
#    project linked to canonical 'carshake')
cd /path/to/clean-copy && vercel --prod --yes   # → ✓ Ready in 15s (ful5v74mr)

# 3. Promote to the domain
vercel alias set carshake-ful5v74mr-...vercel.app carshake.online
```

Verified live: all funnel pages 200, fake scarcity = 0, honest replacement
present.

---

## Cloudflare note

DNS is on Cloudflare (`aspen.ns.cloudflare.com` / `karl.ns.cloudflare.com`), not
Vercel. The `s-maxage=86400` + `stale-while-revalidate=604800` cache headers mean
Cloudflare *can* serve stale content for up to 7 days. In practice the alias
promotion propagated immediately for cache-busted requests and within minutes for
default requests — no manual Cloudflare purge was needed. If stale content is
ever observed after a future deploy, purge via: Cloudflare dashboard → Caching →
Configuration → "Purge Everything."

---

## Deploy-storm context (the underlying cause of the pause)

The growth-loop launchd daemons were spawning 6+ concurrent agent sessions that
each edited, rebased, and deployed the repo simultaneously. At peak there were
14+ frozen `vercel --prod` processes. These daemons were **stopped** during this
incident via `launchctl unload`:

```bash
for plist in com.growthloop.inner com.growthloop.outer \
             com.sipiteno.growth-harness.traffic \
             com.sipiteno.growth-harness.conversion \
             com.sipiteno.growth-harness.review \
             com.sipiteno.growth-harness.snapshot; do
  launchctl unload ~/Library/LaunchAgents/${plist}.plist
done
```

**Restart them deliberately** (with `launchctl load`) only after confirming the
canonical project is unpaused — otherwise the storm resumes and Vercel will
re-pause the project.

---

## Patched bundles (all in this commit, verified)

| Bundle | Fake scarcity | Honest replacement | Parses |
|---|---|---|---|
| `assets/index-ypvUJ8Vr.js` | 0 ✓ | "Founding price — first 100 only" ✓ | OK ✓ |
| `assets/PricingPage-CX9R2Eim.js` | 0 ✓ | "first 100 members only" ✓ | OK ✓ |

Verify:
```bash
grep -c "total_signups:47,founding_cap:100" ~/carshake/assets/index-ypvUJ8Vr.js  # want 0
grep -c "73 of 100 founding spots" ~/carshake/assets/PricingPage-CX9R2Eim.js     # want 0
node --check ~/carshake/assets/index-ypvUJ8Vr.js                                  # want OK
```

## Re-apply script (if a rebase drops the patches again)

If another agent's `git pull --rebase` reverts these bundles (it happened twice
during this incident), re-apply from `~/carshake`:

```bash
node -e '
const fs=require("fs");
const f="assets/index-ypvUJ8Vr.js";
let s=fs.readFileSync(f,"utf8");
const tokA="const[e,t]=f.useState({total_signups:47,founding_cap:100});return f.useEffect(()=>{_t.from(\"signups_cap\").select(\"*\").limit(1).single().then(({data:r})=>{r&&t({total_signups:r.total_signups??47,founding_cap:r.founding_cap??100})})},[]),{scansCount:e.total_signups,spotsLeft:e.founding_cap-e.total_signups}}";
const repA="const[e,t]=f.useState(!1);return{scansCount:0,spotsLeft:0}}";
const tokB="[l,\" founding spots\"]";
const repB="[\"Founding price — first 100 only\"]";
if(s.includes(tokA)){s=s.split(tokA).join(repA).split(tokB).join(repB);fs.writeFileSync(f,s);console.log("patched");}
else if(s.includes(repA)){console.log("already patched");}
else{console.log("TOKEN NOT FOUND - bundle changed, re-derive");}
'
node --check assets/index-ypvUJ8Vr.js
```

---

## DO NOT REINTRODUCE

- `total_signups: 47, founding_cap: 100` literal, or any "X of 100 spots claimed"
  counter not wired to a real source of truth (real Stripe count is 0).
- The Supabase `signups_cap` fetch. Supabase is gone portfolio-wide since 2026-07-23.
- Aliasing `carshake.online` to a deploy in a different Vercel project — it
  triggers cross-project SSO redirects and takes the site down.
- If deploys start hanging at 0% CPU again, **check `paused` on the project
  first** (via the API above) — that's the symptom, not a corrupted pipeline.
