import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { track } from '@/lib/posthog';
import BottomTabBar from '@/components/dashboard/BottomTabBar';
import ScansTab from '@/components/dashboard/ScansTab';
import CarsTab from '@/components/dashboard/CarsTab';
import CompareTab from '@/components/dashboard/CompareTab';
import AccountTab from '@/components/dashboard/AccountTab';
import UpgradeModal from '@/components/dashboard/UpgradeModal';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'scans' | 'cars' | 'compare' | 'account'>('scans');
  const [scans, setScans] = useState<any[]>([]);
  const [confirmations, setConfirmations] = useState<any[]>([]);
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [isFoundingPrice, setIsFoundingPrice] = useState(true);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast({ title: '🎉 Welcome to Shield+!', description: 'Your protection is now unlimited.' });
      track('checkout_completed', { plan: 'shield_plus' });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [scansRes, profileRes, capRes] = await Promise.all([
        supabase.from('scans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('signups_cap').select('*').limit(1).single(),
      ]);

      const scanData = scansRes.data || [];
      setScans(scanData);
      setProfile(profileRes.data);
      if (capRes.data) {
        setIsFoundingPrice(capRes.data.founding_price_active && (capRes.data.total_signups ?? 0) < (capRes.data.founding_cap ?? 100));
      }

      if (scanData.length > 0) {
        const scanIds = scanData.map((s: any) => s.id);
        const [confRes, compRes] = await Promise.all([
          supabase.from('confirmations').select('*').in('scan_id', scanIds),
          supabase.from('comparisons').select('*').in('dropoff_scan_id', scanIds),
        ]);
        setConfirmations(confRes.data || []);
        setComparisons(compRes.data || []);

        // Get photo counts
        const { data: photos } = await supabase.from('scan_photos').select('scan_id').in('scan_id', scanIds);
        const counts: Record<string, number> = {};
        (photos || []).forEach((p: any) => { counts[p.scan_id] = (counts[p.scan_id] || 0) + 1; });
        setPhotoCounts(counts);
      }
    };
    fetchAll();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  const isFree = !profile?.plan || profile.plan === 'free';

  return (
    <div className="min-h-screen bg-page">
      {/* Payment failed banner */}
      {profile?.payment_failed && (
        <div className="bg-status-amber px-4 py-3 text-center">
          <p className="text-sm font-body text-white font-semibold">
            ⚠️ Your payment failed.{' '}
            <button onClick={() => setTab('account')} className="underline">Update your card</button>
            {' '}to keep Shield+ protection.
          </p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-gold">CarShake</h1>
          <span className={`px-3 py-1 rounded-pill text-[11px] font-body font-semibold ${
            isFree ? 'bg-gold-subtle text-gold' : 'bg-status-green text-status-green'
          }`}>
            {isFree ? `Free · ${profile?.scans_this_month || 0}/3 scans` : 'Shield+ Active'}
          </span>
        </div>
      </header>

      {/* Tab Content */}
      <main className="max-w-4xl mx-auto pt-4">
        {tab === 'scans' && (
          <ScansTab
            scans={scans}
            confirmations={confirmations}
            photoCounts={photoCounts}
            profile={profile}
            onUpgrade={() => setUpgradeOpen(true)}
          />
        )}
        {tab === 'cars' && <CarsTab scans={scans} />}
        {tab === 'compare' && <CompareTab comparisons={comparisons} scans={scans} />}
        {tab === 'account' && <AccountTab profile={profile} onUpgrade={() => setUpgradeOpen(true)} />}
      </main>

      <BottomTabBar active={tab} onChange={setTab} />
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} isFoundingPrice={isFoundingPrice} />
    </div>
  );
};

export default Dashboard;
