import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import ScanCard from './ScanCard';

interface ScansTabProps {
  scans: any[];
  confirmations: any[];
  photoCounts: Record<string, number>;
  profile: any;
  onUpgrade: () => void;
}

const ScansTab = ({ scans, confirmations, photoCounts, profile, onUpgrade }: ScansTabProps) => {
  const navigate = useNavigate();
  const isFree = !profile?.plan || profile.plan === 'free';
  const scansUsed = profile?.scans_this_month || 0;

  const handleNewScan = () => {
    if (isFree && scansUsed >= 3) {
      onUpgrade();
      return;
    }
    navigate('/scan/new');
  };

  return (
    <div className="px-4 pb-24">
      {isFree && (
        <div className="mb-4">
          <p className="text-sm font-body text-body mb-1.5">{scansUsed} of 3 free scans used this month</p>
          <div className="h-2 rounded-full bg-border-light overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${(scansUsed / 3) * 100}%` }} />
          </div>
        </div>
      )}

      <button
        onClick={handleNewScan}
        className="w-full min-h-[52px] rounded-[12px] bg-gold text-white font-body font-semibold text-base hover:bg-gold-dark transition mb-6"
      >
        🛡️ + New Scan
      </button>

      {scans.length === 0 ? (
        <div className="bg-white rounded-card border border-border p-8 text-center shadow-card">
          <div className="w-20 h-20 rounded-full bg-gold-subtle flex items-center justify-center mx-auto mb-4">
            <Shield className="text-gold" size={32} />
          </div>
          <h3 className="font-display text-xl font-bold text-ink mb-2">No scans yet</h3>
          <p className="font-body text-[15px] text-muted-custom mb-4">Protect your car before your next handover.</p>
          <button
            onClick={handleNewScan}
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
          >
            Start Your First Scan →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => (
            <ScanCard
              key={scan.id}
              scan={scan}
              confirmation={confirmations.find((c: any) => c.scan_id === scan.id)}
              photosCount={photoCounts[scan.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScansTab;
