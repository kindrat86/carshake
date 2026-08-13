// CarShake AI photo comparison — backs the homepage "LIVE AI" demo widget.
//
// The widget originally invoked a Supabase edge function ("compare-photos")
// that 401s for every anonymous visitor (it was deployed expecting a signed-in
// user, and sign-in was removed), so the flagship demo failed 100% of the
// time. This endpoint replaces it on our own domain: same request/response
// contract the widget already speaks, powered by Claude vision directly.
//
// Contract (matches assets/LiveAIDemo-*.js):
//   POST { before_image: <base64, no data: prefix>, after_image: <base64> }
//   200 { status: "no_changes"|"changes_detected", summary, differences:
//        [{ location, description, severity: "minor"|"moderate"|"severe" }] }
//   4xx/5xx { error: "human-readable message" }  → widget shows "Analysis failed"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ALLOWED_ORIGINS = ['https://carshake.online', 'https://www.carshake.online'];

const MAX_IMAGE_CHARS = 8_000_000; // ~6MB decoded per image
const RATE_LIMIT = 20;             // per IP per window (per warm instance)
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map();

const RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['status', 'summary', 'differences'],
  properties: {
    status: { type: 'string', enum: ['no_changes', 'changes_detected'] },
    summary: { type: 'string' },
    differences: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['location', 'description', 'severity'],
        properties: {
          location: { type: 'string' },
          description: { type: 'string' },
          severity: { type: 'string', enum: ['minor', 'moderate', 'severe'] },
        },
      },
    },
  },
};

const SYSTEM_PROMPT = `You are CarShake's vehicle-condition comparison engine. You receive two photos: BEFORE (first image, taken when a car was handed over) and AFTER (second image, taken when it was returned).

Report only genuine physical-condition changes to the vehicle: new scratches, dents, chips, cracks, scuffs, missing or broken parts, fluid stains, wheel/rim damage. Ignore differences caused by lighting, exposure, reflections, shadows, camera angle, framing, dirt spray/water droplets, or background changes — those are not damage.

For each real change, give the location on the vehicle (e.g. "rear right door", "front bumper, left corner"), a short factual description, and a severity: "minor" (cosmetic, barely visible), "moderate" (clearly visible, would annoy an owner), "severe" (obvious damage, likely repair cost).

If the vehicle's condition is unchanged, return status "no_changes" with an empty differences list and a one-sentence summary.

If the two photos do not show the same vehicle or are too poor to compare honestly, return status "changes_detected" with one difference at location "Overall" explaining the problem, severity "minor" — never invent damage.

Be precise and factual. Never fabricate damage that is not visible.`;

function sniffMediaType(b64) {
  if (b64.startsWith('/9j/')) return 'image/jpeg';
  if (b64.startsWith('iVBOR')) return 'image/png';
  if (b64.startsWith('UklGR')) return 'image/webp';
  if (b64.startsWith('R0lGOD')) return 'image/gif';
  return 'image/jpeg';
}

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_LIMIT) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Comparison engine is not configured' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many comparisons — please try again later' });
  }

  const { before_image, after_image } = req.body || {};
  if (typeof before_image !== 'string' || typeof after_image !== 'string' || !before_image || !after_image) {
    return res.status(400).json({ error: 'Both a before and an after photo are required' });
  }
  if (before_image.length > MAX_IMAGE_CHARS || after_image.length > MAX_IMAGE_CHARS) {
    return res.status(413).json({ error: 'Photo too large — please use a smaller image' });
  }

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-5',
        fallbacks: 'default',
        max_tokens: 1500,
        output_config: {
          effort: 'medium',
          format: { type: 'json_schema', schema: RESULT_SCHEMA },
        },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: sniffMediaType(before_image), data: before_image } },
              { type: 'image', source: { type: 'base64', media_type: sniffMediaType(after_image), data: after_image } },
              { type: 'text', text: 'First image = BEFORE, second image = AFTER. Compare the vehicle condition and report changes.' },
            ],
          },
        ],
      }),
    });

    if (!apiRes.ok) {
      const detail = await apiRes.text().catch(() => '');
      console.error('anthropic error', apiRes.status, detail.slice(0, 500));
      return res.status(502).json({ error: 'The AI comparison service is temporarily unavailable' });
    }

    const msg = await apiRes.json();
    if (msg.stop_reason === 'refusal') {
      return res.status(422).json({ error: 'The AI could not analyze these photos — please try different ones' });
    }
    const text = (msg.content || []).find((b) => b.type === 'text');
    if (!text || msg.stop_reason === 'max_tokens') {
      console.error('unexpected response', msg.stop_reason);
      return res.status(502).json({ error: 'The AI comparison service returned an unexpected result' });
    }

    const result = JSON.parse(text.text);
    return res.status(200).json(result);
  } catch (err) {
    console.error('compare-photos failed', err && err.message);
    return res.status(500).json({ error: 'Comparison failed — please try again' });
  }
}
