import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { track } from '@/lib/posthog';

const USE_CASES: Record<string, { h1: string; title: string; metaDescription: string; paragraphs: string[]; faqs: { q: string; a: string }[] }> = {
  'valet-parking': {
    h1: 'Protect Your Car at Valet Parking',
    title: 'Protect Your Car at Valet Parking — CarShake',
    metaDescription: 'AI-verified car condition scans before & after valet. QR handover proof. Never pay for damage you didn\'t cause.',
    paragraphs: [
      'Every time you hand your keys to a valet, you\'re trusting a stranger with one of your most expensive possessions. Without documented proof of your car\'s condition before handover, you have no defense when damage appears at pickup.',
      'CarShake creates a signed, timestamped, AI-verified record in 60 seconds. The attendant scans your QR code and confirms your car\'s condition. Both sides sign. Both sides are protected. When you return, AI compares every angle instantly.',
      'Under bailment law, the valet has a duty of care for your vehicle. But proving when damage occurred is nearly impossible without structured evidence. CarShake gives you GPS-verified photos, mutual digital confirmation, and AI comparison — the complete evidence package that changes every dispute.',
    ],
    faqs: [
      { q: 'Does the valet need to download an app?', a: 'No. They scan your QR code with any phone camera and tap "Confirm" in their browser. Takes 10 seconds.' },
      { q: 'What if the valet refuses to scan?', a: 'Your evidence is still valid without confirmation — GPS, timestamps, and photos create a strong record. But the QR confirmation makes it ironclad.' },
      { q: 'Is CarShake accepted as legal evidence?', a: 'CarShake creates a SHA-256 verified evidence chain with GPS, timestamps, and digital signatures. This meets the standard for digital evidence in most jurisdictions.' },
    ],
  },
  'airport-parking': {
    h1: 'Protect Your Car at Airport Parking',
    title: 'Protect Your Car at Airport Parking — CarShake',
    metaDescription: 'Document your car before long-term airport parking. AI comparison at pickup catches every scratch.',
    paragraphs: [
      'Airport parking is one of the highest-risk situations for vehicle damage. Your car sits for days or weeks, surrounded by other vehicles, shuttle buses, and luggage carts. When you return exhausted from travel, you\'re unlikely to notice subtle damage.',
      'CarShake lets you scan your car in 60 seconds before heading to the terminal. When you return — even weeks later — scan again and AI compares every angle. New scratches, dents, or curb rash are flagged instantly with exact location and severity.',
      'Long-term parking lots are especially problematic because damage accumulates over time and tracking responsibility becomes nearly impossible. With CarShake, you have timestamped proof of your car\'s exact condition at drop-off and pickup.',
    ],
    faqs: [
      { q: 'Can I scan at an outdoor parking lot?', a: 'Yes. CarShake works anywhere with phone camera access. Outdoor lots, covered garages, valet — all supported.' },
      { q: 'What if I\'m parked for 2 weeks?', a: 'Your scan data is stored permanently. Whether you\'re gone 2 hours or 2 months, the comparison works the same.' },
    ],
  },
  'hotel-parking': {
    h1: 'Protect Your Car at Hotel Parking',
    title: 'Protect Your Car at Hotel Parking — CarShake',
    metaDescription: 'Signed evidence for hotel valet and garage parking. Both sides confirm via QR code.',
    paragraphs: [
      'Hotel valet parking combines two risk factors: your car is handled by multiple attendants over multiple days, and the hotel\'s liability disclaimer is prominently printed on every ticket.',
      'CarShake creates mutual accountability. When the valet takes your keys, they scan your QR code and confirm your car\'s condition. This digital handshake protects both sides — the hotel from false claims, and you from real damage.',
      'Whether you\'re staying one night or one week, every time your car is moved by hotel staff, you can create a new scan pair. Build a complete record of your vehicle\'s condition throughout your stay.',
    ],
    faqs: [
      { q: 'Does this work with hotel self-parking?', a: 'Yes. Even in a self-parking garage, documenting your car\'s condition protects against door dings and damage from other guests\' vehicles.' },
      { q: 'Can I scan when the valet brings my car?', a: 'Absolutely. Scan at every handover — both when you give your keys and when you get your car back.' },
    ],
  },
  'body-shop': {
    h1: 'Protect Your Car at the Body Shop',
    title: 'Protect Your Car at the Body Shop — CarShake',
    metaDescription: 'Document condition before and after mechanic visits. AI spots every difference.',
    paragraphs: [
      'Taking your car to a body shop or mechanic should fix problems, not create new ones. But without documented proof of your car\'s condition before the visit, new damage can easily be attributed to "pre-existing conditions."',
      'Scan your car before dropping it off at the shop. When you pick it up, scan again. CarShake\'s AI compares every angle and flags any changes — including areas that weren\'t part of the original repair.',
      'Body shops handle dozens of vehicles in tight spaces. Accidental bumps, paint overspray, and tool marks happen. With CarShake, you have irrefutable evidence if your car comes back with more issues than it went in with.',
    ],
    faqs: [
      { q: 'Should I scan areas away from the repair?', a: 'Yes. CarShake\'s 8-angle scan covers the entire vehicle. This catches damage in areas unrelated to the original repair — which is exactly where unexpected damage tends to appear.' },
      { q: 'Can the shop dispute my photos?', a: 'CarShake photos are GPS-verified, timestamped by our server, and optionally confirmed by the shop via QR code. This creates a much stronger evidence chain than random phone photos.' },
    ],
  },
  'car-rental': {
    h1: 'Protect Your Rental Car',
    title: 'Protect Your Rental Car — CarShake',
    metaDescription: 'Avoid false damage charges at rental car return. Timestamped, GPS-verified photos.',
    paragraphs: [
      'Rental car damage disputes are one of the most common travel complaints. Rental companies inspect returned vehicles and charge for damage — sometimes damage that was already present when you picked up the car.',
      'Before driving off the lot, scan the rental with CarShake. Capture all 8 angles in 60 seconds. When you return the car, scan again. If the rental company claims new damage, you have AI-verified proof of the car\'s condition at both points.',
      'The rental counter walk-around is often rushed, and the condition report may miss existing scratches and dents. CarShake gives you comprehensive, timestamped documentation that protects you from unfair charges.',
    ],
    faqs: [
      { q: 'Is this better than the rental company\'s inspection?', a: 'Rental inspections are subjective and often incomplete. CarShake provides 8-angle coverage, AI comparison, and timestamped evidence — far more thorough than a quick walk-around.' },
      { q: 'What if I find damage at pickup?', a: 'Scan immediately. Your CarShake record shows the damage existed before you drove the car. This protects you from being charged for pre-existing issues.' },
    ],
  },
  'car-wash': {
    h1: 'Protect Your Car at the Car Wash',
    title: 'Protect Your Car at the Car Wash — CarShake',
    metaDescription: 'Document condition before automated or hand wash. 60-second scan, court-ready evidence.',
    paragraphs: [
      'Car washes — especially automated tunnel washes — can cause swirl marks, scratches, and damage to antennas, mirrors, and trim pieces. The damage is often subtle and only visible in certain lighting.',
      'Scan your car before entering the wash. After, scan again from the same angles. CarShake\'s AI is trained to detect subtle paint changes that you might miss with the naked eye.',
      'Hand wash services pose different risks: rings, watches, and dirty cloths can create fine scratches. Whether automated or hand wash, documenting your car\'s condition before and after gives you protection.',
    ],
    faqs: [
      { q: 'Can AI really detect swirl marks?', a: 'Claude Vision AI analyzes images at high resolution and can detect subtle surface changes including swirl marks, paint transfer, and fine scratches that are difficult to see in person.' },
      { q: 'Should I scan every time I wash my car?', a: 'For automated washes where damage risk is higher, we recommend it. For trusted hand wash services, periodic scanning helps maintain a record.' },
    ],
  },
};

const ProtectUseCase = () => {
  const { usecase } = useParams<{ usecase: string }>();
  const data = USE_CASES[usecase || ''];

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="text-center">
          <p className="font-body text-body text-lg mb-4">Page not found.</p>
          <Link to="/" className="text-gold font-body font-semibold">← Back to home</Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CarShake',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    description: data.description,
    url: `https://carshake.online/protect/${usecase}`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <div className="min-h-screen bg-page">
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.metaDescription} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.metaDescription} />
        <link rel="canonical" href={`https://carshake.online/protect/${usecase}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <header className="px-4 py-4 border-b border-border bg-white">
        <div className="max-w-[720px] mx-auto">
          <Link to="/" className="font-display text-xl font-bold text-gold">CarShake</Link>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-4 py-10">
        <h1 className="font-display text-[28px] font-bold text-ink mb-6 leading-tight">{data.h1}</h1>

        {data.paragraphs.map((p, i) => (
          <p key={i} className="font-body text-[15px] text-body leading-relaxed mb-5">{p}</p>
        ))}

        {/* CTA */}
        <div className="my-10 p-6 rounded-[14px] border-2 border-gold bg-gold-subtle text-center">
          <p className="font-display text-lg font-bold text-ink mb-2">Try CarShake now — it's free.</p>
          <p className="font-body text-sm text-body mb-4">60 seconds. 8 photos. AI-verified protection.</p>
          <a
            href="/#demo"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
            onClick={() => track('cta_clicked', { location: 'seo-page', usecase })}
          >
            🛡️ See the AI Protection in Action — Free
          </a>
        </div>

        {/* FAQ */}
        <h2 className="font-display text-xl font-bold text-ink mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-10">
          {data.faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-[14px] border border-border p-5">
              <h3 className="font-display text-[15px] font-bold text-ink mb-2">{faq.q}</h3>
              <p className="font-body text-sm text-body">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/" className="text-gold font-body font-semibold text-sm">← Back to CarShake home</Link>
        </div>
      </main>

      <footer className="bg-dark py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display text-gold text-lg font-bold mb-1">CarShake</p>
          <p className="text-muted-custom text-sm font-body">© 2026 CarShake · carshake.online</p>
        </div>
      </footer>
    </div>
  );
};

export default ProtectUseCase;
