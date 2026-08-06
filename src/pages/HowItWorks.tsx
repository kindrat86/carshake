import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { track } from '@/lib/posthog';

const HowItWorks = () => {
  const steps = [
    { num: 1, icon: '📸', title: 'Scan — 60 seconds', desc: 'Walk around your car and snap 8 photos from the designated angles. GPS and timestamp are automatically recorded with each photo.' },
    { num: 2, icon: '🔗', title: 'Share — QR Link', desc: 'Generate a QR code unique to your scan. The parking attendant scans it with any phone camera — no app download needed on either side.' },
    { num: 3, icon: '✅', title: 'Confirm — Both Sign', desc: 'The valet taps "Confirm" in their browser, digitally agreeing to your car\'s documented condition. Both sides get a copy of the signed record.' },
    { num: 4, icon: '🔄', title: 'Return — AI Compare', desc: 'When you pick up your car, scan again from the same angles. AI analyzes every angle and flags new damage — with location, severity, and a confidence score.' },
    { num: 5, icon: '🛡️', title: 'Protected — Admissible Proof', desc: 'If damage is found, you have SHA-256 hashed, timestamped, GPS-verified evidence. A complete evidence chain that changes how valet damage disputes are resolved.' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How CarShake Works',
    description: 'Protect your car at valet parking in 60 seconds with AI-verified condition scans.',
    step: steps.map(s => ({
      '@type': 'HowToStep',
      position: s.num,
      name: s.title,
      text: s.desc,
    })),
  };

  return (
    <div className="min-h-screen bg-page">
      <Helmet>
        <title>How CarShake Works — AI Valet Protection in 60 Seconds</title>
        <meta name="description" content="CarShake documents your car's condition before and after valet parking. 60-second scan, QR handover, AI comparison. Free, no app download." />
        <meta property="og:title" content="How CarShake Works — AI Valet Protection in 60 Seconds" />
        <meta property="og:description" content="CarShake documents your car's condition before and after valet parking. 60-second scan, QR handover, AI comparison." />
        <link rel="canonical" href="https://carshake.online/how-it-works" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <header className="px-4 py-4 border-b border-border bg-white">
        <div className="max-w-[720px] mx-auto">
          <Link to="/" className="font-display text-xl font-bold text-gold">CarShake</Link>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-4 py-12">
        <nav className="text-xs font-body text-muted-custom mb-6">
          <Link to="/" className="hover:text-gold">Home</Link>
          {' / '}
          <span className="text-ink">How It Works</span>
        </nav>

        <h1 className="font-display text-[32px] font-bold text-ink mb-3 leading-tight">How CarShake Works</h1>
        <p className="font-body text-[15px] text-body leading-relaxed mb-10">
          Five steps. 60 seconds average scan time. No app to download. No account to create on the spot.
        </p>

        <div className="space-y-6 mb-12">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-[14px] border border-border p-5 flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-subtle flex items-center justify-center">
                <span className="text-lg">{step.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-gold text-white text-xs font-bold flex items-center justify-center">{step.num}</span>
                  <h2 className="font-display text-base font-bold text-ink">{step.title}</h2>
                </div>
                <p className="font-body text-sm text-body leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Technology section */}
        <div className="bg-white rounded-[14px] border border-border p-6 mb-8">
          <h2 className="font-display text-lg font-bold text-ink mb-3">🔬 The Technology</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-display text-[15px] font-bold text-ink">AI Comparison Engine</h3>
              <p className="font-body text-sm text-body">Our AI analyzes before-and-after photos angle by angle, detecting scratches, dents, curb rash, paint transfer, and other damage types with high precision.</p>
            </div>
            <div>
              <h3 className="font-display text-[15px] font-bold text-ink">SHA-256 Evidence Chain</h3>
              <p className="font-body text-sm text-body">Every photo is hashed with SHA-256 at the moment of capture, creating a tamper-proof chain of custody that meets the standard for digital evidence.</p>
            </div>
            <div>
              <h3 className="font-display text-[15px] font-bold text-ink">GPS & Timestamp Verification</h3>
              <p className="font-body text-sm text-body">Each scan records GPS coordinates, device orientation, and a server-verified timestamp — so location and time of documentation are independently confirmable.</p>
            </div>
            <div>
              <h3 className="font-display text-[15px] font-bold text-ink">Zero-App Architecture</h3>
              <p className="font-body text-sm text-body">CarShake works entirely in the browser. No app store, no download, no account creation. The scanning and QR handover happen in your phone's web browser.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="my-10 p-6 rounded-[14px] border-2 border-gold bg-gold-subtle text-center">
          <p className="font-display text-lg font-bold text-ink mb-2">Ready to protect your car?</p>
          <p className="font-body text-sm text-body mb-4">It's free. Takes 60 seconds. No app download.</p>
          <a
            href="/#demo"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
            onClick={() => track('cta_clicked', { location: 'how-it-works' })}
          >
            🛡️ Try CarShake Now — Free
          </a>
        </div>

        <div className="text-center">
          <Link to="/" className="text-gold font-body font-semibold text-sm">← Back to CarShake Home</Link>
        </div>
      </main>

      <footer className="bg-dark py-8 px-4 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display text-gold text-lg font-bold mb-1">CarShake</p>
          <div className="flex justify-center gap-4 text-muted-custom text-sm font-body mb-2">
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

export default HowItWorks;
