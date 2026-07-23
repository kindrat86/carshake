// CarShake Email Capture Endpoint
//
// Durable store: a "CarShake" Resend audience (created on first contact) —
// the same pattern unlocksaas.com uses, and for the same reason: no hosted
// third-party DB (Supabase is deprecated portfolio-wide), persistence lives
// on the Mac mini instead. `scripts/sync-local-db.py` pulls this audience
// into ~/.carshake/funnel.db hourly via launchd; Resend is the real-time
// write, the local SQLite copy is the durable record.
//
// Also restores actual lead-magnet delivery: the old /api/subscribe (now
// removed) sent the real "Valet Damage Playbook" checklist email but never
// stored the lead anywhere. Every fallback-cta form on the site was
// repointed at this endpoint in 7e9a3f2 for the storage fix, which
// (unnoticed at the time) meant real submitters stopped receiving the
// checklist entirely — this endpoint had never sent it. CHECKLIST_HTML
// below is that same content, moved here so the two problems get fixed
// together: durable capture AND the thing people actually filled out the
// form to get.
//
// PostHog capture is kept as an analytics-only signal, not a storage path —
// see `stored` handling below.

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const CARSHAKE_AUDIENCE_NAME = 'CarShake';
const POSTHOG_KEY = process.env.POSTHOG_API_KEY || 'phc_lyZCgvTpicjLzAO3rY2GhxuX5WUc5jQjP8ZVwwJqauX';
const POSTHOG_HOST = 'https://eu.i.posthog.com';
const OWNER_EMAIL = 'sales@sipiteno.com';

const ALLOWED_ORIGINS = ['https://carshake.online', 'https://www.carshake.online'];

const CHECKLIST_HTML = `<!doctype html>
<html><body style="font-family:Inter,Arial,sans-serif;background:#0f172a;color:#f8fafc;padding:2rem;">
<div style="max-width:560px;margin:0 auto;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:2rem;">
<h1 style="font-family:'Space Grotesk',sans-serif;color:#00d4aa;">✓ Your Valet Damage Playbook</h1>
<p style="color:#cbd5e1;line-height:1.6;">Here's everything you asked for. Bookmark this email — you'll want it next time a valet claims "it was already there."</p>
<h2 style="color:#fff;font-size:1.1rem;">What's inside:</h2>
<ul style="color:#94a3b8;line-height:1.8;">
<li><strong style="color:#e2e8f0;">The 8-Angle Scan Protocol</strong> — exactly what to photograph, in what order</li>
<li><strong style="color:#e2e8f0;">5 Dispute-Winning Scripts</strong> — what to say when the valet manager pushes back</li>
<li><strong style="color:#e2e8f0;">Time-Stamp Defense Checklist</strong> — how to make your photos court-admissible</li>
</ul>
<h2 style="color:#fff;font-size:1.1rem;">Day 2 preview: The 4 Valet Damage Tricks</h2>
<ol style="color:#94a3b8;line-height:1.9;">
<li><strong>Pre-existing damage claim</strong> — they say it was already there</li>
<li><strong>Post-departure claim</strong> — damage reported after you left</li>
<li><strong>Attribution swap</strong> — they blame another driver</li>
<li><strong>Delay-and-deny</strong> — wait until evidence is gone</li>
</ol>
<hr style="border-color:#334155;margin:1.5rem 0;">
<p style="color:#64748b;font-size:0.85rem;">Tomorrow: A real dispute timeline — how one CarShake user saved $2,100 with 3 photos. Look out for it.</p>
<p style="color:#64748b;font-size:0.8rem;margin-top:1.5rem;">CarShake &middot; <a href="https://carshake.online" style="color:#00d4aa;">carshake.online</a></p>
</div>
</body></html>`;

async function resendAPI(path, opts = {}) {
  const res = await fetch(`https://api.resend.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

// Get-or-create the "CarShake" audience, then add the contact to it. This is
// the durable store: scripts/sync-local-db.py reads this same audience into
// the local Mac-mini SQLite copy. Resend's contacts endpoint upserts on
// email, so a repeat signup is not an error.
async function addToCarShakeAudience(email) {
  const audiences = await resendAPI('/audiences');
  const existing = audiences.data?.find((a) => a.name === CARSHAKE_AUDIENCE_NAME);
  const audienceId = existing
    ? existing.id
    : (await resendAPI('/audiences', { method: 'POST', body: JSON.stringify({ name: CARSHAKE_AUDIENCE_NAME }) })).id;
  await resendAPI(`/audiences/${audienceId}/contacts`, {
    method: 'POST',
    body: JSON.stringify({ email, unsubscribed: false }),
  });
}

// The actual lead-magnet delivery. Best-effort: a failure here doesn't
// invalidate the capture (the audience add above already durably recorded
// the lead), but is worth its own log line since a submitter getting no
// email at all is a real, visible failure to them.
async function sendChecklist(email) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'CarShake <playbook@carshake.online>',
      to: email,
      subject: '✓ Your Valet Damage Playbook + dispute scripts',
      html: CHECKLIST_HTML,
    }),
  });
  if (!resp.ok) throw new Error(`Resend ${resp.status}: ${await resp.text()}`);
}

// Best-effort owner notification — never throws, never blocks the response
// to the submitter. `stored` records which path actually persisted the
// lead (or null) so the owner can tell a real capture from an
// analytics-only fallback at a glance.
async function notifyOwner(email, source, signupSource, stored, checklistSent) {
  if (!RESEND_API_KEY) return;
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CarShake Leads <leads@carshake.online>',
        to: OWNER_EMAIL,
        subject: `New CarShake lead: ${email}`,
        html: `<p><strong>${email}</strong> just signed up on carshake.online.</p>
<ul>
<li>Source: ${source}</li>
<li>Signup source: ${signupSource}</li>
<li>Stored via: ${stored || 'none (all storage failed)'}</li>
<li>Checklist sent: ${checklistSent ? 'yes' : 'no'}</li>
<li>Time: ${new Date().toISOString()}</li>
</ul>`,
      }),
    });
    if (!resp.ok) {
      console.error(`[EmailCapture] owner notification failed: HTTP ${resp.status}`);
    }
  } catch (e) {
    console.error('[EmailCapture] owner notification failed:', e.message);
  }
}

// Simple in-memory rate limiter
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per window

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

function maskEmail(email) {
  const [local, domain] = String(email).split('@');
  return `${(local || '').slice(0, 2)}***@${domain || ''}`;
}

export default async function handler(req, res) {
  // CORS headers — same-origin only (was wildcard)
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Rate limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  try {
    const { email, source, signup_source, website } = req.body || {};

    // Honeypot: real forms never fill the "website" field
    if (website) {
      res.status(200).json({ success: true });
      return;
    }

    // Input validation
    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      res.status(400).json({ error: 'Valid email required' });
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedSource = typeof source === 'string' ? source.slice(0, 100) : 'website';
    const sanitizedSignupSource = typeof signup_source === 'string' ? signup_source.slice(0, 100) : 'carshake_seo';

    let stored = null;

    // Primary store: Resend "CarShake" audience — see file header.
    if (RESEND_API_KEY) {
      try {
        await addToCarShakeAudience(sanitizedEmail);
        stored = 'resend_audience';
      } catch (e) {
        console.error('[EmailCapture] Resend audience add failed:', e.message);
      }
    } else {
      console.error('[EmailCapture][CONFIG] RESEND_API_KEY is not set — audience storage skipped');
    }

    // Deliver the actual lead magnet. Independent of the storage outcome
    // above — a submitter should get their checklist even if the audience
    // write failed, and vice versa.
    let checklistSent = false;
    if (RESEND_API_KEY) {
      try {
        await sendChecklist(sanitizedEmail);
        checklistSent = true;
      } catch (e) {
        console.error('[EmailCapture] checklist send failed:', e.message);
      }
    }

    // PostHog: analytics only, never a storage path in its own right.
    try {
      const phRes = await fetch(`${POSTHOG_HOST}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: POSTHOG_KEY,
          event: 'email_captured',
          properties: {
            distinct_id: sanitizedEmail,
            email: sanitizedEmail,
            source: sanitizedSource,
            signup_source: sanitizedSignupSource,
            $set: { email: sanitizedEmail },
          },
        }),
      });
      if (!phRes.ok) {
        console.error(`[EmailCapture] PostHog capture failed: HTTP ${phRes.status}`);
      } else if (!stored) {
        // No durable store succeeded, but at least this is on record somewhere.
        stored = 'posthog';
      }
    } catch (phErr) {
      console.error('[EmailCapture] PostHog capture failed:', phErr.message);
    }

    if (stored) {
      await notifyOwner(sanitizedEmail, sanitizedSource, sanitizedSignupSource, stored, checklistSent);
      res.status(200).json({
        success: true,
        stored,
        email_sent: checklistSent,
      });
      return;
    }

    // Every storage path failed — still tell the owner if we can, but
    // fail loudly to the submitter instead of faking success.
    console.error(`[EmailCapture][LOST] All storage strategies failed for ${maskEmail(sanitizedEmail)} (source: ${sanitizedSource})`);
    await notifyOwner(sanitizedEmail, sanitizedSource, sanitizedSignupSource, null, checklistSent);
    res.status(502).json({
      success: false,
      error: 'Could not save your email right now. Please try again.',
      retryable: true,
    });

  } catch (error) {
    console.error('[EmailCapture][LOST] Unhandled error:', error.message);
    // Never expose internal errors to the client
    res.status(502).json({
      success: false,
      error: 'Could not save your email right now. Please try again.',
      retryable: true,
    });
  }
}
