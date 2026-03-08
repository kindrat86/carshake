import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import CarSvg from './CarSvg';
import { track } from '@/lib/posthog';

interface ScanReviewProps {
  scanId: string;
  photos: (string | null)[];
  plate: string;
  model: string;
  colorHex: string;
  location: { lat: number; lon: number } | null;
}

const ScanReview = ({ scanId, photos, plate, model, colorHex, location }: ScanReviewProps) => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'review' | 'qr'>('review');

  const confirmScan = () => {
    setScreen('qr');
    track('qr_generated', { scan_id: scanId });
  };

  if (screen === 'qr') {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-4 py-12">
        <h2 className="font-display text-xl font-bold text-white mb-2">Show this to the attendant</h2>
        <p className="font-body text-sm text-white/50 mb-8 text-center">They scan with any phone camera — no app needed</p>
        <div className="bg-white p-6 rounded-card border-2 border-[#C9A237] shadow-modal mb-6">
          <QRCodeSVG
            value={`${window.location.origin}/scan/${scanId}`}
            size={200}
            level="H"
          />
        </div>
        <div className="inline-block px-3 py-1.5 rounded-pill bg-[#C9A237]/15 text-[#C9A237] text-xs font-body font-semibold mb-4">
          🔒 GPS · Timestamp · SHA-256
        </div>
        <p className="text-white/40 text-sm font-body mb-8">⏱ Valid for 15 minutes</p>
        <div className="w-full max-w-[420px] space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full min-h-[52px] rounded-[12px] bg-[#15803D] text-white font-body font-semibold hover:opacity-90 transition"
          >
            ✅ Attendant Confirmed
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full min-h-[52px] rounded-[12px] border-2 border-white/10 text-white font-body font-semibold hover:bg-white/5 transition"
          >
            Skip →
          </button>
        </div>
        <button className="mt-6 text-[#C9A237] text-sm font-body font-semibold">
          📲 Send link via SMS instead
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark px-4 py-8">
      <div className="max-w-[680px] mx-auto">
        {/* Celebration header */}
        <div className="flex items-center gap-2 mb-6">
          <Check className="text-[#15803D]" size={24} />
          <h2 className="font-display text-xl font-bold text-[#15803D]">All 8 photos captured!</h2>
        </div>

        {/* Vehicle summary card */}
        <div className="bg-white/5 border border-white/10 rounded-card p-4 mb-6 flex items-center gap-4">
          <CarSvg color={colorHex} size={48} />
          <div>
            <p className="font-body font-semibold text-white">{model}</p>
            <p className="text-[#C9A237] text-sm font-body font-semibold tracking-[2px]">{plate}</p>
          </div>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {photos.map((photo, i) => (
            <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-white/5">
              {photo && <img src={photo} alt={`Angle ${i + 1}`} className="w-full h-full object-cover" />}
            </div>
          ))}
        </div>

        {location && (
          <p className="text-sm font-body text-white/40 mb-2">
            📍 {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </p>
        )}
        <p className="text-sm font-body text-white/40 mb-6">
          ⏱ {new Date().toLocaleString()}
        </p>

        <button
          onClick={confirmScan}
          className="w-full min-h-[52px] rounded-[12px] bg-[#C9A237] text-[#09090B] font-body font-semibold transition flex items-center justify-center gap-2"
        >
          🔐 Generate QR Code
        </button>
      </div>
    </div>
  );
};

export default ScanReview;
