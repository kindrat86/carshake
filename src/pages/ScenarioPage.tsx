import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { track } from '@/lib/posthog';

const SCENARIOS: Record<string, {
  display: string;
  title: string;
  metaDesc: string;
  paragraphs: string[];
  faqs: { q: string; a: string }[];
}> = {
  'parallel-parking': {
    display: 'Parallel Parking',
    title: 'Protect Your Car During Parallel Parking — CarShake',
    metaDesc: 'Parallel parking causes bumper scrapes, curb rash, and side mirror damage. AI-verified documentation before you park on any street.',
    paragraphs: [
      'Parallel parking is one of the highest-risk maneuvers for vehicle damage. Curb rash on alloy wheels, front bumper scrapes, rear bumper contact, and side mirror folding are all common outcomes. In cities like San Francisco, New York, and Boston where parallel parking is the norm, drivers accept these risks daily — but they don\'t have to.',
      'The problem is proving damage occurred during parking, not before. A fresh curb scrape looks the same as an old one to any observer. Without documented proof of your car\'s pre-parking condition, you can\'t hold anyone accountable for new damage.',
      'CarShake solves this. Before you parallel park anywhere — on a city street, at a friend\'s house, outside a restaurant — take 60 seconds to scan your car from 8 angles. When you return, scan again. The AI comparison will flag any new curb rash, bumper scrapes, or side mirror damage with exact location and severity.',
    ],
    faqs: [
      { q: 'Can CarShake detect curb rash on dark wheels?', a: 'Yes. Our AI computer vision is trained on thousands of damage types including curb rash on all wheel colors and finishes.' },
      { q: 'What about parallel parking in tight spaces?', a: 'The tighter the space, the higher the risk. Document before you attempt any parallel parking maneuver on a busy street.' },
    ],
  },
  'valet-parking-scenario': {
    display: 'Valet Parking',
    title: 'Protect Your Car at Valet Parking — Full Guide',
    metaDesc: 'Your complete guide to valet parking protection. AI-verified scans, QR handover proof, and AI comparison at pickup. Free, no app.',
    paragraphs: [
      'Valet parking combines all the risks of parking with the complication of a third party handling your vehicle. When you hand your keys to a valet, you\'re entering an implicit bailment agreement — they take possession of your car and owe you a duty of care. But proving a breach of that duty requires documented evidence of condition before and after.',
      'Most valet tickets include liability disclaimers printed in small type. Even with those disclaimers, gross negligence cannot be disclaimed. But without proof of your car\'s condition before the valet took it, you have no foundation for any claim.',
      'CarShake creates that foundation in 60 seconds. The QR-based handover creates a mutual digital signature — both you and the valet agree on the car\'s documented condition. When you return, AI comparison catches every new scratch, dent, and ding. This is the evidence that changes valet damage disputes.',
    ],
    faqs: [
      { q: 'Can the valet refuse my QR code?', a: 'Most valets appreciate documented condition because it protects them from false claims too. If they refuse, your pre-parking documentation is still valuable evidence.' },
      { q: 'Should I scan at pickup too?', a: 'Yes. The before-and-after pair is the most powerful evidence combination. Always scan both when dropping off and picking up.' },
    ],
  },
  'parking-lot': {
    display: 'Parking Lot',
    title: 'Protect Your Car in Any Parking Lot — CarShake',
    metaDesc: 'Parking lots cause door dings, shopping cart damage, and bumper bumps. Document your car before parking at any lot, garage, or structure.',
    paragraphs: [
      'Parking lots are the #1 location for vehicle damage in America. Door dings from adjacent cars, shopping cart collisions, bumper bumps from poorly parked vehicles, and even structural damage from low clearance barriers. Unlike a valet situation, there\'s no attendant to hold accountable — the damage just appears while you\'re away.',
      'Insurance claims for parking lot damage are notoriously difficult because you can rarely prove when the damage happened. A door ding could have been there for weeks. Without before-parking documentation, you\'re left with your word against an absent driver.',
      'CarShake gives you the evidence you need. Document your car before entering any parking lot — grocery store, mall, office, stadium, or garage. The 60-second scan creates a complete record. When you return, scan again and AI compares every angle. New damage is flagged immediately with precision.',
    ],
    faqs: [
      { q: 'How is this different from just taking photos?', a: 'CarShake photos have GPS coordinates, server-verified timestamps, and SHA-256 hashing. Random phone photos lack this evidence chain. The AI comparison also catches damage you might miss with the naked eye.' },
      { q: 'Do I need to scan every time I park?', a: 'For high-risk situations (crowded lots, tight spaces, long-term parking), we recommend scanning. For quick errands, assess the risk.' },
    ],
  },
  'night-parking': {
    display: 'Night Parking',
    title: 'Night Parking Protection — CarShake',
    metaDesc: 'Parking at night increases damage risk. AI-verified car scans work in low light. Document before parking after dark.',
    paragraphs: [
      'Parking at night introduces unique risks: reduced visibility for parking maneuvers, tired drivers with impaired judgment, dimly lit parking structures, and the inability to inspect your car properly at pickup. Damage that occurs overnight is often discovered the next morning with no way to trace it.',
      'Street parking overnight is especially risky. Hit-and-run damage from passing traffic, vandalism, and parking structure collisions are more common at night. When you discover damage in the morning, you have no proof it wasn\'t there the night before.',
      'CarShake gives you documented proof before you leave your car overnight. Scan under available lighting — our AI processes images in various light conditions. When you return, scan again in daylight for the best AI comparison results.',
    ],
    faqs: [
      { q: 'Does CarShake work in the dark?', a: 'CarShake works best in adequate lighting. For best results at night, use available street lights or your phone\'s flash. The AI comparison will be most accurate if both scans are in similar lighting.' },
      { q: 'What about overnight airport parking?', a: 'Overnight airport parking is a perfect use case. Scan before entering the lot. When you return from your trip, scan again in daylight for comprehensive AI comparison.' },
    ],
  },
  'event-valet': {
    display: 'Event & Concert Valet',
    title: 'Protect Your Car at Event & Concert Valet — CarShake',
    metaDesc: 'Concerts, sporting events, and festivals create chaotic valet conditions. AI-verified documentation before and after big events.',
    paragraphs: [
      'Event valet parking — at concerts, sporting events, festivals, and galas — creates the highest-stress parking environment. Thousands of cars arriving simultaneously, hurried attendants, tight temporary parking areas, and exhausted drivers leaving late at night after hours of standing. This combination maximizes the risk of vehicle damage and minimizes the likelihood it will be reported or resolved.',
      'The peak congestion at event valet means your car may be handled by multiple attendants over the course of the event, moved between parking areas, and parked in temporary lots with non-standard configurations. Each handoff is a new risk point.',
      'CarShake protects you through every handoff. One 60-second scan before you hand your keys documents your car\'s complete condition. The AI comparison when you return catches any damage from the event\'s chaotic parking operation — with the evidence chain to prove it wasn\'t there before.',
    ],
    faqs: [
      { q: 'Should I scan before and after events?', a: 'Yes. The before scan documents your car before the event. The after scan catches any new damage. If you\'re arriving and leaving at different times of day, make sure lighting is comparable.' },
      { q: 'What if the event lot is very crowded?', a: 'Even better reason to scan. Crowded temporary lots have the highest damage risk. Take the extra minute to document before handing your keys.' },
    ],
  },
  'tailgating': {
    display: 'Tailgating & Game Day',
    title: 'Protect Your Car at Tailgates & Game Day — CarShake',
    metaDesc: 'Tailgating events cause bumper dings, door dents, and food/drink stains. Document your car before game day parking.',
    paragraphs: [
      'Tailgating and game day parking are among the most hazardous environments for your vehicle. Thousands of cars parked in tight grid formations, people walking between vehicles with food and drinks, games of catch, open tailgates, and the general chaos of pre-game celebration create countless opportunities for accidental damage.',
      'Bumper-to-bumper parking in grass fields or gravel lots means door dings are almost guaranteed. People bumping into vehicles, leaning against them for photos, and setting up tailgate tables against bumpers all cause damage that you\'ll discover only when you pack up to leave.',
      'CarShake documents your car before you enter the parking area. Scan all 8 angles in 60 seconds, including tailgate area, front and rear bumpers, and both sides. When game\'s over, scan again. Any new dings, dents, or scratches are flagged by our AI comparison.',
    ],
    faqs: [
      { q: 'How do I scan in a crowded lot?', a: 'Arrive early and scan before the lot fills up. The 60-second scan needs clear access to all 8 angles.' },
      { q: 'Should I scan my tailgate area separately?', a: 'Yes. The tailgate/trunk area is especially vulnerable during tailgates. Make sure you get clear shots of the rear bumper and tailgate surface.' },
    ],
  },
};

const ScenarioPage = () => {
  const { scenarioName } = useParams<{ scenarioName: string }>();
  const data = scenarioName ? SCENARIOS[scenarioName.toLowerCase()] : undefined;
  const displayName = data?.display || '';
  const canonicalSlug = scenarioName?.toLowerCase() || '';

  if (!data || !scenarioName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="text-center">
          <p className="font-body text-body text-lg mb-4">Scenario guide not found.</p>
          <Link to="/" className="text-gold font-body font-semibold">← Back to CarShake</Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: data.title,
    description: data.metaDesc,
    about: displayName,
  };

  return (
    <div className="min-h-screen bg-page">
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.metaDesc} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.metaDesc} />
        <link rel="canonical" href={`https://carshake.online/scenario/${canonicalSlug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <header className="px-4 py-4 border-b border-border bg-white">
        <div className="max-w-[720px] mx-auto flex items-center gap-4">
          <Link to="/" className="font-display text-xl font-bold text-gold">CarShake</Link>
          <Link to="/" className="text-sm font-body text-muted-custom hover:text-gold transition">← Home</Link>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-4 py-10">
        <nav className="text-xs font-body text-muted-custom mb-6">
          <Link to="/" className="hover:text-gold">Home</Link>
          {' / '}
          <span className="text-ink">{displayName}</span>
        </nav>

        <h1 className="font-display text-[28px] font-bold text-ink mb-4 leading-tight">{data.title}</h1>

        {data.paragraphs.map((p, i) => (
          <p key={i} className="font-body text-[15px] text-body leading-relaxed mb-5">{p}</p>
        ))}

        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-ink mb-4">❓ Frequently Asked Questions</h2>
          <div className="space-y-3">
            {data.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-[14px] border border-border p-4">
                <h3 className="font-display text-[15px] font-bold text-ink mb-1">{faq.q}</h3>
                <p className="font-body text-sm text-body">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="my-10 p-6 rounded-[14px] border-2 border-gold bg-gold-subtle text-center">
          <p className="font-display text-lg font-bold text-ink mb-2">Protect your car in every scenario.</p>
          <p className="font-body text-sm text-body mb-4">60 seconds. AI-verified. Free.</p>
          <a
            href="/#demo"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
            onClick={() => track('cta_clicked', { location: 'scenario-page', scenario: canonicalSlug })}
          >
            🛡️ Try CarShake — Free
          </a>
        </div>

        <div className="text-center">
          <Link to="/" className="text-gold font-body font-semibold text-sm">← Back to CarShake Home</Link>
        </div>
      </main>

      <footer className="bg-dark py-8 px-4 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display text-gold text-lg font-bold mb-1">CarShake</p>
          <div className="flex justify-center gap-4 text-muted-custom text-sm font-body mb-2 text-center">
            <Link to="/how-it-works" className="hover:text-gold">How It Works</Link>
            <Link to="/pricing" className="hover:text-gold">Pricing</Link>
            <Link to="/faq" className="hover:text-gold">FAQ</Link>
            <Link to="/city" className="hover:text-gold">City Guides</Link>
          </div>
          <p className="text-muted-custom text-sm font-body">© 2026 CarShake · carshake.online · <a href="https://x.com/sipiteno" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">X</a></p>
        </div>
      </footer>
    </div>
  );
};

export default ScenarioPage;
