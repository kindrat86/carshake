import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { track } from '@/lib/posthog';

const VEHICLES: Record<string, {
  display: string;
  title: string;
  metaDesc: string;
  paragraphs: string[];
  faqs: { q: string; a: string }[];
  riskFactors: string[];
}> = {
  'suv': {
    display: 'SUV',
    title: 'Protect Your SUV at Valet Parking — CarShake',
    metaDesc: 'SUVs are high-value valet targets. AI-verified condition scans before & after. Document your Escalade, Tahoe, or Grand Cherokee in 60 seconds.',
    paragraphs: [
      'SUVs are the most common vehicle at valet stands — from high-volume hotel lots to upscale restaurant valet. Their size, weight, and price tag make every parking interaction a risk. A $80,000+ Escalade or Tahoe in a tight parking garage means blind spots, curb contact, and door dings from adjacent vehicles.',
      'Taller ride height means parking garage clearance bars, low-hanging pipes, and cement ceiling beams are a constant threat. Roof rails, crossbars, and panoramic sunroofs add vulnerable points that standard inspections miss. An attendant unfamiliar with your SUV\'s dimensions can easily scrape the roof against a clearance bar.',
      'CarShake captures all vulnerable angles in 60 seconds. The 8-angle scan includes roof clearance markers, side mirror protrusion, running boards, and rear bumper overhang — the exact spots SUVs get damaged at valet. AI comparison between entry and exit scans catches every new scrape, dent, and scratch.',
    ],
    faqs: [
      { q: 'Are SUVs more likely to get damaged at valet?', a: 'Yes. SUVs are taller, wider, and heavier than sedans, making them harder to maneuver in tight parking garages. The higher center of gravity also means more body roll and potential curb contact on spiral ramps.' },
      { q: 'Can CarShake scan my truck or large SUV?', a: 'Absolutely. The 8-angle scan covers vehicles of any size. For oversized vehicles, we recommend slightly more distance for the roof and clearance shots.' },
      { q: 'Should I scan the roof of my SUV?', a: 'Yes. Roof clearance damage is one of the most common SUV-specific issues in parking garages with low clearance bars. Include the roof line in your scan.' },
    ],
    riskFactors: ['Roof clearance bars in garages', 'Running board and side step damage', 'Wider body prone to door dings', 'Rear tire curb contact on ramps', 'Trailer hitch and rear bumper protrusion'],
  },
  'sedan': {
    display: 'Sedan',
    title: 'Protect Your Sedan at Valet Parking — CarShake',
    metaDesc: 'Compact and mid-size sedans get overlooked in parking lots. AI-verified documentation catches every valet scratch before and after.',
    paragraphs: [
      'Sedans — from compact Civics to full-size S-Class Mercedes — are the most valet-parked vehicles in America. Their lower profile means bumpers, side skirts, and front air dams are closest to curbs and parking stops, making them the first point of contact in every parking maneuver.',
      'A valet handling dozens of cars per shift may not notice a front bumper scrape against a curb or a side mirror contact with a garage pillar. Without documented proof of pre-existing condition, these "minor" damages become your repair bill.',
      'CarShake\'s 8-angle scan covers every vulnerable point on your sedan: front bumper overhang, side mirror protrusion, door edges, wheel rims, and rear bumper. The AI comparison detects even subtle paint transfer and clear coat scratches that are invisible in parking lot lighting.',
    ],
    faqs: [
      { q: 'What are the most common sedan parking damages?', a: 'Front bumper curb scrapes (especially on lowered or sport-trim sedans), side mirror impact, door edge dings, and side skirt contact with parking curbs.' },
      { q: 'Should I scan my luxury sedan?', a: 'Especially yes. Luxury sedans (BMW 7-series, Mercedes S-Class, Audi A8) are high-value targets for valet damage claims. The cost of a single bumper repaint can exceed $2,000, making documentation essential.' },
    ],
    riskFactors: ['Low front bumper curb contact', 'Side skirt scraping on parking blocks', 'Side mirror garage pillar impact', 'Door edge dings from adjacent cars', 'Rear bumper overhang clearance'],
  },
  'truck': {
    display: 'Pickup Truck',
    title: 'Protect Your Pickup Truck at Valet — CarShake',
    metaDesc: 'Full-size trucks have unique valet risks: bed rails, tailgates, and step bars. AI-verified documentation in 60 seconds.',
    paragraphs: [
      'Pickup trucks are increasingly found at hotel and resort valet lots — especially in states like Texas, California, and Florida. Their long wheelbase, high bed sides, and heavy-duty construction don\'t exempt them from parking damage. In fact, their unusual dimensions create unique vulnerability points.',
      'Truck beds, tailgates, and bed rail caps are common damage points that standard walk-around inspections miss. A valet backing a long-bed F-150 into a tight spot may scrape the rear bumper against a concrete pillar or catch a bed rail on a garage ceiling sprinkler.',
      'CarShake captures all angles including your truck bed, tailgate (open and closed), step bars or running boards, and the clearance height. The 60-second scan documents your truck\'s condition so completely that no new damage goes uncaught at pickup.',
    ],
    faqs: [
      { q: 'Do trucks really get valet-parked?', a: 'Absolutely. Hotels, resorts, restaurants, and event venues all park trucks. Florida, Texas, and Western states see heavy truck valet traffic, especially at luxury resorts and golf clubs.' },
      { q: 'Should I scan the truck bed?', a: 'Yes. Bed rail damage, tailgate dings, and liner damage are common. CarShake\'s 8-angle scan covers the entire perimeter, including the bed and tailgate.' },
      { q: 'What about lifted trucks?', a: 'Lifted trucks have additional risks: garage clearance issues, step bar damage, and oversized tire rub. Document all modifications before valet handover.' },
    ],
    riskFactors: ['Long wheelbase ramp scraping', 'Tailgate and bed rail damage', 'Step bar curb contact', 'Garage sprinkler/celling contact', 'Trailer hitch protrusion'],
  },
  'luxury': {
    display: 'Luxury & Exotic',
    title: 'Protect Your Luxury or Exotic Car at Valet — CarShake',
    metaDesc: 'Lamborghini, Ferrari, Bentley, Rolls-Royce. Protect 6-figure investments at valet with AI-verified condition scans.',
    paragraphs: [
      'If you drive a luxury or exotic car, every valet interaction is a $100,000+ risk. A single curb scrape on a Lamborghini front splitter costs $5,000+ to repair. A door ding on a Ferrari 488 door panel can require a full repaint. The stakes are exponentially higher, yet most owners have no structured documentation process.',
      'Exotic cars attract attention at valet stands — and not always the good kind. Their low ground clearance, wide body panels, and expensive carbon fiber components make them uniquely vulnerable. A valet unfamiliar with a McLaren\'s nose lift system or a Porsche 911\'s front spoiler can cause thousands in damage in seconds.',
      'CarShake gives you professional-grade documentation in 60 seconds. Capture every vulnerable angle: carbon fiber splitters, side skirts, air intakes, wheel lips, and the entire underbody visible from the curb. The SHA-256 verified evidence chain creates an unbreakable record that protects your investment.',
    ],
    faqs: [
      { q: 'Is CarShake secure for high-value vehicles?', a: 'Yes. Photos are encrypted in transit and storage with SHA-256 hashing. Only you and the verified attendant can access the record. No third party sees your car scan unless you share it.' },
      { q: 'What about low-clearance exotics?', a: 'CarShake\'s scan includes clearance documentation. Capture the front splitter height, side skirt clearance, and rear diffuser. These are the most expensive valet damage points on exotics.' },
      { q: 'Can I use CarShake at concours and car events?', a: 'Yes. Many collectors use CarShake at car shows, track days, and concours events to document condition before and after transport or display.' },
    ],
    riskFactors: ['Carbon fiber splitter and diffuser damage', 'Low ground clearance scraping', 'Wide body panel door dings', 'Expensive wheel and tire contact', 'Side skirt and rocker panel scraping'],
  },
  'ev': {
    display: 'Electric Vehicle',
    title: 'Protect Your EV at Valet Parking — CarShake',
    metaDesc: 'Tesla, Rivian, Lucid, Porsche Taycan. AI-verified EV scans document unique valet risks: charging ports, glass roofs, and sensors.',
    paragraphs: [
      'Electric vehicles present unique valet parking risks. Glass roofs, flush door handles, charging ports, and sensor clusters are expensive to repair and easily damaged. A broken charging door on a Tesla costs $1,500+. A cracked glass roof on a Rivian can run $3,000+. Standard documentation won\'t capture these EV-specific vulnerability points.',
      'Many valets are unfamiliar with EV-specific features: how to open flush door handles without damaging paint, where charging ports are located, how to avoid pressure on glass roof panels, and the location of ultrasonic sensors and camera clusters. This unfamiliarity increases damage risk.',
      'CarShake\'s EV-specific scan path includes: all four corners of glass roof, charging port door (open and closed), flush door handle surrounds, sensor/camera positions on bumpers and fenders, and underbody battery pack clearance. The AI comparison is sensitive enough to detect charging port misalignment and glass micro-cracks.',
    ],
    faqs: [
      { q: 'Should I charge before or after scanning?', a: 'Scan before plugging in to document the charging port area. If possible, keep the charge port closed during valet to minimize risk of damage.' },
      { q: 'What about Tesla Sentry Mode?', a: 'Sentry Mode records video but doesn\'t create structured, admissible evidence of pre-existing condition. CarShake complements Sentry Mode by documenting before-and-after condition with GPS verification.' },
      { q: 'Are glass roofs really that vulnerable?', a: 'Yes. Glass roof panels on Teslas, Rivians, and other EVs are expensive panoramic components. Impact from garage clearance bars or falling debris can crack them. Document every corner before valet.' },
    ],
    riskFactors: ['Glass roof and panoramic sunroof cracks', 'Charging port door damage', 'Flush door handle paint wear', 'Sensor and camera cluster damage', 'Underbody battery pack clearance'],
  },
  'minivan': {
    display: 'Minivan / Family Vehicle',
    title: 'Protect Your Minivan or Family Vehicle at Valet — CarShake',
    metaDesc: 'Family vehicles get the most daily use and the least documentation. AI-verified scans protect your family car at valet.',
    paragraphs: [
      'Minivans and family vehicles are the workhorses of American roads — and the most likely to accumulate parking damage without anyone noticing. Sliding doors, roof racks, rear liftgates, and child seat anchor points are all vulnerable to valet damage that adds up over time.',
      'Family vehicles often carry roof boxes, bike racks, and other accessories that extend the vehicle\'s dimensions. A valet parking your minivan with a roof box may not account for the extra height, leading to garage ceiling contact. Hitch-mounted bike racks extend rear overhang by 3-5 feet.',
      'CarShake captures your vehicle with all accessories attached. Document the full profile including roof racks, bike racks, and any modifications. The 8-angle scan ensures every square inch is recorded before anyone else touches your family car.',
    ],
    faqs: [
      { q: 'Should I remove accessories before valet?', a: 'When possible, yes. If not, CarShake documents the full profile including accessories so any damage is clearly attributable to the valet.' },
      { q: 'Can CarShake scan a vehicle full of kids\' items?', a: 'Yes. The exterior scan doesn\'t require an empty vehicle. Just document the exterior condition in 60 seconds before handing over the keys.' },
      { q: 'Is minivan valet damage common?', a: 'Sliding door damage and rear hatch scraping are the most common minivan valet issues. Both are fully covered by CarShake\'s 8-angle scan.' },
    ],
    riskFactors: ['Sliding door track damage', 'Rear liftgate bumper contact', 'Roof rack and accessory clearance', 'Child seat anchor area scrape', 'Rear bumper sensor damage'],
  },
};

const VehiclePage = () => {
  const { vehicleType } = useParams<{ vehicleType: string }>();
  const data = vehicleType ? VEHICLES[vehicleType.toLowerCase()] : undefined;
  const displayName = data?.display || '';
  const canonicalSlug = vehicleType?.toLowerCase() || '';

  if (!data || !vehicleType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="text-center">
          <p className="font-body text-body text-lg mb-4">Vehicle guide not found.</p>
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
    about: `Protecting ${displayName} vehicles at valet parking`,
    author: { '@type': 'Organization', name: 'CarShake' },
  };

  return (
    <div className="min-h-screen bg-page">
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.metaDesc} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.metaDesc} />
        <link rel="canonical" href={`https://carshake.online/vehicle/${canonicalSlug}`} />
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
          <Link to="/how-it-works" className="hover:text-gold">Vehicle Guides</Link>
          {' / '}
          <span className="text-ink">{displayName}</span>
        </nav>

        <h1 className="font-display text-[28px] font-bold text-ink mb-3 leading-tight">
          {data.title}
        </h1>

        {data.paragraphs.map((p, i) => (
          <p key={i} className="font-body text-[15px] text-body leading-relaxed mb-5">{p}</p>
        ))}

        {/* Risk Factors */}
        <div className="bg-white rounded-[14px] border border-border p-5 mb-8">
          <h2 className="font-display text-base font-bold text-ink mb-3">⚠️ Top {displayName} Valet Risks</h2>
          <ul className="space-y-2">
            {data.riskFactors.map((rf, i) => (
              <li key={i} className="font-body text-sm text-body flex items-start gap-2">
                <span className="text-gold mt-0.5">•</span>
                {rf}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
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

        {/* CTA */}
        <div className="my-10 p-6 rounded-[14px] border-2 border-gold bg-gold-subtle text-center">
          <p className="font-display text-lg font-bold text-ink mb-2">Protect your {displayName} — it's free.</p>
          <p className="font-body text-sm text-body mb-4">60 seconds. 8 photos. AI-verified protection.</p>
          <a
            href="/#demo"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
            onClick={() => track('cta_clicked', { location: 'vehicle-page', vehicle: canonicalSlug })}
          >
            🛡️ Try CarShake — Free
          </a>
        </div>

        <div className="text-center">
          <Link to="/" className="text-gold font-body font-semibold text-sm">← Back to CarShake Home</Link>
        </div>
      </main>

      <footer className="bg-dark py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display text-gold text-lg font-bold mb-1">CarShake</p>
          <div className="flex justify-center gap-4 text-muted-custom text-sm font-body mb-2">
            <Link to="/how-it-works" className="hover:text-gold">How It Works</Link>
            <Link to="/pricing" className="hover:text-gold">Pricing</Link>
            <Link to="/faq" className="hover:text-gold">FAQ</Link>
            <Link to="/blog" className="hover:text-gold">Blog</Link>
          </div>
          <p className="text-muted-custom text-sm font-body">© 2026 CarShake · carshake.online</p>
        </div>
      </footer>
    </div>
  );
};

export default VehiclePage;
