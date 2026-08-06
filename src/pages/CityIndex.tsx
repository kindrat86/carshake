import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const CITIES_LIST = [
  { slug: 'new-york', display: 'New York City', state: 'NY' },
  { slug: 'los-angeles', display: 'Los Angeles', state: 'CA' },
  { slug: 'chicago', display: 'Chicago', state: 'IL' },
  { slug: 'houston', display: 'Houston', state: 'TX' },
  { slug: 'phoenix', display: 'Phoenix', state: 'AZ' },
  { slug: 'san-francisco', display: 'San Francisco', state: 'CA' },
  { slug: 'miami', display: 'Miami', state: 'FL' },
  { slug: 'las-vegas', display: 'Las Vegas', state: 'NV' },
  { slug: 'dallas', display: 'Dallas', state: 'TX' },
  { slug: 'san-diego', display: 'San Diego', state: 'CA' },
  { slug: 'boston', display: 'Boston', state: 'MA' },
  { slug: 'seattle', display: 'Seattle', state: 'WA' },
  { slug: 'denver', display: 'Denver', state: 'CO' },
  { slug: 'atlanta', display: 'Atlanta', state: 'GA' },
  { slug: 'washington-dc', display: 'Washington DC', state: 'DC' },
  { slug: 'nashville', display: 'Nashville', state: 'TN' },
  { slug: 'austin', display: 'Austin', state: 'TX' },
  { slug: 'portland', display: 'Portland', state: 'OR' },
  { slug: 'orlando', display: 'Orlando', state: 'FL' },
  { slug: 'philadelphia', display: 'Philadelphia', state: 'PA' },
  { slug: 'charlotte', display: 'Charlotte', state: 'NC' },
  { slug: 'detroit', display: 'Detroit', state: 'MI' },
  { slug: 'minneapolis', display: 'Minneapolis', state: 'MN' },
  { slug: 'san-antonio', display: 'San Antonio', state: 'TX' },
  { slug: 'sacramento', display: 'Sacramento', state: 'CA' },
  { slug: 'tampa', display: 'Tampa', state: 'FL' },
  { slug: 'pittsburgh', display: 'Pittsburgh', state: 'PA' },
  { slug: 'baltimore', display: 'Baltimore', state: 'MD' },
  { slug: 'indianapolis', display: 'Indianapolis', state: 'IN' },
  { slug: 'kansas-city', display: 'Kansas City', state: 'MO' },
  { slug: 'columbus', display: 'Columbus', state: 'OH' },
  { slug: 'milwaukee', display: 'Milwaukee', state: 'WI' },
  { slug: 'cleveland', display: 'Cleveland', state: 'OH' },
  { slug: 'salt-lake-city', display: 'Salt Lake City', state: 'UT' },
  { slug: 'raleigh', display: 'Raleigh', state: 'NC' },
  { slug: 'memphis', display: 'Memphis', state: 'TN' },
  { slug: 'richmond', display: 'Richmond', state: 'VA' },
  { slug: 'new-orleans', display: 'New Orleans', state: 'LA' },
  { slug: 'honolulu', display: 'Honolulu', state: 'HI' },
  { slug: 'anchorage', display: 'Anchorage', state: 'AK' },
];

const CityIndex = () => (
  <div className="min-h-screen bg-page">
    <Helmet>
      <title>Valet Parking Protection by City — CarShake City Guides</title>
      <meta name="description" content="Find your city guide for protecting your car at valet parking. AI-verified car condition scans available in 40+ US cities." />
    </Helmet>

    <header className="px-4 py-6 border-b border-border bg-white">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="font-display text-xl font-bold text-gold mb-4 block">CarShake</Link>
        <h1 className="font-display text-[28px] font-bold text-ink">City Valet Protection Guides</h1>
        <p className="font-body text-[15px] text-muted-custom mt-1">Protect your car at valet parking in cities across America</p>
      </div>
    </header>

    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CITIES_LIST.map((city) => (
          <Link
            key={city.slug}
            to={`/city/${city.slug}`}
            className="bg-white rounded-[14px] border border-border p-4 hover:shadow-lg hover:border-gold/30 transition group"
          >
            <h2 className="font-display text-base font-bold text-ink group-hover:text-gold transition">
              {city.display}
            </h2>
            <p className="font-body text-xs text-muted-custom mt-1">{city.state}</p>
          </Link>
        ))}
      </div>

      <div className="my-12 p-6 rounded-[14px] border-2 border-gold bg-gold-subtle text-center">
        <p className="font-display text-lg font-bold text-ink mb-2">Your city not listed?</p>
        <p className="font-body text-sm text-body mb-4">CarShake works everywhere. Scan your car before valet in any city.</p>
        <a
          href="/#demo"
          className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
        >
          🛡️ Try CarShake — Free in Any City
        </a>
      </div>

      <div className="text-center mt-8">
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

export default CityIndex;
