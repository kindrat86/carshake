const KIT_PAYMENT_LINK = 'plink_1UA9cyCwGoUDklRezKVZTA7W';
const KIT_AMOUNT = 700;
const KIT_CURRENCY = 'usd';
const KIT_ASSETS = [
  { name: 'Time-Stamp Defense Checklist', url: '/kit/c68af68983ea215fbce16e3d04b4a914/time-stamp-defense-checklist.pdf' },
  { name: 'Rental Car Damage Prevention Guide', url: '/kit/c68af68983ea215fbce16e3d04b4a914/rental-car-damage-prevention.pdf' },
  { name: 'Vehicle Damage Dispute Script Pack', url: '/kit/c68af68983ea215fbce16e3d04b4a914/dispute-script-pack.pdf' },
  { name: 'Editable Script Pack', url: '/kit/c68af68983ea215fbce16e3d04b4a914/dispute-script-pack.md' },
];

async function defaultStripeRequest(path, options = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  const response = await fetch(`https://api.stripe.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Stripe ${response.status}`);
  return response.json();
}

function isPaidKitSession(session) {
  return Boolean(
    session &&
    session.livemode === true &&
    session.payment_status === 'paid' &&
    session.status === 'complete' &&
    session.payment_link === KIT_PAYMENT_LINK &&
    session.amount_total === KIT_AMOUNT &&
    session.currency === KIT_CURRENCY
  );
}

function createKitSessionHandler({ stripeRequest = defaultStripeRequest } = {}) {
  return async function kitSessionHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    if (req.method !== 'GET') return res.status(405).json({ ready: false, error: 'Method not allowed' });

    const sessionId = typeof req.query?.session_id === 'string' ? req.query.session_id : '';
    if (!/^cs_live_[A-Za-z0-9_]+$/.test(sessionId) || sessionId.length > 255) {
      return res.status(400).json({ ready: false, error: 'Valid checkout session required' });
    }

    try {
      const session = await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
      if (!isPaidKitSession(session)) {
        return res.status(403).json({ ready: false, error: 'Paid Emergency Kit checkout required' });
      }
      return res.status(200).json({ ready: true, assets: KIT_ASSETS });
    } catch (error) {
      console.error('[kit-session] Stripe verification failed:', error.message);
      return res.status(403).json({ ready: false, error: 'Checkout could not be verified' });
    }
  };
}

const handler = createKitSessionHandler();
module.exports = handler;
module.exports.default = handler;
module.exports.createKitSessionHandler = createKitSessionHandler;
module.exports.isPaidKitSession = isPaidKitSession;
module.exports.KIT_ASSETS = KIT_ASSETS;
module.exports.defaultStripeRequest = defaultStripeRequest;
