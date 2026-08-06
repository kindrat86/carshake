import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const VEHICLE_TYPES = [
  { slug: 'suv', display: 'SUV', icon: '🚙', desc: 'Escalade, Tahoe, Explorer, Grand Cherokee, and all SUVs' },
  { slug: 'sedan', display: 'Sedan', icon: '🚗', desc: 'Civic, Camry, S-Class, 3-Series, and all sedans' },
  { slug: 'truck', display: 'Pickup Truck', icon: '🛻', desc: 'F-150, Silverado, RAM, Tacoma, and all trucks' },
  { slug: 'luxury', display: 'Luxury & Exotic', icon: '🏎️', desc: 'Ferrari, Lamborghini, Bentley, Rolls-Royce, McLaren' },
  { slug: 'ev', display: 'Electric Vehicle', icon: '⚡', desc: 'Tesla, Rivian, Lucid, Porsche Taycan, Mustang Mach-E' },
  { slug: 'minivan', display: 'Minivan / Family SUV', icon: '🚐', desc: 'Odyssey, Sienna, Pacifica, Grand Highlander' },
];

const VehicleIndex = () => (
  <div className="min-h-screen bg-page">
    <Helmet>
      <title>Vehicle-Specific Valet Parking Protection — CarShake</title>
      <meta name="description" content="Find the right valet protection guide for your vehicle type. SUV, sedan, truck, luxury, EV, and family vehicle guides with AI-verified condition scans." />
    </Helmet>

    <header className="px-4 py-6 border-b border-border bg-white">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="font-display text-xl font-bold text-gold mb-4 block">CarShake</Link>
        <h1 className="font-display text-[28px] font-bold text-ink">Vehicle-Specific Valet Guides</h1>
        <p className="font-body text-[15px] text-muted-custom mt-1">Protect your specific vehicle type at valet parking</p>
      </div>
    </header>

    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {VEHICLE_TYPES.map((vt) => (
          <Link
            key={vt.slug}
            to={`/vehicle/${vt.slug}`}
            className="bg-white rounded-[14px] border border-border p-5 hover:shadow-lg hover:border-gold/30 transition group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{vt.icon}</span>
              <div>
                <h2 className="font-display text-base font-bold text-ink group-hover:text-gold transition">
                  {vt.display}
                </h2>
                <p className="font-body text-xs text-muted-custom mt-1">{vt.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="my-12 p-6 rounded-[14px] border-2 border-gold bg-gold-subtle text-center">
        <p className="font-display text-lg font-bold text-ink mb-2">Your vehicle not listed?</p>
        <p className="font-body text-sm text-body mb-4">CarShake works for any vehicle type. Scan in 60 seconds, no app needed.</p>
        <a
          href="/#demo"
          className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
        >
          🛡️ Try CarShake — Free on Any Vehicle
        </a>
      </div>

      <div className="text-center">
        <Link to="/" className="text-gold font-body font-semibold text-sm">← Back to CarShake Home</Link>
      </div>
    </main>

    <footer className="bg-dark py-8 px-4 mt-12">
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-display text-gold text-lg font-bold mb-1">CarShake</p>
        <p className="text-muted-custom text-sm font-body">© 2026 CarShake · carshake.online</p>
      </div>
    </footer>
  </div>
);

export default VehicleIndex;
