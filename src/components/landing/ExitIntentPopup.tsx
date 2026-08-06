import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { track } from '@/lib/posthog';

const ExitIntentPopup = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only trigger once per session
    if (sessionStorage.getItem('carshake_exit_intent_shown')) return;

    let exitFired = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (exitFired || dismissed || e.clientY > 10) return;
      exitFired = true;
      sessionStorage.setItem('carshake_exit_intent_shown', '1');
      setVisible(true);
    };

    // Also trigger after 45 seconds as a fallback
    const timer = setTimeout(() => {
      if (!exitFired && !dismissed && !sessionStorage.getItem('carshake_exit_intent_shown')) {
        exitFired = true;
        sessionStorage.setItem('carshake_exit_intent_shown', '1');
        setVisible(true);
      }
    }, 45000);

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [dismissed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('newsletter_subscribers').insert({
        email,
        source: 'exit_intent',
        signup_source: 'carshake_landing',
      });
      track('email_captured', { location: 'exit_intent' });
      setSubmitted(true);
    } catch {
      track('email_captured_attempted', { location: 'exit_intent' });
      setSubmitted(true);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-[440px] bg-white rounded-[16px] shadow-modal p-8 z-10 text-center">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-custom hover:text-ink min-h-[48px] min-w-[48px] flex items-center justify-center"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <>
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="font-display text-xl font-bold text-ink mb-2">You're protected!</h3>
            <p className="font-body text-sm text-body mb-4">
              We'll send your free Valet Parking Protection Checklist — plus a quick demo of how CarShake works.
            </p>
            <a
              href="#demo"
              onClick={handleClose}
              className="inline-flex items-center justify-center w-full min-h-[48px] rounded-[12px] bg-gold text-ink font-body font-semibold hover:bg-gold-dark transition"
            >
              🛡️ Try the AI Demo Now — Free
            </a>
            <p className="text-xs font-body text-muted-custom mt-3">No credit card. Cancel anytime.</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="font-display text-xl font-bold text-ink mb-2">
              Wait — don't leave your car unprotected.
            </h3>
            <p className="font-body text-sm text-body mb-6">
              Get our free <strong>"Valet Parking Protection Checklist"</strong> — 
              exactly what to check before handing over your keys, plus a free CarShake scan.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full min-h-[52px] rounded-[12px] border border-border bg-white px-4 font-body text-base text-ink placeholder:text-muted-custom focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[52px] rounded-[12px] bg-gold text-ink font-body font-semibold text-base hover:bg-gold-dark transition"
              >
                {loading ? 'Sending...' : 'Send Me the Free Checklist →'}
              </button>
            </form>
            <div className="flex items-center gap-2 justify-center mt-4">
              <span className="text-status-green text-xs">✓</span>
              <p className="text-xs font-body text-muted-custom">Free PDF guide · No spam · Unsubscribe anytime</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExitIntentPopup;
