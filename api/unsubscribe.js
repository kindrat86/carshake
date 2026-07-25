// Unsubscribe endpoint for CarShake subscribers.
//
//   GET  /api/unsubscribe?email=X          -> confirmation page with a POST button
//   GET  /api/unsubscribe?email=X&t=<sig>  -> unsubscribes immediately (one-click)
//   POST /api/unsubscribe  (email in query or body) -> unsubscribes
//
// Requires RESEND_API_KEY in Vercel project env. UNSUB_SECRET is optional and
// only enables the signed one-click GET form.
//
// Why a bare GET no longer mutates state (changed 2026-07-25):
//   The previous version unsubscribed on any GET, for any address, and always
//   rendered "you have been unsubscribed" regardless of what Resend said. Two
//   consequences: anyone could unsubscribe any address they could guess, and
//   mail-security link scanners and prefetchers were silently unsubscribing
//   real recipients who never clicked. Verified live before the fix.
//   Links already sent carry no token, so requiring one would strand real
//   recipients with no way to opt out — worse than the bug. Hence: unsigned GET
//   degrades to a one-click confirmation POST; signed GET and POST act directly,
//   so RFC 8058 one-click still works.

import { createHmac, timingSafeEqual } from 'node:crypto';

const CARSHAKE_AUDIENCE_ID = 'cedf7681-c414-4b22-9421-db2946f9b882';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sign(email, secret) {
  return createHmac('sha256', secret)
    .update(email.trim().toLowerCase()).digest('base64url').slice(0, 32);
}

function validToken(email, token, secret) {
  if (!secret || !token) return false;
  const a = Buffer.from(sign(email, secret));
  const b = Buffer.from(String(token));
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  // HEAD must be allowed wherever GET is — scanners HEAD the links in a message,
  // and a 405 makes them report the unsubscribe link as broken. Never mutates.
  const isHead = req.method === 'HEAD';
  if (req.method !== 'GET' && req.method !== 'POST' && !isHead) {
    res.setHeader('Allow', 'GET, HEAD, POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  const email = String(req.query?.email ?? req.body?.email ?? '').trim();
  const token = String(req.query?.t ?? req.body?.t ?? '').trim();

  if (!email) return sendPage(res, 'error', 'This unsubscribe link is missing an email address.');
  if (!EMAIL_RE.test(email)) return sendPage(res, 'error', 'That does not look like a valid email address.');

  const signed = validToken(email, token, process.env.UNSUB_SECRET);
  if (isHead || (req.method === 'GET' && !signed)) return confirmPage(res, email);

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return sendPage(res, 'error',
      'The unsubscribe service is temporarily unavailable. Email support@carshake.online and we will remove you by hand.');
  }

  let ok = false;
  try {
    const resp = await fetch(
      `https://api.resend.com/audiences/${CARSHAKE_AUDIENCE_ID}/contacts/${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ unsubscribed: true }),
      }
    );
    // 404 = not on this audience. Treat as success: the outcome asked for already
    // holds, and saying so avoids confirming who is on the list.
    ok = resp.ok || resp.status === 404;
    if (!ok) console.error('Unsubscribe PATCH failed', resp.status, await resp.text());
  } catch (err) {
    console.error('Unsubscribe PATCH threw', err?.message);
  }

  return ok
    ? sendPage(res, 'ok', email)
    : sendPage(res, 'error',
        'We could not complete that just now. Email support@carshake.online and we will remove you by hand.');
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function shell(title, icon, heading, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title} — CarShake</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #FAFAF8;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 24px;
  }
  .card {
    background: #fff;
    border: 1px solid #E4E4E7;
    border-radius: 16px;
    padding: 48px 40px;
    max-width: 480px;
    width: 100%;
    text-align: center;
  }
  .check {
    width: 64px; height: 64px;
    background: rgba(201,162,55,.12);
    border-radius: 50%;
    display: inline-flex;
    align-items: center; justify-content: center;
    font-size: 28px;
    color: #C9A237;
    margin-bottom: 20px;
  }
  h1 { font-size: 22px; color: #1F1F23; margin-bottom: 8px; }
  p { font-size: 15px; color: #6B6B70; line-height: 1.6; }
  p + p { margin-top: 12px; }
  .email { font-weight: 600; color: #1F1F23; }
  button {
    margin-top: 24px; width: 100%; padding: 14px 20px; font: inherit; font-weight: 600;
    color: #1F1F23; background: #C9A237; border: 0; border-radius: 10px; cursor: pointer;
  }
  button:hover { filter: brightness(.95); }
  .footer { margin-top: 24px; font-size: 12px; color: #9CA3AF; }
  a { color: #C9A237; text-decoration: none; }
</style>
</head>
<body>
<div class="card">
  <div class="check">${icon}</div>
  <h1>${heading}</h1>
  ${bodyHtml}
  <p class="footer"><a href="https://carshake.online">carshake.online</a></p>
</div>
</body>
</html>`;
}

function send(res, html) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}

/** Explicit confirmation for unsigned GETs — still one click, but a human's. */
function confirmPage(res, email) {
  return send(res, shell('Confirm unsubscribe', '&#9993;', 'Confirm you want to unsubscribe',
    `<p>Click below and <span class="email">${esc(email)}</span> will stop receiving CarShake emails.</p>
  <form method="POST" action="/api/unsubscribe">
    <input type="hidden" name="email" value="${esc(email)}">
    <button type="submit">Unsubscribe me</button>
  </form>`));
}

function sendPage(res, kind, detail) {
  if (kind === 'ok') {
    return send(res, shell('Unsubscribed', '&#10003;', 'You have been unsubscribed',
      `<p><span class="email">${esc(detail)}</span> will no longer receive CarShake emails.</p>`));
  }
  return send(res, shell('Unsubscribe', '&#9888;', 'We hit a problem', `<p>${esc(detail)}</p>`));
}
