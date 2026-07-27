// GET /api/auth/google — start the Google OAuth flow.
//
// Generates PKCE + state, stashes them in a short-lived __Host-cs_oauth cookie,
// then 302s to Google's authorization endpoint. The callback
// (/api/auth/google-callback) verifies state + PKCE on return to stop CSRF and
// auth-code-injection attacks.
//
// PKCE (RFC 7636) is used even though this is a "server-side" client secret flow
// — defence in depth: the secret lives in Vercel env, but PKCE means a stolen
// code alone can't be redeemed.

import { generatePkce, randomState, setOAuthCookie, requireEnv } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const clientId = requireEnv('GOOGLE_CLIENT_ID');
  const origin = req.headers.origin || req.headers.referer || 'https://carshake.online';
  // The redirect URI Google sends the user back to (our own callback).
  const callbackUrl = `${new URL(origin).origin}/api/auth/google-callback`;

  const { verifier, challenge } = generatePkce();
  const state = randomState();

  // Pack state + verifier into the cookie so the callback can re-read them
  // without trusting the URL query alone.
  setOAuthCookie(res, `${state}.${verifier}`);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    // prompt: 'select_account' lets a signed-in user pick which Google account.
    prompt: 'select_account',
  });

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
