const crypto = require('node:crypto');
const { isPaidKitSession, KIT_ASSETS, defaultStripeRequest } = require('./kit-session');

const SIGNATURE_TOLERANCE_SECONDS = 300;

async function defaultReadRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function verifyStripeSignature(payload, header, secret, nowSeconds = () => Math.floor(Date.now() / 1000)) {
  if (!secret || typeof header !== 'string') return false;
  const parts = header.split(',');
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith('v1=')).map((part) => part.slice(3));
  if (!/^\d+$/.test(timestamp || '') || Math.abs(nowSeconds() - Number(timestamp)) > SIGNATURE_TOLERANCE_SECONDS) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  });
}

async function defaultSendFulfillmentEmail(session) {
  const key = process.env.RESEND_API_KEY;
  const email = session?.customer_details?.email || session?.customer_email;
  if (!key) throw new Error('RESEND_API_KEY is not configured');
  if (!email) throw new Error('Checkout session has no customer email');
  const links = KIT_ASSETS.map((asset) => `<li style="margin:12px 0"><a href="https://carshake.online${asset.url}">${asset.name}</a></li>`).join('');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'CarShake <kit@carshake.online>',
      to: email,
      subject: 'Your CarShake Emergency Kit downloads',
      html: `<h1>Your Emergency Kit is ready</h1><p>Save a local copy of each file:</p><ul>${links}</ul><p>These templates are educational information, not legal advice. Access help: refund@carshake.online</p>`,
    }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
  return response.json();
}

function createStripeWebhookHandler({
  webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '',
  nowSeconds,
  readRawBody = defaultReadRawBody,
  stripeRequest = defaultStripeRequest,
  sendFulfillmentEmail = defaultSendFulfillmentEmail,
} = {}) {
  return async function stripeWebhookHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const raw = await readRawBody(req);
    const payload = raw.toString('utf8');
    if (!verifyStripeSignature(payload, req.headers?.['stripe-signature'], webhookSecret, nowSeconds)) {
      return res.status(400).json({ error: 'Invalid Stripe signature' });
    }

    let event;
    try { event = JSON.parse(payload); } catch (_) {
      return res.status(400).json({ error: 'Invalid event payload' });
    }
    if (event.livemode !== true) return res.status(200).json({ received: true, ignored: 'test_event' });
    if (event.type !== 'checkout.session.completed') return res.status(200).json({ received: true, ignored: 'event_type' });

    const eventSession = event.data?.object;
    if (!eventSession?.id || !/^cs_live_[A-Za-z0-9_]+$/.test(eventSession.id)) {
      return res.status(200).json({ received: true, ignored: 'invalid_session' });
    }

    try {
      const session = await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(eventSession.id)}`);
      if (!isPaidKitSession(session)) return res.status(200).json({ received: true, ignored: 'not_paid_kit' });
      if (session.metadata?.kit_fulfillment_email_id) {
        return res.status(200).json({ received: true, fulfilled: true, duplicate: true });
      }
      const email = await sendFulfillmentEmail(session);
      const body = new URLSearchParams({ 'metadata[kit_fulfillment_email_id]': email.id }).toString();
      await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(session.id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      return res.status(200).json({ received: true, fulfilled: true });
    } catch (error) {
      console.error('[stripe-webhook] fulfillment failed:', error.message);
      return res.status(500).json({ received: true, fulfilled: false, retryable: true });
    }
  };
}

const handler = createStripeWebhookHandler();
module.exports = handler;
module.exports.default = handler;
module.exports.config = { api: { bodyParser: false } };
module.exports.createStripeWebhookHandler = createStripeWebhookHandler;
module.exports.verifyStripeSignature = verifyStripeSignature;
module.exports.defaultSendFulfillmentEmail = defaultSendFulfillmentEmail;
