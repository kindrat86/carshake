import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, ClipboardList, Scale, Users, Settings, LogOut } from 'lucide-react';

type Tab = 'overview' | 'scans' | 'disputes' | 'staff' | 'settings';

const tabs: { id: Tab; icon: typeof BarChart3; label: string }[] = [
  { id: 'overview', icon: BarChart3, label: 'Overview' },
  { id: 'scans', icon: ClipboardList, label: 'Scans' },
  { id: 'disputes', icon: Scale, label: 'Disputes' },
  { id: 'staff', icon: Users, label: 'Staff' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

const BusinessDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [profile, setProfile] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: p } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      // For now, show all scans for this user (business scans)
      const { data: s } = await supabase.from('scans').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setScans(s || []);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-page"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" /></div>;
  }
  if (!user) return <Navigate to="/" replace />;
  if (profile && profile.role !== 'business_admin') return <Navigate to="/dashboard" replace />;

  const todayScans = scans.filter((s) => new Date(s.created_at).toDateString() === new Date().toDateString());
  const parkedNow = scans.filter((s) => s.type === 'dropoff' && s.status === 'active');

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold text-gold">CarShake Pro</h1>
            <p className="text-[11px] font-body text-muted-custom">Business Dashboard</p>
          </div>
          <span className="px-3 py-1 rounded-pill bg-gold-subtle text-gold text-[11px] font-body font-semibold">Pro Active</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-4 pb-24 px-4">
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Scans today', value: todayScans.length, color: 'text-gold' },
                { label: 'Confirmation rate', value: '—', color: 'text-status-green' },
                { label: 'Cars parked now', value: parkedNow.length, color: 'text-status-blue' },
                { label: 'Disputes this month', value: 0, color: 'text-ink' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-card border border-border p-3 shadow-card">
                  <p className={`font-display text-[28px] font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] font-body text-muted-custom">{s.label}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ink mb-3">Recent Scans</h3>
              {scans.slice(0, 5).map((s) => (
                <div key={s.id} className="bg-white rounded-card border border-border p-3 shadow-card mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-body font-semibold text-ink">{s.address || 'Vehicle'}</p>
                    <p className="text-[11px] font-body text-muted-custom">{new Date(s.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-pill text-[10px] font-body font-semibold ${
                    s.status === 'active' ? 'text-status-blue bg-status-blue' : 'text-status-green bg-status-green'
                  }`}>
                    {s.status === 'active' ? '⏳ Parked' : '✓ Done'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'scans' && (
          <div>
            <button
              onClick={() => navigate('/scan/new')}
              className="w-full min-h-[52px] rounded-[12px] bg-gold text-white font-body font-semibold mb-4 hover:bg-gold-dark transition"
            >
              📸 Staff Scan — New Vehicle
            </button>
            <div className="space-y-2">
              {scans.map((s) => (
                <div key={s.id} className="bg-white rounded-card border border-border p-3 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-body font-semibold text-ink">{s.address || 'Vehicle'}</p>
                      <p className="text-[11px] font-body text-muted-custom">{new Date(s.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-pill text-[10px] font-body font-semibold ${
                      s.status === 'active' ? 'text-status-blue bg-status-blue' : 'text-status-green bg-status-green'
                    }`}>
                      {s.status === 'active' ? '⏳ Parked' : '✓ Done'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'disputes' && (
          <div>
            <button className="w-full min-h-[48px] rounded-[10px] border-2 border-gold text-gold font-body font-semibold mb-4 hover:bg-gold-subtle transition">
              📝 Log New Dispute
            </button>
            <div className="bg-white rounded-card border border-border p-8 text-center shadow-card">
              <p className="font-body text-sm text-body">No disputes logged yet.</p>
            </div>
          </div>
        )}

        {tab === 'staff' && (
          <div>
            <div className="bg-white rounded-card border border-border p-8 text-center shadow-card mb-4">
              <p className="font-body text-sm text-body">No staff members yet.</p>
            </div>
            <button className="w-full min-h-[48px] rounded-[10px] border-2 border-gold text-gold font-body font-semibold hover:bg-gold-subtle transition">
              + Invite Staff Member
            </button>
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-card border border-border p-4 shadow-card">
              <h3 className="font-display text-base font-bold text-ink mb-2">Business Info</h3>
              <div className="space-y-2 text-sm font-body">
                <div className="flex justify-between"><span className="text-muted-custom">Plan</span><span className="text-ink">Pro — $19.97/mo</span></div>
              </div>
            </div>
            <div className="bg-gold-subtle border border-gold-subtle rounded-card p-4">
              <p className="text-sm font-body font-semibold text-ink mb-1">🛡️ Protected by CarShake</p>
              <p className="text-xs font-body text-body mb-2">Add this badge to your website or signage</p>
              <button className="text-xs font-body font-semibold text-gold">Copy embed code</button>
            </div>
            <button
              onClick={async () => { await signOut(); navigate('/'); }}
              className="w-full flex items-center gap-3 bg-white rounded-[10px] border border-border p-3 min-h-[48px] font-body text-sm text-ink hover:bg-surface transition"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-dark border-t border-border" style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}>
        <div className="flex">
          {tabs.map(({ id, icon: Icon, label }) => {
            const isActive = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)} className="flex-1 flex flex-col items-center py-2 min-h-[48px] relative">
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gold" />}
                <Icon size={20} className={isActive ? 'text-gold' : 'text-muted-custom opacity-45'} />
                <span className={`text-[10px] mt-0.5 font-body font-semibold ${isActive ? 'text-gold' : 'text-muted-custom opacity-45'}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BusinessDashboard;
