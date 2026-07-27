// GET /api/auth/me — return the current session (or 401).
//
// The SPA calls this on load (and after /auth/callback) to bootstrap the user.
// Returns { user: { id, email, ... } } on success.

import { sessionFromReq, json } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'method not allowed' });
  }
  const session = sessionFromReq(req);
  if (!session) {
    return json(res, 401, { error: 'no_session' });
  }
  res.setHeader('Cache-Control', 'no-store');
  return json(res, 200, {
    user: {
      id: session.sub,
      email: session.email,
      name: session.name,
      picture: session.picture,
    },
  });
}
