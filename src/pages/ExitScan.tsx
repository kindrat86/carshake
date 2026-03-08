import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Check } from 'lucide-react';

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
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });
};

const ExitScan = () => {
  const { id: dropoffId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentAngle, setCurrentAngle] = useState(0);
  const [photos, setPhotos] = useState<(string | null)[]>(new Array(8).fill(null));
  const [pickupScanId, setPickupScanId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [angleStatuses, setAngleStatuses] = useState<('pending' | 'analyzing' | 'done')[]>(new Array(8).fill('pending'));
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !dropoffId) return;
    const createPickup = async () => {
      const { data } = await supabase.from('scans').insert({
        user_id: user.id,
        type: 'pickup' as const,
        paired_scan_id: dropoffId,
      }).select().single();
      if (data) setPickupScanId(data.id);
    };
    createPickup();
  }, [user, dropoffId]);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pickupScanId || !user) return;
    setUploading(true);
    const resized = await resizeImage(file);
    const preview = URL.createObjectURL(resized);
    const newPhotos = [...photos];
    newPhotos[currentAngle] = preview;
    setPhotos(newPhotos);

    const path = `${user.id}/${pickupScanId}/angle-${currentAngle + 1}.jpg`;
    await supabase.storage.from('scan-photos').upload(path, resized, { contentType: 'image/jpeg' });
    await supabase.from('scan_photos').insert({
      scan_id: pickupScanId,
      angle: currentAngle + 1,
      angle_name: ANGLES[currentAngle].name,
      storage_path: path,
      client_timestamp: new Date().toISOString(),
    });

    setUploading(false);
    if (currentAngle < 7) {
      setTimeout(() => setCurrentAngle(currentAngle + 1), 500);
    } else {
      triggerComparison();
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const triggerComparison = async () => {
    if (!dropoffId || !pickupScanId) return;
    setComparing(true);

    try {
      const { data, error } = await supabase.functions.invoke('compare-scan', {
        body: { dropoff_scan_id: dropoffId, pickup_scan_id: pickupScanId },
      });

      if (error) throw error;

      // Update dropoff scan status
      await supabase.from('scans').update({ status: 'paired' as const }).eq('id', dropoffId);

      // Simulate progress
      for (let i = 0; i < 8; i++) {
        setAngleStatuses((prev) => { const n = [...prev]; n[i] = 'analyzing'; return n; });
        await new Promise((r) => setTimeout(r, 300));
        setAngleStatuses((prev) => { const n = [...prev]; n[i] = 'done'; return n; });
        setProgress(i + 1);
      }

      await new Promise((r) => setTimeout(r, 500));
      navigate(`/dashboard/scan/${dropoffId}`);
    } catch (err) {
      console.error('Comparison failed:', err);
      navigate(`/dashboard/scan/${dropoffId}`);
    }
  };

  if (comparing) {
    return (
      <div className="min-h-screen bg-page flex flex-col items-center justify-center px-4">
        <h2 className="font-display text-lg font-bold text-ink mb-6">Comparing your photos...</h2>
        <div className="grid grid-cols-4 gap-3 mb-6 w-full max-w-xs">
          {ANGLES.map((a, i) => (
            <div key={i} className={`aspect-square rounded-lg flex items-center justify-center border ${
              angleStatuses[i] === 'done' ? 'bg-status-green border-status-green' :
              angleStatuses[i] === 'analyzing' ? 'bg-gold-subtle border-gold' :
              'bg-white border-border'
            }`}>
              {angleStatuses[i] === 'done' ? <Check size={16} className="text-status-green" /> :
               angleStatuses[i] === 'analyzing' ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold" /> :
               <span className="text-xs text-muted-custom">{i + 1}</span>}
            </div>
          ))}
        </div>
        <p className="text-sm font-body text-body">Analyzed {progress} of 8 angles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-1">
          {ANGLES.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${
              i < currentAngle ? 'bg-status-green' : i === currentAngle ? 'bg-gold' : 'bg-border'
            }`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-6 flex-shrink-0">
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-14 border-2 border-border rounded-lg bg-white flex items-center justify-center">
              <span className="text-2xl">🚗</span>
            </div>
          </div>
          {ANGLES.map((a, i) => (
            <div key={i} className={`absolute w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              i < currentAngle ? 'bg-status-green text-white' :
              i === currentAngle ? 'bg-gold text-white animate-pulse-gold' :
              'border-2 border-border bg-white'
            }`} style={{ top: a.pos.top, left: a.pos.left, transform: 'translate(-50%, -50%)' }}>
              {i < currentAngle && <Check size={12} />}
            </div>
          ))}
        </div>
        <p className="font-display text-xl font-bold text-ink text-center mt-4">
          Pickup Photo {currentAngle + 1} of 8: {ANGLES[currentAngle].name}
        </p>
        <p className="text-muted-custom text-sm font-body text-center mt-1">{ANGLES[currentAngle].tip}</p>
      </div>

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
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} disabled={uploading} />
        </label>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {photos.map((photo, i) => (
            <div key={i} className={`w-12 h-12 rounded-lg flex-shrink-0 ${photo ? '' : 'border border-border bg-white'} overflow-hidden`}>
              {photo && <img src={photo} alt={`Angle ${i + 1}`} className="w-full h-full object-cover" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExitScan;
