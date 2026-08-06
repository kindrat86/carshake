import { useState, useEffect } from 'react';
import { useSignupsCap } from '@/hooks/useSignupsCap';
import { supabase } from '@/integrations/supabase/client';
import { track } from '@/lib/posthog';

const StickyBottomBar = () => {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { spotsLeft } = useSignupsCap();

  useEffect(() => {
    let rafId: number | null = null;
    let demoTop = Infinity;
    let demoBottom = Infinity;

    const measureDemo = () => {
      const demoEl = document.getElementById('demo');
      if (demoEl) {
        demoTop = demoEl.offsetTop;
        demoBottom = demoTop + demoEl.offsetHeight;
      }
    };

    // Measure once on load and on resize
    measureDemo();
    window.addEventListener('resize', measureDemo, { passive: true });

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setVisible(scrollY > 500 && !(scrollY >= demoTop - 100 && scrollY <= demoBottom + 100));
        rafId = null;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measureDemo);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await supabase.from('newsletter_subscribers').insert({
        email,
        source: 'sticky_bar',
        signup_source: 'carshake_landing',
      });
      track('email_captured', { location: 'sticky_bar' });
      setSubmitted(true);
    } catch {
      // If table doesn't exist, still track it
      track('email_captured_attempted', { location: 'sticky_bar' });
    }
    setLoading(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9000] bg-dark/95 backdrop-blur-[12px]" style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}>
      <div className="max-w-[680px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <span className="font-display text-white font-bold text-sm">CarShake</span>
          <span className="text-[#9CA3AF] text-xs font-body ml-2">{spotsLeft} founding spots</span>
        </div>
        {submitted ? (
          <div className="flex items-center gap-2">
            <span className="text-status-green text-xs font-body">✅ You're on the list!</span>
            <a
              href="#demo"
              className="inline-flex items-center min-h-[44px] px-5 rounded-[10px] bg-gold text-ink font-body font-semibold text-sm hover:bg-gold-dark transition"
            >
              Try AI Demo Free →
            </a>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="flex items-center gap-2 flex-shrink-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-[180px] min-h-[44px] rounded-[10px] bg-white/10 border border-white/20 px-3 font-body text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-gold/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center min-h-[44px] px-5 rounded-[10px] bg-gold text-ink font-body font-semibold text-sm hover:bg-gold-dark transition whitespace-nowrap"
            >
              {loading ? 'Sending...' : 'Get Free Guide →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StickyBottomBar;
