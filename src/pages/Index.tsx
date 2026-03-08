import { useSignupsCap } from '@/hooks/useSignupsCap';
import { lazy, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { track } from '@/lib/posthog';
import StickyBottomBar from '@/components/landing/StickyBottomBar';
import LandingJsonLd from '@/components/landing/LandingJsonLd';

const AuthModal = lazy(() => import('@/components/AuthModal'));
const LiveAIDemo = lazy(() => import('@/components/landing/LiveAIDemo'));
const LandingSections = lazy(() => import('@/components/landing/LandingSections'));

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { scansCount, spotsLeft } = useSignupsCap();

  // Store referral code
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) localStorage.setItem('carshake_referral', ref);
  }, [searchParams]);

  return (
    <main className="bg-page min-h-screen">
      <LandingJsonLd />
      
      {/* Section 1: Hero */}
      <section className="px-4 pt-16 pb-12">
        <div className="max-w-[680px] mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-pill bg-status-green/10 text-status-green text-xs font-body font-semibold mb-6">
            Both sides sign. Both sides protected.
          </div>
          <h1 className="font-display hero-h1 text-ink mb-6">
            Never pay for a scratch{' '}
            <em className="text-gold font-display italic">you didn't cause.</em>
          </h1>
          <p className="text-body font-body text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Before you hand over your keys, CarShake creates a{' '}
            <strong>signed, timestamped, AI-verified record of your car's condition</strong>{' '}
            — confirmed by both you AND the parking attendant. When you return, AI compares every angle instantly.{' '}
            <strong>Both sides get proof. Disputes end before they start.</strong>
          </p>
          <a
            href="#demo"
            onClick={() => track('cta_clicked', { location: 'hero' })}
            className="inline-flex items-center justify-center w-full max-w-[420px] min-h-[52px] rounded-[12px] bg-gold text-ink font-body font-semibold text-base hover:bg-gold-dark transition"
          >
            🛡️ See the AI Protection in Action — Free
          </a>
          <p className="text-muted-custom text-sm font-body mt-4">
            No app download · No signup · Works on this phone right now.
          </p>
        </div>
      </section>

      {/* Section 2: Trust Bar */}
      <section className="bg-dark py-8 px-4">
        <div className="max-w-[680px] mx-auto flex flex-wrap justify-center gap-8">
          {[
            { value: '$2,100', label: 'avg claim saved' },
            { value: '60 sec', label: 'per scan' },
            { value: `${scansCount}+`, label: 'scans done' },
            { value: '8', label: 'angles checked' },
          ].map((s) => (
            <div key={s.label} className="text-center min-w-[80px]">
              <div className="font-display text-2xl font-bold text-gold">{s.value}</div>
              <div className="text-[9px] font-body text-muted-custom uppercase tracking-[2px] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Live AI Demo */}
      <Suspense fallback={<div className="min-h-[400px] bg-page" />}>
        <LiveAIDemo />
      </Suspense>

      {/* Sections 4-16 */}
      <Suspense fallback={<div className="min-h-[200px] bg-page" />}>
        <LandingSections scansCount={scansCount} spotsLeft={spotsLeft} onAuth={() => setAuthOpen(true)} />
      </Suspense>

      {/* Footer */}
      <footer className="bg-dark py-12 px-4">
        <div className="max-w-[680px] mx-auto text-center">
          <h3 className="font-display text-gold text-xl font-bold mb-2">CarShake</h3>
          <p className="text-muted-custom text-sm font-body mb-6">Both sides sign. Both sides are protected.</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-body text-muted-custom mb-6">
            <a href="/business" className="hover:text-white transition">For Parking Operators</a>
            <a href="/blog" className="hover:text-white transition">Blog</a>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
          <p className="text-muted-custom text-xs font-body">© 2026 CarShake · carshake.online</p>
        </div>
      </footer>

      <StickyBottomBar />
      <Suspense fallback={null}>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </Suspense>
    </main>
  );
};

export default Index;
