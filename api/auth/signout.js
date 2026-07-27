// POST /api/auth/signout — clear the session cookie.
//
// Stateless JWT, so "logout" = delete the cookie. (A server-side blocklist can
// be added later if true revocation is required — none needed today.)

import { clearCookie, SESSION_COOKIE, json } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'method not allowed' });
  }
  clearCookie(res, SESSION_COOKIE);
  res.setHeader('Cache-Control', 'no-store');
  return json(res, 200, { ok: true });
}
