import { useState, useEffect } from 'react';
import { useSignupsCap } from '@/hooks/useSignupsCap';

const StickyBottomBar = () => {
  const [visible, setVisible] = useState(false);
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

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9000] bg-dark/95 backdrop-blur-[12px]" style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}>
      <div className="max-w-[680px] mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <span className="font-display text-white font-bold text-sm">CarShake</span>
          <span className="text-muted-custom text-xs font-body ml-2">{spotsLeft} founding spots left</span>
        </div>
        <a
          href="#demo"
          className="inline-flex items-center min-h-[44px] px-5 rounded-[10px] bg-gold text-ink font-body font-semibold text-sm hover:bg-gold-dark transition"
        >
          Try Free →
        </a>
      </div>
    </div>
  );
};

export default StickyBottomBar;
