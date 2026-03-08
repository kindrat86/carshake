import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';

interface CarsTabProps {
  scans: any[];
}

const CarsTab = ({ scans }: CarsTabProps) => {
  // Group by address as a proxy for vehicle (plate detection not implemented yet)
  const grouped = scans.reduce((acc: Record<string, any[]>, scan) => {
    const key = scan.address || 'Unknown Vehicle';
    if (!acc[key]) acc[key] = [];
    acc[key].push(scan);
    return acc;
  }, {});

  const vehicles = Object.entries(grouped);

  return (
    <div className="px-4 pb-24">
      {vehicles.length === 0 ? (
        <div className="bg-white rounded-card border border-border p-8 text-center shadow-card">
          <Car className="mx-auto text-muted-custom mb-3" size={32} />
          <p className="font-body text-[15px] text-body">No vehicles identified yet. Complete your first scan to start building your car's history.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map(([key, vehicleScans]) => {
            const locations = [...new Set(vehicleScans.map((s: any) => s.address).filter(Boolean))];
            return (
              <div key={key} className="bg-white rounded-card border border-border p-3 shadow-card">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-lg font-bold text-ink">{key}</h3>
                  <span className="px-2 py-0.5 rounded-pill bg-gold-subtle text-gold text-[10px] font-body font-semibold">
                    {vehicleScans.length} scans
                  </span>
                </div>
                {locations.length > 0 && (
                  <p className="text-xs font-body text-muted-custom">{locations.join(', ')}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CarsTab;
