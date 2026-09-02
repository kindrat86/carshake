const KIT_PAYMENT_LINK = 'plink_1UA9cyCwGoUDklRezKVZTA7W';
const KIT_AMOUNT = 700;
const KIT_CURRENCY = 'usd';
const KIT_ASSETS = Object.freeze([
  Object.freeze({
    key: 'time-stamp-defense-checklist',
    name: 'Time-Stamp Defense Checklist',
    filename: 'carshake-time-stamp-defense-checklist.pdf',
    storedFilename: 'time-stamp-defense-checklist.pdf',
    contentType: 'application/pdf',
  }),
  Object.freeze({
    key: 'rental-car-damage-prevention',
    name: 'Rental Car Damage Prevention Guide',
    filename: 'carshake-rental-car-damage-prevention.pdf',
    storedFilename: 'rental-car-damage-prevention.pdf',
    contentType: 'application/pdf',
  }),
  Object.freeze({
    key: 'dispute-script-pack',
    name: 'Vehicle Damage Dispute Script Pack',
    filename: 'carshake-vehicle-damage-dispute-script-pack.pdf',
    storedFilename: 'dispute-script-pack.pdf',
    contentType: 'application/pdf',
  }),
  Object.freeze({
    key: 'editable-dispute-script-pack',
    name: 'Editable Script Pack',
    filename: 'carshake-vehicle-damage-dispute-script-pack.md',
    storedFilename: 'dispute-script-pack.md',
    contentType: 'text/markdown; charset=utf-8',
  }),
]);
const KIT_ASSETS_BY_KEY = new Map(KIT_ASSETS.map((asset) => [asset.key, asset]));

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

function isValidLiveSessionId(sessionId) {
  return typeof sessionId === 'string' && /^cs_live_[A-Za-z0-9_]+$/.test(sessionId) && sessionId.length <= 255;
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

function buildAuthenticatedAssetUrl(assetKey, sessionId) {
  const params = new URLSearchParams({ asset: assetKey, session_id: sessionId });
  return `/api/kit-download?${params.toString()}`;
}

function publicAssetsForSession(sessionId) {
  return KIT_ASSETS.map(({ key, name }) => ({ name, url: buildAuthenticatedAssetUrl(key, sessionId) }));
}

function createKitSessionHandler({ stripeRequest = defaultStripeRequest } = {}) {
  return async function kitSessionHandler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    if (req.method !== 'GET') return res.status(405).json({ ready: false, error: 'Method not allowed' });

    const sessionId = typeof req.query?.session_id === 'string' ? req.query.session_id : '';
    if (!isValidLiveSessionId(sessionId)) {
      return res.status(400).json({ ready: false, error: 'Valid checkout session required' });
    }

    try {
      const session = await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
      if (!isPaidKitSession(session)) {
        return res.status(403).json({ ready: false, error: 'Paid Emergency Kit checkout required' });
      }
      return res.status(200).json({ ready: true, assets: publicAssetsForSession(sessionId) });
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
module.exports.isValidLiveSessionId = isValidLiveSessionId;
module.exports.buildAuthenticatedAssetUrl = buildAuthenticatedAssetUrl;
module.exports.publicAssetsForSession = publicAssetsForSession;
module.exports.KIT_ASSETS = KIT_ASSETS;
module.exports.KIT_ASSETS_BY_KEY = KIT_ASSETS_BY_KEY;
module.exports.defaultStripeRequest = defaultStripeRequest;
