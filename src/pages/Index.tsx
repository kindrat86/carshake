import { useSignupsCap } from '@/hooks/useSignupsCap';
import { lazy, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { track } from '@/lib/posthog';
import StickyBottomBar from '@/components/landing/StickyBottomBar';
import LandingJsonLd from '@/components/landing/LandingJsonLd';

const AuthModal = lazy(() => import('@/components/AuthModal'));
const LiveAIDemo = lazy(() => import('@/components/landing/LiveAIDemo'));
const LandingSections = lazy(() => import('@/components/landing/LandingSections'));
const ExitIntentPopup = lazy(() => import('@/components/landing/ExitIntentPopup'));

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { scansCount, spotsLeft } = useSignupsCap();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) localStorage.setItem('carshake_referral', ref);
  }, [searchParams]);

  return (
    <main className="bg-page min-h-screen">
      <LandingJsonLd />

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-20 pb-12 px-4">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] rounded-full bg-gradient-to-b from-gold/10 to-transparent blur-[100px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[350px] h-[300px] rounded-full bg-gradient-to-b from-gold/6 to-transparent blur-[80px] pointer-events-none" />

        <div className="max-w-[720px] mx-auto text-center relative z-10">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-body font-semibold mb-6 animate-in">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse-gold" />
            Free &amp; No Download — 2,100+ Cars Protected
          </div>

          {/* Hero heading */}
          <h1 className="font-display hero-h1 text-ink mb-6 animate-in">
            Never pay for valet damage{' '}
            <em className="text-gradient-gold font-display italic not-italic">
              you didn't cause.
            </em>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-body font-body leading-relaxed mb-8 max-w-xl mx-auto animate-in">
            CarShake creates a signed, timestamped, AI-verified record of your car's
            condition — confirmed by <strong>both you AND the parking attendant</strong>.
            <br className="hidden sm:block" />
            When you return, AI compares every angle. Disputes end before they start.
          </p>

          {/* CTA */}
          <a
            href="#demo"
            onClick={() => track('cta_clicked', { location: 'hero' })}
            className="btn-shimmer inline-flex items-center justify-center w-full max-w-[440px] min-h-[56px] rounded-xl bg-gold text-[#18181B] font-body font-bold text-lg hover:bg-gold-dark transition-all duration-200 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5 animate-in"
          >
            🛡️ See the AI Protection in Action — Free
          </a>

          <p className="text-muted-custom text-sm font-body mt-4 animate-in">
            No app download · No signup · Works on this phone right now.
          </p>
        </div>
      </section>

      {/* ── TRUST / STATS BAR ── */}
      <section className="bg-dark py-10 px-4 dark-glow">
        <div className="max-w-[720px] mx-auto">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-5">
            {[
              { value: '$2,100', label: 'Avg Claim Saved' },
              { value: '60 sec', label: 'Per Scan' },
              { value: `${scansCount}+`, label: 'Scans Done' },
              { value: '8', label: 'Angles Checked' },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-8 text-muted-custom text-xs font-body">
            <span>🔒 SHA-256 Verified</span>
            <span>📍 GPS-Timestamped</span>
            <span>⚖️ Court-Admissible</span>
          </div>
        </div>
      </section>

      {/* ── LIVE AI DEMO ── */}
      <Suspense fallback={<div className="min-h-[400px] bg-page" />}>
        <LiveAIDemo />
      </Suspense>

      {/* ── REST OF LANDING PAGE ── */}
      <Suspense fallback={<div className="min-h-[200px] bg-page" />}>
        <LandingSections scansCount={scansCount} spotsLeft={spotsLeft} onAuth={() => setAuthOpen(true)} />
      </Suspense>

      {/* ── FOOTER ── */}
      <footer className="bg-dark py-12 px-4 border-t border-white/5">
        <div className="max-w-[720px] mx-auto text-center">
          <h3 className="font-display text-gold text-xl font-bold mb-2">CarShake</h3>
          <p className="text-[#9CA3AF] text-sm font-body mb-6">Both sides sign. Both sides are protected.</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-body text-[#9CA3AF] mb-6">
            <a href="/business" className="hover:text-white transition">For Parking Operators</a>
            <a href="/blog" className="hover:text-white transition">Blog</a>
            <a href="https://x.com/sipiteno" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">X / Twitter</a>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
          <p className="text-[#9CA3AF] text-xs font-body">© 2026 CarShake · carshake.online</p>
        </div>
      </footer>

      <StickyBottomBar />
      <Suspense fallback={null}>
        <ExitIntentPopup />
      </Suspense>
      <Suspense fallback={null}>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </Suspense>
    </main>
  );
};

export default Index;
