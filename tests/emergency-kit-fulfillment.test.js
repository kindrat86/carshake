const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const KIT_LINK = 'plink_1UA9cyCwGoUDklRezKVZTA7W';

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    json(value) { this.body = JSON.stringify(value); return this; },
    end(value = '') { this.body = String(value); return this; },
  };
}

function paidSession(overrides = {}) {
  return {
    id: 'cs_live_verified_fixture',
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

test('download API exposes assets only for the exact paid live kit session', async () => {
  const { createKitSessionHandler } = require('../api/kit-session');
  const handler = createKitSessionHandler({
    stripeRequest: async () => paidSession(),
  });
  const req = { method: 'GET', query: { session_id: 'cs_live_verified_fixture' } };
  const res = responseRecorder();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.equal(body.ready, true);
  assert.equal(body.assets.length, 4);
  assert.ok(body.assets.every((asset) => asset.url.startsWith('/kit/c68af68983ea215fbce16e3d04b4a914/')));
});

test('download API rejects spoofed, unpaid, or wrong-link sessions', async () => {
  const { createKitSessionHandler } = require('../api/kit-session');
  for (const session of [
    paidSession({ payment_status: 'unpaid' }),
    paidSession({ payment_link: 'plink_wrong' }),
    paidSession({ amount_total: 699 }),
    paidSession({ currency: 'eur' }),
  ]) {
    const handler = createKitSessionHandler({ stripeRequest: async () => session });
    const res = responseRecorder();
    await handler({ method: 'GET', query: { session_id: 'cs_live_verified_fixture' } }, res);
    assert.equal(res.statusCode, 403);
    assert.equal(JSON.parse(res.body).ready, false);
  }
});

test('download API denies missing and synthetic test session IDs before Stripe lookup', async () => {
  const { createKitSessionHandler } = require('../api/kit-session');
  let lookups = 0;
  const handler = createKitSessionHandler({ stripeRequest: async () => { lookups++; return paidSession(); } });
  for (const session_id of ['', 'cs_test_fixture', 'not-a-session']) {
    const res = responseRecorder();
    await handler({ method: 'GET', query: { session_id } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(JSON.parse(res.body).ready, false);
  }
  assert.equal(lookups, 0);
});

test('thank-you page fetches verified assets and contains no static delivery URLs', () => {
  const fs = require('node:fs');
  const html = fs.readFileSync(require.resolve('../kit-thanks.html'), 'utf8');
  assert.match(html, /\/api\/kit-session\?session_id=/);
  assert.doesNotMatch(html, /\/kit\/c68af68983ea215fbce16e3d04b4a914\//);
});

test('webhook verifies signature and fulfills one exact paid live session', async () => {
  const { createStripeWebhookHandler } = require('../api/stripe-webhook');
  const secret = 'whsec_fixture';
  const payload = JSON.stringify({
    id: 'evt_fixture',
    livemode: true,
    type: 'checkout.session.completed',
    data: { object: paidSession() },
  });
  const timestamp = '1788297600';
  const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  const calls = [];
  const handler = createStripeWebhookHandler({
    webhookSecret: secret,
    nowSeconds: () => Number(timestamp),
    readRawBody: async () => Buffer.from(payload),
    stripeRequest: async (path, options) => {
      calls.push(['stripe', path, options]);
      if (!options) return paidSession();
      return paidSession({ metadata: { kit_fulfillment_email_id: 'email_fixture' } });
    },
    sendFulfillmentEmail: async (session) => {
      calls.push(['email', session.customer_details.email]);
      return { id: 'email_fixture' };
    },
  });
  const req = { method: 'POST', headers: { 'stripe-signature': `t=${timestamp},v1=${signature}` } };
  const res = responseRecorder();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).fulfilled, true);
  assert.deepEqual(calls.map((c) => c[0]), ['stripe', 'email', 'stripe']);
});

test('webhook accepts a signed no-charge test event but never fulfills it', async () => {
  const { createStripeWebhookHandler } = require('../api/stripe-webhook');
  const secret = 'whsec_fixture';
  const payload = JSON.stringify({ id: 'evt_test', livemode: false, type: 'checkout.session.completed', data: { object: paidSession({ livemode: false, id: 'cs_test_fixture' }) } });
  const timestamp = '1788297600';
  const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  let sideEffects = 0;
  const handler = createStripeWebhookHandler({
    webhookSecret: secret,
    nowSeconds: () => Number(timestamp),
    readRawBody: async () => Buffer.from(payload),
    stripeRequest: async () => { sideEffects++; },
    sendFulfillmentEmail: async () => { sideEffects++; },
  });
  const res = responseRecorder();
  await handler({ method: 'POST', headers: { 'stripe-signature': `t=${timestamp},v1=${signature}` } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).ignored, 'test_event');
  assert.equal(sideEffects, 0);
});
