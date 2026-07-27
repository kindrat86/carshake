// Shared helpers for the CarShake auth functions.
//
// Zero dependencies — Node built-ins only (crypto, fetch). This file is not a
// route (Vercel ignores api/ files/folders prefixed with _).
//
// Trust model: the browser carries an httpOnly session cookie (HS256 JWT signed
// with SESSION_SECRET). The Vercel functions verify that cookie to learn the
// acting user id, then proxy data calls to the Mac mini over an HMAC-signed
// channel (MACMINI_API_SECRET). The Mac mini trusts X-CS-User-Id only because
// the request carried a valid X-CS-Sig.

import { createHmac, randomBytes, createVerify, timingSafeEqual, createHash, createPublicKey } from 'node:crypto';

export const SESSION_COOKIE = '__Host-cs_session';
export const OAUTH_COOKIE = '__Host-cs_oauth';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// ── Session JWT (HS256) ────────────────────────────────────────────────
// Compact, dependency-free JWT. The session is stateless: verifying the
// signature is sufficient to trust { sub, email }. Revocation is by short TTL
// + a future blocklist if needed (none required today).

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlDecode = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

function b64urlJson(obj) {
  return b64url(JSON.stringify(obj));
}

export function signSession(payload, secret) {
  const header = b64urlJson({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const body = b64urlJson({ ...payload, iat: now, exp: now + SESSION_TTL_SECONDS });
  const data = `${header}.${body}`;
  const sig = createHmac('sha256', secret).update(data).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${data}.${sig}`;
}

/**
 * Verify a session JWT. Returns the payload or null (never throws — a bad token
 * is the same as no token).
 */
export function verifySession(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let payload;
  try {
    payload = JSON.parse(b64urlDecode(body).toString('utf8'));
  } catch {
    return null;
  }
  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

// ── Session cookie read/write ──────────────────────────────────────────

/** Serialize a Set-Cookie value string (Vercel's res.setHeader supports arrays). */
function cookieString(name, value, maxAgeSeconds) {
  const attrs = [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  return attrs.join('; ');
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', cookieString(SESSION_COOKIE, token, SESSION_TTL_SECONDS));
}

export function setOAuthCookie(res, value) {
  // Short-lived: only needs to survive the redirect to Google and back.
  res.setHeader('Set-Cookie', cookieString(OAUTH_COOKIE, value, 600)); // 10 min
}

export function clearCookie(res, name) {
  res.setHeader('Set-Cookie', cookieString(name, '', 0));
}

/** Parse all cookies from the Cookie request header into an object. */
export function readCookies(req) {
  const header = req.headers?.cookie || '';
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

/** Verify the session cookie on a request. Returns payload or null. */
export function sessionFromReq(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const token = readCookies(req)[SESSION_COOKIE];
  return verifySession(token, secret);
}

// ── PKCE + state ───────────────────────────────────────────────────────

export function generatePkce() {
  // Google accepts 43-128 char base64url verifier. 32 random bytes -> 43 chars.
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

export function randomState() {
  return b64url(randomBytes(16));
}

// ── Google ID token verification (RS256 against JWKS) ──────────────────
// We verify the signature properly (not just decode) so a forged token can't
// impersonate a user. JWKS is cached in-process for 1h (Vercel reuses warm
// instances). On a cold start the first verification pays one network round-trip.

let jwksCache = null; // { keys, fetchedAt }

async function getGoogleJwks() {
  const now = Date.now();
  if (jwksCache && now - jwksCache.fetchedAt < 60 * 60 * 1000) return jwksCache.keys;
  const resp = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!resp.ok) throw new Error(`JWKS fetch failed: ${resp.status}`);
  const json = await resp.json();
  jwksCache = { keys: json.keys, fetchedAt: now };
  return json.keys;
}

function findJwk(keys, kid) {
  return keys.find((k) => k.kid === kid && k.use === 'sig' && k.alg === 'RS256');
}

function jwkToPem(jwk) {
  // Minimal RSA public-key (n,e) -> KeyObject, no dependency.
  return createPublicKey({ key: jwk, format: 'jwk' });
}

/**
 * Verify a Google ID token. Returns the payload { sub, email, email_verified,
 * name, picture } or throws. Validates signature, iss, aud, exp.
 */
export async function verifyGoogleIdToken(idToken, expectedClientId) {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('malformed id_token');
  const [headerB, bodyB, sigB] = parts;
  const header = JSON.parse(b64urlDecode(headerB).toString('utf8'));
  const payload = JSON.parse(b64urlDecode(bodyB).toString('utf8'));

  // Expiry / issued-at
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp < now) throw new Error('id_token expired');
  if (typeof payload.iat !== 'number' || payload.iat > now + 60) throw new Error('id_token iat in future');

  // Issuer
  const iss = payload.iss;
  if (iss !== 'https://accounts.google.com' && iss !== 'accounts.google.com') {
    throw new Error(`bad iss: ${iss}`);
  }
  // Audience — must be our client id (also tolerate an array)
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(expectedClientId)) throw new Error(`bad aud: ${payload.aud}`);

  // Signature against JWKS
  const keys = await getGoogleJwks();
  const jwk = findJwk(keys, header.kid);
  if (!jwk) throw new Error(`no key for kid ${header.kid}`);
  const keyObj = jwkToPem(jwk);
  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${headerB}.${bodyB}`);
  const ok = verifier.verify(
    { key: keyObj },
    Buffer.from(sigB.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
  );
  if (!ok) throw new Error('invalid id_token signature');

  return payload;
}

// ── Mac mini proxy (HMAC-signed) ───────────────────────────────────────

export function macminiSign(bodyStr) {
  return createHmac('sha256', process.env.MACMINI_API_SECRET).update(bodyStr).digest('hex');
}

/**
 * Call the Mac mini listener with an HMAC signature. `userId` becomes
 * X-CS-User-Id; `system: true` sets X-CS-System (service authority — needed for
 * upserts / billing writes). Returns the fetch Response.
 */
export async function macminiFetch(method, path, { body, userId, system = false } = {}) {
  const url = process.env.MACMINI_API_URL.replace(/\/$/, '') + path;
  const bodyStr = body !== undefined ? JSON.stringify(body) : '';
  const headers = {
    'Content-Type': 'application/json',
    'X-CS-Sig': macminiSign(bodyStr),
  };
  if (userId) headers['X-CS-User-Id'] = userId;
  if (system) headers['X-CS-System'] = '1';
  return fetch(url, { method, headers, body: bodyStr || undefined });
}

// ── Misc ───────────────────────────────────────────────────────────────

export function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

/** JSON helper matching the existing api/ style (res.status(n).json(...)). */
export function json(res, status, data) {
  res.status(status).json(data);
}
