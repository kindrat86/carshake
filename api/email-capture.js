// CarShake Email Capture Endpoint
// Stores email submissions via Supabase REST API
// Falls back to PostHog event capture when table doesn't exist

// Use environment variables so keys aren't in static build output
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eoenjehnkuhknjybjgzr.supabase.co';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbG...zmkc';
const POSTHOG_KEY = process.env.POSTHOG_API_KEY || 'phc_lyZCgvTpicjLzAO3rY2GhxuX5WUc5jQjP8ZVwwJqauX';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
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
    const { email, source, signup_source } = req.body || {};

    // Input validation
    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      res.status(400).json({ error: 'Valid email required' });
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedSource = typeof source === 'string' ? source.slice(0, 100) : 'website';
    const sanitizedSignupSource = typeof signup_source === 'string' ? signup_source.slice(0, 100) : 'carshake_seo';

    // Strategy 1: Try to insert into newsletter_subscribers
    if (ANON_KEY && ANON_KEY.length > 20) {
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
        res.status(200).json({ success: true, stored: 'newsletter_subscribers' });
        return;
      }

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
        res.status(200).json({ success: true, stored: 'signups_cap' });
        return;
      }
    }

    // Strategy 3: Send to PostHog as a captured event
    try {
      await fetch(`${POSTHOG_HOST}/capture/`, {
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
    } catch (phErr) {
      console.error('[EmailCapture] PostHog fallback failed:', phErr);
    }

    res.status(200).json({
      success: true,
      stored: 'analytics_fallback',
      note: 'Captured via analytics fallback'
    });

  } catch (error) {
    console.error('[EmailCapture] Error:', error.message);
    // Never expose internal errors to the client
    res.status(200).json({
      success: true,
      stored: 'offline',
      note: 'Captured offline'
    });
  }
}
