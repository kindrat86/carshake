import { useState } from 'react';
import AuthModal from '@/components/AuthModal';

const Business = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page">
      {/* Hero */}
      <section className="px-4 pt-16 pb-12">
        <div className="max-w-[680px] mx-auto text-center">
          <h1 className="font-display hero-h1 text-ink mb-4">
            Your customers are already documenting their cars.
          </h1>
          <h2 className="font-display text-xl font-bold mb-6">
            <em className="text-gold italic">Be part of the record — or be surprised by it.</em>
          </h2>
          <p className="text-body font-body text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Car owners are using CarShake at your facility right now. They're photographing their cars,
            generating QR codes, and building evidence chains. When a dispute happens, they'll have proof. Will you?
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className="w-full max-w-[420px] min-h-[52px] rounded-[12px] bg-gold text-white font-body font-semibold text-base hover:bg-gold-dark transition"
          >
            Start 14-Day Free Trial — $19.97/mo after
          </button>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-surface px-4 py-12">
        <div className="max-w-[680px] mx-auto grid gap-6">
          {[
            { icon: '🛡️', title: 'Protect your business', body: 'One false damage claim costs $2,000-10,000. CarShake gives your staff the same signed evidence your customers have.' },
            { icon: '📊', title: 'See everything', body: 'Dashboard showing every scan at your location. Know what\'s being documented. No surprises.' },
            { icon: '👥', title: 'Staff accountability', body: 'Each valet gets their own account. See who scanned what, when. Confirmation rates. Performance metrics.' },
          ].map((v) => (
            <div key={v.title} className="bg-white rounded-card border border-border p-4 shadow-card">
              <div className="text-2xl mb-2">{v.icon}</div>
              <h3 className="font-display text-lg font-bold text-ink mb-1">{v.title}</h3>
              <p className="text-sm font-body text-body">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-12">
        <div className="max-w-[440px] mx-auto">
          <div className="bg-white rounded-card border-2 border-gold p-6 shadow-card text-center">
            <h3 className="font-display text-xl font-bold text-ink mb-1">Pro</h3>
            <p className="font-display text-4xl font-bold text-gold mb-4">$19.97<span className="text-sm font-body text-muted-custom">/mo</span></p>
            <ul className="text-sm font-body text-body space-y-1 mb-6 text-left">
              {['Location dashboard', 'Staff accounts (5)', 'Branded QR codes', 'Scan analytics', 'Dispute management', 'Customer trust badge', 'Priority support'].map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <button
              onClick={() => setAuthOpen(true)}
              className="w-full min-h-[52px] rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
            >
              Start Free Trial →
            </button>
            <p className="text-xs font-body text-muted-custom mt-3">14-day free trial · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark py-12 px-4">
        <div className="max-w-[680px] mx-auto text-center">
          <h3 className="font-display text-gold text-xl font-bold mb-2">CarShake</h3>
          <p className="text-muted-custom text-sm font-body mb-6">Both sides sign. Both sides are protected.</p>
          <p className="text-muted-custom text-xs font-body">© 2026 CarShake · carshake.online</p>
        </div>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

export default Business;
