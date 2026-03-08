import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import EvidenceBars from '@/components/dashboard/EvidenceBars';
import CarSvg from '@/components/scan/CarSvg';
import { toast } from '@/hooks/use-toast';
import { generateEvidencePDF } from '@/lib/pdfGenerator';
import { track } from '@/lib/posthog';

const ScanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scan, setScan] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [confirmation, setConfirmation] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [scanRes, photosRes, confRes] = await Promise.all([
        supabase.from('scans').select('*').eq('id', id).single(),
        supabase.from('scan_photos').select('*').eq('scan_id', id).order('angle'),
        supabase.from('confirmations').select('*').eq('scan_id', id).limit(1),
      ]);
      setScan(scanRes.data);
      setPhotos(photosRes.data || []);
      setConfirmation(confRes.data?.[0] || null);

      if (scanRes.data) {
        const { data: comp } = await supabase.from('comparisons').select('*').eq('dropoff_scan_id', id).single();
        if (comp) {
          setComparison(comp);
          const { data: fData } = await supabase.from('comparison_findings').select('*').eq('comparison_id', comp.id);
          setFindings(fData || []);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handlePDF = async () => {
    if (!scan) return;
    setPdfLoading(true);
    try {
      await generateEvidencePDF(scan, photos, confirmation, comparison, findings);
      track('report_downloaded', { scan_id: id, format: 'pdf' });
    } catch {
      toast({ title: 'Error', description: 'Could not generate PDF.', variant: 'destructive' });
    }
    setPdfLoading(false);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/scan/${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: 'Share this link as evidence.' });
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

  const getPhotoUrl = (path: string) => supabase.storage.from('scan-photos').getPublicUrl(path).data.publicUrl;
  const severityColor = (s: string) => s === 'severe' ? 'bg-status-red' : s === 'moderate' ? 'bg-status-amber' : 'bg-status-green';

  return (
    <div className="min-h-screen bg-page pb-8">
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="text-gold font-body font-semibold text-sm min-h-[48px] flex items-center gap-1">
            <ArrowLeft size={16} /> Back
          </button>
          <EvidenceBars score={confirmation ? (photos.length >= 8 ? 5 : 4) : (photos.length >= 8 ? 3 : 2)} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Vehicle info */}
        {scan.vehicle_model && (
          <div className="flex items-center gap-3">
            {scan.vehicle_color_hex && <CarSvg color={scan.vehicle_color_hex} size={48} />}
            <div>
              <h2 className="font-display text-lg font-bold text-ink">{scan.vehicle_model}</h2>
              <p className="text-xs font-body text-gold font-semibold tracking-[2px]">{scan.vehicle_plate}</p>
            </div>
          </div>
        )}
        {/* Header info */}
        <div>
          {!scan.vehicle_model && <h2 className="font-display text-lg font-bold text-ink">{scan.address || 'Unknown Location'}</h2>}
          <p className="text-xs font-body text-muted-custom">
            {new Date(scan.created_at).toLocaleString()}
          </p>
        </div>

        {/* Photos */}
        <div>
          <p className="text-[11px] font-body font-bold text-gold uppercase tracking-[1px] mb-2">📸 {photos.length} Photos</p>
          <div className="grid grid-cols-4 gap-1.5">
            {photos.map((p) => {
              const url = getPhotoUrl(p.storage_path);
              return (
                <button key={p.id} onClick={() => setLightbox(url)} className="relative aspect-[4/3] rounded-md overflow-hidden border border-border">
                  <img src={url} alt={p.angle_name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-body text-center py-0.5">
                    {p.angle_name.split('(')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidence Chain */}
        <div className="bg-white rounded-card border border-border p-3 shadow-card">
          <p className="text-[11px] font-body font-bold text-gold uppercase tracking-[1px] mb-2">🔐 Evidence Chain</p>
          <div className="space-y-2 text-sm font-body">
            {scan.gps_lat && (
              <div className="flex justify-between">
                <span className="text-muted-custom">GPS</span>
                <a
                  href={`https://www.google.com/maps?q=${scan.gps_lat},${scan.gps_lon}`}
                  target="_blank"
                  rel="noopener"
                  className="text-gold font-semibold"
                >
                  {scan.gps_lat.toFixed(4)}, {scan.gps_lon.toFixed(4)}
                </a>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-custom">Time</span>
              <span className="text-ink">{new Date(scan.created_at).toLocaleString()}</span>
            </div>
            {scan.hash_sha256 && (
              <div className="flex justify-between">
                <span className="text-muted-custom">Hash</span>
                <button onClick={() => { navigator.clipboard.writeText(scan.hash_sha256); toast({ title: 'Copied!' }); }}
                  className="text-ink font-mono text-xs">{scan.hash_sha256.slice(0, 8)}...{scan.hash_sha256.slice(-4)}</button>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation */}
        <div className={`rounded-card border p-3 ${
          confirmation ? 'bg-status-green border-status-green' : 'bg-status-amber border-status-amber'
        }`}>
          {confirmation ? (
            <>
              <p className="text-sm font-body font-semibold text-status-green">✅ Attendant Confirmed</p>
              <p className="text-xs font-body text-body mt-1">
                Signed by: {confirmation.method} · {new Date(confirmation.confirmed_at).toLocaleString()}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-body font-semibold text-status-amber">⚠️ Unconfirmed</p>
              <p className="text-xs font-body text-body mt-1">Evidence valid but stronger with confirmation</p>
            </>
          )}
        </div>

        {/* AI Comparison */}
        {comparison ? (
          <div className={`rounded-card border p-3 ${
            comparison.status === 'changes' ? 'bg-status-red border-status-red' : 'bg-status-green border-status-green'
          }`}>
            {comparison.status === 'changes' ? (
              <>
                <p className="font-display text-[15px] font-bold text-status-red mb-2">⚠️ {comparison.total_differences} DIFFERENCES FOUND</p>
                <div className="space-y-2">
                  {findings.map((f: any) => (
                    <div key={f.id} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityColor(f.severity)}`} />
                      <div>
                        <p className="text-sm font-body font-semibold text-ink">{f.location}</p>
                        <p className="text-xs font-body text-body">{f.description}</p>
                        <span className="text-[10px] font-body font-bold uppercase text-muted-custom">{f.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="font-display text-[15px] font-bold text-status-green">✅ No Changes Detected</p>
                <p className="text-xs font-body text-body mt-1">All 8 angles verified. Your car is clean.</p>
              </>
            )}
          </div>
        ) : scan.status === 'active' && (
          <div className="rounded-card border bg-status-blue border-status-blue p-3">
            <p className="text-sm font-body font-semibold text-status-blue mb-2">⏳ Awaiting Pickup Scan</p>
            <button
              onClick={() => navigate(`/scan/${id}/exit`)}
              className="w-full min-h-[44px] rounded-[10px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition"
            >
              Start Pickup Scan →
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePDF}
            disabled={pdfLoading}
            className="min-h-[48px] rounded-[10px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download size={16} /> {pdfLoading ? 'Generating...' : 'Download PDF'}
          </button>
          <button
            onClick={handleShare}
            className="min-h-[48px] rounded-[10px] border-2 border-border text-ink font-body font-semibold hover:bg-surface transition flex items-center justify-center gap-2"
          >
            <Share2 size={16} /> Share Link
          </button>
        </div>
      </main>
    </div>
  );
};

export default ScanDetail;
