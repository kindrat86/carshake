import { useNavigate } from 'react-router-dom';
import EvidenceBars from './EvidenceBars';

interface ScanCardProps {
  scan: any;
  confirmation?: any;
  photosCount: number;
}

const getStatusBadge = (scan: any, confirmation: any) => {
  if (scan.status === 'completed') {
    // Has comparison
    return scan._comparisonStatus === 'changes'
      ? { label: '⚠ Changes', cls: 'text-status-red bg-status-red' }
      : { label: '✓ Clean', cls: 'text-status-green bg-status-green' };
  }
  if (scan.status === 'paired') {
    return { label: '⏳ Comparing', cls: 'text-status-blue bg-status-blue' };
  }
  return { label: '⏳ Parked', cls: 'text-status-blue bg-status-blue' };
};

const getEvidenceScore = (scan: any, confirmation: any, photosCount: number) => {
  let score = 0;
  if (photosCount >= 8) score++;
  if (scan.gps_lat) score++;
  if (scan.created_at) score++;
  if (confirmation) score++;
  if (scan.status === 'completed') score++;
  return Math.max(1, Math.min(5, score));
};

const ScanCard = ({ scan, confirmation, photosCount }: ScanCardProps) => {
  const navigate = useNavigate();
  const badge = getStatusBadge(scan, confirmation);
  const evidenceScore = getEvidenceScore(scan, confirmation, photosCount);
  const date = new Date(scan.created_at);

  return (
    <button
      onClick={() => navigate(`/dashboard/scan/${scan.id}`)}
      className="w-full bg-white rounded-card border border-border p-3 shadow-card flex items-center gap-3 min-h-[48px] text-left"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-body font-semibold text-ink truncate">
          {scan.address || 'Unknown Location'}
        </p>
        <p className="text-xs font-body text-muted-custom mt-0.5">
          {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={`px-2 py-0.5 rounded-pill text-[10px] font-body font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
        <EvidenceBars score={evidenceScore} />
      </div>
    </button>
  );
};

export default ScanCard;
