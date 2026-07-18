# Reddit Founder-Story Post — CarShake

_Three variants for three subreddits. Reddit rules: genuine, not spammy, add value first. The founder story is the asset — let it carry the post. NEVER lead with the product link; lead with the story and the lesson._

---

## Variant A — r/Entrepreneur (build-in-public / "Show" flair)

**Title:** I lost $4,200 to a hotel valet because I had no proof. So I built a free app so it never happens again.

**Body:**

In December 2023, I handed my keys to a hotel valet in Beverly Hills. When the car came back, the front splitter was scraped — $4,200 in damage.

The valet manager shrugged: "How do we know it wasn't like that when you dropped it off?"

He was right. I had nothing. No photos. No witness. No proof. I paid for the repair out of pocket.

That moment bothered me for months. The problem wasn't that valets are dishonest — most aren't. The problem is that **once you hand over the keys, the burden of proof falls on you**, and almost nobody documents the condition of their car before a handover. It's a "he-said-she-said" the valet company will always win.

So I built something. It's called **CarShake** — a free web app (no download) that walks you around your car in 60 seconds, captures 8 timestamped, GPS-verified photos, and generates a QR code the attendant scans to digitally acknowledge the condition. When you get the car back, you scan again and the AI flags any new damage. The result is a court-admissible record that ties damage to a specific time window.

I call it the **3-Stop Protocol**: scan → QR handover → rescan on return.

I'm not here to sell anything — it's free, no signup wall, no app store. I'm posting because:

1. **I wish I'd had it that night in Beverly Hills.** If this saves one person their $4,200, it was worth building.
2. **I want to hear how others have handled this.** Has anyone successfully fought a valet damage claim? What worked — photos, witnesses, a lawyer letter? What *didn't*?
3. **I'm a solo founder** and this is my first consumer product. Brutal feedback welcome on the concept, the positioning, the site. Roast it.

**Lesson I'd pass on to fellow founders:** build the thing you Googled frantically at 1am and couldn't find. That gap is your market.

Site (no signup): carshake.online — happy to answer any questions about the build, the tech (it's a PWA + Supabase + a lightweight AI comparison layer), or the bailment-law rabbit hole I went down.

---

## Variant B — r/Cars (community / story)

**Title:** A valet scraped my car and I had zero proof. $4,200 gone. So I built something so it doesn't happen to you.

**Body:**

Beverly Hills, December 2023. Hotel valet. Came back to a scraped front splitter. Valet manager's response: "How do we know it wasn't already like that?"

I had nothing. No before photos. I paid $4,200 out of pocket and seethed about it for six months.

Then I built a tool so nobody else has to be in that position.

It's free, runs in your phone's browser (no app), takes 60 seconds: you walk around the car, it captures 8 timestamped + GPS-stamped photos, and gives you a QR code the valet scans to acknowledge the condition. When you pick up the car, you scan again and AI compares every angle and flags new damage. You walk away with a timestamped record that ties any damage to the exact window the car was in their custody.

I call it the **3-Stop Protocol**: scan → QR handover → rescan.

Three things I learned going down the bailment-law rabbit hole:

- **In most US states, when you hand your keys to a valet you enter a "bailment"** — the valet legally owes you reasonable care. But *you* carry the burden of proving the damage happened on their watch.
- **Courts almost always side with whoever has the better timestamped evidence.** A timestamped photo from *before* the handover is the single highest-leverage thing you can have.
- **Hotel and airport valets are the worst offenders** — not because they're careless, but because the volume is high and the accountability loop is weak.

The tool is at carshake.online if you want to use it before your next hotel/airport handover. Not charging for it — genuinely just don't want anyone else to eat a $4,200 bill because they trusted a shrug.

Has anyone here successfully fought a valet claim? Curious what actually worked in practice — I've heard everything from "small claims court" to "chargeback" to "threaten to call the GM."

---

## Variant C — r/Insurance / r/legaladvice (educational, not promotional)

**Title:** [US] How to actually prove a valet damage claim (after I lost $4,200 because I couldn't)

**Body:**

Throwaway context: I'm not a lawyer, this isn't legal advice — I'm someone who got burned and then went deep on the mechanics of proving these claims.

In December 2023 a hotel valet scraped my car ($4,200). Valet manager: "How do we know it wasn't already like that?" I had no before photos. I lost the claim.

What I learned afterward, in case it helps anyone here:

**1. The burden of proof is on YOU, not the valet.**
When you hand over keys you create a "bailment" — the valet owes reasonable care, but you have to prove the damage occurred while the car was in their custody. Without a before-state record, it's he-said-she-said and the valet company wins by default.

**2. The single most valuable piece of evidence is a timestamped photo from BEFORE the handover.**
Courts and insurers weight timestamped, location-stamped photos far above testimony. A photo set from the *start* of the bailment is what flips a "he-said-she-said" into a clear liability.

**3. Get the attendant to acknowledge the condition.**
A QR receipt or any mutual sign-off at handover destroys the "it was already like that" defense. Even a quick photo of the valet ticket next to your car helps.

**4. File the claim fast and in writing.**
Bailment claims have short notice windows in many states. Get it in writing within 24–72 hours.

I ended up building a free tool that does steps 1–3 automatically (60-second scan + QR handover receipt + AI before/after comparison) because I never wanted to be in that position again — but the *principles* above are the thing. The tool is just a convenient way to execute them.

Happy to answer questions on the bailment-law specifics I researched (varies by state) or the evidence standards small-claims courts actually apply.

---

## Posting playbook

- **Post on Tuesday or Wednesday, 9–11am EST** (peak US engagement for these subs).
- **Don't cross-post the same day** — Reddit's spam filters flag identical posts across subs. Stagger by 3–5 days minimum, and customize each variant (they already differ above).
- **Reply to every comment within 2 hours** for the first 6 hours. Early engagement drives the algorithm.
- **Expect pushback** ("this is an ad"). Respond with transparency: "Yeah, I built it, it's free, no signup — if the mods want proof I'm happy to verify. I'm posting because the question of how to fight valet claims comes up constantly here and I went through it."
- **Mod-mail the sub first** for r/Entrepreneur if you want a "Show" or "Founder" flair — they often require pre-approval for self-promotional posts.
- **Track the post URL** in the AEO measurement sheet — Reddit threads that rank in Google become long-term AI-citation sources.
