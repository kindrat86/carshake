import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CompareTabProps {
  comparisons: any[];
  scans: any[];
}

const CompareTab = ({ comparisons, scans }: CompareTabProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'clean' | 'changes'>('all');

  const filtered = comparisons.filter((c) => {
    if (filter === 'clean') return c.status === 'no_changes';
    if (filter === 'changes') return c.status === 'changes';
    return true;
  });

  const filters: { id: typeof filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'clean', label: 'Clean ✓' },
    { id: 'changes', label: 'Changes ⚠' },
  ];

  return (
    <div className="px-4 pb-24">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-pill text-sm font-body font-semibold whitespace-nowrap min-h-[36px] ${
              filter === f.id ? 'bg-gold text-white' : 'bg-white border border-border text-body'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-card border border-border p-8 text-center shadow-card">
          <p className="font-body text-[15px] text-body">No comparisons yet. Complete a drop-off and pickup scan pair to see AI results.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((comp) => {
            const dropoff = scans.find((s: any) => s.id === comp.dropoff_scan_id);
            const isChanges = comp.status === 'changes';
            return (
              <button
                key={comp.id}
                onClick={() => dropoff && navigate(`/dashboard/scan/${dropoff.id}`)}
                className={`w-full bg-white rounded-card border-l-4 border border-border p-3 shadow-card text-left ${
                  isChanges ? 'border-l-status-red' : 'border-l-status-green'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-body font-semibold text-ink">{dropoff?.address || 'Unknown'}</p>
                    <p className="text-xs font-body text-muted-custom">{new Date(comp.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-pill text-[10px] font-body font-semibold ${
                    isChanges ? 'text-status-red bg-status-red' : 'text-status-green bg-status-green'
                  }`}>
                    {isChanges ? `⚠ ${comp.total_differences} found` : '✓ Clean'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompareTab;
