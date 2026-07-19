// Vercel serverless function — email capture for CarShake
// Captures lead and sends the Playbook via Resend.

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

const RL_LIMIT = 5;
const RL_WINDOW_SECONDS = 3600;
const memHits = new Map();

function memRateLimited(ip) {
  const now = Date.now();
  const entry = memHits.get(ip);
  if (!entry || now > entry.reset) {
    if (memHits.size > 5000) memHits.clear();
    memHits.set(ip, { count: 1, reset: now + RL_WINDOW_SECONDS * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > RL_LIMIT;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || 'unknown';

  try {
    const limited = memRateLimited(ip);
    if (limited) {
      return res.status(429).json({ ok: false, error: 'Too many requests, try again later' });
    }
  } catch (e) {
    console.error('Rate-limit check failed (failing open):', e.message);
  }

  const honeypot = ((req.body?.website || req.body?.company || '')).toString().trim();
  if (honeypot) {
    return res.status(200).json({ ok: true, message: 'Subscribed successfully', email_sent: true });
  }

  const email = (req.body?.email || '').toString().trim().toLowerCase();
  const source = (req.body?.source || 'unknown').toString().slice(0, 64);

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Valid email required' });
  }

  console.log(JSON.stringify({
    event: 'email_capture',
    email: email.replace(/^(..).*(@.*)$/, '$1***$2'),
    source,
    timestamp: new Date().toISOString()
  }));

  let email_sent = false;
  if (process.env.RESEND_API_KEY) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'CarShake <playbook@carshake.online>',
          to: email,
          subject: '✓ Your Valet Damage Playbook + dispute scripts',
          html: CHECKLIST_HTML
        })
      });
      if (resp.ok) {
        email_sent = true;
      } else {
        console.error('Resend error:', await resp.text());
      }
    } catch (e) {
      console.error('Resend send failed:', e.message);
    }
  }

  return res.status(200).json({ ok: true, message: 'Subscribed successfully', email_sent });
}
