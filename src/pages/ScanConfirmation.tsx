import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Check } from 'lucide-react';

const ScanConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const [photos, setPhotos] = useState<any[]>([]);
  const [scan, setScan] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const { data: scanData } = await supabase.from('scans').select('*').eq('id', id).single();
      setScan(scanData);
      const { data: photoData } = await supabase.from('scan_photos').select('*').eq('scan_id', id).order('angle');
      setPhotos(photoData || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleConfirm = async () => {
    if (!id) return;
    const fingerprint = btoa(navigator.userAgent).slice(0, 32);
    await supabase.from('confirmations').insert({
      scan_id: id,
      device_fingerprint: fingerprint,
      device_info: navigator.userAgent,
      method: 'qr' as const,
    });
    await supabase.from('scans').update({
      confirmed_at: new Date().toISOString(),
      confirmed_by_fingerprint: fingerprint,
      confirmation_method: 'qr' as const,
    }).eq('id', id);
    setConfirmed(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <p className="font-body text-body">Scan not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page px-4 py-8">
      <div className="max-w-[680px] mx-auto">
        <div className="text-center mb-6">
          <h1 className="font-display text-gold text-xl font-bold mb-1">CarShake</h1>
          <h2 className="font-display text-xl font-bold text-ink">Vehicle Condition Record</h2>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {photos.map((photo) => {
            const { data } = supabase.storage.from('scan-photos').getPublicUrl(photo.storage_path);
            return (
              <div key={photo.id} className="aspect-[4/3] rounded-lg overflow-hidden bg-surface">
                <img src={data.publicUrl} alt={photo.angle_name} className="w-full h-full object-cover" />
              </div>
            );
          })}
        </div>

        <div className="text-sm font-body text-muted-custom mb-6 space-y-1">
          {scan.address && <p>📍 {scan.address}</p>}
          {scan.gps_lat && <p>📍 {scan.gps_lat.toFixed(4)}, {scan.gps_lon.toFixed(4)}</p>}
          <p>⏱ {new Date(scan.created_at).toLocaleString()}</p>
        </div>

        {confirmed ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-status-green/10 flex items-center justify-center mx-auto mb-4">
              <Check className="text-status-green" size={32} />
            </div>
            <h3 className="font-display text-xl font-bold text-ink mb-2">Thank you!</h3>
            <p className="font-body text-body text-sm mb-6">Both parties now have a signed record.</p>
            <div className="bg-gold-subtle border border-gold-subtle rounded-card p-4">
              <p className="font-body text-sm text-body">
                Want a dashboard for your business?{' '}
                <a href="/business" className="text-gold font-semibold">carshake.online/business</a>
              </p>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={handleConfirm}
              className="w-full min-h-[56px] rounded-[12px] bg-status-green text-white font-body font-bold text-lg hover:opacity-90 transition"
            >
              ✅ I Confirm This Condition
            </button>
            <p className="text-center text-muted-custom text-xs font-body mt-3 leading-relaxed">
              By tapping Confirm, you acknowledge that these photos accurately represent the vehicle's current condition.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ScanConfirmation;
