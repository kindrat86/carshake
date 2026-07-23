#!/usr/bin/env python3
"""Local funnel database sync — the Mac mini is the system of record.

Pulls into ~/.carshake/funnel.db (SQLite):
  - subscribers   <- Resend audience "CarShake"
  - email_events  <- Resend sends (checklist + owner-notification deliveries)
  - sync_runs     <- run log

No cloud DB anywhere: Resend is the upstream operational store (api/email-
capture.js adds contacts to the "CarShake" audience and sends the checklist
through it), this file is the durable local copy. Idempotent upserts; safe
to run any time. Scheduled hourly via launchd `com.carshake.funnel-db-sync`.
Mirrors ~/unlocksaas/scripts/sync-local-db.py — same pattern, one audience,
no Stripe leg (carshake's paid tiers use Stripe Payment Links, not a
subscription API reconciled here).

Run manually:  ~/portfolio/.venv/bin/python ~/carshake/scripts/sync-local-db.py
"""
import json
import re
import sqlite3
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

DB_DIR = Path.home() / ".carshake"
DB_PATH = DB_DIR / "funnel.db"
RESEND_KEY = re.search(
    r"RESEND_API_KEY=(\S+)", (Path.home() / "email-engine/.env").read_text()
).group(1)
AUDIENCE_NAME = "CarShake"


def resend(path):
    req = urllib.request.Request(
        f"https://api.resend.com{path}",
        # Cloudflare rejects urllib's default UA with 403/1010
        headers={
            "Authorization": f"Bearer {RESEND_KEY}",
            "User-Agent": "carshake-local-sync/1.0 (+curl-compatible)",
        },
    )
    for attempt in range(3):
        try:
            return json.load(urllib.request.urlopen(req, timeout=30))
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))  # free-tier rate limit is 2 rps


def main():
    DB_DIR.mkdir(exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS subscribers (
          email TEXT NOT NULL, audience TEXT NOT NULL,
          unsubscribed INTEGER, resend_created_at TEXT,
          first_seen_locally TEXT, last_synced TEXT,
          PRIMARY KEY (email, audience));
        CREATE TABLE IF NOT EXISTS email_events (
          resend_id TEXT PRIMARY KEY, to_email TEXT, from_email TEXT,
          subject TEXT, last_event TEXT, created_at TEXT, scheduled_at TEXT,
          last_synced TEXT);
        CREATE TABLE IF NOT EXISTS sync_runs (
          at TEXT, ok INTEGER, subscribers INTEGER, emails INTEGER, error TEXT);
        """
    )
    now = datetime.now(timezone.utc).isoformat()
    counts = {"subscribers": 0, "emails": 0}
    err = None
    try:
        # --- Resend audience -> subscribers
        audiences = resend("/audiences")["data"]
        match = [a for a in audiences if a["name"] == AUDIENCE_NAME]
        if match:
            contacts = resend(f"/audiences/{match[0]['id']}/contacts")["data"]
            for c in contacts:
                db.execute(
                    """INSERT INTO subscribers (email, audience, unsubscribed,
                       resend_created_at, first_seen_locally, last_synced)
                       VALUES (?,?,?,?,?,?)
                       ON CONFLICT(email, audience) DO UPDATE SET
                       unsubscribed=excluded.unsubscribed,
                       last_synced=excluded.last_synced""",
                    (c["email"], AUDIENCE_NAME, int(c.get("unsubscribed", False)),
                     c.get("created_at"), now, now),
                )
                counts["subscribers"] += 1

        # --- Resend sends -> email_events (most recent 100; the table
        # accumulates history across runs, so hourly syncs never miss)
        for e in resend("/emails?limit=100")["data"]:
            to = (e.get("to") or [""])[0]
            # This Resend account is shared across the whole portfolio (same
            # key backs gitdealflow/unlocksaas/voicelogpro/invisibleexit too)
            # — only keep sends this project actually issued, or this file
            # would silently accumulate other sites' email history under
            # carshake's name.
            if "@carshake.online" not in (e.get("from") or ""):
                continue
            db.execute(
                """INSERT INTO email_events VALUES (?,?,?,?,?,?,?,?)
                   ON CONFLICT(resend_id) DO UPDATE SET
                   last_event=excluded.last_event,
                   last_synced=excluded.last_synced""",
                (e["id"], to, e.get("from"),
                 e.get("subject"), e.get("last_event"), e.get("created_at"),
                 e.get("scheduled_at"), now),
            )
            counts["emails"] += 1
    except Exception as e:  # record the failure, keep partial data
        err = f"{type(e).__name__}: {e}"

    db.execute(
        "INSERT INTO sync_runs VALUES (?,?,?,?,?)",
        (now, int(err is None), counts["subscribers"], counts["emails"], err),
    )
    db.commit()
    db.close()
    status = "OK" if err is None else f"PARTIAL ({err})"
    print(f"[{now}] {status} " + " ".join(f"{k}={v}" for k, v in counts.items()))
    sys.exit(0 if err is None else 1)


if __name__ == "__main__":
    main()
