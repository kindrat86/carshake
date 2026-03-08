import { useState, useEffect } from 'react';
import { useSignupsCap } from '@/hooks/useSignupsCap';

const StickyBottomBar = () => {
  const [visible, setVisible] = useState(false);
  const { spotsLeft } = useSignupsCap();

  useEffect(() => {
    const handleScroll = () => {
      const demoEl = document.getElementById('demo');
      const scrollY = window.scrollY;
      const demoTop = demoEl?.offsetTop ?? Infinity;
      const demoBottom = demoTop + (demoEl?.offsetHeight ?? 0);
      setVisible(scrollY > 500 && !(scrollY >= demoTop - 100 && scrollY <= demoBottom + 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
          className="inline-flex items-center min-h-[44px] px-5 rounded-[10px] bg-gold text-white font-body font-semibold text-sm hover:bg-gold-dark transition"
        >
          Try Free →
        </a>
      </div>
    </div>
  );
};

export default StickyBottomBar;
