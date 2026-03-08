import { useState, useRef, useEffect } from 'react';
import { Check, Camera } from 'lucide-react';
import CarSvg from './CarSvg';
import { ANGLES, resizeImage } from './constants';
import { supabase } from '@/integrations/supabase/client';

interface GuidedCaptureProps {
  scanId: string;
  userId: string;
  colorHex: string;
  onComplete: (photos: (string | null)[]) => void;
}

// Clock positions for 8 dots around a circle (240px diameter ring)
const DOT_POSITIONS = [
  { angle: -135, label: '10:30' }, // Front-Left
  { angle: -180, label: '12:00' }, // Front
  { angle: -225, label: '1:30' },  // Front-Right
  { angle: -270, label: '3:00' },  // Right
  { angle: -315, label: '4:30' },  // Rear-Right
  { angle: -360, label: '6:00' },  // Rear
  { angle: -405, label: '7:30' },  // Rear-Left
  { angle: -450, label: '9:00' },  // Left
];

const GuidedCapture = ({ scanId, userId, colorHex, onComplete }: GuidedCaptureProps) => {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [photos, setPhotos] = useState<(string | null)[]>(new Array(8).fill(null));
  const [uploading, setUploading] = useState(false);
  const [flash, setFlash] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const ringRadius = 110;
  const ringCenter = 120;

  const getDotPosition = (index: number) => {
    // Distribute 8 dots evenly around the ring, starting from top (-90deg)
    const angleDeg = -90 + index * 45;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: ringCenter + ringRadius * Math.cos(angleRad),
      y: ringCenter + ringRadius * Math.sin(angleRad),
    };
  };

  const progressArc = () => {
    const completed = currentAngle;
    const total = 8;
    const fraction = completed / total;
    const circumference = 2 * Math.PI * ringRadius;
    return {
      dasharray: `${circumference}`,
      dashoffset: `${circumference * (1 - fraction)}`,
    };
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

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    const path = `${userId}/${scanId}/angle-${currentAngle + 1}.jpg`;
    await supabase.storage.from('scan-photos').upload(path, resized, { contentType: 'image/jpeg' });
    await supabase.from('scan_photos').insert({
      scan_id: scanId,
      angle: currentAngle + 1,
      angle_name: ANGLES[currentAngle].name,
      storage_path: path,
      client_timestamp: new Date().toISOString(),
    });

    setUploading(false);

    if (currentAngle < 7) {
      setTimeout(() => setCurrentAngle(currentAngle + 1), 500);
    } else {
      // Compute SHA-256 hash of all uploaded photos
      try {
        const allBytes: Uint8Array[] = [];
        for (let i = 0; i < 8; i++) {
          const photoPath = `${userId}/${scanId}/angle-${i + 1}.jpg`;
          const { data: blob } = await supabase.storage.from('scan-photos').download(photoPath);
          if (blob) {
            allBytes.push(new Uint8Array(await blob.arrayBuffer()));
          }
        }
        const totalLength = allBytes.reduce((sum, arr) => sum + arr.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const arr of allBytes) {
          combined.set(arr, offset);
          offset += arr.length;
        }
        const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        await supabase.from('scans').update({ hash_sha256: hashHex } as any).eq('id', scanId);
      } catch {
        // Hash computation failed — proceed without
      }

      await supabase.rpc('increment_scan_count', { user_id_param: userId });
      onComplete(newPhotos);
    }

    if (fileRef.current) fileRef.current.value = '';
  };

  const arc = progressArc();

  return (
    <div className="min-h-screen bg-dark flex flex-col relative">
      {/* Flash overlay */}
      {flash && (
        <div className="fixed inset-0 z-[100] bg-white pointer-events-none animate-[fadeOut_0.3s_ease-out_forwards]" />
      )}

      {/* Progress segments */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-1">
          {ANGLES.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
              i < currentAngle ? 'bg-[#15803D]' : i === currentAngle ? 'bg-[#C9A237]' : 'bg-white/10'
            }`} />
          ))}
        </div>
      </div>

      {/* Car ring area */}
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <div className="relative" style={{ width: 240, height: 240 }}>
          {/* SVG ring + progress arc */}
          <svg className="absolute inset-0" width="240" height="240" viewBox="0 0 240 240">
            {/* Background ring */}
            <circle cx={ringCenter} cy={ringCenter} r={ringRadius} stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />
            {/* Progress arc */}
            <circle
              cx={ringCenter} cy={ringCenter} r={ringRadius}
              stroke="#15803D" strokeWidth="3" fill="none"
              strokeLinecap="round"
              strokeDasharray={arc.dasharray}
              strokeDashoffset={arc.dashoffset}
              transform={`rotate(-90 ${ringCenter} ${ringCenter})`}
              className="transition-all duration-700"
            />
          </svg>

          {/* Rotating car */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="transition-transform"
              style={{
                transform: `rotate(${ANGLES[currentAngle].rotation}deg)`,
                transitionDuration: '800ms',
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <CarSvg color={colorHex} size={80} />
            </div>
          </div>

          {/* Position dots */}
          {ANGLES.map((a, i) => {
            const pos = getDotPosition(i);
            const isCompleted = i < currentAngle;
            const isCurrent = i === currentAngle;
            const dotSize = isCurrent ? 32 : 20;
            return (
              <div
                key={i}
                className={`absolute flex items-center justify-center rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-[#15803D]' :
                  isCurrent ? 'bg-[#C9A237] animate-pulse-gold' :
                  'bg-white/10 border border-white/20'
                }`}
                style={{
                  width: dotSize,
                  height: dotSize,
                  left: pos.x - dotSize / 2,
                  top: pos.y - dotSize / 2,
                }}
              >
                {isCompleted && <Check size={12} className="text-white" />}
                {isCurrent && <Camera size={16} className="text-[#09090B]" />}
                {!isCompleted && !isCurrent && (
                  <span className="text-white/40 text-[9px] font-body font-bold">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Direction badge + angle info */}
      <div className="px-4 text-center pb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-[#C9A237]/15 mb-3">
          <span className="text-[#C9A237] text-xs font-body font-semibold">
            STAND AT {ANGLES[currentAngle].clock} →
          </span>
        </div>
        <h3 className="font-display text-xl font-bold text-white">
          Photo {currentAngle + 1} of 8
        </h3>
        <p className="text-sm font-body text-white/50 mt-1">{ANGLES[currentAngle].name}</p>
        <p className="text-xs font-body text-white/30 mt-0.5">{ANGLES[currentAngle].tip}</p>
      </div>

      {/* Thumbnail strip */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, i) => (
            <div key={i} className={`w-11 h-11 rounded-lg flex-shrink-0 overflow-hidden ${
              photo ? '' : 'border border-white/10 bg-white/5'
            }`}>
              {photo ? (
                <img src={photo} alt={`Angle ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-white/20 text-[9px] font-body">{i + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Capture button */}
      <div className="flex-1 px-4 pb-8 flex flex-col justify-end">
        <label className="block cursor-pointer">
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full border-[3px] border-[#C9A237] flex items-center justify-center transition-all ${
              uploading ? 'opacity-50' : 'active:scale-90'
            }`}>
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C9A237]" />
              ) : (
                <Camera size={24} className="text-[#C9A237]" />
              )}
            </div>
            <p className="text-white/50 text-xs font-body mt-2">Tap to Capture</p>
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
      </div>
    </div>
  );
};

export default GuidedCapture;
