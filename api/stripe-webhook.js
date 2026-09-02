const crypto = require('node:crypto');
const {
  KIT_ASSETS,
  buildAuthenticatedAssetUrl,
  defaultStripeRequest,
  isPaidKitSession,
} = require('./kit-session');

const SIGNATURE_TOLERANCE_SECONDS = 300;
const RESEND_RETRY_WINDOW_SECONDS = 23 * 60 * 60;
const FULFILLMENT_ORIGIN = 'https://carshake.online';
const FULFILLMENT_BCC = 'sales@sipiteno.com';

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

function fulfillmentIdempotencyKey(sessionId) {
  return `carshake-kit-${sessionId}`;
}

function createFulfillmentEmailSender({
  apiKey = process.env.RESEND_API_KEY || '',
  fetchImpl = fetch,
  origin = FULFILLMENT_ORIGIN,
} = {}) {
  return async function sendFulfillmentEmail(session) {
    const email = session?.customer_details?.email || session?.customer_email;
    if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
    if (!email) throw new Error('Checkout session has no customer email');
    if (!session?.id) throw new Error('Checkout session has no id');

    const links = KIT_ASSETS.map((asset) => {
      const authenticatedUrl = `${origin}${buildAuthenticatedAssetUrl(asset.key, session.id)}`.replaceAll('&', '&amp;');
      return `<li style="margin:12px 0"><a href="${authenticatedUrl}">${asset.name}</a></li>`;
    }).join('');
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': fulfillmentIdempotencyKey(session.id),
      },
      body: JSON.stringify({
        from: 'CarShake <kit@carshake.online>',
        to: email,
        bcc: FULFILLMENT_BCC,
        subject: 'Your CarShake Emergency Kit downloads',
        html: `<h1>Your Emergency Kit is ready</h1><p>Save a local copy of each file:</p><ul>${links}</ul><p>These templates are educational information, not legal advice. Access help: refund@carshake.online</p>`,
      }),
    });
    if (!response.ok) {
      const detail = typeof response.text === 'function' ? await response.text() : '';
      throw new Error(`Resend ${response.status || 'request failed'}: ${detail}`);
    }
    return response.json();
  };
}

const defaultSendFulfillmentEmail = createFulfillmentEmailSender();

function createStripeWebhookHandler({
  webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '',
  nowSeconds,
  readRawBody = defaultReadRawBody,
  stripeRequest = defaultStripeRequest,
  sendFulfillmentEmail = defaultSendFulfillmentEmail,
} = {}) {
  return async function stripeWebhookHandler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
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
      const metadata = session.metadata || {};
      if (metadata.kit_fulfillment_email_id) {
        return res.status(200).json({ received: true, fulfilled: true, duplicate: true });
      }

      const currentSeconds = typeof nowSeconds === 'function'
        ? nowSeconds()
        : Math.floor(Date.now() / 1000);
      const claimedEventId = metadata.kit_fulfillment_event_id || '';
      const claimedAt = Number(metadata.kit_fulfillment_started_at);
      if (claimedEventId) {
        const claimAge = currentSeconds - claimedAt;
        const safeProviderRetry =
          claimedEventId === event.id &&
          Number.isFinite(claimedAt) &&
          claimAge >= 0 &&
          claimAge < RESEND_RETRY_WINDOW_SECONDS;
        if (!safeProviderRetry) {
          console.error('[stripe-webhook] old or conflicting fulfillment claim requires manual review:', session.id);
          return res.status(200).json({
            received: true,
            fulfilled: false,
            duplicate: true,
            pending_manual: true,
          });
        }
      } else {
        const claimBody = new URLSearchParams({
          'metadata[kit_fulfillment_event_id]': event.id,
          'metadata[kit_fulfillment_started_at]': String(currentSeconds),
        }).toString();
        await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(session.id)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: claimBody,
        });
      }

      // Resend receives a deterministic Idempotency-Key derived from the Stripe
      // session. Concurrent retries can both reach this call, but only one
      // provider delivery is created for the session.
      const email = await sendFulfillmentEmail(session);
      const body = new URLSearchParams({ 'metadata[kit_fulfillment_email_id]': email.id }).toString();
      try {
        await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(session.id)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });
      } catch (error) {
        // Resend already accepted this deterministic delivery. Returning 500
        // would let Stripe retry after Resend's 24-hour idempotency window and
        // could create a duplicate. Keep the durable pre-send claim and alert.
        console.error('[stripe-webhook] email sent but completion marker failed:', error.message);
        return res.status(200).json({ received: true, fulfilled: true, metadata_pending: true });
      }
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
module.exports.fulfillmentIdempotencyKey = fulfillmentIdempotencyKey;
module.exports.createFulfillmentEmailSender = createFulfillmentEmailSender;
module.exports.defaultSendFulfillmentEmail = defaultSendFulfillmentEmail;
module.exports.RESEND_RETRY_WINDOW_SECONDS = RESEND_RETRY_WINDOW_SECONDS;
