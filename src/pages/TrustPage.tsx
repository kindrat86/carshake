import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { track } from '@/lib/posthog';

const TrustPage = () => (
  <div className="min-h-screen bg-page">
    <Helmet>
      <title>Security & Trust — CarShake Data Protection</title>
      <meta name="description" content="How CarShake protects your car condition data: SHA-256 encryption, GPS verification, zero-app architecture, and tamper-proof evidence chain." />
      <meta property="og:title" content="Security & Trust — CarShake Data Protection" />
      <meta property="og:description" content="How CarShake protects your car condition data with SHA-256 encryption, GPS verification, and zero-app architecture." />
      <link rel="canonical" href="https://carshake.online/trust" />
    </Helmet>

    <header className="px-4 py-4 border-b border-border bg-white">
      <div className="max-w-[720px] mx-auto">
        <Link to="/" className="font-display text-xl font-bold text-gold">CarShake</Link>
      </div>
    </header>

    <main className="max-w-[720px] mx-auto px-4 py-10">
      <nav className="text-xs font-body text-muted-custom mb-6">
        <Link to="/" className="hover:text-gold">Home</Link>
        {' / '}
        <span className="text-ink">Trust & Security</span>
      </nav>

      <h1 className="font-display text-[28px] font-bold text-ink mb-6 leading-tight">How We Protect Your Data</h1>

      <div className="space-y-5 mb-8">
        <div className="bg-white rounded-[14px] border border-border p-5">
          <h2 className="font-display text-base font-bold text-ink mb-2">🔒 SHA-256 Evidence Chain</h2>
          <p className="font-body text-sm text-body">Each photo is cryptographically hashed with SHA-256 at the moment of capture. This creates an unalterable fingerprint of your evidence that proves the photo hasn't been modified since capture. Any tampering would break the hash chain, making manipulation immediately detectable.</p>
        </div>
        <div className="bg-white rounded-[14px] border border-border p-5">
          <h2 className="font-display text-base font-bold text-ink mb-2">📍 GPS & Timestamp Verification</h2>
          <p className="font-body text-sm text-body">Every scan records GPS coordinates, device orientation, and a server-verified Unix timestamp. This independently confirmable metadata establishes exactly where and when your car was documented — critical for evidentiary purposes.</p>
        </div>
        <div className="bg-white rounded-[14px] border border-border p-5">
          <h2 className="font-display text-base font-bold text-ink mb-2">📱 Zero-App Architecture</h2>
          <p className="font-body text-sm text-body">CarShake runs entirely in the browser. No app to download, no account to create on the spot. All processing happens securely with no persistent storage on your device unless you choose to save scans. The attendant also needs zero setup — just a phone camera to scan your QR code.</p>
        </div>
        <div className="bg-white rounded-[14px] border border-border p-5">
          <h2 className="font-display text-base font-bold text-ink mb-2">🔐 Encrypted Storage & Transfer</h2>
          <p className="font-body text-sm text-body">All scan data is encrypted in transit (TLS 1.3) and at rest (AES-256). Only you and the specific parking attendant you authorize can access the record. We never share your scan data with third parties without explicit consent.</p>
        </div>
        <div className="bg-white rounded-[14px] border border-border p-5">
          <h2 className="font-display text-base font-bold text-ink mb-2">🛡️ Privacy by Design</h2>
          <p className="font-body text-sm text-body">We collect only what's needed to create your evidence record: photos, GPS location, and timestamp. We do not track your location between scans. We do not sell or share your data. Your car's condition data belongs to you — always.</p>
        </div>
      </div>

      <div className="my-10 p-6 rounded-[14px] border-2 border-gold bg-gold-subtle text-center">
        <p className="font-display text-lg font-bold text-ink mb-2">Trust starts with protection.</p>
        <p className="font-body text-sm text-body mb-4">Try CarShake free — your data is yours.</p>
        <a
          href="/#demo"
          className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
          onClick={() => track('cta_clicked', { location: 'security' })}
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
        <p className="text-muted-custom text-sm font-body">© 2026 CarShake · carshake.online · <a href="https://x.com/sipiteno" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">X</a></p>
      </div>
    </footer>
  </div>
);

export default TrustPage;
