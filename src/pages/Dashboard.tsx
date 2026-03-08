import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-border bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-ink">CarShake</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-body font-body">{user.email}</span>
            <button onClick={signOut} className="text-sm text-muted-custom hover:text-ink font-body min-h-[48px]">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Your Scans</h2>
        <div className="bg-white rounded-card border border-border p-8 text-center shadow-card">
          <p className="text-body font-body mb-4">No scans yet. Start your first scan to protect your car.</p>
          <a href="/scan/new" className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition">
            🛡️ Start New Scan
          </a>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
