const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const KIT_LINK = 'plink_1UA9cyCwGoUDklRezKVZTA7W';
const SESSION_ID = 'cs_live_verified_fixture';
const FOREIGN_GITDEALFLOW_SESSION = 'cs_live_foreign_gitdealflow_fixture';
const FOREIGN_GITDEALFLOW_LINK = 'plink_foreign_gitdealflow_fixture';
const FOREIGN_GITDEALFLOW_PRODUCT = 'prod_foreign_gitdealflow_fixture';
const FOREIGN_GITDEALFLOW_PRICE = 'price_foreign_gitdealflow_fixture';
const TIMESTAMP = '1788297600';
const WEBHOOK_SECRET = 'whsec_fixture';
const LEGACY_ASSET_PATHS = [
  'kit/c68af68983ea215fbce16e3d04b4a914/time-stamp-defense-checklist.pdf',
  'kit/c68af68983ea215fbce16e3d04b4a914/rental-car-damage-prevention.pdf',
  'kit/c68af68983ea215fbce16e3d04b4a914/dispute-script-pack.pdf',
  'kit/c68af68983ea215fbce16e3d04b4a914/dispute-script-pack.md',
];

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {},
    body: Buffer.alloc(0),
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    json(value) { this.body = Buffer.from(JSON.stringify(value)); return this; },
    send(value = '') { this.body = Buffer.isBuffer(value) ? value : Buffer.from(String(value)); return this; },
    end(value = '') { this.body = Buffer.isBuffer(value) ? value : Buffer.from(String(value)); return this; },
  };
}

function jsonBody(res) {
  return JSON.parse(res.body.toString('utf8'));
}

function paidSession(overrides = {}) {
  return {
    id: SESSION_ID,
    livemode: true,
    payment_status: 'paid',
    status: 'complete',
    payment_link: KIT_LINK,
    amount_total: 700,
    currency: 'usd',
    customer_details: { email: 'buyer@example.com' },
    metadata: {},
    ...overrides,
  };
}

function signedWebhookRequest(event) {
  const payload = JSON.stringify(event);
  const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(`${TIMESTAMP}.${payload}`).digest('hex');
  return {
    req: { method: 'POST', headers: { 'stripe-signature': `t=${TIMESTAMP},v1=${signature}` } },
    readRawBody: async () => Buffer.from(payload),
  };
}

test('session API returns only authenticated serverless download URLs', async () => {
  const { createKitSessionHandler } = require('../api/kit-session');
  const handler = createKitSessionHandler({ stripeRequest: async () => paidSession() });
  const res = responseRecorder();
  await handler({ method: 'GET', query: { session_id: SESSION_ID } }, res);

  assert.equal(res.statusCode, 200);
  const body = jsonBody(res);
  assert.equal(body.ready, true);
  assert.equal(body.assets.length, 4);
  for (const asset of body.assets) {
    const url = new URL(asset.url, 'https://carshake.online');
    assert.equal(url.pathname, '/api/kit-download');
    assert.equal(url.searchParams.get('session_id'), SESSION_ID);
    assert.match(url.searchParams.get('asset'), /^[a-z0-9-]+$/);
    assert.doesNotMatch(asset.url, /\/kit\/|c68af68983ea215fbce16e3d04b4a914/);
  }
});

test('session API rejects spoofed, unpaid, incomplete, test-mode, or wrong-link sessions', async () => {
  const { createKitSessionHandler } = require('../api/kit-session');
  for (const session of [
    paidSession({ payment_status: 'unpaid' }),
    paidSession({ status: 'open' }),
    paidSession({ livemode: false }),
    paidSession({ payment_link: 'plink_wrong' }),
    paidSession({ amount_total: 699 }),
    paidSession({ currency: 'eur' }),
  ]) {
    const handler = createKitSessionHandler({ stripeRequest: async () => session });
    const res = responseRecorder();
    await handler({ method: 'GET', query: { session_id: SESSION_ID } }, res);
    assert.equal(res.statusCode, 403);
    assert.equal(jsonBody(res).ready, false);
  }
});

test('session API denies missing and synthetic test session IDs before Stripe lookup', async () => {
  const { createKitSessionHandler } = require('../api/kit-session');
  let lookups = 0;
  const handler = createKitSessionHandler({ stripeRequest: async () => { lookups++; return paidSession(); } });
  for (const session_id of ['', 'cs_test_fixture', 'not-a-session']) {
    const res = responseRecorder();
    await handler({ method: 'GET', query: { session_id } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(jsonBody(res).ready, false);
  }
  assert.equal(lookups, 0);
});

test('download handler validates the exact session on every request and serves an allowlisted asset safely', async () => {
  const { createKitDownloadHandler } = require('../api/kit-download');
  let lookups = 0;
  const file = Buffer.from('%PDF-private-fixture');
  const handler = createKitDownloadHandler({
    stripeRequest: async () => { lookups++; return paidSession(); },
    readAsset: async (asset) => {
      assert.equal(asset.key, 'time-stamp-defense-checklist');
      return file;
    },
  });
  const res = responseRecorder();
  await handler({ method: 'GET', query: { session_id: SESSION_ID, asset: 'time-stamp-defense-checklist' } }, res);

  assert.equal(lookups, 1);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, file);
  assert.equal(res.headers['content-type'], 'application/pdf');
  assert.equal(res.headers['content-disposition'], 'attachment; filename="carshake-time-stamp-defense-checklist.pdf"');
  assert.equal(res.headers['cache-control'], 'private, no-store, max-age=0');
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-robots-tag'], 'noindex, nofollow, noarchive');
  assert.equal(res.headers['content-security-policy'], "default-src 'none'; sandbox");
});

test('download handler rejects unknown asset keys before Stripe lookup', async () => {
  const { createKitDownloadHandler } = require('../api/kit-download');
  let lookups = 0;
  const handler = createKitDownloadHandler({ stripeRequest: async () => { lookups++; return paidSession(); } });
  for (const asset of ['', '../secret', 'time-stamp-defense-checklist.pdf', 'unknown']) {
    const res = responseRecorder();
    await handler({ method: 'GET', query: { session_id: SESSION_ID, asset } }, res);
    assert.equal(res.statusCode, 404);
  }
  assert.equal(lookups, 0);
});

test('download handler denies unpaid and invalid sessions without reading an asset', async () => {
  const { createKitDownloadHandler } = require('../api/kit-download');
  let reads = 0;
  for (const scenario of [
    { session_id: '', session: paidSession(), expected: 400 },
    { session_id: 'cs_test_fixture', session: paidSession(), expected: 400 },
    { session_id: SESSION_ID, session: paidSession({ payment_status: 'unpaid' }), expected: 403 },
    { session_id: SESSION_ID, session: paidSession({ payment_link: 'plink_wrong' }), expected: 403 },
  ]) {
    const handler = createKitDownloadHandler({
      stripeRequest: async () => scenario.session,
      readAsset: async () => { reads++; return Buffer.from('forbidden'); },
    });
    const res = responseRecorder();
    await handler({ method: 'GET', query: { session_id: scenario.session_id, asset: 'dispute-script-pack' } }, res);
    assert.equal(res.statusCode, scenario.expected);
  }
  assert.equal(reads, 0);
});

test('private fulfillment assets are absent from every static public path', () => {
  const root = path.resolve(__dirname, '..');
  for (const relativePath of LEGACY_ASSET_PATHS) {
    assert.equal(fs.existsSync(path.join(root, relativePath)), false, `${relativePath} must not be a static file`);
  }
  const source = fs.readFileSync(require.resolve('../api/kit-session'), 'utf8');
  assert.doesNotMatch(source, /c68af68983ea215fbce16e3d04b4a914|\/kit\//);
  assert.equal(fs.existsSync(path.join(root, 'kit-thanks.html')), false, 'thanks page must not collide with its private function route');
});

test('thank-you page fetches verified authenticated URLs and contains no static delivery URLs', () => {
  const { defaultReadHtml } = require('../api/kit-thanks');
  const html = defaultReadHtml();
  assert.match(html, /\/api\/kit-session\?session_id=/);
  assert.doesNotMatch(html, /\/kit\/|c68af68983ea215fbce16e3d04b4a914/);
});

test('thank-you page scrubs its Stripe bearer credential before any request and loads no analytics', () => {
  const { defaultReadHtml } = require('../api/kit-thanks');
  const html = defaultReadHtml();
  const readSessionAt = html.indexOf("var session=new URLSearchParams(location.search).get('session_id')");
  const scrubAt = html.indexOf("history.replaceState(null,'','/kit-thanks')");
  const fetchAt = html.indexOf("fetch('/api/kit-session?session_id='");
  assert.ok(readSessionAt >= 0 && scrubAt > readSessionAt && scrubAt < fetchAt);
  assert.doesNotMatch(html, /posthog|eu-assets\.i\.posthog|tripwire_purchase_verified/i);
});

test('thank-you page is private and never cacheable in Vercel routing', () => {
  const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'vercel.json'), 'utf8'));
  const rule = config.headers.find((entry) => entry.source === '/kit-thanks');
  assert.ok(rule, 'vercel.json must define an exact /kit-thanks header rule');
  const headers = Object.fromEntries(rule.headers.map((entry) => [entry.key.toLowerCase(), entry.value]));
  const publicCatchAllAt = config.headers.findIndex(
    (entry) => entry.source === '/(.*)' && entry.headers.some(
      (header) => header.key.toLowerCase() === 'cache-control' && header.value.startsWith('public'),
    ),
  );
  assert.ok(config.headers.indexOf(rule) < publicCatchAllAt, 'private thanks rule must run before public catch-all');
  assert.match(headers['cache-control'] || '', /private/);
  assert.match(headers['cache-control'] || '', /no-store/);
  assert.equal(headers['referrer-policy'], 'no-referrer');
  assert.ok(config.rewrites.some(
    (entry) => entry.source === '/kit-thanks' && entry.destination === '/api/kit-thanks',
  ));
  assert.equal(config.functions['api/kit-thanks.js'].includeFiles, undefined);
});

test('thank-you serverless handler owns private transport headers and serves the scrubbed HTML', async () => {
  const { createKitThanksHandler } = require('../api/kit-thanks');
  const html = '<!doctype html><script>history.replaceState(null,\"\",\"/kit-thanks\")</script>';
  const handler = createKitThanksHandler({ readHtml: () => html });
  const res = responseRecorder();
  await handler({ method: 'GET' }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
  assert.equal(res.headers['cache-control'], 'private, no-store, max-age=0');
  assert.equal(res.headers['referrer-policy'], 'no-referrer');
  assert.equal(res.headers['x-robots-tag'], 'noindex, nofollow, noarchive');
  assert.equal(res.body.toString('utf8'), html);

  const denied = responseRecorder();
  await handler({ method: 'POST' }, denied);
  assert.equal(denied.statusCode, 405);
});

test('fulfillment email uses authenticated links, deterministic provider idempotency, and required Bcc', async () => {
  const { createFulfillmentEmailSender } = require('../api/stripe-webhook');
  const requests = [];
  const send = createFulfillmentEmailSender({
    apiKey: 're_fixture',
    fetchImpl: async (url, options) => {
      requests.push({ url, options, body: JSON.parse(options.body) });
      return { ok: true, json: async () => ({ id: 'email_fixture' }) };
    },
  });
  await send(paidSession());

  assert.equal(requests.length, 1);
  const request = requests[0];
  assert.equal(request.url, 'https://api.resend.com/emails');
  assert.equal(request.options.headers['Idempotency-Key'], `carshake-kit-${SESSION_ID}`);
  assert.equal(request.body.bcc, 'sales@sipiteno.com');
  assert.equal(request.body.to, 'buyer@example.com');
  assert.doesNotMatch(request.body.html, /\/kit\/|c68af68983ea215fbce16e3d04b4a914/);
  for (const key of ['time-stamp-defense-checklist', 'rental-car-damage-prevention', 'dispute-script-pack', 'editable-dispute-script-pack']) {
    assert.match(request.body.html, new RegExp(`https://carshake\\.online/api/kit-download\\?[^\"]*asset=${key}[^\"]*session_id=${SESSION_ID}|https://carshake\\.online/api/kit-download\\?[^\"]*session_id=${SESSION_ID}[^\"]*asset=${key}`));
  }
});

test('concurrent webhook retries produce one provider delivery via deterministic idempotency', async () => {
  const { createStripeWebhookHandler, createFulfillmentEmailSender } = require('../api/stripe-webhook');
  const event = { id: 'evt_fixture', livemode: true, type: 'checkout.session.completed', data: { object: paidSession() } };
  const { req, readRawBody } = signedWebhookRequest(event);
  const providerKeys = new Set();
  let providerAttempts = 0;
  let providerDeliveries = 0;
  const sendFulfillmentEmail = createFulfillmentEmailSender({
    apiKey: 're_fixture',
    fetchImpl: async (_url, options) => {
      providerAttempts++;
      await new Promise((resolve) => setTimeout(resolve, 10));
      const key = options.headers['Idempotency-Key'];
      if (!providerKeys.has(key)) { providerKeys.add(key); providerDeliveries++; }
      return { ok: true, json: async () => ({ id: 'email_fixture' }) };
    },
  });
  const stripeRequest = async (_path, options) => options
    ? paidSession({ metadata: { kit_fulfillment_email_id: 'email_fixture' } })
    : paidSession();
  const handler = createStripeWebhookHandler({
    webhookSecret: WEBHOOK_SECRET,
    nowSeconds: () => Number(TIMESTAMP),
    readRawBody,
    stripeRequest,
    sendFulfillmentEmail,
  });
  const responses = [responseRecorder(), responseRecorder()];
  await Promise.all(responses.map((res) => handler(req, res)));

  assert.ok(responses.every((res) => res.statusCode === 200 && jsonBody(res).fulfilled === true));
  assert.equal(providerAttempts, 2);
  assert.equal(providerDeliveries, 1);
  assert.deepEqual([...providerKeys], [`carshake-kit-${SESSION_ID}`]);
});

test('webhook persists a durable claim before calling the email provider', async () => {
  const { createStripeWebhookHandler } = require('../api/stripe-webhook');
  const event = { id: 'evt_fixture', livemode: true, type: 'checkout.session.completed', data: { object: paidSession() } };
  const { req, readRawBody } = signedWebhookRequest(event);
  const calls = [];
  const handler = createStripeWebhookHandler({
    webhookSecret: WEBHOOK_SECRET,
    nowSeconds: () => Number(TIMESTAMP),
    readRawBody,
    stripeRequest: async (_stripePath, options) => {
      if (!options) { calls.push(['stripe-get']); return paidSession(); }
      const params = new URLSearchParams(options.body);
      calls.push(['stripe-update', Object.fromEntries(params)]);
      return paidSession();
    },
    sendFulfillmentEmail: async () => { calls.push(['email']); return { id: 'email_fixture' }; },
  });
  const res = responseRecorder();
  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(calls.map((call) => call[0]), ['stripe-get', 'stripe-update', 'email', 'stripe-update']);
  assert.equal(calls[1][1]['metadata[kit_fulfillment_event_id]'], 'evt_fixture');
  assert.equal(calls[1][1]['metadata[kit_fulfillment_started_at]'], TIMESTAMP);
  assert.equal(calls[3][1]['metadata[kit_fulfillment_email_id]'], 'email_fixture');
});

test('successful provider send is acknowledged even if final Stripe marker write fails', async () => {
  const { createStripeWebhookHandler } = require('../api/stripe-webhook');
  const event = { id: 'evt_fixture', livemode: true, type: 'checkout.session.completed', data: { object: paidSession() } };
  const { req, readRawBody } = signedWebhookRequest(event);
  let sends = 0;
  const handler = createStripeWebhookHandler({
    webhookSecret: WEBHOOK_SECRET,
    nowSeconds: () => Number(TIMESTAMP),
    readRawBody,
    stripeRequest: async (_stripePath, options) => {
      if (!options) return paidSession();
      const params = new URLSearchParams(options.body);
      if (params.has('metadata[kit_fulfillment_email_id]')) throw new Error('Stripe metadata unavailable');
      return paidSession();
    },
    sendFulfillmentEmail: async () => { sends++; return { id: 'email_fixture' }; },
  });
  const res = responseRecorder();
  await handler(req, res);

  assert.equal(sends, 1);
  assert.equal(res.statusCode, 200);
  assert.equal(jsonBody(res).fulfilled, true);
  assert.equal(jsonBody(res).metadata_pending, true);
});

test('old unresolved fulfillment claim is acknowledged without a post-window resend', async () => {
  const { createStripeWebhookHandler, RESEND_RETRY_WINDOW_SECONDS } = require('../api/stripe-webhook');
  const event = { id: 'evt_fixture', livemode: true, type: 'checkout.session.completed', data: { object: paidSession() } };
  const { req, readRawBody } = signedWebhookRequest(event);
  let sends = 0;
  const stale = paidSession({ metadata: {
    kit_fulfillment_event_id: 'evt_fixture',
    kit_fulfillment_started_at: String(Number(TIMESTAMP) - RESEND_RETRY_WINDOW_SECONDS - 1),
  } });
  const handler = createStripeWebhookHandler({
    webhookSecret: WEBHOOK_SECRET,
    nowSeconds: () => Number(TIMESTAMP),
    readRawBody,
    stripeRequest: async () => stale,
    sendFulfillmentEmail: async () => { sends++; return { id: 'email_fixture' }; },
  });
  const res = responseRecorder();
  await handler(req, res);

  assert.equal(sends, 0);
  assert.equal(res.statusCode, 200);
  assert.equal(jsonBody(res).pending_manual, true);
});

test('webhook verifies signature and fulfills one exact paid live session', async () => {
  const { createStripeWebhookHandler } = require('../api/stripe-webhook');
  const event = { id: 'evt_fixture', livemode: true, type: 'checkout.session.completed', data: { object: paidSession() } };
  const { req, readRawBody } = signedWebhookRequest(event);
  const calls = [];
  const handler = createStripeWebhookHandler({
    webhookSecret: WEBHOOK_SECRET,
    nowSeconds: () => Number(TIMESTAMP),
    readRawBody,
    stripeRequest: async (stripePath, options) => {
      calls.push(['stripe', stripePath, options]);
      if (!options) return paidSession();
      return paidSession({ metadata: { kit_fulfillment_email_id: 'email_fixture' } });
    },
    sendFulfillmentEmail: async (session) => {
      calls.push(['email', session.customer_details.email]);
      return { id: 'email_fixture' };
    },
  });
  const res = responseRecorder();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(jsonBody(res).fulfilled, true);
  assert.deepEqual(calls.map((call) => call[0]), ['stripe', 'stripe', 'email', 'stripe']);
});

test('webhook ignores the foreign paid GitDealFlow session before fulfillment side effects', async () => {
  const { createStripeWebhookHandler } = require('../api/stripe-webhook');
  const foreignSession = paidSession({
    id: FOREIGN_GITDEALFLOW_SESSION,
    payment_link: FOREIGN_GITDEALFLOW_LINK,
    amount_total: 700,
    currency: 'usd',
    metadata: { source: 'landing-tripwire', tier: 'teardown' },
    line_items: {
      data: [{ price: { id: FOREIGN_GITDEALFLOW_PRICE, product: FOREIGN_GITDEALFLOW_PRODUCT } }],
    },
  });
  const event = {
    id: 'evt_gitdealflow_fixture',
    livemode: true,
    type: 'checkout.session.completed',
    data: { object: foreignSession },
  };
  const { req, readRawBody } = signedWebhookRequest(event);
  const stripeCalls = [];
  let sends = 0;
  const handler = createStripeWebhookHandler({
    webhookSecret: WEBHOOK_SECRET,
    nowSeconds: () => Number(TIMESTAMP),
    readRawBody,
    stripeRequest: async (stripePath, options) => {
      stripeCalls.push({ stripePath, options });
      return foreignSession;
    },
    sendFulfillmentEmail: async () => { sends++; return { id: 'must_not_send' }; },
  });
  const res = responseRecorder();
  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(jsonBody(res), { received: true, ignored: 'not_paid_kit' });
  assert.equal(stripeCalls.length, 1, 'only the read-only authoritative session lookup is allowed');
  assert.equal(stripeCalls[0].options, undefined, 'foreign sessions must never be mutated');
  assert.equal(sends, 0, 'foreign sessions must never receive CarShake fulfillment');
});

test('webhook rejects missing, forged, modified, and stale signatures without side effects', async () => {
  const { createStripeWebhookHandler } = require('../api/stripe-webhook');
  const event = { id: 'evt_fixture', livemode: true, type: 'checkout.session.completed', data: { object: paidSession() } };
  const signed = signedWebhookRequest(event);
  const scenarios = [
    { req: { method: 'POST', headers: {} }, readRawBody: signed.readRawBody, now: Number(TIMESTAMP) },
    { req: { method: 'POST', headers: { 'stripe-signature': `t=${TIMESTAMP},v1=${'0'.repeat(64)}` } }, readRawBody: signed.readRawBody, now: Number(TIMESTAMP) },
    { req: signed.req, readRawBody: async () => Buffer.from(`${JSON.stringify(event)} `), now: Number(TIMESTAMP) },
    { req: signed.req, readRawBody: signed.readRawBody, now: Number(TIMESTAMP) + 301 },
  ];

  for (const scenario of scenarios) {
    let sideEffects = 0;
    const handler = createStripeWebhookHandler({
      webhookSecret: WEBHOOK_SECRET,
      nowSeconds: () => scenario.now,
      readRawBody: scenario.readRawBody,
      stripeRequest: async () => { sideEffects++; },
      sendFulfillmentEmail: async () => { sideEffects++; },
    });
    const res = responseRecorder();
    await handler(scenario.req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(sideEffects, 0);
  }
});

test('webhook accepts a signed no-charge test event but never fulfills it', async () => {
  const { createStripeWebhookHandler } = require('../api/stripe-webhook');
  const event = { id: 'evt_test', livemode: false, type: 'checkout.session.completed', data: { object: paidSession({ livemode: false, id: 'cs_test_fixture' }) } };
  const { req, readRawBody } = signedWebhookRequest(event);
  let sideEffects = 0;
  const handler = createStripeWebhookHandler({
    webhookSecret: WEBHOOK_SECRET,
    nowSeconds: () => Number(TIMESTAMP),
    readRawBody,
    stripeRequest: async () => { sideEffects++; },
    sendFulfillmentEmail: async () => { sideEffects++; },
  });
  const res = responseRecorder();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(jsonBody(res).ignored, 'test_event');
  assert.equal(sideEffects, 0);
});

test('private asset source contains ciphertext, never known plaintext payloads', () => {
  const source = fs.readFileSync(require.resolve('../api/kit-download'), 'utf8');
  assert.match(source, /KIT_ASSET_ENCRYPTION_KEY/);
  assert.match(source, /aes-256-gcm/);
  assert.doesNotMatch(source, /JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9UaXRsZSAoYWJvdXQ6Ymxhbmsp/);
  assert.doesNotMatch(source, /IyBDYXJTaGFrZSBWZWhpY2xlIERhbWFnZSBEaXNwdXRlIFNjcmlwdCBQYWNr/);
});

test('AES-GCM asset decryption authenticates ciphertext and key', () => {
  const { decryptAssetBlob } = require('../api/kit-download');
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const content = Buffer.from('private-kit-fixture');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(content), cipher.final()]);
  const blob = {
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };

  assert.deepEqual(decryptAssetBlob(blob, key.toString('base64')), content);
  assert.throws(() => decryptAssetBlob(blob, crypto.randomBytes(32).toString('base64')));
  assert.throws(() => decryptAssetBlob(blob, 'not-a-valid-key'), /32-byte/);
});

test('default private asset reader fails closed without its deployment secret', async () => {
  const { defaultReadAsset } = require('../api/kit-download');
  const previous = process.env.KIT_ASSET_ENCRYPTION_KEY;
  delete process.env.KIT_ASSET_ENCRYPTION_KEY;
  try {
    await assert.rejects(
      defaultReadAsset({ storedFilename: 'time-stamp-defense-checklist.pdf' }),
      /KIT_ASSET_ENCRYPTION_KEY/
    );
  } finally {
    if (previous === undefined) delete process.env.KIT_ASSET_ENCRYPTION_KEY;
    else process.env.KIT_ASSET_ENCRYPTION_KEY = previous;
  }
});
