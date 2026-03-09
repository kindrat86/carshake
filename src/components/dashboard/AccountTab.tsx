import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AccountTabProps {
  profile: any;
  onUpgrade: () => void;
}

const AccountTab = ({ profile, onUpgrade }: AccountTabProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isFree = !profile?.plan || profile.plan === 'free';

  const handleBilling = async () => {
    if (!profile?.stripe_customer_id) {
      onUpgrade();
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session');
      if (error) throw error;
      window.location.href = data.url;
    } catch {
      toast({ title: 'Error', description: 'Could not open billing portal.', variant: 'destructive' });
    }
  };

  const copyReferral = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(`${window.location.origin}/?ref=${profile.referral_code}`);
      toast({ title: 'Copied!', description: 'Referral link copied to clipboard.' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="px-4 pb-24 space-y-4">
      <div className="bg-white rounded-card border border-border p-4 shadow-card">
        <h3 className="font-display text-lg font-bold text-ink mb-3">{profile?.display_name || user?.email}</h3>
        <div className="space-y-2 text-sm font-body">
          <div className="flex justify-between">
            <span className="text-muted-custom">Plan</span>
            <span className={isFree ? 'text-gold font-semibold' : 'text-status-green font-semibold'}>
              {isFree ? 'Free' : 'Shield+ (Founding)'}
            </span>
          </div>
          {!isFree && (
            <div className="flex justify-between">
              <span className="text-muted-custom">Price</span>
              <span className="text-ink">$2.97/mo (locked forever)</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-custom">Scans</span>
            <span className="text-ink">{isFree ? `${profile?.scans_this_month || 0} of 3 used` : 'Unlimited'}</span>
          </div>
          {profile?.referral_code && (
            <div className="flex justify-between items-center">
              <span className="text-muted-custom">Referral code</span>
              <button onClick={copyReferral} className="text-gold font-semibold">
                {profile.referral_code.slice(0, 8)}...
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {[
          { icon: '📄', label: 'Manage Billing', action: handleBilling },
          { icon: '🔗', label: 'Share Referral Link', action: copyReferral },
          { icon: '❓', label: 'Help & FAQ', action: () => navigate('/#faq') },
          { icon: '🚪', label: 'Sign Out', action: handleSignOut },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center gap-3 bg-white rounded-[10px] border border-border p-3 min-h-[48px] font-body text-sm text-ink hover:bg-surface transition text-left"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccountTab;
