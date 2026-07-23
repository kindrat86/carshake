// CarShake Email Capture Endpoint
// Stores email submissions via Supabase REST API
// Falls back to PostHog event capture when table doesn't exist
// Also sends a real-time owner notification via Resend (there is no
// Supabase project behind this in practice — see RESEND_API_KEY below —
// the notification email is the actual way leads get seen day to day).

// Use environment variables so keys aren't in static build output.
// SUPABASE_ANON_KEY intentionally has NO fallback: a missing env var must
// fail loudly instead of silently skipping Supabase storage.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eoenjehnkuhknjybjgzr.supabase.co';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const POSTHOG_KEY = process.env.POSTHOG_API_KEY || 'phc_lyZCgvTpicjLzAO3rY2GhxuX5WUc5jQjP8ZVwwJqauX';
const POSTHOG_HOST = 'https://eu.i.posthog.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const OWNER_EMAIL = 'sales@sipiteno.com';

const ALLOWED_ORIGINS = ['https://carshake.online', 'https://www.carshake.online'];

// Best-effort owner notification — never throws, never blocks the response
// to the submitter. `stored` records which path actually persisted the
// lead (or null) so the owner can tell a real capture from an
// analytics-only fallback at a glance.
async function notifyOwner(email, source, signupSource, stored) {
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

    if (!ANON_KEY || ANON_KEY.length <= 20) {
      console.error('[EmailCapture][CONFIG] SUPABASE_ANON_KEY is missing or invalid in the Vercel env — Supabase storage skipped for every request');
    } else {
      // Strategy 1: Try to insert into newsletter_subscribers
      const sbRes1 = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          source: sanitizedSource,
          signup_source: sanitizedSignupSource
        })
      });

      if (sbRes1.ok || sbRes1.status === 201) {
        console.log(`[EmailCapture] Stored in newsletter_subscribers: ${sanitizedEmail}`);
        await notifyOwner(sanitizedEmail, sanitizedSource, sanitizedSignupSource, 'newsletter_subscribers');
        res.status(200).json({ success: true, stored: 'newsletter_subscribers' });
        return;
      }
      console.error(`[EmailCapture] newsletter_subscribers insert failed: HTTP ${sbRes1.status}`);

      // Strategy 2: Try signups_cap table
      const sbRes2 = await fetch(`${SUPABASE_URL}/rest/v1/signups_cap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          source: sanitizedSource,
          signup_source: sanitizedSignupSource
        })
      });

      if (sbRes2.ok || sbRes2.status === 201) {
        await notifyOwner(sanitizedEmail, sanitizedSource, sanitizedSignupSource, 'signups_cap');
        res.status(200).json({ success: true, stored: 'signups_cap' });
        return;
      }
      console.error(`[EmailCapture] signups_cap insert failed: HTTP ${sbRes2.status}`);
    }

    // Strategy 3: Send to PostHog as a captured event
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
            $set: { email: sanitizedEmail }
          }
        })
      });
      if (phRes.ok) {
        stored = 'analytics_fallback';
      } else {
        console.error(`[EmailCapture] PostHog fallback failed: HTTP ${phRes.status}`);
      }
    } catch (phErr) {
      console.error('[EmailCapture] PostHog fallback failed:', phErr);
    }

    if (stored) {
      await notifyOwner(sanitizedEmail, sanitizedSource, sanitizedSignupSource, stored);
      res.status(200).json({
        success: true,
        stored,
        note: 'Captured via analytics fallback'
      });
      return;
    }

    // Every storage path failed — still tell the owner if we can, but
    // fail loudly to the submitter instead of faking success.
    console.error(`[EmailCapture][LOST] All storage strategies failed for ${maskEmail(sanitizedEmail)} (source: ${sanitizedSource})`);
    await notifyOwner(sanitizedEmail, sanitizedSource, sanitizedSignupSource, null);
    res.status(502).json({
      success: false,
      error: 'Could not save your email right now. Please try again.',
      retryable: true
    });

  } catch (error) {
    console.error('[EmailCapture][LOST] Unhandled error:', error.message);
    // Never expose internal errors to the client
    res.status(502).json({
      success: false,
      error: 'Could not save your email right now. Please try again.',
      retryable: true
    });
  }
}
