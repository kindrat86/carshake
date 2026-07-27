#!/usr/bin/env python3
"""CarShake Soap Opera Sequence — Days 2-5 after the Valet Damage Playbook.

WHY THIS EXISTS
---------------
api/email-capture.js sends Day 1 (the Valet Damage Playbook) the moment
someone opts in, and historically *promised* a "real dispute timeline"
tomorrow. No such email ever existed — a broken promise to every lead.
This file is that promise, kept.

WHY IT RUNS HERE, NOT AT OPT-IN
-------------------------------
Resend's scheduled-send window caps at +72h. A daily Day 2/3/4/5 cadence
can't be pre-scheduled at opt-in (Day 5 would fall outside the window).
launchd already runs com.carshake.funnel-db-sync hourly and that job
already talks to Resend and knows every subscriber — so this is the
natural place to drive the sequence from.

Brunson Soap Opera beats, adapted to CarShake's REAL, verifiable story
(the $4,200 Beverly Hills valet incident — see about.html):
  Day 2  Set the stage / the "wall"     (the $4,200 moment)
  Day 3  Epiphany                       (bailment law + the plan)
  Day 4  Hidden benefits / escalation   (the 4 deny-claim moves)
  Day 5  The call to action / what now  (the 60-second habit + the Kit)

No fabricated testimonials, no invented customer names, no unearned
metrics. Only material the public site already makes — the founder's
documented story, the published cost ranges, the technical truth of the
product (GPS + dual timestamp + SHA-256). Same honesty standard the
repo enforces elsewhere (see git log: "remove unearned social proof",
"remove fabricated reviews", "honesty: ...").

STATE
-----
`sequence_progress` table (email, last_step_sent, last_sent_at, opted_in_at).
Idempotent: a step is sent at most once per address; re-runs are safe.

RUN MANUALLY:  ~/portfolio/.venv/bin/python ~/carshake/scripts/soap-opera-sequence.py
RUN IN PROD :  chained from com.carshake.funnel-db-sync (hourly, launchd).
"""
import json
import sqlite3
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

DB_DIR = Path.home() / ".carshake"
DB_PATH = DB_DIR / "funnel.db"
AUDIENCE_NAME = "CarShake"

# read the same Resend key the main sync reads
import re
_env = (Path.home() / "email-engine/.env").read_text()
RESEND_KEY = re.search(r"RESEND_API_KEY=(\S+)", _env).group(1)

# --- Sequence definition ------------------------------------------------
# delay_hours = minimum hours after opt-in before the step is eligible.
# Day 1 is sent by api/email-capture.js at opt-in (instant). Days 2-5 here.
SEQUENCE = [
    {
        "step": 2,
        "delay_hours": 24,
        "subject": "The $4,200 scratch (and why I couldn't beat 'it was already like that')",
        "body": """<p style="color:#cbd5e1;line-height:1.7;">Quick story.</p>
<p style="color:#cbd5e1;line-height:1.7;">December 2023. I handed my keys to a Beverly Hills hotel valet and walked in feeling fine. Next morning the front splitter had a crack to the tune of <strong style="color:#f8fafc;">$4,200</strong>.</p>
<p style="color:#cbd5e1;line-height:1.7;">The valet manager didn't say <em>we did it</em>. He said four words I had no answer for:</p>
<p style="color:#f8fafc;font-size:1.05rem;text-align:center;padding:1rem 0;font-style:italic;">&ldquo;How do we know it wasn't already like that?&rdquo;</p>
<p style="color:#cbd5e1;line-height:1.7;">And he was right. I had no timestamped photo from the moment I handed the keys over. My word against theirs. I paid.</p>
<p style="color:#cbd5e1;line-height:1.7;">That night I went down a rabbit hole on <strong style="color:#e2e8f0;">bailment law</strong> — the legal principle that, in many places, puts the burden on the valet once you can show the car was fine at handover. The catch: you have to <em>be able to show it</em>. Tomorrow I'll send what I found.</p>
<p style="color:#64748b;font-size:0.85rem;margin-top:1.5rem;">— Founder, CarShake &middot; <a href="https://carshake.online/about" style="color:#00d4aa;">the full story</a></p>""",
    },
    {
        "step": 3,
        "delay_hours": 48,
        "subject": "The 1 line of fine print that lets valets say no",
        "body": """<p style="color:#cbd5e1;line-height:1.7;">Yesterday: the $4,200 splitter I couldn't prove wasn't pre-existing.</p>
<p style="color:#cbd5e1;line-height:1.7;">Today: why that keeps happening to people, and the plan I built after it happened to me.</p>
<p style="color:#cbd5e1;line-height:1.7;">Most valet tickets quietly limit the operator's liability — often to around $250, or by excluding &ldquo;pre-existing conditions.&rdquo; Without a record of the car's condition <em>at the exact moment of handover</em>, that clause wins. It's not dishonest; it's just that you walked in with no evidence and they did.</p>
<p style="color:#cbd5e1;line-height:1.7;">So the plan became simple: capture a record <strong style="color:#e2e8f0;">before</strong> the keys leave your hand, in a form nobody can argue with after the fact. That's literally why CarShake exists:</p>
<ul style="color:#94a3b8;line-height:1.9;">
<li><strong style="color:#e2e8f0;">GPS</strong> on every photo — proves the car was at the valet stand</li>
<li><strong style="color:#e2e8f0;">Dual timestamp</strong> (your device + a server) — proves <em>when</em></li>
<li><strong style="color:#e2e8f0;">SHA-256 hash</strong> — proves the photo wasn't altered later</li>
</ul>
<p style="color:#cbd5e1;line-height:1.7;">You don't need to threaten anyone with it. You just need to <em>have</em> it. Tomorrow: the four moves operators use to push back, and the counter to each.</p>
<p style="color:#64748b;font-size:0.85rem;margin-top:1.5rem;">— Founder, CarShake</p>""",
    },
    {
        "step": 4,
        "delay_hours": 72,
        "subject": "The 4 moves valet companies use to deny a claim",
        "body": """<p style="color:#cbd5e1;line-height:1.7;">If you ever push back on a damage charge, you'll usually meet one of four moves. None of them survive a timestamped before-photo. Here's each one and what to say.</p>
<ol style="color:#94a3b8;line-height:1.9;">
<li><strong style="color:#e2e8f0;">&ldquo;It was already like that.&rdquo;</strong><br>Counter: <em>&ldquo;I have GPS-verified, timestamped photos from the moment I handed you the keys — here they are.&rdquo;</em></li>
<li><strong style="color:#e2e8f0;">&ldquo;We can't confirm it happened on our watch.&rdquo;</strong><br>Counter: the same before-photo, taken at your location, plus an after-photo taken the instant you got the car back.</li>
<li><strong style="color:#e2e8f0;">&ldquo;You left before reporting it.&rdquo;</strong><br>Counter: an after-photo captured <em>at pickup</em>, before you drive off — so the timing can't be disputed.</li>
<li><strong style="color:#e2e8f0;">Delay and deny until you give up.</strong><br>Counter: a hashed, immutable record that doesn't decay while they stall.</li>
</ol>
<p style="color:#cbd5e1;line-height:1.7;">The pattern across all four: <strong style="color:#e2e8f0;">they rely on you having no evidence.</strong> Remove that assumption and most disputes dissolve before they start.</p>
<p style="color:#cbd5e1;line-height:1.7;">Tomorrow: the 60-second habit that makes all of this automatic — and the one thing I'd buy if I were starting from scratch.</p>
<p style="color:#64748b;font-size:0.85rem;margin-top:1.5rem;">— Founder, CarShake</p>""",
    },
    {
        "step": 5,
        "delay_hours": 96,
        "subject": "The 60-second habit (and the one thing worth $7)",
        "body": """<p style="color:#cbd5e1;line-height:1.7;">Last one from me for now. Two things.</p>
<p style="color:#cbd5e1;line-height:1.7;"><strong style="color:#e2e8f0;">1. The habit.</strong> Before you hand over your keys — anywhere, every time — open CarShake and snap the eight angles. It's free, it's 60 seconds, and the GPS + dual timestamp + hash happen automatically. That's the whole defence. <a href="https://carshake.online/free/instant-proof" style="color:#00d4aa;">Start a scan &rarr;</a></p>
<p style="color:#cbd5e1;line-height:1.7;"><strong style="color:#e2e8f0;">2. The thing worth $7.</strong> The free app handles the <em>scanning</em>. But if a charge <em>actually</em> lands, the scanning isn't what saves you — the <em>words</em> do. The Valet Damage Emergency Kit is the dispute-response playbook I built from the $4,200 mess: the exact scripts, the evidence checklist, the legal framing. It's $7, once. <a href="https://carshake.online/tripwire" style="color:#00d4aa;">See what's in it &rarr;</a></p>
<p style="color:#cbd5e1;line-height:1.7;">That's the ladder. Free tool to prevent, $7 kit to fight back if prevention didn't get there in time.</p>
<p style="color:#cbd5e1;line-height:1.7;">I'll only email you again when there's something genuinely useful — a new script, a real update, a cost change. No daily noise. And if you want me to stop, hit reply or <a href="https://carshake.online/unsubscribe" style="color:#00d4aa;">unsubscribe here</a>.</p>
<p style="color:#64748b;font-size:0.85rem;margin-top:1.5rem;">— Founder, CarShake &middot; <a href="https://carshake.online" style="color:#00d4aa;">carshake.online</a></p>""",
    },
]

WRAPPER = """<!doctype html>
<html><body style="font-family:Inter,Arial,sans-serif;background:#0f172a;color:#f8fafc;padding:2rem;">
<div style="max-width:560px;margin:0 auto;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:2rem;">
<h1 style="font-family:'Space Grotesk',sans-serif;color:#00d4aa;font-size:1.25rem;margin:0 0 1.25rem;">CarShake</h1>
{body}
<hr style="border-color:#334155;margin:1.5rem 0;">
<p style="color:#64748b;font-size:0.75rem;">You're getting this because you downloaded the Valet Damage Playbook from carshake.online. <a href="https://carshake.online/unsubscribe" style="color:#475569;">Unsubscribe</a>.</p>
</div>
</body></html>"""


def resend_post(path, payload):
    """POST JSON to Resend with the same UA/timeout discipline as the sync."""
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"https://api.resend.com{path}",
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {RESEND_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "carshake-soap-opera/1.0 (+curl-compatible)",
        },
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.status, json.load(r)
        except urllib.error.HTTPError as e:
            body = e.read().decode(errors="replace")
            # 422 "Email already sent" / duplicate contact -> not retriable
            if e.code in (400, 422):
                return e.code, {"error": body}
            if attempt == 2:
                return e.code, {"error": body}
            time.sleep(2 * (attempt + 1))
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))


def main():
    DB_DIR.mkdir(exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS sequence_progress (
          email TEXT PRIMARY KEY,
          opted_in_at TEXT NOT NULL,
          last_step_sent INTEGER NOT NULL DEFAULT 1,
          last_sent_at TEXT,
          unsubscribed INTEGER NOT NULL DEFAULT 0
        );
        """
    )
    db.commit()

    # Pull the current CarShake audience into sequence_progress.
    # We discover opted_in_at from the subscribers table (resend_created_at
    # or first_seen_locally), defaulting to "now" if unknown so a brand-new
    # lead isn't instantly mailed Days 2-5 in a burst.
    subs = db.execute(
        """SELECT email, COALESCE(resend_created_at, first_seen_locally)
           FROM subscribers WHERE audience=?""",
        (AUDIENCE_NAME,),
    ).fetchall()
    for email, opted_in_at in subs:
        opt = opted_in_at or datetime.now(timezone.utc).isoformat()
        db.execute(
            """INSERT INTO sequence_progress (email, opted_in_at, last_step_sent, last_sent_at, unsubscribed)
               VALUES (?,?,1,NULL,0)
               ON CONFLICT(email) DO UPDATE SET
                 opted_in_at = COALESCE(sequence_progress.opted_in_at, excluded.opted_in_at)""",
            (email, opt),
        )
    # Mark unsubscribed ones so we never mail them.
    db.execute(
        """UPDATE sequence_progress SET unsubscribed=1
           WHERE email IN (
             SELECT email FROM subscribers
             WHERE audience=? AND COALESCE(unsubscribed,0)<>0)""",
        (AUDIENCE_NAME,),
    )
    db.commit()

    now = datetime.now(timezone.utc)
    sent_total = 0
    for step_def in SEQUENCE:
        eligible_at = now - timedelta(hours=step_def["delay_hours"])
        rows = db.execute(
            """SELECT email FROM sequence_progress
               WHERE last_step_sent = ?
                 AND unsubscribed = 0
                 AND (last_sent_at IS NULL OR datetime(last_sent_at) <= datetime(?))
                 AND datetime(opted_in_at) <= datetime(?)""",
            (step_def["step"] - 1, now.isoformat(), eligible_at.isoformat()),
        ).fetchall()

        for (email,) in rows:
            status, resp = resend_post("/emails", {
                "from": "CarShake <playbook@carshake.online>",
                "to": email,
                "subject": step_def["subject"],
                "html": WRAPPER.format(body=step_def["body"]),
                "tags": [{"name": "sequence", "value": f"soap-opera-day-{step_def['step']}"}],
            })
            ok = status in (200, 201)
            if ok:
                db.execute(
                    """UPDATE sequence_progress
                       SET last_step_sent = ?, last_sent_at = ?
                       WHERE email = ?""",
                    (step_def["step"], now.isoformat(), email),
                )
                sent_total += 1
                print(f"[soap-opera] day {step_def['step']} -> {email} (OK)")
            else:
                # Don't advance on failure — it'll retry next hourly run.
                print(f"[soap-opera] day {step_def['step']} -> {email} (SKIP status={status} body={str(resp)[:200]})")
            db.commit()
            time.sleep(0.6)  # stay under Resend's 2 rps free-tier ceiling

    db.close()
    print(f"[soap-opera] run complete, sent={sent_total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
