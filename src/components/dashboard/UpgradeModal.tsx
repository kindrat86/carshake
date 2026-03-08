import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFoundingPrice: boolean;
}

const UpgradeModal = ({ isOpen, onClose, isFoundingPrice }: UpgradeModalProps) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleUpgrade = async (plan: 'shield' | 'pro') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, userId: user?.id },
      });
      if (error) throw error;
      if (data?.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch {
      toast({ title: 'Error', description: 'Could not start checkout.', variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[16px] shadow-modal max-w-[440px] w-full p-6 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-custom hover:text-ink min-h-[48px] min-w-[48px] flex items-center justify-center">
          <X size={18} />
        </button>

        <h2 className="font-display text-xl font-bold text-ink mb-6">Unlock unlimited protection</h2>

        <div className="border-2 border-gold rounded-card p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-lg font-bold text-ink">Shield+</span>
            <span className="px-2 py-0.5 rounded-pill bg-gold-subtle text-gold text-[10px] font-body font-semibold">
              {isFoundingPrice ? 'Founding price' : 'Popular'}
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-gold mb-3">
            {isFoundingPrice ? '$2.97' : '$5.97'}<span className="text-sm font-body text-muted-custom">/mo</span>
          </p>
          <ul className="text-sm font-body text-body space-y-1 mb-4">
            {['Unlimited scans', 'PDF evidence reports', 'Full scan history', 'Priority AI', 'Dispute letter', 'Insurance package'].map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
          <button
            onClick={() => handleUpgrade('shield')}
            className="w-full min-h-[48px] rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
          >
            Get Shield+ — Start Free →
          </button>
        </div>

        <div className="border border-border rounded-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-display text-base font-bold text-ink">Pro</span>
            <span className="text-sm font-body text-muted-custom">$19.97/mo</span>
          </div>
          <p className="text-xs font-body text-muted-custom mb-3">For parking operators</p>
          <button
            onClick={() => handleUpgrade('pro')}
            className="w-full min-h-[44px] rounded-[10px] border-2 border-border text-ink font-body font-semibold hover:bg-surface transition"
          >
            Go Pro
          </button>
        </div>

        <p className="text-center text-xs font-body text-muted-custom mt-4">🛡️ Cancel anytime. One click.</p>
      </div>
    </div>
  );
};

export default UpgradeModal;
