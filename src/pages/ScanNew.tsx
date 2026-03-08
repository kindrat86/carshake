import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from '@/components/AuthModal';
import { QRCodeSVG } from 'qrcode.react';
import { Camera, Check, ArrowRight } from 'lucide-react';
import { track } from '@/lib/posthog';

const ANGLES = [
  { angle: 1, name: 'Front-Left (10:30)', tip: 'Include headlight + left fender', pos: { top: '15%', left: '18%' } },
  { angle: 2, name: 'Front (12:00)', tip: 'Center, full bumper + plate visible', pos: { top: '8%', left: '50%' } },
  { angle: 3, name: 'Front-Right (1:30)', tip: 'Include mirror + right fender', pos: { top: '15%', left: '82%' } },
  { angle: 4, name: 'Right Side (3:00)', tip: 'Full profile, both doors + wheels', pos: { top: '50%', left: '90%' } },
  { angle: 5, name: 'Rear-Right (4:30)', tip: 'Include taillight + quarter panel', pos: { top: '85%', left: '82%' } },
  { angle: 6, name: 'Rear (6:00)', tip: 'Full rear + plate visible', pos: { top: '92%', left: '50%' } },
  { angle: 7, name: 'Rear-Left (7:30)', tip: 'Include taillight + quarter panel', pos: { top: '85%', left: '18%' } },
  { angle: 8, name: 'Left Side (9:00)', tip: 'Full profile, both doors + wheels', pos: { top: '50%', left: '10%' } },
];

const resizeImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1500;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = (height / width) * maxDim; width = maxDim; }
        else { width = (width / height) * maxDim; height = maxDim; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });
};

const ScanNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [screen, setScreen] = useState<'start' | 'capture' | 'review' | 'qr'>('start');
  const [currentAngle, setCurrentAngle] = useState(0);
  const [photos, setPhotos] = useState<(string | null)[]>(new Array(8).fill(null));
  const [scanId, setScanId] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const startScan = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {}
      );
    }

    // Create scan record
    const { data, error } = await supabase.from('scans').insert({
      user_id: user.id,
      type: 'dropoff' as const,
      gps_lat: location?.lat,
      gps_lon: location?.lon,
    }).select().single();

    if (data) {
      setScanId(data.id);
      setScreen('capture');
      track('scan_started', { scan_type: 'dropoff' });
    }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scanId) return;

    if (file.size < 50000) {
      alert('Photo may be too blurry — please retake.');
      return;
    }

    setUploading(true);
    const resized = await resizeImage(file);
    const preview = URL.createObjectURL(resized);
    const newPhotos = [...photos];
    newPhotos[currentAngle] = preview;
    setPhotos(newPhotos);

    // Upload to storage
    const path = `${user!.id}/${scanId}/angle-${currentAngle + 1}.jpg`;
    await supabase.storage.from('scan-photos').upload(path, resized, { contentType: 'image/jpeg' });

    // Save metadata
    await supabase.from('scan_photos').insert({
      scan_id: scanId,
      angle: currentAngle + 1,
      angle_name: ANGLES[currentAngle].name,
      storage_path: path,
      client_timestamp: new Date().toISOString(),
    });

    setUploading(false);

    // Auto-advance
    if (currentAngle < 7) {
      setTimeout(() => setCurrentAngle(currentAngle + 1), 500);
    } else {
      // All 8 photos captured — increment scan counter
      await supabase.rpc('increment_scan_count', { user_id_param: user!.id });
      setScreen('review');
      track('scan_completed', { scan_type: 'dropoff', photo_count: 8, gps_captured: !!location });
    }

    // Reset input
    if (fileRef.current) fileRef.current.value = '';
  };

  const confirmScan = async () => {
    setScreen('qr');
    track('qr_generated', { scan_id: scanId });
  };

  const skipConfirmation = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-page">
      {screen === 'start' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
          {/* Car silhouette with angle points */}
          <div className="relative w-64 h-64 mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-20 border-2 border-border rounded-lg bg-white flex items-center justify-center">
                <span className="text-4xl">🚗</span>
              </div>
            </div>
            {ANGLES.map((a, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 rounded-full border-2 border-border bg-white"
                style={{ top: a.pos.top, left: a.pos.left, transform: 'translate(-50%, -50%)' }}
              />
            ))}
          </div>
          <h2 className="font-display text-[22px] font-bold text-ink text-center mb-3">Walk around your car</h2>
          <p className="font-body text-[15px] text-body text-center mb-2 max-w-sm">
            8 guided photos. Stand about 2 meters away. Include the full panel in each shot.
          </p>
          <p className="text-muted-custom text-sm font-body mb-8">Takes about 60 seconds</p>
          <button
            onClick={startScan}
            className="w-full max-w-[420px] min-h-[52px] rounded-[12px] bg-gold text-white font-body font-semibold text-base hover:bg-gold-dark transition"
          >
            Start Scanning →
          </button>
        </div>
      )}

      {screen === 'capture' && (
        <div className="min-h-screen flex flex-col">
          {/* Progress bar */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex gap-1">
              {ANGLES.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i < currentAngle ? 'bg-status-green' : i === currentAngle ? 'bg-gold' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Car diagram */}
          <div className="px-4 py-6 flex-shrink-0">
            <div className="relative w-48 h-48 mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-14 border-2 border-border rounded-lg bg-white flex items-center justify-center">
                  <span className="text-2xl">🚗</span>
                </div>
              </div>
              {ANGLES.map((a, i) => (
                <div
                  key={i}
                  className={`absolute w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    i < currentAngle ? 'bg-status-green text-white' :
                    i === currentAngle ? 'bg-gold text-white animate-pulse-gold' :
                    'border-2 border-border bg-white'
                  }`}
                  style={{ top: a.pos.top, left: a.pos.left, transform: 'translate(-50%, -50%)' }}
                >
                  {i < currentAngle && <Check size={12} />}
                </div>
              ))}
            </div>
            <p className="font-display text-xl font-bold text-ink text-center mt-4">
              Photo {currentAngle + 1} of 8: {ANGLES[currentAngle].name}
            </p>
            <p className="text-muted-custom text-sm font-body text-center mt-1">{ANGLES[currentAngle].tip}</p>
          </div>

          {/* Camera input */}
          <div className="flex-1 px-4 pb-8 flex flex-col justify-end">
            <label className="block cursor-pointer">
              <div className={`border-2 border-dashed border-gold/30 rounded-card p-12 text-center hover:border-gold/60 transition bg-gold-subtle ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold mx-auto" />
                ) : (
                  <>
                    <Camera className="mx-auto mb-3 text-gold" size={48} />
                    <p className="font-body font-semibold text-ink">Tap to take photo</p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhoto}
                disabled={uploading}
              />
            </label>

            {/* Thumbnail strip */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {photos.map((photo, i) => (
                <div key={i} className={`w-12 h-12 rounded-lg flex-shrink-0 ${photo ? '' : 'border border-border bg-white'} overflow-hidden`}>
                  {photo && <img src={photo} alt={`Angle ${i + 1}`} className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === 'review' && (
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-[680px] mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Check className="text-status-green" size={24} />
              <h2 className="font-display text-xl font-bold text-status-green">All 8 photos captured!</h2>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {photos.map((photo, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-surface">
                  {photo && <img src={photo} alt={`Angle ${i + 1}`} className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>
            {location && (
              <p className="text-sm font-body text-muted-custom mb-2">
                📍 {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
              </p>
            )}
            <p className="text-sm font-body text-muted-custom mb-6">
              ⏱ {new Date().toLocaleString()}
            </p>
            <button
              onClick={confirmScan}
              className="w-full min-h-[52px] rounded-[12px] bg-gold text-white font-body font-semibold hover:bg-gold-dark transition flex items-center justify-center gap-2"
            >
              🔐 Generate QR Code
            </button>
          </div>
        </div>
      )}

      {screen === 'qr' && scanId && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <h2 className="font-display text-xl font-bold text-ink mb-2">Show this to the attendant</h2>
          <p className="font-body text-sm text-body mb-8 text-center">They scan with any phone camera — no app needed</p>
          <div className="bg-white p-6 rounded-card border-2 border-gold shadow-modal mb-6">
            <QRCodeSVG
              value={`${window.location.origin}/scan/${scanId}`}
              size={200}
              level="H"
            />
          </div>
          <div className="inline-block px-3 py-1.5 rounded-pill bg-gold/10 text-gold text-xs font-body font-semibold mb-4">
            🔒 GPS · Timestamp · SHA-256
          </div>
          <p className="text-muted-custom text-sm font-body mb-8">⏱ Valid for 15 minutes</p>
          <div className="w-full max-w-[420px] space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full min-h-[52px] rounded-[12px] bg-status-green text-white font-body font-semibold hover:opacity-90 transition"
            >
              ✅ Attendant Confirmed
            </button>
            <button
              onClick={skipConfirmation}
              className="w-full min-h-[52px] rounded-[12px] border-2 border-border text-ink font-body font-semibold hover:bg-surface transition"
            >
              Skip →
            </button>
          </div>
          <button className="mt-6 text-gold text-sm font-body font-semibold">
            📲 Send link via SMS instead
          </button>
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

export default ScanNew;
