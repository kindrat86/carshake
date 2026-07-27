// GET /api/auth/google-callback — finish Google OAuth.
//
//  1. Verify state matches the __Host-cs_oauth cookie (CSRF guard).
//  2. Redeem the authorization code for tokens (with PKCE verifier from cookie).
//  3. Verify the returned id_token (RS256 against Google JWKS; checks iss/aud/exp).
//  4. Upsert the user on the Mac mini (id = google `sub`).
//  5. Mint an HS256 session JWT in __Host-cs_session, 302 to /auth/callback.
//
// On any failure we redirect to /auth/callback?error=... so the SPA can show a
// friendly message rather than a bare Vercel error page.

import {
  readCookies,
  verifyGoogleIdToken,
  signSession,
  setSessionCookie,
  clearCookie,
  OAUTH_COOKIE,
  requireEnv,
} from './_lib.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

async function exchangeCode(code, verifier, redirectUri) {
  const params = new URLSearchParams({
    code,
    client_id: requireEnv('GOOGLE_CLIENT_ID'),
    client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: verifier,
  });
  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`token exchange failed: ${resp.status} ${txt}`);
  }
  return resp.json();
}

function fail(res, origin, reason) {
  clearCookie(res, OAUTH_COOKIE);
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, `${origin}/auth/callback?error=${encodeURIComponent(reason)}`);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const origin = (req.headers.origin || req.headers.referer || 'https://carshake.online').replace(/\/$/, '');
  const publicOrigin = new URL(origin).origin;

  const { code, state } = req.query || {};
  const cookie = readCookies(req)[OAUTH_COOKIE];

  if (!code || !state) return fail(res, publicOrigin, 'missing_code');
  if (!cookie) return fail(res, publicOrigin, 'missing_session');

  const [cookieState, verifier] = cookie.split('.');
  if (!cookieState || !verifier) return fail(res, publicOrigin, 'bad_session');
  if (cookieState !== state) return fail(res, publicOrigin, 'state_mismatch');

  try {
    const redirectUri = `${publicOrigin}/api/auth/google-callback`;
    const tokens = await exchangeCode(code, verifier, redirectUri);

    const idToken = tokens.id_token;
    if (!idToken) return fail(res, publicOrigin, 'no_id_token');

    const claims = await verifyGoogleIdToken(idToken, requireEnv('GOOGLE_CLIENT_ID'));
    if (!claims.email_verified) return fail(res, publicOrigin, 'email_not_verified');

    const userId = claims.sub;

    // Upsert the user on the Mac mini. This is a SYSTEM call (the auth callback
    // has verified the Google identity itself and is asserting it).
    const { macminiFetch } = await import('./_lib.js');
    const upsertResp = await macminiFetch('PUT', `/users/${encodeURIComponent(userId)}`, {
      body: { email: claims.email, display_name: claims.name },
      userId,
      system: true,
    });
    if (!upsertResp.ok) {
      console.error('macmini user upsert failed', upsertResp.status, await upsertResp.text().catch(() => ''));
      return fail(res, publicOrigin, 'user_store_unavailable');
    }

    // Mint the session. We store the id_token + access/refresh so Phase 2's
    // Supabase bridge can mint a Supabase session from them; after Phase 6 they
    // can be dropped.
    const sessionToken = signSession(
      {
        sub: userId,
        email: claims.email,
        name: claims.name,
        picture: claims.picture,
        google_id_token: idToken,
        google_refresh_token: tokens.refresh_token || null,
      },
      requireEnv('SESSION_SECRET')
    );

    setSessionCookie(res, sessionToken);
    clearCookie(res, OAUTH_COOKIE);
    res.setHeader('Cache-Control', 'no-store');
    res.redirect(302, `${publicOrigin}/auth/callback`);
  } catch (err) {
    console.error('google-callback error:', err?.message || err);
    return fail(res, publicOrigin, 'callback_failed');
  }
}
